/**
 * Fiber map layout: authored graph + soft targets in, solved geometry out. Same pipeline as
 * Tiger's Path (`tigers-path/map/layout.ts`), adapted to rectangular pads and one fixed stick
 * slot per link:
 *
 *   seed(targets ± jitter) -> relax(forces) -> curve choice -> verify -> retry, then weaker anchor
 *
 * Every anchor strength gets several attempts; of those that pass, the one closest to its targets
 * wins. Pinned nodes sit on their targets and never move.
 *
 * Pads and stick slots are fixed sizes; only positions and link routes move. A link leaves a node
 * from a port on its north, east, south or west side, square to that side, and curves smoothly
 * (a cubic) to a port on the other node. Links sharing a side are spread along it in the order of
 * where they head, so they don't cross at the pad.
 * Never throws: the best attempt comes back with its violations, so the page can show them.
 * All units mm.
 */

export type Vec = { x: number; y: number }

/**
 * Where links may attach, relative to the node box: usable lengths of the north, south and east/west
 * edges (ports spread evenly along them, centred), and the east/west ports' offset from the box centre.
 */
export type Ports = {
  n: number
  s: number
  ew: number
  ewY: number
  /** How far above the box's bottom the pad itself ends: south links are drawn up to it, under the label. */
  sLift?: number
  /** Half-width of the pad, when a wider label makes the box wider: east/west ports sit on the pad. */
  ewHalf?: number
}

/** `group`: nodes sharing one are pulled together, so a region stays in one piece. */
export type LayoutNode = {
  id: string
  width: number
  height: number
  target: Vec
  group?: string
  ports?: Ports
  /** Fixed at `target`: never moved by the solver or a reroll. */
  pinned?: boolean
}
/**
 * `sides`: force the side a link leaves each end from, overriding the solver's choice. `bearing`: unit
 * direction the link leaves end `b` along, overriding that side's square exit (e.g. along a highway).
 */
export type LayoutEdge = {
  a: string
  b: string
  sides?: { a?: Side; b?: Side }
  bearing?: Vec
  /** Least visible run, when this link carries something other than a stick (default `LAYOUT.minSpan`). */
  minSpan?: number
}
/**
 * Fold lines (sheet x for vertical folds, y for horizontal) and how far pads and stick slots must stay
 * from each, so a crease never runs through a slot. `margin` overrides the sheet-edge keep-out.
 */
export type Folds = { x: number[]; y: number[]; clear: number }
export type LayoutSpec = {
  width: number
  height: number
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  margin?: number
  folds?: Folds
  /** Overrides the visible run the springs aim for; longer spreads the map out. */
  idealSpan?: number
}

export type SolvedEdge = {
  a: string
  b: string
  d: string
  /** Stick slot centre and angle (degrees), midway along the visible run. */
  slot: { x: number; y: number; angle: number }
  /** Visible curve length between the pads. */
  span: number
  /** The curve, sampled (for clearance checks downstream). */
  points: Vec[]
}
/** `drift`: how far each node ended up from its target (mm). */
export type SolvedMap = {
  nodes: Record<string, Vec>
  edges: SolvedEdge[]
  violations: string[]
  drift: Record<string, number>
}

export const LAYOUT = {
  /** Least visible run for a link: 20mm stick + 1mm border + 5mm air, each end (more air = less congestion). */
  minSpan: 32,
  /** Visible run the springs aim for. */
  idealSpan: 38,
  /** Least pad-to-pad gap. */
  nodeGap: 12,
  /** Least gap between a link and a pad it doesn't touch. */
  padClear: 5,
  /** Least gap between two links that share no pad. */
  linkClear: 5,
  /** Sheet edge keep-out. */
  margin: 4
}

// ----- geometry ---------------------------------------------------------------

const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y })
const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y })
const scale = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k })
const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y)
const norm = (a: Vec): Vec => {
  const l = Math.hypot(a.x, a.y) || 1
  return { x: a.x / l, y: a.y / l }
}
const round = (n: number) => Math.round(n * 100) / 100

function pointSeg(p: Vec, a: Vec, b: Vec): Vec {
  const ab = sub(b, a)
  const l2 = ab.x * ab.x + ab.y * ab.y || 1
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / l2))
  return add(a, scale(ab, t))
}

function segsCross(p1: Vec, p2: Vec, p3: Vec, p4: Vec): boolean {
  const o = (a: Vec, b: Vec, c: Vec) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  return (o(p3, p4, p1) > 0) !== (o(p3, p4, p2) > 0) && (o(p1, p2, p3) > 0) !== (o(p1, p2, p4) > 0)
}

const segDist = (a: Vec, b: Vec, c: Vec, d: Vec) =>
  segsCross(a, b, c, d)
    ? 0
    : Math.min(
      dist(a, pointSeg(a, c, d)),
      dist(b, pointSeg(b, c, d)),
      dist(c, pointSeg(c, a, b)),
      dist(d, pointSeg(d, a, b))
    )

type Box = { pos: Vec; hw: number; hh: number }

/** Signed distance from a point to a pad: negative inside. */
function boxDist(p: Vec, n: Box): number {
  const dx = Math.abs(p.x - n.pos.x) - n.hw
  const dy = Math.abs(p.y - n.pos.y) - n.hh
  return dx > 0 || dy > 0 ? Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) : Math.max(dx, dy)
}

/** Gap between two pads (axis-aligned); negative when they overlap. */
const boxGap = (a: Box, b: Box) =>
  Math.max(Math.abs(a.pos.x - b.pos.x) - a.hw - b.hw, Math.abs(a.pos.y - b.pos.y) - a.hh - b.hh)

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ----- curves -----------------------------------------------------------------

/** `s0`/`s1`: the node side each end leaves from (absent on a bare curve). */
type Cubic = { p0: Vec; c0: Vec; c1: Vec; p1: Vec; s0?: Side; s1?: Side }
const SAMPLES = 120
/** Coarser sampling while choosing routes; the final check uses SAMPLES. */
const SCORE_SAMPLES = 60

const cAt = (q: Cubic, t: number): Vec => {
  const u = 1 - t
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t
  return {
    x: a * q.p0.x + b * q.c0.x + c * q.c1.x + d * q.p1.x,
    y: a * q.p0.y + b * q.c0.y + c * q.c1.y + d * q.p1.y
  }
}

export type Side = "n" | "e" | "s" | "w"
const SIDES: Side[] = ["n", "e", "s", "w"]
const NORMAL: Record<Side, Vec> = { n: { x: 0, y: -1 }, e: { x: 1, y: 0 }, s: { x: 0, y: 1 }, w: { x: -1, y: 0 } }

type Bounds = { x0: number; y0: number; x1: number; y1: number }

function boundsOf(poly: Vec[]): Bounds {
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
  for (const p of poly) {
    b.x0 = Math.min(b.x0, p.x)
    b.y0 = Math.min(b.y0, p.y)
    b.x1 = Math.max(b.x1, p.x)
    b.y1 = Math.max(b.y1, p.y)
  }
  return b
}

/** Least distance between two bounding boxes; a floor on the distance between what they bound. */
const boundsGap = (a: Bounds, b: Bounds) =>
  Math.hypot(Math.max(0, a.x0 - b.x1, b.x0 - a.x1), Math.max(0, a.y0 - b.y1, b.y0 - a.y1))

const polyline = (q: Cubic, n = SAMPLES) => Array.from({ length: n + 1 }, (_, i) => cAt(q, i / n))

/** The run of a curve outside both of its pads: sample range, arc length, and its midpoint. */
function visible(poly: Vec[], a: Box, b: Box) {
  const last = poly.length - 1
  let i0 = 0
  while (i0 < last && boxDist(poly[i0]!, a) < 0) i0++
  let i1 = last
  while (i1 > 0 && boxDist(poly[i1]!, b) < 0) i1--
  const lengths = [0]
  for (let i = i0 + 1; i <= i1; i++) lengths.push(lengths[lengths.length - 1]! + dist(poly[i - 1]!, poly[i]!))
  const span = i1 > i0 ? lengths[lengths.length - 1]! : 0
  let k = 0
  while (k + 1 < lengths.length && lengths[k + 1]! < span / 2) k++
  const mid = poly[Math.min(i0 + k, last)]!
  const next = poly[Math.min(i0 + k + 1, last)]!
  const prev = poly[Math.max(i0 + k - 1, 0)]!
  return { i0, i1, span, mid, tangent: norm(sub(next, prev)) }
}

/** How far a stick slot at `at`, heading `tangent`, runs along a fold's keep-out; ≤ 0 is clear. */
function stickOnFold(at: Vec, tangent: Vec, folds: Folds | undefined) {
  if (!folds) return 0
  // A stick lying across a crease sits fine; one running along it rocks. Only the latter counts.
  const hx = Math.abs(tangent.x) * STICK_HALF.length + Math.abs(tangent.y) * STICK_HALF.width
  const hy = Math.abs(tangent.y) * STICK_HALF.length + Math.abs(tangent.x) * STICK_HALF.width
  return Math.max(
    0,
    ...folds.x.map((f) => (Math.abs(tangent.x) < ALONG_FOLD ? foldIntrusion(at.x, hx, f, folds.clear) : 0)),
    ...folds.y.map((f) => (Math.abs(tangent.y) < ALONG_FOLD ? foldIntrusion(at.y, hy, f, folds.clear) : 0))
  )
}

/**
 * Where a link's stick slot goes: the middle of its visible run, or the nearest point to it that
 * keeps the slot from running along a fold, staying a little clear of both pads.
 */
function stickAt(poly: Vec[], a: Box, b: Box, folds: Folds | undefined) {
  const { i0, i1, span } = visible(poly, a, b)
  const lengths = [0]
  for (let i = i0 + 1; i <= i1; i++) lengths.push(lengths[lengths.length - 1]! + dist(poly[i - 1]!, poly[i]!))
  const at = (arc: number) => {
    let k = 0
    while (k + 1 < lengths.length && lengths[k + 1]! < arc) k++
    const next = poly[Math.min(i0 + k + 1, i1)]!
    const prev = poly[Math.max(i0 + k - 1, i0)]!
    return { mid: poly[i0 + k]!, tangent: norm(sub(next, prev)) }
  }
  const slack = Math.max(0, span / 2 - STICK_HALF.length - STICK_END_AIR)
  let fallback = { ...at(span / 2), fold: Infinity, shift: 0 }
  for (let shift = 0; shift <= slack; shift += 1) {
    for (const arc of shift === 0 ? [span / 2] : [span / 2 - shift, span / 2 + shift]) {
      const here = at(arc)
      const fold = stickOnFold(here.mid, here.tangent, folds)
      if (fold <= 0) return { ...here, span, fold: 0, shift }
      if (fold < fallback.fold) fallback = { ...here, fold, shift }
    }
  }
  return { ...fallback, span }
}

// ----- solver -----------------------------------------------------------------

type Node = Box & { target: Vec; group?: string; ports: Ports; pinned?: boolean }
type Edge = { a: number; b: number; sides?: { a?: Side; b?: Side }; bearing?: Vec; minSpan?: number }

function clamp(n: Node, W: number, H: number, margin: number) {
  n.pos.x = Math.max(n.hw + margin, Math.min(W - n.hw - margin, n.pos.x))
  n.pos.y = Math.max(n.hh + margin, Math.min(H - n.hh - margin, n.pos.y))
}

/** How far a box (half-extents along the fold's normal) intrudes into a fold's keep-out; ≤ 0 is clear. */
const foldIntrusion = (centre: number, half: number, fold: number, clear: number) =>
  half + clear - Math.abs(centre - fold)

/** Clear run of a straight link between two pads (the relax pass's cheap stand-in for a curve). */
function chordSpan(a: Box, b: Box) {
  const d = sub(b.pos, a.pos)
  const inside = (n: Box) => Math.min(n.hw / Math.abs(d.x || 1e-9), n.hh / Math.abs(d.y || 1e-9))
  return (1 - inside(a) - inside(b)) * Math.hypot(d.x, d.y)
}

/** A fold pushes harder than a pad does: a crease through a slot is never acceptable. */
const FOLD_PUSH = 3

/** Strength of the pull toward a node's group centre (per mm of offset). */
const GROUP_PULL = 0.01

function relax(
  nodes: Node[],
  edges: Edge[],
  W: number,
  H: number,
  anchorK: number,
  margin: number,
  folds: Folds | undefined,
  idealSpan: number
) {
  const ITERS = 500
  const MAX_STEP = 6
  // A link rests at its length between targets, never under idealSpan: springs only push crowded
  // neighbours apart and never drag far ones together, so the map keeps its real proportions.
  const rest = edges.map((e) =>
    Math.max(
      idealSpan,
      chordSpan({ ...nodes[e.a]!, pos: nodes[e.a]!.target }, { ...nodes[e.b]!, pos: nodes[e.b]!.target })
    )
  )
  for (let iter = 0; iter < ITERS; iter++) {
    const cool = 1 - iter / ITERS
    const F: Vec[] = nodes.map(() => ({ x: 0, y: 0 }))

    for (const [ei, e] of edges.entries()) {
      const a = nodes[e.a]!, b = nodes[e.b]!
      const crossings = folds
        ? folds.x.filter((f) => (a.pos.x - f) * (b.pos.x - f) < 0).length
          + folds.y.filter((f) => (a.pos.y - f) * (b.pos.y - f) < 0).length
        : 0
      // A link over a fold also has to span the keep-out on both sides of it.
      const f = 0.15 * (chordSpan(a, b) - rest[ei]! - crossings * 2 * (folds?.clear ?? 0))
      const dir = norm(sub(b.pos, a.pos))
      F[e.a] = add(F[e.a]!, scale(dir, f))
      F[e.b] = add(F[e.b]!, scale(dir, -f))
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const short = LAYOUT.nodeGap - boxGap(nodes[i]!, nodes[j]!)
        if (short <= 0) continue
        const push = scale(norm(sub(nodes[i]!.pos, nodes[j]!.pos)), short)
        F[i] = add(F[i]!, push)
        F[j] = sub(F[j]!, push)
      }
    }

    for (let ni = 0; ni < nodes.length; ni++) {
      for (const e of edges) {
        if (e.a === ni || e.b === ni) continue
        const p = nodes[ni]!, a = nodes[e.a]!, b = nodes[e.b]!
        const reach = LAYOUT.padClear + 4
        if (
          p.pos.x + p.hw + reach < Math.min(a.pos.x, b.pos.x) || p.pos.x - p.hw - reach > Math.max(a.pos.x, b.pos.x)
          || p.pos.y + p.hh + reach < Math.min(a.pos.y, b.pos.y) || p.pos.y - p.hh - reach > Math.max(a.pos.y, b.pos.y)
        ) continue
        const closest = pointSeg(p.pos, a.pos, b.pos)
        const short = LAYOUT.padClear + 4 - boxDist(closest, p)
        if (short <= 0) continue
        const push = scale(norm(sub(p.pos, closest)), 0.9 * short)
        F[ni] = add(F[ni]!, push)
        F[e.a] = sub(F[e.a]!, scale(push, 0.5))
        F[e.b] = sub(F[e.b]!, scale(push, 0.5))
      }
    }

    if (folds) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!
        for (const fx of folds.x) {
          const short = foldIntrusion(n.pos.x, n.hw, fx, folds.clear)
          if (short > 0) F[i] = add(F[i]!, { x: (n.pos.x < fx ? -1 : 1) * FOLD_PUSH * short, y: 0 })
        }
        for (const fy of folds.y) {
          const short = foldIntrusion(n.pos.y, n.hh, fy, folds.clear)
          if (short > 0) F[i] = add(F[i]!, { x: 0, y: (n.pos.y < fy ? -1 : 1) * FOLD_PUSH * short })
        }
      }
    }

    // Weak pull toward the group's centre, so a region doesn't drift into two pieces.
    const centres = new Map<string, Vec>()
    for (const group of new Set(nodes.map((n) => n.group))) {
      if (group === undefined) continue
      const members = nodes.filter((n) => n.group === group)
      const sum = members.reduce((s, n) => add(s, n.pos), { x: 0, y: 0 })
      centres.set(group, scale(sum, 1 / members.length))
    }

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i]!.pinned) continue
      const centre = nodes[i]!.group === undefined ? undefined : centres.get(nodes[i]!.group!)
      if (centre) F[i] = add(F[i]!, scale(sub(centre, nodes[i]!.pos), GROUP_PULL))
      F[i] = add(F[i]!, scale(sub(nodes[i]!.target, nodes[i]!.pos), anchorK))
      let step = scale(F[i]!, cool)
      const m = Math.hypot(step.x, step.y)
      if (m > MAX_STEP) step = scale(step, MAX_STEP / m)
      nodes[i]!.pos = add(nodes[i]!.pos, step)
      clamp(nodes[i]!, W, H, margin)
    }
  }
}

/** Handle length as a share of the port-to-port distance: how far a link runs square to its side. */
const TENSIONS = [0.25, 0.4, 0.55]
const PREFERRED_TENSION = 0.4
const CLEAR_CAP = 10
/** Score cost per mm a stick slot sits off the middle of its link (it slid to dodge a fold). */
const OFF_CENTRE = 40

/** One link end: which node, which side, and the node at the other end (for ordering along the side). */
type End = { node: number; other: number; side: Side }

/** Sides of `from`, best first, for a link heading to `to`. */
function sidesToward(from: Node, to: Node): Side[] {
  const d = norm(sub(to.pos, from.pos))
  return [...SIDES].sort((p, q) => NORMAL[q].x * d.x + NORMAL[q].y * d.y - (NORMAL[p].x * d.x + NORMAL[p].y * d.y))
}

/**
 * Port positions for every link end: each node side's links spread evenly over its usable length,
 * ordered by where their other end sits along that side, so neighbours don't cross at the pad.
 */
function portsOf(nodes: Node[], ends: End[][]): Vec[][] {
  const out: Vec[][] = ends.map(() => [])
  const bySide = new Map<string, { link: number; k: number }[]>()
  ends.forEach((pair, link) =>
    pair.forEach((end, k) => {
      const key = `${end.node}${end.side}`
      bySide.set(key, [...(bySide.get(key) ?? []), { link, k }])
    })
  )
  for (const list of bySide.values()) {
    const first = ends[list[0]!.link]![list[0]!.k]!
    const n = nodes[first.node]!
    const along = first.side === "n" || first.side === "s"
    const key = (x: { link: number; k: number }) => {
      const o = nodes[ends[x.link]![x.k]!.other]!.pos
      return along ? o.x : o.y
    }
    list.sort((p, q) => key(p) - key(q))
    const length = first.side === "n" ? n.ports.n : first.side === "s" ? n.ports.s : n.ports.ew
    list.forEach((x, j) => {
      const offset = ((j + 1) / (list.length + 1) - 0.5) * length
      const side = first.side
      out[x.link]![x.k] = side === "n"
        ? { x: n.pos.x + offset, y: n.pos.y - n.hh }
        : side === "s"
        ? { x: n.pos.x + offset, y: n.pos.y + n.hh }
        : { x: n.pos.x + (side === "e" ? 1 : -1) * (n.ports.ewHalf ?? n.hw), y: n.pos.y + n.ports.ewY + offset }
    })
  }
  return out
}

function routed(a: Vec, sa: Side, b: Vec, sb: Side, tension: number, bearing?: Vec): Cubic {
  const reach = Math.max(6, dist(a, b) * tension)
  const out = bearing ?? NORMAL[sb]
  return { p0: a, c0: add(a, scale(NORMAL[sa], reach)), c1: add(b, scale(out, reach)), p1: b, s0: sa, s1: sb }
}

type Route = { ends: End[]; tension: number }

/**
 * Per link, the pair of sides (each end's best or second-best) and tension that keeps it uncrossed,
 * long enough for its stick, and clearest of the rest. Changing a side moves its neighbours' ports, so
 * every link at either node is re-routed and re-scored with the candidate.
 */
function chooseCurves(nodes: Node[], edges: Edge[], folds: Folds | undefined): Cubic[] {
  const share = (i: number, j: number) => {
    const e = edges[i]!, f = edges[j]!
    return e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b
  }
  const options = edges.map((e) => ({
    a: e.sides?.a ? [e.sides.a] : sidesToward(nodes[e.a]!, nodes[e.b]!).slice(0, 2),
    b: e.sides?.b ? [e.sides.b] : sidesToward(nodes[e.b]!, nodes[e.a]!).slice(0, 2)
  }))
  const routes: Route[] = edges.map((e, i) => ({
    ends: [
      { node: e.a, other: e.b, side: options[i]!.a[0]! },
      { node: e.b, other: e.a, side: options[i]!.b[0]! }
    ],
    tension: PREFERRED_TENSION
  }))
  const build = (rs: Route[]) => {
    const ports = portsOf(nodes, rs.map((r) => r.ends))
    return rs.map((r, i) =>
      routed(ports[i]![0]!, r.ends[0]!.side, ports[i]![1]!, r.ends[1]!.side, r.tension, edges[i]!.bearing)
    )
  }
  let curves = build(routes)
  let polys = curves.map((c) => polyline(c, SCORE_SAMPLES))
  let bounds = polys.map(boundsOf)

  // The score caps clearance at CLEAR_CAP, so anything whose bounds are farther than that can't change it.
  const clearance = (i: number, poly: Vec[], others: Vec[][], otherBounds: Bounds[]) => {
    const e = edges[i]!
    const { i0, i1 } = visible(poly, nodes[e.a]!, nodes[e.b]!)
    const box = boundsOf(poly)
    let clear = Infinity
    for (let ni = 0; ni < nodes.length; ni++) {
      if (ni === e.a || ni === e.b) continue
      const n = nodes[ni]!
      const padBox = { x0: n.pos.x - n.hw, y0: n.pos.y - n.hh, x1: n.pos.x + n.hw, y1: n.pos.y + n.hh }
      if (boundsGap(box, padBox) - LAYOUT.padClear >= CLEAR_CAP) continue
      for (const p of poly) clear = Math.min(clear, boxDist(p, n) - LAYOUT.padClear)
    }
    for (let j = 0; j < edges.length; j++) {
      if (j === i || share(i, j)) continue
      if (boundsGap(box, otherBounds[j]!) - LAYOUT.linkClear >= CLEAR_CAP) continue
      const other = others[j]!
      for (let s = i0; s < i1; s += 2) {
        const a = poly[s]!, b = poly[Math.min(s + 2, i1)]!
        const ax0 = Math.min(a.x, b.x), ax1 = Math.max(a.x, b.x), ay0 = Math.min(a.y, b.y), ay1 = Math.max(a.y, b.y)
        for (let t = 0; t + 2 < other.length; t += 2) {
          const c = other[t]!, d = other[t + 2]!
          // The segments' box gap is a floor on their distance: skip pairs that can't lower the capped score.
          const gx = Math.max(0, Math.min(c.x, d.x) - ax1, ax0 - Math.max(c.x, d.x))
          const gy = Math.max(0, Math.min(c.y, d.y) - ay1, ay0 - Math.max(c.y, d.y))
          if (Math.hypot(gx, gy) - LAYOUT.linkClear >= Math.min(clear, CLEAR_CAP)) continue
          clear = Math.min(clear, segDist(a, b, c, d) - LAYOUT.linkClear)
        }
      }
    }
    return clear
  }

  const score = (i: number, rs: Route[], poly: Vec[], others: Vec[][], otherBounds: Bounds[]) => {
    const e = edges[i]!
    const stick = stickAt(poly, nodes[e.a]!, nodes[e.b]!, folds)
    const short = Math.max(0, (e.minSpan ?? LAYOUT.minSpan) - stick.span)
    const off = (rs[i]!.ends[0]!.side === options[i]!.a[0] ? 0 : 1) +
      (rs[i]!.ends[1]!.side === options[i]!.b[0] ? 0 : 1)
    return Math.min(clearance(i, poly, others, otherBounds), CLEAR_CAP) * 1000 - short * 2000 - stick.fold * 2000
      - stick.shift * OFF_CENTRE
      - off * 50
      - Math.abs(rs[i]!.tension - PREFERRED_TENSION)
  }

  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i]!
      const touched = edges.map((_, j) => j).filter((j) => share(i, j) || j === i)
      let best: { routes: Route[]; curves: Cubic[]; total: number } | null = null
      for (const sa of options[i]!.a) {
        for (const sb of options[i]!.b) {
          for (const tension of TENSIONS) {
            const rs = routes.map((r, j) =>
              j === i
                ? { ends: [{ node: e.a, other: e.b, side: sa }, { node: e.b, other: e.a, side: sb }], tension }
                : r
            )
            const cs = build(rs)
            const ps = polys.map((p, j) => (touched.includes(j) ? polyline(cs[j]!, SCORE_SAMPLES) : p))
            const bs = bounds.map((b, j) => (touched.includes(j) ? boundsOf(ps[j]!) : b))
            const total = touched.reduce((sum, j) => sum + score(j, rs, ps[j]!, ps, bs), 0)
            if (best === null || total > best.total) best = { routes: rs, curves: cs, total }
          }
        }
      }
      routes.splice(0, routes.length, ...best!.routes)
      curves = best!.curves
      polys = curves.map((c) => polyline(c, SCORE_SAMPLES))
      bounds = polys.map(boundsOf)
    }
  }
  return curves
}

type Attempt = { nodes: Node[]; curves: Cubic[]; violations: string[]; badness: number; drift: number }

function verify(
  spec: LayoutSpec,
  nodes: Node[],
  edges: Edge[],
  curves: Cubic[]
): Omit<Attempt, "nodes" | "curves" | "drift"> {
  const polys = curves.map((c) => polyline(c))
  const polyBounds = polys.map(boundsOf)
  const name = (i: number) => spec.nodes[i]!.id
  const link = (i: number) => `${name(edges[i]!.a)}–${name(edges[i]!.b)}`
  const violations: string[] = []
  let badness = 0

  // A link with its own `minSpan` (a backbone exit) has its run checked below; that covers the gap
  // between its two ends, which are often both pinned and can't be pushed apart.
  const ownRun = new Set(
    edges.filter((e) => e.minSpan !== undefined).map((e) => `${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`)
  )
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (ownRun.has(`${i}-${j}`)) continue
      const gap = boxGap(nodes[i]!, nodes[j]!)
      if (gap < LAYOUT.nodeGap - 0.5) {
        violations.push(`${name(i)} and ${name(j)} are ${gap.toFixed(0)}mm apart (need ${LAYOUT.nodeGap})`)
        badness += LAYOUT.nodeGap - gap
      }
    }
  }
  const folds = spec.folds
  if (folds) {
    nodes.forEach((n, i) => {
      const short = Math.max(
        ...folds.x.map((f) => foldIntrusion(n.pos.x, n.hw, f, folds.clear)),
        ...folds.y.map((f) => foldIntrusion(n.pos.y, n.hh, f, folds.clear))
      )
      if (short > 0.5) {
        violations.push(`${name(i)} sits on a fold`)
        badness += 10 * short
      }
    })
  }
  edges.forEach((e, i) => {
    const { span, fold } = stickAt(polys[i]!, nodes[e.a]!, nodes[e.b]!, folds)
    const least = e.minSpan ?? LAYOUT.minSpan
    if (span < least - 0.5) {
      violations.push(`${link(i)} runs ${span.toFixed(0)}mm (needs ${least})`)
      badness += least - span
    }
    if (fold > 0.5) {
      violations.push(`${link(i)} stick slot runs along a fold`)
      badness += 10 * fold
    }
    nodes.forEach((n, ni) => {
      if (ni === e.a || ni === e.b) return
      const clear = Math.min(...polys[i]!.map((p) => boxDist(p, n)))
      if (clear < LAYOUT.padClear - 0.5) {
        violations.push(`${link(i)} passes ${clear.toFixed(0)}mm from ${name(ni)}`)
        badness += LAYOUT.padClear - clear
      }
    })
    for (let j = i + 1; j < edges.length; j++) {
      const f = edges[j]!
      if (e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b) continue
      // Curves whose bounding boxes don't touch can't cross; most pairs end here.
      if (boundsGap(polyBounds[i]!, polyBounds[j]!) > 0) continue
      const A = polys[i]!, B = polys[j]!
      let crossed = false
      for (let s = 0; s < SAMPLES && !crossed; s += 2) {
        for (let t = 0; t < SAMPLES; t += 2) {
          if (segsCross(A[s]!, A[s + 2]!, B[t]!, B[t + 2]!)) {
            crossed = true
            break
          }
        }
      }
      if (crossed) {
        violations.push(`${link(i)} crosses ${link(j)}`)
        badness += 1e6
      }
    }
  })
  return { violations, badness }
}

/** Half-size of a stick slot including its 1mm border (22 × 7mm). */
const STICK_HALF = { length: 11, width: 3.5 }
/** A stick whose direction crosses a fold at less than this (sine of the angle) runs along it. */
const ALONG_FOLD = 0.5
/** Least air between a stick slot's end and either pad when the slot slides off a fold. */
const STICK_END_AIR = 3

const DECAY = [1.5, 1, 0.6, 0.35, 0.18, 0.08, 0]
const ANCHOR = 0.04
/** Tries per anchor strength; more tries find layouts nearer the targets. */
const ATTEMPTS = 5
/** How far a reroll may move each target (mm, each axis). */
const TARGET_JITTER = 15

/** `seed` shifts the start (and each link's preferred side), so a reroll shows a nearby variant. */
export function layoutMap(spec: LayoutSpec, seed = 0): SolvedMap {
  const index = new Map(spec.nodes.map((n, i) => [n.id, i]))
  const edges: Edge[] = spec.edges.map((e) => {
    const a = index.get(e.a), b = index.get(e.b)
    if (a === undefined || b === undefined) throw new Error(`Link ${e.a}–${e.b} names an unknown node`)
    return {
      a,
      b,
      ...(e.sides ? { sides: e.sides } : {}),
      ...(e.bearing ? { bearing: e.bearing } : {}),
      ...(e.minSpan === undefined ? {} : { minSpan: e.minSpan })
    }
  })

  const nudge = rng(seed * 104729 + 1)
  const targets = spec.nodes.map((n) =>
    seed === 0
      ? n.target
      : { x: n.target.x + (nudge() - 0.5) * 2 * TARGET_JITTER, y: n.target.y + (nudge() - 0.5) * 2 * TARGET_JITTER }
  )

  /** Mean distance from the authored targets (not the rerolled ones): what "close to real" means. */
  const driftOf = (nodes: Node[]) =>
    nodes.reduce((sum, n, i) => sum + dist(n.pos, spec.nodes[i]!.target), 0) / nodes.length

  let best: Attempt | null = null
  for (const [di, s] of DECAY.entries()) {
    let passed: Attempt | null = null
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
      const jitter = rng(seed * 7919 + di * 31 + attempt)
      const spread = seed === 0 && attempt === 0 ? 0 : 6 + 5 * attempt
      const nodes: Node[] = spec.nodes.map((n, i) => {
        const target = n.pinned ? n.target : targets[i]!
        const shake = n.pinned ? 0 : spread
        return {
          hw: n.width / 2,
          hh: n.height / 2,
          target,
          ...(n.group === undefined ? {} : { group: n.group }),
          ...(n.pinned ? { pinned: true } : {}),
          ports: n.ports ?? { n: n.width, s: n.width, ew: n.height, ewY: 0 },
          pos: { x: target.x + (jitter() - 0.5) * shake, y: target.y + (jitter() - 0.5) * shake }
        }
      })
      const margin = spec.margin ?? LAYOUT.margin
      nodes.forEach((n) => n.pinned || clamp(n, spec.width, spec.height, margin))
      relax(nodes, edges, spec.width, spec.height, ANCHOR * s, margin, spec.folds, spec.idealSpan ?? LAYOUT.idealSpan)
      const curves = chooseCurves(nodes, edges, spec.folds)
      const result = { nodes, curves, ...verify(spec, nodes, edges, curves), drift: driftOf(nodes) }
      if (best === null || result.badness < best.badness) best = result
      if (result.violations.length === 0 && (passed === null || result.drift < passed.drift)) passed = result
    }
    if (passed) return solved(spec, edges, passed)
  }
  return solved(spec, edges, best!)
}

/** SVG path for a link. A south end starts at the pad's bottom edge and runs down behind the label. */
function pathOf(q: Cubic, liftA: number, liftB: number) {
  const pt = (p: Vec) => `${round(p.x)} ${round(p.y)}`
  const startTail = q.s0 === "s" && liftA > 0
    ? `M ${pt({ x: q.p0.x, y: q.p0.y - liftA })} L ${pt(q.p0)}`
    : `M ${pt(q.p0)}`
  const endTail = q.s1 === "s" && liftB > 0 ? ` L ${pt({ x: q.p1.x, y: q.p1.y - liftB })}` : ""
  return `${startTail} C ${pt(q.c0)} ${pt(q.c1)} ${pt(q.p1)}${endTail}`
}

function solved(spec: LayoutSpec, edges: Edge[], { nodes, curves, violations }: Attempt): SolvedMap {
  const drift = Object.fromEntries(
    spec.nodes.map((n, i) => [n.id, round(dist(nodes[i]!.pos, n.target))])
  )
  const polys = curves.map((c) => polyline(c))
  return {
    nodes: Object.fromEntries(
      spec.nodes.map((n, i) => [n.id, { x: round(nodes[i]!.pos.x), y: round(nodes[i]!.pos.y) }])
    ),
    edges: edges.map((e, i) => {
      const q = curves[i]!
      const { span, mid, tangent } = stickAt(polys[i]!, nodes[e.a]!, nodes[e.b]!, spec.folds)
      return {
        a: spec.edges[i]!.a,
        b: spec.edges[i]!.b,
        d: pathOf(q, nodes[e.a]!.ports.sLift ?? 0, nodes[e.b]!.ports.sLift ?? 0),
        slot: { x: round(mid.x), y: round(mid.y), angle: round((Math.atan2(tangent.y, tangent.x) * 180) / Math.PI) },
        span: round(span),
        points: polys[i]!.filter((_, k) => k % 3 === 0)
      }
    }),
    violations,
    drift
  }
}

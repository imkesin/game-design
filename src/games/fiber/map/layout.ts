/**
 * Fiber map layout: authored graph + soft targets in, solved geometry out. Same pipeline as
 * Tiger's Path (`tigers-path/map/layout.ts`), adapted to rectangular pads and one fixed stick
 * slot per link:
 *
 *   seed(targets ± jitter) -> relax(forces) -> curve choice -> verify -> retry with weaker anchor
 *
 * Pads and stick slots are fixed sizes; only positions and curve bends move. A curve may bow
 * to gain the length its stick slot needs, so pads can sit closer than a straight link allows.
 * Never throws: the best attempt comes back with its violations, so the page can show them.
 * All units mm.
 */

export type Vec = { x: number; y: number }

/** `group`: nodes sharing one are pulled together, so a region stays in one piece. */
export type LayoutNode = { id: string; width: number; height: number; target: Vec; group?: string }
export type LayoutEdge = { a: string; b: string }
export type LayoutSpec = { width: number; height: number; nodes: LayoutNode[]; edges: LayoutEdge[] }

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
export type SolvedMap = { nodes: Record<string, Vec>; edges: SolvedEdge[]; violations: string[] }

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

type Quad = { p0: Vec; c: Vec; p1: Vec }
const SAMPLES = 120

const qAt = (q: Quad, t: number): Vec => {
  const u = 1 - t
  return {
    x: u * u * q.p0.x + 2 * u * t * q.c.x + t * t * q.p1.x,
    y: u * u * q.p0.y + 2 * u * t * q.c.y + t * t * q.p1.y
  }
}

function bent(a: Vec, b: Vec, sign: number, mag: number): Quad {
  const dir = norm(sub(b, a))
  const perp = { x: -dir.y, y: dir.x }
  return { p0: a, c: add(scale(add(a, b), 0.5), scale(perp, dist(a, b) * mag * sign)), p1: b }
}

const polyline = (q: Quad) => Array.from({ length: SAMPLES + 1 }, (_, i) => qAt(q, i / SAMPLES))

/** The run of a curve outside both of its pads: sample range, arc length, and its midpoint. */
function visible(poly: Vec[], a: Box, b: Box) {
  let i0 = 0
  while (i0 < SAMPLES && boxDist(poly[i0]!, a) < 0) i0++
  let i1 = SAMPLES
  while (i1 > 0 && boxDist(poly[i1]!, b) < 0) i1--
  const lengths = [0]
  for (let i = i0 + 1; i <= i1; i++) lengths.push(lengths[lengths.length - 1]! + dist(poly[i - 1]!, poly[i]!))
  const span = i1 > i0 ? lengths[lengths.length - 1]! : 0
  let k = 0
  while (k + 1 < lengths.length && lengths[k + 1]! < span / 2) k++
  const mid = poly[Math.min(i0 + k, SAMPLES)]!
  const next = poly[Math.min(i0 + k + 1, SAMPLES)]!
  const prev = poly[Math.max(i0 + k - 1, 0)]!
  return { i0, i1, span, mid, tangent: norm(sub(next, prev)) }
}

// ----- solver -----------------------------------------------------------------

type Node = Box & { target: Vec; group?: string }
type Edge = { a: number; b: number }

function clamp(n: Node, W: number, H: number) {
  n.pos.x = Math.max(n.hw + LAYOUT.margin, Math.min(W - n.hw - LAYOUT.margin, n.pos.x))
  n.pos.y = Math.max(n.hh + LAYOUT.margin, Math.min(H - n.hh - LAYOUT.margin, n.pos.y))
}

/** Clear run of a straight link between two pads (the relax pass's cheap stand-in for a curve). */
function chordSpan(a: Box, b: Box) {
  const d = sub(b.pos, a.pos)
  const inside = (n: Box) => Math.min(n.hw / Math.abs(d.x || 1e-9), n.hh / Math.abs(d.y || 1e-9))
  return (1 - inside(a) - inside(b)) * Math.hypot(d.x, d.y)
}

/** Strength of the pull toward a node's group centre (per mm of offset). */
const GROUP_PULL = 0.01

function relax(nodes: Node[], edges: Edge[], W: number, H: number, anchorK: number) {
  const ITERS = 500
  const MAX_STEP = 6
  for (let iter = 0; iter < ITERS; iter++) {
    const cool = 1 - iter / ITERS
    const F: Vec[] = nodes.map(() => ({ x: 0, y: 0 }))

    for (const e of edges) {
      const a = nodes[e.a]!, b = nodes[e.b]!
      const f = 0.15 * (chordSpan(a, b) - LAYOUT.idealSpan)
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
        const closest = pointSeg(p.pos, a.pos, b.pos)
        const short = LAYOUT.padClear + 4 - boxDist(closest, p)
        if (short <= 0) continue
        const push = scale(norm(sub(p.pos, closest)), 0.9 * short)
        F[ni] = add(F[ni]!, push)
        F[e.a] = sub(F[e.a]!, scale(push, 0.5))
        F[e.b] = sub(F[e.b]!, scale(push, 0.5))
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
      const centre = nodes[i]!.group === undefined ? undefined : centres.get(nodes[i]!.group!)
      if (centre) F[i] = add(F[i]!, scale(sub(centre, nodes[i]!.pos), GROUP_PULL))
      F[i] = add(F[i]!, scale(sub(nodes[i]!.target, nodes[i]!.pos), anchorK))
      let step = scale(F[i]!, cool)
      const m = Math.hypot(step.x, step.y)
      if (m > MAX_STEP) step = scale(step, MAX_STEP / m)
      nodes[i]!.pos = add(nodes[i]!.pos, step)
      clamp(nodes[i]!, W, H)
    }
  }
}

const BEND_MAGS = [0, 0.08, 0.14, 0.2, 0.28]
const PREFERRED_BEND = 0.12
const CLEAR_CAP = 10

/** Per link, the bend that keeps it uncrossed, long enough for its stick, and clearest of the rest. */
function chooseCurves(nodes: Node[], edges: Edge[], seed: number): Quad[] {
  const share = (i: number, j: number) => {
    const e = edges[i]!, f = edges[j]!
    return e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b
  }
  const prefSign = edges.map((_, i) => (rng(seed + i)() < 0.5 ? -1 : 1))
  const curves = edges.map((e, i) => bent(nodes[e.a]!.pos, nodes[e.b]!.pos, prefSign[i]!, PREFERRED_BEND))
  const polys = curves.map(polyline)

  const clearance = (i: number, poly: Vec[]) => {
    const e = edges[i]!
    const { i0, i1 } = visible(poly, nodes[e.a]!, nodes[e.b]!)
    let clear = Infinity
    for (let ni = 0; ni < nodes.length; ni++) {
      if (ni === e.a || ni === e.b) continue
      for (const p of poly) clear = Math.min(clear, boxDist(p, nodes[ni]!) - LAYOUT.padClear)
    }
    for (let j = 0; j < edges.length; j++) {
      if (j === i || share(i, j)) continue
      for (let s = i0; s < i1; s += 4) {
        for (let t = 0; t + 4 <= SAMPLES; t += 4) {
          clear = Math.min(
            clear,
            segDist(poly[s]!, poly[Math.min(s + 4, i1)]!, polys[j]![t]!, polys[j]![t + 4]!) - LAYOUT.linkClear
          )
        }
      }
    }
    return clear
  }

  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < edges.length; i++) {
      const a = nodes[edges[i]!.a]!, b = nodes[edges[i]!.b]!
      let best = curves[i]!, bestScore = -Infinity
      for (const mag of BEND_MAGS) {
        for (const sign of mag === 0 ? [1] : [-1, 1]) {
          const q = bent(a.pos, b.pos, sign, mag)
          const poly = polyline(q)
          const short = Math.max(0, LAYOUT.minSpan - visible(poly, a, b).span)
          const score = Math.min(clearance(i, poly), CLEAR_CAP) * 1000 - short * 2000
            - Math.abs(mag - PREFERRED_BEND) - (sign === prefSign[i] ? 0 : 0.02)
          if (score > bestScore) {
            bestScore = score
            best = q
          }
        }
      }
      curves[i] = best
      polys[i] = polyline(best)
    }
  }
  return curves
}

type Attempt = { nodes: Node[]; curves: Quad[]; violations: string[]; badness: number }

function verify(spec: LayoutSpec, nodes: Node[], edges: Edge[], curves: Quad[]): Omit<Attempt, "nodes" | "curves"> {
  const polys = curves.map(polyline)
  const name = (i: number) => spec.nodes[i]!.id
  const link = (i: number) => `${name(edges[i]!.a)}–${name(edges[i]!.b)}`
  const violations: string[] = []
  let badness = 0

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const gap = boxGap(nodes[i]!, nodes[j]!)
      if (gap < LAYOUT.nodeGap - 0.5) {
        violations.push(`${name(i)} and ${name(j)} are ${gap.toFixed(0)}mm apart (need ${LAYOUT.nodeGap})`)
        badness += LAYOUT.nodeGap - gap
      }
    }
  }
  edges.forEach((e, i) => {
    const { span } = visible(polys[i]!, nodes[e.a]!, nodes[e.b]!)
    if (span < LAYOUT.minSpan - 0.5) {
      violations.push(`${link(i)} runs ${span.toFixed(0)}mm (stick needs ${LAYOUT.minSpan})`)
      badness += LAYOUT.minSpan - span
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

const DECAY = [1, 0.6, 0.35, 0.18, 0.08, 0]
const ANCHOR = 0.04
/** How far a reroll may move each target (mm, each axis). */
const TARGET_JITTER = 15

/** `seed` shifts the start (and each link's preferred side), so a reroll shows a nearby variant. */
export function layoutMap(spec: LayoutSpec, seed = 0): SolvedMap {
  const index = new Map(spec.nodes.map((n, i) => [n.id, i]))
  const edges: Edge[] = spec.edges.map((e) => {
    const a = index.get(e.a), b = index.get(e.b)
    if (a === undefined || b === undefined) throw new Error(`Link ${e.a}–${e.b} names an unknown node`)
    return { a, b }
  })

  const nudge = rng(seed * 104729 + 1)
  const targets = spec.nodes.map((n) =>
    seed === 0
      ? n.target
      : { x: n.target.x + (nudge() - 0.5) * 2 * TARGET_JITTER, y: n.target.y + (nudge() - 0.5) * 2 * TARGET_JITTER }
  )

  let best: Attempt | null = null
  for (const [di, s] of DECAY.entries()) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const jitter = rng(seed * 7919 + di * 31 + attempt)
      const spread = seed === 0 && attempt === 0 ? 0 : 12 + 8 * attempt
      const nodes: Node[] = spec.nodes.map((n, i) => {
        const target = targets[i]!
        return {
          hw: n.width / 2,
          hh: n.height / 2,
          target,
          ...(n.group === undefined ? {} : { group: n.group }),
          pos: { x: target.x + (jitter() - 0.5) * spread, y: target.y + (jitter() - 0.5) * spread }
        }
      })
      nodes.forEach((n) => clamp(n, spec.width, spec.height))
      relax(nodes, edges, spec.width, spec.height, ANCHOR * s)
      const curves = chooseCurves(nodes, edges, seed * 13 + di * 101 + attempt)
      const result = { nodes, curves, ...verify(spec, nodes, edges, curves) }
      if (best === null || result.badness < best.badness) best = result
      if (result.violations.length === 0) return solved(spec, edges, best)
    }
  }
  return solved(spec, edges, best!)
}

function solved(spec: LayoutSpec, edges: Edge[], { nodes, curves, violations }: Attempt): SolvedMap {
  const polys = curves.map(polyline)
  return {
    nodes: Object.fromEntries(
      spec.nodes.map((n, i) => [n.id, { x: round(nodes[i]!.pos.x), y: round(nodes[i]!.pos.y) }])
    ),
    edges: edges.map((e, i) => {
      const q = curves[i]!
      const { span, mid, tangent } = visible(polys[i]!, nodes[e.a]!, nodes[e.b]!)
      return {
        a: spec.edges[i]!.a,
        b: spec.edges[i]!.b,
        d: `M ${round(q.p0.x)} ${round(q.p0.y)} Q ${round(q.c.x)} ${round(q.c.y)} ${round(q.p1.x)} ${round(q.p1.y)}`,
        slot: { x: round(mid.x), y: round(mid.y), angle: round((Math.atan2(tangent.y, tangent.x) * 180) / Math.PI) },
        span: round(span),
        points: polys[i]!.filter((_, k) => k % 3 === 0)
      }
    }),
    violations
  }
}

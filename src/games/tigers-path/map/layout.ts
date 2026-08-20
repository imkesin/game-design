/**
 * Tiger's Path map layout — the organic-board generator.
 *
 * Turns an abstract graph (clearings + paths + soft "target" points) into
 * finished geometry: clearing coordinates, curved path outlines, and the exact
 * position and rotation of every cube space along each path. Pure and
 * browser-safe — no `node:` imports — so `build.ts` runs it to emit `map.json`
 * and nothing downstream re-solves anything.
 *
 * The pipeline, and why it is shaped this way:
 *
 *   seed(targets) -> relax(forces) -> hard non-overlap projection
 *                 -> verify gates -> anchor-decay retry on failure
 *
 * The guarantee that no two paths cross does NOT come from the force pass —
 * force layout only *reduces* crossings, it never rules them out. It comes from
 * the verifier: with a handful of edges, an all-pairs segment-intersection test
 * on the drawn curves is effectively free, and any layout that passes it is
 * provably clean. The force pass just has to usually produce a passing
 * candidate; when it does not, the anchor (region-bias) weight is decayed and
 * the layout re-run, which converges because a weaker anchor lets the graph
 * relax toward its natural, uncrossed shape.
 *
 * A fundamentally non-planar graph can never pass, so the loop gives up and
 * throws. A dedicated planarity front-gate (a clean "this graph cannot be drawn
 * without crossings" error) is deferred; today a non-planar graph simply fails
 * the build here.
 */

// ----- units ------------------------------------------------------------------

/**
 * User units per inch. Fixed at 96 so that one user unit equals one CSS pixel:
 * a `foreignObject` in the rendered SVG then lays out its HTML in the same
 * coordinate system as the geometry, and CSS absolute units (mm) inside it
 * print true to size.
 */
export const UNITS_PER_INCH = 96

const inches = (n: number) => n * UNITS_PER_INCH

/** Cube space side. Physical squares get fingered constantly, so keep them roomy. */
export const CUBE = Math.round(inches(0.4))
/** Gap between adjacent cube spaces — the fixed pitch cubes are laid at. */
const GAP = Math.round(inches(0.12))
const SPACING = CUBE + GAP
/** Air between the first/last cube and the clearing rim, so cubes never kiss it. */
const END_MARGIN = Math.round(inches(0.1))
/** Air between a path and the rim of a clearing it does not connect to. */
const CLEAR_MARGIN = Math.round(inches(0.18))

/**
 * Minimum rim-to-rim gap between two clearings, derived per graph as the
 * diameter of the smallest clearing: any closer and the pair reads as crowded,
 * because there is not even room for another node between them.
 */
const nodeMarginFor = (nodes: readonly { r: number }[]) => 2 * Math.min(...nodes.map((n) => n.r))

// ----- geometry ---------------------------------------------------------------

export type Vec = { x: number; y: number }
const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y })
const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y })
const scale = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k })
const len = (a: Vec): number => Math.hypot(a.x, a.y)
const dist = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, a.y - b.y)
const norm = (a: Vec): Vec => {
  const l = len(a) || 1
  return { x: a.x / l, y: a.y / l }
}
const round = (n: number) => Math.round(n * 100) / 100

/** Distance from point p to segment ab, plus the clamped parameter t of the foot. */
function pointSeg(p: Vec, a: Vec, b: Vec): { d: number; t: number } {
  const ab = sub(b, a)
  const l2 = ab.x * ab.x + ab.y * ab.y || 1
  let t = ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / l2
  t = Math.max(0, Math.min(1, t))
  return { d: dist(p, add(a, scale(ab, t))), t }
}

/** Do segments p1p2 and p3p4 properly cross (shared endpoints do not count)? */
function segsCross(p1: Vec, p2: Vec, p3: Vec, p4: Vec): boolean {
  const o = (a: Vec, b: Vec, c: Vec) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  const d1 = o(p3, p4, p1), d2 = o(p3, p4, p2), d3 = o(p1, p2, p3), d4 = o(p1, p2, p4)
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0))
}

/** Shortest distance between segments ab and cd (0 if they cross). */
function segSegDist(a: Vec, b: Vec, c: Vec, d: Vec): number {
  if (segsCross(a, b, c, d)) return 0
  return Math.min(pointSeg(a, c, d).d, pointSeg(b, c, d).d, pointSeg(c, a, b).d, pointSeg(d, a, b).d)
}

/** Shortest distance between two polylines. */
function polyMinDist(A: Vec[], B: Vec[]): number {
  let m = Infinity
  for (let i = 0; i + 1 < A.length; i++) {
    for (let j = 0; j + 1 < B.length; j++) m = Math.min(m, segSegDist(A[i]!, A[i + 1]!, B[j]!, B[j + 1]!))
  }
  return m
}

/** Shortest distance from a point to a polyline. */
function pointPolyDist(p: Vec, A: Vec[]): number {
  let m = Infinity
  for (let i = 0; i + 1 < A.length; i++) m = Math.min(m, pointSeg(p, A[i]!, A[i + 1]!).d)
  return m
}

/** Do polylines A and B properly cross anywhere? */
function polysCross(A: Vec[], B: Vec[]): boolean {
  for (let i = 0; i + 1 < A.length; i++) {
    for (let j = 0; j + 1 < B.length; j++) if (segsCross(A[i]!, A[i + 1]!, B[j]!, B[j + 1]!)) return true
  }
  return false
}

/** Deterministic PRNG (mulberry32) — every build is reproducible. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ----- quadratic bezier -------------------------------------------------------

type Quad = { p0: Vec; c: Vec; p1: Vec }
const qAt = (q: Quad, t: number): Vec => {
  const u = 1 - t
  return {
    x: u * u * q.p0.x + 2 * u * t * q.c.x + t * t * q.p1.x,
    y: u * u * q.p0.y + 2 * u * t * q.c.y + t * t * q.p1.y
  }
}
const qTangent = (q: Quad, t: number): Vec => {
  const u = 1 - t
  return {
    x: 2 * u * (q.c.x - q.p0.x) + 2 * t * (q.p1.x - q.c.x),
    y: 2 * u * (q.c.y - q.p0.y) + 2 * t * (q.p1.y - q.c.y)
  }
}

/**
 * A perpendicular bulge on the chord a→b: `mag` is the bulge as a fraction of
 * chord length, `sign` (±1) which side. The control point sits at the chord's
 * midpoint pushed out by `dist * mag`; a quadratic through it peaks at ~half
 * that. `chooseCurves` searches over (sign, mag) to steer each path for space.
 */
function bentCurve(a: Vec, b: Vec, sign: number, mag: number): Quad {
  const mid = scale(add(a, b), 0.5)
  const dir = norm(sub(b, a))
  const perp = { x: -dir.y, y: dir.x }
  return { p0: a, c: add(mid, scale(perp, dist(a, b) * mag * sign)), p1: b }
}

const SAMPLES = 240

/** Arc-length table over t in [0,1] — the key to even cube spacing on a curve. */
function arcTable(q: Quad) {
  const ls: number[] = [0]
  let prev = qAt(q, 0), acc = 0
  for (let i = 1; i <= SAMPLES; i++) {
    const p = qAt(q, i / SAMPLES)
    acc += dist(prev, p)
    ls.push(acc)
    prev = p
  }
  return { ls, total: acc }
}
/** Invert the table: arc length -> t. */
function tAtLen(tab: { ls: number[]; total: number }, s: number): number {
  const { ls } = tab
  if (s <= 0) return 0
  if (s >= tab.total) return 1
  let lo = 0, hi = ls.length - 1
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1
    if (ls[mid]! < s) lo = mid
    else hi = mid
  }
  const f = (s - ls[lo]!) / (ls[hi]! - ls[lo]! || 1)
  return (lo + f) / SAMPLES
}

// ----- input / output types ---------------------------------------------------

export type SlotView = { shape: string; cost: number }

export type NodeSpec = {
  id: string
  name: string
  /** Bounding-disc radius, units. */
  r: number
  /** Soft region hint — where the author wants this clearing to gravitate. */
  target: Vec
  slots: readonly SlotView[]
}

export type EdgeSpec = {
  id: string
  a: string
  b: string
  /** Cube capacity = number of spaces on the path. */
  cap: number
}

export type MapSpec = {
  width: number
  height: number
  nodes: readonly NodeSpec[]
  edges: readonly EdgeSpec[]
}

export type GenClearing = {
  id: string
  name: string
  x: number
  y: number
  r: number
  slots: readonly SlotView[]
}
export type GenCube = { x: number; y: number; angle: number }
export type GenPath = { id: string; a: string; b: string; d: string; cubes: GenCube[] }

export type GeneratedMap = {
  width: number
  height: number
  unitsPerInch: number
  cubeSize: number
  clearings: GenClearing[]
  paths: GenPath[]
  /** Diagnostics, so a bad build is legible without re-running the solver. */
  stats: {
    crossings: number
    minNodeGap: number
    minPathClear: number
    minCubeSlack: number
    anchorScale: number
    attempt: number
  }
}

// ----- solver -----------------------------------------------------------------

type Node = { r: number; target: Vec; pos: Vec }
type Edge = { a: number; b: number; cap: number }

const idealLen = (a: Node, b: Node, cap: number) => cap * SPACING + a.r + b.r + 2 * END_MARGIN

function relax(nodes: Node[], edges: Edge[], W: number, H: number, anchorK: number, nodeMargin: number) {
  const ITERS = 600
  const K_EDGE = 0.15, K_REP = 1.0, K_CLEAR = 0.9, MAX_STEP = inches(0.28)

  const clamp = (n: Node) => {
    n.pos.x = Math.max(n.r + 4, Math.min(W - n.r - 4, n.pos.x))
    n.pos.y = Math.max(n.r + 4, Math.min(H - n.r - 4, n.pos.y))
  }

  for (let iter = 0; iter < ITERS; iter++) {
    const cool = 1 - iter / ITERS
    const F: Vec[] = nodes.map(() => ({ x: 0, y: 0 }))

    // Edge springs toward capacity-scaled ideal length.
    for (const e of edges) {
      const a = nodes[e.a]!, b = nodes[e.b]!
      const d = dist(a.pos, b.pos) || 1
      const f = K_EDGE * (d - idealLen(a, b, e.cap))
      const dir = norm(sub(b.pos, a.pos))
      F[e.a] = add(F[e.a]!, scale(dir, f))
      F[e.b] = add(F[e.b]!, scale(dir, -f))
    }

    // Node-node repulsion when closer than the required separation.
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!, b = nodes[j]!
        const need = a.r + b.r + nodeMargin
        const d = dist(a.pos, b.pos) || 1
        if (d < need) {
          const dir = norm(sub(a.pos, b.pos))
          const push = scale(dir, K_REP * (need - d))
          F[i] = add(F[i]!, push)
          F[j] = sub(F[j]!, push)
        }
      }
    }

    // Node-edge clearance: push a bystander clearing off any grazing path.
    for (let ni = 0; ni < nodes.length; ni++) {
      for (const e of edges) {
        if (e.a === ni || e.b === ni) continue
        const p = nodes[ni]!, a = nodes[e.a]!, b = nodes[e.b]!
        const { d, t } = pointSeg(p.pos, a.pos, b.pos)
        const need = p.r + CLEAR_MARGIN
        if (d < need) {
          const closest = add(a.pos, scale(sub(b.pos, a.pos), t))
          const push = scale(norm(sub(p.pos, closest)), K_CLEAR * (need - d))
          F[ni] = add(F[ni]!, push)
          F[e.a] = sub(F[e.a]!, scale(push, 0.5))
          F[e.b] = sub(F[e.b]!, scale(push, 0.5))
        }
      }
    }

    // Soft anchor toward the authored target point.
    for (let i = 0; i < nodes.length; i++) {
      F[i] = add(F[i]!, scale(sub(nodes[i]!.target, nodes[i]!.pos), anchorK))
    }

    for (let i = 0; i < nodes.length; i++) {
      let step = scale(F[i]!, cool)
      const m = len(step)
      if (m > MAX_STEP) step = scale(step, MAX_STEP / m)
      nodes[i]!.pos = add(nodes[i]!.pos, step)
      clamp(nodes[i]!)
    }
  }
}

/** Hard pass: push apart any still-overlapping clearings until all are clear. */
function projectNoOverlap(nodes: Node[], W: number, H: number, nodeMargin: number) {
  const clamp = (n: Node) => {
    n.pos.x = Math.max(n.r + 4, Math.min(W - n.r - 4, n.pos.x))
    n.pos.y = Math.max(n.r + 4, Math.min(H - n.r - 4, n.pos.y))
  }
  for (let pass = 0; pass < 60; pass++) {
    let moved = false
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!, b = nodes[j]!
        const need = a.r + b.r + nodeMargin
        const d = dist(a.pos, b.pos) || 1
        if (d < need - 0.5) {
          const shift = scale(norm(sub(a.pos, b.pos)), (need - d) / 2)
          a.pos = add(a.pos, shift)
          b.pos = sub(b.pos, shift)
          clamp(a)
          clamp(b)
          moved = true
        }
      }
    }
    if (!moved) break
  }
}

function polyline(q: Quad, n = 24): Vec[] {
  return Array.from({ length: n + 1 }, (_, i) => qAt(q, i / n))
}

/**
 * Report on a candidate layout. Alongside the aggregate mins it names the
 * specific offenders (by edge/node index) behind each, so a failing build can
 * say *which* path crosses which, or *which* clearings are too close — the
 * difference between "no layout found" and "shorten path X".
 */
type Report = {
  crossings: number
  minNodeGap: number
  minPathClear: number
  minCubeSlack: number
  crossPairs: [number, number][]
  closePair: { a: number; b: number; gap: number } | null
  shortPaths: { edge: number; slack: number }[]
  grazePair: { node: number; edge: number; clear: number } | null
}

function verify(nodes: Node[], edges: Edge[], curves: Quad[]): Report {
  const polys = curves.map((q) => polyline(q))

  const crossPairs: [number, number][] = []
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const ei = edges[i]!, ej = edges[j]!
      if (ei.a === ej.a || ei.a === ej.b || ei.b === ej.a || ei.b === ej.b) continue
      const A = polys[i]!, B = polys[j]!
      let hit = false
      for (let x = 0; x + 1 < A.length && !hit; x++) {
        for (let y = 0; y + 1 < B.length; y++) {
          if (segsCross(A[x]!, A[x + 1]!, B[y]!, B[y + 1]!)) {
            hit = true
            break
          }
        }
      }
      if (hit) crossPairs.push([i, j])
    }
  }

  let minNodeGap = Infinity
  let closePair: Report["closePair"] = null
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const gap = dist(nodes[i]!.pos, nodes[j]!.pos) - nodes[i]!.r - nodes[j]!.r
      if (gap < minNodeGap) {
        minNodeGap = gap
        closePair = { a: i, b: j, gap }
      }
    }
  }

  let minPathClear = Infinity
  let grazePair: Report["grazePair"] = null
  for (let ni = 0; ni < nodes.length; ni++) {
    for (let ei = 0; ei < edges.length; ei++) {
      const e = edges[ei]!
      if (e.a === ni || e.b === ni) continue
      const P = polys[ei]!
      let best = Infinity
      for (let s = 0; s + 1 < P.length; s++) best = Math.min(best, pointSeg(nodes[ni]!.pos, P[s]!, P[s + 1]!).d)
      const clear = best - nodes[ni]!.r
      if (clear < minPathClear) {
        minPathClear = clear
        grazePair = { node: ni, edge: ei, clear }
      }
    }
  }

  // Spare room on each path after its cubes are laid at fixed pitch — negative
  // means the edge is too short to hold its cubes without cramming.
  let minCubeSlack = Infinity
  const shortPaths: { edge: number; slack: number }[] = []
  for (let ei = 0; ei < edges.length; ei++) {
    const e = edges[ei]!
    const { span } = cubeSpan(curves[ei]!, nodes[e.a]!, nodes[e.b]!)
    const slack = span - cubeFootprint(e.cap)
    minCubeSlack = Math.min(minCubeSlack, slack)
    if (slack < 0) shortPaths.push({ edge: ei, slack })
  }

  return {
    crossings: crossPairs.length,
    minNodeGap,
    minPathClear,
    minCubeSlack,
    crossPairs,
    closePair,
    shortPaths,
    grazePair
  }
}

/**
 * The stretch of a path's arc length that carries cubes: from where the curve
 * leaves clearing A's disc (plus an end margin) to where it enters B's, so
 * cubes never ride a rim. Shared by cube placement and the cube-fit gate.
 */
function cubeSpan(q: Quad, a: Node, b: Node) {
  const tab = arcTable(q)
  let tEnter = 0
  for (let i = 0; i <= SAMPLES; i++) {
    if (dist(qAt(q, i / SAMPLES), a.pos) >= a.r) {
      tEnter = i / SAMPLES
      break
    }
  }
  let tExit = 1
  for (let i = SAMPLES; i >= 0; i--) {
    if (dist(qAt(q, i / SAMPLES), b.pos) >= b.r) {
      tExit = i / SAMPLES
      break
    }
  }
  const s0 = tab.ls[Math.round(tEnter * SAMPLES)]! + END_MARGIN
  const s1 = tab.ls[Math.round(tExit * SAMPLES)]! - END_MARGIN
  return { tab, s0, span: s1 - s0 }
}

/** Footprint a run of `cap` cubes needs: center-to-center run plus half a cube each end. */
const cubeFootprint = (cap: number) => (cap - 1) * SPACING + CUBE

/**
 * Lay `cap` cubes at a fixed pitch (CUBE + GAP) and centre the run in the
 * available span. Fixed pitch — not span/cap — is what keeps spacing even
 * across paths of different length: a longer path just gets more empty road at
 * each end, never wider gaps between its cubes.
 */
function cubesFor(q: Quad, a: Node, b: Node, cap: number): GenCube[] {
  const { tab, s0, span } = cubeSpan(q, a, b)
  const start = s0 + (span - (cap - 1) * SPACING) / 2
  return Array.from({ length: cap }, (_, k) => {
    const t = tAtLen(tab, start + k * SPACING)
    const tan = qTangent(q, t)
    const p = qAt(q, t)
    return { x: round(p.x), y: round(p.y), angle: round(Math.atan2(tan.y, tan.x)) }
  })
}

const qToPath = (q: Quad) =>
  `M ${round(q.p0.x)} ${round(q.p0.y)} Q ${round(q.c.x)} ${round(q.c.y)} ${round(q.p1.x)} ${round(q.p1.y)}`

/** Anchor weights tried in order; each falls back to a weaker region bias. */
const ANCHOR_BASE = 0.03
const DECAY = [1, 0.6, 0.35, 0.18, 0.08, 0]

/** Assemble the output geometry from a solved (or best-effort) node placement. */
function assemble(
  spec: MapSpec,
  edges: Edge[],
  nodes: Node[],
  curves: Quad[],
  report: Report,
  anchorScale: number,
  attempt: number
): GeneratedMap {
  return {
    width: spec.width,
    height: spec.height,
    unitsPerInch: UNITS_PER_INCH,
    cubeSize: CUBE,
    clearings: spec.nodes.map((n, i) => ({
      id: n.id,
      name: n.name,
      x: round(nodes[i]!.pos.x),
      y: round(nodes[i]!.pos.y),
      r: n.r,
      slots: n.slots
    })),
    paths: spec.edges.map((e, i) => ({
      id: e.id,
      a: e.a,
      b: e.b,
      d: qToPath(curves[i]!),
      cubes: cubesFor(curves[i]!, nodes[edges[i]!.a]!, nodes[edges[i]!.b]!, e.cap)
    })),
    stats: {
      crossings: report.crossings,
      minNodeGap: report.minNodeGap,
      minPathClear: report.minPathClear,
      minCubeSlack: report.minCubeSlack,
      anchorScale,
      attempt
    }
  }
}

const inch2 = (u: number) => (u / UNITS_PER_INCH).toFixed(2)

/** Turn a failing report into human sentences that name the offenders and the fix. */
function describeViolations(spec: MapSpec, report: Report, nodeMargin: number): string[] {
  const out: string[] = []
  const edgeId = (i: number) => spec.edges[i]!.id
  const nodeName = (i: number) => spec.nodes[i]!.name

  for (const [i, j] of report.crossPairs) {
    out.push(`paths "${edgeId(i)}" and "${edgeId(j)}" cross — the graph can't be drawn flat with these targets`)
  }
  if (report.closePair && report.closePair.gap < nodeMargin - 1) {
    const { a, b, gap } = report.closePair
    out.push(
      `clearings "${nodeName(a)}" and "${nodeName(b)}" are ${inch2(gap)}in apart `
        + `(need ${inch2(nodeMargin)}in) — pull their targets apart or shrink a clearing`
    )
  }
  if (report.grazePair && report.grazePair.clear < 0) {
    const { node, edge } = report.grazePair
    out.push(`path "${edgeId(edge)}" runs through clearing "${nodeName(node)}" — move one aside`)
  }
  for (const { edge, slack } of [...report.shortPaths].sort((x, y) => x.slack - y.slack)) {
    out.push(`path "${edgeId(edge)}" is ${inch2(-slack)}in too short for its cubes — spread its ends or shorten it`)
  }
  return out
}

/** Thrown when no valid layout exists; carries the best-effort map so it can still be seen. */
export type LayoutError = Error & { diagnostic: { map: GeneratedMap; violations: string[] } }

/**
 * Bend candidates each path is scored against: a straight run plus symmetric
 * bulges up to 20% of chord length. The generator picks, per path, the bend
 * that stays clearest of other paths and bystander clearings.
 */
const BEND_MAGS = [0, 0.07, 0.12, 0.16, 0.2]
/** The bend an unconstrained path settles on — organic, not ruled, not wild. */
const PREFERRED_BEND = 0.12
/** Clearance past which a path is "comfortably clear"; extra room stops scoring,
 * so aesthetics (the preferred bend) decide among roomy candidates. */
const CLEAR_CAP = inches(0.35)
/** How many times to re-optimise every path against the others' current bends. */
const BEND_SWEEPS = 2

/**
 * Choose each path's arc. Every path starts at the preferred organic bend, then
 * we sweep: each path re-picks the (sign, magnitude) that maximises its capped
 * clearance from non-adjacent clearings AND other paths, rejecting any bend that
 * introduces a crossing or starves its cubes. Ties (roomy paths) fall to the
 * preferred bend, so isolated paths look hand-drawn and crowded ones flex away.
 * Deterministic: the only randomness is a seeded per-path default side.
 */
function chooseCurves(nodes: Node[], edges: Edge[], seed: number): Quad[] {
  const share = (i: number, j: number) => {
    const e = edges[i]!, f = edges[j]!
    return e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b
  }
  const prefSign = edges.map((_, i) => (rng(seed + i)() < 0.5 ? -1 : 1))
  const curves = edges.map((e, i) => bentCurve(nodes[e.a]!.pos, nodes[e.b]!.pos, prefSign[i]!, PREFERRED_BEND))
  const polys = curves.map((q) => polyline(q))

  const clearanceOf = (i: number, poly: Vec[]) => {
    let clear = Infinity
    for (let ni = 0; ni < nodes.length; ni++) {
      if (edges[i]!.a === ni || edges[i]!.b === ni) continue
      clear = Math.min(clear, pointPolyDist(nodes[ni]!.pos, poly) - nodes[ni]!.r)
    }
    for (let j = 0; j < edges.length; j++) {
      if (j === i || share(i, j)) continue
      clear = Math.min(clear, polyMinDist(poly, polys[j]!))
    }
    return clear
  }

  for (let pass = 0; pass < BEND_SWEEPS; pass++) {
    for (let i = 0; i < edges.length; i++) {
      const a = nodes[edges[i]!.a]!, b = nodes[edges[i]!.b]!
      let bestQ = curves[i]!, bestScore = -Infinity
      for (const mag of BEND_MAGS) {
        for (const sign of mag === 0 ? [1] : [-1, 1]) {
          const q = bentCurve(a.pos, b.pos, sign, mag)
          const poly = polyline(q)
          let crosses = false
          for (let j = 0; j < edges.length && !crosses; j++) {
            if (j === i || share(i, j)) continue
            if (polysCross(poly, polys[j]!)) crosses = true
          }
          if (crosses) continue
          if (cubeSpan(q, a, b).span - cubeFootprint(edges[i]!.cap) < 0) continue
          const capped = Math.min(clearanceOf(i, poly), CLEAR_CAP)
          // Aesthetic tie-break within the cap: hug the preferred bend & side.
          const aesthetic = -Math.abs(mag - PREFERRED_BEND) - (sign === prefSign[i]! ? 0 : 0.02)
          const score = capped * 1000 + aesthetic
          if (score > bestScore) {
            bestScore = score
            bestQ = q
          }
        }
      }
      curves[i] = bestQ
      polys[i] = polyline(bestQ)
    }
  }
  return curves
}

export function generateMap(spec: MapSpec): GeneratedMap {
  const index = new Map(spec.nodes.map((n, i) => [n.id, i]))
  for (const e of spec.edges) {
    if (!index.has(e.a) || !index.has(e.b)) throw new Error(`Edge ${e.id} references unknown clearing`)
  }
  const edges: Edge[] = spec.edges.map((e) => ({ a: index.get(e.a)!, b: index.get(e.b)!, cap: e.cap }))
  const nodeMargin = nodeMarginFor(spec.nodes)

  // How far a candidate is from valid — crossings dominate, then each violated
  // margin adds its overshoot. Used only to pick the best-effort map to show.
  const badness = (r: Report) =>
    r.crossings * 1e6 + Math.max(0, nodeMargin - r.minNodeGap) + Math.max(0, -r.minPathClear)
    + Math.max(0, -r.minCubeSlack)

  let best: { score: number; map: GeneratedMap; violations: string[] } | null = null

  for (const [di, s] of DECAY.entries()) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const jitter = rng(1000 * (di + 1) + attempt)
      const nodes: Node[] = spec.nodes.map((n) => ({
        r: n.r,
        target: n.target,
        pos: {
          x: n.target.x + (jitter() - 0.5) * inches(0.6) * attempt,
          y: n.target.y + (jitter() - 0.5) * inches(0.6) * attempt
        }
      }))

      relax(nodes, edges, spec.width, spec.height, ANCHOR_BASE * s, nodeMargin)
      projectNoOverlap(nodes, spec.width, spec.height, nodeMargin)

      const curves = chooseCurves(nodes, edges, 7 + di * 100 + attempt)
      const report = verify(nodes, edges, curves)
      const violations = describeViolations(spec, report, nodeMargin)
      const map = assemble(spec, edges, nodes, curves, report, s, attempt)

      if (violations.length === 0) return map

      const score = badness(report)
      if (best === null || score < best.score) best = { score, map, violations }
    }
  }

  const shown = best!.violations.slice(0, 6)
  const extra = best!.violations.length - shown.length
  const summary = [...shown.map((v) => `  • ${v}`), ...(extra > 0 ? [`  • …and ${extra} more`] : [])].join("\n")
  const error = new Error(
    `No valid layout found for ${spec.nodes.length} clearings on this sheet. Closest attempt:\n${summary}`
  ) as LayoutError
  error.diagnostic = { map: best!.map, violations: best!.violations }
  throw error
}

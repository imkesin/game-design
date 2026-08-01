import { Delaunay } from "d3-delaunay"
import { edgeKey, pairKey, polygonCentroid, type Pt, ringArea, ringSegments, rng } from "./mesh.ts"

/**
 * Turns a province adjacency graph into geometry.
 *
 * One Voronoi seed per province cannot do this: Voronoi adjacency *is* the
 * Delaunay triangulation, so every interior face comes out a triangle and the
 * diagram hands you edges the graph never declared. Instead the whole canvas is
 * diced into many small cells and provinces are built by claiming them, which
 * makes adjacency a property of the *assignment* — something we can edit until
 * it matches the spec exactly.
 *
 * Sea provinces claim cells just like land ones, so there is no coastline here
 * and nothing to clip against. The shore is wherever a land province ends up
 * touching a sea province: an output, not an input.
 */

/** Lloyd iterations. Two is enough to kill slivers; more just costs build time. */
const RELAX_ROUNDS = 2
/**
 * A contact must span at least this many average cell edges to count as a
 * border. Corner artifacts are one edge, occasionally two; a real border runs
 * to dozens.
 */
const MIN_BORDER_EDGES = 2.5
/** Greedy sweeps in a polish pass. */
const POLISH_ROUNDS = 40
/** Anneal-then-polish cycles before giving up on a layout. */
const ANNEAL_RESTARTS = 2
const ANNEAL_STEPS = 25_000

export type Cell = {
  index: number
  centroid: Pt
  area: number
  segments: [Pt, Pt][]
}

export type Mesh = {
  cells: Cell[]
  /** Cell index -> indices of cells sharing an edge with it. */
  neighbors: Map<number, Set<number>>
  /** Edge key -> the segment and the one or two cells owning it. */
  edges: Map<string, { segment: [Pt, Pt]; cells: number[] }>
  /**
   * Cell -> neighbour -> the length of boundary they share. Precomputed so the
   * cost of a candidate flip can be evaluated from the handful of edges
   * touching that one cell, instead of rescanning the whole mesh.
   */
  contact: Map<number, Map<number, number>>
  /**
   * Shortest contact that counts as a border. Four regions cannot meet cleanly
   * at a point on this mesh — Voronoi vertices have degree three, so one
   * diagonal pair always ends up sharing a single hairline edge. Treating a
   * hairline as a border would make grid-shaped graphs unsatisfiable; real maps
   * make the same call, which is why Utah and New Mexico are not neighbours.
   */
  minBorder: number
}

/** Cell index -> province id. */
export type Assignment = string[]

/**
 * Dices the canvas into `count` roughly equal cells.
 *
 * Lloyd relaxation is what makes them equal — without it the random seeding
 * leaves slivers, and a sliver is a cell the partition can claim without
 * meaningfully moving a border.
 */
export function buildMesh(width: number, height: number, count: number, seed: number): Mesh {
  const random = rng(seed)
  const bounds: Delaunay.Bounds = [0, 0, width, height]

  let points: [number, number][] = Array.from(
    { length: count },
    () => [random() * width, random() * height] as [number, number]
  )

  for (let round = 0; round < RELAX_ROUNDS; round++) {
    const voronoi = Delaunay.from(points).voronoi(bounds)
    points = points.map((point, index) => {
      const polygon = voronoi.cellPolygon(index)
      if (polygon === null) return point
      const [x, y] = polygonCentroid(polygon as Pt[])
      return [x, y]
    })
  }

  const voronoi = Delaunay.from(points).voronoi(bounds)
  const cells: Cell[] = []
  for (let index = 0; index < points.length; index++) {
    const polygon = voronoi.cellPolygon(index)
    if (polygon === null) continue
    // cellPolygon repeats its first point to close the ring.
    const ring = (polygon as Pt[]).slice(0, -1)
    cells.push({
      index: cells.length,
      centroid: polygonCentroid(ring),
      area: ringArea(ring),
      segments: ringSegments([...ring, ring[0]!])
    })
  }

  const edges = new Map<string, { segment: [Pt, Pt]; cells: number[] }>()
  for (const cell of cells) {
    for (const segment of cell.segments) {
      const key = edgeKey(segment[0], segment[1])
      const entry = edges.get(key)
      if (entry === undefined) edges.set(key, { segment, cells: [cell.index] })
      else if (!entry.cells.includes(cell.index)) entry.cells.push(cell.index)
    }
  }

  const neighbors = new Map<number, Set<number>>(cells.map((c) => [c.index, new Set<number>()]))
  const contact = new Map<number, Map<number, number>>(
    cells.map((c) => [c.index, new Map<number, number>()])
  )
  let totalLength = 0
  let sharedEdges = 0
  for (const { segment, cells: owners } of edges.values()) {
    if (owners.length !== 2) continue
    const [a, b] = owners as [number, number]
    const length = Math.hypot(segment[1][0] - segment[0][0], segment[1][1] - segment[0][1])
    neighbors.get(a)!.add(b)
    neighbors.get(b)!.add(a)
    contact.get(a)!.set(b, (contact.get(a)!.get(b) ?? 0) + length)
    contact.get(b)!.set(a, (contact.get(b)!.get(a) ?? 0) + length)
    totalLength += length
    sharedEdges++
  }
  const minBorder = (totalLength / Math.max(sharedEdges, 1)) * MIN_BORDER_EDGES

  // A disconnected mesh means two cells that visually touch did not produce
  // matching edge keys, which would make every adjacency result unreliable.
  const seen = new Set<number>([0])
  const queue = [0]
  while (queue.length > 0) {
    for (const next of neighbors.get(queue.pop()!) ?? []) {
      if (seen.has(next)) continue
      seen.add(next)
      queue.push(next)
    }
  }
  if (seen.size !== cells.length) {
    throw new Error(
      `Cell mesh is disconnected (${seen.size}/${cells.length} reachable) — shared edges did not match exactly`
    )
  }

  return { cells, neighbors, edges, contact, minBorder }
}

/**
 * Multi-source Dijkstra over the cell graph. Assigning by graph distance rather
 * than straight-line distance is what keeps every province in one piece: if a
 * cell's cheapest path runs through another cell, that cell is nearer too, so a
 * province's claim is always connected.
 */
export function partitionCells(
  mesh: Mesh,
  provinces: readonly { id: string; weight: number }[],
  anchors: ReadonlyMap<string, Pt>
): Assignment {
  const weightOf = new Map(provinces.map((p) => [p.id, Math.max(p.weight, 1e-6)]))
  const distance = mesh.cells.map(() => Infinity)
  const owner: Assignment = mesh.cells.map(() => "")

  const taken = new Set<number>()
  for (const { id } of provinces) {
    const anchor = anchors.get(id)!
    let best = -1
    let bestDistance = Infinity
    for (const cell of mesh.cells) {
      if (taken.has(cell.index)) continue
      const d = Math.hypot(cell.centroid[0] - anchor[0], cell.centroid[1] - anchor[1])
      if (d < bestDistance) {
        bestDistance = d
        best = cell.index
      }
    }
    if (best < 0) throw new Error(`No free cell to seed "${id}"`)
    taken.add(best)
    distance[best] = 0
    owner[best] = id
  }

  const settled = new Set<number>()
  for (;;) {
    let current = -1
    let currentDistance = Infinity
    for (const cell of mesh.cells) {
      if (settled.has(cell.index)) continue
      if (distance[cell.index]! < currentDistance) {
        currentDistance = distance[cell.index]!
        current = cell.index
      }
    }
    if (current < 0) break
    settled.add(current)

    const from = mesh.cells[current]!
    for (const next of mesh.neighbors.get(current) ?? []) {
      const to = mesh.cells[next]!
      // Dividing by weight makes a heavier province advance further for the
      // same accumulated cost, so it ends up claiming proportionally more.
      const step = Math.hypot(to.centroid[0] - from.centroid[0], to.centroid[1] - from.centroid[1])
        / weightOf.get(owner[current]!)!
      if (currentDistance + step < distance[next]!) {
        distance[next] = currentDistance + step
        owner[next] = owner[current]!
      }
    }
  }

  return owner
}

/** Province pairs whose shared boundary is long enough to count as a border. */
export function regionPairs(mesh: Mesh, assignment: Assignment): Set<string> {
  const pairs = new Set<string>()
  for (const [pair, length] of contactEdges(mesh, assignment)) {
    if (length >= mesh.minBorder) pairs.add(pair)
  }
  return pairs
}

export type Diff = { missing: string[]; spurious: string[] }

export function diffAdjacency(
  mesh: Mesh,
  assignment: Assignment,
  required: ReadonlySet<string>
): Diff {
  const actual = regionPairs(mesh, assignment)
  return {
    missing: [...required].filter((pair) => !actual.has(pair)).sort(),
    spurious: [...actual].filter((pair) => !required.has(pair)).sort()
  }
}

/** Province pair -> total length of boundary they share. */
export function contactEdges(mesh: Mesh, assignment: Assignment): Map<string, number> {
  const counts = new Map<string, number>()
  for (const { segment, cells } of mesh.edges.values()) {
    if (cells.length !== 2) continue
    const [u, v] = cells as [number, number]
    const a = assignment[u]!
    const b = assignment[v]!
    if (a === b) continue
    const key = pairKey(a, b)
    const length = Math.hypot(segment[1][0] - segment[0][0], segment[1][1] - segment[0][1])
    counts.set(key, (counts.get(key) ?? 0) + length)
  }
  return counts
}

/**
 * How far the assignment is from the declared adjacency, counted in *edges* of
 * unwanted contact rather than in wrong pairs.
 *
 * Pair-counting plateaus: a wide interface between two provinces that should not
 * touch stays exactly one wrong pair no matter how many cells you flip, so no
 * single move ever scores as an improvement and hill-climbing stalls at the
 * first step. Counting edges makes shaving one cell off that interface visible
 * progress, letting the wall get built one cell at a time.
 *
 * A missing pair outweighs every possible spurious edge, so the search always
 * prefers connecting provinces that must touch over tidying ones that must not.
 */

/**
 * Mutable view of an assignment that keeps its own cost up to date.
 *
 * Rescoring from scratch means walking every edge in the mesh, far too slow for
 * a search that evaluates hundreds of thousands of candidate flips. Moving one
 * cell can only change the contacts on edges touching that cell, so both the
 * cost of a move and its application are O(neighbours) here.
 *
 * Every term is measured in map units of boundary length, deliberately. A cost
 * built from incommensurable units — "one wrong pair" against "35 units of
 * contact" — forces enormous weights to keep the ordering, and the annealer
 * then rejects every uphill move because the exponent underflows. Keeping one
 * unit lets a single temperature govern the whole search.
 */
type Scored = {
  assignment: Assignment
  cost: () => number
  /** True when the assignment already satisfies the declared adjacency exactly. */
  valid: () => boolean
  /** Total length of boundary between unlike provinces — the compactness term. */
  perimeter: () => number
  delta: (cell: number, to: string) => number
  apply: (cell: number, to: string) => void
  members: (id: string) => Set<number>
  snapshot: () => Assignment
}

function scored(
  mesh: Mesh,
  assignment: Assignment,
  ids: readonly string[],
  required: ReadonlySet<string>
): Scored {
  const owner = [...assignment]
  const counts = contactEdges(mesh, owner)

  // A border that is wrong costs far more than a border that is merely long,
  // but not so much more that the annealer can never climb over one.
  const hard = mesh.minBorder * 30
  const soft = 6

  let missing = 0
  let spurious = 0
  let spuriousLength = 0
  let perimeter = 0
  for (const pair of required) if ((counts.get(pair) ?? 0) < mesh.minBorder) missing++
  for (const [pair, length] of counts) {
    perimeter += length
    if (required.has(pair)) continue
    spuriousLength += length
    if (length >= mesh.minBorder) spurious++
  }

  const members = new Map<string, Set<number>>(ids.map((id) => [id, new Set<number>()]))
  owner.forEach((id, cell) => members.get(id)!.add(cell))

  /** Net change to each pair's shared length if `cell` moved to `to`. */
  const changes = (cell: number, to: string): Map<string, number> => {
    const from = owner[cell]!
    const result = new Map<string, number>()
    const bump = (pair: string, by: number) => result.set(pair, (result.get(pair) ?? 0) + by)
    for (const [neighbour, shared] of mesh.contact.get(cell) ?? []) {
      const other = owner[neighbour]!
      if (other !== from) bump(pairKey(from, other), -shared)
      if (other !== to) bump(pairKey(to, other), shared)
    }
    return result
  }

  const effect = (cell: number, to: string) => {
    let dMissing = 0
    let dSpurious = 0
    let dSpuriousLength = 0
    let dPerimeter = 0
    for (const [pair, change] of changes(cell, to)) {
      if (change === 0) continue
      const before = counts.get(pair) ?? 0
      const after = before + change
      dPerimeter += change
      if (required.has(pair)) {
        // Crossing the minimum-border threshold is what makes a contact count.
        if (before < mesh.minBorder && after >= mesh.minBorder) dMissing--
        if (before >= mesh.minBorder && after < mesh.minBorder) dMissing++
      } else {
        dSpuriousLength += change
        if (before < mesh.minBorder && after >= mesh.minBorder) dSpurious++
        if (before >= mesh.minBorder && after < mesh.minBorder) dSpurious--
      }
    }
    return { dMissing, dSpurious, dSpuriousLength, dPerimeter }
  }

  return {
    assignment: owner,
    cost: () => (missing + spurious) * hard + spuriousLength * soft + perimeter,
    valid: () => missing === 0 && spurious === 0,
    perimeter: () => perimeter,
    delta: (cell, to) => {
      const d = effect(cell, to)
      return (d.dMissing + d.dSpurious) * hard + d.dSpuriousLength * soft + d.dPerimeter
    },
    apply: (cell, to) => {
      const from = owner[cell]!
      const d = effect(cell, to)
      for (const [pair, change] of changes(cell, to)) {
        const next = (counts.get(pair) ?? 0) + change
        if (next <= 1e-9) counts.delete(pair)
        else counts.set(pair, next)
      }
      missing += d.dMissing
      spurious += d.dSpurious
      spuriousLength += d.dSpuriousLength
      perimeter += d.dPerimeter
      owner[cell] = to
      members.get(from)!.delete(cell)
      members.get(to)!.add(cell)
    },
    members: (id) => members.get(id)!,
    snapshot: () => [...owner]
  }
}

/**
 * Would `from` still be in one piece without `cell`?
 *
 * The receiving province needs no check: a cell is only ever handed to a
 * province it already touches, so it cannot be broken by gaining one.
 */
function donorSurvives(mesh: Mesh, state: Scored, cell: number, from: string): boolean {
  const remaining = state.members(from)
  if (remaining.size <= 1) return false

  let start = -1
  for (const member of remaining) {
    if (member !== cell) {
      start = member
      break
    }
  }

  const seen = new Set([start])
  const queue = [start]
  while (queue.length > 0) {
    for (const next of mesh.neighbors.get(queue.pop()!) ?? []) {
      if (next === cell || seen.has(next) || !remaining.has(next)) continue
      seen.add(next)
      queue.push(next)
    }
  }
  return seen.size === remaining.size - 1
}

/** Provinces this cell could legally be handed to: those it already touches. */
function optionsFor(mesh: Mesh, state: Scored, cell: number): string[] {
  const here = state.assignment[cell]!
  const options = new Set<string>()
  for (const neighbour of mesh.neighbors.get(cell) ?? []) {
    const other = state.assignment[neighbour]!
    if (other !== here) options.add(other)
  }
  return [...options].sort()
}

/** A valid result always beats an invalid one; between two valid ones, the tidier wins. */
type Outcome = { assignment: Assignment; valid: boolean; cost: number; perimeter: number }

const better = (a: Outcome, b: Outcome | null) =>
  b === null
  || (a.valid !== b.valid ? a.valid : a.valid ? a.perimeter < b.perimeter : a.cost < b.cost)

/**
 * Simulated annealing over cell ownership.
 *
 * Greedy flipping cannot solve this alone: walling two provinces apart takes a
 * chain of cells and no single flip in that chain improves the cost, so a
 * strictly-improving walk stops at the first one. Accepting occasional
 * worsening moves crosses those ridges.
 */
function anneal(
  mesh: Mesh,
  start: Assignment,
  ids: readonly string[],
  required: ReadonlySet<string>,
  random: () => number,
  steps: number
): Outcome {
  const state = scored(mesh, start, ids, required)
  let best: Outcome = {
    assignment: state.snapshot(),
    valid: state.valid(),
    cost: state.cost(),
    perimeter: state.perimeter()
  }

  const hot = mesh.minBorder * 6
  const cold = mesh.minBorder * 0.04

  for (let step = 0; step < steps; step++) {
    const temperature = hot * Math.pow(cold / hot, step / steps)

    const cell = Math.floor(random() * mesh.cells.length)
    const options = optionsFor(mesh, state, cell)
    if (options.length === 0) continue
    const to = options[Math.floor(random() * options.length)]!

    const change = state.delta(cell, to)
    if (change > 0 && random() >= Math.exp(-change / temperature)) continue
    if (!donorSurvives(mesh, state, cell, state.assignment[cell]!)) continue

    state.apply(cell, to)
    const now: Outcome = {
      assignment: state.assignment,
      valid: state.valid(),
      cost: state.cost(),
      perimeter: state.perimeter()
    }
    if (better(now, best)) best = { ...now, assignment: state.snapshot() }
  }

  return best
}

/** Greedy polish: take every strictly improving flip until none is left. */
function polish(
  mesh: Mesh,
  start: Assignment,
  ids: readonly string[],
  required: ReadonlySet<string>
): Outcome {
  const state = scored(mesh, start, ids, required)
  for (let round = 0; round < POLISH_ROUNDS; round++) {
    let improved = false
    for (const cell of mesh.cells) {
      for (const to of optionsFor(mesh, state, cell.index)) {
        if (state.delta(cell.index, to) >= -1e-9) continue
        if (!donorSurvives(mesh, state, cell.index, state.assignment[cell.index]!)) continue
        state.apply(cell.index, to)
        improved = true
        break
      }
    }
    if (!improved) break
  }
  return {
    assignment: state.snapshot(),
    valid: state.valid(),
    cost: state.cost(),
    perimeter: state.perimeter()
  }
}

export function repairPartition(
  mesh: Mesh,
  assignment: Assignment,
  ids: readonly string[],
  required: ReadonlySet<string>,
  seed: number
): { assignment: Assignment; diff: Diff } {
  const random = rng(seed)
  let best = polish(mesh, assignment, ids, required)

  for (let restart = 0; restart < ANNEAL_RESTARTS; restart++) {
    const run = anneal(mesh, best.assignment, ids, required, random, ANNEAL_STEPS)
    const polished = polish(mesh, run.assignment, ids, required)
    if (better(polished, best)) best = polished
  }

  return { assignment: best.assignment, diff: diffAdjacency(mesh, best.assignment, required) }
}

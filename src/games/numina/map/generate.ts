import { hintedAnchors, layoutAnchors } from "./layout.ts"
import { chainToPath, pairKey, pointKey, type Pt, stitch } from "./mesh.ts"
import {
  type Assignment,
  buildMesh,
  contactEdges,
  diffAdjacency,
  type Mesh,
  partitionCells,
  repairPartition
} from "./partition.ts"

/**
 * Build-time map generator.
 *
 * Adjacency is the input and the invariant: the spec declares which provinces
 * border which, and geometry is derived to satisfy it. If it cannot be
 * satisfied, the build fails rather than emitting a board whose picture
 * contradicts its rules.
 *
 * Imported only by `build.ts` — the browser receives the generated `map.json`,
 * never turf or d3.
 */

export type Point = readonly [number, number]

export type ProvinceSpec = {
  id: string
  name: string
  /** Ids this province shares a border with. Exhaustive: anything absent must NOT touch. */
  borders: readonly string[]
  /**
   * Roughly where this province should sit, in map units. Purely advisory: it
   * seeds the partition and gives you art direction over the board, but it can
   * never make the build accept a border the graph did not declare. Provide it
   * for every province or none — a partial set is rejected, since one hinted
   * province among solved ones is almost always a mistake.
   */
  at?: Point
  /**
   * Relative size, default 1. The partition grows provinces outward at a rate
   * proportional to this, so a weight of 3 claims roughly three times the
   * ground. Without it every region comes out the same size, which makes the
   * land/sea split a function of how many provinces each happens to have.
   */
  weight?: number
}

/**
 * A presentational grouping of provinces. States carry no adjacency of their
 * own — theirs is derived from their provinces', because the province graph is
 * the single source of truth about what touches what.
 *
 * A sea is just a state with `kind: "sea"`. Nothing else about it is special:
 * its provinces are meshed, partitioned, and validated by the same code, and a
 * shoreline is an ordinary border between two provinces that happen to sit in
 * different media. A one-province sea is the common case, but nothing stops a
 * large ocean being split into several.
 */
export type StateSpec = {
  id: string
  name: string
  /** Defaults to land. Provinces inherit it; a province never spans both. */
  kind?: "land" | "sea"
  /** Must form a connected subgraph of the province adjacency, or it cannot be drawn as one region. */
  provinces: readonly ProvinceSpec[]
}

export type MapSpec = {
  /** Canvas width in authoring units. */
  width: number
  /** Canvas height in authoring units. */
  height: number
  /**
   * How many authoring units make one printed inch. At the default 100 the spec
   * is written in hundredths of an inch, so `1700 x 2300` is literally 17 x 23
   * inches and every coordinate reads as a position on the finished sheet.
   * Nothing in the pipeline is tied to it — it only fixes the physical size the
   * print page renders at, so the spec and the paper can never disagree.
   */
  unitsPerInch?: number
  states: readonly StateSpec[]
  /** Number of atomic cells the landmass is diced into. More = finer borders, slower build. */
  cells?: number
  /** Changes the layout and dicing without changing the declared adjacency. */
  seed?: number
}

export type MapProvince = {
  id: string
  name: string
  kind: "land" | "sea"
  /** Id of the owning state. */
  state: string
  /** SVG path data for the province outline. */
  d: string
  /** Where to anchor the province name. */
  label: { x: number; y: number }
  neighbors: string[]
}

export type MapState = {
  id: string
  name: string
  kind: "land" | "sea"
  provinces: string[]
  /** SVG path data for the outline of the whole state. */
  d: string
  label: { x: number; y: number }
  /** Ids of states this one touches, derived from its provinces' borders. */
  neighbors: string[]
}

/**
 * One interior border, emitted once for the pair that shares it. Stroking the
 * province outlines instead would paint every shared edge twice; two dashed
 * strokes at different phases interleave and the border reads as a solid line.
 */
export type MapBorder = {
  a: string
  b: string
  /** SVG path data, open (no `Z`). */
  d: string
  /** True when the two provinces sit in different states — drawn as a state line. */
  interstate: boolean
  /**
   * What the border runs between. `shore` has land on one side and water on the
   * other; `sea` is open water either side, which is drawn faintly because a
   * boundary at sea is a convention rather than a feature.
   */
  medium: "land" | "sea" | "shore"
}

export type GeneratedMap = {
  width: number
  height: number
  /**
   * SVG path data for the landmass: the union of every land province. Derived,
   * not authored — the coastline is wherever land provinces stop.
   */
  land: string
  states: MapState[]
  provinces: MapProvince[]
  borders: MapBorder[]
  /** Printed size in inches, derived from `unitsPerInch`. */
  inches: { width: number; height: number }
  /** The attempt that satisfied the adjacency. Recorded so a build is reproducible. */
  seed: number
}

const DEFAULT_UNITS_PER_INCH = 100
const DEFAULT_CELLS = 700
const DEFAULT_SEED = 1
/** Consecutive seeds tried before declaring a graph unrealisable. */
const ATTEMPTS = 6

/** Closed rings come back from `stitch` with their first point repeated. */
function ringPath(chain: readonly Pt[]): string {
  const closed = chain.length > 2 && pointKey(chain[0]!) === pointKey(chain[chain.length - 1]!)
  return chainToPath(closed ? chain.slice(0, -1) : chain, true)
}

type Unit = {
  id: string
  name: string
  kind: "land" | "sea"
  borders: readonly string[]
  at?: Point
  weight?: number
}

function requiredPairs(provinces: readonly Unit[]): Set<string> {
  const ids = new Set(provinces.map((p) => p.id))
  const declared = new Map(provinces.map((p) => [p.id, new Set(p.borders)]))
  const pairs = new Set<string>()

  for (const province of provinces) {
    for (const other of province.borders) {
      if (!ids.has(other)) {
        throw new Error(`Province "${province.id}" borders unknown province "${other}"`)
      }
      if (other === province.id) {
        throw new Error(`Province "${province.id}" borders itself`)
      }
      // Adjacency is symmetric by definition; a one-sided declaration is a typo,
      // and silently symmetrising it would hide the real intent.
      if (!declared.get(other)!.has(province.id)) {
        throw new Error(
          `Adjacency is not symmetric: "${province.id}" lists "${other}", but not the reverse`
        )
      }
      pairs.add(pairKey(province.id, other))
    }
  }
  return pairs
}

/**
 * A state is drawn as one region, so its provinces have to be reachable from
 * each other without leaving the state. That is a property of the declared
 * graph, not of the geometry — no layout or partition can rescue a state whose
 * provinces are not connected — so it is caught here, before any solving.
 */
function assertStatesConnected(
  states: readonly StateSpec[],
  adjacency: ReadonlyMap<string, ReadonlySet<string>>
): void {
  for (const state of states) {
    const members = new Set(state.provinces.map((p) => p.id))
    if (members.size === 0) throw new Error(`State "${state.id}" has no provinces`)

    const first = state.provinces[0]!.id
    const seen = new Set([first])
    const queue = [first]
    while (queue.length > 0) {
      for (const next of adjacency.get(queue.pop()!) ?? []) {
        if (seen.has(next) || !members.has(next)) continue
        seen.add(next)
        queue.push(next)
      }
    }

    if (seen.size !== members.size) {
      const stranded = [...members].filter((id) => !seen.has(id)).sort()
      throw new Error(
        `State "${state.id}" is not connected: ${stranded.join(", ")} cannot be reached from `
          + `"${first}" without leaving the state. Add a border, or split the state.`
      )
    }
  }
}

/**
 * Assembles group outlines and the borders between groups, straight from the
 * cell assignment.
 *
 * Grouping is a parameter so the same pass serves both tiers: label a cell by
 * its province to get province outlines, or by its province's state to get
 * state outlines. Two tiers built by one function cannot disagree with each
 * other about where a shared line runs.
 */
function assemble(
  mesh: Mesh,
  groupOf: (cell: number) => string,
  keys: readonly string[]
): { outlines: Map<string, string>; borders: { a: string; b: string; d: string }[] } {
  const outlines = new Map<string, [Pt, Pt][]>(keys.map((key) => [key, []]))
  const shared = new Map<string, { a: string; b: string; segments: [Pt, Pt][] }>()

  for (const { segment, cells } of mesh.edges.values()) {
    if (cells.length === 1) {
      // Owned by one cell: this edge is on the coast, so it bounds its group.
      outlines.get(groupOf(cells[0]!))!.push(segment)
      continue
    }
    const [u, v] = cells as [number, number]
    const a = groupOf(u)
    const b = groupOf(v)
    if (a === b) continue

    outlines.get(a)!.push(segment)
    outlines.get(b)!.push(segment)

    const key = pairKey(a, b)
    const entry = shared.get(key)
    if (entry === undefined) {
      shared.set(key, { a: a < b ? a : b, b: a < b ? b : a, segments: [segment] })
    } else entry.segments.push(segment)
  }

  return {
    outlines: new Map(
      [...outlines].map(([id, segments]) => [id, stitch(segments).map(ringPath).join(" ")])
    ),
    borders: [...shared.values()]
      .sort((x, y) => pairKey(x.a, x.b).localeCompare(pairKey(y.a, y.b)))
      .map(({ a, b, segments }) => ({
        a,
        b,
        d: stitch(segments).map((c) => chainToPath(c)).join(" ")
      }))
  }
}

/**
 * Places a label at the deepest interior point of a region.
 *
 * A centroid is no good here: a sea wraps around the continent, so its
 * area-weighted centre lands on the coast or on dry land entirely. Instead the
 * region is flooded inward from its own boundary and the cell that takes
 * longest to reach wins — an approximate pole of inaccessibility, which is the
 * point furthest from any edge. The map rim counts as boundary too, or a sea
 * would happily label itself in the corner of the canvas.
 */
function labelFor(
  mesh: Mesh,
  rim: ReadonlySet<number>,
  belongs: (cell: number) => boolean
): { x: number; y: number } {
  const members = mesh.cells.filter((cell) => belongs(cell.index)).map((cell) => cell.index)

  const depth = new Map<number, number>()
  const queue: number[] = []
  for (const cell of members) {
    const onEdge = rim.has(cell)
      || [...(mesh.neighbors.get(cell) ?? [])].some((n) => !belongs(n))
    if (onEdge) {
      depth.set(cell, 0)
      queue.push(cell)
    }
  }
  // A region touching nothing at all (the whole map) has no boundary to flood from.
  if (queue.length === 0) { for (const cell of members) depth.set(cell, 0) }

  let head = 0
  while (head < queue.length) {
    const cell = queue[head++]!
    for (const next of mesh.neighbors.get(cell) ?? []) {
      if (!belongs(next) || depth.has(next)) continue
      depth.set(next, depth.get(cell)! + 1)
      queue.push(next)
    }
  }

  let best = members[0]!
  let bestDepth = -1
  for (const cell of members) {
    const d = depth.get(cell) ?? 0
    // Ties break on area, then index, so the choice is stable across builds.
    if (d > bestDepth || (d === bestDepth && mesh.cells[cell]!.area > mesh.cells[best]!.area)) {
      bestDepth = d
      best = cell
    }
  }
  const [x, y] = mesh.cells[best]!.centroid
  return { x, y }
}

export function generateMap(spec: MapSpec): GeneratedMap {
  const provinces: Unit[] = spec.states.flatMap((state) =>
    state.provinces.map((p) => ({ ...p, kind: state.kind ?? ("land" as const) }))
  )

  const ids = provinces.map((p) => p.id)
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate province or sea id")

  const stateIds = spec.states.map((s) => s.id)
  if (new Set(stateIds).size !== stateIds.length) throw new Error("Duplicate state id")

  const kindOf = new Map(provinces.map((p) => [p.id, p.kind]))
  const isShore = (pair: string) => {
    const [a, b] = pair.split("|") as [string, string]
    return kindOf.get(a) !== kindOf.get(b)
  }

  // Shorelines are declared and validated exactly like inland borders: a sea is
  // not a special case, so which coast meets which water is authored rather than
  // discovered. Naval reach is a rule of the game, not a by-product of drawing.
  const required = requiredPairs(provinces)

  const adjacency = new Map(provinces.map((p) => [p.id, new Set(p.borders)]))
  const stateOfProvince = new Map(
    spec.states.flatMap((state) => state.provinces.map((p) => [p.id, state.id] as const))
  )
  assertStatesConnected(spec.states, adjacency)

  // Hints are all-or-nothing: mixing a couple of placed provinces into an
  // otherwise solved layout reads as an oversight far more often than intent.
  const placed = provinces.filter((p) => p.at !== undefined)
  if (placed.length > 0 && placed.length !== provinces.length) {
    const missing = provinces.filter((p) => p.at === undefined).map((p) => p.id).sort()
    throw new Error(
      `Placement hints are partial. Give every province an \`at\`, or none. Missing: ${missing.join(", ")}`
    )
  }
  const hints = placed.length === provinces.length
    ? hintedAnchors(provinces.map((p) => ({ id: p.id, at: p.at! })))
    : null

  const baseSeed = spec.seed ?? DEFAULT_SEED

  // A layout is a heuristic, so one unlucky embedding should not condemn a graph
  // that is perfectly realisable. Each attempt is fully deterministic, and the
  // winning seed is recorded in the output.
  let solved: { assignment: Assignment; seed: number } | null = null
  let closest:
    | { diff: ReturnType<typeof diffAdjacency>; assignment: Assignment; seed: number }
    | null = null

  // The mesh depends only on the canvas, so it is built once and every attempt
  // re-partitions it — retries cost a layout, not a re-dice.
  const mesh = buildMesh(spec.width, spec.height, spec.cells ?? DEFAULT_CELLS, baseSeed)
  const growth = provinces.map((p) => ({ id: p.id, weight: p.weight ?? 1 }))

  for (let attempt = 0; attempt < ATTEMPTS && solved === null; attempt++) {
    const seed = baseSeed + attempt
    const anchors = hints ?? layoutAnchors(spec.width, spec.height, ids, adjacency, stateOfProvince, seed)
    const initial = partitionCells(mesh, growth, anchors)
    const { assignment, diff } = repairPartition(mesh, initial, ids, required, seed)

    if (diff.missing.length === 0 && diff.spurious.length === 0) {
      solved = { assignment, seed }
    } else if (
      closest === null
      || diff.missing.length + diff.spurious.length
        < closest.diff.missing.length + closest.diff.spurious.length
    ) {
      closest = { diff, assignment, seed }
    }
  }

  if (solved === null) {
    const { diff, assignment, seed } = closest!
    const contacts = contactEdges(mesh, assignment)
    const show = (pairs: string[], withSize: boolean) =>
      pairs
        .map((p) => `${p.replace("|", " <-> ")}${withSize ? ` (${contacts.get(p) ?? 0} edges)` : ""}`)
        .join(", ") || "none"

    throw new Error(
      [
        `Could not realise the declared adjacency in ${ATTEMPTS} attempts.`,
        `  Closest (seed ${seed}):`,
        `    Missing (declared, not touching):  ${show(diff.missing, false)}`,
        `    Spurious (touching, not declared): ${show(diff.spurious, true)}`,
        "",
        "  Missing edges usually mean the graph is not planar, or that a province is",
        "  boxed in by neighbours it is not allowed to reach.",
        "  Spurious edges mean no third province could be walled between the two.",
        "  Raising `cells` does not help either case — the limit is the graph, not the",
        "  mesh resolution. Try a different `seed`, or add an intervening province."
      ].join("\n")
    )
  }

  const { assignment, seed } = solved

  // Belt and braces: assemble() reads the assignment independently of the repair
  // loop, so re-checking here catches the two disagreeing.
  const finalDiff = diffAdjacency(mesh, assignment, required)
  if (finalDiff.missing.length > 0 || finalDiff.spurious.length > 0) {
    throw new Error("Internal error: adjacency drifted after repair")
  }

  // A sea belongs to no state, so it groups under its own id and its outline
  // comes out of the same pass as the states'.
  // Cells on the outer edge of the canvas: an edge owned by a single cell has
  // nothing on its far side.
  const rim = new Set<number>()
  for (const { cells } of mesh.edges.values()) if (cells.length === 1) rim.add(cells[0]!)

  const groupOf = (cell: number) => stateOfProvince.get(assignment[cell]!)!
  const provinceTier = assemble(mesh, (cell) => assignment[cell]!, ids)
  const stateTier = assemble(mesh, groupOf, stateIds)
  // Third grouping, by medium: its "land" outline is the coastline.
  const mediumTier = assemble(mesh, (cell) => kindOf.get(assignment[cell]!)!, ["land", "sea"])

  // `assemble` reports every pair of groups whose cells touch at all, including
  // the hairline corner contacts that fall under the minimum-border threshold.
  // Those are not adjacencies and must not be drawn as borders. Land borders are
  // filtered against the declared graph; shorelines are kept when they clear the
  // same threshold, since they are discovered rather than declared.
  const borders = provinceTier.borders
    .filter((border) => required.has(pairKey(border.a, border.b)))
    .map((border) => ({
      ...border,
      medium: isShore(pairKey(border.a, border.b))
        ? ("shore" as const)
        : kindOf.get(border.a) === "sea"
        ? ("sea" as const)
        : ("land" as const),
      interstate: stateOfProvince.get(border.a) !== stateOfProvince.get(border.b)
    }))

  const stateNeighbors = new Map(stateIds.map((id) => [id, new Set<string>()]))
  for (const border of borders) {
    if (!border.interstate) continue
    const a = stateOfProvince.get(border.a)!
    const b = stateOfProvince.get(border.b)!
    stateNeighbors.get(a)!.add(b)
    stateNeighbors.get(b)!.add(a)
  }

  const actualNeighbors = new Map(ids.map((id) => [id, new Set<string>()]))
  for (const border of borders) {
    actualNeighbors.get(border.a)!.add(border.b)
    actualNeighbors.get(border.b)!.add(border.a)
  }

  return {
    width: spec.width,
    height: spec.height,
    land: mediumTier.outlines.get("land")!,
    states: spec.states.map((state) => ({
      id: state.id,
      name: state.name,
      kind: state.kind ?? ("land" as const),
      provinces: state.provinces.map((p) => p.id),
      d: stateTier.outlines.get(state.id)!,
      label: labelFor(mesh, rim, (cell) => groupOf(cell) === state.id),
      neighbors: [...stateNeighbors.get(state.id)!].sort()
    })),
    provinces: provinces.map((province) => ({
      id: province.id,
      name: province.name,
      kind: province.kind,
      state: stateOfProvince.get(province.id)!,
      d: provinceTier.outlines.get(province.id)!,
      label: labelFor(mesh, rim, (cell) => assignment[cell] === province.id),
      neighbors: [...actualNeighbors.get(province.id)!].sort()
    })),
    borders,
    inches: {
      width: spec.width / (spec.unitsPerInch ?? DEFAULT_UNITS_PER_INCH),
      height: spec.height / (spec.unitsPerInch ?? DEFAULT_UNITS_PER_INCH)
    },
    seed
  }
}

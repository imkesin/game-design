import { chainToPath, type Mesh, pairKey, pointKey, type Pt, round, stitch } from "./geometry.ts"
import { buildHexGrid, buildHexMesh } from "./hex.ts"
import type { HexCell, HexKind, HexMapSpec } from "./hexSpec.ts"
import { CAPITAL_RULE_SCALE, markerPath, starPath } from "./markers.ts"
import { isResource, type Resource, RESOURCE_LABEL } from "./resources.ts"

/**
 * Build-time map generator.
 *
 * Unlike the old Voronoi pipeline, there is nothing to solve here: a hex's
 * neighbors are fixed by its position, and the authored `HexMapSpec` already
 * says exactly which hex belongs to which province and state. This function is
 * a straight-line build — mesh, then lookups, then assemble the output — not a
 * search.
 *
 * Imported only by `build.ts` — the browser receives the generated `map.json`.
 */

/** Always land: water carries no provinces. */
export type MapProvince = {
  id: string
  name: string
  /**
   * True when this province is one ungrouped hex standing alone. Synthesised by
   * the build rather than authored, so it is drawn but never labelled — a name
   * on every loose hex would bury the map.
   */
  solo: boolean
  /** Id of the owning state, absent when the province joins none. */
  state?: string
  /** SVG path data for the province outline. */
  d: string
  /** Where to anchor the province name. */
  label: { x: number; y: number }
  neighbors: string[]
}

export type MapState = {
  id: string
  name: string
  provinces: string[]
  /** SVG path data for the outline of the whole state. */
  d: string
  label: { x: number; y: number }
  /** Ids of states this one touches, derived from its provinces' borders. */
  neighbors: string[]
}

/**
 * One interior border between two land provinces, emitted once for the pair
 * that shares it. Stroking the province outlines instead would paint every
 * shared edge twice; two dashed strokes at different phases interleave and the
 * border reads as a solid line.
 *
 * Coastlines are not here — that line is the landmass outline, drawn once.
 */
export type MapBorder = {
  a: string
  b: string
  /** SVG path data, open (no `Z`). */
  d: string
  /** True when the two provinces sit in different states — drawn as a state line. */
  interstate: boolean
}

/**
 * A good, and the slot on the board where its chip goes. The province owns the
 * good; the hex only says where to draw it, so nothing downstream needs the
 * authored coordinates — the marker arrives as finished geometry like every
 * other line on the sheet.
 */
export type MapResource = {
  /** Id of the province that produces it. */
  province: string
  kind: Resource
  /** What the marker prints. */
  label: string
  /** SVG path data for the marker hexagon, concentric with its hex. */
  d: string
  /** Centre of the marker — where the caption is anchored. */
  x: number
  y: number
}

/**
 * A province's seat. Carries its own rings rather than a scale for the renderer
 * to apply, so nothing downstream has to know how a hex is built.
 */
export type MapCapital = {
  /** Id of the province it is the seat of. */
  province: string
  /** SVG path data for the marker hexagon, concentric with its hex. */
  d: string
  /** The second rule just inside `d`. */
  rule: string
  /** The star at the centre, filled. */
  star: string
  x: number
  y: number
}

export type GeneratedMap = {
  width: number
  height: number
  /**
   * SVG path data for the landmass: the union of every non-sea (land or
   * mountain) hex. Derived, not authored — the coastline is wherever land
   * hexes stop.
   */
  land: string
  /** SVG path data for the union of mountain hexes, a texture-only overlay. */
  mountain: string
  states: MapState[]
  provinces: MapProvince[]
  borders: MapBorder[]
  resources: MapResource[]
  capitals: MapCapital[]
  /** Printed size in inches, derived from `unitsPerInch`. */
  inches: { width: number; height: number }
}

const DEFAULT_UNITS_PER_INCH = 100

/** Closed rings come back from `stitch` with their first point repeated. */
function ringPath(chain: readonly Pt[]): string {
  const closed = chain.length > 2 && pointKey(chain[0]!) === pointKey(chain[chain.length - 1]!)
  return chainToPath(closed ? chain.slice(0, -1) : chain, true)
}

/**
 * Assembles group outlines and the borders between groups, straight from a
 * cell -> group labeling.
 *
 * Grouping is a parameter so the same pass serves every tier this map needs:
 * label a cell by its province to get province outlines, by its province's
 * state to get state outlines, or by its kind to get the coastline/texture
 * masks. Every tier built by one function cannot disagree with another about
 * where a shared line runs.
 */
export function assemble(
  mesh: Mesh,
  groupOf: (cell: number) => string,
  keys: readonly string[]
): { outlines: Map<string, string>; borders: { a: string; b: string; d: string }[] } {
  const outlines = new Map<string, [Pt, Pt][]>(keys.map((key) => [key, []]))
  const shared = new Map<string, { a: string; b: string; segments: [Pt, Pt][] }>()

  for (const { segment, cells } of mesh.edges.values()) {
    if (cells.length === 1) {
      // Owned by one cell: this edge is on the rim, so it bounds its group.
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
 * Places a label at the middle of a region: the area-weighted mean of the hexes
 * it owns, which is what "where does this region sit" means to the eye.
 *
 * The mean alone is not safe, because a crescent or a horseshoe puts its own
 * average outside itself. So the mean is checked: on a hex grid the tile
 * containing a point is simply the tile whose centre is nearest — a hex grid is
 * the Voronoi diagram of its own centres — which makes the containment test a
 * nearest-centre search over every cell. If the mean lands on a hex the region
 * does not own, the label retreats to the owned hex nearest the mean, so it is
 * always on the region and always as close to its middle as the shape allows.
 */
function labelFor(mesh: Mesh, belongs: (cell: number) => boolean): { x: number; y: number } {
  const members = mesh.cells.filter((cell) => belongs(cell.index))
  if (members.length === 0) return { x: 0, y: 0 }

  let sumX = 0
  let sumY = 0
  let area = 0
  for (const cell of members) {
    sumX += cell.centroid[0] * cell.area
    sumY += cell.centroid[1] * cell.area
    area += cell.area
  }
  const meanX = sumX / area
  const meanY = sumY / area

  const nearestIn = (cells: readonly Mesh["cells"][number][]) => {
    let best = cells[0]!
    let bestDistance = Infinity
    for (const cell of cells) {
      const distance = Math.hypot(cell.centroid[0] - meanX, cell.centroid[1] - meanY)
      // Ties break on index, so the choice is stable across builds.
      if (distance < bestDistance) {
        bestDistance = distance
        best = cell
      }
    }
    return best
  }

  const holder = nearestIn(mesh.cells)
  if (belongs(holder.index)) return { x: round(meanX), y: round(meanY) }

  const fallback = nearestIn(members)
  return { x: fallback.centroid[0], y: fallback.centroid[1] }
}

/**
 * A state is drawn as one region, so its provinces have to be reachable from
 * each other without leaving the state. That is a property of the actual hex
 * grouping, not of the geometry pipeline — a disconnected state means two
 * separate blobs were both given the same state id — so it is caught here,
 * before rendering.
 */
function assertStatesConnected(
  stateMembers: ReadonlyMap<string, ReadonlySet<string>>,
  adjacency: ReadonlyMap<string, ReadonlySet<string>>
): void {
  for (const [stateId, members] of stateMembers) {
    if (members.size === 0) throw new Error(`State "${stateId}" has no provinces`)

    const first = [...members][0]!
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
        `State "${stateId}" is not connected: ${stranded.join(", ")} cannot be reached from `
          + `"${first}" without leaving the state.`
      )
    }
  }
}

/**
 * Sea cells all share this group, which is filtered back out: water carries no
 * provinces, so it contributes no outlines and no borders. The coastline comes
 * from the medium tier instead, where it is drawn once.
 */
const SEA_GROUP = "__sea__"
const MOUNTAIN_GROUP = "__mountain__"
/** Group keys for terrain that carries no province. Underscores keep them clear of any slug. */
const UNGROUPABLE = new Set<string>([SEA_GROUP, MOUNTAIN_GROUP])

/** Group key for a land hex that is in no named province — its own province. */
const soloGroup = (col: number, row: number) => `hex-${col}-${row}`

export function generateMap(spec: HexMapSpec): GeneratedMap {
  const unitsPerInch = spec.unitsPerInch ?? DEFAULT_UNITS_PER_INCH
  const tiles = buildHexGrid(spec.width, spec.height, unitsPerInch)
  const mesh = buildHexMesh(tiles)

  const tileIndexOf = new Map(tiles.map((t) => [`${t.col},${t.row}`, t.index]))
  if (spec.hexes.length !== tiles.length) {
    throw new Error(
      `hexSpec has ${spec.hexes.length} hexes but the ${spec.width}x${spec.height} canvas at `
        + `${unitsPerInch} units/inch tiles to ${tiles.length}. Regenerate the hex spec.`
    )
  }

  const namedIds = spec.provinces.map((p) => p.id)
  const stateIds = spec.states.map((s) => s.id)
  if (new Set(namedIds).size !== namedIds.length) throw new Error("Duplicate province id")
  if (new Set(stateIds).size !== stateIds.length) throw new Error("Duplicate state id")

  const namedIdSet = new Set(namedIds)
  const stateIdSet = new Set(stateIds)
  for (const province of spec.provinces) {
    if (province.state !== undefined && !stateIdSet.has(province.state)) {
      throw new Error(`Province "${province.id}" belongs to unknown state "${province.state}"`)
    }
  }

  // Every land hex ends up in a province: the one it was grouped into, or a
  // singleton standing in for "not grouped yet". Singletons are never authored,
  // so they are minted here and marked `solo` for the renderer to leave unlabelled.
  const groupOfCell = new Array<string>(tiles.length)
  const kindOf = new Array<HexKind>(tiles.length)
  const solo = new Set<string>()
  const soloNames = new Map<string, string>()
  const seenTiles = new Set<number>()
  const resources: MapResource[] = []
  const capitals: MapCapital[] = []

  /**
   * Both markers hang off a province, so both need one: a marker is drawn on a
   * hex, but what it means belongs to the whole region around it. The two are
   * exclusive because they are the same shape on the same centre — drawn
   * together they would simply obscure each other.
   */
  const markerProvince = (hex: HexCell, what: string): string => {
    if (hex.resource !== undefined && hex.capital === true) {
      throw new Error(
        `Hex (${hex.col},${hex.row}) is both a capital and a "${hex.resource}" source. `
          + "A hex can hold one marker."
      )
    }
    if (hex.kind !== "land" || hex.province === undefined) {
      throw new Error(
        `Hex (${hex.col},${hex.row}) carries ${what} but is `
          + `${hex.kind === "land" ? "in no named province" : hex.kind}. `
          + "Only land in a named province can hold a marker."
      )
    }
    return hex.province
  }

  for (const hex of spec.hexes) {
    const index = tileIndexOf.get(`${hex.col},${hex.row}`)
    if (index === undefined) throw new Error(`Hex (${hex.col},${hex.row}) is not on the canvas`)
    if (seenTiles.has(index)) throw new Error(`Duplicate hex (${hex.col},${hex.row})`)
    seenTiles.add(index)
    kindOf[index] = hex.kind

    if (hex.resource !== undefined) {
      if (!isResource(hex.resource)) {
        throw new Error(`Hex (${hex.col},${hex.row}) has unknown resource "${hex.resource}"`)
      }
      const tile = tiles[index]!
      resources.push({
        province: markerProvince(hex, `resource "${hex.resource}"`),
        kind: hex.resource,
        label: RESOURCE_LABEL[hex.resource],
        d: markerPath(tile),
        x: round(tile.center[0]),
        y: round(tile.center[1])
      })
    }

    if (hex.capital === true) {
      const tile = tiles[index]!
      capitals.push({
        province: markerProvince(hex, "a capital"),
        d: markerPath(tile),
        rule: markerPath(tile, CAPITAL_RULE_SCALE),
        star: starPath(tile),
        x: round(tile.center[0]),
        y: round(tile.center[1])
      })
    }

    // Sea and mountain are both impassable ground: they hold no province and
    // join no state, so they drop straight out of both tiers.
    if (hex.kind !== "land") {
      if (hex.province !== undefined) {
        throw new Error(
          `${hex.kind} hex (${hex.col},${hex.row}) is in province "${hex.province}". `
            + "Only land hexes can be grouped."
        )
      }
      groupOfCell[index] = hex.kind === "sea" ? SEA_GROUP : MOUNTAIN_GROUP
      continue
    }

    if (hex.province === undefined) {
      const id = soloGroup(hex.col, hex.row)
      solo.add(id)
      soloNames.set(id, `(${hex.col},${hex.row})`)
      groupOfCell[index] = id
      continue
    }
    if (!namedIdSet.has(hex.province)) {
      throw new Error(`Hex (${hex.col},${hex.row}) belongs to unknown province "${hex.province}"`)
    }
    groupOfCell[index] = hex.province
  }

  const provinceIds = [...namedIds, ...[...solo].sort()]
  const hexesByProvince = new Map<string, number[]>(provinceIds.map((id) => [id, []]))
  for (let index = 0; index < tiles.length; index++) {
    const group = groupOfCell[index]!
    if (UNGROUPABLE.has(group)) continue
    hexesByProvince.get(group)!.push(index)
  }
  for (const [id, members] of hexesByProvince) {
    if (members.length === 0) throw new Error(`Province "${id}" has no hexes`)
  }

  const nameOf = new Map(spec.provinces.map((p) => [p.id, p.name]))
  const stateOfProvince = new Map(
    spec.provinces.flatMap((p) => p.state === undefined ? [] : [[p.id, p.state] as const])
  )

  const provincesByState = new Map<string, Set<string>>(stateIds.map((id) => [id, new Set()]))
  for (const [province, state] of stateOfProvince) provincesByState.get(state)!.add(province)
  for (const [id, members] of provincesByState) {
    if (members.size === 0) throw new Error(`State "${id}" has no provinces`)
  }

  // A province outside any state groups under its own id, so the state tier
  // never fuses two unrelated provinces into one silent blob.
  const stateGroupOf = (cell: number) => {
    const group = groupOfCell[cell]!
    if (UNGROUPABLE.has(group)) return group
    return stateOfProvince.get(group) ?? group
  }
  const stateTierKeys = [...stateIds, ...provinceIds.filter((id) => !stateOfProvince.has(id))]

  const provinceTier = assemble(mesh, (cell) => groupOfCell[cell]!, [
    ...provinceIds,
    ...UNGROUPABLE
  ])
  const stateTier = assemble(mesh, stateGroupOf, [...stateTierKeys, ...UNGROUPABLE])
  const mediumTier = assemble(
    mesh,
    (cell) => (kindOf[cell] === "sea" ? "sea" : "land"),
    ["land", "sea"]
  )
  const mountainTier = assemble(
    mesh,
    (cell) => (kindOf[cell] === "mountain" ? "mountain" : "other"),
    ["mountain", "other"]
  )

  // Edges onto water or mountain are dropped. The coast is drawn once by the
  // landmass outline, and a mountain's limit is its own shading — neither is a
  // border between provinces, because neither side is one.
  const borders: MapBorder[] = provinceTier.borders
    .filter((border) => !UNGROUPABLE.has(border.a) && !UNGROUPABLE.has(border.b))
    .map((border) => ({
      ...border,
      interstate: stateOfProvince.get(border.a) !== stateOfProvince.get(border.b)
    }))

  // Derived province adjacency, straight from the mesh — feeds the state
  // connectivity check below.
  const provinceAdjacency = new Map<string, Set<string>>(provinceIds.map((id) => [id, new Set()]))
  for (const border of borders) {
    provinceAdjacency.get(border.a)!.add(border.b)
    provinceAdjacency.get(border.b)!.add(border.a)
  }
  assertStatesConnected(provincesByState, provinceAdjacency)

  // Only borders between two provinces that both belong to states count: a
  // stateless province neighbours nothing at the state tier.
  const stateNeighbors = new Map(stateIds.map((id) => [id, new Set<string>()]))
  for (const border of borders) {
    const a = stateOfProvince.get(border.a)
    const b = stateOfProvince.get(border.b)
    if (a === undefined || b === undefined || a === b) continue
    stateNeighbors.get(a)!.add(b)
    stateNeighbors.get(b)!.add(a)
  }

  return {
    width: spec.width,
    height: spec.height,
    land: mediumTier.outlines.get("land")!,
    mountain: mountainTier.outlines.get("mountain")!,
    states: spec.states.map((state) => ({
      id: state.id,
      name: state.name,
      provinces: [...provincesByState.get(state.id)!].sort(),
      d: stateTier.outlines.get(state.id)!,
      label: labelFor(mesh, (cell) => stateGroupOf(cell) === state.id),
      neighbors: [...stateNeighbors.get(state.id)!].sort()
    })),
    provinces: provinceIds.map((id) => {
      const state = stateOfProvince.get(id)
      return {
        id,
        name: nameOf.get(id) ?? soloNames.get(id) ?? id,
        solo: solo.has(id),
        ...(state === undefined ? {} : { state }),
        d: provinceTier.outlines.get(id)!,
        label: labelFor(mesh, (cell) => groupOfCell[cell] === id),
        neighbors: [...provinceAdjacency.get(id)!].sort()
      }
    }),
    borders,
    resources,
    capitals,
    inches: { width: spec.width / unitsPerInch, height: spec.height / unitsPerInch }
  }
}

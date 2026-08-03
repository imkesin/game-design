/**
 * The map's authored input: a hand-painted hex grid. There is no adjacency
 * graph to declare and nothing to solve — a hex's neighbours are fixed by its
 * position, so painting a grouping onto the grid *is* the map.
 *
 * Two independent axes, in rough order of authoring:
 *
 *   kind      terrain, on every hex. Sea is water; land and mountain are ground
 *             that differ only in how they are drawn.
 *   province  a named group of land hexes, so the border between them stops
 *             being drawn. Grouping is subtractive: every ungrouped land hex is
 *             already its own province, and naming a group is what erases the
 *             lines inside it. Those singletons are synthesised by the build,
 *             never authored, which keeps this file to the groups you actually
 *             made.
 *   marker    a good or a capital, stamped on one hex of a named province. Last
 *             rather than second: a marker is a property of the province, so
 *             there has to be a province before there is anywhere to put it.
 */

import type { Resource } from "./resources.ts"

export type HexKind = "sea" | "land" | "mountain"

export type HexCell = {
  col: number
  row: number
  kind: HexKind
  /**
   * Omitted when this hex is not in a named group — always for sea, which has
   * no provinces at all, and for land you have not grouped yet.
   */
  province?: string
  /**
   * The good this hex's province produces. Only meaningful alongside
   * `province`: a solo hex is a placeholder for grouping you have not finished,
   * not somewhere to hang a good, so the build rejects a resource without one.
   */
  resource?: Resource
  /**
   * Marks this hex as its province's seat. Same rule as `resource`, and
   * mutually exclusive with it — the two markers are drawn on one centre at one
   * size, so a hex carrying both would print them on top of each other.
   */
  capital?: true
}

/** A named group of land hexes. `state` is optional: not every province joins one. */
export type ProvinceSpec = { id: string; name: string; state?: string }

/** A grouping above provinces. Land-only, like the provinces it holds. */
export type StateSpec = { id: string; name: string }

export type HexMapSpec = {
  width: number
  height: number
  unitsPerInch?: number
  /** One entry per tile in `buildHexGrid(width, height, unitsPerInch)` — dense, not sparse. */
  hexes: HexCell[]
  provinces: ProvinceSpec[]
  states: StateSpec[]
}

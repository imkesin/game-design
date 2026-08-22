/**
 * Board-graph types, shared by every per-count board (`2p.ts`, `3p.ts`, …).
 *
 * A board is a planar graph of clearings (nodes) and paths (edges). Ids are
 * plain strings, unique within a board — the layout generator validates that
 * every path references known clearings. The *rules* a board draws on (animal
 * ranks, slot levels, thresholds) live in `../domain.ts` and are never forked
 * per count; only the geometry below is.
 */

export type ClearingSlotSpec = {
  /** Slot level 1-4 → circle/triangle/square/pentagon (see `SLOT_LEVELS`). */
  level: 1 | 2 | 3 | 4
  /** Cost to fill, in animals of the type that claimed the adjacent path. */
  cost: number
}

export type Clearing = {
  id: string
  name: string
  /**
   * Soft region hint for the organic layout: where this clearing wants to
   * gravitate, as a percentage of the board in each axis — `x`/`y` in 0..100,
   * origin top-left, independent of the sheet's actual size (resize the board
   * and every anchor rescales). `{x:50,y:50}` is dead centre; `{x:100,y:0}` the
   * top-right corner. Because the board isn't square, equal x/y steps aren't
   * equal physical distances — think "percent across, percent down".
   *
   * Authored PORTRAIT-native — same frame as the render box (x across the narrow
   * width, y down the tall height), no rotation applied.
   * The generator (`../map/layout.ts`) treats it as an anchor, not a fixed
   * position — the final coordinate is solved for spacing and zero crossings.
   * Nudge these to steer regions, not geometry.
   */
  target: { x: number; y: number }
  slots: readonly ClearingSlotSpec[]
}

/** Compass a path's curve should bow toward. Portrait-native: north = up (−y), east = right (+x). */
export type BendDirection = "north" | "south" | "east" | "west"
/** How far the bow reaches, as a preset fraction of chord length (~0.07 / 0.12 / 0.20). */
export type BendStrength = "slight" | "medium" | "strong"
/**
 * Optional per-path curve hint. A *soft bias*: among the curve options that stay
 * clear of other paths and clearings, the path prefers to bow toward `dir` at
 * `strength` (default `"medium"`). On a crowded path the solver still yields to
 * clearance, and the build never fails for a hint. The bow is perpendicular to
 * the chord, so a hint pointing along the path's own run is ignored.
 *
 * Shorthand: `bend: "east"` == `bend: { dir: "east", strength: "medium" }`.
 */
export type BendHint = BendDirection | { dir: BendDirection; strength?: BendStrength }

export type Path = {
  id: string
  from: string
  to: string
  /** Cube spaces on the path = its capacity. Claiming requires all of them, one type. */
  length: 2 | 3 | 4 | 5
  /** Optional curve-direction hint (soft bias); see `BendHint`. */
  bend?: BendHint
}

export type BoardGraph = {
  clearings: readonly Clearing[]
  paths: readonly Path[]
}

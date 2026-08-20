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
   * Authored LANDSCAPE; `spec.ts` rotates 90° CW into the portrait render box.
   * The generator (`../map/layout.ts`) treats it as an anchor, not a fixed
   * position — the final coordinate is solved for spacing and zero crossings.
   * Nudge these to steer regions, not geometry.
   */
  target: { x: number; y: number }
  slots: readonly ClearingSlotSpec[]
}

export type Path = {
  id: string
  from: string
  to: string
  /** Cube spaces on the path = its capacity. Claiming requires all of them, one type. */
  length: 2 | 3 | 4
}

export type BoardGraph = {
  clearings: readonly Clearing[]
  paths: readonly Path[]
}

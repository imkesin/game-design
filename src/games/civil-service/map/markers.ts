import { chainToPath, xy } from "./geometry.ts"
import type { HexTile } from "./hex.ts"

/**
 * The two things a hex can be stamped with, drawn as geometry.
 *
 * Both are the same 80%-height hexagon, concentric with the tile and in the
 * same orientation, so each reads as a slot cut into that tile rather than as a
 * shape lying on it. What tells them apart is the construction inside:
 *
 *   resource  one rule, with the good's name across it
 *   capital   a second rule just inside the first, and a star
 *
 * A double rule is a difference in kind rather than in weight, which is the
 * same trick the border tiers use — and it means the capital does not have to
 * shout to be found.
 *
 * Kept out of `hex.ts`: the tiling is the map's substrate, and these are
 * furniture standing on it.
 */

/** Height of a marker as a fraction of the hex holding it. */
export const MARKER_SCALE = 0.8

/** The capital's inner rule. The 4-unit gap at 100 units/inch is ~1mm on paper. */
export const CAPITAL_RULE_SCALE = 0.72

/**
 * A good's name, in map units — so the board and the painter cannot drift
 * apart on it.
 *
 * Sized against the longest label, `COTTON`/`INDIGO`/`SPICES`: six caps at
 * ~0.66em plus the tracking is about 53 units, against the 92 the marker is
 * wide at its waist. The margin is deliberately generous, because the type sits
 * in a hexagon rather than a box — the room it has falls away above and below
 * the centre line.
 */
export const MARKER_TYPE = { fontSize: 12, letterSpacing: 0.9 }

/** Star radius, as a fraction of the hex's height — sized to clear the inner rule. */
const STAR_SCALE = 0.25

/** Pentagram: the ratio that makes a five-pointed star's arms straight. */
const STAR_WAIST = 0.382

const circumradius = (tile: HexTile) =>
  Math.hypot(tile.corners[0]![0] - tile.center[0], tile.corners[0]![1] - tile.center[1])

/** A hexagon concentric with `tile`, at `scale` of its size. */
export function markerPath(tile: HexTile, scale = MARKER_SCALE): string {
  const [cx, cy] = tile.center
  const ring = tile.corners.map((p) => xy([cx + (p[0] - cx) * scale, cy + (p[1] - cy) * scale]))
  return chainToPath(ring, true)
}

/** A five-pointed star, point up, centred on `tile`. */
export function starPath(tile: HexTile): string {
  const [cx, cy] = tile.center
  const outer = circumradius(tile) * Math.sqrt(3) * STAR_SCALE
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    const r = i % 2 === 0 ? outer : outer * STAR_WAIST
    return xy([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  })
  return chainToPath(points, true)
}

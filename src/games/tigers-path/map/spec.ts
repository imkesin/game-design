import { CLEARINGS, PATHS, shapeForLevel } from "../domain.ts"
import { type MapSpec, UNITS_PER_INCH } from "./layout.ts"

/**
 * Builds the layout spec from the authored graph in `domain.ts`: resolves each
 * clearing's slot shapes, derives its bounding-disc radius, and maps paths to
 * edges. Shared by `build.ts` (writes `map.json`) and `paint.node.ts` (the
 * preview loop), so both solve exactly the same problem.
 *
 * Sizes are FIXED and physical — a clearing is as big as it needs to be for its
 * name and slots, a cube is a real cube. Nothing scales to fit; when a graph
 * won't fit the sheet the build fails (with named reasons) rather than shrink.
 */

/** Live area of a letter sheet, landscape, at 0.25in margins — the board's bounds. */
const WIDTH = Math.round(10.5 * UNITS_PER_INCH)
const HEIGHT = Math.round(8.0 * UNITS_PER_INCH)

/** Clearing bounding-disc radius: enough for a name line plus a row of slot icons. */
const radiusFor = (slots: number) => Math.round((0.36 + 0.1 * slots) * UNITS_PER_INCH)

/** Author-facing targets are 0..100 percentages per axis; the solver works in units. */
const toUnits = (target: { x: number; y: number }) => ({
  x: (target.x / 100) * WIDTH,
  y: (target.y / 100) * HEIGHT
})

export function buildSpec(): MapSpec {
  return {
    width: WIDTH,
    height: HEIGHT,
    nodes: CLEARINGS.map((c) => ({
      id: c.id,
      name: c.name,
      r: radiusFor(c.slots.length),
      target: toUnits(c.target),
      slots: c.slots.map((s) => ({ shape: shapeForLevel(s.level), cost: s.cost }))
    })),
    edges: PATHS.map((p) => ({ id: p.id, a: p.from, b: p.to, cap: p.length }))
  }
}

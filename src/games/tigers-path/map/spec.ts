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

/**
 * Board variants. The 2P graph renders PORTRAIT either way (the authored targets
 * were composed landscape, so `rotate` turns them 90° into portrait bounds):
 *
 *  - `2p-split`: the East (right) half of the 18×24 split sheet — ~11.5×17in,
 *    bigger than the old letter board so 2P spreads out, with the shared
 *    on-board Grassland at the bottom.
 *  - `2p-solo`: a standalone home-printable letter sheet, portrait, with the
 *    Grassland OFF-board (a separate component). Live area ~7.7×10.2in.
 */
export type BoardVariant = "2p-split" | "2p-solo"

type VariantConfig = { wIn: number; hIn: number; grass: boolean }
const VARIANTS: Record<BoardVariant, VariantConfig> = {
  "2p-split": { wIn: 11.5, hIn: 17.0, grass: true },
  "2p-solo": { wIn: 8.0, hIn: 10.5, grass: false }
}

/** Every variant, in display order — what `build.ts` bakes into `maps.json` for the UI toggle. */
export const ALL_VARIANTS = Object.keys(VARIANTS) as BoardVariant[]

/** Grassland zone radius on the split sheet — a semicircle on the bottom edge. */
const GRASS_RADIUS = Math.round(3.25 * UNITS_PER_INCH)

/**
 * Clearing bounding-disc radius, in — enough for a name line plus the 15mm slot
 * icons. A 2-slot disc must hold both icons side by side (a vertical stack would
 * crowd out the name); 1- and 3-slot discs already have the room (a 3-slot wraps
 * 2-over-1), so they stay as small as the graph's path lengths allow. A 4-slot
 * marquee disc holds a 2×2 grid — the biggest node, one per board.
 */
const RADIUS_IN: Record<number, number> = { 1: 0.52, 2: 0.68, 3: 0.76, 4: 1.0 }
const radiusFor = (slots: number) => Math.round(RADIUS_IN[slots]! * UNITS_PER_INCH)

/**
 * Rotate an author target 90° clockwise (landscape → portrait): the board's long
 * horizontal axis becomes vertical. Both axes stay 0..100 percentages.
 */
const rotate = (t: { x: number; y: number }) => ({ x: 100 - t.y, y: t.x })

export function buildSpec(variant: BoardVariant = "2p-split"): MapSpec {
  const cfg = VARIANTS[variant]
  if (!cfg) throw new Error(`Unknown board variant "${variant}" (expected ${Object.keys(VARIANTS).join(" | ")})`)
  const WIDTH = Math.round(cfg.wIn * UNITS_PER_INCH)
  const HEIGHT = Math.round(cfg.hIn * UNITS_PER_INCH)

  // Author-facing targets are 0..100 percentages per axis; the solver works in units.
  const toUnits = (target: { x: number; y: number }) => ({
    x: (target.x / 100) * WIDTH,
    y: (target.y / 100) * HEIGHT
  })

  return {
    width: WIDTH,
    height: HEIGHT,
    nodes: CLEARINGS.map((c) => ({
      id: c.id,
      name: c.name,
      r: radiusFor(c.slots.length),
      target: toUnits(rotate(c.target)),
      slots: c.slots.map((s) => ({ shape: shapeForLevel(s.level), cost: s.cost }))
    })),
    edges: PATHS.map((p) => ({ id: p.id, a: p.from, b: p.to, cap: p.length })),
    ...(cfg.grass ? { grassland: { cx: Math.round(WIDTH / 2), cy: HEIGHT, radius: GRASS_RADIUS } } : {})
  }
}

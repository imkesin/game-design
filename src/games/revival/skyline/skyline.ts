/**
 * Brass-style neighborhoods: each is 1–3 touching vertical columns, one Block
 * per column, 1–3 plots each; claiming a column is the game's organizing idea,
 * so nothing else marks it. Columns are bottom-aligned so the silhouette is a
 * skyline with a flat bottom. An 18mm base band along the bottom holds a
 * claim circle under each column; elsewhere the outline runs `SIDE` out from
 * the columns, outer corners slightly rounded. The name floats above the
 * outline on a dark tag, centred over the tallest column (or the span of tied
 * tallest columns). Water, bridges and each neighborhood's territory are
 * painted on the plot grid (`water.ts`, `territory.ts`).
 * All in mm.
 */

/** The 24mm system: a plot's track, holding a 22mm square with 1mm padding all round. */
export const PLOT = 24
/** Band under the plots, down to the outline, holding a claim circle under each column. */
export const BASE = 16
export const CLAIM = 10
/** How far the outline stands off the columns everywhere but the base. */
export const SIDE = 2
/** Corner radius on the outline's outer corners; inner corners stay sharp. */
export const RADIUS = 0.75
/** The name tag's height, and its gap to the outline below. */
export const TAG = 8
export const TAG_GAP = 2
/** Everything drawn above the outline's box. */
export const HEADER = TAG + TAG_GAP

export type NeighborhoodSpec = {
  name: string
  /** Top-left of the outline's box, on the map. */
  x: number
  y: number
  /** Plots per column, left to right. */
  columns: number[]
  /** Land painted to this neighborhood beyond what it stands on, as `col,row` cells. */
  ground?: string[]
}

export type SkylineFile = {
  neighborhoods: NeighborhoodSpec[]
  /** Land and water on the plot grid; see `water.ts`. */
  water: string[]
}

export type Shape = {
  width: number
  height: number
  /** Height of the tallest column. */
  top: number
  /** Outline path, in the box's own coordinates. */
  outline: string
  /** First and last of the tallest columns, which the name tag centres over. */
  tallest: [number, number]
}

export type Point = readonly [number, number]

/**
 * A closed polygon, clockwise on screen, with its outer corners rounded to
 * `outer` and its inner ones to `inner` (less where a side is too short).
 */
export function rounded(points: readonly Point[], outer: number, inner = 0) {
  const n = points.length
  return points.map((p, i) => {
    const prev = points[(i + n - 1) % n]!
    const next = points[(i + 1) % n]!
    const lenIn = Math.hypot(p[0] - prev[0], p[1] - prev[1])
    const lenOut = Math.hypot(next[0] - p[0], next[1] - p[1])
    // Points run clockwise on screen, so a right turn is an outer corner.
    const cross = (p[0] - prev[0]) * (next[1] - p[1]) - (p[1] - prev[1]) * (next[0] - p[0])
    const r = Math.min(cross > 0 ? outer : inner, lenIn / 2, lenOut / 2)
    if (cross === 0 || r <= 0) return `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`
    const a = [p[0] - ((p[0] - prev[0]) / lenIn) * r, p[1] - ((p[1] - prev[1]) / lenIn) * r]
    const b = [p[0] + ((next[0] - p[0]) / lenOut) * r, p[1] + ((next[1] - p[1]) / lenOut) * r]
    return `${i === 0 ? "M" : "L"}${a[0]} ${a[1]}A${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${b[0]} ${b[1]}`
  }).join("") + "Z"
}

export function shape(columns: readonly number[]): Shape {
  const heights = columns.map((plots) => plots * PLOT)
  const top = Math.max(...heights)
  const width = columns.length * PLOT + 2 * SIDE
  const height = SIDE + top + BASE

  // Each column grown by SIDE on top and at the sides; they share a bottom, so their union is a skyline.
  const rects = heights.map((h, i) => ({ x0: i * PLOT, x1: (i + 1) * PLOT + 2 * SIDE, y: top - h }))
  const xs = [...new Set(rects.flatMap(({ x0, x1 }) => [x0, x1]))].sort((a, b) => a - b)
  const steps: { x: number; y: number }[] = []
  for (let k = 0; k < xs.length - 1; k++) {
    const y = Math.min(...rects.filter((r) => r.x0 <= xs[k]! && r.x1 >= xs[k + 1]!).map((r) => r.y))
    if (steps.at(-1)?.y !== y) steps.push({ x: xs[k]!, y })
  }
  const points: Point[] = [[0, height]]
  steps.forEach(({ x, y }, k) => {
    if (k > 0) points.push([x, steps[k - 1]!.y])
    points.push([x, y])
  })
  points.push([width, steps.at(-1)!.y], [width, height])

  const tallest: [number, number] = [heights.indexOf(top), heights.lastIndexOf(top)]
  return { width, height, top, outline: rounded(points, RADIUS), tallest }
}

/** The plot grid: its lines run at `x` and `y` plus multiples of `PLOT`. */
export type Grid = { x: number; y: number }

const mod = (v: number, m: number) => ((v % m) + m) % m

/**
 * The grid with a cell centred on the board: margins match on opposite sides,
 * and a 2×2 tiling's cut lines run down the middle of a row or column of cells,
 * which then can only be street.
 */
export function centredGrid(width: number, height: number): Grid {
  return { x: mod(width / 2 - PLOT / 2, PLOT), y: mod(height / 2 - PLOT / 2, PLOT) }
}

/** The nearest place for a neighborhood's box that puts each plot in a grid cell. */
export function snapToGrid(grid: Grid, { x, y }: { x: number; y: number }) {
  const snap = (v: number, line: number) => line + Math.round((v - line) / PLOT) * PLOT
  return { x: round(snap(x + SIDE, grid.x) - SIDE), y: round(snap(y + SIDE, grid.y) - SIDE) }
}

/** Keeps saved positions free of float noise. */
export const round = (v: number) => Math.round(v * 100) / 100

import type { City } from "./blocks.ts"

/**
 * The city, on a 20×20in quad-fold board: a 6×6 matrix of solid blocks, 1–2
 * plots a side, 5×5 plots per panel. The mayor walks the streets between
 * them, standing on intersections, from City Hall at C3, whose 4 touching
 * plots are left out for a plaza. Nothing about setup is printed: blight and
 * historical buildings are dealt by setup cards (DESIGN.md).
 */
export const CITY: City = {
  cols: [[1, 2, 2], [2, 2, 1]],
  rows: [[1, 2, 2], [2, 2, 1]],
  hall: { col: 2, row: 2 }
}

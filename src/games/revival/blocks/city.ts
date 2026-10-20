import type { City } from "./blocks.ts"

/**
 * The city, on a 20×20in quad-fold board: 2×2 neighborhoods in each panel, a
 * 4×4 matrix. Nothing about setup is printed: blight and historical
 * buildings are dealt by setup cards (DESIGN.md).
 */
export const CITY: City = {
  cols: [2, 2],
  rows: [2, 2]
}

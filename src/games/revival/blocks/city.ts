import type { City } from "./blocks.ts"

/**
 * The 2×3-tile city: a 5×5 matrix of block-columns and block-rows, every
 * frame full for now. Columns shorter than their block-row would leave greyed
 * squares on top.
 */
export const CITY: City = {
  widths: [[2, 3], [2, 2, 1]],
  heights: [[2], [3, 2], [2, 1]],
  neighborhoods: [
    [[2, 2], [2, 2, 2], [2, 2], [2, 2], [2]],
    [[3, 3], [3, 3, 3], [3, 3], [3, 3], [3]],
    [[2, 2], [2, 2, 2], [2, 2], [2, 2], [2]],
    [[2, 2], [2, 2, 2], [2, 2], [2, 2], [2]],
    [[1, 1], [1, 1, 1], [1, 1], [1, 1], [1]]
  ],
  hall: [1, 1]
}

/** The city's measurements, all in mm, and how its blocks lay out on the board. */

/** The 32mm system: a plot's track, holding a 30mm square with 1mm padding all round. */
export const PLOT = 32
export const PLOT_LINE = 0.6
/**
 * Ground inside a block: pure black dots (a halftone, not a grey fill, so it
 * prints the same anywhere) behind white plots, which makes them pop.
 */
export const DOTS = { pitch: 2, r: 0.2 }

/** The line around every block. */
export const EDGE = { width: 1.2, color: "#1f1f1f" }

/** Plots across and up a neighborhood: a ring of 8 around an empty centre. */
export const RING = 3

/** Ring positions as (column, row) in the 3×3, clockwise from the top-left. */
export const RING_PLOTS = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]] as const

/**
 * The sidewalk between the plots and the edge line, all round. Narrower than
 * `STREET`, so neighborhoods separate.
 */
export const BUFFER = 5

/** A neighborhood's width and height. */
export const BLOCK = 2 * BUFFER + RING * PLOT

/** The white street between neighboring blocks; cut lines and folds run down the middle of one. */
export const STREET = 15

/**
 * A city as a matrix of identical neighborhoods split across tiles, so the
 * mayor can walk in straight lines. Row 0, column 0 is the bottom-left.
 */
export type City = {
  /** Neighborhoods across each tile column, left to right. */
  cols: number[]
  /** Neighborhoods up each tile row, bottom to top. */
  rows: number[]
}

/** A neighborhood's label: columns A, B, … from the left, rows 1, 2, … from the bottom. */
export const labelOf = (row: number, col: number) => `${String.fromCharCode(65 + col)}${row + 1}`

/** A grid track along one axis of the board; `block` is the block-column or block-row it holds. */
export type Track = { size: number; block?: number }

/**
 * One axis of the board as grid tracks, `counts` neighborhoods per tile. Each
 * tile's blocks sit `STREET` apart, pushed up to the tile edges so half a
 * street lies on either side of each; the slack goes to the board's edge (on
 * a middle tile, or a lone one, it's split between both sides). `inset` is
 * kept clear inside the board's outer edges (a printer's safe zone).
 * `over` lists tiles whose blocks don't fit, with how many mm over.
 */
export function axis(counts: readonly number[], tile: number, inset = 0) {
  const tracks: Track[] = []
  const over: { tile: number; by: number }[] = []
  let block = 0
  counts.forEach((count, t) => {
    const [first, last] = [t === 0, t === counts.length - 1]
    const [start, end] = [first ? inset : STREET / 2, last ? inset : STREET / 2]
    const slack = tile - (count * BLOCK + (count - 1) * STREET + start + end)
    if (slack < 0) over.push({ tile: t, by: -slack })
    const [before, after] = first === last ? [slack / 2, slack / 2] : first ? [slack, 0] : [0, slack]
    tracks.push({ size: Math.max(before, 0) + start })
    for (let k = 0; k < count; k++) {
      if (k > 0) tracks.push({ size: STREET })
      tracks.push({ size: BLOCK, block: block++ })
    }
    tracks.push({ size: Math.max(after, 0) + end })
  })
  return { tracks, over }
}

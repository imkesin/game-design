/** The city's measurements, all in mm, and how its blocks lay out on the board. */

import { TILE } from "../tiles/tiles.ts"

/**
 * A plot's black outline, all round its tile: plots butt, so neighboring
 * tiles sit two outlines apart.
 */
export const PLOT_PADDING = 0.5

/** A plot's track: a `TILE` square with `PLOT_PADDING` all round. */
export const PLOT = TILE + 2 * PLOT_PADDING

/**
 * Ground inside a block: pure black dots (a halftone, not a grey fill, so it
 * prints the same anywhere) behind white plots, which makes them pop.
 */
export const DOTS = { pitch: 2, r: 0.2 }

/** The line around every block. */
export const EDGE = { width: 1.2, color: "#1f1f1f" }

/**
 * The sidewalk between the plots and the edge line, all round. Narrower than
 * `STREET`, so neighborhoods separate.
 */
export const BUFFER = 2

/** A block's plots as (column, row) in its `cols` × `rows` grid, row 0 at the top. */
export type Layout = {
  cols: number
  rows: number
  plots: readonly (readonly [number, number])[]
}

/** A block's side in mm, `plots` across. */
export const spanOf = (plots: number) => 2 * BUFFER + plots * PLOT

/** The white street between neighboring blocks; cut lines and folds run down the middle of one. */
export const STREET = 18

/**
 * A city as a matrix of neighborhoods split across tiles, so the mayor can
 * walk in straight lines; every block in a block-column shares its width,
 * every block in a block-row its height. Row 0, column 0 is the bottom-left.
 */
export type City = {
  /** Each tile column's block-columns, left to right, as plots across each. */
  cols: readonly (readonly number[])[]
  /** Each tile row's block-rows, bottom to top, as plots up each. */
  rows: readonly (readonly number[])[]
  /**
   * City Hall's intersection: the street right of block-column `col` and
   * above block-row `row`. Each block's plot touching it is left out, for a
   * plaza.
   */
  hall: { col: number; row: number }
}

/** A block's plots (`row` from the bottom): every cell, less any touching City Hall's intersection. */
export function layoutOf(city: City, row: number, col: number): Layout {
  const [cols, rows] = [city.cols.flat()[col] ?? 0, city.rows.flat()[row] ?? 0]
  const { hall } = city
  const across = col === hall.col ? cols - 1 : col === hall.col + 1 ? 0 : undefined
  const up = row === hall.row ? 0 : row === hall.row + 1 ? rows - 1 : undefined
  const cells = Array.from({ length: cols * rows }, (_, i) => [i % cols, Math.floor(i / cols)] as const)
  return { cols, rows, plots: cells.filter(([c, r]) => c !== across || r !== up) }
}

/** Street names: north–south streets A, B, … from the west; east–west ones 1, 2, … from the south. */
export const streetName = {
  across: (street: number) => String.fromCharCode(65 + street),
  up: (street: number) => `${street + 1}`
}

/** An intersection's name, e.g. C3: its north–south street, then its east–west one. */
export const crossingName = (col: number, row: number) => `${streetName.across(col)}${streetName.up(row)}`

/**
 * A grid track along one axis of the board: `block` is the block-column or
 * block-row it holds, `street` the street it's (part of), counted from the
 * board's left or top. A street down a tile edge is two tracks.
 */
export type Track = { size: number; block?: number; street?: number }

/**
 * One axis of the board as grid tracks, `blocks` each tile's block sizes in
 * mm. Each tile's blocks sit `street` apart, pushed up to the tile edges so half a
 * street lies on either side of each; the slack goes to the board's edge (on
 * a middle tile, or a lone one, it's split between both sides). `inset` is
 * kept clear inside the board's outer edges (a printer's safe zone).
 * `over` lists tiles whose blocks don't fit, with how many mm over.
 */
export function axis(blocks: readonly (readonly number[])[], tile: number, inset = 0, street = STREET) {
  const tracks: Track[] = []
  const over: { tile: number; by: number }[] = []
  let [index, gap] = [0, 0]
  blocks.forEach((sizes, t) => {
    const [first, last] = [t === 0, t === blocks.length - 1]
    const [start, end] = [first ? inset : street / 2, last ? inset : street / 2]
    const used = sizes.reduce((a, b) => a + b, 0) + (sizes.length - 1) * street
    const slack = tile - (used + start + end)
    if (slack < 0) over.push({ tile: t, by: -slack })
    const [before, after] = first === last ? [slack / 2, slack / 2] : first ? [slack, 0] : [0, slack]
    const size = Math.max(before, 0) + start
    tracks.push(first ? { size } : { size, street: gap++ })
    sizes.forEach((block, k) => {
      if (k > 0) tracks.push({ size: street, street: gap++ })
      tracks.push({ size: block, block: index++ })
    })
    const rest = Math.max(after, 0) + end
    tracks.push(last ? { size: rest } : { size: rest, street: gap })
  })
  return { tracks, over }
}

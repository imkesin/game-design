import quadFoldTemplate from "./large-quad-fold-board.svg"

/** What the city board prints on, all in mm. */

const IN = 25.4

export type Size = { width: number; height: number }

/**
 * `tile` is the board's unit of layout: no block straddles one, so every edge
 * between tiles runs down the middle of a street.
 */
export type Sheet =
  /** One page per tile, the tile being the page's printable area inside `margin`. */
  | { kind: "tiles"; name: string; tile: Size; margin: number }
  /**
   * One full-bleed page: a folding board whose panels are the tiles, so every
   * fold runs down a street. `fold` is how wide a fold crushes the artwork;
   * blocks stay `safe` inside the trim. `template` is the printer's guide,
   * laid over the board on screen only.
   */
  | {
    kind: "board"
    name: string
    tile: Size
    panels: { cols: number; rows: number }
    bleed: number
    safe: number
    fold: number
    template: string
  }

export const SHEETS = {
  letter: { kind: "tiles", name: "Letter", tile: { width: 10.5 * IN, height: 8 * IN }, margin: IN / 4 },
  poster: { kind: "tiles", name: "18×24in", tile: { width: 17 * IN, height: 23 * IN }, margin: IN / 2 },
  /**
   * The Game Crafter's large quad-fold board, measured off its template (72pt
   * to the inch): 20×20in trim, ⅛in (9pt) bleed, safe zone 15.3pt inside the
   * trim, a ¼in (18pt) fold band across the middle, and a fold (top half) and
   * cut (bottom half) down it.
   */
  quadFold: {
    kind: "board",
    name: "20×20in quad-fold",
    tile: { width: 10 * IN, height: 10 * IN },
    panels: { cols: 2, rows: 2 },
    bleed: IN / 8,
    safe: (15.3 / 72) * IN,
    fold: IN / 4,
    template: quadFoldTemplate
  }
} as const satisfies Record<string, Sheet>

/** The printed page around a board: a tile plus its margin, or the whole board plus bleed. */
export const pageOf = (sheet: Sheet, board: Size): Size =>
  sheet.kind === "tiles"
    ? { width: sheet.tile.width + 2 * sheet.margin, height: sheet.tile.height + 2 * sheet.margin }
    : { width: board.width + 2 * sheet.bleed, height: board.height + 2 * sheet.bleed }

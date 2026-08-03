import { CARD_TRIM_H_MM, CARD_TRIM_W_MM } from "~/shared/print/cardSize"

/**
 * Where the board's furniture sits, in inches on the live area's own grid —
 * one cell per inch, origin at the top-left.
 *
 * The print sheet turns these into CSS grid placement; the hex painter draws
 * them over the tiles. Both read the same numbers, so a zone cannot end up in
 * one place on paper and another while you are painting — which would mean
 * painting terrain under the furniture and only finding out at print time.
 */

const MM_PER_INCH = 25.4
export const CARD_TRIM_W_IN = CARD_TRIM_W_MM / MM_PER_INCH
export const CARD_TRIM_H_IN = CARD_TRIM_H_MM / MM_PER_INCH

/**
 * Line weights, in millimetres, for everything the board lays on top of the map.
 *
 * One geometric scale at a ratio of √2 — the step paper sizes and type scales
 * use, and adopted here for the same reason: neighbouring weights are visibly
 * different without any pair looking like a mistake. Authored as a ratio rather
 * than as four picked figures, because a hierarchy held together by taste is one
 * nudged number away from being merely inconsistent, and on a printed sheet that
 * is only discovered after it is printed.
 *
 * Read outward, the sheet now says: the board's edge, then the rondel, then the
 * zones laid on the board, then the lines drawn inside any of them.
 *
 * The map's own cartography sits at 0.3mm, below the whole scale, so furniture
 * never has to be told apart from terrain. The payoff table's internal rules
 * stay off the scale too, deliberately — at 0.2mm and part-opacity they are a
 * tint used to separate rows, not a border, and promoting them here would turn a
 * quiet table into a grid.
 */
const STEP = Math.SQRT2
const round = (n: number) => Math.round(n * 100) / 100

/** The lightest furniture line, and the anchor the rest of the scale is derived from. */
const ZONE_WEIGHT = 0.8

export const BORDER = {
  /** Divides the inside of one piece of furniture: the rondel's spokes. */
  inner: round(ZONE_WEIGHT / STEP),
  /** Bounds a zone laid on the board: the card market, the payoff table. */
  zone: ZONE_WEIGHT,
  /** The rondel's rim and hub — a zone that is its own shape, so it outranks the squares. */
  rondel: round(ZONE_WEIGHT * STEP),
  /**
   * The board's edge, drawn inside the live area and so eating that much of it.
   * Anything reaching a zone that touches the board's edge has to clear this or
   * it collides with the frame — which is why the scale lives here, next to the
   * zones, rather than on the print sheet that draws it.
   */
  frame: round(ZONE_WEIGHT * STEP * STEP)
} as const

/**
 * The card market: face-up cards in the top-right corner, laid out right- and
 * top-aligned against the live area's corner. The zone is a little larger than
 * the cards it holds, so the reserved ground reads as a round number of hexes
 * rather than as the cards' awkward millimetre trim.
 */
export const MARKET = {
  /** Zone size, anchored to the live area's top-right corner. */
  cols: 6,
  rows: 4,
  cards: 2
}

/**
 * The rondel: a square in the bottom-right corner, left blank on the printed
 * board. The wheel itself is not drawn yet — this only reserves the ground, so
 * terrain never gets painted where it will sit.
 */
export const RONDEL = {
  cols: 6,
  rows: 6
}

/**
 * The resource payoff table: a square in the bottom-left, and the only piece of
 * furniture on the left of the board. Like the rondel, this reserves the ground
 * and nothing more — what the table says is a later pass.
 */
export const PAYOFF = {
  cols: 2,
  rows: 2
}

/** The market zone itself, in inches from the live area's top-left corner. */
export function marketZone(boardCols: number) {
  return {
    x: boardCols - MARKET.cols,
    y: 0,
    width: MARKET.cols,
    height: MARKET.rows
  }
}

/** The rondel zone, in inches from the live area's top-left corner. */
export function rondelZone(boardCols: number, boardRows: number) {
  return {
    x: boardCols - RONDEL.cols,
    y: boardRows - RONDEL.rows,
    width: RONDEL.cols,
    height: RONDEL.rows
  }
}

/** The payoff table's zone, in inches from the live area's top-left corner. */
export function payoffZone(boardRows: number) {
  return {
    x: 0,
    y: boardRows - PAYOFF.rows,
    width: PAYOFF.cols,
    height: PAYOFF.rows
  }
}

/**
 * Trim rectangles for the market's cards, in inches from the live area's
 * top-left corner.
 *
 * Spacing is even in the strict sense: `n` cards leave `n + 1` identical gaps
 * across the zone, so the space between two cards equals the space from a card
 * to the zone's edge. Derived rather than authored — a hand-picked gap plus
 * centring would put a different figure between the cards than around them, and
 * would drift the moment the zone or the card count changed.
 *
 * This is what the sheet's `space-evenly` row resolves to, which is the point:
 * the painter has to draw the cards where they will actually print, or terrain
 * gets painted under them.
 */
export function marketCardRects(boardCols: number) {
  const zone = marketZone(boardCols)
  const gap = (zone.width - MARKET.cards * CARD_TRIM_W_IN) / (MARKET.cards + 1)
  return Array.from({ length: MARKET.cards }, (_, i) => ({
    x: zone.x + gap * (i + 1) + i * CARD_TRIM_W_IN,
    y: zone.y + (zone.height - CARD_TRIM_H_IN) / 2,
    width: CARD_TRIM_W_IN,
    height: CARD_TRIM_H_IN
  }))
}

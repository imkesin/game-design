/**
 * The setup cards (DESIGN.md, Setup cards): dealt one to each row and column,
 * laid along the city's west and north edges. Each lists 4 entries, entry 1
 * nearest the card. A row card's pieces fill each ring's top 3 plots and
 * left-middle plot, a column card's its bottom 3 and right-middle.
 */

/** A building type, or a parking lot (blight cards only). */
export type Piece = "house" | "commercial" | "industrial" | "parking"

export type SetupCard = {
  /** Blight (every player count) or historical buildings (2–3 players). */
  deck: "blight" | "historical"
  name: string
  /** Entry 1 (nearest the card) first: up to 3 pieces on a blight card, 1 on a historical card. */
  entries: readonly [readonly Piece[], readonly Piece[], readonly Piece[], readonly Piece[]]
  /** Historical only: which entries' buildings are placed at 3 players too (all are at 2). */
  atThree?: readonly [boolean, boolean, boolean, boolean]
}

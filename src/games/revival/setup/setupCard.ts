/**
 * The setup cards (DESIGN.md, Setup cards): dealt one to each row and column,
 * laid along the city's west and north edges. Each lists 4 entries, entry 1
 * nearest the card. A row card's pieces fill each ring's top 3 plots and
 * left-middle plot, a column card's its bottom 3 and right-middle.
 */

/** A building type a historical card places. */
export type Piece = "house" | "commercial" | "industrial"

export type Entries4<T> = readonly [T, T, T, T]

/** Entries run from entry 1, nearest the card. */
export type SetupCard =
  /** Every player count: how many blight (0–3) each entry places; blight has no type. */
  | { deck: "blight"; name: string; entries: Entries4<number> }
  /** 2–3 players: at most 1 building an entry, and which are placed at 3 players too (all are at 2). */
  | { deck: "historical"; name: string; entries: Entries4<readonly Piece[]>; atThree: Entries4<boolean> }

/**
 * Revival's color conventions, shared by the board, tiles, cubes and cards.
 * Anything blighted is black; historical is burgundy. A blighted or historical
 * building is split diagonally: that color top-left, its type's bottom-right.
 */
export const COLORS = {
  park: "#5a9a4e",
  house: "#e6d2a8",
  commercial: "#9a6a42",
  industrial: "#8f8f8f",
  blight: "#1f1f1f",
  /** Historical buildings' accent: heritage-plaque burgundy. */
  historical: "#62222d",
  /** Coins, and the cost printed on a tile you can buy. */
  coin: "#d9a520",
  /** The mayor and his agenda cards: civic navy, darker and bluer than parking. */
  mayor: "#1e3a5f",
  /** Not a building type: a very grey blue, darker than Industrial grey. */
  parking: "#5f7186"
} as const

/** A diagonal split: `accent` top-left, `color` bottom-right. */
export const split = (accent: string, color: string) => `linear-gradient(to bottom right, ${accent} 50%, ${color} 50%)`

/**
 * Revival's palette, shared by the board, tiles and cards; picked in OKLCH
 * (lightness, chroma, hue) so the rules hold by eye:
 *
 * - **Buildings** share one lightness (L 0.70) and a low chroma, and differ by
 *   hue only, so the same white marks and dark screens read the same on all.
 *   Their hues sit in the gaps between the players' (green, sand, teal and
 *   concrete grey), so a worker never matches a building.
 * - **Neutrals** (blight, ink) are desaturated; blight, of no type, is a
 *   grime grey, darker than any building.
 * - **Civic** (the mayor, civic buildings) is white, with navy ink.
 * - **Money** keeps its own hues, used by no building.
 * - **Players** are vibrant (chroma 0.18+), to break away from the city.
 *
 * A historical building drawn small is split diagonally: that color
 * top-left, its type's bottom-right.
 */
export const COLORS = {
  /** oklch(0.70 0.09 140) */
  park: "#80ac77",
  /** Sand: oklch(0.70 0.07 80) */
  house: "#b69a6c",
  /** Teal: oklch(0.70 0.07 195) */
  commercial: "#67acac",
  /** Concrete, a warm grey: oklch(0.70 0.015 70) */
  industrial: "#a59d95",
  /** Grime, a warm dark grey: oklch(0.40 0.013 77), well under the buildings' 0.70 but not black. */
  blight: "#4c4740",
  /** Historical buildings' accent: heritage-plaque burgundy, oklch(0.38 0.10 15). */
  historical: "#6d2731",
  /** The mayor and civic buildings. */
  civic: "#f7f5f0",
  /** Civic ink: agenda cards and tax incentives, oklch(0.36 0.08 255). */
  civicInk: "#1d3e66",
  /** oklch(0.78 0.14 80) */
  coin: "#e6ac3d",
  /** A construction tile's price: "in the red", oklch(0.55 0.15 32). */
  cost: "#b94834",
  /** A construction tile's payoff: "in the black", softened to a dark grey. */
  payoff: "#555555"
} as const

/** The companies, vibrant so they never read as part of the city. */
export const PLAYERS = {
  /** oklch(0.88 0.18 98) */
  yellow: "#f7d710",
  /** oklch(0.68 0.23 355) */
  pink: "#fc459f",
  /** oklch(0.72 0.19 50) */
  orange: "#fe7802",
  /** oklch(0.56 0.24 305) */
  purple: "#9738e1",
  /** oklch(0.60 0.20 255) */
  blue: "#047df1"
} as const

/** A diagonal split: `accent` top-left, `color` bottom-right. */
export const split = (accent: string, color: string) => `linear-gradient(to bottom right, ${accent} 50%, ${color} 50%)`

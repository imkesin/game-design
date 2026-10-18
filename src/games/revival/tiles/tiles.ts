/**
 * The base-plate tiles (30mm, the board's plot square): wooden tokens on top
 * are the finished buildings. Counts from DESIGN.md's Supply mix.
 */

export type TileKind = "house" | "commercial" | "industrial" | "park" | "parking"

/**
 * One face of a tile. A blight face is split diagonally, black and its type's
 * color. `cost` is what a player pays to cone it: a row tile's price, or a
 * blight's restore price.
 */
export type TileFace = { kind: TileKind; blight?: boolean; historical?: boolean; cost?: number }

/** What breaking ground on each type costs (DESIGN.md, Payoff chart). */
const COST = { house: 1, commercial: 2, industrial: 4 } as const

/** Coning a blight costs its type's cost less this (DESIGN.md, Blight); a free restore shows no coin. */
const RESTORE_DISCOUNT = 1

const many = (count: number, face: TileFace): TileFace[] => Array.from({ length: count }, () => face)

/**
 * Every tile, single-sided: the row deck (9 : 3 : 1), the Park supply,
 * historical buildings, parking lots, and the blight tiles a black wooden
 * building stands on at setup.
 */
export const TILES: readonly TileFace[] = [
  ...many(54, { kind: "house", cost: COST.house }),
  ...many(18, { kind: "commercial", cost: COST.commercial }),
  ...many(6, { kind: "industrial", cost: COST.industrial }),
  /** Assumed: the supply size isn't decided yet. */
  ...many(20, { kind: "park" }),
  ...many(10, { kind: "house", historical: true }),
  ...many(6, { kind: "commercial", historical: true }),
  ...many(2, { kind: "industrial", historical: true }),
  ...many(8, { kind: "parking" }),
  ...many(8, { kind: "house", blight: true }),
  ...many(12, { kind: "commercial", blight: true, cost: COST.commercial - RESTORE_DISCOUNT }),
  ...many(10, { kind: "industrial", blight: true, cost: COST.industrial - RESTORE_DISCOUNT })
]

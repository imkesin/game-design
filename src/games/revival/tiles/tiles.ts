/**
 * The base-plate tiles (the board's plot square): wooden tokens on top are the
 * finished buildings. Counts from DESIGN.md's Supply mix.
 */

/** A tile's side in mm, room for a stock 1.25in (31.75mm) tile; the board's plots are sized from it. */
export const TILE = 32

/** A printed sticker's side in mm, under `TILE` so it sits inside a stock tile's edge. */
export const STICKER = TILE - 1

export type TileKind = "house" | "commercial" | "industrial" | "park" | "parking"

/**
 * One face of a tile. A blight face is split diagonally, black and its type's
 * color. `cost` is what a player pays to cone it: a row tile's price, or a
 * blight's restore price.
 */
export type TileFace = { kind: TileKind; blight?: boolean; historical?: boolean; cost?: number }

/** What breaking ground on each type costs (DESIGN.md, Payoff chart); a Park is free. */
export const COST = { park: 0, house: 1, commercial: 2, industrial: 4 } as const

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

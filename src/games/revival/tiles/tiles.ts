/**
 * The tiles (the board's plot square), two-sided: a step forward on a plot
 * flips or swaps its tile (COMPONENTS.md, Flat, flipping tiles). Counts from
 * DESIGN.md's Supply mix.
 */

/** A tile's side in mm: pre-cut 35mm MDF; the board's plots are sized from it. */
export const TILE = 35

/** A printed sticker's side in mm, under `TILE` so it sits inside a stock tile's edge. */
export const STICKER = TILE - 1

export type BuildingKind = "house" | "commercial" | "industrial" | "park"

/**
 * Which face: a project's `construction` side (its numbers), a `finished`
 * building (art only), or a blight's `dark` side (no numbers, no type).
 */
export type Side = "construction" | "finished" | "dark"

/**
 * One face of a tile. `cost` is a row tile's price, `sale` its base sale
 * value and `bonus` what's added on top, `workers` how many it takes.
 */
export type TileFace = {
  kind: BuildingKind | "blight"
  side: Side
  historical?: boolean
  cost?: number
  sale?: number
  bonus?: Bonus
  workers?: number
}

/** A physical tile: side A, and side B unless it's left bare. */
export type Tile = { a: TileFace; b?: TileFace }

/** `amount` coins per `per`: a Park in the neighborhood, or a cube taken (of the type that puts it out). */
export type Bonus = { amount: number; per: "park" | "house" | "commercial" }

/** What breaking ground on each type costs (DESIGN.md, Payoff chart); a Park is free. */
export const COST = { park: 0, house: 1, commercial: 2, industrial: 4 } as const satisfies Record<BuildingKind, number>

/** Base sale values (DESIGN.md, Payoff chart). */
const SALE = { park: 1, house: 3, commercial: 2, industrial: 1 } as const satisfies Record<BuildingKind, number>

const BONUS: Partial<Record<BuildingKind, Bonus>> = {
  house: { amount: 1, per: "park" },
  commercial: { amount: 1, per: "house" },
  industrial: { amount: 3, per: "commercial" }
}

const paid = (cost: number) => (cost > 0 ? { cost } : {})

/** A project's numbers. */
const construction = (kind: BuildingKind, cost: number): TileFace => ({
  kind,
  side: "construction",
  ...paid(cost),
  sale: SALE[kind],
  ...(BONUS[kind] === undefined ? {} : { bonus: BONUS[kind] }),
  workers: 1
})

const finished = (kind: BuildingKind, extra: Partial<TileFace> = {}): TileFace => ({ kind, side: "finished", ...extra })

const many = (count: number, tile: Tile): Tile[] => Array.from({ length: count }, () => tile)

const row = (kind: BuildingKind): Tile => ({ a: construction(kind, COST[kind]), b: finished(kind) })

/** A blight's dark face, of no type. Out of play since 2026-10-25 (every blank plot is run down); kept for the palette. */
export const BLIGHT: TileFace = { kind: "blight", side: "dark" }

/**
 * Every tile: the row deck (9 : 3 : 1), the Park supply, historical buildings
 * (their source is open; as many of each type as any 4 setup cards place).
 */
export const TILES: readonly Tile[] = [
  ...many(54, row("house")),
  ...many(18, row("commercial")),
  ...many(6, row("industrial")),
  /** Assumed: the supply size isn't decided yet. Setup cards place up to 4, finished side up. */
  ...many(20, row("park")),
  ...many(11, { a: finished("house", { historical: true }) }),
  ...many(8, { a: finished("commercial", { historical: true }) }),
  ...many(4, { a: finished("industrial", { historical: true }) })
]

/**
 * The tiles (the board's plot square), two-sided: a step forward on a plot
 * flips or swaps its tile (COMPONENTS.md, Flat, flipping tiles). Counts from
 * DESIGN.md's Supply mix.
 */

/** A tile's side in mm: pre-cut 35mm MDF; the board's plots are sized from it. */
export const TILE = 35

/** A printed sticker's side in mm, under `TILE` so it sits inside a stock tile's edge. */
export const STICKER = TILE - 1

export type TileKind = "house" | "commercial" | "industrial" | "park" | "parking"

/**
 * Which face: a project's `construction` side (its numbers), a `finished`
 * building (art only), or a blight's `dark` side.
 */
export type Side = "construction" | "finished" | "dark"

/**
 * One face of a tile. `cost` is what a player pays to put workers on it: a
 * row tile's price, or a blight's restore price (none when free). `sale` is
 * its base sale value, `workers` how many it takes, `cubes` how many it puts
 * out when finished.
 */
export type TileFace = {
  kind: TileKind
  side: Side
  historical?: boolean
  restored?: boolean
  cost?: number
  sale?: number
  workers?: number
  cubes?: number
}

/** A physical tile: side A, and side B unless it's left bare. */
export type Tile = { a: TileFace; b?: TileFace }

export type BuildingKind = Exclude<TileKind, "parking">

/** What breaking ground on each type costs (DESIGN.md, Payoff chart); a Park is free. */
export const COST = { park: 0, house: 1, commercial: 2, industrial: 4 } as const satisfies Record<BuildingKind, number>

/** Base sale values (DESIGN.md, Payoff chart). */
const SALE = { park: 1, house: 3, commercial: 2, industrial: 1 } as const satisfies Record<BuildingKind, number>

/** Cubes put out when finished: a demand cube from a House, a Commercial cube from a shop. */
const CUBES = { park: 0, house: 1, commercial: 1, industrial: 0 } as const satisfies Record<BuildingKind, number>

/** Restoring a blight costs its type's cost less this (DESIGN.md, Blight). */
const RESTORE_DISCOUNT = 1

const paid = (cost: number) => (cost > 0 ? { cost } : {})

/** A project's numbers; `cost` is left off a blight's back, paid when it was restored. */
const construction = (kind: BuildingKind, cost?: number): TileFace => ({
  kind,
  side: "construction",
  ...paid(cost ?? 0),
  sale: SALE[kind],
  workers: 1,
  cubes: CUBES[kind]
})

const finished = (kind: TileKind, extra: Partial<TileFace> = {}): TileFace => ({ kind, side: "finished", ...extra })

const many = (count: number, tile: Tile): Tile[] => Array.from({ length: count }, () => tile)

const row = (kind: BuildingKind): Tile => ({ a: construction(kind, COST[kind]), b: finished(kind) })

const blight = (kind: BuildingKind): Tile => ({
  a: { kind, side: "dark", ...paid(COST[kind] - RESTORE_DISCOUNT), workers: 2 },
  b: construction(kind)
})

/**
 * Every tile: the row deck (9 : 3 : 1), the Park supply, blight and the
 * restored supply it's swapped for (one per blight, for now), historical
 * buildings (their source is open; drawn as before), and parking lots.
 */
export const TILES: readonly Tile[] = [
  ...many(54, row("house")),
  ...many(18, row("commercial")),
  ...many(6, row("industrial")),
  /** Assumed: the supply size isn't decided yet. */
  ...many(20, row("park")),
  ...many(8, blight("house")),
  ...many(12, blight("commercial")),
  ...many(10, blight("industrial")),
  ...many(8, { a: finished("house", { restored: true }) }),
  ...many(12, { a: finished("commercial", { restored: true }) }),
  ...many(10, { a: finished("industrial", { restored: true }) }),
  ...many(10, { a: finished("house", { historical: true }) }),
  ...many(6, { a: finished("commercial", { historical: true }) }),
  ...many(2, { a: finished("industrial", { historical: true }) }),
  ...many(8, { a: finished("parking") })
]

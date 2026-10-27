/**
 * The tiles (the board's plot square), two-sided: a step forward on a plot
 * flips or swaps its tile (COMPONENTS.md, Flat, flipping tiles). Counts from
 * DESIGN.md's Levels and era decks.
 */

/** A tile's side in mm: pre-cut 35mm MDF; the board's plots are sized from it. */
export const TILE = 35

/** A printed sticker's side in mm, under `TILE` so it sits inside a stock tile's edge. */
export const STICKER = TILE - 1

export type BuildingKind = "house" | "commercial" | "industrial" | "park"

/** A building tile's level (DESIGN.md, Levels and era decks); a Park has none. */
export type Level = 1 | 2 | 3

/**
 * Which face: a project's `construction` side (its numbers), a `finished`
 * building (art only), or a blight's `dark` side (no numbers, no type).
 */
export type Side = "construction" | "finished" | "dark"

/**
 * One face of a tile. `cost` is a row tile's price, `sale` its base sale
 * value, `workers` how many it takes. What a sale counts is in the rules, not
 * on the tile.
 */
export type TileFace = {
  kind: BuildingKind | "blight"
  side: Side
  level?: Level
  cost?: number
  sale?: number
  workers?: number
}

/** A physical tile: side A, and side B unless it's left bare. */
export type Tile = { a: TileFace; b?: TileFace }

type Leveled = Exclude<BuildingKind, "park">

const LEVELED = ["house", "commercial", "industrial"] as const satisfies readonly Leveled[]

/** At L1, L2, L3. */
type Ladder = readonly [number, number, number]

const RUNG = { 1: 0, 2: 1, 3: 2 } as const satisfies Record<Level, number>

/** What breaking ground costs (DESIGN.md, Levels and era decks); a Park is free. */
const COST = { house: [1, 2, 3], commercial: [2, 3, 4], industrial: [4, 5, 6] } as const satisfies Record<
  Leveled,
  Ladder
>

/** Base sale values (DESIGN.md, Levels and era decks). */
const SALE = { house: [2, 4, 6], commercial: [2, 4, 6], industrial: [2, 4, 6] } as const satisfies Record<
  Leveled,
  Ladder
>

const WORKERS = { park: 1, house: 1, commercial: 2, industrial: 3 } as const satisfies Record<BuildingKind, number>

const finished = (kind: BuildingKind, level?: Level): TileFace => ({
  kind,
  side: "finished",
  ...(level === undefined ? {} : { level })
})

const many = (count: number, tile: Tile): Tile[] => Array.from({ length: count }, () => tile)

const building = (kind: Leveled, level: Level): Tile => ({
  a: {
    kind,
    side: "construction",
    level,
    cost: COST[kind][RUNG[level]],
    sale: SALE[kind][RUNG[level]],
    workers: WORKERS[kind]
  },
  b: finished(kind, level)
})

const PARK: Tile = { a: { kind: "park", side: "construction", sale: 1, workers: WORKERS.park }, b: finished("park") }

/** A blight's dark face, of no type. Out of play since 2026-10-25 (every blank plot is run down); kept for the palette. */
export const BLIGHT: TileFace = { kind: "blight", side: "dark" }

/**
 * Each level's deck, 32 tiles. Placeholder mixes: L1 covers the most any 4
 * setup cards place (14 / 7 / 4), L3 leans Industrial.
 */
const DECKS = {
  1: { house: 20, commercial: 8, industrial: 4 },
  2: { house: 16, commercial: 10, industrial: 6 },
  3: { house: 10, commercial: 10, industrial: 12 }
} as const satisfies Record<Level, Record<Leveled, number>>

/** Every tile: the 96 building tiles (historical buildings are L1s, finished side up) and 24 Parks. */
export const TILES: readonly Tile[] = [
  ...([1, 2, 3] as const).flatMap((level) =>
    LEVELED.flatMap((kind) => many(DECKS[level][kind], building(kind, level)))
  ),
  ...many(24, PARK)
]

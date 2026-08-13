/**
 * Tiger's Path — v0 prototype data. Design doc: /tigers-path/DESIGN.md.
 *
 * The one structural idea everything below serves: board pieces are NOT
 * player-owned. Five shared animal types live on the routes and in the
 * clearings; a player's stake in an animal is their position on its engine
 * track, nothing on the map.
 */

export type AnimalId = "tiger" | "elephant" | "monkey" | "boar" | "snake"

export type Animal = {
  id: AnimalId
  name: string
  /** Panda color scale the animal owns everywhere it appears. */
  color: "orange" | "zinc" | "brown" | "purple" | "green"
  /**
   * Ladder rank, 1 = strongest. Drives displacement (higher rank displaces
   * lower; tigers are never displaced, snakes never displace) and clearing
   * entries (Liar's-Dice ladder: count first, then rank).
   */
  rank: 1 | 2 | 3 | 4 | 5
  /** Cubes of this animal in the bag at setup. Rarity offsets rank. */
  bagCount: number
  /** What this animal's engine track governs. */
  power: string
  /** Track values, start position first (6 positions: start + 5 upgrades). */
  trackValues: readonly number[]
}

/** Strongest first — display order for the hierarchy and the powers board. */
export const ANIMALS: readonly Animal[] = [
  {
    id: "tiger",
    name: "Tiger",
    color: "orange",
    rank: 1,
    bagCount: 12,
    power: "Actions per turn",
    trackValues: [2, 3, 3, 4, 4, 5]
  },
  {
    id: "elephant",
    name: "Elephant",
    color: "zinc",
    rank: 2,
    bagCount: 14,
    power: "Animals moved per Move",
    trackValues: [2, 3, 3, 4, 4, 5]
  },
  {
    id: "monkey",
    name: "Monkey",
    color: "brown",
    rank: 3,
    bagCount: 16,
    power: "Animals taken from general supply",
    trackValues: [1, 2, 2, 3, 3, 4]
  },
  {
    id: "boar",
    name: "Boar",
    color: "purple",
    rank: 4,
    bagCount: 18,
    power: "Clearing capacity you may add into",
    trackValues: [2, 3, 3, 4, 4, 5]
  },
  {
    id: "snake",
    name: "Snake",
    color: "green",
    rank: 5,
    bagCount: 20,
    power: "Bag pull size (keep all but 1, 1 to general)",
    trackValues: [2, 3, 3, 4, 4, 5]
  }
]

export const ANIMAL_BY_ID: Record<AnimalId, Animal> = Object.fromEntries(
  ANIMALS.map((a) => [a.id, a])
) as Record<AnimalId, Animal>

/** A clearing holds 2 animals unless your Boar level says otherwise. */
export const CLEARING_BASE_CAPACITY = 2
/** The Boar track tops out at 5, so no clearing ever needs more slots. */
export const CLEARING_MAX_CAPACITY = 5

export type ClearingId =
  | "riverbend"
  | "bamboo-grove"
  | "salt-lick"
  | "fern-hollow"
  | "old-banyan"
  | "termite-hill"
  | "mangrove-edge"
  | "sunning-rocks"
  | "kapok-crown"

export type Clearing = {
  id: ClearingId
  name: string
  /** `grid-area` name in `BoardMap`'s template. */
  area: string
}

export type Route = {
  id: string
  from: ClearingId
  to: ClearingId
  /** Cube spaces on the route. Claiming requires all of them, one type. */
  length: 2 | 3 | 4
  orientation: "h" | "v"
  /** `grid-area` name in `BoardMap`'s template. */
  area: string
}

/**
 * v0 map: a 3x3 lattice — 9 clearings, 12 routes (every adjacent pair).
 * Corner clearings have 2 routes, edges 3, the centre 4, so route pressure
 * rises toward Old Banyan. Lengths run 3x2 / 6x3 / 3x4 — short routes kept
 * deliberately scarce — for 34 spaces against 80 cubes. Length-4 routes are
 * horizontal purely so the board fits a letter sheet.
 */
export const CLEARINGS: readonly Clearing[] = [
  { id: "riverbend", name: "Riverbend", area: "a" },
  { id: "bamboo-grove", name: "Bamboo Grove", area: "b" },
  { id: "salt-lick", name: "Salt Lick", area: "c" },
  { id: "fern-hollow", name: "Fern Hollow", area: "d" },
  { id: "old-banyan", name: "Old Banyan", area: "e" },
  { id: "termite-hill", name: "Termite Hill", area: "f" },
  { id: "mangrove-edge", name: "Mangrove Edge", area: "g" },
  { id: "sunning-rocks", name: "Sunning Rocks", area: "h" },
  { id: "kapok-crown", name: "Kapok Crown", area: "i" }
]

export const ROUTES: readonly Route[] = [
  { id: "ab", from: "riverbend", to: "bamboo-grove", length: 4, orientation: "h", area: "ab" },
  { id: "bc", from: "bamboo-grove", to: "salt-lick", length: 3, orientation: "h", area: "bc" },
  { id: "de", from: "fern-hollow", to: "old-banyan", length: 3, orientation: "h", area: "de" },
  { id: "ef", from: "old-banyan", to: "termite-hill", length: 4, orientation: "h", area: "ef" },
  { id: "gh", from: "mangrove-edge", to: "sunning-rocks", length: 4, orientation: "h", area: "gh" },
  { id: "hi", from: "sunning-rocks", to: "kapok-crown", length: 3, orientation: "h", area: "hi" },
  { id: "ad", from: "riverbend", to: "fern-hollow", length: 2, orientation: "v", area: "ad" },
  { id: "be", from: "bamboo-grove", to: "old-banyan", length: 3, orientation: "v", area: "be" },
  { id: "cf", from: "salt-lick", to: "termite-hill", length: 2, orientation: "v", area: "cf" },
  { id: "dg", from: "fern-hollow", to: "mangrove-edge", length: 3, orientation: "v", area: "dg" },
  { id: "eh", from: "old-banyan", to: "sunning-rocks", length: 2, orientation: "v", area: "eh" },
  { id: "fi", from: "termite-hill", to: "kapok-crown", length: 3, orientation: "v", area: "fi" }
]

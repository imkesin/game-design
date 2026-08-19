/**
 * Tiger's Path — v0 prototype data. Design doc: /src/games/tigers-path/DESIGN.md.
 *
 * The one structural idea everything below serves: board pieces are NOT
 * player-owned. Five shared animal types live on the paths and in the
 * clearings; a player's stake in an animal is their position on its engine
 * track, nothing on the map.
 */

export type AnimalId = "tiger" | "elephant" | "monkey" | "boar" | "snake"

export type Animal = {
  id: AnimalId
  name: string
  /** Panda color scale the animal owns everywhere it appears. */
  color: "orange" | "zinc" | "yellow" | "purple" | "green"
  /**
   * Ladder rank, 1 = strongest. Drives contests (higher rank contests
   * lower; tigers are never contested, snakes never contest) and clearing
   * entries (Liar's-Dice ladder: count first, then rank).
   */
  rank: 1 | 2 | 3 | 4 | 5
  /** Cubes of this animal in the Jungle bag at setup. Rarity offsets rank. */
  jungleCount: number
  /** What this animal's engine track governs. */
  power: string
  /** Track values, start position first (7 positions: start + 6 upgrades, the last of which triggers the end game). */
  trackValues: readonly number[]
}

/** Strongest first — display order for the hierarchy and the powers board. */
export const ANIMALS: readonly Animal[] = [
  {
    id: "tiger",
    name: "Tiger",
    color: "orange",
    rank: 1,
    jungleCount: 26,
    power: "Actions per turn",
    trackValues: [2, 3, 3, 4, 4, 5, 5, 5]
  },
  {
    id: "elephant",
    name: "Elephant",
    color: "zinc",
    rank: 2,
    jungleCount: 28,
    power: "End-game multiplier on your largest established network",
    trackValues: [1, 2, 2, 3, 3, 4, 4, 4]
  },
  {
    id: "monkey",
    name: "Monkey",
    color: "yellow",
    rank: 3,
    jungleCount: 30,
    power: "Grasslands recruit size (take N, all of 1 type)",
    trackValues: [1, 2, 2, 3, 3, 4, 4, 4]
  },
  {
    id: "boar",
    name: "Boar",
    color: "purple",
    rank: 4,
    jungleCount: 32,
    power: "Clearing slots you can fill (this shape & smaller)",
    trackValues: [2, 3, 3, 4, 4, 5, 5, 5]
  },
  {
    id: "snake",
    name: "Snake",
    color: "green",
    rank: 5,
    jungleCount: 34,
    power: "Jungle recruit size (draw N, keep all of 1 chosen type)",
    trackValues: [2, 3, 3, 4, 4, 5, 5, 5]
  }
]

export const ANIMAL_BY_ID: Record<AnimalId, Animal> = Object.fromEntries(
  ANIMALS.map((a) => [a.id, a])
) as Record<AnimalId, Animal>

export type SlotShape = "circle" | "triangle" | "square" | "pentagon"

export type SlotLevel = {
  level: 1 | 2 | 3 | 4
  shape: SlotShape
  /** Boar track value required to fill a slot of this level. */
  boarThreshold: number
}

/**
 * The four clearing-slot levels. Boar's track values (2/3/3/4/4/5/5, above)
 * are exactly these four thresholds — everyone can fill Circle slots from the
 * start, only a maxed Boar track reaches Pentagon. The repeated final 5 is
 * the end-game-trigger space; it doesn't unlock a fifth level.
 */
export const SLOT_LEVELS: readonly SlotLevel[] = [
  { level: 1, shape: "circle", boarThreshold: 2 },
  { level: 2, shape: "triangle", boarThreshold: 3 },
  { level: 3, shape: "square", boarThreshold: 4 },
  { level: 4, shape: "pentagon", boarThreshold: 5 }
]

export function shapeForLevel(level: SlotLevel["level"]): SlotShape {
  const slot = SLOT_LEVELS.find((s) => s.level === level)
  if (!slot) throw new Error(`no clearing-slot definition for level ${level}`)
  return slot.shape
}

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

export type ClearingSlotSpec = {
  level: 1 | 2 | 3 | 4
  /** Cost to fill, in animals of type X (whatever type claimed the adjacent path). */
  cost: number
}

export type Clearing = {
  id: ClearingId
  name: string
  /** `grid-area` name in `BoardMap`'s template. */
  area: string
  /**
   * Sample v0 slot layout, 1-3 slots — a first pass for feel, not a balanced
   * design (slot counts/levels per clearing are still an open question).
   */
  slots: readonly ClearingSlotSpec[]
}

export type Path = {
  id: string
  from: ClearingId
  to: ClearingId
  /** Cube spaces on the path. Claiming requires all of them, one type. */
  length: 2 | 3 | 4
  orientation: "h" | "v"
  /** `grid-area` name in `BoardMap`'s template. */
  area: string
}

/**
 * v0 map: a 3x3 lattice — 9 clearings, 12 paths (every adjacent pair).
 * Corner clearings have 2 paths, edges 3, the centre 4, so path pressure
 * rises toward Old Banyan. Lengths run 3x2 / 6x3 / 3x4 — short paths kept
 * deliberately scarce — for 34 spaces against 150 cubes. Length-4 paths are
 * horizontal purely so the board fits a letter sheet.
 */
export const CLEARINGS: readonly Clearing[] = [
  { id: "riverbend", name: "Riverbend", area: "a", slots: [{ level: 1, cost: 2 }] },
  {
    id: "bamboo-grove",
    name: "Bamboo Grove",
    area: "b",
    slots: [{ level: 1, cost: 2 }, { level: 2, cost: 3 }]
  },
  { id: "salt-lick", name: "Salt Lick", area: "c", slots: [{ level: 1, cost: 2 }] },
  {
    id: "fern-hollow",
    name: "Fern Hollow",
    area: "d",
    slots: [{ level: 1, cost: 2 }, { level: 3, cost: 4 }]
  },
  {
    id: "old-banyan",
    name: "Old Banyan",
    area: "e",
    slots: [{ level: 1, cost: 2 }, { level: 2, cost: 3 }, { level: 4, cost: 5 }]
  },
  {
    id: "termite-hill",
    name: "Termite Hill",
    area: "f",
    slots: [{ level: 2, cost: 3 }, { level: 3, cost: 4 }]
  },
  { id: "mangrove-edge", name: "Mangrove Edge", area: "g", slots: [{ level: 1, cost: 2 }] },
  {
    id: "sunning-rocks",
    name: "Sunning Rocks",
    area: "h",
    slots: [{ level: 1, cost: 2 }, { level: 2, cost: 3 }]
  },
  { id: "kapok-crown", name: "Kapok Crown", area: "i", slots: [{ level: 3, cost: 4 }] }
]

export const PATHS: readonly Path[] = [
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

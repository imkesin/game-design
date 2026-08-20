/**
 * Tiger's Path — shared RULES (never forked per player count). Design doc:
 * /src/games/tigers-path/DESIGN.md. The per-count board graphs live in
 * `./boards/` (`2p.ts`, `3p.ts`, …); this file holds only the vocabulary they
 * all draw on — animal ranks, slot levels, and thresholds.
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
   * lower; tigers are never contested, snakes never contest).
   */
  rank: 1 | 2 | 3 | 4 | 5
  /** Cubes of this animal in the Jungle bag at setup. Rarity offsets rank. */
  jungleCount: number
  /** What this animal's engine track governs. */
  power: string
  /** Track values, start position first (8 positions: start + 7 upgrades, the last of which triggers the end game). */
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
 * The four clearing-slot levels. Boar's track values (2/3/3/4/4/5/5/5, above)
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

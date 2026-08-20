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

export type ClearingId =
  | "riverbend"
  | "bamboo-grove"
  | "salt-lick"
  | "misty-hollow"
  | "old-banyan"
  | "termite-hill"
  | "mangrove-edge"
  | "sunning-rocks"
  | "kapok-crown"
  | "hidden-spring"
  | "orchid-glade"
  | "lotus-pool"
  | "heron-reach"
  | "palm-shade"

export type ClearingSlotSpec = {
  level: 1 | 2 | 3 | 4
  /** Cost to fill, in animals of type X (whatever type claimed the adjacent path). */
  cost: number
}

export type Clearing = {
  id: ClearingId
  name: string
  /**
   * Soft region hint for the organic map layout: where this clearing wants to
   * gravitate, as a percentage of the board in each axis — `x`/`y` in 0..100,
   * origin top-left, independent of the sheet's actual size (resize the board
   * and every anchor rescales). `{x:50,y:50}` is dead centre; `{x:100,y:0}` the
   * top-right corner. Because the board isn't square, equal x/y steps aren't
   * equal physical distances — think "percent across, percent down".
   *
   * The generator (`map/layout.ts`) treats it as an anchor, not a fixed
   * position — the final coordinate is solved for spacing and zero crossings,
   * then baked into `map/map.json`. Nudge these to steer regions, not geometry.
   */
  target: { x: number; y: number }
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
  /** Cube spaces on the path = its capacity. Claiming requires all of them, one type. */
  length: 2 | 3 | 4
}

/**
 * v0 map: a 14-clearing planar network — no longer a lattice. Each clearing
 * carries a soft `target` (its home region); the build-time generator relaxes
 * these into a crossing-free, evenly-spaced organic layout and writes the final
 * geometry to `map/map.json`. `hidden-spring`, `heron-reach`, and `palm-shade`
 * are deliberate peninsulas (degree 1) to exercise the layout on dead-ends.
 *
 * Lengths run scarce-short (2) through 4, and path pressure concentrates on
 * Old Banyan and Mangrove Edge.
 */
export const CLEARINGS: readonly Clearing[] = [
  {
    id: "riverbend",
    name: "Riverbend",
    target: { x: 5, y: 30 },
    slots: [
      { level: 1, cost: 3 },
      { level: 3, cost: 4 }
    ]
  },
  {
    id: "bamboo-grove",
    name: "Bamboo Grove",
    target: { x: 54, y: 6 },
    slots: [
      { level: 1, cost: 2 },
      { level: 2, cost: 3 }
    ]
  },
  {
    id: "salt-lick",
    name: "Salt Lick",
    target: { x: 70, y: 25 },
    slots: [
      { level: 1, cost: 3 },
      { level: 2, cost: 4 }
    ]
  },
  {
    id: "misty-hollow",
    name: "Misty Hollow",
    target: { x: 90, y: 5 },
    slots: [{ level: 2, cost: 3 }]
  },
  {
    id: "old-banyan",
    name: "Old Banyan",
    target: { x: 43, y: 49 },
    slots: [
      { level: 2, cost: 2 },
      { level: 3, cost: 2 },
      { level: 4, cost: 3 }
    ]
  },
  {
    id: "mangrove-edge",
    name: "Mangrove Edge",
    target: { x: 65, y: 60 },
    slots: [
      { level: 2, cost: 3 },
      { level: 3, cost: 3 },
      { level: 4, cost: 4 }
    ]
  },
  {
    id: "termite-hill",
    name: "Termite Hill",
    target: { x: 95, y: 45 },
    slots: [
      { level: 1, cost: 2 },
      { level: 3, cost: 3 }
    ]
  },
  {
    id: "sunning-rocks",
    name: "Sunning Rocks",
    target: { x: 90, y: 90 },
    slots: [
      { level: 1, cost: 2 },
      { level: 4, cost: 3 }
    ]
  },
  {
    id: "kapok-crown",
    name: "Kapok Crown",
    target: { x: 55, y: 85 },
    slots: [
      { level: 1, cost: 2 },
      { level: 2, cost: 3 }
    ]
  },
  {
    id: "orchid-glade",
    name: "Orchid Glade",
    target: { x: 10, y: 70 },
    slots: [
      { level: 1, cost: 2 },
      { level: 3, cost: 3 }
    ]
  },
  {
    id: "lotus-pool",
    name: "Lotus Pool",
    target: { x: 30, y: 80 },
    slots: [
      { level: 1, cost: 3 },
      { level: 2, cost: 4 }
    ]
  },
  {
    id: "hidden-spring",
    name: "Hidden Spring",
    target: { x: 0, y: 100 },
    slots: [{ level: 2, cost: 3 }]
  },
  {
    id: "heron-reach",
    name: "Heron Reach",
    target: { x: 0, y: 0 },
    slots: [{ level: 2, cost: 3 }]
  },
  {
    id: "palm-shade",
    name: "Palm Shade",
    target: { x: 48, y: 75 },
    slots: [{ level: 2, cost: 3 }]
  }
]

export const PATHS: readonly Path[] = [
  { id: "riverbend--bamboo-grove", from: "riverbend", to: "bamboo-grove", length: 4 },
  { id: "bamboo-grove--salt-lick", from: "bamboo-grove", to: "salt-lick", length: 3 },
  { id: "salt-lick--misty-hollow", from: "salt-lick", to: "misty-hollow", length: 2 },
  { id: "riverbend--old-banyan", from: "riverbend", to: "old-banyan", length: 3 },
  { id: "bamboo-grove--old-banyan", from: "bamboo-grove", to: "old-banyan", length: 3 },
  { id: "old-banyan--mangrove-edge", from: "old-banyan", to: "mangrove-edge", length: 3 },
  { id: "salt-lick--termite-hill", from: "salt-lick", to: "termite-hill", length: 3 },
  { id: "termite-hill--sunning-rocks", from: "termite-hill", to: "sunning-rocks", length: 3 },
  { id: "mangrove-edge--sunning-rocks", from: "mangrove-edge", to: "sunning-rocks", length: 4 },
  { id: "kapok-crown--mangrove-edge", from: "kapok-crown", to: "mangrove-edge", length: 3 },
  { id: "kapok-crown--sunning-rocks", from: "kapok-crown", to: "sunning-rocks", length: 3 },
  { id: "orchid-glade--old-banyan", from: "orchid-glade", to: "old-banyan", length: 3 },
  { id: "orchid-glade--lotus-pool", from: "orchid-glade", to: "lotus-pool", length: 3 },
  { id: "lotus-pool--kapok-crown", from: "lotus-pool", to: "kapok-crown", length: 4 },
  { id: "lotus-pool--hidden-spring", from: "lotus-pool", to: "hidden-spring", length: 2 },
  { id: "riverbend--heron-reach", from: "riverbend", to: "heron-reach", length: 2 },
  { id: "mangrove-edge--palm-shade", from: "mangrove-edge", to: "palm-shade", length: 2 }
]

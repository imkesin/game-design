/**
 * Regolith's rules data. Plan of record is DESIGN.md; this file encodes what
 * that document has settled and leaves obvious holes where it has not.
 *
 * Two layers. `VALUE` is the yardstick every recipe is written against.
 * `TRACKS` is the board: three tracks of five spaces from the bottom up, with
 * what a worker pays to enter and what it brings home when the level marker
 * passes its space. Nothing here is a standing income — every number is per
 * visit, paid on placement and collected on bump.
 */

/**
 * The six goods a player holds, in chain order. Energy is a good like the
 * others: it sits in supply and is spent as a secondary input to most
 * processes.
 */
export type Good = "energy" | "rock" | "water" | "metal" | "chemical" | "food"

export const GOODS: readonly Good[] = ["energy", "rock", "water", "metal", "chemical", "food"]

/**
 * What a unit of each good is worth, in one abstract currency. Recipes are
 * checked by adding up each side; the rule the set holds to is that every
 * goods space runs positive, and a track's first three tiers ladder
 * +4 / +5 / +6 as they climb. Values are a design tool, not a printed number.
 */
export const VALUE: Record<Good, number> = {
  energy: 1,
  rock: 2,
  water: 3,
  metal: 4,
  chemical: 5,
  food: 6
}

export interface Term {
  good: Good
  qty: number
}

/** A side of a recipe. Empty means "nothing", which is a real cost on a free space. */
export type Terms = readonly Term[]

export function valueOf(terms: Terms): number {
  return terms.reduce((sum, t) => sum + VALUE[t.good] * t.qty, 0)
}

/** Shorthand for writing terms: `t("energy", 2)`. */
function t(good: Good, qty: number): Term {
  return { good, qty }
}

/**
 * What a bumped worker brings home. Goods for tiers I–III (and Chem IV, which
 * pays goods too); a thing you own for the rest. The effect variants carry no
 * data because their targets are chosen at the table — see DESIGN.md,
 * Upgrades. `vp` is what a special building pays out: flat victory points.
 */
export type Outcome =
  | { kind: "goods"; goods: Terms }
  | { kind: "machine" }
  | { kind: "building" }
  | { kind: "battery" }
  | { kind: "worker" }
  | { kind: "lifeSupport" }
  | { kind: "vp"; vp: number }

export interface Space {
  /** Paid in full on placement. */
  cost: Terms
  /** Collected when the level marker passes the space. */
  outcome: Outcome
}

export type TrackId = "P" | "C" | "B"

export interface Track {
  id: TrackId
  name: string
  /** Bottom space (tier I) first; always `TIERS` long. */
  spaces: readonly Space[]
}

/** Every track is this tall, and the level marker climbs this many rounds before it resets. */
export const TIERS = 5

/** How many times the marker climbs I→V before the game ends: 4 cycles is 20 rounds. */
export const CYCLES = 4

/** What each player starts with. Three energy keeps a first round from soft-locking on Water. */
export const START_WORKERS = 2
export const START_GOODS: Terms = [t("energy", 3)]

/**
 * A booster sits on a space and adds `BOOSTER_BONUS` to its yield for every
 * worker bumped from it: one more of the yield good, or a second copy of the
 * thing (two workers from Recruit, two machines from Machine). Its owner
 * enters that space free (no cost at all); everyone else pays the printed
 * cost. No toll. Machines boost tiers I–II, batteries tiers III–IV; one
 * booster slot per space.
 */
export type Booster = "machine" | "battery"
export const BOOSTER_TIERS: Record<Booster, readonly number[]> = { machine: [1, 2], battery: [3, 4] }
export const BOOSTER_BONUS = 1

/**
 * A life support system sits on any space but tier V and gives it a second
 * worker slot, open to anyone. The second worker on the space pays the
 * surcharge to the supply on top of the cost — running two crews is not
 * free. The owner enters that space free, surcharge included. One per space,
 * one booster per space, so a boosted space holds at most two workers.
 */
export const LIFE_SUPPORT_TIERS: readonly number[] = [1, 2, 3, 4]
export const LIFE_SUPPORT_SURCHARGE: Terms = [t("energy", 2)]

/**
 * The five special buildings. Phys V builds one onto the board: the builder
 * picks the building and an empty row of the Buildings column, and the tile
 * goes there at once. It is then a space like any other — anyone places
 * there, pays the recipe, and is bumped with `BUILDING_VP`. Nobody owns a
 * building and nobody enters it free; no booster or life support slots. Each
 * is built at most once, so Phys V is dead after five.
 *
 * Every recipe is goods from two different tracks plus energy, tuned so each
 * VP costs 12 in value. Names are provisional.
 */
export interface Building {
  id: string
  name: string
  cost: Terms
}

export const BUILDING_VP = 1

export const BUILDINGS: readonly Building[] = [
  { id: "B1", name: "Habitat", cost: [t("metal", 1), t("food", 1), t("energy", 2)] },
  { id: "B2", name: "Biolab", cost: [t("chemical", 1), t("food", 1), t("energy", 1)] },
  { id: "B3", name: "Pump Station", cost: [t("metal", 1), t("water", 2), t("energy", 2)] },
  { id: "B4", name: "Foundry", cost: [t("metal", 1), t("chemical", 1), t("energy", 3)] },
  { id: "B5", name: "Greenhouse", cost: [t("food", 1), t("rock", 2), t("energy", 2)] }
]

/** A built building as the space it becomes. */
export function buildingSpace(building: Building): Space {
  return { cost: building.cost, outcome: { kind: "vp", vp: BUILDING_VP } }
}

/**
 * Contributions: the other way to score, and the only thing a player can do
 * on a turn without placing a worker. Four tracks shared by the table, one
 * per storable good, each `CONTRIBUTION_VP.length` steps long. A step is
 * filled by paying its quantity of the track's good to the bank; steps fill
 * from step 1 up whoever pays, and the filler takes that step's VP at once.
 * One contribution per turn, only by a player who places no worker that
 * turn. Rock and water are intermediate goods and cannot be contributed.
 *
 * The board prints each track as a route of stations running left to right on
 * a sheet of its own, so a track's length is free of the level track's.
 */
export interface ContributionTrack {
  good: Good
  /** Quantity of `good` each step takes, step 1 first. */
  steps: readonly number[]
}

export const CONTRIBUTION_VP: readonly number[] = [1, 1, 2, 3, 5]

export const CONTRIBUTIONS: readonly ContributionTrack[] = [
  { good: "energy", steps: [5, 10, 15, 20, 25] },
  { good: "metal", steps: [2, 3, 4, 5, 6] },
  { good: "chemical", steps: [2, 3, 4, 5, 6] },
  { good: "food", steps: [2, 3, 4, 5, 6] }
]

/** Goods value paid per VP at a step (1-based). The yardstick for comparing tracks to buildings. */
export function contributionValuePerVp(track: ContributionTrack, step: number): number {
  return (track.steps[step - 1]! * VALUE[track.good]) / CONTRIBUTION_VP[step - 1]!
}

function goods(cost: Terms, yields: Terms): Space {
  return { cost, outcome: { kind: "goods", goods: yields } }
}

function effect(kind: Exclude<Outcome["kind"], "goods" | "vp">, cost: Terms): Space {
  return { cost, outcome: { kind } }
}

const ROMAN = ["I", "II", "III", "IV", "V"]

/** The printed name of a space: "Physical III". Tiers number from 1 at the bottom. */
export function spaceName(track: Track, tier: number): string {
  return `${track.name} ${ROMAN[tier - 1]}`
}

/** Value a space adds per visit. Undefined for spaces whose outcome is not goods. */
export function netValue(space: Space): number | undefined {
  if (space.outcome.kind !== "goods") return undefined
  return valueOf(space.outcome.goods) - valueOf(space.cost)
}

/** Which booster a space takes, or undefined for tier V. */
export function boosterFor(tier: number): Booster | undefined {
  return (Object.keys(BOOSTER_TIERS) as Booster[]).find((b) => BOOSTER_TIERS[b].includes(tier))
}

/**
 * The board. Three tracks, one per engineering discipline, each five spaces
 * tall and shaped the same way: tiers I–III extract or refine goods and
 * ladder +4 / +5 / +6; tier IV makes a thing you own for about 6 in inputs;
 * tier V builds something for about 10. Chemical IV is the exception: it is
 * the only source of chemicals, pays goods at +8, and the track's thing
 * comes at V.
 *
 * Redesigned 2026-09-11 from eleven silos with per-silo time markers to three
 * tracks under one global level marker: the round is the tick, and rows
 * below the marker are locked until it resets. `netValue` is the check for
 * anything that yields goods.
 */
export const TRACKS: readonly Track[] = [
  {
    id: "P",
    name: "Physical",
    spaces: [
      goods([], [t("rock", 2)]),
      goods([t("energy", 1)], [t("rock", 3)]),
      goods([t("rock", 1)], [t("metal", 2)]),
      effect("machine", [t("metal", 1), t("energy", 2)]),
      effect("building", [t("metal", 1), t("rock", 2), t("energy", 2)])
    ]
  },
  {
    id: "C",
    name: "Chemical",
    spaces: [
      goods([], [t("energy", 4)]),
      goods([], [t("energy", 5)]),
      goods([], [t("energy", 6)]),
      goods([t("rock", 1), t("water", 1), t("energy", 2)], [t("chemical", 3)]),
      effect("battery", [t("rock", 1), t("water", 1), t("chemical", 1)])
    ]
  },
  {
    id: "B",
    name: "Bio",
    spaces: [
      goods([t("energy", 2)], [t("water", 2)]),
      goods([t("energy", 4)], [t("water", 3)]),
      goods([t("water", 2)], [t("food", 2)]),
      effect("worker", [t("food", 1)]),
      effect("lifeSupport", [t("food", 1), t("water", 1), t("energy", 1)])
    ]
  }
]

/**
 * Regolith's rules data. Plan of record is DESIGN.md; this file encodes what
 * that document has settled and nothing it has not.
 *
 * The fourth shape of the game is a map, not a set of tracks, and the map
 * itself is not settled — the path network, the bag composition and the deck
 * composition are all open questions. So what lives here is the small set of
 * numbers the design has actually fixed: the resources and what each is for,
 * the board's skeleton, and the costs that are not up for debate.
 *
 * The three-track board (TRACKS, TIERS, CYCLES, buildings, contributions) was
 * removed on 2026-09-17; it is recoverable at commit `bf9c7da`.
 */

/**
 * The four resources. Each has exactly one job, which is the whole point:
 * there is no conversion, no refining and no value ladder in this shape of
 * the game, so a resource is identified by what it buys.
 */
export type Resource = "energy" | "rock" | "metal" | "chemical"

export const RESOURCES: readonly Resource[] = ["energy", "rock", "metal", "chemical"]

/**
 * Each resource *is* a system, not merely a price. Energy is the distance
 * system and nothing else is: rock, metal and chemicals are flat material
 * costs, and anything that varies with geography is paid in energy. A player
 * short on energy is short on reach, not on options.
 */
export const RESOURCE_SYSTEM: Record<Resource, string> = {
  energy: "Distance",
  rock: "Construction",
  metal: "Fleet",
  chemical: "Discovery"
}

export const RESOURCE_BUYS: Record<Resource, string> = {
  energy: "Every step away from your base, for anything",
  rock: "Links and outposts",
  metal: "New robots",
  chemical: "Opening sites"
}

export interface Term {
  resource: Resource
  qty: number
}

export type Terms = readonly Term[]

/** Shorthand for writing terms: `t("energy", 2)`. */
function t(resource: Resource, qty: number): Term {
  return { resource, qty }
}

// ---------------------------------------------------------------------------
// The board
// ---------------------------------------------------------------------------

/** Zones around the disc, like clock positions. */
export const ZONES = 12

/** Rings from the pole outward. */
export const RINGS = 3

/**
 * The sun lights exactly half the disc: six contiguous zones. This is the one
 * number the whole game hangs off — the terminator is the clock.
 */
export const LIT_ZONES = ZONES / 2

/** One full rotation of the dial is one day. */
export const TICKS_PER_DAY = ZONES

/**
 * Locations on a two-player board. Zones hold 1–3 locations each and the fill
 * is deliberately irregular, so this is a total, not a per-zone figure. The
 * previous shape's scaling note was 12 locations per player; player counts
 * above two are not addressed yet.
 */
export const LOCATIONS_2P = 24

/** Energy to traverse one path, and what a road on it reduces that to. */
export const PATH_COST = 2
export const ROAD_PATH_COST = 1

// ---------------------------------------------------------------------------
// Robots and the base
// ---------------------------------------------------------------------------

export const START_ROBOTS = 2

/**
 * A robot deployed onto its owner's own base or outpost charges instead of
 * digging: it costs nothing (distance 0) and comes home with energy when the
 * shade reaches it. This replaces every form of standing income — energy is
 * earned by committing a robot, like everything else.
 *
 * There is no special case here. A base is a location like any other: it can
 * only be deployed to while it is lit, and it pays out on bump. What makes
 * base siting matter is that you can only charge during your own half of the
 * rotation. Provisional values.
 */
export const BASE_CHARGE = 3
export const OUTPOST_CHARGE = 2

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

/**
 * The four things a card can do — the actions the board cannot represent.
 * Deploying is not among them: it is the other half of the turn, always
 * available, and never gated by the river. That was the whole reason the
 * role-draft shape was abandoned.
 */
export type CardAction = "network" | "survey" | "manufacture" | "energy"

export const CARD_ACTIONS: readonly CardAction[] = ["network", "survey", "manufacture", "energy"]

/** The flat material each use costs, on top of any distance. */
export const CARD_ACTION_MATERIAL: Record<CardAction, Resource | undefined> = {
  network: "rock",
  survey: "chemical",
  manufacture: "metal",
  energy: undefined
}

/**
 * Manufacture happens at your base, which is at distance 0, so its size is a
 * real cap. Every other action may be pushed past its size by paying the
 * extra targets' distance in energy.
 */
export const CARD_ACTION_CAPPED: Record<CardAction, boolean> = {
  network: false,
  survey: false,
  manufacture: true,
  energy: true
}

/** How far the dial turns before a card's action resolves. */
export const TIME_SYMBOL_MIN = 0
export const TIME_SYMBOL_MAX = 2

/** Face-up cards on offer. Small on purpose: too many choices is the failure mode. */
export const RIVER_SIZE = 3

export interface Card {
  action: CardAction
  /** Ticks the dial turns before the action resolves. */
  time: number
  /**
   * How many uses the card grants **spatially free** — not a cap, except on a
   * capped action. Beyond it, each further use costs its material plus that
   * target's distance in energy.
   */
  size: number
}

/**
 * The same grammar on the deploy half of the turn: the first robot placed is
 * free wherever it goes, and every robot after it pays its distance. Energy
 * buys the *size* of a turn, so a broke player takes token turns and a rich
 * one takes decisive ones, and nobody ever has a dead turn.
 *
 * Watch this one: deploying does not move the clock, so drip-feeding one free
 * robot a turn may simply be correct. See DESIGN.md, Design Tensions.
 */
export const FREE_PLACEMENTS_PER_TURN = 1

/** What each player starts with. Enough to open a couple of sites and reach them. */
export const START_SUPPLY: Terms = [t("energy", 4), t("chemical", 2)]

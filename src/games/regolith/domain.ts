/**
 * Regolith's rules data. Plan of record is DESIGN.md; this file encodes what
 * that document has settled and leaves obvious holes where it has not.
 *
 * Two layers. `VALUE` is the yardstick every recipe is written against. `SILOS`
 * is the board: each silo's zones from the bottom up, with what a worker pays
 * to enter, what it brings home when bumped, and how many ticks of the time
 * marker it sits through. Nothing here is a standing income — every number is
 * per visit, paid on placement and collected on bump.
 */

/**
 * The six goods a player holds, in chain order. Energy is a good like the
 * others here (unlike the previous design, where it was a separate currency):
 * it sits in supply and is spent as a secondary input to most processes.
 */
export type Good = "energy" | "rock" | "water" | "metal" | "chemical" | "food"

export const GOODS: readonly Good[] = ["energy", "rock", "water", "metal", "chemical", "food"]

/**
 * What a unit of each good is worth, in one abstract currency. Recipes are
 * checked by adding up each side; the rule the set holds to is that every
 * zone runs positive, and a silo's zones ladder +4 / +6 / +8 / +10 as they
 * climb. Values are a design tool, not a printed number.
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

/** A side of a recipe. Empty means "nothing", which is a real cost on the bottom zone of a free silo. */
export type Terms = readonly Term[]

export function valueOf(terms: Terms): number {
  return terms.reduce((sum, t) => sum + VALUE[t.good] * t.qty, 0)
}

/** Shorthand for writing terms: `t("energy", 2)`. */
function t(good: Good, qty: number): Term {
  return { good, qty }
}

/**
 * What a bumped worker brings home. Goods for the extraction and refining
 * silos; a board effect for the upgrade silos. The effect variants carry no
 * data because their targets are chosen at the table — see DESIGN.md, Upgrades.
 */
export type Outcome =
  | { kind: "goods"; goods: Terms }
  | { kind: "annex" }
  | { kind: "worker" }
  | { kind: "machinery" }
  | { kind: "polymers" }
  | { kind: "specialist" }
  | { kind: "special" }

export interface Zone {
  /** Paid in full on placement. */
  cost: Terms
  /**
   * Paying with time, where the zone offers it: the worker pays one less of
   * every good in `cost` (see `reducedCost`) and puts this many time tokens
   * in the zone's box. While the marker sits at that zone, an advance removes
   * a token instead of moving it, so the zone takes `ticks + timeTicks`
   * advances to clear. Workers below resolve at normal speed; every worker
   * above waits too. Only the D and E silos offer it — raw and refining zones
   * have one price.
   *
   * A specialist takes the same reduction on the same zones and places no
   * token. Reductions never stack: at 1 the zone is reduced once, by a token
   * or by a specialist. (At 2, a specialist would cover one and a token the
   * other; no zone prints 2 yet.)
   */
  timeTicks?: number
  /** Collected when the marker passes the zone. */
  outcome: Outcome
  /**
   * How many marker ticks the zone spans. A worker is bumped when the marker
   * exits the zone upward, so a 2-tick zone waits twice as long as a 1-tick one.
   */
  ticks: number
}

/** Which permanent upgrade a silo's zones accept. Machinery goes on B zones, polymers on C zones; nothing else takes either. */
export type Upgrade = "machinery" | "polymers"

export interface Silo {
  id: string
  name: string
  /** Bottom zone first. Shorter than `maxZones` while the silo is still being designed. */
  zones: readonly Zone[]
  /** How tall the silo is. Every zone is open from setup; nothing on the board is gated. */
  maxZones: number
  /** Every zone in this silo prints `UPGRADE_SLOTS_PER_ZONE` slots for this upgrade. Absent: none. */
  upgrade?: Upgrade
}

function goods(cost: Terms, yields: Terms, ticks = 1): Zone {
  return { cost, outcome: { kind: "goods", goods: yields }, ticks }
}

function effect(kind: Exclude<Outcome["kind"], "goods">, cost: Terms, ticks: number, timeTicks?: number): Zone {
  return timeTicks === undefined ? { cost, outcome: { kind }, ticks } : { cost, timeTicks, outcome: { kind }, ticks }
}

/**
 * The reduced price on a zone that offers one: one less of every good in the
 * zone's cost. A good at 1 drops out entirely — which is why Construction and
 * Specialist carry a single metal and a single food: reduced, they need
 * neither. Paid by a worker with a time token, or by a specialist for free.
 * Undefined for a zone that does not offer it.
 */
export function reducedCost(zone: Zone): Terms | undefined {
  if (zone.timeTicks === undefined) return undefined
  return zone.cost.flatMap((x) => (x.qty > 1 ? [{ good: x.good, qty: x.qty - 1 }] : []))
}

const ROMAN = ["I", "II", "III", "IV", "V"]

/** The printed name of a zone: "Water III". Zones number from 1 at the bottom. */
export function zoneName(silo: Silo, zone: number): string {
  return `${silo.name} ${ROMAN[zone - 1]}`
}

/** Value a zone adds per visit at its full price. Undefined for zones whose outcome is not goods. */
export function netValue(zone: Zone): number | undefined {
  if (zone.outcome.kind !== "goods") return undefined
  return valueOf(zone.outcome.goods) - valueOf(zone.cost)
}

/**
 * Annexes: every zone has room for extra worker slots beside it, built via
 * Construction (E1) from the bottom of a silo up. This many are printed on
 * the board, which is the 2–3 player count; 4 players wants two per zone and
 * a second square. A worker in an annex pays, waits and yields exactly as in
 * the base slot; anyone but the annex's owner also pays `ANNEX_RENT` to the
 * owner on placement.
 */
export const ANNEXES_PER_ZONE = 1
export const ANNEX_RENT: Terms = [t("energy", 1)]

/**
 * Machinery and polymer markers sit in printed slots on the zone they claim:
 * this many per zone, so at most this many players can upgrade one zone.
 * Only the B silos take machinery and only the C silos take polymers.
 */
export const UPGRADE_SLOTS_PER_ZONE = 2

/**
 * The advance that carries a marker past its top zone resets the silo for
 * everyone; the player who ticks it takes this from the supply.
 */
export const RESET_BONUS: Terms = [t("energy", 1)]

/**
 * The board. Zone counts fall as the chain deepens: raw goods have deep silos
 * where crowding is cheap to enter and slow to leave; the upgrade silos hold
 * one worker each and turn over fast.
 *
 * Retuned after the first playtest (2026-09-08), which took forty minutes to
 * reach one machine apiece: every silo lost its top zone, every cover tile
 * went, and the ladder steepened to +4 / +6 / +8 / +10. Higher is now strictly
 * better in every silo; placement is forced into the lowest open zone, so the
 * later a worker arrives the better its deal and the longer its wait. Rock is
 * the one free silo all the way up. Chemical consumes energy like everything
 * else (it no longer emits any), and Energy's top zone runs on water rather
 * than refined goods.
 *
 * Second pass (2026-09-09): the five D/E silos with a recipe (D makes a thing
 * you own — machine, polymer, worker; E builds or trains) are one zone each, 2 ticks and payable with time (see `timeTicks`), and every price was
 * roughly halved. Construction and Specialist put their refined input at 1 so
 * the reduced price drops it. Their 2-tick duration is a draft, not a decision.
 *
 * Special Projects lists its shape and no zones. `netValue` is the check for
 * anything that yields goods.
 */
export const SILOS: readonly Silo[] = [
  {
    id: "A",
    name: "Energy",
    maxZones: 4,
    zones: [
      goods([], [t("energy", 4)]),
      goods([], [t("energy", 6)]),
      goods([t("water", 1)], [t("energy", 11)]),
      goods([t("water", 2)], [t("energy", 16)])
    ]
  },
  {
    id: "B1",
    name: "Rock",
    maxZones: 3,
    upgrade: "machinery",
    zones: [
      goods([], [t("rock", 2)]),
      goods([], [t("rock", 3)]),
      goods([], [t("rock", 4)])
    ]
  },
  {
    id: "B2",
    name: "Water",
    maxZones: 3,
    upgrade: "machinery",
    zones: [
      goods([t("energy", 2)], [t("water", 2)]),
      goods([t("energy", 3)], [t("water", 3)]),
      goods([t("energy", 4)], [t("water", 4)])
    ]
  },
  {
    id: "C1",
    name: "Metal",
    maxZones: 2,
    upgrade: "polymers",
    zones: [
      goods([t("rock", 1), t("energy", 2)], [t("metal", 2)]),
      goods([t("rock", 2), t("energy", 2)], [t("metal", 3)])
    ]
  },
  {
    id: "C2",
    name: "Chemical",
    maxZones: 2,
    upgrade: "polymers",
    zones: [
      goods([t("water", 1), t("rock", 1), t("energy", 1)], [t("chemical", 2)]),
      goods([t("water", 1), t("rock", 1), t("energy", 4)], [t("chemical", 3)])
    ]
  },
  {
    id: "C3",
    name: "Food",
    maxZones: 2,
    upgrade: "polymers",
    zones: [
      goods([t("water", 2), t("energy", 2)], [t("food", 2)]),
      goods([t("water", 3), t("energy", 3)], [t("food", 3)])
    ]
  },
  {
    id: "D1",
    name: "Machinery",
    maxZones: 1,
    zones: [
      effect("machinery", [t("metal", 2), t("energy", 2)], 2, 1)
    ]
  },
  {
    id: "D2",
    name: "Polymers",
    maxZones: 1,
    zones: [
      effect("polymers", [t("chemical", 2), t("energy", 2)], 2, 1)
    ]
  },
  {
    id: "D3",
    name: "Recruit",
    maxZones: 1,
    zones: [
      effect("worker", [t("food", 2), t("energy", 2)], 2, 1)
    ]
  },
  {
    id: "E1",
    name: "Construction",
    maxZones: 1,
    zones: [
      effect("annex", [t("rock", 2), t("metal", 1), t("energy", 3)], 2, 1)
    ]
  },
  {
    id: "E2",
    name: "Specialist",
    maxZones: 1,
    zones: [
      effect("specialist", [t("water", 2), t("food", 1), t("energy", 3)], 2, 1)
    ]
  },
  { id: "F1", name: "Special Projects", maxZones: 1, zones: [] }
]

/** The tallest silo; the board sheet sizes its rows from this. */
export const MAX_ZONES = Math.max(...SILOS.map((s) => s.maxZones))

/**
 * A turn is two atoms on two different silos. Listed so the player aid and any
 * future simulator read the same three shapes.
 */
export const TURNS = [
  { id: "A", atoms: ["place", "place"] },
  { id: "B", atoms: ["place", "advance"] },
  { id: "C", atoms: ["advance", "advance"] }
] as const

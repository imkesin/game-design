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
 * zone runs positive, and a silo's zones ladder +2 / +3 / +4 / +5 (+6 for the
 * five-zone Energy silo) as they climb. Values are a design tool, not a printed number.
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
 * data yet because their rules are still open — see DESIGN.md, Upgrades.
 */
export type Outcome =
  | { kind: "goods"; goods: Terms }
  | { kind: "construct" }
  | { kind: "worker" }
  | { kind: "machinery" }
  | { kind: "polymers" }
  | { kind: "upgraded-worker" }
  | { kind: "special" }

/**
 * The cover tile over a zone that is hidden at setup. Construction (D1)
 * removes it: the builder pays the D1 zone's price, claims this cover, and on
 * bump the zone is revealed for everyone and the builder scores `vp`.
 *
 * `vp` is open until tuned; the tile still exists (and prints) with it
 * undefined. Per-structure build costs may come later and would live here.
 */
export interface Cover {
  vp?: number
}

/**
 * Paying with time: a cheaper way into a zone that costs extra ticks of the
 * marker instead of goods. On placement the worker puts `extraTicks` time
 * tokens in the zone's box. While the marker sits at that zone, an advance
 * removes a token instead of moving it, so the zone takes `ticks + tokens`
 * advances to clear. Workers below resolve at normal speed; every worker
 * above waits too. Only appears from the D silos on — the raw and refining
 * silos have one price.
 */
export interface TimeOption {
  cost: Terms
  extraTicks: number
}

export interface Zone {
  /** Paid in full on placement. */
  cost: Terms
  /** The slow, cheap alternative to `cost`, where the zone offers one. */
  timeOption?: TimeOption
  /** Collected when the marker passes the zone. */
  outcome: Outcome
  /**
   * How many marker ticks the zone spans. A worker is bumped when the marker
   * exits the zone upward, so a 2-tick zone waits twice as long as a 1-tick one.
   */
  ticks: number
  /**
   * Present when the zone starts covered. Which zones those are is a property
   * of the silo (`startZones`), so this is authored on exactly the zones above
   * that line — `covers` checks the two agree.
   */
  cover?: Cover
}

export interface Silo {
  id: string
  name: string
  /** Bottom zone first. Shorter than `maxZones` while the silo is still being designed. */
  zones: readonly Zone[]
  /** How tall the silo is once every cover tile is removed. */
  maxZones: number
  /**
   * How many zones are uncovered at setup. Undefined while untuned; the rest
   * are revealed bottom-up by Construction.
   */
  startZones?: number
}

function goods(cost: Terms, yields: Terms, ticks = 1): Zone {
  return { cost, outcome: { kind: "goods", goods: yields }, ticks }
}

function effect(kind: Exclude<Outcome["kind"], "goods">, cost: Terms, ticks: number, timeOption?: TimeOption): Zone {
  return timeOption ? { cost, timeOption, outcome: { kind }, ticks } : { cost, outcome: { kind }, ticks }
}

function covered(zone: Zone, cover: Cover = {}): Zone {
  return { ...zone, cover }
}

const ROMAN = ["I", "II", "III", "IV", "V"]

/** The printed name of a zone: "Water III". Zones number from 1 at the bottom. */
export function zoneName(silo: Silo, zone: number): string {
  return `${silo.name} ${ROMAN[zone - 1]}`
}

/**
 * Every cover tile in the game, one per zone above a silo's start line. Throws
 * if a silo's authored covers disagree with its `startZones`, since a cover
 * with no zone or a hidden zone with no cover would each print wrong.
 */
export function covers(): readonly { silo: Silo; zone: number; name: string; cover: Cover }[] {
  return SILOS.flatMap((silo) => {
    if (silo.startZones === undefined) return []
    return silo.zones.flatMap((z, i) => {
      const n = i + 1
      const hidden = n > silo.startZones!
      if (hidden !== (z.cover !== undefined)) {
        throw new Error(`${zoneName(silo, n)}: ${hidden ? "hidden zone has no cover" : "open zone has a cover"}`)
      }
      return z.cover ? [{ silo, zone: n, name: zoneName(silo, n), cover: z.cover }] : []
    })
  })
}

/** Value a zone adds per visit at its full price. Undefined for zones whose outcome is not goods. */
export function netValue(zone: Zone): number | undefined {
  if (zone.outcome.kind !== "goods") return undefined
  return valueOf(zone.outcome.goods) - valueOf(zone.cost)
}

/**
 * The board. Zone counts fall as the chain deepens: raw goods have deep silos
 * where crowding is cheap to enter and slow to leave; the upgrade silos hold
 * one or two workers and turn over fast.
 *
 * The raw silos (A, B) and the refining silos (C) are tuned. Rock and Water
 * open with two zones, Energy with three — the third energy zone is needed
 * too early to gate behind Construction — and each C silo opens with one.
 * Everything above is a cover tile that Construction removes. The four D/E
 * silos with a recipe each open with one zone, every one of them 2 ticks and
 * priced two ways (see `TimeOption`); their 2-tick duration is a draft, not a
 * decision. Energy is the one silo that ladders to +6, being a zone taller. Chemical is the one silo
 * with two outputs: the reaction gives off energy, which is what makes it
 * reachable without an energy stockpile, where Metal eats energy by the
 * handful. Note Rock/Water zone 3 beats zone 2 — cheaper in,
 * same out. Placement is forced into the lowest open zone, so nobody chooses
 * zone 3; the third worker in earns the best deal and the longest wait.
 *
 * Everything else lists its shape and no zones. Add zones as DESIGN.md
 * settles them; `netValue` is the check.
 */
export const SILOS: readonly Silo[] = [
  {
    id: "A",
    name: "Energy",
    maxZones: 5,
    startZones: 3,
    zones: [
      goods([], [t("energy", 2)]),
      goods([], [t("energy", 3)]),
      goods([t("water", 1)], [t("energy", 7)]),
      covered(goods([t("water", 2)], [t("energy", 11)])),
      covered(goods([t("chemical", 1), t("metal", 1)], [t("energy", 15)]))
    ]
  },
  {
    id: "B1",
    name: "Rock",
    maxZones: 4,
    startZones: 2,
    zones: [
      goods([], [t("rock", 1)]),
      goods([t("energy", 1)], [t("rock", 2)]),
      covered(goods([], [t("rock", 2)])),
      covered(goods([t("energy", 1)], [t("rock", 3)]))
    ]
  },
  {
    id: "B2",
    name: "Water",
    maxZones: 4,
    startZones: 2,
    zones: [
      goods([t("energy", 1)], [t("water", 1)]),
      goods([t("energy", 3)], [t("water", 2)]),
      covered(goods([t("energy", 2)], [t("water", 2)])),
      covered(goods([t("energy", 4)], [t("water", 3)]))
    ]
  },
  {
    id: "C1",
    name: "Metal",
    maxZones: 3,
    startZones: 1,
    zones: [
      goods([t("rock", 1), t("energy", 4)], [t("metal", 2)]),
      covered(goods([t("rock", 2), t("energy", 5)], [t("metal", 3)])),
      covered(goods([t("rock", 3), t("energy", 6)], [t("metal", 4)]))
    ]
  },
  {
    id: "C2",
    name: "Chemical",
    maxZones: 3,
    startZones: 1,
    zones: [
      goods([t("rock", 1), t("water", 1)], [t("chemical", 1), t("energy", 2)]),
      covered(goods([t("rock", 2), t("water", 2)], [t("chemical", 2), t("energy", 3)])),
      covered(goods([t("rock", 3), t("water", 3)], [t("chemical", 3), t("energy", 4)]))
    ]
  },
  {
    id: "C3",
    name: "Food",
    maxZones: 3,
    startZones: 1,
    zones: [
      goods([t("water", 3), t("energy", 1)], [t("food", 2)]),
      covered(goods([t("water", 4), t("energy", 3)], [t("food", 3)])),
      covered(goods([t("water", 5), t("energy", 5)], [t("food", 4)]))
    ]
  },
  {
    id: "D1",
    name: "Construction",
    maxZones: 2,
    startZones: 1,
    zones: [
      effect(
        "construct",
        [t("metal", 2), t("rock", 2), t("energy", 2)],
        2,
        {
          cost: [t("metal", 1), t("rock", 1), t("energy", 1)],
          extraTicks: 1
        }
      )
    ]
  },
  {
    id: "D2",
    name: "Recruit",
    maxZones: 2,
    startZones: 1,
    zones: [
      effect("worker", [t("food", 3), t("water", 3), t("energy", 3)], 2, {
        cost: [t("food", 2), t("water", 2), t("energy", 2)],
        extraTicks: 1
      })
    ]
  },
  {
    id: "E1",
    name: "Machinery",
    maxZones: 2,
    startZones: 1,
    zones: [
      effect("machinery", [t("metal", 3), t("energy", 3)], 2, { cost: [t("metal", 2), t("energy", 2)], extraTicks: 1 })
    ]
  },
  {
    id: "E2",
    name: "Polymers",
    maxZones: 2,
    startZones: 1,
    zones: [
      effect("polymers", [t("chemical", 3), t("energy", 3)], 2, {
        cost: [t("chemical", 2), t("energy", 2)],
        extraTicks: 1
      })
    ]
  },
  { id: "E3", name: "Upgraded Worker", maxZones: 2, zones: [] },
  { id: "F1", name: "Special Projects", maxZones: 1, zones: [] }
]

/**
 * A turn is two atoms on two different silos. Listed so the player aid and any
 * future simulator read the same three shapes.
 */
export const TURNS = [
  { id: "A", atoms: ["place", "place"] },
  { id: "B", atoms: ["place", "advance"] },
  { id: "C", atoms: ["advance", "advance"] }
] as const

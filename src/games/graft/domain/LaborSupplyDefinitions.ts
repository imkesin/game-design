import type { PlayerCount } from "./CoreDefinitions"

/**
 * One cost tier on the Labor Market: a group of interchangeable workers, all
 * hired for the same `gold` price. The board is printed once (the superset of
 * every player count), so each entry in `slots` is one physical octagon and
 * its value is the *minimum* player count at which that slot is in play. Slots
 * whose threshold exceeds the smallest supported count are badged ("3+"/"4+")
 * rather than printed on a separate board.
 *
 * Supply must be monotonic: the live worker count at any tier only grows (or
 * holds) as players are added — otherwise a single printed board can't
 * represent it. Author each `slots` array cheapest-threshold first.
 */
export type LaborSupplyTier = {
  readonly gold: number
  readonly slots: readonly PlayerCount[]
}

export type LaborSupplyDefinition = {
  /** Worker cost tiers, cheapest first. One printed board for all player counts. */
  readonly workerTrack: readonly LaborSupplyTier[]
}

/**
 * Placeholder worker cost escalation, grouped into cost tiers: cheapest tier
 * first, most expensive last. Each tier's `slots` array is one printed octagon
 * per entry, and the entry's value is the minimum player count at which that
 * slot is live (so `3` renders a "3+" badge, `4` a "4+" badge). Supply is
 * monotonic — more players only ever unlock more workers. Hand-edit thresholds
 * directly, or add/remove slots/tiers.
 */
export const laborSupply: LaborSupplyDefinition = {
  workerTrack: [
    { gold: 1, slots: [2, 2, 3, 4, 5] },
    { gold: 2, slots: [2, 2, 2, 2, 3, 4, 5] },
    { gold: 3, slots: [2, 2, 2, 3, 4, 5] }
  ]
}

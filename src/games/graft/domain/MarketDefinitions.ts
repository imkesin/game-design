import {
  FRUIT_LIST_WITH_METADATA,
  type FruitColor,
  type FruitName,
  type PlayerCount
} from "~/games/graft/domain/CoreDefinitions"

/**
 * One column on a fruit's demand track: a price/demand level (`gold` paid,
 * `inducedDemand` induced elsewhere on sale — exact mechanic TBD) shared by a
 * stack of interchangeable crate slots. The board is printed once (the superset
 * of every player count), so each entry in `slots` is one physical crate slot,
 * vertically stacked within the column, and its value is the *minimum* player
 * count at which that crate is in play. Crates above the smallest supported
 * count are badged ("3+"/"4+") rather than printed on a separate board.
 *
 * Supply must be monotonic: a column's live crate count only grows (or holds)
 * as players are added. Author each `slots` array cheapest-threshold first (the
 * base crate leads), so the base sits at the bottom of the printed stack.
 */
export type DemandColumn = {
  readonly gold: number
  readonly inducedDemand: number
  readonly slots: readonly PlayerCount[]
}

export type MarketStallDefinition = {
  readonly fruit: FruitName
  readonly color: FruitColor
  /** Demand columns, highest gold first. One printed board for all player counts. */
  readonly demandColumns: readonly DemandColumn[]
  /** Other fruits whose demand this one induces when sold — shown as text on the stall rather than as a board-wide arrow diagram. */
  readonly induces: readonly FruitName[]
}

const FRUIT_NAMES = FRUIT_LIST_WITH_METADATA.map((f) => f.name)

/**
 * Placeholder induced-demand relationships: each fruit induces the next three
 * fruits in the list, wrapping around. Real relationships TBD.
 */
function placeholderInduces(index: number): readonly FruitName[] {
  return [1, 2, 4].map((offset) => FRUIT_NAMES[(index + offset) % FRUIT_NAMES.length]!)
}

/**
 * Placeholder demand columns, shared by every fruit until real per-fruit
 * numbers are set. Authored as plain literals: hand-edit values directly, add
 * a threshold to a column's `slots` to unlock a stacked crate at more players,
 * or add/remove columns. To customize one fruit, replace its `demandColumns`
 * in `marketStalls` below instead of editing this shared one.
 *
 * `gold: 0` or `inducedDemand: 0` on a column renders that row blank (see the
 * last column below for an example). Depths here happen to stay within 2 crates
 * per column, but the stall renders however many a column lists.
 */
const placeholderDemandColumns = [
  { gold: 4, inducedDemand: 0, slots: [2, 5] },
  { gold: 3, inducedDemand: 0, slots: [2, 4] },
  { gold: 2, inducedDemand: 1, slots: [2, 3] },
  { gold: 1, inducedDemand: 1, slots: [2] },
  { gold: 0, inducedDemand: 1, slots: [2] }
] as const satisfies readonly DemandColumn[]

export const marketStalls: readonly MarketStallDefinition[] = FRUIT_LIST_WITH_METADATA.map((
  { name, color },
  index
) => ({
  fruit: name,
  color,
  demandColumns: placeholderDemandColumns,
  induces: placeholderInduces(index)
}))

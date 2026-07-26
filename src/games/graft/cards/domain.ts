import type { FruitName } from "~/games/graft/domain/CoreDefinitions"
import type { Copies, PlayerCount } from "~/shared/cards/playerCount"

/** Resource cost to play a card. Both required; 0 = none of that resource. */
export type Cost = {
  readonly workers: number
  readonly gold: number
}

/**
 * One harvest row on a Field, unlocked in order. `capacity` is the Harvest
 * Capacity that row demands; `amount` is the INCREMENTAL fruit it yields. A
 * medium field
 *   [{ capacity: 1, amount: 1 }, { capacity: 2, amount: 2 }]
 * yields 1 fruit at capacity 1 and 3 total at capacity 2; a small field is a
 * single row.
 */
export type HarvestRow = {
  readonly capacity: number
  readonly amount: number
}

/** Intrinsic data shared by a card's definition and its physical copies. */
export type FieldCardBase = {
  readonly kind: "field"
  readonly id: string
  readonly name: string
  readonly cost: Cost
  readonly fruit: FruitName
  readonly rows: readonly HarvestRow[]
}

export type FieldImprovementCardBase = {
  readonly kind: "field-improvement"
  readonly id: string
  readonly name: string
  readonly cost: Cost
  readonly additionalText: string
}

export type CardBase =
  | FieldCardBase
  | FieldImprovementCardBase

/**
 * A catalog entry: a card's intrinsic data plus how many copies the printed deck
 * holds at each player count. This is the authored source (see `deck.ts`).
 */
export type CardDefinition = CardBase & { readonly copies: Copies }

export type Deck = readonly CardDefinition[]

/**
 * A single physical card produced by expanding the catalog. `minPlayerCount` is
 * the player-count symbol it bears — the smallest player count at which this
 * copy is included. A definition with copies {2:1,3:1,4:2} expands to one "2"
 * card plus, at four players, an extra "4" card. Carries no `copies`.
 */
export type Card = CardBase & { readonly minPlayerCount: PlayerCount }

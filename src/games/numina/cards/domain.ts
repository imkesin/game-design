import type { PowerName } from "~/games/numina/domain/CoreDefinitions"
import type { Copies, PlayerCount } from "~/shared/cards/playerCount"

/**
 * Action cards carry no rules text and no cost. Each Action recurs often enough
 * that players learn it, so the face is just the name at display size over an
 * open art area. `art` is the eventual illustration; until one exists the area is
 * left blank on the printed card.
 */
export type ActionCardBase = {
  readonly kind: "action"
  readonly id: string
  readonly name: string
  /** Which Power this Action belongs to — drives the card's whole palette. */
  readonly power: PowerName
  readonly art?: string
}

/**
 * Disaster: its own kind rather than a sixth Power, so nothing that consumes a
 * `PowerName` can ever be handed one.
 */
export type DisasterCardBase = {
  readonly kind: "disaster"
  readonly id: string
  readonly name: string
  readonly art?: string
}

export type CardBase =
  | ActionCardBase
  | DisasterCardBase

/**
 * A catalog entry: a card's intrinsic data plus how many copies the printed deck
 * holds at each player count. This is the authored source (see `actionDeck.ts`).
 */
export type CardDefinition = CardBase & { readonly copies: Copies }

export type Deck = readonly CardDefinition[]

/**
 * A single physical card produced by expanding the catalog. `minPlayerCount` is
 * the player-count symbol it bears — the smallest player count at which this
 * copy is included. Carries no `copies`.
 */
export type Card = CardBase & { readonly minPlayerCount: PlayerCount }

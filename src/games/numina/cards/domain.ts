import type { PowerName } from "~/games/numina/domain/CoreDefinitions"
import type { Copies, PlayerCount } from "~/shared/cards/playerCount"

/**
 * Action cards carry no rules text and no cost. Each Action recurs often enough
 * that players learn it, so the face is just the name at display size over an
 * open art area. `art` is inline SVG source rather than a URL — the Card inlines it
 * so the mark can take the card's own tint (see assets/cardArt) — and until a file
 * exists the area is left blank on the printed card.
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
 * A standing power a player trades an assembled set of Actions for. Intentionally
 * the same card as the Action of its Power — same size, same palette, same name at
 * display size over open art — and set apart by exactly one cue: a thick dark rail
 * inside the trim (see components/Card). Hue could not have done that job; the deck
 * already spends all five Power scales plus Disaster's red.
 *
 * A permanent belongs to a Power and inherits its palette, so consolidating a set
 * into a standing form reads as the same colour becoming permanent. To make
 * permanents Power-agnostic instead, drop `power` and give the kind its own scale
 * the way `DISASTER` does.
 *
 * Permanents print on the deck's sheet but never enter the deck itself, so claiming
 * one cannot disturb its per-Power ratio.
 */
export type PermanentCardBase = {
  readonly kind: "permanent"
  readonly id: string
  readonly name: string
  /** Which Power this permanent is the standing form of — drives its palette. */
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
  | PermanentCardBase
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

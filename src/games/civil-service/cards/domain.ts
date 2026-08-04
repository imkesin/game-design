import type { OfficerSuitId } from "~/games/civil-service/domain/CoreDefinitions"
import type { Copies, PlayerCount } from "~/shared/cards/playerCount"

/**
 * An Officer card. Every one of the 36 is individually authored — unlike the old
 * Action deck, there is no shared per-suit text — so `power` is this specific
 * card's own rules text, not a lookup keyed by suit. `suit` only drives the
 * card's palette. `art` is inline SVG source rather than a URL — the Card inlines
 * it so the mark can take the card's own tint (see assets/cardArt) — and until a
 * file exists the area is left blank on the printed card.
 */
export type OfficerCardBase = {
  readonly kind: "officer"
  readonly id: string
  /** The card's own epithet (e.g. "Charismatic") — not the suit. Rendered in
   * bold leading `power`; the card's header shows the suit itself instead. */
  readonly name: string
  /** Which suit this Officer belongs to — drives the card's whole palette. */
  readonly suit: OfficerSuitId
  readonly power: string
  readonly art?: string
}

/**
 * A Legacy card. No suits: all 36 are individually authored and share one
 * uniform palette (see `LEGACY_PALETTE`), so `condition` is this specific card's
 * own rules text.
 */
export type LegacyCardBase = {
  readonly kind: "legacy"
  readonly id: string
  readonly name: string
  readonly condition: string
  readonly art?: string
}

export type CardBase =
  | OfficerCardBase
  | LegacyCardBase

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

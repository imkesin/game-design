import { artProps } from "~/games/civil-service/assets/cardArt"
import { flatCopies } from "~/shared/cards/playerCount"
import type { CardDefinition, Deck } from "./domain"

/** Fixed regardless of player count: the printed deck is always 36 Legacies,
 * even at 2 players. */
const LEGACY_COUNT = 36

/**
 * Every Legacy is individually authored — 36 unique cards, each with its own
 * name and condition text. Placeholder content until the real 36 are dictated;
 * one card's `name`/`condition` is a single-field edit apiece.
 *
 * Art is keyed by the card's own id, unlike Officers: Legacies have no suit to
 * share an icon across.
 */
export const legacyDeck: Deck = Array.from({ length: LEGACY_COUNT }, (_, i) => {
  const n = i + 1
  const id = `legacy-${n}`
  return {
    kind: "legacy",
    id,
    name: `Legacy ${n}`,
    condition: "Condition text goes here.",
    copies: flatCopies(1),
    ...artProps(id)
  }
}) satisfies ReadonlyArray<CardDefinition>

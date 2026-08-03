import { artProps } from "~/games/civil-service/assets/cardArt"
import { OFFICER_SUITS_WITH_METADATA, type OfficerSuitId } from "~/games/civil-service/domain/CoreDefinitions"
import { assertCopyTotals, type Copies, flatCopies } from "~/shared/cards/playerCount"
import type { CardDefinition, Deck } from "./domain"

/** Cards per suit. Fixed regardless of player count: the printed deck is always
 * 36 Officers, 9 per suit, even at 2 players. */
const CARDS_PER_SUIT = 9

const SUIT_TOTALS: Record<OfficerSuitId, Copies> = Object.fromEntries(
  OFFICER_SUITS_WITH_METADATA.map(({ id }) => [id, flatCopies(CARDS_PER_SUIT)])
) as Record<OfficerSuitId, Copies>

assertCopyTotals(
  "officerDeck",
  SUIT_TOTALS,
  flatCopies(CARDS_PER_SUIT * OFFICER_SUITS_WITH_METADATA.length)
)

/**
 * Every Officer is individually authored — 9 unique cards per suit, each with
 * its own name and power text. Placeholder content until the real 36 are
 * dictated; one card's `name`/`power` is a single-field edit apiece.
 *
 * Art is keyed by the suit id rather than the card id, so the 9 cards in a suit
 * share one icon — the same reuse the old Action/permanent pairing had.
 */
export const officerDeck: Deck = OFFICER_SUITS_WITH_METADATA.flatMap(({ id, name }) =>
  Array.from({ length: CARDS_PER_SUIT }, (_, i) => {
    const rank = i + 1
    return {
      kind: "officer",
      id: `${id}-${rank}`,
      name: `${name} ${rank}`,
      suit: id,
      power: "Power text goes here.",
      copies: flatCopies(1),
      ...artProps(id)
    }
  })
) satisfies ReadonlyArray<CardDefinition>

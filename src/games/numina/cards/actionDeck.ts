import { artProps } from "~/games/numina/assets/cardArt"
import { DISASTER, POWER_LIST_WITH_METADATA, type PowerName } from "~/games/numina/domain/CoreDefinitions"
import { assertCopyTotals, type Copies, flatCopies, perCount } from "~/shared/cards/playerCount"
import type { CardDefinition, Deck } from "./domain"

/**
 * Regular (non-Disaster) cards in the printed deck. The deck grows sub-linearly
 * with the table: every extra player adds fewer cards than the last, so a larger
 * game runs shorter per head and the deck still cycles.
 */
const ACTION_TOTALS = perCount(18, 24, 28, 30)

/**
 * Copies of each Action per player count. Guidance and Impulse run richer than
 * the three set-building Powers and hold that lead as the deck grows, so the
 * per-Power ratio a player learns at two holds at five.
 */
const ACTION_COPIES: Record<PowerName, Copies> = {
  Abundance: perCount(3, 4, 4, 5),
  Ingenuity: perCount(3, 4, 5, 5),
  Devotion: perCount(3, 4, 5, 5),
  Guidance: perCount(5, 7, 8, 8),
  Impulse: perCount(4, 5, 6, 7)
}

assertCopyTotals("actionDeck", ACTION_COPIES, ACTION_TOTALS)

/** Exactly one Action per Power for now, so the card's name is the Power's name. */
const actions = POWER_LIST_WITH_METADATA.map(({ name }) => ({
  kind: "action",
  id: name.toLowerCase(),
  name,
  power: name,
  copies: ACTION_COPIES[name],
  ...artProps(name)
})) satisfies ReadonlyArray<CardDefinition>

export const actionDeck: Deck = [
  ...actions,
  {
    kind: "disaster",
    id: "disaster",
    name: DISASTER.name,
    // Fixed at 1 regardless of player count.
    copies: flatCopies(1),
    ...artProps(DISASTER.name)
  }
]

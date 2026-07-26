import { DISASTER, POWER_LIST_WITH_METADATA, type PowerName } from "~/games/numina/domain/CoreDefinitions"
import { flatCopies } from "~/shared/cards/playerCount"
import type { CardDefinition, Deck } from "./domain"

/**
 * Copies of each Action in the deck.
 *
 * Authored at 2 players and held flat across 3-5 (`flatCopies`) — the per-count
 * columns exist and print correctly, they just aren't tuned yet. To scale a Power
 * with the table, swap its `flatCopies(n)` for an explicit `{ 2: …, 3: …, 4: …,
 * 5: … }` table; `expandDeck` stamps each added copy with the count at which it
 * enters.
 *
 * Guidance and Impulse run nearly twice as thick as the other three, so the deck
 * is 26 cards: 4+4+4+7+7 Actions plus the 2 Disasters (a ~7.7% Disaster density).
 */
const ACTION_COPIES: Record<PowerName, number> = {
  Abundance: 4,
  Ingenuity: 4,
  Devotion: 4,
  Guidance: 7,
  Impulse: 7
}

/** Exactly one Action per Power for now, so the card's name is the Power's name. */
const actions = POWER_LIST_WITH_METADATA.map(({ name }) => ({
  kind: "action",
  id: name.toLowerCase(),
  name,
  power: name,
  copies: flatCopies(ACTION_COPIES[name])
})) satisfies ReadonlyArray<CardDefinition>

export const actionDeck: Deck = [
  ...actions,
  {
    kind: "disaster",
    id: "disaster",
    name: DISASTER.name,
    // Fixed at 2 regardless of player count.
    copies: flatCopies(2)
  }
]

import { PLAYER_COUNTS, type PlayerCount } from "~/games/graft/domain/CoreDefinitions"
import type { Card, Deck } from "./domain"

/**
 * Expand the catalog into the physical deck for `players`: one entry per printed
 * copy. A card whose copy count grows with player count is split so each copy
 * carries the player-count symbol at which it enters (`minPlayers`) — copies
 * {2:1,3:1,4:2} yield one "2" copy and one "4" copy. Copies whose symbol exceeds
 * `players` are filtered out, so the result holds exactly `copies[players]` of
 * each card.
 */

export function expandDeck(source: Deck, players: PlayerCount): readonly Card[] {
  return source.flatMap(({ copies, ...base }) =>
    PLAYER_COUNTS.reduce<{ previous: number; cards: Card[] }>(
      ({ previous, cards }, minPlayerCount) => {
        const introduced = copies[minPlayerCount] - previous

        if (minPlayerCount <= players && introduced > 0) {
          cards.push(...Array.from({ length: introduced }, () => ({ ...base, minPlayerCount })))
        }
        return { previous: copies[minPlayerCount], cards }
      },
      {
        previous: 0,
        cards: []
      }
    ).cards
  )
}

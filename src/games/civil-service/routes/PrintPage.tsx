import { useState } from "react"
import { legacyDeck } from "~/games/civil-service/cards/legacyDeck"
import { officerDeck } from "~/games/civil-service/cards/officerDeck"
import { Card } from "~/games/civil-service/components/Card"
import { expandDeck } from "~/shared/cards/deckUtils"
import type { PlayerCount } from "~/shared/cards/playerCount"
import { PlayerCountSelect } from "~/shared/components/PlayerCountSelect"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/**
 * Civil Service's print-and-play sheet: the Officer deck followed by the Legacy deck.
 * Both are fixed at 36 cards regardless of player count, so the player-count control
 * has nothing left to vary here — it's kept for parity with `expandDeck`/`Card`,
 * which every game shares.
 *
 * Legacies come last rather than interleaved so they land contiguously — the two
 * decks are cut from the same pages but sorted into separate piles, and grouping
 * them makes that sort trivial.
 */
export function PrintPage() {
  const [players, setPlayers] = useState<PlayerCount>(5)
  const cards = [
    ...expandDeck(officerDeck, players),
    ...expandDeck(legacyDeck, players)
  ]
  return (
    <CardSheetPage
      cards={cards}
      renderCard={(card, key) => <Card key={key} variant="trim" card={card} />}
      controls={<PlayerCountSelect value={players} onChange={setPlayers} />}
    />
  )
}

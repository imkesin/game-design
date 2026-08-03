import { useState } from "react"
import { actionDeck } from "~/games/civil-service/cards/actionDeck"
import { permanentSupply } from "~/games/civil-service/cards/permanentSupply"
import { Card } from "~/games/civil-service/components/Card"
import { expandDeck } from "~/shared/cards/deckUtils"
import type { PlayerCount } from "~/shared/cards/playerCount"
import { PlayerCountSelect } from "~/shared/components/PlayerCountSelect"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/**
 * Civil Service's print-and-play sheet: the action deck followed by the permanent supply,
 * both at the chosen player count. One sheet for the whole game.
 *
 * The permanents come last rather than interleaved so they land contiguously — they
 * are cut from the same pages but sorted into their own pile, and grouping them
 * makes that sort trivial. Sharing the sheet costs the deck nothing: permanents
 * never enter it, so its per-Power ratio is unaffected by them.
 */
export function PrintPage() {
  const [players, setPlayers] = useState<PlayerCount>(5)
  const cards = [
    ...expandDeck(actionDeck, players),
    ...expandDeck(permanentSupply, players)
  ]
  return (
    <CardSheetPage
      cards={cards}
      renderCard={(card, key) => <Card key={key} variant="trim" card={card} />}
      controls={<PlayerCountSelect value={players} onChange={setPlayers} />}
    />
  )
}

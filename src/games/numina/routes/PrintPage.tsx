import { useState } from "react"
import { actionDeck } from "~/games/numina/cards/actionDeck"
import { Card } from "~/games/numina/components/Card"
import { expandDeck } from "~/shared/cards/deckUtils"
import type { PlayerCount } from "~/shared/cards/playerCount"
import { PlayerCountSelect } from "~/shared/components/PlayerCountSelect"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/** Numina's print-and-play sheet: the action deck at the chosen player count. */
export function PrintPage() {
  const [players, setPlayers] = useState<PlayerCount>(5)
  return (
    <CardSheetPage
      cards={expandDeck(actionDeck, players)}
      renderCard={(card, key) => <Card key={key} variant="trim" card={card} />}
      controls={<PlayerCountSelect value={players} onChange={setPlayers} />}
    />
  )
}

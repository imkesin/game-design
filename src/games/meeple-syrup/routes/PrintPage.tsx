import { animalDeck } from "~/games/meeple-syrup/cards/animalDeck"
import type { AnimalCard as AnimalCardData, ResourceCard as ResourceCardData } from "~/games/meeple-syrup/cards/domain"
import { expandFlatDeck } from "~/games/meeple-syrup/cards/domain"
import { resourceDeck } from "~/games/meeple-syrup/cards/resourceDeck"
import { AnimalCard } from "~/games/meeple-syrup/components/AnimalCard"
import { ResourceCard } from "~/games/meeple-syrup/components/ResourceCard"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/**
 * Meeple Syrup's print-and-play sheet: both decks in one run, animals first.
 * They share a trim size, so printing them as two runs would only waste the
 * tail page of the first. Each card's `kind` picks its component;
 * `CardSheetPage` owns page geometry and knows nothing about either.
 *
 * The trade-track board is a separate physical component (see
 * `TradeTrackBoard`) and prints from `/print/board`, not here.
 */

type PrintableCard = AnimalCardData | ResourceCardData

export function PrintPage() {
  const cards: readonly PrintableCard[] = [
    ...expandFlatDeck(animalDeck),
    ...expandFlatDeck(resourceDeck)
  ]

  return (
    <CardSheetPage
      cards={cards}
      renderCard={(card, key) =>
        card.kind === "animal"
          ? <AnimalCard key={key} variant="trim" card={card} />
          : <ResourceCard key={key} variant="trim" card={card} />}
    />
  )
}

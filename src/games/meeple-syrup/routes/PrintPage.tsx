import { animalDeck } from "~/games/meeple-syrup/cards/animalDeck"
import type { AnimalCard as AnimalCardData, ForageCard } from "~/games/meeple-syrup/cards/domain"
import { expandFlatDeck } from "~/games/meeple-syrup/cards/domain"
import { forageBag } from "~/games/meeple-syrup/cards/forageBag"
import { AnimalCard } from "~/games/meeple-syrup/components/AnimalCard"
import { PineconeCard } from "~/games/meeple-syrup/components/PineconeCard"
import { ResourceCard } from "~/games/meeple-syrup/components/ResourceCard"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/**
 * Meeple Syrup's print-and-play sheet: the animal deck and the forage bag in
 * one run, animals first. They share a trim size, so printing them as two runs
 * would only waste the tail page of the first. Each card's `kind` picks its
 * component; `CardSheetPage` owns page geometry and knows nothing about any of
 * them.
 *
 * The blanks print last, which is also where they belong physically — they are
 * the cards that go into the bag and never come out of it.
 *
 * The trade-track board is a separate physical component (see
 * `TradeTrackBoard`) and prints from `/print/board`, not here.
 */

type PrintableCard = AnimalCardData | ForageCard

function renderCard(card: PrintableCard, key: string) {
  switch (card.kind) {
    case "animal":
      return <AnimalCard key={key} variant="trim" card={card} />
    case "resource":
      return <ResourceCard key={key} variant="trim" card={card} />
    case "blank":
      return <PineconeCard key={key} variant="trim" />
  }
}

export function PrintPage() {
  const cards: readonly PrintableCard[] = [
    ...expandFlatDeck(animalDeck),
    ...expandFlatDeck(forageBag)
  ]

  return <CardSheetPage cards={cards} renderCard={renderCard} />
}

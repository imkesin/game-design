import { expandFlatDeck } from "~/games/romantasy/cards/domain"
import { protagonistDeck } from "~/games/romantasy/cards/protagonistDeck"
import { traitDeck } from "~/games/romantasy/cards/traitDeck"
import { ProtagonistCard } from "~/games/romantasy/components/ProtagonistCard"
import { TraitCard } from "~/games/romantasy/components/TraitCard"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/**
 * Romantasy's print-and-play sheet: the 90-card trait deck, then the 30
 * protagonists. They are separate piles cut from the same pages, so the
 * protagonists come last and land contiguously.
 */
export function PrintPage() {
  const cards = [
    ...expandFlatDeck(traitDeck),
    ...protagonistDeck
  ]
  return (
    <CardSheetPage
      cards={cards}
      renderCard={(card, key) =>
        card.kind === "trait"
          ? <TraitCard key={key} variant="trim" card={card} />
          : <ProtagonistCard key={key} variant="trim" card={card} />}
    />
  )
}

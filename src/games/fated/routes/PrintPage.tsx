import { protagonistDeck } from "~/games/fated/cards/protagonistDeck"
import { sceneDeck } from "~/games/fated/cards/sceneDeck"
import { traitDeck } from "~/games/fated/cards/traitDeck"
import { ProtagonistCard } from "~/games/fated/components/ProtagonistCard"
import { SceneCard } from "~/games/fated/components/SceneCard"
import { TraitCard } from "~/games/fated/components/TraitCard"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/**
 * Fated's print-and-play sheet: the 90-card trait deck, the 30
 * protagonists, then the 30 scenes. They are separate piles cut from the same
 * pages, so each pile is contiguous.
 */
export function PrintPage() {
  const cards = [
    ...traitDeck,
    ...protagonistDeck,
    ...sceneDeck
  ]
  return (
    <CardSheetPage
      cards={cards}
      renderCard={(card, key) => {
        switch (card.kind) {
          case "trait":
            return <TraitCard key={key} variant="trim" card={card} />
          case "protagonist":
            return <ProtagonistCard key={key} variant="trim" card={card} />
          case "scene":
            return <SceneCard key={key} variant="trim" card={card} />
        }
      }}
    />
  )
}

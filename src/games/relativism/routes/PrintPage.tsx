import { expandFlatDeck } from "~/games/relativism/cards/domain"
import { statementDeck } from "~/games/relativism/cards/statementDeck"
import { voteDeck } from "~/games/relativism/cards/voteDeck"
import { StatementCard } from "~/games/relativism/components/StatementCard"
import { VoteCard } from "~/games/relativism/components/VoteCard"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/**
 * Relativism's print-and-play sheet: the statement deck followed by the Yes/No
 * ballots. Ballots come last so they land contiguously on their own pages —
 * both decks are cut from the same pages but sorted into separate piles, and
 * grouping them makes that sort trivial.
 */
export function PrintPage() {
  const cards = [
    ...expandFlatDeck(statementDeck),
    ...expandFlatDeck(voteDeck)
  ]
  return (
    <CardSheetPage
      cards={cards}
      renderCard={(card, key) =>
        card.kind === "statement"
          ? <StatementCard key={key} variant="trim" card={card} />
          : <VoteCard key={key} variant="trim" card={card} />}
    />
  )
}

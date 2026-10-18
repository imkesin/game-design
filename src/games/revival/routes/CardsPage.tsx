import { AgendaCardFace } from "~/games/revival/agenda/AgendaCardFace"
import { BLIGHT_CARDS } from "~/games/revival/setup/blightCards"
import { HISTORICAL_CARDS } from "~/games/revival/setup/historicalCards"
import type { SetupCard } from "~/games/revival/setup/setupCard"
import { SetupCardFace } from "~/games/revival/setup/SetupCardFace"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/**
 * Every card, on Letter sheets at poker trim: the 8 blight and 8 historical
 * setup cards, then the 16 agenda cards, one per neighborhood.
 */

type Card = { kind: "setup"; card: SetupCard } | { kind: "agenda"; row: number; col: number }

const CARDS: readonly Card[] = [
  ...[...BLIGHT_CARDS, ...HISTORICAL_CARDS].map((card) => ({ kind: "setup" as const, card })),
  ...Array.from({ length: 16 }, (_, i) => ({ kind: "agenda" as const, row: Math.floor(i / 4), col: i % 4 }))
]

export function CardsPage() {
  return (
    <CardSheetPage
      cards={CARDS}
      renderCard={(card, key) =>
        card.kind === "setup"
          ? <SetupCardFace key={key} card={card.card} />
          : <AgendaCardFace key={key} row={card.row} col={card.col} />}
    />
  )
}

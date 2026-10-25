import { AgendaCardFace } from "~/games/revival/agenda/AgendaCardFace"
import { CITY } from "~/games/revival/blocks/city"
import type { SetupCard } from "~/games/revival/setup/setupCard"
import { SetupCardFace } from "~/games/revival/setup/SetupCardFace"
import { SETUP_CARDS } from "~/games/revival/setup/setupCards"
import { CardSheetPage } from "~/shared/print/CardSheetPage"

/**
 * Every card, on Letter sheets at poker trim: the 8 setup cards, then the 24
 * agenda cards, one per intersection but City Hall.
 */

/** Streets each way, as on the board. */
const STREETS = CITY.cols.flat().length - 1

type Card = { kind: "setup"; card: SetupCard } | { kind: "agenda"; row: number; col: number }

const CARDS: readonly Card[] = [
  ...SETUP_CARDS.map((card) => ({ kind: "setup" as const, card })),
  ...Array.from({ length: STREETS ** 2 }, (_, i) => ({ col: i % STREETS, row: Math.floor(i / STREETS) }))
    .filter(({ col, row }) => col !== CITY.hall.col || row !== CITY.hall.row)
    .map((at) => ({ kind: "agenda" as const, ...at }))
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

import { SaleCard } from "~/games/revival/reference/SaleCard"
import { type CardGrid, CardSheetPage } from "~/shared/print/CardSheetPage"
import { AID_TRIM_H_MM, AID_TRIM_W_MM } from "~/shared/print/cardSize"

/** Player aids on Letter sheets at 6×4in, 1 × 2: a sale card for each of up to 5 players. */

const AID: CardGrid = { width: AID_TRIM_W_MM, height: AID_TRIM_H_MM, cols: 1, rows: 2 }

const CARDS = Array.from({ length: 5 }, (_, i) => i)

export function ReferencePage() {
  return <CardSheetPage cards={CARDS} grid={AID} renderCard={(_, key) => <SaleCard key={key} />} />
}

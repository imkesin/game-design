import type { Game } from "~/shared/game"
import { MapPage } from "./routes/MapPage"
import { MapPrintPage } from "./routes/MapPrintPage"
import { PreviewPage } from "./routes/PreviewPage"
import { PrintPage } from "./routes/PrintPage"
import { ReferencePage } from "./routes/ReferencePage"
import { NUMINA_THEME_ID } from "./theme"

export const numina: Game = {
  id: NUMINA_THEME_ID,
  name: "Numina",
  routes: {
    "/": PreviewPage,
    "/map": MapPage,
    "/print/map": MapPrintPage,
    "/print/cards": PrintPage,
    "/print/reference": ReferencePage
  }
}

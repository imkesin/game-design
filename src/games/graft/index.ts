import type { Game } from "~/shared/game"
import { BoardPrintPage } from "./routes/BoardPrintPage"
import { FocusReferencePage } from "./routes/FocusReferencePage"
import { PreviewPage } from "./routes/PreviewPage"
import { PrintPage } from "./routes/PrintPage"
import { GRAFT_THEME_ID } from "./theme"

export const graft: Game = {
  id: GRAFT_THEME_ID,
  name: "Graft",
  routes: {
    "/": PreviewPage,
    "/print/cards": PrintPage,
    "/print/board": BoardPrintPage,
    "/print/reference": FocusReferencePage
  }
}

import type { Game } from "~/shared/game"
import { AidPrintPage } from "./routes/AidPrintPage"
import { BoardPrintPage } from "./routes/BoardPrintPage"
import { PreviewPage } from "./routes/PreviewPage"
import { REGOLITH_THEME_ID } from "./theme"

export const regolith: Game = {
  id: REGOLITH_THEME_ID,
  name: "Regolith",
  routes: {
    "/": PreviewPage,
    "/print/board": BoardPrintPage,
    "/print/aid": AidPrintPage
  }
}

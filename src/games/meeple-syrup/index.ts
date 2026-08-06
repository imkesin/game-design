import type { Game } from "~/shared/game"
import { BoardPrintPage } from "./routes/BoardPrintPage"
import { PreviewPage } from "./routes/PreviewPage"
import { PrintPage } from "./routes/PrintPage"
import { MEEPLE_SYRUP_THEME_ID } from "./theme"

export const meepleSyrup: Game = {
  id: MEEPLE_SYRUP_THEME_ID,
  name: "Meeple Syrup",
  routes: {
    "/": PreviewPage,
    "/print/cards": PrintPage,
    "/print/board": BoardPrintPage
  }
}

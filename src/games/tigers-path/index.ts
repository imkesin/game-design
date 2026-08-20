import type { Game } from "~/shared/game"
import { AidPrintPage } from "./routes/AidPrintPage"
import { BoardPrintPage, BoardPrintSolo, BoardPrintSplit } from "./routes/BoardPrintPage"
import { PowersPrintPage } from "./routes/PowersPrintPage"
import { PreviewPage } from "./routes/PreviewPage"
import { TIGERS_PATH_THEME_ID } from "./theme"

export const tigersPath: Game = {
  id: TIGERS_PATH_THEME_ID,
  name: "Tiger's Path",
  routes: {
    "/": PreviewPage,
    "/print/board": BoardPrintPage,
    "/print/board/2p-split": BoardPrintSplit,
    "/print/board/2p-solo": BoardPrintSolo,
    "/print/powers": PowersPrintPage,
    "/print/aid": AidPrintPage
  }
}

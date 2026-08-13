import type { Game } from "~/shared/game"
import { AidPrintPage } from "./routes/AidPrintPage"
import { BoardPrintPage } from "./routes/BoardPrintPage"
import { PowersPrintPage } from "./routes/PowersPrintPage"
import { PreviewPage } from "./routes/PreviewPage"
import { TIGERS_PATH_THEME_ID } from "./theme"

export const tigersPath: Game = {
  id: TIGERS_PATH_THEME_ID,
  name: "Tiger's Path",
  routes: {
    "/": PreviewPage,
    "/print/board": BoardPrintPage,
    "/print/powers": PowersPrintPage,
    "/print/aid": AidPrintPage
  }
}

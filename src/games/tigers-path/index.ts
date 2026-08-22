import type { Game } from "~/shared/game"
import { AidPrintPage } from "./routes/AidPrintPage"
import {
  BoardPrintPage,
  BoardPrintSheet1,
  BoardPrintSolo,
  BoardPrintSplit,
  BoardPrintSplit3
} from "./routes/BoardPrintPage"
import { BoardTemplate3P } from "./routes/BoardTemplatePage"
import { PowersPrintPage } from "./routes/PowersPrintPage"
import { PreviewPage } from "./routes/PreviewPage"
import { TIGERS_PATH_THEME_ID } from "./theme"

export const tigersPath: Game = {
  id: TIGERS_PATH_THEME_ID,
  name: "Tiger's Path",
  routes: {
    "/": PreviewPage,
    "/print/board": BoardPrintPage,
    "/print/board/sheet1": BoardPrintSheet1,
    "/print/board/2p-split": BoardPrintSplit,
    "/print/board/3p-split": BoardPrintSplit3,
    "/print/board/2p-solo": BoardPrintSolo,
    "/print/board/3p-template": BoardTemplate3P,
    "/print/powers": PowersPrintPage,
    "/print/aid": AidPrintPage
  }
}

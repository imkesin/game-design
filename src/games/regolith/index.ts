import type { Game } from "~/shared/game"
import { PreviewPage } from "./routes/PreviewPage"
import { TileSheetPrintPage } from "./routes/TileSheetPrintPage"
import { REGOLITH_THEME_ID } from "./theme"

export const regolith: Game = {
  id: REGOLITH_THEME_ID,
  name: "Regolith",
  routes: {
    "/": PreviewPage,
    "/print/tiles": TileSheetPrintPage
  }
}

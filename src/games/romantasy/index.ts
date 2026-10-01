import type { Game } from "~/shared/game"
import { PreviewPage } from "./routes/PreviewPage"
import { PrintPage } from "./routes/PrintPage"
import { ROMANTASY_THEME_ID } from "./theme"

export const romantasy: Game = {
  id: ROMANTASY_THEME_ID,
  name: "Romantasy",
  routes: {
    "/": PreviewPage,
    "/print/cards": PrintPage
  }
}

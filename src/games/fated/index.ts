import type { Game } from "~/shared/game"
import { PreviewPage } from "./routes/PreviewPage"
import { PrintPage } from "./routes/PrintPage"
import { FATED_THEME_ID } from "./theme"

export const fated: Game = {
  id: FATED_THEME_ID,
  name: "Fated",
  routes: {
    "/": PreviewPage,
    "/print/cards": PrintPage
  }
}

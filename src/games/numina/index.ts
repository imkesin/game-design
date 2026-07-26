import type { Game } from "~/shared/game"
import { PreviewPage } from "./routes/PreviewPage"
import { PrintPage } from "./routes/PrintPage"
import { NUMINA_THEME_ID } from "./theme"

export const numina: Game = {
  id: NUMINA_THEME_ID,
  name: "Numina",
  routes: {
    "/": PreviewPage,
    "/print/cards": PrintPage
  }
}

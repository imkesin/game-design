import type { Game } from "~/shared/game"
import { PreviewPage } from "./routes/PreviewPage"
import { PrintPage } from "./routes/PrintPage"
import { RELATIVISM_THEME_ID } from "./theme"

export const relativism: Game = {
  id: RELATIVISM_THEME_ID,
  name: "Relativism",
  routes: {
    "/": PreviewPage,
    "/print/cards": PrintPage
  }
}

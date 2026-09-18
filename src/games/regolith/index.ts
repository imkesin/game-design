import type { Game } from "~/shared/game"
import { PreviewPage } from "./routes/PreviewPage"
import { REGOLITH_THEME_ID } from "./theme"

/**
 * No print routes yet. The three-track board and player aid were removed with
 * the fourth redesign (recoverable at `bf9c7da`); the map sheet, the card
 * faces and the new aid all wait on the open questions in DESIGN.md.
 */
export const regolith: Game = {
  id: REGOLITH_THEME_ID,
  name: "Regolith",
  routes: {
    "/": PreviewPage
  }
}

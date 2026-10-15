import type { Game } from "~/shared/game"
import { BlocksPage } from "./routes/BlocksPage"
import { REVIVAL_THEME_ID } from "./theme"

/** The city map: a matrix of rectangular blocks, printed on Letter tiles. */
export const revival: Game = {
  id: REVIVAL_THEME_ID,
  name: "Revival",
  routes: {
    "/": BlocksPage
  }
}

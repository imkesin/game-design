import type { Game } from "~/shared/game"
import { MapPage } from "./routes/MapPage"
import { PrintPage } from "./routes/PrintPage"
import { FIBER_THEME_ID } from "./theme"

/** The map at true size, and `/print`: the board as 8 US Letter tiles for a home-printed test board. */
export const fiber: Game = {
  id: FIBER_THEME_ID,
  name: "Fiber",
  routes: {
    "/": MapPage,
    "/print": PrintPage
  }
}

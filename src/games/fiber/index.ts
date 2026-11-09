import type { Game } from "~/shared/game"
import { MapPage } from "./routes/MapPage"
import { FIBER_THEME_ID } from "./theme"

/** A 5-node test map at true size. No print routes yet: the full map and the costs are open. */
export const fiber: Game = {
  id: FIBER_THEME_ID,
  name: "Fiber",
  routes: {
    "/": MapPage
  }
}

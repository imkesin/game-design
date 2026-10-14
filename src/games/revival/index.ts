import type { Game } from "~/shared/game"
import { SkylinePage } from "./routes/SkylinePage"
import { REVIVAL_THEME_ID } from "./theme"

/** The skyline map editor: neighborhoods joined by links, printed on Letter tiles. */
export const revival: Game = {
  id: REVIVAL_THEME_ID,
  name: "Revival",
  routes: {
    "/": SkylinePage
  }
}

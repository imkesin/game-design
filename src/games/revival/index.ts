import type { Game } from "~/shared/game"
import { CityPage } from "./routes/CityPage"
import { PrefabsPage } from "./routes/PrefabsPage"
import { REVIVAL_THEME_ID } from "./theme"

/** The city editor, and the catalogue of prefab neighborhoods it places. */
export const revival: Game = {
  id: REVIVAL_THEME_ID,
  name: "Revival",
  routes: {
    "/": CityPage,
    "/prefabs": PrefabsPage
  }
}

import type { Game } from "~/shared/game"
import { CityPage } from "./routes/CityPage"
import { PrefabsPage } from "./routes/PrefabsPage"
import { SkylinePage } from "./routes/SkylinePage"
import { REVIVAL_THEME_ID } from "./theme"

/** The city editor, the catalogue of prefab neighborhoods it places, and the trial skyline map. */
export const revival: Game = {
  id: REVIVAL_THEME_ID,
  name: "Revival",
  routes: {
    "/": CityPage,
    "/prefabs": PrefabsPage,
    "/skyline": SkylinePage
  }
}

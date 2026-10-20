import type { Game } from "~/shared/game"
import { BlocksPage } from "./routes/BlocksPage"
import { CardsPage } from "./routes/CardsPage"
import { MatsPage } from "./routes/MatsPage"
import { PalettePage } from "./routes/PalettePage"
import { ReferencePage } from "./routes/ReferencePage"
import { RulesPage } from "./routes/RulesPage"
import { TilesPage } from "./routes/TilesPage"
import { REVIVAL_THEME_ID } from "./theme"

/** The city map (a 4×4 matrix of ring neighborhoods), every card, the player mat, the sale reference card, the rules sheet, the tile sticker sheets, and the palette. */
export const revival: Game = {
  id: REVIVAL_THEME_ID,
  name: "Revival",
  routes: {
    "/": BlocksPage,
    "/cards": CardsPage,
    "/mats": MatsPage,
    "/palette": PalettePage,
    "/reference": ReferencePage,
    "/rules": RulesPage,
    "/tiles": TilesPage
  }
}

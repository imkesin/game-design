import type { Game } from "~/shared/game"
import { MapPage } from "./routes/MapPage"
import { MapPrintPage } from "./routes/MapPrintPage"
import { PreviewPage } from "./routes/PreviewPage"
import { PrintPage } from "./routes/PrintPage"
import { ReferencePage } from "./routes/ReferencePage"
import { CIVIL_SERVICE_THEME_ID } from "./theme"

export const civilService: Game = {
  id: CIVIL_SERVICE_THEME_ID,
  name: "Civil Service",
  routes: {
    "/": PreviewPage,
    "/map": MapPage,
    "/print/map": MapPrintPage,
    "/print/cards": PrintPage,
    "/print/reference": ReferencePage
  }
}

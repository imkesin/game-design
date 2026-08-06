import type { Game } from "~/shared/game"
import { civilService } from "./civil-service"
import { graft } from "./graft"
import { meepleSyrup } from "./meeple-syrup"
import { relativism } from "./relativism"

/** Registry of all games. Add a game module here to mount it at `/<id>/…`. */
export const games: Record<string, Game> = {
  [graft.id]: graft,
  [civilService.id]: civilService,
  [relativism.id]: relativism,
  [meepleSyrup.id]: meepleSyrup
}

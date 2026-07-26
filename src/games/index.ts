import type { Game } from "~/shared/game"
import { graft } from "./graft"
import { numina } from "./numina"

/** Registry of all games. Add a game module here to mount it at `/<id>/…`. */
export const games: Record<string, Game> = {
  [graft.id]: graft,
  [numina.id]: numina
}

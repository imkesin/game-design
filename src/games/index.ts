import type { Game } from "~/shared/game"
import { graft } from "./graft"

/** Registry of all games. Add a game module here to mount it at `/<id>/…`. */
export const games: Record<string, Game> = {
  [graft.id]: graft
}

/** Game served when the path has no (or an unknown) game segment. */
export const DEFAULT_GAME = graft.id

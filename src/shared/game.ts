import type { ComponentType } from "react"

/**
 * A game's route table: a target path (relative to `/<id>`) mapped to the page
 * component that renders it. `"/"` is the default/interactive target; the
 * `/print/*` targets are the print-and-play sheets.
 */
export type GameRoutes = Record<string, ComponentType>

/** A self-contained game module: an id (also its theme key) and its routes. */
export type Game = {
  id: string
  routes: GameRoutes
}

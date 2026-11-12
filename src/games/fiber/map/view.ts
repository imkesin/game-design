import { useMemo } from "react"
import { layoutMap } from "./layout"
import { exitNode, EXITS, isExitNode, LAYOUT_SPEC } from "./map"
import { regionShapes } from "./regions"

/** A layout solved once and everything drawn from it: shared by the map page and the print tiles. */
export function useSolvedMap(seed: number) {
  const map = useMemo(() => layoutMap(LAYOUT_SPEC, seed), [seed])
  const regions = useMemo(() => regionShapes(map.nodes), [map])
  const links = map.edges.filter((e) => !isExitNode(e.b))
  const exits = EXITS.map((x) => ({ exit: x, edge: map.edges.find((e) => e.b === exitNode(x))! }))
  return { map, regions, links, exits }
}

export type SolvedView = ReturnType<typeof useSolvedMap>

/** Screen aids and sample pieces; print turns them all off. */
export type MapLayers = { sample: boolean; grid: boolean; guides: boolean; template: boolean; players: 2 | 3 }

export const PRINT_LAYERS: MapLayers = { sample: false, grid: false, guides: false, template: false, players: 3 }

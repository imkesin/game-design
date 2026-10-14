import type { Pt } from "../../../shared/map/geometry.ts"

export type Cell = {
  index: number
  centroid: Pt
  area: number
}

export type Mesh = {
  cells: Cell[]
  /** Cell index -> indices of cells sharing an edge with it. */
  neighbors: Map<number, Set<number>>
  /** Edge key -> the segment and the one or two cells owning it. */
  edges: Map<string, { segment: [Pt, Pt]; cells: number[] }>
}

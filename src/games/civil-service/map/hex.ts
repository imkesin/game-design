import { edgeKey, type Mesh, polygonCentroid, type Pt, ringArea, ringSegments } from "./geometry.ts"

/**
 * Flat-top hex grid: the map's substrate. Unlike the old Voronoi mesh, adjacency
 * here is analytic — two hexes are neighbors purely by construction, so nothing
 * needs to be solved. This module builds the tiling and hands back a `Mesh` in
 * the exact shape `assemble()`/`labelFor()` (in generate.ts) already expect, so
 * both are reused unchanged.
 */

/** Flat-to-flat height of one hex, in inches. Rows are spaced exactly this far apart. */
export const HEX_HEIGHT_IN = 1

export type Axial = { q: number; r: number }
export type OffsetCoord = { col: number; row: number }

/** Odd-q offset <-> axial (redblobgames conventions), for general adjacency math. */
export const offsetToAxial = ({ col, row }: OffsetCoord): Axial => ({ q: col, r: row - (col - (col & 1)) / 2 })
export const axialToOffset = ({ q, r }: Axial): OffsetCoord => ({ col: q, row: r + (q - (q & 1)) / 2 })

export const AXIAL_DIRECTIONS: readonly Axial[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 }
]
export const axialNeighbors = (a: Axial): Axial[] => AXIAL_DIRECTIONS.map((d) => ({ q: a.q + d.q, r: a.r + d.r }))
export const axialKey = (a: Axial) => `${a.q},${a.r}`

export type HexTile = {
  index: number
  col: number
  row: number
  center: Pt
  /** Six corners, flat-top orientation (angles 0/60/.../300deg), in order. */
  corners: Pt[]
}

/** Flat-top corners of a hex of circumradius `s` centered at `(cx, cy)`. */
function hexCorners(cx: number, cy: number, s: number): Pt[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i)
    return [cx + s * Math.cos(angle), cy + s * Math.sin(angle)] as Pt
  })
}

/**
 * Tiles a `width` x `height` canvas with flat-top hexes 1in tall, bin-packed
 * edge to edge. Rows land on whole inches by construction (`height` is exactly
 * `rows * rowSpacing`). No polygon is clipped here: the SVG viewBox crops
 * whatever pokes outside `[0,width]x[0,height]`, which keeps every tile's
 * geometry (area, centroid) uniform.
 *
 * The grid deliberately bleeds off all four sides, because a hex column's
 * profile is a zigzag between its points and its shoulders: a board edge that
 * lands on the points leaves a sawtooth, while one at or inside the shoulders
 * cuts a straight line. So the first column starts half a shoulder off-canvas
 * (`s / 2`) and the last runs far enough past `width` for its shoulders to
 * clear it. Starting a full `s` off-canvas would square the left edge but pull
 * the right one back onto its points, simply moving the sawtooth.
 */
export function buildHexGrid(width: number, height: number, unitsPerInch: number): HexTile[] {
  const rowSpacing = unitsPerInch * HEX_HEIGHT_IN
  const s = rowSpacing / Math.sqrt(3)
  const colSpacing = 1.5 * s

  const rows = Math.round(height / rowSpacing)
  // Far enough that the last column's shoulder (`cx + s / 2`) reaches `width`.
  const numCols = Math.ceil((width - s) / colSpacing) + 1

  const tiles: HexTile[] = []
  for (let col = 0; col < numCols; col++) {
    const shifted = (col & 1) === 1
    const cx = s / 2 + col * colSpacing
    const rowCount = shifted ? rows + 1 : rows
    for (let row = 0; row < rowCount; row++) {
      const cy = shifted ? row * rowSpacing : (row + 0.5) * rowSpacing
      tiles.push({ index: 0, col, row, center: [cx, cy], corners: hexCorners(cx, cy, s) })
    }
  }

  return tiles.map((tile, index) => ({ ...tile, index }))
}

/** Builds the `Mesh` (cells/edges/neighbors) that a hex tiling implies. */
export function buildHexMesh(tiles: readonly HexTile[]): Mesh {
  const cells = tiles.map((tile) => ({
    index: tile.index,
    centroid: polygonCentroid(tile.corners),
    area: ringArea(tile.corners)
  }))

  const edges = new Map<string, { segment: [Pt, Pt]; cells: number[] }>()
  for (const tile of tiles) {
    const segments = ringSegments([...tile.corners, tile.corners[0]!])
    for (const segment of segments) {
      const key = edgeKey(segment[0], segment[1])
      const entry = edges.get(key)
      if (entry === undefined) edges.set(key, { segment, cells: [tile.index] })
      else if (!entry.cells.includes(tile.index)) entry.cells.push(tile.index)
    }
  }

  const neighbors = new Map<number, Set<number>>(cells.map((c) => [c.index, new Set<number>()]))
  for (const { cells: owners } of edges.values()) {
    if (owners.length !== 2) continue
    const [a, b] = owners as [number, number]
    neighbors.get(a)!.add(b)
    neighbors.get(b)!.add(a)
  }

  return { cells, edges, neighbors }
}

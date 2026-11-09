import { Delaunay } from "d3-delaunay"
import { chainToPath, edgeKey, type Pt, ringSegments, stitch } from "~/shared/map/geometry"
import { NODES, padOf, type RegionId, REGIONS, SHEET } from "./map"

/**
 * Region shapes: a Voronoi of every pad's and label's outline (sampled, so a wide pad claims its
 * whole width, not just its centre), clipped to the sheet. Each cell takes its town's region;
 * same-region cells merge, and the edges where regions meet are the borders. A border is always
 * midway between towns of different regions.
 */

/** Spacing of sample sites along each pad and label outline (mm). */
const STEP = 4

type Rect = { x: number; y: number; width: number; height: number }

function perimeter({ x, y, width, height }: Rect): Pt[] {
  const corners: Pt[] = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]]
  return corners.flatMap((a, i) => {
    const b = corners[(i + 1) % 4]!
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / STEP))
    return Array.from({ length: n }, (_, k): Pt => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n])
  })
}

export type RegionShapes = {
  /** Fill outline per region (even-odd, so enclosed holes stay open). */
  fills: { region: RegionId; d: string }[]
  /** Borders between different regions (the sheet edge is not a border). */
  borders: string
  /** Regions that came out in more than one piece. */
  split: { region: RegionId; pieces: number }[]
  /** Tint level (0 = lightest) per region; touching regions never share one. */
  levels: Record<RegionId, number>
  /** Border segments, for clearance checks. */
  borderSegments: [Pt, Pt][]
  /** The region a point falls in. */
  regionAt: (x: number, y: number) => RegionId
}

export function regionShapes(positions: Record<string, { x: number; y: number }>): RegionShapes {
  const sites: Pt[] = []
  const owner: RegionId[] = []
  for (const node of NODES) {
    const pad = padOf(node, positions[node.id]!)
    for (
      const p of [
        ...perimeter({ x: pad.left, y: pad.top, width: pad.width, height: pad.height }),
        ...perimeter(pad.tab)
      ]
    ) {
      sites.push(p)
      owner.push(node.region)
    }
  }

  const delaunay = Delaunay.from(sites.map(([x, y]): [number, number] => [x, y]))
  const voronoi = delaunay.voronoi([0, 0, SHEET.width, SHEET.height])

  // An edge seen twice inside one region is interior; once is that region's boundary.
  const edgesOf = new Map<RegionId, Map<string, [Pt, Pt]>>()
  const seen = new Map<string, Set<RegionId>>()
  sites.forEach((_, i) => {
    const cell = voronoi.cellPolygon(i)
    if (!cell) return
    const region = owner[i]!
    const own = edgesOf.get(region) ?? new Map<string, [Pt, Pt]>()
    edgesOf.set(region, own)
    for (const [a, b] of ringSegments(cell)) {
      const key = edgeKey(a, b)
      if (own.has(key)) own.delete(key)
      else own.set(key, [a, b])
      seen.set(key, (seen.get(key) ?? new Set()).add(region))
    }
  })

  const fills = [...edgesOf].map(([region, edges]) => ({
    region,
    d: stitch([...edges.values()]).map((chain) => chainToPath(chain, true)).join(" ")
  }))

  const borderEdges = [...(edgesOf.values())]
    .flatMap((edges) => [...edges])
    .filter(([key]) => (seen.get(key)?.size ?? 0) > 1)
  const unique = new Map(borderEdges)
  const borders = stitch([...unique.values()]).map((chain) => chainToPath(chain)).join(" ")

  // Pieces per region: connected components of its cells over Delaunay neighbours.
  const component = sites.map(() => -1)
  const pieces = new Map<RegionId, number>()
  sites.forEach((_, start) => {
    if (component[start] !== -1) return
    const region = owner[start]!
    pieces.set(region, (pieces.get(region) ?? 0) + 1)
    const stack = [start]
    component[start] = start
    while (stack.length) {
      const i = stack.pop()!
      for (const j of delaunay.neighbors(i)) {
        if (component[j] === -1 && owner[j] === region) {
          component[j] = start
          stack.push(j)
        }
      }
    }
  })
  const split = (Object.keys(REGIONS) as RegionId[])
    .map((region) => ({ region, pieces: pieces.get(region) ?? 0 }))
    .filter((r) => r.pieces > 1)

  // Greedy map coloring: most-connected regions pick first, each takes the lightest level
  // no neighbour has. Planar maps need at most 4; greedy almost always manages that.
  const neighbours = new Map<RegionId, Set<RegionId>>()
  for (const regions of seen.values()) {
    if (regions.size < 2) continue
    for (const a of regions) {
      for (const b of regions) if (a !== b) neighbours.set(a, (neighbours.get(a) ?? new Set()).add(b))
    }
  }
  const order = (Object.keys(REGIONS) as RegionId[])
    .sort((a, b) => (neighbours.get(b)?.size ?? 0) - (neighbours.get(a)?.size ?? 0))
  const levels = {} as Record<RegionId, number>
  for (const region of order) {
    const taken = new Set([...(neighbours.get(region) ?? [])].map((n) => levels[n]))
    let level = 0
    while (taken.has(level)) level++
    levels[region] = level
  }

  let hint = 0
  const regionAt = (x: number, y: number) => {
    hint = delaunay.find(x, y, hint)
    return owner[hint]!
  }

  return { fills, borders, split, levels, borderSegments: [...unique.values()], regionAt }
}

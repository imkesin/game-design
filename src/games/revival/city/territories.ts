import { chainToPath, type Pt, stitch } from "../../../shared/map/geometry.ts"

/**
 * Territories for placed neighborhoods: a Voronoi split of the sheet where
 * distance is measured to each neighborhood's whole box, not a centre point,
 * so a big neighborhood claims proportionally more ground and borders bend
 * around corners (straight between facing edges, arcs around corners).
 *
 * Rasterised: every `step` mm sample takes the nearest box; the borders are the
 * edges between differently labelled samples, stitched per pair of neighbors
 * and simplified back toward the true curves. With a `reach`, ground farther
 * than that from every box is left empty, which gives the city an edge that
 * follows its neighborhoods. All lengths in mm.
 */

export type Site = { x: number; y: number; w: number; h: number }

/** `b` for a stretch of the city's edge: the site's territory against empty ground. */
export const OUTSIDE = -1

export type Border = {
  /** Indices of the two sites this border separates; `b` is `OUTSIDE` on the city edge. */
  a: number
  b: number
  d: string
  length: number
}

export type Territories = {
  borders: Border[]
  /** Per site: the closest any border comes to its box. Half the gap to its nearest neighbor. */
  clearance: number[]
}

/** Euclidean distance from a point to a box (0 inside it). */
const toBox = (px: number, py: number, { x, y, w, h }: Site) =>
  Math.hypot(Math.max(x - px, 0, px - (x + w)), Math.max(y - py, 0, py - (y + h)))

/** Ramer–Douglas–Peucker; keeps both ends so borders still meet at junctions. */
function simplify(points: readonly Pt[], tolerance: number): Pt[] {
  if (points.length < 3) return [...points]
  const [ax, ay] = points[0]!
  const [bx, by] = points.at(-1)!
  const span = Math.hypot(bx - ax, by - ay) || 1
  let worst = 0
  let at = 0
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i]!
    const off = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / span
    if (off > worst) [worst, at] = [off, i]
  }
  if (worst <= tolerance) return [points[0]!, points.at(-1)!]
  return [...simplify(points.slice(0, at + 1), tolerance).slice(0, -1), ...simplify(points.slice(at), tolerance)]
}

function midpoints(chain: readonly Pt[]): Pt[] {
  if (chain.length < 3) return [...chain]
  const mids = chain.slice(1).map(([x, y], i): Pt => [(x + chain[i]![0]) / 2, (y + chain[i]![1]) / 2])
  return [chain[0]!, ...mids.slice(1, -1), chain.at(-1)!]
}

const lengthOf = (chain: readonly Pt[]) =>
  chain.slice(1).reduce((sum, [x, y], i) => sum + Math.hypot(x - chain[i]![0], y - chain[i]![1]), 0)

export function territories(
  sites: readonly Site[],
  width: number,
  height: number,
  { step = 0.5, reach = Infinity }: { step?: number; reach?: number } = {}
): Territories {
  const nx = Math.round(width / step)
  const ny = Math.round(height / step)
  const label = new Int16Array(nx * ny)
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const px = (i + 0.5) * step
      const py = (j + 0.5) * step
      let best = reach
      label[j * nx + i] = OUTSIDE
      sites.forEach((site, s) => {
        const d = toBox(px, py, site)
        if (d <= best) [best, label[j * nx + i]] = [d, s]
      })
    }
  }

  const byPair = new Map<string, { a: number; b: number; segments: [Pt, Pt][] }>()
  const clearance = sites.map(() => Infinity)
  const edge = (a: number, b: number, segment: [Pt, Pt]) => {
    // The site first, so a city-edge stretch is (site, OUTSIDE).
    const [lo, hi] = a === OUTSIDE ? [b, a] : b === OUTSIDE ? [a, b] : a < b ? [a, b] : [b, a]
    const key = `${lo}|${hi}`
    let entry = byPair.get(key)
    if (entry === undefined) byPair.set(key, entry = { a: lo, b: hi, segments: [] })
    entry.segments.push(segment)
    const mx = (segment[0][0] + segment[1][0]) / 2
    const my = (segment[0][1] + segment[1][1]) / 2
    if (hi === OUTSIDE) return
    for (const s of [lo, hi]) clearance[s] = Math.min(clearance[s]!, toBox(mx, my, sites[s]!))
  }

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const here = label[j * nx + i]!
      if (i + 1 < nx && label[j * nx + i + 1] !== here) {
        edge(here, label[j * nx + i + 1]!, [[(i + 1) * step, j * step], [(i + 1) * step, (j + 1) * step]])
      }
      if (j + 1 < ny && label[(j + 1) * nx + i] !== here) {
        edge(here, label[(j + 1) * nx + i]!, [[i * step, (j + 1) * step], [(i + 1) * step, (j + 1) * step]])
      }
    }
  }

  const borders = [...byPair.values()].map(({ a, b, segments }) => {
    // A raster border is a staircase. Simplify its step midpoints to within one
    // step (0.5mm, far under a 5mm street), ends kept so borders meet at junctions.
    const chains = stitch(segments).map((chain) => simplify(midpoints(chain), step))
    return {
      a,
      b,
      d: chains.map((chain) => chainToPath(chain)).join(" "),
      length: chains.reduce((sum, chain) => sum + lengthOf(chain), 0)
    }
  })

  return { borders, clearance }
}

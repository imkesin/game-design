/**
 * Planar geometry primitives shared by the map pipeline.
 *
 * Every polygon in this map (hex cells) shares vertices exactly with its
 * neighbours, so adjacency can be found by exact key matching rather than
 * geometric tolerance — the single assumption the rest of this module rests
 * on, and the reason nothing here needs a geometry library.
 */

export type Pt = readonly [number, number]

/** Path output precision. Adjacency keys use the same rounding so they compare exactly. */
export const round = (n: number) => Math.round(n * 100) / 100

/** Snaps a raw vertex to path precision, so edge keys compare exactly. */
export function xy(point: readonly number[]): Pt {
  const [x, y] = point
  if (x === undefined || y === undefined) throw new Error("Malformed point")
  return [round(x), round(y)]
}

export const pointKey = (p: Pt) => `${p[0]},${p[1]}`

/** Undirected: two regions meeting on an edge traverse it in opposite winding. */
export const edgeKey = (a: Pt, b: Pt) => (pointKey(a) < pointKey(b)
  ? `${pointKey(a)}|${pointKey(b)}`
  : `${pointKey(b)}|${pointKey(a)}`)

export const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

export function ringSegments(ring: readonly (readonly number[])[]): [Pt, Pt][] {
  const points = ring.map(xy)
  const segments: [Pt, Pt][] = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!
    const b = points[i + 1]!
    // Rounding can collapse a very short edge to zero length; it carries no
    // adjacency information, so drop it rather than poison the edge keys.
    if (pointKey(a) !== pointKey(b)) segments.push([a, b])
  }
  return segments
}

/**
 * Walk a loose bag of segments into as few polylines as possible. A dash pattern
 * restarts at every subpath, so a border broken into per-vertex subpaths would
 * bunch its dashes at each corner.
 */
export function stitch(segments: readonly (readonly [Pt, Pt])[]): Pt[][] {
  const used = segments.map(() => false)
  const byPoint = new Map<string, number[]>()
  segments.forEach(([a, b], index) => {
    for (const point of [a, b]) {
      const key = pointKey(point)
      const at = byPoint.get(key)
      if (at === undefined) byPoint.set(key, [index])
      else at.push(index)
    }
  })

  const unusedAt = (point: Pt) => (byPoint.get(pointKey(point)) ?? []).find((i) => !used[i])

  const chains: Pt[][] = []
  for (const [index, segment] of segments.entries()) {
    if (used[index]) continue
    used[index] = true
    const chain: Pt[] = [segment[0], segment[1]]

    for (;;) {
      const tail = chain[chain.length - 1]!
      const next = unusedAt(tail)
      if (next === undefined) break
      used[next] = true
      const [a, b] = segments[next]!
      chain.push(pointKey(a) === pointKey(tail) ? b : a)
    }
    for (;;) {
      const head = chain[0]!
      const previous = unusedAt(head)
      if (previous === undefined) break
      used[previous] = true
      const [a, b] = segments[previous]!
      chain.unshift(pointKey(a) === pointKey(head) ? b : a)
    }
    chains.push(chain)
  }
  return chains
}

export const chainToPath = (chain: readonly Pt[], close = false) =>
  chain.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ") + (close ? " Z" : "")

/** Shoelace. */
export function ringArea(ring: readonly Pt[]): number {
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!
    const b = ring[(i + 1) % ring.length]!
    sum += a[0] * b[1] - b[0] * a[1]
  }
  return Math.abs(sum) / 2
}

/** Area-weighted centroid. Hex cells are convex, so this always lands inside. */
export function polygonCentroid(ring: readonly Pt[]): Pt {
  let twiceArea = 0
  let x = 0
  let y = 0
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!
    const b = ring[(i + 1) % ring.length]!
    const cross = a[0] * b[1] - b[0] * a[1]
    twiceArea += cross
    x += (a[0] + b[0]) * cross
    y += (a[1] + b[1]) * cross
  }
  if (Math.abs(twiceArea) < 1e-9) return ring[0] ?? [0, 0]
  return [round(x / (3 * twiceArea)), round(y / (3 * twiceArea))]
}

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

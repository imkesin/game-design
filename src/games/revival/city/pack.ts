import { type Geometry, geometry, type Layout } from "./prefabs.ts"

/**
 * Seeded placement of prefab neighborhoods on an area, in two steps.
 *
 * `chooseMix` picks which layouts to use: for each plot count, that many
 * layouts with that count (all different while there are enough), then the
 * whole list shuffled so sizes mix through the city.
 *
 * `pack` places them in order, each in the open spot nearest the area's centre
 * (plus a little jitter, so the city grows outward unevenly). Nearness is
 * scaled to the area's proportions, so on a tall sheet the city grows tall
 * rather than round. A spot is open when the box keeps `gap` from every placed
 * box and `edge` from the area's rim. Layouts that no longer fit are skipped.
 * All lengths in mm.
 */

export type PackOptions = {
  width: number
  height: number
  seed: number
  gap?: number
  edge?: number
  /** Candidate spacing; positions snap to it. */
  step?: number
  /** How far (mm) jitter may reorder candidates by distance from centre. */
  jitter?: number
}

export type Packed = { layout: Layout; geo: Geometry; x: number; y: number }

/** mulberry32: small, fast, good enough to shuffle a few dozen layouts. */
function random(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** `mix` maps a plot count to how many neighborhoods of that size to use. */
export function chooseMix(layouts: readonly Layout[], mix: Readonly<Record<number, number>>, seed: number): Layout[] {
  const rand = random(seed)
  const chosen = Object.entries(mix).flatMap(([plots, n]) => {
    const pool = shuffle(layouts.filter((l) => geometry(l).plots.length === Number(plots)), rand)
    // Repeat only once every layout of this size is used.
    return pool.length === 0 ? [] : Array.from({ length: n }, (_, i) => pool[i % pool.length]!)
  })
  return shuffle(chosen, rand)
}

/** Shortest distance between two boxes (0 when they touch or overlap). */
export const boxGap = (a: { x: number; y: number; w: number; h: number }, b: typeof a) =>
  Math.hypot(Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w), 0), Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h), 0))

export function pack(
  layouts: readonly Layout[],
  { width, height, seed, gap = 12, edge = 6, step = 4, jitter = 40 }: PackOptions
): { placed: Packed[]; skipped: Layout[] } {
  const rand = random(seed)
  const placed: Packed[] = []
  const skipped: Layout[] = []
  for (const layout of layouts) {
    const geo = geometry(layout)
    let best: { x: number; y: number; score: number } | undefined
    for (let y = edge; y + geo.height <= height - edge; y += step) {
      for (let x = edge; x + geo.width <= width - edge; x += step) {
        const box = { x, y, w: geo.width, h: geo.height }
        if (placed.some((p) => boxGap(box, { x: p.x, y: p.y, w: p.geo.width, h: p.geo.height }) < gap)) continue
        const dx = (x + geo.width / 2 - width / 2) / width
        const dy = (y + geo.height / 2 - height / 2) / height
        const score = Math.hypot(dx, dy) * width + rand() * jitter
        if (best === undefined || score < best.score) best = { x, y, score }
      }
    }
    if (best === undefined) skipped.push(layout)
    else placed.push({ layout, geo, x: best.x, y: best.y })
  }
  return { placed, skipped }
}

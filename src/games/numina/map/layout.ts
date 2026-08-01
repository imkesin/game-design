import { type Pt, rng } from "./mesh.ts"

/**
 * Embeds the province adjacency graph in the plane: springs pull declared
 * neighbours together, all pairs repel.
 *
 * The simulation runs in abstract space with unit spring length and the result
 * is *then* fitted to the canvas. Solving directly in map coordinates ties the
 * rest length to the land's size, which a chain-shaped graph cannot satisfy — a
 * five-province chain would want more span than the coastline has, and collapse
 * into a cluster where everything touches everything. Shape first, scale after.
 *
 * The layout only has to be approximately right; the partition's repair pass is
 * what makes adjacency exact. A mediocre layout costs repair iterations, not
 * correctness.
 */

const ITERATIONS = 800
const SPRING = 0.08
const REPULSION = 0.9
/** Non-neighbours push apart harder, so the partition starts with fewer false contacts. */
const STRANGER_BOOST = 2.2
/** Attraction between provinces of the same state, relative to a declared border. */
const KIN_PULL = 0.5
/** Keeps anchors off the canvas edge, where cells are small and awkward. */
const INSET = 0.1

function forceLayout(
  ids: readonly string[],
  adjacency: ReadonlyMap<string, ReadonlySet<string>>,
  stateOf: ReadonlyMap<string, string>,
  random: () => number
): [number, number][] {
  // Fully random start. Spring layout converges to whichever planar embedding
  // its initial configuration falls into, so the start is the only thing that
  // varies between attempts — a near-identical start would make every retry
  // rediscover the same wrong topology.
  const points: [number, number][] = ids.map(() => [
    (random() - 0.5) * 2,
    (random() - 0.5) * 2
  ])

  for (let step = 0; step < ITERATIONS; step++) {
    const cooling = 1 - step / ITERATIONS
    const forces: [number, number][] = ids.map(() => [0, 0])

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = points[i]!
        const b = points[j]!
        const dx = b[0] - a[0]
        const dy = b[1] - a[1]
        const distance = Math.hypot(dx, dy) || 0.0001
        const ux = dx / distance
        const uy = dy / distance

        const neighbours = adjacency.get(ids[i]!)?.has(ids[j]!) ?? false
        // Same-state provinces are drawn as one region, so they are pulled
        // together and spared the stranger push even when not adjacent. Without
        // this a state's provinces can end up on opposite sides of the map,
        // technically connected but a long thin snake to look at.
        const kin = stateOf.get(ids[i]!) === stateOf.get(ids[j]!)
        const push = REPULSION / (distance * distance)
          * (neighbours || kin ? 1 : STRANGER_BOOST)
        const pull = neighbours
          ? SPRING * (distance - 1)
          : kin
          ? SPRING * KIN_PULL * (distance - 1)
          : 0
        const net = pull - push

        forces[i]![0] += ux * net
        forces[i]![1] += uy * net
        forces[j]![0] -= ux * net
        forces[j]![1] -= uy * net
      }
    }

    for (let i = 0; i < ids.length; i++) {
      const force = forces[i]!
      const magnitude = Math.hypot(force[0], force[1]) || 1
      const capped = Math.min(magnitude, 0.2) * cooling
      const p = points[i]!
      points[i] = [p[0] + (force[0] / magnitude) * capped, p[1] + (force[1] / magnitude) * capped]
    }
  }

  return points
}

/** Placement hints straight from the spec. No solving: the hint *is* the answer. */
export function hintedAnchors(hints: readonly { id: string; at: Pt }[]): Map<string, Pt> {
  return new Map(hints.map(({ id, at }) => [id, at]))
}

export function layoutAnchors(
  width: number,
  height: number,
  ids: readonly string[],
  adjacency: ReadonlyMap<string, ReadonlySet<string>>,
  stateOf: ReadonlyMap<string, string>,
  seed: number
): Map<string, Pt> {
  const random = rng(seed)
  const abstract = forceLayout(ids, adjacency, stateOf, random)

  const xs = abstract.map((p) => p[0])
  const ys = abstract.map((p) => p[1])
  const spanX = Math.max(...xs) - Math.min(...xs)
  const spanY = Math.max(...ys) - Math.min(...ys)

  const insetX = width * INSET
  const insetY = height * INSET
  const targetW = width - insetX * 2
  const targetH = height - insetY * 2

  // Axes are fitted independently on purpose: a collinear graph should stretch
  // across the canvas rather than sit in a thin band down its middle.
  const placed = abstract.map(([x, y]): Pt => {
    const u = spanX < 1e-6 ? 0.5 : (x - Math.min(...xs)) / spanX
    const v = spanY < 1e-6 ? 0.5 : (y - Math.min(...ys)) / spanY
    return [insetX + u * targetW, insetY + v * targetH] as Pt
  })

  return new Map(ids.map((id, index) => [id, placed[index]!]))
}

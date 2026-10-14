import { BASE, HEADER, type NeighborhoodSpec, PLOT, round, shape, SIDE, type SkylineFile } from "./skyline.ts"
import { type Bridge, type Cell, cellAt, type Cells, COAST_RADIUS, isLand, isWater, key, neighbors } from "./water.ts"

/**
 * Territories: the land each neighborhood holds, on the plot grid. A
 * neighborhood always holds the land it stands on (`footprint`); the rest is
 * painted by hand (each neighborhood's `ground`) or grown from what's held.
 * Water is nobody's. Streets run between territories; neighbors share at least
 * one whole cell side, or the two ends of a bridge.
 */

type Spot = Pick<NeighborhoodSpec, "x" | "y" | "columns">

/** Who holds each land cell, by `key`. */
export type Holdings = ReadonlyMap<string, string>

const parse = (k: string): Cell => {
  const [c, r] = k.split(",").map(Number)
  return [c!, r!]
}

const defined = <T>(v: T | undefined): v is T => v !== undefined

/** Cells a neighborhood stands in: its plots, and the base band under each column. */
export function occupied(cells: Cells, n: Spot): Cell[] {
  const { top } = shape(n.columns)
  const bottom = n.y + SIDE + top
  return n.columns.flatMap((plots, i) => {
    const x = n.x + SIDE + (i + 0.5) * PLOT
    const ys = [...Array.from({ length: plots }, (_, k) => bottom - (k + 0.5) * PLOT), bottom + BASE / 2]
    return ys.map((y) => cellAt(cells, x, y)).filter(defined)
  })
}

/** `occupied`, plus the cells its name tag reaches into. */
export function footprint(cells: Cells, n: Spot): Cell[] {
  const { tallest: [first, last] } = shape(n.columns)
  const tag = Array.from(
    { length: last - first + 1 },
    (_, k) => cellAt(cells, n.x + SIDE + (first + k + 0.5) * PLOT, n.y - HEADER / 2)
  )
  return [...occupied(cells, n), ...tag.filter(defined)]
}

/** Names of neighborhoods whose footprints overlap another's. */
export function crowded(file: SkylineFile, cells: Cells): Set<string> {
  const first = new Map<string, string>()
  const out = new Set<string>()
  for (const n of file.neighborhoods) {
    for (const k of new Set(footprint(cells, n).map(key))) {
      const other = first.get(k)
      if (other === undefined) first.set(k, n.name)
      else out.add(other).add(n.name)
    }
  }
  return out
}

/** Footprints first (the first listed wins an overlap), then painted ground; land only. */
export function holdings(file: SkylineFile, cells: Cells): Map<string, string> {
  const out = new Map<string, string>()
  const hold = (cell: Cell, name: string) => {
    if (isLand(file.water, cell) && !out.has(key(cell))) out.set(key(cell), name)
  }
  for (const n of file.neighborhoods) for (const cell of footprint(cells, n)) hold(cell, n.name)
  for (const n of file.neighborhoods) for (const k of n.ground ?? []) hold(parse(k), n.name)
  return out
}

/** Row by row, so saved ground reads in order. */
const byPlace = (a: string, b: string) => {
  const [[ac, ar], [bc, br]] = [parse(a), parse(b)]
  return ar - br || ac - bc
}

function withGround(n: NeighborhoodSpec, ground: Iterable<string>): NeighborhoodSpec {
  const sorted = [...new Set(ground)].sort(byPlace)
  if (sorted.join(" ") === (n.ground ?? []).join(" ")) return n
  const { ground: _, ...rest } = n
  return sorted.length === 0 ? rest : { ...rest, ground: sorted }
}

/** `file` with land in `targets` given to `owner`, or to nobody; footprints stay put. */
export function paintGround(file: SkylineFile, cells: Cells, targets: readonly Cell[], owner?: string): SkylineFile {
  const fixed = new Set(file.neighborhoods.flatMap((n) => footprint(cells, n).map(key)))
  const hit = new Set(targets.filter((cell) => isLand(file.water, cell) && !fixed.has(key(cell))).map(key))
  if (hit.size === 0) return file
  const neighborhoods = file.neighborhoods.map((n) => {
    const kept = (n.ground ?? []).filter((k) => !hit.has(k))
    return withGround(n, n.name === owner ? [...kept, ...hit] : kept)
  })
  return neighborhoods.every((n, i) => n === file.neighborhoods[i]) ? file : { ...file, neighborhoods }
}

/**
 * `file` with every unheld land cell a territory can reach over land given to
 * one, growing a cell at a time. Where two reach a cell together, it goes to
 * the one whose footprint is nearer, then to the first listed.
 */
export function grow(file: SkylineFile, cells: Cells): SkylineFile {
  const held = holdings(file, cells)
  const order = new Map(file.neighborhoods.map((n, i) => [n.name, i]))
  const seats = new Map(file.neighborhoods.map((n) => [n.name, footprint(cells, n)]))
  const distance = (name: string, [c, r]: Cell) =>
    Math.min(...(seats.get(name) ?? []).map(([sc, sr]) => Math.hypot(sc - c, sr - r)))

  const gained = new Map<string, string[]>()
  let frontier = [...held.keys()].map(parse)
  while (frontier.length > 0) {
    const reached = new Map<string, Set<string>>()
    for (const cell of frontier) {
      const owner = held.get(key(cell))!
      for (const next of neighbors(cell)) {
        if (!isLand(file.water, next) || held.has(key(next))) continue
        reached.set(key(next), (reached.get(key(next)) ?? new Set()).add(owner))
      }
    }
    frontier = []
    for (const [k, owners] of reached) {
      const cell = parse(k)
      const best = [...owners].sort((a, b) =>
        distance(a, cell) - distance(b, cell) || order.get(a)! - order.get(b)!
      )[0]!
      held.set(k, best)
      gained.set(best, [...(gained.get(best) ?? []), k])
      frontier.push(cell)
    }
  }
  if (gained.size === 0) return file
  return {
    ...file,
    neighborhoods: file.neighborhoods.map((n) => {
      const more = gained.get(n.name)
      return more === undefined ? n : withGround(n, [...(n.ground ?? []), ...more])
    })
  }
}

/**
 * Streets: every cell side between land held by different neighborhoods (or
 * held and unheld), merged into straight runs, as an SVG path. A run that ends
 * at water carries on under it, so it meets the rounded coast.
 */
export function streets(water: readonly string[], cells: Cells, held: Holdings): string {
  const { x0, y0, cols, rows } = cells
  const split = (a: Cell, b: Cell) => isLand(water, a) && isLand(water, b) && held.get(key(a)) !== held.get(key(b))
  const wetCorner = (c: number, r: number) =>
    [[c - 1, r - 1], [c, r - 1], [c - 1, r], [c, r]].some(([cc, rr]) => isWater(water, [cc!, rr!]))
  const reach = COAST_RADIUS.outer

  const parts: string[] = []
  // Along each grid line, runs of consecutive split sides.
  const lines = (count: number, length: number, isSplit: (line: number, k: number) => boolean) => {
    const runs: [line: number, from: number, to: number][] = []
    for (let line = 1; line < count; line++) {
      for (let k = 0; k < length; k++) {
        if (!isSplit(line, k)) continue
        const last = runs.at(-1)
        if (last !== undefined && last[0] === line && last[2] === k) last[2] = k + 1
        else runs.push([line, k, k + 1])
      }
    }
    return runs
  }
  for (const [r, from, to] of lines(rows, cols, (r, c) => split([c, r - 1], [c, r]))) {
    const start = x0 + from * PLOT - (wetCorner(from, r) ? reach : 0)
    const end = x0 + to * PLOT + (wetCorner(to, r) ? reach : 0)
    parts.push(`M${round(start)} ${round(y0 + r * PLOT)}H${round(end)}`)
  }
  for (const [c, from, to] of lines(cols, rows, (c, r) => split([c - 1, r], [c, r]))) {
    const start = y0 + from * PLOT - (wetCorner(c, from) ? reach : 0)
    const end = y0 + to * PLOT + (wetCorner(c, to) ? reach : 0)
    parts.push(`M${round(x0 + c * PLOT)} ${round(start)}V${round(end)}`)
  }
  return parts.join("")
}

/** Each neighborhood's neighbors: across a shared cell side, or the two ends of a bridge. */
export function adjacency(
  names: readonly string[],
  held: Holdings,
  bridges: readonly Bridge[]
): Map<string, Set<string>> {
  const out = new Map(names.map((name) => [name, new Set<string>()]))
  const join = (a: string | undefined, b: string | undefined) => {
    if (a === undefined || b === undefined || a === b) return
    out.get(a)?.add(b)
    out.get(b)?.add(a)
  }
  for (const [k, owner] of held) {
    const [c, r] = parse(k)
    join(owner, held.get(key([c + 1, r])))
    join(owner, held.get(key([c, r + 1])))
  }
  for (const { ends: [a, b] } of bridges) join(held.get(key(a)), held.get(key(b)))
  return out
}

/** Names of neighborhoods whose territory is in more than one piece. */
export function scattered(held: Holdings): Set<string> {
  const seen = new Set<string>()
  const pieces = new Map<string, number>()
  for (const [start, owner] of held) {
    if (seen.has(start)) continue
    pieces.set(owner, (pieces.get(owner) ?? 0) + 1)
    seen.add(start)
    const queue = [parse(start)]
    for (let cell = queue.pop(); cell !== undefined; cell = queue.pop()) {
      for (const next of neighbors(cell)) {
        if (seen.has(key(next)) || held.get(key(next)) !== owner) continue
        seen.add(key(next))
        queue.push(next)
      }
    }
  }
  return new Set([...pieces].filter(([, count]) => count > 1).map(([name]) => name))
}

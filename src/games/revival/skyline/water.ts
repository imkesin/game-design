import { type Grid, PLOT, type Point, round, rounded } from "./skyline.ts"

/**
 * Land and water, painted on the plot grid: one string per grid row, `.` for
 * land, `~` for water and `=` for water with a bridge over it, counting the
 * part-cells at the board's edges. Drawn as wavy lines inside a rounded
 * coastline. Water cells touching only at a corner join up, so a river can be
 * painted on the diagonal.
 */

export const LAND = "."
export const WATER = "~"
export const BRIDGE = "="

/** The grid's cells over the board: the first one's top-left (at or before the board's), and how many. */
export type Cells = { x0: number; y0: number; cols: number; rows: number }

export type Cell = readonly [col: number, row: number]

export function cells(grid: Grid, width: number, height: number): Cells {
  const x0 = round(grid.x - Math.ceil(grid.x / PLOT) * PLOT)
  const y0 = round(grid.y - Math.ceil(grid.y / PLOT) * PLOT)
  return { x0, y0, cols: Math.ceil((width - x0) / PLOT), rows: Math.ceil((height - y0) / PLOT) }
}

/** `water` fitted to `cells`: rows padded or cut to size, anything unknown land. */
export function fit(water: readonly string[] | undefined, { cols, rows }: Cells): string[] {
  return Array.from(
    { length: rows },
    (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const mark = water?.[r]?.[c]
        return mark === WATER || mark === BRIDGE ? mark : LAND
      }).join("")
  )
}

/** What's painted on a cell: `LAND`, `WATER` or `BRIDGE`; off the grid, undefined. */
export const terrain = (water: readonly string[], [c, r]: Cell) => water[r]?.[c]

/** Water, bridged or not. */
export const isWater = (water: readonly string[], cell: Cell) => {
  const mark = terrain(water, cell)
  return mark === WATER || mark === BRIDGE
}

export const isLand = (water: readonly string[], cell: Cell) => terrain(water, cell) === LAND

export const key = ([c, r]: Cell) => `${c},${r}`

/** The four cells sharing a side with `cell`. */
export const neighbors = ([c, r]: Cell): Cell[] => [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]]

export function cellAt({ x0, y0, cols, rows }: Cells, x: number, y: number): Cell | undefined {
  const c = Math.floor((x - x0) / PLOT)
  const r = Math.floor((y - y0) / PLOT)
  return c >= 0 && c < cols && r >= 0 && r < rows ? [c, r] : undefined
}

/**
 * `water` with `targets` painted `mark`, skipping cells `where` turns down;
 * `water` itself when nothing changes.
 */
export function paint(
  water: string[],
  targets: readonly Cell[],
  mark: string,
  where: (current: string) => boolean = () => true
): string[] {
  let changed = false
  const next = water.map((row, r) => {
    const hits = targets.filter(([c, tr]) => tr === r && c >= 0 && c < row.length && row[c] !== mark && where(row[c]!))
    if (hits.length === 0) return row
    changed = true
    const chars = [...row]
    for (const [c] of hits) chars[c] = mark
    return chars.join("")
  })
  return changed ? next : water
}

/** The cells on a straight run from `a` to `b`, so a fast stroke leaves no gaps. */
export function between(a: Cell, b: Cell): Cell[] {
  const steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))
  return Array.from({ length: steps + 1 }, (_, k) => {
    const t = steps === 0 ? 0 : k / steps
    return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t)] as const
  })
}

/** Coastline corner radii: water's outer corners, and its inner ones (bays). */
export const COAST_RADIUS = { outer: 10, inner: 6 }

/**
 * The coastline, as one SVG path (water clockwise, islands counter-clockwise).
 * Edge cells run on one cell past the board, so the coast never follows the
 * board's edge; clip to the board when drawing.
 */
export function coastline(water: readonly string[], { x0, y0, cols, rows }: Cells): string {
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max - 1)
  const wet = (c: number, r: number) =>
    c >= -1 && c <= cols && r >= -1 && r <= rows && isWater(water, [clamp(c, cols), clamp(r, rows)])

  // Each boundary side of a water cell, directed so water lies on its right.
  const edges: { from: Point; to: Point; used: boolean }[] = []
  for (let r = -1; r <= rows; r++) {
    for (let c = -1; c <= cols; c++) {
      if (!wet(c, r)) continue
      if (!wet(c, r - 1)) edges.push({ from: [c, r], to: [c + 1, r], used: false })
      if (!wet(c + 1, r)) edges.push({ from: [c + 1, r], to: [c + 1, r + 1], used: false })
      if (!wet(c, r + 1)) edges.push({ from: [c + 1, r + 1], to: [c, r + 1], used: false })
      if (!wet(c - 1, r)) edges.push({ from: [c, r + 1], to: [c, r], used: false })
    }
  }
  const vertex = ([x, y]: Point) => `${x},${y}`
  const leaving = new Map<string, typeof edges>()
  for (const e of edges) leaving.set(vertex(e.from), [...(leaving.get(vertex(e.from)) ?? []), e])

  const loops: Point[][] = []
  for (const start of edges) {
    if (start.used) continue
    const loop: Point[] = []
    let e = start
    while (!e.used) {
      e.used = true
      loop.push(e.from)
      const [dx, dy] = [e.to[0] - e.from[0], e.to[1] - e.from[1]]
      // Where two water cells touch at a corner, turn left: across to the other cell, so they join.
      const turn = (n: (typeof edges)[number]) => dx * (n.to[1] - n.from[1]) - dy * (n.to[0] - n.from[0])
      const options = (leaving.get(vertex(e.to)) ?? []).filter((n) => !n.used)
      const next = options.sort((a, b) => turn(a) - turn(b))[0]
      if (next === undefined) break
      e = next
    }
    // Keep only the corners.
    const corners = loop.filter((p, i) => {
      const prev = loop[(i + loop.length - 1) % loop.length]!
      const next = loop[(i + 1) % loop.length]!
      return (p[0] - prev[0]) * (next[1] - p[1]) - (p[1] - prev[1]) * (next[0] - p[0]) !== 0
    })
    loops.push(corners.map(([c, r]) => [round(x0 + c * PLOT), round(y0 + r * PLOT)]))
  }
  return loops.map((loop) => rounded(loop, COAST_RADIUS.outer, COAST_RADIUS.inner)).join("")
}

/**
 * A bridge: a straight run of bridge cells, along a row or a column, with land
 * at both ends. `ends` are those land cells.
 */
export type Bridge = { cells: Cell[]; across: "row" | "column"; ends: [Cell, Cell] }

/**
 * The bridges painted on `water`, and the bridge cells that don't make one: a
 * run that bends, or that doesn't reach land at both ends. A single cell spans
 * a row if it has land left and right, else a column if land above and below.
 */
export function bridges(water: readonly string[]): { bridges: Bridge[]; stray: Cell[] } {
  const isBridge = (cell: Cell) => terrain(water, cell) === BRIDGE
  const seen = new Set<string>()
  const out: Bridge[] = []
  const stray: Cell[] = []
  for (let r = 0; r < water.length; r++) {
    for (let c = 0; c < water[r]!.length; c++) {
      if (!isBridge([c, r]) || seen.has(key([c, r]))) continue
      const run: Cell[] = []
      const queue: Cell[] = [[c, r]]
      seen.add(key([c, r]))
      for (let cell = queue.pop(); cell !== undefined; cell = queue.pop()) {
        run.push(cell)
        for (const next of neighbors(cell)) {
          if (!isBridge(next) || seen.has(key(next))) continue
          seen.add(key(next))
          queue.push(next)
        }
      }
      const bridge = span(water, run)
      if (bridge === undefined) stray.push(...run)
      else out.push(bridge)
    }
  }
  return { bridges: out, stray }
}

function span(water: readonly string[], run: Cell[]): Bridge | undefined {
  const cols = run.map(([c]) => c)
  const rows = run.map(([, r]) => r)
  const [c0, c1, r0, r1] = [Math.min(...cols), Math.max(...cols), Math.min(...rows), Math.max(...rows)]
  const along = (across: Bridge["across"]): Bridge | undefined => {
    const ends: [Cell, Cell] = across === "row" ? [[c0 - 1, r0], [c1 + 1, r0]] : [[c0, r0 - 1], [c0, r1 + 1]]
    const straight = across === "row" ? r0 === r1 : c0 === c1
    if (!straight || !ends.every((end) => isLand(water, end))) return undefined
    const sorted = [...run].sort((a, b) => a[0] - b[0] || a[1] - b[1])
    return { cells: sorted, across, ends }
  }
  return along("row") ?? along("column")
}

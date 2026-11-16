/**
 * The city experiment: a hand-authored grid. Each cell belongs to one neighborhood (upper-case
 * letter) and one block within it (lower-case letter, scoped to the neighborhood). Major dividers
 * are the cell edges between neighborhoods; the city has no outline and fades off the sheet edge.
 * A neighborhood's FDH sits on the interior grid vertex nearest its centroid.
 */

/** Grid unit, mm. Sizing is deliberately loose for now. */
export const UNIT = 45

const HOODS = [
  "AAAABBBCCCCC",
  "AAAABBBCCCCC",
  "AAAABBBCCCCC",
  "DDDDDBBCCCCC",
  "DDDDDEEEEFFF",
  "DDDDDEEEEFFF",
  "GGGDDEEEEFFF",
  "GGGHHHHHHFFF",
  "GGGHHHHHHFFF"
]

const BLOCKS = [
  "aabbaabaabbb",
  "aabbaabaabbb",
  "ccccccbccddd",
  "aabbbccccddd",
  "aabbbaabbaaa",
  "cccddaabbaaa",
  "aaaddccccbbb",
  "bbaaabbccccc",
  "bbaaabbccccc"
]

/** Blocks per neighborhood. */
const BLOCKS_PER_HOOD = { min: 2, max: 4 }

export type Cell = { row: number; col: number }
export type Vertex = { row: number; col: number }
/** A unit edge: horizontal runs along the top of `row` from `col` to `col + 1`; vertical along the left of `col`. */
export type UnitEdge = { dir: "h" | "v"; row: number; col: number }

/** A straight divider between two junctions (turn, split, or dead end): one link, one stick slot. `length` in units. */
export type Run = { dir: "h" | "v"; row: number; col: number; length: number }

export type Hood = { id: string; cells: Cell[]; fdh: Vertex }
export type Block = { id: string; hood: string; cells: Cell[] }

export type City = {
  rows: number
  cols: number
  hoodAt: (c: Cell) => string | undefined
  blockAt: (c: Cell) => string | undefined
  hoods: Hood[]
  blocks: Block[]
  /** Interior only: the city has no outline; dividers that reach the rim run off the sheet. */
  majors: UnitEdge[]
  onRim: (v: Vertex) => boolean
  /** Unit edges between two blocks of the same neighborhood. */
  minors: UnitEdge[]
  runs: Run[]
  /** Junction vertices: the ends of every run off the rim, deduplicated. */
  nodes: Vertex[]
}

function buildCity(): City {
  const rows = HOODS.length
  const cols = HOODS[0]!.length
  if (BLOCKS.length !== rows || [...HOODS, ...BLOCKS].some((r) => r.length !== cols)) {
    throw new Error("city: HOODS and BLOCKS must be the same rectangle")
  }
  const onRim = ({ row, col }: Vertex) => row === 0 || row === rows || col === 0 || col === cols
  const inside = ({ row, col }: Cell) => row >= 0 && row < rows && col >= 0 && col < cols
  const hoodAt = (c: Cell) => (inside(c) ? HOODS[c.row]![c.col] : undefined)
  const rawBlock = (c: Cell) => (inside(c) ? `${hoodAt(c)}${BLOCKS[c.row]![c.col]}` : undefined)

  // Same hood + letter must be one connected piece; split pieces would silently become one block.
  const blockId = new Map<string, string>()
  const blocks: Block[] = []
  const key = (c: Cell) => `${c.row},${c.col}`
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const start = { row, col }
      if (blockId.has(key(start))) continue
      const raw = rawBlock(start)!
      if (blocks.some((b) => b.id === raw)) throw new Error(`city: block ${raw} is not contiguous`)
      const cells: Cell[] = []
      const stack = [start]
      blockId.set(key(start), raw)
      while (stack.length) {
        const c = stack.pop()!
        cells.push(c)
        for (const n of neighbors(c)) {
          if (rawBlock(n) === raw && !blockId.has(key(n))) {
            blockId.set(key(n), raw)
            stack.push(n)
          }
        }
      }
      blocks.push({ id: raw, hood: raw[0]!, cells })
    }
  }
  const blockAt = (c: Cell) => (inside(c) ? blockId.get(key(c)) : undefined)

  // Every block must face a divider or the map edge; a block sealed inside its neighborhood can't be served.
  for (const b of blocks) {
    if (!b.cells.some((c) => neighbors(c).some((n) => hoodAt(n) !== b.hood))) {
      throw new Error(`city: block ${b.id} touches neither a divider nor the map edge`)
    }
  }

  const hoodIds = [...new Set(HOODS.join(""))].sort()
  const hoods: Hood[] = hoodIds.map((id) => {
    const cells: Cell[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) if (hoodAt({ row, col }) === id) cells.push({ row, col })
    }
    const cy = cells.reduce((s, c) => s + c.row + 0.5, 0) / cells.length
    const cx = cells.reduce((s, c) => s + c.col + 0.5, 0) / cells.length
    let best: { v: Vertex; d: number } | undefined
    for (let row = 1; row < rows; row++) {
      for (let col = 1; col < cols; col++) {
        const around = [
          { row: row - 1, col: col - 1 },
          { row: row - 1, col },
          { row, col: col - 1 },
          { row, col }
        ]
        if (!around.every((c) => hoodAt(c) === id)) continue
        const d = (row - cy) ** 2 + (col - cx) ** 2
        if (!best || d < best.d) best = { v: { row, col }, d }
      }
    }
    if (!best) throw new Error(`city: neighborhood ${id} has no interior vertex for its FDH`)
    const count = blocks.filter((b) => b.hood === id).length
    if (count < BLOCKS_PER_HOOD.min || count > BLOCKS_PER_HOOD.max) {
      throw new Error(`city: neighborhood ${id} has ${count} blocks`)
    }
    return { id, cells, fdh: best.v }
  })

  const majors: UnitEdge[] = []
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (row > 0 && row < rows && hoodAt({ row: row - 1, col }) !== hoodAt({ row, col })) {
        majors.push({ dir: "h", row, col })
      }
    }
  }
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= cols; col++) {
      if (col > 0 && col < cols && hoodAt({ row, col: col - 1 }) !== hoodAt({ row, col })) {
        majors.push({ dir: "v", row, col })
      }
    }
  }

  const minors: UnitEdge[] = []
  const minor = (a: Cell, b: Cell) => inside(a) && inside(b) && hoodAt(a) === hoodAt(b) && blockAt(a) !== blockAt(b)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (minor({ row: row - 1, col }, { row, col })) minors.push({ dir: "h", row, col })
      if (minor({ row, col: col - 1 }, { row, col })) minors.push({ dir: "v", row, col })
    }
  }

  const runs = buildRuns(majors)
  const nodes = new Map<string, Vertex>()
  for (const r of runs) {
    const end = r.dir === "h" ? { row: r.row, col: r.col + r.length } : { row: r.row + r.length, col: r.col }
    for (const v of [{ row: r.row, col: r.col }, end]) if (!onRim(v)) nodes.set(`${v.row},${v.col}`, v)
  }
  return { rows, cols, hoodAt, blockAt, hoods, blocks, majors, onRim, minors, runs, nodes: [...nodes.values()] }
}

/** Merge collinear unit edges; a run breaks at any vertex that isn't a straight pass-through. */
function buildRuns(majors: UnitEdge[]): Run[] {
  const has = new Set(majors.map((e) => `${e.dir}${e.row},${e.col}`))
  const on = (dir: "h" | "v", row: number, col: number) => has.has(`${dir}${row},${col}`)
  const straight = (v: Vertex, dir: "h" | "v") => {
    const h = on("h", v.row, v.col - 1) && on("h", v.row, v.col)
    const vt = on("v", v.row - 1, v.col) && on("v", v.row, v.col)
    const hAny = on("h", v.row, v.col - 1) || on("h", v.row, v.col)
    const vAny = on("v", v.row - 1, v.col) || on("v", v.row, v.col)
    return dir === "h" ? h && !vAny : vt && !hAny
  }
  const runs: Run[] = []
  for (const e of majors) {
    const start = { row: e.row, col: e.col }
    // Only start a run where the previous vertex is a break.
    if (straight(start, e.dir)) continue
    let length = 1
    for (;;) {
      const next = e.dir === "h" ? { row: e.row, col: e.col + length } : { row: e.row + length, col: e.col }
      if (!straight(next, e.dir)) break
      length++
    }
    runs.push({ dir: e.dir, row: e.row, col: e.col, length })
  }
  return runs
}

export function neighbors({ row, col }: Cell): Cell[] {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 }
  ]
}

export const CITY = buildCity()

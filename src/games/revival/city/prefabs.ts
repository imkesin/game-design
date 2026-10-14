import { chainToPath, type Pt, stitch } from "../../../shared/map/geometry.ts"

/**
 * Prefab neighborhood layouts drawn at true size: plots on 24mm tracks, 8mm
 * roads, a 12mm outer band holding the claim markers. Pure geometry; the
 * prefabs page lists them, the city page places them on a sheet.
 */

export type GridLayout = {
  kind: "grid"
  /** One string per row: P plot, R road, S square (roads and squares are left open). */
  rows: readonly string[]
  /**
   * Each plot group gets one claim in the outer band, centred on its outward
   * plots, on the side of the box it runs along. Naming a side forces it.
   */
  claimSide?: Side
}

export type Side = "N" | "E" | "S" | "W"

/**
 * Blocks of plots and roads, left to right. A number is a one-wide column
 * of that many plots; `{ wide, tall }` is a solid block; an array is a one-wide
 * column of separate groups top to bottom, with "gap" an empty plot space.
 * Each item is centred vertically against the tallest, so odd and even items
 * sit half a plot apart. Claims go beside the outer items, and above any
 * middle one, one per group.
 */
export type StackLayout = {
  kind: "stacks"
  stacks: readonly (number | { wide: number; tall: number } | readonly (number | "gap")[] | "road")[]
  /** "S" puts every group's claim directly under it, centred, as on the 2 + 2 + 2 grid. */
  claimSide?: "S"
}

export type Layout = GridLayout | StackLayout

export const LAYOUTS: readonly Layout[] = [
  // The six-lot crossroads with the NW lot missing.
  { kind: "grid", rows: ["RRP", "RRR", "PRP", "PRP"] },
  // The six-lot crossroads with the west lot just below the street missing.
  { kind: "grid", rows: ["PRP", "RRR", "RRP", "PRP"] },
  { kind: "grid", rows: ["PRP", "RRR", "PRP", "PRP"] },
  // Three pairs across two lanes, each claim centred under its column.
  { kind: "grid", rows: ["PRPRP", "PRPRP"], claimSide: "S" },
  // Two lots each side of a lane.
  { kind: "grid", rows: ["PRP", "PRP"] },
  // Crossroads: four lots around an intersection.
  { kind: "grid", rows: ["PRP", "RRR", "PRP"] },
  // A lone lot facing a row of three across a lane, a claim beside each.
  { kind: "grid", rows: ["RRP", "PRP", "RRP"] },
  // A solid square of four, claim centred below.
  { kind: "grid", rows: ["PP", "PP"], claimSide: "S" },
  // The one horizontal exception: a pair, claim centred below.
  { kind: "grid", rows: ["PP"], claimSide: "S" },
  // Stacks across a lane, centred on each other.
  { kind: "stacks", stacks: [1, "road", 1] },
  { kind: "stacks", stacks: [1, "road", 2] },
  // Lower-right corner: an L of three.
  { kind: "grid", rows: ["RP", "PP"] },
  // Crossroads with the NW lot missing.
  { kind: "grid", rows: ["RRP", "RRR", "PRP"] },
  { kind: "stacks", stacks: [2, "road", 3] },
  // Two lone lots facing the ends of a row of three: 1 + 3 with the single split.
  { kind: "grid", rows: ["PRP", "RRP", "PRP"] },
  // A lone lot centred against a square of four.
  { kind: "stacks", stacks: [1, "road", { wide: 2, tall: 2 }] },
  // A lone lot and a pair, facing a row of three centred on the gap between them.
  { kind: "stacks", stacks: [[1, "gap", 2], "road", 3] },
  // Two rows of three facing across a lane.
  { kind: "stacks", stacks: [3, "road", 3] },
  // A pair facing a square of four: 1 + 4 with the single doubled.
  { kind: "stacks", stacks: [2, "road", { wide: 2, tall: 2 }] },
  { kind: "stacks", stacks: [3, "road", 4] },
  // Pairs on four corners of a crossroads, then the same with the NW lot gone.
  { kind: "grid", rows: ["PRP", "PRP", "RRR", "PRP", "PRP"] },
  { kind: "grid", rows: ["RRP", "PRP", "RRR", "PRP", "PRP"] },
  // Three centred columns, the odd one in the middle, claims under each.
  { kind: "stacks", stacks: [2, "road", 3, "road", 2], claimSide: "S" },
  { kind: "stacks", stacks: [3, "road", 2, "road", 3], claimSide: "S" }
]

/** Outer band; also holds the claim markers. */
export const MARGIN = 12
export const PLOT_TRACK = 24
/** A row or column of the layout with no plots in it is road. */
export const ROAD_TRACK = 8
/** Claim marker diameter, and its air to the band's inner edge. */
export const CLAIM = 10
export const CLAIM_AIR = 1
/** A claim's centre, measured in from the box's outer edge. */
export const CLAIM_INSET = MARGIN - CLAIM_AIR - CLAIM / 2

const isOpen = (ch: string | undefined) => ch !== "P"

/** Where each track starts, plus the far edge. */
const edges = (tracks: readonly number[]) => tracks.reduce<number[]>((out, n) => [...out, out.at(-1)! + n], [0])

type Cell = { c: number; r: number }

/** Edge-touching groups of plots. */
function plotGroups(layout: readonly string[]): Cell[][] {
  const isPlot = ({ c, r }: Cell) => layout[r]?.[c] === "P"
  const seen = new Set<string>()
  const groups: Cell[][] = []
  layout.forEach((line, r) => {
    ;[...line].forEach((_, c) => {
      if (!isPlot({ c, r }) || seen.has(`${c},${r}`)) return
      seen.add(`${c},${r}`)
      const group: Cell[] = []
      const queue: Cell[] = [{ c, r }]
      while (queue.length > 0) {
        const cell = queue.pop()!
        group.push(cell)
        for (
          const next of [
            { c: cell.c + 1, r: cell.r },
            { c: cell.c - 1, r: cell.r },
            { c: cell.c, r: cell.r + 1 },
            { c: cell.c, r: cell.r - 1 }
          ]
        ) {
          if (!isPlot(next) || seen.has(`${next.c},${next.r}`)) continue
          seen.add(`${next.c},${next.r}`)
          queue.push(next)
        }
      }
      groups.push(group)
    })
  })
  return groups
}

const rect = (x0: number, y0: number, x1: number, y1: number): [Pt, Pt][] => [
  [[x0, y0], [x1, y0]],
  [[x1, y0], [x1, y1]],
  [[x1, y1], [x0, y1]],
  [[x0, y1], [x0, y0]]
]

/** A plot's place on the prefab's CSS grid, as 1-based lines. */
export type PlotPlacement = { row: number; col: number; rowSpan: number }

export type Geometry = {
  cols: number[]
  rows: number[]
  width: number
  height: number
  plots: PlotPlacement[]
  /** Closed outlines, one per group of plots. */
  groups: string
  /** Plots per group, smallest first: how the prefab splits into parts. */
  parts: number[]
  claimPoints: Pt[]
}

export function geometry(layout: Layout): Geometry {
  return layout.kind === "grid" ? gridGeometry(layout) : stackGeometry(layout)
}

function stackGeometry({ stacks, claimSide }: StackLayout): Geometry {
  // Every item as a width plus its groups top to bottom.
  const items = stacks.map((s) =>
    s === "road"
      ? s
      : typeof s === "number"
      ? { wide: 1, pieces: [s] }
      : "wide" in s
      ? { wide: s.wide, pieces: [s.tall] }
      : { wide: 1, pieces: s }
  )
  const tallOf = (pieces: readonly (number | "gap")[]) => pieces.reduce<number>((n, p) => n + (p === "gap" ? 1 : p), 0)
  const tallest = Math.max(...items.map((s) => (s === "road" ? 0 : tallOf(s.pieces))))
  const half = PLOT_TRACK / 2
  const cols = [
    MARGIN,
    ...items.flatMap((s) => (s === "road" ? [ROAD_TRACK] : Array<number>(s.wide).fill(PLOT_TRACK))),
    MARGIN
  ]
  // Half-plot row tracks, so a block can sit half a plot lower than its neighbour.
  const rows = [MARGIN, ...Array<number>(2 * tallest).fill(half), MARGIN]
  const colEdges = edges(cols)
  const width = colEdges.at(-1)!
  const height = edges(rows).at(-1)!

  const plots: PlotPlacement[] = []
  const segments: [Pt, Pt][] = []
  const claimPoints: Pt[] = []
  const parts: number[] = []
  // Track index of each item's first column; the margin is track 0.
  let track = 1
  items.forEach((item, i) => {
    const first = track
    track += item === "road" ? 1 : item.wide
    if (item === "road") return
    const [x0, x1] = [colEdges[first]!, colEdges[first + item.wide]!]
    // Half-plot rows from the top of the tallest item to this piece; centring
    // drops a shorter item by half its shortfall, i.e. one half-row per plot.
    let at = tallest - tallOf(item.pieces)
    for (const piece of item.pieces) {
      const top = at
      at += 2 * (piece === "gap" ? 1 : piece)
      if (piece === "gap") continue
      for (let x = 0; x < item.wide; x++) {
        for (let k = 0; k < piece; k++) plots.push({ col: first + x + 1, row: 2 + top + 2 * k, rowSpan: 2 })
      }
      const y0 = MARGIN + top * half
      const y1 = y0 + piece * PLOT_TRACK
      segments.push(...rect(x0, y0, x1, y1))
      parts.push(item.wide * piece)
      claimPoints.push(
        claimSide === "S"
          // The same offset below the group that a full-height column has to its band.
          ? [(x0 + x1) / 2, y1 + MARGIN - CLAIM_INSET]
          : i === 0
          ? [CLAIM_INSET, (y0 + y1) / 2]
          : i === items.length - 1
          ? [width - CLAIM_INSET, (y0 + y1) / 2]
          : [(x0 + x1) / 2, CLAIM_INSET]
      )
    }
  })

  return {
    cols,
    rows,
    width,
    height,
    plots,
    groups: stitch(segments).map((chain) => chainToPath(chain, true)).join(" "),
    parts: parts.sort((a, b) => a - b),
    claimPoints
  }
}

function gridGeometry({ rows: layout, claimSide }: GridLayout): Geometry {
  const columns = Math.max(...layout.map((line) => line.length))
  const cols = [
    MARGIN,
    ...Array.from({ length: columns }, (_, c) => layout.every((line) => isOpen(line[c])) ? ROAD_TRACK : PLOT_TRACK),
    MARGIN
  ]
  const rows = [MARGIN, ...layout.map((line) => [...line].every(isOpen) ? ROAD_TRACK : PLOT_TRACK), MARGIN]
  const colEdges = edges(cols)
  const rowEdges = edges(rows)
  const width = colEdges.at(-1)!
  const height = rowEdges.at(-1)!

  // One closed outline per group, traced along the outer edges of its cells, so
  // it runs 1mm outside the plot squares. Layout cell (c, r) sits in track
  // (c + 1, r + 1), after the margin.
  const isPlot = (c: number, r: number) => layout[r]?.[c] === "P"
  const at = (c: number, r: number): Pt => [colEdges[c + 1]!, rowEdges[r + 1]!]
  const segments: [Pt, Pt][] = []
  layout.forEach((line, r) => {
    ;[...line].forEach((_, c) => {
      if (!isPlot(c, r)) return
      if (!isPlot(c, r - 1)) segments.push([at(c, r), at(c + 1, r)])
      if (!isPlot(c, r + 1)) segments.push([at(c, r + 1), at(c + 1, r + 1)])
      if (!isPlot(c - 1, r)) segments.push([at(c, r), at(c, r + 1)])
      if (!isPlot(c + 1, r)) segments.push([at(c + 1, r), at(c + 1, r + 1)])
    })
  })

  // One claim per group, on the outside, centred on the group's plots that
  // face that side (so an L's claim lines up with its one outward plot).
  const claimPoints = plotGroups(layout).flatMap((group): Pt[] => {
    const cs = group.map((cell) => cell.c)
    const rs = group.map((cell) => cell.r)
    const [c0, c1, r0, r1] = [Math.min(...cs), Math.max(...cs), Math.min(...rs), Math.max(...rs)]
    const midY = (c: number) => {
      const facing = group.filter((cell) => cell.c === c).map((cell) => cell.r)
      return (rowEdges[Math.min(...facing) + 1]! + rowEdges[Math.max(...facing) + 2]!) / 2
    }
    const midX = (r: number) => {
      const facing = group.filter((cell) => cell.r === r).map((cell) => cell.c)
      return (colEdges[Math.min(...facing) + 1]! + colEdges[Math.max(...facing) + 2]!) / 2
    }
    const sides: Record<Side, Pt | undefined> = {
      W: c0 === 0 ? [CLAIM_INSET, midY(c0)] : undefined,
      E: c1 === columns - 1 ? [width - CLAIM_INSET, midY(c1)] : undefined,
      N: r0 === 0 ? [midX(r0), CLAIM_INSET] : undefined,
      S: r1 === layout.length - 1 ? [midX(r1), height - CLAIM_INSET] : undefined
    }
    // Beside the group's long side when it lies on the box edge.
    const order: Side[] = claimSide !== undefined
      ? [claimSide]
      : r1 - r0 >= c1 - c0
      ? ["W", "E", "N", "S"]
      : ["N", "S", "W", "E"]
    const pick = order.map((side) => sides[side]).find((pt) => pt !== undefined)
    return pick === undefined ? [] : [pick]
  })

  const plots = layout.flatMap((line, r) =>
    [...line].flatMap((ch, c) => (ch === "P" ? [{ row: r + 2, col: c + 2, rowSpan: 1 }] : []))
  )

  return {
    cols,
    rows,
    width,
    height,
    plots,
    groups: stitch(segments).map((chain) => chainToPath(chain, true)).join(" "),
    parts: plotGroups(layout).map((group) => group.length).sort((a, b) => a - b),
    claimPoints
  }
}

import { I10, I35, type LatLon } from "~/games/fiber/map/geography"
import type { LayoutNode, LayoutSpec, Side } from "~/games/fiber/map/layout"
import { CONTENT_MARGIN, FOLDS, LABEL, SHEET } from "~/games/fiber/map/map"

/**
 * Faces experiment (2026-11-15), forked from the regional map's towns and links: every town is one
 * 16mm square (the town is the Hub), and regions are the areas the links enclose rather than
 * Voronoi cells. Shares only the sheet, the solver and the traced highways with `map/map.ts`.
 */

/** Node: one Hub slot, `size` mm, in a `border` mm grey pad. */
export const NODE = { size: 15.5, border: 1 }
const PAD = NODE.size + 2 * NODE.border

/**
 * Regions the sheet edge leaves open but that are out of play, keyed by `faceKey` (shown on the
 * page with face labels on). Every other region touching the edge is closed by it.
 */
export const OFF_LIMITS: readonly string[] = [
  "blanco+boerne+drippingSprings+exit-dallas+ghost-bandera+helotes+leander+roundRock|edge"
]

export type Node = { id: string; name: string; at: LatLon; pinned?: true }

export const NODES: Node[] = [
  { id: "sanAntonio", name: "San Antonio", at: [29.4241, -98.4936], pinned: true },
  { id: "schertz", name: "Schertz", at: [29.5522, -98.2697] },
  { id: "boerne", name: "Boerne", at: [29.7947, -98.732] },
  { id: "helotes", name: "Helotes", at: [29.5783, -98.6897] },
  { id: "austin", name: "Austin", at: [30.2672, -97.7431], pinned: true },
  { id: "buda", name: "Buda", at: [30.0852, -97.8403] },
  { id: "drippingSprings", name: "Dripping Springs", at: [30.1902, -98.0867] },
  { id: "newBraunfels", name: "New Braunfels", at: [29.703, -98.1245] },
  { id: "seguin", name: "Seguin", at: [29.5688, -97.9647] },
  { id: "canyonLake", name: "Canyon Lake", at: [29.8752, -98.2625] },
  { id: "gonzales", name: "Gonzales", at: [29.5016, -97.4525] },
  { id: "roundRock", name: "Round Rock", at: [30.5083, -97.6789] },
  { id: "leander", name: "Leander", at: [30.5788, -97.8531] },
  { id: "sanMarcos", name: "San Marcos", at: [29.8833, -97.9414] },
  { id: "lockhart", name: "Lockhart", at: [29.8849, -97.67] },
  { id: "luling", name: "Luling", at: [29.6805, -97.6475] },
  { id: "elgin", name: "Elgin", at: [30.3496, -97.3703] },
  { id: "bastrop", name: "Bastrop", at: [30.1105, -97.3153] },
  { id: "wimberley", name: "Wimberley", at: [29.9974, -98.0986] },
  { id: "blanco", name: "Blanco", at: [30.098, -98.4214] }
]

export type Edge = { a: string; b: string; sides?: { a?: Side; b?: Side } }

export const EDGES: Edge[] = [
  { a: "austin", b: "roundRock" },
  { a: "austin", b: "leander", sides: { a: "w", b: "s" } },
  { a: "leander", b: "roundRock" },
  { a: "roundRock", b: "elgin" },
  { a: "austin", b: "elgin" },
  { a: "elgin", b: "bastrop" },
  { a: "bastrop", b: "lockhart" },
  { a: "austin", b: "buda", sides: { a: "s", b: "e" } },
  { a: "austin", b: "drippingSprings" },
  { a: "buda", b: "drippingSprings" },
  { a: "buda", b: "sanMarcos", sides: { a: "s", b: "n" } },
  { a: "buda", b: "lockhart", sides: { a: "e", b: "n" } },
  { a: "drippingSprings", b: "wimberley" },
  { a: "drippingSprings", b: "blanco", sides: { a: "n", b: "n" } },
  { a: "wimberley", b: "blanco" },
  { a: "wimberley", b: "sanMarcos" },
  { a: "wimberley", b: "canyonLake" },
  { a: "sanMarcos", b: "lockhart" },
  { a: "sanMarcos", b: "newBraunfels" },
  { a: "lockhart", b: "luling" },
  { a: "luling", b: "gonzales" },
  { a: "luling", b: "seguin" },
  { a: "gonzales", b: "seguin", sides: { a: "w", b: "s" } },
  { a: "newBraunfels", b: "seguin", sides: { a: "e", b: "n" } },
  { a: "seguin", b: "schertz" },
  { a: "newBraunfels", b: "canyonLake" },
  { a: "newBraunfels", b: "schertz", sides: { a: "w", b: "n" } },
  { a: "sanAntonio", b: "schertz", sides: { a: "n", b: "w" } },
  { a: "canyonLake", b: "boerne" },
  { a: "boerne", b: "helotes" },
  { a: "boerne", b: "blanco" },
  { a: "drippingSprings", b: "leander", sides: { a: "n", b: "w" } },
  { a: "helotes", b: "sanAntonio", sides: { a: "e", b: "n" } }
]

/** Backbone exits: a link from a town off the sheet along its interstate. They split the edge regions. */
export type Exit = { id: string; town: string; side: Side; highway: "i35" | "i10"; toward: "start" | "end" }

export const EXITS: Exit[] = [
  { id: "dallas", town: "roundRock", side: "n", highway: "i35", toward: "start" },
  { id: "houston", town: "luling", side: "e", highway: "i10", toward: "end" },
  { id: "laredo", town: "sanAntonio", side: "s", highway: "i35", toward: "end" }
]

export const exitNode = (exit: Exit) => `exit-${exit.id}`

/**
 * Barriers: a town's line run off the sheet toward `toward`, closing the regions either side like an
 * exit, but no link: no stick slot, and the far end is a ghost (no Hub). Drawn as terrain, not cable.
 */
export type Ghost = {
  id: string
  town: string
  toward: LatLon
  /** Side the escarpment ticks hang on, looking from the town toward the edge (default left): the low side. */
  ticks?: "left" | "right"
}

export const GHOSTS: Ghost[] = [
  { id: "floresville", town: "schertz", toward: [29.1336, -98.1561] },
  { id: "stockdale", town: "seguin", toward: [29.2366, -97.9603] },
  { id: "cuero", town: "gonzales", toward: [29.0936, -97.2892] },
  { id: "laGrange", town: "bastrop", toward: [29.9055, -96.8767] },
  { id: "bandera", town: "helotes", toward: [29.7266, -99.0734] }
]

export const ghostNode = (ghost: Ghost) => `ghost-${ghost.id}`

/**
 * Exit lines end this far in from the trim. No arrowhead is drawn here (the line runs on to the edge),
 * so they reach into the content margin; inside it, San Antonio's pinned exit was too short to pass.
 */
const EXIT_INSET = CONTENT_MARGIN / 2
const EXIT_MIN_RUN = 16
const FOLD_AIR = 2
const PORT_INSET = 3

/**
 * Advance widths (em) of the label face: system-ui semibold small caps, measured in Chromium on macOS
 * (SF Pro). Lower case is the small-cap form. A flat per-letter guess made long names' tabs ~30% too wide.
 */
const ADVANCE: Record<string, number> = {
  A: 0.673,
  B: 0.628,
  C: 0.704,
  D: 0.693,
  E: 0.566,
  F: 0.542,
  G: 0.72,
  H: 0.719,
  I: 0.251,
  J: 0.537,
  K: 0.636,
  L: 0.537,
  M: 0.851,
  N: 0.709,
  O: 0.746,
  P: 0.604,
  Q: 0.745,
  R: 0.626,
  S: 0.619,
  T: 0.595,
  U: 0.704,
  V: 0.663,
  W: 0.952,
  X: 0.668,
  Y: 0.647,
  Z: 0.626,
  a: 0.581,
  b: 0.542,
  c: 0.601,
  d: 0.592,
  e: 0.484,
  f: 0.464,
  g: 0.613,
  h: 0.618,
  i: 0.227,
  j: 0.471,
  k: 0.552,
  l: 0.459,
  m: 0.729,
  n: 0.605,
  o: 0.635,
  p: 0.522,
  q: 0.635,
  r: 0.542,
  s: 0.532,
  t: 0.506,
  u: 0.6,
  v: 0.569,
  w: 0.812,
  x: 0.577,
  y: 0.558,
  z: 0.533,
  " ": 0.2
}
/** Matches the label's `letterSpacing` on the page. */
export const LABEL_TRACKING = 0.15

/** Side padding inside a name tab; the regional map's `LABEL.padX` looked tight once widths were measured. */
const TAB_PAD_X = 3.5

function tabOf(name: string) {
  const text = [...name].reduce((w, c) => w + (ADVANCE[c] ?? 0.7) * LABEL.size + LABEL_TRACKING, 0)
  return { width: text + 2 * TAB_PAD_X, height: LABEL.size + 2 * LABEL.padY }
}

/** The square plus its name tab underneath: what the solver keeps clear. */
function nodeBox(node: Node) {
  const tab = tabOf(node.name)
  return { width: Math.max(PAD, tab.width), height: PAD + LABEL.gap + tab.height }
}

/** The pad and tab placed with the node box centred at `at`. */
export function padOf(node: Node, at: { x: number; y: number }) {
  const box = nodeBox(node)
  const top = at.y - box.height / 2
  const tab = tabOf(node.name)
  const tabTop = top + PAD + LABEL.gap
  return {
    left: at.x - PAD / 2,
    top,
    size: PAD,
    centre: { x: at.x, y: top + PAD / 2 },
    tab: { x: at.x - tab.width / 2, y: tabTop, ...tab },
    label: { x: at.x, y: tabTop + LABEL.padY + LABEL.size * 0.78 }
  }
}

function portsOf(node: Node) {
  const box = nodeBox(node)
  return {
    n: PAD - 2 * PORT_INSET,
    s: Math.max(tabOf(node.name).width - 2 * PORT_INSET, 8),
    ew: PAD - 2 * PORT_INSET,
    ewY: PAD / 2 - box.height / 2,
    sLift: box.height - PAD,
    ewHalf: PAD / 2
  }
}

const KM_PER_LAT = 111.32
const KM_PER_LON = KM_PER_LAT * Math.cos((30 * Math.PI) / 180)
const km = ([lat, lon]: LatLon) => ({ x: lon * KM_PER_LON, y: -lat * KM_PER_LAT })

/** Lat/lon to sheet mm, north up: the largest scale that fits every node box in the content area, centred. */
const PROJECTION = (() => {
  const boxes = NODES.map((n) => ({ ...km(n.at), ...nodeBox(n) }))
  type B = (typeof boxes)[number]
  const span = (lo: (b: B) => number, hi: (b: B) => number) => ({
    lo: Math.min(...boxes.map(lo)),
    hi: Math.max(...boxes.map(hi))
  })
  const fit = (pos: (b: B) => number, half: (b: B) => number, room: number) => {
    let s = 10
    for (let step = 5; step > 0.0005; step /= 2) {
      const { lo, hi } = span((b) => pos(b) * s - half(b), (b) => pos(b) * s + half(b))
      s += hi - lo <= room ? step : -step
    }
    return s
  }
  const room = { x: SHEET.width - 2 * CONTENT_MARGIN, y: SHEET.height - 2 * CONTENT_MARGIN }
  const mmPerKm = Math.min(fit((b) => b.x, (b) => b.width / 2, room.x), fit((b) => b.y, (b) => b.height / 2, room.y))
  const x = span((b) => b.x * mmPerKm - b.width / 2, (b) => b.x * mmPerKm + b.width / 2)
  const y = span((b) => b.y * mmPerKm - b.height / 2, (b) => b.y * mmPerKm + b.height / 2)
  return { mmPerKm, origin: { x: SHEET.width / 2 - (x.lo + x.hi) / 2, y: SHEET.height / 2 - (y.lo + y.hi) / 2 } }
})()

function project(at: LatLon) {
  const p = km(at)
  return { x: PROJECTION.origin.x + p.x * PROJECTION.mmPerKm, y: PROJECTION.origin.y + p.y * PROJECTION.mmPerKm }
}

const OPPOSITE: Record<Side, Side> = { n: "s", s: "n", e: "w", w: "e" }

/** Where an exit's highway, followed out from its town, comes within EXIT_INSET of the trim. */
export function exitEnd(exit: Exit) {
  const town = project(NODES.find((n) => n.id === exit.town)!.at)
  const traced = (exit.highway === "i35" ? I35 : I10).map(project)
  const line = exit.toward === "start" ? [...traced].reverse() : traced
  const box = {
    x0: EXIT_INSET,
    y0: EXIT_INSET,
    x1: SHEET.width - EXIT_INSET,
    y1: SHEET.height - EXIT_INSET
  }
  const inside = (p: { x: number; y: number }) => p.x >= box.x0 && p.x <= box.x1 && p.y >= box.y0 && p.y <= box.y1
  let from = 0
  line.forEach((p, i) => {
    if (Math.hypot(p.x - town.x, p.y - town.y) < Math.hypot(line[from]!.x - town.x, line[from]!.y - town.y)) from = i
  })
  for (let i = from; i + 1 < line.length; i++) {
    const p = line[i]!, q = line[i + 1]!
    if (inside(p) && !inside(q)) {
      let lo = 0, hi = 1
      for (let k = 0; k < 30; k++) {
        const t = (lo + hi) / 2
        if (inside({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t })) lo = t
        else hi = t
      }
      const at = { x: p.x + (q.x - p.x) * lo, y: p.y + (q.y - p.y) * lo }
      let back = i
      while (back > from && Math.hypot(line[back]!.x - at.x, line[back]!.y - at.y) < 15) back--
      const d = { x: at.x - line[back]!.x, y: at.y - line[back]!.y }
      const l = Math.hypot(d.x, d.y) || 1
      return { at, heading: { x: d.x / l, y: d.y / l } }
    }
  }
  throw new Error(`${exit.id}: ${exit.highway} never reaches the content border`)
}

/** Where a ghost's straight line from its town toward `toward` comes within EXIT_INSET of the trim. */
export function ghostEnd(ghost: Ghost) {
  const town = project(NODES.find((n) => n.id === ghost.town)!.at)
  const far = project(ghost.toward)
  const l = Math.hypot(far.x - town.x, far.y - town.y)
  const heading = { x: (far.x - town.x) / l, y: (far.y - town.y) / l }
  const ts = [
    heading.x > 0
      ? (SHEET.width - EXIT_INSET - town.x) / heading.x
      : heading.x < 0
      ? (EXIT_INSET - town.x) / heading.x
      : Infinity,
    heading.y > 0
      ? (SHEET.height - EXIT_INSET - town.y) / heading.y
      : heading.y < 0
      ? (EXIT_INSET - town.y) / heading.y
      : Infinity
  ]
  const t = Math.min(...ts)
  if (t > l) throw new Error(`${ghost.id}: aim it past the sheet edge`)
  return { at: { x: town.x + heading.x * t, y: town.y + heading.y * t }, heading }
}

/** Every line that runs off the sheet: backbone exits and barriers alike end at a pinned point and carry on to the trim. */
export const RAYS = [
  ...EXITS.map((x) => ({ node: exitNode(x), town: x.town, kind: "exit" as const, side: x.side, ...exitEnd(x) })),
  ...GHOSTS.map((g) => {
    const end = ghostEnd(g)
    const { x, y } = end.heading
    const side: Side = Math.abs(x) > Math.abs(y) ? (x > 0 ? "e" : "w") : y > 0 ? "s" : "n"
    return { node: ghostNode(g), town: g.town, kind: "ghost" as const, side, ticks: g.ticks ?? "left", ...end }
  })
]

export const LAYOUT_SPEC: LayoutSpec = {
  width: SHEET.width,
  height: SHEET.height,
  nodes: [
    ...NODES.map((n): LayoutNode => ({
      id: n.id,
      ...nodeBox(n),
      ports: portsOf(n),
      target: project(n.at),
      ...(n.pinned ? { pinned: true } : {})
    })),
    ...RAYS.map((r): LayoutNode => ({
      id: r.node,
      width: 1,
      height: 1,
      target: r.at,
      pinned: true,
      ports: { n: 0, s: 0, ew: 0, ewY: 0 }
    }))
  ],
  edges: [
    ...EDGES,
    ...RAYS.map((r) => ({
      a: r.town,
      b: r.node,
      sides: { a: r.side, b: OPPOSITE[r.side] },
      bearing: { x: -r.heading.x, y: -r.heading.y },
      minSpan: EXIT_MIN_RUN
    }))
  ],
  margin: CONTENT_MARGIN,
  idealSpan: 44,
  folds: { ...FOLDS, clear: SHEET.fold / 2 + FOLD_AIR }
}

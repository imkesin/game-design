import { SHEETS } from "~/shared/print/boards/sheets"
import { I10, I35, type LatLon } from "./geography"
import type { LayoutNode, LayoutSpec, Side } from "./layout"

/**
 * The Fiber 2–3 player map: 20 towns, every size in millimetres, drawn at 1:1. The 2p core is
 * 32 Hub slots : 16 nodes : 24 links; the 3p fringe adds 8 : 4 : 6 (COMPONENTS.md). Towns sit at
 * their real lat/lon through one north-up projection (`project`), shared with I-35 and the rivers;
 * Austin and San Antonio are pinned there, the rest are pulled toward it by `layout.ts`.
 */

export const IN = 25.4

const BOARD = SHEETS.quadFold

/** The Game Crafter 20×20in quad-fold, trim size. Bleed, safe zone and fold band come with it. */
export const SHEET = {
  width: BOARD.tile.width * BOARD.panels.cols,
  height: BOARD.tile.height * BOARD.panels.rows,
  bleed: BOARD.bleed,
  safe: BOARD.safe,
  fold: BOARD.fold,
  template: BOARD.template
}

/** Where the board folds: down the middle and across it. Nothing with a slot may sit in the band. */
export const FOLDS = { x: [SHEET.width / 2], y: [SHEET.height / 2] }

/**
 * Keep-out from the trim on the outer edges: each 10in panel holds its map in 9 × 9in, anchored to
 * the folds, so the outer edges get a full inch of room.
 */
export const CONTENT_MARGIN = IN

/** Extra air between the fold band and any pad or stick slot. */
const FOLD_AIR = 2

export const PIECE = {
  terminal: 16,
  hub: 12,
  stick: { length: 20, width: 5 }
}

/** Slots are the exact piece footprint; 2mm between them. */
export const SLOT = { terminal: PIECE.terminal, hub: PIECE.hub, between: 2 }
const PITCH = SLOT.hub + SLOT.between

/** Exact stick footprint inside a 1mm flat border, so it reads as a place to put a piece. The border is rounder (1mm) than the rest of the board. */
export const STICK_SLOT = { length: PIECE.stick.length, width: PIECE.stick.width, border: 1, radius: 1 }

/** `inset`: the flat border around the slots. The name is a label centred below the pad. */
const PAD = { inset: 2 }
/** Name label: a box in the pad's color, `gap` mm below the pad. */
export const LABEL = { gap: 1, size: 4, padX: 2, padY: 0.9 }

/** Corner radius for every rectangle on the map: just off a hard edge. */
export const CORNER = 0.5

export type RegionId =
  | "colorado"
  | "lowerColorado"
  | "blanco"
  | "sanMarcos"
  | "guadalupe"
  | "sanAntonio"
  | "williamson"

/**
 * River valleys (2026-11-12): most towns sit on a river, so a river is a region's spine, not its
 * border. A town off the drawn rivers joins the valley its creek drains to (Buda: Onion Creek and
 * Dripping Springs: Barton Creek, to the Colorado; Lockhart: Plum Creek to the San Marcos; Schertz
 * and Boerne: Cibolo Creek, Helotes: Helotes Creek, to the San Antonio). Williamson keeps its county
 * name: its rivers aren't drawn.
 *
 * Seven regions holding 3, 4, 5, 6, 7, 8 and 9 Hub slots (42), Hubs loosely by population.
 */
export const REGIONS: Record<RegionId, { name: string }> = {
  colorado: { name: "Colorado" },
  lowerColorado: { name: "Lower Colorado" },
  blanco: { name: "Blanco" },
  sanMarcos: { name: "San Marcos" },
  guadalupe: { name: "Guadalupe" },
  sanAntonio: { name: "San Antonio" },
  williamson: { name: "Williamson" }
}

export type Node = {
  id: string
  name: string
  region: RegionId
  /** Hub slots. Terminal slot is always 1. */
  hubs: 1 | 2 | 3 | 4
  /** In play only at this player count or more: the fringe. */
  minPlayers?: 3
  /** The real town centre. The layout pulls the pad toward it. */
  at: LatLon
  /** Sits exactly on its real spot; the layout never moves it. */
  pinned?: true
}

/**
 * Towns too close to a neighbour for two pads and a stick were dropped (2026-11-12): Pflugerville,
 * Kyle, Georgetown, Manor. Elgin, Blanco, Gonzales, Taylor and Leander fill open ground.
 * One board for 2–3 players (2026-11-12): the fringe is folded in; player count scales on the mat.
 */
export const NODES: Node[] = [
  // San Antonio 9
  { id: "sanAntonio", name: "San Antonio", region: "sanAntonio", hubs: 4, at: [29.4241, -98.4936], pinned: true },
  { id: "schertz", name: "Schertz", region: "sanAntonio", hubs: 2, at: [29.5522, -98.2697] },
  { id: "boerne", name: "Boerne", region: "sanAntonio", hubs: 2, at: [29.7947, -98.732] },
  { id: "helotes", name: "Helotes", region: "sanAntonio", hubs: 1, at: [29.5783, -98.6897] },
  // Colorado 8
  { id: "austin", name: "Austin", region: "colorado", hubs: 4, at: [30.2672, -97.7431], pinned: true },
  { id: "buda", name: "Buda", region: "colorado", hubs: 2, at: [30.0852, -97.8403] },
  { id: "drippingSprings", name: "Dripping Springs", region: "colorado", hubs: 2, at: [30.1902, -98.0867] },
  // Guadalupe 7
  { id: "newBraunfels", name: "New Braunfels", region: "guadalupe", hubs: 3, at: [29.703, -98.1245] },
  { id: "seguin", name: "Seguin", region: "sanMarcos", hubs: 2, at: [29.5688, -97.9647] },
  { id: "canyonLake", name: "Canyon Lake", region: "guadalupe", hubs: 1, at: [29.8752, -98.2625] },
  { id: "gonzales", name: "Gonzales", region: "sanMarcos", hubs: 1, at: [29.5016, -97.4525] },
  // Williamson 6
  { id: "roundRock", name: "Round Rock", region: "williamson", hubs: 3, at: [30.5083, -97.6789] },
  { id: "leander", name: "Leander", region: "williamson", hubs: 2, at: [30.5788, -97.8531] },
  { id: "taylor", name: "Taylor", region: "williamson", hubs: 1, at: [30.5708, -97.4092] },
  // San Marcos 5
  { id: "sanMarcos", name: "San Marcos", region: "guadalupe", hubs: 3, at: [29.8833, -97.9414] },
  { id: "lockhart", name: "Lockhart", region: "sanMarcos", hubs: 1, at: [29.8849, -97.67] },
  { id: "luling", name: "Luling", region: "sanMarcos", hubs: 1, at: [29.6805, -97.6475] },
  // Lower Colorado 4
  { id: "elgin", name: "Elgin", region: "lowerColorado", hubs: 2, at: [30.3496, -97.3703] },
  { id: "bastrop", name: "Bastrop", region: "lowerColorado", hubs: 2, at: [30.1105, -97.3153] },
  // Blanco 3
  { id: "wimberley", name: "Wimberley", region: "blanco", hubs: 2, at: [29.9974, -98.0986] },
  { id: "blanco", name: "Blanco", region: "blanco", hubs: 1, at: [30.098, -98.4214] }
]

/** A link. Costs were printed as 1–3 dots; dropped 2026-11-11 until the cost rule exists. */
/** `sides`: pin which side of a town the link leaves from, when the solver's pick reads wrong. */
export type Edge = { a: string; b: string; sides?: { a?: Side; b?: Side } }

export const EDGES: Edge[] = [
  // 32 links.
  { a: "austin", b: "roundRock" },
  { a: "austin", b: "leander" },
  { a: "leander", b: "roundRock" },
  { a: "roundRock", b: "taylor" },
  { a: "taylor", b: "elgin" },
  { a: "austin", b: "elgin" },
  { a: "elgin", b: "bastrop" },
  { a: "bastrop", b: "lockhart" },
  { a: "austin", b: "buda" },
  { a: "austin", b: "drippingSprings" },
  { a: "buda", b: "drippingSprings" },
  { a: "buda", b: "sanMarcos", sides: { a: "s", b: "n" } },
  { a: "buda", b: "lockhart" },
  { a: "drippingSprings", b: "wimberley" },
  { a: "drippingSprings", b: "blanco" },
  { a: "wimberley", b: "blanco" },
  { a: "wimberley", b: "sanMarcos" },
  { a: "wimberley", b: "canyonLake" },
  { a: "sanMarcos", b: "lockhart" },
  { a: "sanMarcos", b: "newBraunfels" },
  { a: "lockhart", b: "luling" },
  { a: "luling", b: "gonzales" },
  { a: "luling", b: "seguin" },
  { a: "gonzales", b: "seguin" },
  { a: "newBraunfels", b: "seguin", sides: { a: "e", b: "n" } },
  { a: "seguin", b: "schertz" },
  { a: "newBraunfels", b: "canyonLake" },
  { a: "newBraunfels", b: "schertz" },
  { a: "sanAntonio", b: "schertz", sides: { a: "n", b: "w" } },
  { a: "canyonLake", b: "boerne" },
  { a: "boerne", b: "helotes" },
  { a: "helotes", b: "sanAntonio" }
]

/**
 * Backbone exits (2026-11-12): where the interstates leave the map, a town connects to the wider
 * internet. Drawn as a cable line with an arrow off the board and a backbone symbol; a player may
 * start building from one of them. Rules TBD.
 */
export type Exit = {
  id: string
  town: string
  to: string
  /** The side of the town the line leaves from. */
  side: Side
  /** The highway it follows off the board, and which way along its traced points. */
  highway: "i35" | "i10"
  toward: "start" | "end"
}

export const EXITS: Exit[] = [
  { id: "dallas", town: "roundRock", to: "Dallas", side: "n", highway: "i35", toward: "start" },
  { id: "houston", town: "luling", to: "Houston", side: "e", highway: "i10", toward: "end" },
  { id: "laredo", town: "sanAntonio", to: "Laredo", side: "s", highway: "i35", toward: "end" }
]

/** Room (mm) left inside the content border for the arrowhead past an exit line's end. */
export const EXIT_ROOM = 8

/** Least run for an exit line: room for its backbone badge with air either side. */
const EXIT_MIN_RUN = 16

export const exitNode = (exit: Exit) => `exit-${exit.id}`
export const isExitNode = (id: string) => id.startsWith("exit-")

/** A link is in the fringe when either end is. */
export const isFringe = (id: string) => NODES.find((n) => n.id === id)?.minPlayers !== undefined
export const edgeIsFringe = (e: { a: string; b: string }) => isFringe(e.a) || isFringe(e.b)

/**
 * The slot area, relative to its top-left: one row as tall as the Terminal slot, Terminal left,
 * Hubs (max 4) built out to its right.
 */
export function slotsOf(hubs: Node["hubs"]) {
  const height = SLOT.terminal
  return {
    width: SLOT.terminal + hubs * PITCH,
    height,
    terminal: { x: 0, y: 0 },
    hubs: Array.from({ length: hubs }, (_, k) => ({
      cx: SLOT.terminal + SLOT.between + k * PITCH + SLOT.hub / 2,
      cy: height / 2
    }))
  }
}

export function padSize(hubs: Node["hubs"]) {
  const slots = slotsOf(hubs)
  return { width: slots.width + 2 * PAD.inset, height: slots.height + 2 * PAD.inset }
}

/** Name tab size. Width is estimated from character count (no text metrics at layout time). */
function tabOf(name: string) {
  return { width: name.length * LABEL.size * 0.7 + 2 * LABEL.padX, height: LABEL.size + 2 * LABEL.padY }
}

/** What the layout keeps clear: the pad plus its name tab underneath. */
export function nodeBox(node: Node) {
  const pad = padSize(node.hubs)
  const tab = tabOf(node.name)
  return { width: Math.max(pad.width, tab.width), height: pad.height + LABEL.gap + tab.height }
}

/** Keep ports this far in from a pad's corners, and from the label's ends. */
const PORT_INSET = 3

/**
 * Where links attach: north along the pad's top, south along the label's bottom, east and west level
 * with the pad's middle.
 */
function portsOf(node: Node) {
  const pad = padSize(node.hubs)
  const box = nodeBox(node)
  return {
    n: pad.width - 2 * PORT_INSET,
    s: Math.max(tabOf(node.name).width - 2 * PORT_INSET, 8),
    ew: pad.height - 2 * PORT_INSET,
    ewY: pad.height / 2 - box.height / 2,
    sLift: box.height - pad.height,
    ewHalf: pad.width / 2
  }
}

/** A pad placed with its node box centred at `at`. */
export function padOf(node: Node, at: { x: number; y: number }) {
  const slots = slotsOf(node.hubs)
  const { width, height } = padSize(node.hubs)
  const left = at.x - width / 2
  const top = at.y - nodeBox(node).height / 2
  const tab = tabOf(node.name)
  const tabTop = top + height + LABEL.gap
  return {
    left,
    top,
    width,
    height,
    slots,
    slotsLeft: left + PAD.inset,
    slotsTop: top + PAD.inset,
    tab: { x: at.x - tab.width / 2, y: tabTop, ...tab },
    label: { x: at.x, y: tabTop + LABEL.padY + LABEL.size * 0.78 }
  }
}

/** Equirectangular around 30°N: km east and south of 0°, 0°. Good to well under 1% over 100 miles. */
const KM_PER_LAT = 111.32
const KM_PER_LON = KM_PER_LAT * Math.cos((30 * Math.PI) / 180)
const km = ([lat, lon]: LatLon) => ({ x: lon * KM_PER_LON, y: -lat * KM_PER_LAT })

/** Lat/lon to sheet mm, north up: the largest scale that fits every town's box (pad and label) in the content area, centred. */
export const PROJECTION = (() => {
  const boxes = NODES.map((n) => ({ ...km(n.at), ...nodeBox(n) }))
  const span = (lo: (b: (typeof boxes)[number]) => number, hi: (b: (typeof boxes)[number]) => number) => ({
    lo: Math.min(...boxes.map(lo)),
    hi: Math.max(...boxes.map(hi))
  })
  // Width needed at scale s is (centre spread) * s + (box overhang), so solve s per axis.
  const fit = (
    pos: (b: (typeof boxes)[number]) => number,
    half: (b: (typeof boxes)[number]) => number,
    room: number
  ) => {
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

export function project(at: LatLon) {
  const p = km(at)
  return { x: PROJECTION.origin.x + p.x * PROJECTION.mmPerKm, y: PROJECTION.origin.y + p.y * PROJECTION.mmPerKm }
}

const OPPOSITE: Record<Side, Side> = { n: "s", s: "n", e: "w", w: "e" }

/**
 * Where an exit line ends and which way it points: where its highway, followed out from the town,
 * comes within `EXIT_ROOM` of the content border. Everything drawn for an exit stays inside it.
 */
export function exitEnd(exit: Exit) {
  const town = project(NODES.find((n) => n.id === exit.town)!.at)
  const traced = (exit.highway === "i35" ? I35 : I10).map(project)
  const line = exit.toward === "start" ? [...traced].reverse() : traced
  const box = {
    x0: CONTENT_MARGIN + EXIT_ROOM,
    y0: CONTENT_MARGIN + EXIT_ROOM,
    x1: SHEET.width - CONTENT_MARGIN - EXIT_ROOM,
    y1: SHEET.height - CONTENT_MARGIN - EXIT_ROOM
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
      // Heading over the last ~15mm, so a wiggle at the border doesn't skew the arrow.
      let back = i
      while (back > from && Math.hypot(line[back]!.x - at.x, line[back]!.y - at.y) < 15) back--
      const d = { x: at.x - line[back]!.x, y: at.y - line[back]!.y }
      const l = Math.hypot(d.x, d.y) || 1
      return { at, heading: { x: d.x / l, y: d.y / l } }
    }
  }
  throw new Error(`${exit.id}: ${exit.highway} never reaches the content border`)
}

/** A pinned point the exit line runs to, so the solver routes and clears it like any link. */
const exitLayoutNode = (exit: Exit): LayoutNode => ({
  id: exitNode(exit),
  width: 1,
  height: 1,
  target: exitEnd(exit).at,
  pinned: true,
  ports: { n: 0, s: 0, ew: 0, ewY: 0 }
})

export const LAYOUT_SPEC: LayoutSpec = {
  ...SHEET,
  nodes: [
    ...NODES.map((n): LayoutNode => ({
      id: n.id,
      group: n.region,
      ...nodeBox(n),
      ports: portsOf(n),
      target: project(n.at),
      ...(n.pinned ? { pinned: true } : {})
    })),
    ...EXITS.map(exitLayoutNode)
  ],
  edges: [
    ...EDGES,
    ...EXITS.map((x) => {
      const { heading } = exitEnd(x)
      return {
        a: x.town,
        b: exitNode(x),
        sides: { a: x.side, b: OPPOSITE[x.side] },
        bearing: { x: -heading.x, y: -heading.y },
        minSpan: EXIT_MIN_RUN
      }
    })
  ],
  margin: CONTENT_MARGIN,
  idealSpan: 44,
  folds: { ...FOLDS, clear: SHEET.fold / 2 + FOLD_AIR }
}

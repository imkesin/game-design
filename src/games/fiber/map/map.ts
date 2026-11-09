import type { LayoutSpec } from "./layout"

/**
 * The Fiber test map: 5 nodes, 2 regions, every size in millimetres, drawn at 1:1.
 * Piece sizes are in COMPONENTS.md. Costs and Hub counts are provisional. Node positions are
 * soft targets; `layout.ts` solves the final spots and the curved links.
 */

export const IN = 25.4

/** The test sheet: a 10in square. */
export const SHEET = { width: 10 * IN, height: 10 * IN }

export const PIECE = {
  terminal: 20,
  hub: 15,
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

export type RegionId = "north" | "south" | "east"

export const REGIONS: Record<RegionId, { name: string }> = {
  north: { name: "North" },
  south: { name: "South" },
  east: { name: "East" }
}

export type Node = {
  id: string
  name: string
  region: RegionId
  /** Hub slots. Terminal slot is always 1. */
  hubs: 1 | 2 | 3
  /** Where the pad wants to sit, as % of the sheet (x from the left, y from the top). */
  target: { x: number; y: number }
}

export const NODES: Node[] = [
  { id: "austin", name: "Austin", region: "north", hubs: 3, target: { x: 68, y: 14 } },
  { id: "buda", name: "Buda", region: "north", hubs: 1, target: { x: 55, y: 36 } },
  { id: "sanMarcos", name: "San Marcos", region: "north", hubs: 2, target: { x: 38, y: 55 } },
  { id: "newBraunfels", name: "New Braunfels", region: "south", hubs: 2, target: { x: 58, y: 72 } },
  { id: "sanAntonio", name: "San Antonio", region: "south", hubs: 3, target: { x: 32, y: 88 } },
  { id: "lockhart", name: "Lockhart", region: "east", hubs: 1, target: { x: 88, y: 42 } },
  { id: "seguin", name: "Seguin", region: "east", hubs: 1, target: { x: 88, y: 76 } }
]

/** Cost tier, printed as dots in the stick slot (covered once built). Dollar values per tier: TBD. */
export type Edge = { a: string; b: string; cost: 1 | 2 | 3 }

export const EDGES: Edge[] = [
  { a: "austin", b: "buda", cost: 1 },
  { a: "buda", b: "sanMarcos", cost: 1 },
  { a: "sanMarcos", b: "newBraunfels", cost: 2 },
  { a: "newBraunfels", b: "sanAntonio", cost: 2 },
  { a: "sanMarcos", b: "sanAntonio", cost: 3 },
  { a: "buda", b: "lockhart", cost: 1 },
  { a: "lockhart", b: "seguin", cost: 2 },
  { a: "newBraunfels", b: "seguin", cost: 1 }
]

/** Dot pitch along the stick slot, and dot radius. */
export const COST_DOT = { pitch: 5, r: 1.1 }

/**
 * The slot area, relative to its top-left: one row as tall as the Terminal slot, Terminal left,
 * Hubs (max 3) built out to its right.
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

export const LAYOUT_SPEC: LayoutSpec = {
  ...SHEET,
  nodes: NODES.map((n) => ({
    id: n.id,
    group: n.region,
    ...nodeBox(n),
    target: { x: (n.target.x / 100) * SHEET.width, y: (n.target.y / 100) * SHEET.height }
  })),
  edges: EDGES.map(({ a, b }) => ({ a, b }))
}

import { type TileFace, TILES } from "../tiles/tiles.ts"
import { type Players, QUADRANT_SIZE, type SetupCard } from "./setupCard.ts"
import { SETUP_CARDS } from "./setupCards.ts"

/**
 * A random setup, dealt as RULES.md's Setup says: 4 setup cards, one per
 * quadrant, each read upright, and the buildings badged for the player count
 * placed.
 */

/** A tile on a plot; `cube` for a historical House or Commercial, which starts with its cube. */
export type Placed = { face: TileFace; cube?: "house" | "commercial" }

/** The quadrants clockwise from the north-west, with their top-left plots. */
const CORNERS = {
  NW: [0, 0],
  NE: [QUADRANT_SIZE, 0],
  SE: [QUADRANT_SIZE, QUADRANT_SIZE],
  SW: [0, QUADRANT_SIZE]
} as const

export const QUADRANTS = Object.keys(CORNERS) as readonly (keyof typeof CORNERS)[]

export type Setup = {
  /** Placed tiles, keyed `${x},${y}`: plots from the board's top-left. */
  plots: ReadonlyMap<string, Placed>
  /** The card dealt to each quadrant, in `QUADRANTS` order. */
  cards: readonly SetupCard[]
}

function shuffle<T>(list: readonly T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j] as T, out[i] as T]
  }
  return out
}

/** A historical building's tile; a Park is a supply Park, finished side up. */
const historicalOf = (piece: SetupCard["buildings"][number]["piece"]): Placed => {
  const face = piece === "park"
    ? TILES.find(({ a }) => a.kind === "park")?.b
    : TILES.find(({ a }) => a.kind === piece && a.historical === true)?.a
  if (face === undefined) throw new Error(`no historical ${piece} tile`)
  return { face, ...(piece === "house" || piece === "commercial" ? { cube: piece } : {}) }
}

export function deal(players: Players): Setup {
  const cards = shuffle(SETUP_CARDS).slice(0, QUADRANTS.length)
  const plots = new Map<string, Placed>()
  cards.forEach((card, i) => {
    const [left, top] = CORNERS[QUADRANTS[i] ?? "NW"]
    card.buildings.forEach(({ piece, at: [col, row], upTo }) => {
      if (players > upTo) return
      plots.set(`${left + col},${top + row}`, historicalOf(piece))
    })
  })
  return { plots, cards }
}

import type { LayoutName } from "../blocks/blocks.ts"
import { type TileFace, TILES } from "../tiles/tiles.ts"
import { BLIGHT_CARDS } from "./blightCards.ts"
import { HISTORICAL_CARDS } from "./historicalCards.ts"
import type { Piece, SetupCard } from "./setupCard.ts"

/**
 * A random setup, dealt as RULES.md's Setup says: blight cards along the west
 * (rows) and north (columns), historical cards (2–3 players) along the east
 * and south, and the mayor on a random neighborhood. `size` neighborhoods a
 * side: on a smaller city each card's entries past it are dropped. `inCity`
 * cuts neighborhoods out of the square (their pieces are dropped too). On
 * 2 × 2 blocks, a preview: each card places only an entry's first blight
 * (the rest don't fit). Rows count from the bottom, as on the board.
 */

export type Players = 2 | 3 | 4 | 5

/** A tile on a plot; `cube` for a historical House or Commercial, which starts with its cube. */
export type Placed = { face: TileFace; cube?: "house" | "commercial" }

export type Setup = {
  /** Each neighborhood's plots, keyed `${row},${col}`, indexed like its layout's plots. */
  plots: ReadonlyMap<string, readonly (Placed | undefined)[]>
  /** Where the mayor starts; `plot` for a block with no plaza, where he stands on one. */
  mayor: { row: number; col: number; plot: number }
}

type Line = "row" | "col"

/**
 * Plot indices a card fills. Ring: a row card the top 3 (left to right) and
 * left-middle, a column card the bottom 3 and right-middle. 2 × 2: a row card
 * the top row, a column card the bottom.
 */
const SLOTS = {
  ring: { row: { blight: [0, 1, 2], historical: 7 }, col: { blight: [6, 5, 4], historical: 3 } },
  square: { row: { blight: [0], historical: 1 }, col: { blight: [2], historical: 3 } }
} as const satisfies Record<LayoutName, Record<Line, { blight: readonly number[]; historical: number }>>

/** The neighborhood at entry `entry` of line `line`, counted from the card's edge, on a city `n` a side. */
const EDGES = {
  blight: {
    row: (_: number, line: number, entry: number) => [line, entry],
    col: (n: number, line: number, entry: number) => [n - 1 - entry, line]
  },
  historical: {
    row: (n: number, line: number, entry: number) => [line, n - 1 - entry],
    col: (_: number, line: number, entry: number) => [entry, line]
  }
} as const satisfies Record<
  SetupCard["deck"],
  Record<Line, (n: number, line: number, entry: number) => readonly [number, number]>
>

function shuffle<T>(list: readonly T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j] as T, out[i] as T]
  }
  return out
}

const faceOf = (find: (f: TileFace) => boolean): TileFace => {
  const tile = TILES.find(({ a }) => find(a))
  if (tile === undefined) throw new Error("no such tile")
  return tile.a
}

const placedOf = (deck: SetupCard["deck"], piece: Piece): Placed =>
  deck === "historical"
    ? {
      face: faceOf((f) => f.kind === piece && f.historical === true),
      ...(piece === "house" || piece === "commercial" ? { cube: piece } : {})
    }
    : { face: faceOf((f) => f.kind === piece && f.side === "dark") }

export function deal(
  players: Players,
  size = 4,
  inCity: (row: number, col: number) => boolean = () => true,
  layout: LayoutName = "ring"
): Setup {
  const slots = SLOTS[layout]
  const plotCount = layout === "ring" ? 8 : 4
  const plots = new Map<string, (Placed | undefined)[]>()

  /** Shuffle a deck, deal one card per row then per column, and place each kept entry's pieces. */
  const lay = (cards: readonly SetupCard[], keep: (card: SetupCard, entry: number) => boolean) =>
    shuffle(cards).slice(0, 2 * size).forEach((card, n) => {
      const [along, line]: [Line, number] = n < size ? ["row", n] : ["col", n - size]
      card.entries.forEach((pieces, entry) => {
        if (entry >= size || !keep(card, entry)) return
        const [row, col] = EDGES[card.deck][along](size, line, entry)
        if (!inCity(row, col)) return
        const key = `${row},${col}`
        const ring = plots.get(key) ?? Array.from({ length: plotCount }, () => undefined)
        pieces.forEach((piece, i) => {
          const slot = card.deck === "blight" ? slots[along].blight[i] : slots[along].historical
          if (slot !== undefined) ring[slot] = placedOf(card.deck, piece)
        })
        plots.set(key, ring)
      })
    })

  lay(BLIGHT_CARDS, () => true)
  if (players === 2) lay(HISTORICAL_CARDS, () => true)
  if (players === 3) lay(HISTORICAL_CARDS, (card, entry) => card.atThree?.[entry] === true)

  const city = Array.from({ length: size * size }, (_, i) => ({ row: Math.floor(i / size), col: i % size }))
    .filter(({ row, col }) => inCity(row, col))
  const at = city[Math.floor(Math.random() * city.length)] ?? { row: 0, col: 0 }
  return { plots, mayor: { ...at, plot: Math.floor(Math.random() * plotCount) } }
}

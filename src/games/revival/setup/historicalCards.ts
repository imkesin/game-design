import type { Piece, SetupCard } from "./setupCard.ts"

/** The historical setup cards, draft of 2026-10-17; names are placeholders. */

/** A historical building, and whether it's placed at 3 players too (every one is at 2). */
type Building = { piece: Piece; atThree: boolean }

const H = { piece: "house", atThree: false } as const
const C = { piece: "commercial", atThree: false } as const
const I = { piece: "industrial", atThree: false } as const
const H3 = { ...H, atThree: true } as const
const C3 = { ...C, atThree: true } as const
const I3 = { ...I, atThree: true } as const
const __ = undefined

type Entries4<T> = readonly [T, T, T, T]

const map4 = <T, U>([a, b, c, d]: Entries4<T>, f: (t: T) => U): Entries4<U> => [f(a), f(b), f(c), f(d)]

const card = (name: string, buildings: Entries4<Building | undefined>): SetupCard => ({
  deck: "historical",
  name,
  entries: map4(buildings, (b) => (b === undefined ? [] : [b.piece])),
  atThree: map4(buildings, (b) => b?.atThree ?? false)
})

/**
 * One deck for 2 and 3 players. At 2: all 18 (10 House / 6 Commercial / 2
 * Industrial), spread 5 / 4 / 4 / 5 over entries 1–4. At 3: only the 12
 * badged ones (7 / 4 / 1), exactly 3 per entry, so neither count favors a
 * quarter of the city. At most 1 per entry.
 */
export const HISTORICAL_CARDS: readonly SetupCard[] = [
  card("Founders Row", [H, C3, __, H3]),
  card("Guild Street", [C3, __, H3, I]),
  card("Chapel Lane", [__, H3, C3, __]),
  card("Old Quarter", [H3, __, __, H]),
  card("Exchange Place", [__, C, __, H3]),
  card("Brick Row", [H, __, C, __]),
  card("Wharf Street", [__, __, I3, H3]),
  card("Arcade Walk", [C3, H3, __, __])
]

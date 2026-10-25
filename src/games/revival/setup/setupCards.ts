import type { Historical, Piece, Players, SetupCard } from "./setupCard.ts"

/** The setup cards, draft of 2026-10-25; names are placeholders. */

/** A building at (column, row), placed up to `upTo` players. */
const building = (piece: Piece) => (col: number, row: number, upTo: Players): Historical => ({
  piece,
  at: [col, row],
  upTo
})

const H = building("house")
const C = building("commercial")
const I = building("industrial")
const P = building("park")

const card = (name: string, ...buildings: Historical[]): SetupCard => ({ name, buildings })

/**
 * 8 cards, 4 dealt. Each places 5: three at every count, one up to 4 players
 * (half the deck) or up to 3 (the other half), one at 2 only. So 12 at 5P,
 * 12–16 at 4P (14 on average), 16 at 3P, 20 at 2P. 17 House / 15 Commercial
 * / 4 Industrial / 4 Park over the deck; nothing in a corner, and at most one
 * building a block at 5P, in any quadrant. Parks sit in the inner 3 × 3, which
 * lands in a 2 × 2 block in every quadrant, never sharing it with a House.
 */
export const SETUP_CARDS: readonly SetupCard[] = [
  card("Founders Row", H(0, 1, 5), C(2, 1, 5), H(4, 1, 5), C(1, 0, 4), H(2, 3, 2)),
  card("Guild Street", C(3, 0, 5), P(3, 2, 5), I(3, 4, 5), H(1, 1, 3), C(1, 4, 2)),
  card("Chapel Lane", P(3, 3, 5), C(1, 4, 5), H(4, 1, 5), H(1, 2, 4), C(0, 2, 2)),
  card("Old Quarter", H(2, 0, 5), C(0, 2, 5), P(3, 3, 5), H(3, 0, 3), C(1, 1, 2)),
  card("Exchange Place", C(2, 2, 5), H(4, 1, 5), H(1, 4, 5), C(4, 3, 4), H(0, 3, 2)),
  card("Brick Row", I(2, 4, 5), H(1, 0, 5), C(3, 1, 5), H(1, 4, 3), C(3, 3, 2)),
  card("Wharf Street", H(3, 0, 5), I(2, 3, 5), H(0, 1, 5), C(2, 1, 4), H(4, 2, 2)),
  card("Arcade Walk", P(1, 1, 5), C(4, 3, 5), H(0, 3, 5), C(2, 0, 3), I(3, 2, 2))
]

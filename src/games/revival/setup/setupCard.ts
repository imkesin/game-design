import { CITY } from "../blocks/city.ts"

/**
 * The setup cards (DESIGN.md, Setup cards): each a 5 × 5 map of historical
 * buildings, its corners always empty (City Hall's notch or a board corner,
 * whichever quadrant it lands in). Deal 4, one per quadrant, read upright.
 * There's no blight: every blank plot is run down.
 */

/** A building type a setup card places. */
export type Piece = "house" | "commercial" | "industrial" | "park"

export type Players = 2 | 3 | 4 | 5

/**
 * A historical building: its plot as (column, row) from its quadrant's
 * top-left; `upTo` is the most players it's placed at.
 */
export type Historical = { piece: Piece; at: readonly [number, number]; upTo: Players }

export type SetupCard = { name: string; buildings: readonly Historical[] }

/** A quadrant's plots a side: a panel's, the city being square. */
export const QUADRANT_SIZE = (CITY.cols[0] ?? []).reduce((a, b) => a + b, 0)

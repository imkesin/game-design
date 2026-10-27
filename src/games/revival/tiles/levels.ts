import type { Level } from "./tiles.ts"

/**
 * A level drawn as that many icons, nearly touching: one, a pair, a triangle
 * (one atop two). Shared by the tiles and the sale card.
 */

/**
 * Centre to centre, across and down, as a share of an icon: under 1, so the
 * icons' boxes overlap and the drawings nearly touch.
 */
const STEP = 0.9
const RISE = 0.85

const AREAS = { 1: `"a"`, 2: `"a b"`, 3: `". a a ." "b b c c"` } as const satisfies Record<Level, string>

/** Each icon's grid area, in order: place the first `level` of them. */
export const LEVEL_SLOTS = ["a", "b", "c"] as const

/**
 * The grid for `level` icons `across` mm wide (`mm` turns mm into CSS): tracks
 * narrower than the icons, which overflow them centred, so neighbors overlap.
 */
export function levelGrid(level: Level, across: number, mm: (n: number) => string) {
  const tracks = {
    1: {},
    2: { gridTemplateColumns: `repeat(2, ${mm(across * STEP)})` },
    3: {
      gridTemplateColumns: `repeat(4, ${mm((across * STEP) / 2)})`,
      gridTemplateRows: `repeat(2, ${mm(across * RISE)})`
    }
  }[level]
  return { display: "grid", placeItems: "center", gridTemplateAreas: AREAS[level], ...tracks }
}

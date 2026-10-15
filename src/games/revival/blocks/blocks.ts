/** The city's measurements, all in mm, and how its blocks lay out on the board. */

/** The 24mm system: a plot's track, holding a 22mm square with 1mm padding all round. */
export const PLOT = 24
/** The plot square's padding inside its track: where a claim ring's stem starts. */
export const PADDING = 1
export const PLOT_LINE = 0.6
/** Claim ring diameter: claim markers must be 10mm or smaller. */
export const CLAIM = 10
/** Claim ring and stem: same weight as a plot border, but grey so it recedes. */
export const CLAIM_LINE = { width: 0.6, color: "#a3a3a3" }
/**
 * Ground inside a block: pure black dots (a halftone, not a grey fill, so it
 * prints the same anywhere) behind white plots, which makes them pop.
 */
export const DOTS = { pitch: 2, r: 0.2 }

/**
 * Buffer beside and above a block's plots, and the claim band below; top and
 * band make one cell, split so the gap above the plots matches the gaps above
 * and below each claim circle (about 4.9mm each).
 */
export const SIDE = PLOT / 2
export const BAND = 19.5
export const TOP = PLOT - BAND

/** The line around every block. */
export const EDGE = { width: 1.2, color: "#1f1f1f" }

/** The white street between neighboring blocks; cut lines run down the middle of one. */
export const STREET = 8

/**
 * A city as a matrix of blocks split across tiles: every block in a
 * block-column shares its width, every block in a block-row its height, so
 * the mayor can walk in straight lines. Block-columns and block-rows are
 * grouped by the tile they print on. Row 0, column 0 is the bottom-left.
 */
export type City = {
  /** Plots across each block-column, per tile column, left to right. */
  widths: number[][]
  /** Plots up each block-row, per tile row, bottom to top. */
  heights: number[][]
  /** Each neighborhood's plots per column, by block-row (bottom to top) then block-column. */
  neighborhoods: number[][][]
  /** City Hall's block-row and block-column. */
  hall: [row: number, col: number]
}

/** `groups` in the opposite order, inner and outer: bottom-to-top heights as the page lays them out. */
export const flipped = (groups: readonly (readonly number[])[]) => [...groups].reverse().map((g) => [...g].reverse())

/** A grid track along one axis of the board; `block` is the block-column or block-row it holds. */
export type Track = { size: number; block?: number }

/**
 * One axis of the board as grid tracks. Each tile's blocks sit `STREET`
 * apart, pushed up to the cut lines so half a street lies on either side of
 * each; the slack goes to the board's edge (on a middle tile, or a lone
 * one, it's split between both sides).
 * `over` lists tiles whose blocks don't fit, with how many mm over.
 */
export function axis(groups: readonly (readonly number[])[], tile: number) {
  const tracks: Track[] = []
  const over: { tile: number; by: number }[] = []
  let block = 0
  groups.forEach((plots, t) => {
    const [first, last] = [t === 0, t === groups.length - 1]
    const half = (first ? 0 : 1) + (last ? 0 : 1)
    const used = plots.reduce((sum, p) => sum + (p + 1) * PLOT, 0) + (plots.length - 1) * STREET + half * STREET / 2
    const slack = tile - used
    if (slack < 0) over.push({ tile: t, by: -slack })
    const [before, after] = first === last ? [slack / 2, slack / 2] : first ? [slack, 0] : [0, slack]
    tracks.push({ size: Math.max(before, 0) + (first ? 0 : STREET / 2) })
    plots.forEach((p, k) => {
      if (k > 0) tracks.push({ size: STREET })
      tracks.push({ size: (p + 1) * PLOT, block: block++ })
    })
    tracks.push({ size: Math.max(after, 0) + (last ? 0 : STREET / 2) })
  })
  return { tracks, over }
}

/**
 * Flat-top hex geometry. Tile size is one number — the side length — and the
 * width/height fall out of it, which is both how the size gets specified out
 * loud ("45mm a side, like Catan") and a guarantee that the six sides stay
 * equal. Nothing downstream assumes a particular size.
 */
export const HEX_SIDE_MM = 45

const MM_PER_INCH = 25.4
const HEX_SIDE_IN = HEX_SIDE_MM / MM_PER_INCH

/** Point to point, across the two side vertices: two sides wide. */
export const HEX_WIDTH_IN = 2 * HEX_SIDE_IN
/** Flat to flat, top edge to bottom edge. */
export const HEX_HEIGHT_IN = Math.sqrt(3) * HEX_SIDE_IN

/** SVG user units per inch, so print sizing and CSS px agree (as in Tiger's Path's `BoardMap`). */
export const UNITS_PER_INCH = 96

/** Millimetres as SVG user units — the tile is specified in mm, so its furniture is too. */
export function mm(value: number): number {
  return (value / MM_PER_INCH) * UNITS_PER_INCH
}

/**
 * SVG `points` for a flat-top hex centred on (0,0): flat edges top/bottom
 * (corners at 25%/75% of the width), full-width points at left/right
 * mid-height. Meant to sit inside a `<g transform="translate(cx,cy)">`.
 * Unit-agnostic — pass whatever units the enclosing SVG uses.
 */
export function hexPoints(w: number, h: number): string {
  const pts: [number, number][] = [
    [-w / 4, -h / 2],
    [w / 4, -h / 2],
    [w / 2, 0],
    [w / 4, h / 2],
    [-w / 4, h / 2],
    [-w / 2, 0]
  ]
  return pts.map(([x, y]) => `${x},${y}`).join(" ")
}

export interface PackedHex {
  page: number
  cx: number
  cy: number
}

/**
 * Lays `count` hexes out across as many pages as needed, using the standard
 * offset-column tessellation: columns are spaced `0.75 * widthIn` apart (so a
 * column's points nest into its neighbour's flat sides), and every other
 * column is dropped by half a hex height.
 *
 * `marginIn` is the *minimum* edge gap — what decides how many fit. Whatever
 * is left over is then split evenly around the grid, so the cluster sits
 * centred on the sheet rather than crowding the top-left: a hex is 90mm
 * across, so the leftover can be more than 50mm, and an off-centre grid puts
 * the outer tiles' edge bands into the printer's non-printable margin.
 */
export function packHexes(
  count: number,
  opts: {
    widthIn?: number
    heightIn?: number
    pageWidthIn?: number
    pageHeightIn?: number
    marginIn?: number
  } = {}
): PackedHex[] {
  const widthIn = opts.widthIn ?? HEX_WIDTH_IN
  const heightIn = opts.heightIn ?? HEX_HEIGHT_IN
  const pageWidthIn = opts.pageWidthIn ?? 8.5
  const pageHeightIn = opts.pageHeightIn ?? 11
  const marginIn = opts.marginIn ?? 0.25

  const colStride = 0.75 * widthIn
  const rowStride = heightIn
  const minX = marginIn + widthIn / 2
  const maxX = pageWidthIn - marginIn - widthIn / 2
  const minY = marginIn + heightIn / 2
  const maxY = pageHeightIn - marginIn - heightIn / 2

  // One page's worth of hex centres, column by column.
  const slots: { cx: number; cy: number }[] = []
  for (let col = 0, cx = minX; cx <= maxX; col++, cx = minX + col * colStride) {
    const rowStart = col % 2 === 0 ? minY : minY + rowStride / 2
    for (let cy = rowStart; cy <= maxY; cy += rowStride) {
      slots.push({ cx, cy })
    }
  }
  // Nothing fits — the tile is bigger than the page.
  if (slots.length === 0) return []

  // Centre the grid by its true extent. Measured from the hexes' own edges,
  // not their centres, and per axis: the offset columns make the grid taller
  // than a single column, so the two axes have different slack.
  const xs = slots.map((s) => s.cx)
  const ys = slots.map((s) => s.cy)
  const gridW = Math.max(...xs) - Math.min(...xs) + widthIn
  const gridH = Math.max(...ys) - Math.min(...ys) + heightIn
  const shiftX = (pageWidthIn - gridW) / 2 - (Math.min(...xs) - widthIn / 2)
  const shiftY = (pageHeightIn - gridH) / 2 - (Math.min(...ys) - heightIn / 2)
  const pageSlots = slots.map((s) => ({ cx: s.cx + shiftX, cy: s.cy + shiftY }))

  const perPage = pageSlots.length
  const out: PackedHex[] = []
  for (let i = 0; i < count; i++) {
    const slot = pageSlots[i % perPage]!
    out.push({ page: Math.floor(i / perPage), cx: slot.cx, cy: slot.cy })
  }
  return out
}

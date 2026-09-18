import type { CSSProperties, ReactNode } from "react"
import { markFor, markNamed } from "~/games/regolith/components/resourceMarks"
import type { Resource } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * One resource as a printed tile: a square, its mark filling it, and a
 * quantity badge riding the top-right corner. This is the unit every recipe
 * on the board is built from, so its size is a fixed physical dimension in
 * millimetres and everything inside scales off that one number.
 *
 * Shape code: resources are cubes, so the tile is a square; time is discs, so
 * the `time` variant is a circle of the same size. The badge is a rounded
 * square whichever shape it sits on — it is a count, not a component, and a
 * circular badge on a resource tile would read as time.
 */

// 1mm in CSS px, for the SVG marks, whose `size` is a pixel width.
const MM = 96 / 25.4

/** Default tile edge. Chosen so a 12mm cube reads as the same thing as the tile. */
export const TILE_MM = 12

// Proportions of the tile edge. The mark is inset because sourced art bleeds
// to its viewBox edge and would touch the border; the badge overhangs so the
// numeral never crowds the mark.
const MARK_RATIO = 0.7
const BADGE_RATIO = 0.42
const BADGE_OVERHANG = 0.3
const BORDER_MM = 0.4

const tile = css({
  position: "relative",
  display: "inline-grid",
  placeItems: "center",
  flex: "none",
  boxSizing: "border-box",
  border: `${BORDER_MM}mm solid #000`,
  background: "#fff",
  color: "#000",
  verticalAlign: "middle"
})
const square = css({ borderRadius: "12.5%" })
const circle = css({ borderRadius: "50%" })

const badge = css({
  position: "absolute",
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
  borderRadius: "22%",
  background: "#000",
  color: "#fff",
  fontFamily: "system-ui, sans-serif",
  fontWeight: 800,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

export interface BadgeProps {
  /** Printed in the badge: a count like `3` or `"−1"`, or a small icon sized to fit. */
  label: number | string | ReactNode
  /** Edge of the badge in mm. */
  size: number
  /**
   * Force the two-character square even for a short or iconic label, so a set
   * of badges that must match ("+1" beside a chevron) all get the same edge.
   */
  wide?: boolean
  style?: CSSProperties
}

/**
 * The count badge on its own, for anything else that needs to carry a number
 * the same way a tile does — the time-payment corner on a zone box, say.
 */
// A two-character label ("16", "+1", "−1") gets a slightly bigger square at
// the same text size; the badge stays a square whatever it holds.
const WIDE_LABEL_RATIO = 1.15

export function Badge({ label, size, wide = false, style }: BadgeProps) {
  const twoChars = (typeof label === "string" || typeof label === "number") && String(label).length >= 2
  const edge = wide || twoChars ? size * WIDE_LABEL_RATIO : size
  return (
    <span
      className={badge}
      style={{
        width: `${edge}mm`,
        height: `${edge}mm`,
        fontSize: `${size * 0.62}mm`,
        ...style
      }}
    >
      {label}
    </span>
  )
}

/** Badge edge for a tile of the given size, so other badges can match. */
export function badgeSize(tileMm: number): number {
  return tileMm * BADGE_RATIO
}

export interface ResourceTileProps {
  /** A resource, or `"time"` for the time-token disc. */
  kind: Resource | "time"
  /** Shown in the badge; omit for a bare tile (a legend, a bag-token face). */
  qty?: number
  /** Tile edge in mm. */
  size?: number
  /** Print the badge as "+n": a gain rather than a count, e.g. a charge yield. */
  signed?: boolean
  style?: CSSProperties
}

export function ResourceTile({ kind, qty, size = TILE_MM, signed = false, style }: ResourceTileProps) {
  const Mark = kind === "time" ? markNamed("time") : markFor(kind)
  const badgeMm = badgeSize(size)
  const overhang = badgeMm * BADGE_OVERHANG
  return (
    <span
      className={`${tile} ${kind === "time" ? circle : square}`}
      style={{ width: `${size}mm`, height: `${size}mm`, ...style }}
    >
      <Mark size={size * MARK_RATIO * MM} color="black" />
      {qty !== undefined && (
        <Badge
          label={signed ? `+${qty}` : qty}
          size={badgeMm}
          style={{ top: `${-overhang - BORDER_MM}mm`, right: `${-overhang - BORDER_MM}mm` }}
        />
      )}
    </span>
  )
}

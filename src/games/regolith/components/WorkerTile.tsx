import type { CSSProperties } from "react"
import { markNamed } from "~/games/regolith/components/resourceMarks"
import { Badge, badgeSize, TILE_MM } from "~/games/regolith/components/ResourceTile"
import { css } from "~/generated/styled-system/css"

/**
 * A robot as a printed figure. Draws `marks/worker.svg`, optionally with a
 * badge — a count where several are meant, or a charge yield on the base's
 * own deploy slot.
 *
 * Not boxed. The shape code says a square is a cube and a circle is a disc; a
 * robot is a meeple, so it stands unframed on a short ground line, and is
 * drawn taller than a resource tile so it reads as the piece rather than a
 * resource.
 */

// 1mm in CSS px, for the SVG marks, whose `size` is a pixel width.
const MM = 96 / 25.4

/** Default figure height. Taller than `TILE_MM` on purpose. */
export const WORKER_MM = 16

// The figure fills its box down to the ground line. The badge is the resource
// badge scaled up a little with the figure, with the same overhang.
const MARK_RATIO = 0.92
const BADGE_SCALE = 1.15
const BADGE_OVERHANG = 0.3
const GROUND_MM = 0.5

const figure = css({
  position: "relative",
  display: "inline-grid",
  placeItems: "end center",
  flex: "none",
  boxSizing: "border-box",
  borderBottom: `${GROUND_MM}mm solid #000`,
  color: "#000",
  verticalAlign: "middle"
})

export interface WorkerTileProps {
  /** Printed in the badge; omit for a bare figure. */
  label?: number | string
  /** Figure height in mm, ground line included. */
  size?: number
  style?: CSSProperties
}

export function WorkerTile({ label, size = WORKER_MM, style }: WorkerTileProps) {
  const Mark = markNamed("worker")
  const badgeMm = badgeSize(TILE_MM) * BADGE_SCALE
  const overhang = badgeMm * BADGE_OVERHANG
  return (
    <span className={figure} style={{ width: `${size}mm`, height: `${size}mm`, ...style }}>
      <Mark size={size * MARK_RATIO * MM} color="black" />
      {label !== undefined && (
        <Badge label={label} size={badgeMm} wide style={{ top: `${-overhang}mm`, right: `${-overhang}mm` }} />
      )}
    </span>
  )
}

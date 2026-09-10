import { ChevronUp } from "lucide-react"
import type { CSSProperties } from "react"
import { markNamed } from "~/games/regolith/components/resourceMarks"
import { Badge, badgeSize, TILE_MM } from "~/games/regolith/components/ResourceTile"
import { css } from "~/generated/styled-system/css"

/**
 * A worker as a printed figure, for the two upgrade yields that hand one back:
 * Recruit (D3) returns a new worker, Specialist (E2) returns the worker you
 * placed, upgraded. Both draw the same `marks/worker.svg`; the badge is what
 * differs — a "+1" count for the recruit, an up-chevron for the specialist.
 *
 * Not boxed. The shape code says a square is a cube and a circle is a disc; a
 * worker is a meeple, so it stands unframed on a short ground line, and is
 * drawn taller than a goods tile so it reads as the piece rather than a good.
 */

// 1mm in CSS px, for the SVG marks, whose `size` is a pixel width.
const MM = 96 / 25.4

/** Default figure height. Taller than `TILE_MM` on purpose. */
export const WORKER_MM = 16

// The figure fills its box down to the ground line. The badge is the goods
// badge scaled up a little with the figure, with the same overhang. Both
// variants are forced to the two-character square so "+1" and the chevron
// sit in identical boxes.
const MARK_RATIO = 0.92
const BADGE_SCALE = 1.15
const BADGE_OVERHANG = 0.3
const GROUND_MM = 0.5
// The chevron is line art and reads lighter than a bold numeral, so it fills
// nearly the whole badge.
const ICON_RATIO = 0.9

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

export type WorkerVariant = "recruit" | "specialist"

export interface WorkerTileProps {
  variant: WorkerVariant
  /** Figure height in mm, ground line included. */
  size?: number
  style?: CSSProperties
}

export function WorkerTile({ variant, size = WORKER_MM, style }: WorkerTileProps) {
  const Mark = markNamed("worker")
  const badgeMm = badgeSize(TILE_MM) * BADGE_SCALE
  const overhang = badgeMm * BADGE_OVERHANG
  const label = variant === "recruit"
    ? "+1"
    : <ChevronUp size={badgeMm * ICON_RATIO * MM} strokeWidth={3.5} aria-label="specialist" />
  return (
    <span className={figure} style={{ width: `${size}mm`, height: `${size}mm`, ...style }}>
      <Mark size={size * MARK_RATIO * MM} color="black" />
      <Badge label={label} size={badgeMm} wide style={{ top: `${-overhang}mm`, right: `${-overhang}mm` }} />
    </span>
  )
}

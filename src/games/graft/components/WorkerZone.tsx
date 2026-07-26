import { css } from "~/generated/styled-system/css"

/**
 * A placement zone a family worker can occupy: an open elliptical ring drawn
 * inside a rectangular footprint, with ~72% of the border stroked and the
 * remaining ~28% left as a decorative gap that signals "you may drop a piece
 * in here". Purely a bare drop-target — the action it grants is represented
 * separately, adjacent to the zone.
 *
 * Sized to 2x1.5in by default, which snaps to the board's half-inch "double-
 * resolution" unit grid (4u x 3u; see BoardPrintPage) so it drops into
 * `grid-template-areas` without leftover-fraction math. The interior is left
 * empty: it comfortably holds the couple of workers a single zone realistically
 * sees (~2 family workers per player, rarely crowded).
 *
 * The ring is an inline SVG elliptical arc rather than a dashed border, so the
 * gap sits at an exact angle regardless of the ellipse's (non-trivial)
 * circumference. Screen coords are y-down, so 225deg is the upper-left of the
 * ellipse; the gap is centred there by default, reading as the near opening of
 * a circle projected into an isometric world.
 *
 * An optional `label` names the action the zone grants (Expand, Harvest, …). It
 * renders as small centred caps inside the ring — a faint printed hint that the
 * dropped worker tokens sit over, like a position marker on a card table.
 */

export const WORKER_ZONE_W_MM = 50.8 // 2in = 4u
export const WORKER_ZONE_H_MM = 38.1 // 1.5in = 3u

const STROKE_MM = 0.5
const FILL = 13 / 16 // 3/16 of the ring left open
const GAP_CENTER_DEG = 225 // upper-left of the ellipse

// The ellipse is drawn flatter than its footprint: a shorter vertical radius
// makes the ring read as a wider circle projected into an isometric world.
const RY_RATIO = 0.82

function ringPath(rx: number, ry: number, cx: number, cy: number) {
  const gapDeg = 360 * (1 - FILL)
  const startDeg = GAP_CENTER_DEG + gapDeg / 2
  const endDeg = GAP_CENTER_DEG - gapDeg / 2 + 360
  const rad = (d: number) => (d * Math.PI) / 180
  const sx = cx + rx * Math.cos(rad(startDeg))
  const sy = cy + ry * Math.sin(rad(startDeg))
  const ex = cx + rx * Math.cos(rad(endDeg))
  const ey = cy + ry * Math.sin(rad(endDeg))
  const largeArc = 360 * FILL > 180 ? 1 : 0
  return `M ${sx.toFixed(3)} ${sy.toFixed(3)} A ${rx.toFixed(3)} ${ry.toFixed(3)} 0 ${largeArc} 1 ${ex.toFixed(3)} ${
    ey.toFixed(3)
  }`
}

const zone = css({ display: "block" })

const LABEL_MM = 3.2

export function WorkerZone({
  width = WORKER_ZONE_W_MM,
  height = WORKER_ZONE_H_MM,
  label,
  className
}: {
  width?: number
  height?: number
  label?: string
  className?: string
}) {
  const rx = width / 2 - STROKE_MM / 2
  const ry = (height / 2 - STROKE_MM / 2) * RY_RATIO
  return (
    <svg
      className={className ? `${zone} ${className}` : zone}
      width={`${width}mm`}
      height={`${height}mm`}
      viewBox={`0 0 ${width} ${height}`}
      role="presentation"
    >
      <path
        d={ringPath(rx, ry, width / 2, height / 2)}
        fill="none"
        stroke="var(--colors-stone-400)"
        strokeWidth={STROKE_MM}
        strokeLinecap="round"
      />
      {label && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={LABEL_MM}
          letterSpacing={0.4}
          fill="var(--colors-stone-400)"
        >
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  )
}

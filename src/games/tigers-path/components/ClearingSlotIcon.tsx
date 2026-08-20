import type { CSSProperties } from "react"
import type { SlotShape } from "~/games/tigers-path/domain"
import { css } from "~/generated/styled-system/css"

/**
 * A clearing slot's glyph: an outer circle (the slot itself) with the level's
 * shape inscribed inside, one unifying rule — level N touches the rim at
 * N + 1 points: Oval (2) < Reuleaux triangle (3) < Square (4) < Pentagon (5).
 * More contact points means less shaded ring between shape and rim, so the
 * eye reads "more enclosed" as "higher level" without needing the count.
 *
 * The oval and the Reuleaux triangle are curved so their contact points are
 * true tangencies rather than corners meeting a straight edge — a straight
 * chord between two rim points always bows away from the rim in between,
 * which is exactly the bottom-heavy gap a regular (60°-apex) triangle had.
 * The Reuleaux triangle keeps the same equilateral vertex layout but replaces
 * each edge with an arc centered on the opposite vertex, radius = side
 * length: the arc bulges outward almost to the rim along its whole length,
 * and the corner angle opens from 60° to 120°, so the stroke's miter no
 * longer spikes past the rim the way the straight triangle's did.
 */

const REGULAR_SIDES: Record<"square" | "pentagon", number> = { square: 4, pentagon: 5 }

/** Radians: where the first vertex sits, per regular shape, chosen for the "obvious" reading orientation. */
const START_ANGLE: Record<"square" | "pentagon", number> = {
  square: -Math.PI / 4,
  pentagon: -Math.PI / 2
}

/** Equilateral, apex up — the vertex layout a Reuleaux triangle's arcs are built from. */
const TRIANGLE_ANGLES = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]

/** Oval's horizontal radius as a fraction of the outer radius — its vertical radius is the full rim (touching top/bottom). */
const OVAL_RX_RATIO = 0.62

const STROKE = 0.4

type Point = { x: number; y: number }

function polygonPoints(shape: "square" | "pentagon", cx: number, cy: number, r: number) {
  const sides = REGULAR_SIDES[shape]
  const start = START_ANGLE[shape]
  return Array.from({ length: sides }, (_, i) => {
    const angle = start + (i * 2 * Math.PI) / sides
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(" ")
}

/** SVG large-arc/sweep flags for the minor arc from `from` to `to` around `center`. */
function arcFlags(center: Point, from: Point, to: Point) {
  const a1 = Math.atan2(from.y - center.y, from.x - center.x)
  const a2 = Math.atan2(to.y - center.y, to.x - center.x)
  let delta = a2 - a1
  while (delta <= -Math.PI) delta += 2 * Math.PI
  while (delta > Math.PI) delta -= 2 * Math.PI
  return { largeArc: 0, sweep: delta > 0 ? 1 : 0 }
}

function reuleauxTrianglePath(cx: number, cy: number, r: number) {
  const pts = TRIANGLE_ANGLES.map((a): Point => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }))
  const side = r * Math.sqrt(3)
  const arcTo = (from: Point, to: Point, center: Point) => {
    const { largeArc, sweep } = arcFlags(center, from, to)
    return `A ${side} ${side} 0 ${largeArc} ${sweep} ${to.x} ${to.y}`
  }
  return [
    `M ${pts[0].x} ${pts[0].y}`,
    arcTo(pts[0], pts[1], pts[2]),
    arcTo(pts[1], pts[2], pts[0]),
    arcTo(pts[2], pts[0], pts[1]),
    "Z"
  ].join(" ")
}

const svg = css({ flex: "none", overflow: "visible" })

export function ClearingSlotIcon({
  shape,
  cost,
  size = 12,
  color = "stone",
  style
}: {
  shape: SlotShape
  /** The slot's animal cost. Omit to draw a bare level glyph (e.g. on the powers board). */
  cost?: number
  /** Outer circle diameter, mm — the print floor is 12mm. */
  size?: number
  color?: string
  /** Extra styles for the outer svg — e.g. a grid-column span when laid out in a slot grid. */
  style?: CSSProperties
}) {
  const r = size / 2
  const innerR = r - STROKE / 2
  const rim = `var(--colors-${color}-600)`
  const ring = `var(--colors-${color}-200)`
  const face = `var(--colors-${color}-50)`
  const ink = `var(--colors-${color}-800)`

  return (
    <svg className={svg} style={style} width={`${size}mm`} height={`${size}mm`} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={r} cy={r} r={innerR} fill={ring} stroke={rim} strokeWidth={STROKE} />
      {shape === "circle" && (
        <ellipse cx={r} cy={r} rx={r * OVAL_RX_RATIO} ry={innerR} fill={face} stroke={ink} strokeWidth={STROKE} />
      )}
      {shape === "triangle" && (
        <path
          d={reuleauxTrianglePath(r, r, innerR)}
          fill={face}
          stroke={ink}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
      )}
      {(shape === "square" || shape === "pentagon") && (
        <polygon
          points={polygonPoints(shape, r, r, innerR)}
          fill={face}
          stroke={ink}
          strokeWidth={STROKE}
          strokeLinejoin="round"
        />
      )}
      {cost !== undefined && (
        <text
          x={r}
          y={r}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.42}
          fontWeight={700}
          fill={ink}
        >
          {cost}
        </text>
      )}
    </svg>
  )
}

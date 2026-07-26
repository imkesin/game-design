import { TrendingUp } from "lucide-react"
import { css } from "~/generated/styled-system/css"

/**
 * An induced-demand badge: the triangle-shaped sibling of the gold coin and
 * worker diamond (see GoldCost.tsx / WorkerCost.tsx). Same 10x10 card-unit box,
 * same rim, same family recipe, but an upright-triangle silhouette so it never
 * reads as the coin or the worker.
 *
 * The value (a small 1-2) rides the narrow apex up top; Lucide's `trending-up`
 * seats in the wide dark base band below it, reusing the light-body / dark-band
 * recipe that every card and stall already uses. Drawn as inline SVG so it stays
 * print-crisp and scales with `--u`; the real `<TrendingUp>` is nested as a
 * positioned inner svg so we build directly on the Lucide icon.
 *
 * Omit `amount` for a numberless glyph — the bare triangle-with-trend mark, used
 * as a heading for "which fruits this induces" (see MarketStall's induces panel).
 * `size` (card units) shrinks it for that heading use.
 */

// Geometry in the 0..10 viewBox (1 unit = 1mm at print).
const STROKE = 0.4 // rim, matching the siblings
const APEX_X = 5
const APEX_Y = 0.6
const BASE_Y = 9.6
const BASE_L = 0.6
const BASE_R = 9.4
const SPLIT = 6.0 // number above this line (top 3/5), trending-up band below (2/5)

// x of the left/right triangle edge at a given y.
const frac = (y: number) => (y - APEX_Y) / (BASE_Y - APEX_Y)
const leftX = (y: number) => APEX_X + (BASE_L - APEX_X) * frac(y)
const rightX = (y: number) => APEX_X + (BASE_R - APEX_X) * frac(y)

const TRIANGLE = `M ${APEX_X} ${APEX_Y} L ${BASE_R} ${BASE_Y} L ${BASE_L} ${BASE_Y} Z`
// Lower trapezoid (triangle below the split), filled darker to seat the icon.
const BAND = `M ${leftX(SPLIT)} ${SPLIT} L ${rightX(SPLIT)} ${SPLIT} L ${BASE_R} ${BASE_Y} L ${BASE_L} ${BASE_Y} Z`

const NUM_Y = 4.2 // in the apex region, seated toward the split line
const FONT = 3.0

// trending-up nested in the base band.
const ICON = 3.4
const IX = APEX_X - ICON / 2 // 3.3
const IY = 6.1

const badge = css({ display: "block", width: "10", height: "10" })

export function InducedDemand({ amount, size, className }: { amount?: number; size?: number; className?: string }) {
  // `size` (in card units) overrides the default 10u box via inline style,
  // which reliably wins over the `badge` class regardless of stylesheet order.
  const sizeStyle = size ? { width: `calc(${size} * var(--u))`, height: `calc(${size} * var(--u))` } : undefined
  return (
    <svg
      className={className ? `${badge} ${className}` : badge}
      style={sizeStyle}
      viewBox="0 0 10 10"
      role="img"
      aria-label={amount === undefined ? "induces demand" : `induces ${amount} demand`}
    >
      {/* Light triangle body. */}
      <path d={TRIANGLE} fill="var(--colors-slate-100)" />
      {/* Dark base band holding the trending-up icon. */}
      <path d={BAND} fill="var(--colors-slate-900)" />
      {/* Rim on top of both so it stays crisp; round joins tame the apex miter. */}
      <path
        d={TRIANGLE}
        fill="none"
        stroke="var(--colors-slate-700)"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <TrendingUp
        x={IX}
        y={IY}
        width={ICON}
        height={ICON}
        color="white"
        strokeWidth={3}
      />
      {amount !== undefined && (
        <text
          x={APEX_X}
          y={NUM_Y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={FONT}
          fontWeight={700}
          fill="var(--colors-slate-950)"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {amount}
        </text>
      )}
    </svg>
  )
}

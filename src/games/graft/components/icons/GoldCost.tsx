import { css } from "~/generated/styled-system/css"

/**
 * A gold coin badge: two amber discs offset along the diagonal so they mostly
 * overlap and together fill a 10x10 card-unit box (10mm at print). The lighter
 * upper-left disc rides on top of the darker lower-right one and carries the
 * `amount`, sized to seat a two-digit number comfortably inside its face.
 *
 * Drawn as an inline SVG (like WorkerZone) so it stays crisp at print and
 * scales with `--u`: the outer size uses the card-unit `10` token, and every
 * interior coordinate lives in the matching 0..10 viewBox, so the number scales
 * with the coin rather than needing its own font token. `size` (card units)
 * shrinks the whole coin — number included — for compact uses like MarketStall's
 * induces panel.
 */

// Geometry in the 0..10 viewBox (1 unit = 1mm at print).
const R = 3.9 // disc radius
const OFFSET = 1.8 // diagonal gap between the two centres; smaller = more overlap
const STROKE = 0.4 // rim
const UL = R + STROKE / 2 // upper-left centre (4.1)
const LR = UL + OFFSET // lower-right centre (5.9); LR + R + STROKE/2 = 10
const FONT = 3.6 // fits two tabular digits within the 7.8 face

const coin = css({ display: "block", width: "10", height: "10" })

export function GoldCost({ amount, size, className }: { amount: number; size?: number; className?: string }) {
  // `size` (in card units) overrides the default 10u box via inline style,
  // which reliably wins over the `coin` class regardless of stylesheet order.
  const sizeStyle = size ? { width: `calc(${size} * var(--u))`, height: `calc(${size} * var(--u))` } : undefined
  return (
    <svg
      className={className ? `${coin} ${className}` : coin}
      style={sizeStyle}
      viewBox="0 0 10 10"
      role="img"
      aria-label={`${amount} gold`}
    >
      {/* Lower-right disc, darker; drawn first so the upper-left disc overlaps it. */}
      <circle
        cx={LR}
        cy={LR}
        r={R}
        fill="var(--colors-amber-500)"
        stroke="var(--colors-amber-600)"
        strokeWidth={STROKE}
      />
      {/* Upper-left disc, lighter; holds the number. */}
      <circle
        cx={UL}
        cy={UL}
        r={R}
        fill="var(--colors-amber-300)"
        stroke="var(--colors-amber-600)"
        strokeWidth={STROKE}
      />
      <text
        x={UL}
        y={UL}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={FONT}
        fontWeight={700}
        fill="var(--colors-amber-950)"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {amount}
      </text>
    </svg>
  )
}

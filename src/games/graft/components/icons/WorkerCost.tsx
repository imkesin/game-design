import { UsersRound } from "lucide-react"
import { css } from "~/generated/styled-system/css"

/**
 * A worker-cost badge: the octagon-shaped sibling of the gold coin (see
 * Gold.tsx). Same 10x10 card-unit box, same rim, same number weight, but a
 * distinct silhouette — a regular octagon rather than a disc — so gold and
 * workers never read as the same token.
 *
 * Lucide's `users-round` seats in the top half; the count sits in a darker lower
 * band, reusing the light-body / dark-band recipe that every card and stall
 * already uses. Drawn as an inline SVG so it stays print-crisp and scales with
 * `--u`; the real `<UsersRound>` is nested as a positioned inner svg so we build
 * directly on the Lucide icon.
 */

// Geometry in the 0..10 viewBox (1 unit = 1mm at print). Regular octagon: LO/HI
// are the inset box edges (outer rim sits on the box edge); CUT is the 45° corner
// clip that makes all eight sides equal (side / (2 + sqrt2)).
const STROKE = 0.4 // rim, matching the coin
const INSET = STROKE / 2
const CX = 5 // centre
const LO = INSET // 0.2
const HI = 10 - INSET // 9.8
const CUT = (HI - LO) / (2 + Math.SQRT2)

const OCTAGON = [
  `M ${LO + CUT} ${LO}`,
  `L ${HI - CUT} ${LO}`,
  `L ${HI} ${LO + CUT}`,
  `L ${HI} ${HI - CUT}`,
  `L ${HI - CUT} ${HI}`,
  `L ${LO + CUT} ${HI}`,
  `L ${LO} ${HI - CUT}`,
  `L ${LO} ${LO + CUT}`,
  "Z"
].join(" ")

// Dark lower band: the octagon below BAND_TOP. BAND_TOP sits within the octagon's
// vertical sides, so the band's top corners meet the edges at LO/HI.
const BAND_TOP = 5.5
const LOWER = [
  `M ${LO} ${BAND_TOP}`,
  `L ${HI} ${BAND_TOP}`,
  `L ${HI} ${HI - CUT}`,
  `L ${HI - CUT} ${HI}`,
  `L ${LO + CUT} ${HI}`,
  `L ${LO} ${HI - CUT}`,
  "Z"
].join(" ")

// users-round nested in the top half, sized so its shoulders reach the centre
// line (IY + 0.875*ICON ≈ 5) — the octagon gives more room than the diamond did.
const ICON = 5.2
const IX = CX - ICON / 2 // 2.4
const IY = 0.45

const NUM_Y = 7.65 // centred in the lower band (BAND_TOP..BOTTOM midpoint)
const FONT = 3.0 // fits two tabular digits within the band

const badge = css({ display: "block", width: "10", height: "10" })

export function WorkerCost({ amount, size, className }: { amount: number; size?: number; className?: string }) {
  // `size` (in card units) overrides the default 10u box via inline style,
  // which reliably wins over the `badge` class regardless of stylesheet order.
  const sizeStyle = size ? { width: `calc(${size} * var(--u))`, height: `calc(${size} * var(--u))` } : undefined
  return (
    <svg
      className={className ? `${badge} ${className}` : badge}
      style={sizeStyle}
      viewBox="0 0 10 10"
      role="img"
      aria-label={`${amount} workers`}
    >
      {/* Light octagon body. */}
      <path d={OCTAGON} fill="var(--colors-brown-100)" />
      {/* Dark lower band holding the count. */}
      <path d={LOWER} fill="var(--colors-brown-700)" />
      {/* Rim on top of both so it stays crisp. */}
      <path d={OCTAGON} fill="none" stroke="var(--colors-brown-500)" strokeWidth={STROKE} />
      <UsersRound
        x={IX}
        y={IY}
        width={ICON}
        height={ICON}
        color="var(--colors-brown-900)"
        strokeWidth={2.5}
      />
      <text
        x={CX}
        y={NUM_Y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={FONT}
        fontWeight={700}
        fill="var(--colors-brown-50)"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {amount}
      </text>
    </svg>
  )
}

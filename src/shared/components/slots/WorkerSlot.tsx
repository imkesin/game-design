import { css } from "~/generated/styled-system/css"

/**
 * A Labor Market slot a worker token drops into: an 18x18 card-unit footprint
 * (18mm at print — comfortably holds a standard 16x16mm meeple) with a stone
 * rim, shaped as a regular octagon — a square with its corners clipped at 45°,
 * so it fills the box (touching all four edges) with no stretch.
 *
 * A large, faint brown "W" is stamped in the middle (same idea as FruitCrateSlot's
 * initial): pale enough to sit under a placed token, but enough to identify the
 * slot — and it survives a black-and-white playtest print.
 *
 * An optional `badge` (e.g. "3+") replaces that "W" with the player-count
 * threshold, marking slots that only come into play at higher player counts so
 * one board serves every count. It reuses the W's faint colour and centring —
 * just a smaller font to fit the two glyphs — so it reads as the same stamp.
 *
 * Drawn as inline SVG so it stays print-crisp and scales with `--u`.
 */

// Geometry in the 0..18 viewBox (1 unit = 1mm at print). Regular octagon: LO/HI
// are the inset box edges (outer rim sits on the box edge); CUT is the 45° corner
// clip that makes all eight sides equal (side / (2 + sqrt2)).
const SIZE = 18
const STROKE = 0.4 // rim, matching the plain token slot
const INSET = STROKE / 2
const LO = INSET // 0.2
const HI = SIZE - INSET // 17.8
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

const slot = css({ display: "block", width: "18", height: "18" })

export function WorkerSlot({ className, badge }: { className?: string; badge?: string }) {
  return (
    <svg
      className={className ? `${slot} ${className}` : slot}
      viewBox="0 0 18 18"
      role="img"
      aria-label={badge ? `worker slot (${badge} players)` : "worker slot"}
    >
      <path d={OCTAGON} fill="var(--colors-brown-100)" stroke="var(--colors-stone-400)" strokeWidth={STROKE} />
      <text
        x={SIZE / 2}
        y={SIZE / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={badge ? 7.5 : 11.25}
        fontWeight={700}
        fill="var(--colors-brown-200)"
      >
        {badge ?? "W"}
      </text>
    </svg>
  )
}

import { BadgePercent, X } from "lucide-react"
import { css } from "~/generated/styled-system/css"
import { COLORS } from "../colors.ts"
import { ICON } from "../icons.ts"
import type { COST } from "../tiles/tiles.ts"

/**
 * Revival's bits as drawn on mats and reference cards, all sized in mm: coins,
 * tax incentives, buildings (white icon on the type's color) and hexes.
 */

export type BuildingKind = keyof typeof COST

const coin = css({
  display: "grid",
  placeItems: "center",
  flex: "none",
  borderRadius: "50%",
  boxSizing: "border-box",
  border: "0.4mm solid rgba(0, 0, 0, 0.2)",
  color: "white",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

const incentive = css({
  display: "inline-grid",
  gridAutoFlow: "column",
  alignItems: "center",
  gap: "0.6mm",
  padding: "0.5mm 1.2mm",
  borderRadius: "1.2mm",
  color: "white",
  fontSize: "3mm",
  fontWeight: 700,
  lineHeight: 1
})

const chip = css({ display: "inline-grid", placeItems: "center", flex: "none", color: "white" })

/** A piece with a round badge hung off its lower-left corner. */
const badged = css({
  display: "inline-grid",
  gridTemplateAreas: `"stack"`,
  flex: "none",
  "& > *": { gridArea: "stack" }
})

const badge = css({
  placeSelf: "end start",
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
  borderRadius: "50%",
  border: "solid white",
  color: "white",
  transform: "translate(-30%, 30%)"
})

/** The "not allowed" badge. */
const FORBIDDEN = "#c8302c"

const hex = css({ display: "block", flex: "none" })

/** A pointy-top hexagon filling a 10 × 10 box, inset for its stroke. */
const HEX = Array.from({ length: 6 }, (_, i) => {
  const a = ((60 * i - 90) * Math.PI) / 180
  return `${(5 + 4.6 * Math.cos(a)).toFixed(2)},${(5 + 4.6 * Math.sin(a)).toFixed(2)}`
}).join(" ")

export function Coin({ amount, size = 7 }: { amount: number | string; size?: number }) {
  return (
    <span
      className={coin}
      style={{ width: `${size}mm`, height: `${size}mm`, fontSize: `${size * 0.55}mm`, background: COLORS.coin }}
    >
      {amount}
    </span>
  )
}

export function Incentive({ amount }: { amount?: number }) {
  return (
    <span className={incentive} style={{ background: COLORS.civicInk }}>
      {amount}
      <BadgePercent size="3.2mm" strokeWidth={2.25} />
    </span>
  )
}

export function Building({ kind, size }: { kind: BuildingKind; size: number }) {
  const Icon = ICON[kind]
  return (
    <span
      className={chip}
      style={{
        width: `${size}mm`,
        height: `${size}mm`,
        borderRadius: `${size * 0.18}mm`,
        background: COLORS[kind]
      }}
    >
      <Icon size={`${size * 0.62}mm`} strokeWidth={1.9} />
    </span>
  )
}

/**
 * A demand hex (put out by a House) or a Commercial hex (put out by a shop):
 * hexagonal, so it never reads as a plot square.
 */
export function Hex(
  { from, size = 4, plus = false }: {
    from: "house" | "commercial"
    size?: number
    /** A "+" badge on its lower-left corner: one is put out. */
    plus?: boolean
  }
) {
  return (
    <svg className={hex} viewBox="0 0 10 10" style={{ width: `${size}mm`, height: `${size}mm` }}>
      <polygon
        points={HEX}
        fill={COLORS[from]}
        stroke="rgba(0, 0, 0, 0.4)"
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
      {plus && (
        <g>
          <circle cx={2.3} cy={7.7} r={2.1} fill="#1f1f1f" stroke="white" strokeWidth={0.5} />
          <path d="M2.3 6.75V8.65M1.35 7.7H3.25" stroke="white" strokeWidth={0.55} strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

/** Not while blight stands: a blighted (black) building with a red × badge. */
export function NoBlight({ size }: { size: number }) {
  const mark = size * 0.48
  return (
    <span className={badged}>
      <span
        className={chip}
        style={{ width: `${size}mm`, height: `${size}mm`, borderRadius: `${size * 0.18}mm`, background: COLORS.blight }}
      >
        <ICON.blight size={`${size * 0.6}mm`} strokeWidth={1.9} />
      </span>
      <span
        className={badge}
        style={{ width: `${mark}mm`, height: `${mark}mm`, borderWidth: `${size * 0.045}mm`, background: FORBIDDEN }}
      >
        <X size={`${mark * 0.66}mm`} strokeWidth={3.5} />
      </span>
    </span>
  )
}

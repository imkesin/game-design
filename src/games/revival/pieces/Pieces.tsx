import { BadgePercent } from "lucide-react"
import { css } from "~/generated/styled-system/css"
import { COLORS } from "../colors.ts"
import { ICON } from "../icons.ts"
import type { BuildingKind } from "../tiles/tiles.ts"

/**
 * Revival's bits as drawn on mats and reference cards, all sized in mm: coins,
 * tax incentives and buildings (white icon on the type's color).
 */

export type { BuildingKind }

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

/** A coin: gold in hand (purse, income), or `payoff` grey for money a sale brings in, as on the tiles. */
export function Coin(
  { amount, size = 7, tone = "coin" }: { amount: number | string; size?: number; tone?: "coin" | "payoff" }
) {
  return (
    <span
      className={coin}
      style={{ width: `${size}mm`, height: `${size}mm`, fontSize: `${size * 0.55}mm`, background: COLORS[tone] }}
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

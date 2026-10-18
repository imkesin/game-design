import { Lock, TrafficCone } from "lucide-react"
import { css } from "~/generated/styled-system/css"
import { HALF_BOARD } from "../boards/sheets.ts"
import { Coin, Incentive } from "../pieces/Pieces.tsx"

/**
 * A player's mat: a TGC half board turned on its side. A company band across
 * the top bleeds off the edge; below it, the upgrades: the credit track, the
 * cone yard, and room for upgrades still to come. The left side is open for
 * now (sale values moved to their own reference card).
 */

export const MAT = { width: HALF_BOARD.trim.height, height: HALF_BOARD.trim.width }
const BLEED = HALF_BOARD.bleed
/** Content keeps this far inside the trim: the safe zone plus breathing room. */
const PAD = HALF_BOARD.safe + 4
/** Until companies have colors. */
const COMPANY = "#3d4650"

const CREDIT = { max: 3, prices: [2, 3, 4] }
const CONES = { start: 3, max: 5, price: 3 }

const mat = css({
  display: "grid",
  gridTemplateAreas: `
    "band band band band band"
    ".    .     .    .        ."
    ".    open  .    upgrades ."
    ".    .     .    .        ."`,
  background: "white",
  fontFamily: "sans-serif",
  color: "#1f1f1f",
  printColorAdjust: "exact"
})

const band = css({
  gridArea: "band",
  display: "grid",
  gridTemplateAreas: `". name . brand ."`,
  alignItems: "center",
  color: "white"
})

const company = css({ gridArea: "name", fontSize: "5.5mm", fontWeight: 700, letterSpacing: "0.02em" })

const brand = css({
  gridArea: "brand",
  fontSize: "3mm",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  opacity: 0.7
})

/* Upgrades */

const upgrades = css({
  gridArea: "upgrades",
  display: "grid",
  gridTemplateAreas: `"title" "credit" "cones" "later"`,
  gridTemplateRows: "auto auto auto 1fr",
  rowGap: "4.5mm",
  paddingLeft: "6mm",
  borderLeft: "0.25mm solid #e5e5e5"
})

const title = css({ gridArea: "title", display: "grid", gap: "1mm" })

const titleText = css({ fontSize: "4.5mm", fontWeight: 700 })

const caption = css({
  display: "grid",
  gridAutoFlow: "column",
  justifyContent: "start",
  alignItems: "center",
  gap: "1mm",
  fontSize: "2.8mm",
  color: "#5a5a5a"
})

const section = css({ display: "grid", gap: "2mm" })

const label = css({ fontSize: "3.2mm", fontWeight: 700 })

const track = css({ display: "grid", alignItems: "center", justifyItems: "center" })

const space = css({
  display: "grid",
  gridTemplateAreas: `"spot"`,
  placeItems: "center",
  width: "14mm",
  height: "14mm",
  boxSizing: "border-box",
  borderRadius: "2mm",
  "& > *": { gridArea: "spot" }
})

const step = css({ display: "grid", justifyItems: "center", gap: "0.5mm", fontSize: "3mm", color: "#8a8a8a" })

const later = css({
  gridArea: "later",
  display: "grid",
  placeItems: "center",
  border: "0.3mm dashed #d4d4d4",
  borderRadius: "2mm",
  fontSize: "2.8mm",
  color: "#a3a3a3"
})

function Credit() {
  const columns = Array.from({ length: CREDIT.max + 1 }, () => "14mm").join(" 1fr ")
  return (
    <div className={section} style={{ gridArea: "credit" }}>
      <span className={label}>Credit rating</span>
      <span className={caption}>
        Every walk, collect your level in coins
      </span>
      <div className={track} style={{ gridTemplateColumns: columns }}>
        {Array.from({ length: CREDIT.max + 1 }, (_, level) => [
          level > 0 && (
            <span key={`step${level}`} className={step}>
              <Incentive amount={CREDIT.prices[level - 1]!} />→
            </span>
          ),
          <span key={`level${level}`} className={space} style={{ border: "0.4mm solid #1f1f1f" }}>
            <Coin amount={level} size={8} />
          </span>
        ])}
      </div>
    </div>
  )
}

function Cones() {
  return (
    <div className={section} style={{ gridArea: "cones" }}>
      <span className={label}>Cones</span>
      <span className={caption}>Idle cones wait here</span>
      <div
        className={track}
        style={{ gridTemplateColumns: `repeat(${CONES.max}, 14mm)`, justifyContent: "space-between" }}
      >
        {Array.from({ length: CONES.max }, (_, i) =>
          i < CONES.start
            ? (
              <span
                key={i}
                className={space}
                style={{ border: "0.4mm dashed #8a8a8a", borderRadius: "50%", color: "#d4d4d4" }}
              >
                <TrafficCone size="8mm" strokeWidth={1.5} />
              </span>
            )
            : (
              <span
                key={i}
                className={space}
                style={{ border: "0.4mm dashed #d4d4d4", borderRadius: "50%", color: "#a3a3a3" }}
              >
                <span className={step}>
                  <Lock size="3.5mm" strokeWidth={2} />
                  <Incentive amount={CONES.price} />
                </span>
              </span>
            ))}
      </div>
    </div>
  )
}

export function PlayerMat() {
  const edge = `${BLEED + PAD}mm`
  return (
    <div
      className={mat}
      style={{
        width: `${MAT.width + 2 * BLEED}mm`,
        height: `${MAT.height + 2 * BLEED}mm`,
        gridTemplateColumns: `${edge} 1fr 6mm 84mm ${edge}`,
        gridTemplateRows: `${BLEED + 13}mm 4mm 1fr ${edge}`
      }}
    >
      <div
        className={band}
        style={{ background: COMPANY, gridTemplateColumns: `${edge} auto 1fr auto ${edge}`, paddingTop: `${BLEED}mm` }}
      >
        <span className={company}>Construction Co.</span>
        <span className={brand}>Revival</span>
      </div>
      <div className={upgrades}>
        <div className={title}>
          <span className={titleText}>Upgrades</span>
          <span className={caption}>
            Spend incentives <Incentive /> at each walk, unless you are the walker
          </span>
        </div>
        <Credit />
        <Cones />
        <div className={later}>More upgrades to come</div>
      </div>
    </div>
  )
}

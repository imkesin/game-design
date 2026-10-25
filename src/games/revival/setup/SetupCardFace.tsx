import { css } from "~/generated/styled-system/css"
import { CARD_TRIM_H_MM, CARD_TRIM_W_MM } from "~/shared/print/cardSize"
import { COLORS, split } from "../colors.ts"
import { ICON } from "../icons.ts"
import { QUADRANT_SIZE, type SetupCard } from "./setupCard.ts"

/**
 * A setup card at trim size, portrait: its name, then its quadrant as a 5 × 5
 * grid without the corners (never built on), read upright whichever quadrant
 * it lands in. A historical
 * building is split diagonally, burgundy top-left and the type's color
 * bottom-right, under a white icon; a corner badge gives the most players
 * it's placed at (none: every count).
 */

/** A plot, and the gap between plots, in mm. */
const CELL = 9.5
const GAP = 1.5

const LAST = QUADRANT_SIZE - 1
const isCorner = (col: number, row: number) => (col === 0 || col === LAST) && (row === 0 || row === LAST)

const card = css({
  display: "grid",
  gridTemplateAreas: `"title" "map"`,
  gridTemplateRows: "11mm 1fr",
  boxSizing: "border-box",
  outline: "0.2mm solid #a3a3a3",
  outlineOffset: "-0.1mm",
  background: "white",
  fontFamily: "sans-serif",
  color: "#1f1f1f",
  printColorAdjust: "exact"
})

const title = css({
  gridArea: "title",
  display: "grid",
  alignItems: "center",
  paddingInline: "4mm",
  color: "white",
  fontSize: "5mm",
  fontWeight: 700
})

const map = css({ gridArea: "map", placeSelf: "center", display: "grid" })

const plot = css({
  boxSizing: "border-box",
  display: "grid",
  gridTemplateAreas: `"plot"`,
  placeItems: "center",
  borderRadius: "1mm",
  color: "white",
  "& > *": { gridArea: "plot" }
})

const blank = css({ border: "0.3mm solid #d4d4d4" })

/** The most players a building is placed at, over the plot's top-right corner. */
const badge = css({
  placeSelf: "start end",
  display: "grid",
  placeItems: "center",
  width: "4.2mm",
  height: "4.2mm",
  borderRadius: "50%",
  outline: "0.35mm solid white",
  color: "white",
  fontSize: "2.9mm",
  fontWeight: 700,
  lineHeight: 1,
  transform: "translate(35%, -35%)"
})

export function SetupCardFace({ card: c }: { card: SetupCard }) {
  const at = (col: number, row: number) => ({ gridColumn: col + 1, gridRow: row + 1 })
  const tracks = `repeat(${QUADRANT_SIZE}, ${CELL}mm)`
  const plots = Array.from({ length: QUADRANT_SIZE ** 2 }, (_, i) => [i % QUADRANT_SIZE, Math.floor(i / QUADRANT_SIZE)])
    .filter(([col = 0, row = 0]) => !isCorner(col, row))
  return (
    <div className={card} style={{ width: `${CARD_TRIM_W_MM}mm`, height: `${CARD_TRIM_H_MM}mm` }}>
      <div className={title} style={{ background: COLORS.historical }}>{c.name}</div>
      <div className={map} style={{ gridTemplateColumns: tracks, gridTemplateRows: tracks, gap: `${GAP}mm` }}>
        {plots.map(([col = 0, row = 0]) => {
          const building = c.buildings.find(({ at: [x, y] }) => x === col && y === row)
          if (building === undefined) {
            return <div key={`${col},${row}`} className={`${plot} ${blank}`} style={at(col, row)} />
          }
          const Icon = ICON[building.piece]
          return (
            <div
              key={`${col},${row}`}
              className={plot}
              style={{ ...at(col, row), background: split(COLORS.historical, COLORS[building.piece]) }}
            >
              <Icon size="5.5mm" strokeWidth={1.75} />
              {building.upTo < 5 && (
                <span className={badge} style={{ background: COLORS.historical }}>{building.upTo}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

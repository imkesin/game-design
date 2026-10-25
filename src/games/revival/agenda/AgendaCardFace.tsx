import { css } from "~/generated/styled-system/css"
import { CARD_TRIM_H_MM, CARD_TRIM_W_MM } from "~/shared/print/cardSize"
import { crossingName, streetName } from "../blocks/blocks.ts"
import { CITY } from "../blocks/city.ts"
import { COLORS } from "../colors.ts"

/**
 * An agenda card at trim size, portrait: the mayor's target intersection named
 * in the title, then the city's streets as lines, north up, the north–south
 * streets lettered along the top and the east–west ones numbered down the
 * right, City Hall marked and the target ringed.
 */

/** Streets each way, as on the board. */
const STREETS = CITY.cols.flat().length - 1

/** In the map's mm: street spacing, how far lines run past the outer streets, and the label band. */
const PITCH = 10
const OVERHANG = 5
const BAND = 6
const SPAN = (STREETS - 1) * PITCH + 2 * OVERHANG
const SIZE = SPAN + BAND

/** Where street `s` runs: north–south from the left, east–west from the top, below the letters. */
const atX = (s: number) => OVERHANG + s * PITCH
const atY = (s: number) => BAND + OVERHANG + s * PITCH
/** East–west streets count from the south. */
const fromTop = (row: number) => STREETS - 1 - row

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

const map = css({ gridArea: "map", placeSelf: "center", display: "block" })

const LINE = "#d4d4d4"
const LABEL = "#a3a3a3"

export function AgendaCardFace({ col, row }: {
  /** The target's north–south street (0 = A) and east–west street (0 = 1, at the south). */
  col: number
  row: number
}) {
  const streets = Array.from({ length: STREETS }, (_, s) => s)
  const [hallX, hallY] = [atX(CITY.hall.col), atY(fromTop(CITY.hall.row))]
  const [x, y] = [atX(col), atY(fromTop(row))]
  const label = {
    fill: LABEL,
    fontSize: 3.4,
    fontWeight: 700,
    textAnchor: "middle",
    dominantBaseline: "central"
  } as const
  return (
    <div className={card} style={{ width: `${CARD_TRIM_W_MM}mm`, height: `${CARD_TRIM_H_MM}mm` }}>
      <div className={title} style={{ background: COLORS.civicInk }}>{crossingName(col, row)}</div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={map} style={{ width: `${SIZE}mm`, height: `${SIZE}mm` }}>
        <g stroke={LINE} strokeWidth={1.6} strokeLinecap="round">
          {streets.map((s) => <line key={`x${s}`} x1={atX(s)} x2={atX(s)} y1={BAND} y2={BAND + SPAN} />)}
          {streets.map((s) => <line key={`y${s}`} x1={0} x2={SPAN} y1={atY(s)} y2={atY(s)} />)}
        </g>
        {streets.map((s) => <text key={`a${s}`} x={atX(s)} y={BAND / 2} {...label}>{streetName.across(s)}</text>)}
        {streets.map((s) => (
          <text key={`n${s}`} x={SPAN + BAND / 2} y={atY(s)} {...label}>{streetName.up(fromTop(s))}</text>
        ))}
        <rect
          x={hallX - 2.5}
          y={hallY - 2.5}
          width={5}
          height={5}
          rx={0.6}
          fill={COLORS.civic}
          stroke={COLORS.civicInk}
          strokeWidth={0.8}
        />
        <circle cx={x} cy={y} r={4.4} fill="none" stroke={COLORS.civicInk} strokeWidth={0.8} />
        <circle cx={x} cy={y} r={3} fill={COLORS.civicInk} />
      </svg>
    </div>
  )
}

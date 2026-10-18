import { css } from "~/generated/styled-system/css"
import { CARD_TRIM_H_MM, CARD_TRIM_W_MM } from "~/shared/print/cardSize"
import { labelOf } from "../blocks/blocks.ts"
import { COLORS } from "../colors.ts"

/**
 * An agenda card at trim size, portrait: the mayor's target neighborhood
 * named in the top eighth, then the 4 × 4 city with the target filled in,
 * north up and A1 bottom-left, as on the board.
 */

const SIZE = 4

/**
 * The target's cell, inline so it overrides `cell` (atomic classes on the same
 * property don't reliably cascade in class order): filled, with an outline
 * ring offset from it.
 */
const TARGET = {
  background: COLORS.mayor,
  borderColor: COLORS.mayor,
  color: "white",
  fontSize: "4mm",
  /** A second ring, clear of the square, so the target jumps out. */
  outline: `0.9mm solid ${COLORS.mayor}`,
  outlineOffset: "0.5mm"
}

const card = css({
  display: "grid",
  gridTemplateAreas: `"title" "map"`,
  gridTemplateRows: "1fr 7fr",
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

/** Neighborhoods as squares, streets as the gaps between them. */
const map = css({
  gridArea: "map",
  placeSelf: "center",
  display: "grid",
  gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
  gridTemplateRows: `repeat(${SIZE}, 1fr)`,
  gap: "2.5mm",
  width: "55mm",
  height: "55mm"
})

const cell = css({
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
  border: "0.4mm solid #d4d4d4",
  borderRadius: "1mm",
  color: "#a3a3a3",
  fontSize: "3.2mm",
  fontWeight: 700
})

export function AgendaCardFace({ row, col }: {
  /** The target's block-row (0 = row 1, at the bottom) and block-column (0 = A). */
  row: number
  col: number
}) {
  const label = labelOf(row, col)
  return (
    <div className={card} style={{ width: `${CARD_TRIM_W_MM}mm`, height: `${CARD_TRIM_H_MM}mm` }}>
      <div className={title} style={{ background: COLORS.mayor }}>{label}</div>
      <div className={map}>
        {Array.from({ length: SIZE }, (_, k) => SIZE - 1 - k).flatMap((r) =>
          Array.from({ length: SIZE }, (_, c) => {
            const here = r === row && c === col
            return (
              <div
                key={`${r},${c}`}
                className={cell}
                style={here ? TARGET : {}}
              >
                {labelOf(r, c)}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

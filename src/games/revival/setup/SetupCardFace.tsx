import { css } from "~/generated/styled-system/css"
import { CARD_TRIM_H_MM, CARD_TRIM_W_MM } from "~/shared/print/cardSize"
import { COLORS, split } from "../colors.ts"
import { ICON } from "../icons.ts"
import type { Piece, SetupCard } from "./setupCard.ts"

/**
 * A setup card at trim size, portrait, read the standard way up: the name in
 * the top eighth, then the 4 entries in equal zones, 1 to 4 from the top.
 * Every entry shows 3 slots, filled in order: a blight entry's are the 3 plots
 * its line owns in a ring; a historical entry uses only the first. Buildings
 * are split diagonally, black (blight) or burgundy (historical) top-left and
 * the type's color bottom-right. Icons are white.
 */

const SLOTS = 3

const card = css({
  display: "grid",
  gridTemplateAreas: `"title" "entries"`,
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

const entries = css({ gridArea: "entries", display: "grid", gridTemplateRows: "repeat(4, 1fr)" })

/** The number in line with the title's name, then the 3 plots between strips of breathing room. */
const entry = css({
  display: "grid",
  gridTemplateAreas: `"number . plot0 plot1 plot2 ."`,
  gridTemplateColumns: "auto 1fr 3fr 3fr 3fr 1fr",
  alignItems: "center",
  justifyItems: "center",
  paddingInlineStart: "4mm",
  "&:not(:last-child)": { borderBottom: "0.2mm solid #e5e5e5" }
})

/** Like the board's plaza labels: light grey on a lighter tab, rounded. */
const number = css({
  gridArea: "number",
  padding: "1mm 1.6mm",
  borderRadius: "1.5mm",
  background: "#ececec",
  color: "#a3a3a3",
  fontSize: "4.5mm",
  fontWeight: 700,
  letterSpacing: "0.04em",
  lineHeight: 1.1
})

const slot = css({
  width: "13mm",
  height: "13mm",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateAreas: `"slot"`,
  placeItems: "center",
  borderRadius: "1.5mm",
  color: "white",
  "& > *": { gridArea: "slot" }
})

/** On a historical building placed at 3 players too: a burgundy "3" over the slot's corner. */
const badge = css({
  placeSelf: "start end",
  display: "grid",
  placeItems: "center",
  width: "5mm",
  height: "5mm",
  borderRadius: "50%",
  outline: "0.4mm solid white",
  color: "white",
  fontSize: "3.4mm",
  fontWeight: 700,
  lineHeight: 1,
  transform: "translate(35%, -35%)"
})

const empty = css({ border: "0.3mm dashed #d4d4d4" })

const fill = (deck: SetupCard["deck"], piece: Piece) => split(COLORS[deck], COLORS[piece])

export function SetupCardFace({ card: { deck, name, entries: list, atThree } }: { card: SetupCard }) {
  return (
    <div className={card} style={{ width: `${CARD_TRIM_W_MM}mm`, height: `${CARD_TRIM_H_MM}mm` }}>
      <div className={title} style={{ background: COLORS[deck] }}>{name}</div>
      <div className={entries}>
        {list.map((pieces, i) => (
          <div key={i} className={entry}>
            <span className={number}>{i + 1}</span>
            {Array.from({ length: SLOTS }, (_, k) => {
              const piece = pieces[k]
              if (piece === undefined) {
                return <div key={k} className={`${slot} ${empty}`} style={{ gridArea: `plot${k}` }} />
              }
              const Icon = ICON[piece]
              return (
                <div key={k} className={slot} style={{ gridArea: `plot${k}`, background: fill(deck, piece) }}>
                  <Icon size="8mm" strokeWidth={1.75} />
                  {atThree?.[i] === true && <span className={badge} style={{ background: COLORS.historical }}>3</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

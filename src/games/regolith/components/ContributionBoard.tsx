import type { CSSProperties } from "react"
import { markFor } from "~/games/regolith/components/resourceMarks"
import { SHEET_H_IN, SHEET_W_IN } from "~/games/regolith/components/TrackBoard"
import { CONTRIBUTION_VP, CONTRIBUTIONS } from "~/games/regolith/domain"
import type { ContributionTrack, Good } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * The contribution board, print edition: the full width of a letter sheet and
 * half its height, because it is not a place workers go and that is all the
 * room the thing needs. Drawn as a transit map — a route per contribution
 * track, running left to right, a station per step. `Route` and `Station` are
 * the drawing; the rules words stay track and step.
 *
 * The sheet is the map and nothing else: no title, and no rules text, because
 * the rule for contributing is on the player aid and does not want saying
 * twice. A station is a ringed circle holding its good's mark with the
 * quantity that step takes beneath it, so a station is read without reference
 * to anything else on the sheet; a contributor's disc lands on it, and the
 * ring is sized to take one. The sheet prints black and white, so a route is
 * told apart by its stroke rather than a colour: solid, double, dashed,
 * dotted, keyed in the route label at the left. The VP a step pays is the
 * same on every track, so it is a fare zone — a tinted band down the whole
 * sheet, labelled once at the top — rather than a number printed twenty
 * times.
 */

/** Half a letter sheet: the board sits at the top of the page it prints on. */
const HALF_SHEET_H_IN = SHEET_H_IN / 2
const PAD_IN = 0.3
const STEPS = CONTRIBUTION_VP.length

// 1mm in CSS px, for the SVG marks, whose `size` is a pixel width.
const MM = 96 / 25.4

/** Station circle. Sized so the 16mm marker disc drops inside the ring. */
const STATION_MM = 22
const RING_MM = 0.7
const MARK_MM = STATION_MM * 0.46
/** Route stroke weight; the double and dotted routes are built out of it. */
const STROKE_MM = 1.8
/** Route labels and the line key sit in this column, left of station one. */
const LABEL_W = "22mm"

/**
 * The sheet is one grid: the label column, then a column per step; a header
 * row, then a row per route. Line numbers rather than `grid-template-areas`,
 * because a zone band is not a cell of its own — it covers the header and the
 * stations it sits behind, painted first.
 *
 * Column 1 is the labels, so step n is column n + 1; row 1 is the zone
 * headers, so route n is row n + 1.
 */
const stepCol = (step: number) => step + 1
const routeRow = (route: number) => route + 1
const sheet = css({
  boxSizing: "border-box",
  background: "#fff",
  color: "#000",
  display: "grid",
  alignItems: "center",
  fontFamily: "system-ui, sans-serif"
})
/**
 * Everything about the sheet that is computed from the constants above, and
 * so has to be inline: Panda's extractor reads literals out of `css()` at
 * build time, and quietly emits no rule at all for a value it cannot read —
 * `${HALF_SHEET_H_IN}in` among them.
 */
const sheetBox: CSSProperties = {
  width: `${SHEET_W_IN}in`,
  height: `${HALF_SHEET_H_IN}in`,
  padding: `${PAD_IN}in`,
  gridTemplateColumns: `${LABEL_W} repeat(${STEPS}, 1fr)`,
  gridTemplateRows: `auto repeat(${CONTRIBUTIONS.length}, 1fr)`
}

// A fare zone: one step's column, tinted down the whole sheet so the four
// routes share it. Alternating, so five bands read as five zones.
// `alignSelf` because the sheet centres its items: a band has no content of
// its own, so without it there is nothing to give it height.
const zone = css({ gridRow: "1 / -1", alignSelf: "stretch", zIndex: 0 })
const zoneHead = css({
  gridRow: "1",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5mm",
  padding: "2mm 0 3mm",
  fontSize: "5.5pt",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#555"
})
const vp = css({ fontSize: "11pt", fontWeight: 900, letterSpacing: "0.02em", color: "#000" })

// The route's name and the key to its stroke, at the line's left terminus.
const label = css({
  gridColumn: "1",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  gap: "1.5mm",
  paddingRight: "2.5mm",
  fontSize: "7.5pt",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase"
})
const swatch = css({ width: "14mm", flex: "none" })

// The stroke runs behind the stations, first centre to last: a route that
// starts at station one and stops at station five, rather than one that
// continues off the sheet at either end.
const strokeCell = css({
  gridColumn: `${stepCol(1)} / -1`,
  position: "relative",
  alignSelf: "stretch",
  zIndex: 1
})
const stroke = css({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)"
})
/**
 * The first and last stations' centres, each half a step column in from its
 * end of the station area. Inline, because a computed value in `css()` is a
 * class name Panda's extractor cannot resolve to a rule.
 */
const HALF_STEP = `${100 / (2 * STEPS)}%`
const strokeEnds: CSSProperties = { left: HALF_STEP, right: HALF_STEP }

const station = css({
  zIndex: 2,
  justifySelf: "center",
  width: `${STATION_MM}mm`,
  height: `${STATION_MM}mm`,
  border: `${RING_MM}mm solid #000`,
  borderRadius: "50%",
  boxSizing: "border-box",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.3mm"
})
const qty = css({
  fontSize: "11pt",
  fontWeight: 900,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

/**
 * How a route is drawn. Colour is not available on a black-and-white sheet,
 * so each good gets a stroke of its own; gradients rather than `border-style`
 * so the dash and dot rhythm is a printed dimension and not the browser's
 * guess. The middles are transparent, so a fare zone shows through.
 */
function strokeStyle(good: Good): CSSProperties {
  const height = `${STROKE_MM}mm`
  switch (good) {
    case "metal":
      return {
        height,
        backgroundImage: `linear-gradient(#000 0 0.6mm, transparent 0.6mm 1.2mm, #000 1.2mm ${height})`
      }
    case "chemical":
      return { height, backgroundImage: "repeating-linear-gradient(to right, #000 0 3.5mm, transparent 3.5mm 5.5mm)" }
    case "food":
      return {
        height,
        backgroundImage: `radial-gradient(circle at 50% 50%, #000 0 ${STROKE_MM / 2}mm, transparent ${
          STROKE_MM / 2
        }mm)`,
        backgroundSize: `3.5mm ${height}`,
        backgroundRepeat: "repeat-x"
      }
    default:
      return { height, background: "#000" }
  }
}

/** One station: the good at mark size, the quantity that step takes beneath it. */
function Station({ good, qty: q, style }: { good: Good; qty: number; style: CSSProperties }) {
  const Mark = markFor(good)
  return (
    <span className={station} style={style}>
      <Mark size={MARK_MM * MM} color="black" />
      <span className={qty}>{q}</span>
    </span>
  )
}

/** One route: its label and key, its stroke, its five stations. */
function Route({ track, index }: { track: ContributionTrack; index: number }) {
  const style = strokeStyle(track.good)
  const row = { gridRow: `${routeRow(index + 1)}` }
  return (
    <>
      <span className={label} style={row}>
        <span>{track.good}</span>
        <span className={swatch} style={style} />
      </span>
      <span className={strokeCell} style={row}>
        <span className={stroke} style={{ ...style, ...strokeEnds }} />
      </span>
      {track.steps.map((q, i) => (
        <Station key={i} good={track.good} qty={q} style={{ ...row, gridColumn: `${stepCol(i + 1)}` }} />
      ))}
    </>
  )
}

export function ContributionSheet() {
  return (
    <div className={`sheet ${sheet}`} style={sheetBox}>
      {CONTRIBUTION_VP.map((_, i) => (
        <span
          key={`zone${i}`}
          className={zone}
          style={{ gridColumn: `${stepCol(i + 1)}`, background: i % 2 === 0 ? "#ebebeb" : "#f6f6f6" }}
        />
      ))}
      {CONTRIBUTION_VP.map((v, i) => (
        <span key={`head${i}`} className={zoneHead} style={{ gridColumn: `${stepCol(i + 1)}` }}>
          <span>Step {i + 1}</span>
          <span className={vp}>{v} VP</span>
        </span>
      ))}
      {CONTRIBUTIONS.map((c, i) => <Route key={c.good} track={c} index={i} />)}
    </div>
  )
}

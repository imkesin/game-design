import { BORDER, MARKET, PAYOFF, RONDEL } from "~/games/numina/map/boardLayout"
import type { GeneratedMap } from "~/games/numina/map/generate"
import mapData from "~/games/numina/map/map.json"
import { MapView } from "~/games/numina/map/MapView"
import { PayoffTable } from "~/games/numina/map/PayoffTable"
import { Rondel } from "~/games/numina/map/Rondel"
import { css } from "~/generated/styled-system/css"
import { CardOutline } from "~/shared/print/CardOutline"

const map = mapData as GeneratedMap

/**
 * The board at 1:1 on an 18x24in print-shop sheet, portrait. A half-inch margin
 * all round leaves the 17x23in live area the hex spec is authored against.
 *
 * The live area is laid out as an explicit 17-column x 23-row grid — one cell
 * per inch of board, taken from `map.inches` so the tracks cannot drift from
 * the coordinates — and the map and card overlays share it as ordinary grid
 * items rather than through hand-picked absolute offsets. The map spans every
 * cell; the card market is a second item placed in a sub-region of the same
 * grid, so it overlaps the map by grid placement alone.
 *
 * The market's position comes from `boardLayout`, which the hex painter reads
 * too — that is what keeps the zone you paint around identical to the zone
 * that prints.
 *
 * IMPORTANT for manual Cmd-P: set Margins = None and Scale = 100%, or the
 * browser shrinks the sheet and the 1:1 sizing is lost.
 */

const sheet = css({
  position: "relative",
  boxSizing: "border-box",
  display: "grid",
  width: "18in",
  height: "24in",
  padding: "0.5in",
  background: "#fff",
  margin: "0 auto"
})

const mapArea = css({
  gridColumn: "1 / -1",
  gridRow: "1 / -1",
  width: "100%",
  height: "100%"
})

/**
 * The frame around a reserved zone — the card market and the payoff table.
 *
 * The bottom of the board's scale, and still well clear of the 0.3mm rail every
 * line on the map is drawn at: a zone edge has to read as something laid on top
 * of the board rather than drawn into it, which is the whole job of these two
 * boxes.
 *
 * Applied through the inline `style` both boxes already use for grid placement,
 * so the two frames cannot drift apart. Panda extracts `css()` statically and
 * would not reliably resolve a shared constant inside it (see ReferencePage).
 */
const ZONE_BORDER = `${BORDER.zone}mm solid #000`

/**
 * The board's edge: the top of the same scale, so the sheet reads outside in.
 * The rondel insets its rim to clear this line, which is the other reason the
 * weight is shared rather than written here — thickening the frame in place
 * would quietly run it through the wheel.
 */
const FRAME_BORDER = `${BORDER.frame}mm solid #000`

// A plain white panel holding the two card footprints. The white is load-bearing
// twice over: it masks the sea rules behind the market so the outlines are read
// against paper rather than through water, and it says the whole zone is
// reserved, not just the cards standing in it.
// `space-evenly`, not a gap plus centring: it makes the space between the cards
// equal to the space around them, and it is the one distribution `marketCardRects`
// can reproduce exactly without either side hard-coding a figure.
const marketArea = css({
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-evenly"
})

// The payoff table's backing. The white fill masks the sea rules underneath, so
// the square reads as a deliberate clearing rather than as a patch the texture
// missed.
//
// The rondel takes no backing: it reserves a square of ground but only occupies
// a disc of it, so it masks with the disc instead and leaves the four corners to
// the map. Its zone keeps its place in the grid either way — the reservation is
// what stops terrain being painted where the wheel goes.
const blankZone = css({
  background: "#fff"
})

/**
 * The frame, as an overlay spanning the live area rather than a border on the
 * sheet or on the map.
 *
 * On the sheet it would land in the margin, outside the 17x23in the spec is
 * authored against. Inside the map it would be cut by the market and rondel
 * panels, which are opaque and run to the same edge — ten of the board's
 * twenty-three rows would lose their right-hand rule. Last in the grid and
 * click-through, it closes over both.
 */
const frameArea = css({
  gridColumn: "1 / -1",
  gridRow: "1 / -1",
  pointerEvents: "none"
})

const page = css({
  background: "#3a3a3a",
  padding: "24px 0",
  "@media print": { background: "#fff", padding: 0 }
})

export function MapPrintPage() {
  return (
    <div className={page}>
      <style>{`@page { size: 18in 24in; margin: 0; } :root { --u: 1mm; }`}</style>
      <div
        className={sheet}
        style={{
          gridTemplateColumns: `repeat(${map.inches.width}, 1fr)`,
          gridTemplateRows: `repeat(${map.inches.height}, 1fr)`
        }}
      >
        <MapView map={map} selectedId={null} onSelect={() => {}} rough className={mapArea} />
        <div
          className={marketArea}
          style={{
            gridColumn: `${map.inches.width - MARKET.cols + 1} / -1`,
            gridRow: `1 / span ${MARKET.rows}`,
            border: ZONE_BORDER
          }}
        >
          <CardOutline />
          <CardOutline />
        </div>
        <Rondel
          style={{
            gridColumn: `${map.inches.width - RONDEL.cols + 1} / -1`,
            gridRow: `${map.inches.height - RONDEL.rows + 1} / -1`
          }}
        />
        <PayoffTable
          className={blankZone}
          style={{
            gridColumn: `1 / span ${PAYOFF.cols}`,
            gridRow: `${map.inches.height - PAYOFF.rows + 1} / -1`,
            border: ZONE_BORDER
          }}
        />
        <div className={frameArea} style={{ border: FRAME_BORDER }} />
      </div>
    </div>
  )
}

export default MapPrintPage

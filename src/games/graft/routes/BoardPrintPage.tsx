import { ForeignMarketTrack } from "~/games/graft/components/ForeignMarketTrack"
import { LaborSupply } from "~/games/graft/components/LaborSupply"
import { MarketStall } from "~/games/graft/components/MarketStall"
import { WorkerZone } from "~/games/graft/components/WorkerZone"
import { laborSupply } from "~/games/graft/domain/LaborSupplyDefinitions"
import { marketStalls } from "~/games/graft/domain/MarketDefinitions"
import { css } from "~/generated/styled-system/css"
import { CardOutline } from "~/shared/print/CardOutline"

/**
 * Full board sheet for an 18x24in print-shop sheet, printed landscape (24in wide
 * x 18in tall). A 0.5in bleed/safe margin all around leaves an inscribed 23x17in
 * board, laid out as a CSS grid. Content tracks are authored as literal decimal
 * inches (Panda extracts `css()` statically, so a runtime unit() helper can't be
 * used); the 0.5in tracks are empty gutters, so `gap` is 0.
 *
 * A full-height `leftRail` (3in, the Labor Supply's width) runs top-to-bottom
 * on the far left, holding the Foreign Markets section. The rest of the board
 * seats the game's four worker-placement zones (one per Focus) as far apart as
 * the sheet allows, pairing each with the supply it draws on:
 *
 *     leftRail     Foreign Markets       (full-height rail)
 *     bottom-mid   Market ellipse        + Sell zone (dead centre)
 *     bottom-right Labor Supply track    + Recruit zone
 *     top-mid      (no supply)             Harvest zone
 *     top-right    Expansion Card supply + Expand zone
 *
 * The top and bottom bands have DIFFERENT column needs, so they don't share
 * tracks: the outer grid's columns serve only the bottom band, and `topBand` is
 * a nested grid (spanning the outer center+gutter+workers columns) with its own.
 *
 *   outer columns: 3 0.5 16 0.5 3  (= 23in)  [leftRail g center g workers]
 *   outer rows:    5.5 0.5 8.5 0.5 2 (= 17in)
 *
 *   outer gridTemplateAreas:
 *     "leftRail . topBand topBand topBand"
 *     "leftRail . .       .       ."
 *     "leftRail . market  .       workers"
 *     "leftRail . market  .       workers"
 *     "leftRail . market  .       workers"
 *
 *   `topBand` spans the top row from the market column rightward (19.5in) with
 *   its own grid:
 *     top columns: 10 0.5 9  (= 19.5in)
 *     top areas:   "harvest . cardsR"
 *
 *   - `leftRail`: 3x17in full-height rail (Foreign Markets), a bare outlined
 *     placeholder for now.
 *   - `market`: bottom 16x11in block (center col, spanning all three bottom
 *     rows), the 7 MarketStalls on an ellipse (kept upright for legibility) with
 *     the Sell zone at its centre.
 *   - `workers`: bottom-right 3x11in column spanning all three bottom rows,
 *     holding the Labor Supply with the Recruit zone tucked below it, framed
 *     together.
 *   - `cardsR`: 9in column — three Expansion Card outlines over the Expand zone.
 *     `harvest`: 10in column centring the (supply-less) Harvest zone.
 *
 * RADIUS_X is sized to the 16in market cell (scaled down from the previous 20in
 * to fund the two 3in rails); RADIUS_Y still fits the unchanged 11in height. With 7
 * stalls anchored at the top vertex the ring's vertical extremes are asymmetric
 * (top sin=-1.0, bottom sin=+0.90), so OFFSET_Y nudges it down to visually
 * center the ellipse within the cell.
 */

const RADIUS_X = 164
const RADIUS_Y = 105
const OFFSET_Y = 5
const STALL_COUNT = 7

const printCss = `
  :root { --u: 1mm; }
  @page { size: 24in 18in; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .screen-only { display: none !important; }
    /*
     * height + overflow:hidden pins the print root to exactly one 18in page.
     * The market stalls are centred with transform: translate(-50%, -50%), and
     * Chrome paginates from the PRE-transform box, whose downward extent crosses
     * the page edge — fragmenting the bottom stalls (Coconut/Lime) onto a
     * phantom second page. Clipping to one page suppresses that break; nothing
     * visible is lost since all content fits within the 18in sheet.
     */
    .print-root { background: #fff !important; padding: 0 !important; display: block !important; height: 18in !important; overflow: hidden !important; }
    .sheet { box-shadow: none !important; margin: 0 !important; }
  }
`

const screen = css({
  background: "#525252",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  padding: "24px"
})

const note = css({
  position: "fixed",
  top: "12px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10,
  background: "#262626",
  color: "#e5e5e5",
  fontSize: "13px",
  padding: "8px 14px",
  borderRadius: "8px"
})

const sheetStyle = css({
  position: "relative",
  width: "24in",
  height: "18in",
  background: "#fff",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  display: "grid",
  gridTemplateColumns: "3in 0.5in 16in 0.5in 3in",
  gridTemplateRows: "5.5in 0.5in 8.5in 0.5in 2in",
  gridTemplateAreas:
    `"leftRail . topBand topBand topBand" "leftRail . . . ." "leftRail . market . workers" "leftRail . market . workers" "leftRail . market . workers"`,
  gap: 0,
  padding: "0.5in"
})

// The top band is its own grid (spanning the outer center+gutter+workers
// columns), independent of the bottom's tracks, so the card columns keep their
// width regardless of the narrower bottom-corner cells below them.
const topBandArea = css({
  gridArea: "topBand",
  display: "grid",
  gridTemplateColumns: "10in 0.5in 9in",
  gridTemplateAreas: `"harvest . cardsR"`,
  gap: 0
})

// A barely-there dotted frame around each region cell — a development aid for
// eyeballing the layout; intended to be removed once the board is finalised.
const devOutline = {
  border: "0.3mm dotted",
  borderColor: "stone.200",
  borderRadius: "card"
} as const

// Each card action stacks its face-up supply over its worker zone: the card row
// sits at the top of the 5.5in band, the labelled WorkerZone tucks in below.
const cardStack = {
  ...devOutline,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "5mm",
  paddingTop: "3mm"
} as const

// The full-height left rail: the Foreign Markets section. A bare placeholder for
// now, sized to match the Labor Supply rail so the two read as a set, and using
// the same faint dev outline as the other unfilled zones.
const leftRailArea = css({ ...devOutline, gridArea: "leftRail", padding: "0" })

const cardsRArea = css({ ...cardStack, gridArea: "cardsR" })

// Harvest has no board supply, so its column just centres the bare zone.
const harvestArea = css({
  ...devOutline,
  gridArea: "harvest",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

const supplyRow = css({ display: "flex", justifyContent: "center", gap: "8mm" })

// The bottom-corner zone cells just centre a labelled WorkerZone. No outline of
// their own — they sit inside the workers column, which frames them.
const zoneCell = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

// The workers column spans the full 11in bottom band, framing its track (top)
// and its worker zone (bottom, ~1.5in) as one dev-outlined region. `1fr auto`
// lets the track fill and the zone take its natural height.
const workersArea = css({
  ...devOutline,
  gridArea: "workers",
  display: "grid",
  gridTemplateRows: "1fr auto",
  gap: "0.25in"
})

const gameArea = css({
  gridArea: "market",
  position: "relative",
  border: "0.3mm dotted",
  borderColor: "stone.200",
  borderRadius: "card"
})

const stallWrap = css({
  position: "absolute",
  transform: "translate(-50%, -50%)"
})

export function BoardPrintPage() {
  const stalls = marketStalls.slice(0, STALL_COUNT)

  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → 24x18in landscape · Margins: None · Scale: 100%
        </div>
        <div className={`sheet ${sheetStyle}`}>
          <div className={leftRailArea}>
            <ForeignMarketTrack />
          </div>
          <div className={topBandArea}>
            <div className={harvestArea}>
              <WorkerZone label="Harvest" />
            </div>
            <div className={cardsRArea}>
              <div className={supplyRow}>
                {Array.from({ length: 3 }, (_, i) => <CardOutline key={i} label="Expansion" />)}
              </div>
              <WorkerZone label="Expand" />
            </div>
          </div>
          <div className={workersArea}>
            <LaborSupply track={laborSupply.workerTrack} />
            <div className={zoneCell}>
              <WorkerZone label="Recruit" />
            </div>
          </div>
          <div className={gameArea}>
            <div
              className={stallWrap}
              style={{ left: "50%", top: `calc(50% + ${OFFSET_Y}mm)` }}
            >
              <WorkerZone label="Sell" />
            </div>
            {stalls.map((stall, i) => {
              const theta = (-90 + (i * 360) / STALL_COUNT) * (Math.PI / 180)
              const x = RADIUS_X * Math.cos(theta)
              const y = RADIUS_Y * Math.sin(theta)
              return (
                <div
                  key={stall.fruit}
                  className={stallWrap}
                  style={{ left: `calc(50% + ${x}mm)`, top: `calc(50% + ${y + OFFSET_Y}mm)` }}
                >
                  <MarketStall
                    fruit={stall.fruit}
                    color="stone"
                    columns={stall.demandColumns}
                    induces={stall.induces}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

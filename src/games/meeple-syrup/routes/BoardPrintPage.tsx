import { tradeTracks } from "~/games/meeple-syrup/cards/tradeTracks"
import { CardRow } from "~/games/meeple-syrup/components/CardZone"
import { TradeTrackBoard } from "~/games/meeple-syrup/components/TradeTrackBoard"
import { css } from "~/generated/styled-system/css"
import { CARD_TRIM_H_MM } from "~/shared/print/cardSize"

/**
 * Full board sheet for an 18x24in print-shop sheet, printed landscape (24in
 * wide x 18in tall). A 0.5in bleed/safe margin all around leaves an inscribed
 * 23x17in play area, and everything is laid out inside it — nothing is allowed
 * into the margin.
 *
 * This module owns the sheet's height budget. The card band is fixed; the
 * market strip takes everything else and sizes its rungs to fit (see
 * `TradeTrackBoard`'s `heightIn`), so resizing the band tightens the ladders
 * instead of overflowing the page.
 *
 *   rows: market strip (the remainder) · breathing room · card band
 *
 * There is no title band: the sheet carries no heading, which buys the market
 * the full top of the play area. The legend it used to sit beside now lives in
 * the card band's centre gap, where it costs no height at all.
 *
 * The card band splits to the two bottom corners — sections on the left, cards
 * on the right — with the slack between them left as one deliberate gap.
 */

// Play-area height, in inches: the 18in sheet less a 0.5in margin top and
// bottom. Width needs no constant — every band fills it.
const PLAY_H_IN = 17

/** The only separator left on the sheet, between the market and the card band. */
const BREATHE_IN = 0.5

// The band is a card plus its title, its price tag and the drift arrow under
// the resource row. Card height is the real trim constant so the footprint can
// never drift from the cards themselves.
const CARD_H_IN = CARD_TRIM_H_MM / 25.4
const BAND_IN = CARD_H_IN + 1.1

/**
/**
 * Four animals on offer, the two oldest of them free. The slot price is charged
 * *on top of* the hire the card prints, so the dear slots are paying for reach
 * rather than for the animal — the free ones are whatever happens to be there,
 * and two syrup buys you the one you actually want.
 *
 * The row drifts rightward, toward its free end, so an animal nobody wants gets
 * cheaper rather than sitting at 2 syrup forever and blocking the slot.
 *
 * Two free slots rather than one, and four cards rather than three, because the
 * animals now carry the whole reliable economy. The forage bag is deliberately
 * a decaying action (see `forageBag.ts`), which only works as a design if the
 * thing it pushes players toward is genuinely dependable — and a three-card row
 * with a single free slot is not dependable, it is one free card that may well
 * be the wrong species. Widening the row is what makes "stop foraging, go hire"
 * an instruction a player can actually follow.
 *
 * The cost is paid in syrup demand, and it is not small. Half the row is free
 * now instead of a third, so syrup buys reach less often. Syrup already lost a
 * sink when the resource market became a bag, and this thins what remains:
 * it is down to the dear end of this one row, the recruit shortcut, and the
 * point per animal retired. If syrup ends up slack in play, this row is the
 * first place to take it back — `[2, 1, 1, 0]` before touching anything else.
 */
const ANIMAL_SLOTS = [2, 1, 0, 0]

/**
 * Where the bag sits. One footprint, no price and no drift — it is a resting
 * place, not a market. It keeps the corner the resource row used to hold so the
 * band still reads as two zones rather than one row adrift on a wide sheet, and
 * so everyone at the table knows where to reach.
 *
 * The imbalance against the four-slot animal row is the point: the board should
 * look like the animals are where the game is.
 */
const BAG_SLOT = [null]

/** What the market strip is left with once the fixed rows are subtracted. */
const STRIP_IN = PLAY_H_IN - BREATHE_IN - BAND_IN

const printCss = `
  :root { --u: 1mm; }
  @page { size: 24in 18in; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .screen-only { display: none !important; }
    /* Pin the print root to exactly one 18in page so nothing spills a phantom second page. */
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

// Row heights come from the constants above rather than literals, so the budget
// can never disagree with the grid — `gridTemplateRows` is set inline for that
// reason (Panda extracts `css()` statically and would bake in stale numbers).
const sheetStyle = css({
  position: "relative",
  width: "24in",
  height: "18in",
  background: "#fff",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  display: "grid",
  gridTemplateAreas: `"strip" "." "band"`,
  gap: 0,
  padding: "0.5in"
})

const sheetRows = {
  gridTemplateRows: `${STRIP_IN}in ${BREATHE_IN}in ${BAND_IN}in`
}

// The band pins its two zones to opposite corners: the outer columns take their
// content's width and the middle `1fr` swallows whatever slack the sheet has
// left — five card footprints against a 23in play area, so a good deal.
const bandArea = css({
  gridArea: "band",
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "start"
})

const stripArea = css({ gridArea: "strip" })

export function BoardPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → 24x18in landscape · Margins: None · Scale: 100%
        </div>
        <div className={`sheet ${sheetStyle}`} style={sheetRows}>
          <div className={stripArea}>
            <TradeTrackBoard tracks={tradeTracks} heightIn={STRIP_IN} />
          </div>
          <div className={bandArea}>
            <CardRow title="Animals" prices={ANIMAL_SLOTS} drift="right" />
            <span />
            <CardRow title="Forage Bag" prices={BAG_SLOT} />
          </div>
        </div>
      </div>
    </>
  )
}

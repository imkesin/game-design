import { type CSSProperties, type ReactNode } from "react"
import { css } from "~/generated/styled-system/css"
import { CARD_TRIM_H_MM, CARD_TRIM_W_MM } from "~/shared/print/cardSize"

/**
 * Home print-and-play sheet, shared by every game. Lays cards out 3-across on US
 * Letter, trim size (63x88mm), packed 9 per page (3x3), and flows across as many
 * pages as needed. Cmd-P (or Playwright) produces one PDF with multiple pages of
 * cards.
 *
 *   - `--u` is pinned to 1mm on `:root` so cards are exact physical size.
 *   - `@page` is Letter with zero margin; each sheet positions its own grid and
 *     draws the cut guides, so margins are part of the layout (and the cut ticks
 *     can live in them).
 *   - Cards touch; their hairline outlines form the interior cut grid.
 *     Registration ticks extend into the margins at every grid line.
 *
 * The caller supplies the already-expanded card list plus a `renderCard`
 * function — this component owns page geometry only, never card anatomy.
 *
 * IMPORTANT for manual Cmd-P: set Margins = None and Scale = 100%, else the
 * browser shrinks everything and the 1:1 sizing is lost.
 */

// US Letter and trim-card geometry, in millimetres (page geometry is in real
// mm, independent of the `--u` card-unit zoom).
const PAGE_W = 215.9
const PAGE_H = 279.4
const CARD_W = CARD_TRIM_W_MM
const CARD_H = CARD_TRIM_H_MM
const COLS = 3
const ROWS = 3
const PER_PAGE = COLS * ROWS

// Centre the 3x3 block on the page; the leftover becomes symmetric margins.
const MARGIN_X = (PAGE_W - COLS * CARD_W) / 2 // 13.45mm
const MARGIN_Y = (PAGE_H - ROWS * CARD_H) / 2 // 7.7mm
const TICK_LEN = 4 // mm
const TICK_W = 0.2 // mm

// Page label lives in the bottom margin, below the tick zone and horizontally
// centred so it never collides with a column tick. Small enough to ignore while
// cutting, large enough to read from a stack of sheets.
const LABEL_TOP = MARGIN_Y + ROWS * CARD_H + TICK_LEN
const LABEL_SIZE = 2.6 // mm

function chunks<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const printCss = `
  :root {
    --u: 1mm;
  }
  @page {
    size: letter; margin: 0;
  }
  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }
    .screen-only {
      display: none !important;
    }

    /* Strip the on-screen backdrop so pages are pure white. */
    .print-root {
      background: #fff !important;
      padding: 0 !important;
      gap: 0 !important;
      display: block !important;
    }

    /*
       Content-height sheets (top margin + grid only) sit below one page so
       there is no phantom overflow page; break-before starts each on a page.
     */
    .sheet {
      box-shadow: none !important;
      margin: 0 !important;
      height: auto !important;
      padding-bottom: 0 !important;
    }
    .sheet:not(:first-of-type) {
      break-before: page;
    }
  }
`

const screen = css({
  // On screen: stack the sheets on a neutral backdrop so it reads as paper.
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
  background: "#fff",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none"
})

const gridStyle = css({
  display: "grid",
  gap: 0
})

function Ticks() {
  const marks: CSSProperties[] = []
  // Vertical ticks at each column boundary, in the top and bottom margins.
  for (let c = 0; c <= COLS; c++) {
    const x = MARGIN_X + c * CARD_W
    const v = { left: `${x - TICK_W / 2}mm`, width: `${TICK_W}mm`, background: "#000", position: "absolute" as const }
    marks.push({ ...v, top: `${MARGIN_Y - TICK_LEN}mm`, height: `${TICK_LEN}mm` })
    marks.push({ ...v, top: `${MARGIN_Y + ROWS * CARD_H}mm`, height: `${TICK_LEN}mm` })
  }
  // Horizontal ticks at each row boundary, in the left and right margins.
  for (let r = 0; r <= ROWS; r++) {
    const y = MARGIN_Y + r * CARD_H
    const h = { top: `${y - TICK_W / 2}mm`, height: `${TICK_W}mm`, background: "#000", position: "absolute" as const }
    marks.push({ ...h, left: `${MARGIN_X - TICK_LEN}mm`, width: `${TICK_LEN}mm` })
    marks.push({ ...h, left: `${MARGIN_X + COLS * CARD_W}mm`, width: `${TICK_LEN}mm` })
  }
  return (
    <>
      {marks.map((s, i) => <div key={i} style={s} />)}
    </>
  )
}

const labelStyle = css({
  position: "absolute",
  left: 0,
  right: 0,
  textAlign: "center",
  fontFamily: "sans-serif",
  color: "#737373",
  letterSpacing: "0.4mm"
})

export function CardSheetPage<T>({
  cards,
  renderCard,
  controls
}: {
  cards: readonly T[]
  /** Renders one card at trim size. `key` is supplied ready to spread on the node. */
  renderCard: (card: T, key: string) => ReactNode
  /** Screen-only controls shown in the print note (e.g. a player-count picker). */
  controls?: ReactNode
}) {
  const pages = chunks(cards, PER_PAGE)
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → Letter · Margins: None · Scale: 100% · {cards.length} cards on {pages.length} pages
          {controls}
        </div>
        {pages.map((page, pi) => (
          <div
            key={pi}
            className={`sheet ${sheetStyle}`}
            style={{
              width: `${PAGE_W}mm`,
              height: `${PAGE_H}mm`,
              padding: `${MARGIN_Y}mm ${MARGIN_X}mm`
            }}
          >
            <Ticks />
            <div
              className={gridStyle}
              style={{ gridTemplateColumns: `repeat(${COLS}, ${CARD_W}mm)` }}
            >
              {page.map((card, ci) => renderCard(card, `${pi}-${ci}`))}
            </div>
            <div
              className={labelStyle}
              style={{
                top: `${LABEL_TOP}mm`,
                fontSize: `${LABEL_SIZE}mm`,
                lineHeight: `${PAGE_H - LABEL_TOP}mm`
              }}
            >
              {pi + 1} / {pages.length} · {page.length} cards
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

import { BoardMap } from "~/games/tigers-path/components/BoardMap"
import type { GeneratedMap } from "~/games/tigers-path/map/layout"
import mapsData from "~/games/tigers-path/map/maps.json"
import { css } from "~/generated/styled-system/css"

/**
 * A board variant on its own sheet, sized to the board itself (0.25in margin all
 * round) so it prints true at any orientation — letter portrait for the solo
 * board, an 18×24 half for the split board. One route per variant (see
 * `index.ts`); `paint.node.ts` screenshots these.
 */

const maps = mapsData as unknown as Record<string, GeneratedMap>
const PAD_IN = 0.25

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

const sheet = css({
  background: "#fff",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  padding: "0.25in"
})

function BoardSheet({ map }: { map: GeneratedMap }) {
  const boardWIn = map.width / map.unitsPerInch
  const boardHIn = map.height / map.unitsPerInch
  const sheetWIn = boardWIn + PAD_IN * 2
  const sheetHIn = boardHIn + PAD_IN * 2

  const printCss = `
    :root { --u: 1mm; }
    @page { size: ${sheetWIn}in ${sheetHIn}in; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      .screen-only { display: none !important; }
      .print-root { background: #fff !important; padding: 0 !important; display: block !important; height: ${sheetHIn}in !important; overflow: hidden !important; }
      .sheet { box-shadow: none !important; margin: 0 !important; }
    }
  `

  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Board {boardWIn.toFixed(1)}×{boardHIn.toFixed(1)}in · Margins: None · Scale: 100%
        </div>
        <div className={`sheet ${sheet}`} style={{ width: `${sheetWIn}in`, height: `${sheetHIn}in` }}>
          <BoardMap map={map} />
        </div>
      </div>
    </>
  )
}

/**
 * Sheet 1 — the shared Arch-C 24×18 landscape print: the 3P (West) half on the
 * left and the 2P (East) half on the right, each an 11.5×17 board with its own
 * on-board Grassland, split by a dashed gutter down the middle. You play one
 * half; the other is ignored. Laid out with a CSS grid — [board][gutter][board]
 * — centred on the page so the leftover paper becomes an even margin all round.
 */
const SHEET1_W_IN = 24
const SHEET1_H_IN = 18
const GUTTER_IN = 0.5

const sheet1 = css({
  background: "#fff",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  display: "grid",
  alignContent: "center",
  justifyContent: "center",
  alignItems: "center",
  justifyItems: "center"
})

const gutter = css({
  height: "100%",
  display: "flex",
  justifyContent: "center"
})

const dashedRule = css({
  width: "0",
  height: "100%",
  borderLeft: "1.5px dashed #9ca3af"
})

function Sheet1() {
  const west = maps["3p-split"]!
  const east = maps["2p-split"]!
  const boardWIn = east.width / east.unitsPerInch
  const boardHIn = east.height / east.unitsPerInch
  const sheetWIn = SHEET1_W_IN
  const sheetHIn = SHEET1_H_IN

  const printCss = `
    :root { --u: 1mm; }
    @page { size: ${sheetWIn}in ${sheetHIn}in; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      .screen-only { display: none !important; }
      .print-root { background: #fff !important; padding: 0 !important; display: block !important; height: ${sheetHIn}in !important; overflow: hidden !important; }
      .sheet { box-shadow: none !important; margin: 0 !important; }
    }
  `

  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Sheet 1 · {sheetWIn.toFixed(1)}×{sheetHIn.toFixed(1)}in · 3P (West) + 2P (East) · Margins: None · Scale: 100%
        </div>
        <div
          className={`sheet ${sheet1}`}
          style={{
            width: `${sheetWIn}in`,
            height: `${sheetHIn}in`,
            gridTemplateColumns: `${boardWIn}in ${GUTTER_IN}in ${boardWIn}in`,
            gridTemplateRows: `${boardHIn}in`
          }}
        >
          <div style={{ width: `${boardWIn}in`, height: `${boardHIn}in` }}>
            <BoardMap map={west} />
          </div>
          <div className={gutter}>
            <div className={dashedRule} />
          </div>
          <div style={{ width: `${boardWIn}in`, height: `${boardHIn}in` }}>
            <BoardMap map={east} />
          </div>
        </div>
      </div>
    </>
  )
}

/** Default board route — the shared Sheet 1 (3P West + 2P East). */
export function BoardPrintPage() {
  return <Sheet1 />
}

export function BoardPrintSheet1() {
  return <Sheet1 />
}

export function BoardPrintSplit() {
  return <BoardSheet map={maps["2p-split"]!} />
}

export function BoardPrintSplit3() {
  return <BoardSheet map={maps["3p-split"]!} />
}

export function BoardPrintSolo() {
  return <BoardSheet map={maps["2p-solo"]!} />
}

export default BoardPrintPage

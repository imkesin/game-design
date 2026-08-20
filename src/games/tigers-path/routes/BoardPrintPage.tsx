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

/** Default board route — the split-sheet 2P half. */
export function BoardPrintPage() {
  return <BoardSheet map={maps["2p-split"]!} />
}

export function BoardPrintSplit() {
  return <BoardSheet map={maps["2p-split"]!} />
}

export function BoardPrintSolo() {
  return <BoardSheet map={maps["2p-solo"]!} />
}

export default BoardPrintPage

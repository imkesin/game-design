import { IN } from "~/games/fiber/map/map"
import { CELL, PlayerMat, SUPPLY } from "~/games/fiber/mat/PlayerMat"
import { css } from "~/generated/styled-system/css"

/** The 10 × 8in player mat centred on a US Letter landscape page with a thin cut line. Print at 100%, no margins. */

const PAGE = { width: 11 * IN, height: 8.5 * IN }
const CUT = 0.25

const printCss = `
  @page { size: letter landscape; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .mat-root { padding: 0 !important; gap: 0 !important; background: #fff !important; }
    .mat-page { box-shadow: none !important; }
    .screen-only { display: none !important; }
  }
`

const root = css({
  display: "grid",
  justifyItems: "center",
  alignContent: "start",
  gap: "16px",
  padding: "24px",
  minHeight: "100vh",
  background: "#404040",
  color: "#e5e5e5",
  fontFamily: "system-ui, sans-serif",
  fontSize: "13px"
})

const page = css({ display: "grid", placeItems: "center", background: "white" })

export function MatPage() {
  return (
    <div className={`mat-root ${root}`}>
      <style>{printCss}</style>
      <div className="screen-only">
        Player mat, 10 × 8in · row {CELL.width.toFixed(1)} × {CELL.height.toFixed(1)}mm · supply (Hub : cable){" "}
        {SUPPLY.hub} : {SUPPLY.cable}
      </div>
      <div className={`mat-page ${page}`} style={{ width: `${PAGE.width}mm`, height: `${PAGE.height}mm` }}>
        <div style={{ outline: `${CUT}mm solid black` }}>
          <PlayerMat />
        </div>
      </div>
    </div>
  )
}

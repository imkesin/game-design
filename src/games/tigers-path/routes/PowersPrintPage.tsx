import { PowersBoard } from "~/games/tigers-path/components/PowersBoard"
import { css } from "~/generated/styled-system/css"

/**
 * The powers board, personal-copy edition: two shrunk copies of the same
 * five-track board stacked on one portrait letter sheet with a cut line
 * between them, so each player takes their own half and tracks their own
 * status rather than sharing one landscape board at the table.
 *
 * The board's natural footprint (five 1in rows + gaps, eight 1.1in columns
 * plus the label) is fixed pixel/inch geometry inside `PowersBoard` — rather
 * than touching its internals, each copy is rendered at full size and shrunk
 * with `zoom`, which (unlike `transform: scale`) participates in layout and is
 * honored when printing. A transform is a paint-time effect that Safari/WebKit
 * — and some Chrome print paths — drop on print, leaving the board painted at
 * full size from the top-left corner and clipped.
 */

const BOARD_W = 10.9
const BOARD_H = 5.48
const SCALE = 0.7

const printCss = `
  :root { --u: 1mm; }
  @page { size: 8.5in 11in; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .screen-only { display: none !important; }
    .print-root { background: #fff !important; padding: 0 !important; display: block !important; height: 11in !important; overflow: hidden !important; }
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

const sheet = css({
  width: "8.5in",
  height: "11in",
  background: "#fff",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  padding: "0.4in",
  display: "grid",
  gridTemplateRows: "1fr auto 1fr",
  justifyItems: "center",
  alignItems: "center"
})

const cutLine = css({
  width: "100%",
  borderTopWidth: "0.5mm",
  borderTopStyle: "dashed",
  borderTopColor: "stone.400",
  marginBlock: "0.15in"
})

const boardWindow = css({ flex: "none" })

function ScaledBoard() {
  return (
    <div className={boardWindow} style={{ zoom: SCALE, width: `${BOARD_W}in`, height: `${BOARD_H}in` }}>
      <PowersBoard />
    </div>
  )
}

export function PowersPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → Letter portrait · Margins: None · Scale: 100% · Cut along the dashed line
        </div>
        <div className={`sheet ${sheet}`}>
          <ScaledBoard />
          <div className={cutLine} />
          <ScaledBoard />
        </div>
      </div>
    </>
  )
}

export default PowersPrintPage

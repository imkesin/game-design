import { BoardMap } from "~/games/tigers-path/components/BoardMap"
import { css } from "~/generated/styled-system/css"

/**
 * The map on a letter sheet, landscape. Unlike the established games' 18x24in
 * print-shop boards, the whole v0 kit targets a home printer — the point is a
 * playtest this week, not a handsome board. 0.4in margins leave a 10.2x7.7in
 * live area; the map is 9.8x7.6in and centres in it.
 */

const printCss = `
  :root { --u: 1mm; }
  @page { size: 11in 8.5in; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .screen-only { display: none !important; }
    .print-root { background: #fff !important; padding: 0 !important; display: block !important; height: 8.5in !important; overflow: hidden !important; }
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
  width: "11in",
  height: "8.5in",
  background: "#fff",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  padding: "0.4in"
})

export function BoardPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → Letter landscape · Margins: None · Scale: 100%
        </div>
        <div className={`sheet ${sheet}`}>
          <BoardMap />
        </div>
      </div>
    </>
  )
}

export default BoardPrintPage

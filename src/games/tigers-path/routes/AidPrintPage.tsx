import { PlayerAid } from "~/games/tigers-path/components/PlayerAid"
import { css } from "~/generated/styled-system/css"

/**
 * The reference sheet on letter portrait. v0 has no rulebook, so this page is
 * the rules — print one per player.
 */

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
  padding: "0.5in"
})

export function AidPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → Letter portrait · Margins: None · Scale: 100% · one per player
        </div>
        <div className={`sheet ${sheet}`}>
          <PlayerAid />
        </div>
      </div>
    </>
  )
}

export default AidPrintPage

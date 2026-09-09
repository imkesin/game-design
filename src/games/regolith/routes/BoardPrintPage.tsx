import { LandscapeSheet, SiloSheet } from "~/games/regolith/components/SiloBoard"
import { SILOS } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * The silo board: three portrait letter sheets of two tall silos each, then
 * two landscape sheets for the single-zone silos (all of D; E plus F1). Print
 * at 100% with no margins so the zones hold a meeple. Mixed orientation uses a
 * named page; Chrome honours it, other browsers may need the two landscape
 * sheets printed separately.
 */

const printCss = `
  :root { --u: 1mm; }
  @page { size: 8.5in 11in; margin: 0; }
  @page landscape { size: 11in 8.5in; margin: 0; }
  .sheet-landscape { page: landscape; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .screen-only { display: none !important; }
    .print-root { background: #fff !important; padding: 0 !important; gap: 0 !important; display: block !important; }
    .sheet { box-shadow: none !important; margin: 0 !important; }
    .sheet:not(:first-of-type) { break-before: page; }
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

const silos = (ids: string[]) => ids.map((id) => SILOS.find((s) => s.id === id)!)
const PORTRAIT = [["A", "B1"], ["B2", "C1"], ["C2", "C3"]].map(silos)
const LANDSCAPE = [["D1", "D2", "D3"], ["E1", "E2", "F1"]].map(silos)

const shadow = css({ boxShadow: "0 8px 24px rgba(0,0,0,0.4)", flex: "none" })

export function BoardPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`screen-only ${note}`}>
          Cmd-P · Letter · Margins: None · Scale: 100% · last two sheets landscape
        </div>
        {PORTRAIT.map((sheet, i) => (
          <div key={i} className={shadow}>
            <SiloSheet silos={sheet} />
          </div>
        ))}
        {LANDSCAPE.map((sheet, i) => (
          <div key={i} className={shadow}>
            <LandscapeSheet silos={sheet} />
          </div>
        ))}
      </div>
    </>
  )
}

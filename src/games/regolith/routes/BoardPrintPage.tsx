import { CoverSheet, SiloSheet } from "~/games/regolith/components/SiloBoard"
import { SILOS } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * The silo board: four portrait letter sheets of three silos, then one sheet
 * of cover tiles cut out and laid over the covered zones. Print at 100% with
 * no margins so the 1.8in zones hold a meeple.
 */

const printCss = `
  :root { --u: 1mm; }
  @page { size: 8.5in 11in; margin: 0; }
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

const SHEETS = [["A", "B1", "B2"], ["C1", "C2", "C3"], ["D1", "D2", "E1"], ["E2", "E3", "F1"]].map((ids) =>
  ids.map((id) => SILOS.find((s) => s.id === id)!)
)

const shadow = css({ boxShadow: "0 8px 24px rgba(0,0,0,0.4)", flex: "none" })

export function BoardPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`screen-only ${note}`}>Cmd-P · Letter portrait · Margins: None · Scale: 100%</div>
        {SHEETS.map((silos, i) => (
          <div key={i} className={shadow}>
            <SiloSheet silos={silos} />
          </div>
        ))}
        <div className={shadow}>
          <CoverSheet />
        </div>
      </div>
    </>
  )
}

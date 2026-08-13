import { PowersBoard } from "~/games/tigers-path/components/PowersBoard"
import { css, cx } from "~/generated/styled-system/css"
import { paperFrame } from "~/shared/components/paperFrame"

/**
 * The powers board on a letter sheet, landscape: the five tracks, and beneath
 * them the general supply — a labeled parking zone rather than a rules object,
 * but giving it printed ground keeps "general supply" from becoming a loose
 * pile arguments are had over.
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
  padding: "0.4in",
  display: "grid",
  gridTemplateRows: "1fr 1.8in",
  rowGap: "0.25in"
})

const supplyZone = css({
  borderWidth: "0.5mm",
  borderStyle: "dashed",
  borderRadius: "4mm",
  display: "grid",
  placeItems: "center",
  justifySelf: "center",
  width: "9.78in"
})

const supplyLabel = css({
  fontSize: "title",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "stone.400"
})

export function PowersPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → Letter landscape · Margins: None · Scale: 100%
        </div>
        <div className={`sheet ${sheet}`}>
          <PowersBoard />
          <div className={cx(supplyZone, paperFrame({ color: "stone" }))}>
            <span className={supplyLabel}>General Supply</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default PowersPrintPage

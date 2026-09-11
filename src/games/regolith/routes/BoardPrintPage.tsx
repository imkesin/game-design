import { ContributionSheet } from "~/games/regolith/components/ContributionBoard"
import { TrackSheet } from "~/games/regolith/components/TrackBoard"
import type { Column } from "~/games/regolith/components/TrackBoard"
import { TRACKS } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * The board: four portrait letter sheets. Physical and Chemical share the
 * first; Bio and the empty Buildings column share the second; the level
 * track and the five building tiles (cut these out) share the third; the
 * fourth is the contribution board — half a sheet, and a different kind of
 * thing: a transit map with no rules text on it. Print at 100%
 * with no margins so the spaces hold two meeples.
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

const track = (id: string): Column => ({ kind: "track", track: TRACKS.find((t) => t.id === id)! })
const SHEETS: readonly (readonly Column[])[] = [
  [track("P"), track("C")],
  [track("B"), { kind: "buildings" }],
  [{ kind: "level" }, { kind: "tiles" }]
]

const shadow = css({ boxShadow: "0 8px 24px rgba(0,0,0,0.4)", flex: "none" })

export function BoardPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`screen-only ${note}`}>
          Cmd-P · Letter portrait · Margins: None · Scale: 100% · cut out the five building tiles on sheet 3
        </div>
        {SHEETS.map((cols, i) => (
          <div key={i} className={shadow}>
            <TrackSheet columns={cols} />
          </div>
        ))}
        <div className={shadow}>
          <ContributionSheet />
        </div>
      </div>
    </>
  )
}

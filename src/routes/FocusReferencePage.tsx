import { SETUP } from "~/domain/CoreDefinitions"
import { FOCUS_ACTION_METADATA, FOCUSES } from "~/domain/FocusDefinitions"
import { TRADE_ROUTE_RULES, WINNING } from "~/domain/ForeignMarketDefinitions"
import { css } from "~/generated/styled-system/css"

/**
 * Single-page player reference. Not a rulebook — a one-sheet "latest rules" card
 * a player keeps beside them. It flows an ordered list of Sections through a
 * balanced two-column body: the four Focus actions, then Trade Routes, then
 * Winning. Each Section is kept whole (break-inside: avoid).
 *
 * A Section is deliberately small but covers every shape the sheet needs:
 *   - `paragraphs`   — plain rule prose (the Focus actions, Winning's lead-in)
 *   - `subsections`  — a titled sub-block with its own prose (Trade Routes'
 *                      Unlocking / Developing)
 *   - `note`         — a tinted aside flagging an optional add-on that lives in
 *                      another section (Sell's overflow into Trade Routes)
 *   - `list`         — a bullet or numbered list (Setup's steps, Winning's
 *                      victory conditions)
 * The prose itself lives in the domain files; this page only arranges it.
 *
 * Print geometry mirrors the card sheet (PrintPage): Letter, zero @page margin,
 * the sheet supplies its own inner margin, and the on-screen backdrop is
 * stripped white at print time. This page is typographic, not card-unit based,
 * so it uses pt/mm directly rather than `--u`.
 *
 * IMPORTANT for manual Cmd-P: Margins = None, Scale = 100%.
 */

const PAGE_W = 215.9 // US Letter, mm
const PAGE_H = 279.4
const MARGIN = 14

// Each Section carries an accent that ties the block to a colour identity. Kept
// muted (600/700-step) so the sheet reads as ink on paper, not a highlighter.
const ACCENT = {
  Setup: "#475569", // slate.600 — a neutral preamble tone
  Expand: "#059669", // emerald.600
  Harvest: "#d97706", // amber.600
  Recruit: "#0284c7", // sky.600
  Sell: "#e11d48", // rose.600
  TradeRoutes: "#0d9488", // teal.600
  Winning: "#a16207" // yellow.700 — deep gold, distinct from Harvest's amber
} as const

type Subsection = { readonly heading: string; readonly paragraphs: readonly string[] }

type Section = {
  readonly key: string
  readonly title: string
  /** Small uppercase label beside the title (e.g. a Focus's action name). */
  readonly kicker?: string
  readonly accent: string
  readonly paragraphs?: readonly string[]
  readonly subsections?: readonly Subsection[]
  readonly list?: { readonly ordered?: boolean; readonly items: readonly string[] }
  readonly note?: string
}

// Split a domain prose string into its paragraphs.
const paras = (text: string) => text.split("\n\n")

// The sheet's content, in print order: the four Focus actions, then the two
// Foreign-Market sections. All prose is sourced from the domain layer.
const SECTIONS: readonly Section[] = [
  {
    key: "setup",
    title: "Setup",
    kicker: "Before Play",
    accent: ACCENT.Setup,
    list: { ordered: true, items: SETUP.steps }
  },
  ...FOCUSES.map((focus): Section => {
    const action = FOCUS_ACTION_METADATA[focus].actions[0]!
    return {
      key: focus,
      title: focus,
      kicker: action.name !== focus ? action.name : undefined,
      accent: ACCENT[focus],
      paragraphs: paras(action.ruleDescription),
      note: action.note
    }
  }),
  {
    key: "trade-routes",
    title: "Trade Routes",
    kicker: "Foreign Markets",
    accent: ACCENT.TradeRoutes,
    subsections: [
      { heading: "Unlocking", paragraphs: paras(TRADE_ROUTE_RULES.unlocking) },
      { heading: "Developing", paragraphs: paras(TRADE_ROUTE_RULES.developing) }
    ],
    note: TRADE_ROUTE_RULES.timing
  },
  {
    key: "winning",
    title: "Winning",
    accent: ACCENT.Winning,
    paragraphs: paras(WINNING.lead),
    list: { items: WINNING.conditions }
  }
]

const printCss = `
  @page { size: letter; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .screen-only { display: none !important; }
    .print-root { background: #fff !important; padding: 0 !important; gap: 0 !important; display: block !important; }
    /*
     * The content is shorter than a Letter page. Pinning the sheet to the full
     * page height leaves a box that ends exactly at the page edge, which Chrome
     * fragments onto a phantom second page. Letting print height flow to content
     * keeps it on one page; the @page's zero margin + the sheet's own padding
     * still supply the print margin.
     */
    .sheet { box-shadow: none !important; margin: 0 !important; height: auto !important; }
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

// The page is a grid: a header band over a flowing two-column body. The body
// uses CSS multi-column so the six variable-length blocks balance across the
// two columns, with each block kept whole (break-inside: avoid).
const sheetStyle = css({
  position: "relative",
  background: "#fff",
  color: "#1c1917",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  fontFamily: "system-ui, -apple-system, sans-serif"
})

const header = css({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "baseline",
  gap: "6mm",
  paddingBottom: "3mm",
  borderBottom: "0.6mm solid #1c1917"
})

const title = css({
  fontSize: "27pt",
  fontWeight: 800,
  letterSpacing: "-0.01em",
  lineHeight: 1
})

const subtitle = css({
  fontSize: "10.5pt",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#57534e"
})

const body = css({
  columnCount: 2,
  columnGap: "9mm",
  paddingTop: "6.5mm"
})

const block = css({
  breakInside: "avoid",
  marginBottom: "6mm",
  paddingLeft: "4.5mm",
  borderLeft: "1.4mm solid"
})

const blockHead = css({
  display: "flex",
  alignItems: "baseline",
  gap: "2.5mm",
  marginBottom: "2mm",
  flexWrap: "wrap"
})

const sectionName = css({
  fontSize: "15pt",
  fontWeight: 800,
  lineHeight: 1
})

const kicker = css({
  fontSize: "8.5pt",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase"
})

const para = css({
  fontSize: "9.5pt",
  lineHeight: 1.45,
  margin: "0 0 2mm 0",
  color: "#292524"
})

const subheading = css({
  fontSize: "9pt",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#44403c",
  margin: "0 0 1.2mm 0"
})

const list = css({
  margin: "0.5mm 0 0 0",
  paddingLeft: "5mm",
  listStyleType: "disc"
})

const listItem = css({
  fontSize: "9.5pt",
  lineHeight: 1.4,
  marginBottom: "1mm",
  color: "#292524"
})

// A tinted aside for a cross-reference add-on (e.g. Sell → Trade Routes). Its
// background/left tick take the section accent at low alpha (8-digit hex).
const callout = css({
  fontSize: "8.5pt",
  lineHeight: 1.4,
  fontWeight: 600,
  marginTop: "1mm",
  padding: "1.6mm 2.4mm",
  borderRadius: "1.4mm"
})

function SectionBlock({ section }: { section: Section }) {
  const { accent } = section
  return (
    <div className={block} style={{ borderLeftColor: accent }}>
      <div className={blockHead}>
        <span className={sectionName} style={{ color: accent }}>
          {section.title}
        </span>
        {section.kicker && (
          <span className={kicker} style={{ color: accent }}>
            {section.kicker}
          </span>
        )}
      </div>

      {section.paragraphs?.map((text, i) => <p key={i} className={para}>{text}</p>)}

      {section.subsections?.map((sub) => (
        <div key={sub.heading}>
          <p className={subheading} style={{ color: accent }}>{sub.heading}</p>
          {sub.paragraphs.map((text, i) => <p key={i} className={para}>{text}</p>)}
        </div>
      ))}

      {section.list &&
        (section.list.ordered ? (
          <ol className={list} style={{ listStyleType: "decimal" }}>
            {section.list.items.map((item) => <li key={item} className={listItem}>{item}</li>)}
          </ol>
        ) : (
          <ul className={list}>
            {section.list.items.map((item) => <li key={item} className={listItem}>{item}</li>)}
          </ul>
        ))}

      {section.note && (
        <div className={callout} style={{ background: `${accent}14`, color: accent }}>
          {section.note}
        </div>
      )}
    </div>
  )
}

export function FocusReferencePage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → Letter · Margins: None · Scale: 100%
        </div>
        <div
          className={`sheet ${sheetStyle}`}
          style={{ width: `${PAGE_W}mm`, height: `${PAGE_H}mm`, padding: `${MARGIN}mm` }}
        >
          <div className={header}>
            <div className={title}>Graft</div>
            <div className={subtitle}>Player Reference</div>
          </div>
          <div className={body}>
            {SECTIONS.map((section) => <SectionBlock key={section.key} section={section} />)}
          </div>
        </div>
      </div>
    </>
  )
}

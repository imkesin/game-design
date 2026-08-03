import { Fragment } from "react"
import { legacyDeck } from "~/games/civil-service/cards/legacyDeck"
import { officerDeck } from "~/games/civil-service/cards/officerDeck"
import { GLOSSARY, SETUP, TURN, WINNING } from "~/games/civil-service/domain/ReferenceDefinitions"
import { css } from "~/generated/styled-system/css"
import { sumCopies } from "~/shared/cards/playerCount"

/**
 * Civil Service's single-page player reference — one sheet for the table, not one per
 * player, so it can afford setup and edge cases as well as the mid-turn essentials.
 *
 * The old Powers matrix is gone along with the Powers/Permanents/Disaster mechanics it
 * described — the card structure moved to Officers and Legacies, and their own cards
 * (see cards/officerDeck, cards/legacyDeck) already carry each card's power/condition
 * text, so this sheet has no per-card rules to restate. What's left is prose, flowed
 * through two balanced columns the same way graft's FocusReferencePage does:
 *
 *     ┌─────────────────────────────────────┐
 *     │ header                              │  title · kicker
 *     ├─────────────────────────────────────┤
 *     │ body     (2-col prose flow)         │  the asymmetric rules
 *     ├─────────────────────────────────────┤
 *     │ footer   (deck composition strip)   │  derived from the card catalog
 *     └─────────────────────────────────────┘
 *
 * The page is fitting-constrained: it must be exactly one Letter page, and the rules it
 * carries are still being written, so most of them will grow. `TYPE` holds the whole
 * scale in one object for that reason — absorbing a longer rule is a retune, not a
 * rewrite. `pnpm run dev` and the measurement in the commit notes show the current
 * slack; if a change overflows, the sheet silently clips on screen and fragments onto a
 * second page in print, so re-measure after editing prose.
 *
 * The composition strip is derived from `officerDeck`/`legacyDeck` rather than
 * authored, so it cannot drift from what the print sheet actually produces.
 *
 * Print geometry mirrors the card sheet and graft's reference: Letter, zero @page
 * margin, the sheet supplies its own inner margin, screen backdrop stripped at print.
 * Typographic rather than card-unit based, so it uses pt/mm directly, not `--u`.
 *
 * IMPORTANT for manual Cmd-P: Margins = None, Scale = 100%.
 */

const PAGE_W = 215.9 // US Letter, mm
const PAGE_H = 279.4
const MARGIN = 14

// Ink tones. The prose blocks are deliberately colourless; `INK.rule` is every
// block's accent now that no section stands in for a specific card's colour.
const INK = {
  body: "#292524",
  strong: "#1c1917",
  muted: "#57534e",
  rule: "#475569" // slate.600 — a neutral block accent
} as const

/**
 * The sheet's type scale, in one place because the page is fitting-constrained: the
 * whole point of a one-sheet reference is that it *is* one sheet, and the only way to
 * absorb a rule growing by a line is to retune the scale as a whole. Scattering these
 * as literals across twenty `css()` calls makes that a twenty-site edit.
 *
 * `rule` is the body measure everything else is set against; `gloss` and `aside` sit one
 * step down because a definition and a parenthetical are support, not the rule itself.
 *
 * Panda resolves member access on a *local* const at extraction time, so these behave
 * exactly like literals. (An *imported* const does not resolve — see `footerCounts`.)
 */
const TYPE = {
  title: "23pt",
  subtitle: "9.5pt",
  section: "12.5pt",
  rule: "8.5pt",
  gloss: "8pt",
  aside: "7.5pt",
  strip: "7.5pt"
} as const

/**
 * Deck composition, derived from the catalog rather than authored so it cannot drift
 * from what the print sheet actually produces. Both decks are fixed at 36 cards
 * regardless of player count, so this is a flat total rather than one row per count.
 */
const OFFICER_TOTAL = sumCopies(officerDeck.map((card) => card.copies))[5]
const LEGACY_TOTAL = sumCopies(legacyDeck.map((card) => card.copies))[5]

const printCss = `
  @page { size: letter; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .screen-only { display: none !important; }
    .print-root { background: #fff !important; padding: 0 !important; gap: 0 !important; display: block !important; }
    /*
     * As in graft's reference: pinning the sheet to the full page height leaves a box
     * ending exactly at the page edge, which Chrome fragments onto a phantom second
     * page. Letting print height flow to content keeps it on one page; the @page's
     * zero margin plus the sheet's own padding still supply the print margin.
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

// The sheet's header/body bands plus the footer strip, as named areas.
const sheetStyle = css({
  position: "relative",
  background: "#fff",
  color: INK.body,
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  display: "grid",
  gridTemplateAreas: `
    "header"
    "body"
    "footer"
  `,
  gridTemplateColumns: "1fr",
  gridTemplateRows: "auto 1fr auto",
  fontFamily: "system-ui, -apple-system, sans-serif"
})

const header = css({
  gridArea: "header",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "baseline",
  gap: "6mm",
  paddingBottom: "2.5mm",
  borderBottom: `0.6mm solid ${INK.strong}`
})

const title = css({
  fontSize: TYPE.title,
  fontWeight: 800,
  letterSpacing: "-0.01em",
  lineHeight: 1,
  color: INK.strong
})

const subtitle = css({
  fontSize: TYPE.subtitle,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: INK.muted
})

// The body flows the asymmetric rules through two balanced columns, each block kept
// whole — the same mechanism graft's reference uses.
const body = css({
  gridArea: "body",
  columnCount: 2,
  columnGap: "8mm",
  paddingTop: "4mm",
  borderTop: `0.25mm solid #d6d3d1`
})

const block = css({
  breakInside: "avoid",
  marginBottom: "3.8mm",
  paddingLeft: "4mm",
  borderLeft: "1.4mm solid"
})

const blockHead = css({
  display: "flex",
  alignItems: "baseline",
  gap: "2.5mm",
  marginBottom: "1.6mm",
  flexWrap: "wrap"
})

const sectionName = css({
  fontSize: TYPE.section,
  fontWeight: 800,
  lineHeight: 1
})

const kicker = css({
  fontSize: TYPE.aside,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase"
})

const para = css({
  fontSize: TYPE.rule,
  lineHeight: 1.36,
  margin: "0 0 1.4mm 0",
  color: INK.body
})

const list = css({
  margin: "0.5mm 0 0 0",
  paddingLeft: "5mm"
})

const listItem = css({
  fontSize: TYPE.rule,
  lineHeight: 1.33,
  marginBottom: "0.8mm",
  color: INK.body
})

/**
 * The Components term list. A `dl` rather than a bulleted list because the term is not
 * an item of prose, it is the thing being defined: the grid hangs every gloss off a
 * shared column so the terms themselves read as an index down the left edge.
 */
const termList = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  columnGap: "2.5mm",
  rowGap: "0.7mm",
  margin: 0,
  alignItems: "baseline"
})

const termName = css({
  fontSize: TYPE.gloss,
  fontWeight: 800,
  lineHeight: 1.32,
  color: INK.strong,
  whiteSpace: "nowrap"
})

const termGloss = css({
  fontSize: TYPE.gloss,
  lineHeight: 1.32,
  margin: 0,
  color: INK.body
})

// A tinted aside, as in graft's reference: the section accent at low alpha.
const callout = css({
  fontSize: TYPE.aside,
  lineHeight: 1.35,
  fontWeight: 600,
  marginTop: "1mm",
  padding: "1.4mm 2mm",
  borderRadius: "1.4mm"
})

// Deck composition. A quiet strip pinned to the foot of the sheet — setup data, read
// once per game, so it gets the least ink on the page.
const footer = css({
  gridArea: "footer",
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  alignItems: "baseline",
  gap: "4mm",
  marginTop: "1.5mm",
  paddingTop: "2mm",
  borderTop: `0.25mm solid #d6d3d1`
})

const footerLabel = css({
  fontSize: TYPE.strip,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: INK.muted
})

// Both decks are fixed at 36 cards regardless of player count, so this is one
// line rather than a per-player-count grid.
const footerCounts = css({
  fontSize: TYPE.strip,
  color: INK.body,
  fontVariantNumeric: "tabular-nums"
})

/** Split a domain prose string into its paragraphs. */
const paras = (text: string) => text.split("\n\n")

type Section = {
  readonly key: string
  readonly title: string
  /** Small uppercase label beside the title. Explicitly nullable. */
  readonly kicker?: string | undefined
  readonly accent: string
  readonly paragraphs?: readonly string[]
  readonly list?: { readonly ordered?: boolean; readonly items: readonly string[] }
  /** A term list (the Components block). Its own shape, not a list: the term is set apart. */
  readonly terms?: readonly { readonly term: string; readonly gloss: string }[]
  /** Explicitly nullable: only some sections carry an aside. */
  readonly note?: string | undefined
}

/**
 * The prose blocks, in the order a game runs: the vocabulary, how to start, how a
 * turn goes, and how it is all won.
 *
 * `SETUP`/`TURN`/`WINNING` still narrate the old Action/Track/Disaster turn
 * structure (see ReferenceDefinitions) and are stale until the Officer/Legacy rules
 * are dictated — this page renders whatever those exports say, so editing the rules
 * means editing that file, not this one.
 */
const SECTIONS: readonly Section[] = [
  {
    key: "components",
    title: "Components",
    kicker: "Vocabulary",
    accent: INK.rule,
    terms: GLOSSARY
  },
  {
    key: "setup",
    title: "Setup",
    kicker: "Before Play",
    accent: INK.rule,
    list: { ordered: true, items: SETUP.steps }
  },
  {
    key: "turn",
    title: "Your Turn",
    kicker: "In Order",
    accent: INK.rule,
    list: { ordered: true, items: TURN.steps },
    note: TURN.timing
  },
  {
    key: "winning",
    title: "Winning",
    accent: INK.rule,
    paragraphs: paras(WINNING.lead),
    list: { items: WINNING.conditions }
  }
]

function SectionBlock({ section }: { section: Section }) {
  const { accent } = section
  return (
    <div className={block} style={{ borderLeftColor: accent }}>
      <div className={blockHead}>
        <span className={sectionName} style={{ color: accent }}>{section.title}</span>
        {section.kicker && <span className={kicker} style={{ color: accent }}>{section.kicker}</span>}
      </div>

      {section.paragraphs?.map((text, i) => <p key={i} className={para}>{text}</p>)}

      {section.terms && (
        <dl className={termList}>
          {section.terms.map(({ term, gloss }) => (
            <Fragment key={term}>
              <dt className={termName}>{term}</dt>
              <dd className={termGloss}>{gloss}</dd>
            </Fragment>
          ))}
        </dl>
      )}

      {section.list &&
        (section.list.ordered ?
          (
            <ol className={list} style={{ listStyleType: "decimal" }}>
              {section.list.items.map((item) => <li key={item} className={listItem}>{item}</li>)}
            </ol>
          ) :
          (
            <ul className={list} style={{ listStyleType: "disc" }}>
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

function CompositionStrip() {
  return (
    <div className={footer}>
      <div className={footerLabel}>Deck</div>
      <div className={footerCounts}>
        <strong>{OFFICER_TOTAL} Officers</strong> · <strong>{LEGACY_TOTAL} Legacies</strong>
      </div>
    </div>
  )
}

export function ReferencePage() {
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
            <div className={title}>Civil Service</div>
            <div className={subtitle}>Player Reference</div>
          </div>
          <div className={body}>
            {SECTIONS.map((section) => <SectionBlock key={section.key} section={section} />)}
          </div>
          <CompositionStrip />
        </div>
      </div>
    </>
  )
}

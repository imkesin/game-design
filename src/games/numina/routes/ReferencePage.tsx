import { Fragment } from "react"
import { actionDeck } from "~/games/numina/cards/actionDeck"
import { permanentSupply } from "~/games/numina/cards/permanentSupply"
import { type Band, DISASTER as DISASTER_CARD, POWER_LIST_WITH_METADATA } from "~/games/numina/domain/CoreDefinitions"
import {
  AFTERMATH,
  DISASTER as DISASTER_RULES,
  GLOSSARY,
  PERMANENTS,
  POWER_REFERENCE,
  SETUP,
  TURN,
  WINNING
} from "~/games/numina/domain/ReferenceDefinitions"
import { css, cx } from "~/generated/styled-system/css"
import { PLAYER_COUNTS, type PlayerCount, sumCopies } from "~/shared/cards/playerCount"
import { darkBand, softBand, vividBand } from "~/shared/components/paperFrame"

/**
 * Numina's single-page player reference — one sheet for the table, not one per
 * player, so it can afford setup and edge cases as well as the mid-turn essentials.
 *
 * Structure differs from graft's FocusReferencePage on purpose. Graft's six sections
 * are all different shapes, so it flows them as prose blocks through two balanced
 * columns. Numina's five Powers are *symmetric* — one Action each — and a prose block
 * per Power would spend most of the page restating the same shape five times. So the
 * Powers become a five-row matrix keyed by the card's own colour, and the page's prose
 * is reserved for the rules that are genuinely asymmetric: the vocabulary, setup, the
 * turn spine, sets/permanents, Disaster, winning.
 *
 * That splits the page into three bands over a footer strip:
 *
 *     ┌─────────────────────────────────────┐
 *     │ header                              │  title · kicker
 *     ├─────────────────────────────────────┤
 *     │ powers   (matrix, full width)       │  5 rows × chip/Action
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
 * Colour discipline: on this sheet a colour *means a card identity*. The matrix chips
 * carry the five Power scales and the Disaster block carries Disaster's red, all drawn
 * with the same band recipes the cards use — so a chip is a miniature of the name band
 * on the card it stands for, and matching is by construction rather than by a second
 * hand-maintained hex map. Every other block stays in ink, so nothing competes with
 * the matrix.
 *
 * The composition strip is derived from `actionDeck`/`permanentSupply` rather than
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

// Ink tones. The prose blocks are deliberately colourless (see the colour-discipline
// note above); `INK.rule` is the accent for a block that is not standing in for a card.
const INK = {
  body: "#292524",
  strong: "#1c1917",
  muted: "#57534e",
  rule: "#475569" // slate.600 — a neutral block accent
} as const

// Disaster's block takes the card's own red so the one hazard on the sheet is the one
// hazard in the deck. `red.700`, a step off the card's `.900` band, so it reads as an
// accent rather than as near-black.
const DISASTER_ACCENT = "#b91c1c"

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
  columnHead: "8pt",
  chip: "9pt",
  rule: "8.5pt",
  gloss: "8pt",
  aside: "7.5pt",
  fork: "6.5pt",
  strip: "7.5pt"
} as const

// A chip is a miniature of the card's name band, so it uses the very same recipes
// Card.tsx does — keyed by the Power's authored band weight. See `Band` in the domain
// for why each Power picks the weight it does.
const CHIP_RECIPE = {
  strong: darkBand,
  vivid: vividBand,
  soft: softBand
} as const satisfies Record<Band, unknown>

// Mirrors Card.tsx's `brightInk`: a `strong` band's `{color}.50` ink is a tinted
// off-white, and at chip size the name needs full strength.
const brightInk = css({ color: "white" })

/**
 * Deck composition, count by count, derived from the catalog rather than authored so it
 * cannot drift from what the print sheet actually produces.
 *
 * What you print and what you shuffle are two different numbers. Setup pulls 3 cards per
 * player out of the Actions before the Disaster goes back in, so the round-1 deck is
 * meaningfully smaller than the printed one — and the strip reports the number a player
 * is about to count out, with the printed total behind it for the person cutting cards.
 *
 * `actionDeck` carries the Disaster alongside the Actions, so the Actions are taken by
 * excluding that kind rather than by subtracting a hard-coded 1.
 */
const SETUP_REMOVED_PER_PLAYER = 3

const ACTION_TOTALS = sumCopies(
  actionDeck.filter((card) => card.kind !== "disaster").map((card) => card.copies)
)
const PRINTED_TOTALS = sumCopies(actionDeck.map((card) => card.copies))
const PERMANENT_TOTALS = sumCopies(permanentSupply.map((card) => card.copies))

/** Actions left after setup's cull, plus the Disaster put back. */
const roundOneDeck = (players: PlayerCount) => ACTION_TOTALS[players] - SETUP_REMOVED_PER_PLAYER * players + 1

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

// The sheet's three bands plus the footer strip, as named areas.
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
    "powers"
    "body"
    "footer"
  `,
  gridTemplateColumns: "1fr",
  gridTemplateRows: "auto auto 1fr auto",
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

/**
 * The Powers matrix. A single grid — chip · Action — rather than five two-cell rows, so
 * every Action shares one measure down the whole table and the chips stay in a column
 * a player's eye can run.
 *
 * `auto` on the chip column sizes it to the longest Power name ("Abundance"); the
 * Action takes the entire remaining measure, because the authored Actions run to two
 * and three lines and a lettered choice needs room to stay readable.
 *
 * There is no Permanent column: a permanent's effect is not yet decided, and a column
 * that says nothing is worse than no column. Adding one is a third track here plus a
 * third cell per row.
 *
 * `alignItems: start` rather than `baseline`: rows are now multi-line, and a chip
 * baseline-aligned to a three-line cell floats away from the text it labels.
 */
const powers = css({
  gridArea: "powers",
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  columnGap: "4mm",
  rowGap: "2mm",
  alignItems: "start",
  paddingTop: "4mm",
  paddingBottom: "3mm"
})

// Column heads for the matrix. The chip column's head is the section label itself, so
// the table needs no separate title row above it.
const matrixHead = css({
  fontSize: TYPE.columnHead,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: INK.muted,
  paddingBottom: "0.8mm",
  borderBottom: `0.25mm solid #d6d3d1`
})

const chip = css({
  display: "block",
  fontSize: TYPE.chip,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  lineHeight: 1,
  padding: "1.2mm 2mm",
  borderRadius: "1mm",
  whiteSpace: "nowrap",
  textAlign: "center"
})

const cell = css({
  fontSize: TYPE.rule,
  lineHeight: 1.33,
  color: INK.body
})

/**
 * A lettered choice within one Action (Devotion, Impulse). A two-column grid so the
 * markers form their own narrow column and the option prose hangs in a single block
 * rather than wrapping back under its own letter.
 */
const choice = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  columnGap: "2mm",
  rowGap: "0.8mm",
  alignItems: "start"
})

const optionMark = css({
  fontSize: TYPE.gloss,
  fontWeight: 800,
  lineHeight: 1.45,
  color: INK.muted,
  fontVariantNumeric: "tabular-nums"
})

// The fork itself, spanning both tracks so it reads as a divider between the options
// rather than as a third option. Mutual exclusivity is the rule here, so it is stated
// in words and not left to the lettering alone.
const orRule = css({
  gridColumn: "1 / -1",
  fontSize: TYPE.fork,
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: "0.16em",
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

/**
 * One column per player count rather than a wrapping flex row: fixed columns keep the
 * strip to a single line and put the counts on shared tab stops, so they can be read
 * down as well as across.
 *
 * The column count is derived from `PLAYER_COUNTS` at the call site via an inline
 * style, not here. Panda extracts styles statically and cannot evaluate a member
 * access on an imported const, so a `repeat(${PLAYER_COUNTS.length}, 1fr)` template
 * inside `css()` is silently dropped — the strip then stacks into one column per row.
 */
const footerCounts = css({
  display: "grid",
  gap: "3mm",
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
 * The prose blocks, in the order a game runs: the vocabulary the matrix above already
 * spends, how to start, how a turn goes, the hazard that ends the round, what the round
 * end pays out, and how it is all won.
 *
 * Disaster and Aftermath are two blocks rather than one because only the first is the
 * card. The colour discipline at the top of this file makes red mean *the Disaster card
 * exists here*; the aftermath is round-end bookkeeping the card happens to trigger, so
 * it stays in ink and sits directly beneath.
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
    key: "disaster",
    title: DISASTER_CARD.name,
    kicker: "Ends The Round",
    accent: DISASTER_ACCENT,
    paragraphs: [
      ...paras(DISASTER_RULES.lead),
      ...paras(DISASTER_RULES.restriction),
      ...paras(DISASTER_RULES.after)
    ]
  },
  {
    key: "aftermath",
    title: "After the Disaster",
    accent: INK.rule,
    list: { ordered: true, items: AFTERMATH.steps }
  },
  {
    key: "permanents",
    title: "Permanents",
    accent: INK.rule,
    paragraphs: [...paras(PERMANENTS.lead), ...paras(PERMANENTS.pace)]
  },
  {
    key: "winning",
    title: "Winning",
    accent: INK.rule,
    paragraphs: paras(WINNING.lead),
    list: { items: WINNING.conditions }
  }
]

/** One Action cell: a single instruction, or a lettered fork between options. */
function ActionCell({ options }: { options: readonly string[] }) {
  const [only] = options
  if (options.length === 1 && only !== undefined) {
    return <span className={cell}>{only}</span>
  }

  return (
    <div className={choice}>
      {options.map((option, index) => (
        <Fragment key={option}>
          {index > 0 && <span className={orRule}>or</span>}
          <span className={optionMark}>{String.fromCharCode(65 + index)}</span>
          <span className={cell}>{option}</span>
        </Fragment>
      ))}
    </div>
  )
}

function PowersMatrix() {
  return (
    <div className={powers}>
      <div className={matrixHead}>Powers</div>
      <div className={matrixHead}>Action</div>

      {
        /*
         Each Power contributes two grid cells, so the row is a keyed Fragment rather
         than a wrapper element — a wrapper would become the grid item and collapse the
         two columns into one.
        */
      }
      {POWER_LIST_WITH_METADATA.map(({ name, color, band }) => (
        <Fragment key={name}>
          <span className={cx(chip, CHIP_RECIPE[band]({ color }), band === "strong" && brightInk)}>
            {name}
          </span>
          <ActionCell options={POWER_REFERENCE[name].options} />
        </Fragment>
      ))}
    </div>
  )
}

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
      <div
        className={footerCounts}
        style={{ gridTemplateColumns: `repeat(${PLAYER_COUNTS.length}, 1fr)` }}
      >
        {PLAYER_COUNTS.map((players) => (
          <span key={players}>
            <strong>{players}p</strong> · {roundOneDeck(players)} of {PRINTED_TOTALS[players]} ·{" "}
            {PERMANENT_TOTALS[players]} perm
          </span>
        ))}
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
            <div className={title}>Numina</div>
            <div className={subtitle}>Player Reference</div>
          </div>
          <PowersMatrix />
          <div className={body}>
            {SECTIONS.map((section) => <SectionBlock key={section.key} section={section} />)}
          </div>
          <CompositionStrip />
        </div>
      </div>
    </>
  )
}

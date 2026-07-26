import { ArrowRight } from "lucide-react"
import { Fragment, type ReactNode } from "react"
import type { Card, CardBase, Cost, FieldCardBase, FieldImprovementCardBase } from "~/games/graft/cards/domain"
import { GoldCost } from "~/games/graft/components/icons/GoldCost"
import { WorkerCost } from "~/games/graft/components/icons/WorkerCost"
import { FruitCrateSlot } from "~/games/graft/components/slots/FruitCrateSlot"
import { FRUIT_COLOR } from "~/games/graft/domain/CoreDefinitions"
import type { PlayerCount } from "~/games/graft/domain/CoreDefinitions"
import { css, cva, cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"
import { paperFrame } from "~/shared/components/paperFrame"

/**
 * Field cards read as green (fields, crops); field-improvements as stone.
 */
type CardKind = CardBase["kind"]

// The card's base surface, by kind — the shared `paperFrame` recipe (see
// ~/shared/components/paperFrame) covers both kinds with no deviation.
const KIND_PAPER_COLOR = {
  field: "green",
  "field-improvement": "stone"
} as const satisfies Record<CardKind, string>

/** Field-improvement uses a rules-text body layout (a cost rail over a
 * freeform text band). */
type TextCardBase = FieldImprovementCardBase

/**
 * A single poker card. Two render variants:
 *
 *   - "bleed": full-bleed 69x94mm. Gutter is 6u (bleed + trim->safe).
 *   - "trim":  trim-only 63x88mm with a hairline cut outline. Gutter is 3u
 *     (trim->safe). For the home N-up grid sheet, where cards touch and the
 *     shared outlines form the cut grid.
 *
 * Either way the safe-zone content column is 57mm wide. All dimensions resolve
 * from `--u` (1mm in print).
 *
 * Layout is a CSS grid whose outer columns are gutter tracks (`--gutter`):
 *
 *     ┌────────┬──────────┬────────┐
 *     │  full-width header (band)  │   bleeds across all 3 columns
 *     ├────────┼──────────┼────────┤
 *     │ gutter │ body│cost│ gutter │   cost rail runs down the body's right
 *     │ gutter │  footer  │ gutter │
 *     └────────┴──────────┴────────┘
 *
 * The header spans every column so its banner colour goes wall-to-wall, but its
 * *content* sits in the middle column via `grid-template-columns: subgrid`, so
 * it lines up with the body. Body and footer sit in the middle column directly.
 * Sections therefore need no horizontal padding of their own — the gutter
 * tracks supply the inset, and the band colour bleeds into them. The title gets
 * the full band width; cost is a top-aligned vertical rail on the body's right.
 */
export type CardVariant = "bleed" | "trim"

const frame = css({
  position: "relative",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "var(--gutter) 1fr var(--gutter)",
  // header band (bleeds to top) · body (fills) · footer band (bleeds to bottom)
  gridTemplateRows: "auto 1fr auto",
  overflow: "hidden"
})

// Header/footer bands and the cost badge, by kind. Field and field-improvement
// invert contrast (dark band, light ink).
const darkBand = cva({
  variants: {
    kind: {
      field: { background: "green.900", color: "green.50" },
      "field-improvement": { background: "stone.900", color: "stone.50" }
    }
  }
})

// Border for the player-count ring, chosen to contrast against this kind's
// band background — the paper colour, since every band is dark.
const paperBorder = cva({
  variants: {
    kind: {
      field: { borderColor: "green.50" },
      "field-improvement": { borderColor: "stone.50" }
    }
  }
})

const bleedFrame = css({
  width: "cardW",
  height: "cardH",
  "--gutter": "calc(6 * var(--u))"
})

const trimFrame = css({
  width: "trimW",
  height: "trimH",
  "--gutter": "calc(3 * var(--u))"
})

// Hairline cut line on the trim boundary. `outline` doesn't affect layout, so
// adjacent cards' outlines coincide into a single shared cut line.
const accentOutline = cva({
  base: { outlineWidth: "0.2mm", outlineStyle: "solid" },
  variants: {
    kind: {
      field: { outlineColor: "green.500" },
      "field-improvement": { outlineColor: "stone.500" }
    }
  }
})

// Full-width band: spans all columns so its colour bleeds to both edges. Top
// padding = gutter so the content starts at the safe line even though the band
// reaches the top edge. A horizontal subgrid relays the parent column tracks so
// the content can land in the middle column.
const header = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  paddingTop: "var(--gutter)",
  // Match the trimmed top inset (3u) so the title is centred within the band's
  // visible (post-cut) area in both variants.
  paddingBottom: "3"
})

const headerContent = css({
  gridColumn: "2",
  display: "flex",
  alignItems: "center",
  minWidth: 0
})

const titleText = css({
  fontSize: "name",
  fontWeight: 700,
  letterSpacing: "0.02em",
  lineHeight: 1.1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
})

// The body is one full-width grid (`1 / -1`) that owns its column lines, so
// every piece is placed rather than margin-shifted. Columns: a left gutter
// (card edge -> safe line), the 1fr content column, and an `auto` cost column
// that runs out to the card's right edge. Rows: fields keep the lead/cost band
// over the harvest table (2fr/3fr); text-body cards (field-improvement,
// improvement) split evenly (1fr/1fr) since their rules text fills the bottom
// half.
const bodyRegion = cva({
  base: {
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: "var(--gutter) 1fr auto",
    minHeight: 0,
    // Unit-scaled default so every descendant tracks the zoom knob instead of
    // falling back to the fixed 16px root size.
    fontSize: "body"
  },
  variants: {
    kind: {
      field: { gridTemplateRows: "2fr 3fr" },
      "field-improvement": { gridTemplateRows: "1fr 1fr" }
    }
  }
})

const bodyTopMain = css({
  gridColumn: "2",
  gridRow: "1",
  minWidth: 0,
  lineHeight: 1.35,
  whiteSpace: "pre-line",
  display: "flex",
  flexDirection: "column",
  gap: "2"
})

// Used by field-improvement, the rules-text kind.
// Mirrors `fieldTable`: the bottom row's `auto` cost column goes unused (the
// cost rail only ever occupies row 1), so this spans `1 / -1` and re-declares
// its own gutter|1fr|gutter columns to reclaim that width instead of being
// boxed into the parent's narrower `1fr` content track. The border-top divides
// it from the top half (cost rail) above, matching the mid-tone `fieldTable`
// already uses for its own capacity/output divider.
const textBand = cva({
  base: {
    gridColumn: "1 / -1",
    gridRow: "2",
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "var(--gutter) 1fr var(--gutter)",
    borderTopWidth: "0.3mm",
    borderTopStyle: "solid"
  },
  variants: {
    kind: {
      "field-improvement": { borderTopColor: "stone.500" }
    }
  }
})

const textBandContent = css({
  gridColumn: "2",
  minWidth: 0,
  paddingTop: "3",
  // One step down from the inherited `body` size — this is paragraph text,
  // not a table/label.
  fontSize: "paragraph",
  lineHeight: 1.35,
  whiteSpace: "pre-line",
  display: "flex",
  flexDirection: "column",
  gap: "2"
})

// Cost rail in the `auto` column, centered down the top-half row. That track
// ends at the card's right edge, so the right-aligned badges land their right
// side on it.
const costRail = css({
  gridColumn: "3",
  gridRow: "1",
  alignSelf: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "1"
})

// Capacity->output table: a full-bleed banded zone in the body's lower row. The
// table owns its own column lines — gutter | capacity (1fr) | output (2fr) |
// gutter — so it spans edge to edge (tinted background, plus a divider rule
// across the top that splits the card) while the cells land in the safe column
// with no margins or re-inset padding. The capacity/output boundary carries a
// vertical rule, and stacked rows are parted by soft horizontal rules.
const fieldTable = css({
  gridColumn: "1 / -1",
  gridRow: "2",
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "var(--gutter) 1fr 3fr var(--gutter)",
  gridAutoRows: "1fr",
  borderTopWidth: "0.3mm",
  borderTopStyle: "solid",
  borderTopColor: "green.500",
  background: "green.900/6"
})

const fieldCapacityCell = css({
  position: "relative",
  gridColumn: "2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1",
  paddingBlock: "2",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  borderInlineEndWidth: "0.3mm",
  borderInlineEndStyle: "solid",
  borderInlineEndColor: "green.500"
})

// A green right-arrow chip straddling the capacity/output divider: it sits on
// the vertical rule (right edge, vertically centred) and points into the output
// cell, drawing the "this many workers -> this yield" association across the row.
// A paper-coloured disc lets it punch cleanly through the divider line.
const fieldRowArrow = css({
  position: "absolute",
  insetInlineEnd: 0,
  top: "50%",
  transform: "translate(50%, -50%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "5",
  height: "5",
  borderRadius: "9999px",
  background: "green.50",
  color: "green.700"
})

const fieldRowArrowIcon = css({ width: "3", height: "3" })

const fieldOutputCell = css({
  gridColumn: "3",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1",
  paddingBlock: "2",
  // Smallest size; the crate slots carry the meaning, so the spelled-out label
  // is now just a redundant caption.
  fontSize: "micro",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums"
})

// One crate slot per unit of yield, laid out in a row that wraps if the yield
// exceeds the cell width.
const fieldCrateRow = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: "1"
})

// Soft horizontal rule between stacked slots; omitted above the first row.
const fieldRowDivider = css({
  borderTopWidth: "0.2mm",
  borderTopStyle: "solid",
  borderTopColor: "green.500/30"
})

// Thin dark stripe mirroring the header: bleeds to the bottom edge, with
// paddingBottom = gutter dropping its content onto the safe line.
const footer = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  // Mirror of the header: paddingBottom = gutter puts content on the safe line;
  // paddingTop = 3 (the trimmed bottom inset) centres it in the visible stripe.
  paddingTop: "3",
  paddingBottom: "var(--gutter)"
})

const footerContent = css({
  gridColumn: "2",
  display: "flex",
  alignItems: "center",
  gap: "0"
})

// Small ring per player-count the card is included in (copies > 0).
const playerPip = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "3",
  height: "3",
  borderRadius: "9999px",
  borderWidth: "0.2mm",
  borderStyle: "solid",
  fontSize: "micro",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

function assertNever(value: never): never {
  throw new Error(`Unhandled card kind: ${JSON.stringify(value)}`)
}

function CostRail({ cost }: { cost: Cost }) {
  return (
    <div className={costRail}>
      {cost.gold > 0 && <GoldCost amount={cost.gold} />}
      {cost.workers > 0 && <WorkerCost amount={cost.workers} />}
    </div>
  )
}

type BodyRegions = { top: ReactNode; bottom: ReactNode }

function fieldRegions(card: FieldCardBase): BodyRegions {
  return {
    top: null,
    bottom: (
      <div className={fieldTable}>
        {card.rows.map((row, i) => (
          <Fragment key={i}>
            <span className={cx(fieldCapacityCell, i > 0 && fieldRowDivider)}>
              <WorkerCost amount={row.capacity} size={7} />
              <span className={fieldRowArrow} aria-hidden>
                <ArrowRight className={fieldRowArrowIcon} />
              </span>
            </span>
            <span className={cx(fieldOutputCell, i > 0 && fieldRowDivider)}>
              <span className={fieldCrateRow}>
                {Array.from(
                  { length: row.amount },
                  (_, j) => <FruitCrateSlot key={j} color={FRUIT_COLOR[card.fruit]} letter={card.fruit.charAt(0)} />
                )}
              </span>
              {`${row.amount} ${card.fruit}`}
            </span>
          </Fragment>
        ))}
      </div>
    )
  }
}

function textCardRegions(card: TextCardBase): BodyRegions {
  return {
    top: null,
    bottom: (
      <div className={textBand({ kind: card.kind })}>
        <div className={textBandContent}>{card.additionalText}</div>
      </div>
    )
  }
}

function Footer({
  minPlayerCount,
  kind
}: {
  minPlayerCount: PlayerCount
  kind: CardKind
}) {
  return (
    <div className={cx(footer, darkBand({ kind }))}>
      <div className={footerContent}>
        <span className={cx(playerPip, paperBorder({ kind }))}>{minPlayerCount}</span>
      </div>
    </div>
  )
}

function bodyRegions(card: FieldCardBase | FieldImprovementCardBase): BodyRegions {
  switch (card.kind) {
    case "field":
      return fieldRegions(card)
    case "field-improvement":
      return textCardRegions(card)
    default:
      return assertNever(card)
  }
}

function CardBody({ card }: { card: Card }) {
  const regions = bodyRegions(card)
  return (
    <div className={bodyRegion({ kind: card.kind })}>
      <div className={bodyTopMain}>{regions.top}</div>
      <CostRail cost={card.cost} />
      {regions.bottom}
    </div>
  )
}

export function Card({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: Card
  variant?: CardVariant
  showGuides?: boolean
}) {
  return (
    <div
      className={cx(
        frame,
        paperFrame({ color: KIND_PAPER_COLOR[card.kind] }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline({ kind: card.kind })
      )}
    >
      <div className={cx(header, darkBand({ kind: card.kind }))}>
        <div className={headerContent}>
          <span className={titleText}>{card.name}</span>
        </div>
      </div>
      <CardBody card={card} />
      <Footer minPlayerCount={card.minPlayerCount} kind={card.kind} />
      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

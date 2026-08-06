import type { ResourceCard as ResourceCardData } from "~/games/meeple-syrup/cards/domain"
import { RESOURCE_BY_ID } from "~/games/meeple-syrup/cards/resources"
import { RESOURCE_MARKS } from "~/games/meeple-syrup/components/resourceMarks"
import { css, cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"
import { artTint, darkBand, paperFrame, paperShade, strongRail } from "~/shared/components/paperFrame"

/**
 * A resource card: one denomination of one good.
 *
 * Three bands, because the card answers exactly three questions and the first
 * two get asked from across the table:
 *
 *     ┌────────────────────────────┐
 *     │  NAME BAND        category │   what good, and which tier
 *     ├────────────────────────────┤
 *     │       big numeral over     │   how much
 *     │      the resource's mark   │
 *     ├────────────────────────────┤
 *     │  market shift rider        │   what taking it costs the market
 *     └────────────────────────────┘
 *
 * The quantity is set enormous and the mark sits *behind* it as a watermark
 * rather than beside it: these are read fanned in a hand, where only a corner
 * shows, and colour plus numeral is what has to survive that.
 *
 * The footer prints even on the cards with no rider. A blank band would read as
 * an omission, and "no market shift" is itself worth stating — on this deck the
 * topping 2s are the only denomination it is true of (see `resourceDeck.ts`).
 *
 * "Other" markets are the tracks that do not price this card's own resource, so
 * taking a good can never move its own price. The card does not have room to
 * say which those are and does not need to — the board does, in the legend
 * under the ladders (see `BoardPrintPage`).
 *
 * Same two render variants as every other game's card:
 *
 *   - "bleed": full-bleed 69x94mm. Gutter is 6u (bleed + trim->safe).
 *   - "trim":  trim-only 63x88mm with a hairline cut outline. Gutter is 3u
 *     (trim->safe). For the home N-up grid sheet, where cards touch and the
 *     shared outlines form the cut grid.
 */
export type CardVariant = "bleed" | "trim"

const frame = css({
  position: "relative",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "var(--gutter) 1fr var(--gutter)",
  // name band (bleeds to top) · quantity (all the slack) · rider band (bleeds to bottom)
  gridTemplateRows: "auto 1fr auto",
  overflow: "hidden"
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

// Hairline cut line on the trim boundary; `outline` doesn't affect layout, so
// adjacent cards' outlines coincide into a single shared cut line.
const accentOutline = css({
  outlineWidth: "0.2mm",
  outlineStyle: "solid"
})

// Bands span every column so their colour goes wall to wall, but their content
// lands in the middle column via subgrid, so it lines up with the body.
const header = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  paddingTop: "var(--gutter)",
  // Match the trimmed top inset (3u) so the name is centred within the band's
  // visible (post-cut) area in both variants.
  paddingBottom: "3"
})

const headerContent = css({
  gridColumn: "2",
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "2",
  minWidth: 0
})

const nameText = css({
  fontSize: "name",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  lineHeight: 1.05,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
})

const categoryText = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  opacity: 0.75,
  whiteSpace: "nowrap"
})

// The quantity region. Full bleed and `relative`, so the watermark can be inset
// to the safe area independently of the numeral centred over it.
const body = css({
  gridColumn: "1 / -1",
  position: "relative",
  display: "grid",
  placeItems: "center",
  minHeight: 0,
  overflow: "hidden"
})

const watermark = css({
  position: "absolute",
  inset: "var(--gutter)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

// Stacked over the watermark rather than in flow with it, so the mark can take
// the whole safe area without pushing the numeral off centre.
const quantityText = css({
  position: "relative",
  fontSize: "calc(22 * var(--u))",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

const footer = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  borderTopWidth: "0.3mm",
  borderTopStyle: "solid",
  paddingTop: "2",
  paddingBottom: "var(--gutter)"
})

const footerContent = css({
  gridColumn: "2",
  minWidth: 0,
  fontSize: "paragraph",
  lineHeight: 1.25,
  textAlign: "center"
})

const inertText = css({
  fontSize: "micro",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  opacity: 0.6
})

const shiftCount = css({ fontWeight: 700 })

export function ResourceCard({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: ResourceCardData
  variant?: CardVariant
  showGuides?: boolean
}) {
  const resource = RESOURCE_BY_ID[card.resource]
  const { color } = resource
  const Mark = RESOURCE_MARKS[card.resource]

  return (
    <div
      className={cx(
        frame,
        paperFrame({ color }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline,
        variant === "trim" && strongRail({ color })
      )}
    >
      <div className={cx(header, darkBand({ color }))}>
        <div className={headerContent}>
          <span className={nameText}>{resource.name}</span>
          <span className={categoryText}>{resource.category}</span>
        </div>
      </div>

      <div className={body}>
        <div className={cx(watermark, artTint({ color }))}>
          <Mark size="82%" strokeWidth={1.2} />
        </div>
        <span className={quantityText}>{card.quantity}</span>
      </div>

      <div className={cx(footer, paperShade({ color }), strongRail({ color }))}>
        <div className={footerContent}>
          {card.shift > 0
            ? (
              <>
                Shift any other markets by <span className={shiftCount}>{card.shift}</span>
              </>
            )
            : <span className={inertText}>No market shift</span>}
        </div>
      </div>

      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

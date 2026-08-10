import type { ResourceCard as ResourceCardData } from "~/games/meeple-syrup/cards/domain"
import { RESOURCE_BY_ID } from "~/games/meeple-syrup/cards/resources"
import {
  accentOutline,
  bleedFrame,
  cardFrame,
  type CardVariant,
  categoryText,
  dataBand,
  footerBand,
  headerBand,
  headerContent,
  threeBandRows,
  trimFrame
} from "~/games/meeple-syrup/components/cardFrame"
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
 *     │  market shift rider        │   what drawing it costs the market
 *     └────────────────────────────┘
 *
 * The quantity is set enormous and the mark sits *behind* it as a watermark
 * rather than beside it: these are read fanned in a hand, where only a corner
 * shows, and colour plus numeral is what has to survive that. The blank uses
 * the same three bands and the same numeral slot, printing a `0` — see
 * `PineconeCard`.
 *
 * The footer prints even on the cards with no rider. A blank band would read as
 * an omission, and "no market shift" is itself worth stating — in this bag the
 * topping 2s are the only denomination it is true of (see `forageBag.ts`).
 *
 * "Other" markets are the tracks that do not price this card's own resource, so
 * drawing a good can never move its own price. The card does not have room to
 * say which those are and does not need to — the board does, in the legend
 * under the ladders (see `BoardPrintPage`).
 *
 * The three bands are the game's shared ones (see `cardFrame`), so this card's
 * name band and rider band are the same height as an animal card's name band
 * and order band, and the numeral region between them is exactly the animal's
 * art plus the two bands a bag card does not have. Nothing here sizes itself.
 */

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
        cardFrame,
        threeBandRows,
        paperFrame({ color }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline,
        variant === "trim" && strongRail({ color })
      )}
    >
      <div className={cx(headerBand, darkBand({ color }))}>
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

      <div className={cx(dataBand, footerBand, paperShade({ color }), strongRail({ color }))}>
        <div className={footerContent}>
          {card.shift === 0 && <span className={inertText}>No market shift</span>}
          {card.shift === 1 && (
            <>
              Shift another market by <span className={shiftCount}>1</span>
            </>
          )}
          {card.shift > 1 && (
            <>
              Shift <span className={shiftCount}>{card.shift}</span> other markets by{" "}
              <span className={shiftCount}>1</span>
            </>
          )}
        </div>
      </div>

      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

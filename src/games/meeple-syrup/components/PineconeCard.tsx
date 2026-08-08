import { css, cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"
import { artTint, darkBand, paperFrame, paperShade, strongRail } from "~/shared/components/paperFrame"
import { PineconeMark } from "./PineconeMark"
import type { CardVariant } from "./ResourceCard"

/**
 * The pinecone: a forage that found nothing. The blank of the bag (`kind:
 * "blank"` in the card data), named for what you came back with.
 *
 * Built on `ResourceCard`'s three bands on purpose, down to the numeral over a
 * watermark — this card is drawn from the same bag, in the same trim, and if it
 * looked like a different component it would read as a different subsystem.
 * The quantity band prints a literal `0`, which is the fastest possible answer
 * to the only question anyone asks of a drawn card.
 *
 *     ┌────────────────────────────┐
 *     │  PINECONE           FORAGE │
 *     ├────────────────────────────┤
 *     │        0 over tracks       │
 *     ├────────────────────────────┤
 *     │  Return this card to the   │
 *     │  bag.                      │
 *     └────────────────────────────┘
 *
 * Red, and red is the only colour that was really available.
 *
 * The eight resources take amber, brown, violet, yellow, orange, cyan, lime and
 * stone (see `resources.ts`), which leaves red, blue, green, purple, pink, zinc
 * and neutral unclaimed. Most of those are unclaimed but not *free*: zinc and
 * neutral are the same grey as Flour's stone, purple sits next to Blueberries'
 * violet, blue next to Milk's cyan, green next to Butter's lime. Adjacent is as
 * bad as taken here, because the failure mode is a card misread at a glance in
 * a fanned hand, and a near-miss misreads more often than a match. Red and pink
 * are the only two isolated on all sides, and red is the one that also means
 * something.
 *
 * Loud is correct for this card. It is the one draw that changes nothing, so it
 * has to announce itself immediately or a player will sit there looking for the
 * rule it carries. Red is the deck's only stop sign.
 *
 * A pinecone rather than a slash or a cross: the fiction is that you went out
 * and came back with something the kitchen has no use for, not that something
 * was forbidden. A negation mark on a red card would also read as "this card
 * cancels something", which it emphatically does not. Naming the card for what
 * you found also gives the table a noun to say out loud — "another pinecone"
 * lands better than announcing a state.
 *
 * Lucide has no pinecone, so the mark is hand-drawn in its idiom (see
 * `PineconeMark`).
 *
 * The footer says the one rule the card has, and says it as an instruction
 * rather than a state, because returning it is a thing the player has to
 * physically remember to do and is the whole reason the bag sours (see
 * `forageBag.ts`).
 */

const frame = css({
  position: "relative",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "var(--gutter) 1fr var(--gutter)",
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

const accentOutline = css({
  outlineWidth: "0.2mm",
  outlineStyle: "solid"
})

const header = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  paddingTop: "var(--gutter)",
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

// Lighter than a resource's numeral: the zero should read as absence rather
// than as a quantity competing with the 2s and 3s it sits beside in a hand.
const quantityText = css({
  position: "relative",
  fontSize: "calc(22 * var(--u))",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  opacity: 0.55
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

const emphasis = css({ fontWeight: 700 })

export function PineconeCard({
  variant = "bleed",
  showGuides = false
}: {
  variant?: CardVariant
  showGuides?: boolean
}) {
  const color = "red" as const

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
          <span className={nameText}>Pinecone</span>
          <span className={categoryText}>forage</span>
        </div>
      </div>

      <div className={body}>
        <div className={cx(watermark, artTint({ color }))}>
          <PineconeMark size="82%" strokeWidth={1.2} />
        </div>
        <span className={quantityText}>0</span>
      </div>

      <div className={cx(footer, paperShade({ color }), strongRail({ color }))}>
        <div className={footerContent}>
          <span className={emphasis}>Return</span> this card to the bag.
        </div>
      </div>

      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

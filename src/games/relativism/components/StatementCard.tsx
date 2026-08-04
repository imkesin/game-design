import type { StatementCard as StatementCardData } from "~/games/relativism/cards/domain"
import { css, cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"

/**
 * A statement card: the prompt fills the card at display size, dark red ink on
 * plain white paper — high-contrast and ink-light for a home B&W printer. The
 * category is a small tag pinned to the bottom-right safe corner so it never
 * competes with the statement itself.
 *
 * Same two render variants as every other game's Card:
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
  display: "flex",
  background: "white",
  color: "red.950",
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
  outlineStyle: "solid",
  outlineColor: "red.950"
})

const content = css({
  flex: 1,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  padding: "var(--gutter)",
  textAlign: "left"
})

// Bigger than the shared `hero` token and set in a genuine black weight
// (rather than a browser-synthesized bold) so the statement reads as heavy
// display type rather than merely large body text.
const statementText = css({
  fontSize: "calc(8 * var(--u))",
  fontFamily: "\"Arial Black\", \"Helvetica Neue\", Arial, sans-serif",
  fontWeight: 900,
  lineHeight: 1.12,
  whiteSpace: "pre-line"
})

const categoryTag = css({
  position: "absolute",
  insetInlineEnd: "var(--gutter)",
  insetBlockEnd: "var(--gutter)",
  fontSize: "micro",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "red.700"
})

export function StatementCard({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: StatementCardData
  variant?: CardVariant
  showGuides?: boolean
}) {
  return (
    <div
      className={cx(
        frame,
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline
      )}
    >
      <div className={content}>
        <span className={statementText}>{card.text}</span>
      </div>
      <span className={categoryTag}>{card.category}</span>
      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

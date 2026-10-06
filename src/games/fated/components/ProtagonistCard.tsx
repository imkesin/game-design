import type { ProtagonistCard as ProtagonistCardData } from "~/games/fated/cards/domain"
import {
  accentOutline,
  bleedFrame,
  cardFrame,
  type CardVariant,
  indexArea,
  indexBox,
  nameBlock,
  nameText,
  textZone,
  titleBox,
  trimFrame
} from "~/games/fated/components/cardFrame"
import { SuitMark } from "~/games/fated/components/CornerIndex"
import { css, cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"
import { paperFrame, strongRail } from "~/shared/components/paperFrame"

/**
 * A protagonist, laid out like a trait card: the two baseline symbols are
 * stacked in the upper left with a short bar between them, the name in the
 * upper right, and the rest is empty for art. Gender is neither in the
 * data nor on the card: any two protagonists can be a couple.
 *
 * No number is printed: a baseline's value is implied (`BASELINE_VALUE`), as
 * protagonists are special enough not to need one. The bar between the symbols
 * reads as "or". The frame is neutral: the qualities are the colour on the card.
 */

// Two 12mm marks with a short bar between them.
const baselines = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5"
})

const orBar = css({
  width: "8",
  height: "0.6mm",
  background: "currentColor"
})

export function ProtagonistCard({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: ProtagonistCardData
  variant?: CardVariant
  showGuides?: boolean
}) {
  return (
    <div
      className={cx(
        cardFrame,
        paperFrame({ color: "neutral" }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline,
        variant === "trim" && strongRail({ color: "neutral" })
      )}
    >
      <div className={indexBox} />
      <div className={titleBox} />
      <div className={indexArea}>
        <div className={baselines}>
          <SuitMark quality={card.qualities[0]} />
          <span className={orBar} />
          <SuitMark quality={card.qualities[1]} />
        </div>
      </div>
      <div className={nameBlock}>
        <span className={nameText} style={{ fontSize: "calc(4 * var(--u))" }}>{card.name}</span>
      </div>

      <div className={textZone} />

      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

import type { TraitCard as TraitCardData } from "~/games/fated/cards/domain"
import { RESOURCE_BY_ID } from "~/games/fated/cards/resources"
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
import { CornerIndex } from "~/games/fated/components/CornerIndex"
import { cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"
import { paperFrame, strongRail } from "~/shared/components/paperFrame"

/**
 * A trait card, laid out like a playing card: the number and its resource in
 * the upper-left corner index, the name in the upper right, and the rest empty
 * for art. The number is cost, capacity and energy at once, so it carries the
 * card; there is no rules text.
 */
export function TraitCard({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: TraitCardData
  variant?: CardVariant
  showGuides?: boolean
}) {
  const { color } = RESOURCE_BY_ID[card.resource]

  return (
    <div
      className={cx(
        cardFrame,
        paperFrame({ color }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline,
        variant === "trim" && strongRail({ color })
      )}
    >
      <div className={indexBox} />
      <div className={titleBox} />
      <div className={indexArea}>
        <CornerIndex value={card.value} resource={card.resource} />
      </div>
      <div className={nameBlock}>
        <span className={nameText}>{card.name}</span>
      </div>

      <div className={textZone} />

      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

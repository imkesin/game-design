import type { CSSProperties } from "react"
import { ALTERNATIVE_ACTION_NAME } from "~/games/fated/cards/alternativeActions"
import type { SceneCard as SceneCardData } from "~/games/fated/cards/domain"
import {
  accentOutline,
  bleedFrame,
  cardFrame,
  type CardVariant,
  indexArea,
  indexBox,
  nameBlock,
  nameText,
  titleBox,
  trimFrame
} from "~/games/fated/components/cardFrame"
import { CostSquare } from "~/games/fated/components/CostSquare"
import { ACTION_MARKS } from "~/games/fated/components/resourceMarks"
import { css, cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"
import { paperFrame, strongRail } from "~/shared/components/paperFrame"

/**
 * A scene, laid out like a trait card but lighter on the cost: the minimum cost
 * in an 18mm square in the upper left, the name in the upper right, and the
 * rest empty for art. The alternative action is a 6mm spine down the left edge,
 * below the cost, reading bottom to top; in the bleed variant it runs on through
 * the 3mm of bleed to its left.
 */

const actionStrip = css({
  gridArea: "3 / 1 / 5 / 2",
  justifySelf: "start",
  marginTop: "3",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  background: "white",
  borderTop: "0.25mm solid rgba(0, 0, 0, 0.18)",
  borderRight: "0.25mm solid rgba(0, 0, 0, 0.18)",
  borderTopRightRadius: "3",
  // Deliberately low contrast: the action should take a little effort to scan.
  color: "neutral.500",
  fontSize: "paragraph",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.06em"
})

// Rotated half a turn so it reads bottom to top, like a book spine.
const actionName = css({
  writingMode: "vertical-rl",
  transform: "rotate(180deg)"
})

const ACTION_STRIP_W = 6

export function SceneCard({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: SceneCardData
  variant?: CardVariant
  showGuides?: boolean
}) {
  const name = ALTERNATIVE_ACTION_NAME[card.action]
  const ActionMark = ACTION_MARKS[card.action]

  return (
    <div
      style={{
        // No bottom zone: the action lives on the left edge instead.
        "--zone": "0px"
      } as CSSProperties}
      className={cx(
        cardFrame,
        paperFrame({ color: "pink" }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline,
        variant === "trim" && strongRail({ color: "pink" })
      )}
    >
      <div className={indexBox} />
      <div className={titleBox} />
      <div className={indexArea}>
        <CostSquare cost={card.cost} />
      </div>
      <div className={nameBlock}>
        <span className={nameText} style={{ fontSize: "calc(2.8 * var(--u))" }}>{card.name}</span>
      </div>

      {/* The 3mm of bleed to the left is part of the strip, so a cut never shows paper. */}
      <div
        className={actionStrip}
        style={{
          width: `calc(${variant === "bleed" ? ACTION_STRIP_W + 3 : ACTION_STRIP_W} * var(--u))`,
          paddingLeft: variant === "bleed" ? "calc(3 * var(--u))" : undefined
        }}
      >
        <span className={actionName}>{name}</span>
        <ActionMark size="calc(3 * var(--u))" strokeWidth={2} />
      </div>

      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

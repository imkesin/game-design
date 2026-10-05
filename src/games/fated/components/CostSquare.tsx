import { Plus } from "lucide-react"
import { Fragment } from "react"
import type { Requirement } from "~/games/fated/cards/domain"
import { SuitMark } from "~/games/fated/components/CornerIndex"
import { suit } from "~/games/fated/components/resourceMarks"
import { css } from "~/generated/styled-system/css"

/**
 * A scene's minimum cost in an 18mm square: each requirement is a corner-index
 * style column (amount over resource mark), and a faint plus between two of
 * them says both are needed. Costs matter less on a scene than a trait's
 * number, so this is deliberately smaller than a corner index.
 */

const COLUMN_W = 7

const square = css({
  width: "18",
  height: "18",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // Contains the plus's negative z-index so it sits behind the columns, not the card.
  isolation: "isolate"
})

const column = css({
  width: "7",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
})

const amount = css({
  height: "7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "calc(6 * var(--u))",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  textBox: "trim-both cap alphabetic"
})

// The gap between two columns, exactly the plus's size.
const plus = css({
  position: "relative",
  alignSelf: "stretch",
  width: "4",
  color: "neutral.600"
})

const plusIcon = css({
  position: "absolute",
  top: "50%",
  left: "50%",
  zIndex: -1,
  transform: "translate(-50%, -50%)"
})

export function CostSquare({ cost }: { cost: readonly Requirement[] }) {
  return (
    <div className={square}>
      {cost.map(({ amount: n, resource }, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className={plus}>
              <Plus className={plusIcon} size="calc(4 * var(--u))" strokeWidth={2.5} />
            </span>
          )}
          <div className={column}>
            <span className={amount} style={{ color: suit(resource).ink }}>{n}</span>
            <SuitMark resource={resource} size={COLUMN_W} />
          </div>
        </Fragment>
      ))}
    </div>
  )
}

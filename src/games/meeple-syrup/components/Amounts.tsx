import { Fragment } from "react"
import type { ResourceAmount } from "~/games/meeple-syrup/cards/domain"
import { RESOURCE_BY_ID } from "~/games/meeple-syrup/cards/resources"
import { RESOURCE_MARKS } from "~/games/meeple-syrup/components/resourceMarks"
import { css } from "~/generated/styled-system/css"

/**
 * A run of `ResourceAmount`s, as they print on an animal card's hire cost and
 * on either side of its conversion.
 *
 * An amount is `count x mark`, tinted with that resource's own ink, so a cost
 * is scannable as colour before it is read as text — which is the whole point
 * on a 49-card deck where seven cards share a name.
 *
 * Amounts within one list are joined by `+`, since every list is a sum.
 */

const list = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "1",
  minWidth: 0
})

// The numeral butts right up against the mark, which is what makes "4 x flour"
// read as one unit rather than two.
const namedAmount = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5"
})

const count = css({
  fontSize: "body",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1
})

const joiner = css({
  fontSize: "micro",
  fontWeight: 700,
  opacity: 0.55,
  lineHeight: 1
})

/** Mark size, in card units — a touch above `body` so the glyph carries the pairing. */
const MARK = "calc(4.4 * var(--u))"

function Amount({ amount }: { amount: ResourceAmount }) {
  const resource = RESOURCE_BY_ID[amount.resource]
  const Mark = RESOURCE_MARKS[amount.resource]
  return (
    <span
      className={namedAmount}
      style={{ color: `var(--colors-${resource.color}-700)` }}
      title={resource.name}
    >
      <span className={count}>{amount.count}</span>
      <Mark size={MARK} strokeWidth={1.8} />
    </span>
  )
}

export function Amounts({ amounts }: { amounts: readonly ResourceAmount[] }) {
  return (
    <span className={list}>
      {amounts.map((a, i) => (
        <Fragment key={a.resource}>
          {i > 0 && <span className={joiner}>+</span>}
          <Amount amount={a} />
        </Fragment>
      ))}
    </span>
  )
}

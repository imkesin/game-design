import { Droplet } from "lucide-react"
import { css } from "~/generated/styled-system/css"
import { CardOutline } from "~/shared/print/CardOutline"

/**
 * The board's two card rows, as footprints — places a physical card gets laid,
 * not cards printed there.
 *
 * They are deliberately not the same thing. Animals are simply two cards on
 * offer, free to recruit at whatever hire they print. Resources are a market:
 * four slots priced `0 0 1 2` in syrup, with cards entering at the dear end and
 * shuffling toward the free one as they are taken, so anything unwanted gets
 * cheaper and waiting is a real play.
 *
 * The board says all of that in marks alone — a price tag under a slot, an
 * arrow under the row that drifts. Nothing here explains itself in prose; the
 * rules that cannot be drawn belong in the rulebook rather than printed at
 * 3mm on a board nobody reads twice.
 */

const zone = css({
  display: "grid",
  gridTemplateRows: "auto auto",
  justifyItems: "center",
  gap: "1"
})

// A priced slot shows its cost in syrup's own amber, so the price reads as the
// good it is paid in rather than as an abstract number.
const priceTag = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5",
  fontSize: "calc(3.6 * var(--u))",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

// A free slot still needs a mark, or it reads as a slot whose price fell off.
const freeTag = css({
  fontSize: "calc(3.6 * var(--u))",
  fontWeight: 700,
  lineHeight: 1,
  color: "stone.300"
})

const SYRUP_MARK = "calc(4.6 * var(--u))"

/** `price` of `null` prints no tag at all — the slot simply has no price. */
function CardSlot({ price }: { price: number | null }) {
  return (
    <div className={zone}>
      <CardOutline />
      {price === null ? null : price === 0
        ? <span className={freeTag}>—</span>
        : (
          <span className={priceTag} style={{ color: "var(--colors-amber-700)" }}>
            {price}
            <Droplet size={SYRUP_MARK} strokeWidth={1.8} />
          </span>
        )}
    </div>
  )
}

const row = css({
  display: "grid",
  gridTemplateRows: "auto auto auto",
  justifyItems: "start",
  rowGap: "2"
})

const rowTitle = css({
  fontSize: "calc(3.4 * var(--u))",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "stone.600"
})

const slots = css({
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "auto",
  alignItems: "start",
  gap: "5"
})

// Spans the whole row, because the drift is a property of the row rather than
// of any one slot. An arrowhead and a rule, no caption.
const drift = css({
  justifySelf: "stretch",
  display: "flex",
  alignItems: "center",
  gap: "1",
  color: "stone.400"
})

const driftHead = css({
  fontSize: "calc(3.4 * var(--u))",
  lineHeight: 1
})

const driftRule = css({
  flex: 1,
  height: "0.5mm",
  background: "currentColor"
})

export function CardRow({
  title,
  prices,
  drift: direction
}: {
  title: string
  /** One entry per slot, left to right. `null` for a row that is not priced. */
  prices: readonly (number | null)[]
  /** Which way cards shuffle as they are taken — always toward the free end. */
  drift?: "left" | "right"
}) {
  return (
    <div className={row}>
      <span className={rowTitle}>{title}</span>
      <div className={slots}>
        {prices.map((price, i) => <CardSlot key={i} price={price} />)}
      </div>
      {direction !== undefined && (
        <span className={drift}>
          {direction === "left" && <span className={driftHead}>◀</span>}
          <span className={driftRule} />
          {direction === "right" && <span className={driftHead}>▶</span>}
        </span>
      )}
    </div>
  )
}

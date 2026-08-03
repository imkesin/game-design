import type { CSSProperties } from "react"
import { Fragment } from "react"
import { css } from "~/generated/styled-system/css"
import { GoldCost } from "~/shared/components/icons/GoldCost"
import { RESOURCE_LABEL, RESOURCE_PAYOFF, RESOURCES } from "./resources.ts"

/**
 * What each good pays, printed into the board's bottom-left zone.
 *
 * Ordered by payoff rather than by the goods' own order, so the table reads as
 * a ladder — the one thing a player needs from it at a glance is which good is
 * worth more than which. No heading: four goods against four coins is already
 * the whole sentence.
 *
 * The coin is Graft's, unchanged. It is the only colour on an otherwise ink-only
 * board, which is the point: the table is a key, and a key that looks like the
 * cartography is a key nobody finds. It still survives a mono printer, since the
 * amount is set inside the disc rather than carried by the amber.
 *
 * Sized in millimetres, matching `--u` on the print sheet. The zone is 2in
 * square — four 8mm coins and their rules come to about 45 of the 51mm, which is
 * as tight as the table can be drawn and still breathe.
 */

const ASCENDING = [...RESOURCES].sort((a, b) => RESOURCE_PAYOFF[a] - RESOURCE_PAYOFF[b])

const COIN = 8

const table = css({
  boxSizing: "border-box",
  height: "100%",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gridTemplateRows: "repeat(4, 1fr)",
  padding: "2mm 3mm",
  fontFamily: "system-ui, -apple-system, sans-serif",
  color: "#000"
})

/**
 * Both cells of a row stretch to its full height, which is what lets their two
 * top borders meet as one line. Centring the contents with `align-items` on the
 * grid instead would shrink each cell to its own content, and the rule would
 * step between the name and the coin.
 */
const cell = css({ display: "flex", alignItems: "center" })

const name = css({ fontSize: "3.8mm", letterSpacing: "0.1em" })
const coin = css({ justifyContent: "flex-end" })

/** Faint, and lighter than any line the map draws: this divides, it does not bound. */
const ruled = css({ borderTop: "0.2mm solid rgba(0, 0, 0, 0.28)" })

export function PayoffTable(
  { className, style }: { className?: string; style?: CSSProperties }
) {
  return (
    <div className={className === undefined ? table : `${table} ${className}`} style={style}>
      {ASCENDING.map((resource, index) => {
        // Rules go between rows, so the first has none.
        const divider = index === 0 ? "" : ` ${ruled}`
        return (
          <Fragment key={resource}>
            <span className={`${cell} ${name}${divider}`}>{RESOURCE_LABEL[resource]}</span>
            <span className={`${cell} ${coin}${divider}`}>
              <GoldCost amount={RESOURCE_PAYOFF[resource]} size={COIN} />
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}

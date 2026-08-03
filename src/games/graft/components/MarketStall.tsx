import { InducedDemand } from "~/games/graft/components/icons/InducedDemand"
import { FruitCrateSlot } from "~/games/graft/components/slots/FruitCrateSlot"
import { GoldCost } from "~/shared/components/icons/GoldCost"
import { darkBand, panelTint, paperFrame } from "~/shared/components/paperFrame"
import { value } from "~/shared/components/trackSlot"
// A crate slot is tinted by its fruit's own colour, independent of the stall
// frame's colour (which the board flattens to stone) — see FruitCrateSlot.
import { FRUIT_COLOR, PLAYER_COUNTS } from "~/games/graft/domain/CoreDefinitions"
import type { FruitColor, FruitName } from "~/games/graft/domain/CoreDefinitions"
import type { DemandColumn } from "~/games/graft/domain/MarketDefinitions"
import { css, cx } from "~/generated/styled-system/css"

/**
 * A fruit's market stall: header names the fruit, the demand track below is a
 * left-to-right line of columns that fills as the fruit sells — leftmost
 * columns pay the most gold, rightmost induce the most demand. Each column is
 * one price/demand level: its `gold` and induced-demand icons print once,
 * beneath a vertical stack of interchangeable crate slots.
 *
 * The board is printed once for every player count (see DemandColumn): a
 * column's base crate sits at the bottom, and crates that only unlock at higher
 * counts stack above it, badged "3+"/"4+" instead of stamped with the fruit
 * initial. All crate stacks are bottom-aligned via a shared subgrid so base
 * crates — and the gold/induced rows below them — line up across columns
 * whatever each column's depth.
 *
 * Which other fruits this one induces demand for sits in a divided panel down
 * the right side — a compact column of miniature fruit crates, then a gold coin,
 * then a numberless induced-demand mark, echoing a demand column's crate/gold/
 * demand order — rather than as arrows on a shared board-wide diagram (see
 * project discussion for why). Keeping it beside the track rather than below
 * keeps the stall wider than it is tall.
 */

// Crates present at this count are the always-printed base and go unbadged.
const BASE_PLAYERS = PLAYER_COUNTS[0]

// Header spans the top; the demand track and the induces panel share the row
// below it, split by the panel's left border (the vertical divider).
const frame = css({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gridTemplateRows: "auto 1fr",
  gridTemplateAreas: `"header header" "track induces"`,
  border: "0.3mm solid",
  borderRadius: "card",
  overflow: "hidden"
})

const header = css({
  gridArea: "header",
  textAlign: "center",
  fontSize: "title",
  fontWeight: 700,
  letterSpacing: "0.02em",
  paddingBlock: "2"
})

// Shared row tracks that every column subgrids into (N crate rows + gold +
// induced), so a column with a shallower stack or an omitted gold/induced row
// (see `value` below) still lines up with its neighbours instead of collapsing
// upward. `gridTemplateRows` is set inline since the crate-row count is data-
// driven (the deepest column's stack).
const track = css({
  gridArea: "track",
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "1fr"
})

const slot = css({
  display: "grid",
  gridRow: "1 / -1",
  gridTemplateRows: "subgrid",
  justifyItems: "center",
  alignItems: "center",
  gap: "2",
  paddingBlock: "3",
  paddingInline: "1",
  borderInlineEndWidth: "0.2mm",
  borderInlineEndStyle: "solid",
  borderInlineEndColor: "stone.400/40"
})

const lastSlot = css({ borderInlineEndWidth: 0 })

// Right-side panel: a numberless induced-demand mark over a compact, centred
// column of miniature crates. Its left border is the stall's vertical divider.
const inducesSection = css({
  gridArea: "induces",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1",
  paddingInline: "3",
  paddingBlock: "3",
  borderInlineStartWidth: "0.2mm",
  borderInlineStartStyle: "solid",
  borderInlineStartColor: "stone.400/40"
})

export function MarketStall({
  fruit,
  color,
  columns,
  induces
}: {
  fruit: FruitName
  color: FruitColor
  columns: readonly DemandColumn[]
  induces: readonly FruitName[]
}) {
  const crateRows = columns.length > 0 ? Math.max(...columns.map((c) => c.slots.length)) : 0
  return (
    <div className={cx(frame, paperFrame({ color }))}>
      <div className={cx(header, darkBand({ color }))}>{fruit}</div>
      <div className={track} style={{ gridTemplateRows: `repeat(${crateRows}, auto) auto auto` }}>
        {columns.map((c, i) => (
          <div key={i} className={cx(slot, i === columns.length - 1 && lastSlot)}>
            {Array.from({ length: crateRows }, (_, r) => {
              // Bottom-align the stack: the base crate (slots[0]) sits in the
              // lowest crate row, extras stack above; higher rows in shallower
              // columns render an empty spacer to hold the shared alignment.
              const threshold = c.slots[crateRows - 1 - r]
              if (threshold === undefined) return <div key={r} />
              return (
                <FruitCrateSlot
                  key={r}
                  color={FRUIT_COLOR[fruit]}
                  {...(threshold > BASE_PLAYERS
                    ? { badge: `${threshold}+` }
                    : { letter: fruit.charAt(0) })}
                />
              )
            })}
            <span className={value}>
              {c.gold > 0 && <GoldCost amount={c.gold} />}
            </span>
            <span className={value}>
              {c.inducedDemand > 0 && <InducedDemand amount={c.inducedDemand} />}
            </span>
          </div>
        ))}
      </div>
      {induces.length > 0 && (
        <div className={cx(inducesSection, panelTint({ color }))}>
          {induces.map((f) => <FruitCrateSlot key={f} color={FRUIT_COLOR[f]} letter={f.charAt(0)} size={8} />)}
          <GoldCost amount={1} size={8} />
          <InducedDemand size={8} />
        </div>
      )}
    </div>
  )
}

import { PLAYER_COUNTS } from "~/games/graft/domain/CoreDefinitions"
import type { LaborSupplyTier } from "~/games/graft/domain/LaborSupplyDefinitions"
import { css, cx } from "~/generated/styled-system/css"
import { GoldCost } from "~/shared/components/icons/GoldCost"
import { paperFrame, softBand } from "~/shared/components/paperFrame"
import { WorkerSlot } from "~/shared/components/slots/WorkerSlot"

// Slots at this player count are the always-printed base and go unbadged; a
// slot unlocking above it prints a "3+"/"4+" badge.
const BASE_PLAYERS = PLAYER_COUNTS[0]

/**
 * The Labor Market: workers up for hire, grouped into cost tiers (cheapest at
 * the top, most expensive at the bottom). Each tier shows its gold price once
 * alongside a row of `count` token slots, so a price with many workers reads
 * as one compact group rather than a long stack of identical rows. Tiers are
 * driven by CSS grid (`gridAutoRows: 1fr`) so they always fill the sleeve's
 * full height, whatever the tier count.
 */

const frame = css({
  display: "grid",
  gridTemplateRows: "auto 1fr",
  height: "100%",
  borderWidth: "0.3mm",
  borderStyle: "solid",
  borderRadius: "card",
  overflow: "hidden"
})

const header = css({
  textAlign: "center",
  fontSize: "name",
  fontWeight: 700,
  letterSpacing: "0.02em",
  paddingBlock: "2"
})

// Each tier's height is weighted by how many slot rows it holds (two slots per
// row), so a crowded tier gets proportionally more room than a sparse one
// instead of every tier splitting the height evenly.
const track = css({ display: "grid" })

const SLOTS_PER_ROW = 2

// The slots sit centred in the tier; the cost is lifted out of flow and pinned
// to the top-right corner so it hugs the walls instead of reserving a column.
const tier = css({
  position: "relative",
  display: "grid",
  placeItems: "center",
  paddingInline: "3",
  borderBottomWidth: "0.2mm",
  borderBottomStyle: "solid",
  borderBottomColor: "stone.400/40"
})

const lastTier = css({ borderBottomWidth: 0 })

const cost = css({
  position: "absolute",
  top: "1",
  right: "1"
})

// Two fixed columns; workers beyond 2 wrap onto further rows, so a tall tier
// grows down rather than crowding a single wide line.
const tokens = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, auto)",
  justifyContent: "center",
  alignContent: "center",
  gap: "1"
})

// With an odd worker count the right column has one fewer slot; dropping it by
// half the vertical pitch (half of the 18u slot + 1u row gap = 9.5u) nestles
// those slots between the left column's instead of leaving a lone gap.
const staggered = css({
  "& > :nth-child(even)": {
    transform: "translateY(calc(9.5 * var(--u)))"
  }
})

export function LaborSupply({ track: tiers }: { track: readonly LaborSupplyTier[] }) {
  return (
    <div className={cx(frame, paperFrame({ color: "stone" }))}>
      <div className={cx(header, softBand({ color: "stone" }))}>Labor Supply</div>
      <div
        className={track}
        style={{ gridTemplateRows: tiers.map((t) => `${Math.ceil(t.slots.length / SLOTS_PER_ROW)}fr`).join(" ") }}
      >
        {tiers.map((t, i) => (
          <div key={i} className={cx(tier, i === tiers.length - 1 && lastTier)}>
            <span className={cost}>
              <GoldCost amount={t.gold} />
            </span>
            <div className={cx(tokens, t.slots.length % 2 === 1 && staggered)}>
              {t.slots.map((minPlayers, j) => (
                <WorkerSlot
                  key={j}
                  badge={minPlayers > BASE_PLAYERS ? `${minPlayers}+` : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { Fragment } from "react"
import type { Resource, TradeTrack as TradeTrackData } from "~/games/meeple-syrup/cards/domain"
import { startIndex, trackLevels } from "~/games/meeple-syrup/cards/domain"
import { RESOURCE_BY_ID } from "~/games/meeple-syrup/cards/resources"
import { RateSlot } from "~/games/meeple-syrup/components/slots/RateSlot"
import { css, cx } from "~/generated/styled-system/css"
import { paperFrame, paperShade, vividBand } from "~/shared/components/paperFrame"

/**
 * The board's market strip: the eight resources as full-height banners with the
 * seven trade tracks slotted between them, so the chain reads straight across —
 * Maple Syrup on the far left, Flour on the far right, and each track sitting
 * physically between the two resources it prices.
 *
 * Each track is a vertical ladder. A rung is `left ◯ right`: the two numbers
 * flanking the disc the rate marker sits in, so the discs form one continuous
 * column down the middle of the ladder and the marker's height *is* the current
 * rate. Up the ladder means the left resource is gaining value (see
 * `domain.ts`'s `ratioAtStep`), which the arrow cues at either end restate by
 * name and colour.
 *
 * Every rung is the same physical height on every track, so rungs line up
 * across the whole board and a marker's height is comparable between tracks.
 * Ladders therefore differ in *length* rather than in rung size, and each is
 * centred in its column — with lengths growing left to right, the strip prints
 * as a wedge.
 *
 * Resource columns are fixed-width and the tracks are `1fr`, so the strip fills
 * whatever width it is given exactly rather than relying on inch arithmetic
 * summing to the play area.
 */

const RESOURCE_COL = "1.25in"
const TRACK_COUNT = 7

/**
 * Height of one arrow cue, in inches — generous enough for a two-line resource
 * name, which would otherwise clip: the ladder hides its overflow to keep its
 * rounded corners.
 */
const CUE_IN = 0.65

/** Smallest rung that still holds a marker disc and two numerals legibly. */
const MIN_RUNG_IN = 0.7

/**
 * Rung height is derived, not fixed: the longest ladder is sized to exactly fill
 * `heightIn`, and every other ladder inherits the same rung so rungs stay
 * aligned board-wide. That makes the market absorb whatever height the rest of
 * the sheet leaves it — add a card band and the ladders tighten rather than
 * overflowing the page.
 *
 * The two cues are fixed overhead per ladder, so only the rungs flex.
 */
function rungHeight(heightIn: number, maxRungs: number): number {
  return (heightIn - 2 * CUE_IN) / maxRungs
}

/** Outside height of an `n`-rung ladder: the rungs plus a cue at each end. */
function ladderHeight(n: number, rung: number): string {
  return `${n * rung + 2 * CUE_IN}in`
}

// The strip: resource | track | resource | ... | resource. `1fr` tracks absorb
// whatever the fixed resource columns leave. Items are centred rather than
// stretched — every column now sets its own height.
const strip = css({
  height: "100%",
  display: "grid",
  gridTemplateColumns: `${RESOURCE_COL} repeat(${TRACK_COUNT}, 1fr ${RESOURCE_COL})`,
  alignItems: "center",
  gap: 0
})

// A resource banner: a slab of the resource's own colour with its name set
// sideways, reading bottom-to-top. Height is set per-banner, not here.
// `vividBand` (.400 paper, .900 ink) rather than `darkBand`: at .900 every one
// of these hues collapses to near-black, so eight dark bands would read as
// eight identical slabs.
const banner = css({
  display: "grid",
  placeItems: "center",
  borderRadius: "card"
})

const bannerName = css({
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
  fontSize: "calc(11 * var(--u))",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  whiteSpace: "nowrap"
})

// The track column is just a gutter around the ladder; the strip's
// `alignItems: center` is what centres it.
const trackCell = css({ paddingInline: "2" })

// The ladder: an arrow cue at each end, rungs at a fixed height between.
// `gridTemplateRows` is set inline — the rung count is data-driven.
const ladder = css({
  display: "grid",
  border: "0.3mm solid",
  borderRadius: "card",
  overflow: "hidden"
})

const cue = css({
  display: "grid",
  gridAutoFlow: "row",
  justifyItems: "center",
  alignContent: "center",
  gap: "0.5",
  paddingBlock: "2",
  paddingInline: "1"
})

const cueArrow = css({
  fontSize: "calc(4 * var(--u))",
  lineHeight: 1
})

const cueName = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  textAlign: "center"
})

// A rung. Three columns so the discs line up in one exact column regardless of
// how wide the numbers get: the numbers are pushed against the centre track
// from either side.
const rungRow = css({
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  gap: "2",
  paddingInline: "2"
})

const rungDivider = css({
  borderBlockStartWidth: "0.2mm",
  borderBlockStartStyle: "solid",
  borderBlockStartColor: "stone.400/40"
})

/**
 * A rung's two numerals. Sized against the numeral column rather than by eye:
 * the flanking columns are `1fr`, whose min-content floor is the digit itself,
 * so type wide enough to overflow pushes the whole ladder wider instead of
 * wrapping. At a 16mm disc each column is ~9.3mm, which a 10mm digit (~6mm)
 * clears comfortably.
 */
const rateNumber = css({
  fontSize: "calc(10 * var(--u))",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1
})

const leftNumber = css({ textAlign: "right" })
const rightNumber = css({ textAlign: "left" })

/** The resource's dark ink, for numbers and cue arrows that must echo its banner. */
function ink(resource: Resource) {
  return { color: `var(--colors-${resource.color}-800)` }
}

/**
 * `rungs` is the rung count of the tallest ladder this banner touches — the
 * taller of the two it sits between, or the only one at either end of the
 * chain. Taking the taller (rather than the shorter, or an average) is what
 * keeps a ladder from overhanging its own post.
 */
function Banner({ resource, rungs, rung }: { resource: Resource; rungs: number; rung: number }) {
  return (
    <div
      className={cx(banner, vividBand({ color: resource.color }))}
      style={{ height: ladderHeight(rungs, rung) }}
    >
      <span className={bannerName}>{resource.name}</span>
    </div>
  )
}

function Ladder({ track, rung }: { track: TradeTrackData; rung: number }) {
  const left = RESOURCE_BY_ID[track.left]
  const right = RESOURCE_BY_ID[track.right]
  const levels = trackLevels(track)
  const start = startIndex(track)

  return (
    <div className={trackCell}>
      <div
        className={cx(ladder, paperFrame({ color: "stone" }))}
        style={{ gridTemplateRows: `${CUE_IN}in repeat(${levels.length}, ${rung}in) ${CUE_IN}in` }}
      >
        <div className={cue}>
          <span className={cueArrow} style={ink(left)}>▲</span>
          <span className={cueName} style={ink(left)}>{left.name}</span>
        </div>
        {levels.map((ratio, i) => {
          const isStart = i === start
          return (
            <div
              key={`${ratio.left}:${ratio.right}`}
              className={cx(rungRow, i > 0 && rungDivider, isStart && paperShade({ color: "stone" }))}
            >
              <span className={cx(rateNumber, leftNumber)} style={ink(left)}>{ratio.left}</span>
              <RateSlot />
              <span className={cx(rateNumber, rightNumber)} style={ink(right)}>{ratio.right}</span>
            </div>
          )
        })}
        <div className={cue}>
          <span className={cueName} style={ink(right)}>{right.name}</span>
          <span className={cueArrow} style={ink(right)}>▼</span>
        </div>
      </div>
    </div>
  )
}

/**
 * `heightIn` is the height the strip has been given, in inches. The longest
 * ladder is fitted to exactly that, and every ladder shares the resulting rung.
 * If the rung would fall below `MIN_RUNG_IN` the strip renders at the minimum
 * and overflows instead of quietly printing an illegible board — better a
 * visibly broken sheet than one that looks fine and can't be read.
 */
export function TradeTrackBoard({
  tracks,
  heightIn
}: {
  tracks: readonly TradeTrackData[]
  heightIn: number
}) {
  const first = tracks[0]
  if (first === undefined) return null

  const maxRungs = Math.max(...tracks.map((t) => t.levels))
  const rung = Math.max(MIN_RUNG_IN, rungHeight(heightIn, maxRungs))

  return (
    <div className={strip}>
      <Banner resource={RESOURCE_BY_ID[first.left]} rungs={first.levels} rung={rung} />
      {tracks.map((track, i) => {
        const next = tracks[i + 1]
        return (
          <Fragment key={track.id}>
            <Ladder track={track} rung={rung} />
            <Banner
              resource={RESOURCE_BY_ID[track.right]}
              rungs={Math.max(track.levels, next?.levels ?? 0)}
              rung={rung}
            />
          </Fragment>
        )
      })}
    </div>
  )
}

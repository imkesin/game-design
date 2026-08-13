import { Fragment } from "react"
import type { Resource, TradeTrack as TradeTrackData } from "~/games/meeple-syrup/cards/domain"
import { startIndex, trackLevels } from "~/games/meeple-syrup/cards/domain"
import { RESOURCE_BY_ID } from "~/games/meeple-syrup/cards/resources"
import { RESOURCE_MARKS } from "~/games/meeple-syrup/components/resourceMarks"
import { RateSlot } from "~/games/meeple-syrup/components/slots/RateSlot"
import { css, cx } from "~/generated/styled-system/css"
import { panelTint, paperFrame, paperShade, softBand, vividBand } from "~/shared/components/paperFrame"

/**
 * The board's market strip: the seven trade tracks laid straight across in chain
 * order, Maple Syrup at the far left through Flour at the far right, with the
 * eight resources named once each in a header row above them.
 *
 * A ladder is one three-column grid, and the columns are what make it read as an
 * exchange rather than as a column of numbers. The two outer columns are
 * unbroken bands of the two resources' own colours, the marker discs run down
 * the paper column between them, and a rung is a horizontal slice across all
 * three: `left ◯ right`. Rung dividers are hairlines drawn *over* the bands
 * rather than gaps between chips, so the two colours never break — the ladder is
 * two goods facing each other, and the marker's height is the rate.
 *
 * The cap is a `⇄` in the marker column, directly above the discs, with the two
 * bands already running at full width on either side of it. It says what the
 * whole object is; it does not need to say what the sides are, because the
 * header does that.
 *
 * The header is the part worth explaining. A resource sits *between* two markets
 * in the chain, so its chip is centred on the gap between two ladders and is
 * wider than that gap — it overhangs onto the top of the colour band on each
 * side. One chip therefore labels two bands at once, in two different ladders,
 * which is exactly the relationship the chain has: Chocolate is the right-hand
 * side of the syrup market and the left-hand side of the blueberry market, and
 * the chip physically straddles both. Sitting the chips *between* the ladders
 * instead would name a gap rather than a pair of bands.
 *
 * The two end chips — Maple Syrup and Flour — align to the outside instead of
 * centring, because each borders only one market and centring would push them
 * into the sheet's margin.
 *
 * Under each chip sits that resource's icon tile: the same colour two steps
 * lighter, square, with the good's mark on it. The pair is the board's whole
 * answer to "what is this thing" — the chip says the name and the tile shows the
 * picture, and between them the colour running down both adjacent ladders needs
 * no further explanation. The tiles cost the ladders height, which is the only
 * reason the rungs are as short as they are.
 *
 * Everything else is clear space. The gaps are wide enough to read as separation
 * rather than as padding, which is what keeps the strip from looking like one
 * 49-rung table instead of seven self-contained markets.
 *
 * Every rung is the same physical height on every track, so rungs line up across
 * the whole board and a marker's height is comparable between tracks. Ladders
 * therefore differ in *length* rather than in rung size, and all of them hang
 * from the header rather than centring in their column — a chip has to sit on
 * the ladder it names, and a short ladder floated to the middle would leave its
 * chip stranded. All seven are the same length today, so the strip prints as one
 * even band, but the layout does not assume it: shortening a track is the
 * standing lever for tightening one market (see `tradeTracks.ts`).
 *
 * The gap columns are fixed-width and the tracks are `1fr`, so the strip fills
 * whatever width it is given exactly rather than relying on inch arithmetic
 * summing to the play area.
 */

const TRACK_COUNT = 7

/**
 * The clear space between two ladders, and at each end of the strip.
 *
 * This is the strip's main tuning knob and it cuts both ways: the ladders are
 * `1fr`, so every inch given to the gaps comes off their width. Widening the
 * gaps separates the markets *and* tightens each ladder around its own numerals,
 * which at the previous half inch were floating in a great deal of band.
 */
const GAP_COL = "1.2in"

/**
 * The marker column's width. Fixed rather than `auto` because the strip and the
 * ladders have to agree on it: the strip models a ladder as four equal
 * half-bands around this column, and a chip spans whole numbers of those halves.
 * Get this wrong and every chip is off by however much the disc's padding drifts.
 */
const DISC_COL = "0.8in"

/** Header height, in inches — one line of resource name. */
const HEADER_IN = 0.4

/**
 * Rule weight, in millimetres. One value for the header assembly and the ladder
 * frames both — they are the sheet's two structural outlines and should carry
 * the same weight.
 */
const FRAME_MM = 0.5

/**
 * Height of a resource's icon tile, in inches. Only the height is authored: a
 * tile takes its chip's exact columns, so its width is whatever the chip's is.
 *
 * That makes the six interior tiles rectangles and the two end tiles very nearly
 * square, because an interior resource borders two markets and reaches into both
 * while Maple Syrup and Flour reach into one. Fixing a single square side
 * instead looks tidier written down and worse printed — the ends come out flush
 * with their chips and the middle six sit visibly narrower than theirs, so the
 * row reads as six mistakes and two correct ones. Matching the chip every time
 * is the rule that has no exceptions.
 *
 * The tile sits directly under its chip, in a row of its own, which is why the
 * ladders start lower than they used to. That is the trade: an inch and a
 * quarter off the rungs to buy the board a picture of every good it prices.
 */
const ICON_IN = 1.45

/**
 * How far the tile hangs below its row, in inches — down onto the caps of the
 * ladders it straddles. Same move the chip makes onto the tile, one level down,
 * and for the same reason: the header, the tile and the two markets are one
 * assembly, and a tile that stops a hair short of the ladders reads as a
 * near-miss rather than as a deliberate gap.
 */
const ICON_OVERLAP_IN = 0.2

/** The row the tiles occupy. The overlap is the part that hangs out of it. */
const ICON_ROW_IN = ICON_IN - ICON_OVERLAP_IN

/** How much of the tile the mark itself fills, as a fraction of `ICON_IN`. */
const MARK_SCALE = 0.58

/**
 * Ladder cap height, in inches. Sized to the `⇄` rather than the other way
 * round: the arrow is the one mark that says what the whole object is, and the
 * resource chips overhanging it are large enough that a small one disappeared.
 */
const CAP_IN = 0.5

/** Ladder foot height, in inches — the direction cue, spanning all three columns. */
const FOOT_IN = 0.3

/** Fixed overhead per ladder: the two ends. Only the rungs between them flex. */
const ENDS_IN = CAP_IN + FOOT_IN

/** Smallest rung that still holds a marker disc and two numerals legibly. */
const MIN_RUNG_IN = 0.7

/**
 * Rung height is derived, not fixed: the longest ladder is sized to exactly fill
 * what the header leaves of `heightIn`, and every other ladder inherits the same
 * rung so rungs stay aligned board-wide. That makes the market absorb whatever
 * height the rest of the sheet leaves it — add a card band and the ladders
 * tighten rather than overflowing the page.
 */
function rungHeight(heightIn: number, maxRungs: number): number {
  return (heightIn - HEADER_IN - ICON_ROW_IN - ENDS_IN) / maxRungs
}

/**
 * Columns per market group: a ladder's four half-bands around its marker column,
 * then the gap that follows it.
 */
const COLS_PER_TRACK = 6

/**
 * The strip: a header row over a ladder row on one column template, and the
 * template is what sizes the chips.
 *
 * A ladder is modelled here as `½band ½band disc ½band ½band` — the same
 * geometry it lays out internally, only with each colour band split into two
 * equal halves. That split exists purely so the header can address a half: a
 * chip is a grid item spanning half the band on its left, the gap, and half the
 * band on its right, which makes its width a consequence of the sheet rather
 * than of how long the resource's name happens to be. Widen the play area and
 * every chip widens with its bands.
 *
 * Columns run gap · track · gap · … · gap, so there is a gap at each end of the
 * strip as well as between every pair of ladders — the eight gaps are the eight
 * resources.
 */
const strip = css({
  height: "100%",
  display: "grid",
  gridTemplateColumns: `${GAP_COL} repeat(${TRACK_COUNT}, 1fr 1fr ${DISC_COL} 1fr 1fr ${GAP_COL})`,
  columnGap: 0
})

/**
 * A resource chip. Sized by its column span, so the text is set to fit the chip
 * rather than the chip to fit the text.
 *
 * It is the top half of a two-part object and is drawn as such: framed on three
 * sides, rounded on the top two corners, and open along the bottom, where the
 * icon tile picks the outline back up. The chip used to hang over the tile
 * instead, which read as two things stacked; sharing an edge reads as one thing
 * in two weights, which is what it is.
 */
const chip = css({
  gridRow: 1,
  alignSelf: "stretch",
  position: "relative",
  zIndex: 2,
  display: "grid",
  placeItems: "center",
  paddingInline: "1",
  borderWidth: `${FRAME_MM}mm`,
  borderStyle: "solid",
  borderBlockEndWidth: 0,
  borderStartStartRadius: "card",
  borderStartEndRadius: "card",
  fontSize: "calc(4.5 * var(--u))",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  whiteSpace: "nowrap"
})

/**
 * A resource's icon tile: the same colour as its chip, two steps lighter
 * (`.200` paper against the chip's `.400`), so the two read as one object in two
 * weights rather than as a label and an unrelated square. It stretches across
 * the chip's own columns, so the two are exactly flush.
 *
 * The bottom half of the frame the chip starts: open along the top, where the
 * chip's own outline continues, and rounded on the bottom two corners. The two
 * borders meet with no seam, so the pair prints as one outlined object.
 */
const iconTile = css({
  gridRow: 2,
  alignSelf: "start",
  position: "relative",
  zIndex: 1,
  display: "grid",
  placeItems: "center",
  borderWidth: `${FRAME_MM}mm`,
  borderStyle: "solid",
  borderBlockStartWidth: 0,
  borderEndStartRadius: "card",
  borderEndEndRadius: "card"
})

/**
 * The columns a resource's chip covers, as a `grid-column` value.
 *
 * One rule for all eight: a chip covers its own gap, plus the half-band nearest
 * that gap in every market the resource borders. Interior resources border two
 * and so reach both ways; Maple Syrup and Flour border one and reach one way.
 *
 * That makes the two end chips a half-band shorter than the other six, which is
 * the right trade. Matching the widths instead means letting the ends swallow a
 * whole band, and then the row has two chips whose inner edge lands somewhere
 * different from everyone else's — a difference the eye picks up immediately,
 * where a difference in length reads as the chain simply ending.
 */
function chipColumns(index: number, last: number): string {
  const gap = 1 + index * COLS_PER_TRACK
  if (index === 0) return `${gap} / ${gap + 2}`
  if (index === last) return `${gap - 1} / ${gap + 1}`
  return `${gap - 1} / ${gap + 2}`
}

/**
 * The ladder. One grid for the whole thing rather than a stack of rung rows,
 * which is what lets the two colour bands run unbroken from cap to foot: every
 * cell on a side lands in the same column, with no gap and no padding between
 * rows for paper to show through.
 *
 * `gridTemplateRows` is set inline — the rung count is data-driven.
 */
const ladder = css({
  display: "grid",
  gridTemplateColumns: `1fr ${DISC_COL} 1fr`,
  // Matched to the header assembly's outline, and dark enough to hold its own
  // against seven pairs of colour bands — `paperFrame`'s stone `.500` read as a
  // smudge once the bands filled the ladder edge to edge.
  borderWidth: `${FRAME_MM}mm`,
  borderStyle: "solid",
  borderColor: "stone.700",
  borderRadius: "card",
  overflow: "hidden",
  gap: 0
})

/**
 * The `⇄`, in the marker column so it sits directly above the discs — the cap
 * and the rungs share one centre line. The bands to either side of it are the
 * same tint as a rung's, so a ladder's colour starts at its very top edge and
 * runs into the chip overhanging it.
 */
const capTrade = css({
  display: "grid",
  placeItems: "center",
  paddingInline: "1",
  fontSize: "calc(11 * var(--u))",
  lineHeight: 1
})

// The foot spans all three columns: which way is up is a fact about the whole
// ladder, not about either side of it.
const foot = css({
  gridColumn: "1 / -1",
  display: "grid",
  placeItems: "center",
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap"
})

/**
 * One side of one rung. The numeral is pushed against the marker column so the
 * two sides of a rate read as a pair with the disc between them, rather than
 * drifting to the outer edges of a wide ladder.
 */
const sideCell = css({
  display: "grid",
  alignItems: "center",
  paddingInline: "2",
  fontSize: "calc(10 * var(--u))",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1
})

const leftCell = css({ justifyItems: "end" })
const rightCell = css({ justifyItems: "start" })

/** The marker column's cell: paper, so the discs read as a track of their own. */
const discCell = css({
  display: "grid",
  placeItems: "center",
  paddingInline: "2"
})

// Drawn over the colour bands rather than between them, so the bands stay
// continuous. Its colour is set per-cell from the band it crosses.
const divider = css({
  borderBlockStartWidth: "0.2mm",
  borderBlockStartStyle: "solid"
})

/** The resource's dark ink, for the numerals on its own band. */
function ink(resource: Resource) {
  return { color: `var(--colors-${resource.color}-800)` }
}

/** A hairline a shade or two into the band it is drawn on, so it reads at any tint. */
function rule(resource: Resource) {
  return { borderBlockStartColor: `var(--colors-${resource.color}-300)` }
}

/**
 * The outline around a header assembly: the resource's own colour at `.700`.
 *
 * Dark enough to frame both weights it crosses — the chip's `.400` and the
 * tile's `.200` — without going to the near-black end of the scale, where all
 * eight hues collapse into the same line and the header row loses the colour
 * coding the rest of the strip depends on.
 */
function frame(resource: Resource) {
  return { borderColor: `var(--colors-${resource.color}-700)` }
}

function ResourceChip({ resource, columns }: { resource: Resource; columns: string }) {
  return (
    <div
      className={cx(chip, vividBand({ color: resource.color }))}
      style={{ gridColumn: columns, ...frame(resource) }}
    >
      {resource.name}
    </div>
  )
}

function ResourceIcon({ resource, columns }: { resource: Resource; columns: string }) {
  const Mark = RESOURCE_MARKS[resource.id]
  return (
    <div
      className={cx(iconTile, softBand({ color: resource.color }))}
      style={{ gridColumn: columns, height: `${ICON_IN}in`, ...frame(resource) }}
    >
      <Mark size={`${ICON_IN * MARK_SCALE}in`} strokeWidth={1.5} absoluteStrokeWidth />
    </div>
  )
}

function Ladder({ track, rung }: { track: TradeTrackData; rung: number }) {
  const left = RESOURCE_BY_ID[track.left]
  const right = RESOURCE_BY_ID[track.right]
  const levels = trackLevels(track)
  const start = startIndex(track)

  return (
    <div
      className={cx(ladder, paperFrame({ color: "stone" }))}
      style={{ gridTemplateRows: `${CAP_IN}in repeat(${levels.length}, ${rung}in) ${FOOT_IN}in` }}
    >
      <div className={paperShade({ color: left.color })} />
      <div className={capTrade}>⇄</div>
      <div className={paperShade({ color: right.color })} />
      {levels.map((ratio, i) => {
        // The starting rung is a notch darker on both bands (.200 against .100)
        // rather than a separate colour — the marker's home has to be findable
        // without introducing a ninth hue to the strip.
        const band = i === start ? panelTint : paperShade
        return (
          <Fragment key={`${ratio.left}:${ratio.right}`}>
            <div
              className={cx(sideCell, leftCell, band({ color: left.color }), divider)}
              style={{ ...ink(left), ...rule(left) }}
            >
              {ratio.left}
            </div>
            <div
              className={cx(discCell, i === start && paperShade({ color: "stone" }), divider)}
              style={{ borderBlockStartColor: "var(--colors-stone-300)" }}
            >
              <RateSlot />
            </div>
            <div
              className={cx(sideCell, rightCell, band({ color: right.color }), divider)}
              style={{ ...ink(right), ...rule(right) }}
            >
              {ratio.right}
            </div>
          </Fragment>
        )
      })}
      <div className={foot} style={ink(left)}>▲ {left.name} gains</div>
    </div>
  )
}

/**
 * `heightIn` is the height the strip has been given, in inches. The longest
 * ladder is fitted to exactly what the header leaves of that, and every ladder
 * shares the resulting rung. If the rung would fall below `MIN_RUNG_IN` the
 * strip renders at the minimum and overflows instead of quietly printing an
 * illegible board — better a visibly broken sheet than one that looks fine and
 * can't be read.
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

  // The eight resources in chain order: the first track's left, then every
  // track's right. One per gap column, header row.
  const resources = [first.left, ...tracks.map((t) => t.right)].map((id) => RESOURCE_BY_ID[id])
  const last = resources.length - 1

  return (
    <div className={strip} style={{ gridTemplateRows: `${HEADER_IN}in ${ICON_ROW_IN}in 1fr` }}>
      {resources.map((resource, i) => {
        const columns = chipColumns(i, last)
        return (
          <Fragment key={resource.id}>
            <ResourceChip resource={resource} columns={columns} />
            <ResourceIcon resource={resource} columns={columns} />
          </Fragment>
        )
      })}
      {tracks.map((track, i) => (
        <div
          key={track.id}
          style={{
            gridRow: 3,
            gridColumn: `${2 + i * COLS_PER_TRACK} / span 5`,
            alignSelf: "start"
          }}
        >
          <Ladder track={track} rung={rung} />
        </div>
      ))}
    </div>
  )
}

import { ArrowRight } from "lucide-react"
import { markFor } from "~/games/regolith/components/resourceMarks"
import { BUILD_MATERIAL, buildCost } from "~/games/regolith/domain"
import type { Face, FaceKind, Good, RecipeInput, Terms } from "~/games/regolith/domain"
import { HEX_HEIGHT_IN, HEX_WIDTH_IN, hexPoints, mm, UNITS_PER_INCH } from "~/games/regolith/hexGeometry"
import { css } from "~/generated/styled-system/css"

/**
 * The widest horizontal box, reaching `halfH` above and below the tile's
 * centre, that still fits inside the hex. The slanted edges pinch in as you
 * leave the middle: full width at the centre line, half width by the flat top
 * and bottom. Every zone's width is derived from this rather than guessed, so
 * content gets all the room the shape can give it and none that it can't.
 */
function safeBoxWidth(w: number, h: number, halfH: number): number {
  return w - (w * halfH) / h
}

/** Kept off the slanted edge itself, so a descender never touches the outline. */
const BOX_INSET = 0.95

/**
 * Every tile's face is these three rows: the name on the top edge, the middle
 * carrying whatever the tile *is* (a source's yield, a converter's formula),
 * and a footer strip on the bottom edge. One structure across the set, so a
 * player's eye lands in the same place on every tile.
 */
const FACE_ROWS = { header: 1, middle: 5, footer: 1 }

/**
 * A source's mark box, as a fraction of the largest square that would still
 * clear the hex's slanted edges. Well under that ceiling: the mark is the
 * background, and the room it gives back goes to the name.
 */
const ICON_SCALE = 0.68

function bigIconSize(w: number, h: number): number {
  const clearance = (2 * h * w) / (2 * h + w)
  return clearance * ICON_SCALE
}

/**
 * The largest mark that lets a row `rowWidth` marks wide fit inside the hex.
 *
 * Solved rather than assumed, because the room a row has depends on how tall
 * it is and its height *is* the answer: the hex pinches in as you leave the
 * centre line, so a taller row gets a narrower box. Writing that constraint
 *
 *     BOX_INSET · safeBoxWidth(w, h, size / 2)  =  size · rowWidth
 *
 * and solving for `size` gives the line below, which is exact — an earlier
 * version measured the box at a fixed height and either wasted room on a
 * small row or let a big mark push its corners past the edge.
 *
 * `cap` is the ceiling the shape isn't allowed to override: a lone term would
 * otherwise come out enormous.
 */
function rowMarkSize(w: number, h: number, rowWidth: number, cap: number): number {
  const usable = BOX_INSET * w
  return Math.min(cap, usable / (rowWidth + usable / (2 * h)))
}

/**
 * How wide a row is allowed to get, as a fraction of the tile's width.
 *
 * `rowMarkSize` alone gives a row every last unit the hex shape can spare,
 * which is not the same as a row that looks placed: at the limit the outermost
 * badge lands on the border band. These ceilings buy that clearance back. The
 * yield row's is much tighter than the formula's because its marks are several
 * times the size — at the formula's ceiling a pair of them sits at opposite
 * edges of the hex with a gulf between.
 */
const ROW_MAX = { formula: 0.82, yield: 0.66 }

function rowCap(w: number, rowWidth: number, max: number): number {
  return (max * w) / rowWidth
}

/**
 * A formula's width in marks: the terms (see `termWidth`), the arrow, the
 * tight gaps within each side and the wide ones flanking the arrow. A
 * four-term recipe therefore shrinks itself instead of spilling out of the
 * hex.
 */
function formulaRowWidth(inputs: Terms, outputs: Terms): number {
  const terms = [...inputs, ...outputs].reduce((total, t) => total + termWidth(t), 0)
  const sameSideGaps = inputs.length - 1 + (outputs.length - 1)
  return terms + ARROW_SCALE + sameSideGaps * TERM_GAP + 2 * ARROW_GAP
}

/**
 * A source's yield is the same row without the arrow: one or two terms side by
 * side, at `YIELD_GAP` rather than `TERM_GAP`. Tighter because these marks are
 * several times the size of a formula's and the gap scales with them — at
 * `TERM_GAP` a pair reads as two unrelated marks on opposite sides of the hex
 * rather than as one tile's yield.
 */
function yieldRowWidth(yields: Terms): number {
  const terms = yields.reduce((total, t) => total + termWidth(t), 0)
  return terms + (yields.length - 1) * YIELD_GAP
}

/**
 * The ceiling on a source's mark: `bigIconSize`, which is what a lone mark
 * wants, and `ROW_MAX.yield`, which binds only once there are two terms. So a
 * single-yield tile comes out exactly as large as it always did, and a pair
 * shrinks to sit together in the middle of the hex.
 */
function yieldMarkCap(w: number, h: number, rowWidth: number): number {
  return Math.min(bigIconSize(w, h), rowCap(w, rowWidth, ROW_MAX.yield))
}

/**
 * Type and mark sizes as fractions of tile height, so the whole face survives
 * a change to `HEX_SIDE_MM` rather than needing every number retuned. One CSS
 * pixel inside a `foreignObject` is one SVG unit here, so these come out as
 * exact fractions of the printed tile.
 */
function metrics(h: number) {
  return {
    /**
     * One name size for every tile that has a middle row, source and
     * converter alike. Sources used to print theirs half again as large, on
     * the grounds that a resource tile's name was its whole identity — that
     * stopped being true when sources started printing their yield as marks.
     * Now every tile says what it does in the middle and the name is a
     * footnote on all of them, so two sizes would only be inconsistency.
     *
     * Small enough that the longest name in the set fits the header strip on
     * one line: at the old size "Icy Regolith" overran the rule and collided
     * with the number badge.
     */
    name: h * 0.052,
    /** On a hub or a barren tile the name is the whole face, so it takes the room a mark would. */
    plainName: h * 0.13,
    footerLabel: h * 0.047,
    footerMark: h * 0.095
  }
}

/**
 * Average advance width of an uppercase bold character, in ems, with the
 * name's letter-spacing folded in. A heuristic — the alternative is measuring
 * text, which a `foreignObject` cannot do before it lays out — and a
 * deliberately pessimistic one: spaces and the narrow letters both come out
 * under it, so a name measured this way is a little wider than it prints.
 */
const NAME_ADVANCE = 0.7

/**
 * A name's size: the set's one size, unless the name is long enough that it
 * would not fit its box on a single line, in which case exactly enough that it
 * does.
 *
 * A ceiling rather than a size, so that naming a hex is not also a typesetting
 * decision. Every name in the current set prints at the full size — nothing is
 * long enough to be cut down — and the point of this is to keep that true as
 * names change, rather than to shrink anything today. Without it a long name
 * wraps to a second line, which the header strip has no room for: it overruns
 * the rule and lands on the middle row.
 */
function nameSize(name: string, boxWidth: number, cap: number): number {
  return Math.min(cap, boxWidth / (name.length * NAME_ADVANCE))
}

/**
 * How dark a mark prints. Kept faint on purpose: the mark should sit behind
 * the name rather than compete with it, and a lighter mark also costs less
 * toner. Opacity, not a grey ink: sourced `marks/*.svg` carry their own black
 * fill, which a colour wouldn't override. The cut line and the tile name stay
 * full black, so what you cut and read stays crisp.
 */
const MARK_OPACITY = 0.35

/**
 * A quantity rides its mark as a badge on the mark's middle-left, rather than
 * sitting beside it. Two reasons: it binds the number to its good so a
 * conversion can't be misread, and it is immune to the marks' own internal
 * padding — sourced SVGs each inset their art differently, so anything
 * positioned off a mark's box edge lands somewhere different on every one.
 *
 * The badge is an opaque white disc, so it masks the faint mark behind it and
 * its digit stays crisp without adding a heavy black shape to the tile. It
 * also carries a white halo outside its ring (`BADGE_HALO`, a fraction of the
 * badge): without one, a mark's ink butts straight against the ring and the
 * badge stops reading as a solid token sitting on top.
 *
 * Sized per context, not once, and inversely to the mark: the big mark on a
 * source needs proportionally the least badge to stay readable, the small
 * footer mark the most, so a single fraction can't serve any two of them.
 */
const BADGE_SCALE = { source: 0.26, formula: 0.42, footer: 0.62 }
const BADGE_HALO = 0.08

/**
 * A term is a three-column overlay. The mark spans columns 2-3 and the badge
 * spans columns 1-2, so the two meet in column 2 and the badge ends up
 * centred on the mark's left edge — half on the mark, half off it.
 *
 * Position is then a ratio rather than a nudge: widen column 1 and the badge
 * slides right, narrow it and it slides further out.
 */
const TERM_COLUMNS = [1, 1, 5]
const TERM_GRID = TERM_COLUMNS.map((n) => `${n}fr`).join(" ")

/**
 * A badged term's box, as a multiple of the mark. The mark only occupies
 * columns 2-3, so the box has to be wider than the mark for the mark to come
 * out at its intended size.
 */
const BADGED_TERM_WIDTH = TERM_COLUMNS.reduce((a, b) => a + b, 0) / (TERM_COLUMNS[1]! + TERM_COLUMNS[2]!)

/**
 * How wide a term is, in marks. A term with no badge is exactly one mark
 * wide: it collapses to a single column rather than keeping an empty one
 * where a badge would have hung.
 *
 * That matters for grouping, not just for tidiness. The formula's two sides
 * are told apart by spacing — `TERM_GAP` within a side against the wider
 * `ARROW_GAP` around the arrow — and an empty badge column adds most of a
 * `TERM_GAP` of dead space to a term's left, which is enough to make the two
 * gaps read as one and the four terms of a `reduction-plant` read as a row of
 * four unrelated marks.
 */
function termWidth(input: RecipeInput): number {
  return hasBadge(input) ? BADGED_TERM_WIDTH : 1
}

/** A bare mark already says "one of these", so the badge is for everything else. */
function hasBadge(input: RecipeInput): boolean {
  return input.qty > 1
}

/** The arrow, relative to a mark. Small: it's punctuation, not a term. */
const ARROW_SCALE = 0.5

/** Space between two terms on the same side of the arrow, as a fraction of the mark. */
const TERM_GAP = 0.34

/** The same, for a source's much larger yield marks. See `yieldRowWidth`. */
const YIELD_GAP = 0.16

/**
 * Space either side of the arrow — wider than `TERM_GAP`, which is what makes
 * a two-in two-out formula readable. The arrow is punctuation and shrinks with
 * everything else, so on a four-term recipe it is far too small to carry the
 * split on its own; the grouping has to come from the spacing instead. Two
 * marks close together, a wider gap, then two more, reads as "these become
 * those" even when the arrow between them is barely visible.
 */
const ARROW_GAP = 0.8

/**
 * The tile edge is two strokes on the same hex: a soft, wide band that reads
 * as the tile's border, and a hairline down the middle of it to cut along.
 * The band is the buffer — wander off the line and you are still inside it,
 * so the tile keeps a deliberate-looking edge.
 *
 * Neighbouring tiles are packed touching, so they *share* one band: each
 * keeps half of `BAND_WIDTH` once cut. Hence 4mm drawn for a 2mm border.
 */
const BAND_WIDTH = mm(4)
const BAND_OPACITY = 0.18
const CUT_WIDTH = mm(0.35)

/**
 * How far the band reaches into the tile — half of it, the half this tile
 * keeps once cut. The face is laid out inside that, so the header and footer
 * are centred on the interior a player sees rather than on the raw hex, whose
 * top and bottom edges are buried under the band.
 */
const BORDER_INSET = BAND_WIDTH / 2

/**
 * How deep each kind's border runs, and so how much a tile weighs on the map:
 * the hub is the heaviest thing on the board, badlands the lightest, and
 * everything that actually does something sits between them at the default.
 * One grey at one opacity throughout — only the depth changes, so the set
 * reads as one family rather than as three inks.
 *
 * Depth is the *inward* half only. The band straddles the cut line and is
 * shared with whatever tile is packed against it on the sheet, so the outer
 * half stays at `BORDER_INSET` for every kind: the cut geometry and the sheet
 * packing never change, only what this tile keeps.
 */
const BORDER_DEPTH: Record<FaceKind, number> = {
  hub: mm(5),
  source: BORDER_INSET,
  converter: BORDER_INSET,
  barren: mm(0.8),
  blank: BORDER_INSET
}

/**
 * A band of the given depth, as one stroke: its width, and how far its
 * centreline shifts off the cut line to keep the outer half fixed. Drawn as a
 * single stroke rather than the default band plus a second ring, because two
 * strokes abutting at the same opacity show a seam along the join, and
 * overlapping them doubles to a dark line instead.
 */
function bandWidth(depth: number): number {
  return BORDER_INSET + depth
}
function bandOffset(depth: number): number {
  return (depth - BORDER_INSET) / 2
}

/** Badlands is barely printed: it is on the map to occupy a space, not to be read. */
const BARREN_INK = 0.3

/** The hairline ruling the header and footer strips off from the middle. */
const RULE = "#00000040"

const svg = css({ display: "block" })

/**
 * The grid box spans the whole hex, so its corners hang outside the shape.
 * That is harmless: each zone caps its own width to the taper at its own
 * height, and nothing is ever drawn in the corners.
 */
const faceGrid = css({
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateAreas: "\"header\" \"middle\" \"footer\"",
  justifyItems: "center",
  pointerEvents: "none"
})

const headerZone = css({
  gridArea: "header",
  alignSelf: "stretch",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

const middleZone = css({
  gridArea: "middle",
  alignSelf: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

/**
 * The footer sits on the bottom edge, well clear of the middle, so a build
 * cost can never be read as part of the conversion above it.
 */
const footerZone = css({
  gridArea: "footer",
  alignSelf: "stretch",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

/**
 * A strip rules only when it has something in it.
 *
 * The rows are always laid out — every tile in the set keeps the same
 * three-band shape whether or not it fills all three — but the line is not
 * the band, it is the separator between the band's contents and the middle.
 * An earlier version ruled unconditionally, which put a hairline across the
 * bottom of every source tile with nothing beneath it: the line read as a
 * printing artefact rather than as structure, and there are enough sources in
 * the set for that to be most of the box.
 */
const ruleBelow = css({
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: RULE
})

const ruleAbove = css({
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: RULE
})

const tileName = css({
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  textAlign: "center",
  lineHeight: 1.05,
  // One line, always: `nameSize` is what makes that fit, and wrapping instead
  // of overflowing would hide the fact that it didn't.
  whiteSpace: "nowrap",
  color: "black"
})

const footerLabel = css({
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#00000099"
})

/** Columns are set per-term: three where the term is badged, one where it isn't. */
const term = css({
  display: "grid",
  gridTemplateRows: "1fr",
  flex: "none"
})

/** Columns 2-3; the badge overlays columns 1-2, so they share column 2. */
const markCell = css({
  gridArea: "1 / 2 / 2 / -1",
  display: "grid",
  placeItems: "center"
})

/** The whole box, for an unbadged term — one column, no room kept for a badge. */
const markCellAlone = css({
  gridArea: "1 / 1 / 2 / -1",
  display: "grid",
  placeItems: "center"
})

const badge = css({
  gridArea: "1 / 1 / 2 / 3",
  placeSelf: "center",
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
  borderRadius: "9999px",
  borderStyle: "solid",
  borderColor: "black",
  background: "white",
  color: "black",
  fontWeight: 700,
  lineHeight: 1,
  // Above the mark it overlaps, whatever the paint order would otherwise be.
  zIndex: 1
})

/**
 * The whole formula, and each side of it, as two nested flex rows. Nested
 * rather than one row of terms because the two sides are spaced differently:
 * the outer row lays out `inputs · arrow · outputs` at `ARROW_GAP`, and each
 * side lays its own terms out at the tighter `TERM_GAP`.
 */
const formula = css({
  display: "flex",
  alignItems: "center"
})

const formulaSide = css({
  display: "flex",
  alignItems: "center"
})

function GoodIcon({
  good,
  size = 20,
  strokeWidth = 2
}: {
  good: Good
  size?: number
  strokeWidth?: number
}) {
  const Icon = markFor(good)
  return <Icon size={size} color="black" strokeWidth={strokeWidth} opacity={MARK_OPACITY} />
}

/**
 * A mark, badged with its quantity — see `hasBadge`, and `termWidth` for why
 * an unbadged term is narrower rather than merely emptier.
 */
function GoodQty({
  input,
  markSize,
  badgeScale
}: {
  input: RecipeInput
  markSize: number
  badgeScale: number
}) {
  const size = markSize * badgeScale
  const badged = hasBadge(input)
  return (
    <span
      className={term}
      style={{
        width: `${markSize * termWidth(input)}px`,
        height: `${markSize}px`,
        gridTemplateColumns: badged ? TERM_GRID : "1fr"
      }}
    >
      <span className={badged ? markCell : markCellAlone}>
        <GoodIcon good={input.good} size={markSize} />
      </span>
      {badged && (
        <span
          className={badge}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            fontSize: `${size * 0.62}px`,
            borderWidth: `${Math.max(0.9, size * 0.07)}px`,
            boxShadow: `0 0 0 ${Math.max(0.8, size * BADGE_HALO)}px white`
          }}
        >
          {input.qty}
        </span>
      )}
    </span>
  )
}

/**
 * The setup number, tucked into the top-left corner as a small square badge.
 *
 * Deliberately quiet. It exists so a game can be dealt by range — two players
 * take 0 through 6 — and has nothing to say once the tiles are on the map, so
 * it prints small and pale, out at a corner the face's three rows never reach.
 * Both sides of a piece carry it, so a tile can be found whichever way up it
 * lands.
 *
 * Drawn in SVG rather than as part of the face grid because it is the one
 * thing on the tile positioned against the hex's slanted edge instead of
 * against a row: it sits where the shape pinches hardest, so it is placed off
 * `safeBoxWidth` measured at the badge's own top edge — its tightest point —
 * rather than inside a box that has to clear the taper everywhere at once.
 */
const NUMBER_BADGE = {
  /** Side of the square, as a fraction of tile height. */
  size: 0.058,
  /** Digit height within the square. */
  text: 0.6,
  /**
   * How dark the ring and the digit print. The white ground is *not* faded
   * with them: the badge sits on the edge band, and a translucent ground would
   * let the band's grey through and turn the number into a smudge. So the
   * chip is solid and only its ink is quiet.
   */
  ink: 0.4,
  stroke: mm(0.25),
  /**
   * Clearance from the cut line — not from the band, which the badge is meant
   * to sit on top of. Measured from the cut so that every tile's number lands
   * at the same height whatever its border depth, including the hub's, whose
   * heavy band would otherwise push its badge a full 5mm down the face.
   */
  pad: mm(1.2)
}

function NumberBadge({ n, w, h }: { n: number; w: number; h: number }) {
  const size = h * NUMBER_BADGE.size
  const top = -h / 2 + NUMBER_BADGE.pad
  const left = -safeBoxWidth(w, h, Math.abs(top)) / 2 + NUMBER_BADGE.pad
  return (
    <g>
      <rect
        x={left}
        y={top}
        width={size}
        height={size}
        rx={size * 0.15}
        fill="white"
        stroke="black"
        strokeOpacity={NUMBER_BADGE.ink}
        strokeWidth={NUMBER_BADGE.stroke}
      />
      <text
        x={left + size / 2}
        y={top + size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={size * NUMBER_BADGE.text}
        fontWeight={700}
        fill="black"
        fillOpacity={NUMBER_BADGE.ink}
      >
        {n}
      </text>
    </g>
  )
}

/**
 * One printed side of a tile: the cut edge, the setup number, and — unless the
 * side is blank — the name / mark-or-formula / footer grid. Centred at (x, y)
 * in SVG user units.
 */
export function HexTileGroup({
  face,
  n,
  x = 0,
  y = 0,
  widthIn = HEX_WIDTH_IN,
  heightIn = HEX_HEIGHT_IN
}: {
  face: Face
  n: number
  x?: number
  y?: number
  widthIn?: number
  heightIn?: number
}) {
  const w = widthIn * UNITS_PER_INCH
  const h = heightIn * UNITS_PER_INCH
  const m = metrics(h)

  // The face lives inside the band, not on the whole hex, and how far in
  // depends on how deep this kind's border runs.
  //
  // Hub and barren tiles share one face: the name alone, centred, at the size a
  // mark would have taken. Neither has a recipe or a yield to state — one
  // because its terms ride on the worker placed there, the other because it
  // has none — so the name is the whole tile.
  const isPlainFace = face.kind === "hub" || face.kind === "barren"
  // Off `buildCost` rather than off `face.kind`, because a build cost is no
  // longer a converter's alone: a worked deposit is a source with plant on it,
  // and it has to print what that plant costs.
  const cost = buildCost(face)
  const hasCost = cost > 0
  const inset = BORDER_DEPTH[face.kind]
  const faceH = h - 2 * inset

  // A regular hex inset by a uniform distance is just a smaller one: its
  // flat-to-flat measure drops by twice that distance and the shape stays
  // similar, so one scale factor shifts the band's centreline on all six
  // edges at once.
  const bandScale = 1 - (2 * bandOffset(inset)) / h

  // Zone ceilings, each measured where its own content sits: the rules at the
  // strip boundaries, strip text against the face's own top and bottom, and
  // the middle against its own line height, where the hex is at its widest.
  const stripH = faceH * (FACE_ROWS.header / (FACE_ROWS.header + FACE_ROWS.middle + FACE_ROWS.footer))
  const ruleW = safeBoxWidth(w, h, faceH / 2 - stripH) * BOX_INSET
  const plainNameW = safeBoxWidth(w, h, m.plainName * 0.6) * BOX_INSET
  const stripTextW = safeBoxWidth(w, h, faceH / 2) * BOX_INSET
  const middleW = safeBoxWidth(w, h, h * 0.12) * BOX_INSET

  return (
    <g transform={`translate(${x} ${y})`}>
      {
        /* White ground, the edge band, then the cut line. The band is drawn
          separately from the fill because the hub's sits on an inset hex, and
          a fill would follow that inward and leave the corners bare. Both
          absolute rather than proportional: an edge to cut wants the same
          physical weight whatever the tile size. */
      }
      <polygon points={hexPoints(w, h)} fill="white" />
      <polygon
        points={hexPoints(w * bandScale, h * bandScale)}
        fill="none"
        stroke="black"
        strokeOpacity={BAND_OPACITY}
        strokeWidth={bandWidth(inset)}
      />
      <polygon points={hexPoints(w, h)} fill="none" stroke="black" strokeWidth={CUT_WIDTH} />
      {
        /* A blank side is the border and the number and nothing else: there is
          no face to lay out, so the three-row grid is not drawn at all rather
          than drawn empty. */
        face.kind !== "blank" && (
          <foreignObject x={-w / 2} y={-h / 2} width={w} height={h}>
            <div
              className={faceGrid}
              style={{
                gridTemplateRows: `${FACE_ROWS.header}fr ${FACE_ROWS.middle}fr ${FACE_ROWS.footer}fr`,
                paddingBlock: `${inset}px`
              }}
            >
              {
                /* A plain-face tile's name sits in the middle instead, so its
                  header strip is empty and goes unruled. */
              }
              <div
                className={`${headerZone} ${isPlainFace ? "" : ruleBelow}`}
                style={{ maxWidth: `${ruleW}px` }}
              >
                {!isPlainFace && (
                  <span
                    className={tileName}
                    style={{ fontSize: `${nameSize(face.name, stripTextW, m.name)}px`, maxWidth: `${stripTextW}px` }}
                  >
                    {face.name}
                  </span>
                )}
              </div>

              <div className={middleZone} style={{ maxWidth: `${middleW}px` }}>
                {
                  /* A source's yield, and no arrow — the arrow is what says
                    "something must be hauled here", so the one tile a player
                    can work off an empty map must not carry one. Its marks are
                    much bigger than a formula's, since there is no second side
                    and no punctuation to make room for. */
                  face.kind === "source" && (() => {
                    const yields: Terms = face.yields
                    const rowWidth = yieldRowWidth(yields)
                    const markSize = rowMarkSize(w, h, rowWidth, yieldMarkCap(w, h, rowWidth))
                    return (
                      <div className={formulaSide} style={{ columnGap: `${markSize * YIELD_GAP}px` }}>
                        {yields.map((y, i) => (
                          <GoodQty key={i} input={y} markSize={markSize} badgeScale={BADGE_SCALE.source} />
                        ))}
                      </div>
                    )
                  })()
                }

                {face.kind === "converter" && (() => {
                  // Widened off the recipe's tuple types, which are there to
                  // cap authoring at two terms a side, not to be mapped over.
                  const inputs: Terms = face.recipe.inputs
                  const outputs: Terms = face.recipe.outputs
                  const rowWidth = formulaRowWidth(inputs, outputs)
                  const markSize = rowMarkSize(
                    w,
                    h,
                    rowWidth,
                    Math.min(h * 0.24, rowCap(w, rowWidth, ROW_MAX.formula))
                  )
                  const side = (terms: Terms) => (
                    <div className={formulaSide} style={{ columnGap: `${markSize * TERM_GAP}px` }}>
                      {terms.map((t, i) => (
                        <GoodQty key={i} input={t} markSize={markSize} badgeScale={BADGE_SCALE.formula} />
                      ))}
                    </div>
                  )
                  return (
                    <div className={formula} style={{ columnGap: `${markSize * ARROW_GAP}px` }}>
                      {side(inputs)}
                      <ArrowRight size={markSize * ARROW_SCALE} color="black" opacity={MARK_OPACITY} />
                      {side(outputs)}
                    </div>
                  )
                })()}

                {
                  /* No mark at all — just the name. The hub prints it solid, as
                    the map's loudest tile; badlands prints it faintly, so a tile
                    whose whole job is to occupy a hex does not draw the eye to
                    itself while doing it. */
                  isPlainFace && (
                    <span
                      className={tileName}
                      style={{
                        fontSize: `${nameSize(face.name, plainNameW, m.plainName)}px`,
                        maxWidth: `${plainNameW}px`,
                        opacity: face.kind === "barren" ? BARREN_INK : 1
                      }}
                    >
                      {face.name}
                    </span>
                  )
                }
              </div>

              {
                /* Footer: what the face costs to build, and nothing else —
                  a converter's rock, or a worked deposit's. A face
                  says nothing about whatever is printed on its reverse — the
                  two sides are a choice made once, with the piece in hand and
                  both of them visible, so neither has anyone left to inform. */
              }
              <div
                className={`${footerZone} ${hasCost ? ruleAbove : ""}`}
                style={{ maxWidth: `${ruleW}px`, columnGap: `${m.footerMark * 0.35}px` }}
              >
                {
                  /* A free tile shows nothing at all — not even the label, and
                    so no rule either. Sources are all free, so on most of the
                    box this strip is simply blank space. */
                  hasCost && (
                    <>
                      <span className={footerLabel} style={{ fontSize: `${m.footerLabel}px` }}>
                        Build
                      </span>
                      <GoodQty
                        input={{ good: BUILD_MATERIAL, qty: cost }}
                        markSize={m.footerMark}
                        badgeScale={BADGE_SCALE.footer}
                      />
                    </>
                  )
                }
              </div>
            </div>
          </foreignObject>
        )
      }
      {
        /* Last, so the badge sits over the face rather than under it. The
          corner is empty on every tile, but paint order shouldn't be what
          that relies on. */
      }
      <NumberBadge n={n} w={w} h={h} />
    </g>
  )
}

/** One side of one tile as its own standalone, true-size SVG — for the on-screen preview. */
export function HexTile({
  face,
  n,
  widthIn = HEX_WIDTH_IN,
  heightIn = HEX_HEIGHT_IN
}: {
  face: Face
  n: number
  widthIn?: number
  heightIn?: number
}) {
  const w = widthIn * UNITS_PER_INCH
  const h = heightIn * UNITS_PER_INCH
  return (
    <svg
      className={svg}
      viewBox={`0 0 ${w} ${h}`}
      width={`${widthIn}in`}
      height={`${heightIn}in`}
    >
      <HexTileGroup face={face} n={n} x={w / 2} y={h / 2} widthIn={widthIn} heightIn={heightIn} />
    </svg>
  )
}

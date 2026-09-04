import { ArrowRight } from "lucide-react"
import { markFor } from "~/games/regolith/components/resourceMarks"
import type { Good, RecipeInput, Tile } from "~/games/regolith/domain"
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
 * carrying whatever the tile *is* (a resource's mark, a converter's formula),
 * and a footer strip on the bottom edge. One structure across the set, so a
 * player's eye lands in the same place on every tile.
 */
const FACE_ROWS = { header: 1, middle: 5, footer: 1 }

/**
 * The resource mark's box, as a fraction of the largest square that would
 * still clear the hex's slanted edges. Well under that ceiling: the mark is
 * the background, and the room it gives back goes to the name.
 */
const ICON_SCALE = 0.68

function bigIconSize(w: number, h: number): number {
  const clearance = (2 * h * w) / (2 * h + w)
  return clearance * ICON_SCALE
}

/**
 * The formula's mark size. It gets whatever the middle row can give, capped so
 * a one-input recipe doesn't swallow the hex. A term is exactly one mark wide
 * (its badge rides inside the mark's own box) and the arrow is `ARROW_SCALE`
 * of one, so dividing the row's width by that total plus the gaps yields the
 * size that fits — a two-input recipe shrinks itself instead of spilling.
 */
function formulaMarkSize(boxW: number, h: number, inputs: number): number {
  const slots = inputs + 1
  const markWidths = slots * TERM_WIDTH + ARROW_SCALE + slots * TERM_GAP
  return Math.min(h * 0.24, boxW / markWidths)
}


/**
 * Type and mark sizes as fractions of tile height, so the whole face survives
 * a change to `HEX_SIDE_MM` rather than needing every number retuned. One CSS
 * pixel inside a `foreignObject` is one SVG unit here, so these come out as
 * exact fractions of the printed tile.
 */
function metrics(h: number) {
  return {
    /** A resource tile's name is its label, so it carries weight. */
    name: h * 0.078,
    /** A converter's name is a footnote — its formula is what identifies it. */
    subName: h * 0.05,
    /** On a hub or a barren tile the name is the whole face, so it takes the room a mark would. */
    plainName: h * 0.13,
    footerLabel: h * 0.047,
    footerMark: h * 0.095
  }
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
 * Sized per context, not once: a big formula mark needs proportionally less
 * badge to stay readable, while the small footer mark needs proportionally
 * more, so a single fraction can't serve both.
 */
const BADGE_SCALE = { formula: 0.42, footer: 0.62 }
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
 * The term box, as a multiple of the mark. The mark only occupies columns
 * 2-3, so the box has to be wider than the mark for the mark to come out at
 * its intended size.
 */
const TERM_WIDTH = TERM_COLUMNS.reduce((a, b) => a + b, 0) / (TERM_COLUMNS[1]! + TERM_COLUMNS[2]!)

/** The arrow, relative to a mark. Small: it's punctuation, not a term. */
const ARROW_SCALE = 0.5

/** Space between terms, as a fraction of the mark size. */
const TERM_GAP = 0.34

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
const BORDER_DEPTH: Record<TileKind, number> = {
  hub: mm(5),
  resource: BORDER_INSET,
  converter: BORDER_INSET,
  barren: mm(0.8)
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
const face = css({
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
  justifyContent: "center",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: RULE
})

const middleZone = css({
  gridArea: "middle",
  alignSelf: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

/**
 * The footer is ruled off and sits on the bottom edge, well clear of the
 * middle, so a build cost can never be read as part of the conversion above
 * it. It rules even when empty, so every tile in the set keeps the same
 * three-band shape.
 */
const footerZone = css({
  gridArea: "footer",
  alignSelf: "stretch",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  color: "black"
})

const footerLabel = css({
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#00000099"
})

const term = css({
  display: "grid",
  gridTemplateRows: "1fr",
  gridTemplateColumns: TERM_GRID,
  flex: "none"
})

/** Columns 2-3; the badge overlays columns 1-2, so they share column 2. */
const markCell = css({
  gridArea: "1 / 2 / 2 / -1",
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

const formula = css({
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
 * A mark, badged with its quantity. Only above one — a bare mark already says
 * "one of these", so the badge appears exactly when there is something to
 * say.
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
  return (
    <span className={term} style={{ width: `${markSize * TERM_WIDTH}px`, height: `${markSize}px` }}>
      <span className={markCell}>
        <GoodIcon good={input.good} size={markSize} />
      </span>
      {input.qty > 1 && (
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

/** The hex's face: the cut edge, then the name / mark-or-formula / footer grid — centred at (x, y) in SVG user units. */
export function HexTileGroup({
  tile,
  x = 0,
  y = 0,
  widthIn = HEX_WIDTH_IN,
  heightIn = HEX_HEIGHT_IN
}: {
  tile: Tile
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
  const isPlainFace = tile.kind === "hub" || tile.kind === "barren"
  const inset = BORDER_DEPTH[tile.kind]
  const faceH = h - 2 * inset

  // A regular hex inset by a uniform distance is just a smaller one: its
  // flat-to-flat measure drops by twice that distance and the shape stays
  // similar, so one scale factor shifts the band's centreline on all six
  // edges at once.
  const bandScale = 1 - (2 * bandOffset(inset)) / h

  // Zone ceilings, each measured where its own content sits: the rules at the
  // strip boundaries, strip text against the face's own top and bottom, and
  // the middle against its own line height, where the hex is at its widest.
  const stripH =
    faceH * (FACE_ROWS.header / (FACE_ROWS.header + FACE_ROWS.middle + FACE_ROWS.footer))
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
      <foreignObject x={-w / 2} y={-h / 2} width={w} height={h}>
        <div
          className={face}
          style={{
            gridTemplateRows: `${FACE_ROWS.header}fr ${FACE_ROWS.middle}fr ${FACE_ROWS.footer}fr`,
            paddingBlock: `${inset}px`
          }}
        >
          {
            /* A plain-face tile's name sits in the middle instead, so its
              header strip rules empty — like a resource tile's footer does. */
          }
          <div className={headerZone} style={{ maxWidth: `${ruleW}px` }}>
            {!isPlainFace && (
            <span
              className={tileName}
              style={{
                // A converter's name is a footnote to its formula; a resource's
                // is the tile's whole identity.
                fontSize: `${tile.kind === "converter" ? m.subName : m.name}px`,
                maxWidth: `${stripTextW}px`
              }}
            >
              {tile.name}
            </span>
            )}
          </div>

          <div className={middleZone} style={{ maxWidth: `${middleW}px` }}>
            {tile.kind === "resource" && (
              <GoodIcon good={tile.produces} size={bigIconSize(w, h)} strokeWidth={1.6} />
            )}

            {tile.kind === "converter" && (() => {
              const markSize = formulaMarkSize(middleW, h, tile.recipe.inputs.length)
              return (
                <div className={formula} style={{ columnGap: `${markSize * TERM_GAP}px` }}>
                  {tile.recipe.inputs.map((input, i) => (
                    <GoodQty key={i} input={input} markSize={markSize} badgeScale={BADGE_SCALE.formula} />
                  ))}
                  <ArrowRight size={markSize * ARROW_SCALE} color="black" opacity={MARK_OPACITY} />
                  <GoodQty input={tile.recipe.output} markSize={markSize} badgeScale={BADGE_SCALE.formula} />
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
                    fontSize: `${m.plainName}px`,
                    maxWidth: `${plainNameW}px`,
                    opacity: tile.kind === "barren" ? BARREN_INK : 1
                  }}
                >
                  {tile.name}
                </span>
              )
            }
          </div>

          {
            /* Footer: the converter's build cost, and nothing else. A resource
              face deliberately says nothing about the converter on its back:
              the two faces are a choice made once, with the tile in hand and
              both sides visible, so the front has no one left to inform. */
          }
          <div
            className={footerZone}
            style={{ maxWidth: `${ruleW}px`, columnGap: `${m.footerMark * 0.35}px` }}
          >
            {
              /* A free tile shows nothing at all — not even the label. The
                strip still rules, so the tile keeps the set's shape. */
              tile.kind === "converter" && tile.cost.length > 0 && (
                <>
                  <span className={footerLabel} style={{ fontSize: `${m.footerLabel}px` }}>
                    Build
                  </span>
                  {tile.cost.map((c, i) => (
                    <GoodQty key={i} input={c} markSize={m.footerMark} badgeScale={BADGE_SCALE.footer} />
                  ))}
                </>
              )
            }
          </div>
        </div>
      </foreignObject>
    </g>
  )
}

/** One hex tile as its own standalone, true-size SVG — for the on-screen preview. */
export function HexTile({
  tile,
  widthIn = HEX_WIDTH_IN,
  heightIn = HEX_HEIGHT_IN
}: {
  tile: Tile
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
      <HexTileGroup tile={tile} x={w / 2} y={h / 2} widthIn={widthIn} heightIn={heightIn} />
    </svg>
  )
}

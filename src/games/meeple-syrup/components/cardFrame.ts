import { css } from "~/generated/styled-system/css"

/**
 * The vertical rhythm every card in this game is built on, in one place because
 * three components were each holding their own copy of it.
 *
 * A card is a stack of bands with an open region in the middle. The bands are a
 * fixed height and the middle takes whatever is left — never the other way
 * round. Sizing a band to its contents is what let the layabouts' rule band
 * drift a millimetre above every converter's, from nothing worse than a glyph
 * one step larger inside an `auto` row.
 *
 *     --band   one band: a label and its content
 *     --edge   a band plus the gutter it bleeds into, top and bottom
 *
 * Cards differ in how many bands they have, not in how tall a band is:
 *
 *     animal     edge · band · art · band · edge      5 bands, art 46u
 *     bag        edge ·······  numeral  ······ edge   3 bands, numeral 64u
 *
 * So an animal card and a resource card laid side by side share a header
 * height, a footer height, and every band boundary between them. The numeral
 * region works out at exactly the animal's art plus the two bands a bag card
 * does not have — 46 + 9 + 9 — which is what makes the two decks read as one
 * system rather than two that happen to share a trim.
 *
 * The remainder is identical at both variants, too. The bleed's extra 3u of
 * gutter lands on the two edge rows, top and bottom, and that is exactly the 6u
 * by which a bleed card is taller than a trim one.
 */

/**
 * The two render variants every card in the game has:
 *
 *   - "bleed": full-bleed 69x94mm. Gutter is 6u (bleed + trim->safe).
 *   - "trim":  trim-only 63x88mm with a hairline cut outline. Gutter is 3u
 *     (trim->safe). For the home N-up grid sheet, where cards touch and the
 *     shared outlines form the cut grid.
 */
export type CardVariant = "bleed" | "trim"

/**
 * Everything but the rows: the gutter columns and the two band tokens. Pair it
 * with one of the row templates below, which are kept separate rather than
 * folded in so that neither has to override the other.
 */
export const cardFrame = css({
  position: "relative",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "var(--gutter) 1fr var(--gutter)",
  "--band": "calc(9 * var(--u))",
  "--edge": "calc(var(--band) + var(--gutter))",
  overflow: "hidden"
})

/** Animal cards: name · hire · art · rule · order. */
export const fiveBandRows = css({
  gridTemplateRows: "var(--edge) var(--band) 1fr var(--band) var(--edge)"
})

/** Bag cards — resources and the pinecone: name · numeral · rider. */
export const threeBandRows = css({
  gridTemplateRows: "var(--edge) 1fr var(--edge)"
})

export const bleedFrame = css({
  width: "cardW",
  height: "cardH",
  "--gutter": "calc(6 * var(--u))"
})

export const trimFrame = css({
  width: "trimW",
  height: "trimH",
  "--gutter": "calc(3 * var(--u))"
})

// Hairline cut line on the trim boundary; `outline` doesn't affect layout, so
// adjacent cards' outlines coincide into a single shared cut line.
export const accentOutline = css({
  outlineWidth: "0.2mm",
  outlineStyle: "solid"
})

/**
 * Bands span every column so their colour goes wall to wall, and their content
 * lands in the middle column via subgrid so it lines up with the body.
 *
 * None of them carry block padding. The row is already exactly as tall as it
 * should be and centres what it holds; padding here would be height the frame
 * did not budget for, which is how bands drift apart.
 */
export const headerBand = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  // The gutter is the `--edge` row's surplus over `--band`, spent as padding so
  // the name centres in the same box every band below it centres in.
  paddingTop: "var(--gutter)"
})

export const headerContent = css({
  gridColumn: "2",
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "2",
  minWidth: 0
})

/** The right-hand chip: a resource's tier, an animal's output, a layabout's bonus. */
export const categoryText = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  opacity: 0.75,
  whiteSpace: "nowrap"
})

/** Any band below the header. The rule above it is what separates the stack. */
export const dataBand = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  borderBlockStartWidth: "0.3mm",
  borderBlockStartStyle: "solid"
})

/** The last band, which bleeds to the bottom edge as the header does to the top. */
export const footerBand = css({
  paddingBottom: "var(--gutter)"
})

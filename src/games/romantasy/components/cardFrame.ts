import { css } from "~/generated/styled-system/css"

/**
 * The frame every card in this game is built on, laid out like a playing card:
 * a corner index (number over suit) in the upper left, the name beside it, and
 * everything else left empty for art.
 *
 * The upper three quarters of the card tint with the card's colour and are reserved
 * for art. The bottom quarter is a white text zone for abilities and other text;
 * it is empty until there is text to put there.
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

export const cardFrame = css({
  position: "relative",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "var(--gutter) auto 1fr var(--gutter)",
  gridTemplateRows: "var(--gutter) auto 1fr var(--zone)",
  gridTemplateAreas: `
    ".    .     .    .   "
    ".    index name .   "
    ".    art   art  .   "
    "text text  text text"
  `,
  overflow: "hidden"
})

export const bleedFrame = css({
  width: "cardW",
  height: "cardH",
  "--gutter": "calc(6 * var(--u))",
  // A quarter of the trim height, plus the 3mm of bleed below the trim line.
  "--zone": "calc(88 * var(--u) / 4 + 3 * var(--u))"
})

export const trimFrame = css({
  width: "trimW",
  height: "trimH",
  "--gutter": "calc(3 * var(--u))",
  "--zone": "calc(88 * var(--u) / 4)"
})

// Hairline cut line on the trim boundary; `outline` doesn't affect layout, so
// adjacent cards' outlines coincide into a single shared cut line.
export const accentOutline = css({
  outlineWidth: "0.2mm",
  outlineStyle: "solid"
})

/** The white bottom quarter. Content sits inside the safe area. */
export const textZone = css({
  gridArea: "text",
  boxSizing: "border-box",
  padding: "var(--gutter)",
  background: "white"
})

/** One or more corner indices, side by side. */
export const indexArea = css({
  gridArea: "index",
  display: "flex",
  alignItems: "flex-start",
  gap: "3"
})

/** Name (and any mark) pinned to the upper right, opposite the index. */
export const nameBlock = css({
  gridArea: "name",
  justifySelf: "end",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "1",
  paddingInlineStart: "3",
  textAlign: "right"
})

export const nameText = css({
  fontSize: "paragraph",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  lineHeight: 1.15
})

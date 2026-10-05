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
  gridTemplateColumns: "var(--gutter) auto calc(3 * var(--u)) 1fr var(--gutter)",
  gridTemplateRows: "var(--gutter) auto 1fr var(--zone)",
  gridTemplateAreas: `
    ".    .     .   .    .   "
    ".    index .   name .   "
    ".    art   art art  .   "
    "text text  text text text"
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

/**
 * A white panel with a soft outline from the card's corner round the gutter and
 * the index, so the room left for art is visible. Only its right and bottom edges
 * draw; the negative margins give the index breathing room without moving the
 * grid tracks; the gap column does the same on the right.
 */
export const indexBox = css({
  gridArea: "1 / 1 / 3 / 4",
  marginBottom: "-3",
  borderRight: "0.25mm solid rgba(0, 0, 0, 0.18)",
  borderBottom: "0.25mm solid rgba(0, 0, 0, 0.18)",
  borderBottomRightRadius: "3",
  background: "white",
  pointerEvents: "none"
})

/**
 * The title panel: white, outlined on its left and bottom edges like `indexBox`,
 * running to the card's top and right edges. Its height is the same on every
 * card (gutter, 12mm name zone, and 3mm of breathing room) so it shows
 * the room a name has. The 0.25mm pull left makes its edge coincide with the
 * index box's instead of doubling the line.
 */
export const titleBox = css({
  gridArea: "1 / 4 / 3 / 6",
  alignSelf: "start",
  height: "calc(var(--gutter) + 15 * var(--u))",
  marginLeft: "-0.25mm",
  borderLeft: "0.25mm solid rgba(0, 0, 0, 0.18)",
  borderBottom: "0.25mm solid rgba(0, 0, 0, 0.18)",
  borderBottomLeftRadius: "3",
  background: "white",
  pointerEvents: "none"
})

/** Name (and any mark) pinned to the upper right, opposite the index, in a fixed 12mm zone. */
export const nameBlock = css({
  gridArea: "name",
  alignSelf: "start",
  justifySelf: "end",
  height: "12",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-end",
  gap: "1",
  paddingInlineStart: "3",
  textAlign: "right"
})

export const nameText = css({
  fontSize: "calc(3.2 * var(--u))",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  lineHeight: 1.15
})

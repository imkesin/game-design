import type { Card } from "~/games/numina/cards/domain"
import { type Band, DISASTER, POWER_PALETTE } from "~/games/numina/domain/CoreDefinitions"
import { css, cx } from "~/generated/styled-system/css"
import type { PlayerCount } from "~/shared/cards/playerCount"
import { Guides } from "~/shared/components/Guides"
import { darkBand, paperFrame, softBand, vividBand } from "~/shared/components/paperFrame"

/**
 * A Numina action card. Deliberately spare: the name at display size in a band
 * across the top, an open art area filling everything below it, and a footer band
 * carrying the player-count symbol. No cost rail, no rules text — each Action
 * recurs often enough that players learn what it does.
 *
 * Same two render variants as graft's Card:
 *
 *   - "bleed": full-bleed 69x94mm. Gutter is 6u (bleed + trim->safe).
 *   - "trim":  trim-only 63x88mm with a hairline cut outline. Gutter is 3u
 *     (trim->safe). For the home N-up grid sheet, where cards touch and the
 *     shared outlines form the cut grid.
 *
 * Layout is a CSS grid whose outer columns are gutter tracks (`--gutter`):
 *
 *     ┌────────┬──────────┬────────┐
 *     │  full-width name band      │   bleeds across all 3 columns
 *     ├────────┴──────────┴────────┤
 *     │        art  (1fr)          │   full bleed: art may run to the edges
 *     ├────────┬──────────┬────────┤
 *     │ gutter │  footer  │ gutter │
 *     └────────┴──────────┴────────┘
 *
 * The bands span every column so their colour goes wall-to-wall, but their
 * *content* sits in the middle column via `grid-template-columns: subgrid`, so it
 * lines up. The art row spans edge to edge with no inset at all — art is expected
 * to bleed, and the trim/safe lines are what constrain it (toggle `showGuides`).
 */
export type CardVariant = "bleed" | "trim"

const frame = css({
  position: "relative",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "var(--gutter) 1fr var(--gutter)",
  // name band (bleeds to top) · art (fills) · footer band (bleeds to bottom)
  gridTemplateRows: "auto 1fr auto",
  overflow: "hidden"
})

const bleedFrame = css({
  width: "cardW",
  height: "cardH",
  "--gutter": "calc(6 * var(--u))"
})

const trimFrame = css({
  width: "trimW",
  height: "trimH",
  "--gutter": "calc(3 * var(--u))"
})

// Hairline cut line on the trim boundary. `outline` doesn't affect layout, so
// adjacent cards' outlines coincide into a single shared cut line. `currentColor`
// is the surface's own ink, so it tracks the card's palette with no second map.
const accentOutline = css({
  outlineWidth: "0.2mm",
  outlineStyle: "solid",
  outlineColor: "currentColor"
})

// Full-width band: spans all columns so its colour bleeds to both edges. Top
// padding = gutter so the content starts at the safe line even though the band
// reaches the top edge. A horizontal subgrid relays the parent column tracks so
// the content can land in the middle column.
const header = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  paddingTop: "var(--gutter)",
  // Match the trimmed top inset (3u) so the name is centred within the band's
  // visible (post-cut) area in both variants.
  paddingBottom: "3"
})

const headerContent = css({
  gridColumn: "2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0
})

// The whole point of the face. `hero` is the largest step in the scale; the
// longest name ("Abundance"/"Ingenuity", 9 characters) still clears the 57mm safe
// column at this size with the tracking applied.
const nameText = css({
  fontSize: "hero",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  lineHeight: 1.05,
  textAlign: "center",
  minWidth: 0,
  whiteSpace: "nowrap"
})

// Diagonal hazard striping, laid over a band's own background. Uses a translucent
// white rather than a token so the same class reads correctly on any band colour.
const hazardStripes = css({
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0 calc(1.4 * var(--u)), transparent calc(1.4 * var(--u)) calc(2.8 * var(--u)))"
})

// Open art area. Full bleed (`1 / -1`, no padding) so a future illustration can
// run to the card's edges; `position: relative` anchors the image and the
// placeholder.
const artRegion = css({
  gridColumn: "1 / -1",
  position: "relative",
  minHeight: 0,
  overflow: "hidden"
})

const artImage = css({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover"
})

// Screen-only marker for the empty art area, shown with the print guides. Never
// printed: the sheet renders cards with guides off.
const artPlaceholder = css({
  position: "absolute",
  inset: "var(--gutter)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "0.3px dashed",
  borderColor: "currentColor",
  opacity: 0.3,
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase"
})

// Thin stripe mirroring the header: bleeds to the bottom edge, with
// paddingBottom = gutter dropping its content onto the safe line.
const footer = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  // Mirror of the header: paddingBottom = gutter puts content on the safe line;
  // paddingTop = 3 (the trimmed bottom inset) centres it in the visible stripe.
  paddingTop: "3",
  paddingBottom: "var(--gutter)"
})

const footerContent = css({
  gridColumn: "2",
  display: "flex",
  alignItems: "center",
  gap: "0"
})

// Small ring holding the player-count symbol. `currentColor` is the band's ink, so
// the ring contrasts with the band on both tones without a second colour map.
const playerPip = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "3",
  height: "3",
  borderRadius: "9999px",
  borderWidth: "0.2mm",
  borderStyle: "solid",
  borderColor: "currentColor",
  fontSize: "micro",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

// The paper surface is always the pale end of a card's scale; only the band
// weight varies. See `Band` in the domain for why each Power picks the one it does.
const BAND_RECIPE = {
  strong: darkBand,
  vivid: vividBand,
  soft: softBand
} as const satisfies Record<Band, unknown>

// One step brighter than a `strong` band's own `{color}.50` ink: pure white, so the
// name reads at full strength rather than as a tinted off-white. Only `strong`
// bands get it — `vivid` and `soft` bands are light, so their ink must stay dark.
const brightInk = css({ color: "white" })

/** A card's palette: its Panda colour scale plus its band weight. */
function paletteOf(card: Card) {
  return card.kind === "action" ? POWER_PALETTE[card.power] : DISASTER
}

export function Card({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: Card
  variant?: CardVariant
  showGuides?: boolean
}) {
  const { color, band: weight } = paletteOf(card)
  const band = cx(
    BAND_RECIPE[weight]({ color }),
    weight === "strong" && brightInk,
    card.kind === "disaster" && hazardStripes
  )

  return (
    <div
      className={cx(
        frame,
        paperFrame({ color }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline
      )}
    >
      <div className={cx(header, band)}>
        <div className={headerContent}>
          <span className={nameText}>{card.name}</span>
        </div>
      </div>
      <div className={artRegion}>
        {card.art !== undefined
          ? <img className={artImage} src={card.art} alt="" />
          : showGuides && <span className={artPlaceholder}>Art</span>}
      </div>
      <Footer minPlayerCount={card.minPlayerCount} band={band} />
      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

function Footer({ minPlayerCount, band }: { minPlayerCount: PlayerCount; band: string }) {
  return (
    <div className={cx(footer, band)}>
      <div className={footerContent}>
        <span className={playerPip}>{minPlayerCount}</span>
      </div>
    </div>
  )
}

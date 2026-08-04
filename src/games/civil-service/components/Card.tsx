import { Cog, Flag, HandCoins, Scale, Signature } from "lucide-react"
import type { CSSProperties } from "react"
import type { Card } from "~/games/civil-service/cards/domain"
import {
  type Band,
  LEGACY_PALETTE,
  OFFICER_PALETTE,
  OFFICER_SUIT_NAMES,
  type OfficerSuitId
} from "~/games/civil-service/domain/CoreDefinitions"
import { css, cx } from "~/generated/styled-system/css"
import type { PlayerCount } from "~/shared/cards/playerCount"
import { Guides } from "~/shared/components/Guides"
import {
  artTint,
  darkBand,
  paperFrame,
  paperShade,
  softBand,
  softRail,
  strongRail,
  vividBand,
  vividRail
} from "~/shared/components/paperFrame"

/**
 * A Civil Service card: the name at display size in a band across the top, an
 * art area, a text band carrying the card's own power (Officer) or condition
 * (Legacy), and a footer band carrying the player-count symbol.
 *
 * For an Officer, the header band shows its suit (all 9 cards in a suit share
 * it), not `card.name` — `name` is the card's own epithet (e.g.
 * "Charismatic"), which instead leads its power text in bold.
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
 *     │        art  (3fr)          │   full bleed: art may run to the edges
 *     ├────────┬──────────┬────────┤
 *     │ gutter │ text (2fr)│ gutter│   power/condition prose, safe-area only
 *     ├────────┼──────────┼────────┤
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
  // name band (bleeds to top) · art (3fr) · text (2fr) · footer band (bleeds to bottom)
  gridTemplateRows: "auto 3fr 2fr auto",
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

// Hairline cut line on the trim boundary, rendered as an absolutely-positioned
// overlay rather than `border`/`outline` so it never affects layout: adjacent
// cards' overlays land on the exact same pixels and coincide into a single
// shared cut line. Dashes alternate black/white along each edge so the guide
// stays visible against any card surface regardless of how light or dark it
// is — the corners come out square rather than following the card's rounded
// radius, since CSS has no way to phase-shift a background pattern around a
// curve the way an SVG stroke can.
const CUT_DASH_MM = 1
const CUT_LINE_MM = 0.2
const cutLineH = `repeating-linear-gradient(to right, #000 0 ${CUT_DASH_MM}mm, #fff ${CUT_DASH_MM}mm ${
  CUT_DASH_MM * 2
}mm)`
const cutLineV = `repeating-linear-gradient(to bottom, #000 0 ${CUT_DASH_MM}mm, #fff ${CUT_DASH_MM}mm ${
  CUT_DASH_MM * 2
}mm)`

const cutLineStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: `${cutLineH}, ${cutLineH}, ${cutLineV}, ${cutLineV}`,
  backgroundPosition: "top left, bottom left, top left, top right",
  backgroundSize: `${CUT_DASH_MM * 2}mm ${CUT_LINE_MM}mm, ${CUT_DASH_MM * 2}mm ${CUT_LINE_MM}mm, ` +
    `${CUT_LINE_MM}mm ${CUT_DASH_MM * 2}mm, ${CUT_LINE_MM}mm ${CUT_DASH_MM * 2}mm`,
  backgroundRepeat: "repeat-x, repeat-x, repeat-y, repeat-y"
}

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

// Officer/Legacy names run longer than the old single-word Powers ("Tax
// Collector 9" vs. "Abundance"), so this uses `name` rather than `hero` — the
// display size the old spare Action cards could afford is too wide for the
// 57mm safe column here. `ellipsis` is a safety net for whatever the real 36
// names turn out to be, not the expected case.
const nameText = css({
  fontSize: "name",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  lineHeight: 1.05,
  textAlign: "center",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
})

// Open art area. Full bleed (`1 / -1`, no padding) so a future illustration can
// run to the card's edges; `position: relative` anchors the mark and the
// placeholder.
const artRegion = css({
  gridColumn: "1 / -1",
  position: "relative",
  minHeight: 0,
  overflow: "hidden"
})

/**
 * The art itself: an inlined SVG scaled to the region, taking the card's tint through
 * `fill="currentColor"` (see assets/cardArt).
 *
 * `fill` on the root `<svg>` is the other half of that: SVG inherits `fill`, so it is
 * what colours a file that names no fill of its own — which would otherwise fall back
 * to the SVG default of black and be the one export the rewrite cannot reach. A shape
 * that explicitly says `fill="none"` still overrides it and stays unfilled.
 *
 * `inset: var(--gutter)` holds it inside the safe area rather than letting it bleed.
 * Art here is a mark rather than a full-bleed illustration, and the safe area is the
 * one box nothing else claims: the bands stop at it, so the mark can never crowd
 * the name.
 *
 * With no `preserveAspectRatio` of its own an SVG defaults to `xMidYMid meet`, so the
 * mark is centred and scaled to fit whole. Nothing is cropped — which is what a mark
 * needs, and why the region's own aspect ratio is not something the art has to match.
 */
const artMark = css({
  position: "absolute",
  inset: "var(--gutter)",
  "& svg": {
    display: "block",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    fill: "currentColor"
  }
})

// Until a suit has real illustrated art dropped into assets/cardArt, its Lucide
// mark stands in for it — same box model as `artMark`, same `artTint` colour, so
// swapping in a real illustration later is a drop-in with no layout change.
const artIcon = css({
  position: "absolute",
  inset: "var(--gutter)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
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

/**
 * The power/condition text band: an Officer's power or a Legacy's condition,
 * set in the safe column beneath the art. Unlike the art region this never
 * bleeds — it's prose, so it stays clear of the trim on every edge.
 *
 * `gridTemplateColumns: subgrid` relays the parent's gutter tracks, same
 * mechanism as `header`/`footer`, so the text lines up with the name above it.
 * The divider's colour comes from `DIVIDER_RECIPE` (see below) rather than
 * `currentColor`, since `border-color` isn't inherited from the frame's own
 * `paperFrame` styling.
 */
const textRegion = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignContent: "start",
  minHeight: 0,
  overflow: "hidden",
  borderTopWidth: "0.3mm",
  borderTopStyle: "solid"
})

const textRegionContent = css({
  gridColumn: "2",
  minWidth: 0,
  paddingBlock: "2",
  fontSize: "paragraph",
  lineHeight: 1.35,
  whiteSpace: "pre-line"
})

// An Officer's epithet, on its own line above its power text — the header
// carries the suit instead (see OFFICER_SUIT_NAMES), so this is the one place
// the card's own name reads.
const epithetText = css({
  display: "block",
  fontSize: "body",
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: "1"
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
// weight varies. See `Band` in the domain for why each suit picks the one it does.
const BAND_RECIPE = {
  strong: darkBand,
  vivid: vividBand,
  soft: softBand
} as const satisfies Record<Band, unknown>

// The text region's divider, keyed by the same band weight so it always lands
// one step darker than that card's band — the same recipe a permanent's rail
// once used.
const DIVIDER_RECIPE = {
  strong: strongRail,
  vivid: vividRail,
  soft: softRail
} as const satisfies Record<Band, unknown>

// One step brighter than a `strong` band's own `{color}.50` ink: pure white, so the
// name reads at full strength rather than as a tinted off-white. Only `strong`
// bands get it — `vivid` and `soft` bands are light, so their ink must stay dark.
const brightInk = css({ color: "white" })

// Officer text sits on plain white rather than the card's paper tint, so the
// power text reads at full contrast regardless of suit. Legacy cards keep the
// tinted paper showing through.
const whiteTextRegion = css({ background: "white" })

/** A card's palette: its Panda colour scale plus its band weight. */
function paletteOf(card: Card) {
  return card.kind === "officer" ? OFFICER_PALETTE[card.suit] : LEGACY_PALETTE
}

// Suit -> its Lucide mark, shown in the art region until the suit has real
// illustrated art (see assets/cardArt).
const OFFICER_SUIT_ICONS: Record<OfficerSuitId, typeof HandCoins> = {
  steward: HandCoins,
  magistrate: Scale,
  engineer: Cog,
  scribe: Signature
}

// Legacy cards have no suits — all 36 share this one mark until they get
// individual art.
const LEGACY_ICON = Flag

function iconOf(card: Card) {
  return card.kind === "officer" ? OFFICER_SUIT_ICONS[card.suit] : LEGACY_ICON
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
  const band = cx(BAND_RECIPE[weight]({ color }), weight === "strong" && brightInk)
  const Icon = iconOf(card)

  return (
    <div
      className={cx(
        frame,
        paperFrame({ color }),
        variant === "bleed" ? bleedFrame : trimFrame
      )}
    >
      <div className={cx(header, band)}>
        <div className={headerContent}>
          <span className={nameText}>{card.kind === "officer" ? OFFICER_SUIT_NAMES[card.suit] : card.name}</span>
        </div>
      </div>
      <div className={cx(artRegion, card.kind === "legacy" && paperShade({ color }))}>
        {card.art !== undefined
          ? (
            // The markup is our own asset, read off disk at build time (see
            // assets/cardArt) — never user input.
            <div
              className={cx(artMark, artTint({ color }))}
              dangerouslySetInnerHTML={{ __html: card.art }}
            />
          )
          : Icon !== undefined
          ? (
            <div className={cx(artIcon, artTint({ color }))}>
              <Icon size="55%" strokeWidth={1.5} />
            </div>
          )
          : showGuides && <span className={artPlaceholder}>Art</span>}
      </div>
      <div
        className={cx(
          textRegion,
          DIVIDER_RECIPE[weight]({ color }),
          card.kind === "officer" && whiteTextRegion
        )}
      >
        <div className={textRegionContent}>
          {card.kind === "officer"
            ? (
              <>
                <span className={epithetText}>{card.name}</span>
                {card.power}
              </>
            )
            : card.condition}
        </div>
      </div>
      <Footer minPlayerCount={card.minPlayerCount} band={band} />
      {variant === "trim" && <div style={cutLineStyle} />}
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

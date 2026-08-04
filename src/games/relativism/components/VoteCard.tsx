import { CirclePlus, OctagonX } from "lucide-react"
import type { VoteCard as VoteCardData } from "~/games/relativism/cards/domain"
import { css, cva, cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"

/**
 * A Yes/No ballot card. The label sits in a banner top and bottom — the
 * bottom banner's text rotated 180° — so however the card lands in someone's
 * hand, one banner always reads right-side up. That leaves the centre for a
 * single icon: a shape rotationally symmetric enough (a circle, an octagon)
 * to read the same whichever way is up, the way a stop sign does.
 *
 * Yes is dark green, No dark red — purely an on-screen distinction (the print
 * target is B&W, where both simply go dark ink on white paper).
 *
 * Same two render variants as `StatementCard` — see there for the bleed/trim
 * geometry this mirrors.
 */
export type CardVariant = "bleed" | "trim"

type VoteIcon = typeof CirclePlus

// Circle vs. octagon mirrors road-sign grammar (mandatory/proceed vs. stop) —
// both shapes read the same from either end of the card.
const ICONS: Record<VoteCardData["label"], VoteIcon> = {
  Yes: CirclePlus,
  No: OctagonX
}

const frame = css({
  position: "relative",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "var(--gutter) 1fr var(--gutter)",
  // top banner (bleeds to top) · icon (fills) · bottom banner (bleeds to bottom)
  gridTemplateRows: "auto 1fr auto",
  background: "white",
  overflow: "hidden"
})

// The card's ink, keyed by its own label rather than a generic "color" prop —
// Yes and No are the only two cards this component ever renders, so there is
// no third value to design a general-purpose palette seam for.
const cardInk = cva({
  variants: {
    label: {
      Yes: { color: "green.950" },
      No: { color: "red.950" }
    }
  }
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

// Hairline cut line on the trim boundary; `outline` doesn't affect layout, so
// adjacent cards' outlines coincide into a single shared cut line.
const accentOutline = cva({
  base: { outlineWidth: "0.2mm", outlineStyle: "solid" },
  variants: {
    label: {
      Yes: { outlineColor: "green.950" },
      No: { outlineColor: "red.950" }
    }
  }
})

// Full-width band: spans all columns so its colour bleeds to both edges. A
// subgrid relays the parent's column tracks so the label lands in the safe
// middle column.
const banner = cva({
  base: {
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: "subgrid",
    color: "white"
  },
  variants: {
    label: {
      Yes: { background: "green.950" },
      No: { background: "red.950" }
    }
  }
})

const bannerTop = css({
  paddingTop: "var(--gutter)",
  paddingBottom: "3"
})

const bannerBottom = css({
  paddingTop: "3",
  paddingBottom: "var(--gutter)"
})

const bannerContent = css({
  gridColumn: "2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

const labelText = css({
  fontSize: "calc(7 * var(--u))",
  fontFamily: "\"Arial Black\", \"Helvetica Neue\", Arial, sans-serif",
  fontWeight: 900,
  letterSpacing: "0.02em",
  textTransform: "uppercase"
})

// The bottom banner's own copy of the label, rotated so it reads right-side
// up once the card is turned around.
const flipped = css({ transform: "rotate(180deg)" })

const iconArea = css({
  gridColumn: "1 / -1",
  gridRow: "2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

const iconStyle = css({
  width: "calc(30 * var(--u))",
  height: "calc(30 * var(--u))"
})

export function VoteCard({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: VoteCardData
  variant?: CardVariant
  showGuides?: boolean
}) {
  const Icon = ICONS[card.label]
  return (
    <div
      className={cx(
        frame,
        cardInk({ label: card.label }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline({ label: card.label })
      )}
    >
      <div className={cx(banner({ label: card.label }), bannerTop)}>
        <div className={bannerContent}>
          <span className={labelText}>{card.label}</span>
        </div>
      </div>
      <div className={iconArea}>
        <Icon className={iconStyle} strokeWidth={2} />
      </div>
      <div className={cx(banner({ label: card.label }), bannerBottom)}>
        <div className={bannerContent}>
          <span className={cx(labelText, flipped)}>{card.label}</span>
        </div>
      </div>
      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

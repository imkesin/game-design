import type { CSSProperties } from "react"
import { css } from "~/generated/styled-system/css"
import {
  BOX,
  HUB,
  HUB_STROKE,
  RIM,
  RIM_STROKE,
  RING_PATH,
  SPACE_CENTERS,
  SPACE_LABELS,
  SPOKE_STROKE,
  SPOKES,
  ZONE
} from "./rondelLayout.ts"

/**
 * The action wheel, printed into the board's bottom-right zone.
 *
 * Two layers, deliberately: an SVG draws the skeleton — hub, rim, spokes — and
 * ordinary HTML boxes sit on top of it, one centred in each space. Drawing the
 * labels inside the SVG would mean laying out text by hand, and would shut the
 * spaces out of the components the rest of the board is built from; a space that
 * later needs a coin wants `GoldCost`, not a hand-placed `<tspan>`.
 *
 * The reverse split — wedges as rotated, clipped divs — was the other option and
 * is worse on both counts: no crisp stroke where two wedges meet, and the labels
 * rotate with the wedge they sit in.
 *
 * The ring carries the white, not the zone. The map is drawn underneath and the
 * sheet's other panels mask it with an opaque square; masking with the ring
 * instead means the spokes and labels are still read against paper, while the
 * square's corners and the hub both go back to being map. The zone stays
 * reserved in the grid regardless — that is what keeps terrain from being
 * painted where the wheel lands.
 *
 * Geometry comes from `rondelLayout` in millimetres and is emitted as percentages,
 * so the wheel stays self-similar if it is ever shown at anything other than the
 * 1:1 it prints at. Type is set in millimetres, as the payoff table's is, which
 * is exact on the printed sheet — the only size that has to be right.
 */

const pct = (mm: number) => `${(mm / ZONE) * 100}%`

const zone = css({
  position: "relative",
  boxSizing: "border-box",
  fontFamily: "system-ui, -apple-system, sans-serif",
  color: "#000"
})

const wheel = css({ position: "absolute", inset: 0, width: "100%", height: "100%" })

/**
 * Upright and centred, and sized by `BOX` — the one square that fits a space at
 * any rotation. Text can wrap inside it; nothing needs per-space tuning.
 */
const space = css({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transform: "translate(-50%, -50%)",
  textAlign: "center",
  fontSize: "3.8mm",
  letterSpacing: "0.1em",
  lineHeight: 1.2
})

export function Rondel({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={className === undefined ? zone : `${zone} ${className}`} style={style}>
      <svg className={wheel} viewBox={`0 0 ${ZONE} ${ZONE}`} aria-hidden>
        <g stroke="#000" strokeLinecap="round">
          {/* First, and the wheel's only fill — see the masking note above. */}
          <path d={RING_PATH} fill="#fff" fillRule="evenodd" stroke="none" />
          <circle cx={ZONE / 2} cy={ZONE / 2} r={RIM} fill="none" strokeWidth={RIM_STROKE} />
          <circle cx={ZONE / 2} cy={ZONE / 2} r={HUB} fill="none" strokeWidth={HUB_STROKE} />
          {SPOKES.map(({ from, to }) => (
            <line
              key={`${from.x},${from.y}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              strokeWidth={SPOKE_STROKE}
            />
          ))}
        </g>
      </svg>

      {SPACE_LABELS.map((label, index) => {
        // Counts are checked where the labels are authored.
        const center = SPACE_CENTERS[index]!
        return (
          <div
            key={label}
            className={space}
            style={{
              left: pct(center.x),
              top: pct(center.y),
              width: pct(BOX),
              height: pct(BOX)
            }}
          >
            {label}
          </div>
        )
      })}
    </div>
  )
}

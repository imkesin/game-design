import { css } from "~/generated/styled-system/css"

/**
 * A rung on a trade track: the disc the rate marker sits in, printed once per
 * level. Always empty — where the marker *starts* is carried by the shading on
 * the starting rung, not by a filled disc.
 *
 * Sized in raw millimetres rather than `--u` card units, following
 * `CardOutline`: this is the footprint of a physical token, so it has to hold
 * its real size on any sheet regardless of what that sheet sets `--u` to.
 *
 * Drawn as inline SVG so it stays print-crisp. The rim is specified in
 * millimetres too and converted into viewBox units, so it stays a hairline
 * instead of scaling up with the disc.
 */

/** Token footprint. Comfortably clears a rung at the board's current geometry. */
export const RATE_SLOT_MM = 16

const RIM_MM = 0.4
const VIEWBOX = 10

const slot = css({ display: "block", flexShrink: 0 })

export function RateSlot({ diameterMm = RATE_SLOT_MM }: { diameterMm?: number }) {
  const rim = (RIM_MM * VIEWBOX) / diameterMm
  const r = VIEWBOX / 2 - rim / 2
  return (
    <svg
      className={slot}
      style={{ width: `${diameterMm}mm`, height: `${diameterMm}mm` }}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      role="img"
      aria-label="rate slot"
    >
      <circle
        cx={VIEWBOX / 2}
        cy={VIEWBOX / 2}
        r={r}
        fill="white"
        stroke="var(--colors-stone-400)"
        strokeWidth={rim}
      />
    </svg>
  )
}

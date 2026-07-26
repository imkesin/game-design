import type { FruitColor } from "~/games/graft/domain/CoreDefinitions"
import { css } from "~/generated/styled-system/css"
import { token } from "~/generated/styled-system/tokens"

/**
 * A market demand slot a fruit crate drops into: a 12x12 card-unit square with a
 * stone rim and white fill, optionally tinted for a fruit and stamped with a
 * large, faint capital initial.
 *
 * Both cues are deliberately redundant: the tint identifies the fruit in colour,
 * and the letter survives a black-and-white print (where the faint tint washes
 * out) — the intended playtest medium. Both stay pale enough that a physical
 * token placed in the slot still reads clearly on top.
 *
 * An optional `badge` (e.g. "3+") replaces the letter with a player-count
 * threshold — marking a stacked crate that only comes into play at higher
 * counts, so one board serves every count. It reuses the faint ink, just a
 * smaller font to fit the two glyphs.
 *
 * Drawn as inline SVG so it stays print-crisp and scales with `--u`; the tint
 * and ink resolve at render time via `token()`, so any FruitColor works without
 * a per-colour style variant.
 */

// Geometry in the 0..12 viewBox (1 unit = 1mm at print).
const STROKE = 0.4 // rim, matching the plain token slot
const INSET = STROKE / 2
const RADIUS = 1 // slight crate rounding
const FONT = 7.5 // large initial, kept faint by colour rather than size

const slot = css({ display: "block", width: "12", height: "12" })

export function FruitCrateSlot(
  {
    color,
    letter,
    badge,
    size,
    fill,
    ink,
    rim,
    className
  }: {
    color?: FruitColor
    letter?: string
    /** Replaces `letter` with a player-count threshold (e.g. "3+"), in a smaller font. */
    badge?: string
    size?: number
    /** Override the crate fill (any CSS colour); defaults to the fruit tint / white. */
    fill?: string
    /** Override the stamped-letter colour; defaults to the fruit tint / faint stone. */
    ink?: string
    /** Override the rim colour (any CSS colour); defaults to faint stone. */
    rim?: string
    className?: string
  }
) {
  const stamp = badge ?? letter
  const fillColor = fill ?? (color ? token(`colors.${color}.100`) : "white")
  const inkColor = ink ?? (color ? token(`colors.${color}.400`) : token("colors.stone.400"))
  // `size` (in card units) overrides the default 12u square via inline style,
  // which reliably wins over the `slot` class regardless of stylesheet order.
  const sizeStyle = size ? { width: `calc(${size} * var(--u))`, height: `calc(${size} * var(--u))` } : undefined
  return (
    <svg
      className={className ? `${slot} ${className}` : slot}
      style={sizeStyle}
      viewBox="0 0 12 12"
      role="img"
      aria-label={badge ? `crate slot (${badge} players)` : letter ? `${letter} crate slot` : "crate slot"}
    >
      <rect
        x={INSET}
        y={INSET}
        width={12 - STROKE}
        height={12 - STROKE}
        rx={RADIUS}
        ry={RADIUS}
        fill={fillColor}
        stroke={rim ?? "var(--colors-stone-400)"}
        strokeWidth={STROKE}
      />
      {stamp && (
        <text
          x={6}
          y={6}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={badge ? 5 : FONT}
          fontWeight={700}
          fill={inkColor}
        >
          {stamp}
        </text>
      )}
    </svg>
  )
}

import type { ResourceId, Wild } from "~/games/fated/cards/domain"
import { suit } from "~/games/fated/components/resourceMarks"
import { css } from "~/generated/styled-system/css"

/**
 * A playing-card corner index: 12mm wide by 24mm tall. The number is centred in the top
 * 12mm square and the resource, as its suit, is a 12mm square directly beneath it.
 * Tinted with the resource's own ink so a fanned hand reads as colour before it
 * reads as text.
 *
 * `text-box` trims the number's line box to the digits' own height, so the
 * 12mm box hugs the glyphs instead of carrying the font's leading. The font
 * size gives digits about 10mm tall in the default sans, leaving margin in the box.
 */

const index = css({
  width: "12",
  display: "flex",
  flexDirection: "column"
})

const value = css({
  height: "12",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "calc(14 * var(--u))",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  textBox: "trim-both cap alphabetic"
})

/** A resource's mark in its own ink: the suit of a corner index, `size` mm square. */
export function SuitMark({ resource, size = 12 }: { resource: ResourceId | Wild; size?: number }) {
  const { ink, name, Mark } = suit(resource)
  return (
    <span style={{ display: "flex", color: ink }} title={name}>
      <Mark size={`calc(${size} * var(--u))`} strokeWidth={2} />
    </span>
  )
}

export function CornerIndex({ value: number, resource }: { value: number; resource: ResourceId | Wild }) {
  return (
    <span className={index}>
      <span className={value} style={{ color: suit(resource).ink }}>
        {number}
      </span>
      <SuitMark resource={resource} />
    </span>
  )
}

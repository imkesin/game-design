import { FruitCrateIcon } from "~/games/graft/components/icons/FruitCrateIcon"
import type { CrateTone } from "~/games/graft/components/icons/FruitCrateIcon"
import { css } from "~/generated/styled-system/css"

/**
 * A crate requirement composed from FruitCrateIcon: a grey cube stamped with the
 * variable it refers to, with its quantity in a small badge pinned to the cube's
 * top-right corner — e.g. a cube marked "α" wearing a "4". The atom of a Foreign
 * Market recipe; several of these (joined by `+`) make up a quest row.
 */

const crate = css({ position: "relative", display: "inline-block", lineHeight: 0 })

// Count badge pinned to the cube's top-right, overhanging the corner so it reads
// as a label on the box rather than part of the stack. White fill + dark ring so
// it stays legible in black-and-white print regardless of the cube's tone.
const badge = css({
  position: "absolute",
  top: "calc(-1.9 * var(--u))",
  right: "calc(-1.4 * var(--u))",
  minWidth: "calc(5.5 * var(--u))",
  height: "calc(5.5 * var(--u))",
  paddingInline: "calc(1 * var(--u))",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  border: "0.3mm solid",
  borderColor: "stone.700",
  backgroundColor: "white",
  color: "stone.800",
  fontSize: "calc(3.6 * var(--u))",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

export function CrateCount(
  { qty, variable, size, color, tone }: {
    qty: number
    variable: string
    size?: number
    color?: string | undefined
    tone?: CrateTone | undefined
  }
) {
  return (
    <span className={crate}>
      <FruitCrateIcon
        letter={variable}
        {...(size !== undefined && { size })}
        {...(color !== undefined && { color })}
        {...(tone !== undefined && { tone })}
      />
      <span className={badge}>{qty}</span>
    </span>
  )
}

import type { Animal } from "~/games/tigers-path/domain"
import { css } from "~/generated/styled-system/css"

/**
 * An animal as a filled disc carrying its initial — the game's atomic glyph,
 * used anywhere a rule or sheet names an animal type. The disc is the animal's
 * mid-scale colour with paper ink, so all five read at the same weight and the
 * initial stays legible on every hue (the light scales' `.400` rung washes the
 * letter out; `.500` holds it).
 */
const dot = css({
  display: "inline-grid",
  placeItems: "center",
  borderRadius: "9999px",
  borderStyle: "solid",
  fontWeight: 700,
  lineHeight: 1,
  flex: "none"
})

export function AnimalDot({ animal, size = 0.28 }: { animal: Animal; size?: number }) {
  return (
    <span
      className={dot}
      style={{
        width: `${size}in`,
        height: `${size}in`,
        fontSize: `${size * 0.5}in`,
        borderWidth: `${size * 0.05}in`,
        background: `var(--colors-${animal.color}-500)`,
        borderColor: `var(--colors-${animal.color}-700)`,
        color: `var(--colors-${animal.color}-50)`
      }}
    >
      {animal.name[0]}
    </span>
  )
}

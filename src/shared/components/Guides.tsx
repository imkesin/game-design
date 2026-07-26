import { css } from "~/generated/styled-system/css"

/**
 * Dev-only print guides, overlaid on the full-bleed card surface.
 *
 *   - trim line: where the card is physically cut (3mm in from the bleed edge),
 *     drawn with the real corner radius.
 *   - safe line: keep important content inside this (a further 3mm in).
 *
 * Purely visual; never part of the printed output.
 */
const line = css({
  position: "absolute",
  pointerEvents: "none"
})

const trim = css({
  borderRadius: "card",
  border: "0.3px dashed",
  borderColor: "rgba(0, 120, 255, 0.9)"
})

const safe = css({
  border: "0.3px dashed",
  borderColor: "rgba(255, 60, 60, 0.85)"
})

export function Guides() {
  return (
    <>
      <div className={`${line} ${trim}`} style={{ inset: "calc(3 * var(--u))" }} />
      <div className={`${line} ${safe}`} style={{ inset: "calc(6 * var(--u))" }} />
    </>
  )
}

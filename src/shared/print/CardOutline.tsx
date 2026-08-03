import { css } from "~/generated/styled-system/css"
import { CARD_TRIM_H_MM, CARD_TRIM_W_MM } from "./cardSize"

/**
 * A dashed placeholder at card trim size: the footprint of a physical card that
 * gets laid on the printed board, as opposed to a card printed there.
 *
 * Sized from the raw millimetre constants rather than the `trimW`/`trimH`
 * tokens, so it holds its real size on any sheet. Those tokens resolve through
 * `--u`, which a board page is free to set differently.
 */
const outline = css({
  flexShrink: 0,
  border: "0.3mm dashed",
  borderColor: "stone.400",
  borderRadius: "card",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: "stone.400",
  fontSize: "micro"
})

export function CardOutline({ label }: { label?: string }) {
  return (
    <div
      className={outline}
      style={{ width: `${CARD_TRIM_W_MM}mm`, height: `${CARD_TRIM_H_MM}mm` }}
    >
      {label}
    </div>
  )
}

import { css } from "~/generated/styled-system/css"

/**
 * The numeric value label beside a board track's slot (e.g. MarketStall's demand
 * track). Deliberately neutral (stone/white) so it reads clearly against any
 * track's color. The physical slots themselves live as dedicated components:
 * the game-agnostic ones under `~/shared/components/slots` (WorkerSlot,
 * ClaimSlot), and game-specific ones under their game (e.g. FruitCrateSlot in
 * `~/games/graft/components/slots`).
 */
export const value = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
  fontSize: "body",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums"
})

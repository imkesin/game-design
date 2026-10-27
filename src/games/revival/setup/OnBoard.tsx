import { css } from "~/generated/styled-system/css"
import { mm } from "../blocks/mm.ts"
import { COLORS } from "../colors.ts"
import { Tile } from "../tiles/Tile.tsx"
import { STICKER, TILE } from "../tiles/tiles.ts"
import type { Placed } from "./deal.ts"

/** Pieces as they'd sit on the board, true size: a sticker on its MDF tile, the mayor. */

/** An MDF tile's raw edge, showing round its sticker (whose unprinted inset is white). */
const MDF = "#b9946a"
const MAYOR = 16

const stack = css({ display: "grid", gridTemplateAreas: `"stack"`, "& > *": { gridArea: "stack" } })

const shadow = "0 0.3mm 0.8mm rgba(0, 0, 0, 0.35)"

export function OnBoard({ face }: Placed) {
  return (
    <div
      className={stack}
      style={{ width: mm(TILE), height: mm(TILE), background: MDF, borderRadius: mm(0.6), boxShadow: shadow }}
    >
      <div style={{ placeSelf: "center", display: "grid", background: "white" }}>
        <Tile face={face} size={STICKER} unit="var(--u)" />
      </div>
    </div>
  )
}

/** The mayor's pawn, seen from above. */
export function Mayor() {
  return (
    <div
      style={{
        width: mm(MAYOR),
        height: mm(MAYOR),
        borderRadius: "50%",
        background: COLORS.civic,
        boxShadow: `inset 0 0 0 ${mm(0.6)} ${COLORS.civicInk}, ${shadow}`
      }}
    />
  )
}

import { css } from "~/generated/styled-system/css"
import { COLORS, split } from "../colors.ts"
import { ICON } from "../icons.ts"
import type { TileFace } from "./tiles.ts"

/**
 * One 30mm tile face. The color sits inset from the cut line, so a slightly
 * off cut lands in white. Blight
 * and historical tiles are split diagonally (black or burgundy, and the
 * type's color); a tile a player pays to cone (a row tile, or a blight to
 * restore) has its cost on a coin in the top-right corner.
 */

export const TILE = 30
const INSET = 0.8

const tile = css({
  display: "grid",
  gridTemplateAreas: `"tile"`,
  boxSizing: "border-box",
  background: "white",
  printColorAdjust: "exact",
  "& > *": { gridArea: "tile" }
})

const art = css({ display: "grid", placeItems: "center", borderRadius: "1mm", color: "white" })

const coin = css({
  placeSelf: "start end",
  display: "grid",
  placeItems: "center",
  width: "6mm",
  height: "6mm",
  margin: "1mm",
  borderRadius: "50%",
  boxSizing: "border-box",
  border: "0.4mm solid rgba(0, 0, 0, 0.2)",
  color: "white",
  fontSize: "3.6mm",
  fontWeight: 700,
  lineHeight: 1
})

const fill = ({ kind, blight, historical }: TileFace) =>
  blight === true
    ? split(COLORS.blight, COLORS[kind])
    : historical === true
    ? split(COLORS.historical, COLORS[kind])
    : COLORS[kind]

export function Tile({ face }: { face: TileFace | undefined }) {
  const style = { width: `${TILE}mm`, height: `${TILE}mm`, padding: `${INSET}mm` }
  if (face === undefined) return <div className={tile} style={style} />
  const Icon = ICON[face.kind]
  return (
    <div className={tile} style={style}>
      <div className={art} style={{ background: fill(face) }}>
        <Icon size="14mm" strokeWidth={1.75} />
      </div>
      {face.cost !== undefined && <span className={coin} style={{ background: COLORS.coin }}>{face.cost}</span>}
    </div>
  )
}

import { css } from "~/generated/styled-system/css"
import { COLORS, split } from "../colors.ts"
import { ICON } from "../icons.ts"
import { STICKER, type TileFace } from "./tiles.ts"

/**
 * One tile face, as a `STICKER`. The color sits inset from the cut line, and
 * the inset is left unprinted, so a slightly off cut lands in it. Blight
 * and historical tiles are split diagonally (black or burgundy, and the
 * type's color); a tile a player pays to cone (a row tile, or a blight to
 * restore) has its cost on a coin in the top-right corner. `size` draws it
 * scaled, e.g. on a reference card.
 */

const INSET = 1

const tile = css({
  display: "grid",
  gridTemplateAreas: `"tile"`,
  boxSizing: "border-box",
  printColorAdjust: "exact",
  "& > *": { gridArea: "tile" }
})

const art = css({ display: "grid", placeItems: "center", color: "white" })

const coin = css({
  placeSelf: "start end",
  display: "grid",
  placeItems: "center",
  borderRadius: "50%",
  boxSizing: "border-box",
  border: "0.4mm solid rgba(0, 0, 0, 0.2)",
  color: "white",
  fontWeight: 700,
  lineHeight: 1
})

const fill = ({ kind, blight, historical }: TileFace) =>
  blight === true
    ? split(COLORS.blight, COLORS[kind])
    : historical === true
    ? split(COLORS.historical, COLORS[kind])
    : COLORS[kind]

export function Tile({ face, size = STICKER }: { face: TileFace | undefined; size?: number }) {
  const mm = (n: number) => `${(n * size) / STICKER}mm`
  const style = { width: mm(STICKER), height: mm(STICKER), padding: mm(INSET) }
  if (face === undefined) return <div className={tile} style={style} />
  const Icon = ICON[face.kind]
  return (
    <div className={tile} style={style}>
      <div className={art} style={{ background: fill(face), borderRadius: mm(1) }}>
        <Icon size={mm(14)} strokeWidth={1.75} />
      </div>
      {face.cost !== undefined && (
        <span
          className={coin}
          style={{ background: COLORS.coin, width: mm(6), height: mm(6), margin: mm(1), fontSize: mm(3.6) }}
        >
          {face.cost}
        </span>
      )}
    </div>
  )
}

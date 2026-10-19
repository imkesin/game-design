import { css } from "~/generated/styled-system/css"
import { COLORS, split } from "../colors.ts"
import { ICON } from "../icons.ts"
import meepleSvg from "../marks/meeple.svg?raw"
import spadeSvg from "../marks/spade.svg?raw"
import { STICKER, type TileFace } from "./tiles.ts"

/**
 * One tile face, as a `STICKER`. The color sits inset from the cut line, and
 * the inset is left unprinted, so a slightly off cut lands in it. `size`
 * draws it scaled, e.g. on a reference card.
 *
 * - **Construction**: its type's color, like the finished side, with its
 *   numbers as `SYMBOL`-tall symbols: workers as meeples top-left, the price
 *   coin top-right, cubes put out bottom-left, and a spade beside its type
 *   icon in the centre. (Base sale isn't shown yet.)
 * - **Dark** (a blight): black, its type in color, restore workers and price.
 * - **Finished**: its type's color under a white icon, a placeholder for art.
 *   Historical is split diagonally, burgundy and the type's color; restored
 *   gets an inner frame.
 */

const INSET = 1
/** How tall the corner symbols are. */
const SYMBOL = 5
const PADDING = 0.6
const FRAME = 0.6

const tile = css({ display: "grid", boxSizing: "border-box", printColorAdjust: "exact" })

const face = css({
  display: "grid",
  boxSizing: "border-box",
  gridTemplateAreas: `"workers . cost" "icon icon icon" "cubes . ."`,
  gridTemplateColumns: "auto 1fr auto"
})

const icon = css({
  gridArea: "icon",
  placeSelf: "center",
  display: "grid",
  gridAutoFlow: "column",
  alignItems: "center"
})

const corner = css({ display: "grid", gridAutoFlow: "column", alignItems: "center" })

/** A mark's path, from a one-path 512 × 512 drawing in `marks/`. */
const pathOf = (svg: string) => svg.match(/\sd="([^"]+)"/)?.[1] ?? ""
const MEEPLE = pathOf(meepleSvg)
const SPADE = pathOf(spadeSvg)

/** Construction's centre: a spade and the type icon, side by side. */
const PAIR = 9

/** How much white fills a construction mark: workers stand out, the centre recedes. */
const WORKER_FILL = "rgba(255, 255, 255, 0.3)"
const CENTRE_FILL = "rgba(255, 255, 255, 0.1)"

/** A mark drawn white in outline over a faint white fill. */
function Mark({ d, size, fill }: { d: string; size: string; fill: string }) {
  return (
    <svg viewBox="0 0 512 512" style={{ width: size, height: size, display: "block" }}>
      <path d={d} fill={fill} stroke="white" strokeWidth={32} strokeLinejoin="round" />
    </svg>
  )
}

const coin = css({
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
  borderRadius: "50%",
  color: "white",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

const fill = ({ kind, side, historical }: TileFace) =>
  side === "dark"
    ? COLORS.blight
    : historical === true
    ? split(COLORS.historical, COLORS[kind])
    : COLORS[kind]

/** A cube put out on finishing, with the "+" badge on its lower-left corner. */
function Cube({ kind, size }: { kind: "house" | "commercial"; size: string }) {
  return (
    <svg viewBox="0 0 10 10" style={{ width: size, height: size, display: "block" }}>
      <rect
        x={2.4}
        y={0.6}
        width={7}
        height={7}
        rx={0.8}
        fill={COLORS[kind]}
        stroke="rgba(0, 0, 0, 0.45)"
        strokeWidth={0.6}
      />
      <circle cx={2.6} cy={7.4} r={2.2} fill="#1f1f1f" stroke="white" strokeWidth={0.5} />
      <path d="M2.6 6.4V8.4M1.6 7.4H3.6" stroke="white" strokeWidth={0.6} strokeLinecap="round" />
    </svg>
  )
}

export function Tile({ face: f, size = STICKER }: { face: TileFace | undefined; size?: number }) {
  const mm = (n: number) => `${(n * size) / STICKER}mm`
  const style = { width: mm(STICKER), height: mm(STICKER), padding: mm(INSET) }
  if (f === undefined) return <div className={tile} style={style} />
  const Icon = ICON[f.kind]
  const frame = f.restored === true
  const corners = f.side !== "finished"
  const cube = f.kind === "house" || f.kind === "commercial" ? f.kind : undefined
  const coinStyle = { background: COLORS.coin, width: mm(SYMBOL), height: mm(SYMBOL), fontSize: mm(SYMBOL * 0.62) }
  return (
    <div className={tile} style={style}>
      <div
        className={face}
        style={{
          background: fill(f),
          borderRadius: mm(1),
          border: frame ? `${mm(FRAME)} solid rgba(255, 255, 255, 0.7)` : undefined,
          padding: corners ? mm(PADDING) : undefined,
          gridTemplateRows: corners ? `${mm(SYMBOL)} 1fr ${mm(SYMBOL)}` : "0 1fr 0"
        }}
      >
        {corners && f.workers !== undefined && (
          <span className={corner} style={{ gridArea: "workers", gap: mm(0.2) }}>
            {Array.from(
              { length: f.workers },
              (_, i) => <Mark key={i} d={MEEPLE} size={mm(SYMBOL)} fill={WORKER_FILL} />
            )}
          </span>
        )}
        {corners && f.cost !== undefined && (
          <span style={{ gridArea: "cost", ...coinStyle }} className={coin}>{f.cost}</span>
        )}
        <span className={icon} style={{ gap: mm(1.5) }}>
          {f.side === "construction" && <Mark d={SPADE} size={mm(PAIR)} fill={CENTRE_FILL} />}
          <Icon
            size={mm(f.side === "finished" ? 14 : f.side === "construction" ? PAIR : 12)}
            strokeWidth={1.75}
            color={f.side === "dark" ? COLORS[f.kind] : "white"}
            fill={f.side === "construction" ? CENTRE_FILL : "none"}
          />
        </span>
        {corners && cube !== undefined && f.cubes !== undefined && f.cubes > 0 && (
          <span className={corner} style={{ gridArea: "cubes", gap: mm(0.2) }}>
            {Array.from({ length: f.cubes }, (_, i) => <Cube key={i} kind={cube} size={mm(SYMBOL)} />)}
          </span>
        )}
      </div>
    </div>
  )
}

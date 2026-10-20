import { css } from "~/generated/styled-system/css"
import { COLORS } from "../colors.ts"
import { ICON } from "../icons.ts"
import meepleSvg from "../marks/meeple.svg?raw"
import spadeSvg from "../marks/spade.svg?raw"
import { type Bonus, STICKER, type TileFace } from "./tiles.ts"

/**
 * One tile face, as a `STICKER`. The color sits inset from the cut line, and
 * the inset is left unprinted, so a slightly off cut lands in it. `size`
 * draws it scaled, e.g. on a reference card.
 *
 * - **Construction**: its type's color, like the finished side, with its
 *   numbers as `SYMBOL`-tall symbols: workers as meeples top-left, the price
 *   coin top-right, a spade beside its type icon in the centre, and the payoff
 *   bottom-right: base sale coin + (bonus coin / Park or cube).
 * - **Dark** (a blight): its type's color under a banded dark screen,
 *   restore workers and price.
 * - **Finished**: its type's color under a white icon, a placeholder for art.
 *   Historical looks like any other; restored gets an inner frame.
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
  gridTemplateAreas: `"workers . cost" "icon icon icon" "payoff payoff payoff"`,
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

/** A blight's icon: white muddied with 10% blight grey, and faintly filled. */
const GRIMY = "#e9e9e9"
const GRIMY_FILL = "rgba(233, 233, 233, 0.2)"

/** Construction's faint diagonal stripes, so a site reads as unfinished. */
const HATCH = "rgba(255, 255, 255, 0.2)"

/**
 * A dark grey screen in 4 hard bands, darkest at the top: heavy on a blight
 * (the city starts dark), lighter on its construction side while it's restored.
 */
const bands = (alphas: readonly number[]) =>
  `linear-gradient(${alphas.map((a, i) => `rgba(31, 31, 31, ${a}) ${i * 25}% ${(i + 1) * 25}%`).join(", ")})`
const BLIGHT_SCREEN = bands([0.9, 0.7, 0.5, 0.3])
const SITE_SCREEN = bands([0.4, 0.3, 0.2, 0.1])

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

const payoff = css({
  gridArea: "payoff",
  justifySelf: "end",
  display: "grid",
  gridAutoFlow: "column",
  alignItems: "center",
  color: "white",
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums"
})

/** Parens: light, so the coins carry the payoff. */
const glyph = css({ fontWeight: 500, lineHeight: 1 })

/** What a bonus counts: a Park (its tile, icon and all) or a cube (a plain square). */
function Unit({ of, size }: { of: Bonus["per"]; size: string }) {
  if (of === "park") {
    const Icon = ICON.park
    return (
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: size,
          height: size,
          borderRadius: "18%",
          background: COLORS.park,
          boxShadow: "0 0 0 0.25mm white"
        }}
      >
        <Icon size="70%" strokeWidth={2} color="white" />
      </span>
    )
  }
  return (
    <svg viewBox="0 0 10 10" style={{ width: size, height: size, display: "block" }}>
      <rect x={1} y={1} width={8} height={8} rx={1} fill={COLORS[of]} stroke="white" strokeWidth={1.2} />
    </svg>
  )
}

const fill = ({ kind }: TileFace) => COLORS[kind]

export function Tile(
  { face: f, size = STICKER, unit = "1mm" }: {
    face: TileFace | undefined
    size?: number
    /** One mm as CSS: the board's zoomable `var(--u)`, say. */
    unit?: string
  }
) {
  const mm = (n: number) => `calc(${(n * size) / STICKER} * ${unit})`
  const style = { width: mm(STICKER), height: mm(STICKER), padding: mm(INSET) }
  if (f === undefined) return <div className={tile} style={style} />
  const Icon = ICON[f.kind]
  const frame = f.restored === true
  const corners = f.side !== "finished"
  const iconSize = mm(f.side === "finished" ? 14 : f.side === "construction" ? PAIR : 12)
  const coinStyle = { background: COLORS.coin, width: mm(SYMBOL), height: mm(SYMBOL), fontSize: mm(SYMBOL * 0.62) }
  return (
    <div className={tile} style={style}>
      <div
        className={face}
        style={{
          background: f.side === "construction"
            ? `repeating-linear-gradient(45deg, ${HATCH} 0 ${mm(0.5)}, transparent 0 ${mm(2)}), ${
              f.restoring === true ? `${SITE_SCREEN}, ` : ""
            }${fill(f)}`
            : f.side === "dark"
            ? `${BLIGHT_SCREEN}, ${fill(f)}`
            : fill(f),
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
          <span style={{ gridArea: "cost", ...coinStyle, background: COLORS.cost }} className={coin}>{f.cost}</span>
        )}
        <span className={icon} style={{ gap: mm(1.5) }}>
          {f.side === "construction" && <Mark d={SPADE} size={mm(PAIR)} fill={CENTRE_FILL} />}
          <Icon
            style={{ width: iconSize, height: iconSize }}
            strokeWidth={1.75}
            color={f.side === "dark" ? GRIMY : "white"}
            fill={f.side === "construction" ? CENTRE_FILL : f.side === "dark" ? GRIMY_FILL : "none"}
          />
        </span>
        {corners && f.sale !== undefined && (
          <span className={payoff} style={{ gap: mm(0.5), fontSize: mm(SYMBOL * 0.62) }}>
            <span className={coin} style={{ ...coinStyle, background: COLORS.payoff }}>{f.sale}</span>
            {f.bonus !== undefined && (
              <>
                <svg
                  viewBox="0 0 10 10"
                  style={{ width: mm(2.4), height: mm(2.4), marginInline: mm(0.6), display: "block" }}
                >
                  <path d="M5 1V9M1 5H9" stroke="white" strokeWidth={2.4} strokeLinecap="round" />
                </svg>
                <span className={glyph} style={{ fontSize: mm(SYMBOL * 0.8) }}>(</span>
                <span className={coin} style={{ ...coinStyle, background: COLORS.payoff }}>{f.bonus.amount}</span>
                <span style={{ fontSize: mm(SYMBOL * 0.8), marginInline: mm(0.5) }}>/</span>
                <Unit of={f.bonus.per} size={mm(SYMBOL * 0.8)} />
                <span className={glyph} style={{ fontSize: mm(SYMBOL * 0.8) }}>)</span>
              </>
            )}
          </span>
        )}
      </div>
    </div>
  )
}

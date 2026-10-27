import { css } from "~/generated/styled-system/css"
import { COLORS } from "../colors.ts"
import { ICON } from "../icons.ts"
import meepleSvg from "../marks/meeple.svg?raw"
import { LEVEL_SLOTS, levelGrid } from "./levels.ts"
import { STICKER, type TileFace } from "./tiles.ts"

/**
 * One tile face, as a `STICKER`. The color sits inset from the cut line, and
 * the inset is left unprinted, so a slightly off cut lands in it. `size`
 * draws it scaled, e.g. on a reference card.
 *
 * - **Construction**: its type's color, like the finished side, with its
 *   numbers as `SYMBOL`-tall symbols: workers as meeples top-left, its type
 *   icon once per level in the centre, and bottom-right the price coin and the
 *   base sale coin, cost / sale. What a sale counts is left to the rules.
 *   Bold stripes say under construction; its meeples and icons are solid with
 *   a halo, so the stripes stop short of them.
 * - **Dark** (a blight): grime grey under a faint, generic building; no type, no
 *   numbers.
 * - **Finished**: its type's color under its white icon, once per level like
 *   the construction side, a placeholder for art. Historical (always L1) looks
 *   like any other.
 */

const INSET = 1
/** How tall the corner symbols are: meeples and coins alike. */
const SYMBOL = 6
const PADDING = 0.6

const tile = css({ display: "grid", boxSizing: "border-box", printColorAdjust: "exact" })

const face = css({
  display: "grid",
  boxSizing: "border-box",
  gridTemplateAreas: `"workers" "." "money"`,
  gridTemplateColumns: "100%"
})

/** Cost / sale: what a tile takes in, then what it pays out. */
const money = css({
  gridArea: "money",
  justifySelf: "end",
  display: "grid",
  gridTemplateAreas: `"cost slash sale"`,
  alignItems: "center",
  color: "white",
  fontWeight: 800,
  lineHeight: 1
})

/** The centre spans the whole face, under the corner rows, so it's centred on the tile whatever the corners hold. */
const icon = css({ gridArea: "1 / 1 / -1 / -1", placeSelf: "center" })

const corner = css({ justifySelf: "start", display: "grid", gridAutoFlow: "column", alignItems: "center" })

/** A mark's path, from a one-path 512 × 512 drawing in `marks/`. */
const pathOf = (svg: string) => svg.match(/\sd="([^"]+)"/)?.[1] ?? ""
const MEEPLE = pathOf(meepleSvg)

/** The centre: one type icon per level, smaller on the construction side, which has corners to fit. */
const LEVEL_ICON = { construction: 9, finished: 14 } as const

/**
 * How far a construction mark's solid color reaches past its white outline, in
 * mm: the stripes stop short of every mark, so it reads clean over them.
 */
const HALO = 0.5

/** Outline widths in their drawings' units: a mark's 512 box, an icon's 24. */
const MARK_STROKE = 32
const ICON_STROKE = 1.75

/** A blight's building: faint white, so the tile reads dark first and the building second. */
const BLIGHT_STROKE = "rgba(255, 255, 255, 0.3)"

/** Construction's diagonal stripes, so a site reads as unfinished: width and repeat in mm. */
const HATCH = { color: "rgba(255, 255, 255, 0.35)", stripe: 1.5, period: 3 }

/** A mark drawn white in outline, filled and haloed (`halo`, in its 512 box) in `color`. */
function Mark({ d, size, color, halo }: { d: string; size: string; color: string; halo: number }) {
  return (
    <svg viewBox="0 0 512 512" style={{ width: size, height: size, display: "block", overflow: "visible" }}>
      <path d={d} fill={color} stroke={color} strokeWidth={MARK_STROKE + 2 * halo} strokeLinejoin="round" />
      <path d={d} fill={color} stroke="white" strokeWidth={MARK_STROKE} strokeLinejoin="round" />
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

const fill = ({ kind }: TileFace) => COLORS[kind]

const blight = css({ display: "grid", placeItems: "center" })

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
  if (f.kind === "blight") {
    return (
      <div className={tile} style={style}>
        <div className={blight} style={{ background: COLORS.blight, borderRadius: mm(1) }}>
          <ICON.blight style={{ width: mm(14), height: mm(14) }} strokeWidth={ICON_STROKE} color={BLIGHT_STROKE} />
        </div>
      </div>
    )
  }
  const Icon = ICON[f.kind]
  const corners = f.side !== "finished"
  const across = f.side === "finished" ? LEVEL_ICON.finished : LEVEL_ICON.construction
  const iconSize = mm(across)
  const level = f.level ?? 1
  const slots = LEVEL_SLOTS.slice(0, level)
  const haloed = f.side === "construction"
  const coinStyle = { background: COLORS.coin, width: mm(SYMBOL), height: mm(SYMBOL), fontSize: mm(SYMBOL * 0.62) }
  return (
    <div className={tile} style={style}>
      <div
        className={face}
        style={{
          background: f.side === "construction"
            ? `repeating-linear-gradient(45deg, ${HATCH.color} 0 ${mm(HATCH.stripe)}, transparent 0 ${
              mm(HATCH.period)
            }), ${fill(f)}`
            : fill(f),
          borderRadius: mm(1),
          padding: corners ? mm(PADDING) : undefined,
          gridTemplateRows: corners ? `${mm(SYMBOL)} 1fr ${mm(SYMBOL)}` : "0 1fr 0"
        }}
      >
        <span className={icon} style={levelGrid(level, across, mm)}>
          {haloed && slots.map((slot) => (
            <Icon
              key={`halo-${slot}`}
              style={{ gridArea: slot, width: iconSize, height: iconSize, overflow: "visible" }}
              strokeWidth={ICON_STROKE + (2 * HALO * 24) / across}
              color={fill(f)}
              fill={fill(f)}
            />
          ))}
          {slots.map((slot) => (
            <Icon
              key={slot}
              style={{ gridArea: slot, width: iconSize, height: iconSize }}
              strokeWidth={ICON_STROKE}
              color="white"
              fill="none"
            />
          ))}
        </span>
        {corners && f.workers !== undefined && (
          <span className={corner} style={{ gridArea: "workers", gap: mm(2 * HALO) }}>
            {Array.from(
              { length: f.workers },
              (_, i) => <Mark key={i} d={MEEPLE} size={mm(SYMBOL)} color={fill(f)} halo={(HALO * 512) / SYMBOL} />
            )}
          </span>
        )}
        {corners && f.sale !== undefined && (
          <span className={money} style={{ columnGap: mm(0.6), fontSize: mm(SYMBOL * 0.8) }}>
            {f.cost !== undefined && (
              <>
                <span className={coin} style={{ gridArea: "cost", ...coinStyle, background: COLORS.cost }}>
                  {f.cost}
                </span>
                <span style={{ gridArea: "slash" }}>/</span>
              </>
            )}
            <span className={coin} style={{ gridArea: "sale", ...coinStyle, background: COLORS.payoff }}>{f.sale}</span>
          </span>
        )}
      </div>
    </div>
  )
}

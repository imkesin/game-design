import { type PointerEvent, useId } from "react"
import { mm } from "~/games/revival/city/mm"
import { css, cx } from "~/generated/styled-system/css"
import { BASE, CLAIM, PLOT, shape, SIDE, TAG, TAG_GAP } from "./skyline.ts"

/**
 * One neighborhood at true size: skyline outline on a dotted ground, touching
 * columns of white plots (one Block each), a faint claim ring on a stem under
 * each column in the base band, and the name on a dark tag above the tallest
 * column(s). The tag sits above the outline's box, so place this `HEADER`
 * higher than the box.
 */

/** The neighborhood outline: lighter than the plots so it frames without competing. */
const OUTLINE = { width: 0.8, color: "#4a4a4a" }
const PLOT_LINE = 0.6
/** Claim ring and stem: same weight as a plot border, but grey so it recedes. */
const CLAIM_LINE = { width: 0.6, color: "#a3a3a3" }
/**
 * Ground inside the outline: pure black dots (a halftone, not a grey fill, so
 * it prints the same anywhere) behind white plots, which makes them pop.
 */
const DOTS = { pitch: 2, r: 0.2 }

const frame = css({
  display: "grid",
  gridTemplateAreas: `". tag ." ". . ." ". . ." ". skyline ." ". claims ."`
})

const tagRow = css({ gridArea: "tag", display: "grid" })

/** Kept dark in print too. */
const tag = css({
  justifySelf: "center",
  display: "grid",
  alignItems: "center",
  paddingInline: "calc(2.5 * var(--u))",
  borderRadius: "calc(1.5 * var(--u))",
  background: "#1f1f1f",
  color: "white",
  fontSize: "calc(4.5 * var(--u))",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  lineHeight: 1,
  printColorAdjust: "exact"
})

const skyline = css({ gridArea: "skyline", display: "grid", gridAutoFlow: "column", alignItems: "end" })

const column = css({ display: "grid" })

/** A 22mm square centred in its 24mm track. */
const plot = css({ margin: "1", border: "solid black", background: "white" })

const claims = css({ gridArea: "claims", display: "grid", gridAutoFlow: "column" })

/** A claim: a ring under its column, on a stem up to the column's bottom plot. */
const claim = css({ width: "100%", height: "100%", overflow: "visible" })

/** The plot square's padding inside its track: where the stem starts. */
const PADDING = 1

/**
 * Centred optically, not in the band: between the plot square's bottom edge
 * (inside its track's padding) and the inner edge of the outline's line, so
 * the white space above and below the ring matches.
 */
const CLAIM_Y = (-PADDING + BASE - OUTLINE.width / 2) / 2

/** Covers the outline's box: every row below the tag and its gap. */
const backdrop = css({ gridRow: "3 / -1", gridColumn: "1 / -1", width: "100%", height: "100%", overflow: "visible" })

const draggable = css({ cursor: "grab", touchAction: "none", _active: { cursor: "grabbing" } })

export function Neighborhood(
  { name, columns, onGrab }: {
    name: string
    columns: readonly number[]
    onGrab?: (event: PointerEvent<HTMLDivElement>) => void
  }
) {
  const { width, height, top, outline, tallest: [first, last] } = shape(columns)
  const dots = `dots${useId().replace(/[^\w-]/g, "")}`
  return (
    <div
      className={cx(frame, onGrab !== undefined && draggable)}
      style={{
        gridTemplateColumns: `${mm(SIDE)} ${mm(width - 2 * SIDE)} ${mm(SIDE)}`,
        gridTemplateRows: `${mm(TAG)} ${mm(TAG_GAP)} ${mm(SIDE)} ${mm(top)} ${mm(BASE)}`
      }}
      onPointerDown={onGrab}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className={backdrop}>
        <defs>
          <pattern id={dots} width={DOTS.pitch} height={DOTS.pitch} patternUnits="userSpaceOnUse">
            <circle cx={DOTS.pitch / 2} cy={DOTS.pitch / 2} r={DOTS.r} fill="black" />
          </pattern>
        </defs>
        {/* White under the dots, so links drawn beneath stay hidden. */}
        <path d={outline} fill="white" />
        <path d={outline} fill={`url(#${dots})`} stroke={OUTLINE.color} strokeWidth={OUTLINE.width} />
      </svg>
      <div className={tagRow} style={{ gridTemplateColumns: `repeat(${columns.length}, ${mm(PLOT)})` }}>
        <div className={tag} style={{ gridColumn: `${first + 1} / ${last + 2}` }}>{name}</div>
      </div>
      <div className={skyline} style={{ gridAutoColumns: mm(PLOT) }}>
        {columns.map((count, i) => (
          <div key={i} className={column} style={{ gridTemplateRows: `repeat(${count}, ${mm(PLOT)})` }}>
            {Array.from(
              { length: count },
              (_, k) => <div key={k} className={plot} style={{ borderWidth: mm(PLOT_LINE) }} />
            )}
          </div>
        ))}
      </div>
      <div className={claims} style={{ gridAutoColumns: mm(PLOT) }}>
        {columns.map((_, i) => (
          <svg key={i} viewBox={`0 0 ${PLOT} ${BASE}`} className={claim}>
            <line
              x1={PLOT / 2}
              x2={PLOT / 2}
              y1={-PADDING}
              y2={CLAIM_Y - CLAIM / 2}
              stroke={CLAIM_LINE.color}
              strokeWidth={CLAIM_LINE.width}
            />
            <circle
              cx={PLOT / 2}
              cy={CLAIM_Y}
              r={(CLAIM - CLAIM_LINE.width) / 2}
              fill="white"
              stroke={CLAIM_LINE.color}
              strokeWidth={CLAIM_LINE.width}
            />
          </svg>
        ))}
      </div>
    </div>
  )
}

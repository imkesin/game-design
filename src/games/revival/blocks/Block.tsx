import { type CSSProperties, useId } from "react"
import { css } from "~/generated/styled-system/css"
import { BAND, CLAIM, CLAIM_LINE, DOTS, EDGE, PADDING, PLOT, PLOT_LINE, SIDE, TOP } from "./blocks.ts"
import { mm } from "./mm.ts"

/**
 * A neighborhood as a rectangle of whole 24mm cells inside a heavy edge: its
 * columns' plots bottom-aligned, `SIDE` of buffer left and right and `TOP`
 * above, the claim band below, and a dark label tab in the bottom-left
 * corner. Cells above a shorter column are greyed out.
 * Buffer and band together make one cell each way, so every block's plots sit
 * on one grid offset from the cell grid by (`SIDE`, `TOP`).
 */

const frame = css({ display: "grid" })

const backdrop = css({ gridRow: "1 / -1", gridColumn: "1 / -1", width: "100%", height: "100%", overflow: "visible" })

/** A 22mm square centred in its 24mm track. */
const plot = css({ margin: "1", border: "solid black", background: "white" })

/** A plot the block doesn't have: just its outline, in claim grey. */
const greyed = css({ margin: "1", border: "solid" })

/**
 * Flush in the corner, over the inner half of the edge line in the same ink,
 * so it reads as part of the frame. Inside the side buffer, clear of the
 * first claim ring. Kept dark in print too.
 */
const label = css({
  gridColumn: "1",
  gridRow: "-2",
  alignSelf: "end",
  justifySelf: "start",
  display: "grid",
  alignItems: "center",
  minHeight: "calc(6 * var(--u))",
  padding: "calc(1.2 * var(--u)) calc(1.5 * var(--u))",
  borderTopRightRadius: "calc(1.5 * var(--u))",
  color: "white",
  fontSize: "calc(3.6 * var(--u))",
  fontWeight: 700,
  letterSpacing: "0.04em",
  lineHeight: 1.1,
  whiteSpace: "pre",
  printColorAdjust: "exact"
})

const claim = css({ width: "100%", height: "100%", overflow: "visible" })

/** Centred between the plot square's bottom edge and the inner edge of the block's edge line. */
const CLAIM_Y = (-PADDING + BAND - EDGE.width / 2) / 2

export function Block(
  { columns, plots = Math.max(...columns), label: text, style }: {
    columns: readonly number[]
    /** Shown on the corner tab, e.g. its coordinates; a line break stacks it. */
    label?: string | undefined
    /** The frame's height in plots, if taller than the tallest column. */
    plots?: number | undefined
    style?: CSSProperties
  }
) {
  const top = plots
  const [width, height] = [(columns.length + 1) * PLOT, (top + 1) * PLOT]
  const dots = `dots${useId().replace(/[^\w-]/g, "")}`
  return (
    <div
      className={frame}
      style={{
        ...style,
        gridTemplateColumns: `${mm(SIDE)} repeat(${columns.length}, ${mm(PLOT)}) ${mm(SIDE)}`,
        gridTemplateRows: `${mm(TOP)} repeat(${top}, ${mm(PLOT)}) ${mm(BAND)}`
      }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className={backdrop}>
        <defs>
          <pattern id={dots} width={DOTS.pitch} height={DOTS.pitch} patternUnits="userSpaceOnUse">
            <circle cx={DOTS.pitch / 2} cy={DOTS.pitch / 2} r={DOTS.r} fill="black" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="white" />
        <rect
          width={width}
          height={height}
          fill={`url(#${dots})`}
          stroke={EDGE.color}
          strokeWidth={EDGE.width}
        />
      </svg>
      {columns.flatMap((count, i) =>
        Array.from({ length: top }, (_, k) => (
          <div
            key={`${i},${k}`}
            className={k < top - count ? greyed : plot}
            style={{
              gridColumn: i + 2,
              gridRow: k + 2,
              borderWidth: mm(PLOT_LINE),
              ...(k < top - count ? { borderColor: CLAIM_LINE.color } : {})
            }}
          />
        ))
      )}
      {columns.map((_, i) => (
        <svg
          key={i}
          viewBox={`0 0 ${PLOT} ${BAND}`}
          className={claim}
          style={{ gridColumn: i + 2, gridRow: top + 2 }}
        >
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
      {text !== undefined && <div className={label} style={{ background: EDGE.color }}>{text}</div>}
    </div>
  )
}

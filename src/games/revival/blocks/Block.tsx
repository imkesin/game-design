import { type CSSProperties, useId } from "react"
import { css } from "~/generated/styled-system/css"
import { BLOCK, BUFFER, DOTS, EDGE, PLOT, PLOT_LINE, RING, RING_PLOTS } from "./blocks.ts"
import { mm } from "./mm.ts"

/**
 * A neighborhood as a square inside a heavy edge: a ring of 8 plots around an
 * empty centre (the plaza, which holds a faint label tab), and a `BUFFER`
 * sidewalk all round.
 */

const frame = css({ display: "grid" })

const backdrop = css({ gridRow: "1 / -1", gridColumn: "1 / -1", width: "100%", height: "100%", overflow: "visible" })

/** A plot square centred in its track. */
const plot = css({ margin: "1", border: "solid black", background: "white" })

/**
 * Centred in the plaza: big but faint, light grey on lighter grey, since the
 * coordinates are a minor detail.
 */
const label = css({
  gridColumn: "3",
  gridRow: "3",
  placeSelf: "center",
  display: "grid",
  alignItems: "center",
  padding: "calc(1.5 * var(--u)) calc(2 * var(--u))",
  borderRadius: "calc(2 * var(--u))",
  background: "#ececec",
  color: "#a3a3a3",
  fontSize: "calc(6 * var(--u))",
  fontWeight: 700,
  letterSpacing: "0.04em",
  lineHeight: 1.1,
  whiteSpace: "pre",
  printColorAdjust: "exact"
})

const tracks = `${mm(BUFFER)} repeat(${RING}, ${mm(PLOT)}) ${mm(BUFFER)}`

export function Block(
  { label: text, style }: {
    /** Shown on the tab in the plaza, e.g. its coordinates; a line break stacks it. */
    label?: string | undefined
    style?: CSSProperties
  }
) {
  const dots = `dots${useId().replace(/[^\w-]/g, "")}`
  /** Grid lines for a plot at (column, row) in the 3×3, past the buffer. */
  const at = ([col, row]: readonly [number, number]) => ({ gridColumn: col + 2, gridRow: row + 2 })
  return (
    <div className={frame} style={{ ...style, gridTemplateColumns: tracks, gridTemplateRows: tracks }}>
      <svg viewBox={`0 0 ${BLOCK} ${BLOCK}`} className={backdrop}>
        <defs>
          <pattern id={dots} width={DOTS.pitch} height={DOTS.pitch} patternUnits="userSpaceOnUse">
            <circle cx={DOTS.pitch / 2} cy={DOTS.pitch / 2} r={DOTS.r} fill="black" />
          </pattern>
        </defs>
        <rect width={BLOCK} height={BLOCK} fill="white" />
        <rect width={BLOCK} height={BLOCK} fill={`url(#${dots})`} stroke={EDGE.color} strokeWidth={EDGE.width} />
      </svg>
      {RING_PLOTS.map((position) => (
        <div key={`${position}`} className={plot} style={{ ...at(position), borderWidth: mm(PLOT_LINE) }} />
      ))}
      {text !== undefined && <div className={label}>{text}</div>}
    </div>
  )
}

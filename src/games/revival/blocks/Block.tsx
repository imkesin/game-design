import { type CSSProperties, type ReactNode, useId } from "react"
import { css } from "~/generated/styled-system/css"
import { blockOf, BUFFER, DOTS, EDGE, type Layout, LAYOUTS, PLOT, PLOT_LINE, PLOT_PADDING } from "./blocks.ts"
import { mm } from "./mm.ts"

/**
 * A neighborhood as a square inside a heavy edge: its plots (by default a ring
 * of 8 around an empty centre, the plaza, which holds a faint label tab), and
 * a `BUFFER` sidewalk all round.
 */

const frame = css({ display: "grid" })

const backdrop = css({ gridRow: "1 / -1", gridColumn: "1 / -1", width: "100%", height: "100%", overflow: "visible" })

/** A plot square centred in its track. */
const plot = css({ border: "solid black", background: "white" })

/**
 * Centred in the plaza: big but faint, light grey on lighter grey, since the
 * coordinates are a minor detail.
 */
const label = css({
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

const offScreen = css({ "@media screen": { visibility: "hidden" } })

const onTop = css({ placeSelf: "center", display: "grid" })

export function Block(
  { label: text, style, plots, plaza, hidden = false, layout = LAYOUTS.ring }: {
    /** Shown on the tab in the plaza, e.g. its coordinates; a line break stacks it. */
    label?: string | undefined
    style?: CSSProperties
    /** Screen-only pieces on the plots, indexed like `layout.plots`, centred over each. */
    plots?: readonly ReactNode[] | undefined
    /** A screen-only piece in the plaza, over its label. */
    plaza?: ReactNode
    /** Left off the screen (not the print), to try a smaller city. */
    hidden?: boolean | undefined
    layout?: Layout | undefined
  }
) {
  const dots = `dots${useId().replace(/[^\w-]/g, "")}`
  /** Grid lines for a cell at (column, row) in the layout's grid, past the buffer. */
  const at = ([col, row]: readonly [number, number]) => ({ gridColumn: col + 2, gridRow: row + 2 })
  const size = blockOf(layout)
  const tracks = `${mm(BUFFER)} repeat(${layout.grid}, ${mm(PLOT)}) ${mm(BUFFER)}`
  return (
    <div
      className={hidden ? `${frame} ${offScreen}` : frame}
      style={{ ...style, gridTemplateColumns: tracks, gridTemplateRows: tracks }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className={backdrop}>
        <defs>
          <pattern id={dots} width={DOTS.pitch} height={DOTS.pitch} patternUnits="userSpaceOnUse">
            <circle cx={DOTS.pitch / 2} cy={DOTS.pitch / 2} r={DOTS.r} fill="black" />
          </pattern>
        </defs>
        <rect width={size} height={size} fill="white" />
        <rect width={size} height={size} fill={`url(#${dots})`} stroke={EDGE.color} strokeWidth={EDGE.width} />
      </svg>
      {layout.plots.map((position) => (
        <div
          key={`${position}`}
          className={plot}
          style={{ ...at(position), margin: mm(PLOT_PADDING), borderWidth: mm(PLOT_LINE) }}
        />
      ))}
      {text !== undefined && layout.plaza !== undefined && <div className={label} style={at(layout.plaza)}>{text}</div>}
      {plots?.map((piece, i) => {
        const position = layout.plots[i]
        return piece === undefined || position === undefined
          ? null
          : <div key={i} className={`${onTop} screen-only`} style={at(position)}>{piece}</div>
      })}
      {plaza !== undefined && layout.plaza !== undefined && (
        <div className={`${onTop} screen-only`} style={at(layout.plaza)}>{plaza}</div>
      )}
    </div>
  )
}

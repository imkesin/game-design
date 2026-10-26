import { type CSSProperties, type ReactNode, useId } from "react"
import { css } from "~/generated/styled-system/css"
import { BUFFER, EDGE, type Layout, PLOT, PLOT_PADDING, spanOf } from "./blocks.ts"
import { GROUND, Pattern } from "./hatch.tsx"
import { mm } from "./mm.ts"

/**
 * A neighborhood inside a heavy edge, following any plot left out: its plots,
 * each a hatched vacant lot until a tile covers it.
 */

const frame = css({ display: "grid" })

const backdrop = css({ gridRow: "1 / -1", gridColumn: "1 / -1", width: "100%", height: "100%", overflow: "visible" })

/** A plot square filling its track, its outline in the padding; the lot under it is drawn behind. */
const plot = css({ border: "solid black" })

/**
 * Each plot's cell grown to the edge line's inner side. Their strokes, drawn
 * double-width and then half-covered by their fills, leave only the edge
 * round the outside of the whole shape.
 */
const GROW = BUFFER - EDGE.width / 2

const onTop = css({ placeSelf: "center", display: "grid" })

export function Block(
  { style, layout, pieces }: {
    style?: CSSProperties
    layout: Layout
    /** Screen-only pieces on its plots, by (column, row) in the layout's grid, centred over each. */
    pieces?: ((col: number, row: number) => ReactNode) | undefined
  }
) {
  const lot = `lot${useId().replace(/[^\w-]/g, "")}`
  /** Grid lines for a cell at (column, row) in the layout's grid, past the buffer. */
  const at = ([col, row]: readonly [number, number]) => ({ gridColumn: col + 2, gridRow: row + 2 })
  const [width, height] = [spanOf(layout.cols), spanOf(layout.rows)]
  const tracks = (n: number) => `${mm(BUFFER)} repeat(${n}, ${mm(PLOT)}) ${mm(BUFFER)}`
  const cells = layout.plots.map(([col, row]) => (
    <rect
      key={`${col},${row}`}
      x={BUFFER + col * PLOT - GROW}
      y={BUFFER + row * PLOT - GROW}
      width={PLOT + 2 * GROW}
      height={PLOT + 2 * GROW}
    />
  ))
  const lots = layout.plots.map(([col, row]) => (
    <rect key={`${col},${row}`} x={BUFFER + col * PLOT} y={BUFFER + row * PLOT} width={PLOT} height={PLOT} />
  ))
  return (
    <div
      className={frame}
      style={{ ...style, gridTemplateColumns: tracks(layout.cols), gridTemplateRows: tracks(layout.rows) }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className={backdrop}>
        <defs>
          <Pattern id={lot} hatch={GROUND.lot} />
        </defs>
        <g fill="none" stroke={EDGE.color} strokeWidth={2 * EDGE.width}>{cells}</g>
        <g fill="white">{cells}</g>
        <g fill={`url(#${lot})`}>{lots}</g>
      </svg>
      {layout.plots.map((position) => (
        <div
          key={`${position}`}
          className={plot}
          style={{ ...at(position), borderWidth: mm(PLOT_PADDING) }}
        />
      ))}
      {layout.plots.map((position) => {
        const piece = pieces?.(...position)
        return piece === undefined || piece === null
          ? null
          : <div key={`${position}`} className={`${onTop} screen-only`} style={at(position)}>{piece}</div>
      })}
    </div>
  )
}

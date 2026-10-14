import type { CSSProperties } from "react"
import { mm } from "~/games/revival/city/mm"
import { css, cx } from "~/generated/styled-system/css"
import { CLAIM, type Geometry, type PlotPlacement } from "./prefabs.ts"

const grid = css({ display: "grid" })

/** A faint frame, drawn inside the box (outline, not border) so it adds no size. */
const box = css({
  outline: "solid #bbb",
  outlineWidth: "calc(0.3 * var(--u))",
  outlineOffset: "calc(-0.3 * var(--u))"
})

const track = css({ display: "grid" })

/** A 22mm plot centred in its 24mm track, as on the map. */
const plot = css({
  margin: "1",
  border: "solid black",
  borderWidth: "calc(0.6 * var(--u))"
})

/**
 * Placed explicitly: the outline layer spans the whole grid, and auto-placed
 * cells would flow around it into new rows instead of sharing its tracks.
 */
function PlotCell({ row, col, rowSpan }: PlotPlacement) {
  return (
    <div className={track} style={{ gridRow: `${row} / span ${rowSpan}`, gridColumn: col }}>
      <div className={plot} />
    </div>
  )
}

/** `frame` draws the faint box edge; off where something else bounds the neighborhood. */
export function PrefabBox({ geo, frame = true, style }: { geo: Geometry; frame?: boolean; style?: CSSProperties }) {
  const { cols, rows, width, height, plots, groups, claimPoints } = geo
  return (
    <div
      className={cx(grid, frame && box)}
      style={{
        ...style,
        gridTemplateColumns: cols.map(mm).join(" "),
        gridTemplateRows: rows.map(mm).join(" ")
      }}
    >
      {plots.map((placement) => <PlotCell key={`${placement.row},${placement.col}`} {...placement} />)}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ gridColumn: "1 / -1", gridRow: "1 / -1", width: "100%", height: "100%" }}
      >
        <path d={groups} fill="none" stroke="black" strokeWidth={1} strokeLinejoin="miter" />
        {claimPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={CLAIM / 2 - 0.125}
            fill="none"
            stroke="black"
            strokeWidth={0.25}
            strokeDasharray="0.9 0.6"
          />
        ))}
      </svg>
    </div>
  )
}

import type { PointerEvent } from "react"
import { mm } from "~/games/revival/city/mm"
import { css, cx } from "~/generated/styled-system/css"
import { Neighborhood } from "./Neighborhood.tsx"
import { type Grid, HEADER, type NeighborhoodSpec, PLOT, type Shape } from "./skyline.ts"

/**
 * The whole map at true size, origin at its top-left: links under the
 * neighborhoods, then each neighborhood (tag included) at its place. Shared by
 * the on-screen editor and the printed tiles, which each show a window onto it.
 */

/** Screen-only plot grid: faint, so it guides without reading as part of the map. */
const GRID_LINE = { width: 0.3, color: "#c7d2e3" }

/** A link: one bold line, centre to centre, under the neighborhoods. */
const LINK = 3

export type Placed = NeighborhoodSpec & { shape: Shape }

/** `from` / `to` are undefined when a link names a neighborhood that doesn't exist. */
export type DrawnLink = {
  a: string
  b: string
  from: readonly [number, number] | undefined
  to: readonly [number, number] | undefined
}

const area = css({ display: "grid", gridTemplateAreas: `"map"` })

const layer = css({ gridArea: "map", width: "100%", height: "100%" })

const item = css({ gridArea: "map", justifySelf: "start", alignSelf: "start" })

/** Screen-only warning: on a seam, too close to one, or off the board. */
const conflict = css({ outline: "solid #dc2626", outlineWidth: "calc(1 * var(--u))" })

/** Screen-only: the neighborhood being edited. */
const chosen = css({ boxShadow: "0 0 0 calc(2.5 * var(--u)) rgba(37, 99, 235, 0.4)" })

/** Grid lines from `first` across `length`. */
const lines = (first: number, length: number) =>
  Array.from({ length: Math.floor((length - first) / PLOT) + 1 }, (_, k) => first + k * PLOT)

export function SkylineMap(
  { width, height, placed, links, conflicts, selected, seams, grid, onGrab }: {
    width: number
    height: number
    placed: readonly Placed[]
    links: readonly DrawnLink[]
    /** Indices of neighborhoods to flag. */
    conflicts?: ReadonlySet<number>
    /** Index of the neighborhood being edited. */
    selected?: number
    /** Screen-only cut lines between tiles, in mm from the map's origin. */
    seams?: { xs: readonly number[]; ys: readonly number[] }
    /** Screen-only plot grid, drawn under everything. */
    grid?: Grid
    onGrab?: (index: number, event: PointerEvent<HTMLDivElement>) => void
  }
) {
  return (
    <div className={area} style={{ width: mm(width), height: mm(height) }}>
      {grid !== undefined && (
        <svg viewBox={`0 0 ${width} ${height}`} className={`${layer} screen-only`}>
          <g stroke={GRID_LINE.color} strokeWidth={GRID_LINE.width}>
            {lines(grid.x, width).map((x) => <line key={`x${x}`} x1={x} x2={x} y1={0} y2={height} />)}
            {lines(grid.y, height).map((y) => <line key={`y${y}`} x1={0} x2={width} y1={y} y2={y} />)}
          </g>
        </svg>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className={layer}>
        {links.map(({ a, b, from, to }) =>
          from === undefined || to === undefined ? null : (
            <line
              key={`${a}–${b}`}
              x1={from[0]}
              y1={from[1]}
              x2={to[0]}
              y2={to[1]}
              stroke="black"
              strokeWidth={LINK}
              strokeLinecap="round"
            />
          )
        )}
      </svg>
      {placed.map((n, i) => (
        <div
          key={n.name}
          className={cx(item, conflicts?.has(i) === true && conflict, selected === i && chosen)}
          style={{ marginLeft: mm(n.x), marginTop: mm(n.y - HEADER) }}
        >
          <Neighborhood
            name={n.name}
            columns={n.columns}
            onGrab={onGrab === undefined ? undefined : (event) => onGrab(i, event)}
          />
        </div>
      ))}
      {seams !== undefined && (
        <svg viewBox={`0 0 ${width} ${height}`} className={`${layer} screen-only`} style={{ pointerEvents: "none" }}>
          <g stroke="#2563eb" strokeWidth={0.5} strokeDasharray="4 3">
            {seams.xs.map((x) => <line key={`x${x}`} x1={x} x2={x} y1={0} y2={height} />)}
            {seams.ys.map((y) => <line key={`y${y}`} x1={0} x2={width} y1={y} y2={y} />)}
          </g>
        </svg>
      )}
    </div>
  )
}

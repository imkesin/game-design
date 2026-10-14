import { type PointerEvent, useId } from "react"
import { mm } from "~/games/revival/skyline/mm"
import { css, cx } from "~/generated/styled-system/css"
import { Neighborhood } from "./Neighborhood.tsx"
import { type Grid, HEADER, type NeighborhoodSpec, PLOT, type Shape } from "./skyline.ts"
import type { Bridge, Cell, Cells } from "./water.ts"

/**
 * The whole map at true size, origin at its top-left: streets between
 * territories, water over their ends, bridges over the water, then each
 * neighborhood (tag included) at its place. Shared by the on-screen editor and
 * the printed tiles, which each show a window onto it.
 */

/** Screen-only plot grid: faint, so it guides without reading as part of the map. */
const GRID_LINE = { width: 0.3, color: "#c7d2e3" }

/** A street: one line along the cell sides between two territories. */
const STREET = { width: 1.2, color: "#1f1f1f" }

/**
 * Water: black wavy lines (a halftone, like the neighborhoods' dots) inside a
 * grey coastline, on white so streets running into it stop at the coast. One
 * tile holds one wavelength, rising at both ends so tiles join smoothly.
 */
const WAVES = { pitch: 2.4, wavelength: 6, amplitude: 0.3, width: 0.25 }
const WAVE = (() => {
  const { pitch, wavelength: w, amplitude: a } = WAVES
  const y = pitch / 2
  return `M0 ${y}Q${w / 4} ${y - 2 * a} ${w / 2} ${y}T${w} ${y}`
})()
const COAST = { width: 0.6, color: "#4a4a4a" }

/**
 * A bridge: a white planked deck over its cells and `reach` onto the land at
 * each end, between heavy black rails that splay out at the ends.
 */
const BRIDGE = { deck: 10, reach: 4, rail: 1.2, splay: 3, plank: { pitch: 2.5, width: 0.3 } }

export type Placed = NeighborhoodSpec & { shape: Shape }

/** Everything printed: the map minus the editor's screen-only aids. */
export type MapLayers = {
  width: number
  height: number
  cells: Cells
  placed: readonly Placed[]
  /** Street path (`territory.ts`). */
  streets: string
  /** Coastline path (`water.ts`); empty when there is no water. */
  coast: string
  bridges: readonly Bridge[]
}

const area = css({ display: "grid", gridTemplateAreas: `"map"` })

const layer = css({ gridArea: "map", width: "100%", height: "100%" })

const item = css({ gridArea: "map", justifySelf: "start", alignSelf: "start" })

/** Screen-only warning: on a seam, too close to one, off the board, in water or crowding another. */
const conflict = css({ outline: "solid #dc2626", outlineWidth: "calc(1 * var(--u))" })

/** Screen-only: the neighborhood being edited. */
const chosen = css({ boxShadow: "0 0 0 calc(2.5 * var(--u)) rgba(37, 99, 235, 0.4)" })

/** Grid lines from `first` across `length`. */
const lines = (first: number, length: number) =>
  Array.from({ length: Math.floor((length - first) / PLOT) + 1 }, (_, k) => first + k * PLOT)

function BridgeMark({ bridge: { cells: run, across }, cells: { x0, y0 } }: { bridge: Bridge; cells: Cells }) {
  const [[c0, r0], [c1, r1]] = [run[0]!, run.at(-1)!]
  const [cx_, cy] = [x0 + ((c0 + c1) / 2 + 0.5) * PLOT, y0 + ((r0 + r1) / 2 + 0.5) * PLOT]
  const half = (run.length * PLOT) / 2 + BRIDGE.reach
  const side = BRIDGE.deck / 2
  const { splay, plank } = BRIDGE
  const planks = Array.from({ length: Math.floor((2 * half) / plank.pitch) }, (_, k) => -half + (k + 0.5) * plank.pitch)
  const rail = (v: 1 | -1) =>
    `M${-half - splay} ${v * (side + splay)}L${-half} ${v * side}H${half}L${half + splay} ${v * (side + splay)}`
  return (
    <g transform={`translate(${cx_} ${cy})${across === "column" ? " rotate(90)" : ""}`}>
      <rect x={-half} y={-side} width={2 * half} height={2 * side} fill="white" />
      <g stroke="black" strokeWidth={plank.width}>
        {planks.map((u) => <line key={u} x1={u} x2={u} y1={-side} y2={side} />)}
      </g>
      <path d={rail(-1) + rail(1)} fill="none" stroke="black" strokeWidth={BRIDGE.rail} />
    </g>
  )
}

export function SkylineMap(
  {
    width,
    height,
    cells,
    placed,
    streets,
    coast,
    bridges,
    tint,
    stray,
    conflicts,
    selected,
    seams,
    grid,
    onGrab
  }:
    & MapLayers
    & {
      /** Screen-only: a colour per held cell, to show territories while painting them. */
      tint?: readonly { cell: Cell; color: string }[]
      /** Screen-only: bridge cells that don't make a bridge. */
      stray?: readonly Cell[]
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
  const { x0, y0 } = cells
  const at = ([c, r]: Cell) => ({ x: x0 + c * PLOT, y: y0 + r * PLOT, width: PLOT, height: PLOT })
  const hatch = `hatch${useId().replace(/[^\w-]/g, "")}`
  return (
    <div className={area} style={{ width: mm(width), height: mm(height) }}>
      {tint !== undefined && (
        <svg viewBox={`0 0 ${width} ${height}`} className={`${layer} screen-only`}>
          {tint.map(({ cell, color }) => <rect key={`${cell[0]},${cell[1]}`} {...at(cell)} fill={color} />)}
        </svg>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className={layer}>
        <path d={streets} fill="none" stroke={STREET.color} strokeWidth={STREET.width} strokeLinecap="square" />
      </svg>
      {coast !== "" && (
        <svg viewBox={`0 0 ${width} ${height}`} className={layer}>
          <defs>
            <pattern id={hatch} width={WAVES.wavelength} height={WAVES.pitch} patternUnits="userSpaceOnUse">
              <path d={WAVE} fill="none" stroke="black" strokeWidth={WAVES.width} />
            </pattern>
          </defs>
          <path d={coast} fill="white" fillRule="evenodd" />
          <path
            d={coast}
            fill={`url(#${hatch})`}
            fillRule="evenodd"
            stroke={COAST.color}
            strokeWidth={COAST.width}
          />
        </svg>
      )}
      {grid !== undefined && (
        <svg viewBox={`0 0 ${width} ${height}`} className={`${layer} screen-only`}>
          <g stroke={GRID_LINE.color} strokeWidth={GRID_LINE.width}>
            {lines(grid.x, width).map((x) => <line key={`x${x}`} x1={x} x2={x} y1={0} y2={height} />)}
            {lines(grid.y, height).map((y) => <line key={`y${y}`} x1={0} x2={width} y1={y} y2={y} />)}
          </g>
        </svg>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className={layer}>
        {bridges.map((bridge) => (
          <BridgeMark key={`${bridge.cells[0]![0]},${bridge.cells[0]![1]}`} bridge={bridge} cells={cells} />
        ))}
      </svg>
      {stray !== undefined && stray.length > 0 && (
        <svg viewBox={`0 0 ${width} ${height}`} className={`${layer} screen-only`}>
          {stray.map((cell) => (
            <rect
              key={`${cell[0]},${cell[1]}`}
              {...at(cell)}
              fill="rgba(220, 38, 38, 0.25)"
              stroke="#dc2626"
              strokeWidth={1}
            />
          ))}
        </svg>
      )}
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

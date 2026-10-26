import type { ReactNode } from "react"
import { css } from "~/generated/styled-system/css"
import { Block } from "./Block.tsx"
import { BORDER, BUFFER, type City, crossingName, layoutOf, PLOT, type Track } from "./blocks.ts"
import { GROUND } from "./hatch.tsx"
import { mm } from "./mm.ts"

/**
 * The whole city at true size, origin at the board's top-left: each
 * neighborhood in its block-row and block-column; streets and margins as grid
 * tracks. A hard border (the city's edge) runs under the outermost plots,
 * through their middles, so they hang half outside it. Each intersection's name is written on it (D4: its street
 * from the left, A, B, …, then from the bottom, 1, 2, …), except on a street
 * down a tile edge, where a fold or cut would crack it, and City Hall's.
 * Shared by the on-screen board and the printed tiles.
 */

const board = css({ display: "grid" })

const groundLayer = css({ gridRow: "1 / -1", gridColumn: "1 / -1", width: "100%", height: "100%" })

const seamLayer = css({ gridRow: "1 / -1", gridColumn: "1 / -1", width: "100%", height: "100%", pointerEvents: "none" })

const onTop = css({ placeSelf: "center", display: "grid" })

/** An intersection's name, written on it. */
const streetLabel = css({ placeSelf: "center", fontSize: "calc(4.5 * var(--u))", fontWeight: 600, lineHeight: 1 })

/** Where each track starts along an axis, in mm, plus the axis's end. */
const offsets = (tracks: readonly Track[]) =>
  tracks.reduce<number[]>((at, t) => [...at, (at.at(-1) ?? 0) + t.size], [0])

/**
 * Each street's grid lines along an axis, by its index from the board's left
 * or top; `seam` if it runs down a tile edge (two tracks).
 */
function streetLines(tracks: readonly Track[]) {
  const lines: [number, number][] = []
  tracks.forEach(({ street }, i) => {
    if (street === undefined) return
    const [start] = lines[street] ?? [i + 1]
    lines[street] = [start, i + 2]
  })
  return lines.map(([a, b]) => ({ span: `${a} / ${b}`, seam: b - a > 1 }))
}

/** The streets whose intersections are named, by index: those not down a tile edge. */
const named = (lines: ReturnType<typeof streetLines>) =>
  lines.flatMap(({ span, seam }, s) => seam ? [] : [{ span, street: s }])

/** Where the city's border runs along an axis, in mm: through the middle of the first and last plots. */
function extent(tracks: readonly Track[]) {
  const at = offsets(tracks)
  const first = tracks.findIndex((t) => t.block !== undefined)
  const last = tracks.findLastIndex((t) => t.block !== undefined)
  const inset = BUFFER + PLOT / 2
  return { from: (at[first] ?? 0) + inset, to: (at[last + 1] ?? 0) - inset }
}

export function CityMap(
  { city, xs, ys, width, height, seams, pieces, hall }: {
    city: City
    xs: readonly Track[]
    ys: readonly Track[]
    width: number
    height: number
    /** Screen-only cut lines, in mm from the board's origin. */
    seams?: { xs: readonly number[]; ys: readonly number[] }
    /** Screen-only pieces on plots, by (x, y) in plots from the board's top-left. */
    pieces?: ((x: number, y: number) => ReactNode) | undefined
    /** A screen-only piece on City Hall's intersection. */
    hall?: ReactNode
  }
) {
  const area = (r: number, c: number) => `n${r}x${c}`
  const [rows, cols] = [city.rows.flat().length, city.cols.flat().length]
  /** Tracks count block-rows from the top; the city counts them from the bottom. */
  const fromBottom = (block: number) => rows - 1 - block
  const cell = (x: Track, y: Track) =>
    y.block === undefined || x.block === undefined ? "." : area(fromBottom(y.block), x.block)
  const areas = ys.map((y) => `"${xs.map((x) => cell(x, y)).join(" ")}"`)
  const [across, up] = [streetLines(xs), streetLines(ys)]
  /** Horizontal streets count from the top in tracks, from the bottom on the board. */
  const upFromBottom = (s: number) => up.length - 1 - s
  /** Where each block-column starts, and each block-row (from the bottom), in plots from the top-left. */
  const starts = (spans: readonly number[]) => spans.map((_, i) => spans.slice(0, i).reduce((a, b) => a + b, 0))
  const [left, top] = [starts(city.cols.flat()), starts(city.rows.flat().reverse())]
  const [hallColumn, hallRow] = [across[city.hall.col], up[rows - 2 - city.hall.row]]
  const hallAt = { column: hallColumn?.span, row: hallRow?.span }
  const [wide, tall] = [extent(xs), extent(ys)]
  return (
    <div
      className={board}
      style={{
        width: mm(width),
        height: mm(height),
        gridTemplateAreas: areas.join(" "),
        gridTemplateColumns: xs.map((t) => mm(t.size)).join(" "),
        gridTemplateRows: ys.map((t) => mm(t.size)).join(" ")
      }}
    >
      {/* Streets, their crossings and the plaza: one sheet under the blocks, so nothing seams. */}
      <svg viewBox={`0 0 ${width} ${height}`} className={groundLayer}>
        <rect
          x={wide.from}
          y={tall.from}
          width={wide.to - wide.from}
          height={tall.to - tall.from}
          fill={GROUND.street.color}
          stroke={BORDER.color}
          strokeWidth={BORDER.width}
        />
      </svg>
      {Array.from({ length: rows }, (_, r) =>
        Array.from(
          { length: cols },
          (_, c) => (
            <Block
              key={area(r, c)}
              style={{ gridArea: area(r, c) }}
              layout={layoutOf(city, r, c)}
              pieces={pieces &&
                ((col, row) => pieces((left[c] ?? 0) + col, (top[fromBottom(r)] ?? 0) + row))}
            />
          )
        ))}
      {named(across).flatMap(({ span: column, street: col }) =>
        named(up).flatMap(({ span: row, street }) => {
          const upward = upFromBottom(street)
          if (col === city.hall.col && upward === city.hall.row) return []
          const name = crossingName(col, upward)
          return (
            <div
              key={name}
              className={streetLabel}
              style={{ gridColumn: column, gridRow: row, color: GROUND.streetName.color }}
            >
              {name}
            </div>
          )
        })
      )}
      {hall !== undefined && (
        <div className={`${onTop} screen-only`} style={{ gridColumn: hallAt.column, gridRow: hallAt.row }}>
          {hall}
        </div>
      )}
      {seams !== undefined && (
        <svg viewBox={`0 0 ${width} ${height}`} className={`${seamLayer} screen-only`}>
          <g stroke="#2563eb" strokeWidth={0.5} strokeDasharray="4 3">
            {seams.xs.map((x) => <line key={`x${x}`} x1={x} x2={x} y1={0} y2={height} />)}
            {seams.ys.map((y) => <line key={`y${y}`} x1={0} x2={width} y1={y} y2={y} />)}
          </g>
        </svg>
      )}
    </div>
  )
}

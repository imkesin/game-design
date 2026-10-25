import type { ReactNode } from "react"
import { css } from "~/generated/styled-system/css"
import { Block } from "./Block.tsx"
import { type City, layoutOf, streetName, type Track } from "./blocks.ts"
import { mm } from "./mm.ts"

/**
 * The whole city at true size, origin at the board's top-left: each
 * neighborhood in its block-row and block-column; streets and margins as grid
 * tracks, each street named at both ends (A, B, … from the left, 1, 2, … from
 * the bottom) unless it runs down a tile edge, where the fold or cut marks it.
 * Shared by the on-screen board and the printed tiles.
 */

const board = css({ display: "grid" })

const seamLayer = css({ gridRow: "1 / -1", gridColumn: "1 / -1", width: "100%", height: "100%", pointerEvents: "none" })

const onTop = css({ placeSelf: "center", display: "grid" })

/** A street's name where it leaves the city: faint, since it's only looked up. */
const streetLabel = css({
  placeSelf: "center",
  color: "#a3a3a3",
  fontSize: "calc(6 * var(--u))",
  fontWeight: 500,
  lineHeight: 1
})

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

/** The streets to name, with their names: those not down a tile edge. */
const named = (lines: ReturnType<typeof streetLines>, name: (street: number) => string) =>
  lines.flatMap(({ span, seam }, s) => seam ? [] : [{ span, name: name(s) }])

/** Grid lines of the first and last block tracks along an axis. */
function endLines(tracks: readonly Track[]) {
  const first = tracks.findIndex((t) => t.block !== undefined)
  const last = tracks.findLastIndex((t) => t.block !== undefined)
  return [`${first + 1}`, `${last + 1}`]
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
  const nameUp = (s: number) => streetName.up(up.length - 1 - s)
  /** Where each block-column starts, and each block-row (from the bottom), in plots from the top-left. */
  const starts = (spans: readonly number[]) => spans.map((_, i) => spans.slice(0, i).reduce((a, b) => a + b, 0))
  const [left, top] = [starts(city.cols.flat()), starts(city.rows.flat().reverse())]
  const hallAt = { column: across[city.hall.col]?.span, row: up[rows - 2 - city.hall.row]?.span }
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
      {named(across, streetName.across).flatMap(({ span: column, name }) =>
        endLines(ys).map((row) => (
          <div key={`${name}@${row}`} className={streetLabel} style={{ gridColumn: column, gridRow: row }}>
            {name}
          </div>
        ))
      )}
      {named(up, nameUp).flatMap(({ span: row, name }) =>
        endLines(xs).map((column) => (
          <div key={`${name}@${column}`} className={streetLabel} style={{ gridColumn: column, gridRow: row }}>
            {name}
          </div>
        ))
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

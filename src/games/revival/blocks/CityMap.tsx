import { css } from "~/generated/styled-system/css"
import { Block } from "./Block.tsx"
import type { City, Track } from "./blocks.ts"
import { mm } from "./mm.ts"

/**
 * The whole city at true size, origin at the board's top-left: each
 * neighborhood in its block-row and block-column, labelled with its
 * coordinates (columns A, B, … from the left, rows 1, 2, … from the bottom)
 * except City Hall, which is named; streets and margins as empty grid tracks. Shared by the on-screen board and the printed tiles.
 */

const board = css({ display: "grid" })

const seamLayer = css({ gridRow: "1 / -1", gridColumn: "1 / -1", width: "100%", height: "100%", pointerEvents: "none" })

export function CityMap(
  { city, xs, ys, width, height, seams }: {
    city: City
    xs: readonly Track[]
    ys: readonly Track[]
    width: number
    height: number
    /** Screen-only cut lines, in mm from the board's origin. */
    seams?: { xs: readonly number[]; ys: readonly number[] }
  }
) {
  const area = (r: number, c: number) => `n${r}x${c}`
  const heights = city.heights.flat()
  /** Tracks count block-rows from the top; the city counts them from the bottom. */
  const fromBottom = (block: number) => heights.length - 1 - block
  const cell = (x: Track, y: Track) =>
    y.block === undefined || x.block === undefined ? "." : area(fromBottom(y.block), x.block)
  const areas = ys.map((y) => `"${xs.map((x) => cell(x, y)).join(" ")}"`)
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
      {city.neighborhoods.flatMap((row, r) =>
        row.map((columns, c) => {
          const hall = city.hall[0] === r && city.hall[1] === c
          return (
            <Block
              key={area(r, c)}
              columns={columns}
              plots={heights[r]}
              label={hall ? "CITY\nHALL" : `${String.fromCharCode(65 + c)}${r + 1}`}
              style={{ gridArea: area(r, c) }}
            />
          )
        })
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

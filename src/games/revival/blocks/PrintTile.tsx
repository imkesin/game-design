import type { ReactNode } from "react"
import { css } from "~/generated/styled-system/css"
import { mm } from "./mm.ts"
import { Paper } from "./Paper.tsx"

/**
 * One printed tile of a map split across sheets: the window of the map
 * at (`col`, `row`), filling the sheet's printable area, with crop marks just
 * outside its corners and a dotted line along its edges. Trim on the line and
 * butt the tiles together.
 */

/** Crop marks run from `gap` to `gap + length` outside each corner, inside the sheet's margin. */
const MARK = { gap: 0.5, length: 2, width: 0.2 }

/** A dotted line along every trim edge; every cut runs down a white street, so it shows. */
const CUT = { width: 0.3, dash: "0.3 1.2", color: "#737373" }

const tile = css({ display: "grid", gridTemplateAreas: `"tile"` })

const window_ = css({ gridArea: "tile", overflow: "hidden" })

const marks = css({ gridArea: "tile", width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" })

export function PrintTile(
  { col, row, cols, rows, width, height, margin, children }: {
    col: number
    row: number
    cols: number
    rows: number
    /** The tile (printable area) size, in mm. */
    width: number
    height: number
    /** The sheet's margin around the tile, in mm. */
    margin: number
    /** The whole map, at true size from its top-left. */
    children: ReactNode
  }
) {
  const label = `Tile ${row * cols + col + 1} of ${cols * rows} · row ${row + 1}, column ${col + 1}`
  const [near, far] = [MARK.gap, MARK.gap + MARK.length]
  const corners = [[0, 0, -1, -1], [width, 0, 1, -1], [0, height, -1, 1], [width, height, 1, 1]] as const
  return (
    <Paper width={width + 2 * margin} height={height + 2 * margin} areaWidth={width} areaHeight={height} title={label}>
      <div className={tile} style={{ width: mm(width), height: mm(height) }}>
        <div className={window_}>
          <div style={{ marginLeft: mm(-col * width), marginTop: mm(-row * height) }}>
            {children}
          </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className={marks}>
          <rect
            width={width}
            height={height}
            fill="none"
            stroke={CUT.color}
            strokeWidth={CUT.width}
            strokeDasharray={CUT.dash}
            strokeLinecap="round"
          />
          <g stroke="black" strokeWidth={MARK.width}>
            {corners.map(([x, y, dx, dy]) => (
              <g key={`${x},${y}`}>
                <line x1={x + dx * near} x2={x + dx * far} y1={y} y2={y} />
                <line x1={x} x2={x} y1={y + dy * near} y2={y + dy * far} />
              </g>
            ))}
          </g>
          <text x={width / 2} y={height + 1.8} fontSize={1.6} fill="#777" textAnchor="middle">{label}</text>
        </svg>
      </div>
    </Paper>
  )
}

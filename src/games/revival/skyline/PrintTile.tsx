import { mm } from "~/games/revival/city/mm"
import { Paper } from "~/games/revival/city/Paper"
import { css } from "~/generated/styled-system/css"
import { type DrawnLink, type Placed, SkylineMap } from "./SkylineMap.tsx"

/**
 * One printed tile of a map split across Letter sheets: the window of the map
 * at (`col`, `row`), filling the sheet's printable area, with crop marks just
 * outside its corners. Trim on the marks and butt the tiles together.
 */

/** The sheet: the tile plus a ¼in margin all round. */
const MARGIN = 6.35

/** Crop marks run from `gap` to `gap + length` outside each corner, inside the ¼in margin. */
const MARK = { gap: 0.5, length: 2, width: 0.2 }

const tile = css({ display: "grid", gridTemplateAreas: `"tile"` })

const window_ = css({ gridArea: "tile", overflow: "hidden" })

const marks = css({ gridArea: "tile", width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" })

export function PrintTile(
  { col, row, cols, rows, width, height, map }: {
    col: number
    row: number
    cols: number
    rows: number
    /** The tile (printable area) size, in mm. */
    width: number
    height: number
    map: { width: number; height: number; placed: readonly Placed[]; links: readonly DrawnLink[] }
  }
) {
  const label = `Tile ${row * cols + col + 1} of ${cols * rows} · row ${row + 1}, column ${col + 1}`
  const [near, far] = [MARK.gap, MARK.gap + MARK.length]
  const corners = [[0, 0, -1, -1], [width, 0, 1, -1], [0, height, -1, 1], [width, height, 1, 1]] as const
  return (
    <Paper width={width + 2 * MARGIN} height={height + 2 * MARGIN} areaWidth={width} areaHeight={height} title={label}>
      <div className={tile} style={{ width: mm(width), height: mm(height) }}>
        <div className={window_}>
          <div style={{ marginLeft: mm(-col * width), marginTop: mm(-row * height) }}>
            <SkylineMap {...map} />
          </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className={marks}>
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

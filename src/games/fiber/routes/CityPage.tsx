import { CITY, type Run, UNIT, type UnitEdge } from "~/games/fiber/city/city"
import { COLOR } from "~/games/fiber/colors"
import { CORNER, STICK_SLOT } from "~/games/fiber/map/map"
import { CABLE_WIDTH, HaloRect } from "~/games/fiber/routes/MapPage"
import { css } from "~/generated/styled-system/css"

/** Grid city experiment: neighborhoods outlined by cable dividers, merged-cell blocks, FDH on a centred interior vertex. */

/** Sheet beyond the grid: rim-touching lines carry on through it, and everything fades to paper over FADE mm from the edge. */
const MARGIN = 20
const FADE = 35
/** Bordered stick slot, as on the regional map. */
const SLOT_BOX = { length: STICK_SLOT.length + 2 * STICK_SLOT.border, width: STICK_SLOT.width + 2 * STICK_SLOT.border }
/** FDH: a 12mm square slot in a 1mm grey border, centred on its vertex. */
const FDH = { size: 12, border: 1 }

/** Block boundaries inside a neighborhood: light and thinner than the cable, running edge to edge under the dividers. */
const MINOR = { color: COLOR.gridMajor, width: 1 }

const W = CITY.cols * UNIT + 2 * MARGIN
const H = CITY.rows * UNIT + 2 * MARGIN

const root = css({
  display: "grid",
  gridTemplateAreas: `
    "info"
    "board"`,
  justifyItems: "center",
  alignContent: "start",
  gap: "16px",
  padding: "24px",
  minHeight: "100vh",
  background: "#404040",
  color: "#e5e5e5",
  fontFamily: "system-ui, sans-serif",
  fontSize: "13px"
})
const info = css({ gridArea: "info" })
const board = css({ gridArea: "board", background: "white" })

const px = (col: number) => MARGIN + col * UNIT
const py = (row: number) => MARGIN + row * UNIT

function unitEnds(e: UnitEdge) {
  return edgeEnds({ ...e, length: 1 }, 0)
}

/** Line ends pulled in by `trim` at interior vertices; at the rim they run on through the margin instead. */
function edgeEnds(e: Run, trim: number) {
  const a = { row: e.row, col: e.col }
  const b = e.dir === "h" ? { row: e.row, col: e.col + e.length } : { row: e.row + e.length, col: e.col }
  const ta = CITY.onRim(a) ? -MARGIN : trim
  const tb = CITY.onRim(b) ? -MARGIN : trim
  return e.dir === "h"
    ? { x1: px(a.col) + ta, y1: py(a.row), x2: px(b.col) - tb, y2: py(b.row) }
    : { x1: px(a.col), y1: py(a.row) + ta, x2: px(b.col), y2: py(b.row) - tb }
}

function CityArt() {
  return (
    <svg width={`${W}mm`} height={`${H}mm`} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="fade-x" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={W} y2={0}>
          <stop offset={0} stopColor="black" />
          <stop offset={FADE / W} stopColor="white" />
          <stop offset={1 - FADE / W} stopColor="white" />
          <stop offset={1} stopColor="black" />
        </linearGradient>
        <linearGradient id="fade-y" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={H}>
          <stop offset={0} stopColor="black" />
          <stop offset={FADE / H} stopColor="white" />
          <stop offset={1 - FADE / H} stopColor="white" />
          <stop offset={1} stopColor="black" />
        </linearGradient>
        <mask id="mask-x" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect width={W} height={H} fill="url(#fade-x)" />
        </mask>
        <mask id="mask-y" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect width={W} height={H} fill="url(#fade-y)" />
        </mask>
      </defs>
      <rect width={W} height={H} fill={COLOR.paper} />
      {/* Nested masks multiply, so corners fade on both axes. */}
      <g mask="url(#mask-x)">
        <g mask="url(#mask-y)">
          {CITY.minors.map((e) => (
            <line
              key={`minor-${e.dir}${e.row},${e.col}`}
              {...unitEnds(e)}
              stroke={MINOR.color}
              strokeWidth={MINOR.width}
              strokeLinecap="square"
            />
          ))}

          {CITY.runs.map((e) => (
            <line
              key={`cable-${e.dir}${e.row},${e.col}`}
              {...edgeEnds(e, 0)}
              stroke={COLOR.cable}
              strokeWidth={CABLE_WIDTH}
              strokeLinecap="square"
            />
          ))}
          {CITY.runs.map((e) => {
            const { x1, y1, x2, y2 } = {
              x1: px(e.col),
              y1: py(e.row),
              x2: px(e.dir === "h" ? e.col + e.length : e.col),
              y2: py(e.dir === "v" ? e.row + e.length : e.row)
            }
            const cx = (x1 + x2) / 2
            const cy = (y1 + y2) / 2
            return (
              <g
                key={`slot-${e.dir}${e.row},${e.col}`}
                {...(e.dir === "v" ? { transform: `rotate(90 ${cx} ${cy})` } : {})}
              >
                <rect
                  rx={STICK_SLOT.radius}
                  x={cx - SLOT_BOX.length / 2}
                  y={cy - SLOT_BOX.width / 2}
                  width={SLOT_BOX.length}
                  height={SLOT_BOX.width}
                  fill={COLOR.board}
                />
                <rect
                  rx={CORNER}
                  x={cx - STICK_SLOT.length / 2}
                  y={cy - STICK_SLOT.width / 2}
                  width={STICK_SLOT.length}
                  height={STICK_SLOT.width}
                  fill={COLOR.stickSlot}
                />
              </g>
            )
          })}

          {CITY.hoods.map((h) => {
            const cx = px(h.fdh.col)
            const cy = py(h.fdh.row)
            const pad = FDH.size + 2 * FDH.border
            return (
              <g key={h.id}>
                <rect x={cx - pad / 2} y={cy - pad / 2} width={pad} height={pad} rx={CORNER} fill={COLOR.pad2} />
                <HaloRect x={cx - FDH.size / 2} y={cy - FDH.size / 2} width={FDH.size} height={FDH.size} />
              </g>
            )
          })}
        </g>
      </g>
    </svg>
  )
}

export function CityPage() {
  return (
    <div className={root}>
      <div className={info}>
        City grid · {CITY.cols} × {CITY.rows} @ {UNIT}mm ({(W / 25.4).toFixed(1)} × {(H / 25.4).toFixed(1)}in) ·{" "}
        {CITY.hoods.length} neighborhoods · {CITY.blocks.length} blocks · {CITY.runs.length} links · {CITY.nodes.length}
        {" "}
        junctions
      </div>
      <div className={board}>
        <CityArt />
      </div>
    </div>
  )
}

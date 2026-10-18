import { TILE, Tile } from "~/games/revival/tiles/Tile"
import { type TileFace, TILES } from "~/games/revival/tiles/tiles"
import { css } from "~/generated/styled-system/css"

/**
 * The tiles on Letter sticker sheets, 6 × 8 per sheet, butted edge to edge so
 * a trimmer cuts whole rows and columns; ticks in the margins mark every cut.
 * Stick each sheet on cardstock, then cut. Print at 100% with no margins.
 */

const PAGE = { width: 215.9, height: 279.4 }
const GRID = { cols: 6, rows: 8 }
const PER_SHEET = GRID.cols * GRID.rows
const MARGIN = { x: (PAGE.width - GRID.cols * TILE) / 2, y: (PAGE.height - GRID.rows * TILE) / 2 }
const TICK = { length: 5, width: 0.2 }

type Sheet = { title: string; faces: readonly (TileFace | undefined)[] }

function chunks<T>(list: readonly T[], size: number) {
  return Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size))
}

const sheets = chunks(TILES, PER_SHEET)
const SHEETS: readonly Sheet[] = sheets.map((faces, i) => ({ title: `Tiles ${i + 1} of ${sheets.length}`, faces }))

const printCss = `
  @page { size: letter; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .tiles-root { background: #fff !important; padding: 0 !important; gap: 0 !important; }
    .tiles-sheet { box-shadow: none !important; }
    .tiles-sheet:not(:first-of-type) { break-before: page; }
  }
`

const root = css({
  display: "grid",
  justifyItems: "center",
  gap: "24px",
  padding: "24px",
  minHeight: "100vh",
  background: "#525252"
})

const sheet = css({
  display: "grid",
  gridTemplateAreas: `"sheet"`,
  background: "white",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  fontFamily: "sans-serif",
  "& > *": { gridArea: "sheet" }
})

const grid = css({ display: "grid", placeSelf: "center" })

const label = css({
  alignSelf: "end",
  justifySelf: "center",
  color: "#737373",
  fontSize: "2.6mm",
  paddingBottom: "4mm"
})

function Ticks() {
  const xs = Array.from({ length: GRID.cols + 1 }, (_, c) => MARGIN.x + c * TILE)
  const ys = Array.from({ length: GRID.rows + 1 }, (_, r) => MARGIN.y + r * TILE)
  const gap = 1
  return (
    <svg viewBox={`0 0 ${PAGE.width} ${PAGE.height}`} width={`${PAGE.width}mm`} height={`${PAGE.height}mm`}>
      <g stroke="black" strokeWidth={TICK.width}>
        {xs.map((x) => (
          <g key={`x${x}`}>
            <line x1={x} x2={x} y1={MARGIN.y - gap - TICK.length} y2={MARGIN.y - gap} />
            <line x1={x} x2={x} y1={PAGE.height - MARGIN.y + gap} y2={PAGE.height - MARGIN.y + gap + TICK.length} />
          </g>
        ))}
        {ys.map((y) => (
          <g key={`y${y}`}>
            <line y1={y} y2={y} x1={MARGIN.x - gap - TICK.length} x2={MARGIN.x - gap} />
            <line y1={y} y2={y} x1={PAGE.width - MARGIN.x + gap} x2={PAGE.width - MARGIN.x + gap + TICK.length} />
          </g>
        ))}
      </g>
    </svg>
  )
}

export function TilesPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`tiles-root ${root}`}>
        {SHEETS.map(({ title, faces }) => (
          <div
            key={title}
            className={`tiles-sheet ${sheet}`}
            style={{ width: `${PAGE.width}mm`, height: `${PAGE.height}mm` }}
          >
            <Ticks />
            <div
              className={grid}
              style={{
                gridTemplateColumns: `repeat(${GRID.cols}, ${TILE}mm)`,
                gridTemplateRows: `repeat(${GRID.rows}, ${TILE}mm)`
              }}
            >
              {Array.from({ length: PER_SHEET }, (_, i) => <Tile key={i} face={faces[i]} />)}
            </div>
            <div className={label}>{title}</div>
          </div>
        ))}
      </div>
    </>
  )
}

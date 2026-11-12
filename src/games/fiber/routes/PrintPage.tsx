import { IN, SHEET } from "~/games/fiber/map/map"
import { PRINT_LAYERS, useSolvedMap } from "~/games/fiber/map/view"
import { css } from "~/generated/styled-system/css"
import { MapArt } from "./MapPage"

/**
 * The 20 × 20in board as 8 tiles of 10 × 5in, one per US Letter landscape page, centred, with a thin
 * cut line around each and nothing else. Columns split at the vertical fold, rows every 5in, so the
 * tile edges include both real folds. Order: left to right, top to bottom.
 *
 * `?seed=N` prints that reroll (the map page's "Print tiles" link passes it). Print at 100% /
 * "Actual size" with no margins, or run `npx tsx src/games/fiber/print.node.ts` for the PDF.
 */

const PAGE = { width: 11 * IN, height: 8.5 * IN }
const GRID = { cols: 2, rows: 4 }
const TILE = { width: SHEET.width / GRID.cols, height: SHEET.height / GRID.rows }
const TRIM = { x: (PAGE.width - TILE.width) / 2, y: (PAGE.height - TILE.height) / 2 }
/** Cut line around each tile (mm). */
const CUT = 0.25

const printCss = `
  @page { size: letter landscape; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .print-root { padding: 0 !important; gap: 0 !important; background: #fff !important; }
    .print-page { box-shadow: none !important; }
  }
`

const root = css({ display: "grid", justifyItems: "center", gap: "24px", padding: "24px", background: "#404040" })
const pageBox = css({ background: "white", boxShadow: "0 0 0 1px #a3a3a3", breakAfter: "page", overflow: "hidden" })

const TILES = Array.from({ length: GRID.rows * GRID.cols }, (_, i) => ({
  left: (i % GRID.cols) * TILE.width,
  top: Math.floor(i / GRID.cols) * TILE.height
}))

export function PrintPage() {
  const seed = Number(new URLSearchParams(window.location.search).get("seed") ?? 0) || 0
  const view = useSolvedMap(seed)
  return (
    <div className={`print-root ${root}`}>
      <style>{printCss}</style>
      {TILES.map(({ left, top }) => (
        <svg
          key={`${left}-${top}`}
          className={`print-page ${pageBox}`}
          viewBox={`0 0 ${PAGE.width} ${PAGE.height}`}
          style={{ width: `${PAGE.width}mm`, height: `${PAGE.height}mm` }}
        >
          <svg
            x={TRIM.x}
            y={TRIM.y}
            width={TILE.width}
            height={TILE.height}
            viewBox={`${left} ${top} ${TILE.width} ${TILE.height}`}
          >
            <MapArt view={view} layers={PRINT_LAYERS} />
          </svg>
          <rect
            x={TRIM.x}
            y={TRIM.y}
            width={TILE.width}
            height={TILE.height}
            fill="none"
            stroke="#000"
            strokeWidth={CUT}
          />
        </svg>
      ))}
    </div>
  )
}

import { useState } from "react"
import { axis, RING_PLOTS, STREET } from "~/games/revival/blocks/blocks"
import { CITY } from "~/games/revival/blocks/city"
import { CityMap } from "~/games/revival/blocks/CityMap"
import { Desk } from "~/games/revival/blocks/Desk"
import { mm } from "~/games/revival/blocks/mm"
import { Paper } from "~/games/revival/blocks/Paper"
import { PrintTile } from "~/games/revival/blocks/PrintTile"
import { pageOf, type Sheet, SHEETS } from "~/games/revival/boards/sheets"
import { css } from "~/generated/styled-system/css"

/**
 * Ring neighborhoods on a board split into tiles: a matrix of neighborhoods
 * with streets between them, every tile edge (a cut or a fold) down the middle
 * of a street. On screen: the whole board with its tile edges, and anything
 * that doesn't fit called out. In print: one page per tile with crop marks, or
 * one full-bleed page for a folding board.
 */

const IN = 25.4
const SHEET = SHEETS.quadFold as Sheet
const TILE = SHEET.tile
const TILES = { cols: CITY.cols.length, rows: CITY.rows.length }
const BOARD = { width: TILES.cols * TILE.width, height: TILES.rows * TILE.height }
const PAGE = pageOf(SHEET, BOARD)
/** Clear of a folding board's edges; tiles are trimmed to their edges anyway. */
const INSET = SHEET.kind === "board" ? SHEET.safe : 0
/** The on-screen sheet: a folding board's page, or the board plus a ¼in rim, as if the tiles were one sheet. */
const SCREEN = SHEET.kind === "board" ? PAGE : { width: BOARD.width + IN / 2, height: BOARD.height + IN / 2 }

const SEAMS = {
  xs: Array.from({ length: TILES.cols - 1 }, (_, k) => (k + 1) * TILE.width),
  ys: Array.from({ length: TILES.rows - 1 }, (_, k) => (k + 1) * TILE.height)
}

const X = axis(CITY.cols, TILE.width, INSET)
const Y = axis([...CITY.rows].reverse(), TILE.height, INSET)
const SIZE = { cols: CITY.cols.reduce((a, b) => a + b, 0), rows: CITY.rows.reduce((a, b) => a + b, 0) }

/** What's wrong with the city as written, if anything. */
const PROBLEMS = [
  ...(SHEET.kind === "board" && (SHEET.panels.cols !== TILES.cols || SHEET.panels.rows !== TILES.rows)
    ? [
      `city.ts groups ${TILES.cols}×${TILES.rows} tiles, the board has ${SHEET.panels.cols}×${SHEET.panels.rows} panels`
    ]
    : []),
  ...(SHEET.kind === "board" && SHEET.fold > STREET ? [`folds are wider than streets`] : []),
  ...X.over.map(({ tile, by }) => `tile column ${tile + 1} is ${by.toFixed(1)}mm too wide`),
  ...Y.over.map(({ tile, by }) => `tile row ${TILES.rows - tile} (from the bottom) is ${by.toFixed(1)}mm too tall`)
]

const notes = css({ textTransform: "none", letterSpacing: 0, fontSize: "13px", color: "#333" })

const problem = css({ color: "#dc2626" })

const tiles = css({ display: "contents" })

/** A folding board's page: the board centred in its bleed, the printer's template over it on screen if toggled. */
const bleed = css({ display: "grid", gridTemplateAreas: `"bleed"`, placeItems: "center" })

const layer = css({ gridArea: "bleed" })

/** Multiplied so the template's white boxes don't hide the board. */
const template = css({ width: "100%", height: "100%", mixBlendMode: "multiply", pointerEvents: "none" })

const toggle = css({ display: "grid", gridAutoFlow: "column", gap: "6px", alignItems: "center" })

const TEMPLATE_KEY = "revival:template"

const inches = (n: number) => `${+(n / IN).toFixed(2)}`

export function BlocksPage() {
  const [showTemplate, setShowTemplate] = useState(() => {
    try {
      return localStorage.getItem(TEMPLATE_KEY) === "on"
    } catch {
      return false
    }
  })
  const neighborhoods = SIZE.cols * SIZE.rows
  const plots = neighborhoods * RING_PLOTS.length
  const map = { city: CITY, xs: X.tracks, ys: Y.tracks, ...BOARD }
  const size = `board ${inches(BOARD.width)}×${inches(BOARD.height)}in`
  const layout = SHEET.kind === "board"
    ? `${SHEET.name} · ${size}`
    : `${TILES.cols}×${TILES.rows} ${SHEET.name} tiles · ${size}`
  return (
    <Desk
      pageSize={`${PAGE.width}mm ${PAGE.height}mm`}
      title={`Revival — Blocks (${layout})`}
      notes={
        <>
          {SHEET.kind === "board" && (
            <label className={toggle}>
              <input
                type="checkbox"
                checked={showTemplate}
                onChange={(e) => {
                  try {
                    localStorage.setItem(TEMPLATE_KEY, e.target.checked ? "on" : "off")
                  } catch {
                    // Private mode: just don't remember.
                  }
                  setShowTemplate(e.target.checked)
                }}
              />
              Template
            </label>
          )}
          <span className={notes}>
            {`${neighborhoods} neighborhoods · ${plots} plots`}
            {PROBLEMS.length > 0 && <span className={problem}>{` · ${PROBLEMS.join(" · ")}`}</span>}
          </span>
        </>
      }
    >
      {SHEET.kind === "board"
        ? (
          <Paper {...SCREEN} areaWidth={BOARD.width} areaHeight={BOARD.height} title={layout}>
            <div className={bleed} style={{ width: mm(PAGE.width), height: mm(PAGE.height) }}>
              <div className={layer}>
                <CityMap {...map} seams={SEAMS} />
              </div>
              {showTemplate && <img src={SHEET.template} alt="" className={`${layer} ${template} screen-only`} />}
            </div>
          </Paper>
        )
        : (
          <>
            <div className="screen-only">
              <Paper {...SCREEN} areaWidth={BOARD.width} areaHeight={BOARD.height} title={layout}>
                <CityMap {...map} seams={SEAMS} />
              </Paper>
            </div>
            <div className={`${tiles} print-only`}>
              {Array.from({ length: TILES.rows }, (_, row) =>
                Array.from(
                  { length: TILES.cols },
                  (_, col) => (
                    <PrintTile
                      key={`${row},${col}`}
                      col={col}
                      row={row}
                      {...TILES}
                      {...TILE}
                      margin={SHEET.margin}
                    >
                      <CityMap {...map} />
                    </PrintTile>
                  )
                ))}
            </div>
          </>
        )}
    </Desk>
  )
}

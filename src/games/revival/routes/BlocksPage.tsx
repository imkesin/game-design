import { useState } from "react"
import { axis, type City, layoutOf, spanOf, STREET } from "~/games/revival/blocks/blocks"
import { CITY } from "~/games/revival/blocks/city"
import { CityMap } from "~/games/revival/blocks/CityMap"
import { Desk } from "~/games/revival/blocks/Desk"
import { describe, GROUND } from "~/games/revival/blocks/hatch"
import { mm } from "~/games/revival/blocks/mm"
import { Paper } from "~/games/revival/blocks/Paper"
import { PrintTile } from "~/games/revival/blocks/PrintTile"
import { pageOf, type Sheet, SHEETS } from "~/games/revival/boards/sheets"
import { deal, QUADRANTS, type Setup } from "~/games/revival/setup/deal"
import { Mayor, OnBoard } from "~/games/revival/setup/OnBoard"
import type { Players } from "~/games/revival/setup/setupCard"
import { css } from "~/generated/styled-system/css"

/**
 * The city on a board split into tiles: a matrix of neighborhoods with
 * streets between them, every tile edge (a cut or a fold) down the middle of
 * a street. On screen: the whole board with its tile edges, and anything that
 * doesn't fit called out. In print: one page per tile with crop marks, or one
 * full-bleed page for a folding board. A random setup can be dealt onto it, on
 * screen only, to see the starting city.
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

/** The board's tracks for a city, and what's wrong with them, if anything. */
function geometry(city: City) {
  const X = axis(city.cols.map((tile) => tile.map(spanOf)), TILE.width, INSET)
  const Y = axis([...city.rows].reverse().map((tile) => [...tile].reverse().map(spanOf)), TILE.height, INSET)
  const problems = [
    ...(SHEET.kind === "board" && (SHEET.panels.cols !== TILES.cols || SHEET.panels.rows !== TILES.rows)
      ? [
        `city.ts groups ${TILES.cols}×${TILES.rows} tiles, the board has ${SHEET.panels.cols}×${SHEET.panels.rows} panels`
      ]
      : []),
    ...(SHEET.kind === "board" && SHEET.fold > STREET ? [`folds are wider than streets`] : []),
    ...X.over.map(({ tile, by }) => `tile column ${tile + 1} is ${by.toFixed(1)}mm too wide`),
    ...Y.over.map(({ tile, by }) => `tile row ${TILES.rows - tile} (from the bottom) is ${by.toFixed(1)}mm too tall`)
  ]
  return { xs: X.tracks, ys: Y.tracks, problems }
}

const notes = css({ textTransform: "none", letterSpacing: 0, fontSize: "13px", color: "#333" })

const problem = css({ color: "#dc2626" })

const tiles = css({ display: "contents" })

/**
 * A folding board's page: the board centred in its bleed, the printer's
 * template over it on screen if toggled. The bleed is black, so the board's
 * edge is framed and a drifting trim shows black, not white.
 */
const bleed = css({
  display: "grid",
  gridTemplateAreas: `"bleed"`,
  placeItems: "center",
  background: "rgba(255, 0, 0, 0.4)"
})

const trimmed = css({ gridArea: "bleed", background: "white" })

/** On screen, the strip inside the trim that's outside the printer's safe zone, tinted like the bleed. */
const unsafe = css({ gridArea: "bleed", pointerEvents: "none" })

const layer = css({ gridArea: "bleed" })

/** Multiplied so the template's white boxes don't hide the board. */
const template = css({ width: "100%", height: "100%", mixBlendMode: "multiply", pointerEvents: "none" })

const PLAYERS: readonly Players[] = [2, 3, 4, 5]

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
  const [players, setPlayers] = useState<Players | undefined>(undefined)
  const [setup, setSetup] = useState<Setup | undefined>(undefined)
  const dealFor = (count: Players | undefined) => {
    setPlayers(count)
    setSetup(count === undefined ? undefined : deal(count))
  }
  const { xs, ys, problems } = geometry(CITY)
  const [rows, cols] = [CITY.rows.flat().length, CITY.cols.flat().length]
  const plots = Array.from({ length: rows * cols }, (_, i) => layoutOf(CITY, Math.floor(i / cols), i % cols))
    .reduce((sum, layout) => sum + layout.plots.length, 0)
  const map = { city: CITY, xs, ys, ...BOARD }
  const dealt = setup && {
    pieces: (x: number, y: number) => {
      const placed = setup.plots.get(`${x},${y}`)
      return placed && <OnBoard {...placed} />
    },
    hall: <Mayor />
  }
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
          <label className={toggle}>
            Setup
            <select
              value={players ?? ""}
              onChange={(e) => dealFor(e.target.value === "" ? undefined : (Number(e.target.value) as Players))}
            >
              <option value="">Off</option>
              {PLAYERS.map((n) => <option key={n} value={n}>{n} players</option>)}
            </select>
          </label>
          {players !== undefined && <button type="button" onClick={() => dealFor(players)}>Deal again</button>}
          <span className={notes}>
            {`${rows * cols} neighborhoods · ${plots} plots`}
            {` · lots ${describe(GROUND.lot)} · streets L ${GROUND.street.l.toFixed(2)} flat (${GROUND.street.color})`}
            {setup !== undefined
              && ` · ${setup.plots.size} historical: ${
                setup.cards.map((card, i) => `${QUADRANTS[i]} ${card.name}`).join(", ")
              }`}
            {problems.length > 0 && <span className={problem}>{` · ${problems.join(" · ")}`}</span>}
          </span>
        </>
      }
    >
      {SHEET.kind === "board"
        ? (
          <Paper {...SCREEN} areaWidth={BOARD.width} areaHeight={BOARD.height} title={layout}>
            <div className={bleed} style={{ width: mm(PAGE.width), height: mm(PAGE.height) }}>
              <div className={trimmed}>
                <CityMap {...map} {...dealt} seams={SEAMS} />
              </div>
              <div
                className={`${unsafe} screen-only`}
                style={{
                  width: mm(BOARD.width),
                  height: mm(BOARD.height),
                  boxShadow: `inset 0 0 0 ${mm(SHEET.safe)} rgba(255, 0, 0, 0.4)`
                }}
              />
              {showTemplate && <img src={SHEET.template} alt="" className={`${layer} ${template} screen-only`} />}
            </div>
          </Paper>
        )
        : (
          <>
            <div className="screen-only">
              <Paper {...SCREEN} areaWidth={BOARD.width} areaHeight={BOARD.height} title={layout}>
                <CityMap {...map} {...dealt} seams={SEAMS} />
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

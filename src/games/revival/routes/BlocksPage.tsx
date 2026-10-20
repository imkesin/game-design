import { type ReactNode, useState } from "react"
import { axis, blockOf, type Layout, type LayoutName, LAYOUTS, STREET } from "~/games/revival/blocks/blocks"
import { CITY } from "~/games/revival/blocks/city"
import { CityMap } from "~/games/revival/blocks/CityMap"
import { Desk } from "~/games/revival/blocks/Desk"
import { mm } from "~/games/revival/blocks/mm"
import { Paper } from "~/games/revival/blocks/Paper"
import { PrintTile } from "~/games/revival/blocks/PrintTile"
import { pageOf, type Sheet, SHEETS } from "~/games/revival/boards/sheets"
import { deal, type Players, type Setup } from "~/games/revival/setup/deal"
import { Mayor, OnBoard } from "~/games/revival/setup/OnBoard"
import { css } from "~/generated/styled-system/css"

/**
 * Ring neighborhoods on a board split into tiles: a matrix of neighborhoods
 * with streets between them, every tile edge (a cut or a fold) down the middle
 * of a street. On screen: the whole board with its tile edges, and anything
 * that doesn't fit called out. In print: one page per tile with crop marks, or
 * one full-bleed page for a folding board. A random setup can be dealt onto
 * it, on screen only, to see the starting city.
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

const SIZE = { cols: CITY.cols.reduce((a, b) => a + b, 0), rows: CITY.rows.reduce((a, b) => a + b, 0) }

/** The board's tracks for a block size and street width, and what's wrong with them, if anything. */
function geometry(block: number, street: number) {
  const X = axis(CITY.cols, TILE.width, INSET, block, street)
  const Y = axis([...CITY.rows].reverse(), TILE.height, INSET, block, street)
  const problems = [
    ...(SHEET.kind === "board" && (SHEET.panels.cols !== TILES.cols || SHEET.panels.rows !== TILES.rows)
      ? [
        `city.ts groups ${TILES.cols}×${TILES.rows} tiles, the board has ${SHEET.panels.cols}×${SHEET.panels.rows} panels`
      ]
      : []),
    ...(SHEET.kind === "board" && SHEET.fold > street ? [`folds are wider than streets`] : []),
    ...X.over.map(({ tile, by }) => `tile column ${tile + 1} is ${by.toFixed(1)}mm too wide`),
    ...Y.over.map(({ tile, by }) => `tile row ${TILES.rows - tile} (from the bottom) is ${by.toFixed(1)}mm too tall`)
  ]
  return { xs: X.tracks, ys: Y.tracks, problems }
}

/** Neighborhood layouts to try, and street widths (mm) for each; the first is the default. */
const BLOCKS: Record<LayoutName, { label: string; streets: readonly number[] }> = {
  ring: { label: "Ring of 8", streets: [STREET] },
  square: { label: "2×2 block", streets: [STREET, 20, 30, 40, 50, 60] }
}

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

const PLAYERS: readonly Players[] = [2, 3, 4, 5]

/**
 * City shapes to try, on screen, by hiding neighborhoods: dealt on a square
 * `size` a side in the board's top-left corner, keeping those `inCity`.
 */
const SHAPES = {
  "4×4": { size: 4, inCity: () => true },
  "Cross (4×4 − corners)": { size: 4, inCity: (r: number, c: number) => (r % 3 !== 0) || (c % 3 !== 0) },
  "4×3": { size: 4, inCity: (r: number) => r < 3 },
  "3×3": { size: 3, inCity: () => true }
} as const satisfies Record<string, { size: number; inCity: (row: number, col: number) => boolean }>
type Shape = keyof typeof SHAPES

/**
 * A dealt setup as the board's screen-only pieces; neighborhoods outside the
 * shape hidden. The mayor stands in the plaza, or on a plot if there's none.
 */
const fillOf = (setup: Setup | undefined, shape: Shape, layout: LayoutName) => (row: number, col: number) => {
  const { size, inCity } = SHAPES[shape]
  const r = row - (SIZE.rows - size)
  if (r < 0 || col >= size || !inCity(r, col)) return { hidden: true }
  const mayorHere = setup?.mayor.row === r && setup.mayor.col === col
  const { plaza, plots }: Layout = LAYOUTS[layout]
  const onPlot = mayorHere && plaza === undefined ? setup.mayor.plot : undefined
  const ring = setup?.plots.get(`${r},${col}`) ?? []
  return {
    plots: Array.from({ length: plots.length }, (_, i) => {
      const placed = ring[i]
      const tile = placed && <OnBoard {...placed} />
      return i === onPlot
        ? (
          <Stack key={i}>
            {tile}
            <Mayor />
          </Stack>
        )
        : tile && <Stack key={i}>{tile}</Stack>
    }),
    plaza: mayorHere && onPlot === undefined ? <Mayor /> : undefined
  }
}

const stack = css({
  display: "grid",
  gridTemplateAreas: `"stack"`,
  placeItems: "center",
  "& > *": { gridArea: "stack" }
})

function Stack({ children }: { children: ReactNode }) {
  return <div className={stack}>{children}</div>
}

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
  const [shape, setShape] = useState<Shape>("4×4")
  const [blocks, setBlocks] = useState<LayoutName>("ring")
  const [street, setStreet] = useState(STREET)
  const dealFor = (count: Players | undefined, next = shape, nextLayout = blocks) => {
    setPlayers(count)
    setShape(next)
    setBlocks(nextLayout)
    setSetup(
      count === undefined ? undefined : deal(count, SHAPES[next].size, SHAPES[next].inCity, nextLayout)
    )
  }
  const fill = setup === undefined && shape === "4×4" ? undefined : fillOf(setup, shape, blocks)
  const { xs, ys, problems } = geometry(blockOf(LAYOUTS[blocks]), street)
  const neighborhoods = SIZE.cols * SIZE.rows
  const plots = neighborhoods * LAYOUTS[blocks].plots.length
  const map = { city: CITY, xs, ys, ...BOARD, layout: LAYOUTS[blocks] }
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
            City
            <select
              value={shape}
              onChange={(e) => dealFor(players, e.target.value as Shape)}
            >
              {Object.keys(SHAPES).map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label className={toggle}>
            Blocks
            <select
              value={blocks}
              onChange={(e) => {
                const next = e.target.value as LayoutName
                setStreet(BLOCKS[next].streets[0] ?? STREET)
                dealFor(players, shape, next)
              }}
            >
              {Object.entries(BLOCKS).map(([name, { label }]) => <option key={name} value={name}>{label}</option>)}
            </select>
          </label>
          {BLOCKS[blocks].streets.length > 1 && (
            <label className={toggle}>
              Streets
              <select value={street} onChange={(e) => setStreet(Number(e.target.value))}>
                {BLOCKS[blocks].streets.map((s) => <option key={s} value={s}>{`${s}mm`}</option>)}
              </select>
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
            {`${neighborhoods} neighborhoods · ${plots} plots`}
            {problems.length > 0 && <span className={problem}>{` · ${problems.join(" · ")}`}</span>}
          </span>
        </>
      }
    >
      {SHEET.kind === "board"
        ? (
          <Paper {...SCREEN} areaWidth={BOARD.width} areaHeight={BOARD.height} title={layout}>
            <div className={bleed} style={{ width: mm(PAGE.width), height: mm(PAGE.height) }}>
              <div className={layer}>
                <CityMap {...map} seams={SEAMS} fill={fill} />
              </div>
              {showTemplate && <img src={SHEET.template} alt="" className={`${layer} ${template} screen-only`} />}
            </div>
          </Paper>
        )
        : (
          <>
            <div className="screen-only">
              <Paper {...SCREEN} areaWidth={BOARD.width} areaHeight={BOARD.height} title={layout}>
                <CityMap {...map} seams={SEAMS} fill={fill} />
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

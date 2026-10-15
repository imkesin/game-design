import { axis, flipped } from "~/games/revival/blocks/blocks"
import { CITY } from "~/games/revival/blocks/city"
import { CityMap } from "~/games/revival/blocks/CityMap"
import { Desk } from "~/games/revival/blocks/Desk"
import { Paper } from "~/games/revival/blocks/Paper"
import { PrintTile } from "~/games/revival/blocks/PrintTile"
import { css } from "~/generated/styled-system/css"

/**
 * Rectangular blocks on a board tiled from Letter sheets: a matrix of
 * neighborhoods with streets between them, every cut line down the middle of
 * a street. On screen: the whole board with its cut lines, and anything that
 * doesn't fit called out. In print: one Letter page per tile, with crop marks.
 */

const IN = 25.4
/** Each tile is a Letter sheet's printable area (¼in margins), landscape. */
const TILE = { width: 10.5 * IN, height: 8 * IN }
const TILES = { cols: CITY.widths.length, rows: CITY.heights.length }
const BOARD = { width: TILES.cols * TILE.width, height: TILES.rows * TILE.height }
/** The on-screen sheet: the board plus a ¼in rim, as if the tiles were one sheet. */
const SHEET = { width: BOARD.width + IN / 2, height: BOARD.height + IN / 2 }

const SEAMS = {
  xs: Array.from({ length: TILES.cols - 1 }, (_, k) => (k + 1) * TILE.width),
  ys: Array.from({ length: TILES.rows - 1 }, (_, k) => (k + 1) * TILE.height)
}

const X = axis(CITY.widths, TILE.width)
const Y = axis(flipped(CITY.heights), TILE.height)

/** What's wrong with the city as written, if anything. */
const PROBLEMS = [
  ...X.over.map(({ tile, by }) => `tile column ${tile + 1} is ${by.toFixed(1)}mm too wide`),
  ...Y.over.map(({ tile, by }) => `tile row ${TILES.rows - tile} (from the bottom) is ${by.toFixed(1)}mm too tall`),
  ...(CITY.neighborhoods.length === CITY.heights.flat().length ? [] : ["block-row count doesn't match heights"]),
  ...CITY.neighborhoods.flatMap((row, r) => {
    const [widths, height] = [CITY.widths.flat(), CITY.heights.flat()[r] ?? 0]
    return [
      ...(row.length === widths.length
        ? []
        : [`block-row ${r + 1} has ${row.length} neighborhoods, not ${widths.length}`]),
      ...row.flatMap((columns, c) =>
        columns.length === widths[c] && columns.every((p) => p >= 1 && p <= height)
          ? []
          : [`neighborhood at row ${r + 1}, column ${c + 1} doesn't fit ${widths[c]}×${height}`]
      )
    ]
  })
]

const notes = css({ textTransform: "none", letterSpacing: 0, fontSize: "13px", color: "#333" })

const problem = css({ color: "#dc2626" })

const tiles = css({ display: "contents" })

export function BlocksPage() {
  const neighborhoods = CITY.neighborhoods.flat()
  const plots = neighborhoods.reduce((sum, columns) => sum + columns.reduce((a, b) => a + b, 0), 0)
  const map = { city: CITY, xs: X.tracks, ys: Y.tracks, ...BOARD }
  return (
    <Desk
      pageSize="letter landscape"
      title={`Revival — Blocks (${TILES.cols}×${TILES.rows} Letter tiles)`}
      notes={
        <span className={notes}>
          {`${neighborhoods.length} neighborhoods · ${plots} plots`}
          {PROBLEMS.length > 0 && <span className={problem}>{` · ${PROBLEMS.join(" · ")}`}</span>}
        </span>
      }
    >
      <div className="screen-only">
        <Paper
          {...SHEET}
          areaWidth={BOARD.width}
          areaHeight={BOARD.height}
          title={`${TILES.cols}×${TILES.rows} Letter tiles · board ${BOARD.width / IN}×${BOARD.height / IN}in`}
        >
          <CityMap {...map} seams={SEAMS} />
        </Paper>
      </div>
      <div className={`${tiles} print-only`}>
        {Array.from({ length: TILES.rows }, (_, row) =>
          Array.from(
            { length: TILES.cols },
            (_, col) => (
              <PrintTile key={`${row},${col}`} col={col} row={row} {...TILES} {...TILE}>
                <CityMap {...map} />
              </PrintTile>
            )
          ))}
      </div>
    </Desk>
  )
}

import { HexTileGroup } from "~/games/regolith/components/HexTile"
import { expandTiles } from "~/games/regolith/domain"
import type { Tile } from "~/games/regolith/domain"
import { HEX_HEIGHT_IN, HEX_WIDTH_IN, packHexes, UNITS_PER_INCH } from "~/games/regolith/hexGeometry"
import { css } from "~/generated/styled-system/css"

/**
 * Print-and-play hex sheet: every physical tile — the catalog expanded by each
 * tile's `copies` — tessellated onto US Letter pages. Each hex is cut out and
 * glued to a tile blank, so pages don't need registration ticks, just the cut
 * line each tile already carries.
 *
 * The sheet is landscape, which fits 6 tiles against a portrait sheet's 5 —
 * the hex is wider than it is tall — while leaving every tile's art upright.
 * `packHexes` centres the cluster on the sheet, so the leftover space sits
 * evenly around it instead of pushing the outer tiles into the page edge.
 *
 * Same shape as `CardSheetPage`: `@page` is Letter with zero margin, one
 * `<svg>` per printed page, `break-before: page` between sheets.
 */

// Letter, turned landscape: the hex is wider than it is tall, so a landscape
// sheet takes 6 tiles against a portrait sheet's 5, with the art still upright.
const PAGE_WIDTH_IN = 11
const PAGE_HEIGHT_IN = 8.5
const PAGE_W = PAGE_WIDTH_IN * UNITS_PER_INCH
const PAGE_H = PAGE_HEIGHT_IN * UNITS_PER_INCH

const printCss = `
  @page {
    size: letter landscape; margin: 0;
  }
  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }
    .screen-only {
      display: none !important;
    }
    .print-root {
      background: #fff !important;
      padding: 0 !important;
      gap: 0 !important;
      display: block !important;
    }
    .sheet {
      box-shadow: none !important;
      margin: 0 !important;
    }
    .sheet:not(:first-of-type) {
      break-before: page;
    }
  }
`

const screen = css({
  background: "#525252",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  padding: "24px"
})

const note = css({
  position: "fixed",
  top: "12px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10,
  background: "#262626",
  color: "#e5e5e5",
  fontSize: "13px",
  padding: "8px 14px",
  borderRadius: "8px"
})

const sheetStyle = css({
  background: "#fff",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  display: "block"
})

function groupByPage(tiles: readonly Tile[]) {
  const packed = packHexes(tiles.length, {
    widthIn: HEX_WIDTH_IN,
    heightIn: HEX_HEIGHT_IN,
    pageWidthIn: PAGE_WIDTH_IN,
    pageHeightIn: PAGE_HEIGHT_IN
  })
  const pageCount = packed.length === 0 ? 0 : Math.max(...packed.map((p) => p.page)) + 1
  const pages: { tile: Tile; x: number; y: number }[][] = Array.from({ length: pageCount }, () => [])
  tiles.forEach((tile, i) => {
    const p = packed[i]!
    pages[p.page]!.push({ tile, x: p.cx * UNITS_PER_INCH, y: p.cy * UNITS_PER_INCH })
  })
  return pages
}

export function TileSheetPrintPage() {
  const tiles = expandTiles()
  const pages = groupByPage(tiles)
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → Letter, Landscape · Margins: None · Scale: 100% · {tiles.length} tiles on {pages.length} pages
        </div>
        {pages.map((page, pi) => (
          <svg
            key={pi}
            className={`sheet ${sheetStyle}`}
            viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
            width={`${PAGE_WIDTH_IN}in`}
            height={`${PAGE_HEIGHT_IN}in`}
          >
            {page.map(({ tile, x, y }, ti) => (
              <HexTileGroup
                key={`${tile.id}-${ti}`}
                tile={tile}
                x={x}
                y={y}
                widthIn={HEX_WIDTH_IN}
                heightIn={HEX_HEIGHT_IN}
              />
            ))}
          </svg>
        ))}
      </div>
    </>
  )
}

export default TileSheetPrintPage

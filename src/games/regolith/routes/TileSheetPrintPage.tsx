import { HexTileGroup } from "~/games/regolith/components/HexTile"
import { backFace, FACES, TILES } from "~/games/regolith/domain"
import type { Face } from "~/games/regolith/domain"
import {
  HEX_HEIGHT_IN,
  HEX_SIDE_MM,
  HEX_WIDTH_IN,
  packHexes,
  STICKER_MARGIN_MM,
  UNITS_PER_INCH
} from "~/games/regolith/hexGeometry"
import { css } from "~/generated/styled-system/css"

/**
 * Print-and-play hex sheet: every physical tile, tessellated onto US Letter
 * pages. Each hex is cut out and glued to a tile blank, so pages don't need
 * registration ticks, just the cut line each tile already carries.
 *
 * Tiles are double-sided, and the two sides print as two runs of sheets rather
 * than duplexed: all the fronts, then all the backs in the same slot order, so
 * the nth hex of the front run and the nth hex of the back run are the two
 * faces of one piece. That suits how these are actually assembled — cut both,
 * glue either side of a blank — and it does not ask the printer to register
 * one side against the other, which is the thing a home duplex does worst.
 * Each side carries its tile's setup number, so a mis-sorted pair is visible
 * before it is glued.
 *
 * The sheet is landscape, and at the current tile size that is a wash rather
 * than a win: 6 tiles either way. It bought a sheet back when the hex was
 * 90mm point to point and a portrait page took only 5; once the tile shrank to
 * fit inside a blank's edge, the extra column landscape was buying fitted in
 * portrait too. Kept as-is because the packing is orientation-agnostic, but if
 * the print dialog is where these go wrong, portrait is the cheaper default —
 * it is one fewer setting to get right.
 *
 * `packHexes` centres the cluster on the sheet, so the leftover space sits
 * evenly around it instead of pushing the outer tiles into the page edge.
 *
 * Same shape as `CardSheetPage`: `@page` is Letter with zero margin, one
 * `<svg>` per printed page, `break-before: page` between sheets.
 */

// Letter, turned landscape. Swap these two and the `@page` size below to go
// portrait; nothing else in the file cares. See the note above on why this is
// no longer the orientation that fits more.
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

/** One printed hex: a face and the number of the piece it belongs to. */
interface Side {
  n: number
  face: Face
}

interface PlacedSide extends Side {
  x: number
  y: number
}

/**
 * A proof run, off the query string: `?n=0-5` prints only those pieces and
 * `?sides=front` only their fronts, so a single sheet can be pulled to hold
 * against a real blank without spending the whole box to do it. With neither,
 * the full set prints — the proof is an opt-in, so the print link stays the
 * thing that gives you the game.
 *
 * `n` takes a comma-separated list of numbers and `lo-hi` ranges, matching how
 * `TILES` is dealt out (see its `n`): `?n=0-8` is exactly the guaranteed core.
 * A malformed term is dropped rather than throwing — a typo in a URL should
 * cost you a tile on the proof, not a blank page.
 */
function parseTileRange(spec: string): (n: number) => boolean {
  const ranges = spec
    .split(",")
    .map((part) => {
      const [lo, hi] = part.split("-").map((v) => Number(v.trim()))
      return { lo: lo!, hi: hi ?? lo! }
    })
    .filter(({ lo, hi }) => Number.isFinite(lo) && Number.isFinite(hi))
  return (n) => ranges.some(({ lo, hi }) => n >= lo && n <= hi)
}

function groupByPage(sides: readonly Side[]): PlacedSide[][] {
  const packed = packHexes(sides.length, {
    widthIn: HEX_WIDTH_IN,
    heightIn: HEX_HEIGHT_IN,
    pageWidthIn: PAGE_WIDTH_IN,
    pageHeightIn: PAGE_HEIGHT_IN
  })
  const pageCount = packed.length === 0 ? 0 : Math.max(...packed.map((p) => p.page)) + 1
  const pages: PlacedSide[][] = Array.from({ length: pageCount }, () => [])
  sides.forEach((side, i) => {
    const p = packed[i]!
    pages[p.page]!.push({ ...side, x: p.cx * UNITS_PER_INCH, y: p.cy * UNITS_PER_INCH })
  })
  return pages
}

export function TileSheetPrintPage() {
  const params = new URLSearchParams(window.location.search)
  const spec = params.get("n")
  const inProof = spec === null ? null : parseTileRange(spec)
  const selected = inProof === null ? TILES : TILES.filter((t) => inProof(t.n))
  const sides = params.get("sides")
  const fronts = sides === "back" ? [] : groupByPage(selected.map((t) => ({ n: t.n, face: FACES[t.front] })))
  const backs = sides === "front" ? [] : groupByPage(selected.map((t) => ({ n: t.n, face: backFace(t) })))
  const pages = [...fronts, ...backs]
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          Print → Letter, Landscape · Margins: None · Scale: 100% · {selected.length} of {TILES.length} tiles ·{" "}
          {fronts.length} front + {backs.length} back pages · {HEX_SIDE_MM.toFixed(1)}mm side, {STICKER_MARGIN_MM}mm rim
        </div>
        {pages.map((page, pi) => (
          <svg
            key={pi}
            className={`sheet ${sheetStyle}`}
            viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
            width={`${PAGE_WIDTH_IN}in`}
            height={`${PAGE_HEIGHT_IN}in`}
          >
            {page.map(({ n, face, x, y }) => (
              <HexTileGroup
                key={n}
                face={face}
                n={n}
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

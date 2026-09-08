import { Fragment } from "react"
import { HexTile } from "~/games/regolith/components/HexTile"
import { backFace, FACES, TILES } from "~/games/regolith/domain"
import { BLANK_HEIGHT_MM, HEX_SIDE_MM, HEX_WIDTH_IN, STICKER_MARGIN_MM } from "~/games/regolith/hexGeometry"
import { css } from "~/generated/styled-system/css"

/**
 * Screen index: a true-size gallery of the box, one row per physical tile —
 * its front beside its back — so legibility at the actual print size can be
 * eyeballed before cutting anything out.
 *
 * A pair, not two galleries, because what a tile becomes when it flips is the
 * decision a player makes with it in hand: the two faces are only worth
 * judging together.
 */

const page = css({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  padding: "24px",
  color: "#e5e5e5"
})

const title = css({ fontSize: "24px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" })

const link = css({ color: "#e5e5e5", fontSize: "16px", textDecoration: "underline" })

/** The measurements to check a proof against, spelled out so nobody has to derive them. */
const sizeNote = css({ color: "#a3a3a3", fontSize: "13px" })

/**
 * Number, front, back — one grid for the whole list rather than a grid per
 * row, so the numbers line up in a column of their own and every back sits
 * under the one above it.
 */
const gallery = css({
  display: "grid",
  gridTemplateColumns: "max-content max-content max-content",
  alignItems: "center",
  columnGap: "16px",
  rowGap: "24px",
  background: "#fff",
  padding: "24px",
  borderRadius: "8px"
})

const number = css({
  color: "#171717",
  fontSize: "20px",
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
  justifySelf: "end"
})

/** The column heads sit in the same grid, so they can't drift off their columns. */
const columnHead = css({
  color: "#525252",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  justifySelf: "center"
})

const blankNote = css({
  color: "#a3a3a3",
  fontSize: "13px",
  width: `${HEX_WIDTH_IN}in`,
  textAlign: "center"
})

export function PreviewPage() {
  return (
    <div className={page}>
      <span className={title}>Regolith</span>
      <a className={link} href="/regolith/print/tiles">Print sheet — hex tiles on US Letter →</a>
      {
        /* One sheet of the core, fronts only: the proof to hold against a real
          blank before committing ten sheets of sticker paper to the box. */
      }
      <a className={link} href="/regolith/print/tiles?n=0-5&sides=front">
        Proof sheet — 6 tiles, fronts only →
      </a>
      <span className={sizeNote}>
        {HEX_SIDE_MM.toFixed(1)}mm side · {(2 * HEX_SIDE_MM).toFixed(1)}mm point to point ·{" "}
        {(BLANK_HEIGHT_MM - 2 * STICKER_MARGIN_MM).toFixed(1)}mm flat to flat ·{" "}
        {STICKER_MARGIN_MM}mm of blank showing on a {BLANK_HEIGHT_MM}mm tile
      </span>
      <div className={gallery}>
        <span />
        <span className={columnHead}>Front</span>
        <span className={columnHead}>Back</span>
        {TILES.map((tile) => (
          <Fragment key={tile.n}>
            <span className={number}>{tile.n}</span>
            <HexTile face={FACES[tile.front]} n={tile.n} />
            {tile.back === undefined
              ? <span className={blankNote}>blank</span>
              : <HexTile face={backFace(tile)} n={tile.n} />}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default PreviewPage

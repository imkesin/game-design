import { HexTile } from "~/games/regolith/components/HexTile"
import { TILES } from "~/games/regolith/domain"
import { HEX_WIDTH_IN } from "~/games/regolith/hexGeometry"
import { css } from "~/generated/styled-system/css"

/**
 * Screen index: a true-size gallery of every tile in the catalog — one of
 * each, labelled with how many copies get printed — so legibility at the
 * actual print size can be eyeballed before cutting anything out.
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

const cell = css({
  display: "grid",
  justifyItems: "center",
  rowGap: "6px"
})

const copies = css({
  color: "#525252",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.08em"
})

const gallery = css({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fit, minmax(${HEX_WIDTH_IN}in, max-content))`,
  gap: "24px",
  justifyContent: "center",
  background: "#fff",
  padding: "24px",
  borderRadius: "8px"
})

export function PreviewPage() {
  return (
    <div className={page}>
      <span className={title}>Regolith</span>
      <a className={link} href="/regolith/print/tiles">Print sheet — hex tiles on US Letter →</a>
      <div className={gallery}>
        {TILES.map((tile) => (
          <div key={tile.id} className={cell}>
            <HexTile tile={tile} />
            <span className={copies}>×{tile.copies}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PreviewPage

import { BOARD_2P, BOARD_3P } from "~/games/tigers-path/boards"
import type { BoardGraph } from "~/games/tigers-path/boards"
import { ANIMALS } from "~/games/tigers-path/domain"
import { css } from "~/generated/styled-system/css"

/**
 * Screen index for the v0 kit. The shared Sheet 1 (3P West + 2P East), the solo
 * 2P board, the powers board, and the player aid each have their own print route
 * — this page links to them and says what else to bring. Regenerate board
 * geometry with `pnpm tp:map:build`.
 */

const page = css({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "14px",
  padding: "24px",
  color: "#e5e5e5"
})

const title = css({ fontSize: "24px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" })

const section = css({
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#a3a3a3",
  marginTop: "8px"
})

const link = css({ color: "#e5e5e5", fontSize: "16px", textDecoration: "underline" })

const meta = css({ color: "#a3a3a3", fontSize: "13px", maxWidth: "460px", textAlign: "center", lineHeight: 1.5 })

function actions(board: BoardGraph) {
  const slots = board.clearings.reduce((n, c) => n + c.slots.length, 0)
  return { clearings: board.clearings.length, paths: board.paths.length, slots, total: board.paths.length + slots }
}

export function PreviewPage() {
  const cubes = ANIMALS.reduce((n, a) => n + a.jungleCount, 0)
  const two = actions(BOARD_2P)
  const three = actions(BOARD_3P)
  return (
    <div className={page}>
      <span className={title}>Tiger's Path</span>
      <span className={meta}>
        v0 playtest kit — no scoring yet. {cubes} cubes across 5 animals.
        <br />
        2P: {two.clearings} clearings, {two.paths} paths + {two.slots} slots = {two.total} actions. 3P:{" "}
        {three.clearings} clearings, {three.paths} paths + {three.slots} slots = {three.total} actions.
      </span>

      <span className={section}>Boards</span>
      <a className={link} href="/tigers-path/print/board/sheet1">Sheet 1 — 3P (West) + 2P (East), 24×18 shared →</a>
      <a className={link} href="/tigers-path/print/board/2p-solo">2P — solo, letter portrait (Grassland off-board) →</a>
      <a className={link} href="/tigers-path/print/board/3p-template">
        3P — blank template, letter portrait (hand-draw grid) →
      </a>

      <span className={section}>Furniture</span>
      <a className={link} href="/tigers-path/print/powers">Powers board — letter landscape →</a>
      <a className={link} href="/tigers-path/print/aid">Player aid — letter portrait →</a>

      <span className={meta}>
        Bring: cubes in 5 colors (or any 5 distinguishable sets), a Jungle bag, and 5 track markers per player. Cubes
        double as clearing discs in v0.
      </span>
    </div>
  )
}

export default PreviewPage

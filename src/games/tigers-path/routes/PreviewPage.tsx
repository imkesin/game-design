import { ANIMALS, CLEARINGS, PATHS } from "~/games/tigers-path/domain"
import { css } from "~/generated/styled-system/css"

/**
 * Screen index for the v0 kit. Each board variant, the powers board, and the
 * player aid have their own print route — this page just links to them and says
 * what else to bring. Regenerate board geometry with `pnpm tp:map:build`.
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

const section = css({ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a3a3a3", marginTop: "8px" })

const link = css({ color: "#e5e5e5", fontSize: "16px", textDecoration: "underline" })

const meta = css({ color: "#a3a3a3", fontSize: "13px", maxWidth: "460px", textAlign: "center", lineHeight: 1.5 })

export function PreviewPage() {
  const cubes = ANIMALS.reduce((n, a) => n + a.jungleCount, 0)
  const spaces = PATHS.reduce((n, r) => n + r.length, 0)
  return (
    <div className={page}>
      <span className={title}>Tiger's Path</span>
      <span className={meta}>
        v0 playtest kit — no scoring yet. {CLEARINGS.length} clearings, {PATHS.length} paths ({spaces} spaces), {cubes}
        {" "}
        cubes across 5 animals.
      </span>

      <span className={section}>Boards</span>
      <a className={link} href="/tigers-path/print/board/2p-split">2P — split-sheet half, 18×24 (on-board Grassland) →</a>
      <a className={link} href="/tigers-path/print/board/2p-solo">2P — solo, letter portrait (Grassland off-board) →</a>

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

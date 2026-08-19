import { ANIMALS, CLEARINGS, PATHS } from "~/games/tigers-path/domain"
import { css } from "~/generated/styled-system/css"

/**
 * Screen index for the v0 kit. The three sheets are board furniture sized in
 * inches, so they render honestly on their own print routes — this page just
 * says what to print and what else to bring.
 */

const page = css({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  padding: "24px",
  color: "#e5e5e5"
})

const title = css({
  fontSize: "24px",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase"
})

const link = css({
  color: "#e5e5e5",
  fontSize: "16px",
  textDecoration: "underline"
})

const meta = css({
  color: "#a3a3a3",
  fontSize: "13px",
  maxWidth: "440px",
  textAlign: "center",
  lineHeight: 1.5
})

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
      <a className={link} href="/tigers-path/print/board">Board — letter landscape →</a>
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

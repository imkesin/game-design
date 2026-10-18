import { useState } from "react"
import { HALF_BOARD } from "~/games/revival/boards/sheets"
import { MAT, PlayerMat } from "~/games/revival/mats/PlayerMat"
import { css } from "~/generated/styled-system/css"

/**
 * The player mat on a landscape Letter page, at TGC half-board size turned on
 * its side (10×5in trim, ⅛in bleed), with crop ticks at the trim corners. On
 * screen, TGC's template can be laid over it. One mat for everyone until
 * companies have colors: print a copy per player at 100% with no margins.
 */

const PAGE = { width: 279.4, height: 215.9 }
const BLEED = HALF_BOARD.bleed
const BOX = { width: MAT.width + 2 * BLEED, height: MAT.height + 2 * BLEED }
const TRIM = { x: (PAGE.width - MAT.width) / 2, y: (PAGE.height - MAT.height) / 2 }
/** Ticks start clear of the bleed. */
const TICK = { gap: BLEED + 0.8, length: 4, width: 0.2 }

const TEMPLATE_KEY = "revival:template"

const printCss = `
  @page { size: letter landscape; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .mats-root { background: #fff !important; padding: 0 !important; gap: 0 !important; }
    .mats-sheet { box-shadow: none !important; }
    .screen-only { display: none !important; }
  }
`

const root = css({
  display: "grid",
  justifyItems: "center",
  alignContent: "start",
  gap: "24px",
  padding: "24px",
  minHeight: "100vh",
  background: "#525252"
})

const header = css({
  display: "grid",
  gridAutoFlow: "column",
  gap: "20px",
  alignItems: "center",
  color: "white",
  fontFamily: "sans-serif",
  fontSize: "14px",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
})

const toggle = css({ display: "grid", gridAutoFlow: "column", gap: "6px", alignItems: "center" })

const sheet = css({
  display: "grid",
  gridTemplateAreas: `"sheet"`,
  placeItems: "center",
  background: "white",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  "& > *": { gridArea: "sheet" }
})

/** Multiplied so the template's white boxes don't hide the mat. */
const template = css({ mixBlendMode: "multiply", pointerEvents: "none" })

function Ticks() {
  const corners = [[0, 0, -1, -1], [MAT.width, 0, 1, -1], [0, MAT.height, -1, 1], [
    MAT.width,
    MAT.height,
    1,
    1
  ]] as const
  const [near, far] = [TICK.gap, TICK.gap + TICK.length]
  return (
    <svg viewBox={`0 0 ${PAGE.width} ${PAGE.height}`} width={`${PAGE.width}mm`} height={`${PAGE.height}mm`}>
      <g stroke="black" strokeWidth={TICK.width} transform={`translate(${TRIM.x} ${TRIM.y})`}>
        {corners.map(([x, y, dx, dy]) => (
          <g key={`${x},${y}`}>
            <line x1={x + dx * near} x2={x + dx * far} y1={y} y2={y} />
            <line x1={x} x2={x} y1={y + dy * near} y2={y + dy * far} />
          </g>
        ))}
      </g>
    </svg>
  )
}

/** TGC's portrait template, turned a quarter to lie over the landscape mat. */
function Template() {
  return (
    <svg
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      width={`${BOX.width}mm`}
      height={`${BOX.height}mm`}
      className={`${template} screen-only`}
    >
      <image
        href={HALF_BOARD.template}
        width={BOX.height}
        height={BOX.width}
        transform={`translate(0 ${BOX.height}) rotate(-90)`}
      />
    </svg>
  )
}

export function MatsPage() {
  const [showTemplate, setShowTemplate] = useState(() => {
    try {
      return localStorage.getItem(TEMPLATE_KEY) === "on"
    } catch {
      return false
    }
  })
  return (
    <>
      <style>{printCss}</style>
      <div className={`mats-root ${root}`}>
        <div className={`${header} screen-only`}>
          <span>Revival — Player mat (TGC half board, 10×5in)</span>
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
        </div>
        <div className={`mats-sheet ${sheet}`} style={{ width: `${PAGE.width}mm`, height: `${PAGE.height}mm` }}>
          <Ticks />
          <PlayerMat />
          {showTemplate && <Template />}
        </div>
      </div>
    </>
  )
}

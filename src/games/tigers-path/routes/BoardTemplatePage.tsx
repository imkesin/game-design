import type { GeneratedMap } from "~/games/tigers-path/map/layout"
import mapsData from "~/games/tigers-path/map/maps.json"
import { css } from "~/generated/styled-system/css"

/**
 * Blank hand-drawing templates — a letter sheet showing a board's box at its
 * true aspect, the Grassland semicircle and its dashed moat buffer (both to
 * scale), and a faint 0–100 anchor grid with labelled axes. Pencil in
 * clearings/paths over a contour sketch, then read each clearing's `target`
 * straight off the grid (x % across, y % down, origin top-left) and transcribe
 * into the matching `boards/*.ts`.
 *
 * The sheet is oriented to the board: 3P's 11.5×17 half prints letter portrait,
 * 4P's 23×17 full sheet prints letter landscape. Geometry is driven off the
 * baked map so a template always matches the real board; the only added number
 * is the Grassland moat (`GRASS_MOAT` = 0.9in in `map/layout.ts`), which the map
 * output doesn't carry.
 */

const maps = mapsData as unknown as Record<string, GeneratedMap>

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

const sheet = css({
  background: "#fff",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

type TemplateProps = {
  map: GeneratedMap
  /** Headline printed in the top gutter. */
  title: string
  /** Second line in the top gutter — the board's part budget. */
  budget: string
  /** Screen-only chip text. */
  chip: string
  sheetWIn: number
  sheetHIn: number
}

function BlankTemplate({ map, title, budget, chip, sheetWIn, sheetHIn }: TemplateProps) {
  const W = map.width
  const H = map.height
  const upi = map.unitsPerInch
  const g = map.grassland!
  const { cx, cy, radius: R } = g
  const MOAT = Math.round(0.9 * upi) // GRASS_MOAT in map/layout.ts
  const EXCL = R + MOAT

  // Label gutters (top for x-axis + title, left for y-axis) and small pads.
  const GUT_L = Math.round(0.55 * upi)
  const GUT_T = Math.round(1.15 * upi)
  const PAD_R = Math.round(0.16 * upi)
  const PAD_B = Math.round(0.5 * upi)
  const vb = `${-GUT_L} ${-GUT_T} ${W + GUT_L + PAD_R} ${H + GUT_T + PAD_B}`

  const ticks = Array.from({ length: 11 }, (_, i) => i * 10) // 0,10,…,100

  // Upper semicircle bulging up from the bottom edge (sweep-flag 1 → bulges up).
  const semi = (r: number) => `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

  const printCss = `
    @page { size: ${sheetWIn}in ${sheetHIn}in; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      .screen-only { display: none !important; }
      .print-root { background: #fff !important; padding: 0 !important; display: block !important; height: ${sheetHIn}in !important; overflow: hidden !important; }
      .sheet { box-shadow: none !important; margin: 0 !important; }
    }
  `

  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>{chip}</div>
        <div
          className={`sheet ${sheet}`}
          style={{ width: `${sheetWIn}in`, height: `${sheetHIn}in`, padding: "0.35in 0.4in" }}
        >
          <svg viewBox={vb} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" fill="none">
            {/* Title, budget reminder, and axis caption in the top/bottom gutters. */}
            <text x={0} y={-GUT_T + 26} fontSize={26} fill="#444" fontFamily="sans-serif" fontWeight={600}>
              {title}
            </text>
            <text x={0} y={-GUT_T + 56} fontSize={22} fill="#777" fontFamily="sans-serif">
              {budget}
            </text>
            <text
              x={W / 2}
              y={H + PAD_B - 10}
              fontSize={20}
              fill="#777"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              Anchor coords: x % across, y % down, origin top-left · Grassland (green) + dashed moat = keep clear
            </text>

            {/* Grid — light lines every 10%, the mid (50%) lines a touch darker. */}
            {ticks.map((t) => {
              const gx = (t / 100) * W
              const gy = (t / 100) * H
              const mid = t === 50
              const stroke = mid ? "#d0d0d0" : "#e6e6e6"
              return (
                <g key={t}>
                  <line x1={gx} y1={0} x2={gx} y2={H} stroke={stroke} strokeWidth={1} />
                  <line x1={0} y1={gy} x2={W} y2={gy} stroke={stroke} strokeWidth={1} />
                  <text x={gx} y={-18} fontSize={22} fill="#999" fontFamily="sans-serif" textAnchor="middle">
                    {t}
                  </text>
                  <text
                    x={-14}
                    y={gy}
                    fontSize={22}
                    fill="#999"
                    fontFamily="sans-serif"
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {t}
                  </text>
                </g>
              )
            })}

            {/* Board box. */}
            <rect x={0} y={0} width={W} height={H} stroke="#808080" strokeWidth={2} />

            {/* Grassland: faint fill + solid arc; moat: dashed arc, no fill. */}
            <path d={`${semi(R)} Z`} fill="rgba(46,125,50,0.06)" stroke="#7a9a7a" strokeWidth={1.5} />
            <path d={semi(EXCL)} stroke="#b5b5b5" strokeWidth={1.5} strokeDasharray="6 6" />
            <text x={cx} y={cy - 70} fontSize={22} fill="#6b8e6b" fontFamily="sans-serif" textAnchor="middle">
              Grassland
            </text>
            <text x={cx} y={cy - EXCL - 10} fontSize={18} fill="#a0a0a0" fontFamily="sans-serif" textAnchor="middle">
              moat buffer — keep clearings out
            </text>
          </svg>
        </div>
      </div>
    </>
  )
}

/** 3P (West half, 11.5×17) — letter portrait. */
export function BoardTemplate3P() {
  return (
    <BlankTemplate
      map={maps["3p-split"]!}
      title="Tiger's Path — 3P blank (West half · 11.5×17 · 0–100 grid)"
      budget="Target: 18 clearings · 22 paths (6×2, 13×3, 3×4) · 34 slots = 56 actions"
      chip="3P blank template · letter 8.5×11 · board 11.5×17 aspect · 0–100 grid · Grassland + moat to scale"
      sheetWIn={8.5}
      sheetHIn={11}
    />
  )
}

/** 4P (North, full 23×17 sheet) — letter landscape, the rotated counterpart. */
export function BoardTemplate4P() {
  return (
    <BlankTemplate
      map={maps["4p-north"]!}
      title="Tiger's Path — 4P blank (North · 23×17 landscape · 0–100 grid)"
      budget="Target: 22 clearings · 29 paths (8×2, 17×3, 4×4) · 41 slots = 70 actions · no 4-slot clearing"
      chip="4P blank template · letter 11×8.5 landscape · board 23×17 aspect · 0–100 grid · Grassland + moat to scale"
      sheetWIn={11}
      sheetHIn={8.5}
    />
  )
}

export default BoardTemplate3P

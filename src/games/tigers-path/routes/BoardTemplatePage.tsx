import type { GeneratedMap } from "~/games/tigers-path/map/layout"
import mapsData from "~/games/tigers-path/map/maps.json"
import { css } from "~/generated/styled-system/css"

/**
 * Blank hand-drawing template for the 3P board — a letter (8.5×11) sheet showing
 * the West-half board box at its true 11.5×17 aspect, the Grassland semicircle
 * and its dashed moat buffer (both to scale), and a faint 0–100 anchor grid with
 * labelled axes. Pencil in clearings/paths over a contour sketch, then read each
 * clearing's `target` straight off the grid (x % across, y % down, origin
 * top-left) and transcribe into `boards/3p.ts`.
 *
 * Geometry is driven off the baked `3p-split` map so it always matches the real
 * board; the only added number is the Grassland moat (`GRASS_MOAT` = 0.9in in
 * `map/layout.ts`), which the map output doesn't carry.
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

export function BoardTemplate3P() {
  const map = maps["3p-split"]!
  const W = map.width
  const H = map.height
  const upi = map.unitsPerInch
  const g = map.grassland!
  const { cx, cy, radius: R } = g
  const MOAT = Math.round(0.9 * upi) // GRASS_MOAT in map/layout.ts
  const EXCL = R + MOAT

  // Label gutters (top for x-axis + title, left for y-axis) and small pads.
  const GUT_L = Math.round(0.55 * upi)
  const GUT_T = Math.round(0.9 * upi)
  const PAD_R = Math.round(0.16 * upi)
  const PAD_B = Math.round(0.5 * upi)
  const vb = `${-GUT_L} ${-GUT_T} ${W + GUT_L + PAD_R} ${H + GUT_T + PAD_B}`

  const ticks = Array.from({ length: 11 }, (_, i) => i * 10) // 0,10,…,100

  // Upper semicircle bulging up from the bottom edge (sweep-flag 1 → bulges up).
  const semi = (r: number) => `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

  const printCss = `
    @page { size: 8.5in 11in; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      .screen-only { display: none !important; }
      .print-root { background: #fff !important; padding: 0 !important; display: block !important; height: 11in !important; overflow: hidden !important; }
      .sheet { box-shadow: none !important; margin: 0 !important; }
    }
  `

  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`${note} screen-only`}>
          3P blank template · letter 8.5×11 · board 11.5×17 aspect · 0–100 grid · Grassland + moat to scale
        </div>
        <div className={`sheet ${sheet}`} style={{ width: "8.5in", height: "11in", padding: "0.35in 0.4in" }}>
          <svg viewBox={vb} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" fill="none">
            {/* Title + axis caption in the top/bottom gutters. */}
            <text x={0} y={-GUT_T + 24} fontSize={26} fill="#444" fontFamily="sans-serif" fontWeight={600}>
              Tiger's Path — 3P blank (West half · 11.5×17 · 0–100 grid)
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

export default BoardTemplate3P

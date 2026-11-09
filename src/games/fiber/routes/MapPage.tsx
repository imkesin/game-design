import { useMemo, useState } from "react"
import { COLOR, HATCH, LEVELS, PALETTE, WELL_OPACITY } from "~/games/fiber/colors"
import { layoutMap } from "~/games/fiber/map/layout"
import {
  CORNER,
  COST_DOT,
  EDGES,
  IN,
  LABEL,
  LAYOUT_SPEC,
  NODES,
  padOf,
  PIECE,
  REGIONS,
  SHEET,
  SLOT,
  STICK_SLOT
} from "~/games/fiber/map/map"
import { regionShapes } from "~/games/fiber/map/regions"
import { css } from "~/generated/styled-system/css"

/**
 * The 5-node test map on a 10in square, true size (1 SVG unit = 1mm). Pads and stick slots are
 * fixed outlines; `layoutMap` places the pads near their targets and bows each link to fit.
 * "Reroll" re-solves from a nudged start to show nearby variants. Print at 100% for true scale.
 * Below the map, every color it uses (`colors.ts`).
 */

const page = css({ padding: "16px", color: "#e5e5e5", fontFamily: "system-ui, sans-serif" })
const bar = css({ display: "flex", gap: "16px", alignItems: "center", marginBottom: "12px", fontSize: "13px" })
const sheet = css({ display: "block", background: "white", boxShadow: "0 0 0 1px #a3a3a3" })
const notes = css({ fontSize: "13px", color: "#d4d4d4", marginTop: "12px", display: "grid", rowGap: "4px" })
const bad = css({ color: "#f87171" })
const button = css({
  padding: "4px 10px",
  border: "1px solid #737373",
  borderRadius: "4px",
  background: "#262626",
  color: "#f5f5f5",
  cursor: "pointer",
  _hover: { background: "#404040" }
})
const check = css({ accentColor: "#f5f5f5" })

const palette = css({ marginTop: "32px", display: "grid", rowGap: "20px", maxWidth: "960px" })
const heading = css({ fontSize: "15px", fontWeight: 600 })
const subheading = css({ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#a3a3a3" })
const ramp = css({ display: "grid", gridAutoFlow: "column", gridAutoColumns: "1fr", height: "56px" })
const rampCell = css({
  display: "grid",
  alignItems: "end",
  padding: "4px",
  fontSize: "10px",
  fontFamily: "ui-monospace, monospace"
})
const swatches = css({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" })
const swatchCard = css({
  display: "grid",
  gridTemplateAreas: `"chip name" "chip role"`,
  gridTemplateColumns: "56px 1fr",
  columnGap: "10px",
  alignItems: "center",
  fontSize: "12px"
})
const chip = css({
  gridArea: "chip",
  width: "56px",
  height: "40px",
  display: "grid",
  placeItems: "center",
  borderRadius: "4px",
  boxShadow: "0 0 0 1px #525252"
})
const chipInner = css({ width: "28px", height: "20px", borderRadius: "2px" })
const swatchName = css({ gridArea: "name", fontFamily: "ui-monospace, monospace" })
const swatchRole = css({ gridArea: "role", color: "#a3a3a3" })

/** Pieces to check the fit; not a real position. */
const SAMPLE = {
  terminals: { austin: COLOR.playerOne, buda: COLOR.playerOne } as Record<string, string>,
  hubs: [
    { node: "austin", slot: 0, color: COLOR.playerOne, lit: true },
    { node: "austin", slot: 1, color: COLOR.playerTwo, lit: false },
    { node: "sanMarcos", slot: 0, color: COLOR.playerTwo, lit: false },
    { node: "sanAntonio", slot: 2, color: COLOR.playerOne, lit: true }
  ],
  sticks: [
    { a: "austin", b: "buda", color: COLOR.playerOne },
    { a: "buda", b: "sanMarcos", color: COLOR.playerOne }
  ]
}

/** Link line width (mm). */
const CABLE_WIDTH = 2

/** Region border ("county line"): two parallel lines with a paper-white gap between (mm). */
const REGION_BORDER = { line: 0.5, gap: 1 }

/** Width of a slot's halo ring, inset from the piece footprint (mm). */
const HALO_RING = 1

/** An empty slot: a white ring inset inside the footprint, a translucent white well within. */
function HaloRect(
  { x, y, width, height, transform }: { x: number; y: number; width: number; height: number; transform?: string }
) {
  const h = HALO_RING / 2
  return (
    <g {...(transform ? { transform } : {})}>
      <rect x={x} y={y} width={width} height={height} rx={CORNER} fill={COLOR.halo} fillOpacity={WELL_OPACITY} />
      <rect
        x={x + h}
        y={y + h}
        width={width - HALO_RING}
        height={height - HALO_RING}
        rx={Math.max(CORNER - h, 0)}
        fill="none"
        stroke={COLOR.halo}
        strokeWidth={HALO_RING}
      />
    </g>
  )
}

function HaloCircle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={COLOR.halo} fillOpacity={WELL_OPACITY} />
      <circle cx={cx} cy={cy} r={r - HALO_RING / 2} fill="none" stroke={COLOR.halo} strokeWidth={HALO_RING} />
    </g>
  )
}

/** The Lit side's mark: a white four-point spark. Unlit is the blank side. */
const SPARK = { outer: 5, inner: 1.3 }

function sparkPath(cx: number, cy: number) {
  const points = Array.from({ length: 8 }, (_, k) => {
    const r = k % 2 === 0 ? SPARK.outer : SPARK.inner
    const a = (k * Math.PI) / 4 - Math.PI / 2
    return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`
  })
  return `M ${points.join(" L ")} Z`
}

/** One pattern per region level: faint marks on bare paper. `url(#level-k)` works anywhere on the page. */
function LevelPatterns() {
  return (
    <defs>
      {LEVELS.map((t, k) => {
        const lined = t.hatch === "diagonal" || t.hatch === "cross"
        const p = t.hatch === "dots" ? HATCH.dotPitch : HATCH.pitch
        return (
          <pattern
            key={k}
            id={`level-${k}`}
            patternUnits="userSpaceOnUse"
            width={p}
            height={p}
            {...(lined ? { patternTransform: "rotate(45)" } : {})}
          >
            <rect width={p} height={p} fill={COLOR.paper} />
            {t.hatch === "dots" && <circle cx={p / 2} cy={p / 2} r={HATCH.dot} fill={COLOR.hatch} />}
            {lined && <line x1={0} y1={p / 2} x2={p} y2={p / 2} stroke={COLOR.hatch} strokeWidth={HATCH.line} />}
            {t.hatch === "cross" && (
              <line x1={p / 2} y1={0} x2={p / 2} y2={p} stroke={COLOR.hatch} strokeWidth={HATCH.line} />
            )}
          </pattern>
        )
      })}
    </defs>
  )
}

const INCHES = Array.from({ length: 11 }, (_, i) => i)

function Grid() {
  return (
    <g>
      {INCHES.slice(0, 10).map((i) => i + 0.5).map((half) => (
        <g key={`h${half}`} stroke={COLOR.gridMinor} strokeWidth={0.2}>
          <line x1={half * IN} y1={0} x2={half * IN} y2={SHEET.height} />
          <line x1={0} y1={half * IN} x2={SHEET.width} y2={half * IN} />
        </g>
      ))}
      {INCHES.map((i) => (
        <g key={i} stroke={COLOR.gridMajor} strokeWidth={0.3}>
          <line x1={i * IN} y1={0} x2={i * IN} y2={SHEET.height} />
          <line x1={0} y1={i * IN} x2={SHEET.width} y2={i * IN} />
        </g>
      ))}
      {INCHES.slice(1, 10).map((i) => (
        <g key={`l${i}`} fontSize={2.6} fill={COLOR.gridLabel}>
          <text x={i * IN + 0.8} y={3}>{i}"</text>
          <text x={0.8} y={i * IN - 0.8}>{i}"</text>
        </g>
      ))}
    </g>
  )
}

/** Relative luminance, for ordering greys light to dark. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const isGrey = (hex: string) => hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7)

/** Every distinct grey on the board, light to dark, with the roles that use it. */
const GREYS = [...new Set(Object.values(COLOR).filter(isGrey))]
  .sort((a, b) => luminance(b) - luminance(a))
  .map((hex) => ({
    hex,
    names: (Object.keys(COLOR) as (keyof typeof COLOR)[]).filter((k) => COLOR[k] === hex)
  }))

function Palette() {
  return (
    <section className={palette}>
      <div className={heading}>Palette</div>
      <div className={subheading}>Greys, light to dark</div>
      <div className={ramp}>
        {GREYS.map(({ hex, names }) => (
          <div
            key={hex}
            className={rampCell}
            style={{ background: hex, color: luminance(hex) > 0.3 ? "#262626" : "#f5f5f5" }}
            title={names.join(", ")}
          >
            {hex}
          </div>
        ))}
      </div>
      <div className={css({ display: "grid", rowGap: "8px" })}>
        <div className={subheading}>Region levels (assigned so neighbours differ)</div>
        <div className={swatches}>
          {LEVELS.map((level, k) => (
            <div key={level.hatch} className={swatchCard}>
              <svg className={chip} viewBox="0 0 14.8 10.6">
                <rect width={14.8} height={10.6} fill={`url(#level-${k})`} />
                <rect x={4.4} y={2.8} width={6} height={5} rx={CORNER} fill={COLOR[level.pad]} />
              </svg>
              <div className={swatchName}>level {k + 1}: {level.hatch}</div>
              <div className={swatchRole}>pads + name tabs {level.pad} {COLOR[level.pad]}</div>
            </div>
          ))}
        </div>
      </div>
      {PALETTE.map(({ group, swatches: list }) => (
        <div key={group} className={css({ display: "grid", rowGap: "8px" })}>
          <div className={subheading}>{group}</div>
          <div className={swatches}>
            {list.map((s) => (
              <div key={`${s.name}-${s.role}`} className={swatchCard}>
                <div className={chip} style={{ background: s.on ? COLOR[s.on] : "#171717" }}>
                  <div className={chipInner} style={{ background: COLOR[s.name], opacity: s.opacity ?? 1 }} />
                </div>
                <div className={swatchName}>
                  {s.name} {COLOR[s.name]}
                  {s.opacity === undefined ? "" : ` @ ${Math.round(s.opacity * 100)}%`}
                </div>
                <div className={swatchRole}>{s.role}{s.on ? ` (on ${s.on})` : ""}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

export function MapPage() {
  const [sample, setSample] = useState(true)
  const [grid, setGrid] = useState(true)
  const [seed, setSeed] = useState(0)
  const map = useMemo(() => layoutMap(LAYOUT_SPEC, seed), [seed])
  const regions = useMemo(() => regionShapes(map.nodes), [map])

  return (
    <div className={page}>
      <div className={bar}>
        <strong>Fiber test map</strong>
        <label>
          <input className={check} type="checkbox" checked={sample} onChange={(e) => setSample(e.target.checked)} />
          {" "}
          sample pieces
        </label>
        <label>
          <input className={check} type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} />{" "}
          1in grid
        </label>
        <button className={button} type="button" onClick={() => setSeed((s) => s + 1)}>Reroll layout</button>
        {seed > 0 && <button className={button} type="button" onClick={() => setSeed(0)}>Reset</button>}
        <span>seed {seed}</span>
      </div>

      <svg
        className={sheet}
        viewBox={`0 0 ${SHEET.width} ${SHEET.height}`}
        style={{ width: `${SHEET.width}mm`, height: `${SHEET.height}mm` }}
      >
        <rect width={SHEET.width} height={SHEET.height} fill={COLOR.paper} />
        <LevelPatterns />
        {regions.fills.map((r) => (
          <path key={r.region} d={r.d} fill={`url(#level-${regions.levels[r.region]})`} fillRule="evenodd" />
        ))}
        {grid && <Grid />}
        <path
          d={regions.borders}
          fill="none"
          stroke={COLOR.regionBorder}
          strokeWidth={2 * REGION_BORDER.line + REGION_BORDER.gap}
          strokeLinejoin="round"
          strokeLinecap="butt"
        />
        <path
          d={regions.borders}
          fill="none"
          stroke={COLOR.paper}
          strokeWidth={REGION_BORDER.gap}
          strokeLinejoin="round"
          strokeLinecap="butt"
        />

        {map.edges.map((e) => (
          <path key={`${e.a}-${e.b}`} d={e.d} fill="none" stroke={COLOR.cable} strokeWidth={CABLE_WIDTH} />
        ))}

        {map.edges.map((e) => {
          const owned = SAMPLE.sticks.find((s) => s.a === e.a && s.b === e.b)
          const cost = EDGES.find((x) => x.a === e.a && x.b === e.b)?.cost ?? 0
          const turn = `rotate(${e.slot.angle} ${e.slot.x} ${e.slot.y})`
          return (
            <g key={`${e.a}-${e.b}`}>
              <rect
                rx={STICK_SLOT.radius}
                x={e.slot.x - STICK_SLOT.length / 2 - STICK_SLOT.border}
                y={e.slot.y - STICK_SLOT.width / 2 - STICK_SLOT.border}
                width={STICK_SLOT.length + 2 * STICK_SLOT.border}
                height={STICK_SLOT.width + 2 * STICK_SLOT.border}
                fill={COLOR.board}
                transform={turn}
              />
              {sample && owned
                ? (
                  <rect
                    rx={CORNER}
                    x={e.slot.x - PIECE.stick.length / 2}
                    y={e.slot.y - PIECE.stick.width / 2}
                    width={PIECE.stick.length}
                    height={PIECE.stick.width}
                    fill={owned.color}
                    transform={turn}
                  />
                )
                : (
                  <>
                    <rect
                      rx={CORNER}
                      x={e.slot.x - STICK_SLOT.length / 2}
                      y={e.slot.y - STICK_SLOT.width / 2}
                      width={STICK_SLOT.length}
                      height={STICK_SLOT.width}
                      fill={COLOR.stickSlot}
                      transform={turn}
                    />
                    {Array.from({ length: cost }, (_, k) => (
                      <circle
                        key={k}
                        cx={e.slot.x + (k - (cost - 1) / 2) * COST_DOT.pitch}
                        cy={e.slot.y}
                        r={COST_DOT.r}
                        fill={COLOR.ink}
                        transform={turn}
                      />
                    ))}
                  </>
                )}
            </g>
          )
        })}

        {NODES.map((node) => {
          const pad = padOf(node, map.nodes[node.id]!)
          const padColor = COLOR[LEVELS[regions.levels[node.region]]!.pad]
          const terminal = { x: pad.slotsLeft + pad.slots.terminal.x, y: pad.slotsTop + pad.slots.terminal.y }
          return (
            <g key={node.id}>
              <rect x={pad.left} y={pad.top} width={pad.width} height={pad.height} rx={CORNER} fill={padColor} />
              <rect
                x={pad.tab.x}
                y={pad.tab.y}
                width={pad.tab.width}
                height={pad.tab.height}
                rx={CORNER}
                fill={padColor}
              />
              <text
                x={pad.label.x}
                y={pad.label.y}
                fontSize={LABEL.size}
                textAnchor="middle"
                fill={COLOR.label}
                fontWeight={600}
                fontVariant="small-caps"
                letterSpacing={0.15}
              >
                {node.name}
              </text>
              {sample && SAMPLE.terminals[node.id]
                ? (
                  <rect
                    rx={CORNER}
                    x={terminal.x}
                    y={terminal.y}
                    width={PIECE.terminal}
                    height={PIECE.terminal}
                    fill={SAMPLE.terminals[node.id]}
                  />
                )
                : <HaloRect x={terminal.x} y={terminal.y} width={SLOT.terminal} height={SLOT.terminal} />}
              {pad.slots.hubs.map((hub, slot) => {
                const cx = pad.slotsLeft + hub.cx
                const cy = pad.slotsTop + hub.cy
                const piece = sample ? SAMPLE.hubs.find((h) => h.node === node.id && h.slot === slot) : undefined
                if (!piece) return <HaloCircle key={slot} cx={cx} cy={cy} r={SLOT.hub / 2} />
                return (
                  <g key={slot}>
                    <circle cx={cx} cy={cy} r={PIECE.hub / 2} fill={piece.color} />
                    {piece.lit && <path d={sparkPath(cx, cy)} fill={COLOR.label} />}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>

      <div className={notes}>
        <div>
          Sheet 10 × 10in. Terminal {PIECE.terminal}mm cube, Hub Ø{PIECE.hub}mm disc, cable {PIECE.stick.length}×
          {PIECE.stick.width}mm stick; slots are exact. Empty Terminal and Hub slots are halos: a{" "}
          {HALO_RING}mm white ring and a{" "}
          {Math.round(WELL_OPACITY * 100)}% white well. Sample Hubs: blank disc = Unlit, white spark = Lit.
        </div>
        <div>Link runs: {map.edges.map((e) => `${e.a}–${e.b} ${e.span.toFixed(0)}mm`).join(", ")}</div>
        {map.violations.map((v) => <div key={v} className={bad}>{v}</div>)}
        {regions.split.map((s) => (
          <div key={s.region} className={bad}>{REGIONS[s.region].name} region is in {s.pieces} pieces</div>
        ))}
      </div>

      <Palette />
    </div>
  )
}

import { useState } from "react"
import { COLOR, HATCH, hatchCoverage, LEVELS, PALETTE, WELL_OPACITY } from "~/games/fiber/colors"
import { I10, I35, type LatLon, RIVERS } from "~/games/fiber/map/geography"
import {
  CONTENT_MARGIN,
  CORNER,
  edgeIsFringe,
  EDGES,
  type Exit,
  exitEnd,
  FOLDS,
  IN,
  isExitNode,
  isFringe,
  LABEL,
  NO_TERMINALS,
  NODES,
  padOf,
  PIECE,
  project,
  REGIONS,
  SHEET,
  SLOT,
  STICK_SLOT
} from "~/games/fiber/map/map"
import { type MapLayers, type SolvedView, useSolvedMap } from "~/games/fiber/map/view"
import { css } from "~/generated/styled-system/css"

/**
 * The 2–3 player map on the 20×20in quad-fold, true size (1 SVG unit = 1mm). Pads and stick slots are
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

/** Line widths (mm) for the real geography: the casing is paper, wider, so the hatch stops short of it. */
const GEO = { highway: 2.4, river: 0.9, casing: 2.5 }

const pathOfLine = (points: readonly LatLon[]) =>
  points.map((p, i) => {
    const { x, y } = project(p)
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(" ")

const RIVER_PATHS = RIVERS.map((r) => ({ name: r.name, d: pathOfLine(r.points) }))
const HIGHWAY_PATH = `${pathOfLine(I35)} ${pathOfLine(I10)}`

/** I-35, I-10 and the rivers at their real lat/lon, same projection as the towns. Clipped to the trim. */
function Geography() {
  const line = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const
  return (
    <g clipPath="url(#trim)" pointerEvents="none">
      {RIVER_PATHS.map((r) => (
        <path key={`c${r.name}`} d={r.d} {...line} stroke={COLOR.paper} strokeWidth={GEO.river + 2 * GEO.casing} />
      ))}
      <path d={HIGHWAY_PATH} {...line} stroke={COLOR.paper} strokeWidth={GEO.highway + 2 * GEO.casing} />
      {RIVER_PATHS.map((r) => <path key={r.name} d={r.d} {...line} stroke={COLOR.river} strokeWidth={GEO.river} />)}
      <path d={HIGHWAY_PATH} {...line} stroke={COLOR.highway} strokeWidth={GEO.highway} />
    </g>
  )
}

/** Backbone exit: arrowhead and symbol sizes (mm), and the destination label. */
const EXIT = { arrow: 5, badge: 4.5, label: 4 }

/** A globe: the backbone symbol, white on a cable-dark disc. */
function BackboneBadge({ x, y }: { x: number; y: number }) {
  const r = EXIT.badge
  const g = r * 0.62
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={COLOR.cable} stroke={COLOR.paper} strokeWidth={0.6} />
      <g fill="none" stroke={COLOR.paper} strokeWidth={0.45}>
        <circle cx={x} cy={y} r={g} />
        <ellipse cx={x} cy={y} rx={g * 0.45} ry={g} />
        <line x1={x - g} y1={y} x2={x + g} y2={y} />
      </g>
    </g>
  )
}

/** Arrowhead at the exit's end, pointing off the board along its highway, and the destination beside it. */
function ExitEnd({ exit }: { exit: Exit }) {
  const { at, heading: h } = exitEnd(exit)
  const a = EXIT.arrow
  const tip = { x: at.x + h.x * a, y: at.y + h.y * a }
  const left = { x: at.x - h.y * a * 0.7, y: at.y + h.x * a * 0.7 }
  const right = { x: at.x + h.y * a * 0.7, y: at.y - h.x * a * 0.7 }
  // Label on the arrow's right-hand side, a little back from the tip.
  const side = { x: -h.y, y: h.x }
  // A label over a sideways arrow ends at the tip, so it runs back onto the board.
  const across = Math.abs(side.x) <= 0.3
  const label = {
    x: across ? tip.x : at.x + side.x * a * 1.4,
    // Sideways arrows carry their label above the line.
    y: across ? at.y - a * 1.1 : at.y + side.y * a * 1.4 + EXIT.label * 0.35
  }
  return (
    <g>
      <path d={`M ${tip.x} ${tip.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`} fill={COLOR.cable} />
      <text
        x={label.x}
        y={label.y}
        textAnchor={side.x > 0.3 ? "start" : side.x < -0.3 ? "end" : h.x > 0 ? "end" : "start"}
        fontSize={EXIT.label}
        fontWeight={700}
        letterSpacing={0.3}
        fill={COLOR.cable}
      >
        {exit.to.toUpperCase()}
      </text>
    </g>
  )
}

/** Fringe pieces when the fringe is out of play. */
const OUT_OF_PLAY = 0.25

/** Printer's guides, screen only: the fold band and the safe zone inside the trim. */
function Guides() {
  const band = SHEET.fold
  const guide = { fill: "rgba(255, 0, 0, 0.12)" }
  return (
    <g pointerEvents="none">
      {FOLDS.x.map((x) => <rect key={`x${x}`} x={x - band / 2} y={0} width={band} height={SHEET.height} {...guide} />)}
      {FOLDS.y.map((y) => <rect key={`y${y}`} x={0} y={y - band / 2} width={SHEET.width} height={band} {...guide} />)}
      <rect
        x={SHEET.safe / 2}
        y={SHEET.safe / 2}
        width={SHEET.width - SHEET.safe}
        height={SHEET.height - SHEET.safe}
        fill="none"
        stroke="rgba(255, 0, 0, 0.4)"
        strokeWidth={SHEET.safe}
      />
      <rect
        x={CONTENT_MARGIN}
        y={CONTENT_MARGIN}
        width={SHEET.width - 2 * CONTENT_MARGIN}
        height={SHEET.height - 2 * CONTENT_MARGIN}
        fill="none"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth={0.5}
        strokeDasharray="3 2"
      />
    </g>
  )
}

const coreNodes = NODES.filter((n) => !isFringe(n.id))
const coreEdges = EDGES.filter((e) => !edgeIsFringe(e))
const hubSlots = (nodes: typeof NODES) => nodes.reduce((sum, n) => sum + n.hubs, 0)
const COUNTS = {
  2: `${hubSlots(coreNodes)} : ${coreNodes.length} : ${coreEdges.length}`,
  3: `${hubSlots(NODES)} : ${NODES.length} : ${EDGES.length}`
}

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

/**
 * Region border: one thin dashed line (mm), the quietest line on the board (2026-11-12; was a double
 * line, which read too much like the roads and rivers). Drawn under them, so they cut through it.
 */
const REGION_BORDER = { line: 0.5, dash: 2, gap: 1.6 }

/** Width of a slot's halo ring, inset from the piece footprint (mm). */
const HALO_RING = 1

/** An empty slot: a white ring inset inside the footprint, a translucent white well within. */
export function HaloRect(
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

export function HaloCircle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={COLOR.halo} fillOpacity={WELL_OPACITY} />
      <circle cx={cx} cy={cy} r={r - HALO_RING / 2} fill="none" stroke={COLOR.halo} strokeWidth={HALO_RING} />
    </g>
  )
}

/** The Lit side's mark: a white four-point spark. Unlit is the blank side. */
const SPARK = { outer: 4, inner: 1.05 }

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

const INCHES = Array.from({ length: Math.round(SHEET.width / IN) + 1 }, (_, i) => i)
const LAST = INCHES.length - 1

function Grid() {
  return (
    <g>
      {INCHES.slice(0, LAST).map((i) => i + 0.5).map((half) => (
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
      {INCHES.slice(1, LAST).map((i) => (
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

const linear = (hex: string) => {
  const c = parseInt(hex.slice(1, 3), 16) / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** OKLab lightness of a grey: the cube root of its linear value. */
const greyL = (hex: string) => linear(hex) ** (1 / 3)

/** OKLab lightness of a hatch seen from arm's length: ink and paper mixed by coverage. */
const hatchL = (hatch: (typeof LEVELS)[number]["hatch"]) => {
  const cover = hatchCoverage(hatch)
  return ((1 - cover) * linear(COLOR.paper) + cover * linear(COLOR.hatch)) ** (1 / 3)
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
              <div className={swatchName}>
                level {k + 1}: {level.hatch} · ground L {hatchL(level.hatch).toFixed(3)}
              </div>
              <div className={swatchRole}>
                pads + name tabs {level.pad} {COLOR[level.pad]} · L {greyL(COLOR[level.pad]).toFixed(2)}
              </div>
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

/** The whole board's art in sheet mm (0,0 = trim top-left), for any `<svg>` viewBox to frame. */
export function MapArt({ view, layers }: { view: SolvedView; layers: MapLayers }) {
  const { map, regions, links, exits } = view
  const { sample, grid, guides, template, players } = layers
  const dim = (fringe: boolean) => (players < 3 && fringe ? { opacity: OUT_OF_PLAY } : {})
  return (
    <>
      <rect
        x={-SHEET.bleed}
        y={-SHEET.bleed}
        width={SHEET.width + 2 * SHEET.bleed}
        height={SHEET.height + 2 * SHEET.bleed}
        fill={COLOR.paper}
      />
      <LevelPatterns />
      {regions.fills.map((r) => (
        <path key={r.region} d={r.d} fill={`url(#level-${regions.levels[r.region]})`} fillRule="evenodd" />
      ))}
      <defs>
        <clipPath id="trim">
          <rect x={0} y={0} width={SHEET.width} height={SHEET.height} />
        </clipPath>
      </defs>
      {grid && <Grid />}
      <path
        d={regions.borders}
        fill="none"
        stroke={COLOR.regionBorder}
        strokeWidth={REGION_BORDER.line}
        strokeDasharray={`${REGION_BORDER.dash} ${REGION_BORDER.gap}`}
        strokeLinejoin="round"
        strokeLinecap="butt"
      />
      <Geography />

      {exits.map(({ exit, edge }) => (
        <g key={exit.id} {...dim(isFringe(exit.town))}>
          <path d={edge.d} fill="none" stroke={COLOR.cable} strokeWidth={CABLE_WIDTH} />
          <ExitEnd exit={exit} />
          <BackboneBadge x={edge.slot.x} y={edge.slot.y} />
        </g>
      ))}

      {links.map((e) => (
        <path
          key={`${e.a}-${e.b}`}
          d={e.d}
          fill="none"
          stroke={COLOR.cable}
          strokeWidth={CABLE_WIDTH}
          {...dim(edgeIsFringe(e))}
        />
      ))}

      {links.map((e) => {
        const owned = SAMPLE.sticks.find((s) => s.a === e.a && s.b === e.b)
        const turn = `rotate(${e.slot.angle} ${e.slot.x} ${e.slot.y})`
        return (
          <g key={`${e.a}-${e.b}`} {...dim(edgeIsFringe(e))}>
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
                <rect
                  rx={CORNER}
                  x={e.slot.x - STICK_SLOT.length / 2}
                  y={e.slot.y - STICK_SLOT.width / 2}
                  width={STICK_SLOT.length}
                  height={STICK_SLOT.width}
                  fill={COLOR.stickSlot}
                  transform={turn}
                />
              )}
          </g>
        )
      })}

      {NODES.map((node) => {
        const pad = padOf(node, map.nodes[node.id]!)
        const padColor = COLOR[LEVELS[regions.levels[node.region]]!.pad]
        const terminal = { x: pad.slotsLeft + pad.slots.terminal.x, y: pad.slotsTop + pad.slots.terminal.y }
        return (
          <g key={node.id} {...dim(isFringe(node.id))}>
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
            {NO_TERMINALS ? null : sample && SAMPLE.terminals[node.id]
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
              const h = SLOT.hub / 2
              if (!piece) {
                return NO_TERMINALS
                  ? <HaloRect key={slot} x={cx - h} y={cy - h} width={SLOT.hub} height={SLOT.hub} />
                  : <HaloCircle key={slot} cx={cx} cy={cy} r={h} />
              }
              return (
                <g key={slot}>
                  {NO_TERMINALS
                    ? <rect x={cx - h} y={cy - h} width={PIECE.hub} height={PIECE.hub} rx={CORNER} fill={piece.color} />
                    : <circle cx={cx} cy={cy} r={PIECE.hub / 2} fill={piece.color} />}
                  {piece.lit && <path d={sparkPath(cx, cy)} fill={COLOR.label} />}
                </g>
              )
            })}
          </g>
        )
      })}
      {guides && <Guides />}
      {template && (
        <image
          href={SHEET.template}
          x={-SHEET.bleed}
          y={-SHEET.bleed}
          width={SHEET.width + 2 * SHEET.bleed}
          height={SHEET.height + 2 * SHEET.bleed}
          opacity={0.6}
          pointerEvents="none"
        />
      )}
    </>
  )
}

export function MapPage() {
  const [sample, setSample] = useState(true)
  const [grid, setGrid] = useState(true)
  const [seed, setSeed] = useState(0)
  const [players, setPlayers] = useState<2 | 3>(3)
  const [guides, setGuides] = useState(true)
  const [template, setTemplate] = useState(false)
  const view = useSolvedMap(seed)
  const { map, regions, links } = view
  const drifts = Object.entries(map.drift).filter(([id]) => !isExitNode(id))
  const driftMean = drifts.reduce((s, [, d]) => s + d, 0) / drifts.length
  const driftWorst = drifts.reduce((w, d) => (d[1] > w[1] ? d : w))

  return (
    <div className={page}>
      <div className={bar}>
        <strong>Fiber 2–3p map</strong>
        <label>
          <select value={players} onChange={(e) => setPlayers(Number(e.target.value) as 2 | 3)}>
            <option value={2}>2 players</option>
            <option value={3}>3 players</option>
          </select>
        </label>
        <label>
          <input className={check} type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} />
          {" "}
          folds + safe zone
        </label>
        <label>
          <input
            className={check}
            type="checkbox"
            checked={template}
            onChange={(e) => setTemplate(e.target.checked)}
          />{" "}
          TGC template
        </label>
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
        <a className={button} href={`/fiber/print?seed=${seed}`}>Print tiles</a>
        <span>
          drift: mean {driftMean.toFixed(0)}mm, worst {driftWorst[0]} {driftWorst[1].toFixed(0)}mm
        </span>
      </div>

      <svg
        className={sheet}
        viewBox={`${-SHEET.bleed} ${-SHEET.bleed} ${SHEET.width + 2 * SHEET.bleed} ${SHEET.height + 2 * SHEET.bleed}`}
        style={{ width: `${SHEET.width + 2 * SHEET.bleed}mm`, height: `${SHEET.height + 2 * SHEET.bleed}mm` }}
      >
        <MapArt view={view} layers={{ sample, grid, guides, template, players }} />
      </svg>

      <div className={notes}>
        <div>
          Hub slots : nodes : links: 2p core {COUNTS[2]}, 3p with fringe {COUNTS[3]}. Board {SHEET.width / IN} ×{" "}
          {SHEET.height / IN}in quad-fold; red: fold bands and safe zone.
        </div>
        <div>
          {NO_TERMINALS ? "No Terminals (experiment)," : `Terminal ${PIECE.terminal}mm cube,`}{" "}
          Hub Ø{PIECE.hub}mm disc, cable {PIECE.stick.length}×
          {PIECE.stick.width}mm stick; slots are exact. Empty Terminal and Hub slots are halos: a{" "}
          {HALO_RING}mm white ring and a{" "}
          {Math.round(WELL_OPACITY * 100)}% white well. Sample Hubs: blank disc = Unlit, white spark = Lit.
        </div>
        <div>
          Towns sit at their real lat/lon, Austin and San Antonio exactly; drift is how far the layout moved each one.
          I-35 and rivers traced from OpenStreetMap.
        </div>
        <div>Link runs: {links.map((e) => `${e.a}–${e.b} ${e.span.toFixed(0)}mm`).join(", ")}</div>
        {map.violations.map((v) => <div key={v} className={bad}>{v}</div>)}
        {regions.split.map((s) => (
          <div key={s.region} className={bad}>{REGIONS[s.region].name} region is in {s.pieces} pieces</div>
        ))}
      </div>

      <Palette />
    </div>
  )
}

import { useMemo, useState } from "react"
import { COLOR, LEVELS } from "~/games/fiber/colors"
import { findFaces } from "~/games/fiber/faces/faces"
import { LABEL_TRACKING, LAYOUT_SPEC, NODE, NODES, padOf, RAYS } from "~/games/fiber/faces/map"
import { layoutMap, type Vec } from "~/games/fiber/map/layout"
import { CORNER, LABEL, SHEET, STICK_SLOT } from "~/games/fiber/map/map"
import { BackboneBadge, CABLE_WIDTH, Guides, HaloRect, LevelPatterns } from "~/games/fiber/routes/MapPage"
import { css } from "~/generated/styled-system/css"

/** Faces experiment: the regional map's towns and links, each town one 16mm Hub square, regions = areas the links enclose. */

const root = css({
  display: "grid",
  gridTemplateAreas: `
    "bar"
    "board"
    "keys"`,
  justifyItems: "center",
  alignContent: "start",
  gap: "12px",
  padding: "24px",
  minHeight: "100vh",
  background: "#404040",
  color: "#e5e5e5",
  fontFamily: "system-ui, sans-serif",
  fontSize: "13px"
})
const bar = css({ gridArea: "bar", display: "grid", gridAutoFlow: "column", gap: "16px", alignItems: "center" })
const board = css({ gridArea: "board", background: "white" })
const keys = css({
  gridArea: "keys",
  display: "grid",
  gap: "2px",
  fontFamily: "ui-monospace, monospace",
  fontSize: "11px"
})
const button = css({ padding: "4px 10px", background: "#525252", borderRadius: "4px", cursor: "pointer" })

const OFF_LIMITS_FILL = COLOR.gridMinor
/**
 * Barriers use the topographic escarpment symbol: a line with short ticks hung off one side, read as
 * "can't cross" and nothing like a slotted cable. Ticks start `clear` mm out so the town square stays clean.
 */
const BARRIER = { line: 1, tick: { width: 0.5, length: 2.5, pitch: 2 }, clear: 4 }

/** Ticks every `pitch` mm along the polyline, perpendicular, on the given side of travel. */
function ticksAlong(pts: Vec[], side: "left" | "right") {
  const sign = side === "left" ? 1 : -1
  const out: { a: Vec; b: Vec }[] = []
  let next = BARRIER.clear
  let walked = 0
  for (let i = 0; i + 1 < pts.length; i++) {
    const p = pts[i]!, q = pts[i + 1]!
    const l = Math.hypot(q.x - p.x, q.y - p.y)
    if (!l) continue
    const u = { x: (q.x - p.x) / l, y: (q.y - p.y) / l }
    // Screen y points down, so (u.y, -u.x) is the walker's left.
    const n = { x: u.y * sign, y: -u.x * sign }
    while (next <= walked + l) {
      const t = next - walked
      const a = { x: p.x + u.x * t, y: p.y + u.y * t }
      out.push({ a, b: { x: a.x + n.x * BARRIER.tick.length, y: a.y + n.y * BARRIER.tick.length } })
      next += BARRIER.tick.pitch
    }
    walked += l
  }
  return out
}

function Barrier({ pts, side }: { pts: Vec[]; side: "left" | "right" }) {
  return (
    <g stroke={COLOR.cable}>
      <path
        d={pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("")}
        fill="none"
        strokeWidth={BARRIER.line}
      />
      {ticksAlong(pts, side).map(({ a, b }, k) => (
        <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={BARRIER.tick.width} />
      ))}
    </g>
  )
}
/**
 * Backbone exits are already built: a cased line (dark with a paper core), the map convention for
 * existing roads and rails, and no slot. Cable stays a plain solid line, barriers tick lines.
 */
const BACKBONE = { width: 3, core: 0.8 }
/** Globe on a backbone exit, a touch bigger than the regional map's 4.5mm. */
const EXIT_BADGE = 5

/** Globe in a backbone town's Hub square: a Hub here splices into the national network. */
const HUB_GLOBE = { r: 5, line: 0.6 }

function HubGlobe({ x, y }: { x: number; y: number }) {
  const g = HUB_GLOBE.r
  return (
    <g fill="none" stroke={COLOR.paper} strokeWidth={HUB_GLOBE.line}>
      <circle cx={x} cy={y} r={g} />
      <ellipse cx={x} cy={y} rx={g * 0.45} ry={g} />
      <line x1={x - g} y1={y} x2={x + g} y2={y} />
    </g>
  )
}

/** Zone number: a 12mm light-grey disc in a 1.5mm paper ring, quieter than the network. */
const ZONE_DISC = { r: 6, ring: 1.5, fill: COLOR.regionBorder, font: 6 }
const SLOT_BOX = { length: STICK_SLOT.length + 2 * STICK_SLOT.border, width: STICK_SLOT.width + 2 * STICK_SLOT.border }

const pathOf = (pts: Vec[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("") + "Z"

export function FacesPage() {
  const [seed, setSeed] = useState(0)
  const [labels, setLabels] = useState(true)
  const [guides, setGuides] = useState(false)
  const [template, setTemplate] = useState(false)
  const map = useMemo(() => layoutMap(LAYOUT_SPEC, seed), [seed])
  const faces = useMemo(() => findFaces(map), [map])
  /** Only zones in play are numbered, so the highest number is the zone count. */
  const numberOf = new Map(faces.filter((f) => !f.offLimits).map((f, k) => [f.key, k + 1]))
  const rayOf = new Map(RAYS.map((r) => [r.node, r]))
  const backbone = new Set(RAYS.filter((r) => r.kind === "exit").map((r) => r.town))
  const links = map.edges.filter((e) => !rayOf.has(e.b))
  const rays = map.edges.flatMap((e) => {
    const r = rayOf.get(e.b)
    return r ? [{ e, r }] : []
  })

  return (
    <div className={root}>
      <div className={bar}>
        <span>
          Faces · {NODES.length} towns · {links.length} links · {faces.length} regions (
          {faces.filter((f) => f.offLimits).length} off-limits)
          {map.violations.length ? ` · ${map.violations.length} layout violations` : ""}
        </span>
        <button className={button} onClick={() => setSeed((s) => s + 1)}>Reroll ({seed})</button>
        <label>
          <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} /> Face labels
        </label>
        <label>
          <input type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} /> Folds + safe zone
        </label>
        <label>
          <input type="checkbox" checked={template} onChange={(e) => setTemplate(e.target.checked)} /> TGC template
        </label>
      </div>
      <div className={board}>
        <svg
          width={`${SHEET.width + 2 * SHEET.bleed}mm`}
          height={`${SHEET.height + 2 * SHEET.bleed}mm`}
          viewBox={`${-SHEET.bleed} ${-SHEET.bleed} ${SHEET.width + 2 * SHEET.bleed} ${SHEET.height + 2 * SHEET.bleed}`}
        >
          <LevelPatterns />
          <rect
            x={-SHEET.bleed}
            y={-SHEET.bleed}
            width={SHEET.width + 2 * SHEET.bleed}
            height={SHEET.height + 2 * SHEET.bleed}
            fill={COLOR.paper}
          />
          {faces.map((f) => (
            <path
              key={f.key}
              d={pathOf(f.points)}
              fill={f.offLimits ? OFF_LIMITS_FILL : `url(#level-${(f.level ?? 0) % LEVELS.length})`}
            />
          ))}

          {rays.map(({ e, r }) => {
            if (r.kind === "ghost") {
              const off = { x: r.at.x + r.heading.x * 40, y: r.at.y + r.heading.y * 40 }
              return <Barrier key={e.b} pts={[...e.points, r.at, off]} side={r.ticks} />
            }
            const far = { x: r.at.x + r.heading.x * SHEET.width, y: r.at.y + r.heading.y * SHEET.width }
            const line = (stroke: string, width: number) => (
              <>
                <path d={e.d} fill="none" stroke={stroke} strokeWidth={width} />
                <line x1={r.at.x} y1={r.at.y} x2={far.x} y2={far.y} stroke={stroke} strokeWidth={width} />
              </>
            )
            return (
              <g key={e.b}>
                {line(COLOR.cable, BACKBONE.width)}
                {line(COLOR.paper, BACKBONE.core)}
              </g>
            )
          })}
          {links.map((e) => (
            <path key={`${e.a}-${e.b}`} d={e.d} fill="none" stroke={COLOR.cable} strokeWidth={CABLE_WIDTH} />
          ))}
          {links.map((e) => (
            <g key={`slot-${e.a}-${e.b}`} transform={`rotate(${e.slot.angle} ${e.slot.x} ${e.slot.y})`}>
              <rect
                rx={STICK_SLOT.radius}
                x={e.slot.x - SLOT_BOX.length / 2}
                y={e.slot.y - SLOT_BOX.width / 2}
                width={SLOT_BOX.length}
                height={SLOT_BOX.width}
                fill={COLOR.board}
              />
              <rect
                rx={CORNER}
                x={e.slot.x - STICK_SLOT.length / 2}
                y={e.slot.y - STICK_SLOT.width / 2}
                width={STICK_SLOT.length}
                height={STICK_SLOT.width}
                fill={COLOR.stickSlot}
              />
            </g>
          ))}

          {rays.map(({ r }) =>
            r.kind === "exit" && <BackboneBadge key={`badge-${r.node}`} x={r.at.x} y={r.at.y} r={EXIT_BADGE} />
          )}

          {NODES.map((n) => {
            const pad = padOf(n, map.nodes[n.id]!)
            return (
              <g key={n.id}>
                <rect x={pad.left} y={pad.top} width={pad.size} height={pad.size} rx={CORNER} fill={COLOR.pad2} />
                <HaloRect
                  x={pad.centre.x - NODE.size / 2}
                  y={pad.centre.y - NODE.size / 2}
                  width={NODE.size}
                  height={NODE.size}
                />
                {backbone.has(n.id) && <HubGlobe x={pad.centre.x} y={pad.centre.y} />}
                <rect
                  x={pad.tab.x}
                  y={pad.tab.y}
                  width={pad.tab.width}
                  height={pad.tab.height}
                  rx={CORNER}
                  fill={COLOR.pad2}
                />
                <text
                  x={pad.label.x}
                  y={pad.label.y}
                  fontSize={LABEL.size}
                  textAnchor="middle"
                  fill={COLOR.label}
                  fontWeight={600}
                  fontVariant="small-caps"
                  letterSpacing={LABEL_TRACKING}
                >
                  {n.name}
                </text>
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
          {labels && faces.map((f) =>
            f.offLimits ? null : (
              <g key={`label-${f.key}`}>
                <circle cx={f.centre.x} cy={f.centre.y} r={ZONE_DISC.r + ZONE_DISC.ring} fill={COLOR.paper} />
                <circle cx={f.centre.x} cy={f.centre.y} r={ZONE_DISC.r} fill={ZONE_DISC.fill} />
                <text
                  x={f.centre.x}
                  y={f.centre.y + ZONE_DISC.font * 0.35}
                  fontSize={ZONE_DISC.font}
                  textAnchor="middle"
                  fill={COLOR.paper}
                  fontWeight={700}
                >
                  {numberOf.get(f.key)}
                </text>
              </g>
            )
          )}
        </svg>
      </div>
      {labels && (
        <div className={keys}>
          {faces.map((f) => (
            <div key={f.key}>
              {numberOf.get(f.key) ?? "–"}. {f.key}
              {f.offLimits ? " (off-limits)" : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

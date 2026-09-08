import type { CSSProperties, ReactNode } from "react"
import { markFor, markNamed } from "~/games/regolith/components/resourceMarks"
import { covers, zoneName } from "~/games/regolith/domain"
import type { Outcome, Silo, Terms, Zone } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * The silo board, print edition. One portrait letter sheet holds two silos;
 * `SiloSheet` draws whichever it is given, so the twelve split across six.
 * Two per sheet is more paper than three, but the wide zone boxes leave room
 * for a meeple beside the recipe and keep every price on one line.
 *
 * Every silo is two columns — tick track and zone boxes — sized so two silos
 * fill the printable page edge to edge. The whole sheet is a single CSS grid
 * with named areas, so a zone's tick cells and box are pinned to the same row
 * by name rather than by arithmetic. Machinery and polymer markers have no
 * printed slot; they go beside the zone, and the rule lives in the aid. A
 * sheet is as tall as its tallest silo; shorter silos leave their upper rows
 * empty. Covered zones are hatched — the cover tile from
 * `CoverSheet` lies over them, so they carry no label of their own.
 *
 * Components are shape-coded: goods are cubes, so anything printed for a cube
 * is a square; time is discs, so a tick is a 16mm circle the marker disc sits
 * on. The circles stack from the bottom of their zone, split down the middle
 * by the box's left border and resting on its bottom edge, so the track
 * column is exactly half a disc wide and the box pads its left side by the
 * other half; content is centered in what remains. The marker starts on the
 * bottom tick of zone I; there is no separate start cell.
 */

export const SHEET_W_IN = 8.5
export const SHEET_H_IN = 11
/** Time marker and time token discs are 16mm; a tick is drawn at disc size. */
export const DISC_MM = 16
const PAD_IN = 0.25
// Half a disc: the other half of each tick circle lies inside the zone box.
const TICK_W = DISC_MM / 2 / 25.4
const GAP_W = 0.25
const HEAD_H = 0.4
const ROW_GAP = 0.08
// Two silos span the printable width; five zones and a header span its height.
const ZONE_W = (SHEET_W_IN - 2 * PAD_IN - GAP_W) / 2 - TICK_W
export const ZONE_H = (SHEET_H_IN - 2 * PAD_IN - HEAD_H - 5 * ROW_GAP) / 5 - 0.005

// 1mm in CSS px, for the SVG marks, whose `size` is a pixel width.
const MM = 96 / 25.4

function areas(silos: readonly Silo[], maxZones: number): string {
  const rows: string[] = []
  const cols = (f: (j: number) => string[]) =>
    silos.flatMap((_, j) => [...f(j), j < silos.length - 1 ? "." : ""]).filter(Boolean).join(" ")
  rows.push(cols((j) => [`h${j}`, `h${j}`]))
  for (let i = maxZones; i >= 1; i--) rows.push(cols((j) => [`t${j}-${i}`, `z${j}-${i}`]))
  return rows.map((r) => `"${r}"`).join(" ")
}

function columns(n: number): string {
  return Array.from({ length: n }, (_, j) => `${TICK_W}in ${ZONE_W}in${j < n - 1 ? ` ${GAP_W}in` : ""}`).join(" ")
}

const sheet = css({
  width: `${SHEET_W_IN}in`,
  height: `${SHEET_H_IN}in`,
  padding: `${PAD_IN}in`,
  boxSizing: "border-box",
  background: "#fff",
  color: "#000",
  display: "grid",
  rowGap: `${ROW_GAP}in`,
  alignContent: "start",
  justifyContent: "center",
  fontFamily: "system-ui, sans-serif"
})

const head = css({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  borderBottom: "0.5mm solid #000",
  paddingBottom: "1mm",
  fontSize: "12pt",
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  whiteSpace: "nowrap"
})
const headId = css({ fontSize: "9pt", fontWeight: 600, color: "#555" })

// Painted after the box so the circles sit over its border and hatching.
const ticks = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "end",
  alignItems: "start",
  rowGap: "1.5mm",
  height: "100%",
  position: "relative",
  zIndex: 1
})
const tick = css({
  width: `${DISC_MM}mm`,
  height: `${DISC_MM}mm`,
  flex: "none",
  border: "0.3mm solid #000",
  borderRadius: "50%",
  boxSizing: "border-box",
  background: "#fff"
})

const box = css({
  height: "100%",
  border: "0.4mm solid #000",
  borderRadius: "1.5mm",
  boxSizing: "border-box",
  padding: `3mm 3mm 2.5mm ${DISC_MM / 2 + 1.5}mm`,
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gridTemplateAreas: `"name" "recipe" "time"`,
  justifyItems: "center",
  rowGap: "1mm",
  background: "#fff",
  position: "relative",
  overflow: "hidden"
})
const boxCovered = css({
  backgroundImage: "repeating-linear-gradient(135deg, #e5e5e5 0 1mm, #fff 1mm 3mm)"
})
const boxEmpty = css({ borderStyle: "dashed", color: "#888" })
const name = css({
  gridArea: "name",
  display: "flex",
  justifyContent: "center",
  textAlign: "center",
  fontSize: "8.5pt",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase"
})
const recipe = css({
  gridArea: "recipe",
  display: "grid",
  gridTemplateRows: "auto auto auto",
  gridTemplateAreas: `"in" "arrow" "out"`,
  alignContent: "start",
  justifyItems: "center",
  rowGap: "0.6mm",
  fontSize: "12pt",
  fontWeight: 700
})
const side = css({ display: "flex", alignItems: "center", gap: "1.6mm", whiteSpace: "nowrap" })
const down = css({ gridArea: "arrow", fontSize: "11pt", fontWeight: 400, lineHeight: 1, padding: "0 0.5mm" })
const term = css({ display: "inline-flex", alignItems: "center", gap: "0.5mm" })
const plus = css({ fontSize: "12pt", fontWeight: 400, padding: "0 0.5mm" })
const effectLabel = css({ fontSize: "11pt", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" })
// Wraps rather than clips: the widest price (three goods + time) can run
// past the box at this width, and a centered tail line reads fine.
const timeRow = css({
  gridArea: "time",
  justifySelf: "stretch",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.5mm 1mm",
  whiteSpace: "nowrap",
  fontSize: "9pt",
  fontWeight: 600,
  borderTop: "0.2mm dashed #999",
  paddingTop: "1mm",
  color: "#333"
})

export function TermList({ terms: ts, size = 5.4 }: { terms: Terms; size?: number }) {
  if (ts.length === 0) return <span className={term}>—</span>
  return (
    <>
      {ts.map((x, i) => {
        const Mark = markFor(x.good)
        return (
          <span key={i} className={term}>
            {i > 0 && <span className={plus}>+</span>}
            {x.qty}
            <Mark size={size * MM} color="black" />
          </span>
        )
      })}
    </>
  )
}

/** Time tokens owed, drawn like a goods term: count then the time mark. */
export function TimeTerm({ count, size = 5.4 }: { count: number; size?: number }) {
  const Mark = markNamed("time")
  return (
    <span className={term}>
      {count}
      <Mark size={size * MM} color="black" />
    </span>
  )
}

const EFFECT_LABEL: Record<Exclude<Outcome["kind"], "goods">, string> = {
  construct: "Uncover",
  worker: "+1 Worker",
  machinery: "1 Machine",
  polymers: "1 Polymer",
  "upgraded-worker": "Upgrade",
  special: "Project"
}

function OutcomeView({ outcome, size = 5.4 }: { outcome: Outcome; size?: number }) {
  if (outcome.kind === "goods") return <TermList terms={outcome.goods} size={size} />
  return <span className={effectLabel}>{EFFECT_LABEL[outcome.kind]}</span>
}

/** Inputs over an arrow over outputs — one term row per side, never wrapped. */
function RecipeView({ zone, className, size = 5.4 }: { zone: Zone; className: string; size?: number }) {
  return (
    <div className={className}>
      <span className={side} style={{ gridArea: "in" }}>
        <TermList terms={zone.cost} size={size} />
      </span>
      <span className={down}>↓</span>
      <span className={side} style={{ gridArea: "out" }}>
        <OutcomeView outcome={zone.outcome} size={size} />
      </span>
    </div>
  )
}

export function ZoneBox({ silo, n, zone, style }: { silo: Silo; n: number; zone: Zone; style?: CSSProperties }) {
  return (
    <div className={`${box} ${zone.cover ? boxCovered : ""}`} style={style}>
      <div className={name}>
        <span>{zoneName(silo, n)}</span>
      </div>
      <RecipeView zone={zone} className={recipe} />
      {zone.timeOption && (
        <div className={timeRow}>
          <span>or</span>
          <TermList terms={zone.timeOption.cost} size={4} />
          <span className={plus}>+</span>
          <TimeTerm count={zone.timeOption.extraTicks} size={4.8} />
        </div>
      )}
    </div>
  )
}

export function SiloSheet({ silos }: { silos: readonly Silo[] }) {
  const maxZones = Math.max(...silos.map((s) => s.maxZones))
  const cells: ReactNode[] = []
  silos.forEach((silo, j) => {
    cells.push(
      <div key={`h${j}`} className={head} style={{ gridArea: `h${j}` }}>
        <span>{silo.name}</span>
        <span className={headId}>{silo.id}</span>
      </div>
    )
    for (let n = 1; n <= silo.maxZones; n++) {
      const zone = silo.zones[n - 1]
      const t = zone?.ticks ?? 1
      cells.push(
        <div key={`t${j}-${n}`} className={ticks} style={{ gridArea: `t${j}-${n}` }}>
          {Array.from({ length: t }, (_, k) => <div key={k} className={tick} />)}
        </div>
      )
      cells.push(
        zone
          ? <ZoneBox key={`z${j}-${n}`} silo={silo} n={n} zone={zone} style={{ gridArea: `z${j}-${n}` }} />
          : (
            <div key={`z${j}-${n}`} className={`${box} ${boxEmpty}`} style={{ gridArea: `z${j}-${n}` }}>
              <div className={name}>
                <span>{zoneName(silo, n)}</span>
              </div>
              <div className={recipe}>tbd</div>
            </div>
          )
      )
    }
  })
  return (
    <div
      className={`sheet ${sheet}`}
      style={{
        gridTemplateColumns: columns(silos.length),
        gridTemplateRows: `${HEAD_H}in repeat(${maxZones}, ${ZONE_H}in)`,
        gridTemplateAreas: areas(silos, maxZones)
      }}
    >
      {cells}
    </div>
  )
}

const coverGrid = css({
  width: `${SHEET_W_IN}in`,
  height: `${SHEET_H_IN}in`,
  padding: `${PAD_IN}in`,
  boxSizing: "border-box",
  background: "#fff",
  color: "#000",
  display: "grid",
  gridTemplateColumns: `repeat(2, ${ZONE_W}in)`,
  gridAutoRows: `${ZONE_H}in`,
  gap: "0.2in",
  alignContent: "start",
  justifyContent: "center",
  fontFamily: "system-ui, sans-serif"
})
const coverTile = css({
  border: "0.4mm solid #000",
  borderRadius: "1.5mm",
  boxSizing: "border-box",
  padding: "2mm 2.2mm",
  display: "grid",
  gridTemplateRows: "auto auto 1fr auto",
  gridTemplateAreas: `"kind" "name" "recipe" "vp"`,
  rowGap: "1mm",
  background: "#f3f3f3"
})
const coverKind = css({
  gridArea: "kind",
  fontSize: "7.5pt",
  fontWeight: 600,
  color: "#555",
  letterSpacing: "0.1em",
  textTransform: "uppercase"
})
const coverName = css({
  gridArea: "name",
  fontSize: "13pt",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.04em"
})
const coverRecipe = css({
  gridArea: "recipe",
  display: "grid",
  gridTemplateRows: "auto auto auto",
  gridTemplateAreas: `"in" "arrow" "out"`,
  alignContent: "start",
  justifyItems: "start",
  rowGap: "0.6mm",
  fontSize: "11pt",
  fontWeight: 700,
  color: "#444"
})
const coverVp = css({
  gridArea: "vp",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "9pt",
  fontWeight: 700,
  borderTop: "0.2mm dashed #999",
  paddingTop: "0.8mm"
})
const vpBox = css({
  width: "8mm",
  height: "7mm",
  border: "0.3mm solid #000",
  borderRadius: "1mm",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
})

/** Cover tiles per sheet: two across, four down at zone-box size. */
export const COVERS_PER_SHEET = 8

/**
 * Cover tiles, printed at zone-box size so each lies over the zone it hides.
 * Two across, four down; the twelve take two portrait sheets.
 *
 * Playtest shape. The intended final form is inverted: the cover is the
 * greyed-out face showing what it costs to build, and the zone underneath is
 * printed on the board. For now the tile repeats the zone's recipe so the
 * builder can see what they are opening, plus a VP box to pencil in.
 * Shows the zone's recipe so a builder knows what the structure will do, and
 * a VP box to pencil in until the values are tuned.
 */
export function CoverSheet({ tiles }: { tiles: ReturnType<typeof covers> }) {
  return (
    <div className={`sheet ${coverGrid}`}>
      {tiles.map((c) => {
        const zone = c.silo.zones[c.zone - 1]!
        return (
          <div key={c.name} className={coverTile}>
            <span className={coverKind}>Structure · {c.silo.id}</span>
            <span className={coverName}>{c.name}</span>
            <RecipeView zone={zone} className={coverRecipe} size={4.6} />
            <div className={coverVp}>
              <span>VP</span>
              <span className={vpBox}>{c.cover.vp ?? ""}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

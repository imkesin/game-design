import type { CSSProperties, ReactNode } from "react"
import { markFor, markNamed } from "~/games/regolith/components/resourceMarks"
import { Badge, badgeSize, ResourceTile, TILE_MM } from "~/games/regolith/components/ResourceTile"
import { WorkerTile } from "~/games/regolith/components/WorkerTile"
import { BAYS_PER_ZONE, RESET_BONUS, UPGRADE_SLOTS_PER_ZONE, zoneName } from "~/games/regolith/domain"
import type { Outcome, Silo, Terms, Upgrade, Zone } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * The silo board, print edition. One portrait letter sheet holds two of the
 * tall silos (A–C); `SiloSheet` draws whichever it is given. The single-zone
 * silos go two across on landscape sheets instead (`LandscapeSheet`): all of
 * D on one, E on another. Two per row is more paper than three, but
 * the wide zone boxes leave room for a meeple beside the recipe.
 *
 * Every silo is one column of zone boxes, sized so two silos fill the
 * printable page edge to edge. The whole sheet is a single CSS grid with
 * named areas. A sheet is as tall as its tallest silo; shorter silos leave
 * their upper rows empty.
 *
 * A zone box reads left to right: what the worker pays, a dividing line, what
 * it brings home, then the ownership strip. Goods are `ResourceTile`s. The tick
 * track is the dividing line itself — one 16mm circle per tick, stacked up
 * from the box's bottom edge and centred on the line, so the time marker sits
 * between cost and yield. The marker starts on zone I's bottom tick; there is
 * no separate start cell. Components are shape-coded: goods are cubes, so
 * their tiles are square; time is discs, so a tick is a circle at disc size.
 *
 * A zone that can be paid with time carries a quarter-disc in its bottom-left
 * corner: the time mark with a "−1" badge. The rule is one less of every
 * input and one more tick, so that is all the box needs to say.
 *
 * The bottom tick of a raw-goods track (Energy, Rock, Water) holds a small
 * "+1" energy tile: the marker covers it each time a reset brings it home,
 * and whoever ticked the reset takes that energy. Printed once per silo
 * because it happens once per cycle; the other silos pay nothing for a reset.
 *
 * A ruled strip down the box's right edge holds what players can own on the
 * zone, as cells. At the top is the bay, grey, one per zone at the printed
 * player count: empty until Construction puts an owner's marker in it, after
 * which it is a second worker slot. Rent is one rule for every cell and is
 * not printed. Below it, on the B and C silos only, two square slots take
 * machinery (B) or polymer (C) markers; the other silos take neither.
 */

export const SHEET_W_IN = 8.5
export const SHEET_H_IN = 11
/** Time marker and time token discs are 16mm; a tick is drawn at disc size. */
export const DISC_MM = 16
const PAD_IN = 0.25
const GAP_W = 0.25
const ROW_GAP = 0.04
/**
 * Every zone box is a tarot card on its side: 4.75 × 2.75, whatever its
 * width. Two silos span a portrait sheet's printable width and the tallest
 * silo's four rows fit its height with room to spare; two single-zone silos
 * span a landscape sheet, two rows deep. No sheet header: every zone already
 * names its silo, and the id lives in the aid.
 */
export const BOX_ASPECT = 4.75 / 2.75
const ZONE_W = (SHEET_W_IN - 2 * PAD_IN - GAP_W) / 2
export const ZONE_H = ZONE_W / BOX_ASPECT
const LAND_W = (SHEET_H_IN - 2 * PAD_IN - GAP_W) / 2
const LAND_H = LAND_W / BOX_ASPECT

// 1mm in CSS px, for the SVG marks, whose `size` is a pixel width.
const MM = 96 / 25.4

function areas(silos: readonly Silo[], maxZones: number): string {
  const rows: string[] = []
  const cols = (f: (j: number) => string[]) =>
    silos.flatMap((_, j) => [...f(j), j < silos.length - 1 ? "." : ""]).filter(Boolean).join(" ")
  for (let i = maxZones; i >= 1; i--) rows.push(cols((j) => [`z${j}-${i}`]))
  return rows.map((r) => `"${r}"`).join(" ")
}

function columns(n: number): string {
  return Array.from({ length: n }, (_, j) => `${ZONE_W}in${j < n - 1 ? ` ${GAP_W}in` : ""}`).join(" ")
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

const box = css({
  height: "100%",
  border: "0.4mm solid #000",
  borderRadius: "1.5mm",
  boxSizing: "border-box",
  // No right padding: the ownership strip is flush with the box's edge.
  padding: "0 0 0 3mm",
  display: "grid",
  // Five columns, with overlapping spans: cost sits in 1–2, the track in
  // 2–3, yield in 3–4, the ownership strip in 5. The two auto columns are the
  // track's width, so cost and yield each get a fr column plus half the
  // track to centre in, and can lean into the track's space when they wrap.
  // The fr columns may shrink below their content: a long zone name overflows
  // rather than widening its column and pushing the track off centre.
  gridTemplateColumns: "minmax(0, 1fr) auto auto minmax(0, 1fr) minmax(0, 1fr)",
  // Name row, body, and the name's invisible mirror, so the body stays
  // centred. The track and the strip span all three so they run border to
  // border.
  gridTemplateRows: "auto 1fr auto",
  rowGap: "1mm",
  background: "#fff",
  position: "relative",
  overflow: "hidden"
})
const boxEmpty = css({ borderStyle: "dashed", color: "#888" })
// Small and grey: the zone's name is a label, not something anyone reads
// mid-turn. `foot` is its invisible mirror below, so the body stays centred.
const NAME_PT = 6.5
const name = css({
  gridRow: "1",
  gridColumn: "1 / 3",
  display: "flex",
  justifyContent: "start",
  textAlign: "left",
  paddingTop: "2mm",
  fontSize: `${NAME_PT}pt`,
  lineHeight: 1,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  color: "#555"
})
const foot = css({ gridRow: "3", gridColumn: "1 / 3", paddingTop: "2mm", fontSize: `${NAME_PT}pt`, lineHeight: 1 })
// The dividing line, border to border, with the tick circles stacked up it
// from the bottom. As wide as a disc so the circles never crowd the tiles.
const track = css({
  gridRow: "1 / 4",
  gridColumn: "2 / 4",
  position: "relative",
  width: `${DISC_MM}mm`,
  display: "flex",
  flexDirection: "column",
  justifyContent: "end",
  alignItems: "center",
  rowGap: "1.5mm",
  margin: "0 2mm"
})
const line = css({
  position: "absolute",
  top: 0,
  bottom: 0,
  left: "50%",
  borderLeft: "0.25mm solid #888",
  transform: "translateX(-50%)"
})
const tick = css({
  width: `${DISC_MM}mm`,
  height: `${DISC_MM}mm`,
  flex: "none",
  border: "0.3mm solid #000",
  borderRadius: "50%",
  boxSizing: "border-box",
  background: "#fff",
  position: "relative",
  display: "grid",
  placeItems: "center"
})
// The reset bonus: a small energy tile inside the very first tick of the
// track. The marker covers it whenever it comes home, which is the rule.
const RESET_TILE_MM = 8
// Cost and yield: tiles wrap and centre in whatever width the side has. The
// top padding keeps a badge clear of the name row.
const side = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignContent: "center",
  alignItems: "center",
  gap: "2.5mm 2mm",
  padding: "2mm 0 3mm",
  fontSize: "12pt",
  fontWeight: 700
})
const nothing = css({ fontSize: "16pt", fontWeight: 400, color: "#000" })
// Three tiles make a triangle: two stacked on the left, the third on the
// right at half height. The gaps match the wrapping layout's.
const triangle = css({
  display: "grid",
  gridTemplateColumns: "auto auto",
  gridTemplateRows: "auto auto",
  gridTemplateAreas: `"a c" "b c"`,
  gap: "2.5mm 2mm",
  alignItems: "center"
})
const effectLabel = css({
  fontSize: "11pt",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  textAlign: "center"
})
// What a player can own on the zone: a strip down the box's right edge, ruled
// off from the recipe, with the bay on top and the upgrade slots inscribed
// beneath it as cells. Nothing here is padded; the cells run to the edge.
const own = css({
  gridRow: "1 / 4",
  gridColumn: "5",
  display: "grid",
  borderLeft: "0.35mm solid #000",
  // A rule between cells, never under the last one: the box border is there.
  "& > * + *": { borderTop: "0.35mm solid #000" }
})
// The bay alone fills the strip; with upgrade slots it takes the top half
// and the two slots split the rest.
const OWN_ROWS_BAY_ONLY = "1fr"
const OWN_ROWS_WITH_SLOTS = "2fr 1fr 1fr"
const cell = css({
  boxSizing: "border-box",
  padding: "1.2mm 1.5mm",
  fontSize: "5pt",
  lineHeight: 1,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#777"
})
const bay = css({ background: "#ececec" })
const slot = css({ background: "#fff" })
// Paying with time: a quarter of a time disc tucked into the box's
// bottom-left corner, mark inside, badge riding the arc.
const TIME_CORNER_MM = 13
const timeCorner = css({
  position: "absolute",
  left: 0,
  bottom: 0,
  width: `${TIME_CORNER_MM}mm`,
  height: `${TIME_CORNER_MM}mm`,
  boxSizing: "border-box",
  borderTop: "1.1mm solid #000",
  borderRight: "1.1mm solid #000",
  borderTopRightRadius: "100%",
  background: "#fff"
})
const timeMark = css({ position: "absolute", display: "block" })
const term = css({ display: "inline-flex", alignItems: "center", gap: "0.5mm" })
const plus = css({ fontSize: "12pt", fontWeight: 400, padding: "0 0.5mm" })

/** A recipe side as tiles: one per good, its count in the badge. */
function TileList({ terms: ts }: { terms: Terms }) {
  if (ts.length === 0) return <span className={nothing}>—</span>
  if (ts.length === 3) {
    return (
      <span className={triangle}>
        {ts.map((x, i) => <ResourceTile key={x.good} kind={x.good} qty={x.qty} style={{ gridArea: "abc"[i]! }} />)}
      </span>
    )
  }
  return (
    <>
      {ts.map((x) => <ResourceTile key={x.good} kind={x.good} qty={x.qty} />)}
    </>
  )
}

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

const EFFECT_LABEL: Record<Exclude<Outcome["kind"], "goods" | "worker" | "specialist">, string> = {
  bay: "+1 Bay",
  machinery: "1 Machine",
  polymers: "1 Polymer"
}

function TimeCorner({ ticks }: { ticks: number }) {
  const Mark = markNamed("time")
  const badgeMm = badgeSize(TILE_MM)
  // The mark is most of the quadrant, hugging the corner; the badge rests on
  // the box's bottom edge, centred where the arc meets it.
  const markMm = 8
  const markLeft = 0.9
  const markBottom = 1
  const badgeLeft = TIME_CORNER_MM - badgeMm / 2 - 1.5
  // Flush with the box's bottom border.
  const badgeBottom = 0
  return (
    <div className={timeCorner}>
      <span className={timeMark} style={{ left: `${markLeft}mm`, bottom: `${markBottom}mm` }}>
        <Mark size={markMm * MM} color="black" />
      </span>
      <Badge
        label={ticks === 1 ? "−1" : `−${ticks}`}
        size={badgeMm}
        style={{ left: `${badgeLeft}mm`, bottom: `${badgeBottom}mm` }}
      />
    </div>
  )
}

function ResetTile() {
  return (
    <>
      {RESET_BONUS.map((x) => <ResourceTile key={x.good} kind={x.good} qty={x.qty} size={RESET_TILE_MM} signed />)}
    </>
  )
}

// Yields that are not goods. Workers have a tile; the rest are still words
// until they have a mark (see `../marks/README.md`).
function OutcomeTiles({ outcome }: { outcome: Outcome }) {
  switch (outcome.kind) {
    case "goods":
      return <TileList terms={outcome.goods} />
    case "worker":
      return <WorkerTile variant="recruit" />
    case "specialist":
      return <WorkerTile variant="specialist" />
    default:
      return <span className={effectLabel}>{EFFECT_LABEL[outcome.kind]}</span>
  }
}

const SLOT_LABEL: Record<Upgrade, string> = { machinery: "Machine", polymers: "Polymer" }

function Owned({ upgrade }: { upgrade?: Upgrade }) {
  return (
    <div className={own} style={{ gridTemplateRows: upgrade ? OWN_ROWS_WITH_SLOTS : OWN_ROWS_BAY_ONLY }}>
      {Array.from({ length: BAYS_PER_ZONE }, (_, k) => <div key={k} className={`${cell} ${bay}`}>Bay</div>)}
      {upgrade
        && Array.from(
          { length: UPGRADE_SLOTS_PER_ZONE },
          (_, k) => <div key={k} className={`${cell} ${slot}`}>{SLOT_LABEL[upgrade]}</div>
        )}
    </div>
  )
}

interface BoxProps {
  silo: Silo
  n: number
  style?: CSSProperties
  className?: string
}

export function ZoneBox({ silo, n, zone, style, className }: BoxProps & { zone: Zone }) {
  return (
    <div className={`${box} ${className ?? ""}`} style={style}>
      <div className={name}>
        <span>{zoneName(silo, n)}</span>
      </div>
      <div className={side} style={{ gridRow: 2, gridColumn: "1 / 3" }}>
        <TileList terms={zone.cost} />
      </div>
      <div className={track}>
        <div className={line} />
        {Array.from({ length: zone.ticks }, (_, k) => (
          <div key={k} className={tick}>
            {silo.resetBonus && n === 1 && k === zone.ticks - 1 && <ResetTile />}
          </div>
        ))}
      </div>
      <div className={side} style={{ gridRow: 2, gridColumn: "3 / 5" }}>
        <OutcomeTiles outcome={zone.outcome} />
      </div>
      <div className={foot} aria-hidden>
        &nbsp;
      </div>
      <Owned {...(silo.upgrade ? { upgrade: silo.upgrade } : {})} />
      {zone.timeTicks !== undefined && <TimeCorner ticks={zone.timeTicks} />}
    </div>
  )
}

/** A zone still to be designed: the same box, dashed, with "tbd" where the cost goes. */
function EmptyZoneBox({ silo, n, style, className }: BoxProps) {
  return (
    <div className={`${box} ${boxEmpty} ${className ?? ""}`} style={style}>
      <div className={name}>
        <span>{zoneName(silo, n)}</span>
      </div>
      <div className={side} style={{ gridRow: 2, gridColumn: "1 / 3" }}>tbd</div>
      <div className={track}>
        <div className={line} />
        <div className={tick}>{silo.resetBonus && n === 1 && <ResetTile />}</div>
      </div>
      <div className={side} style={{ gridRow: 2, gridColumn: "3 / 5" }} />
      <div className={foot} aria-hidden>
        &nbsp;
      </div>
      <Owned {...(silo.upgrade ? { upgrade: silo.upgrade } : {})} />
    </div>
  )
}

export function SiloSheet({ silos }: { silos: readonly Silo[] }) {
  const maxZones = Math.max(...silos.map((s) => s.maxZones))
  const cells: ReactNode[] = []
  silos.forEach((silo, j) => {
    for (let n = 1; n <= silo.maxZones; n++) {
      const zone = silo.zones[n - 1]
      const style = { gridArea: `z${j}-${n}` }
      cells.push(
        zone
          ? <ZoneBox key={`z${j}-${n}`} silo={silo} n={n} zone={zone} style={style} />
          : <EmptyZoneBox key={`z${j}-${n}`} silo={silo} n={n} style={style} />
      )
    }
  })
  return (
    <div
      className={`sheet ${sheet}`}
      style={{
        gridTemplateColumns: columns(silos.length),
        gridTemplateRows: `repeat(${maxZones}, ${ZONE_H}in)`,
        gridTemplateAreas: areas(silos, maxZones)
      }}
    >
      {cells}
    </div>
  )
}

const landscape = css({
  width: `${SHEET_H_IN}in`,
  height: `${SHEET_W_IN}in`,
  padding: `${PAD_IN}in`,
  boxSizing: "border-box",
  background: "#fff",
  color: "#000",
  display: "grid",
  // Columns and rows are inline: panda cannot extract computed sizes.
  // The tight portrait row gap is for stacking a silo's zones; these boxes are
  // separate silos, so they get the same gap as the columns.
  columnGap: `${GAP_W}in`,
  rowGap: `${GAP_W}in`,
  alignContent: "start",
  justifyContent: "center",
  fontFamily: "system-ui, sans-serif"
})
// A lone box on the last row spans both columns and centres itself; its
// width is inline for the same reason.
const lone = css({ gridColumn: "1 / -1", justifySelf: "center" })

/**
 * A landscape sheet of single-zone silos, two across and as many rows as it
 * takes. The D silos share one, the E silos another; a sheet with an odd
 * number of boxes leaves its last one centred on the bottom row.
 */
export function LandscapeSheet({ silos }: { silos: readonly Silo[] }) {
  return (
    <div
      className={`sheet sheet-landscape ${landscape}`}
      style={{ gridTemplateColumns: `repeat(2, ${LAND_W}in)`, gridAutoRows: `${LAND_H}in` }}
    >
      {silos.map((silo, j) => {
        const zone = silo.zones[0]
        const last = silos.length % 2 === 1 && j === silos.length - 1
        const place = last ? { className: lone, style: { width: `${LAND_W}in` } } : {}
        return zone
          ? <ZoneBox key={silo.id} silo={silo} n={1} zone={zone} {...place} />
          : <EmptyZoneBox key={silo.id} silo={silo} n={1} {...place} />
      })}
    </div>
  )
}

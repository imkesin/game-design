import type { CSSProperties, ReactNode } from "react"
import { markFor } from "~/games/regolith/components/resourceMarks"
import { ResourceTile, TILE_MM } from "~/games/regolith/components/ResourceTile"
import { WorkerTile } from "~/games/regolith/components/WorkerTile"
import {
  BOOSTER_BONUS,
  boosterFor,
  CYCLES,
  LIFE_SUPPORT_SURCHARGE,
  LIFE_SUPPORT_TIERS,
  spaceName,
  TIERS
} from "~/games/regolith/domain"
import type { Booster, Outcome, Space, Terms, Track } from "~/games/regolith/domain"
import { BUILDINGS, buildingSpace } from "~/games/regolith/domain"
import type { Building } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * The track board, print edition. One portrait letter sheet holds two
 * columns; a column is a track of five space boxes, the Buildings column of
 * five empty slots, the five building tiles to cut out, or the level track. The
 * whole sheet is a single CSS grid with named areas, five rows tall, and the
 * boxes are sized so five rows fill the printable height edge to edge. The
 * contribution board is a different kind of thing and has its own sheet: see
 * `ContributionBoard.tsx`.
 *
 * A space box reads left to right: what the worker pays, a dividing line,
 * what it brings home, then the ownership strip. Goods are `ResourceTile`s.
 * The strip holds a cell per thing that can be built on the space — a
 * booster (machine on tiers I–II, battery on III–IV), showing the +1 it
 * grants, and a life support on tiers I–IV, with the second worker's energy
 * surcharge printed faint inside it as a reminder. Tier V prints no strip. Nothing about the kicker is printed: it
 * is one rule for every slot.
 *
 * A building slot is a dashed box the size of a space, one per tier: a built
 * building tile lands in whichever empty one its owner chooses, and the row
 * then sets its timing. A building tile is a space box with no strip — cost,
 * line, "1 VP" — and nothing to own: buildings have no owner.
 *
 * The level track is the board's only clock: one 16mm circle per tier,
 * aligned row for row with the spaces, so the marker's row reads straight
 * across. The top row also carries the cycle counter.
 */

export const SHEET_W_IN = 8.5
export const SHEET_H_IN = 11
/** The level marker is a 16mm disc; its tier circles are drawn at disc size. */
export const DISC_MM = 16
const PAD_IN = 0.25
const GAP_W = 0.25
const ROW_GAP = 0.04
/** Five rows fill the printable height; two columns fill the width. */
export const BOX_H = (SHEET_H_IN - 2 * PAD_IN - (TIERS - 1) * ROW_GAP) / TIERS
export const BOX_W = (SHEET_W_IN - 2 * PAD_IN - GAP_W) / 2

// 1mm in CSS px, for the SVG marks, whose `size` is a pixel width.
const MM = 96 / 25.4

export type Column =
  | { kind: "track"; track: Track }
  | { kind: "buildings" }
  | { kind: "tiles" }
  | { kind: "level" }

function areas(n: number): string {
  const rows: string[] = []
  for (let i = TIERS; i >= 1; i--) {
    const cells = Array.from({ length: n }, (_, j) => `c${j}-${i}`)
    rows.push(`"${cells.join(" . ")}"`)
  }
  return rows.join(" ")
}

function columns(n: number): string {
  return Array.from({ length: n }, (_, j) => `${BOX_W}in${j < n - 1 ? ` ${GAP_W}in` : ""}`).join(" ")
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

const STRIP_MM = 24

const box = css({
  height: "100%",
  border: "0.4mm solid #000",
  borderRadius: "1.5mm",
  boxSizing: "border-box",
  // No right padding: the ownership strip is flush with the box's edge.
  padding: "0 0 0 3mm",
  display: "grid",
  // Cost, the dividing line, yield, the ownership strip. The strip column is
  // fixed so a marker fits; without a strip it collapses to nothing.
  gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr) auto",
  // Name row, body, and the name's invisible mirror, so the body stays
  // centred. The line and the strip span all three so they run border to
  // border.
  gridTemplateRows: "auto 1fr auto",
  rowGap: "1mm",
  background: "#fff",
  position: "relative",
  overflow: "hidden"
})
// Small and grey: the space's name is a label, not something anyone reads
// mid-turn. `foot` is its invisible mirror below, so the body stays centred.
const ROMAN = ["I", "II", "III", "IV", "V"]
const NAME_PT = 6.5
const name = css({
  gridRow: "1",
  gridColumn: "1",
  display: "flex",
  justifyContent: "start",
  paddingTop: "2mm",
  fontSize: `${NAME_PT}pt`,
  lineHeight: 1,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  color: "#555"
})
const foot = css({ gridRow: "3", gridColumn: "1", paddingTop: "2mm", fontSize: `${NAME_PT}pt`, lineHeight: 1 })
const line = css({
  gridRow: "1 / 4",
  gridColumn: "2",
  width: "0.25mm",
  background: "#888",
  margin: "0 3mm"
})
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
// What a player can own on the space: a strip down the box's right edge,
// ruled off from the recipe, one cell per slot. A cell is big enough for an
// owner's marker; its label sits at the top and its detail at the bottom.
const own = css({
  gridRow: "1 / 4",
  gridColumn: "4",
  width: `${STRIP_MM}mm`,
  display: "grid",
  gridAutoRows: "1fr",
  borderLeft: "0.35mm solid #000",
  // A rule between cells, never under the last one: the box border is there.
  "& > * + *": { borderTop: "0.35mm solid #000" }
})
const cell = css({
  boxSizing: "border-box",
  padding: "1.2mm 1.5mm",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "start",
  fontSize: "5pt",
  lineHeight: 1.2,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#777"
})
const boosterCell = css({ background: "#fff" })
const bonusText = css({ fontSize: "7pt", color: "#000", letterSpacing: "0.05em" })
const lifeCell = css({ background: "#ececec" })
// The surcharge is a reminder, not a recipe: a full-size tile so it is read,
// printed faint so it reads as structure, a note in the slot,
// rather than a second cost on the space.
const faint = css({ opacity: 0.3, display: "inline-flex", gap: "1.5mm", alignSelf: "center" })
const BONUS_TILE_MM = 8
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

const EFFECT_LABEL: Record<Exclude<Outcome["kind"], "goods" | "worker" | "vp">, string> = {
  machine: "1 Machine",
  building: "1 Building",
  battery: "1 Battery",
  lifeSupport: "Life Support"
}

// Yields that are not goods. Workers have a tile; the rest are still words
// until they have a mark (see `../marks/README.md`).
function OutcomeTiles({ outcome }: { outcome: Outcome }) {
  switch (outcome.kind) {
    case "goods":
      return <TileList terms={outcome.goods} />
    case "worker":
      return <WorkerTile />
    case "vp":
      return <VpLabel vp={outcome.vp} />
    default:
      return <span className={effectLabel}>{EFFECT_LABEL[outcome.kind]}</span>
  }
}

const vpLabel = css({ fontSize: "16pt", fontWeight: 900, letterSpacing: "0.02em", whiteSpace: "nowrap" })

/** Victory points as a yield. Words until VP have a mark. */
export function VpLabel({ vp }: { vp: number }) {
  return <span className={vpLabel}>{vp} VP</span>
}

const BOOSTER_LABEL: Record<Booster, string> = { machine: "Machine", battery: "Battery" }
/** What a boosted thing-space pays extra: a second copy of the thing. */
const THING_LABEL: Record<Exclude<Outcome["kind"], "goods">, string> = {
  machine: "machine",
  building: "building",
  battery: "battery",
  worker: "worker",
  lifeSupport: "life support",
  vp: "VP"
}

// The +1 a booster grants: the yield good as a signed tile, or "+1 <thing>"
// where the space yields a thing rather than goods.
function Bonus({ outcome }: { outcome: Outcome }) {
  if (outcome.kind === "goods") {
    return (
      <span style={{ display: "inline-flex", gap: "1.5mm" }}>
        {outcome.goods.map((x) => (
          <ResourceTile key={x.good} kind={x.good} qty={BOOSTER_BONUS} size={BONUS_TILE_MM} signed />
        ))}
      </span>
    )
  }
  return <span className={bonusText}>+{BOOSTER_BONUS} {THING_LABEL[outcome.kind]}</span>
}

function Owned({ tier, space }: { tier: number; space: Space }) {
  const booster = boosterFor(tier)
  const life = LIFE_SUPPORT_TIERS.includes(tier)
  if (booster === undefined && !life) return null
  return (
    <div className={own}>
      {booster !== undefined && (
        <div className={`${cell} ${boosterCell}`}>
          <span>{BOOSTER_LABEL[booster]}</span>
          <Bonus outcome={space.outcome} />
        </div>
      )}
      {life && (
        <div className={`${cell} ${lifeCell}`}>
          <span>Life support</span>
          <span className={faint}>
            {LIFE_SUPPORT_SURCHARGE.map((x) => (
              <ResourceTile key={x.good} kind={x.good} qty={x.qty} size={TILE_MM} signed />
            ))}
          </span>
          <span>2nd slot</span>
        </div>
      )}
    </div>
  )
}

interface BoxProps {
  track: Track
  tier: number
  space: Space
  style?: CSSProperties
}

export function SpaceBox({ track, tier, space, style }: BoxProps) {
  const hasStrip = boosterFor(tier) !== undefined || LIFE_SUPPORT_TIERS.includes(tier)
  return (
    <div className={`${box} ${hasStrip ? "" : noStrip}`} style={style}>
      <div className={name}>
        <span>{spaceName(track, tier)}</span>
      </div>
      <div className={side} style={{ gridRow: 2, gridColumn: "1" }}>
        <TileList terms={space.cost} />
      </div>
      <div className={line} />
      <div className={side} style={{ gridRow: 2, gridColumn: "3" }}>
        <OutcomeTiles outcome={space.outcome} />
      </div>
      <div className={foot} aria-hidden>
        &nbsp;
      </div>
      <Owned tier={tier} space={space} />
    </div>
  )
}

// The Buildings column: one empty slot per tier, dashed, waiting for a tile.
const slotBox = css({
  height: "100%",
  border: "0.4mm dashed #888",
  borderRadius: "1.5mm",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  padding: "2mm 3mm",
  color: "#888"
})
const slotHint = css({
  placeSelf: "center",
  fontSize: "7pt",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#aaa",
  textAlign: "center"
})

function BuildingSlotBox({ tier, style }: { tier: number; style: CSSProperties }) {
  return (
    <div className={slotBox} style={style}>
      <div className={name} style={{ paddingTop: 0 }}>
        <span>Building {ROMAN[tier - 1]}</span>
      </div>
      <span className={slotHint}>building slot</span>
    </div>
  )
}

// A building tile: a space box with no ownership strip, cut along a dashed border.
const cutLine = css({ borderStyle: "dashed", borderColor: "#666" })
// A box with no ownership strip pads its right edge to match the left, so
// the divider sits at the box's centre and each side is centred in its half.
const noStrip = css({ paddingRight: "3mm" })

export function BuildingTileBox({ building, style }: { building: Building; style?: CSSProperties }) {
  const space = buildingSpace(building)
  return (
    <div className={`${box} ${cutLine} ${noStrip}`} style={style}>
      <div className={name}>
        <span>{building.name}</span>
      </div>
      <div className={side} style={{ gridRow: 2, gridColumn: "1" }}>
        <TileList terms={space.cost} />
      </div>
      <div className={line} />
      <div className={side} style={{ gridRow: 2, gridColumn: "3" }}>
        <OutcomeTiles outcome={space.outcome} />
      </div>
      <div className={foot} aria-hidden>
        &nbsp;
      </div>
    </div>
  )
}

// The level track: a row per tier, the numeral on the left and the marker's
// circle beside it. No box; the circles are the thing, and the rows line up
// with the spaces beside them.
const levelRow = css({
  height: "100%",
  display: "grid",
  gridTemplateColumns: "auto auto 1fr",
  gridTemplateAreas: `"num disc counter"`,
  alignItems: "center",
  columnGap: "5mm",
  paddingLeft: "6mm"
})
const numeral = css({
  gridArea: "num",
  fontSize: "22pt",
  fontWeight: 900,
  width: "12mm",
  textAlign: "right",
  fontVariantNumeric: "tabular-nums"
})
const disc = css({
  gridArea: "disc",
  width: `${DISC_MM}mm`,
  height: `${DISC_MM}mm`,
  border: "0.4mm solid #000",
  borderRadius: "50%",
  boxSizing: "border-box",
  background: "#fff"
})
const levelLabel = css({
  gridColumn: "1 / -1",
  alignSelf: "start",
  paddingTop: "2mm",
  fontSize: `${NAME_PT}pt`,
  lineHeight: 1,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#555"
})
const counter = css({
  gridArea: "counter",
  justifySelf: "end",
  display: "grid",
  gridTemplateColumns: "repeat(2, auto)",
  gap: "1.5mm",
  paddingRight: "2mm"
})
const counterBox = css({
  width: "11mm",
  height: "11mm",
  border: "0.35mm solid #000",
  borderRadius: "1mm",
  boxSizing: "border-box",
  display: "grid",
  placeItems: "center",
  fontSize: "7pt",
  fontWeight: 700,
  color: "#777"
})

function LevelRow({ tier, style }: { tier: number; style: CSSProperties }) {
  const top = tier === TIERS
  return (
    <div className={levelRow} style={{ ...style, gridTemplateRows: top ? "auto 1fr" : "1fr" }}>
      {top && <span className={levelLabel}>Level · cycle</span>}
      <span className={numeral} style={top ? { gridRow: 2 } : {}}>{ROMAN[tier - 1]}</span>
      <span className={disc} style={top ? { gridRow: 2 } : {}} />
      {top && (
        <span className={counter} style={{ gridRow: 2 }}>
          {Array.from({ length: CYCLES }, (_, k) => <span key={k} className={counterBox}>{k + 1}</span>)}
        </span>
      )}
    </div>
  )
}

/** One portrait sheet: two columns, each a track, the building slots, the building tiles, or the level track. */
export function TrackSheet({ columns: cols }: { columns: readonly Column[] }) {
  const cells: ReactNode[] = []
  cols.forEach((col, j) => {
    for (let tier = 1; tier <= TIERS; tier++) {
      const style = { gridArea: `c${j}-${tier}` }
      const key = `c${j}-${tier}`
      if (col.kind === "level") {
        cells.push(<LevelRow key={key} tier={tier} style={style} />)
      } else if (col.kind === "buildings") {
        cells.push(<BuildingSlotBox key={key} tier={tier} style={style} />)
      } else if (col.kind === "tiles") {
        const building = BUILDINGS[tier - 1]
        if (building) cells.push(<BuildingTileBox key={key} building={building} style={style} />)
      } else {
        const space = col.track.spaces[tier - 1]!
        cells.push(<SpaceBox key={key} track={col.track} tier={tier} space={space} style={style} />)
      }
    }
  })
  return (
    <div
      className={`sheet ${sheet}`}
      style={{
        gridTemplateColumns: columns(cols.length),
        gridTemplateRows: `repeat(${TIERS}, ${BOX_H}in)`,
        gridTemplateAreas: areas(cols.length)
      }}
    >
      {cells}
    </div>
  )
}

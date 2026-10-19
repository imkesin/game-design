import type { ReactNode } from "react"
import { css } from "~/generated/styled-system/css"
import { AID_TRIM_H_MM, AID_TRIM_W_MM } from "~/shared/print/cardSize"
import { COLORS } from "../colors.ts"
import { Building, type BuildingKind, Coin, Hex, NoBlight } from "../pieces/Pieces.tsx"
import { Tile } from "../tiles/Tile.tsx"

/**
 * The sale reference card, 6×4in landscape: one row per type, its tile drawn
 * small, read across as what it sells for (base coins, plus coins per Park or
 * hex), where that counts and its limits, and the hex it puts out (DESIGN.md,
 * Payoff chart). Sale values live only here (COMPONENTS.md, Sale card); costs are
 * on the tiles, so these tiles leave them off.
 */

const TILE_SIZE = 15
const COIN = 7
const MAP = { cell: 3.6, gap: 0.6 }
const MAP_SIZE = 4 * MAP.cell + 3 * MAP.gap
/** Shared by every row, so the columns line up. */
const COLUMNS = "20mm 46mm 1fr 18mm"
const INK = "#1f1f1f"
const MUTED = "#6b6b6b"
const RULE = "#d4d4d4"

const card = css({
  display: "grid",
  gridTemplateAreas: `"title" "park" "house" "commercial" "industrial"`,
  gridTemplateRows: "5.5mm repeat(4, 1fr)",
  boxSizing: "border-box",
  overflow: "hidden",
  outline: "0.2mm solid #a3a3a3",
  outlineOffset: "-0.1mm",
  background: "white",
  fontFamily: "sans-serif",
  color: INK,
  printColorAdjust: "exact"
})

const title = css({
  gridArea: "title",
  display: "grid",
  alignItems: "center",
  paddingInline: "4mm",
  color: "white",
  fontSize: "2.5mm",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase"
})

/** Every column after the tile's is ruled off on its left, full height. */
const columns = css({
  display: "grid",
  "& > :not(:first-child)": { alignSelf: "stretch", paddingInline: "3mm", borderLeft: `0.3mm solid ${RULE}` }
})

const row = css({
  gridTemplateAreas: `"type sale effects output"`,
  alignItems: "center",
  borderBottom: "0.3mm solid #e5e5e5",
  "&:last-child": { borderBottom: "none" }
})

/** The tile's cut edge, so it reads as a square of cardboard. */
const tile = css({
  gridArea: "type",
  justifySelf: "center",
  display: "grid",
  outline: "0.3mm solid #c4c4c4",
  borderRadius: "0.6mm"
})

const cellText = css({ display: "grid", gap: "1.2mm", fontSize: "3mm", lineHeight: 1.2 })

const line = css({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1mm" })

/** Base coins, then the bonus in parentheses. */
/** A row of coins, counts, operators and icons, read left to right. */
const expr = css({ display: "flex", alignItems: "center", gap: "1.6mm" })

const group = css({ display: "flex", alignItems: "center", gap: "1.2mm" })

/** Pulled in against the coin and icon, since the glyphs carry their own side space. */
const paren = css({
  fontSize: "7mm",
  fontWeight: 300,
  lineHeight: 1,
  color: INK,
  marginTop: "-0.7mm",
  marginInline: "-0.4mm"
})

const operator = css({ fontSize: "4.6mm", fontWeight: 700, color: INK })

/** PER, MAX: small caps, so the words sit quietly between the symbols. */
const word = css({ fontSize: "3.8mm", fontVariantCaps: "all-small-caps", letterSpacing: "0.06em", color: MUTED })

/** A plain number (a count, not coins), as tall as a coin's figure. */
const count = css({ fontSize: "5mm", fontWeight: 700, lineHeight: 1, color: INK })

const output = css({ display: "grid", placeItems: "center" })

const effects = css({
  gridArea: "effects",
  display: "grid",
  gridTemplateAreas: `"map text"`,
  columnGap: "3mm",
  alignItems: "center",
  "& > :first-child": { justifySelf: "center" }
})

const map = css({
  gridArea: "map",
  display: "grid",
  gridTemplateColumns: `repeat(4, ${MAP.cell}mm)`,
  gridAutoRows: `${MAP.cell}mm`,
  gap: `${MAP.gap}mm`
})

const plaza = css({ display: "grid", placeItems: "center", borderRadius: "0.4mm" })

/** One neighborhood: a ring of 8 plots inside its edge, the plaza in the middle; as big as the 4 × 4 maps. */
const ring = css({
  gridArea: "map",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
  gap: "0.8mm",
  padding: "1mm",
  boxSizing: "border-box",
  border: `0.45mm solid ${INK}`,
  borderRadius: "0.8mm"
})

const plot = css({ display: "grid", placeItems: "center", boxSizing: "border-box", borderRadius: "0.4mm" })

const dot = css({ width: "1.3mm", height: "1.3mm", borderRadius: "50%", background: "white" })

/**
 * The 4 × 4 city: the building's neighborhood dotted, and the plazas it takes
 * hexes from tinted: the 4 adjacent ones, or its whole row and column.
 */
function Reach({ kind }: { kind: "commercial" | "industrial" }) {
  const at = { row: 1, col: 1 }
  const reaches = (row: number, col: number) =>
    kind === "commercial"
      ? Math.abs(row - at.row) + Math.abs(col - at.col) === 1
      : row === at.row || col === at.col
  return (
    <div className={map}>
      {Array.from({ length: 16 }, (_, i) => {
        const [row, col] = [Math.floor(i / 4), i % 4]
        const own = row === at.row && col === at.col
        const background = own ? COLORS[kind] : reaches(row, col) ? `${COLORS[kind]}70` : "#ececec"
        return <span key={i} className={plaza} style={{ background }}>{own && <span className={dot} />}</span>
      })}
    </div>
  )
}

/** A House's neighborhood: only the Parks in its own ring count. */
function Neighborhood() {
  const parks = [0, 5]
  const house = 7
  const plaza = 4
  return (
    <div className={ring} style={{ width: `${MAP_SIZE}mm`, height: `${MAP_SIZE}mm` }}>
      {Array.from({ length: 9 }, (_, i) => {
        const style = i === plaza
          ? { background: "#ececec" }
          : i === house
          ? { background: COLORS.house }
          : parks.includes(i)
          ? { background: COLORS.park }
          : { border: `0.25mm solid ${RULE}` }
        return <span key={i} className={plot} style={style}>{i === house && <span className={dot} />}</span>
      })}
    </div>
  )
}

type Row = {
  kind: BuildingKind
  base: number
  bonus?: { amount: number; per: ReactNode }
  /** Where the bonus counts: the neighborhood, or the plazas hexes come from. */
  map?: ReactNode
  /** Limits on the sale: how many hexes it may take, or when it can be finished. */
  effects: readonly ReactNode[]
  /** The hex finishing it puts out in its plaza. */
  puts?: "house" | "commercial"
}

const ROWS: readonly Row[] = [
  { kind: "park", base: 1, effects: [] },
  {
    kind: "house",
    base: 3,
    bonus: {
      amount: 1,
      per: <Building kind="park" size={COIN} />
    },
    map: <Neighborhood />,
    effects: [
      <NoBlight size={9} />
    ],
    puts: "house"
  },
  {
    kind: "commercial",
    base: 2,
    bonus: {
      amount: 1,
      per: <Hex from="house" size={COIN} />
    },
    map: <Reach kind="commercial" />,
    effects: [<Cap kind="commercial" />],
    puts: "commercial"
  },
  {
    kind: "industrial",
    base: 1,
    bonus: {
      amount: 3,
      per: <Hex from="commercial" size={COIN} />
    },
    map: <Reach kind="industrial" />,
    effects: [<Cap kind="industrial" />]
  }
]

/** `( amount PER unit )`: one amount for each unit counted. */
function Per({ amount, unit }: { amount: ReactNode; unit: ReactNode }) {
  return (
    <span className={group}>
      <span className={paren}>(</span>
      {amount}
      <span className={word}>per</span>
      {unit}
      <span className={paren}>)</span>
    </span>
  )
}

/** How many hexes a sale may take: 1, plus 1 per building of its type in its neighborhood (itself too). */
function Cap({ kind }: { kind: BuildingKind }) {
  return (
    <span className={expr}>
      <span className={word}>max</span>
      <span className={count}>1</span>
      <span className={operator}>+</span>
      <Per amount={<span className={count}>1</span>} unit={<Building kind={kind} size={COIN} />} />
    </span>
  )
}

function SaleRow({ kind, base, bonus, map: scope, effects: lines, puts }: Row) {
  return (
    <div className={`${columns} ${row}`} style={{ gridArea: kind, gridTemplateColumns: COLUMNS }}>
      <span className={tile}>
        <Tile face={{ kind, side: "finished" }} size={TILE_SIZE} />
      </span>
      <span className={expr} style={{ gridArea: "sale" }}>
        <Coin amount={base} size={COIN} />
        {bonus !== undefined && (
          <>
            <span className={operator}>+</span>
            <Per amount={<Coin amount={bonus.amount} size={COIN} />} unit={bonus.per} />
          </>
        )}
      </span>
      <span className={effects} style={{ gridTemplateColumns: `${MAP_SIZE}mm 1fr` }}>
        {scope ?? <span />}
        <span className={cellText} style={{ gridArea: "text" }}>
          {lines.map((text, i) => <span key={i} className={line}>{text}</span>)}
        </span>
      </span>
      <span className={output}>{puts !== undefined && <Hex from={puts} size={9} plus />}</span>
    </div>
  )
}

export function SaleCard() {
  return (
    <div className={card} style={{ width: `${AID_TRIM_W_MM}mm`, height: `${AID_TRIM_H_MM}mm` }}>
      <div className={title} style={{ background: INK }}>Sale Reference Card</div>
      {ROWS.map((r) => <SaleRow key={r.kind} {...r} />)}
    </div>
  )
}

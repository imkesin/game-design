import { css } from "~/generated/styled-system/css"
import { AID_TRIM_H_MM, AID_TRIM_W_MM } from "~/shared/print/cardSize"
import { ICON } from "../icons.ts"
import { Building, type BuildingKind, Coin } from "../pieces/Pieces.tsx"
import { LEVEL_SLOTS, levelGrid } from "../tiles/levels.ts"
import { Tile } from "../tiles/Tile.tsx"
import type { Level } from "../tiles/tiles.ts"

/**
 * The sale reference card, 6×4in landscape: only what a sale adds to the
 * tile's printed base (RULES.md, Selling). Left, each type's count: coins per
 * input. Right, how far a sale counts by level: its own block twice, plus 0 /
 * 1 / 2 neighboring blocks of the seller's pick once. Cost, base and workers
 * are on the tiles.
 */

const TILE_SIZE = 15
const COIN = 7
/** A level's mark: generic buildings, as many as its level, laid out like a tile's centre. */
const LEVEL_ICON = 6
const MAP = { cell: 8, gap: 1 }
const INK = "#1f1f1f"
const MUTED = "#6b6b6b"
const RULE = "#d4d4d4"
/** A chosen neighbor: counted once, quieter than the own block. */
const NEIGHBOR = "#8a8a8a"
/** A diagonal block: never counted. */
const DIAGONAL = "#f2f2f2"

const card = css({
  display: "grid",
  gridTemplateAreas: `"title title" "counts reach"`,
  gridTemplateColumns: "60mm 1fr",
  gridTemplateRows: "5.5mm 1fr",
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
  background: INK,
  fontSize: "2.5mm",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase"
})

const counts = css({
  gridArea: "counts",
  display: "grid",
  gridTemplateAreas: `"house" "commercial" "industrial"`,
  gridTemplateRows: "repeat(3, 1fr)"
})

const row = css({
  display: "grid",
  gridTemplateAreas: `"tile count"`,
  gridTemplateColumns: "22mm 1fr",
  alignItems: "center",
  borderBottom: "0.3mm solid #e5e5e5",
  "&:last-child": { borderBottom: "none" }
})

/** The tile's cut edge, so it reads as a square of cardboard. */
const tile = css({
  gridArea: "tile",
  justifySelf: "center",
  display: "grid",
  outline: "0.3mm solid #c4c4c4",
  borderRadius: "0.6mm"
})

const expr = css({ gridArea: "count", display: "flex", alignItems: "center", gap: "1.6mm" })

const operator = css({ fontSize: "4.6mm", fontWeight: 700, color: INK })

/** PER: small caps, so the word sits quietly between the symbols. */
const word = css({ fontSize: "3.8mm", fontVariantCaps: "all-small-caps", letterSpacing: "0.06em", color: MUTED })

const reach = css({
  gridArea: "reach",
  display: "grid",
  gridTemplateAreas: `"l1 l2 l3"`,
  gridTemplateColumns: "repeat(3, 1fr)",
  borderLeft: `0.3mm solid ${RULE}`
})

const level = css({
  display: "grid",
  gridTemplateAreas: `"mark" "map"`,
  gridTemplateRows: "14mm auto",
  alignContent: "center",
  justifyItems: "center",
  rowGap: "3mm",
  "&:not(:first-child)": { borderLeft: `0.3mm solid ${RULE}` }
})

const map = css({
  gridArea: "map",
  display: "grid",
  gridTemplateAreas: `"nw n ne" "w own e" "sw s se"`,
  gridTemplateColumns: `repeat(3, ${MAP.cell}mm)`,
  gridTemplateRows: `repeat(3, ${MAP.cell}mm)`,
  gap: `${MAP.gap}mm`
})

const block = css({
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
  borderRadius: "0.8mm",
  color: "white",
  fontSize: "3.2mm",
  fontWeight: 700,
  lineHeight: 1
})

/** What a sale counts: its input, and coins for each one. */
const COUNTS = [
  { kind: "house", per: 1, input: "park" },
  { kind: "commercial", per: 2, input: "house" },
  { kind: "industrial", per: 4, input: "commercial" }
] as const satisfies readonly { kind: BuildingKind; per: number; input: BuildingKind }[]

const NEIGHBORS = ["n", "w", "e", "s"] as const
const DIAGONALS = ["nw", "ne", "sw", "se"] as const

/** The neighbors a sale counts at each level, the seller's pick (shown east, then north). */
const CHOSEN = { 1: [], 2: ["e"], 3: ["e", "n"] } as const satisfies Record<
  Level,
  readonly (typeof NEIGHBORS)[number][]
>

const LEVELS = [1, 2, 3] as const

function Reach({ of }: { of: Level }) {
  const chosen: readonly string[] = CHOSEN[of]
  return (
    <div className={map}>
      {DIAGONALS.map((at) => <span key={at} className={block} style={{ gridArea: at, background: DIAGONAL }} />)}
      {NEIGHBORS.map((at) =>
        chosen.includes(at)
          ? <span key={at} className={block} style={{ gridArea: at, background: NEIGHBOR }}>×1</span>
          : <span key={at} className={block} style={{ gridArea: at, border: `0.3mm solid ${RULE}` }} />
      )}
      <span className={block} style={{ gridArea: "own", background: INK }}>×2</span>
    </div>
  )
}

function Mark({ of }: { of: Level }) {
  const Icon = ICON.blight
  return (
    <span style={{ gridArea: "mark", ...levelGrid(of, LEVEL_ICON, (n) => `${n}mm`) }}>
      {LEVEL_SLOTS.slice(0, of).map((slot) => (
        <Icon
          key={slot}
          style={{ gridArea: slot, width: `${LEVEL_ICON}mm`, height: `${LEVEL_ICON}mm` }}
          strokeWidth={1.75}
          color={INK}
        />
      ))}
    </span>
  )
}

export function SaleCard() {
  return (
    <div className={card} style={{ width: `${AID_TRIM_W_MM}mm`, height: `${AID_TRIM_H_MM}mm` }}>
      <div className={title}>Sale Reference Card</div>
      <div className={counts}>
        {COUNTS.map(({ kind, per, input }) => (
          <div key={kind} className={row} style={{ gridArea: kind }}>
            <span className={tile}>
              <Tile face={{ kind, side: "finished" }} size={TILE_SIZE} />
            </span>
            <span className={expr}>
              <span className={operator}>+</span>
              <Coin amount={per} size={COIN} tone="payoff" />
              <span className={word}>per</span>
              <Building kind={input} size={COIN} />
            </span>
          </div>
        ))}
      </div>
      <div className={reach}>
        {LEVELS.map((of) => (
          <div key={of} className={level} style={{ gridArea: `l${of}` }}>
            <Mark of={of} />
            <Reach of={of} />
          </div>
        ))}
      </div>
    </div>
  )
}

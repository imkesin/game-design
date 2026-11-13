import { COLOR } from "~/games/fiber/colors"
import { CORNER, IN, NO_TERMINALS, PIECE, SLOT } from "~/games/fiber/map/map"
import { HaloCircle, HaloRect } from "~/games/fiber/routes/MapPage"
import { css } from "~/generated/styled-system/css"

/**
 * A player's mat, 10 × 8in landscape. The supply is two columns: a white side (Hubs, Day) against
 * the left wall and a black side (cables, Night) against the right, 4 rows each. Rows are centred
 * vertically; each holds 2 Hub stacks of 2 side by side (16 Hubs) or a pair of upright sticks
 * (8 cables). Hubs get 10mm of padding on all four sides. The
 * middle of the mat is open.
 */

export const MAT = { width: 10 * IN, height: 8 * IN }
const MARGIN = 7
const GAP = 1

const ROWS = 4
/** Hubs per stack, and stacks per row. */
const STACK = 2
const HUB_STACKS = 2
const STICKS = 2

const HUBS_WIDTH = HUB_STACKS * SLOT.hub + (HUB_STACKS - 1) * SLOT.between
/** Padding around the Hub stacks, the same on all four sides. */
const PADDING = 10

export const CELL = { width: HUBS_WIDTH + 2 * PADDING, height: SLOT.hub + 2 * PADDING }

type Kind = "hub" | "cable"

const COLUMNS: { kind: Kind; fill: string }[] = [
  { kind: "hub", fill: COLOR.pad0 },
  { kind: "cable", fill: COLOR.matNight }
]

export const SUPPLY: Record<Kind, number> = { hub: ROWS * HUB_STACKS * STACK, cable: ROWS * STICKS }

const mat = css({
  display: "grid",
  gridTemplateAreas: `
    "supply"`,
  gridTemplateColumns: "1fr",
  gridTemplateRows: "1fr",
  boxSizing: "border-box",
  background: "white",
  printColorAdjust: "exact"
})

const supply = css({ gridArea: "supply", display: "grid" })

const cell = css({ display: "grid", placeItems: "center" })

/** "Stack of 2": a small count in the slot's well. */
function StackMark({ x, y }: { x: number; y: number }) {
  return (
    <text
      x={x}
      y={y}
      fill={COLOR.board}
      fontSize={5}
      fontWeight={700}
      fontFamily="system-ui, sans-serif"
      textAnchor="middle"
      dominantBaseline="central"
    >
      ×{STACK}
    </text>
  )
}

/** Hub stacks side by side, 1mm apart. Hubs are squares in the no-Terminals experiment. */
function Hubs() {
  const s = SLOT.hub
  return (
    <svg viewBox={`0 0 ${HUBS_WIDTH} ${s}`} style={{ width: `${HUBS_WIDTH}mm`, height: `${s}mm` }}>
      {Array.from({ length: HUB_STACKS }, (_, k) => {
        const x = k * (s + SLOT.between)
        return (
          <g key={k}>
            {NO_TERMINALS
              ? <HaloRect x={x} y={0} width={s} height={s} />
              : <HaloCircle cx={x + s / 2} cy={s / 2} r={s / 2} />}
            <StackMark x={x + s / 2} y={s / 2} />
          </g>
        )
      })}
    </svg>
  )
}

/** A pair of upright sticks, 1mm apart. */
function Sticks() {
  const { width: w, length: h } = PIECE.stick
  const width = STICKS * w + (STICKS - 1) * SLOT.between
  return (
    <svg viewBox={`0 0 ${width} ${h}`} style={{ width: `${width}mm`, height: `${h}mm` }}>
      {Array.from(
        { length: STICKS },
        (_, k) => <HaloRect key={k} x={k * (w + SLOT.between)} y={0} width={w} height={h} />
      )}
    </svg>
  )
}

/** Grid column per side: 1 = left wall, 3 = right wall. */
const SIDE = [1, 3]

export function PlayerMat() {
  return (
    <div className={mat} style={{ width: `${MAT.width}mm`, height: `${MAT.height}mm`, padding: `${MARGIN}mm` }}>
      <div
        className={supply}
        style={{
          // White side against the left wall, black side against the right, open middle between.
          gridTemplateColumns: `${CELL.width}mm 1fr ${CELL.width}mm`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL.height}mm)`,
          alignContent: "center",
          gap: `${GAP}mm`
        }}
      >
        {COLUMNS.flatMap((c, col) =>
          Array.from({ length: ROWS }, (_, row) => (
            <div
              key={`${c.kind}-${row}`}
              className={cell}
              style={{
                gridColumn: SIDE[col],
                gridRow: row + 1,
                background: c.fill,
                borderRadius: `${CORNER}mm`
              }}
            >
              {c.kind === "hub" ? <Hubs /> : <Sticks />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

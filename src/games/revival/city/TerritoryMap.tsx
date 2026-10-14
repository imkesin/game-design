import type { PointerEvent } from "react"
import { mm } from "~/games/revival/city/mm"
import { css, cx } from "~/generated/styled-system/css"
import { PrefabBox } from "./PrefabBox.tsx"
import type { Geometry } from "./prefabs.ts"
import { OUTSIDE, type Territories } from "./territories.ts"

/**
 * Placed prefab neighborhoods over the territories between them: every border
 * between neighbors drawn as a street (black | white | black), the city's edge
 * (if the territories have one) as a line or a street, and each neighborhood's
 * prefab at its box. All in mm, origin at the area's top-left.
 */

/** Street across a border: black edges, white middle, as on the city map. */
const STREET = { black: 1.5, white: 2 }

export type EdgeStyle = "line" | "street"

const area = css({ display: "grid", gridTemplateAreas: `"area"` })

const item = css({ gridArea: "area", justifySelf: "start", alignSelf: "start" })

const draggable = css({ cursor: "grab", touchAction: "none", _active: { cursor: "grabbing" } })

/** Screen-only warning: too close to a neighbor, or off the area. */
const conflict = css({ outline: "solid #dc2626", outlineWidth: "calc(1 * var(--u))" })

export type Placed = { geo: Geometry; x: number; y: number }

export function TerritoryMap(
  { width, height, placed, territories: { borders }, frame = true, edge = "line", conflicts, onGrab }: {
    width: number
    height: number
    placed: readonly Placed[]
    territories: Territories
    /** Outline the whole area; off when the city has its own edge. */
    frame?: boolean
    edge?: EdgeStyle
    /** Indices of neighborhoods to flag on screen. */
    conflicts?: ReadonlySet<number>
    /** Makes neighborhoods draggable: called on pointer-down with the neighborhood's index. */
    onGrab?: (index: number, event: PointerEvent<HTMLDivElement>) => void
  }
) {
  // An edge drawn as a street joins the street network; as a line it goes on top.
  const streets = edge === "street" ? borders : borders.filter((b) => b.b !== OUTSIDE)
  const lines = edge === "line" ? borders.filter((b) => b.b === OUTSIDE) : []
  return (
    <div className={area} style={{ width: mm(width), height: mm(height) }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ gridArea: "area", width: "100%", height: "100%" }}
        fill="none"
        strokeLinejoin="round"
      >
        {frame && <rect x={0} y={0} width={width} height={height} stroke="black" strokeWidth={0.6} />}
        {/* All black first, then all white, so junctions stay open. */}
        {streets.map((b) => (
          <path key={`k${b.a}-${b.b}`} d={b.d} stroke="black" strokeWidth={2 * STREET.black + STREET.white} />
        ))}
        {streets.map((b) => <path key={`w${b.a}-${b.b}`} d={b.d} stroke="white" strokeWidth={STREET.white} />)}
        {lines.map((b) => <path key={`e${b.a}`} d={b.d} stroke="black" strokeWidth={STREET.black} />)}
      </svg>
      {placed.map(({ geo, x, y }, i) => (
        <div
          key={i}
          className={cx(item, onGrab !== undefined && draggable, conflicts?.has(i) === true && conflict)}
          style={{ marginLeft: mm(x), marginTop: mm(y) }}
          onPointerDown={onGrab === undefined ? undefined : (event) => onGrab(i, event)}
        >
          <PrefabBox geo={geo} frame={false} />
        </div>
      ))}
    </div>
  )
}

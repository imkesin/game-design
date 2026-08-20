import { ClearingSlotIcon } from "~/games/tigers-path/components/ClearingSlotIcon"
import type { SlotShape } from "~/games/tigers-path/domain"
import type { GenClearing, GeneratedMap } from "~/games/tigers-path/map/layout"
import mapData from "~/games/tigers-path/map/map.json"
import { css } from "~/generated/styled-system/css"

/**
 * The organic board. Every coordinate — clearing centres, the curved path
 * outlines, and the exact position/rotation of each cube space — is solved at
 * build time by `map/layout.ts` and baked into `map.json`; this component only
 * paints it. Regenerate with `pnpm tp:map:build` after editing the graph or the
 * clearings' `target` hints in `domain.ts`.
 *
 * One SVG, sized in inches so it prints true. Layout units are 96 per inch, so
 * one user unit is one CSS pixel: the clearing labels ride in a `foreignObject`
 * that reuses the HTML `ClearingSlotIcon`, and its millimetre sizes come out at
 * true millimetres on paper.
 *
 * Paint order is the layering: trails first (a skinny road), then the opaque
 * cube spaces over them, then the clearing discs last so a disc always covers
 * the trail ends and any cube corner that reaches its rim.
 */

const map = mapData as GeneratedMap

/** Road width — skinny relative to the cube spaces, so it reads as ground peeking out. */
const TRAIL_W = 0.16 * map.unitsPerInch

const svg = css({
  display: "block",
  width: "100%",
  height: "100%"
})

const labelBody = css({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  rowGap: "0.02in",
  pointerEvents: "none"
})

const clearingName = css({
  fontSize: "nano",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  textAlign: "center",
  lineHeight: 1.05,
  color: "green.900"
})

const slotRow = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  columnGap: "0.03in",
  rowGap: "0.03in"
})

function ClearingLabel({ clearing }: { clearing: GenClearing }) {
  // Inset the label box inside the disc so nothing rides the rim.
  const box = (clearing.r - 6) * 2
  return (
    <foreignObject
      x={clearing.x - box / 2}
      y={clearing.y - box / 2}
      width={box}
      height={box}
    >
      <div className={labelBody}>
        <span className={clearingName}>{clearing.name}</span>
        <div className={slotRow}>
          {clearing.slots.map((slot, i) => (
            <ClearingSlotIcon key={i} shape={slot.shape as SlotShape} cost={slot.cost} size={15} color="green" />
          ))}
        </div>
      </div>
    </foreignObject>
  )
}

export function BoardMap() {
  const widthIn = map.width / map.unitsPerInch
  const heightIn = map.height / map.unitsPerInch

  return (
    <svg
      className={svg}
      viewBox={`0 0 ${map.width} ${map.height}`}
      width={`${widthIn}in`}
      height={`${heightIn}in`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Trails: the skinny road under everything. */}
      {map.paths.map((path) => (
        <path
          key={`trail-${path.id}`}
          d={path.d}
          fill="none"
          stroke="var(--colors-stone-400)"
          strokeWidth={TRAIL_W}
          strokeLinecap="round"
        />
      ))}

      {/* Cube spaces: opaque squares, rotated to the path's tangent. */}
      {map.paths.map((path) =>
        path.cubes.map((cube, i) => (
          <rect
            key={`cube-${path.id}-${i}`}
            x={cube.x - map.cubeSize / 2}
            y={cube.y - map.cubeSize / 2}
            width={map.cubeSize}
            height={map.cubeSize}
            rx={0.06 * map.unitsPerInch}
            transform={`rotate(${(cube.angle * 180) / Math.PI} ${cube.x} ${cube.y})`}
            fill="var(--colors-stone-50)"
            stroke="var(--colors-stone-600)"
            strokeWidth={0.4 * (map.unitsPerInch / 25.4)}
          />
        ))
      )}

      {/* Clearings: discs painted last, then their labels. */}
      {map.clearings.map((clearing) => (
        <circle
          key={`disc-${clearing.id}`}
          cx={clearing.x}
          cy={clearing.y}
          r={clearing.r}
          fill="var(--colors-green-50)"
          stroke="var(--colors-green-700)"
          strokeWidth={0.5 * (map.unitsPerInch / 25.4)}
        />
      ))}
      {map.clearings.map((clearing) => <ClearingLabel key={`label-${clearing.id}`} clearing={clearing} />)}
    </svg>
  )
}

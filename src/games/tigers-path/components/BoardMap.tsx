import { ClearingSlotIcon } from "~/games/tigers-path/components/ClearingSlotIcon"
import type { SlotShape } from "~/games/tigers-path/domain"
import type { GenClearing, GeneratedMap } from "~/games/tigers-path/map/layout"
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

// A grid, not a wrapping flex row, so each slot count gets a deliberate shape:
// 1 → single, 2 → a row, 3 → a triangle (two on top, one centred below), 4 → a
// 2×2 square. All but the single use two columns; for 3, the last icon spans
// both columns so it sits centred under the pair (a wrapping row packed 4 as
// 3-over-1 instead of a square).
const slotGrid = css({
  display: "grid",
  justifyContent: "center",
  justifyItems: "center",
  columnGap: "0.03in",
  rowGap: "0.03in"
})

function ClearingLabel({ clearing }: { clearing: GenClearing }) {
  // Inset the label box inside the disc so nothing rides the rim.
  const box = (clearing.r - 6) * 2
  const n = clearing.slots.length
  const cols = n === 1 ? 1 : 2
  return (
    <foreignObject
      x={clearing.x - box / 2}
      y={clearing.y - box / 2}
      width={box}
      height={box}
    >
      <div className={labelBody}>
        <span className={clearingName}>{clearing.name}</span>
        <div className={slotGrid} style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
          {clearing.slots.map((slot, i) => (
            <ClearingSlotIcon
              key={i}
              shape={slot.shape as SlotShape}
              cost={slot.cost}
              size={15}
              color="green"
              // Triangle base: the last of three slots spans both columns, centred below the pair.
              style={n === 3 && i === 2 ? { gridColumn: "1 / -1" } : undefined}
            />
          ))}
        </div>
      </div>
    </foreignObject>
  )
}

export function BoardMap({ map }: { map: GeneratedMap }) {
  const widthIn = map.width / map.unitsPerInch
  const heightIn = map.height / map.unitsPerInch
  // Road width — skinny relative to the cube spaces, so it reads as ground peeking out.
  const TRAIL_W = 0.16 * map.unitsPerInch

  return (
    <svg
      className={svg}
      viewBox={`0 0 ${map.width} ${map.height}`}
      width={`${widthIn}in`}
      height={`${heightIn}in`}
      preserveAspectRatio="xMidYMid meet"
    >
      {
        /* Grassland: an open field clipping the bottom edge. Drawn first, under
          everything; the layout keeps all paths and clearings out of its moat,
          and it carries no printed cube spaces or disc rings — the emptiness is
          what tells it apart from a path or a clearing. */
      }
      {map.grassland && (() => {
        const g = map.grassland
        const d = `M ${g.cx - g.radius} ${g.cy} A ${g.radius} ${g.radius} 0 0 1 ${g.cx + g.radius} ${g.cy} Z`
        return (
          <g>
            <defs>
              {/* Sparse dots — the zone reads as textured ground, not a filled shape. */}
              <pattern id="grassland-tufts" width={22} height={22} patternUnits="userSpaceOnUse">
                <circle cx={5} cy={6} r={1.2} fill="var(--colors-green-300)" />
                <circle cx={16} cy={15} r={1.2} fill="var(--colors-green-300)" />
              </pattern>
            </defs>
            {/* Faint base so the zone boundary still reads, then the tuft texture over it. */}
            <path
              d={d}
              fill="var(--colors-green-50)"
              fillOpacity={0.5}
              stroke="var(--colors-green-300)"
              strokeWidth={0.25 * (map.unitsPerInch / 25.4)}
            />
            <path d={d} fill="url(#grassland-tufts)" stroke="none" />
            <text
              x={g.cx}
              y={g.cy - g.radius * 0.42}
              textAnchor="middle"
              fontSize={0.13 * map.unitsPerInch}
              fontWeight={600}
              letterSpacing={0.04 * map.unitsPerInch}
              fill="var(--colors-green-500)"
            >
              GRASSLAND
            </text>
          </g>
        )
      })()}

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

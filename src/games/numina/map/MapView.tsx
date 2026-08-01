import type { CSSProperties } from "react"
import { css } from "~/generated/styled-system/css"
import type { GeneratedMap } from "./generate.ts"

/**
 * Renders a generated map. All geometry arrives precomputed in `map.json`; this
 * component only paints it and reports clicks.
 *
 * Ink-only: the board has to survive a black-and-white printer. Nothing is
 * filled — the two tiers are told apart by line weight alone, the way a road
 * atlas separates county lines from state lines. Only the sea is textured, and
 * only so the landmass reads as land.
 */

const INK = "#000"

/** Antique-map coastline shading: strokes fanning outward, hidden inside by the land fill. */
const HALO = [
  { width: 26, opacity: 0.07 },
  { width: 17, opacity: 0.1 },
  { width: 9, opacity: 0.16 }
]

// An unfilled path is only clickable on its stroke, which would make provinces
// near-impossible to hit. `pointerEvents: all` restores hit-testing over the
// whole interior without painting anything into it.
const province = css({
  cursor: "pointer",
  pointerEvents: "all",
  fill: "none",
  stroke: "transparent",
  strokeWidth: 0,
  _hover: { stroke: "#000", strokeWidth: 2, strokeOpacity: 0.3 }
})

/*
 * Type is sized in map units, which at the spec's 100-per-inch means a size of
 * 36 prints at 0.36in — roughly 26pt. Sizes are chosen for the printed sheet,
 * not the screen preview.
 */
const stateLabel = css({
  fill: INK,
  fontSize: "36px",
  fontWeight: 700,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  textAnchor: "middle",
  pointerEvents: "none",
  userSelect: "none"
})

const provinceLabel = css({
  fill: INK,
  fontSize: "21px",
  fontWeight: 400,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  textAnchor: "middle",
  pointerEvents: "none",
  userSelect: "none"
})

/** Water names are set in italic, the long-standing cartographic convention. */
const seaLabel = css({
  fill: INK,
  fillOpacity: 0.6,
  fontSize: "30px",
  fontStyle: "italic",
  letterSpacing: "0.26em",
  textAnchor: "middle",
  pointerEvents: "none",
  userSelect: "none"
})

/** White casing so a name stays legible where it crosses a border line. */
const halo = css({
  fill: "none",
  stroke: "#fff",
  strokeWidth: 8,
  strokeLinejoin: "round",
  pointerEvents: "none",
  userSelect: "none"
})

/**
 * A one-province sea would otherwise print its name twice, once as the state and
 * once as the province. The state name wins; province names appear only where
 * they say something the state name does not.
 */
function showProvinceLabel(map: GeneratedMap, province: GeneratedMap["provinces"][number]) {
  const state = map.states.find((s) => s.id === province.state)
  return state !== undefined && state.provinces.length > 1
}

type Props = {
  map: GeneratedMap
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** Warps every edge through a turbulence displacement — the cheapest hand-drawn effect. */
  rough: boolean
  className?: string
  /** Used by the print sheet to pin the SVG to an exact physical size. */
  style?: CSSProperties
}

export function MapView({ map, selectedId, onSelect, rough, className, style }: Props) {
  const selected = map.provinces.find((p) => p.id === selectedId)

  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      className={className}
      style={style}
      onClick={() => onSelect(null)}
    >
      <defs>
        <filter id="map-rough" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011"
            numOctaves={3}
            seed={9}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={9}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Tile is authored in map units so the rule pitch is independent of render size. */}
        <pattern id="tex-sea" width={12} height={12} patternUnits="userSpaceOnUse">
          <rect width={12} height={12} fill="#fff" />
          <line x1={0} y1={6} x2={12} y2={6} stroke={INK} strokeWidth={0.7} strokeOpacity={0.3} />
        </pattern>
      </defs>

      <rect width={map.width} height={map.height} fill="url(#tex-sea)" />

      {/* Labels sit outside this group so the displacement never smears the type. */}
      <g filter={rough ? "url(#map-rough)" : undefined}>
        {HALO.map((ring) => (
          <path
            key={ring.width}
            d={map.land}
            fill="none"
            stroke={INK}
            strokeWidth={ring.width}
            strokeOpacity={ring.opacity}
            strokeLinejoin="round"
          />
        ))}

        {
          /* The one opaque fill on the map: it masks the sea rules so the interior
            reads as land rather than as more water. */
        }
        <path d={map.land} fill="#fff" />

        {
          /* Shorelines are skipped: the landmass outline already draws them, once.
            Open water stays faint whether or not it divides states — a line at
            sea is a convention, not a feature you can stand on. Land goes
            light-then-heavy so state lines print over province lines. */
        }
        {map.borders.filter((b) => b.medium === "sea").map((border) => (
          <path
            key={`${border.a}|${border.b}`}
            d={border.d}
            fill="none"
            stroke={INK}
            strokeWidth={1}
            strokeOpacity={0.3}
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
        ))}

        {map.borders.filter((b) => b.medium === "land" && !b.interstate).map((border) => (
          <path
            key={`${border.a}|${border.b}`}
            d={border.d}
            fill="none"
            stroke={INK}
            strokeWidth={1}
            strokeOpacity={0.55}
            strokeDasharray="5 5"
            strokeLinecap="round"
          />
        ))}

        {map.borders.filter((b) => b.medium === "land" && b.interstate).map((border) => (
          <path
            key={`${border.a}|${border.b}`}
            d={border.d}
            fill="none"
            stroke={INK}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {selected !== undefined && (
          <path d={selected.d} fill="none" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        )}

        <path d={map.land} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>

      {/* Hit areas above the ink, so a click always lands on a province. */}
      <g>
        {map.provinces.map((p) => (
          <path
            key={p.id}
            d={p.d}
            className={province}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(p.id === selectedId ? null : p.id)
            }}
          >
            <title>
              {p.kind === "sea"
                ? p.name
                : `${p.name} — ${map.states.find((s) => s.id === p.state)?.name}`}
            </title>
          </path>
        ))}
      </g>

      <g>
        {
          /* Province names sit below their own centre; the state name takes the
            centre itself, so the two tiers do not fight for the same spot. */
        }
        {map.provinces.filter((p) => showProvinceLabel(map, p)).map((p) => (
          <g key={p.id}>
            <text x={p.label.x} y={p.label.y + 42} className={`${halo} ${provinceLabel}`}>
              {p.name}
            </text>
            <text x={p.label.x} y={p.label.y + 42} className={provinceLabel}>
              {p.name}
            </text>
          </g>
        ))}

        {map.states.map((state) => {
          const style = state.kind === "sea" ? seaLabel : stateLabel
          return (
            <g key={state.id}>
              <text x={state.label.x} y={state.label.y} className={`${halo} ${style}`}>
                {state.name}
              </text>
              <text x={state.label.x} y={state.label.y} className={style}>
                {state.name}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

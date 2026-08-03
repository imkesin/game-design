import type { CSSProperties } from "react"
import { css } from "~/generated/styled-system/css"
import type { GeneratedMap } from "./generate.ts"
import { MARKER_TYPE } from "./markers.ts"

/**
 * Renders a generated map. All geometry arrives precomputed in `map.json`; this
 * component only paints it and reports clicks.
 *
 * Ink-only: the board has to survive a black-and-white printer, so the tiers are
 * told apart by the *kind* of line as much as its weight, the way a road atlas
 * separates county lines from state lines. Sea and mountain are the only
 * textured terrain, each with its own rule pattern so the three `kind`s read
 * apart at a glance. Nothing is labelled: the board carries no type at all.
 *
 * One strict hierarchy governs every line, loudest first:
 *
 *   state     heavy unbroken ink — the only solid black line on the sheet
 *   province  a double hairline, distinct in kind rather than just in weight
 *   coast     the softest mark there is; the sea's own texture does the work
 *
 * The coast used to be the heaviest line here, which inverted the whole order
 * and made every province look subordinate to the shoreline.
 *
 * Markers — goods and capitals — are the one exception to the no-type rule, and
 * are outside that hierarchy entirely: they mark where a component goes rather
 * than what the ground is, so they sit above every line without competing with
 * any.
 */

const INK = "#000"

/**
 * Antique-map coastline shading: strokes fanning outward, hidden inside by the
 * land fill. Kept faint — enough to feel the shore without the coast shouting
 * over the borders that actually matter to play.
 */
const HALO = [
  { width: 18, opacity: 0.04 },
  { width: 11, opacity: 0.06 },
  { width: 5, opacity: 0.09 }
]

/** Coast: the softest line on the board. */
const COAST = { width: 1.4, opacity: 0.38 }

const PAPER = "#fff"
/** Every rail is the same weight, so the tiers differ only in how many there are. */
const RAIL_OPACITY = 0.8

/**
 * A border tier is a stack of strokes of decreasing width, alternating ink and
 * paper down the same centreline. Each paper stroke cuts a gap out of the ink
 * beneath it, so `n` alternations leave `n` parallel rails: two strokes give a
 * double line, four give a quad.
 *
 * The tiers are told apart by rail *count*, not by blackness — a state drawn as
 * a solid slab against province hairlines opened a gap far wider than the
 * difference in what the two actually mean.
 *
 * Widths are chosen so rails and gaps come out even. Reading from the centre of
 * a state line: a 2.0 gap, a 1.2 rail, a 2.0 gap, a 1.2 rail — 10.8 across.
 */
type Rail = { width: number; ink: boolean }

const PROVINCE_LINE: readonly Rail[] = [
  { width: 4.4, ink: true },
  { width: 2.2, ink: false }
]

const STATE_LINE: readonly Rail[] = [
  { width: 10.8, ink: true },
  { width: 8.4, ink: false },
  { width: 4.4, ink: true },
  { width: 2, ink: false }
]

/**
 * Markers: the chip's footprint, and what goes in it. Set in map units like
 * every other measurement here, so a marker keeps its proportions at any
 * printed size.
 *
 * A good is named in type rather than given a glyph, because four invented
 * icons would need a key and four words do not. A capital is the reverse — one
 * mark, so a star carries it — and is told apart by a second rule inside the
 * first rather than by a heavier line, the same way the border tiers separate.
 *
 * Kept small and light enough to read as something resting on the ground rather
 * than as a label for the province.
 */
const MARKER = {
  stroke: 1.6,
  strokeOpacity: 0.55,
  opacity: 0.72
}

/**
 * Draws one tier.
 *
 * Every stroke runs over *all* the borders before the next stroke starts. Done
 * per border instead, one border's paper stroke would cut through the ink of
 * the neighbour it meets at a junction. Paper strokes take butt caps so they
 * cannot overshoot their own ends and nibble whatever they run into.
 */
function Rails(
  { borders, rails }: { borders: GeneratedMap["borders"]; rails: readonly Rail[] }
) {
  return (
    <>
      {rails.map((rail) =>
        borders.map((border) => (
          <path
            key={`${rail.width}|${border.a}|${border.b}`}
            d={border.d}
            fill="none"
            stroke={rail.ink ? INK : PAPER}
            strokeWidth={rail.width}
            strokeOpacity={rail.ink ? RAIL_OPACITY : undefined}
            strokeLinejoin="round"
            strokeLinecap={rail.ink ? "round" : "butt"}
          />
        ))
      )}
    </>
  )
}

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

  const frontiers = map.borders.filter((b) => b.interstate)
  const interior = map.borders.filter((b) => !b.interstate)

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

        {
          /* Diagonal hatch, rotated rather than drawn at an angle so the tile
            itself stays axis-aligned. Pitched much finer than the sea's rules
            and struck twice per tile, so high ground reads as the darkest thing
            on the sheet without any fill to carry it. */
        }
        <pattern
          id="tex-mountain"
          width={5}
          height={5}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width={5} height={5} fill="#fff" />
          <line x1={0} y1={0} x2={0} y2={5} stroke={INK} strokeWidth={1.1} strokeOpacity={0.62} />
          <line x1={2.5} y1={0} x2={2.5} y2={5} stroke={INK} strokeWidth={0.6} strokeOpacity={0.4} />
        </pattern>
      </defs>

      <rect width={map.width} height={map.height} fill="url(#tex-sea)" />

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

        <path d={map.mountain} fill="url(#tex-mountain)" />

        {
          /* The coast, kept faint, and drawn before the borders so the two
            heavier tiers always sit on top of it. */
        }
        <path
          d={map.land}
          fill="none"
          stroke={INK}
          strokeWidth={COAST.width}
          strokeOpacity={COAST.opacity}
          strokeLinejoin="round"
        />

        <Rails borders={interior} rails={PROVINCE_LINE} />

        {
          /* Drawn after the province tier, so its paper strokes trim the province
            rails back where they run into a frontier — the way a minor road
            stops short at a major one. */
        }
        <Rails borders={frontiers} rails={STATE_LINE} />

        {selected !== undefined && (
          <path d={selected.d} fill="none" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        )}
      </g>

      {
        /* Outside the rough filter: a displacement map that flatters a coastline
          would chew a 14-unit caption to pieces. The white fill is load-bearing
          — it clears whatever line or texture the marker lands on, so the chip's
          slot reads as bare paper. */
      }
      <g opacity={MARKER.opacity}>
        {map.resources.map((resource) => (
          <g key={`${resource.province}|${resource.x},${resource.y}`}>
            <path
              d={resource.d}
              fill={PAPER}
              stroke={INK}
              strokeWidth={MARKER.stroke}
              strokeOpacity={MARKER.strokeOpacity}
              strokeLinejoin="round"
            />
            <text
              x={resource.x}
              y={resource.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={MARKER_TYPE.fontSize}
              letterSpacing={MARKER_TYPE.letterSpacing}
              fill={INK}
            >
              {resource.label}
            </text>
          </g>
        ))}

        {map.capitals.map((capital) => (
          <g key={`capital|${capital.x},${capital.y}`}>
            <path
              d={capital.d}
              fill={PAPER}
              stroke={INK}
              strokeWidth={MARKER.stroke}
              strokeOpacity={MARKER.strokeOpacity}
              strokeLinejoin="round"
            />
            <path
              d={capital.rule}
              fill="none"
              stroke={INK}
              strokeWidth={MARKER.stroke}
              strokeOpacity={MARKER.strokeOpacity}
              strokeLinejoin="round"
            />
            <path d={capital.star} fill={INK} />
          </g>
        ))}
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
              {p.state === undefined
                ? p.name
                : `${p.name} — ${map.states.find((s) => s.id === p.state)?.name}`}
            </title>
          </path>
        ))}
      </g>

      {
        /* No type on the board at all. Both tiers still carry a `label` anchor in
          `map.json`, so a printed key or a later pass can place names without
          recomputing anything — nothing draws them here. */
      }
    </svg>
  )
}

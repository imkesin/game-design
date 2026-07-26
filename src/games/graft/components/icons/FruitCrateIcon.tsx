import { css } from "~/generated/styled-system/css"

/**
 * A generic crate drawn as a small grey isometric cube — the *printed* reference
 * to a crate, as opposed to FruitCrateSlot's flat square where a physical token
 * drops. Three shaded faces (top lightest, front mid, right darkest) read as a
 * solid box in black-and-white print; an optional `letter` sits on the front
 * face to name a dynamic value (e.g. a Foreign Market variable "α").
 *
 * Being grey and letter-labelled rather than fruit-tinted is the point: it
 * stands for "a crate of whatever fruit is bound to α", so recipes compose from
 * it (see CrateCount for the "4 × ▢" wrapper).
 *
 * Drawn as inline SVG so it stays print-crisp and scales with `--u`.
 */

// Geometry in mm (1 viewBox unit = 1mm at print). Cabinet-style cube: an 8x8mm
// square front face — the readable size the letter needs — with depth cast
// up-and-right by DEPTH. That fixes the whole icon's footprint at
// (FACE + DEPTH + rim) square ≈ 11.4mm; BOX is the viewBox / default render size,
// so at default `size` the front face is exactly 8mm.
const FACE = 8 // front face side (target legible size)
const DEPTH = 3 // up-right offset for the top/right faces
const STROKE = 0.4
const INSET = STROKE / 2
const BOX = FACE + DEPTH + STROKE // 11.4 — overall square footprint

const FL = INSET // front-left x (0.2)
const FR = FL + FACE // front-right x (8.2)
const FB = BOX - INSET // front-bottom y (11.2)
const FT = FB - FACE // front-top y (3.2)
const BX = FR + DEPTH // back-right x (11.2)
const BT = FT - DEPTH // back-top y (0.2)

const FRONT = `M ${FL} ${FT} L ${FR} ${FT} L ${FR} ${FB} L ${FL} ${FB} Z`
const TOP = `M ${FL} ${FT} L ${FR} ${FT} L ${BX} ${BT} L ${FL + DEPTH} ${BT} Z`
const RIGHT = `M ${FR} ${FT} L ${BX} ${BT} L ${BX} ${FB - DEPTH} L ${FR} ${FB} Z`

// Front-face centre, for the letter.
const CX = (FL + FR) / 2 // 4.2
const CY = (FT + FB) / 2 // 7.2
const FONT = 5.5 // seats a Greek glyph on the 8mm face

const cube = css({ display: "block", width: `${BOX}`, height: `${BOX}` })

/**
 * Face/rim/letter steps per tone, all preserving the top-light/right-dark shading
 * that reads the cube as 3D. `mid` is the neutral default; `light` is a pale cube
 * with dark letter, `dark` a deep cube with light letter — paired (light left /
 * dark right) they make the two variables in a zone instantly distinct.
 */
export type CrateTone = "mid" | "light" | "dark"
const TONE_STEPS: Record<CrateTone, { top: number; front: number; right: number; rim: number; text: number }> = {
  mid: { top: 100, front: 200, right: 400, rim: 500, text: 700 },
  light: { top: 50, front: 100, right: 300, rim: 400, text: 800 },
  dark: { top: 600, front: 700, right: 900, rim: 950, text: 50 }
}

export function FruitCrateIcon(
  { letter, size = BOX, color = "zinc", tone = "mid", className }: {
    letter?: string
    size?: number
    /** Panda colour-scale name for the cube (e.g. "zinc", "blue"). */
    color?: string
    /** Lightness treatment; pair `light`/`dark` to distinguish a zone's two variables. */
    tone?: CrateTone
    className?: string
  }
) {
  // `size` (in card units) sets the box via inline style, which reliably wins
  // over the `cube` class regardless of stylesheet order. Defaults to BOX so the
  // front face is 8mm; pass a smaller size to scale the whole cube down.
  const sizeStyle = { width: `calc(${size} * var(--u))`, height: `calc(${size} * var(--u))` }
  const c = (step: number) => `var(--colors-${color}-${step})`
  const s = TONE_STEPS[tone]
  return (
    <svg
      className={className ? `${cube} ${className}` : cube}
      style={sizeStyle}
      viewBox={`0 0 ${BOX} ${BOX}`}
      role="img"
      aria-label={letter ? `${letter} crate` : "crate"}
    >
      <path d={TOP} fill={c(s.top)} stroke={c(s.rim)} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={RIGHT} fill={c(s.right)} stroke={c(s.rim)} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={FRONT} fill={c(s.front)} stroke={c(s.rim)} strokeWidth={STROKE} strokeLinejoin="round" />
      {letter && (
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={FONT}
          fontWeight={700}
          fill={c(s.text)}
        >
          {letter}
        </text>
      )}
    </svg>
  )
}

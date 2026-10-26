/**
 * The board's ground, set by how light it reads (`L`, the OKLab scale
 * `colors.ts` uses: white 1, tiles 0.70). Vacant lots are engraved: hairlines
 * in one grey ink, transparent between lines, their spacing (never their
 * weight) following from L. Streets are a flat grey.
 */
export type Hatch = {
  /** Degrees: 0 runs north–south. */
  angle: number
  /** Line spacing, mm. */
  pitch: number
  /** The share of the area inked, 0–1. */
  cover: number
  color: string
}

/** One grey ink, in hairlines; tone comes from how many lines, never how thick. */
const INK = { color: "#333333", width: 0.15 }

/** A `<pattern>` for a hatch. */
export function Pattern({ id, hatch: { angle, pitch, color } }: { id: string; hatch: Hatch }) {
  const width = INK.width
  return (
    <pattern id={id} width={pitch} height={pitch} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
      <rect x={(pitch - width) / 2} y={0} width={width} height={pitch} fill={color} />
    </pattern>
  )
}

const linear = (c: number) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4

/** OKLab lightness of linear sRGB. */
function oklabL([r = 0, g = 0, b = 0]: readonly number[]) {
  const [l = 0, m = 0, s = 0] = [
    0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b,
    0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b,
    0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  ].map(Math.cbrt)
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
}

/** How light `cover` of `color` on white reads from arm's length: ink and paper averaged as light. */
function lightness(color: string, cover: number) {
  const ink = [1, 3, 5].map((i) => linear(parseInt(color.slice(i, i + 2), 16) / 255))
  return oklabL(ink.map((c) => 1 - cover + cover * c))
}

/** The cover at which `color` reads as lightness `l`. */
function coverFor(l: number, color: string) {
  let [lo, hi] = [0, 1]
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    if (lightness(color, mid) > l) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** Hairlines at `angle` spaced to read as lightness `l`. */
function engraved(angle: number, l: number): Hatch {
  const cover = coverFor(l, INK.color)
  return { angle, pitch: INK.width / cover, cover, color: INK.color }
}

/** The neutral grey that reads as lightness `l`: OKLab L is the cube root of luminance for a grey. */
function grey(l: number) {
  const y = l ** 3
  const srgb = y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055
  const hex = Math.round(srgb * 255).toString(16).padStart(2, "0")
  return { l, color: `#${hex}${hex}${hex}` }
}

/** A hatch in numbers: how light it reads, its cover and line spacing. */
export function describe({ color, cover, pitch }: Hatch) {
  const l = lightness(color, cover).toFixed(2)
  return `L ${l} (${Math.round(cover * 100)}% · ${+pitch.toFixed(2)}mm apart · ${INK.width}mm lines)`
}

/**
 * Settled 2026-10-25 (COMPONENTS.md, Engraved ground): vacant lots are light
 * diagonal lines; streets, their crossings and City Hall's plaza one darker
 * flat grey, painted as one, with their names written on them in a darker
 * grey still.
 */
export const GROUND = {
  lot: engraved(45, 0.97),
  street: grey(0.9),
  streetName: grey(0.6)
}

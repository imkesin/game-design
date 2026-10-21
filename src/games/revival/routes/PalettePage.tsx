import { COLORS, PLAYERS } from "~/games/revival/colors"
import { Tile } from "~/games/revival/tiles/Tile"
import { BLIGHT, type BuildingKind, TILES } from "~/games/revival/tiles/tiles"
import { css } from "~/generated/styled-system/css"

/** Every palette color, grouped by the rule it follows (colors.ts), with each building's tile faces. */

const BUILDINGS: readonly BuildingKind[] = ["park", "house", "commercial", "industrial"]

const root = css({
  display: "grid",
  gap: "28px",
  padding: "24px",
  minHeight: "100vh",
  background: "#e5e5e5",
  fontFamily: "sans-serif",
  color: "#1f1f1f"
})

const section = css({ display: "grid", gap: "10px" })

const heading = css({ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" })

const row = css({ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "start" })

const swatch = css({ display: "grid", gridTemplateRows: "72px auto auto auto", width: "136px", gap: "4px" })

const chip = css({ borderRadius: "6px", boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.15)" })

const name = css({ fontSize: "12px", fontWeight: 600 })

const hex = css({ fontSize: "11px", color: "#6b6b6b", fontFamily: "monospace" })

const faces = css({ display: "flex", gap: "8px" })

const rgbOf = (color: string) =>
  [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255) as [number, number, number]

/** Perceptual lightness (0–1), chroma and hue: what colors.ts picks in. */
function oklchOf(color: string) {
  const [r, g, b] = rgbOf(color).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number
  ]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(A, B)
  const H = C < 0.002 ? 0 : (Math.atan2(B, A) * 180 / Math.PI + 360) % 360
  return `oklch ${L.toFixed(2)} ${C.toFixed(3)} ${Math.round(H)}`
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className={swatch}>
      <div className={chip} style={{ background: color }} />
      <span className={name}>{label}</span>
      <span className={hex}>{color}</span>
      <span className={hex}>{oklchOf(color)}</span>
    </div>
  )
}

function Section({ title, colors }: { title: string; colors: Record<string, string> }) {
  return (
    <div className={section}>
      <div className={heading}>{title}</div>
      <div className={row}>
        {Object.entries(colors).map(([label, color]) => <Swatch key={label} label={label} color={color} />)}
      </div>
    </div>
  )
}

const pick = <K extends keyof typeof COLORS>(...keys: K[]) => Object.fromEntries(keys.map((k) => [k, COLORS[k]]))

/** Each building type's row tile: construction and finished. */
function facesOf(kind: BuildingKind) {
  const row = TILES.find(({ a, b }) => a.kind === kind && a.side === "construction" && b !== undefined)
  return [row?.a, row?.b].filter((f) => f !== undefined)
}

export function PalettePage() {
  return (
    <div className={root}>
      <Section title="Buildings: one lightness, hue only" colors={pick("park", "house", "commercial", "industrial")} />
      <div className={section}>
        <div className={heading}>Tile faces</div>
        <div className={faces}>
          <Tile face={BLIGHT} />
        </div>
        {BUILDINGS.map((kind) => (
          <div key={kind} className={faces}>{facesOf(kind).map((f, i) => <Tile key={i} face={f} />)}</div>
        ))}
      </div>
      <Section title="Neutrals" colors={pick("blight", "historical")} />
      <Section title="Civic" colors={pick("civic", "civicInk")} />
      <Section title="Money" colors={pick("coin", "cost", "payoff")} />
      <Section title="Players: vibrant" colors={PLAYERS} />
    </div>
  )
}

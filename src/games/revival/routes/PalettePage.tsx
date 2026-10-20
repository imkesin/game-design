import { COLORS, DARK, PLAYERS } from "~/games/revival/colors"
import { Tile } from "~/games/revival/tiles/Tile"
import { type BuildingKind, TILES } from "~/games/revival/tiles/tiles"
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

const swatch = css({ display: "grid", gridTemplateRows: "72px auto auto", width: "104px", gap: "4px" })

const chip = css({ borderRadius: "6px", boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.15)" })

const name = css({ fontSize: "12px", fontWeight: 600 })

const hex = css({ fontSize: "11px", color: "#6b6b6b", fontFamily: "monospace" })

const faces = css({ display: "flex", gap: "8px" })

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className={swatch}>
      <div className={chip} style={{ background: color }} />
      <span className={name}>{label}</span>
      <span className={hex}>{color}</span>
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

/** One of each face a building type has: row construction, finished, and (not Parks) blight and its restoring side. */
function facesOf(kind: BuildingKind) {
  const row = TILES.find(({ a, b }) => a.kind === kind && a.side === "construction" && b !== undefined)
  const blight = TILES.find(({ a }) => a.kind === kind && a.side === "dark")
  return [row?.a, row?.b, blight?.a, blight?.b].filter((f) => f !== undefined)
}

export function PalettePage() {
  return (
    <div className={root}>
      <Section title="Buildings: one lightness, hue only" colors={pick("park", "house", "commercial", "industrial")} />
      <Section title="Dark: each type blighted" colors={DARK} />
      <div className={section}>
        <div className={heading}>Tile faces</div>
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

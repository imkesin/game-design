import { useState } from "react"
import type { GeneratedMap } from "~/games/numina/map/generate"
import { HexPainter } from "~/games/numina/map/HexPainter"
import type { HexMapSpec } from "~/games/numina/map/hexSpec"
import hexSpecData from "~/games/numina/map/hexSpec.json"
import mapData from "~/games/numina/map/map.json"
import { MapView } from "~/games/numina/map/MapView"
import { css } from "~/generated/styled-system/css"

const map = mapData as GeneratedMap
const hexSpec = hexSpecData as HexMapSpec

const page = css({
  minHeight: "100vh",
  display: "grid",
  gridTemplateAreas: `
    "header"
    "map"
    "caption"
  `,
  gridTemplateRows: "auto 1fr auto",
  justifyItems: "center",
  gap: "16px",
  padding: "24px",
  background: "#fff"
})

const header = css({
  gridArea: "header",
  display: "grid",
  gridAutoFlow: "column",
  alignItems: "center",
  gap: "20px",
  color: "#000",
  fontSize: "14px",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
})

const toggleLabel = css({
  display: "grid",
  gridAutoFlow: "column",
  gap: "8px",
  alignItems: "center",
  cursor: "pointer"
})

const canvas = css({
  gridArea: "map",
  width: "100%",
  maxWidth: "1100px",
  alignSelf: "center",
  // Roughly the printed frame's 1.2mm at the width this page renders the board.
  border: "3px solid #000"
})

const caption = css({
  gridArea: "caption",
  minHeight: "24px",
  color: "#000",
  fontSize: "14px",
  letterSpacing: "0.06em"
})

type Mode = "view" | "edit"

// Remembered so a refresh mid-paint puts you back in the painter rather than
// in view mode.
const MODE_KEY = "numina:map-mode"

export function MapPage() {
  const [mode, setModeState] = useState<Mode>(
    () => localStorage.getItem(MODE_KEY) === "edit" ? "edit" : "view"
  )
  const setMode = (next: Mode) => {
    localStorage.setItem(MODE_KEY, next)
    setModeState(next)
  }
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rough, setRough] = useState(true)

  const selected = map.provinces.find((p) => p.id === selectedId)

  return (
    <div className={page}>
      <div className={header}>
        <span>Numina — Map</span>
        <label className={toggleLabel}>
          <input
            type="checkbox"
            checked={mode === "edit"}
            onChange={(event) => setMode(event.target.checked ? "edit" : "view")}
          />
          Edit mode
        </label>
        {mode === "view" && (
          <label className={toggleLabel}>
            <input type="checkbox" checked={rough} onChange={(event) => setRough(event.target.checked)} />
            Rough edges
          </label>
        )}
      </div>

      {mode === "view"
        ? (
          <MapView
            map={map}
            selectedId={selectedId}
            onSelect={setSelectedId}
            rough={rough}
            className={canvas}
          />
        )
        : <HexPainter initial={hexSpec} className={canvas} />}

      <div className={caption}>
        {mode === "edit"
          ? "Paint terrain, then group land hexes into provinces. Save writes straight to the repo."
          : selected === undefined
          ? "Click a province."
          : `${selected.solo ? "Ungrouped " : ""}${selected.name}`
            + (selected.state === undefined
              ? ""
              : `, ${map.states.find((s) => s.id === selected.state)?.name}`)
            + ` — borders ${selected.neighbors.length}`}
      </div>
    </div>
  )
}

export default MapPage

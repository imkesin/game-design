import { useState } from "react"
import type { GeneratedMap } from "~/games/numina/map/generate"
import mapData from "~/games/numina/map/map.json"
import { MapView } from "~/games/numina/map/MapView"
import { css } from "~/generated/styled-system/css"

const map = mapData as GeneratedMap

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

const canvas = css({
  gridArea: "map",
  width: "100%",
  maxWidth: "1100px",
  alignSelf: "center",
  border: "1px solid #000"
})

const caption = css({
  gridArea: "caption",
  minHeight: "24px",
  color: "#000",
  fontSize: "14px",
  letterSpacing: "0.06em"
})

export function MapPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rough, setRough] = useState(true)

  const selected = map.provinces.find((p) => p.id === selectedId)

  return (
    <div className={page}>
      <div className={header}>
        <span>Numina — Map</span>
        <label
          className={css({
            display: "grid",
            gridAutoFlow: "column",
            gap: "8px",
            alignItems: "center",
            cursor: "pointer"
          })}
        >
          <input type="checkbox" checked={rough} onChange={(event) => setRough(event.target.checked)} />
          Rough edges
        </label>
      </div>

      <MapView
        map={map}
        selectedId={selectedId}
        onSelect={setSelectedId}
        rough={rough}
        className={canvas}
      />

      <div className={caption}>
        {selected === undefined
          ? "Click a province or sea."
          : selected.kind === "sea"
          ? `${selected.name} — borders ${selected.neighbors.join(", ")}`
          : `${selected.name}, ${map.states.find((s) => s.id === selected.state)?.name}`
            + ` — borders ${selected.neighbors.join(", ")}`}
      </div>
    </div>
  )
}

export default MapPage

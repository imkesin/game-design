import { css } from "~/generated/styled-system/css"

const bar = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 16px",
  borderRadius: "8px",
  background: "#262626",
  color: "#e5e5e5",
  fontSize: "14px",
  userSelect: "none"
})

const label = css({ display: "flex", alignItems: "center", gap: "8px" })

// `--u` ranges over real millimetres-per-unit. 1mm = true physical size on a
// ~96dpi display; larger values zoom in.
const MIN = 1
const MAX = 6

export function ZoomControl({
  zoom,
  onZoom,
  showGuides,
  onToggleGuides
}: {
  zoom: number
  onZoom: (v: number) => void
  showGuides: boolean
  onToggleGuides: (v: boolean) => void
}) {
  return (
    <div className={bar}>
      <label className={label}>
        Zoom
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={0.1}
          value={zoom}
          onChange={(e) => onZoom(Number(e.target.value))}
        />
        <span style={{ width: "5ch", fontVariantNumeric: "tabular-nums" }}>
          {zoom.toFixed(1)}×
        </span>
      </label>
      <label className={label}>
        <input
          type="checkbox"
          checked={showGuides}
          onChange={(e) => onToggleGuides(e.target.checked)}
        />
        Guides
      </label>
    </div>
  )
}

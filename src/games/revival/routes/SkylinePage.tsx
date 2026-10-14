import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react"
import { Desk } from "~/games/revival/city/Desk"
import { mm } from "~/games/revival/city/mm"
import { Paper } from "~/games/revival/city/Paper"
import savedMap from "~/games/revival/skyline/map.json"
import { Neighborhood } from "~/games/revival/skyline/Neighborhood"
import { HEADER, shape, type SkylineFile } from "~/games/revival/skyline/skyline"
import { css } from "~/generated/styled-system/css"

/**
 * Trial alternative to the prefab city (`/revival`): Brass-style skyline
 * neighborhoods joined by explicit links, on a Letter sheet. Drag a
 * neighborhood to move it; edit columns, names and links in
 * `skyline/map.json`; Save writes positions back.
 */

const IN = 25.4
/** US Letter, portrait, and its printable area with ¼in margins. */
const LETTER = { width: 8.5 * IN, height: 11 * IN }
const AREA = { width: 8 * IN, height: 10.5 * IN }

/** Drags snap to this, in mm. */
const SNAP = 2
/** A link: one bold line, centre to centre, under the neighborhoods. */
const LINK = 3

const STATUS_KEY = "revival:skyline-save-status"

const controls = css({
  display: "grid",
  gridAutoFlow: "column",
  gap: "14px",
  alignItems: "center",
  textTransform: "none",
  letterSpacing: 0,
  color: "#333",
  fontSize: "13px"
})

const button = css({ padding: "2px 10px", border: "1px solid #999", borderRadius: "4px", background: "white" })

const map = css({ display: "grid", gridTemplateAreas: `"map"` })

const item = css({ gridArea: "map", justifySelf: "start", alignSelf: "start" })

export function SkylinePage() {
  const [file, setFile] = useState<SkylineFile>(savedMap as SkylineFile)
  const [dirty, setDirty] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<string | null>(() => {
    const saved = sessionStorage.getItem(STATUS_KEY)
    if (saved !== null) sessionStorage.removeItem(STATUS_KEY)
    return saved
  })
  const mapRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ index: number; startX: number; startY: number; fromX: number; fromY: number; scale: number }>(
    null
  )

  const placed = useMemo(() => file.neighborhoods.map((n) => ({ ...n, shape: shape(n.columns) })), [file])

  const links = useMemo(() => {
    const centre = new Map(placed.map((n) => [n.name, [n.x + n.shape.width / 2, n.y + n.shape.height / 2] as const]))
    return file.links.map(([a, b]) => ({ a, b, from: centre.get(a), to: centre.get(b) }))
  }, [placed, file.links])
  const broken = links.filter((l) => l.from === undefined || l.to === undefined)

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  useEffect(() => {
    if (!dragging) return
    const snap = (v: number) => Math.round(v / SNAP) * SNAP
    const move = (event: globalThis.PointerEvent) => {
      const d = drag.current
      if (d === null) return
      setFile((f) => ({
        ...f,
        neighborhoods: f.neighborhoods.map((n, k) =>
          k === d.index
            ? {
              ...n,
              x: snap(d.fromX + (event.clientX - d.startX) / d.scale),
              y: snap(d.fromY + (event.clientY - d.startY) / d.scale)
            }
            : n
        )
      }))
      setDirty(true)
    }
    const drop = () => {
      drag.current = null
      setDragging(false)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", drop)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", drop)
    }
  }, [dragging])

  function grab(index: number, event: PointerEvent<HTMLDivElement>) {
    const bounds = mapRef.current?.getBoundingClientRect()
    const from = file.neighborhoods[index]
    if (bounds === undefined || from === undefined) return
    event.preventDefault()
    drag.current = {
      index,
      startX: event.clientX,
      startY: event.clientY,
      fromX: from.x,
      fromY: from.y,
      scale: bounds.width / AREA.width
    }
    setDragging(true)
  }

  async function save() {
    const report = (message: string) => {
      sessionStorage.setItem(STATUS_KEY, message)
      setStatus(message)
    }
    setStatus("Saving…")
    try {
      const response = await fetch("/__revival-skyline", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(file)
      })
      const body = await response.json() as { ok: boolean; error?: string }
      if (body.ok) setDirty(false)
      report(body.ok ? "Saved." : body.error ?? "Save failed.")
    } catch (failure) {
      report(`Save failed: ${String(failure)}`)
    }
  }

  const plots = file.neighborhoods.reduce((sum, n) => sum + n.columns.reduce((a, b) => a + b, 0), 0)

  return (
    <Desk
      title="Revival — Skyline (Letter)"
      notes={
        <span className={controls}>
          <button type="button" className={button} onClick={() => void save()}>Save</button>
          <span>
            {file.neighborhoods.length} neighborhoods · {plots} plots · {file.links.length} links
            {broken.length > 0 ? ` · unknown link ends: ${broken.map((l) => `${l.a}–${l.b}`).join(", ")}` : ""}
            {dirty ? " · unsaved" : ""}
            {status === null ? "" : ` · ${status}`}
          </span>
        </span>
      }
    >
      <Paper {...LETTER} areaWidth={AREA.width} areaHeight={AREA.height} title="Letter · area 8×10.5in">
        <div ref={mapRef} className={map} style={{ width: mm(AREA.width), height: mm(AREA.height) }}>
          <svg
            viewBox={`0 0 ${AREA.width} ${AREA.height}`}
            style={{ gridArea: "map", width: "100%", height: "100%" }}
          >
            {links.map(({ a, b, from, to }) =>
              from === undefined || to === undefined ? null : (
                <line
                  key={`${a}–${b}`}
                  x1={from[0]}
                  y1={from[1]}
                  x2={to[0]}
                  y2={to[1]}
                  stroke="black"
                  strokeWidth={LINK}
                  strokeLinecap="round"
                />
              )
            )}
          </svg>
          {placed.map((n, i) => (
            <div key={n.name} className={item} style={{ marginLeft: mm(n.x), marginTop: mm(n.y - HEADER) }}>
              <Neighborhood
                name={n.name}
                columns={n.columns}
                onGrab={(event) =>
                  grab(i, event)}
              />
            </div>
          ))}
        </div>
      </Paper>
    </Desk>
  )
}

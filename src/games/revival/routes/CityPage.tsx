import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react"
import savedCity from "~/games/revival/city/city.json"
import { Desk } from "~/games/revival/city/Desk"
import { boxGap, chooseMix, pack } from "~/games/revival/city/pack"
import { Paper } from "~/games/revival/city/Paper"
import { geometry, type Layout, LAYOUTS } from "~/games/revival/city/prefabs"
import { territories } from "~/games/revival/city/territories"
import { type EdgeStyle, TerritoryMap } from "~/games/revival/city/TerritoryMap"
import { css } from "~/generated/styled-system/css"

/**
 * A whole city on an 18×24in print-shop sheet, portrait, with a ½in buffer all
 * round (a 17×23in area). Starts from the saved arrangement in
 * `city/city.json`; drag neighborhoods to move them, Shuffle for a fresh
 * packed arrangement, Save to write it back to the repo.
 */

const IN = 25.4
const PAPER = { width: 18 * IN, height: 24 * IN }
const AREA = { width: 17 * IN, height: 23 * IN }

/** Neighborhoods per plot count: 18 neighborhoods, 81 plots. */
const MIX: Readonly<Record<number, number>> = { 2: 2, 3: 3, 4: 4, 5: 4, 6: 3, 7: 2 }

/**
 * Box-to-box gap, so a street runs 4mm from each box: about 2.5mm clear of a
 * claim marker and 12mm+ from any plot. 12mm rarely fit all 18 on the sheet.
 */
const GAP = 8
/** Drags snap to this, in mm. */
const SNAP = 4

type Placement = { layout: Layout; x: number; y: number }

/** What Save writes. `reach: null` lets territories fill the whole area. */
type CityFile = { reach: number | null; edge: EdgeStyle; placements: Placement[] }

const SAVED = savedCity as CityFile

const areaOf = (layout: Layout) => {
  const { width, height } = geometry(layout)
  return width * height
}

/** `edge` keeps boxes far enough in from the rim for the city edge to fit. */
function build(seed: number, edge: number) {
  // Biggest first, so small neighborhoods fill the gaps instead of fragmenting the centre.
  const order = chooseMix(LAYOUTS, MIX, seed).sort((a, b) => areaOf(b) - areaOf(a))
  return pack(order, { ...AREA, seed, gap: GAP, edge })
}

/** The first seed from `from` that places the whole mix (or `from` itself, if none does soon). */
function nextFitting(from: number, edge: number) {
  for (let seed = from; seed < from + 100; seed++) if (build(seed, edge).skipped.length === 0) return seed
  return from
}

const STATUS_KEY = "revival:city-save-status"

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

const control = css({ display: "grid", gridAutoFlow: "column", gap: "6px", alignItems: "center" })

const button = css({ padding: "2px 10px", border: "1px solid #999", borderRadius: "4px", background: "white" })

/** Pins the map's own coordinates to the pointer during a drag. */
const mapFrame = css({ display: "grid" })

export function CityPage() {
  const [placements, setPlacements] = useState<Placement[]>(SAVED.placements)
  const [reach, setReach] = useState<number | null>(SAVED.reach)
  const [edge, setEdge] = useState<EdgeStyle>(SAVED.edge)
  const [seed, setSeed] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState<string | null>(() => {
    const saved = sessionStorage.getItem(STATUS_KEY)
    if (saved !== null) sessionStorage.removeItem(STATUS_KEY)
    return saved
  })
  const [dragging, setDragging] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ index: number; startX: number; startY: number; fromX: number; fromY: number; scale: number }>(
    null
  )

  const placed = useMemo(() => placements.map(({ layout, x, y }) => ({ geo: geometry(layout), x, y })), [placements])
  const sites = useMemo(() => placed.map(({ geo, x, y }) => ({ x, y, w: geo.width, h: geo.height })), [placed])
  // Coarser while dragging so it keeps up with the pointer; 1mm at rest.
  const map = useMemo(
    () => territories(sites, AREA.width, AREA.height, { step: dragging ? 2 : 1, reach: reach ?? Infinity }),
    [sites, reach, dragging]
  )

  const conflicts = useMemo(() => {
    const out = new Set<number>()
    sites.forEach((a, i) => {
      if (a.x < 0 || a.y < 0 || a.x + a.w > AREA.width || a.y + a.h > AREA.height) out.add(i)
      sites.forEach((b, j) => {
        if (i < j && boxGap(a, b) < GAP) [i, j].forEach((k) => out.add(k))
      })
    })
    return out
  }, [sites])

  const editReach = (value: number | null) => {
    setReach(value)
    setDirty(true)
  }

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
      setPlacements((all) =>
        all.map((p, k) =>
          k === d.index
            ? {
              ...p,
              x: snap(d.fromX + (event.clientX - d.startX) / d.scale),
              y: snap(d.fromY + (event.clientY - d.startY) / d.scale)
            }
            : p
        )
      )
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
    const frame = mapRef.current?.getBoundingClientRect()
    const from = placements[index]
    if (frame === undefined || from === undefined) return
    event.preventDefault()
    drag.current = {
      index,
      startX: event.clientX,
      startY: event.clientY,
      fromX: from.x,
      fromY: from.y,
      scale: frame.width / AREA.width
    }
    setDragging(true)
  }

  function shuffle() {
    const edge = reach ?? 6
    const next = nextFitting(seed + 1, edge)
    setSeed(next)
    setPlacements(build(next, edge).placed.map(({ layout, x, y }) => ({ layout, x, y })))
    setDirty(true)
  }

  async function save() {
    const file: CityFile = { reach, edge, placements }
    const report = (message: string) => {
      sessionStorage.setItem(STATUS_KEY, message)
      setStatus(message)
    }
    setStatus("Saving…")
    try {
      const response = await fetch("/__revival-city", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(file, null, 2) + "\n"
      })
      const body = await response.json() as { ok: boolean; error?: string }
      if (body.ok) setDirty(false)
      report(body.ok ? "Saved." : body.error ?? "Save failed.")
    } catch (failure) {
      report(`Save failed: ${String(failure)}`)
    }
  }

  const plots = placed.reduce((sum, p) => sum + p.geo.plots.length, 0)

  return (
    <Desk
      title="Revival — City (18×24)"
      pageSize="18in 24in"
      notes={
        <span className={controls}>
          <label className={control}>
            Reach
            <input
              type="range"
              min={4}
              max={60}
              step={2}
              value={reach ?? 60}
              disabled={reach === null}
              onChange={(e) => editReach(Number(e.target.value))}
            />
            <span style={{ width: "4ch" }}>{reach === null ? "–" : `${reach}mm`}</span>
          </label>
          <label className={control}>
            <input
              type="checkbox"
              checked={reach === null}
              onChange={(e) => editReach(e.target.checked ? null : 12)}
            />
            Fill sheet
          </label>
          <label className={control}>
            Edge
            <select
              value={edge}
              onChange={(e) => {
                setEdge(e.target.value as EdgeStyle)
                setDirty(true)
              }}
            >
              <option value="line">Line</option>
              <option value="street">Street</option>
            </select>
          </label>
          <button type="button" className={button} onClick={shuffle}>Shuffle</button>
          <button type="button" className={button} onClick={() => void save()}>Save</button>
          <span>
            {placed.length} neighborhoods · {plots} plots
            {conflicts.size > 0 ? ` · ${conflicts.size} too close` : ""}
            {dirty ? " · unsaved" : ""}
            {status === null ? "" : ` · ${status}`}
          </span>
        </span>
      }
    >
      <Paper {...PAPER} areaWidth={AREA.width} areaHeight={AREA.height} title="18×24in · area 17×23in">
        <div ref={mapRef} className={mapFrame}>
          <TerritoryMap
            width={AREA.width}
            height={AREA.height}
            placed={placed}
            territories={map}
            frame={reach === null}
            edge={edge}
            conflicts={conflicts}
            onGrab={grab}
          />
        </div>
      </Paper>
    </Desk>
  )
}

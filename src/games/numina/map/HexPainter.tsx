import type { PointerEvent } from "react"
import { useMemo, useRef, useState } from "react"
import { css } from "~/generated/styled-system/css"
import { marketCardRects, marketZone, payoffZone, rondelZone } from "./boardLayout.ts"
import { assemble } from "./generate.ts"
import { buildHexGrid, buildHexMesh } from "./hex.ts"
import type { HexCell, HexKind, HexMapSpec, ProvinceSpec, StateSpec } from "./hexSpec.ts"
import { CAPITAL_RULE_SCALE, MARKER_TYPE, markerPath, starPath } from "./markers.ts"
import { type Resource, RESOURCE_LABEL, RESOURCES } from "./resources.ts"

/**
 * Edit mode: paints a `HexMapSpec` directly, with no build step between a
 * stroke and its effect. Outlines are recomputed live by calling the same
 * `assemble()` the build calls — a pure function of the mesh and a cell
 * grouping, so it runs identically here in the browser.
 *
 * Terrain is a brush, because you are colouring in. Provinces are a selection,
 * because grouping is something you decide about a shape only once you can see
 * the whole shape: drag out the hexes, then name what you drew. Markers are
 * neither: one stamp on one hex, so they are placed by a single click and never
 * by a drag, which would smear a good across a whole province by accident.
 */

type Draft = {
  width: number
  height: number
  unitsPerInch: number
  hexes: Map<string, HexCell>
  provinces: Map<string, ProvinceSpec>
  states: Map<string, StateSpec>
}

const key = (col: number, row: number) => `${col},${row}`

const without = (set: ReadonlySet<string>, k: string) => {
  const next = new Set(set)
  next.delete(k)
  return next
}

/**
 * Both written key-absent rather than key-undefined, for
 * `exactOptionalPropertyTypes`.
 *
 * Clearing a province rebuilds the hex from its coordinates and terrain alone,
 * which drops any resource with it — deliberate, since a good with no province
 * to belong to is exactly what the build rejects.
 */
const withProvince = (hex: HexCell, province: string | undefined): HexCell =>
  province === undefined
    ? { col: hex.col, row: hex.row, kind: hex.kind }
    : { ...hex, province }

const CAPITAL = "capital"

/** What a hex can be stamped with. Exactly one, or none. */
type Marker = Resource | typeof CAPITAL

const MARKERS: readonly Marker[] = [...RESOURCES, CAPITAL]

const MARKER_LABEL = (marker: Marker) => marker === CAPITAL ? "CAPITAL" : RESOURCE_LABEL[marker]

const markerOf = (hex: HexCell): Marker | undefined => hex.capital === true ? CAPITAL : hex.resource

/**
 * Rebuilt without either marker before the new one goes on, so the two cannot
 * both end up set — the exclusivity the build enforces is unreachable from here
 * rather than merely unlikely.
 */
const withMarker = (hex: HexCell, marker: Marker | undefined): HexCell => {
  const { capital: _capital, resource: _resource, ...rest } = hex
  if (marker === undefined) return rest
  return marker === CAPITAL ? { ...rest, capital: true } : { ...rest, resource: marker }
}

const withState = (province: ProvinceSpec, state: string | undefined): ProvinceSpec =>
  state === undefined
    ? { id: province.id, name: province.name }
    : { ...province, state }

function toDraft(spec: HexMapSpec): Draft {
  return {
    width: spec.width,
    height: spec.height,
    unitsPerInch: spec.unitsPerInch ?? 100,
    hexes: new Map(spec.hexes.map((h) => [key(h.col, h.row), h])),
    provinces: new Map(spec.provinces.map((p) => [p.id, p])),
    states: new Map(spec.states.map((s) => [s.id, s]))
  }
}

function fromDraft(draft: Draft): HexMapSpec {
  return {
    width: draft.width,
    height: draft.height,
    unitsPerInch: draft.unitsPerInch,
    hexes: [...draft.hexes.values()].sort((a, b) => (a.row - b.row) || (a.col - b.col)),
    provinces: [...draft.provinces.values()].sort((a, b) => a.id.localeCompare(b.id)),
    states: [...draft.states.values()].sort((a, b) => a.id.localeCompare(b.id))
  }
}

const KIND_FILL: Record<HexKind, string> = {
  sea: "#dbeafe",
  land: "#ffffff",
  mountain: "#d4d4d4"
}
const KINDS: readonly HexKind[] = ["sea", "land", "mountain"]

/**
 * Province mode: water and high ground are inert, and ungrouped land has to
 * read as unfinished without being mistaken for either.
 */
const SEA_FILL = "#e8eef5"
const MOUNTAIN_FILL = "#c9c5c1"
const UNGROUPED_FILL = "#e4e4e7"

/** Board furniture reads in a colour no terrain swatch uses, so it never passes for a kind. */
const FURNITURE = "#b45309"

/** Golden angle: consecutive states land far apart on the wheel however many there are. */
const HUE_STEP = 137.508
/** Starts the wheel at blue, so the first state is not the same red as the selection outline. */
const HUE_START = 205

/**
 * A colour per province, with the provinces of one state sharing a hue and
 * differing only in lightness — so the province tier and the state tier are
 * both legible in a single glance at the fill. Stateless provinces are given
 * their own hues but drained of saturation, which reads as "not filed yet"
 * without going invisible.
 */
function provincePalette(draft: Draft): Map<string, string> {
  const stateOrder = [...draft.states.keys()].sort()
  const hueOf = new Map(stateOrder.map((id, i) => [id, (HUE_START + i * HUE_STEP) % 360]))

  const byState = new Map<string, string[]>()
  const loose: string[] = []
  for (const id of [...draft.provinces.keys()].sort()) {
    const state = draft.provinces.get(id)!.state
    if (state === undefined) loose.push(id)
    else byState.set(state, [...(byState.get(state) ?? []), id])
  }

  const colors = new Map<string, string>()
  for (const [state, ids] of byState) {
    const hue = hueOf.get(state) ?? 0
    ids.forEach((id, i) => {
      const light = ids.length === 1 ? 68 : 78 - (i / (ids.length - 1)) * 24
      colors.set(id, `hsl(${hue.toFixed(1)} 58% ${light.toFixed(1)}%)`)
    })
  }
  loose.forEach((id, i) => {
    const hue = (HUE_START + (stateOrder.length + i) * HUE_STEP) % 360
    colors.set(id, `hsl(${hue.toFixed(1)} 20% 74%)`)
  })
  return colors
}

function slugify(name: string, taken: ReadonlySet<string>): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "")
    || "region"
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

type Tool = "kind" | "province" | "marker"
/** What the in-flight drag is doing, captured on pointer-down so it cannot change mid-stroke. */
type Stroke = "kind" | "select" | "deselect"

const STATUS_KEY = "numina:hex-save-status"

/** Reads the save outcome left behind by a reload, and clears it. */
function readStatus(): string | null {
  const saved = sessionStorage.getItem(STATUS_KEY)
  if (saved !== null) sessionStorage.removeItem(STATUS_KEY)
  return saved
}

const shell = css({
  display: "grid",
  gridTemplateAreas: `"toolbar toolbar" "canvas panel"`,
  gridTemplateColumns: "1fr auto",
  gridTemplateRows: "auto 1fr"
})
const toolbar = css({
  gridArea: "toolbar",
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  alignItems: "center",
  padding: "8px 12px",
  background: "#f5f5f5",
  borderBottom: "1px solid #ccc",
  fontSize: "13px"
})
const group = css({ display: "flex", gap: "6px", alignItems: "center" })
const swatch = css({
  width: "22px",
  height: "22px",
  border: "1px solid #666",
  cursor: "pointer",
  padding: 0
})
const swatchActive = css({ outline: "2px solid #000", outlineOffset: "1px" })
const pill = css({
  padding: "3px 7px",
  border: "1px solid #666",
  background: "#fff",
  cursor: "pointer",
  fontSize: "10px",
  letterSpacing: "0.08em"
})
const pillActive = css({ background: "#1f2937", color: "#fff", borderColor: "#1f2937" })
const statusText = css({
  whiteSpace: "pre-wrap",
  fontFamily: "monospace",
  fontSize: "11px",
  maxHeight: "4.5em",
  overflowY: "auto"
})
const readout = css({ fontFamily: "monospace", fontSize: "11px", color: "#525252" })
const canvasStyle = css({
  gridArea: "canvas",
  display: "block",
  width: "100%",
  height: "auto",
  background: "#e5e5e5",
  cursor: "crosshair"
})
const panel = css({
  gridArea: "panel",
  width: "280px",
  borderLeft: "1px solid #ccc",
  padding: "10px",
  fontSize: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  maxHeight: "80vh",
  overflowY: "auto"
})
const panelHead = css({ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" })
const row = css({ display: "flex", gap: "5px", alignItems: "center" })
const chip = css({ width: "14px", height: "14px", flexShrink: 0, border: "1px solid #999" })
const grow = css({ flex: 1, minWidth: 0 })
const muted = css({ color: "#737373" })

export function HexPainter({ initial, className }: { initial: HexMapSpec; className?: string }) {
  const [draft, setDraft] = useState(() => toDraft(initial))
  const [tool, setTool] = useState<Tool>("kind")
  const [activeKind, setActiveKind] = useState<HexKind>("land")
  /** `null` is the eraser: stamping with it clears whatever marker the hex holds. */
  const [activeMarker, setActiveMarker] = useState<Marker | null>("tea")
  const [selection, setSelection] = useState<ReadonlySet<string>>(new Set())
  const [newProvince, setNewProvince] = useState("")
  const [newState, setNewState] = useState("")
  const [addTarget, setAddTarget] = useState("")
  const [showFurniture, setShowFurniture] = useState(true)
  const [hover, setHover] = useState<string | null>(null)
  // Saving rewrites files Vite is watching. It normally hot-swaps them in place,
  // but it is free to decide on a full reload instead — so the outcome is parked
  // where it survives one, rather than a build error flashing past unread.
  const [status, setStatus] = useState<string | null>(readStatus)
  const stroke = useRef<Stroke | null>(null)

  const tiles = useMemo(
    () => buildHexGrid(draft.width, draft.height, draft.unitsPerInch),
    [draft.width, draft.height, draft.unitsPerInch]
  )
  const mesh = useMemo(() => buildHexMesh(tiles), [tiles])
  const tileByKey = useMemo(
    () => new Map(tiles.map((t) => [key(t.col, t.row), t])),
    [tiles]
  )

  const upi = draft.unitsPerInch
  const boardCols = draft.width / upi
  const boardRows = draft.height / upi
  const zone = marketZone(boardCols)
  const cardRects = marketCardRects(boardCols)
  const rondel = rondelZone(boardCols, boardRows)
  const payoff = payoffZone(boardRows)

  const provinceIds = useMemo(
    () =>
      [...draft.provinces.values()]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => p.id),
    [draft.provinces]
  )
  const palette = useMemo(() => provincePalette(draft), [draft])

  /** Outlines for the named provinces only — loose hexes already show the grid. */
  const outlines = useMemo(() => {
    const groups = tiles.map((t) => draft.hexes.get(key(t.col, t.row))?.province ?? "")
    return assemble(mesh, (cell) => groups[cell]!, [...provinceIds, ""]).outlines
  }, [mesh, tiles, draft.hexes, provinceIds])

  /** The land/sea boundary, so geography stays readable while grouping. */
  const coast = useMemo(() => {
    const groups = tiles.map((t) => draft.hexes.get(key(t.col, t.row))?.kind === "sea" ? "sea" : "land")
    return assemble(mesh, (cell) => groups[cell]!, ["land", "sea"]).outlines.get("land") ?? ""
  }, [mesh, tiles, draft.hexes])

  /** Every stamped good, as the same marker geometry the build emits. */
  const markers = useMemo(
    () =>
      [...draft.hexes.values()].flatMap((hex) => {
        const marker = markerOf(hex)
        if (marker === undefined) return []
        const tile = tileByKey.get(key(hex.col, hex.row))
        return tile === undefined ? [] : [{ tile, marker }]
      }),
    [draft.hexes, tileByKey]
  )

  const counts = useMemo(() => {
    const byProvince = new Map<string, number>()
    for (const hex of draft.hexes.values()) {
      if (hex.province === undefined) continue
      byProvince.set(hex.province, (byProvince.get(hex.province) ?? 0) + 1)
    }
    return byProvince
  }, [draft.hexes])

  function apply(k: string, action: Stroke) {
    if (action === "kind") {
      setDraft((d) => {
        const cell = d.hexes.get(k)
        if (cell === undefined || cell.kind === activeKind) return d
        const hexes = new Map(d.hexes)
        // Only land holds a province, so painting a hex to sea or mountain has
        // to drop whatever grouping it had.
        hexes.set(
          k,
          activeKind === "land" ? { ...cell, kind: activeKind } : withProvince({
            ...cell,
            kind: activeKind
          }, undefined)
        )
        return { ...d, hexes }
      })
      if (activeKind !== "land") setSelection((s) => (s.has(k) ? without(s, k) : s))
      return
    }

    // Selection is land-only: sea and mountain can never join a province, so let
    // them swallow the stroke rather than collecting hexes that cannot be grouped.
    if (draft.hexes.get(k)?.kind !== "land") return
    setSelection((s) => {
      if (action === "select") return s.has(k) ? s : new Set(s).add(k)
      return s.has(k) ? without(s, k) : s
    })
  }

  /**
   * A hex only holds a marker if its province does, so a stamp outside a named
   * province is dropped rather than written and rejected later by the build.
   *
   * Three ways to clear one, because undoing a stamp should never be harder
   * than making it: alt-click, the ERASE swatch, or stamping a hex with the
   * marker it already holds. The last makes the eraser a convenience rather
   * than a mode you have to go and find.
   */
  function stamp(k: string, erase: boolean) {
    setDraft((d) => {
      const cell = d.hexes.get(k)
      if (cell === undefined || cell.kind !== "land" || cell.province === undefined) return d
      const current = markerOf(cell)
      const next = erase || activeMarker === null || current === activeMarker
        ? undefined
        : activeMarker
      if (current === next) return d
      return { ...d, hexes: new Map(d.hexes).set(k, withMarker(cell, next)) }
    })
  }

  function begin(event: PointerEvent, col: number, row: number) {
    event.preventDefault()
    // Prevents implicit touch pointer capture, which would stop `onPointerEnter`
    // firing on the other hexes a drag passes over.
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    // One click, one stamp: `stroke` stays null so the drag that follows paints
    // nothing.
    if (tool === "marker") {
      stamp(key(col, row), event.altKey)
      return
    }

    const action: Stroke = tool === "kind" ? "kind" : event.altKey ? "deselect" : "select"
    stroke.current = action
    apply(key(col, row), action)
  }

  function extend(col: number, row: number) {
    setHover(key(col, row))
    if (stroke.current !== null) apply(key(col, row), stroke.current)
  }

  function assign(ids: ReadonlySet<string>, province: string | undefined) {
    setDraft((d) => {
      const hexes = new Map(d.hexes)
      for (const k of ids) {
        const cell = hexes.get(k)
        if (cell !== undefined && cell.kind !== "sea") hexes.set(k, withProvince(cell, province))
      }
      return { ...d, hexes }
    })
  }

  function makeProvince() {
    const name = newProvince.trim()
    if (name === "" || selection.size === 0) return
    const id = slugify(name, new Set(draft.provinces.keys()))
    setDraft((d) => ({ ...d, provinces: new Map(d.provinces).set(id, { id, name }) }))
    assign(selection, id)
    setSelection(new Set())
    setNewProvince("")
  }

  function deleteProvince(id: string) {
    setDraft((d) => {
      const provinces = new Map(d.provinces)
      provinces.delete(id)
      const hexes = new Map(d.hexes)
      for (const [k, cell] of hexes) {
        if (cell.province === id) hexes.set(k, withProvince(cell, undefined))
      }
      return { ...d, provinces, hexes }
    })
  }

  function addState() {
    const name = newState.trim()
    if (name === "") return
    const id = slugify(name, new Set(draft.states.keys()))
    setDraft((d) => ({ ...d, states: new Map(d.states).set(id, { id, name }) }))
    setNewState("")
  }

  function deleteState(id: string) {
    setDraft((d) => {
      const states = new Map(d.states)
      states.delete(id)
      const provinces = new Map(d.provinces)
      for (const [pid, province] of provinces) {
        if (province.state === id) provinces.set(pid, withState(province, undefined))
      }
      return { ...d, states, provinces }
    })
  }

  function download(json: string) {
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "hexSpec.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  async function save() {
    const json = JSON.stringify(fromDraft(draft), null, 2) + "\n"

    // Built for real: no dev endpoint to write into the repo, so hand the file
    // to the browser instead.
    if (!import.meta.env.DEV) {
      download(json)
      return
    }

    // Parked as well as shown, so it reads the same either side of a reload.
    const report = (message: string) => {
      sessionStorage.setItem(STATUS_KEY, message)
      setStatus(message)
    }

    setStatus("Saving…")
    try {
      const response = await fetch("/__hex-spec", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: json
      })
      const body = await response.json() as { ok: boolean; error?: string }
      report(body.ok ? "Saved." : body.error ?? "Save failed.")
    } catch (error) {
      report(`Save failed: ${String(error)}`)
    }
  }

  const hovered = hover === null ? undefined : draft.hexes.get(hover)
  const hoveredProvince = hovered?.province === undefined
    ? undefined
    : draft.provinces.get(hovered.province)
  const hoveredState = hoveredProvince?.state === undefined
    ? undefined
    : draft.states.get(hoveredProvince.state)

  const markerCounts = useMemo(() => {
    const byMarker = new Map<Marker, number>()
    for (const hex of draft.hexes.values()) {
      const marker = markerOf(hex)
      if (marker === undefined) continue
      byMarker.set(marker, (byMarker.get(marker) ?? 0) + 1)
    }
    return byMarker
  }, [draft.hexes])

  /** Named provinces with no good on them yet — the marker tool's to-do list. */
  const unstamped = useMemo(() => {
    const stamped = new Set<string>()
    for (const hex of draft.hexes.values()) {
      if (hex.resource !== undefined && hex.province !== undefined) stamped.add(hex.province)
    }
    return provinceIds.filter((id) => !stamped.has(id))
  }, [draft.hexes, provinceIds])

  const fillFor = (hex: HexCell | undefined) => {
    if (hex === undefined) return "#fff"
    if (tool === "kind") return KIND_FILL[hex.kind]
    // Sea and mountain hold no province, so they stay inert rather than reading
    // as land you have simply not grouped yet.
    if (hex.kind === "sea") return SEA_FILL
    if (hex.kind === "mountain") return MOUNTAIN_FILL
    if (hex.province === undefined) return UNGROUPED_FILL
    return palette.get(hex.province) ?? UNGROUPED_FILL
  }

  return (
    <div className={`${shell} ${className ?? ""}`}>
      <div className={toolbar}>
        <div className={group}>
          <label>
            <input type="radio" checked={tool === "kind"} onChange={() => setTool("kind")} /> Terrain
          </label>
          <label>
            <input
              type="radio"
              checked={tool === "province"}
              onChange={() => setTool("province")}
            />{" "}
            Provinces
          </label>
          <label>
            <input
              type="radio"
              checked={tool === "marker"}
              onChange={() => setTool("marker")}
            />{" "}
            Markers
          </label>
        </div>

        {tool === "kind" && (
          <div className={group}>
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                title={k}
                onClick={() => setActiveKind(k)}
                className={`${swatch} ${k === activeKind ? swatchActive : ""}`}
                style={{ background: KIND_FILL[k] }}
              />
            ))}
          </div>
        )}

        {tool === "province" && <span className={muted}>Drag to select · Alt-drag to deselect</span>}

        {tool === "marker" && (
          <>
            <div className={group}>
              {MARKERS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActiveMarker(m)}
                  className={`${pill} ${m === activeMarker ? pillActive : ""}`}
                >
                  {MARKER_LABEL(m)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveMarker(null)}
                className={`${pill} ${activeMarker === null ? pillActive : ""}`}
              >
                ERASE
              </button>
            </div>
            <span className={muted}>
              Click a hex in a named province · Alt-click, or click it again, to clear
            </span>
          </>
        )}

        <label className={group}>
          <input
            type="checkbox"
            checked={showFurniture}
            onChange={(event) => setShowFurniture(event.target.checked)}
          />
          Board zones
        </label>

        <button type="button" onClick={() => void save()}>Save</button>

        <span className={readout}>
          {hovered === undefined
            ? " "
            : `(${hovered.col},${hovered.row}) · ${hovered.kind}`
              + (hovered.kind !== "land"
                ? ""
                : ` · ${hoveredProvince?.name ?? "ungrouped"}`
                  + (hoveredState === undefined ? "" : ` / ${hoveredState.name}`))
              + (markerOf(hovered) === undefined ? "" : ` · ${markerOf(hovered)}`)}
        </span>

        {status !== null && <span className={statusText}>{status}</span>}
      </div>

      <svg
        viewBox={`0 0 ${draft.width} ${draft.height}`}
        className={canvasStyle}
        onPointerUp={() => {
          stroke.current = null
        }}
        onPointerLeave={() => {
          stroke.current = null
          setHover(null)
        }}
      >
        <defs>
          <pattern
            id="paint-mountain"
            width={14}
            height={14}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1={0} y1={0} x2={0} y2={14} stroke="#000" strokeWidth={2} strokeOpacity={0.16} />
          </pattern>
        </defs>

        <g>
          {tiles.map((tile) => {
            const hex = draft.hexes.get(key(tile.col, tile.row))
            const d = `M${tile.corners.map((p) => `${p[0]} ${p[1]}`).join(" L")} Z`
            return (
              <path
                key={tile.index}
                d={d}
                fill={fillFor(hex)}
                stroke="#bbb"
                strokeWidth={1}
                onPointerDown={(event) => begin(event, tile.col, tile.row)}
                onPointerEnter={() => extend(tile.col, tile.row)}
              />
            )
          })}
        </g>

        {/* Terrain that the province palette would otherwise hide. */}
        {tool !== "kind" && (
          <g pointerEvents="none">
            {tiles.filter((t) => draft.hexes.get(key(t.col, t.row))?.kind === "mountain").map((t) => (
              <path
                key={t.index}
                d={`M${t.corners.map((p) => `${p[0]} ${p[1]}`).join(" L")} Z`}
                fill="url(#paint-mountain)"
              />
            ))}
          </g>
        )}

        <g pointerEvents="none">
          {provinceIds.map((id) => (
            <path
              key={id}
              d={outlines.get(id) ?? ""}
              fill="none"
              stroke="#1f2937"
              strokeWidth={3}
              strokeLinejoin="round"
            />
          ))}
        </g>

        <path d={coast} fill="none" stroke="#0f172a" strokeWidth={5} strokeLinejoin="round" pointerEvents="none" />

        {/* The same marker the board prints, so placement is judged as it will read. */}
        <g pointerEvents="none">
          {markers.map(({ tile, marker }) => (
            <g key={tile.index}>
              <path
                d={markerPath(tile)}
                fill="#fff"
                stroke="#1f2937"
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {marker === CAPITAL
                ? (
                  <>
                    <path
                      d={markerPath(tile, CAPITAL_RULE_SCALE)}
                      fill="none"
                      stroke="#1f2937"
                      strokeWidth={2}
                      strokeLinejoin="round"
                    />
                    <path d={starPath(tile)} fill="#1f2937" />
                  </>
                )
                : (
                  <text
                    x={tile.center[0]}
                    y={tile.center[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={MARKER_TYPE.fontSize}
                    letterSpacing={MARKER_TYPE.letterSpacing}
                    fill="#1f2937"
                  >
                    {RESOURCE_LABEL[marker]}
                  </text>
                )}
            </g>
          ))}
        </g>

        <g pointerEvents="none">
          {[...selection].map((k) => {
            const tile = tileByKey.get(k)
            if (tile === undefined) return null
            return (
              <path
                key={k}
                d={`M${tile.corners.map((p) => `${p[0]} ${p[1]}`).join(" L")} Z`}
                fill="#fff"
                fillOpacity={0.45}
                stroke="#dc2626"
                strokeWidth={4}
                strokeLinejoin="round"
              />
            )
          })}
        </g>

        {
          /* What the print sheet lays over the board. Drawn last so it reads on
            top, and click-through so it never blocks a stroke. */
        }
        {showFurniture && (
          <g pointerEvents="none">
            <rect
              x={zone.x * upi}
              y={zone.y * upi}
              width={zone.width * upi}
              height={zone.height * upi}
              fill={FURNITURE}
              fillOpacity={0.08}
              stroke={FURNITURE}
              strokeWidth={2}
              strokeDasharray="12 8"
            />
            {cardRects.map((r, i) => (
              <rect
                key={i}
                x={r.x * upi}
                y={r.y * upi}
                width={r.width * upi}
                height={r.height * upi}
                rx={6}
                fill={FURNITURE}
                fillOpacity={0.12}
                stroke={FURNITURE}
                strokeWidth={3}
              />
            ))}
            <text
              x={zone.x * upi + 10}
              y={(zone.y + zone.height) * upi - 12}
              fill={FURNITURE}
              fontSize={22}
              letterSpacing="0.12em"
            >
              CARD MARKET
            </text>

            <rect
              x={rondel.x * upi}
              y={rondel.y * upi}
              width={rondel.width * upi}
              height={rondel.height * upi}
              fill={FURNITURE}
              fillOpacity={0.12}
              stroke={FURNITURE}
              strokeWidth={3}
            />
            <text
              x={(rondel.x + rondel.width / 2) * upi}
              y={(rondel.y + rondel.height / 2) * upi}
              fill={FURNITURE}
              fontSize={22}
              letterSpacing="0.12em"
              textAnchor="middle"
            >
              RONDEL
            </text>

            <rect
              x={payoff.x * upi}
              y={payoff.y * upi}
              width={payoff.width * upi}
              height={payoff.height * upi}
              fill={FURNITURE}
              fillOpacity={0.12}
              stroke={FURNITURE}
              strokeWidth={3}
            />
            <text
              x={(payoff.x + payoff.width / 2) * upi}
              y={(payoff.y + payoff.height / 2) * upi}
              fill={FURNITURE}
              fontSize={18}
              letterSpacing="0.12em"
              textAnchor="middle"
            >
              PAYOFF
            </text>
          </g>
        )}
      </svg>

      {tool === "marker" && (
        <aside className={panel}>
          <div>
            <div className={panelHead}>Stamped</div>
            {MARKERS.map((m) => (
              <div key={m} className={row} style={{ marginTop: "5px" }}>
                <span className={grow}>{MARKER_LABEL(m)}</span>
                <span className={muted}>{markerCounts.get(m) ?? 0}</span>
              </div>
            ))}
          </div>

          {
            /* Not an error — a half-painted map has plenty of these — but the
              one thing worth watching while stamping. */
          }
          <div>
            <div className={panelHead}>No resource yet — {unstamped.length}</div>
            {unstamped.length === 0 && <div className={muted}>Every province has one.</div>}
            {unstamped.map((id) => (
              <div key={id} className={row} style={{ marginTop: "5px" }}>
                <span className={chip} style={{ background: palette.get(id) }} />
                <span className={grow}>{draft.provinces.get(id)!.name}</span>
              </div>
            ))}
          </div>
        </aside>
      )}

      {tool === "province" && (
        <aside className={panel}>
          <div>
            <div className={panelHead}>Selection — {selection.size} hexes</div>
            <div className={row} style={{ marginTop: "6px" }}>
              <input
                className={grow}
                placeholder="New province name"
                value={newProvince}
                onChange={(event) => setNewProvince(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") makeProvince()
                }}
              />
              <button
                type="button"
                onClick={makeProvince}
                disabled={selection.size === 0 || newProvince.trim() === ""}
              >
                Make
              </button>
            </div>
            <div className={row} style={{ marginTop: "6px" }}>
              <select
                className={grow}
                value={addTarget}
                onChange={(event) => setAddTarget(event.target.value)}
              >
                <option value="">Add to…</option>
                {provinceIds.map((id) => <option key={id} value={id}>{draft.provinces.get(id)!.name}</option>)}
              </select>
              <button
                type="button"
                disabled={selection.size === 0 || addTarget === ""}
                onClick={() => {
                  assign(selection, addTarget)
                  setSelection(new Set())
                }}
              >
                Add
              </button>
            </div>
            <div className={row} style={{ marginTop: "6px" }}>
              <button
                type="button"
                disabled={selection.size === 0}
                onClick={() => {
                  assign(selection, undefined)
                  setSelection(new Set())
                }}
              >
                Ungroup
              </button>
              <button
                type="button"
                disabled={selection.size === 0}
                onClick={() => setSelection(new Set())}
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <div className={panelHead}>Provinces — {provinceIds.length}</div>
            {provinceIds.length === 0 && <div className={muted}>None yet.</div>}
            {provinceIds.map((id) => {
              const province = draft.provinces.get(id)!
              return (
                <div key={id} className={row} style={{ marginTop: "5px" }}>
                  <span className={chip} style={{ background: palette.get(id) }} />
                  <input
                    className={grow}
                    value={province.name}
                    onChange={(event) =>
                      setDraft((d) => ({
                        ...d,
                        provinces: new Map(d.provinces).set(id, {
                          ...province,
                          name: event.target.value
                        })
                      }))}
                  />
                  <select
                    value={province.state ?? ""}
                    onChange={(event) =>
                      setDraft((d) => ({
                        ...d,
                        provinces: new Map(d.provinces).set(
                          id,
                          withState(province, event.target.value === "" ? undefined : event.target.value)
                        )
                      }))}
                  >
                    <option value="">—</option>
                    {[...draft.states.values()].map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <span className={muted}>{counts.get(id) ?? 0}</span>
                  <button type="button" onClick={() => deleteProvince(id)} title="Delete">x</button>
                </div>
              )
            })}
          </div>

          <div>
            <div className={panelHead}>States</div>
            <div className={row} style={{ marginTop: "6px" }}>
              <input
                className={grow}
                placeholder="New state name"
                value={newState}
                onChange={(event) => setNewState(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addState()
                }}
              />
              <button type="button" onClick={addState}>Add</button>
            </div>
            {[...draft.states.values()].map((s) => (
              <div key={s.id} className={row} style={{ marginTop: "5px" }}>
                <span className={grow}>{s.name}</span>
                <button type="button" onClick={() => deleteState(s.id)} title="Delete">x</button>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  )
}

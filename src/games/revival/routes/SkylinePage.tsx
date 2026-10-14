import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react"
import { Desk } from "~/games/revival/city/Desk"
import { Paper } from "~/games/revival/city/Paper"
import * as edits from "~/games/revival/skyline/edit"
import { Inspector } from "~/games/revival/skyline/Inspector"
import savedMap from "~/games/revival/skyline/map.json"
import { PrintTile } from "~/games/revival/skyline/PrintTile"
import { centredGrid, HEADER, shape, type SkylineFile, snapToGrid } from "~/games/revival/skyline/skyline"
import { SkylineMap } from "~/games/revival/skyline/SkylineMap"
import { css } from "~/generated/styled-system/css"

/**
 * Trial alternative to the prefab city (`/revival`): Brass-style skyline
 * neighborhoods joined by explicit links, on a board tiled from Letter
 * sheets. On screen: the whole board, with the cut lines between tiles; drag a
 * neighborhood to move it (red when it touches a cut line or leaves the board),
 * click one to edit its name, columns and links, or add new ones; Save writes
 * `skyline/map.json`. In print: one Letter page per tile, with crop marks.
 */

const IN = 25.4
/** Each tile is a Letter sheet's printable area (¼in margins), landscape. */
const TILE = { width: 10.5 * IN, height: 8 * IN }
const TILES = { cols: 2, rows: 2 }
const BOARD = { width: TILES.cols * TILE.width, height: TILES.rows * TILE.height }
/** The on-screen sheet: the board plus a ¼in rim, as if the tiles were one sheet. */
const SHEET = { width: BOARD.width + IN / 2, height: BOARD.height + IN / 2 }

const SEAMS = {
  xs: Array.from({ length: TILES.cols - 1 }, (_, k) => (k + 1) * TILE.width),
  ys: Array.from({ length: TILES.rows - 1 }, (_, k) => (k + 1) * TILE.height)
}
/** How close a neighborhood may come to a cut line, allowing for a wobbly trim. */
const SEAM_CLEAR = 3

/** Neighborhoods snap so their plots sit in this grid's cells. */
const GRID = centredGrid(BOARD.width, BOARD.height)

/** The saved map, with anything off the grid moved onto it (and so unsaved). */
const SAVED = savedMap as SkylineFile
const INITIAL = edits.snapAll(SAVED, GRID)

/** Undo steps kept. */
const HISTORY = 100

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

const button = css({
  padding: "2px 10px",
  border: "1px solid #999",
  borderRadius: "4px",
  background: "white",
  _disabled: { opacity: 0.35 }
})

const tiles = css({ display: "contents" })

export function SkylinePage() {
  const [file, setFile] = useState(INITIAL)
  const [dirty, setDirty] = useState(INITIAL !== SAVED)
  const [dragging, setDragging] = useState(false)
  const [past, setPast] = useState<SkylineFile[]>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(() => {
    const saved = sessionStorage.getItem(STATUS_KEY)
    if (saved !== null) sessionStorage.removeItem(STATUS_KEY)
    return saved
  })
  const mapRef = useRef<HTMLDivElement>(null)
  const drag = useRef<
    {
      index: number
      startX: number
      startY: number
      fromX: number
      fromY: number
      scale: number
      before: SkylineFile
      moved: boolean
    }
  >(null)

  const selectedIndex = file.neighborhoods.findIndex((n) => n.name === selectedName)
  const selected = file.neighborhoods[selectedIndex]

  function remember(before: SkylineFile) {
    setPast((p) => [...p.slice(1 - HISTORY), before])
  }

  function edit(next: SkylineFile) {
    if (next === file) return
    remember(file)
    setFile(next)
    setDirty(true)
  }

  function undo() {
    const previous = past.at(-1)
    if (previous === undefined) return
    setPast((p) => p.slice(0, -1))
    setFile(previous)
    setDirty(true)
  }

  /** Commits a half-typed rename before the selection moves on. */
  function blurField() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }

  const placed = useMemo(() => file.neighborhoods.map((n) => ({ ...n, shape: shape(n.columns) })), [file])

  const links = useMemo(() => {
    const centre = new Map(placed.map((n) => [n.name, [n.x + n.shape.width / 2, n.y + n.shape.height / 2] as const]))
    return file.links.map(([a, b]) => ({ a, b, from: centre.get(a), to: centre.get(b) }))
  }, [placed, file.links])
  const broken = links.filter((l) => l.from === undefined || l.to === undefined)

  const conflicts = useMemo(() => {
    const out = new Set<number>()
    placed.forEach(({ x, y, shape: { width, height } }, i) => {
      const [x0, y0, x1, y1] = [x, y - HEADER, x + width, y + height]
      const offBoard = x0 < 0 || y0 < 0 || x1 > BOARD.width || y1 > BOARD.height
      const onSeam = SEAMS.xs.some((sx) => sx > x0 - SEAM_CLEAR && sx < x1 + SEAM_CLEAR) ||
        SEAMS.ys.some((sy) => sy > y0 - SEAM_CLEAR && sy < y1 + SEAM_CLEAR)
      if (offBoard || onSeam) out.add(i)
    })
    return out
  }, [placed])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  useEffect(() => {
    if (!dragging) return
    const move = (event: globalThis.PointerEvent) => {
      const d = drag.current
      if (d === null) return
      if (!d.moved) {
        d.moved = true
        remember(d.before)
      }
      setFile((f) => ({
        ...f,
        neighborhoods: f.neighborhoods.map((n, k) =>
          k === d.index
            ? {
              ...n,
              ...snapToGrid(GRID, {
                x: d.fromX + (event.clientX - d.startX) / d.scale,
                y: d.fromY + (event.clientY - d.startY) / d.scale
              })
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

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) return
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        event.preventDefault()
        undo()
      } else if ((event.key === "Delete" || event.key === "Backspace") && selected !== undefined) {
        event.preventDefault()
        edit(edits.remove(file, selected.name))
      } else if (event.key === "Escape") {
        setSelectedName(null)
      }
    }
    window.addEventListener("keydown", key)
    return () => window.removeEventListener("keydown", key)
  })

  function grab(index: number, event: PointerEvent<HTMLDivElement>) {
    const bounds = mapRef.current?.getBoundingClientRect()
    const from = file.neighborhoods[index]
    if (bounds === undefined || from === undefined) return
    event.preventDefault()
    event.stopPropagation()
    blurField()
    if (event.shiftKey && selected !== undefined) {
      edit(edits.toggleLink(file, selected.name, from.name))
      return
    }
    setSelectedName(from.name)
    drag.current = {
      index,
      startX: event.clientX,
      startY: event.clientY,
      fromX: from.x,
      fromY: from.y,
      scale: bounds.width / BOARD.width,
      before: file,
      moved: false
    }
    setDragging(true)
  }

  /** Adds a neighborhood in the middle of the view, clamped to the board. */
  function addNeighborhood() {
    const bounds = mapRef.current?.getBoundingClientRect()
    if (bounds === undefined) return
    const scale = bounds.width / BOARD.width
    const clamp = (v: number, max: number) => Math.min(Math.max(v, 60), max - 60)
    const [next, name] = edits.add(file, GRID, {
      x: clamp((window.innerWidth / 2 - bounds.left) / scale, BOARD.width),
      y: clamp((window.innerHeight / 2 - bounds.top) / scale, BOARD.height)
    })
    edit(next)
    setSelectedName(name)
  }

  function rename(to: string) {
    if (selected === undefined) return undefined
    const error = edits.renameError(file, selected.name, to)
    if (error !== undefined) {
      setStatus(error)
      return error
    }
    edit(edits.rename(file, selected.name, to))
    setSelectedName(to)
    return undefined
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
      pageSize="letter landscape"
      title={`Revival — Skyline (${TILES.cols}×${TILES.rows} Letter tiles)`}
      notes={
        <span className={controls}>
          <button type="button" className={button} onClick={() => void save()}>Save</button>
          <button type="button" className={button} onClick={addNeighborhood}>+ Neighborhood</button>
          <button type="button" className={button} disabled={past.length === 0} onClick={undo}>Undo</button>
          <span>
            {file.neighborhoods.length} neighborhoods · {plots} plots · {file.links.length} links
            {conflicts.size > 0 ? ` · ${conflicts.size} on a cut line or off the board` : ""}
            {broken.length > 0 ? ` · unknown link ends: ${broken.map((l) => `${l.a}–${l.b}`).join(", ")}` : ""}
            {dirty ? " · unsaved" : ""}
            {status === null ? "" : ` · ${status}`}
          </span>
        </span>
      }
    >
      <div className="screen-only">
        <Paper
          {...SHEET}
          areaWidth={BOARD.width}
          areaHeight={BOARD.height}
          title={`${TILES.cols}×${TILES.rows} Letter tiles · board ${BOARD.width / IN}×${BOARD.height / IN}in`}
        >
          <div
            ref={mapRef}
            onPointerDown={() => {
              blurField()
              setSelectedName(null)
            }}
          >
            <SkylineMap
              {...BOARD}
              placed={placed}
              links={links}
              conflicts={conflicts}
              {...(selected === undefined ? {} : { selected: selectedIndex })}
              seams={SEAMS}
              grid={GRID}
              onGrab={grab}
            />
          </div>
        </Paper>
      </div>
      <Inspector
        file={file}
        selected={selected}
        onRename={rename}
        onColumns={(columns, shift) => {
          if (selected !== undefined) edit(edits.reshape(file, selected.name, columns, shift))
        }}
        onToggleLink={(other) => {
          if (selected !== undefined) edit(edits.toggleLink(file, selected.name, other))
        }}
        onRemove={() => {
          if (selected !== undefined) edit(edits.remove(file, selected.name))
        }}
      />
      <div className={`${tiles} print-only`}>
        {Array.from({ length: TILES.rows }, (_, row) =>
          Array.from({ length: TILES.cols }, (_, col) => (
            <PrintTile
              key={`${row},${col}`}
              col={col}
              row={row}
              {...TILES}
              {...TILE}
              map={{ ...BOARD, placed, links }}
            />
          )))}
      </div>
    </Desk>
  )
}

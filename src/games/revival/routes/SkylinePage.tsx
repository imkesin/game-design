import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react"
import { Desk } from "~/games/revival/skyline/Desk"
import * as edits from "~/games/revival/skyline/edit"
import { Inspector } from "~/games/revival/skyline/Inspector"
import savedMap from "~/games/revival/skyline/map.json"
import { Paper } from "~/games/revival/skyline/Paper"
import { PrintTile } from "~/games/revival/skyline/PrintTile"
import { centredGrid, HEADER, shape, type SkylineFile, snapToGrid } from "~/games/revival/skyline/skyline"
import { SkylineMap } from "~/games/revival/skyline/SkylineMap"
import * as territory from "~/games/revival/skyline/territory"
import * as water from "~/games/revival/skyline/water"
import { css, cx } from "~/generated/styled-system/css"

/**
 * The city map: Brass-style skyline neighborhoods, each in a territory of
 * grid cells, streets between them and bridges over the water, on a board
 * tiled from Letter sheets. On screen: the whole board, with the cut lines
 * between tiles; drag a neighborhood to move it (red when it touches a cut
 * line, leaves the board, stands in water or crowds another), click one to
 * edit its name and columns, or add new ones. Water, Bridge and Ground modes
 * paint grid cells; Grow fills unheld land from the territories. Save writes
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

/** Water, bridges and territories are painted on these cells. */
const CELLS = water.cells(GRID, BOARD.width, BOARD.height)

/**
 * The saved map, with anything off the grid moved onto it, water fitted to the
 * board and anything old dropped (and so unsaved).
 */
const SAVED = savedMap as Partial<SkylineFile> & Pick<SkylineFile, "neighborhoods">
const LOADED: SkylineFile = { neighborhoods: SAVED.neighborhoods, water: water.fit(SAVED.water, CELLS) }
const INITIAL = edits.snapAll(LOADED, GRID)
const CHANGED_ON_LOAD = INITIAL !== LOADED || JSON.stringify(LOADED) !== JSON.stringify(SAVED)

type Tool = "move" | "water" | "bridge" | "ground"

const TOOLS: { tool: Tool; label: string; key?: string; title: string }[] = [
  { tool: "move", label: "Move", title: "Select and drag neighborhoods (Esc)" },
  { tool: "water", label: "Water", key: "w", title: "Paint water; starting on water paints land (W)" },
  { tool: "bridge", label: "Bridge", key: "b", title: "Paint bridges on water; starting on a bridge clears it (B)" },
  {
    tool: "ground",
    label: "Ground",
    key: "g",
    title: "Grow the territory the stroke starts in; starting on unheld land clears ground (G)"
  }
]

/** Screen-only territory tints: a distinct light hue per neighborhood, by its place in the list. */
const tintOf = (index: number) => `hsla(${(index * 137.508) % 360}, 75%, 62%, 0.35)`

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

const pressed = css({ background: "#dbeafe", borderColor: "#2563eb" })

const toolbar = css({ display: "grid", gridAutoFlow: "column", gap: "4px" })

const tiles = css({ display: "contents" })

/** The map with the brush laid over it. */
const stack = css({ display: "grid", gridTemplateAreas: `"map"`, "& > *": { gridArea: "map" } })

const brush = css({ cursor: "crosshair", touchAction: "none" })

export function SkylinePage() {
  const [file, setFile] = useState(INITIAL)
  const [dirty, setDirty] = useState(CHANGED_ON_LOAD)
  const [dragging, setDragging] = useState(false)
  const [tool, setTool] = useState<Tool>("move")
  const [stroking, setStroking] = useState(false)
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
  /** The brush: what a stroke does to the cells it crosses, and the last cell it reached. */
  const stroke = useRef<{ apply: (f: SkylineFile, run: water.Cell[]) => SkylineFile; last: water.Cell }>(null)

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

  const coast = useMemo(() => water.coastline(file.water, CELLS), [file.water])
  const held = useMemo(() => territory.holdings(file, CELLS), [file])
  const streets = useMemo(() => territory.streets(file.water, CELLS, held), [file.water, held])
  const { bridges, stray } = useMemo(() => water.bridges(file.water), [file.water])
  const names = useMemo(() => file.neighborhoods.map((n) => n.name), [file.neighborhoods])
  const neighbors = useMemo(() => territory.adjacency(names, held, bridges), [names, held, bridges])
  const scattered = useMemo(() => territory.scattered(held), [held])
  const pairs = [...neighbors.values()].reduce((sum, set) => sum + set.size, 0) / 2
  const isolated = names.filter((name) => neighbors.get(name)?.size === 0)
  const unheld = file.water.reduce(
    (sum, row, r) =>
      sum + [...row].filter((_, c) => water.isLand(file.water, [c, r]) && !held.has(water.key([c, r]))).length,
    0
  )

  const tint = useMemo(() => {
    const index = new Map(names.map((name, i) => [name, i]))
    return [...held].map(([k, owner]) => {
      const [c, r] = k.split(",").map(Number)
      return { cell: [c!, r!] as const, color: tintOf(index.get(owner) ?? 0) }
    })
  }, [held, names])

  const conflicts = useMemo(() => {
    const crowded = territory.crowded(file, CELLS)
    const out = new Set<number>()
    placed.forEach(({ name, x, y, columns, shape: { width, height } }, i) => {
      const [x0, y0, x1, y1] = [x, y - HEADER, x + width, y + height]
      const offBoard = x0 < 0 || y0 < 0 || x1 > BOARD.width || y1 > BOARD.height
      const onSeam = SEAMS.xs.some((sx) => sx > x0 - SEAM_CLEAR && sx < x1 + SEAM_CLEAR) ||
        SEAMS.ys.some((sy) => sy > y0 - SEAM_CLEAR && sy < y1 + SEAM_CLEAR)
      const inWater = territory.occupied(CELLS, { x, y, columns }).some((cell) => water.isWater(file.water, cell))
      if (offBoard || onSeam || inWater || crowded.has(name)) out.add(i)
    })
    return out
  }, [placed, file])

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
    if (!stroking) return
    const move = (event: globalThis.PointerEvent) => {
      const s = stroke.current
      const at = cellUnder(event.clientX, event.clientY)
      if (s === null || at === undefined || (at[0] === s.last[0] && at[1] === s.last[1])) return
      const run = water.between(s.last, at)
      s.last = at
      setFile((f) => s.apply(f, run))
    }
    const drop = () => {
      stroke.current = null
      setStroking(false)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", drop)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", drop)
    }
  }, [stroking])

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
        setTool("move")
      } else if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        const picked = TOOLS.find((t) => t.key === event.key)?.tool
        if (picked !== undefined) setTool((current) => (current === picked ? "move" : picked))
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

  /** The grid cell under a point on screen, if it's on the board. */
  function cellUnder(clientX: number, clientY: number) {
    const bounds = mapRef.current?.getBoundingClientRect()
    if (bounds === undefined) return undefined
    const scale = bounds.width / BOARD.width
    const [x, y] = [(clientX - bounds.left) / scale, (clientY - bounds.top) / scale]
    return x < 0 || y < 0 || x > BOARD.width || y > BOARD.height ? undefined : water.cellAt(CELLS, x, y)
  }

  /** What a stroke starting on `at` does with the current tool, if anything. */
  function brushFor(at: water.Cell): ((f: SkylineFile, run: water.Cell[]) => SkylineFile) | undefined {
    const repaint = (f: SkylineFile, next: string[]) => (next === f.water ? f : { ...f, water: next })
    const here = water.terrain(file.water, at)
    switch (tool) {
      case "water": {
        const mark = here === water.LAND ? water.WATER : water.LAND
        return (f, run) => repaint(f, water.paint(f.water, run, mark))
      }
      case "bridge": {
        if (here === water.LAND) return undefined
        const [from, to] = here === water.BRIDGE ? [water.BRIDGE, water.WATER] : [water.WATER, water.BRIDGE]
        return (f, run) => repaint(f, water.paint(f.water, run, to, (current) => current === from))
      }
      case "ground": {
        if (here !== water.LAND) return undefined
        const owner = held.get(water.key(at))
        return (f, run) => territory.paintGround(f, CELLS, run, owner)
      }
      case "move":
        return undefined
    }
  }

  function startStroke(event: PointerEvent<HTMLDivElement>) {
    const at = cellUnder(event.clientX, event.clientY)
    const apply = at === undefined ? undefined : brushFor(at)
    if (at === undefined || apply === undefined) return
    event.preventDefault()
    event.stopPropagation()
    blurField()
    stroke.current = { apply, last: at }
    edit(apply(file, [at]))
    setStroking(true)
  }

  function growTerritories() {
    const next = territory.grow(file, CELLS)
    if (next === file) setStatus("Nothing to grow: every reachable cell is held.")
    edit(next)
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
          <span className={toolbar}>
            {TOOLS.map((t) => (
              <button
                key={t.tool}
                type="button"
                className={cx(button, tool === t.tool && pressed)}
                aria-pressed={tool === t.tool}
                title={t.title}
                onClick={() => setTool(t.tool)}
              >
                {t.label}
              </button>
            ))}
          </span>
          <button
            type="button"
            className={button}
            title="Fill unheld land from the territories"
            onClick={growTerritories}
          >
            Grow
          </button>
          <button type="button" className={button} disabled={past.length === 0} onClick={undo}>Undo</button>
          <span>
            {[
              `${file.neighborhoods.length} neighborhoods · ${plots} plots · ${pairs} neighbor pairs`,
              `${bridges.length} bridges · ${unheld} unheld cells`,
              conflicts.size > 0 ? `${conflicts.size} misplaced` : "",
              isolated.length > 0 ? `no neighbors: ${isolated.join(", ")}` : "",
              scattered.size > 0 ? `in pieces: ${[...scattered].join(", ")}` : "",
              stray.length > 0 ? `${stray.length} stray bridge cells` : "",
              dirty ? "unsaved" : "",
              status ?? ""
            ].filter((part) => part !== "").join(" · ")}
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
            className={stack}
            onPointerDown={() => {
              blurField()
              setSelectedName(null)
            }}
          >
            <SkylineMap
              {...BOARD}
              placed={placed}
              cells={CELLS}
              streets={streets}
              coast={coast}
              bridges={bridges}
              {...(tool === "ground" ? { tint } : {})}
              stray={stray}
              conflicts={conflicts}
              {...(selected === undefined ? {} : { selected: selectedIndex })}
              seams={SEAMS}
              grid={GRID}
              onGrab={grab}
            />
            {tool !== "move" && <div className={brush} onPointerDown={startStroke} />}
          </div>
        </Paper>
      </div>
      <Inspector
        file={file}
        selected={selected}
        neighbors={selected === undefined ? [] : [...(neighbors.get(selected.name) ?? [])].sort()}
        onRename={rename}
        onColumns={(columns, shift) => {
          if (selected !== undefined) edit(edits.reshape(file, selected.name, columns, shift))
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
              map={{ ...BOARD, cells: CELLS, placed, streets, coast, bridges }}
            />
          )))}
      </div>
    </Desk>
  )
}

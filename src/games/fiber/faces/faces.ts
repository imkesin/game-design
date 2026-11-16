import { NODES, OFF_LIMITS, padOf, RAYS } from "~/games/fiber/faces/map"
import type { SolvedMap, Vec } from "~/games/fiber/map/layout"
import { CONTENT_MARGIN, SHEET } from "~/games/fiber/map/map"

/**
 * Regions as the faces of the drawn network: towns, links, exit lines run on to the sheet edge, and
 * the bleed edge form a planar graph; every area it encloses is a region. The face outside is dropped.
 */

/** Edge regions run out through the bleed, so the print has no white rim. */
const BOX = {
  x0: -SHEET.bleed,
  y0: -SHEET.bleed,
  x1: SHEET.width + SHEET.bleed,
  y1: SHEET.height + SHEET.bleed
}

export type Face = {
  /** Stable across rerolls: the towns (and exits) around it, plus `|edge` if the sheet edge closes it. */
  key: string
  points: Vec[]
  touchesEdge: boolean
  offLimits: boolean
  /** Tint level by map coloring among playable faces; off-limits faces have none. */
  level?: number
  /**
   * A point to hang its label on: the centre of the largest circle inside the region and the content
   * box, clear of town pads and tabs. `room` is that circle's radius.
   */
  centre: Vec
  room: number
}

type Half = { from: string; to: string; pts: Vec[]; border: boolean; twin: number; angle: number }

const BORDER = "border-"

/** Where a ray from `p` along `h` leaves BOX, and its distance round the perimeter (clockwise from top-left). */
function hitSheet(p: Vec, h: Vec) {
  const ts = [
    h.x > 0 ? (BOX.x1 - p.x) / h.x : h.x < 0 ? (BOX.x0 - p.x) / h.x : Infinity,
    h.y > 0 ? (BOX.y1 - p.y) / h.y : h.y < 0 ? (BOX.y0 - p.y) / h.y : Infinity
  ]
  const t = Math.min(...ts)
  const at = {
    x: Math.min(BOX.x1, Math.max(BOX.x0, p.x + h.x * t)),
    y: Math.min(BOX.y1, Math.max(BOX.y0, p.y + h.y * t))
  }
  return { at, around: perimeterAt(at) }
}

function perimeterAt(p: Vec) {
  const w = BOX.x1 - BOX.x0, h = BOX.y1 - BOX.y0
  const x = p.x - BOX.x0, y = p.y - BOX.y0
  if (y <= 1e-6) return x
  if (x >= w - 1e-6) return w + y
  if (y >= h - 1e-6) return w + h + (w - x)
  return 2 * w + h + (h - y)
}

function area(pts: Vec[]) {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!, b = pts[(i + 1) % pts.length]!
    s += a.x * b.y - b.x * a.y
  }
  return s / 2
}

function insidePoly(p: Vec, pts: Vec[]) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]!, b = pts[j]!
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

function segDist(p: Vec, a: Vec, b: Vec) {
  const dx = b.x - a.x, dy = b.y - a.y
  const l = dx * dx + dy * dy
  const t = l ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l)) : 0
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy)
}

type Rect = { x0: number; y0: number; x1: number; y1: number }

/** Distance from `p` outside a rectangle, negative inside. */
function rectDist(p: Vec, r: Rect) {
  const dx = Math.max(r.x0 - p.x, p.x - r.x1)
  const dy = Math.max(r.y0 - p.y, p.y - r.y1)
  return dx > 0 || dy > 0 ? Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) : Math.max(dx, dy)
}

const CONTENT: Rect = {
  x0: CONTENT_MARGIN,
  y0: CONTENT_MARGIN,
  x1: SHEET.width - CONTENT_MARGIN,
  y1: SHEET.height - CONTENT_MARGIN
}

/** Largest clear circle: coarse grid, then finer grids round the best point so far. */
function labelSpot(pts: Vec[], obstacles: Rect[]) {
  const box: Rect = {
    x0: Math.max(CONTENT.x0, Math.min(...pts.map((p) => p.x))),
    y0: Math.max(CONTENT.y0, Math.min(...pts.map((p) => p.y))),
    x1: Math.min(CONTENT.x1, Math.max(...pts.map((p) => p.x))),
    y1: Math.min(CONTENT.y1, Math.max(...pts.map((p) => p.y)))
  }
  const near = obstacles.filter((r) =>
    r.x1 > box.x0 - 20 && r.x0 < box.x1 + 20 && r.y1 > box.y0 - 20 && r.y0 < box.y1 + 20
  )
  const clearance = (p: Vec) => {
    if (!insidePoly(p, pts)) return -Infinity
    let d = -rectDist(p, CONTENT)
    for (let i = 0; i < pts.length && d > 0; i++) d = Math.min(d, segDist(p, pts[i]!, pts[(i + 1) % pts.length]!))
    for (const r of near) d = Math.min(d, rectDist(p, r))
    return d
  }
  let best = { p: { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2 }, d: -Infinity }
  let step = 4
  let area = box
  for (let pass = 0; pass < 4; pass++) {
    for (let x = area.x0; x <= area.x1; x += step) {
      for (let y = area.y0; y <= area.y1; y += step) {
        const d = clearance({ x, y })
        if (d > best.d) best = { p: { x, y }, d }
      }
    }
    area = { x0: best.p.x - step, y0: best.p.y - step, x1: best.p.x + step, y1: best.p.y + step }
    step /= 4
  }
  return { centre: best.p, room: best.d }
}

export function findFaces(map: SolvedMap): Face[] {
  const pos = new Map<string, Vec>()
  for (const n of NODES) pos.set(n.id, padOf(n, map.nodes[n.id]!).centre)
  for (const r of RAYS) pos.set(r.node, map.nodes[r.node]!)

  const halves: Half[] = []
  const addEdge = (a: string, b: string, inner: Vec[], border = false) => {
    const pts = [pos.get(a)!, ...inner, pos.get(b)!]
    const angleAt = (p: Vec, q: Vec) => Math.atan2(q.y - p.y, q.x - p.x)
    const i = halves.length
    halves.push({ from: a, to: b, pts, border, twin: i + 1, angle: angleAt(pts[0]!, pts[1]!) })
    const rev = [...pts].reverse()
    halves.push({ from: b, to: a, pts: rev, border, twin: i, angle: angleAt(rev[0]!, rev[1]!) })
  }

  for (const e of map.edges) addEdge(e.a, e.b, e.points)

  // Exit and barrier lines carry on to the sheet edge; those points and the corners split the edge into border edges.
  const rim: { id: string; around: number }[] = []
  for (const r of RAYS) {
    const id = `${BORDER}${r.node}`
    const { at, around } = hitSheet(pos.get(r.node)!, r.heading)
    pos.set(id, at)
    rim.push({ id, around })
    addEdge(r.node, id, [])
  }
  const corners = [
    { x: BOX.x0, y: BOX.y0 },
    { x: BOX.x1, y: BOX.y0 },
    { x: BOX.x1, y: BOX.y1 },
    { x: BOX.x0, y: BOX.y1 }
  ]
  corners.forEach((c, k) => {
    const id = `${BORDER}corner${k}`
    pos.set(id, c)
    rim.push({ id, around: perimeterAt(c) })
  })
  rim.sort((a, b) => a.around - b.around)
  rim.forEach((r, k) => addEdge(r.id, rim[(k + 1) % rim.length]!.id, [], true))

  const out = new Map<string, number[]>()
  halves.forEach((h, i) => out.set(h.from, [...(out.get(h.from) ?? []), i]))
  for (const list of out.values()) list.sort((a, b) => halves[a]!.angle - halves[b]!.angle)

  // Next half-edge round a face: at the far vertex, the outgoing edge just after the way back.
  const next = (i: number) => {
    const h = halves[i]!
    const list = out.get(h.to)!
    const k = list.indexOf(h.twin)
    return list[(k + 1) % list.length]!
  }

  const seen = new Set<number>()
  const raw: { halves: number[]; pts: Vec[]; area: number }[] = []
  for (let start = 0; start < halves.length; start++) {
    if (seen.has(start)) continue
    const cycle: number[] = []
    for (let i = start; !seen.has(i); i = next(i)) {
      seen.add(i)
      cycle.push(i)
    }
    const pts = cycle.flatMap((i) => halves[i]!.pts.slice(0, -1))
    raw.push({ halves: cycle, pts, area: area(pts) })
  }

  // The face outside the sheet runs the other way round from every real face, and is the largest.
  const sign = Math.sign(raw.reduce((s, f) => s + Math.sign(f.area), 0)) || 1
  const outer = raw.reduce(
    (o, f, i) => (Math.sign(f.area) !== sign && Math.abs(f.area) > Math.abs(raw[o]!.area) ? i : o),
    0
  )
  const real = raw.filter((_, i) => i !== outer)

  const obstacles: Rect[] = NODES.flatMap((n) => {
    const pad = padOf(n, map.nodes[n.id]!)
    return [
      { x0: pad.left, y0: pad.top, x1: pad.left + pad.size, y1: pad.top + pad.size },
      { x0: pad.tab.x, y0: pad.tab.y, x1: pad.tab.x + pad.tab.width, y1: pad.tab.y + pad.tab.height }
    ]
  })
  const keys = new Map<string, number>()
  const faces: Face[] = real.map((f) => {
    const around = [...new Set(f.halves.map((i) => halves[i]!.from).filter((id) => !id.startsWith(BORDER)))].sort()
    const touchesEdge = f.halves.some((i) => halves[i]!.border || halves[i]!.to.startsWith(BORDER))
    let key = around.join("+") + (touchesEdge ? "|edge" : "")
    const dup = keys.get(key) ?? 0
    keys.set(key, dup + 1)
    if (dup) key += `#${dup}`
    const { centre, room } = labelSpot(f.pts, obstacles)
    return { key, points: f.pts, touchesEdge, offLimits: OFF_LIMITS.includes(key), centre, room }
  })

  // Map coloring: faces sharing a link (not the sheet edge) are neighbours.
  const faceOf = new Map<number, number>()
  real.forEach((f, k) => f.halves.forEach((i) => faceOf.set(i, k)))
  const neighbours = faces.map(() => new Set<number>())
  real.forEach((f, k) =>
    f.halves.forEach((i) => {
      const other = faceOf.get(halves[i]!.twin)
      if (other !== undefined && other !== k && !halves[i]!.border) neighbours[k]!.add(other)
    })
  )
  const order = faces.map((_, k) => k).sort((a, b) => neighbours[b]!.size - neighbours[a]!.size)
  for (const k of order) {
    if (faces[k]!.offLimits) continue
    const taken = new Set([...neighbours[k]!].map((n) => faces[n]!.level))
    let level = 0
    while (taken.has(level)) level++
    faces[k]!.level = level
  }
  return faces
}

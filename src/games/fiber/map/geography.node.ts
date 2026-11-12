import { readFileSync, writeFileSync } from "node:fs"
import { parseArgs } from "node:util"

/**
 * Builds `geography.ts` (I-35, I-10 and rivers as smoothed lat/lon polylines) from OpenStreetMap:
 * `npx tsx src/games/fiber/map/geography.node.ts [--input overpass.json]`. Without `--input` it asks
 * the Overpass API. Data © OpenStreetMap contributors, ODbL: the board must credit it.
 */

/** Generously past the sheet on every side, so every line runs off the trim. */
const BBOX = "28.90,-99.30,31.10,-96.70"
const QUERY = `[out:json][timeout:90];
(
  way["highway"="motorway"]["ref"~"(^|;)I (35|10)(;|$)"](${BBOX});
  way["waterway"="river"]["name"~"^(Colorado|San Marcos|Guadalupe|Blanco|San Antonio) River$"](${BBOX});
);
out geom;`

/** I-35's towns, north to south, plus a point past each end: the axis its points are binned along. */
const I35_GUIDE: LatLon[] = [
  [30.75, -97.67],
  [30.633, -97.677],
  [30.508, -97.679],
  [30.267, -97.743],
  [30.085, -97.841],
  [29.989, -97.877],
  [29.883, -97.941],
  [29.703, -98.124],
  [29.552, -98.27],
  [29.424, -98.494],
  [29.3, -98.6]
]

/** I-10's towns, west to east, plus a point past each end. */
const I10_GUIDE: LatLon[] = [
  [29.95, -98.9],
  [29.795, -98.732],
  [29.67, -98.64],
  [29.43, -98.49],
  [29.45, -98.3],
  [29.56, -97.96],
  [29.665, -97.65],
  [29.69, -97.3],
  [29.69, -96.9]
]

/** Gaussian smoothing width (km) and simplify tolerance (km). Board scale is ~3mm/km. */
const SMOOTH = { i35: 0.8, river: 1.2 }
const SIMPLIFY = 0.08
/** River pieces whose ends are this close (km) are joined across a gap, e.g. through a lake. */
const BRIDGE = 12

type LatLon = [number, number]
type Km = { x: number; y: number }
type Way = { tags: Record<string, string>; geometry: { lat: number; lon: number }[] }

const KM_PER_LAT = 111.3
const KM_PER_LON = 111.3 * Math.cos((30 * Math.PI) / 180)
const toKm = ([lat, lon]: LatLon): Km => ({ x: lon * KM_PER_LON, y: lat * KM_PER_LAT })
const toLatLon = (p: Km): LatLon => [p.y / KM_PER_LAT, p.x / KM_PER_LON]
const dist = (a: Km, b: Km) => Math.hypot(a.x - b.x, a.y - b.y)

/** Arc-length position of `p` along a polyline; the end segments extend past their ends. */
function along(p: Km, line: Km[]) {
  let best = { d: Infinity, t: 0 }
  let start = 0
  for (let i = 0; i + 1 < line.length; i++) {
    const a = line[i]!, b = line[i + 1]!
    const l = dist(a, b)
    let u = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (l * l)
    if (i > 0) u = Math.max(0, u)
    if (i + 2 < line.length) u = Math.min(1, u)
    const d = dist(p, { x: a.x + u * (b.x - a.x), y: a.y + u * (b.y - a.y) })
    if (d < best.d) best = { d, t: start + u * l }
    start += l
  }
  return best.t
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]!
}

/** A highway as one centreline: points binned every km along a guide, both carriageways merged. */
function centreline(ways: Way[], guide: LatLon[]): Km[] {
  const axis = guide.map(toKm)
  const bins = new Map<number, Km[]>()
  for (const w of ways) {
    for (const g of w.geometry) {
      const p = toKm([g.lat, g.lon])
      const k = Math.round(along(p, axis))
      bins.set(k, [...(bins.get(k) ?? []), p])
    }
  }
  return [...bins.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, ps]) => ({ x: median(ps.map((p) => p.x)), y: median(ps.map((p) => p.y)) }))
}

/**
 * A river's main stem: the longest path through all its ways, with short hops added between loose
 * ends of separate pieces (OSM breaks some rivers at reservoirs).
 */
function mainStem(ways: Way[]): Km[] {
  const key = (g: { lat: number; lon: number }) => `${g.lat.toFixed(7)},${g.lon.toFixed(7)}`
  const pts = new Map<string, Km>()
  const adj = new Map<string, Map<string, number>>()
  const link = (a: string, b: string, w: number) => {
    if (!adj.has(a)) adj.set(a, new Map())
    if (!adj.has(b)) adj.set(b, new Map())
    adj.get(a)!.set(b, w)
    adj.get(b)!.set(a, w)
  }
  for (const w of ways) {
    for (let i = 0; i < w.geometry.length; i++) {
      const g = w.geometry[i]!
      pts.set(key(g), toKm([g.lat, g.lon]))
      if (i > 0) {
        const prev = key(w.geometry[i - 1]!)
        link(prev, key(g), dist(pts.get(prev)!, pts.get(key(g))!))
      }
    }
  }

  const component = new Map<string, number>()
  let c = 0
  for (const start of adj.keys()) {
    if (component.has(start)) continue
    const stack = [start]
    component.set(start, c)
    while (stack.length) {
      for (const n of adj.get(stack.pop()!)!.keys()) {
        if (!component.has(n)) {
          component.set(n, c)
          stack.push(n)
        }
      }
    }
    c++
  }
  const ends = [...adj.keys()].filter((k) => adj.get(k)!.size === 1)
  for (const a of ends) {
    for (const b of ends) {
      if (a < b && component.get(a) !== component.get(b)) {
        const d = dist(pts.get(a)!, pts.get(b)!)
        if (d < BRIDGE) link(a, b, d)
      }
    }
  }

  const farthest = (from: string) => {
    const d = new Map([[from, 0]])
    const prev = new Map<string, string>()
    const open = new Set([from])
    while (open.size) {
      let u = ""
      for (const k of open) if (u === "" || d.get(k)! < d.get(u)!) u = k
      open.delete(u)
      for (const [v, w] of adj.get(u)!) {
        if (d.get(u)! + w < (d.get(v) ?? Infinity)) {
          d.set(v, d.get(u)! + w)
          prev.set(v, u)
          open.add(v)
        }
      }
    }
    let end = from
    for (const [k, v] of d) if (v > d.get(end)!) end = k
    const path = [end]
    while (prev.has(path[path.length - 1]!)) path.push(prev.get(path[path.length - 1]!)!)
    return { end, path, length: d.get(end)! }
  }
  // Two sweeps from each component's points find each piece's diameter; the longest wins.
  let best = { path: [] as string[], length: -1 }
  for (let k = 0; k < c; k++) {
    const seed = [...component.entries()].find(([, v]) => v === k)![0]
    const far = farthest(farthest(seed).end)
    if (far.length > best.length) best = far
  }
  return best.path.map((k) => pts.get(k)!)
}

function resample(line: Km[], step: number): Km[] {
  const out = [line[0]!]
  let carry = 0
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!, b = line[i]!
    const l = dist(a, b)
    let t = step - carry
    while (t <= l) {
      out.push({ x: a.x + ((b.x - a.x) * t) / l, y: a.y + ((b.y - a.y) * t) / l })
      t += step
    }
    carry = l - (t - step)
  }
  out.push(line[line.length - 1]!)
  return out
}

/** Gaussian blur along the line (σ in km); ends stay put. */
function smooth(line: Km[], sigma: number, step: number): Km[] {
  const r = Math.ceil((3 * sigma) / step)
  const w = Array.from({ length: 2 * r + 1 }, (_, i) => Math.exp(-(((i - r) * step) ** 2) / (2 * sigma * sigma)))
  return line.map((p, i) => {
    if (i === 0 || i === line.length - 1) return p
    let sx = 0, sy = 0, sw = 0
    for (let j = -r; j <= r; j++) {
      const q = line[Math.max(0, Math.min(line.length - 1, i + j))]!
      sx += q.x * w[j + r]!
      sy += q.y * w[j + r]!
      sw += w[j + r]!
    }
    return { x: sx / sw, y: sy / sw }
  })
}

function simplify(line: Km[], tol: number): Km[] {
  if (line.length < 3) return line
  const a = line[0]!, b = line[line.length - 1]!
  let worst = { d: 0, i: 0 }
  for (let i = 1; i < line.length - 1; i++) {
    const p = line[i]!
    const l = dist(a, b) || 1e-9
    const d = Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / l
    if (d > worst.d) worst = { d, i }
  }
  if (worst.d <= tol) return [a, b]
  return [...simplify(line.slice(0, worst.i + 1), tol).slice(0, -1), ...simplify(line.slice(worst.i), tol)]
}

function finish(line: Km[], sigma: number): LatLon[] {
  const step = 0.25
  return simplify(smooth(resample(line, step), sigma, step), SIMPLIFY)
    .map(toLatLon)
    .map(([lat, lon]) => [Number(lat.toFixed(4)), Number(lon.toFixed(4))])
}

async function load(input: string | undefined): Promise<Way[]> {
  if (input) return JSON.parse(readFileSync(input, "utf8")).elements
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "fiber-board-prototype/0.1" },
    body: new URLSearchParams({ data: QUERY })
  })
  if (!res.ok) throw new Error(`Overpass: ${res.status} ${await res.text()}`)
  return ((await res.json()) as { elements: Way[] }).elements
}

const { values } = parseArgs({ options: { input: { type: "string" } } })
const ways = await load(values.input)

const highway = (ref: string) =>
  ways.filter((w) => w.tags.highway === "motorway" && new RegExp(`(^|;)I ${ref}(;|$)`).test(w.tags.ref ?? ""))
const i35 = finish(centreline(highway("35"), I35_GUIDE), SMOOTH.i35)
const i10 = finish(centreline(highway("10"), I10_GUIDE), SMOOTH.i35)

const rivers = ["Colorado", "San Marcos", "Guadalupe", "Blanco", "San Antonio"].map((name) => {
  const mine = ways.filter((w) => w.tags.waterway === "river" && w.tags.name === `${name} River`)
  return { name: `${name} River`, points: finish(mainStem(mine), SMOOTH.river) }
})

const out = `// Generated by geography.node.ts from OpenStreetMap (© OpenStreetMap contributors, ODbL). Do not edit.

export type LatLon = readonly [lat: number, lon: number]

export const I35: readonly LatLon[] = ${JSON.stringify(i35)}

export const I10: readonly LatLon[] = ${JSON.stringify(i10)}

export const RIVERS: readonly { name: string; points: readonly LatLon[] }[] = ${JSON.stringify(rivers)}
`
writeFileSync(new URL("./geography.ts", import.meta.url), out)
console.log(
  `I-35: ${i35.length} points; I-10: ${i10.length}; ${rivers.map((r) => `${r.name}: ${r.points.length}`).join(", ")}`
)

import type { SolvedMap } from "./layout"
import { NODES, padOf, type RegionId, REGIONS, SHEET } from "./map"
import type { RegionShapes } from "./regions"

/**
 * Region names: one faint word per region, at the open spot inside it furthest from pads, links,
 * borders and the sheet edge. A distance field on a coarse grid makes each candidate a lookup.
 */

export const REGION_LABEL = { size: 6, spacing: 1.4 }

/** Field resolution (mm). Clearances are approximate to about this. */
const GRID = 2
/** Least clearance for a label to be placed at all. */
const MIN_CLEAR = 3
/** A link's own width beyond its centre line (half the 7mm stick border). */
const LINK_HALF = 3.5

export type RegionLabel = { region: RegionId; text: string; x: number; y: number; clear: number }

type Rect = { x: number; y: number; width: number; height: number }

function rectDist(px: number, py: number, r: Rect) {
  const dx = Math.max(r.x - px, 0, px - (r.x + r.width))
  const dy = Math.max(r.y - py, 0, py - (r.y + r.height))
  return Math.hypot(dx, dy)
}

function segDist(px: number, py: number, [a, b]: [readonly [number, number], readonly [number, number]]) {
  const [ax, ay] = a
  const [bx, by] = b
  const l2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1
  const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2))
  return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)))
}

export function labelSize(text: string) {
  return {
    width: text.length * REGION_LABEL.size * 0.72 + (text.length - 1) * REGION_LABEL.spacing,
    height: REGION_LABEL.size * 0.75
  }
}

export function regionLabels(map: SolvedMap, regions: RegionShapes): RegionLabel[] {
  const rects: Rect[] = NODES.flatMap((node) => {
    const pad = padOf(node, map.nodes[node.id]!)
    return [{ x: pad.left, y: pad.top, width: pad.width, height: pad.height }, pad.tab]
  })
  const linkPoints = map.edges.flatMap((e) => e.points)

  const cols = Math.ceil(SHEET.width / GRID) + 1
  const rows = Math.ceil(SHEET.height / GRID) + 1
  const field = new Float32Array(cols * rows)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * GRID, y = j * GRID
      let d = Math.min(x, y, SHEET.width - x, SHEET.height - y)
      for (const r of rects) d = Math.min(d, rectDist(x, y, r))
      for (const p of linkPoints) d = Math.min(d, Math.hypot(p.x - x, p.y - y) - LINK_HALF)
      for (const s of regions.borderSegments) d = Math.min(d, segDist(x, y, s))
      field[j * cols + i] = d
    }
  }
  const at = (x: number, y: number) => {
    const i = Math.round(x / GRID), j = Math.round(y / GRID)
    return i < 0 || j < 0 || i >= cols || j >= rows ? -Infinity : field[j * cols + i]!
  }

  return (Object.keys(REGIONS) as RegionId[]).flatMap((region) => {
    const text = REGIONS[region].name.toUpperCase()
    const { width, height } = labelSize(text)
    // Sample the label's outline; its clearance is the worst sample, and all must be in-region.
    const offsets: [number, number][] = []
    for (let x = -width / 2; x <= width / 2 + 0.01; x += GRID) offsets.push([x, -height / 2], [x, height / 2])
    offsets.push([-width / 2, 0], [width / 2, 0], [0, 0])

    let best: RegionLabel | null = null
    for (let cy = height / 2; cy <= SHEET.height - height / 2; cy += GRID) {
      for (let cx = width / 2; cx <= SHEET.width - width / 2; cx += GRID) {
        let clear = Infinity
        for (const [ox, oy] of offsets) {
          if (regions.regionAt(cx + ox, cy + oy) !== region) {
            clear = -Infinity
            break
          }
          clear = Math.min(clear, at(cx + ox, cy + oy))
        }
        if (clear > (best?.clear ?? MIN_CLEAR)) best = { region, text, x: cx, y: cy, clear }
      }
    }
    return best ? [best] : []
  })
}

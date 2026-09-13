import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { boardCapacity } from "../boards/index.ts"
import { type GeneratedMap, generateMap, type LayoutError, UNITS_PER_INCH } from "./layout.ts"
import { ALL_VARIANTS, type BoardVariant, buildSpec, graphFor } from "./spec.ts"

/**
 * Regenerates the board geometry from the authored graphs in `boards/` into
 * `maps.json` — every variant keyed by id, which the print routes and the UI
 * both read. On any layout failure it prints the named reasons and exits
 * nonzero without touching `maps.json`, so a broken layout can never be
 * committed.
 *
 *   pnpm tp:map:build            # every variant
 *   pnpm tp:map:build 4p-north   # just that one, merged into the existing file
 *
 * Targeting one variant only re-solves that board and leaves the others' baked
 * geometry byte-for-byte alone — the layout solver is iterative, so a full
 * rebuild can nudge boards you didn't touch. Use it while tuning a single
 * graph; run the full build before committing.
 *
 * Node-only, and deliberately named `build.ts`: that filename is excluded from
 * the app tsconfig and included in the node one, so `node:` imports typecheck
 * here without leaking Node globals into browser code (see `tsconfig.node.json`).
 */

const dir = dirname(fileURLToPath(import.meta.url))
const mapsOut = resolve(dir, "maps.json")
const inch = (u: number) => (u / UNITS_PER_INCH).toFixed(2)

const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"))
const unknown = requested.filter((v) => !ALL_VARIANTS.includes(v as BoardVariant))
if (unknown.length > 0) {
  console.error(`Unknown variant ${unknown.join(", ")} — expected ${ALL_VARIANTS.join(" | ")}`)
  process.exit(1)
}
const targets = (requested.length > 0 ? requested : ALL_VARIANTS) as BoardVariant[]

try {
  // Start from what's already baked so a targeted build merges rather than truncates.
  const all: Record<string, GeneratedMap> = requested.length > 0 && existsSync(mapsOut)
    ? (JSON.parse(readFileSync(mapsOut, "utf8")) as Record<string, GeneratedMap>)
    : {}
  for (const v of targets) {
    const map = generateMap(buildSpec(v))
    all[v] = map
    const { crossings, minNodeGap, minPathClear, minCubeSlack, minGrasslandClear } = map.stats
    const cap = boardCapacity(graphFor(v))
    console.log(
      `${
        v.padEnd(9)
      } ${cap.clearings} clearings, ${cap.paths} paths (${cap.openers} openers), ${cap.slots} slots = ${cap.actions} actions  `
        + `crossings=${crossings}  minNodeGap=${inch(minNodeGap)}in  minPathClear=${inch(minPathClear)}in  `
        + `minCubeSlack=${inch(minCubeSlack)}in  minGrassClear=${inch(minGrasslandClear)}in`
    )
  }
  writeFileSync(mapsOut, JSON.stringify(all, null, 2) + "\n")
  console.log(
    `\nWrote maps.json (${targets.length} of ${ALL_VARIANTS.length} variant${ALL_VARIANTS.length === 1 ? "" : "s"}${
      requested.length > 0 ? " rebuilt, rest left as baked" : ""
    }).`
  )
} catch (error) {
  console.error((error as LayoutError).message ?? error)
  process.exit(1)
}

import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { type GeneratedMap, generateMap, type LayoutError, UNITS_PER_INCH } from "./layout.ts"
import { ALL_VARIANTS, buildSpec } from "./spec.ts"

/**
 * Regenerates the board geometry from the authored graph in `domain.ts` into
 * `maps.json` — every variant keyed by id, which the print routes and the UI
 * both read. Run with `pnpm tp:map:build`. On any layout failure it prints the
 * named reasons and exits nonzero without touching `maps.json`, so a broken
 * layout can never be committed.
 *
 * Node-only, and deliberately named `build.ts`: that filename is excluded from
 * the app tsconfig and included in the node one, so `node:` imports typecheck
 * here without leaking Node globals into browser code (see `tsconfig.node.json`).
 */

const dir = dirname(fileURLToPath(import.meta.url))
const mapsOut = resolve(dir, "maps.json")
const inch = (u: number) => (u / UNITS_PER_INCH).toFixed(2)

try {
  const all: Record<string, GeneratedMap> = {}
  for (const v of ALL_VARIANTS) {
    const map = generateMap(buildSpec(v))
    all[v] = map
    const { crossings, minNodeGap, minPathClear, minCubeSlack, minGrasslandClear } = map.stats
    console.log(
      `${v.padEnd(9)} ${map.clearings.length} clearings, ${map.paths.length} paths  `
        + `crossings=${crossings}  minNodeGap=${inch(minNodeGap)}in  minPathClear=${inch(minPathClear)}in  `
        + `minCubeSlack=${inch(minCubeSlack)}in  minGrassClear=${inch(minGrasslandClear)}in`
    )
  }
  writeFileSync(mapsOut, JSON.stringify(all, null, 2) + "\n")
  console.log(`\nWrote maps.json (${ALL_VARIANTS.length} variants).`)
} catch (error) {
  console.error((error as LayoutError).message ?? error)
  process.exit(1)
}

import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { generateMap, type LayoutError, UNITS_PER_INCH } from "./layout.ts"
import { buildSpec } from "./spec.ts"

/**
 * Regenerates `map.json` from the authored graph in `domain.ts`. Run with
 * `pnpm tp:map:build`. On failure it prints the named reasons and exits nonzero
 * without touching `map.json`, so a broken layout can never be committed.
 *
 * Node-only, and deliberately named `build.ts`: that filename is excluded from
 * the app tsconfig and included in the node one, so `node:` imports typecheck
 * here without leaking Node globals into browser code (see `tsconfig.node.json`).
 */

const dir = dirname(fileURLToPath(import.meta.url))
const out = resolve(dir, "map.json")
const inch = (u: number) => (u / UNITS_PER_INCH).toFixed(2)

try {
  const map = generateMap(buildSpec())
  writeFileSync(out, JSON.stringify(map, null, 2) + "\n")

  const { crossings, minNodeGap, minPathClear, minCubeSlack, anchorScale, attempt } = map.stats
  console.log(`Wrote ${map.clearings.length} clearings, ${map.paths.length} paths to ${out}`)
  console.log(
    `  crossings=${crossings}  minNodeGap=${inch(minNodeGap)}in  minPathClear=${inch(minPathClear)}in  `
      + `minCubeSlack=${inch(minCubeSlack)}in  anchorScale=${anchorScale}  attempt=${attempt}`
  )
} catch (error) {
  console.error((error as LayoutError).message ?? error)
  process.exit(1)
}

import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { generateMap } from "./generate.ts"
import { numinaMapSpec } from "./spec.ts"

/**
 * Regenerates `map.json` from `spec.ts`. Run with `pnpm map:build`.
 *
 * Node-only, and deliberately named `build.ts`: that filename is excluded from
 * the app tsconfig and included in the node one, so `node:` imports typecheck
 * here without leaking Node globals into browser code.
 */

const out = resolve(dirname(fileURLToPath(import.meta.url)), "map.json")

const map = generateMap(numinaMapSpec)
writeFileSync(out, JSON.stringify(map, null, 2) + "\n")

console.log(`Wrote ${map.provinces.length} provinces to ${out}`)

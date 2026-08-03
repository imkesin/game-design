import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { generateMap } from "./generate.ts"
import type { HexMapSpec } from "./hexSpec.ts"

/**
 * Regenerates `map.json` from the hand-painted `hexSpec.json`. Run with
 * `pnpm map:build`.
 *
 * Node-only, and deliberately named `build.ts`: that filename is excluded from
 * the app tsconfig and included in the node one, so `node:` imports typecheck
 * here without leaking Node globals into browser code.
 */

const dir = dirname(fileURLToPath(import.meta.url))
const specPath = resolve(dir, "hexSpec.json")
const out = resolve(dir, "map.json")

const spec = JSON.parse(readFileSync(specPath, "utf8")) as HexMapSpec

const map = generateMap(spec)
writeFileSync(out, JSON.stringify(map, null, 2) + "\n")

console.log(`Wrote ${map.provinces.length} provinces to ${out}`)

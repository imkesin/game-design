import { execFile } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"
import { createServer } from "vite"
import { generateMap, type LayoutError, UNITS_PER_INCH } from "./layout.ts"
import { buildSpec } from "./spec.ts"

/**
 * The paint loop: `pnpm tp:map:paint`. Edit `domain.ts`, run this, look at the
 * PNG. It regenerates the layout and screenshots the real board (via a headless
 * Vite server, so what you see is exactly what prints), then opens the image.
 *
 * On success it persists `map.json`. On failure it renders the best-effort
 * layout so you can *see* the crossing or collision, prints the named reasons,
 * and restores the last good `map.json` — a failed paint never corrupts it.
 *
 * A `.node.ts` script: excluded from the app tsconfig, included in the node one
 * (see the tsconfigs), so its Node/Vite/Playwright imports typecheck cleanly.
 */

const dir = dirname(fileURLToPath(import.meta.url))
const out = resolve(dir, "map.json")
const png = resolve(dir, "preview.png")
const inch = (u: number) => (u / UNITS_PER_INCH).toFixed(2)

let map
let failed = false
try {
  map = generateMap(buildSpec())
} catch (error) {
  const layoutError = error as LayoutError
  if (layoutError.diagnostic === undefined) throw error
  map = layoutError.diagnostic.map
  failed = true
  console.error(`\n✗ ${layoutError.message}\n`)
}

const backup = failed && existsSync(out) ? readFileSync(out, "utf8") : null
writeFileSync(out, JSON.stringify(map, null, 2) + "\n")

const server = await createServer({ server: { port: 5199 }, logLevel: "silent" })
await server.listen()
const url = server.resolvedUrls?.local[0]
if (url === undefined) throw new Error("Vite did not report a local URL")

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 1080 }, deviceScaleFactor: 2 })
await page.goto(`${url}tigers-path/print/board`, { waitUntil: "networkidle" })
await page.waitForTimeout(500)
await page.locator(".sheet").screenshot({ path: png })
await browser.close()
await server.close()

// Restore the last good map so a failed paint leaves map.json untouched.
if (backup !== null) writeFileSync(out, backup)

if (!failed) {
  const { crossings, minNodeGap, minPathClear, minCubeSlack, anchorScale, attempt } = map.stats
  console.log(`\n✓ ${map.clearings.length} clearings, ${map.paths.length} paths`)
  console.log(
    `  crossings=${crossings}  minNodeGap=${inch(minNodeGap)}in  minPathClear=${inch(minPathClear)}in  `
      + `minCubeSlack=${inch(minCubeSlack)}in  anchorScale=${anchorScale}  attempt=${attempt}`
  )
}
console.log(`  preview → ${png}${failed ? "  (best effort — map.json unchanged)" : ""}`)
execFile("open", [png], () => {})

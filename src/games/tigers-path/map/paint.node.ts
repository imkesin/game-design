import { execFile } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"
import { createServer } from "vite"
import { type GeneratedMap, generateMap, type LayoutError, UNITS_PER_INCH } from "./layout.ts"
import { ALL_VARIANTS, buildSpec } from "./spec.ts"

/**
 * The paint loop: `pnpm tp:map:paint [variant] [--png]`. Edit `domain.ts` or
 * `spec.ts`, run this, look at the stats — and, with `--png`, the rendered image.
 * It always regenerates every variant into `maps.json` and prints one variant's
 * geometry stats. Pass `--png` to also screenshot that variant's print route
 * (default `2p-split`) via a headless Vite server — so what you see is exactly
 * what prints — and open the image. Without the flag the browser step is skipped,
 * so the common "did it still solve?" check is fast.
 *
 * On a layout failure it renders the best-effort layout so you can *see* the
 * crossing or collision (with `--png`), prints the named reasons, and restores
 * the last good `maps.json` — a failed paint never corrupts it.
 *
 * A `.node.ts` script: excluded from the app tsconfig, included in the node one
 * (see the tsconfigs), so its Node/Vite/Playwright imports typecheck cleanly.
 */

const dir = dirname(fileURLToPath(import.meta.url))
const mapsOut = resolve(dir, "maps.json")
const png = resolve(dir, "preview.png")
const inch = (u: number) => (u / UNITS_PER_INCH).toFixed(2)

const argv = process.argv.slice(2)
// Opt in to the (slow) screenshot + open; default is a fast maps.json rebuild.
const wantPng = argv.includes("--png")
// The route to screenshot. Usually a build variant (`2p-split`, `3p-split`, …);
// also accepts `sheet1`, the composed two-up print that reads several variants.
const route = argv.find((a) => !a.startsWith("-")) ?? "2p-split"

const all: Record<string, GeneratedMap> = {}
let failed = false
for (const v of ALL_VARIANTS) {
  try {
    all[v] = generateMap(buildSpec(v))
  } catch (error) {
    const layoutError = error as LayoutError
    if (layoutError.diagnostic === undefined) throw error
    all[v] = layoutError.diagnostic.map
    failed = true
    console.error(`\n✗ ${v}: ${layoutError.message}\n`)
  }
}

const backup = failed && existsSync(mapsOut) ? readFileSync(mapsOut, "utf8") : null
writeFileSync(mapsOut, JSON.stringify(all, null, 2) + "\n")

if (wantPng) {
  const server = await createServer({ server: { port: 5199 }, logLevel: "silent" })
  await server.listen()
  const url = server.resolvedUrls?.local[0]
  if (url === undefined) throw new Error("Vite did not report a local URL")

  // Wide enough that even the 24in composed sheet fits without overflowing the
  // viewport — an element wider than the viewport gets centered off-screen by the
  // flex wrapper and screenshots as black in the overflow.
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 2600, height: 1900 }, deviceScaleFactor: 2 })
  await page.goto(`${url}tigers-path/print/board/${route}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await page.locator(".sheet").screenshot({ path: png })
  await browser.close()
  await server.close()
}

// Restore the last good maps so a failed paint leaves maps.json untouched.
if (backup !== null) writeFileSync(mapsOut, backup)

const map = all[route]
if (map) {
  const { crossings, minNodeGap, minPathClear, minCubeSlack, minGrasslandClear, anchorScale, attempt } = map.stats
  console.log(`\n${failed ? "✗" : "✓"} ${route}: ${map.clearings.length} clearings, ${map.paths.length} paths`)
  console.log(
    `  crossings=${crossings}  minNodeGap=${inch(minNodeGap)}in  minPathClear=${inch(minPathClear)}in  `
      + `minCubeSlack=${inch(minCubeSlack)}in  minGrassClear=${inch(minGrasslandClear)}in  `
      + `anchorScale=${anchorScale}  attempt=${attempt}`
  )
} else {
  console.log(`\n${failed ? "✗" : "✓"} ${route} (composed route — per-variant stats above)`)
}
if (wantPng) {
  console.log(`  preview → ${png}${failed ? "  (best effort — maps.json unchanged)" : ""}`)
  execFile("open", [png], () => {})
} else if (failed) {
  console.log("  (best effort — maps.json unchanged; re-run with --png to see the layout)")
}

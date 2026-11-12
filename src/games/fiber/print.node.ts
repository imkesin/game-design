import { mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { parseArgs } from "node:util"
import { chromium } from "playwright"

/**
 * Writes the 8-tile Letter PDF of the Fiber board from the running dev server:
 * `npx tsx src/games/fiber/print.node.ts [--seed 0] [--url http://localhost:5173] [--out fiber-map.pdf]`.
 */

const { values } = parseArgs({
  options: {
    seed: { type: "string", default: "0" },
    url: { type: "string", default: "http://localhost:5173" },
    out: { type: "string", default: "fiber-map.pdf" }
  }
})

const out = resolve(values.out)
mkdirSync(dirname(out), { recursive: true })
const browser = await chromium.launch({ channel: "chrome" })
try {
  const page = await browser.newPage()
  await page.goto(`${values.url}/fiber/print?seed=${values.seed}`, { waitUntil: "networkidle" })
  await page.emulateMedia({ media: "print" })
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true })
  console.log(`Wrote ${out}`)
} finally {
  await browser.close()
}

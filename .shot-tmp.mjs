import { chromium } from "playwright"
const out = "/private/tmp/claude-501/-Users-imkesin-dev-personal-game-design/88746ff2-d896-4937-8cc4-036d3a6db232/scratchpad"
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 })
page.on("pageerror", (e) => console.log("pageerror", e.message))
await page.goto("http://localhost:5199/regolith/print/board", { waitUntil: "networkidle" })
await page.waitForTimeout(800)
await page.locator(".sheet").nth(0).screenshot({ path: `${out}/strip-a.png` })
await page.locator(".sheet").nth(2).screenshot({ path: `${out}/strip-c.png` })
await browser.close()

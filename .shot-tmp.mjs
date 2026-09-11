import { chromium } from "playwright"
const out = "/private/tmp/claude-501/-Users-imkesin-dev-personal-game-design/e81d6933-4a19-46ac-a291-9e7a936054f1/scratchpad"
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 })
page.on("pageerror", (e) => console.log("pageerror", e.message))
page.on("console", (m) => { if (m.type() === "error") console.log("console", m.text()) })
await page.goto("http://localhost:5199/regolith/print/board", { waitUntil: "networkidle" })
await page.waitForTimeout(800)
console.log("sheets", await page.locator(".sheet").count())
await page.locator(".sheet").nth(2).screenshot({ path: `${out}/sheet3.png` })
await page.locator(".sheet").nth(3).screenshot({ path: `${out}/sheet4.png` })
await page.goto("http://localhost:5199/regolith/print/aid", { waitUntil: "networkidle" })
await page.waitForTimeout(800)
await page.locator(".sheet").first().screenshot({ path: `${out}/aid.png` })
const overflow = await page.evaluate(() => {
  const s = document.querySelector(".sheet")
  return { sheet: s.clientHeight, content: Math.max(...[...s.querySelectorAll("section")].map((e) => e.getBoundingClientRect().bottom - s.getBoundingClientRect().top)) }
})
console.log("aid", JSON.stringify(overflow))
await browser.close()

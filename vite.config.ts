import react from "@vitejs/plugin-react"
import { execFile } from "node:child_process"
import { writeFileSync } from "node:fs"
import { fileURLToPath, URL } from "node:url"
import { promisify } from "node:util"
import { defineConfig, type Plugin } from "vite"

const run = promisify(execFile)

/**
 * Dev-only endpoint that lets the hex painter write its spec into the repo.
 *
 * Saving posts the spec here; this writes `hexSpec.json` and then shells out to
 * the very same `build.ts` that `pnpm map:build` runs, rather than importing
 * the generator directly — so the committed `map.json` can never be produced
 * two different ways, and a spec the real build would reject is reported here
 * instead of quietly succeeding.
 *
 * Writing the files trips Vite's watcher, and that reload is what puts the new
 * map on the view and print pages.
 */
function hexSpecSave(): Plugin {
  const url = (path: string) => fileURLToPath(new URL(path, import.meta.url))
  const specPath = url("./src/games/civil-service/map/hexSpec.json")
  const buildScript = url("./src/games/civil-service/map/build.ts")
  const tsx = url("./node_modules/.bin/tsx")

  return {
    name: "civil-service:hex-spec-save",
    // Never ship it: the painter falls back to a plain download in a real build.
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__hex-spec", (req, res, next) => {
        if (req.method !== "POST") return next()

        const chunks: Buffer[] = []
        req.on("data", (chunk: Buffer) => chunks.push(chunk))
        req.on("end", () => {
          const reply = (code: number, body: unknown) => {
            res.statusCode = code
            res.setHeader("content-type", "application/json")
            res.end(JSON.stringify(body))
          }

          void (async () => {
            let spec: unknown
            try {
              spec = JSON.parse(Buffer.concat(chunks).toString("utf8"))
            } catch (error) {
              reply(400, { ok: false, error: `Malformed spec: ${String(error)}` })
              return
            }

            // Written before the build runs, and never rolled back: a painting
            // that fails to build is still work, and losing it to a validation
            // error would be much worse than a stale map.json.
            writeFileSync(specPath, JSON.stringify(spec, null, 2) + "\n")

            try {
              await run(tsx, [buildScript])
              reply(200, { ok: true })
            } catch (error) {
              const failure = error as { stderr?: string; message?: string }
              const detail = (failure.stderr ?? "").trim() || failure.message || String(error)
              // Spec saved, map.json untouched — say both, or this reads as
              // having thrown the stroke away.
              reply(422, { ok: false, error: `Spec saved, but the map did not build:\n${detail}` })
            }
          })()
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), hexSpecSave()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
})

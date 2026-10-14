import { execFile } from "node:child_process"
import { writeFileSync } from "node:fs"
import { promisify } from "node:util"
import type { Plugin } from "vite"

const run = promisify(execFile)

type SpecSaveOptions = {
  /** Plugin name, for Vite's diagnostics. */
  name: string
  /** Dev-server path the painter POSTs its spec to. */
  route: string
  /** Absolute path of the JSON file the spec is written to. */
  specPath: string
  /**
   * Absolute path of a build script to run after writing, with `tsx`. Omitted
   * when the map is derived live from the spec and there is nothing to build.
   */
  build?: { script: string; tsx: string }
}

/**
 * Dev-only endpoint that lets a map painter write its spec into the repo.
 *
 * Saving posts the spec here; this writes it and, when the game has one, shells
 * out to the very same build script its `pnpm` command runs rather than
 * importing the generator directly — so generated output can never be produced
 * two different ways, and a spec the real build would reject is reported here
 * instead of quietly succeeding.
 *
 * Writing the files trips Vite's watcher, and that reload is what puts the new
 * map on the view and print pages.
 */
export function specSave({ name, route, specPath, build }: SpecSaveOptions): Plugin {
  return {
    name,
    // Never ship it: painters fall back to a plain download in a real build.
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(route, (req, res, next) => {
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

            // Written before any build runs, and never rolled back: a painting
            // that fails to build is still work, and losing it to a validation
            // error would be much worse than stale generated output.
            writeFileSync(specPath, JSON.stringify(spec, null, 2) + "\n")

            if (build === undefined) {
              reply(200, { ok: true })
              return
            }

            try {
              await run(build.tsx, [build.script])
              reply(200, { ok: true })
            } catch (error) {
              const failure = error as { stderr?: string; message?: string }
              const detail = (failure.stderr ?? "").trim() || failure.message || String(error)
              // Spec saved, output untouched — say both, or this reads as
              // having thrown the stroke away.
              reply(422, { ok: false, error: `Spec saved, but the map did not build:\n${detail}` })
            }
          })()
        })
      })
    }
  }
}

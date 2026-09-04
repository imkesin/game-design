/**
 * Drop-in tile marks: every `<good>.svg` in this folder, keyed by its
 * basename, so `resourceMarks.ts` can prefer it over the built-in mark. See
 * README.md for the naming and what kind of SVG works.
 *
 * Eager and raw so the art is inlined into the bundle — the print sheets have
 * to render in one pass, with no fetch.
 */
const files = import.meta.glob<string>("./*.svg", { query: "?raw", import: "default", eager: true })

export const MARK_FILES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, raw]) => [path.replace(/^\.\//, "").replace(/\.svg$/, ""), raw])
)

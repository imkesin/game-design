/**
 * Drop-in marks: every `<name>.svg` in this folder, keyed by its basename, so
 * `components/qualityMarks.ts` can prefer it over the built-in Lucide mark. See
 * README.md for the naming and what kind of SVG works.
 *
 * Eager and raw so the art is inlined into the bundle: the print sheet has to
 * render in one pass, with no fetch.
 */
const files = import.meta.glob<string>("./*.svg", { query: "?raw", import: "default", eager: true })

export const MARK_FILES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, raw]) => [path.replace(/^\.\//, "").replace(/\.svg$/, ""), raw])
)

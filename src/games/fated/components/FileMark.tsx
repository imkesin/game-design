import type { Mark } from "~/games/fated/components/resourceMarks"

/**
 * Turns a dropped-in `marks/<name>.svg` into a mark component. Black fills and
 * strokes become `currentColor` so the mark takes the ink of the resource it
 * stands for; the file's other colours and its own stroke widths are kept.
 */

const SVG_OPEN = /^[\s\S]*?<svg[^>]*>/
const SVG_CLOSE = /<\/svg>[\s\S]*$/
const VIEW_BOX = /viewBox="([^"]+)"/
// Sourced icons often ship a full-canvas background layer. Left in, it paints
// over the whole card, so drop the common form of it.
const BACKGROUND = /<path[^>]*\sd="M0 0h[\d.]+v[\d.]+H0z"[^>]*\/>/g
const BLACK = /\b(fill|stroke)="(?:#000(?:000)?|black)"/gi

export function fileMark(raw: string): Mark {
  const viewBox = VIEW_BOX.exec(raw)?.[1] ?? "0 0 24 24"
  const inner = raw
    .replace(SVG_OPEN, "")
    .replace(SVG_CLOSE, "")
    .replace(BACKGROUND, "")
    .replace(BLACK, "$1=\"currentColor\"")
  return function FileMark({ size = 24 }) {
    return (
      <svg
        viewBox={viewBox}
        style={{ width: size, height: size, flexShrink: 0 }}
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    )
  }
}

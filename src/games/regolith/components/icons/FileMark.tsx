import type { ReactNode } from "react"
import type { MarkProps } from "~/games/regolith/components/icons/markProps"

/**
 * Turns a dropped-in `marks/<good>.svg` into a mark component, so sourced art
 * (game-icons.net and the like) sits alongside the Lucide and hand-drawn
 * marks with no per-file code.
 *
 * The file's own `fill`/`stroke` are deliberately left alone — that's what
 * lets both solid silhouettes and line art work — so `strokeWidth` has no
 * effect here. `color` is set as the CSS colour property, which is what art
 * drawn with `currentColor` resolves against.
 */

const SVG_OPEN = /^[\s\S]*?<svg[^>]*>/
const SVG_CLOSE = /<\/svg>[\s\S]*$/
const VIEW_BOX = /viewBox="([^"]+)"/
// Sourced icons often ship a full-canvas background layer. Left in, it paints
// over the whole tile, so drop the common form of it.
const BACKGROUND = /<path[^>]*\sd="M0 0h[\d.]+v[\d.]+H0z"[^>]*\/>/g

export function fileMark(raw: string): (props: MarkProps) => ReactNode {
  const viewBox = VIEW_BOX.exec(raw)?.[1] ?? "0 0 24 24"
  const inner = raw.replace(SVG_OPEN, "").replace(SVG_CLOSE, "").replace(BACKGROUND, "")
  return function FileMark({ size = 24, color = "currentColor", x = 0, y = 0, opacity }: MarkProps) {
    return (
      <svg
        x={x}
        y={y}
        width={size}
        height={size}
        viewBox={viewBox}
        color={color}
        opacity={opacity}
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    )
  }
}

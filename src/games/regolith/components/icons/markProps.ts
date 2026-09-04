/**
 * The prop surface every Regolith mark honours. No `| undefined` on any of
 * it, so callers pass numbers rather than undefined.
 */
export type MarkProps = {
  size?: number
  color?: string
  strokeWidth?: number
  x?: number
  y?: number
  /**
   * Lightens the mark. Opacity rather than a grey `color` because a
   * `marks/*.svg` carries its own black fill, which a colour wouldn't touch —
   * this is the one lever that lightens every kind of mark.
   */
  opacity?: number
}

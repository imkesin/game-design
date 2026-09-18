import type { ReactNode } from "react"
import { fileMark } from "~/games/regolith/components/icons/FileMark"
import type { MarkProps } from "~/games/regolith/components/icons/markProps"
import { MissingMark } from "~/games/regolith/components/icons/MissingMark"
import type { Resource } from "~/games/regolith/domain"
import { MARK_FILES } from "~/games/regolith/marks"

/**
 * Every resource's mark is a file in `../marks/` — see that folder's README. That
 * is now the whole story: no icon library, no hand-drawn built-ins, so a mark
 * changes by replacing an SVG and nothing else.
 *
 * A resource with no file draws `MissingMark`, an obvious dashed placeholder. A
 * folder of art is not something the compiler can check, so the missing state
 * has to be visible on the tile instead — which beats a borrowed stand-in
 * that quietly reads as the wrong thing.
 */

/** A mark is anything callable with `MarkProps`. */
export type MarkIcon = (props: MarkProps) => ReactNode

// `fileMark` builds a component per call, so these are cached: rebuilding one
// per render would give it a fresh identity every time and remount the mark.
const marks = new Map<string, MarkIcon>()

/**
 * The mark for any file in `../marks/`, by basename. Resources go through
 * `markFor`; this is for the few marks that are not goods, like `time`.
 */
export function markNamed(name: string): MarkIcon {
  let mark = marks.get(name)
  if (mark === undefined) {
    const raw = MARK_FILES[name]
    mark = raw === undefined ? MissingMark : fileMark(raw)
    marks.set(name, mark)
  }
  return mark
}

export function markFor(resource: Resource): MarkIcon {
  return markNamed(resource)
}

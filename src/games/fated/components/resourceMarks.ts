import { Asterisk, Compass, Crown, Eye, Flame, Heart, type LucideIcon, Moon, Sprout, Swords, Zap } from "lucide-react"
import type { ComponentType } from "react"
import { type AlternativeAction, type Resource, type ResourceId, WILD, type Wild } from "~/games/fated/cards/domain"
import { RESOURCE_BY_ID } from "~/games/fated/cards/resources"
import { fileMark } from "~/games/fated/components/FileMark"
import { MARK_FILES } from "~/games/fated/marks"

/** Anything drawn into a square box: a Lucide icon or a dropped-in SVG. */
export type Mark = ComponentType<{ size?: number | string; strokeWidth?: number }>

/**
 * A `../marks/<name>.svg` if there is one, else the built-in. Built once at load
 * so a mark keeps its identity across renders.
 */
function mark(name: string, builtin: LucideIcon): Mark {
  const raw = MARK_FILES[name]
  return raw === undefined ? builtin : fileMark(raw)
}

/** One Lucide mark per resource, standing in until the deck has real illustration. */
export const RESOURCE_MARKS: Record<ResourceId, Mark> = {
  allure: mark("allure", Eye),
  prowess: mark("prowess", Swords),
  passion: mark("passion", Flame),
  devotion: mark("devotion", Heart),
  influence: mark("influence", Crown),
  mystique: mark("mystique", Moon)
}

/** Stands for "any resource" in a scene cost. */
export const WILD_MARK: Mark = mark("any", Asterisk)

export const ACTION_MARKS: Record<AlternativeAction, Mark> = {
  explore: mark("explore", Compass),
  motivate: mark("motivate", Zap),
  develop: mark("develop", Sprout)
}

const KNOWN_MARKS = new Set<string>([...Object.keys(RESOURCE_MARKS), "any", ...Object.keys(ACTION_MARKS)])
for (const name of Object.keys(MARK_FILES)) {
  if (!KNOWN_MARKS.has(name)) console.warn(`fated/marks/${name}.svg matches no mark; see marks/README.md`)
}

const inkOf = ({ color, inkShade }: Resource) => `var(--colors-${color}-${inkShade})`

/** The wild mark stands for any resource, so it takes the neutral ink. */
export function suit(resource: ResourceId | Wild) {
  return resource === WILD
    ? { color: "neutral", ink: "var(--colors-neutral-700)", name: "Anything", Mark: WILD_MARK }
    : { ...RESOURCE_BY_ID[resource], ink: inkOf(RESOURCE_BY_ID[resource]), Mark: RESOURCE_MARKS[resource] }
}

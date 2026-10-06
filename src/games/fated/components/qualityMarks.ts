import { Asterisk, Compass, Crown, Eye, Flame, Heart, type LucideIcon, Moon, Sprout, Swords, Zap } from "lucide-react"
import type { ComponentType } from "react"
import {
  ANY_QUALITY,
  type AnyQuality,
  type MinorAction,
  type Quality,
  type QualityId
} from "~/games/fated/cards/domain"
import { QUALITY_BY_ID } from "~/games/fated/cards/qualities"
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

/** One Lucide mark per quality, standing in until the deck has real illustration. */
export const QUALITY_MARKS: Record<QualityId, Mark> = {
  allure: mark("allure", Eye),
  prowess: mark("prowess", Swords),
  passion: mark("passion", Flame),
  devotion: mark("devotion", Heart),
  influence: mark("influence", Crown),
  mystique: mark("mystique", Moon)
}

/** Stands for "any quality" in a scene cost. */
export const ANY_QUALITY_MARK: Mark = mark("any", Asterisk)

export const ACTION_MARKS: Record<MinorAction, Mark> = {
  explore: mark("explore", Compass),
  motivate: mark("motivate", Zap),
  develop: mark("develop", Sprout)
}

const KNOWN_MARKS = new Set<string>([...Object.keys(QUALITY_MARKS), "any", ...Object.keys(ACTION_MARKS)])
for (const name of Object.keys(MARK_FILES)) {
  if (!KNOWN_MARKS.has(name)) console.warn(`fated/marks/${name}.svg matches no mark; see marks/README.md`)
}

const inkOf = ({ color, inkShade }: Quality) => `var(--colors-${color}-${inkShade})`

/** The Any Quality mark stands for any quality, so it takes the neutral ink. */
export function suit(quality: QualityId | AnyQuality) {
  return quality === ANY_QUALITY
    ? { color: "neutral", ink: "var(--colors-neutral-700)", name: "Any Quality", Mark: ANY_QUALITY_MARK }
    : { ...QUALITY_BY_ID[quality], ink: inkOf(QUALITY_BY_ID[quality]), Mark: QUALITY_MARKS[quality] }
}

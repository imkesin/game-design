import type { Quality, QualityId } from "./domain"

/**
 * The six qualities. Blue/purple are the pair likeliest to blur on a home
 * printer, so the marks in `qualityMarks.ts` carry the identity and colour is
 * the quick read. Yellow inks a step lighter and mystique's "black" is the
 * darkest zinc, so each tint reads as itself.
 */
export const qualities: readonly Quality[] = [
  { id: "allure", name: "Allure", color: "blue", inkShade: 700 },
  { id: "prowess", name: "Prowess", color: "red", inkShade: 700 },
  { id: "passion", name: "Passion", color: "yellow", inkShade: 600 },
  { id: "devotion", name: "Devotion", color: "green", inkShade: 700 },
  { id: "influence", name: "Influence", color: "purple", inkShade: 700 },
  { id: "mystique", name: "Mystique", color: "zinc", inkShade: 900 }
]

export const QUALITY_BY_ID = Object.fromEntries(
  qualities.map((r) => [r.id, r])
) as Record<QualityId, Quality>

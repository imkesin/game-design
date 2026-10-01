import type { Resource, ResourceId } from "./domain"

/**
 * The six resources. Colours are picked for separation first: the three warm
 * ones (pink, red, orange) are the likeliest to blur on a home printer, so the
 * marks in `resourceMarks.ts` carry the identity and colour is the quick read.
 */
export const resources: readonly Resource[] = [
  { id: "allure", name: "Allure", color: "pink" },
  { id: "prowess", name: "Prowess", color: "red" },
  { id: "passion", name: "Passion", color: "orange" },
  { id: "devotion", name: "Devotion", color: "blue" },
  { id: "influence", name: "Influence", color: "amber" },
  { id: "mystique", name: "Mystique", color: "violet" }
]

export const RESOURCE_BY_ID = Object.fromEntries(
  resources.map((r) => [r.id, r])
) as Record<ResourceId, Resource>

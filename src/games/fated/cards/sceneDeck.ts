import type { AlternativeAction, CostAmount, Requirement, ResourceId, SceneCard } from "./domain"
import { WILD } from "./domain"

export const SCENE_DECK_SIZE = 30

const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")

const scene = (
  name: string,
  action: AlternativeAction,
  cost: SceneCard["cost"]
): SceneCard => ({ kind: "scene", id: slug(name), name, action, cost })

const need = (amount: CostAmount, resource: ResourceId | typeof WILD): Requirement => ({ resource, amount })

/** `n a + n b`: the same amount of two specific resources. */
const pair = (name: string, action: AlternativeAction, n: CostAmount, a: ResourceId, b: ResourceId) =>
  scene(name, action, [need(n, a), need(n, b)])

/** `n a + n anything`. */
const mixed = (name: string, action: AlternativeAction, n: CostAmount, a: ResourceId) =>
  scene(name, action, [need(n, a), need(n, WILD)])

/** `n anything` from one protagonist. */
const wild = (name: string, action: AlternativeAction, n: CostAmount) => scene(name, action, [need(n, WILD)])

/**
 * Placeholder deck: five cost levels (1 through 5), six scenes each: two
 * specific pairs, two specific + anything, two anything-only. Each level carries
 * every alternative action twice and each resource appears five times across
 * the deck. Names, mix and costs are all up for playtest.
 */
export const sceneDeck: readonly SceneCard[] = [
  pair("Stolen Glance", "motivate", 1, "allure", "passion"),
  pair("Midnight Letter", "develop", 1, "devotion", "mystique"),
  mixed("Whispered Rumor", "explore", 1, "influence"),
  mixed("Fortune Teller's Warning", "motivate", 1, "mystique"),
  wild("Awkward Introduction", "develop", 1),
  wild("Chance Meeting", "explore", 1),

  pair("Sparring Match", "develop", 2, "prowess", "influence"),
  pair("Rain-Soaked Confession", "explore", 2, "passion", "devotion"),
  mixed("Borrowed Cloak", "motivate", 2, "allure"),
  mixed("Archery Lesson", "develop", 2, "prowess"),
  wild("Morning Walk", "explore", 2),
  wild("Shared Meal", "motivate", 2),

  pair("Masquerade Ball", "explore", 3, "allure", "mystique"),
  pair("Vow at the Border", "motivate", 3, "prowess", "devotion"),
  mixed("Forbidden Library", "develop", 3, "mystique"),
  mixed("Snowed In", "explore", 3, "passion"),
  wild("Long Night of Talk", "motivate", 3),
  wild("Mentor's Lesson", "develop", 3),

  pair("Scandalous Waltz", "motivate", 4, "influence", "passion"),
  pair("Duel at Dawn", "develop", 4, "allure", "prowess"),
  mixed("Dress Fitting", "explore", 4, "allure"),
  mixed("Court Intrigue", "motivate", 4, "influence"),
  wild("Dance Lessons", "develop", 4),
  wild("Journey Through the Pass", "explore", 4),

  pair("The Coronation", "develop", 5, "devotion", "influence"),
  pair("Kiss Beneath the Eclipse", "explore", 5, "passion", "mystique"),
  mixed("Deathbed Promise", "motivate", 5, "devotion"),
  mixed("Trial by Combat", "develop", 5, "prowess"),
  wild("Grand Gesture", "explore", 5),
  wild("Happily Ever After", "motivate", 5)
]

if (sceneDeck.length !== SCENE_DECK_SIZE) {
  throw new Error(`sceneDeck: wrong card total — ${sceneDeck.length}, expected ${SCENE_DECK_SIZE}`)
}

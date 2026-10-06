import type { CostAmount, MinorAction, QualityId, Requirement, SceneCard } from "./domain"
import { ANY_QUALITY } from "./domain"

export const SCENE_DECK_SIZE = 30

const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")

const scene = (
  name: string,
  action: MinorAction,
  cost: SceneCard["cost"]
): SceneCard => ({ kind: "scene", id: slug(name), name, action, cost })

const need = (amount: CostAmount, quality: QualityId | typeof ANY_QUALITY): Requirement => ({ quality, amount })

/** `n a + n b`: the same amount of two specific qualities. */
const pair = (name: string, action: MinorAction, n: CostAmount, a: QualityId, b: QualityId) =>
  scene(name, action, [need(n, a), need(n, b)])

/** `n a + n any quality`. */
const mixed = (name: string, action: MinorAction, n: CostAmount, a: QualityId) =>
  scene(name, action, [need(n, a), need(n, ANY_QUALITY)])

/** `n any quality` from one protagonist. */
const anyQuality = (name: string, action: MinorAction, n: CostAmount) => scene(name, action, [need(n, ANY_QUALITY)])

/**
 * Placeholder deck: five cost levels (1 through 5), six scenes each: two
 * specific pairs, two specific + any quality, two any-quality-only. Each level carries
 * every minor action twice and each quality appears five times across
 * the deck. Names, mix and costs are all up for playtest.
 */
export const sceneDeck: readonly SceneCard[] = [
  pair("Stolen Glance", "motivate", 1, "allure", "passion"),
  pair("Midnight Letter", "develop", 1, "devotion", "mystique"),
  mixed("Whispered Rumor", "explore", 1, "influence"),
  mixed("Fortune Teller's Warning", "motivate", 1, "mystique"),
  anyQuality("Awkward Introduction", "develop", 1),
  anyQuality("Chance Meeting", "explore", 1),

  pair("Sparring Match", "develop", 2, "prowess", "influence"),
  pair("Rain-Soaked Confession", "explore", 2, "passion", "devotion"),
  mixed("Borrowed Cloak", "motivate", 2, "allure"),
  mixed("Archery Lesson", "develop", 2, "prowess"),
  anyQuality("Morning Walk", "explore", 2),
  anyQuality("Shared Meal", "motivate", 2),

  pair("Masquerade Ball", "explore", 3, "allure", "mystique"),
  pair("Vow at the Border", "motivate", 3, "prowess", "devotion"),
  mixed("Forbidden Library", "develop", 3, "mystique"),
  mixed("Snowed In", "explore", 3, "passion"),
  anyQuality("Long Night of Talk", "motivate", 3),
  anyQuality("Mentor's Lesson", "develop", 3),

  pair("Scandalous Waltz", "motivate", 4, "influence", "passion"),
  pair("Duel at Dawn", "develop", 4, "allure", "prowess"),
  mixed("Dress Fitting", "explore", 4, "allure"),
  mixed("Court Intrigue", "motivate", 4, "influence"),
  anyQuality("Dance Lessons", "develop", 4),
  anyQuality("Journey Through the Pass", "explore", 4),

  pair("The Coronation", "develop", 5, "devotion", "influence"),
  pair("Kiss Beneath the Eclipse", "explore", 5, "passion", "mystique"),
  mixed("Deathbed Promise", "motivate", 5, "devotion"),
  mixed("Trial by Combat", "develop", 5, "prowess"),
  anyQuality("Grand Gesture", "explore", 5),
  anyQuality("Happily Ever After", "motivate", 5)
]

if (sceneDeck.length !== SCENE_DECK_SIZE) {
  throw new Error(`sceneDeck: wrong card total — ${sceneDeck.length}, expected ${SCENE_DECK_SIZE}`)
}

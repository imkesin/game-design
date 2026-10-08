import type { CostAmount, MinorAction, QualityId, SceneCard, SceneScoring, ScoringTiming } from "./domain"
import { ANY_QUALITY } from "./domain"

export const SCENE_DECK_SIZE = 30

const scoring = (timing: ScoringTiming) => (love: number, amount: number, quality: QualityId): SceneScoring => ({
  timing,
  love,
  amount,
  quality
})

const instant = scoring("instant")
const endGame = scoring("endGame")

/** Each part of the cost is `tier` of any quality, paid by a single protagonist: 1 + 1, 2 + 2 or 3 + 3. */
const scene = (tier: CostAmount, action: MinorAction, scoring: SceneScoring): Omit<SceneCard, "id"> => ({
  kind: "scene",
  cost: [{ quality: ANY_QUALITY, amount: tier }, { quality: ANY_QUALITY, amount: tier }],
  action,
  scoring
})

/**
 * One line per physical scene. Three cost tiers (1 + 1, 2 + 2, 3 + 3), ten
 * scenes each; every tier carries each minor action 3 or 4 times (10 each
 * overall), and each quality scores five scenes, half of them instant. Rates
 * are placeholders: the dearer the tier, the more Love per quality.
 */
const ENTRIES: readonly Omit<SceneCard, "id">[] = [
  scene(1, "explore", instant(1, 3, "allure")),
  scene(1, "motivate", endGame(1, 3, "prowess")),
  scene(1, "develop", instant(1, 3, "passion")),
  scene(1, "explore", endGame(1, 3, "devotion")),
  scene(1, "motivate", instant(1, 3, "influence")),
  scene(1, "develop", endGame(1, 3, "mystique")),
  scene(1, "explore", endGame(1, 3, "allure")),
  scene(1, "motivate", instant(1, 3, "prowess")),
  scene(1, "develop", endGame(1, 3, "passion")),
  scene(1, "explore", instant(1, 3, "devotion")),

  scene(2, "motivate", instant(1, 2, "allure")),
  scene(2, "develop", endGame(1, 2, "prowess")),
  scene(2, "explore", instant(1, 2, "passion")),
  scene(2, "motivate", endGame(1, 2, "devotion")),
  scene(2, "develop", instant(1, 2, "influence")),
  scene(2, "explore", endGame(1, 2, "mystique")),
  scene(2, "motivate", endGame(1, 2, "influence")),
  scene(2, "develop", instant(1, 2, "mystique")),
  scene(2, "explore", endGame(1, 2, "allure")),
  scene(2, "motivate", instant(1, 2, "prowess")),

  scene(3, "develop", instant(1, 1, "allure")),
  scene(3, "explore", endGame(1, 1, "prowess")),
  scene(3, "motivate", instant(1, 1, "passion")),
  scene(3, "develop", endGame(1, 1, "devotion")),
  scene(3, "explore", instant(1, 1, "influence")),
  scene(3, "motivate", endGame(1, 1, "mystique")),
  scene(3, "develop", endGame(1, 1, "passion")),
  scene(3, "explore", instant(1, 1, "devotion")),
  scene(3, "motivate", endGame(1, 1, "influence")),
  scene(3, "develop", instant(1, 1, "mystique"))
]

/** Ids number the scenes within a tier (`scene-2-4`). */
export const sceneDeck: readonly SceneCard[] = (() => {
  const seen = new Map<number, number>()
  return ENTRIES.map((entry) => {
    const tier = entry.cost[0].amount
    const n = (seen.get(tier) ?? 0) + 1
    seen.set(tier, n)
    return { ...entry, id: `scene-${tier}-${n}` }
  })
})()

if (sceneDeck.length !== SCENE_DECK_SIZE) {
  throw new Error(`sceneDeck: wrong card total — ${sceneDeck.length}, expected ${SCENE_DECK_SIZE}`)
}

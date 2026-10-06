import type { ProtagonistCard, QualityId } from "./domain"

type Pair = {
  readonly qualities: readonly [QualityId, QualityId]
  readonly names: readonly [string, string]
}

/**
 * Every pair of the six qualities (6 choose 2 = 15), two protagonists each.
 * Placeholder names.
 */
const PAIRS: readonly Pair[] = [
  { qualities: ["allure", "prowess"], names: ["Freya", "Rafe"] },
  { qualities: ["allure", "passion"], names: ["Katherine", "Damon"] },
  { qualities: ["allure", "devotion"], names: ["Elena", "Stefan"] },
  { qualities: ["allure", "influence"], names: ["Vivienne", "Julian"] },
  { qualities: ["allure", "mystique"], names: ["Selene", "Lucian"] },
  { qualities: ["prowess", "passion"], names: ["Rhiannon", "Kieran"] },
  { qualities: ["prowess", "devotion"], names: ["Isolde", "Tristan"] },
  { qualities: ["prowess", "influence"], names: ["Cassandra", "Alaric"] },
  { qualities: ["prowess", "mystique"], names: ["Morgana", "Dorian"] },
  { qualities: ["passion", "devotion"], names: ["Evangeline", "Sebastian"] },
  { qualities: ["passion", "influence"], names: ["Marguerite", "Lysander"] },
  { qualities: ["passion", "mystique"], names: ["Seraphine", "Caspian"] },
  { qualities: ["devotion", "influence"], names: ["Imogen", "Gideon"] },
  { qualities: ["devotion", "mystique"], names: ["Lyra", "Evander"] },
  { qualities: ["influence", "mystique"], names: ["Aurelia", "Rhys"] }
]

export const PROTAGONIST_DECK_SIZE = 30

/** 30 protagonists, two for each pair. */
export const protagonistDeck: readonly ProtagonistCard[] = PAIRS.flatMap(
  ({ qualities, names }): ProtagonistCard[] => [
    { kind: "protagonist", id: `${qualities.join("-")}-a`, name: names[0], qualities },
    { kind: "protagonist", id: `${qualities.join("-")}-b`, name: names[1], qualities }
  ]
)

if (protagonistDeck.length !== PROTAGONIST_DECK_SIZE) {
  throw new Error(
    `protagonistDeck: wrong card total — ${protagonistDeck.length}, expected ${PROTAGONIST_DECK_SIZE}`
  )
}

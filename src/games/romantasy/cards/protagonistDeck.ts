import type { ProtagonistCard, ResourceId } from "./domain"

type Pair = {
  readonly resources: readonly [ResourceId, ResourceId]
  readonly F: string
  readonly M: string
}

/**
 * Every pair of the six resources (6 choose 2 = 15), once female and once
 * male. Placeholder names.
 */
const PAIRS: readonly Pair[] = [
  { resources: ["allure", "prowess"], F: "Freya", M: "Rafe" },
  { resources: ["allure", "passion"], F: "Katherine", M: "Damon" },
  { resources: ["allure", "devotion"], F: "Elena", M: "Stefan" },
  { resources: ["allure", "influence"], F: "Vivienne", M: "Julian" },
  { resources: ["allure", "mystique"], F: "Selene", M: "Lucian" },
  { resources: ["prowess", "passion"], F: "Rhiannon", M: "Kieran" },
  { resources: ["prowess", "devotion"], F: "Isolde", M: "Tristan" },
  { resources: ["prowess", "influence"], F: "Cassandra", M: "Alaric" },
  { resources: ["prowess", "mystique"], F: "Morgana", M: "Dorian" },
  { resources: ["passion", "devotion"], F: "Evangeline", M: "Sebastian" },
  { resources: ["passion", "influence"], F: "Marguerite", M: "Lysander" },
  { resources: ["passion", "mystique"], F: "Seraphine", M: "Caspian" },
  { resources: ["devotion", "influence"], F: "Imogen", M: "Gideon" },
  { resources: ["devotion", "mystique"], F: "Lyra", M: "Evander" },
  { resources: ["influence", "mystique"], F: "Aurelia", M: "Rhys" }
]

export const PROTAGONIST_DECK_SIZE = 30

/** 30 protagonists, female then male for each pair. */
export const protagonistDeck: readonly ProtagonistCard[] = PAIRS.flatMap(
  ({ resources, F, M }): ProtagonistCard[] => [
    { kind: "protagonist", id: `${resources.join("-")}-f`, sex: "F", name: F, resources },
    { kind: "protagonist", id: `${resources.join("-")}-m`, sex: "M", name: M, resources }
  ]
)

if (protagonistDeck.length !== PROTAGONIST_DECK_SIZE) {
  throw new Error(
    `protagonistDeck: wrong card total — ${protagonistDeck.length}, expected ${PROTAGONIST_DECK_SIZE}`
  )
}

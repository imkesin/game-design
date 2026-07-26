import { FRUIT_LIST_WITH_METADATA, PLAYER_COUNTS } from "~/domain/CoreDefinitions"
import type { Card, CardDefinition, Deck } from "./domain"

const smallFields = FRUIT_LIST_WITH_METADATA.map(({ name, fieldName }) => ({
  kind: "field",
  id: `sm-${name.toLowerCase()}-field`,
  name: `Small ${name} ${fieldName}`,
  cost: {
    workers: 2,
    gold: 6
  },
  copies: {
    2: 1,
    3: 1,
    4: 1,
    5: 1
  },
  fruit: name,
  rows: [
    { capacity: 1, amount: 1 }
  ]
})) satisfies ReadonlyArray<CardDefinition>

const wildFields = FRUIT_LIST_WITH_METADATA.map(({ name, fieldName }) => ({
  kind: "field",
  id: `wild-${name.toLowerCase()}-field`,
  name: `Wild ${name} ${fieldName}`,
  cost: {
    gold: 2,
    workers: 1
  },
  copies: {
    2: 0,
    3: 0,
    4: 0,
    5: 1
  },
  fruit: name,
  rows: [
    { capacity: 2, amount: 1 },
    { capacity: 1, amount: 1 }
  ]
})) satisfies ReadonlyArray<CardDefinition>

const remoteFields = FRUIT_LIST_WITH_METADATA.map(({ name, fieldName }) => ({
  kind: "field",
  id: `remote-${name.toLowerCase()}-field`,
  name: `Remote ${name} ${fieldName}`,
  cost: {
    gold: 4,
    workers: 2
  },
  copies: {
    2: 0,
    3: 0,
    4: 1,
    5: 1
  },
  fruit: name,
  rows: [
    { capacity: 2, amount: 2 }
  ]
})) satisfies ReadonlyArray<CardDefinition>

const mediumFields = FRUIT_LIST_WITH_METADATA.map(({ name, fieldName }) => ({
  kind: "field",
  id: `md-${name.toLowerCase()}-field`,
  name: `Medium ${name} ${fieldName}`,
  cost: {
    gold: 8,
    workers: 3
  },
  copies: {
    2: 1,
    3: 1,
    4: 1,
    5: 1
  },
  fruit: name,
  rows: [
    { capacity: 1, amount: 1 },
    { capacity: 1, amount: 2 }
  ]
})) satisfies ReadonlyArray<CardDefinition>

const largeFields = FRUIT_LIST_WITH_METADATA.map(({ name, fieldName }) => ({
  kind: "field",
  id: `lg-${name.toLowerCase()}-field`,
  name: `Large ${name} ${fieldName}`,
  cost: {
    gold: 10,
    workers: 4
  },
  copies: {
    2: 0,
    3: 1,
    4: 1,
    5: 1
  },
  fruit: name,
  rows: [
    { capacity: 1, amount: 2 },
    { capacity: 2, amount: 3 }
  ]
})) satisfies ReadonlyArray<CardDefinition>

// Copy profiles for field-improvement cards, split into two informal groups.
const aImprovementCopies = { 2: 1, 3: 2, 4: 2, 5: 3 } as const
const bImprovementCopies = { 2: 1, 3: 1, 4: 2, 5: 2 } as const

export const fieldDeck: Deck = [
  ...smallFields,
  ...mediumFields,
  ...largeFields,
  ...remoteFields,
  ...wildFields,
  {
    kind: "field-improvement",
    id: "local-workforce",
    name: "Local Workforce",
    cost: {
      workers: 1,
      gold: 0
    },
    copies: aImprovementCopies,
    additionalText:
      "During a Harvest, you may pay 1 Gold to get a Temporary Worker. This Worker can only be applied to rows on the attached Field, and is immediately removed afterwards."
  },
  {
    kind: "field-improvement",
    id: "on-site-processing",
    name: "On-Site Processing",
    cost: {
      workers: 1,
      gold: 2
    },
    copies: aImprovementCopies,
    additionalText:
      "Whenever you Sell, you may remove 1 Fruit from this Field rather than taking it to market. If you do, collect 2 Gold. This does not count as an additional type being brought to the Market."
  },
  {
    kind: "field-improvement",
    id: "focus-on-quality",
    name: "Focus on Quality",
    cost: {
      workers: 1,
      gold: 1
    },
    copies: aImprovementCopies,
    additionalText:
      "When Fruit harvested from this Field is sold in the market, collect 3 additional Gold.\n\nA Field improved this way cannot produce more than 1 Fruit per Harvest."
  },
  {
    kind: "field-improvement",
    id: "dense-planting",
    name: "Dense Planting",
    cost: {
      workers: 2,
      gold: 0
    },
    copies: aImprovementCopies,
    additionalText:
      "Whenever this Field is harvested with using all rows, it yields 1 additional Fruit of the same type."
  },
  {
    kind: "field-improvement",
    id: "hillside-expansion",
    name: "Hillside Expansion",
    cost: {
      workers: 3,
      gold: 5
    },
    copies: bImprovementCopies,
    additionalText:
      "Add an additional row to this Field. It costs 2 Workers to Harvest, and produces 2 Fruit of the same type.\n\nThis additional row is placed below all other rows on the attached Field."
  },
  {
    kind: "field-improvement",
    id: "hybrid-rootstock",
    name: "Hybrid Rootstock",
    cost: {
      workers: 2,
      gold: 4
    },
    copies: bImprovementCopies,
    additionalText:
      "Whenever you Harvest all rows of this Field, you may produce one Fruit of any type you can already produce.\n\nThis different Fruit is produced instead of the standard output from the field."
  },
  {
    kind: "field-improvement",
    id: "ventilated-storage",
    name: "Ventilated Storage",
    cost: {
      workers: 3,
      gold: 5
    },
    copies: bImprovementCopies,
    additionalText:
      "When harvesting this Field, you may move up to 2 Fruits onto the improvement card. If this results in the Field rows being empty, you may harvest from the Field again."
  },
  {
    kind: "field-improvement",
    id: "irrigation-canals",
    name: "Irrigation Canals",
    cost: {
      workers: 3,
      gold: 5
    },
    copies: bImprovementCopies,
    additionalText:
      "Whenever all rows of this Field are harvested, you may retain one Worker that would otherwise be returned to the Labor Supply this turn."
  }
]

/**
 * Turn a catalog definition into a single physical card for preview, stamped
 * with the lowest player count at which it appears.
 */
export function previewCard({ copies, ...base }: CardDefinition): Card {
  const minPlayerCount = PLAYER_COUNTS.find((n) => copies[n] > 0) ?? PLAYER_COUNTS[0]
  return { ...base, minPlayerCount }
}

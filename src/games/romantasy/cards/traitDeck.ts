import { RESOURCE_IDS, type ResourceId, TRAIT_VALUES, type TraitCardDefinition, type TraitValue } from "./domain"

type ByValue<T> = readonly [T, T, T, T, T, T, T]

/**
 * Copies of each value 1–7, per resource. Allure is a third of the deck and
 * runs high; Prowess and Passion are the middle tier; the rest are scarce. The
 * mean card value is 4. See DESIGN.md.
 */
const COPIES: Record<ResourceId, ByValue<number>> = {
  allure: [2, 4, 6, 6, 6, 4, 2],
  prowess: [1, 2, 3, 3, 3, 2, 1],
  passion: [1, 2, 3, 3, 3, 2, 1],
  devotion: [1, 1, 2, 2, 2, 1, 1],
  influence: [1, 1, 2, 2, 2, 1, 1],
  mystique: [1, 1, 2, 2, 2, 1, 1]
}

/** Placeholder names, rising in intensity with the value. */
const NAMES: Record<ResourceId, ByValue<string>> = {
  allure: [
    "Lingering Glance",
    "Wry Smile",
    "Effortless Charm",
    "Smoldering Gaze",
    "Devastating Grin",
    "Magnetic Presence",
    "Irresistible"
  ],
  prowess: [
    "Steady Hands",
    "Quick Reflexes",
    "Battle Scars",
    "Blade Mastery",
    "Fearless Charge",
    "Legendary Duelist",
    "Dragonslayer"
  ],
  passion: [
    "Flushed Cheeks",
    "Racing Pulse",
    "Stolen Kiss",
    "Burning Desire",
    "Fevered Longing",
    "Wildfire",
    "Heart Ablaze"
  ],
  devotion: [
    "Small Kindness",
    "Loyal Heart",
    "Quiet Sacrifice",
    "Sworn Promise",
    "Steadfast Vow",
    "Unbreakable Bond",
    "Eternal Oath"
  ],
  influence: [
    "Useful Friend",
    "Court Whispers",
    "Noble Name",
    "Powerful Ally",
    "Seat on the Council",
    "Throne Claim",
    "Kingmaker"
  ],
  mystique: [
    "Odd Silence",
    "Unreadable Eyes",
    "Hidden Past",
    "Whispered Prophecy",
    "Ancient Secret",
    "Forbidden Magic",
    "Fated by the Stars"
  ]
}

export const TRAIT_DECK_SIZE = 90

/** The shared draw deck: one definition per printed face, 42 faces in all. */
export const traitDeck: readonly TraitCardDefinition[] = RESOURCE_IDS.flatMap((resource) =>
  TRAIT_VALUES.map((value: TraitValue, i) => ({
    kind: "trait" as const,
    id: `${resource}-${value}`,
    resource,
    value,
    name: NAMES[resource][i]!,
    copies: COPIES[resource][i]!
  }))
)

const total = traitDeck.reduce((n, card) => n + card.copies, 0)
if (total !== TRAIT_DECK_SIZE) {
  throw new Error(`traitDeck: wrong card total — ${total}, expected ${TRAIT_DECK_SIZE}`)
}

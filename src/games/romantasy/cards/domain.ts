export const RESOURCE_IDS = [
  "allure",
  "prowess",
  "passion",
  "devotion",
  "influence",
  "mystique"
] as const

export type ResourceId = (typeof RESOURCE_IDS)[number]

/** Keys of `~/shared/components/paperFrame`'s palette that a resource may take. */
export type ResourceColor = "pink" | "red" | "orange" | "blue" | "amber" | "violet"

export type Resource = {
  readonly id: ResourceId
  readonly name: string
  readonly color: ResourceColor
}

/** Trait numbers run 1 through 7. */
export const TRAIT_VALUES = [1, 2, 3, 4, 5, 6, 7] as const

export type TraitValue = (typeof TRAIT_VALUES)[number]

/**
 * A trait. Its number does triple duty: the discards it costs to play, the
 * capacity it yields when exhausted, and the energy it is worth if discarded
 * for the power bowl.
 */
export type TraitCard = {
  readonly kind: "trait"
  /** `<resource>-<value>`, e.g. `allure-4`. Unique per printed face. */
  readonly id: string
  readonly resource: ResourceId
  readonly value: TraitValue
  readonly name: string
}

export type TraitCardDefinition = TraitCard & { readonly copies: number }

export type Sex = "F" | "M"

/**
 * A protagonist. `resources` are its two baseline symbols: each is a pre-played
 * trait worth `BASELINE_VALUE`, exhausted and paid for like any other.
 */
export type ProtagonistCard = {
  readonly kind: "protagonist"
  readonly id: string
  readonly sex: Sex
  readonly name: string
  readonly resources: readonly [ResourceId, ResourceId]
}

/** Placeholder: what number a baseline symbol carries. Implied on the card, not printed. */
export const BASELINE_VALUE = 1

/** Trait slots per protagonist; the tableau cap. */
export const TRAIT_SLOTS = 4

/**
 * Expand a flat-copy catalog into the physical deck: one entry per printed
 * copy, in catalog order.
 */
export function expandFlatDeck<T extends { readonly copies: number }>(
  source: readonly T[]
): ReadonlyArray<Omit<T, "copies">> {
  return source.flatMap(({ copies, ...card }) => Array.from({ length: copies }, () => card))
}

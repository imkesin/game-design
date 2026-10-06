export const QUALITY_IDS = [
  "allure",
  "prowess",
  "passion",
  "devotion",
  "influence",
  "mystique"
] as const

export type QualityId = (typeof QUALITY_IDS)[number]

/** Keys of `~/shared/components/paperFrame`'s palette that a quality may take. */
export type QualityColor = "blue" | "red" | "yellow" | "purple" | "green" | "zinc"

/** Which step of the colour scale a quality inks its numbers and marks in; 700 unless it needs lightening or darkening. */
export type InkShade = 600 | 700 | 900

export type Quality = {
  readonly id: QualityId
  readonly name: string
  readonly color: QualityColor
  readonly inkShade: InkShade
}

/** Trait numbers run 1 through 7. */
export const TRAIT_VALUES = [1, 2, 3, 4, 5, 6, 7] as const

export type TraitValue = (typeof TRAIT_VALUES)[number]

/**
 * A trait. Its number does triple duty: the discards it costs to play, the
 * capacity it yields when exhausted, and the Drive it is worth if discarded
 * for Motivate.
 */
export type TraitCard = {
  readonly kind: "trait"
  /** `<quality>-<value>`, e.g. `allure-4`. Unique per printed face. */
  readonly id: string
  readonly quality: QualityId
  readonly value: TraitValue
  readonly name: string
}

export type TraitCardDefinition = TraitCard & { readonly copies: number }

/**
 * A protagonist. `qualities` are its two baseline symbols: each is a pre-played
 * trait worth `BASELINE_VALUE`, exhausted and paid for like any other.
 */
export type ProtagonistCard = {
  readonly kind: "protagonist"
  readonly id: string
  readonly name: string
  readonly qualities: readonly [QualityId, QualityId]
}

/** Placeholder: what number a baseline symbol carries. Implied on the card, not printed. */
export const BASELINE_VALUE = 1

/** What a scene cost may ask for in place of a specific quality: any type will do. */
export const ANY_QUALITY = "any"

export type AnyQuality = typeof ANY_QUALITY

export const COST_AMOUNTS = [1, 2, 3, 4, 5] as const

export type CostAmount = (typeof COST_AMOUNTS)[number]

/** One part of a scene's cost: `amount` of `quality`, paid by a single protagonist. */
export type Requirement = {
  readonly quality: QualityId | AnyQuality
  readonly amount: CostAmount
}

export const MINOR_ACTIONS = ["explore", "motivate", "develop"] as const

/**
 * What every player who did not contend for a scene does instead. Explore draws
 * cards; Motivate adds Drive and removes exhaustion; Develop plays traits.
 */
export type MinorAction = (typeof MINOR_ACTIONS)[number]

/**
 * A scene. `cost` is the minimum to start a contention (one part or two), not
 * the price: contenders overpay to outbid each other. Scene VP and abilities
 * are deliberately undefined.
 */
export type SceneCard = {
  readonly kind: "scene"
  readonly id: string
  readonly name: string
  readonly cost: readonly [Requirement] | readonly [Requirement, Requirement]
  readonly action: MinorAction
}

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

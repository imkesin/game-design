import type {
  AnimalCardDefinition,
  AnimalSpeciesId,
  Order,
  PaletteColor,
  Rate,
  Resource,
  ResourceAmount,
  ResourceId
} from "./domain"
import { RESOURCE_IDS } from "./domain"
import { RESOURCE_BY_ID } from "./resources"

/**
 * The animal deck: 56 cards, seven species by all eight resources.
 *
 * Every species eats exactly one resource and eats it forever. That pairing is
 * the deck's mnemonic, and it is reinforced twice over — a species also takes
 * its resource's own colour, so the Moose card *is* the chocolate colour.
 *
 *     Moose Chocolate · Bear Blueberries · Bighorn Bananas · Loon Eggs
 *     Lynx Milk · Fox Butter · Beaver Flour
 *
 * Maple Syrup belongs to nobody, and that asymmetry is why the matrix is 7 by 8
 * rather than square: there are only seven species because syrup can be made by
 * any of them and fed to none, but each species covers all eight resources as
 * outputs, because the eighth is its own (see `MULTIPLIER`).
 *
 * All 56 are generated. Only one thing varies card to card — the exchange rate
 * (`rateFor`). Hire is a property of the species and is identical across its
 * eight (`SPECIES`), and so is the order.
 *
 * Every species carries a `rates` table, and there are only two of them: the
 * four base-eaters share one, the three topping-eaters the other. So the whole
 * 56-card matrix is eight authored numbers plus who eats what.
 *
 * `OVERRIDES` is the escape hatch for a single card the rules get wrong. It is
 * currently empty.
 */

/**
 * A species' own authored rate table, superseding the derivation for all eight
 * of its cards. Four rows, because four is all the distinctions there are: the
 * three output tiers, plus `self` broken out from whichever tier it belongs to.
 *
 * Both sides of every row are authored. Letting the *spend* vary is what makes
 * a table able to sit a row where the payouts can't reach — Syrup is worth four
 * base, so charging more for it is the only way to price it honestly without
 * paying out a fraction of a syrup.
 *
 * A species with no table falls back to `rateFor`'s derivation. The two are not
 * meant to agree: the derivation prices a card against the board's printed
 * rungs, and a table prices it against what the rungs do not know.
 *
 * Syrup is the standing example. Nothing in the game charges it — not one hire,
 * not one order — because it is being held back to carry scoring later. So its
 * printed worth of four base is the *only* claim on it, and a table is free to
 * disagree with that in a way the derivation never can.
 */
type RateTable = {
  /** The species' own resource — its multiplier. */
  readonly self: Rate
  /** Any base resource that is not the species' own. */
  readonly base: Rate
  readonly topping: Rate
  readonly syrup: Rate
}

/**
 * The four base-eaters — Beaver, Fox, Lynx and Loon — share one table, so a
 * player who has learned any of them has learned all four.
 *
 * Net value per turn comes out +1 / +2 / +1 / +1 against the board's own rungs,
 * which is as flat as four rows with different outputs can reasonably be. Two
 * choices carry that:
 *
 *   - Syrup charges 3 rather than paying out less. Every other row spends one.
 *   - `self` pays 2 where another base pays 3, and is still worth taking,
 *     because it is the one card in the column whose output is its own input.
 *     It runs forever off a single piece; every other row needs a fresh one
 *     each turn from somewhere else. Slow and self-sustaining against fast and
 *     dependent.
 */
const BASE_EATER_RATES: RateTable = {
  self: { spend: 1, receive: 2 },
  base: { spend: 1, receive: 3 },
  topping: { spend: 1, receive: 1 },
  syrup: { spend: 3, receive: 1 }
}

/**
 * The three topping-eaters — Moose, Bear and Bighorn — share the other table.
 *
 * They move in bigger lots, which is the whole difference: where a base-eater
 * spends one piece, these spend two to four. The headline nets look enormous
 * beside the base-eaters' +1 and +2, and mostly are not — a spend of 3 toppings
 * takes two card-actions to assemble where a spend of 1 base takes a third of
 * one, so per action they land around twice a base-eater, which is what they
 * cost twice as much to hire for.
 *
 * Against the board's printed rungs they run 1.5x to 2x, the same band the
 * base-eaters occupy. The base row is x3, matching the base-eaters' own base
 * row, and is the weakest of the four whatever number it takes: a base x3 card
 * is one action for three base with nothing spent, so no converter can beat the
 * deck on base volume — it would need `3 -> 15` to draw level. What that row is
 * for is precision, getting the one ingredient a four-slot display does not
 * happen to be showing when a pancake needs all four.
 */
const TOPPING_EATER_RATES: RateTable = {
  self: { spend: 2, receive: 4 },
  topping: { spend: 3, receive: 6 },
  base: { spend: 3, receive: 9 },
  syrup: { spend: 4, receive: 3 }
}

type Species = {
  readonly id: AnimalSpeciesId
  readonly name: string
  readonly input: ResourceId
  readonly color: PaletteColor
  readonly hire: readonly ResourceAmount[]
  readonly order: Order
  readonly rates: RateTable
}

/**
 * In chain order of the good each eats, so the roster reads left to right along
 * the market.
 *
 * Hire is flat within a species — all eight Moose cost the same — and every
 * animal pays in the good it eats. What varies is whether anything joins it:
 *
 *     Moose · Bear · Bighorn    4 of its own topping              8
 *     Loon · Lynx · Fox         2 of its own base + 1 topping     4
 *     Beaver                    2 Flour                           2
 *
 * The three mid base-eaters pay the topping three rungs up the chain — Eggs
 * pays Chocolate, Milk pays Blueberries, Butter pays Bananas. Beaver is where
 * that runs out of chain: three rungs up from Flour lands on Eggs, which is
 * base and not a topping, so it pays nothing beyond its feed. At 2 it is the
 * cheapest animal on the board and the way into the deck, and it is not a
 * discount — its order is the heaviest of the four base-eaters.
 *
 * The topping-eaters simply pay double their own, which is a rule rather than
 * the broken remains of one: three rungs up from a topping clamps to Syrup, and
 * Syrup is deliberately absent from every cost in the game (see `RateTable`).
 */
const SPECIES: readonly Species[] = [
  {
    id: "moose",
    name: "Moose",
    input: "chocolate",
    color: "brown",
    hire: [{ count: 4, resource: "chocolate" }],
    rates: TOPPING_EATER_RATES,
    order: { pancakes: ["choco-chip", "choco-chip"], syrup: 0, points: 2 }
  },
  {
    id: "bear",
    name: "Bear",
    input: "blueberries",
    color: "violet",
    hire: [{ count: 4, resource: "blueberries" }],
    rates: TOPPING_EATER_RATES,
    order: { pancakes: ["blueberry", "blueberry"], syrup: 0, points: 2 }
  },
  {
    id: "bighorn",
    name: "Bighorn",
    input: "bananas",
    color: "yellow",
    hire: [{ count: 4, resource: "bananas" }],
    rates: TOPPING_EATER_RATES,
    order: { pancakes: ["banana", "banana"], syrup: 0, points: 2 }
  },
  {
    id: "loon",
    name: "Loon",
    input: "eggs",
    color: "orange",
    hire: [{ count: 2, resource: "eggs" }, { count: 1, resource: "chocolate" }],
    order: { pancakes: ["choco-chip"], syrup: 0, points: 1 },
    rates: BASE_EATER_RATES
  },
  {
    id: "lynx",
    name: "Lynx",
    input: "milk",
    color: "cyan",
    hire: [{ count: 2, resource: "milk" }, { count: 1, resource: "blueberries" }],
    order: { pancakes: ["blueberry"], syrup: 0, points: 1 },
    rates: BASE_EATER_RATES
  },
  {
    id: "fox",
    name: "Fox",
    input: "butter",
    color: "lime",
    hire: [{ count: 2, resource: "butter" }, { count: 1, resource: "bananas" }],
    order: { pancakes: ["banana"], syrup: 0, points: 1 },
    rates: BASE_EATER_RATES
  },
  {
    id: "beaver",
    name: "Beaver",
    input: "flour",
    color: "stone",
    hire: [{ count: 2, resource: "flour" }],
    order: { pancakes: ["plain", "topped"], syrup: 0, points: 1 },
    rates: BASE_EATER_RATES
  }
]

/** Per-card fixes for anything the rules get wrong. Keyed by card id. */
const OVERRIDES: Partial<Record<string, Partial<Pick<AnimalCardDefinition, "rate" | "hire" | "order">>>> = {}

/**
 * The exchange rate for one card: a lookup into its species' table, with the
 * card whose output is its own input taking the `self` row.
 *
 * There is no derivation left. Rates were generated from the board's printed
 * rungs plus a two-thirds toll until every species had been authored, at which
 * point the arithmetic was unreachable and went. What it was for survives as
 * the sanity check on the two tables: both sit between 1.3x and 3x the rate the
 * ladders print, which is the band where an animal is worth an action without
 * making the market pointless.
 */
function rateFor(species: Species, input: Resource, output: Resource): Rate {
  const table = species.rates
  return input.id === output.id ? table.self : table[output.category]
}

function cardFor(species: Species, outputId: ResourceId): AnimalCardDefinition {
  const input = RESOURCE_BY_ID[species.input]
  const output = RESOURCE_BY_ID[outputId]
  const id = `${species.id}-${outputId}`

  return {
    kind: "animal",
    id,
    species: species.id,
    name: species.name,
    color: species.color,
    input: input.id,
    output: output.id,
    rate: rateFor(species, input, output),
    hire: species.hire,
    order: species.order,
    copies: 1,
    ...OVERRIDES[id]
  }
}

/**
 * Grouped by species, outputs in chain order — the order the deck prints in.
 * Nothing is filtered out: a species' own resource is its multiplier, and sits
 * at its own position in the chain within its eight.
 */
export const animalDeck: readonly AnimalCardDefinition[] = SPECIES.flatMap((species) =>
  RESOURCE_IDS.map((outputId) => cardFor(species, outputId))
)

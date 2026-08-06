import type { ResourceCardDefinition, ResourceId } from "./domain"

/**
 * The resource deck: 64 cards, eight of each resource, in trade-chain order.
 *
 * A resource prints at the denominations its tier allows, and each
 * denomination carries a mandatory market shift — that many rungs, on any
 * market that does not price the resource being taken, in either direction (see
 * `ResourceCard`):
 *
 *     Syrup    x1  shift 1
 *     Topping  x1  shift 1    x2      no shift
 *     Base     x2  shift 2    x3  shift 1
 *
 * Two things in that table are deliberate. First, within a tier the *small*
 * card is the disruptive one: base 2s move the market twice as far as base 3s,
 * so a player who wants a little flour has to shove the economy harder than one
 * who wants a lot of it. Taking bulk is quiet; taking scraps is loud. Second,
 * the topping 2s are now the only card in the deck with no rider at all — the
 * one clean way to buy into the middle tier, and the only draw that leaves the
 * board exactly as it found it.
 *
 * Copies are flat: eight cards of every resource, 8x8, split evenly between
 * that resource's two denominations (Syrup has only one, so it takes all eight).
 * Flat per resource still comes out a pyramid per tier, because the tiers are
 * not the same size — base is four resources and so half the deck (32),
 * toppings three and so 24, syrup one and so 8. The same shape falls out of the
 * value in the deck: 80 base-units of base, 72 of toppings, 32 of syrup.
 *
 * An even split within a resource means 52 of the 64 cards carry a shift. The
 * only exception is the topping 2s — twelve cards, the deck's one quiet pocket.
 */

/** One printed denomination of a resource. Every resource has two; Syrup has one. */
type Denomination = {
  readonly quantity: number
  readonly shift: number
  readonly copies: number
}

const SYRUP: readonly Denomination[] = [
  { quantity: 1, shift: 1, copies: 8 }
]

const TOPPING: readonly Denomination[] = [
  { quantity: 1, shift: 1, copies: 4 },
  { quantity: 2, shift: 0, copies: 4 }
]

const BASE: readonly Denomination[] = [
  { quantity: 2, shift: 2, copies: 4 },
  { quantity: 3, shift: 1, copies: 4 }
]

/** Denominations per resource, in trade-chain order — the deck's whole composition. */
const COMPOSITION: ReadonlyArray<readonly [ResourceId, readonly Denomination[]]> = [
  ["maple-syrup", SYRUP],
  ["chocolate", TOPPING],
  ["blueberries", TOPPING],
  ["bananas", TOPPING],
  ["eggs", BASE],
  ["milk", BASE],
  ["butter", BASE],
  ["flour", BASE]
]

export const resourceDeck: readonly ResourceCardDefinition[] = COMPOSITION.flatMap(
  ([resource, denominations]) =>
    denominations.map(({ quantity, shift, copies }) => ({
      kind: "resource" as const,
      id: `${resource}-${quantity}`,
      resource,
      quantity,
      shift,
      copies
    }))
)

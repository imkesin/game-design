import type { Pancake, PancakeId, Resource, ResourceAmount, ResourceId } from "./domain"

/**
 * The eight resources, in trade-chain order (see `tradeTracks.ts`). These are
 * the goods themselves — the cards that carry them, in their denominations,
 * are in `resourceDeck.ts`.
 *
 * Colours are picked for separation first, literalism second: these print as
 * eight banners standing side by side on the board, so any two that read alike
 * read as one column. The pale staples are the hard case — eggs, milk, butter
 * and flour are all off-white in life and would be four greys here — so only
 * flour keeps a grey, and butter takes lime purely because nothing warm was
 * left unclaimed. Swap any of these freely; nothing but the banner depends on
 * them — except red, which is spoken for. The blank card takes it (see
 * `BlankCard`), and it is the only card in the bag that has to be identifiable
 * before it is read.
 */
export const resources: readonly Resource[] = [
  { id: "maple-syrup", name: "Maple Syrup", color: "amber", category: "syrup" },
  { id: "chocolate", name: "Chocolate", color: "brown", category: "topping" },
  { id: "blueberries", name: "Blueberries", color: "violet", category: "topping" },
  { id: "bananas", name: "Bananas", color: "yellow", category: "topping" },
  { id: "eggs", name: "Eggs", color: "orange", category: "base" },
  { id: "milk", name: "Milk", color: "cyan", category: "base" },
  { id: "butter", name: "Butter", color: "lime", category: "base" },
  { id: "flour", name: "Flour", color: "stone", category: "base" }
]

/** Lookup by id, for the board and any other consumer that holds only an id. */
export const RESOURCE_BY_ID = Object.fromEntries(
  resources.map((r) => [r.id, r])
) as Record<ResourceId, Resource>

/**
 * The four pancakes. `topping` is the resource that names it, and is the only
 * thing that distinguishes one from another — every pancake also needs base,
 * but that requirement is uniform and so is not printed per pancake.
 *
 * Each takes its topping's own colour, so an order reads as the toppings it
 * will cost. Plain has no topping to borrow from and takes amber, the syrup
 * end of the palette: it is the pancake a diner makes out of nothing but
 * staples.
 */
export const pancakes: readonly Pancake[] = [
  { id: "plain", name: "Plain", color: "amber" },
  { id: "banana", name: "Banana", topping: "bananas", color: "yellow" },
  { id: "blueberry", name: "Blueberry", topping: "blueberries", color: "violet" },
  { id: "choco-chip", name: "Choco-Chip", topping: "chocolate", color: "brown" }
]

export const PANCAKE_BY_ID = Object.fromEntries(
  pancakes.map((p) => [p.id, p])
) as Record<PancakeId, Pancake>

/**
 * The batter under every pancake: one of each base resource, never more than
 * one of any.
 *
 * "One of each" rather than "four of anything" is the load-bearing part. Resource
 * cards arrive in lumps of a single good — two or three Flour, never a spread —
 * so a player taking cards is always lopsided, and a pile of Flour cooks
 * nothing on its own. That is the job the base-eating animals do: their
 * `1 own -> 3 other base` row turns a surplus into the three things it is not,
 * which is worth an action even though a resource card of the same size is
 * worth the same raw value. The card gives you whatever is face up; the animal
 * gives you the one you are missing.
 *
 * It also sets the floor price of a point. Four base is 4 base-units, plus 2
 * for a topping on any variant, against orders that all score the same 1.
 */
export const PANCAKE_BASE: readonly ResourceId[] = ["eggs", "milk", "butter", "flour"]

/** Everything one pancake costs: the base four, plus its topping if it has one. */
export function pancakeCost(pancake: Pancake): readonly ResourceAmount[] {
  const batter = PANCAKE_BASE.map((resource) => ({ count: 1, resource }))
  return pancake.topping === undefined
    ? batter
    : [...batter, { count: 1, resource: pancake.topping }]
}

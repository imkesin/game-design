import type { BlankCardDefinition, ForageCardDefinition, ResourceId } from "./domain"

/**
 * The forage bag: 70 cards — seven of every resource, plus fourteen blanks —
 * drawn one at a time, face down. Not a market. There is no face-up row of
 * goods to plan around and no price to pay: you go out, you reach in, and you
 * take whatever your hand closes on.
 *
 * Foraging is the bootstrap and nothing more. It is how you get the first goods
 * in front of you, and it is deliberately the worst action in the game to still
 * be taking on turn twenty — the animals and the trade tracks are the reliable
 * economy, and the bag exists to hand you enough raw material to reach them.
 * Everything below is in service of making that arc happen on its own, without
 * a rule anywhere that says "stop foraging".
 *
 * A resource prints at the denominations its tier allows, and each
 * denomination carries a mandatory market shift — that many rungs, on any
 * market that does not price the resource being drawn, in either direction (see
 * `ResourceCard`):
 *
 *     Syrup    x1  shift 1
 *     Topping  x1  shift 1    x2      no shift
 *     Base     x2  shift 2    x3  shift 1
 *
 * Within a tier the *small* card is the disruptive one: base 2s move the market
 * twice as far as base 3s. Under the old face-up market that was a tradeoff —
 * a player who wanted a little flour had to shove the economy harder than one
 * who wanted a lot of it. Blind, nobody chooses their denomination, so the
 * spread is no longer a decision. It survives because the *aim* still is: the
 * card says how far you must move a marker, and you say which marker and which
 * way. A thin draw hands you a big lever, which is the closest thing to
 * compensation a bad reach into the bag gets.
 *
 * Copies run 4 small to 3 large, weighted to the small denomination and so to
 * the loud one. 47 of the 56 resource cards carry a shift; the nine topping 2s
 * are the bag's one quiet pocket, and the blanks are quieter still.
 *
 * Seven per resource comes out a pyramid per tier, because the tiers are not
 * the same size — base is four resources and so 28 cards, toppings three and so
 * 21, syrup 7. The value runs the same way: 68 base-units of base, 30 of
 * toppings, 7 of syrup.
 *
 * Syrup sits at seven like everything else, and does not need the short count it
 * used to carry. Scarcity now comes from the draw rather than the census: a
 * player who needs syrup cannot go and buy syrup, they can only reach in and
 * hope, and 7 in 70 is a one-in-ten hope. The animals remain the reliable
 * source — every species prints a syrup row, and a topping-eater's `4 -> 3` is
 * a genuine engine. The bag is not syrup's supply; it is syrup's luck.
 *
 * ---
 *
 * The blanks are the reason this is a bag and not a face-down deck.
 *
 * A drawn resource leaves the bag for good. A drawn blank goes back in. So the
 * bag does not deplete evenly — it sours. Fourteen blanks against a falling
 * count of goods means the odds of coming up empty climb from one turn to the
 * next, without anybody tracking anything:
 *
 *     goods left    56    42    28    14     7     0
 *     draw a blank  20%   25%   33%   50%   67%   100%
 *
 * That curve is the game's clock, and it costs no component to run. It is also
 * why nothing needs to *tell* a player to stop foraging: the action decays on
 * its own, and by the time an engine could have been built, reaching into the
 * bag is a coin flip. A player who spent the early game hiring is holding a
 * machine; a player who spent it foraging is holding a bag of blanks.
 *
 * Fourteen, not seven. Both counts run the identical curve — doubling the
 * blanks does not bend it, it only advances it, since `14/(R+14)` is exactly
 * `7/(R/2+7)`. The bag is as sour at 56 goods as a seven-blank bag is at 28. So
 * the choice is purely about *when* the sour half of the game starts, and
 * fourteen starts it at the opening rather than the midpoint.
 *
 * That is the right trade here because foraging is not meant to be a strategy.
 * At seven blanks the opening whiff rate is one in nine, which reads as noise —
 * a player never quite learns that the bag is unreliable, and so never feels
 * pushed off it. One in five is felt immediately, from the first turn, and the
 * lesson lands while it is still cheap to act on. The cost is real and worth
 * naming: the early game is the worst place to put variance, because a dead
 * action on turn two has no engine to fall back on. That is the price of making
 * foraging a phase instead of a plan.
 *
 * The arithmetic of the whole arc: draining every good out of the bag would
 * take about 121 forage actions, against 88 at seven blanks. Nobody will ever
 * do that — the point is the shape. The first half of the goods costs ~38
 * forages and the second half ~83, so the bag punishes persistence far harder
 * than it punishes entry.
 *
 * A blank does nothing else. It does not shift the market, does not cost the
 * turn anything beyond the action already spent, and is not held. It is drawn,
 * shown, and dropped back in. The temptation to give it a consolation rider is
 * worth resisting: the whole point is that the action can genuinely fail, and a
 * failure that pays out is not one.
 */

/** One printed denomination of a resource. Every resource has two; Syrup has one. */
type Denomination = {
  readonly quantity: number
  readonly shift: number
  readonly copies: number
}

const SYRUP: readonly Denomination[] = [
  { quantity: 1, shift: 1, copies: 7 }
]

const TOPPING: readonly Denomination[] = [
  { quantity: 1, shift: 1, copies: 4 },
  { quantity: 2, shift: 0, copies: 3 }
]

const BASE: readonly Denomination[] = [
  { quantity: 2, shift: 2, copies: 4 },
  { quantity: 3, shift: 1, copies: 3 }
]

/** Denominations per resource, in trade-chain order. */
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

/** The fourteen that go back in. See the note above for why there are this many. */
const BLANKS: BlankCardDefinition = { kind: "blank", id: "empty-handed", copies: 14 }

export const forageBag: readonly ForageCardDefinition[] = [
  ...COMPOSITION.flatMap(([resource, denominations]) =>
    denominations.map(({ quantity, shift, copies }) => ({
      kind: "resource" as const,
      id: `${resource}-${quantity}`,
      resource,
      quantity,
      shift,
      copies
    }))
  ),
  BLANKS
]

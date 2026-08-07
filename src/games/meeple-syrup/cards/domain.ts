export const RESOURCE_IDS = [
  "maple-syrup",
  "chocolate",
  "blueberries",
  "bananas",
  "eggs",
  "milk",
  "butter",
  "flour"
] as const

export type ResourceId = (typeof RESOURCE_IDS)[number]

/**
 * The three tiers the resource chain divides into, and the only thing that
 * decides which denominations a resource prints at (see `forageBag.ts`).
 *
 *   - `syrup` — Maple Syrup alone. The scarce currency: it prints in 1s only,
 *     and is scarce by how rarely the bag yields it (one draw in ten, falling)
 *     rather than by how few of it the bag holds.
 *   - `topping` — the three that give a pancake its name.
 *   - `base` — the four staples every pancake needs, whatever its topping.
 */
export const RESOURCE_CATEGORIES = ["syrup", "topping", "base"] as const

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number]

/** Keys of `~/shared/components/paperFrame`'s palette — the scales every card tints with. */
export type PaletteColor =
  | "red"
  | "blue"
  | "orange"
  | "yellow"
  | "amber"
  | "lime"
  | "green"
  | "violet"
  | "purple"
  | "pink"
  | "stone"
  | "brown"
  | "zinc"
  | "cyan"
  | "neutral"

/** The subset one resource takes — see `resources.ts` for why each picks its own. */
export type ResourceColor = PaletteColor

/**
 * A resource: a good the market prices, not a card. Cards come in denominations
 * *of* a resource (`ResourceCard`), and the board's banners and ladders are
 * drawn from these entries too, so this is the one place a resource's name and
 * colour live.
 */
export type Resource = {
  readonly id: ResourceId
  readonly name: string
  readonly color: ResourceColor
  readonly category: ResourceCategory
}

/**
 * A resource card: `quantity` units of one resource, plus the market rider its
 * denomination carries.
 *
 * The card is a collection instruction rather than a thing anyone holds — the
 * goods themselves are physical pieces, and drawing this card moves `quantity`
 * of them into your player zone. So a denomination shapes how goods arrive in
 * lumps, and nothing else: once they are pieces, any whole amount can be spent,
 * which is why the animal rates are free to ask for one of something the bag
 * only ever hands out two or three at a time.
 *
 * `shift` is how many rungs the drawer must move, on any market *other* than
 * the ones that price the resource drawn — draw Blueberries and neither the
 * Chocolate/Blueberries nor the Blueberries/Bananas track may move. Direction
 * is the drawer's to choose. It is mandatory, not a bonus: `0` is the only way
 * a card is inert. Which denominations carry it, and how hard, is authored in
 * `forageBag.ts`; the short version is that the small denominations shove the
 * market hardest, so a thin draw is a louder one.
 *
 * Since the bag is blind, nobody picks their denomination, and so nobody picks
 * how loud they are. What is still chosen is the aim — which of the markets,
 * and which direction. The card sets the size of the lever and the player
 * decides where to put it.
 *
 * A resource sits between two tracks, or one if it is at an end of the chain
 * (Maple Syrup and Flour), so a shift always has at least five of the seven
 * markets to land on and can never be stranded. What the rule buys is that a
 * player can never take a good and use the same action to move its own price.
 *
 * The shift resolves on drawing the card, not later — the draw and its
 * consequence are one action, and a table full of deferred shifts would be
 * unplayable.
 */
export type ResourceCard = {
  readonly kind: "resource"
  /** `<resource>-<quantity>`, e.g. `flour-3`. Unique per denomination. */
  readonly id: string
  readonly resource: ResourceId
  readonly quantity: number
  readonly shift: number
}

/**
 * A blank: the draw that found nothing.
 *
 * It has no fields because it has no rules — it is not a resource, not a
 * quantity, and carries no shift. Drawn, shown, and dropped straight back into
 * the bag, which is what makes the bag sour as the goods run out (see
 * `forageBag.ts` for the curve and for why there are seven).
 *
 * It is typed as a card rather than left out of the model because it is a
 * physical printed card in the same trim as every other, and the print sheet
 * has to lay it out.
 */
export type BlankCard = {
  readonly kind: "blank"
  readonly id: "empty-handed"
}

/** Anything the bag can hand you. */
export type ForageCard = ResourceCard | BlankCard

export type ResourceCardDefinition = ResourceCard & { readonly copies: number }

export type BlankCardDefinition = BlankCard & { readonly copies: number }

export type ForageCardDefinition = ResourceCardDefinition | BlankCardDefinition

export const PANCAKE_IDS = ["plain", "banana", "blueberry", "choco-chip"] as const

export type PancakeId = (typeof PANCAKE_IDS)[number]

/**
 * A pancake. Every pancake needs base; a topping is what gives it a name, so
 * `topping` is the whole difference between the four — and `plain`, needing
 * none, is the one order that never touches the topping market.
 */
export type Pancake = {
  readonly id: PancakeId
  readonly name: string
  readonly topping?: ResourceId
  readonly color: PaletteColor
}

/** A number of pieces of one resource, as printed in a hire cost or a recipe. */
export type ResourceAmount = {
  readonly count: number
  readonly resource: ResourceId
}

/**
 * The seven animals. Each is bound for life to one resource — the good it
 * eats — and that pairing is the deck's whole mnemonic:
 *
 *     Moose Chocolate · Bear Blueberries · Bighorn Bananas · Loon Eggs
 *     Lynx Milk · Fox Butter · Beaver Flour
 *
 * Maple Syrup is the eighth resource and no animal's, which is why there are
 * seven species and not eight: syrup can only ever be *made*, never fed to
 * anything. The deck is still 7x8, because each species covers all eight
 * resources as outputs — the eighth being its own (see `animalDeck.ts`).
 */
export const ANIMAL_SPECIES_IDS = [
  "moose",
  "bear",
  "bighorn",
  "loon",
  "lynx",
  "fox",
  "beaver"
] as const

export type AnimalSpeciesId = (typeof ANIMAL_SPECIES_IDS)[number]

/**
 * First to seven wins.
 *
 * Seven is the smallest target that cannot be reached with two animals. The
 * most any single animal is worth is three — a topping-eater's two plus the
 * syrup — so two caps at six, and seven forces a third diner through the door.
 *
 * It also shapes *which* three. Base-eaters top out at two apiece, so three of
 * them reach only six: any three-animal win needs at least one topping-eater,
 * and one topping-eater with two base-eaters is exactly seven. Play cheap
 * instead and four base-eaters get there, also exactly. So the target sets a
 * floor of three, a comfortable four, and no ceiling on taking longer.
 */
export const TARGET_SCORE = 7

/**
 * Each player opens with this much syrup in front of them.
 *
 * Two, and two is not a round number picked for feel — it is the exact price of
 * the opening the game most needs to exist. The Maple Syrup / Chocolate track
 * opens at `2:4` (see `tradeTracks.ts`) and a topping-eater hires for 4 of its
 * topping (see `animalDeck.ts`), so:
 *
 *     2 syrup --trade--> 4 chocolate --recruit--> Moose
 *
 * Two actions, from nothing, on turn one. That is the whole rationale. Starting
 * syrup is not a scoring gift here, it is seed capital, and it is denominated
 * in exactly one animal.
 *
 * Why that animal specifically. Topping-eaters are the hard hire — 4 of one
 * named topping, which the bag hands out roughly one draw in eight and which
 * cannot be substituted — and `TARGET_SCORE` says every three-animal win needs
 * at least one of them. So the game asks for a topping-eater and then makes
 * topping-eaters the thing foraging is worst at supplying. Seed syrup is the
 * answer to that, and it is a targeted one: syrup sits at the end of the trade
 * chain next to Chocolate, so it reaches the topping tier in a single trade and
 * the staples end not at all. You cannot bootstrap a Beaver with it. The head
 * start only points one direction, which is the direction that needed help.
 *
 * It is a real decision and not a scripted opening, because two syrup is also
 * two points — the retire bonus is one syrup per animal, capped, so hoarding
 * these two is two of the seven you need, banked before anyone has moved. Spend
 * them and you are three or four turns ahead with nothing in the bank; keep
 * them and you forage for your first animal like everyone else but need one
 * fewer animal to win. The old note here argued one, on the grounds that three
 * syrup is a winning run's entire scoring supply and handing over two gives
 * away most of the race. That argument was right when syrup was purchasable
 * from a resource market and wrong now: the bag yields syrup one draw in ten,
 * so two in hand is not most of the race, it is most of what a player can
 * expect to see unaided.
 *
 * The rate can move before anyone spends, and the ladder is what bounds the
 * damage. The syrup/chocolate track runs 2:6 down to 2:2 across its five rungs,
 * with Syrup's side pinned at 2 on every one of them, so these two syrup fetch
 * at worst 2 chocolate — half a hire — and at best 6, a hire and a half. Syrup
 * can never be devalued below a chocolate apiece. That floor is what makes it
 * safe to hand out: a player whose opening gets shoved is delayed, not robbed.
 *
 * It is also the shortest ladder on the board at five rungs, which is the same
 * point made in another way. The market a player is most likely to want on turn
 * one is the market with the least room to move under them.
 */
export const STARTING_SYRUP = 2

/**
 * A pancake an order names: one of the four by name, or `"topped"` — any
 * variant that has a topping, the cook's choice. Only Beaver asks for one, and
 * fittingly: it is the species with no topping bound to it, so its order is the
 * one that does not care which.
 */
export type OrderedPancake = PancakeId | "topped"

/**
 * What an animal wants served before it will retire and score.
 *
 * Orders are a property of the species, not the card, so all eight of a
 * species' cards want the same thing — the same way hire does. `syrup` is
 * poured alongside rather than cooked in, so it is counted separately from the
 * pancakes and is not part of any recipe (see `pancakeCost`).
 *
 * `points` is what filling it scores, and for six of the seven species it is
 * simply the number of pancakes: a topping-eater wants two of its own variant
 * and scores two, a mid base-eater wants one and scores one. Nothing to
 * remember and nothing to print — the order counts itself.
 *
 * Beaver is the exception, wanting two for one. It has the cheapest hire on the
 * board at 2, and the heavier order is what it pays for that.
 *
 * A double is not simply a double, because recruiting and retiring cost an
 * action apiece whatever the order says, so a 2-point animal amortises that
 * overhead across both points. The second pancake and the extra topping are
 * what pay for it.
 *
 * One syrup served alongside the pancakes adds one, once, whatever the order
 * is: a base-eater reaches 2 and a topping-eater 3. That is a global rule
 * rather than anything printed per card — all animals like syrup.
 *
 * The hard cap of one is what keeps syrup contested. A point is worth roughly
 * 9 base-units of effort and a syrup only 4, so if you could pour syrup in
 * freely nothing else would ever be worth buying with it. Capped at one per
 * animal, the cheap conversion is bounded by how many animals you actually
 * retire, and every syrup past that goes to the one thing competing for it —
 * the animal row.
 *
 * That competition used to be three-way. The resource market was a priced row
 * too, and its deep slots were a second syrup sink; the bag has no slots and no
 * prices, so that sink is gone and syrup now buys exactly two things: reach
 * along the animal row, and any animal outright in place of the hire printed on
 * it. Losing a sink makes syrup cheaper in absolute terms, but the bag takes
 * back more than the row gave — syrup can no longer be *bought*, only drawn or
 * manufactured, so it is easier to spend and much harder to get.
 *
 * The animal row then widened to four slots priced `2 1 0 0`, which thins the
 * remaining sink again: half that row is free, so syrup buys reach less often
 * than it did. This is the one number to watch in play. If syrup piles up
 * unspent, the row is where to reclaim it (see `BoardPrintPage`), not the cap
 * here — the cap is what stops syrup from being the only thing worth having.
 *
 * Against recruiting, a syrup is worth whatever hire it skips, which sorts the
 * roster: 8 for a topping-eater, 4 for a mid base-eater, 2 for a Beaver. The
 * flat price is the whole mechanism — a syrup is a bargain on an expensive
 * animal and a waste on a cheap one.
 *
 * Underneath it is a timing question — retire now for one, or spend two more
 * turns and retire for two — which sharpens as the game ends.
 */
export type Order = {
  readonly pancakes: readonly OrderedPancake[]
  /** Pieces of Maple Syrup served with them. Usually none. */
  readonly syrup: number
  readonly points: number
}

/**
 * An animal's private exchange rate, in pieces: spend `spend` of its own
 * resource, receive `receive` of the card's output, ignoring whatever the
 * market tracks currently say.
 */
export type Rate = {
  readonly spend: number
  readonly receive: number
}

/**
 * An animal card. Three things, all printed: what it costs to hire, the
 * conversion it performs once hired, and the pancake order it wants served.
 *
 * A species prints eight times, once per resource — `input` is the species' own
 * good and is identical across all eight, `output` is what makes this one card.
 * Together they are the deck's coordinate system.
 *
 * The card where `output` equals `input` is the species' multiplier: it gives
 * back more of the same good than it took, where every other card in the column
 * takes a cut (see `MULTIPLIER` in `animalDeck.ts`).
 *
 * Hire and order are both properties of the species, so the eight cards of one
 * animal differ in exactly one thing: the rate. See `Order` for why a heavier
 * order is not worth more.
 */
export type AnimalCard = {
  readonly kind: "animal"
  /** `<species>-<output>`, e.g. `moose-flour`. */
  readonly id: string
  readonly species: AnimalSpeciesId
  readonly name: string
  readonly color: PaletteColor
  /** The good this species eats. The same on all eight of its cards. */
  readonly input: ResourceId
  /** The good this card makes. What distinguishes it from its seven siblings. */
  readonly output: ResourceId
  readonly rate: Rate
  readonly hire: readonly ResourceAmount[]
  readonly order: Order
}

export type AnimalCardDefinition = AnimalCard & { readonly copies: number }

export type Ratio = { readonly left: number; readonly right: number }

/** The pinned side of every printed rate — one side of the ratio is always this. */
const BASE = 2

/**
 * Every rate sits on one ordered ladder, indexed by a signed step from parity
 * (2:2). Stepping up raises the `right` side (2:2 → 2:3 → 2:4 …): the same
 * stake buys more, so the left resource is gaining. Stepping down raises the
 * `left` side (2:2 → 3:2 → 4:2 …), the right resource gaining.
 *
 * Which side is pinned at 2 is what flips at parity, and that flip is the point:
 * pinning `left` alone would bottom the ladder out at 2:1, so a track centred on
 * 2:2 could never run more than one step down. Flipping instead keeps every rung
 * a pair of small whole numbers and lets a ladder reach as far below parity as
 * above it.
 */
export function ratioAtStep(step: number): Ratio {
  return step >= 0 ? { left: BASE, right: BASE + step } : { left: BASE - step, right: BASE }
}

/** Inverse of `ratioAtStep`, for reading an authored starting rate back onto the ladder. */
export function stepOfRatio({ left, right }: Ratio): number {
  return right >= left ? right - BASE : BASE - left
}

/**
 * A market track between two adjacent resources in the trade chain (see
 * `tradeTracks.ts` for the full chain, Maple Syrup through Flour).
 *
 * The printed ladder is `levels` rungs centred on `startingRatio` — so `levels`
 * is always odd, and a track's reach above parity equals its reach below.
 * Tracks differ in length, which is the point: a short ladder is a tight market.
 *
 * What drives a marker up or down is the forage bag: every denomination but the
 * topping 2 carries a mandatory `shift` (see `ResourceCard`). Blanks carry
 * none, so the markets also go quiet as the bag sours.
 */
export type TradeTrack = {
  readonly id: string
  readonly left: ResourceId
  readonly right: ResourceId
  readonly startingRatio: Ratio
  /** Odd, so the ladder can centre on `startingRatio`. */
  readonly levels: number
}

/** A track's rungs, top (most favourable to `left`) first, centred on its start. */
export function trackLevels(track: TradeTrack): readonly Ratio[] {
  const start = stepOfRatio(track.startingRatio)
  const reach = startIndex(track)
  return Array.from({ length: track.levels }, (_, i) => ratioAtStep(start + reach - i))
}

/** Index of the starting rung within `trackLevels` — the centre, by construction. */
export function startIndex(track: TradeTrack): number {
  return (track.levels - 1) / 2
}

/**
 * `Omit` over a union collapses it to the keys all members share, which would
 * flatten `ForageCardDefinition` into a single shapeless card and cost the
 * `kind` discriminant its narrowing. The `T extends unknown` clause makes the
 * omit distribute over the union instead, so each member is stripped on its own.
 */
type WithoutCopies<T> = T extends unknown ? Omit<T, "copies"> : never

/**
 * Expand a flat-copy catalog into the physical deck: one entry per printed
 * copy, in catalog order. The flat-copy counterpart to `~/shared/cards/
 * deckUtils`'s `expandDeck`, for decks with no player-count table.
 */
export function expandFlatDeck<T extends { readonly copies: number }>(
  source: readonly T[]
): ReadonlyArray<WithoutCopies<T>> {
  return source.flatMap(({ copies, ...card }) => Array.from({ length: copies }, () => card as WithoutCopies<T>))
}

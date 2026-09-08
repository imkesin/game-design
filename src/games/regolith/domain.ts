/**
 * Regolith's tile data, in two layers.
 *
 * `FACES` is the art: every distinct thing a hex can show. `TILES` is the
 * box — the physical, numbered pieces, each naming a front and, where it has
 * one, a back. The split exists because a tile is no longer identified by
 * what it shows: two pieces can share a front and differ on the back, and the
 * number belongs to the piece rather than to either face.
 *
 * Still deliberately incomplete: the real mix of industry and its recipes is
 * being designed. Nothing downstream assumes a count or a size.
 */

/**
 * The six resources that exist as physical stock on the board, in the order
 * they read as a chain: two commons, two ores, two manufactured goods.
 *
 * Flat on purpose. An earlier draft split them into raw resources and the
 * goods refined from them, one refined good per raw, which made the chain a
 * set of parallel two-step ladders. It is not one any more: chemical and metal
 * are both dug out of the ground *and* synthesised from something else, so
 * "which raw resource is this refined from" is no longer a question with one
 * answer, and the type that encoded it is gone.
 */
export type Resource = "rock" | "water" | "chemical" | "metal" | "food" | "electronics"

export const RESOURCES: readonly Resource[] = [
  "rock",
  "water",
  "chemical",
  "metal",
  "food",
  "electronics"
]

/**
 * The four resources that also occur as ground, and so can be had for
 * nothing. Food and electronics are absent because they are only ever
 * manufactured — nowhere on the map do they come out of the regolith.
 *
 * A deposit is not the *only* source of the resources listed here, which is
 * the point. Chemical and metal are dug and made, so a player can be shut out
 * of a metal deposit and still build metal; whereas being shut out of water is
 * being shut out of food. That asymmetry is what makes the commons worth
 * fighting over and the ores worth routing around.
 */
export type Deposit = Extract<Resource, "rock" | "water" | "chemical" | "metal">

export const DEPOSITS: readonly Deposit[] = ["rock", "water", "chemical", "metal"]

/**
 * Energy is a seventh resource, and the one players hold: it is paid straight
 * into a player's own stock rather than left on the hex that made it, so it
 * never occupies a space and never has to be hauled anywhere.
 *
 * Its own type rather than a seventh `Resource`, because everything the board
 * does with a resource — sit on a hex, be carried, be delivered — is exactly
 * what energy does not do.
 */
export type Currency = "energy"

/** Anything that can be produced or consumed. The seven. */
export type Good = Resource | Currency

/**
 * What a unit of each good is worth, in one abstract currency. This is the
 * spine of the whole tile set: the recipes are not tuned tile by tile, they
 * are written against this table.
 *
 * Two tiers of doubling — the commons at 1, the ores at 2, the manufactured
 * goods at 4 — so a good is worth exactly twice what the tier below it is.
 * That is what makes a recipe checkable at a glance rather than a matter of
 * taste: add up each side and see which is bigger.
 *
 * The one rule the set holds to is that **every converter runs positive** —
 * its outputs are worth strictly more than its inputs. Deliberately not
 * anything stronger. An earlier pass tried to hold every tile to one fixed
 * ratio, which is worse in two ways: it forbids natural recipes whose input
 * value isn't the right multiple, and it flattens the map into a set of tiles
 * that are all the same trade in different clothes. Some hexes being plainly
 * more generous than others is the texture, not a bug to be tuned out.
 *
 * A consequence worth knowing before retuning anything: a thin converter is
 * *slower* than gathering, not just less lucrative. A source pays 2 a visit
 * for free, so three water is a visit and a half; spending it on a
 * `greenhouse-i` for one food is 2.5 visits for 4, which is 1.6 an action
 * against the 2 that digging pays for nothing. Industry is therefore not
 * primarily how a player gets richer — it is the only way to get food and
 * electronics at all, and those are what the Spaceport turns into workers and
 * upgrades.
 *
 * Amortise each recipe's source visits over its output and the current set
 * sorts itself by `netValue` almost exactly, which is the quickest way to
 * sanity-check a retune. Every net +1 tile runs at 1.6 an action; every net +2
 * at exactly 2.0; the net +3s at 2.3 to 2.7; `power-plant-ii`'s net +6 at 4.0.
 * Digging is the 2.0 line.
 *
 * Read against that line, the set says something more specific than "industry
 * is good". The thin tiles are genuinely slower than gathering. The net +2s —
 * which is where most of the setup band's grade IIs sit — only draw *level*
 * with it, so what an upgrade buys there is a visit off its own grade I and
 * access to a good that cannot be dug, not a margin. Converting beats digging
 * outright only from net +3 up, which is deep in the chain by design. That the
 * +1s all land on 1.6 and the +2s all on 2.0 is a property of the present
 * tuning rather than a law, so it is worth re-deriving after moving a recipe.
 *
 * Energy's 1 is a placeholder, not a peg. It is spent rather than traded, so
 * nothing in the value system depends on it being right; the power tiles are
 * meant to be retuned from play, and this number exists so `valueOf` has
 * something to return.
 */
export const VALUE: Record<Good, number> = {
  rock: 1,
  water: 1,
  chemical: 2,
  metal: 2,
  food: 4,
  electronics: 4,
  energy: 1
}

export interface RecipeInput {
  good: Good
  qty: number
}

/**
 * The printed formula has room for two terms a side and no more, so the
 * recipe types are tuples: a three-input converter is a type error rather
 * than a hex that silently overflows its middle row.
 */
type OneOrTwo<T> = readonly [T] | readonly [T, T]

/** A side of a formula, or a source's yield, widened for reading. */
export type Terms = readonly RecipeInput[]

/**
 * What a face costs to build, in `BUILD_MATERIAL`. Only converters charge
 * anything — a source is ground, and ground is not built — so this is the way
 * to ask the question of a face whose kind you have not narrowed.
 */
export function buildCost(face: Face): number {
  switch (face.kind) {
    case "converter":
      return face.cost
    case "source":
      return face.cost ?? 0
    default:
      return 0
  }
}

/** What a list of terms is worth. See `VALUE`. */
export function valueOf(terms: Terms): number {
  return terms.reduce((total, t) => total + VALUE[t.good] * t.qty, 0)
}

/**
 * What one worker gets for one stop. Every number in the game is per visit,
 * not per turn — no tile is a standing income — which is what lets a recipe
 * be legible on the face of a hex: what is printed is exactly what you get.
 *
 * Two inputs and two outputs are both real cases, and they are what the
 * recipe is for. A two-input tile is a logistics problem: it only runs where
 * two supply lines meet, so it is worth more than the sum of its rates. A
 * two-output tile is the reverse — one visit yields two different resources,
 * which is why `outputs` holds goods rather than a good and a quantity.
 */
export interface Recipe {
  inputs: OneOrTwo<RecipeInput>
  outputs: OneOrTwo<RecipeInput>
}

/** How much a converter's recipe makes on one visit. Positive across the set. */
export function netValue(recipe: Recipe): number {
  return valueOf(recipe.outputs) - valueOf(recipe.inputs)
}

interface FaceBase {
  name: string
}

/**
 * A hex that yields without being fed: the four ground deposits, and the
 * solar arrays, which harvest sunlight the map does not model.
 *
 * A source prints no arrow, and that is the whole visual difference between
 * a source and industry: an arrow on a hex means something has to be carried
 * there first. A player looking for somewhere to *start* reads the tiles
 * without arrows. That is also why the solar arrays live here rather than
 * with the converters, where an empty input side used to give them an arrow
 * pointing at nothing.
 *
 * Most are free: ground is ground, there is nothing to secure first, and a
 * source costs only the hex it occupies. A few are not — a worked deposit is
 * plant, not terrain, and charges rock to put up like any other building. The
 * absence of `cost` is what says a face is ground rather than a shorthand for
 * zero, so `buildCost` is the way to ask.
 *
 * Most sources pay 2 a visit, which is the yardstick the converters are
 * measured against, and the ones that beat it are exactly the ones that were
 * paid for: every free source in the set yields 2 a visit and every source
 * costing a rock yields 3, with no exceptions but `solar-array-ii`. See
 * `VALUE`, and `buildCost` for which is which.
 */
export interface SourceFace extends FaceBase {
  kind: "source"
  yields: OneOrTwo<RecipeInput>
  /** Rock to put the operation up. Absent on ground, which is not built. */
  cost?: number
}

/**
 * Industry: a hex worked to turn goods into other goods. Converters vary in
 * both directions — how well they convert, and what they cost to build — so
 * the recipe is the tile's headline and the cost is a footnote to it.
 *
 * `inputs` is never empty. A tile that takes nothing in is a `SourceFace`.
 */
export interface ConverterFace extends FaceBase {
  kind: "converter"
  recipe: Recipe
  /**
   * Rock hauled to the hex to build it. `0` for a tile that costs only the
   * space it stands on.
   *
   * Which faces are free is a property of `SHEET`'s ordering rather than of
   * the recipe: every *front* up to tile 15 is free, so nothing a player can
   * put on a starting map has to be paid for before it will run, and a player
   * who has drawn nothing but sources can still start a chain. Cost is what
   * the *backs* from 9 on charge for being better — the grade IIs, and the
   * two ungraded specials. `buildCost` reads it off any face.
   */
  cost: number
}

/**
 * The map's one shared centre, and the demand side of the economy: where the
 * colony's output is traded in.
 *
 * `accepts` is the design record, not something drawn — what a delivery is
 * worth, and how much of it a visit moves, ride on the worker placed here, so
 * the numbers stay tunable without a reprint.
 *
 * The four it takes are the four with a use off the board, and each buys a
 * different kind of improvement:
 *
 * - **metal** — extraction upgrades, which raise what every source pays.
 * - **chemical** — energy, so a player with no power tile still has a way to
 *   turn stock into spending money.
 * - **food** — more workers, and so more actions a turn.
 * - **electronics** — converter efficiency, which raises what industry yields.
 *
 * Rock is absent, and that is the one deliberate hole: rock is the build
 * material (`BUILD_MATERIAL`), spent on the map rather than traded, so the
 * hub is the thing that makes rock worth *less* than everything else.
 */
export interface HubFace extends FaceBase {
  kind: "hub"
  accepts: readonly Resource[]
}

/**
 * Rock is the build material: what a converter costs is rock hauled to the
 * hex, and nothing else. That is deliberately the *only* thing rock is for —
 * it is the one resource the Spaceport will not take (see `HubFace`), so a
 * rock deposit is worth having for what it lets you build rather than for
 * what it earns.
 *
 * Named here so the tile's footer draws its mark from the design rather than
 * hard-coding one. If a second build material ever appears, this constant and
 * `ConverterFace["cost"]` are the two things that change.
 */
export const BUILD_MATERIAL: Resource = "rock"

/**
 * Dead ground: not worked-out land but land that never held anything, so it
 * yields nothing, converts nothing, and can never be flipped into something
 * that does. It is on the map purely to take up a hex.
 *
 * That is a real job in a game played on proximity — every other tile is
 * worth being near, so the only way to make distance cost something is to
 * have ground that isn't. Badlands is what keeps two good tiles apart, and it is
 * the one tile a player would rather their neighbour drew.
 *
 * No fields beyond the name, which is the point.
 */
export interface BarrenFace extends FaceBase {
  kind: "barren"
}

/**
 * The reverse of a tile with nothing on its second side: the setup number,
 * and nothing else. It is a face rather than an absent one so that every
 * piece prints two sides and comes out the same thickness and the same
 * weight, and so that the number can be read whichever way up a tile lands.
 */
export interface BlankFace {
  kind: "blank"
  name?: undefined
}

/**
 * A union rather than one type with optional fields, so a source cannot be
 * authored without its yield (which would print a blank hex) and a converter
 * cannot be authored without its recipe.
 */
export type Face = SourceFace | ConverterFace | HubFace | BarrenFace | BlankFace
export type FaceKind = Face["kind"]

/** The one face that is never authored per-tile, because it says nothing. */
export const BLANK_FACE: BlankFace = { kind: "blank" }

/**
 * Every face in the game, keyed by id. The keys are the vocabulary `TILES` is
 * written in, so a typo in a pairing is a type error rather than a blank hex.
 *
 * Read it as two halves. The sources are what the map gives away: mostly 2 a
 * visit, and the worked ones — the deposits and the two ore features — pay 3
 * for the rock it took to open them up. The converters come in families, and mostly in two grades — a free,
 * thin tile and a dearer one that pays far better, so the choice is the same
 * everywhere and a player learns it once.
 *
 * Every recipe here runs positive, and the grade IIs run positive by a lot;
 * `VALUE` is the table they are all written against, and `netValue` is how to
 * check one.
 */
export const FACES = {
  spaceport: {
    name: "Spaceport",
    kind: "hub",
    accepts: ["metal", "chemical", "food", "electronics"]
  },
  badlands: { name: "Badlands", kind: "barren" },

  // ---- Sources: no arrow, free, and the yardstick at 2 a visit. ----
  rock: {
    name: "Quarry",
    kind: "source",
    yields: [{ good: "rock", qty: 2 }]
  },
  water: {
    name: "Permafrost",
    kind: "source",
    yields: [{ good: "water", qty: 2 }]
  },
  // The ores come out one at a time, which is the whole reason they are worth
  // two: same 2 a visit, half the cubes to carry.
  chemical: {
    name: "Sulfur Vent",
    kind: "source",
    yields: [{ good: "chemical", qty: 1 }]
  },
  metal: {
    name: "Iron Bed",
    kind: "source",
    yields: [{ good: "metal", qty: 1 }]
  },
  // The one common source that pays in two goods. Worth the same 2, but it
  // feeds a two-input converter on its own, which no other source does.
  "icy-regolith": {
    name: "Frozen Mine",
    kind: "source",
    yields: [{ good: "rock", qty: 1 }, { good: "water", qty: 1 }]
  },
  // Worked deposits: the commons, dug properly. Not richer ground — the same
  // hex with plant on it — so these cost rock to put up, and
  // they are the only sources in the set that do. One rock buys one more a
  // visit, for good, which pays for itself on the first visit and every visit
  // after; what stops that being automatic is that the hex is on a shared map
  // and everyone else may work it too.
  "deep-quarry": {
    name: "Deep Quarry",
    kind: "source",
    yields: [{ good: "rock", qty: 3 }],
    cost: 1
  },
  "ice-works": {
    name: "Ice Works",
    kind: "source",
    yields: [{ good: "water", qty: 3 }],
    cost: 1
  },
  // The ores' worked features. Both are natural — a field of iron meteorites,
  // a vent breathing steam and sulfur — but neither gives anything up without
  // a salvage rig or a gas trap on it, so both are priced like the deposits
  // above rather than handed over as better ground.
  //
  // Each pays in two goods rather than a bigger pile of one, which is what
  // separates them from a deep quarry: the same 3 a visit, but arriving as two
  // supply lines out of one hex. Every two-input converter in the set can be
  // fed off a single one of these.
  "meteorite-field": {
    name: "Meteorite Field",
    kind: "source",
    yields: [{ good: "metal", qty: 1 }, { good: "rock", qty: 1 }],
    cost: 1
  },
  "fumarole": {
    name: "Fumarole",
    kind: "source",
    yields: [{ good: "chemical", qty: 1 }, { good: "water", qty: 1 }],
    cost: 1
  },
  // Energy's sources. Off the value table by design — see `VALUE` — and the
  // only sources that are not ground, which is why they carry a grade.
  "solar-array-i": {
    name: "Solar Array",
    kind: "source",
    yields: [{ good: "energy", qty: 2 }]
  },
  "solar-array-ii": {
    name: "Solar Array II",
    kind: "source",
    yields: [{ good: "energy", qty: 4 }]
  },

  // ---- Chemical industry: 4 out of 3 in, two ways. ----
  "electrolysis-i": {
    name: "Electrolysis I",
    kind: "converter",
    recipe: { inputs: [{ good: "water", qty: 3 }], outputs: [{ good: "chemical", qty: 2 }] },
    cost: 0
  },
  // The upgrade is a rate, not a batch: the same two chemical off a third
  // less water. Two visits to a plain water source now feed it twice over.
  "electrolysis-ii": {
    name: "Electrolysis II",
    kind: "converter",
    recipe: { inputs: [{ good: "water", qty: 2 }], outputs: [{ good: "chemical", qty: 2 }] },
    cost: 3
  },
  "processor-i": {
    name: "Processor I",
    kind: "converter",
    recipe: {
      inputs: [{ good: "rock", qty: 2 }, { good: "water", qty: 1 }],
      outputs: [{ good: "chemical", qty: 2 }]
    },
    cost: 0
  },
  "processor-ii": {
    name: "Processor II",
    kind: "converter",
    recipe: {
      inputs: [{ good: "rock", qty: 2 }, { good: "water", qty: 1 }],
      outputs: [{ good: "chemical", qty: 3 }]
    },
    cost: 3
  },

  // ---- Metal industry. ----
  // Rock into both ores at once, and the tile that makes a deep quarry worth
  // paying for: three rock is exactly one visit to one.
  //
  // Not a smelter, which is what this was called and what it is not. Smelting
  // is reducing an ore with a reducing agent, which is precisely what
  // `reduction-plant` below does and precisely what this does not: nothing is
  // added, one input comes apart into two products. The word for that is
  // separation, and this is the only hex in the set that does it.
  "separator-i": {
    name: "Separator I",
    kind: "converter",
    recipe: {
      inputs: [{ good: "rock", qty: 3 }],
      outputs: [{ good: "chemical", qty: 1 }, { good: "metal", qty: 1 }]
    },
    cost: 0
  },
  // A rate, not a batch — the same pair of ores off a third less rock, which
  // is the same shape of upgrade as `electrolysis-ii`. What it really buys is
  // a visit: the grade I wants three rock, which is one trip to a deep quarry
  // and one and a half to a plain one, and the grade II wants two, which is
  // exactly one trip to a plain quarry. So the upgrade is the thing that stops
  // the separator needing a worked deposit behind it to run at full speed.
  //
  // One rock, like every other back in the setup band — see `SHEET`. Cheap
  // against the grade IIs further out, and deliberately so: a piece that can
  // be on the table at setup has to be worth switching on in the opening
  // rather than in the endgame.
  "separator-ii": {
    name: "Separator II",
    kind: "converter",
    recipe: {
      inputs: [{ good: "rock", qty: 2 }],
      outputs: [{ good: "chemical", qty: 1 }, { good: "metal", qty: 1 }]
    },
    cost: 1
  },
  // Chemical as a reductant: the cheapest metal on the board per visit, but
  // only where a chemical line already reaches.
  "reduction-plant": {
    name: "Reduction Plant",
    kind: "converter",
    recipe: {
      inputs: [{ good: "rock", qty: 1 }, { good: "chemical", qty: 1 }],
      outputs: [{ good: "metal", qty: 2 }]
    },
    cost: 2
  },

  // ---- Food industry: the first place a single visit is worth 4. ----
  "greenhouse-i": {
    name: "Greenhouse I",
    kind: "converter",
    recipe: { inputs: [{ good: "water", qty: 3 }], outputs: [{ good: "food", qty: 1 }] },
    cost: 0
  },
  // The same upgrade `separator-ii` is, on the other common: a rate rather than
  // a batch, and what it buys is a visit. Three water is one trip to an ice
  // works and one and a half to a plain permafrost; two water is exactly one
  // trip to a plain one. So the grade I needs a worked deposit behind it to
  // run at full speed and the grade II does not — which is the same sentence
  // that describes the quarry and the separator, and is meant to be.
  //
  // One rock, like every other back in the setup band. See `SHEET`.
  "greenhouse-ii": {
    name: "Greenhouse II",
    kind: "converter",
    recipe: { inputs: [{ good: "water", qty: 2 }], outputs: [{ good: "food", qty: 1 }] },
    cost: 1
  },
  "hydroponics-i": {
    name: "Hydroponics I",
    kind: "converter",
    recipe: {
      inputs: [{ good: "water", qty: 1 }, { good: "chemical", qty: 1 }],
      outputs: [{ good: "food", qty: 1 }]
    },
    cost: 0
  },
  "hydroponics-ii": {
    name: "Hydroponics II",
    kind: "converter",
    recipe: {
      inputs: [{ good: "water", qty: 1 }, { good: "chemical", qty: 2 }],
      outputs: [{ good: "food", qty: 2 }]
    },
    cost: 4
  },

  // ---- Electronics: the end of the chain. ----
  // Both fabricators want two inputs, so nobody reaches electronics without
  // two supply lines meeting at one hex. That, and not a build cost, is what
  // gates the top of the chain: `fabricator-i` is tile 8's front and every
  // front up to 15 is free to build (see `SHEET`), so the grade I costs
  // nothing and is net +1 like every other free grade I. The rock it used to
  // cost was doing the same job the second input already does.
  "fabricator-i": {
    name: "Fabricator I",
    kind: "converter",
    recipe: {
      inputs: [{ good: "rock", qty: 1 }, { good: "metal", qty: 1 }],
      outputs: [{ good: "electronics", qty: 1 }]
    },
    cost: 0
  },
  "fabricator-ii": {
    name: "Fabricator II",
    kind: "converter",
    recipe: {
      inputs: [{ good: "chemical", qty: 1 }, { good: "metal", qty: 1 }],
      outputs: [{ good: "electronics", qty: 2 }]
    },
    cost: 4
  },
  "assembly-i": {
    name: "Assembly I",
    kind: "converter",
    recipe: {
      inputs: [{ good: "metal", qty: 2 }],
      outputs: [{ good: "electronics", qty: 1 }, { good: "chemical", qty: 1 }]
    },
    cost: 3
  },

  // ---- Power: stock burnt for spending money. Untuned; see `VALUE`. ----
  // Two families, told apart by what they burn. Geothermal takes water, the
  // commonest thing on a starting map, which is what lets it be free and sit
  // on tile 9; the power plants take chemical, which is the scarcest, and pay
  // proportionately. Same net either way — see `netValue` — so neither is the
  // better tile, they are the ends of two different supply lines.
  "geothermal-i": {
    name: "Geothermal I",
    kind: "converter",
    recipe: { inputs: [{ good: "water", qty: 1 }], outputs: [{ good: "energy", qty: 3 }] },
    cost: 0
  },
  // The set's cheapest upgrade, and the only one under 3. It buys a third more
  // energy off the same water rather than a new capability, so it is priced as
  // a rate bump: one rock, payable from a single visit to a quarry.
  "geothermal-ii": {
    name: "Geothermal II",
    kind: "converter",
    recipe: { inputs: [{ good: "water", qty: 1 }], outputs: [{ good: "energy", qty: 4 }] },
    cost: 1
  },
  "power-plant-i": {
    name: "Power Plant I",
    kind: "converter",
    recipe: { inputs: [{ good: "chemical", qty: 1 }], outputs: [{ good: "energy", qty: 4 }] },
    cost: 0
  },
  "power-plant-ii": {
    name: "Power Plant II",
    kind: "converter",
    recipe: { inputs: [{ good: "chemical", qty: 1 }], outputs: [{ good: "energy", qty: 8 }] },
    cost: 3
  }
} as const satisfies Record<string, Face>

export type FaceId = keyof typeof FACES

/**
 * One physical piece: a number, a front, and usually a back.
 *
 * `n` is a setup handle, not a rules number. Tiles are dealt out by range —
 * a two-player game uses 0 through 12 — so the *order* of this list is the
 * design: the low numbers are the game's core, and each band above them is
 * what a further player adds. Renumbering therefore means reordering, which
 * is why the number is derived from position rather than typed in.
 */
export interface Tile {
  n: number
  front: FaceId
  /** Omitted where the reverse stays blank — see `BLANK_FACE`. */
  back?: FaceId
}

/** The face a tile shows on its reverse; blank where it was left unpaired. */
export function backFace(tile: Tile): Face {
  return tile.back === undefined ? BLANK_FACE : FACES[tile.back]
}

/**
 * A piece with no decision on it: the same face whichever way up it lands.
 *
 * The core nine are not choices — they are what guarantees the game is
 * playable at all — so printing a blank reverse on them would only create a
 * way to place one wrong. A player who drops one face-down has still placed
 * the tile it is.
 */
function bothSides(front: FaceId): Omit<Tile, "n"> {
  return { front, back: front }
}

/**
 * The box, in dealing order. Numbered from the top, so the Spaceport — always
 * first, always on the map — is 0 and everything dealt starts at 1.
 *
 * The list changes character at 9, and that is the design.
 *
 * **0-8 are the guaranteed core.** They are in every game whatever the count,
 * they carry no decision, and between them they make all seven goods
 * reachable: an energy source, both commons (and one hex that is both at
 * once), each ore, and the one converter apiece that reaches food and
 * electronics. Nothing later in the list is load-bearing — a game dealt the
 * core and nothing else is a poor game, but it is a *complete* one, and that
 * is what these nine are for. Both converters here run off core sources
 * alone, and `fabricator-i`'s rock build cost is payable from them too.
 *
 * Both are also two-input, and that is the core's one sharp edge: there is no
 * one-input converter in the guaranteed set, so a game's first factory always
 * needs two supply lines meeting at one hex. `hydroponics-i` holds slot 7 over
 * `greenhouse-i` — three water for the same one food — for that reason and for
 * one other: it gives chemical something to do on the map. With the greenhouse
 * there, nothing in the core consumed chemical at all, so tile 6 was a hex a
 * player could only ever deliver from. The two recipes cost the same anyway,
 * 2.5 visits a food once the source visits are counted at their printed
 * yields, so the swap changes the core's shape and not its rate.
 *
 * They are the same on both sides, via `bothSides`, because a tile that asks
 * nothing has no reverse worth printing.
 *
 * **From 9 on, every piece has two faces** and the player picks one when it
 * is placed. The pairings are of four sorts: a source backed by the industry
 * that eats it, a source backed by a *different* source, a source backed by
 * the worked version of itself, and a grade I backed by its grade II. So everything a
 * wider game adds is a question, and the game gets more open as the table
 * gets wider rather than merely larger.
 *
 * **Every front up to 15 is free to build.** A starting map is dealt, not
 * chosen, so a player who opens next to a hex they cannot afford to switch on
 * has been handed a dead neighbour by the shuffle rather than by a decision.
 * Cost enters at the backs from 9 on, where it is a price the player agrees to
 * — the grade II is the better building, and rock is what it takes to put it
 * up. So the fronts are the game that is always playable and the backs are the
 * game you invest in, and the whole band charges the same rock: every back
 * from 9 to 15 costs exactly 1. `buildCost` is how to check a face, and it
 * reads costs off sources too — 10, 11, 13 and 14 are worked ground, which is
 * plant rather than terrain and is priced like it.
 *
 * That uniform 1 is what makes the band an opening rather than an endgame. A
 * piece that can be on the table at setup has to be worth switching on in the
 * first few turns, so none of these asks for more than a single visit to a
 * quarry. The larger investments — and the larger upside that should come with
 * them — belong past 15, where nothing has to be affordable on turn one.
 *
 * **The box stops at 15, and most of `FACES` is not in it.** The list used to
 * run to 30 and print every face at least once; it now ends at the widest
 * starting map, because a set small enough to cut out and play through in an
 * afternoon is worth more right now than a complete one. Twelve faces are
 * therefore designed but unprinted — the second electrolysis and processor
 * families, the power plants, the deep grades, badlands — and they are a bench
 * to draw from rather than dead weight. `copiesOf` is how to ask whether a
 * face is in the box; zero is now an ordinary answer, not a bug.
 *
 * What that costs, and it is worth knowing before dealing a game: past 15
 * there is nothing to place. At two players, tiles 9-15 are the seven pieces
 * the game has after setup; at five, the whole box is already on the table.
 * So this trim is a two- or three-player instrument, and the widest counts in
 * `SETUP` are the ones it makes least sense to test at.
 *
 * 16 pieces, six to a printed sheet — three sheets of fronts and three of
 * backs. See `TileSheetPrintPage`.
 */
const SHEET: readonly Omit<Tile, "n">[] = [
  // 0: the map's centre, and the one tile never drawn or flipped — it is
  // placed at setup and stays put, so its reverse is the set's only blank.
  { front: "spaceport" },
  // 1-8: the guaranteed core. Energy, both commons, the hex that is both, each
  // ore, then the one route apiece to food and to electronics.
  bothSides("solar-array-i"),
  bothSides("rock"),
  bothSides("water"),
  bothSides("icy-regolith"),
  bothSides("metal"),
  bothSides("chemical"),
  bothSides("hydroponics-i"),
  bothSides("fabricator-i"),
  // 9-15: the setup bands, one per seat count past two. The shape here is a
  // constraint rather than a taste — see `SETUP`, which is where the numbers
  // these are cut to actually live. A band adds its sources first and its one
  // converter last, so source hexes and workers come out level at every count:
  // six and six at 2-3P, eight and eight at 4P, ten and ten at 5P. Overshoot
  // the converters and the opening degenerates into a scrum over the two or
  // three hexes that pay without being fed.
  //
  // 9 (3P): the first converter past the core, and the set's first single-input
  // one — the core has none, so until this piece is on the map every factory
  // needs two supply lines meeting at a hex. Water in, energy out: the one
  // input a third player's map has in quantity, turned into the one good that
  // is spent rather than hauled.
  //
  // Worth knowing before tuning it: the front does not beat the solar array
  // that is already on every map. Solar pays 2 for one visit and nothing else;
  // three energy off one water is 1.5 visits once the water is fetched at its
  // printed 2 a visit, which is the same 2 an action. What the front adds is a
  // *second* place to get energy, not a better one — with six workers and one
  // array, that is a real thing to add, but it is availability rather than
  // rate. The back is where the rate moves: 4 off the same water is 2.67 an
  // action, and one rock is what it asks for that.
  { front: "geothermal-i", back: "geothermal-ii" },
  // 10-11 (4P): a fourth player's two extra source hexes, and the set's only
  // pieces whose *back* is still a source. Both ask the same question, and it
  // is the one the backs from 9 on are all built around — take the hex as it
  // lies, or spend a rock to work it properly and take three a visit off it
  // for the rest of the game.
  //
  // One rock for one more a visit pays itself back on the first visit, so as
  // arithmetic it is not a question at all. What makes it one is that the map
  // is shared: the rock is yours and the hex is not, so a deep quarry is also
  // a gift to whoever is sitting closest to it. These two are where a player
  // first has to price that.
  { front: "rock", back: "deep-quarry" },
  { front: "water", back: "ice-works" },
  // 12 (4P): 4P adds two commons and no ore, so metal and chemical are still one
  // hex apiece against eight workers. The separator is the relief, and it is
  // the reason the band's sources are commons: three rock — now the most plentiful
  // thing on the map — into both ores at once.
  { front: "separator-i", back: "separator-ii" },
  // 13-14 (5P): the ores get their second hex, which is also the point at which
  // the band's rock-for-a-better-hex question reaches the ores. Both backs pay
  // in two goods rather than more of one, so what a rock buys here is not a
  // bigger pile but a second supply line off the same hex — which is what the
  // two-input converters have been waiting for.
  { front: "metal", back: "meteorite-field" },
  { front: "chemical", back: "fumarole" },
  // 15 (5P): the second road to food, matching the water that arrived with 11.
  // Three water for one, or the build that doubles it.
  { front: "greenhouse-i", back: "greenhouse-ii" }
  // 16 on: cut, for now. The box stops at the widest starting map.
  //
  // The pieces that were here are not a loss — the faces they printed are all
  // still in `FACES`, unprinted, and putting one back in the box is a line in
  // this list. What went with them is the claim that every face is printed;
  // see the note above.
]

export const TILES: Tile[] = SHEET.map((tile, n) => ({ n, ...tile }))

/** Seats the game supports. */
export type PlayerCount = 2 | 3 | 4 | 5

/**
 * Setup by seat count: how many pieces are laid out to start, and how many
 * workers each player gets.
 *
 * These two numbers are why `SHEET` is ordered the way it is, so they live
 * next to it rather than in a rulebook. The map needs at least one source hex
 * — a tile that pays without being fed — per worker on the table, or the
 * opening is a scrum over the handful of hexes anyone can actually use on turn
 * one. `SHEET` is cut to hold that at every count, and `sourceHexes` against
 * `workerCount` is how to check it after moving a tile.
 *
 * Two players get three workers and three-plus get two, which is what keeps
 * the worker count from running away from a map that only grows by three tiles
 * a seat: 6, 6, 8, 10 against 8, 9, 12, 15 tiles.
 */
export const SETUP: Record<PlayerCount, { startingTiles: number; workers: number }> = {
  2: { startingTiles: 8, workers: 3 },
  3: { startingTiles: 9, workers: 2 },
  4: { startingTiles: 12, workers: 2 },
  5: { startingTiles: 15, workers: 2 }
}

/**
 * The pieces on the map at setup: the Spaceport, which is always there, then
 * `1..startingTiles`. Everything past that is what the game deals out later.
 */
export function startingMap(players: PlayerCount): Tile[] {
  return TILES.slice(0, SETUP[players].startingTiles + 1)
}

export function workerCount(players: PlayerCount): number {
  return players * SETUP[players].workers
}

/**
 * How many hexes of the starting map pay without being fed — counting a piece
 * only when *both* its faces are sources, since a piece with a converter on
 * one side is a hex that might not be one.
 */
export function sourceHexes(players: PlayerCount): number {
  return startingMap(players).filter((t) =>
    t.back !== undefined && FACES[t.front].kind === "source" && FACES[t.back].kind === "source"
  ).length
}

/**
 * How many pieces show `id` on either side — the count that goes in the box.
 * Zero is a normal answer: `FACES` holds designs the current `SHEET` does not
 * print. See the note there.
 */
export function copiesOf(id: FaceId): number {
  return TILES.filter((t) => t.front === id || t.back === id).length
}

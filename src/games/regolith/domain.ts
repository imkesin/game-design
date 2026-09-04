/**
 * Regolith's tile data. Still a small, deliberately incomplete set — the real
 * mix of industry and its recipes is being designed. Add tiles to `TILES` as
 * it firms up; nothing downstream assumes a count or a size.
 */

/** The 5 raw resources, gathered directly by resource tiles. */
export type ResourceType = "water" | "rock" | "carbon" | "metal" | "sulfur"

/** First-level goods: each one refined from a single raw resource. */
export type Tier1Good = "food" | "concrete" | "plastic" | "machinery" | "fuel-cell"

/** Anything that can be produced or consumed — raw or refined. */
export type Good = ResourceType | Tier1Good

/**
 * Which raw resource each first-level good comes from. Held here rather than
 * left implicit in the converter recipes, because it is the design — the
 * production chain — and a tile's recipe is only one expression of it.
 */
export const TIER1_SOURCE: Record<Tier1Good, ResourceType> = {
  food: "water",
  concrete: "rock",
  plastic: "carbon",
  machinery: "metal",
  "fuel-cell": "sulfur"
}

export interface RecipeInput {
  good: Good
  qty: number
}

interface TileBase {
  id: string
  name: string
  /** How many of this tile go in the box. */
  copies: number
}

/** A hex worked for one of the raw resources. */
export interface ResourceTile extends TileBase {
  kind: "resource"
  produces: ResourceType
}

/**
 * Industry: a hex worked to turn goods into another good. Converters vary in
 * both directions — how efficiently they convert, and what they cost to
 * build — so the recipe is the tile's headline and the cost is a footnote to
 * it. `cost` is a list, not a lone concrete figure, so a pricier industry can
 * ask for machinery or plastic as well without reshaping the data.
 */
export interface ConverterTile extends TileBase {
  kind: "converter"
  recipe: { inputs: RecipeInput[]; output: RecipeInput }
  cost: RecipeInput[]
}

/**
 * The map's one shared centre, and the demand side of the economy: the place
 * refined goods are taken to be shipped off-world. Everything else on the map
 * produces; this is the only tile that consumes, which is what makes an
 * industry chain worth building in the first place.
 *
 * The face carries nothing but the name and a heavy border: what a delivery
 * is worth, and how much of it a visit moves, ride on the worker placed here.
 * That keeps the tile a landmark rather than a rules card, and keeps the
 * numbers tunable without a reprint.
 *
 * `accepts` is therefore the design record, not something drawn — the same
 * role `TIER1_SOURCE` plays. It is what stops the demand set from being
 * re-derived by guesswork later: concrete is deliberately absent, because it
 * is the build currency and is spent on the map rather than exported.
 */
export interface HubTile extends TileBase {
  kind: "hub"
  accepts: Good[]
}

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
 * No fields: there is nothing to say about it beyond its name, which is the
 * point.
 */
export interface BarrenTile extends TileBase {
  kind: "barren"
}

/**
 * A union rather than one type with optional fields, so a resource tile
 * cannot be authored without its resource (which would print a blank hex) and
 * a converter cannot be authored without its recipe.
 */
export type Tile = ResourceTile | ConverterTile | HubTile | BarrenTile
export type TileKind = Tile["kind"]

export const TILES: Tile[] = [
  // The map centre, and the only tile there is exactly one of.
  {
    id: "spaceport",
    name: "Spaceport",
    kind: "hub",
    copies: 1,
    // Concrete is missing on purpose: it is the game's build currency, spent
    // on the map rather than exported. The four goods with no other use are
    // exactly the four this tile gives a use to.
    accepts: ["food", "plastic", "machinery", "fuel-cell"]
  },
  { id: "badlands", name: "Badlands", kind: "barren", copies: 2 },
  // Scarcity runs down the list: water and rock are the commons, sulfur the
  // rarity. Each industry's count mirrors its input's, one step scarcer, so
  // the tile mix says the same thing the recipes do.
  { id: "water", name: "Water", kind: "resource", produces: "water", copies: 5 },
  { id: "rock", name: "Rock", kind: "resource", produces: "rock", copies: 5 },
  { id: "carbon", name: "Carbon", kind: "resource", produces: "carbon", copies: 4 },
  { id: "metal", name: "Metal", kind: "resource", produces: "metal", copies: 4 },
  { id: "sulfur", name: "Sulfur", kind: "resource", produces: "sulfur", copies: 3 },
  // First-level industry, in two grades per family: a cheap, lossy tile and a
  // dearer one that converts at a far better rate. The choice is the same
  // everywhere — pay concrete now for yield later — so a player learns it once
  // and can read every family with it. Only the families fed by the two common
  // resources have a free grade; the rest have to be bought into.
  {
    id: "greenhouse-i",
    name: "Greenhouse I",
    kind: "converter",
    copies: 2,
    recipe: { inputs: [{ good: "water", qty: 3 }], output: { good: "food", qty: 1 } },
    cost: []
  },
  {
    id: "greenhouse-ii",
    name: "Greenhouse II",
    kind: "converter",
    copies: 2,
    recipe: { inputs: [{ good: "water", qty: 2 }], output: { good: "food", qty: 2 } },
    cost: [{ good: "concrete", qty: 2 }]
  },
  {
    id: "kiln-i",
    name: "Kiln I",
    kind: "converter",
    copies: 2,
    recipe: { inputs: [{ good: "rock", qty: 3 }], output: { good: "concrete", qty: 1 } },
    cost: []
  },
  {
    id: "kiln-ii",
    name: "Kiln II",
    kind: "converter",
    copies: 2,
    recipe: { inputs: [{ good: "rock", qty: 2 }], output: { good: "concrete", qty: 2 } },
    cost: [{ good: "concrete", qty: 2 }]
  },
  // Plastic and machinery sit a step further in: neither grade is free, so a
  // player has to have built something else first to reach them at all. The
  // cheap grade is also the rare one — the box holds a single starter and two
  // of the expensive tile, so this branch is a commitment rather than a drift.
  {
    id: "extruder-i",
    name: "Extruder I",
    kind: "converter",
    copies: 1,
    recipe: { inputs: [{ good: "carbon", qty: 3 }], output: { good: "plastic", qty: 1 } },
    cost: [{ good: "concrete", qty: 1 }]
  },
  {
    id: "extruder-ii",
    name: "Extruder II",
    kind: "converter",
    copies: 2,
    recipe: { inputs: [{ good: "carbon", qty: 2 }], output: { good: "plastic", qty: 2 } },
    cost: [{ good: "concrete", qty: 3 }]
  },
  {
    id: "foundry-i",
    name: "Foundry I",
    kind: "converter",
    copies: 1,
    recipe: { inputs: [{ good: "metal", qty: 3 }], output: { good: "machinery", qty: 1 } },
    cost: [{ good: "concrete", qty: 1 }]
  },
  {
    id: "foundry-ii",
    name: "Foundry II",
    kind: "converter",
    copies: 2,
    recipe: { inputs: [{ good: "metal", qty: 2 }], output: { good: "machinery", qty: 2 } },
    cost: [{ good: "concrete", qty: 3 }]
  },
  {
    id: "refinery-i",
    name: "Refinery I",
    kind: "converter",
    copies: 1,
    recipe: { inputs: [{ good: "sulfur", qty: 2 }], output: { good: "fuel-cell", qty: 1 } },
    cost: []
  },
  {
    id: "refinery-ii",
    name: "Refinery II",
    kind: "converter",
    copies: 1,
    recipe: { inputs: [{ good: "sulfur", qty: 3 }], output: { good: "fuel-cell", qty: 3 } },
    cost: [{ good: "concrete", qty: 4 }]
  }
]

/** One entry per physical tile: the catalog with each tile repeated `copies` times. */
export function expandTiles(catalog: readonly Tile[] = TILES): Tile[] {
  return catalog.flatMap((tile) => Array.from({ length: tile.copies }, () => tile))
}

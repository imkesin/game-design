/**
 * Foreign Markets: three trade zones (Northern, Western, Southern) rendered
 * top-to-bottom in the board's left rail. Each zone declares two blank crate
 * slots — the player drops a physical fruit into one to say "there is a Lime
 * trade route to the North", binding that slot's *variable* to Lime. The
 * variables are Greek letters, unique across all zones (α β / γ δ / ε ζ), so a
 * recipe can in principle reference any route.
 */

export const FOREIGN_VARIABLES = ["α", "β", "γ", "δ", "ε", "ζ"] as const
export type ForeignVariable = typeof FOREIGN_VARIABLES[number]

/** The wildcard ref: a crate of any fruit, stamped `✱` rather than a variable. */
export const ANY_CRATE = "any"
export type AnyCrate = typeof ANY_CRATE

/** What a term's crate refers to: a specific route variable, or the wildcard. */
export type CrateRef = ForeignVariable | AnyCrate

/** N crates of one ref, e.g. `{ qty: 4, ref: "α" }` → "4 × α". */
export type CrateTerm = { readonly qty: number; readonly ref: CrateRef }

/** A quest: 1–3 terms, all required together (AND, rendered with `+`). */
export type Quest =
  | readonly [CrateTerm]
  | readonly [CrateTerm, CrateTerm]
  | readonly [CrateTerm, CrateTerm, CrateTerm]

export type ForeignMarketZoneName = "Northern" | "Western" | "Southern"

export type ForeignMarketZone = {
  readonly name: ForeignMarketZoneName
  /** The zone's two blank slots, in render order (left, right). */
  readonly variables: readonly [ForeignVariable, ForeignVariable]
  /** Quest ladder, completed top-to-bottom. Length is per-zone (configurable). */
  readonly quests: readonly Quest[]
}

/**
 * Placeholder quest ladders — costlier top-to-bottom. Hand-edit these literals:
 * change a qty, change a term's `ref` (a Greek variable or `"any"`), add/remove
 * a term within a quest (1–3, joined by `+`), or add/remove a whole quest row.
 */
export const foreignMarketZones = [
  {
    name: "Northern",
    variables: ["α", "β"],
    quests: [
      [{ qty: 2, ref: "α" }],
      [{ qty: 2, ref: "α" }, { qty: 1, ref: "β" }],
      [{ qty: 3, ref: "α" }, { qty: 2, ref: "β" }],
      [{ qty: 4, ref: "α" }, { qty: 2, ref: "β" }],
      [{ qty: 5, ref: "α" }, { qty: 3, ref: "β" }]
    ]
  },
  {
    name: "Western",
    variables: ["γ", "δ"],
    quests: [
      [{ qty: 1, ref: "γ" }, { qty: 1, ref: ANY_CRATE }],
      [{ qty: 1, ref: "γ" }, { qty: 1, ref: "δ" }, { qty: 1, ref: ANY_CRATE }],
      [{ qty: 2, ref: "γ" }, { qty: 1, ref: "δ" }, { qty: 2, ref: ANY_CRATE }],
      [{ qty: 2, ref: "γ" }, { qty: 2, ref: "δ" }, { qty: 2, ref: ANY_CRATE }],
      [{ qty: 3, ref: "γ" }, { qty: 2, ref: "δ" }, { qty: 3, ref: ANY_CRATE }]
    ]
  },
  {
    name: "Southern",
    variables: ["ε", "ζ"],
    quests: [
      [{ qty: 1, ref: "ε" }, { qty: 1, ref: "ζ" }],
      [{ qty: 2, ref: "ε" }, { qty: 1, ref: "ζ" }],
      [{ qty: 3, ref: "ε" }, { qty: 2, ref: "ζ" }],
      [{ qty: 3, ref: "ε" }, { qty: 3, ref: "ζ" }],
      [{ qty: 4, ref: "ε" }, { qty: 4, ref: "ζ" }]
    ]
  }
] as const satisfies readonly ForeignMarketZone[]

/**
 * Player-reference prose for the Foreign Markets, kept beside the mechanics they
 * describe. Rendered on the one-sheet reference (see FocusReferencePage); each
 * value is `\n\n`-split into paragraphs at render time.
 *
 * `unlocking` — how a route's blank slot first gets bound to a fruit.
 * `developing` — how surplus fruit from a Sell advances a bound route.
 */
export const TRADE_ROUTE_RULES = {
  unlocking:
    "First player to fill a Market's final slot unlocks a route: place a matching Fruit from Supply in any open route slot, binding that route to that Fruit for good.",
  developing: "Surplus fruit may develop one route per turn.",
  timing: "Resolve routes before Gold and induced demand, while the full tracks are still visible."
} as const

/**
 * The victory rules. `lead` is the marker/ladder-race mechanic (one paragraph);
 * `conditions` are the three independent ways to win, rendered as a list. The
 * game ends the moment any player meets one.
 */
export const WINNING = {
  lead:
    "Mark each development on the route ladder; players race down it level by level. First to reach any of these wins:",
  conditions: [
    "A route developed in every direction",
    "One route developed three times",
    "Five total developments"
  ]
} as const

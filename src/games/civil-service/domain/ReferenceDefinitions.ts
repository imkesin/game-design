/**
 * Every word that appears on the player reference sheet (see routes/ReferencePage).
 * Prose lives here rather than in the route for the same reason graft's does: the
 * route arranges, the domain says. Editing a rule means editing this file only.
 *
 * `\n\n` separates paragraphs within a single string; the route splits on it.
 *
 * This is a first-draft ruleset paraphrased for the table, not a settled one.
 *
 * Nothing here is a placeholder. An unwritten rule is simply absent: a sheet carrying
 * "to be decided" spends page on a question the table cannot answer mid-game, and the
 * gaps are tracked in conversation instead. So a section appears only once it has
 * something to say.
 *
 * `TURN_ACTIONS` and `WINNING` now describe the Officer/Legacy structure (see
 * cards/officerDeck, cards/legacyDeck). There is no `SETUP` export: the board's
 * starting state (see map/rondelLayout) hasn't been dictated, and a Setup
 * section with nothing true to say would just be page spent on a question the
 * table can't answer.
 *
 * The sheet is two pages: page 1 is `TURN_ACTIONS`, with `RONDEL_SPACES` — the
 * 7 spaces the rondel's `Advance` action moves through (see map/rondelLayout —
 * its `SPACE_LABELS` are still placeholders and should be retired once this
 * lands) — nested inside Advance's own row rather than pushed to a page of
 * their own: there is exactly one sheet available for everything a turn can
 * do, so the rondel has to fit under the action that runs it. Page 2 carries
 * `GLOSSARY`, `CASCADE` and `WINNING`. `CASCADE` sits apart from `TURN_ACTIONS`
 * because it's a cross-cutting check a turn-action row can point at, not one
 * of the four things a turn can be — both Recruit and two of the rondel's move
 * spaces trigger it.
 */

/**
 * The load-bearing nouns. Trimmed to the terms the rules use without defining: anything
 * the Turn text already explains in place (Player Zone, meeple, gold) is not repeated
 * here, because a glossary that restates the rules costs a block of page and teaches
 * nothing.
 *
 * `Cascade` is glossed short and pointed at the Cascade section below rather than
 * spelled out here — it is a mechanical check, not a noun, and it reads better as
 * its own block than folded into this list.
 */
export const GLOSSARY: readonly { readonly term: string; readonly gloss: string }[] = [
  { term: "Province", gloss: `A space on the Map; adjacency is whatever it shows.` },
  {
    term: "State",
    gloss:
      `A group of Provinces the Map already groups together. There are five states: North, South, East, West, and Central.`
  },
  {
    term: "Officer",
    gloss: `Represented both by cards in each Player Zone, and a meeple positioned in a Province.`
  },
  {
    term: "Legacy",
    gloss: `A card used for scoring held secretly in your Player Zone. Complete it by meeting its printed condition.`
  },
  {
    term: "Recruitment Zone",
    gloss: `The 2 face-up Officer cards you Recruit from — refilled back to 2 the moment one is taken.`
  },
  {
    term: "Exhaustion",
    gloss:
      `Tokens placed on a Province to indicate that it cannot be Taxed, have its Infrastructure upgrade, or be the target of Recruitment.`
  },
  { term: "Cascade", gloss: `The check every arriving Officer triggers — see Cascade, below.` },
  {
    term: "Trade Route",
    gloss:
      `A continuous chain of Infrastructure linking a Province-level resource to the Capital. Level 2 Infrastructure is not impacted by exhaustion.`
  },
  {
    term: "National Treasury",
    gloss:
      `Where a shared payout's remainder goes when it doesn't split evenly across all players. As soon as it reaches the player count, it is immediately paid out.`
  }
]

export type TurnAction = {
  readonly letter: string
  readonly name: string
  readonly summary: string
}

/**
 * The four things a turn can be — exactly one chosen, none of them a default —
 * each meant to fill one big row on its own page rather than share space with
 * anything else. `summary` is deliberately the whole rule in one breath: this is
 * the page a player checks mid-turn, not a place to page-hunt through caveats.
 */
export const TURN_ACTIONS: readonly TurnAction[] = [
  {
    letter: "A",
    name: "Recruit",
    summary:
      `Take 1 Officer from the Recruitment Zone into your Player Zone, and then pay 1 Gold for every officer of that type you have recruited. Place the corresponding Officer piece into a non-Exhausted Province that already holds another Officer. Refill the Recruitment Zone. Check Cascade.`
  },
  {
    letter: "B",
    name: "Advance",
    summary:
      `Move ahead 1 space on the shared rondel for free and resolve it — or pay 1 gold to move ahead 2 or 3 spaces instead.`
  },
  {
    letter: "C",
    name: "Pursuit Legacy",
    summary: `Draw two Legacies from the Legacy Deck, then discard two to its bottom.`
  },
  {
    letter: "D",
    name: "Claim Legacy",
    summary:
      `Set a Legacy you hold face down in your Player Zone, in public with a Player Seal on it. Then, draw back up to 2 in hand. Claiming your third Legacy ends the game immediately.`
  }
]

/**
 * The Cascade check, spelled out in full. Lives apart from `TURN_ACTIONS` because
 * it isn't a fifth action — Recruit's row triggers it, and later the rondel's
 * Officer-moving spaces will too — so it earns its own page-2 detail instead of
 * being repeated inline everywhere it applies.
 */
export const CASCADE =
  `Checked whenever an Officer enters a Province (Recruit or Allocate): if that Province now holds 3 more Officers than an adjacent one, move one of its other Officers into that neighbor. Repeat in the neighboring Province if needed.`

export type RondelSpace = {
  readonly index: number
  readonly name: string
  /** One rule clause per entry, rendered as its own paragraph — not a bulleted
   * enumeration, since a space's clauses run in sequence rather than sitting as
   * parallel options. */
  readonly effect: readonly string[]
}

/**
 * The rondel's 7 spaces, in wheel order — what `Advance` (see `TURN_ACTIONS`)
 * actually resolves, rendered nested inside Advance's own row on page 1 rather
 * than a section of their own. Spaces 4 and 6 point back at space 2 rather than
 * repeating its movement clause verbatim: same rule, only the Officer suit
 * changes.
 *
 * Every space opens with the acting player's own flat benefit (a Gold, an
 * exhaustion token removed, a free placement) before whatever it triggers
 * across the board at large — that split is real, not stylistic, so it stays
 * as separate clauses rather than one run-on sentence.
 */
export const RONDEL_SPACES: readonly RondelSpace[] = [
  {
    index: 1,
    name: "Bribe",
    effect: [
      `Take 1 Gold.`,
      `Place an exhaustion token in any Province carrying none.`
    ]
  },
  {
    index: 2,
    name: "Allocate Steward or Scribe",
    effect: [
      `Move 1 Steward or Scribe into an adjacent Province — never from a Province with fewer Officers into one with more. Check Cascade.`
    ]
  },
  {
    index: 3,
    name: "Tax",
    effect: [
      `Take 1 Gold.`,
      `Then tax every non-Exhausted Province with a Steward: take Gold equal to its Stewards plus Scribes, then place exhaustion tokens equal to its Stewards.`,
      `That Gold splits evenly across all players; any remainder goes to the National Treasury.`
    ]
  },
  {
    index: 4,
    name: "Allocate Magistrate or Scribe",
    effect: [
      `Move 1 Magistrate or Scribe into an adjacent Province — never from a Province with fewer Officers into one with more. Check Cascade.`
    ]
  },
  {
    index: 5,
    name: "Order",
    effect: [
      `Remove 1 exhaustion token from any Province.`,
      `Then, in every Province with a Magistrate, remove exhaustion tokens equal to its Magistrates plus Scribes.`
    ]
  },
  {
    index: 6,
    name: "Move Engineer or Scribe",
    effect: [
      `Move 1 Engineer or Scribe into an adjacent Province — never from a Province with fewer Officers into one with more. Check Cascade.`
    ]
  },
  {
    index: 7,
    name: "Infrastructure",
    effect: [
      `Upgrade infrastructure in any Province at no cost. You must have the correct combination of Engineers, Scribes, and no exhaustion on the Province.`,
      `Then you may upgrade Infrastructure in any other Provinces: the 1st level costs 1 Gold and requires 1 Engineer present, the 2nd costs 2 Gold and 2 Engineers (or 2 Gold, 1 Engineer and 1 Scribe). Place exhaustion on that Province equal to the Engineers counted toward the cost.`,
      `Then activate every Trade Route not blocked by exhaustion. Split the total payout evenly across all players; the remainder goes to the National Treasury.`
    ]
  }
]

export const WINNING = {
  lead:
    `Completing your third Legacy ends the game immediately. Then every player scores every Legacy they've claimed; those in-hand are ignored.`,
  conditions: [
    `+1 for every successful Legacy.`,
    `-1 for every failed Legacy.`,
    `Highest total wins.`
  ]
} as const

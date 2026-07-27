import type { PowerName } from "./CoreDefinitions"

/**
 * Every word that appears on the player reference sheet (see routes/ReferencePage).
 * Prose lives here rather than in the route for the same reason graft's does: the
 * route arranges, the domain says. Editing a rule means editing this file only.
 *
 * `\n\n` separates paragraphs within a single string; the route splits on it.
 *
 * This is a first-draft ruleset paraphrased for the table, not a settled one. Where the
 * source rules are silent on something the sheet has to state to be usable, the gloss
 * says so in parentheses rather than inventing quietly — see `Leading God`, which every
 * one of Impulse, Disaster and Winning depends on and none of them defines.
 *
 * Nothing here is a placeholder. An unwritten rule is simply absent: a sheet carrying
 * "to be decided" spends page on a question the table cannot answer mid-game, and the
 * gaps are tracked in conversation instead. So a section appears only once it has
 * something to say.
 */

/**
 * What a Power's Action does.
 *
 * Some Actions are a single instruction; others are a choice of mutually exclusive
 * options (Devotion builds *or* harvests; Impulse moves *or* challenges). Modelling
 * that as a list rather than two fields keeps the shape total — one option is a plain
 * Action, two or more render as a lettered choice — so a Power that later gains a
 * third option needs no type change.
 *
 * An "or" that sits *inside* one option's prose (Abundance's two placements) stays
 * prose: it is one decision made while resolving a single instruction, not a fork
 * between two different things the Action can be.
 */
export type PowerAction = {
  /** One entry per mutually exclusive option. A single entry is an unconditional Action. */
  readonly options: readonly string[]
}

export const POWER_REFERENCE: Record<PowerName, PowerAction> = {
  Abundance: {
    options: [
      "Add 2 people to your God's region, or 1 to an adjacent region. You cannot add people to a region that has none."
    ]
  },
  Ingenuity: {
    options: [
      "Add 1 Gold per person already there, in regions adjacent to your God. Add 1 more Gold if your God is in the region."
    ]
  },
  Devotion: {
    options: [
      "Convert a region's Gold into a pantheon. Max 2 per region. The first costs 2, the second 3, and so on.",
      "Gain 1 Energy for every pantheon you have whose region holds at least one person."
    ]
  },
  Guidance: {
    options: [
      "Move any 1 person to an adjacent region. They may carry 1 Gold from where they started."
    ]
  },
  Impulse: {
    options: [
      "Move your God 1 region, into any region without the leading God.",
      "Move into the leading God's region and challenge. Higher Energy wins: discard down to the difference, then take 1 more. Ties go to the leading God, so a winner always keeps at least 1."
    ]
  }
}

/**
 * The load-bearing nouns. Trimmed to the terms the rules use without defining: anything
 * the Setup or Turn text already explains in place (Gold, people, the map itself) is not
 * repeated here, because a glossary that restates the rules costs a block of page and
 * teaches nothing.
 *
 * `Leading God` is the one entry the sheet cannot do without and the source rules never
 * give. Impulse targets it, Disaster restricts it, and two of the three win conditions
 * turn on it, so it is glossed with its assumption marked rather than left blank.
 */
export const GLOSSARY: readonly { readonly term: string; readonly gloss: string }[] = [
  {
    term: "Old God",
    gloss: `The shared adversary. Holds Energy, owns regions, expands after each disaster.`
  },
  {
    term: "Leading God",
    gloss: `Most Energy — the Old God at first, 5 against your 3. (Assumed.)`
  },
  { term: "Lesser God", gloss: `Any player's God, as against the Old God.` },
  { term: "Region", gloss: `A space on the borrowed map; adjacency is whatever it shows.` },
  { term: "Pantheon", gloss: `A building you own in a region. Max 2 per region.` },
  { term: "Energy", gloss: `Score, and the stake in an Impulse challenge.` },
  {
    term: "Track",
    gloss: `The 5 face-up Actions you take from, refilled at the high-cost end.`
  }
]

export const SETUP = {
  steps: [
    `Place the Old God with 5 Energy. It claims two adjacent regions, each with 1 pantheon and 1 person.`,
    `Place your God in a region not adjacent to the Old God's; players may share. Take 1 pantheon, 1 person, and 3 Energy.`,
    `Deck: every Action but the Disaster, minus 3 per player. Shuffle the Disaster back in.`,
    `Reveal 5 cards to the track. Farthest from the Old God goes first.`
  ]
} as const

export const TURN = {
  /** The turn spine. Numbered because order of operations is the thing players lose. */
  steps: [
    `Take one Action from the track and resolve it, if you are able.`,
    `Resolve it once more for every copy of it you already hold.`,
    `Slide the track along; refill the high-cost zone.`
  ],
  /** The escalation is the engine, and it is the step a new player misreads. */
  timing: `Holding 1 Guidance? Your second moves 2 people. Copies multiply, they do not replace.`
} as const

/**
 * Permanents. Not a set-collection trade: a permanent is bought by swapping a single
 * card taken during the round for its darker twin, and only in the aftermath step.
 * Nothing in the current draft consumes a *set* of anything.
 */
export const PERMANENTS = {
  lead: `Trade a card you took this round for its darker twin — that card is now permanent.`,
  pace: `After round 1 each player takes 1, after round 2 two, and so on.`
} as const

export const DISASTER = {
  lead:
    `One Disaster is in the deck. Using it ends the round and destroys every person, Gold and pantheon in one region.`,
  restriction: `The leading God may never use it to harm people, and in the final round may not use it at all.`,
  after: `Mark the struck region: people cannot enter next round, though Gods may pass through.`
} as const

export const AFTERMATH = {
  steps: [
    `Everyone collects Energy as Devotion B. The leading God takes 1 more, free.`,
    `Whoever caused the disaster picks their permanent first.`,
    `If the Old God survives it expands to an adjacent region, gaining a person and pantheon. Keep tracking its Energy.`
  ]
} as const

export const WINNING = {
  lead: `The Disaster decides it: who used it, and whether the Old God still stands.`,
  conditions: [
    `Old God still standing: every player loses.`,
    `A lesser god ends the round with it: the leading God wins.`,
    `The leading God is forced to use it: they lose, every lesser god wins.`
  ]
} as const

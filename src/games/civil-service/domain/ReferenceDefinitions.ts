/**
 * Every word that appears on the player reference sheet (see routes/ReferencePage).
 * Prose lives here rather than in the route for the same reason graft's does: the
 * route arranges, the domain says. Editing a rule means editing this file only.
 *
 * `\n\n` separates paragraphs within a single string; the route splits on it.
 *
 * This is a first-draft ruleset paraphrased for the table, not a settled one. Where the
 * source rules are silent on something the sheet has to state to be usable, the gloss
 * says so in parentheses rather than inventing quietly — see `Leading God`, which
 * Winning depends on and does not itself define.
 *
 * Nothing here is a placeholder. An unwritten rule is simply absent: a sheet carrying
 * "to be decided" spends page on a question the table cannot answer mid-game, and the
 * gaps are tracked in conversation instead. So a section appears only once it has
 * something to say.
 *
 * The Powers, Permanents and Disaster mechanics this sheet used to describe are gone —
 * the card structure moved to Officers and Legacies (see cards/officerDeck,
 * cards/legacyDeck) — so their sections were stripped along with the domain types
 * they depended on. `SETUP`, `TURN` and `WINNING` below still narrate the old
 * Action/Track/Disaster turn structure and are stale until the new rules are dictated.
 */

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
    `Place the Old God with 5 Energy. It claims two adjacent regions, each with 1 pantheons and 1 person.`,
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

export const WINNING = {
  lead: `The Disaster decides it: who used it, and whether the Old God still stands.`,
  conditions: [
    `Old God still standing: every player loses.`,
    `A lesser god ends the round with it: the leading God wins.`,
    `The leading God is forced to use it: they lose, every lesser god wins.`
  ]
} as const

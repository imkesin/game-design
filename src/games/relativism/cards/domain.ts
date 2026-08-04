/**
 * A statement read aloud and judged by the group. Unlike the other games' decks,
 * Relativism has no player-count concept, so a card carries a flat `copies`
 * count rather than a per-player-count table (see `expandFlatDeck`).
 */
export type StatementCard = {
  readonly kind: "statement"
  readonly id: string
  readonly text: string
  /** Shown as a small tag in the card's bottom-right corner, e.g. "Barely Illegal". */
  readonly category: string
}

export type StatementCardDefinition = StatementCard & { readonly copies: number }

/** A single Yes/No ballot card, used to vote on a statement. */
export type VoteCard = {
  readonly kind: "vote"
  readonly id: string
  readonly label: "Yes" | "No"
}

export type VoteCardDefinition = VoteCard & { readonly copies: number }

/**
 * Expand a flat-copy catalog into the physical deck: one entry per printed
 * copy, in catalog order. The flat-copy counterpart to `~/shared/cards/
 * deckUtils`'s `expandDeck`, for decks with no player-count table.
 */
export function expandFlatDeck<T extends { readonly copies: number }>(
  source: readonly T[]
): ReadonlyArray<Omit<T, "copies">> {
  return source.flatMap(({ copies, ...card }) => Array.from({ length: copies }, () => card))
}

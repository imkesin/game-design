import type { VoteCardDefinition } from "./domain"

const BALLOT_COPIES = 8

/** The Yes/No ballots used to vote on a statement, printed 8-a-side. */
export const voteDeck: readonly VoteCardDefinition[] = [
  { kind: "vote", id: "yes", label: "Yes", copies: BALLOT_COPIES },
  { kind: "vote", id: "no", label: "No", copies: BALLOT_COPIES }
]

import type { StatementCardDefinition } from "./domain"

/**
 * Starter set of statement cards. Each prints one copy — add more entries here
 * as the deck grows; `category` drives the small tag in the card's corner.
 */
export const statementDeck: readonly StatementCardDefinition[] = [
  {
    kind: "statement",
    id: "accidental-shoplifting",
    text: "Accidental shoplifting.",
    category: "Barely Illegal",
    copies: 1
  },
  {
    kind: "statement",
    id: "cancel-plans-last-minute",
    text: "Cancel plans with a good friend at the last-minute.",
    category: "Friendships",
    copies: 1
  },
  {
    kind: "statement",
    id: "ghosting",
    text: "Ghosting.",
    category: "Relationships",
    copies: 1
  }
]

import { artProps } from "~/games/civil-service/assets/cardArt"
import { OFFICER_SUITS_WITH_METADATA, type OfficerSuitId } from "~/games/civil-service/domain/CoreDefinitions"
import { assertCopyTotals, type Copies, flatCopies } from "~/shared/cards/playerCount"
import type { CardDefinition, Deck } from "./domain"

/** Cards per suit. Fixed regardless of player count: the printed deck is always
 * 36 Officers, 9 per suit, even at 2 players. */
const CARDS_PER_SUIT = 9

const SUIT_TOTALS: Record<OfficerSuitId, Copies> = Object.fromEntries(
  OFFICER_SUITS_WITH_METADATA.map(({ id }) => [id, flatCopies(CARDS_PER_SUIT)])
) as Record<OfficerSuitId, Copies>

assertCopyTotals(
  "officerDeck",
  SUIT_TOTALS,
  flatCopies(CARDS_PER_SUIT * OFFICER_SUITS_WITH_METADATA.length)
)

const article = (suit: OfficerSuitId) => (suit === "engineer" ? "an" : "a")

/**
 * A power dictated once in terms of the card's own suit ("X") expands to one
 * card per suit at a given rank — the standing shorthand for dictation unless
 * told otherwise. `epithet` becomes the card's `name` (e.g. "Charismatic");
 * the suit itself is not repeated there, since the header shows it directly.
 */
const perSuit = (
  { rank, epithet, power }: {
    rank: number
    epithet: string
    power: (suit: { id: OfficerSuitId; name: string }) => string
  }
): Partial<Record<string, { name: string; power: string }>> =>
  Object.fromEntries(
    OFFICER_SUITS_WITH_METADATA.map((suit) => [`${suit.id}-${rank}`, { name: epithet, power: power(suit) }])
  )

/**
 * Some ranks break the perSuit pattern: each suit's card is authored
 * separately (no shared template), and a suit can be left out entirely — it
 * falls through to whatever `officerDeck` uses for an un-dictated card.
 */
const bySuit = (
  { rank, cards }: { rank: number; cards: Partial<Record<OfficerSuitId, { name: string; power: string }>> }
): Partial<Record<string, { name: string; power: string }>> =>
  Object.fromEntries(Object.entries(cards).map(([suitId, card]) => [`${suitId}-${rank}`, card]))

/** Dictated cards, keyed by id. Everything not listed here still falls back to
 * placeholder name/power text below. */
const OFFICER_OVERRIDES: Partial<Record<string, { name: string; power: string }>> = {
  ...perSuit({
    rank: 1,
    epithet: "Traveling",
    power: (suit) => `When you transfer ${article(suit.id)} ${suit.name}, you may move it 1 additional province away.`
  }),
  ...perSuit({
    rank: 2,
    epithet: "Rallying",
    power: (suit) =>
      `Whenever you transfer ${article(suit.id)} ${suit.name}, you may pay 1 Gold and transfer another Officer.`
  }),
  ...perSuit({
    rank: 3,
    epithet: "Guiding",
    power: (suit) => `All other ${suit.name}s cost 1 fewer Gold to Recruit.`
  }),
  ...perSuit({
    rank: 4,
    epithet: "Bold",
    power: (suit) => `You may recruit ${article(suit.id)} ${suit.name} into a province with exhaustion.`
  }),
  ...perSuit({
    rank: 5,
    epithet: "Charismatic",
    power: (suit) =>
      `Whenever you Recruit another ${suit.name}s, you may immediately Recruit another Officer (of any type).`
  }),
  ...perSuit({
    rank: 6,
    epithet: "Corrupt",
    power: (suit) => `Whenever you Bribe, collect 1 additional Gold for every ${suit.name} in your Player Zone.`
  }),
  ...perSuit({
    rank: 7,
    epithet: "Cohesive",
    power: (suit) =>
      `If your action would put ${
        article(suit.id)
      } ${suit.name} into a Province with another ${suit.name}, you are not required to Cascade.`
  }),
  // Excellent/Decisive don't apply to Scribes — those two ranks stay a plain,
  // powerless Scribe card while Steward/Magistrate/Engineer get their own
  // unique text at each rank.
  ...bySuit({
    rank: 8,
    cards: {
      scribe: { name: "Plain", power: "" },
      steward: { name: "Excellent", power: "Whenever you Tax, you take 1 additional Gold." },
      engineer: {
        name: "Excellent",
        power: "Whenever you build Infrastructure, upgrade an additional Province at no cost."
      },
      magistrate: {
        name: "Excellent",
        power: "Whenever you enforce Order, remove an additional exhaustion token from any Province."
      }
    }
  }),
  ...bySuit({
    rank: 9,
    cards: {
      scribe: { name: "Plain", power: "" },
      steward: {
        name: "Decisive",
        power:
          "If your Cascade moves a Steward into a Province with another, you immediately Tax that Province (if able)."
      },
      engineer: {
        name: "Decisive",
        power:
          "If your Cascade moves an Engineer into a Province with another, you may immediately upgrade Infrastructure in that Province."
      },
      magistrate: {
        name: "Decisive",
        power:
          "If your Cascade moves a Magistrate into a Province with another, you immediately enforce Order in that Province."
      }
    }
  })
}

/**
 * Every Officer is individually authored — 9 unique cards per suit, each with
 * its own name and power text. Placeholder content until the real 36 are
 * dictated; one card's `name`/`power` is a single-field edit apiece.
 *
 * Art is keyed by the suit id rather than the card id, so the 9 cards in a suit
 * share one icon — the same reuse the old Action/permanent pairing had.
 */
export const officerDeck: Deck = OFFICER_SUITS_WITH_METADATA.flatMap(({ id }) =>
  Array.from({ length: CARDS_PER_SUIT }, (_, i) => {
    const rank = i + 1
    const cardId = `${id}-${rank}`
    const override = OFFICER_OVERRIDES[cardId]
    return {
      kind: "officer",
      id: cardId,
      name: override?.name ?? `Rank ${rank}`,
      suit: id,
      power: override?.power ?? "Power text goes here.",
      copies: flatCopies(1),
      ...artProps(id)
    }
  })
) satisfies ReadonlyArray<CardDefinition>

import { artProps } from "~/games/civil-service/assets/cardArt"
import { OFFICER_SUITS_WITH_METADATA } from "~/games/civil-service/domain/CoreDefinitions"
import { flatCopies } from "~/shared/cards/playerCount"
import type { CardDefinition, Deck } from "./domain"

/** The four States a Legacy's condition can name, in the compass order the
 * quadrant cards below pair them. */
const CORNER_STATES: Record<string, readonly [string, string]> = {
  Northwest: ["North", "West"],
  Southwest: ["West", "South"],
  Southeast: ["South", "East"],
  Northeast: ["East", "North"]
}

const CARDINAL_STATES = ["North", "South", "East", "West"] as const

/**
 * Every Legacy is individually authored — 36 unique cards, each with its own
 * name and condition text. Built from six templates (see game design notes)
 * rather than listed by hand: a suit or a State is the only thing that varies
 * within a template, so generating the 4/16/4/4/4/4 split keeps that
 * repetition from drifting card-to-card.
 */
const LEGACY_CARDS: ReadonlyArray<{ name: string; condition: string }> = [
  // Recruited most of a suit (4)
  ...OFFICER_SUITS_WITH_METADATA.map(({ name }) => ({
    name: `Master ${name}`,
    condition: `You have recruited more ${name}s than any other player.`
  })),

  // 5 of a suit across a quadrant, combined (16)
  ...Object.entries(CORNER_STATES).flatMap(([corner, [a, b]]) =>
    OFFICER_SUITS_WITH_METADATA.map(({ name }) => ({
      name: `${corner} ${name}s`,
      condition: `There are at least 5 ${name}s placed across the ${a} and ${b} States, combined.`
    }))
  ),

  // 1 of a suit in each cardinal State (4)
  ...OFFICER_SUITS_WITH_METADATA.map(({ name }) => ({
    name: `Dispersed ${name}s`,
    condition: `There is at least 1 ${name} placed in each of the North, South, East, and West States.`
  })),

  // No Exhaustion anywhere in a State (4)
  ...CARDINAL_STATES.map((state) => ({
    name: `${state}ern Peace`,
    condition: `No Province in the ${state} State carries an Exhaustion token.`
  })),

  // Both Trade Routes active in a State (4)
  ...CARDINAL_STATES.map((state) => ({
    name: `${state}ern Commerce`,
    condition: `Both Trade Routes in the ${state} State reach the Capital unbroken by Exhaustion.`
  })),

  // Infrastructure in 5 of a State's 7 Provinces (4)
  ...CARDINAL_STATES.map((state) => ({
    name: `${state}ern Industry`,
    condition: `At least 5 Provinces in the ${state} State have Infrastructure.`
  }))
]

export const legacyDeck: Deck = LEGACY_CARDS.map(({ name, condition }, i) => {
  const id = `legacy-${i + 1}`
  return {
    kind: "legacy",
    id,
    name,
    condition,
    copies: flatCopies(1),
    ...artProps(id)
  }
}) satisfies ReadonlyArray<CardDefinition>

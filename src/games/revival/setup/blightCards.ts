import type { SetupCard } from "./setupCard.ts"

/** The blight setup cards, draft of 2026-10-17; street names are placeholders. */

const H = "house"
const C = "commercial"
const I = "industrial"

const card = (name: string, entries: SetupCard["entries"]): SetupCard => ({ deck: "blight", name, entries })

/** 30 blight (8 House / 12 Commercial / 10 Industrial). */
export const BLIGHT_CARDS: readonly SetupCard[] = [
  card("Mill Row", [[I, I, C], [I, C, C], [], []]),
  card("Canal Street", [[], [H], [C, H], [I, I, C]]),
  card("Market Lane", [[], [C, C, I], [H], []]),
  card("Foundry Way", [[], [], [I, C], [H, C]]),
  card("Rail Yard", [[I, C, H], [], [], []]),
  card("Old Main", [[], [], [H], [C, I]]),
  card("Arcade Street", [[], [C, H], [], []]),
  card("Depot Road", [[], [], [], [I, H]])
]

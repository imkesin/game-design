import type { SetupCard } from "./setupCard.ts"

/** The blight setup cards, draft of 2026-10-17; street names are placeholders. */

const H = "house"
const C = "commercial"
const I = "industrial"
const P = "parking"

const card = (name: string, entries: SetupCard["entries"]): SetupCard => ({ deck: "blight", name, entries })

/** 30 blight (8 House / 12 Commercial / 10 Industrial) and 8 parking lots, one per card. */
export const BLIGHT_CARDS: readonly SetupCard[] = [
  card("Mill Row", [[I, I, C], [I, C, C], [P], []]),
  card("Canal Street", [[], [H, P], [C, H], [I, I, C]]),
  card("Market Lane", [[P], [C, C, I], [H], []]),
  card("Foundry Way", [[], [P], [I, C], [H, C]]),
  card("Rail Yard", [[I, C, H], [P], [], []]),
  card("Old Main", [[], [], [H, P], [C, I]]),
  card("Arcade Street", [[], [C, H, P], [], []]),
  card("Depot Road", [[P], [], [], [I, H]])
]

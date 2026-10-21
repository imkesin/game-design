import type { SetupCard } from "./setupCard.ts"

/** The blight setup cards, draft of 2026-10-17; street names are placeholders. */

const card = (name: string, entries: Extract<SetupCard, { deck: "blight" }>["entries"]): SetupCard => ({
  deck: "blight",
  name,
  entries
})

/** 30 blight; front-, middle- and back-loaded cards mixed so no edge rots every game (DESIGN.md, Setup cards). */
export const BLIGHT_CARDS: readonly SetupCard[] = [
  card("Mill Row", [3, 3, 0, 0]),
  card("Canal Street", [0, 1, 2, 3]),
  card("Market Lane", [0, 3, 1, 0]),
  card("Foundry Way", [0, 0, 2, 2]),
  card("Rail Yard", [3, 0, 0, 0]),
  card("Old Main", [0, 0, 1, 2]),
  card("Arcade Street", [0, 2, 0, 0]),
  card("Depot Road", [0, 0, 0, 2])
]

import { artProps } from "~/games/civil-service/assets/cardArt"
import { POWER_LIST_WITH_METADATA } from "~/games/civil-service/domain/CoreDefinitions"
import { flatCopies } from "~/shared/cards/playerCount"
import type { Deck } from "./domain"

/**
 * The permanent supply. Printed on the deck's own sheet (see routes/PrintPage) but
 * kept as a separate pile once cut: trading an assembled set for a permanent pulls
 * Actions out of circulation without ever adding to the deck, so the deck's
 * per-Power ratio holds across rounds no matter how many permanents are claimed.
 *
 * A permanent is the standing form of its Power and carries that Power's name — the
 * same name as the Action, because it is the same thing made permanent. The thick
 * dark rail inside the trim (see components/Card) is the only thing that
 * distinguishes the two, which is deliberate: one cue to learn, and no new
 * vocabulary.
 *
 * One permanent per Power for now, mirroring `actionDeck`'s one Action per Power.
 */
export const permanentSupply: Deck = POWER_LIST_WITH_METADATA.map(({ name }) => ({
  kind: "permanent",
  id: `permanent-${name.toLowerCase()}`,
  name,
  power: name,
  copies: flatCopies(6),
  ...artProps(name)
}))

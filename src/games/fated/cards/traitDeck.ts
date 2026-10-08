import type { QualityId, TraitCard, TraitValue } from "./domain"

type Entry = Omit<TraitCard, "id">

const trait = (quality: QualityId, value: TraitValue, name: string): Entry => ({
  kind: "trait",
  quality,
  value,
  name
})

/**
 * One line per physical card, so any single card can be renamed or retuned.
 * Values are spread evenly over 1–5 within a quality; Allure is a third of the
 * deck (6 per value), Prowess and Passion the middle tier (3 per value), the
 * rest scarce (2 per value). The mean card value is 3. Names are placeholders.
 * See DESIGN.md.
 */
const ENTRIES: readonly Entry[] = [
  trait("allure", 1, "Lingering Glance"),
  trait("allure", 1, "Fleeting Smile"),
  trait("allure", 1, "Tousled Hair"),
  trait("allure", 1, "Dimpled Cheek"),
  trait("allure", 1, "Easy Laugh"),
  trait("allure", 1, "Warm Voice"),
  trait("allure", 2, "Wry Smile"),
  trait("allure", 2, "Raised Eyebrow"),
  trait("allure", 2, "Silken Voice"),
  trait("allure", 2, "Playful Wink"),
  trait("allure", 2, "Graceful Bow"),
  trait("allure", 2, "Sly Compliment"),
  trait("allure", 3, "Effortless Charm"),
  trait("allure", 3, "Silver Tongue"),
  trait("allure", 3, "Captivating Laugh"),
  trait("allure", 3, "Turned Heads"),
  trait("allure", 3, "Tailored Elegance"),
  trait("allure", 3, "Quiet Confidence"),
  trait("allure", 4, "Smoldering Gaze"),
  trait("allure", 4, "Dazzling Entrance"),
  trait("allure", 4, "Honeyed Words"),
  trait("allure", 4, "Striking Profile"),
  trait("allure", 4, "Practiced Allure"),
  trait("allure", 4, "Kindled Interest"),
  trait("allure", 5, "Devastating Grin"),
  trait("allure", 5, "Magnetic Presence"),
  trait("allure", 5, "Irresistible"),
  trait("allure", 5, "Breathtaking"),
  trait("allure", 5, "Spellbinding Beauty"),
  trait("allure", 5, "Impossible to Ignore"),

  trait("prowess", 1, "Steady Hands"),
  trait("prowess", 1, "Sure Footing"),
  trait("prowess", 1, "Calloused Palms"),
  trait("prowess", 2, "Quick Reflexes"),
  trait("prowess", 2, "Keen Eye"),
  trait("prowess", 2, "Sparring Partner"),
  trait("prowess", 3, "Battle Scars"),
  trait("prowess", 3, "Tournament Veteran"),
  trait("prowess", 3, "Iron Constitution"),
  trait("prowess", 4, "Blade Mastery"),
  trait("prowess", 4, "Deadeye Archer"),
  trait("prowess", 4, "Unshaken Resolve"),
  trait("prowess", 5, "Fearless Charge"),
  trait("prowess", 5, "Legendary Duelist"),
  trait("prowess", 5, "Dragonslayer"),

  trait("passion", 1, "Flushed Cheeks"),
  trait("passion", 1, "Skipped Heartbeat"),
  trait("passion", 1, "Trembling Hands"),
  trait("passion", 2, "Racing Pulse"),
  trait("passion", 2, "Lingering Touch"),
  trait("passion", 2, "Restless Nights"),
  trait("passion", 3, "Stolen Kiss"),
  trait("passion", 3, "Whispered Confession"),
  trait("passion", 3, "Reckless Impulse"),
  trait("passion", 4, "Burning Desire"),
  trait("passion", 4, "Fevered Longing"),
  trait("passion", 4, "Breathless Embrace"),
  trait("passion", 5, "Wildfire"),
  trait("passion", 5, "Heart Ablaze"),
  trait("passion", 5, "All-Consuming Love"),

  trait("devotion", 1, "Small Kindness"),
  trait("devotion", 1, "Remembered Birthday"),
  trait("devotion", 2, "Loyal Heart"),
  trait("devotion", 2, "Patient Ear"),
  trait("devotion", 3, "Quiet Sacrifice"),
  trait("devotion", 3, "Sworn Promise"),
  trait("devotion", 4, "Steadfast Vow"),
  trait("devotion", 4, "Faithful Through Winter"),
  trait("devotion", 5, "Unbreakable Bond"),
  trait("devotion", 5, "Eternal Oath"),

  trait("influence", 1, "Useful Friend"),
  trait("influence", 1, "Borrowed Favor"),
  trait("influence", 2, "Court Whispers"),
  trait("influence", 2, "Merchant's Ledger"),
  trait("influence", 3, "Noble Name"),
  trait("influence", 3, "Powerful Ally"),
  trait("influence", 4, "Seat on the Council"),
  trait("influence", 4, "Royal Invitation"),
  trait("influence", 5, "Throne Claim"),
  trait("influence", 5, "Kingmaker"),

  trait("mystique", 1, "Odd Silence"),
  trait("mystique", 1, "Scent of Smoke"),
  trait("mystique", 2, "Unreadable Eyes"),
  trait("mystique", 2, "Locked Door"),
  trait("mystique", 3, "Hidden Past"),
  trait("mystique", 3, "Borrowed Name"),
  trait("mystique", 4, "Whispered Prophecy"),
  trait("mystique", 4, "Ancient Secret"),
  trait("mystique", 5, "Forbidden Magic"),
  trait("mystique", 5, "Fated by the Stars")
]

export const TRAIT_DECK_SIZE = 90

/** The shared draw deck: one entry per physical card. Ids number the copies of a face (`allure-3-2`). */
export const traitDeck: readonly TraitCard[] = (() => {
  const seen = new Map<string, number>()
  return ENTRIES.map((entry) => {
    const face = `${entry.quality}-${entry.value}`
    const n = (seen.get(face) ?? 0) + 1
    seen.set(face, n)
    return { ...entry, id: `${face}-${n}` }
  })
})()

if (traitDeck.length !== TRAIT_DECK_SIZE) {
  throw new Error(`traitDeck: wrong card total — ${traitDeck.length}, expected ${TRAIT_DECK_SIZE}`)
}

// Player counts are common to every game; re-exported here so civil-service code keeps
// a single domain import.
export { PLAYER_COUNTS, type PlayerCount } from "~/shared/cards/playerCount"

/**
 * How a card's name/footer bands are drawn against its paper surface.
 *
 *   - `strong`: the scale's darkest band with pale ink (`darkBand`) — the default,
 *     and what gives each Power a saturated identity stripe.
 *   - `vivid`: a bright band from the light half of the scale, with dark ink
 *     (`vividBand`). For a colour that lives in the bright part of its scale,
 *     where `.900` reads as brown rather than the hue it is named for.
 *   - `soft`: a light tint with mid-tone ink (`softBand`). For a Power whose
 *     identity is *lightness* itself, where a near-black band would misread it.
 *
 * The paper surface is always the pale end of the scale, so a card's band weight
 * is the only thing that varies.
 */
export type Band = "strong" | "vivid" | "soft"

/**
 * The four Officer suits. One authored list is the single source for the id
 * union, the palette, and every derived lookup. `color` is a Panda colour scale
 * (see ~/shared/components/paperFrame), not a raw value, so a suit tints a
 * whole surface consistently.
 *
 * Scribe is the only `soft` suit: "tan" is a lightness/neutral identity rather
 * than a hue, so it stays in warm light greys instead of carrying the near-black
 * band the others do — the same reasoning that made Guidance `soft` under the
 * old Power palette. Engineer is `vivid` for the same reason Impulse was: the
 * dark end of orange reads as brown, not the hue the suit is meant to read as.
 */
export const OFFICER_SUITS_WITH_METADATA = [
  {
    id: "scribe",
    name: "Scribe",
    color: "stone",
    band: "soft"
  },
  {
    id: "tax-collector",
    name: "Tax Collector",
    color: "green",
    band: "strong"
  },
  {
    id: "magistrate",
    name: "Magistrate",
    color: "purple",
    band: "strong"
  },
  {
    id: "engineer",
    name: "Engineer",
    color: "orange",
    band: "vivid"
  }
] as const
export type OfficerSuitId = typeof OFFICER_SUITS_WITH_METADATA[number]["id"]
export type OfficerSuitColor = typeof OFFICER_SUITS_WITH_METADATA[number]["color"]

/**
 * Suit id → its scale and band weight, derived once from the metadata list. The
 * lone cast is unavoidable: `Object.fromEntries` widens keys to `string`, but
 * the entries come straight from the typed list so the map is total.
 */
export const OFFICER_PALETTE: Record<OfficerSuitId, { color: OfficerSuitColor; band: Band }> = Object
  .fromEntries(
    OFFICER_SUITS_WITH_METADATA.map(({ id, color, band }) => [id, { color, band }])
  ) as Record<OfficerSuitId, { color: OfficerSuitColor; band: Band }>

/**
 * The Legacy deck has no suits — every card is individually authored — so it
 * carries one uniform identity instead of a per-card palette. `zinc` sits apart
 * from every Officer suit's hue (stone/green/purple/orange), the same way
 * Disaster's red once stood apart from the Powers.
 */
export const LEGACY_PALETTE = {
  color: "zinc",
  band: "strong"
} as const

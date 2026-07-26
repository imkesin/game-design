// Player counts are common to every game; re-exported here so numina code keeps
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
 * The five Powers. Mirrors graft's `FRUIT_LIST_WITH_METADATA`: one authored list
 * is the single source for the name union, the palette, and every derived
 * lookup. `color` is a Panda colour scale (see ~/shared/components/paperFrame),
 * not a raw value, so a Power tints a whole surface consistently.
 *
 * Guidance is the only `soft` Power: it reads as light/neutral rather than as a
 * hue, so it stays in very light greys throughout instead of carrying the
 * near-black band the others do. Impulse is `vivid` because the dark end of amber
 * is a brown — indistinguishable from Disaster's dark red at a glance, and nothing
 * like the yellow the Power is meant to read as.
 */
export const POWER_LIST_WITH_METADATA = [
  {
    name: "Abundance",
    color: "lime",
    band: "strong"
  },
  {
    name: "Ingenuity",
    color: "cyan",
    band: "strong"
  },
  {
    name: "Devotion",
    color: "purple",
    band: "strong"
  },
  {
    name: "Guidance",
    color: "neutral",
    band: "soft"
  },
  {
    name: "Impulse",
    color: "amber",
    band: "vivid"
  }
] as const
export type PowerName = typeof POWER_LIST_WITH_METADATA[number]["name"]
export type PowerColor = typeof POWER_LIST_WITH_METADATA[number]["color"]

/**
 * Disaster is not a Power: it has no place among the five and never appears where
 * a Power is asked for. Dark red sits next to Impulse's amber on the wheel, so the
 * hazard striping on its bands (see components/Card) is what actually sets it
 * apart — not the hue alone.
 */
export const DISASTER = {
  name: "Disaster",
  color: "red",
  band: "strong"
} as const

/**
 * Power → its scale and band weight, derived once from the metadata list. The lone
 * cast is unavoidable: `Object.fromEntries` widens keys to `string`, but the
 * entries come straight from the typed list so the map is total.
 */
export const POWER_PALETTE: Record<PowerName, { color: PowerColor; band: Band }> = Object
  .fromEntries(
    POWER_LIST_WITH_METADATA.map(({ name, color, band }) => [name, { color, band }])
  ) as Record<PowerName, { color: PowerColor; band: Band }>

import { Banana, Cookie, Croissant, Droplet, Egg, Grape, type LucideIcon, Milk, Wheat } from "lucide-react"
import type { ResourceId } from "~/games/meeple-syrup/cards/domain"

/**
 * One Lucide mark per resource, standing in until the deck has real
 * illustration. Same role as civil-service's `OFFICER_SUIT_ICONS`: marks are
 * presentation, so they live beside the components that draw them rather than
 * in the card data.
 *
 * Three are approximations Lucide can't do better: Chocolate takes the cookie
 * (there is no chocolate mark, and the deck's chocolate is chips), Blueberries
 * take the grape (the only berry cluster), and Butter takes the croissant —
 * the mark closest to what butter is *for*, since a pat of butter has no
 * silhouette to speak of.
 */
export const RESOURCE_MARKS: Record<ResourceId, LucideIcon> = {
  "maple-syrup": Droplet,
  chocolate: Cookie,
  blueberries: Grape,
  bananas: Banana,
  eggs: Egg,
  milk: Milk,
  butter: Croissant,
  flour: Wheat
}

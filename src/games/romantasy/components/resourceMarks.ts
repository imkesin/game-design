import { Crown, Eye, Flame, Heart, type LucideIcon, Moon, Swords } from "lucide-react"
import type { ResourceId } from "~/games/romantasy/cards/domain"

/** One Lucide mark per resource, standing in until the deck has real illustration. */
export const RESOURCE_MARKS: Record<ResourceId, LucideIcon> = {
  allure: Eye,
  prowess: Swords,
  passion: Flame,
  devotion: Heart,
  influence: Crown,
  mystique: Moon
}

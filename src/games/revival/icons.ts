import { Factory, House, Store, Trees } from "lucide-react"

/** Each piece's icon, drawn white on its color (cards and tiles alike). */
export const ICON = {
  house: House,
  commercial: Store,
  industrial: Factory,
  park: Trees
} as const

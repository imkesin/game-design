import { Building2, Factory, House, Store, Trees } from "lucide-react"

/** Each piece's icon, drawn white on its color (cards and tiles alike). */
export const ICON = {
  house: House,
  commercial: Store,
  industrial: Factory,
  park: Trees,
  /** A generic, typeless building: drawn faint on a blight tile and its "no blight" badge alike. */
  blight: Building2
} as const

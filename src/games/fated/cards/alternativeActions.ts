import type { AlternativeAction } from "./domain"

/** The name printed on a scene; the rules for each action live in DESIGN.md. */
export const ALTERNATIVE_ACTION_NAME: Record<AlternativeAction, string> = {
  explore: "Explore",
  motivate: "Motivate",
  develop: "Develop"
}

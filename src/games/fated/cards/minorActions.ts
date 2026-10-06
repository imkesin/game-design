import type { MinorAction } from "./domain"

/** The name printed on a scene; the rules for each action live in DESIGN.md. */
export const MINOR_ACTION_NAME: Record<MinorAction, string> = {
  explore: "Explore",
  motivate: "Motivate",
  develop: "Develop"
}

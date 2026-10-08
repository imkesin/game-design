import type { SceneScoring, ScoringTiming } from "./domain"
import { QUALITY_BY_ID } from "./qualities"

/** The label printed above a scene's scoring line. */
export const SCORING_TIMING_NAME: Record<ScoringTiming, string> = {
  instant: "Instant",
  endGame: "End Game"
}

/** `1 Love per 3 Prowess`; the per-1 case drops the number. */
export function scoringText({ love, amount, quality }: SceneScoring): string {
  const per = amount === 1 ? "" : `${amount} `
  return `${love} Love per ${per}${QUALITY_BY_ID[quality].name}`
}

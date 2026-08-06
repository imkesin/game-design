/**
 * Per-game theme seam.
 *
 * All games currently share one Panda token set (see panda.config.ts) — that is
 * the point of "related but distinct" games: a common paper stock and card
 * grammar. When a game needs its own palette or scale, register the divergent
 * values under Panda's `themes` and gate them on `[data-theme="<id>"]`.
 * `main.tsx` stamps this id onto `<html>` for the active game, so tokens can
 * diverge with no component changes.
 */
export const MEEPLE_SYRUP_THEME_ID = "meeple-syrup"

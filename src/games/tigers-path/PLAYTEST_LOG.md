# Tiger's Path — Playtest Log

Real games. Newest first. Board specs are the source of truth (`boards/*.ts`); this records what
happened at the table and what it implies. Capacity = paths + slots (each is one action/placement).

## Board usage so far

| Game       | Paths       | Slots (discs) | Placements  | Per player | vs. expected¹ |
| ---------- | ----------- | ------------- | ----------- | ---------- | ------------- |
| 2P, latest | 16/17 (94%) | 18/26 (69%)   | 34/43 (79%) | 17.0       | 34/37 (92%)   |
| 3P, first  | 20/24 (83%) | 9/39 (23%)    | 29/63 (46%) | 9.7        | 29/52 (56%)   |

¹ Expected placements per BOARD_PLAN §1 (2P ~37, 3P ~52).

**The one clean signal:** paths saturate in both games (94% / 83%); the whole difference is the
**disc layer** (69% vs 23%). The 2P table developed its scoring engine to a near-full, well-timed
finish; the 3P table (new players) ended it at half-development. The board isn't too big — same
design language, same path saturation. Don't trim the graph on this.

## Game — 2P, latest

- **Board:** 2P (East), 43-action capacity. **1 path + 8 slots open** at end.
- Played essentially as designed: 34 placements vs the ~37 expected (92%).
- Score / end trigger: not recorded.

## Game — 3P, first 3-player test (2026-08-23)

- **Players:** 3, all new. **Board:** 3P (West), 63-action capacity.
- **Result:** 6 – 4 – 1. Winner aligned **Snake**; game ended when Snake maxed (track position 8).
- **4 paths + 30 slots open** at end — 54% of capacity unplayed, almost all of it slots. Discs are
  the points, so 77% of the scoring opportunities went untouched.
- Each player got ~9.7 board-plays vs 17.0 in the 2P game — barely half the agency, because a fixed
  7-advance trigger doesn't scale with player count and the game got rushed to it.

### Why this is a misplay, not a design flaw

- **The rank tiebreaker is the anti-rush governor.** Snake is the lowest rank (T > E > M > B > S),
  so a Snake player who ends at 6 loses _every_ tie. Here the Monkey player could have reached 6 to
  tie — and **Monkey beats Snake on rank**, taking the win. They left it on the table.
- To make ending at 6 actually safe, the Snake player would need a **strict lead** (7+), i.e. grind
  Elephant for several turns first — which forces the longer game on its own. The rush can't double
  as the quick kill.
- **Verdict:** end trigger stays as-is. The confounds are new-player skill (undeveloped disc layer,
  the missed tie) — not board size or trigger length. Re-test with a table that plays the tie.

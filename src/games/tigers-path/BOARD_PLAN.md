# Tiger's Path — Board Plan (2–5 players)

How the four player-count boards are **sized**, **related**, **laid out on paper**, and **maintained
in the repo**. Sizing rationale lives here; per-count logical specs live in their spec files; game
rules live in `DESIGN.md` / `domain.ts`.

## 1. Capacity targets

Anchor is the tuned 2P board: **37 expected placements, 43 actions (17 paths + 26 slots), ~16%
slack**. Capacity scales as `placements × (43/37)` (×1.162), trimmed slightly as player count rises
because contention wastes actions — the board plays tighter than its nominal number.

| Players | Placements | Proportional (×1.162) | **Recommended** | Slack | Slack % |
| ------- | ---------- | --------------------- | --------------- | ----- | ------- |
| 2       | 37         | 43                    | **43**          | 6     | 16%     |
| 3       | 52         | 60                    | **~59**         | 7     | 13%     |
| 4       | 66         | 77                    | **~75**         | 9     | 14%     |
| 5       | 80         | 93                    | **~90**         | 10    | 13%     |

Boards are deliberately **tight**: scarcity is what lets players check a leader. A rare early
deadlock (board fills before anyone reaches an animal-track end) is acceptable.

In board parts (holding 40:60 paths:slots, ~1.8 slots/clearing, avg degree ~2.4):

| Players | Capacity | Paths | Slots | Clearings |
| ------- | -------- | ----- | ----- | --------- |
| 2       | 43       | 17    | 26    | 14        |
| 3       | ~59      | 24    | 35    | ~20       |
| 4       | ~75      | 30    | 45    | ~25       |
| 5       | ~90      | 36    | 54    | ~30       |

The 2P row reproduces the current board exactly — the calibration check.

## 2. Board relationship: independent, shared language

- **Independent graphs.** Each count's graph is designed and tuned on its own; a larger board is
  **not** a superset of a smaller one. This is required by the per-count tightness goal — a nested
  board can't be individually tuned.
- **Shared design language** across all four: one marquee hub, a bottom Grassland, consistent
  animal-region geography, the same slot-level vocabulary and visual style. Boards stay recognizable
  and the generator + metrics stay reusable.

### Cardinal theme

Each board owns a compass direction — a naming/flavor device, not a layout constraint:

| Board | Direction | Placement             |
| ----- | --------- | --------------------- |
| 2P    | **East**  | right half of Sheet 1 |
| 3P    | **West**  | left half of Sheet 1  |
| 4P    | **North** | own sheet             |
| 5P    | **South** | own sheet             |

- Clearing names can lean into their board's direction (an eastern-frontier node on 2P's right edge,
  etc.).
- The four boards read as a **compass around a shared Grassland center** — the long-term "they line
  up" artistic vision. The bottom (south) Grassland also rhymes with 5P = South.
- **Not a hard constraint:** we do _not_ require, e.g., 4P's southern clearings to reappear atop 2P
  or 3P. It's flavor and future potential, not a tiling spec.

## 3. Print scheme — three Arch-C 24×18 sheets

Uniform **24×18 landscape** (Arch C) for all sheets simplifies printing. Sheet 1 is **built** (see
§9); the layout is two 11.5×17 portrait halves side by side, a 0.5" gutter between them, centred so
the leftover paper is an even margin.

| Sheet | Size  | Contents                                             | Grassland          |
| ----- | ----- | ---------------------------------------------------- | ------------------ |
| 1     | 24×18 | **3P** (West, left half) + **2P** (East, right half) | **one per half**   |
| 2     | 24×18 | **4P**, full sheet                                   | own, bottom-center |
| 3     | 24×18 | **5P**, full sheet                                   | own, bottom-center |

- **2P/3P share Sheet 1** because each fits comfortably in an 11.5×17 half (~195 sq in > the old
  letter board's 84). You play one half + its Grassland; the other half is simply ignored.
- **Two independent Grasslands, one per half** (decided during the Sheet-1 build). Each half is a
  fully self-contained board with its own bottom-centre semicircle, and the **dashed centre gutter
  divider** sits cleanly between them. This diverges from the earlier "one shared Grassland
  straddling the gutter" idea — that would have put the divider straight through the field, and it
  would have forced each half to be re-solved with the Grassland obstacle pinned to its inner-bottom
  corner instead of its own centre.
- **2P renders spread out** into its half (no longer cramped onto letter), with its on-board
  Grassland — no separate component needed.
- **4P/5P each take a full sheet** to preserve breathing room.

## 4. Grassland requirements (all boards)

- On-board **semicircle** clipping the bottom edge (~4" radius on a full sheet), grass tint, solid
  arc border.
- **Open field**: no printed cube spaces, no disc rings, no internal divisions. Its emptiness is the
  anti-confusion signal — paths have printed cube outlines, clearings have disc rings, the Grassland
  has neither.
- **Hard buffer moat** ≥ ~0.75–1" between the arc and any path/clearing; no path routes through or
  terminates into the buffer.
- **Sized for peak loose cubes**, not average. Total economy is 150 cubes (26/28/30/32/34). Target
  peak ≤ ~30 so the open field stays countable — **the one number that needs playtest data**. If
  peak runs hotter, revisit the field (faint per-type lanes) or the draw/harvest economy.

## 5. Structure per board

- **Marquee:** exactly one clearing = top degree (4–5) **and** the only 4-slot clearing — the
  contested heart. High degree self-limits snowball (access can't be walled off); tune snowball via
  the marquee's **slot levels** (skew high-level → late-game climax rather than early land-grab).
- **Hubs:** 2–3 clearings at degree 4–5 as contested hearts; dense core; **minimal degree-1
  peninsulas** (they're uncontested "safe" spaces that undercut defense).
- **Slots:** cap 4 (marquee only); all others ≤3, mostly 1–2; avg ~1.8/clearing.
- **Paths:** skew 2–3 cubes for cheap blocking; reserve 4-cube paths for real commitments / marquee
  approaches. Avg degree ~2.4.

## 6. How the graph is managed (workflow)

This is what keeps four boards from becoming four times the hand-work.

- **Single source of truth per count.** One graph module each under `boards/` (`2p.ts`, `3p.ts`, …
  `boards/index.ts` re-exports them; shared `boards/types.ts`): clearings (slots, levels,
  region-hint anchors) and paths (endpoints, cube counts). No hand-placed coordinates. Rules the
  graphs draw on (animal ranks, slot levels, thresholds) stay in `domain.ts`, never forked.
- **Relative anchors → region-agnostic rendering.** Anchors are 0..100 within a target region, so
  the _same_ graph renders into a full sheet or a half-sheet bbox just by changing the region. This
  is what lets each graph be maintained in one spot yet rendered into whatever box a variant gives.
- **Shared generator.** `buildSpec(variant)` picks the graph + box + Grassland for a variant; the
  generator optimizes an organic, crossing-free layout and bakes every variant into `maps.json`,
  which the print routes read. Enforces geometric invariants at build time. **Two-up composition is
  done by CSS** — `BoardPrintSheet1` renders two independently-solved half-maps side by side in a
  grid with a dashed gutter — so no solver origin/offset was needed after all.
- **Metrics / lint gate.** Two tiers — see §9 for what is actually wired up today:
  - _Geometry (enforced now, hard build failure):_ `crossings == 0`; `minNodeGap` / `minPathClear` /
    `minCubeSlack` / `minGrasslandClear` ≥ thresholds (driven by 30mm discs, 10mm cubes, the moat).
  - _Structural (deferred by decision — §10):_ degree distribution, the one-4-slot-clearing rule,
    capacity/slack band, path-length mix. Pure functions of the spec; add later if boards drift.
- **Tuning loop.** Edit a `boards/*.ts` graph → `pnpm tp:map:paint [variant|sheet1]` → look at the
  PNG → iterate. Playtest feeds back: real placement counts, deadlock rate, Grassland peak → adjust
  graphs.

## 7. Shared vs per-count parameters

- **Shared (rules, never forked):** animal ranks, track values, slot-level thresholds, contest
  hierarchy.
- **Per-count (board):** capacity, clearing/path/slot counts, degree distribution, marquee
  placement, Grassland size, sheet region.
- **Open — needs a decision:** does the 150-cube economy scale with player count? More players
  consume more cubes; the bag and/or starting supply may need per-count values.

## 8. Open questions / playtest inputs

- **Grassland peak cube count** — sizes the semicircle; keep ≤ ~30 so the open field stays
  countable.
- **Deadlock rate** — a few % is acceptable; confirm the trigger-only end (no board-full fallback)
  holds up in play.
- **Cube economy scaling** per player count (§7).
- **Placement estimates** — 37/52/66/80 are rough; refine from real games and re-derive §1.
- **4P/5P pairing** — currently each takes a full sheet; revisit only if breathing room proves
  excessive.

## 9. Implementation status (what's built)

The pipeline (`map/spec.ts` → `map/layout.ts` → `map/build.ts` / `map/paint.node.ts`) now supports:

- **Per-count graph modules.** `boards/2p.ts` (`BOARD_2P`, 14 clearings / 17 paths / 26 slots) and
  `boards/3p.ts` (`BOARD_3P`, 20 clearings / 26 paths / 33 slots = **59 actions**, hitting the §1 3P
  target) are independent graphs sharing the `boards/types.ts` `BoardGraph` shape.
- **Board variants.** `spec.ts` defines `VARIANTS` (+ `ALL_VARIANTS`); `buildSpec(variant)` returns
  the spec for one, pairing a graph with a render box + Grassland flag. Live today:
  - `2p-split` — the East half, **portrait**, 11.5×17in, on-board Grassland.
  - `3p-split` — the West half, same 11.5×17in portrait box + Grassland, using `BOARD_3P`.
  - `2p-solo` — standalone **letter portrait**, 8.0×10.5in, Grassland **off-board** (separate
    component). The home-printable 2P.
- **Composed Sheet 1.** `BoardPrintSheet1` (`/print/board/sheet1`, also the default `/print/board`)
  renders `3p-split` (left) + `2p-split` (right) on one **24×18** page — a CSS grid
  `[board][gutter][board]` with a **dashed centre divider**, boards centred so the leftover paper is
  an even margin. Each half keeps its own Grassland (§3).
- **Orientation by anchor rotation.** `rotate()` turns the authored landscape targets 90° CW into
  portrait. Anchors are relative (0..100), so the _same_ graph re-solves into whatever bounds a
  variant gives — no second graph, no pixel rotation.
- **Grassland as a solver obstacle.** Modeled as a fixed disc centered on the bottom edge (radius +
  `GRASS_MOAT`); `relax`/`projectNoOverlap`/`chooseCurves` keep clearings and paths out of it, and
  `verify` gates on `minGrasslandClear ≥ 0`. Rendered as a **light dotted semicircle** (not a fill),
  so it recedes behind the high-contrast clearings.
- **One file, all variants.** `pnpm tp:map:build` bakes every variant into `maps.json`.
  `pnpm tp:map:paint [variant]` rebuilds all + screenshots one variant's print route to
  `preview.png`. (`map.json` was removed.)
- **Print routes.** `/print/board/sheet1` (default), `/print/board/2p-solo`; the standalone
  `/print/board/2p-split` and `/print/board/3p-split` remain for the paint/tuning loop but are not
  linked from `PreviewPage`. `BoardMap` takes the map as a prop; single-board pages frame the sheet
  to the board (0.25in margins), the composed page pins to 24×18.
- **`PreviewPage`** links Sheet 1 + the solo 2P + powers board + player aid (no inline board — we
  decided inline preview read poorly; separate print pages are the interface).
- **4-slot marquee support.** `RADIUS_IN[4]` added (2×2 icon grid). Was a hard blocker — an unlisted
  slot count produced a `NaN` radius.
- **Paint viewport fits the widest sheet.** `paint.node.ts` uses a 2600×1900 viewport so the 24in
  composed sheet isn't centred off-screen by the flex wrapper (which screenshots the overflow
  black).

**Extending to a new board is a small change:** add a `boards/*.ts` graph, a `VARIANTS` entry
(`spec.ts`), and (if standalone) a route + `PreviewPage` link.

## 10. Learnings from the build

- **Capacity is 43, not 40.** A "placement" is one _action_ — claim a whole path _or_ fill one slot
  — so board actions = **17 paths + 26 slots = 43**. Cubes are components a path consumes, not
  action counts. 2P plays to ~37 placements (~86% fill), leaving ~6 slack.
- **Sizing formula.** capacity ≈ placements × (43/37 ≈ 1.16), trimmed slightly for contention as
  count rises → **2P 43 / 3P ~59 / 4P ~75 / 5P ~90** (see §1). Deliberately tight: scarcity is what
  lets players check a leader, and the game ends on the animal-track trigger, not a board-fill, so a
  rare early deadlock is acceptable.
- **A half-sheet is bigger than the old whole board.** One half of 18×24 ≈ 195 sq in > the old
  letter board's 84 — which is why 2P _and_ 3P each fit a half, and why 2P "spread out" once
  rotated.
- **Relative anchors are the leverage.** Because targets are 0..100 of the target region,
  orientation and (soon) sub-region placement are free — the same graph re-solves into any box. This
  is the whole reason four boards stay maintainable.
- **Grassland: contrast, not size, sets hierarchy.** A big zone still recedes if it's low-contrast
  (dotted, hairline edge, quiet label) while clearings keep dark rings + bold numbers. A solid fill
  competed; a dotted pattern does not. Its _emptiness_ (no cube spaces, no disc rings) is also the
  anti-confusion signal vs paths/clearings.
- **SVG arc gotcha.** A bottom-edge semicircle needs arc sweep-flag `1` to bulge up into the sheet;
  `0` bulged off the bottom and only the chord showed.
- **Margins matter for the solo fit.** The rotated graph needs ~8.0×10.5in of cube room; 0.25in
  letter margins fit it, 0.4in (7.7×10.2) did not. `minCubeSlack` is the binding constraint when the
  graph repacks — watch it.
- **Length-2 paths are dangerous next to cheap slots.** A 2-cube path claimed then an adjacent
  cost-2 slot filled = a whole clearing established for 4 total — too cheap. Rule applied to the 3P
  graph and required for 4P/5P: keep length-2 paths **rare**, and every clearing a length-2 path
  touches must have a **minimum slot cost of 3** (the top-level pentagon on a length-2 peninsula
  like Wild Mango also needs a maxed Boar track, so it's not a cheap upgrade either).
- **Composition didn't need a solver change.** Two independently-solved 11.5×17 half-maps drop into
  a CSS grid at true inch sizes and print correctly at 24×18; the only gotcha was the paint-preview
  viewport (see §9), never the print itself.
- **Structural lint was deferred on purpose** ("see boards first"). Only the geometry gate is wired
  up. Revisit if hand-authored boards start violating §5.

## 11. Next steps (roadmap)

Done: **3P West graph + two-up Sheet 1** (§9) and **per-count graph source** (`boards/`) — the
compositor turned out to be pure CSS (side-by-side render), so no solver origin/offset was needed,
and Sheet 1 uses two independent Grasslands rather than one shared (§3).

In priority order:

1. **4P (North) and 5P (South) full-sheet boards.** New graph modules + variants at ~75 / ~90
   actions, each with a marquee (degree 4–5 + the sole 4-slot clearing) and 2–3 hubs (§4–5).
2. **3P balance pass** (playtest) — the 20-clearing graph is a first draft: confirm real placement
   counts land near 59 actions, the marquee stays the contested heart, and the frontier loop (Cobra
   Rocks / Deodar / Nilgai) isn't a dead pocket.
3. **Grassland peak-cube number** (playtest) — sizes the semicircle; keep ≤ ~30 so the dotted field
   stays countable. Provisional radius today: 3.25in.
4. **Cube economy scaling** — decide whether the 150-cube bag changes per player count (§7).
5. **Optional later:** the structural lint (§6/§10); portrait anchor re-tuning if a rotated
   composition reads awkwardly; verifying real print output across orientations.

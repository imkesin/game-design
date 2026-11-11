# Fiber: components

Physical pieces and what they force on the board. Rules live in [DESIGN.md](./DESIGN.md). Anything
unknown is `TBD`, not invented.

## Pieces (prototype, 2026-11-09)

| Piece        | Form                                  | Size (mm)     | Notes                                              |
| ------------ | ------------------------------------- | ------------- | -------------------------------------------------- |
| **Terminal** | cube                                  | 20 × 20 × 20  | One per node. Player color. Biggest piece on board. |
| **Hub**      | disc, two-sided (Unlit / Lit)         | Ø15 × 10 tall | Unlit = blank player color; Lit = white four-point spark on player color (2026-11-09). Flips in place. |

| **Cable**    | stick                                 | 20 × 5 × 5    | Feeder cable on an edge. A bit shorter than a Catan road. |

- Cable: the stick slot is the exact 20×5mm footprint inside a **1mm flat grey border** (22×7mm
  outline), so it reads as a place to put a piece. A link needs ≥ 32mm of visible run between pads
  (20 + 1mm border + 5mm air, each end; raised from 26 on 2026-11-09 to force less congestion).
  Springs aim for 38mm. Cost is 1–3 dots inside the slot.
- Read: Terminal = heavy relay building, Hub = small cabinet. Cube vs disc keeps them distinct at a
  glance, before color.
- Hub is 10mm tall, so the **Lit / Unlit face is on the flat top**; it can't be read from the side.
  Print each face edge to edge.
- Terminal is two-sided in state: placed **Unspliced**, flipped to **Active** by Splice
  (2026-11-10; placed directly, no Hub upgrade). How a cube shows two states is `TBD` (marker,
  orientation, or a different piece). Terminal slot is never shared with Hub slots, so nothing stacks.
- Counts per player: `TBD`. Hubs, Terminals and cables all live on the player mat; emptying any one
  triggers the end (DESIGN.md). Scaling by player count: see **Board and player counts**.
- Not yet sized: **Commissioner** pawn, **Legacy Telco** blockers, **Receipt** / **BEAD** tokens,
  workers.

## Node pad

A node is one fixed pad with three printed slots. Slot outline = piece + 1mm clearance per side,
3mm between outlines so a finger can pick a piece up.

| Slot          | Outline        |
| ------------- | -------------- |
| Terminal ×1   | 22 × 22        |
| Hub ×2        | Ø17 each       |

Two packings, same area:

```
A: side by side (42 × 37)        B: stacked (37 × 42)

┌────┐  ( )                       ┌────┐
│ T  │                            │ T  │
└────┘  ( )                       └────┘
                                  ( ) ( )
```

- **A** (Terminal left, Hubs stacked right): 42 wide × 37 tall. Suits horizontal edges.
- **B** (Terminal top, Hubs side by side below): 37 wide × 42 tall. Suits vertical edges.
- Both ≈ 1,550 mm² (~15.5 cm²). Add ~4–6mm for the node name and region band: **about 46 × 42 mm**
  in practice.
- Pick one orientation, or let the layout rotate pads per node; cable edges enter from the pad
  sides that face the neighbor.

## Variable Hub slots (2026-11-09)

- Each node prints **1–3 Hub slots** (Terminal slot always 1), by town size: Austin and San Antonio 3,
  mid-size towns 2, small towns 1. Pad grows only sideways: 1 Hub 41×24mm, 2 Hubs 58×24mm,
  3 Hubs 75×24mm. Slots are the **exact** piece footprint (Terminal 20, Hub Ø15, stick 20×5),
  2mm between slots (Hub–Hub and Terminal–Hub), inside a **2mm flat border** in the region's
  color. Name is a separate **label box** centred 1mm under the pad, same
  color, white 4mm **small-caps** text (capitals full height, lowercase as small capitals); adds 6.8mm below the pad. Kept clear by the layout. (Tried a joined
  tab: names read better with separation.) Every rectangle (pads, labels, slots, sticks) has a
  0.5mm corner radius, nearly hard-edged (stick-slot borders: 1mm, rounder on purpose).
- **Empty Terminal and Hub slots are halos** (2026-11-09; stick slots stay solid white, halos made links too busy): a 1mm solid white ring inset in the footprint, and a
  70% white well in the centre over the board grey, "waiting to be filled". Pieces cover them.
- **Colors** live in `colors.ts`, named by role; the `/fiber` page shows a palette section (grey
  ramp light→dark plus swatches in place). Board is greys only; player colors are the only
  saturation.
- Layout rule (2026-11-09, smallest pads): one row only as tall as the Terminal slot (20mm);
  Terminal left, Hubs built out in a row to its right, max 3. Supersedes the A/B packings below.
- **Slots are identical; no printed per-slot costs** (user: printed costs per slot make the board
  visually overwhelming). The 2nd-Hub surcharge stays a rule, not printed art.
- Hub supply must stay below total slots, or the board fills before the end trigger.
- Test map: `/fiber` (7 nodes, 3 regions: North = Austin, Buda, San Marcos; South = New Braunfels,
  San Antonio; East = Lockhart, Seguin; 10 × 10in sheet with a 1in grid, true mm scale).
  `map/map.ts` holds the graph and soft targets; `map/layout.ts` solves pad positions and curved
  links (Tiger's Path pipeline: relax → bend choice → verify → retry). Pads and stick slots are
  fixed outlines; link cost is 1–3 dots inside the stick slot (no coin icon; the built stick covers
  it, since cost only matters before building); links bow to give each stick slot ≥ 32mm of visible run. "Reroll" nudges
  targets ±15mm for nearby variants.
- **Regions** (2026-11-09, `map/regions.ts`): Voronoi of every pad's and label's outline (sampled
  every 4mm, so a wide pad claims its width), **clipped to the sheet**, cells merged per region.
  **Tint levels** (2026-11-09): 4 greys, lightest to darkest, each with an extremely faint hatch:
  plain, dots, diagonal, cross (lines 2mm apart, dots 3.5mm apart so they read lighter, 0.15mm lines, `#d4d4d4`). Regions get a level by greedy
  map coloring, so touching regions never match; 4 levels cover any number of regions. **A level
  is a palette family**: its hatch on bare paper (**no region fills**, 2026-11-09), and its pad/name-tab grey (`#878787` → `#606060`,
  lighter regions get lighter towns), so a region's towns read as one group. Links, stick-slot
  borders and region borders stay constant across levels. Region names are **off for now**; the
  placer (`map/labels.ts`: open spot furthest from pads, links, borders) is kept for later. Border where regions meet is a **double line** (two 0.5mm lines, 1mm white gap) (never along the sheet edge).
  A border sits midway between towns, so ≥ 6mm from any pad. The layout pulls a region's towns
  gently together (`GROUP_PULL`); a region in more than one piece is flagged in red.

## What the sizes force on the board

- **~30 nodes × ~16–19 cm² ≈ 470–570 cm² of pad.** On a 20 × 20 in (508 mm) board, ~2,580 cm², pads
  alone are **~20%** before edges, spine, region shading and the worker-placement tiles. Board size
  is `TBD`; this is the first number to check it against.
- **A node is large relative to a town.** Spacing between pads must leave room for the printed
  edge **and** its cost, so neighbor centers sit **≥ ~70mm** apart (pad 46 + ~24 for an edge).
  Long thin I-35 corridor suggests a landscape board; nodes spread along the spine.
- **Region of 2–3 nodes** = a cluster of 2–3 pads, ~100–150mm across. Marketing's regional flip
  needs the whole cluster visually obvious (shared band color).
- **Cube is 20mm tall**: tall pieces next to a cable edge can hide the cost printed on it. Keep
  edge costs on the edge midpoint, away from the pad.
- Every node holds 3 pieces max (1 Terminal, 2 Hubs). Pad is full-size even when empty, so an
  empty map still shows the whole network's capacity.

## Board and player counts (2026-11-10)

- **Double-sided board:** **2–3 player** map on one side, **4–5 player** map on the other.
- **4–5 is a wider corridor:** same Austin–San Antonio core, plus outlying towns. More nodes,
  regions about the same size.
- **Fringes:** each side has edge areas with a player-count badge: a **3p fringe** on the 2–3 side,
  a **5p fringe** on the 4–5 side. Out of play at the lower count. How they read as "off" (lighter
  tint, dashed border, badge only) is `TBD`.
- My suggestion, not decided: keep the geography consistent. Towns in the 3p fringe could be core
  on the 4–5 side, and the 5p fringe goes one ring further out.
- **Player mat:** prints the full supply. Some slots carry a player-count badge; at higher counts
  those pieces go back in the box (fewer starting buildings).
- **Workers per player by count:** undecided. 6 tiles stay fixed, so total workers rise with player
  count (16 at 4p at 2 + 2 each). Decide after the map.

### Capacity rule of thumb (from Tiger's Path: count placements, not pieces)

- The game ends when the **first** player empties **one** pile, so at the end the board holds about
  `players × supply × f` of each piece (`f` < 1, guess ~0.7–0.8). Size each map so its slots run
  **just short of full** at that point: contention without gridlock.
- Per piece: **Hub slots** ≈ players × Hub supply × `f`; **nodes** (Terminal slots) ≈ players ×
  Terminal supply × `f`; **links** ≈ players × cable supply × `f`.
- A fringe adds about one player's share of each, so 3p ≈ 2p + fringe and 5p ≈ 4p + fringe.
- If a map can't fit the counts, change the sheet or the mat badges, not the gameplay numbers.

### 2–3 player side: numbers (2026-11-10)

Ratio **Hubs : Terminals : cables = 2 : 1 : 1** on the mat; map is **Hub slots : nodes : links =
2 : 1 : 1.5** (avg 2 Hub slots per node; 1.5 links per node ≈ 9 loops, about ⅓ of links unbuilt).

| Count | Mat per player     | Total supply | Map (Hub slots : nodes : links)   | Worst-case spare |
| ----- | ------------------ | ------------ | --------------------------------- | ---------------- |
| 2p    | 14 : 7 : 7         | 28 : 14 : 14 | core **32 : 16 : 24**             | 4 Hubs, 2 nodes  |
| 3p    | 12 : 6 : 6 (badge) | 36 : 18 : 18 | core + fringe **40 : 20 : 30**    | 4 Hubs, 2 nodes  |

- **Breathing-room rule (user, all counts):** total Hub supply < Hub slots, and total Terminals <
  nodes, so the board can never fill even if every piece is placed. Typical games end ~65–75% full.
- 3p fringe = **8 : 4 : 6** (4 nodes). Mat badges are on 2 Hubs, 1 Terminal, 1 cable.
- **Action tiles live off the board**, laid along one edge (user, 2026-11-10). The whole board side
  is map.
- **Next:** check that 40 : 20 : 30 fits on one side of the board.

## Open

- Do Hub slots print the Unlit face or a blank outline when empty? (Slot art may double as a
  reminder of which face is the default.)
- Is the pad a printed outline on the board only, or a recessed/punched slot (tabletop-sim /
  die-cut)? Outlines above assume print only.
- Board size and fold (see Revival's quad-fold for reference).

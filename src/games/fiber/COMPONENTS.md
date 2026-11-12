# Fiber: components

Physical pieces and what they force on the board. Rules live in [DESIGN.md](./DESIGN.md). Anything
unknown is `TBD`, not invented.

## Pieces (prototype, 2026-11-09)

| Piece        | Form                          | Size (mm)     | Notes                                                                                                                                 |
| ------------ | ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Terminal** | cube                          | 16 × 16 × 16  | One per node. Player color. Shrunk from 20mm on 2026-11-11 to save map space.                                                         |
| **Hub**      | disc, two-sided (Unlit / Lit) | Ø12 × 10 tall | Unlit = blank player color; Lit = white four-point spark on player color (2026-11-09). Flips in place. Shrunk from Ø15 on 2026-11-11. |

| **Cable** | stick | 20 × 5 × 5 | Feeder cable on an edge. A bit shorter than a Catan road. |

- Cable: the stick slot is the exact 20×5mm footprint inside a **1mm flat grey border** (22×7mm
  outline), so it reads as a place to put a piece. A link needs ≥ 32mm of visible run between pads
  (20 + 1mm border + 5mm air, each end; raised from 26 on 2026-11-09 to force less congestion).
  Springs aim for 44mm on the 2–3p map. No printed cost (2026-11-11).
- Read: Terminal = heavy relay building, Hub = small cabinet. Cube vs disc keeps them distinct at a
  glance, before color.
- Hub is 10mm tall, so the **Lit / Unlit face is on the flat top**; it can't be read from the side.
  Print each face edge to edge.
- Terminal is two-sided in state: placed **Unspliced**, flipped to **Active** by Splice (2026-11-10;
  placed directly, no Hub upgrade). How a cube shows two states is `TBD` (marker, orientation, or a
  different piece). Terminal slot is never shared with Hub slots, so nothing stacks.
- Counts per player: `TBD`. Hubs, Terminals and cables all live on the player mat; emptying any one
  triggers the end (DESIGN.md). Scaling by player count: see **Board and player counts**.
- Not yet sized: **Commissioner** pawn, **Legacy Telco** blockers, **Receipt** / **BEAD** tokens,
  workers.

## Node pad

A node is one fixed pad with three printed slots. Slot outline = piece + 1mm clearance per side, 3mm
between outlines so a finger can pick a piece up.

| Slot        | Outline  |
| ----------- | -------- |
| Terminal ×1 | 22 × 22  |
| Hub ×2      | Ø17 each |

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
- Pick one orientation, or let the layout rotate pads per node; cable edges enter from the pad sides
  that face the neighbor.

## Variable Hub slots (2026-11-09)

- Each node prints **1–4 Hub slots** (Terminal slot always 1; San Antonio 4 since 2026-11-12,
  Dripping Springs dropped to 1 to keep 32 core slots), by town size: San Antonio 4, Austin and big
  towns 3, mid-size towns 2, small towns 1. Pad grows only sideways: 1 Hub 34×20mm, 2 Hubs 48×20mm,
  3 Hubs 62×20mm, 4 Hubs 76×20mm (was 41/58/75×24 before the 2026-11-11 shrink). Slots are the
  **exact** piece footprint (Terminal 16, Hub Ø12, stick 20×5; 2026-11-11), 2mm between slots
  (Hub–Hub and Terminal–Hub), inside a **2mm flat border** in the region's color. Name is a separate
  **label box** centred 1mm under the pad, same color, white 4mm **small-caps** text (capitals full
  height, lowercase as small capitals); adds 6.8mm below the pad. Kept clear by the layout. (Tried a
  joined tab: names read better with separation.) Every rectangle (pads, labels, slots, sticks) has
  a 0.5mm corner radius, nearly hard-edged (stick-slot borders: 1mm, rounder on purpose).
- **Empty Terminal and Hub slots are halos** (2026-11-09; stick slots stay solid white, halos made
  links too busy): a 1mm solid white ring inset in the footprint, and a 70% white well in the centre
  over the board grey, "waiting to be filled". Pieces cover them.
- **Colors** live in `colors.ts`, named by role; the `/fiber` page shows a palette section (grey
  ramp light→dark plus swatches in place). Board is greys only; player colors are the only
  saturation.
- Layout rule (2026-11-09, smallest pads): one row only as tall as the Terminal slot (16mm since
  2026-11-11); Terminal left, Hubs built out in a row to its right, max 4 (76mm pad). Supersedes the
  A/B packings below.
- **Slots are identical; no printed per-slot costs** (user: printed costs per slot make the board
  visually overwhelming). The 2nd-Hub surcharge stays a rule, not printed art.
- Hub supply must stay below total slots, or the board fills before the end trigger.
- **Real geography (2026-11-12).** Towns carry their real lat/lon; one north-up projection
  (`project` in `map/map.ts`, ~3mm/km, largest fit centred in the content area) places towns, I-35
  and rivers. **Austin and San Antonio are pinned** exactly; other towns are pulled toward their
  real spot. Link springs rest at their real length (never under the 44mm ideal), so they only push
  crowded towns apart and never drag far ones together. Each anchor strength gets 5 attempts; the
  passing layout with least drift wins. The page shows drift (mean ~11mm ≈ 2 miles at seed 0).
- **Town swaps (2026-11-12):** dropped Pflugerville, Kyle, Manor, Georgetown (too close to a
  neighbour for two pads and a stick); added Elgin, Blanco, Gonzales and Taylor (3p fringe) on open
  ground, so 32 : 16 : 24 and 40 : 20 : 30 hold.
- **Regions are river valleys** (2026-11-12): 11 of 20 towns sit within 2km of a river (under a
  pad), so rivers can't be borders; a river is a region's spine instead. Colorado (Austin, Buda),
  Lower Colorado (Elgin, Bastrop), Blanco (Blanco, Wimberley, Dripping Springs), San Marcos (San
  Marcos, Lockhart, Luling), Upper Guadalupe (Canyon Lake, New Braunfels), Lower Guadalupe (Seguin,
  Gonzales), San Antonio (San Antonio, Schertz); fringe keeps Williamson and Kendall. Off-river
  towns join the valley their creek drains to. Borders stay Voronoi.
- **Core/fringe swap (2026-11-12, later):** Round Rock and Taylor (Williamson) are now core; Elgin
  and Bastrop (Lower Colorado) are the 3p fringe with Boerne and Helotes. Gonzales 2→1 Hub and
  Helotes 1→2 keep 32 : 16 and 40 : 20. Links: 2p core **23** (one under the 1.5/node target), 3p
  **30**. Buda–San Marcos is forced south→north (`sides` on an `Edge`).
- **One board, 7 regions (2026-11-12, supersedes the core/fringe split below):** **42 : 21 : 32**
  (Hub slots : towns : links), no 3p fringe; player count scales on the mat (TBD). Regions hold
  **3–9** Hub slots, Hubs loosely by population:

  | Region         | Hubs | Towns                                         |
  | -------------- | ---- | --------------------------------------------- |
  | San Antonio    | 9    | San Antonio 4, Schertz 2, Boerne 2, Helotes 1 |
  | Colorado       | 8    | Austin 4, Buda 2, Dripping Springs 2          |
  | Guadalupe      | 7    | New Braunfels 3, San Marcos 3, Canyon Lake 1  |
  | Williamson     | 6    | Round Rock 3, Leander 2 (added), Taylor 1     |
  | San Marcos     | 5    | Seguin 2, Lockhart 1, Luling 1, Gonzales 1    |
  | Lower Colorado | 4    | Elgin 2, Bastrop 2                            |
  | Blanco         | 3    | Wimberley 2, Blanco 1                         |

  Against the old mat (2p 28 Hubs / 3p 36): 14 / 6 spare Hub slots; Terminals 14 / 18 of 21 towns.
- **Home print (2026-11-12):** `/fiber/print?seed=N` lays the board out as 8 tiles of 10 × 5in (2
  across × 4 down, edges on both folds), one per US Letter landscape page, centred, with only a thin
  cut line. `npx tsx src/games/fiber/print.node.ts [--seed N] [--out file.pdf]` writes the PDF from
  the running dev server. Print at 100%, no margins.
- **Backbone exits (2026-11-12):** `EXITS` in `map/map.ts`. Round Rock → Dallas (north, I-35),
  Luling → Houston (east, I-10), San Antonio → Laredo (south, I-35). Drawn as a cable-dark line from
  the town's side to where its highway comes within 8mm of the content border, then an arrowhead
  along the highway and the destination name, all inside the content border (2026-11-12). A globe
  badge where a stick slot would sit; no stick slot (exit lines need only a 16mm run). Meaning: a
  player can start building from one. Rules TBD. The solver routes them as links to pinned points,
  so nothing crosses them.
- **I-35, I-10 and rivers** (Colorado, San Marcos, Guadalupe, Blanco, San Antonio) are traced from
  OpenStreetMap by `map/geography.node.ts` (Overpass → merged/longest-path centreline → resample →
  Gaussian smooth → simplify) into generated `map/geography.ts`. Drawn under the network with a
  paper casing that knocks out the hatch. No printed credit (personal, non-commercial prototype).
- Map: `/fiber` (2026-11-11) is the **2–3 player side**: 20 towns, 9 regions, on The Game Crafter's
  20×20in quad-fold (`src/shared/print/boards/sheets.ts`, shared with Revival). Pads stay clear of
  both fold bands; a stick slot may cross a fold but not run along one. A player-count picker dims
  the 3p fringe (Elgin, Bastrop, Boerne, Helotes). `map/map.ts` holds the graph and soft targets;
  `map/layout.ts` solves pad positions and curved links (Tiger's Path pipeline: relax → bend choice
  → verify → retry). Pads and stick slots are fixed outlines; **no printed link costs** (cost dots
  removed 2026-11-11 until a cost rule exists). **Links attach to ports on a town's N / E / S / W
  side** (2026-11-11): square to the side, then a smooth cubic curve; south ports sit under the name
  label; links sharing a side are spread along it, ordered by where they head. Each stick slot gets
  ≥ 32mm of visible run and slides along its link to stay off a fold; springs aim for a 44mm run (+
  the fold keep-out when a link crosses a fold), which spreads the map into the 18 × 18in content
  area. "Reroll" nudges targets ±15mm for nearby variants.
- **Regions** (2026-11-09, `map/regions.ts`): Voronoi of every pad's and label's outline (sampled
  every 4mm, so a wide pad claims its width), **clipped to the sheet**, cells merged per region.
  **Tint levels** (2026-11-09): 4 greys, lightest to darkest, each with a faint hatch: plain, dots,
  diagonal, cross (lines 2mm apart, 0.15mm; dots 5mm apart since dots read heavier than their
  coverage; one ink `#8a8a8a`, darkened 2026-11-11 from `#d4d4d4`). Regions get a level by greedy
  map coloring, so touching regions never match; 4 levels cover any number of regions. **A level is
  a palette family**: its hatch on bare paper (**no region fills**, 2026-11-09), and its
  pad/name-tab grey (`#a9a9a9` → `#606060`, OKLab L 0.74 → 0.49 in ~0.08 steps (2026-11-11), lighter
  regions get lighter towns), so a region's towns read as one group. Links, stick-slot borders and
  region borders stay constant across levels. Region names are **off for now**; the placer
  (`map/labels.ts`: open spot furthest from pads, links, borders) is kept for later. Border where
  regions meet is a **dashed line** (0.5mm, 2mm dash / 1.6mm gap; was a double line until
  2026-11-12, too busy beside roads and rivers), drawn under them (never along the sheet edge). A
  border sits midway between towns, so ≥ 6mm from any pad. The layout pulls a region's towns gently
  together (`GROUP_PULL`); a region in more than one piece is flagged in red.

## What the sizes force on the board

- **~30 nodes × ~16–19 cm² ≈ 470–570 cm² of pad.** On a 20 × 20 in (508 mm) board, ~2,580 cm², pads
  alone are **~20%** before edges, spine, region shading and the worker-placement tiles. Board size
  is `TBD`; this is the first number to check it against.
- **A node is large relative to a town.** Spacing between pads must leave room for the printed edge
  **and** its cost, so neighbor centers sit **≥ ~70mm** apart (pad 46 + ~24 for an edge). Long thin
  I-35 corridor suggests a landscape board; nodes spread along the spine.
- **Region of 2–3 nodes** = a cluster of 2–3 pads, ~100–150mm across. Marketing's regional flip
  needs the whole cluster visually obvious (shared band color).
- **Cube is 20mm tall**: tall pieces next to a cable edge can hide the cost printed on it. Keep edge
  costs on the edge midpoint, away from the pad.
- Every node holds 3 pieces max (1 Terminal, 2 Hubs). Pad is full-size even when empty, so an empty
  map still shows the whole network's capacity.

## Board and player counts (2026-11-10; fringe superseded 2026-11-12, see "One board, 7 regions")

- **Double-sided board:** **2–3 player** map on one side, **4–5 player** map on the other.
- **4–5 is a wider corridor:** same Austin–San Antonio core, plus outlying towns. More nodes,
  regions about the same size.
- **Fringes:** each side has edge areas with a player-count badge: a **3p fringe** on the 2–3 side,
  a **5p fringe** on the 4–5 side. Out of play at the lower count. How they read as "off" (lighter
  tint, dashed border, badge only) is `TBD`.
- My suggestion, not decided: keep the geography consistent. Towns in the 3p fringe could be core on
  the 4–5 side, and the 5p fringe goes one ring further out.
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

Ratio **Hubs : Terminals : cables = 2 : 1 : 1** on the mat; map is **Hub slots : nodes : links = 2 :
1 : 1.5** (avg 2 Hub slots per node; 1.5 links per node ≈ 9 loops, about ⅓ of links unbuilt).

| Count | Mat per player     | Total supply | Map (Hub slots : nodes : links) | Worst-case spare |
| ----- | ------------------ | ------------ | ------------------------------- | ---------------- |
| 2p    | 14 : 7 : 7         | 28 : 14 : 14 | core **32 : 16 : 24**           | 4 Hubs, 2 nodes  |
| 3p    | 12 : 6 : 6 (badge) | 36 : 18 : 18 | core + fringe **40 : 20 : 30**  | 4 Hubs, 2 nodes  |

- **Breathing-room rule (user, all counts):** total Hub supply < Hub slots, and total Terminals <
  nodes, so the board can never fill even if every piece is placed. Typical games end ~65–75% full.
- 3p fringe = **8 : 4 : 6** (4 nodes). Mat badges are on 2 Hubs, 1 Terminal, 1 cable.
- **Action tiles live off the board**, laid along one edge (user, 2026-11-10). The whole board side
  is map.
- **Fit (2026-11-11):** 40 : 20 : 30 solves with no violations on the 20×20in quad-fold. Each 10in
  panel holds its map in **9 × 9in**, anchored to the folds: **1in clear on the outer edges**
  (`CONTENT_MARGIN`), pads kept off the fold bands.

## Open

- Do Hub slots print the Unlit face or a blank outline when empty? (Slot art may double as a
  reminder of which face is the default.)
- Is the pad a printed outline on the board only, or a recessed/punched slot (tabletop-sim /
  die-cut)? Outlines above assume print only.
- Board size and fold (see Revival's quad-fold for reference).

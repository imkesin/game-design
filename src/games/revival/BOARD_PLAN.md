# Revival — Board Plan

Plan of record for drawing the city map. Update this file rather than re-deriving; open items are
near the bottom, abandoned approaches at the very bottom.

## 1. The approach

The city is built from **prefab neighborhoods**: small, fixed, hand-designed layouts of plots and
roads, drawn at true size. Prefabs are **placed by hand** (dragged) on a sheet, and the ground
between them is split into **territories** by a Voronoi measured to each prefab's whole box. Each
border between territories is drawn as a street.

Why: the city's legibility comes from a small set of consistent, well-drawn neighborhoods, not from
a solver or a painter. Geometry decisions live inside each prefab; the map only arranges them.

## 2. Prefabs (`city/prefabs.ts`, `/revival/prefabs`)

Fixed visual grammar, all in mm:

- **Plot**: a 24mm track holding a 22mm square, 0.6mm black border.
- **Road** inside a prefab: an 8mm track (a row or column with no plots in it).
- **Band**: 12mm round the outside of every prefab; holds the claim markers.
- **Plot groups**: edge-touching plots, outlined together (1mm line along their cells' outer edge).
  No lines between plots inside a group.
- **Claims**: a 10mm dashed circle, **one per group**, in the band on the side the group runs along,
  centred on the group's outward-facing plots. A layout may force a side (`claimSide`).
- **Orientation**: plots run in vertical columns. The one horizontal exception is the bare pair
  (`PP`).

Two ways to write a layout:

- `grid`: rows of `P` (plot), `R` (road), `S` (square, left open); track sizes are derived.
- `stacks`: columns left to right, each a number (a column of that many plots), a `{ wide, tall }`
  block, or a list of groups with `"gap"` (an empty plot space); separated by `"road"`. Columns are
  centred vertically against the tallest, on half-plot rows, so odd and even columns sit half a plot
  apart.

The prefabs page lists every layout by plot count, then by how it splits into groups (1 + 1 before
2), with the split in each label.

## 3. Territories (`city/territories.ts`)

- Voronoi of each prefab's **whole box** (band included), Euclidean distance: straight borders
  between facing edges, arcs around corners. Sampled on a 1mm grid (2mm while dragging), borders
  stitched per pair of neighbors and simplified to within one sample of the true curve.
- **Reach**: ground farther than this from every box is empty, which gives the city its own edge (or
  `null`: territories fill the whole area).
- **Drawing** (`city/TerritoryMap.tsx`): borders between neighbors are streets, black | white |
  black (1.5 / 2 / 1.5mm). The city edge is either a single 1.5mm line or a full street (ring road).

## 4. The city sheet (`/revival`, `city/city.json`)

- **18×24in** print-shop sheet, portrait, with a ½in buffer: a 17×23in (431.8×584.2mm) area.
- **5P mix**: 18 neighborhoods = 2×2, 3×3, 4×4, 4×5, 3×6, 2×7 plots = **81 plots** (the 5P budget is
  84).
- **Gap**: boxes at least **8mm** apart, so a street runs 4mm from each box: ~2.5mm clear of claim
  markers, 12mm+ from plots. (12mm rarely fit all 18 on the sheet.)
- **Editor**: drag to move (4mm snap; red when closer than 8mm or off the area); Reach slider, Fill
  sheet, Edge style; **Shuffle** packs a fresh arrangement of the mix (`city/pack.ts`: distinct
  layouts per size, biggest first, each nearest the centre with jitter, scaled to the sheet's
  proportions); **Save** writes `city/city.json` through the dev-only Vite endpoint
  (`src/shared/vite/specSave.node.ts`).

## 5. Trial: skyline neighborhoods + links (`skyline/`, `/revival/skyline`)

Running alongside §1–4, which stay the plan of record until one wins. Aim: a Brass / Age of
Industry-style map: compact, framed neighborhoods joined by explicit, hand-drawn links (topology is
authored; geography is decoration).

- **Organizing principle: every Block is a vertical column** (1–3 plots); a neighborhood is 1–3
  touching columns. Claiming a column is the game's organizing idea, so nothing else marks it: no
  dividers, no extra spacing (a 0.5mm-in-column / 4mm-between variant looked no better). This
  matches DESIGN.md (Blocks 1–3 plots; column count = player capacity).
- **24mm system**: every plot is a 24mm track (a 22mm square with 1mm padding all round), so plots
  sit 2mm apart in both directions.
- **Skyline**: columns are bottom-aligned, so the silhouette has a flat bottom and a stepped top.
- **Base**: a **16mm** band from the plot tracks to the flat bottom of the outline, with a 10mm
  solid claim ring (0.6mm, plot-border weight, light grey so it recedes) under each column, centred
  optically between the plot square and the outline's inner edge (not the band, which looked tight
  below because plots carry 1mm padding), on a stem up to the column's bottom plot. (Dashed 0.25mm
  circles looked weak.) (Tried first: claims on a roof band above each column, 12mm then 24mm; 12mm
  squeezed the circle against the outline.)
- **Names**: light caps on a dark 8mm tag floating 2mm above the outline, centred over the tallest
  column (or the span of tied tallest columns). Outside the outline's box, so positions and links
  ignore it. Tried before: a 12mm plinth along the bottom, 5mm caps.
- **Outline**: along the base edge, 2mm out from the columns everywhere else (top, sides, steps);
  dotted ground (black 0.4mm dots on a 2mm pitch; 1.5mm was a touch dark: a halftone, never a fixed
  grey fill, for prototype printing) behind white plots and claim rings, so plots pop; 0.8mm
  dark-grey line (1.2mm black was too strong); outer corners rounded 0.75mm, inner corners sharp
  (4mm all round was far too round).
- **Links**: one bold 3mm line centre to centre, drawn under the neighborhoods (their white fill
  hides the ends).
- **Board**: **2×2 Letter tiles**, each a landscape sheet's printable area (10.5×8in), so a
  **21×16in** board (close to the 17×23in area of the 18×24 sheet), quicker to iterate on. On
  screen: the whole board with dashed cut lines; a neighborhood (tag included) within 3mm of a cut
  line, or off the board, shows red. In print: one Letter page per tile with crop marks just outside
  its corners; trim and butt together. Tile count and orientation are constants in
  `SkylinePage.tsx`.
- **Grid**: plots snap to a 24mm grid (screen-only faint lines), with a cell centred on the board,
  so margins match and the 2×2 cut lines run down the middle of a row/column of cells (street only).
  Off-grid saved positions are snapped on load.
- **Editor**: drag to move (snaps to the grid); click to select and edit name, columns (keeping the
  bottom and remaining columns in place) and links in a side panel; shift-click another to
  link/unlink; "+ Neighborhood" adds one mid-view; Delete, ⌘Z undo, Esc. Edits live in
  `skyline/edit.ts`. Save writes `skyline/map.json` (`/__revival-skyline`).

## 6. Open

- **Rules link**: map plots and claims back to DESIGN.md (Blocks, claims, adjacency for the mayor's
  walk and Market gates). Territory adjacency is already computed (border lengths per pair).
- **Smaller counts**: one map for all player counts, closing plots for fewer players, or separate
  sheets?
- **Claim size**: 10mm markers need ≤ 10mm tokens.
- **Mayor pawn** has no dedicated spot.
- **Names** for neighborhoods aren't drawn yet.
- **DESIGN.md is stale** on neighborhood count and sizes (now the 18-neighborhood mix above), degree
  cap, and how claims are shown.

## 7. Abandoned approaches

- **Force-directed layout** (Tiger's Path style): ignored node size; Revival's places _are_ the
  board.
- **v1, region-decides skylines** (6–12mm sub-grid): paint a region, the build fits a skyline of
  block columns inside it. Fiddly to paint, and fitted skylines with free-form regions didn't read
  as a city.
- **v2, painted 24mm grid**: every cell a plot, Blocks painted then grouped into Neighborhoods, a
  hand-stamped claim cell per Block. Accurate but unclear at a glance.
- Smaller lessons: 12mm and 16mm discs (sizes went 16 → 12 → 16 → 10); corner-anchored claims
  (pointless; claims now sit by their group); horizontal rows (dropped for consistency);
  three-column prefabs (kept only where they read well); a courtyard ring (didn't fit the theme);
  12mm internal roads (8mm reads better and packs tighter).
- **48mm block lattice** (2×2-plot blocks, 24mm gaps, explicit straight and diagonal edges clicked
  into the gaps): tried 2026-10-14 and didn't work as well as hoped; replaced by a carved cell grid.
- **Carved 24mm cell grid** (solid grid on Letter, removed cells as dotted dividers, 1-cell divider
  = adjacent): tried 2026-10-14, didn't work; replaced by skyline neighborhoods (§5).

# Revival — Board Plan

Plan of record for drawing the city map. Update this file rather than re-deriving; open items are
near the bottom, abandoned approaches at the very bottom.

## 1. Skyline neighborhoods in territories (`skyline/`, `/revival`)

Brass / Age of Industry-style neighborhoods, each sitting in a hand-painted territory of grid cells,
so neighborhoods touch like a real city: streets between territories, water between some, bridges
over it. Topology is authored by painting.

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
  column (or the span of tied tallest columns). Outside the outline's box, so positions ignore it
  (the cell it reaches into is still part of the neighborhood's footprint). Tried before: a 12mm
  plinth along the bottom, 5mm caps.
- **Outline**: along the base edge, 2mm out from the columns everywhere else (top, sides, steps);
  dotted ground (black 0.4mm dots on a 2mm pitch; 1.5mm was a touch dark: a halftone, never a fixed
  grey fill, for prototype printing) behind white plots and claim rings, so plots pop; 0.8mm
  dark-grey line (1.2mm black was too strong); outer corners rounded 0.75mm, inner corners sharp
  (4mm all round was far too round).
- **Board**: **2×2 Letter tiles**, each a landscape sheet's printable area (10.5×8in), so a
  **21×16in** board (close to the 17×23in area of the 18×24 sheet), quicker to iterate on. On
  screen: the whole board with dashed cut lines; a neighborhood (tag included) within 3mm of a cut
  line, or off the board, shows red. In print: one Letter page per tile with crop marks just outside
  its corners; trim and butt together. Tile count and orientation are constants in
  `SkylinePage.tsx`.
- **Grid**: plots snap to a 24mm grid (screen-only faint lines), with a cell centred on the board,
  so margins match and the 2×2 cut lines run down the middle of a row/column of cells (street only).
  Off-grid saved positions are snapped on load.
- **Water**: painted on the plot grid (`skyline/water.ts`), saved in `map.json` as one string per
  grid row (`~` water, `.` land, edge part-cells included). Drawn as black wavy lines (0.25mm, 2.4mm
  apart, 6mm wavelength, 0.3mm amplitude; straight 1.6mm hatching was too busy) inside a 0.6mm grey
  coastline, outer corners rounded 10mm, bays 6mm; cells touching only at a corner join, so rivers
  can run diagonally; water at the edge runs off the board. A neighborhood whose plots or base band
  stand in water shows red.
- **Territories** (`skyline/territory.ts`): a neighborhood always holds its **footprint** (plot
  cells, the base-band cell under each column, the cell its tag reaches into); the rest is painted
  by hand, saved as `ground` (`"col,row"` cells) on each neighborhood. **Grow** fills every unheld
  land cell reachable over land, a cell at a time (Manhattan flood, so borders stay on grid lines,
  90° only); ties go to the nearer footprint. Overlapping footprints show red. **Streets**: a 1.2mm
  black line along every cell side between different holders (or held and unheld land), running on
  under the water to meet the rounded coast. Ground stays put when a neighborhood moves; Grow again.
- **Adjacency**: neighbors share at least one whole cell side (24mm; a corner doesn't count), or the
  two ends of a bridge. The side panel lists the selected neighborhood's neighbors; the status line
  counts pairs and names neighborhoods with none or with territory in pieces. (First Grow on the
  current map: 2–5 neighbors each.)
- **Bridges**: painted on water cells (`=` in the water rows): a straight run along a row or column
  with land at both ends (a single cell spans a row if land is left and right, else a column). Drawn
  to be obvious: a 10mm white planked deck reaching 4mm onto land at each end, heavy 1.2mm black
  rails splaying out 3mm at the ends. A run that bends or doesn't land shows red on screen and
  connects nothing.
- **Brushes**: Move / **Water** (W) / **Bridge** (B) / **Ground** (G), Esc back to Move. A stroke
  paints across grid cells, one undo step per stroke. Water: paints water, or land if it starts on
  water. Bridge: bridges water, or clears bridges if it starts on one. Ground: grows the territory
  the stroke starts in (footprint or ground), or clears ground if it starts on unheld land; Ground
  mode tints territories on screen.
- **Editor**: drag to move (snaps to the grid); click to select and edit name, columns (keeping the
  bottom and remaining columns in place) in a side panel; "+ Neighborhood" adds one mid-view;
  Delete, ⌘Z undo, Esc. Edits live in `skyline/edit.ts`. Save writes `skyline/map.json`
  (`/__revival-skyline`).

## 2. Open

- **Territory look**: if borders still read weakly, try territories as inset blocks (own outline
  ~3mm in, white gaps between) or a halftone ground per territory.
- **Rules link**: map plots and claims back to DESIGN.md (Blocks, claims, adjacency for the mayor's
  walk and Market gates).
- **Smaller counts**: one map for all player counts, closing plots for fewer players, or separate
  sheets?
- **Claim size**: 10mm markers need ≤ 10mm tokens.
- **Mayor pawn** has no dedicated spot.
- **Names** for neighborhoods aren't drawn yet.
- **DESIGN.md is stale** on neighborhood count and sizes, degree cap, and how claims are shown.

## 3. Abandoned approaches

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
- **Derived roads** (2026-10-14): one bold 2.5mm road per neighbor pair, routed at 90° through the
  two territories across the middle of their shared border (or over the bridge), with streets
  lightened to 0.5mm grey. "Cool, but not much better": with territories filling every cell, the
  roads competed with streets, outlines, water and bridges instead of standing out. Reverted.
- **Explicit links between floating neighborhoods** (2026-10-14): a bold 3mm line centre to centre.
  Clear, but it read as separate towns (Brass), not one city; replaced by painted territories, which
  keep authored topology but let neighborhoods touch. A true (Euclidean) Voronoi of the outlines was
  considered and passed over for grid cells: 90° borders, and painting gives back control over the
  graph.
- **Carved 24mm cell grid** (solid grid on Letter, removed cells as dotted dividers, 1-cell divider
  = adjacent): tried 2026-10-14, didn't work; replaced by skyline neighborhoods (§1).
- **Prefab city** (plan of record until 2026-10-14; code removed, see git history before this
  change): small hand-designed prefab layouts of plots and 8mm internal roads, each with a 12mm
  claim band, dragged onto an 18×24in sheet (an 81-plot, 18-neighborhood 5P mix, Shuffle packer);
  the ground between them split by a Voronoi of their boxes, borders drawn as streets. Legible, but
  the skyline trial read better.

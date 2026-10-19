# Revival — Components

Plan of record for the physical pieces: what gets printed and bought, and how the city map is drawn.
Update this file rather than re-deriving. Rules live in `RULES.md`; the reasons behind them in
`DESIGN.md`.

## Pieces

- **Color conventions** (2026-10-17; `colors.ts`): **green** Parks, **light tan** Housing, **medium
  brown** Commercial, **grey** Industrial, **black** anything blighted. Parking lots are a **very
  grey blue**. Historical buildings' accent is **burgundy** (a heritage plaque; the historical setup
  cards' header). The mayor and his agenda cards are **civic navy** (provisional). Costs are printed
  on a **gold coin** (top-right of a row tile, and of a blighted Commercial or Industrial tile: its
  restore price, 1 / 3, as a reminder; a blighted House restores free, so no coin). Blighted and
  historical buildings are split diagonally (black or burgundy top-left, the type's color
  bottom-right) under a white icon, on cards and tiles alike.
- **V0 components** (2026-10-17): **32mm base-plate tiles** (the plot square; 30mm until 2026-10-18,
  grown to fit stock 1.25in tiles) on sticker paper over cardstock, printable at `/revival/tiles` as
  **31mm stickers** (`STICKER`, 1mm under `TILE`) for stock 1.25in tiles: butted 6 × 8 per Letter
  sheet (however many fit inside a 10mm margin) so a trimmer cuts whole rows, the outer 1mm left
  unprinted to absorb off cuts (29mm art; widened from 0.5mm for cutting room); **wooden building
  tokens** are the finished buildings, and every building on the board is one, blight and historical
  included: **3D buildings make it look like a city**, which sets Revival apart from city games of
  pictures on flat pieces. Never trade them away for setup speed; hexes, cones, coins and the mayor
  are bought bits. All tiles are single-sided; a blight is a blight tile with a **black wooden
  building** on it (knocking down swaps buildings, no flipping: fiddly on a tight board). Historical
  tiles are split burgundy and type. **Park supply: 20, assumed.** Parks and parking lots are tiles
  only, no wooden piece (2026-10-18).
- **Player mat** (2026-10-18): a **TGC half board turned landscape** (10 × 5in), printable one per
  Letter page at `/revival/mats`: company band, credit track (0–3), cone yard (3 open, 2 locked),
  and space kept for later upgrades. One design for now; company colors swap into the band later.
- **Sale card** (2026-10-18): sale values live **only on a 6 × 4in landscape reference card**, one
  per player (`/revival/reference`, 2 per Letter page); the board has no room and tiles keep just
  the cost coin. Each row: the tile, what it **sells for** written
  `base + (bonus per Park or
  hex)` in coins, and its **side effects** with a mini-map of where the
  bonus counts (the House's own neighborhood, or the plazas hexes are taken from), the 1 + n hex
  cap, hexes put out, and blight rules.

## Board

Open items are near the bottom, abandoned approaches at the very bottom.

### 0. Ring neighborhoods on a quad-fold board (2026-10-17, trial)

Supersedes parts of §1; §1 still describes the look (dots, edge, streets, labels).

- **Board**: The Game Crafter's 20×20in large quad-fold (`boards/sheets.ts`, template
  `boards/large-quad-fold-board.svg`, overlaid on screen only). One full-bleed 20.25in page; the 2×2
  10in panels are the tiles, so folds and the cut run down streets (¼in fold band < 15mm street).
  Blocks stay inside the 15.3pt safe zone. Tiled sheets (Letter, 18×24in) still work via `SHEETS` in
  `BlocksPage.tsx`.
- **Neighborhoods**: every one a 3×3 ring of 8 plots around an empty dotted centre (the hole), 5mm
  sidewalk (buffer) all round, 112mm square. 2×2 per panel: a 4×4 city, 16 neighborhoods, 128 plots,
  ~7.5mm margin from the trim.
- **Labels** moved from the bottom-left corner tab into the hole (the plaza), centred, which freed
  the buffer to shrink. Then bigger and faint (6mm bold #a3a3a3 on a #ececec tab): coordinates are a
  minor detail.
- **34mm system** (2026-10-18; 26 → 32 → 34mm): the plot is derived from the tile (`TILE` in
  `tiles/tiles.ts`, 32mm) plus `PLOT_PADDING` (1mm) all round, so resizing tiles resizes the board.
  35mm tiles were tried (37mm plots, 2mm buffer, 10mm streets): they fit but crowd the board. The
  buffer went half a plot → 10 → 9 → 6 → 5mm once labels left it (8mm and 5mm were too tight for a
  corner tab).
- **15mm streets** (8 → 12 → 15mm): wider than the buffer, so neighborhoods separate; traded buffer
  for it.
- **Dropped**: claim rings and band, variable columns and greyed squares, City Hall, and printed
  prefill marks (code removed): blight, parking lots and historical buildings are now dealt by setup
  cards onto fixed halves of each ring (DESIGN.md, Setup cards), so the board prints nothing about
  setup.

### 1. Rectangular blocks (`blocks/`, `/revival`)

A matrix of rectangular neighborhoods with white streets between them. Plan of record since
2026-10-14; the user: "It seems like a city right away", solving the parsing problem.

- **Every Block is a vertical column** (1–3 plots); a neighborhood is 1–3 touching columns,
  bottom-aligned. Claiming a column is the game's organizing idea, so nothing else marks it: no
  dividers, no extra spacing. Matches DESIGN.md (Blocks 1–3 plots; column count = player capacity).
- **26mm system** (2026-10-17; was 24mm, then 30mm briefly): every plot is a 26mm track (a 24mm
  white square, 0.6mm black border, 1mm padding all round), so plots sit 2mm apart. Room for a base
  tile with a 3D wooden building on it. 26mm is the largest that fits one 18×24in sheet.
- **Block = plots plus buffers**: half a plot (13mm) of buffer left and right; 4.5mm on top and a
  24.4mm claim band below, sized so the gap above the plots matches the gaps around the claim ring
  (~4.9mm). The band was 19.5mm (top + band = one cell) until the rings grew to 15mm; blocks grew
  4.9mm per block-row.
- **Claims**: a 15mm solid ring (0.6mm, light grey so it recedes) under each column in the band, on
  a stem up to the column's bottom plot, centred between the plot square and the edge line. 15mm
  since 2026-10-17 to fit the intended components (was 10mm). (Dashed 0.25mm circles looked weak;
  12mm and 16mm discs were tried.)
- **Look**: whole box on a dotted ground (black 0.4mm dots on a 2mm pitch: a halftone, never a fixed
  grey fill, for prototype printing), 1.2mm black edge, **8mm white street** between neighboring
  blocks (6mm first).
- **Greyed squares**: cells above a shorter column, drawn as grey plot outlines (no white). Meant to
  vary neighborhoods inside fixed frames, fixed or by player count. All frames are full for now ("I
  just want to appreciate the shape").
- **Matrix**: every block in a block-row shares its height, every block in a block-column its width.
  `blocks/city.ts`: widths and heights (grouped per tile), each neighborhood's columns, City Hall.
  Row 0, column 0 is the **bottom-left**. Current city: 5×5, widths and heights 2 3 2 2 1 (100
  plots).
- **Labels**: a dark tab (white bold caps, 3.6mm) flush in each block's bottom-left corner, inside
  the side buffer: chess-style coordinates, columns A–E from the left, rows 1–5 from the bottom.
  City Hall (B2, the 3×3) reads "CITY / HALL" stacked instead. (A double outline for City Hall
  wasn't distinct enough.)
- **Board**: Letter tiles, each a landscape sheet's printable area (10.5×8in), as many as `city.ts`
  groups block-columns and block-rows into. Each tile's blocks are pushed up to the cut lines so
  **every cut runs down the middle of a street** (a wobbly trim only changes a street's width);
  slack goes to the board's edge, or widens both seam streets on a middle tile. **Now one 18×24in
  sheet** (17×23in printable, ½in margin, portrait; `SHEET_SIZE` in `BlocksPage.tsx`): board
  422×437mm, ~10mm spare across, ~148mm down. Earlier, on Letter tiles (10.5×8in printable): 24mm
  fit 2×3 sheets (heights 2 | 3 2 | 2 1, widths 2 3 | 2 2 1); 30mm needed 2×4; uniform 2×2
  neighborhoods at 30mm needed 3×3. On screen: the whole board with dashed cut lines, and the header
  lists tiles that overflow and neighborhoods that don't fit their frame. In print: one Letter page
  per tile with crop marks just outside its corners; trim and butt together.
- **Prefill marks** (player-count scaling, decided 2026-10-15; numbers in DESIGN.md's build budget):
  a big faint grey numeral (8mm bold, #d4d4d4) centred in the **top plot of a column**: **3+ / 4+ /
  5**, the player count the plot is in play from; below it, it's covered at setup. 24 marks (12 ×
  3+, 8 × 4+, 4 × 5) → 4 / 12 / 24 covered at 4 / 3 / 2 players. Hand-placed in `city.ts`
  (`prefill`: neighborhood, column, `from`); the header shows the counts and flags bad entries. None
  in E5 (a lone 1-plot Block) or row 5 above 3+ (a prefill there removes a whole Block); two in City
  Hall. Tried first: a dark corner tab like the labels ("too confusing"), and numbers meaning
  "covered up to N players" (flipped to "in play from").
- **Trim lines**: printed tiles carry a dotted grey line (0.3mm, 1.5mm pitch) along every edge, on
  top of the corner crop marks; cuts were hard to see with marks alone.
- **Mayor idea**: walk in an L (at most one turn), so the active player only picks the corner; a big
  decision-speed win over shortest paths on a free graph. The matrix makes adjacency the 4
  orthogonal neighbors. Not yet in DESIGN.md.

### 2. Open

- **Plaza** (room per neighborhood for the mayor's pawn and demand tokens): tried 2026-10-17 as a
  strip right of the plots ("doesn't look that good"), then a plot-tall strip above them, white and
  outlined (read too much like a plot), then bare ground (unbalanced, not like real city blocks).
  All removed; still needed somewhere.

- **City Hall**: claimable like any block, or civic (not claimable; 91 playable plots)? The mayor's
  start and home? It now carries two prefill marks, which leans claimable.
- **Rules link**: write the L-walk and orthogonal adjacency (Market gates) into DESIGN.md.
- **Claim size**: 15mm rings need ≤ 15mm tokens.
- **Mayor pawn** has no dedicated spot.
- **No editor**: the city is edited in `city.ts`.
- **DESIGN.md is stale** on neighborhood count and sizes, degree cap, and how claims are shown.

### 3. Abandoned approaches

- **Skyline neighborhoods in painted territories** (plan of record 2026-10-14; code removed
  2026-10-15, last at commit 7d6c908 plus later uncommitted work): Brass-style skyline outlines
  (stepped tops, 2mm outline, name tag above), each in a hand-painted territory of 24mm cells with a
  Grow fill, 1.2mm streets between territories, painted water (wavy halftone, rounded coast) and
  planked bridges, and a drag-and-drop editor saving `map.json`. Adjacency = shared cell side or a
  bridge. Read better than everything before it, but borders still parsed weakly; blocks read as a
  city at once. Lessons: Binghamton-style names made the user "more apathetic" (numbers instead);
  derived roads (one 2.5mm road per neighbor pair) were "cool, but not much better" and competed
  with streets, outlines and water.
- **Force-directed layout** (Tiger's Path style): ignored node size; Revival's places _are_ the
  board.
- **v1, region-decides skylines** (6–12mm sub-grid): paint a region, the build fits a skyline of
  block columns inside it. Fiddly to paint, and fitted skylines with free-form regions didn't read
  as a city.
- **v2, painted 24mm grid**: every cell a plot, Blocks painted then grouped into Neighborhoods, a
  hand-stamped claim cell per Block. Accurate but unclear at a glance.
- Smaller lessons: corner-anchored claims (pointless; claims sit by their group); horizontal rows
  (dropped for consistency); three-column prefabs (kept only where they read well); a courtyard ring
  (didn't fit the theme); 12mm internal roads (8mm reads better and packs tighter).
- **48mm block lattice** (2×2-plot blocks, 24mm gaps, explicit straight and diagonal edges clicked
  into the gaps): tried 2026-10-14 and didn't work as well as hoped.
- **Explicit links between floating neighborhoods** (2026-10-14): a bold 3mm line centre to centre.
  Clear, but it read as separate towns (Brass), not one city.
- **Carved 24mm cell grid** (solid grid on Letter, removed cells as dotted dividers, 1-cell divider
  = adjacent): tried 2026-10-14, didn't work.
- **Prefab city** (code removed 2026-10-14; last at commit 977e3fd): small hand-designed prefab
  layouts of plots and 8mm internal roads, each with a 12mm claim band, dragged onto an 18×24in
  sheet; the ground between them split by a Voronoi of their boxes. Legible, but the skyline trial
  read better.

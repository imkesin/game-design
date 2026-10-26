# Revival — Components

Plan of record for the physical pieces: what gets printed and bought, and how the city map is drawn.
Update this file rather than re-deriving. Rules live in `RULES.md`; the reasons behind them in
`DESIGN.md`.

## Pieces

- **Color conventions** (2026-10-17; `colors.ts`; superseded 2026-10-19 by the equal-lightness
  palette documented there, see `/palette`): **green** Parks, **light tan** Housing, **medium
  brown** Commercial, **grey** Industrial, **grime grey** blight (one color, no type; L 0.40 on
  trial). Historical buildings' accent is **burgundy** (a heritage plaque; the historical setup
  cards' header; under review now that tiles flip, see below). The mayor and his agenda cards are
  **civic navy** (provisional). Costs are printed on a **gold coin** (top-right of a row tile).
  Historical buildings are split diagonally (burgundy top-left, the type's color bottom-right) under
  a white icon on cards.
- **V0 components** (2026-10-17): **32mm base-plate tiles** (35mm since 2026-10-19; the plot square;
  30mm until 2026-10-18, grown to fit stock 1.25in tiles) on sticker paper over cardstock, printable
  at `/revival/tiles` as **31mm stickers** (`STICKER`, 1mm under `TILE`) for stock 1.25in tiles:
  butted 6 × 8 per Letter sheet (however many fit inside a 10mm margin) so a trimmer cuts whole
  rows, the outer 1mm left unprinted to absorb off cuts (29mm art; widened from 0.5mm for cutting
  room). Cubes, workers, coins and the mayor are bought bits. **Park supply: 20, assumed.**
- **Playtest workers** (2026-10-19): **worker meeples** in player colors replace cones: any distinct
  shape in a player color marks where a company is working. The rules say **workers**; DESIGN.md
  still says cones (same piece). The mat's "cone yard" label is not yet renamed.
- **Flat, flipping tiles; no wood** (2026-10-19; replaced wooden building tokens): every state of a
  plot is one face of one tile, and a step forward flips or swaps it. Nothing stacks: a tile on a
  tile reads as a multi-story building.

  | Tile   | Side A                                    | Side B            |
  | ------ | ----------------------------------------- | ----------------- |
  | Row    | construction (cost, base payout, workers) | finished building |
  | Park   | construction                              | finished Park     |
  | Blight | **dark** (one look, no type)              | bare              |

  - **New build**: placed construction side up; **finish flips it**.
  - **Blight** (typeless since 2026-10-20): every blight tile is the same, **grime grey under a
    faint generic building** (`ICON.blight`, the sale card's "no blight" badge too), **no numbers or
    type**, so **the city starts dark** (the theme). Restore puts 2 workers on it; **knockdown**
    takes 1 worker off and **swaps it** for a **row tile** of the restorer's pick, construction side
    up (the blight tile leaves the game); **finish flips it**. No restored tiles or restoring
    construction side (dropped 2026-10-20).
  - The construction side carries what matters only while it's a project; the finished side only
    needs art and its type.
  - Why no wood: spaced-out wooden buildings read as a **suburb**, not a city; real blocks are
    continuous street walls, and wood packed that close gets knocked over. Flat tiles that nearly
    touch read as one block (the ring is a perimeter block; the plaza its courtyard). The city
    brightens as it's revived.
  - **Rejected**: a black wooden building on a single-sided tile (the old plan; sparse look, fiddly
    swaps); a black cube marker on the construction side (the city doesn't start dark); a dark cover
    tile stacked on the construction tile (reads as a multi-story building); blight and finished
    faces on one tile with worker count telling a knocked-down blight apart (breaks if projects need
    different worker counts).
  - **Historical** tiles: source open (row tiles finished side up, or their own tiles); burgundy
    split tiles likely dropped.
- **Player mat** (2026-10-18): a **TGC half board turned landscape** (10 × 5in), printable one per
  Letter page at `/revival/mats`: company band, credit track (0–3), cone yard (3 open, 2 locked;
  needs 4 locked, priced 3 / 4 / 5 / 6, since 2026-10-26), and space kept for later upgrades. One design for now; company colors swap into the band later.
- **Sale card** (2026-10-18): sale values live **only on a 6 × 4in landscape reference card**, one
  per player (`/revival/reference`, 2 per Letter page); the board has no room and tiles keep just
  the cost coin. Each row: the tile, what it **sells for** written
  `base + (bonus per Park or
  cube)` in coins, and its **side effects** with a mini-map of where
  the bonus counts (the House's own neighborhood, or the neighborhoods cubes are taken from), the
  1 + n cube cap, cubes put out, and blight rules.

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
- **34mm system** (2026-10-18; 26 → 32 → 34mm; superseded 2026-10-19 by 35mm tiles, 36mm plots,
  `PLOT_PADDING` 0.5mm): the plot is derived from the tile (`TILE` in `tiles/tiles.ts`, 32mm) plus
  `PLOT_PADDING` (1mm) all round, so resizing tiles resizes the board. 35mm tiles were tried (37mm
  plots, 2mm buffer, 10mm streets): they fit but crowd the board. The buffer went half a plot → 10 →
  9 → 6 → 5mm once labels left it (8mm and 5mm were too tight for a corner tab).
- **15mm streets** (8 → 12 → 15mm): wider than the buffer, so neighborhoods separate; traded buffer
  for it.
- **Dropped**: claim rings and band, variable columns and greyed squares, City Hall, and printed
  prefill marks (code removed): blight and historical buildings are now dealt by setup cards onto
  fixed halves of each ring (DESIGN.md, Setup cards), so the board prints nothing about setup.

### 0b. Engraved ground (settled 2026-10-25)

- **Look** (`GROUND` in `blocks/hatch.tsx`; the only look, alternatives and their switcher removed):
  vacant lots are engraved, **one dark grey ink (#333333), 0.15mm hairlines**, tone from line
  spacing, never line weight; streets are flat grey.
  - **Vacant lots**: single 45° lines, **L 0.97** (1.66mm apart).
  - **Streets, their crossings and City Hall's plaza**: **flat grey at L 0.90** (#dedede), painted
    as one sheet under the blocks so nothing seams. A square hairline grid at the same L (0.99mm
    apart) came first; it didn't add enough information to earn its texture, so only the lots are
    hatched. (This drops the old "never a flat grey" rule from home printing; TGC prints full
    colour.)
  - **No sidewalk**: `BUFFER` is half the edge line (was 2mm of dotted sidewalk), so each block's
    heavy edge touches its plots; the freed space went to the board's outer margin.
  - **Streets fixed at 18mm** (`STREET`; the 15 / 20mm switcher removed).
  - **City edge**: half a street (9mm) of grey runs round the outermost blocks, closed by a **hard
    2mm border** (`BORDER`, the block edge's colour): the city's true edge, with white margin past
    it.
  - **Black bleed**: the ⅛in bleed outside the 20×20in trim prints black, framing the board's true
    edge (a drifting trim shows black, not white); the white between it and the city border is the
    space still free for other uses.
  - **Intersection names** are written on every intersection in a darker grey (L 0.60, 4.5mm
    semibold; 6mm was too big), letter first like the agenda cards (`crossingName`, e.g. D4): 16 of
    them. None on C or 3 (they run down the folds; a crease would crack the text), so none at City
    Hall (C3) either. Tried: street names at both ends of each street (on the street, then in the
    margin, then on the street in darker grey); the agenda names intersections, so the board does
    too.
- **Numbers** (how to ask for changes): **L** is how light a zone reads from arm's length, on the
  OKLab scale of `colors.ts` (white 1, tiles 0.70, grime 0.40). The board page's header reads each
  zone out (the lots with ink cover and line spacing). Set a target L; the spacing or grey follows.
- **Lessons** (from ~15 rounds):
  - **One ink.** Two inks (near-black lots, grey streets) was an unforced error: near-black lines
    read heavier than their L.
  - **Darker ink spreads lines, with diminishing returns**: #9a9a9a → #808080 → #555555 → #333333
    each cut line count less; pure black would add only ~3%. Past that, spreading lines means
    thicker lines (0.2mm would space them ~⅓ further).
  - **Hatching only reads as hatching while it's light.** To reach a mid tone, ink must cover most
    of the area; a cross-hatch past ~50% cover has lines wider than its gaps and reads as white
    specks on dark (tried lots L 0.60–0.75: "pretty bad"). Lines read as lines while clearly thinner
    than the gaps (cross ≲ 50%, single ≲ 35%); with these hairlines, the floor is about L 0.85. A
    darker zone would need a flat tint under the lines.
  - **Streets darker than lots**, as asphalt is, and both lighter than tiles, so built tiles pop.
- **Dropped looks**: Plain (all white), Vacant (diagonal lots only), Derelict (dark grime
  cross-hatched lots, so the city starts dark and brightens as tiles land; streets lined along each
  street), Asphalt (dark dot streets, L 0.50–0.80), and a first Engraved with lines along each
  street and a separate crossing grid.
- **Open**: tax incentives sit on empty plots and must stand out on the hatch; check line weights on
  a real print (screen zoom shows moiré).

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

- **Density for flat tiles** (2026-10-19, proposals, not yet tried):
  - **Plot gap**: `PLOT_PADDING` 1mm → ~0.25mm, so tiles sit 0.5mm apart (stock tolerance; a lifted
    tile doesn't drag its neighbor). Touching only works with **thick tiles** (~2mm), gripped by an
    edge; check the stock 1.25in tiles. In a ring every tile has 2 free sides (middles: sidewalk and
    courtyard, opposite; corners: two outer sides), so tiles can be flipped and lifted in place.
  - **Art**: non-directional (top-down roofs; any tile lands on any of the 8 plots), one shared edge
    treatment (a parapet band) so neighbors read as one block, and the dark and construction sides
    share the same outline. Empty plots must read as vacant lots.
  - **Between neighborhoods**: now 5 + 15 + 5 = 25mm tile edge to tile edge, more than needed (≥12mm
    to read as separate with near-touching tiles, ~8mm for fingers, ≥12mm at fold seams, ~20mm for a
    real street-to-block ratio of ~0.2). Target **~18–20mm**. Idea: a ~25mm avenue along the
    quad-fold's centre cross, ~15mm streets elsewhere (hides folds, suggests 4 districts); risk:
    uneven gaps may suggest uneven adjacency.
  - **Crowding**: cubes sit on their buildings' tiles (2026-10-19), so the plaza holds only the
    label and the mayor pawn. A tile's worst case: a restore (2 workers), or a finished House or
    Commercial with its cube. Idea: print an empty cube outline on finished House and Commercial
    sides, so a taken cube leaves a visible "demand met".

- **Plaza** (room per neighborhood for the mayor's pawn): solved by the ring's hole; cubes moved
  onto tiles 2026-10-19. Earlier tries, 2026-10-17: a strip right of the plots ("doesn't look that
  good"), a plot-tall strip above them, white and outlined (read too much like a plot), bare ground
  (unbalanced, not like real city blocks).

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

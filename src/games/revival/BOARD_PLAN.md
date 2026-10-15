# Revival — Board Plan

Plan of record for drawing the city map. Update this file rather than re-deriving; open items are
near the bottom, abandoned approaches at the very bottom.

## 1. Rectangular blocks (`blocks/`, `/revival`)

A matrix of rectangular neighborhoods with white streets between them. Plan of record since
2026-10-14; the user: "It seems like a city right away", solving the parsing problem.

- **Every Block is a vertical column** (1–3 plots); a neighborhood is 1–3 touching columns,
  bottom-aligned. Claiming a column is the game's organizing idea, so nothing else marks it: no
  dividers, no extra spacing. Matches DESIGN.md (Blocks 1–3 plots; column count = player capacity).
- **24mm system**: every plot is a 24mm track (a 22mm white square, 0.6mm black border, 1mm padding
  all round), so plots sit 2mm apart.
- **Block = rectangle of whole 24mm cells**: plots plus one cell each way: 12mm buffer left and
  right; 4.5mm on top and a 19.5mm claim band below (split so the gap above the plots matches the
  gaps around the claim ring, ~4.9mm). So 3×2 plots → 4×3 cells. Every block's plots land on one
  grid, offset from the cell grid.
- **Claims**: a 10mm solid ring (0.6mm, light grey so it recedes) under each column in the band, on
  a stem up to the column's bottom plot, centred optically between the plot square and the edge
  line. (Dashed 0.25mm circles looked weak; 12mm and 16mm discs were tried.)
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
  slack goes to the board's edge, or widens both seam streets on a middle tile. Per tile, at most
  ~10 cells across and 7 down (e.g. 3+2+4 / 3+4). The 5×5 doesn't fit 2 tile rows (8.8mm over), so
  **2×3 sheets** (21×24in): heights 2 | 3 2 | 2 1, widths 2 3 | 2 2 1; middle-row seam streets come
  out 17.6mm. (2×2 sheets held a 6×4 matrix.) On screen: the whole board with dashed cut lines, and
  the header lists tiles that overflow and neighborhoods that don't fit their frame. In print: one
  Letter page per tile with crop marks just outside its corners; trim and butt together.
- **Mayor idea**: walk in an L (at most one turn), so the active player only picks the corner; a big
  decision-speed win over shortest paths on a free graph. The matrix makes adjacency the 4
  orthogonal neighbors. Not yet in DESIGN.md.

## 2. Open

- **Player-count scaling**: grey out plots (fixed or per count), or drop edge rows/columns (keeps
  coordinates stable)? The user's next focus.
- **City Hall**: claimable like any block, or civic (not claimable; 91 playable plots)? The mayor's
  start and home?
- **Rules link**: write the L-walk and orthogonal adjacency (Market gates) into DESIGN.md.
- **Claim size**: 10mm rings need ≤ 10mm tokens.
- **Mayor pawn** has no dedicated spot.
- **No editor**: the city is edited in `city.ts`.
- **DESIGN.md is stale** on neighborhood count and sizes, degree cap, and how claims are shown.

## 3. Abandoned approaches

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

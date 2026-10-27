# Revival

Abstract stage. Working notes: **why** the game is the way it is; decisions are recorded as made,
open questions at the bottom. What players do lives in `RULES.md`; the physical pieces in
`COMPONENTS.md`.

## Premise

Players are competing construction companies capitalizing on the turnaround of a major city. They
develop plots across the city's blocks and sell what they build; the mayor walks the city, trickling
out tax incentives that sway where it pays to build.

## Decided

- **City geometry** (2026-10-24; was a 4 × 4 matrix of ring neighborhoods, 128 plots): a **6 × 6
  matrix of blocks** on a 20 × 20in quad-fold board, plots split **1, 2, 2, 2, 2, 1** each way (5 ×
  5 per panel), so 2 × 2 blocks inside, 1 × 2 along the edges, 1 × 1 in the corners. Every block is
  a neighborhood (the rules say **block**, 2026-10-25). **Streets** between them are named **A–E**
  (west to east) and **1–5** (south to north); C and 3 run down the fold and cut, so they go
  unprinted. The mayor walks the streets and stops at intersections (see Mayor stops). **City Hall**
  is the C3 crossing: the 4 plots touching it are left out for a plaza, and the mayor starts there.
  **96 plots.**
- **Cones** (2026-10-17; replaced construction sites, Blocks and the Sell action); **workers** in
  RULES.md since 2026-10-19 (worker meeples for playtesting, same role): each player has
  **construction cones** in their color. A cone on a plot is a building under construction; it's the
  only thing a player owns on the board. Once the cone comes off, the building belongs to the city.
  - **3 cones each** at every player count (starting point): one or two speculative holds plus a
    working project. More players means fewer turns each, not more parallel projects. No limit per
    block: crowding cones into one block can lock rivals out, and the mayor taxes every coned corner
    he stops at.
  - **No passing**: with every cone out you must finish; with none out you must start something.
- **A turn is one decision** (principle, 2026-10-17): **choose one plot and move it one step
  forward**; its state decides the step (empty: break ground, picking the row tile or a Park; your
  project: finish and sell). How many cones a step uses is the plot's business, not a choice. The
  game's depth is combinatorial: which plot, and when. Keep new rules inside this shape.
- **Workers per type and lines** (2026-10-26; replaces one cone per build, below; counts revised
  2026-10-27 to House 1, Commercial 2, Industrial 3, see Levels and era decks): breaking ground puts
  down **Park 1, House 2, Commercial 3, Industrial 4** workers; every later action takes one off,
  and the last one off finishes and sells. So a build takes **1 + workers** actions: bigger projects
  are slower, hold more workers, and sit taxable longer. Industrial needs a 4th worker, so it waits
  for an upgrade: big business is a mid-game unlock. Wording in RULES.md.
  - **Start 3, cap 7, escalating** (3 / 4 / 5 / 6 incentives a worker): a short, sharp early race
    for incentives to buy the 4th worker, against credit for the same incentives; the walker sitting
    out upgrades brakes it, and escalating cost keeps an early lead from compounding. A high cap
    leaves room for long lines late. Considered: start 4, cap 6 (lines and Industrial from turn one;
    drop to it if the early game drags). Since 2026-10-27 an Industrial takes 3 workers, all you
    start with: upgrades buy parallel projects and longer lines, not access.
  - **Work a line**: one action takes 1 worker off **each** of your projects in a straight run along
    a row or column (across streets), from any start, one direction, stopping when you like or at
    the first plot that isn't your project. Finishes sell in the order walked, so an earlier finish
    counts toward a later sale (not inside out). Pays off planning with very large turns, and pulls
    game length back down.
  - A finished building breaks a line, so a long line wants its projects to stay unfinished: big
    projects hold lines together.
  - **Known pattern**: House, then Park beside it, work the line from the Park (Park sells), then
    finish the House counting it: 4 actions for both, not 5. Cleanest in a 2-plot edge block (the
    pair fills it). Fine as a known opening: the mayor's incentives pull play elsewhere, and rivals
    can build into the same block.
  - Considered: workers 0 / 1 / 2 / 3 (instant Parks); a milder ladder only slowing Industrial;
    must-continue lines (forced finishes before inputs land); lines through rivals' projects.
- **Actions** (2026-10-17; worker counts superseded 2026-10-26): a turn is **one action**, and there
  are only two: **place cones** (break ground) or **pick one up** (finish and sell). A build takes 1
  cone, so two actions. Every payoff compares per action:
  1. **Break ground**: put a tile on an empty plot, **pay its full cost** (base and building
     together), and put one of your cones on it:
     - a **base tile** (Housing / Commercial / Industrial) bought from the row;
     - a **Park** for 0 coins from the Park supply; it discards one tile from the row.
  2. **Finish and sell**: take your cone off, flip the tile to its finished side (no cost), and
     **sell it**: you're paid its sale value, read from the board **now**.
  - **Speculation** is the point of the split: break ground on a Commercial, see a rival's House
    coming nearby, and hold your cone until it's finished to sell higher. Only **finished**
    buildings count toward value; a coned base shows what's coming but counts for nothing yet.
    Holding sinks coins and a cone, and some values can fall while you wait.
  - No Uproot: finishing costs nothing, so no one gets stuck.
- **Mayor's role** (2026-10-15; 2026-10-17): he **turns the city around**: hands out **tax
  incentives** (was tax breaks) and taxes the construction sites he stops at. (Clearing blight the
  market won't went with the blight, 2026-10-25.) He **never pays anyone**: no activation, no rent.
- **Mayor movement**: inspired by _On the Underground_. **Two agenda cards are always face up**,
  each naming an intersection: **one card per intersection but City Hall** (24 since 2026-10-25; was
  16, one per neighborhood), named by its streets (D4), with a map of the street lines. The walker
  picks which one is his target; after the walk resolves, reveal a new card to make two again. So
  the player whose build triggers a walk also steers the mayor's agenda.
- **Scale**: one board at every player count; player count changes setup, not the map. Houses are
  countable at a glance.
- **Mayor stops** (2026-10-25; was a visit to every neighborhood he entered on the 4 × 4 ring city):
  the mayor never visits a block. **Every intersection he steps onto is a stop** (not his start; the
  target included): 1–8, about 3.4 a walk. An intersection's **corners** are the 4 plots touching
  it, one per block round it; **every plot is a corner of exactly one intersection** (24 × 4 = 96;
  City Hall's 4 are the plaza), so every plot can be reached, edges included, and the 24 agenda
  cards cover each plot once. At each stop, both (2026-10-27; was tax only at a stop with no empty
  corner, which the sim showed almost never fired: 2–8 coins a game, all companies together):
  1. **Empty corner**: the walker puts **one tax incentive** on one (at most one a stop, stacking on
     a plot that already has one). The pick steers which block the incentive pulls builders into.
     Whoever breaks ground on that plot takes it. Incentives are **ramp currency, not money** (see
     Victory and ramp).
  2. **Tax**: he **taxes every company building there**: **1 coin per coned corner** they have.
  - City Hall has no corners: walking through it does nothing.
  - **Why**: one stop per intersection keeps the old ~3–4 incentives a walk; one per empty corner
    would reach 32. The L now picks which intersections are stops, so it's a real choice.
  - **Can't pay**: you lose **projects** (coned plots) **on the taxed corners** (the ones
    bankrupting you; your pick) equal to the coins you can't pay, all their cones returning (tax and
    loss count plots, not cones, so a restore isn't hit twice), so you never go negative; you get
    kicked out. An **abandoned project is wiped**: its tile leaves the game and the plot is empty
    again. Punitive: the coins are gone. No rival gains a free building from it, and the reopened
    plot can draw an incentive on the next visit.
- **Park**: free filler build that **interlocks with housing**: "people want to live near parks".
  Parks **boost the sale value of Housing in their block**.
- **Walk**: an **L-shaped path** along the streets to the target (at most one turn), or a straight
  line when they share a street. The L decides the stops. The player whose build triggered the walk
  picks the target and the L.
- **Build budget** (2026-10-25; was 120 plots with 30 blight, peaking 75% full): **96 plots**, no
  blight. The row is **N + 3 tiles** (N players) and the mayor walks when it's down to 2, so **every
  N + 1 tiles taken**. Walks are set per count; builds = walks × (N + 1). **A good chunk of the
  board stays empty at the end** (25–42% below), on purpose: players feel there was more left to do,
  and the endgame never crunches down to a few legal plots.

  | Players | Row | Walk every | Walks | Built | Builds each | Historical | Peak fill |
  | ------- | --- | ---------- | ----- | ----- | ----------- | ---------- | --------- |
  | 5       | 8   | 6          | 10    | 60    | 12          | 12         | 72 (75%)  |
  | 4       | 7   | 5          | 11    | 55    | ~14         | ~14        | ~69 (72%) |
  | 3       | 6   | 4          | 12    | 48    | 16          | 16         | 64 (67%)  |
  | 2       | 5   | 3          | 12    | 36    | 18          | 20         | 56 (58%)  |

  - **Agenda deck**: **24 cards** (2026-10-25; was 16). Count out **walks + 1** (11 / 12 / 13 / 13
    at 5 / 4 / 3 / 2 players): the extra is the **opening walk**, from City Hall to the first card
    at setup, making visits only (incentives on empty plots; nothing to tax yet), so the city starts
    with incentives before anyone builds. The rest stay unseen.
  - **Built** (total builds = tiles taken from the row) is a floor on play time: turns that don't
    take a tile (finish, sell) come on top. 10 or fewer builds per player is "comically low"; 5P's
    12 is the floor. The board fills less at 2P and 3P, where historical buildings fill instead.
  - **Row deck**: **96 tiles in 3 levels** (2026-10-26; was 78, more than the 62 any game drew); a
    game deals 76–92 of them, historical buildings included (see Levels and era decks).
  - **Positive** buildings (was prefill) are **historical** parts of the city, on L1 tiles. They
    **affect the value of buildings nearby** like any building, but you get **no credit for them
    when selling**. Capped at 18 so low counts aren't buried in setup.
  - **Setup cost** (2026-10-19, flat tiles): blight 30 + historical 0 / 12 / 18 + a cube per
    historical House or Commercial (0 / 11 / 16) = **30 / 53 / 64** pieces (4–5 / 3 / 2 players),
    split across players (see Setup cards). Was 68 / 103 / 120 with wooden buildings.
- **Setup cards** (2026-10-25; blight and historical row/column cards 2026-10-17 to 2026-10-25): the
  starting state is dealt, not printed. **8 quadrant cards**, each a map of one quadrant of the city
  (5 × 5 plots) and its historical buildings; **deal 4, one per quadrant**, read **upright**. A card
  **never uses its 4 corners**: whichever quadrant it lands in, those are City Hall's notch, the
  board's 1 × 1 corner, and two edge plots, so every card fits every quadrant with no turning.
  (2026-10-25: turning each card so a City Hall corner pointed at City Hall read strangely.) The map
  is an even 5 × 5 grid, not the quadrant's blocks, which differ by quadrant.
  - **Per player count**: 2P **20**, 3P **16**, 4P **~14**, 5P **12**. Each building carries a
    **corner badge**: the most players it's placed at (no badge: every count). Every card places
    **5**: three unbadged, one badged **4** (half the deck) or **3** (the other half), one badged
    **2**. So 5P, 3P and 2P are exact; 4P is **12–16, 14 about half the time** (13 or 15 most
    others). A fixed 14 needed two piles; one deck won.
  - Placement rules for the draft: no corners; at most one building a block at 5P **in every
    quadrant**, so the 5P buildings sit at least 2 plots apart on one axis (block lines fall
    differently per quadrant); each card a different shape.
  - **Historical Parks** (2026-10-25): **4 in the deck**, one each on 4 cards, each in place of an
    unbadged House, so about 2 a game (0–4) at every player count. They seed **House hotspots** (+1
    to every House finished in the block) where the other historical buildings seed cubes; a Park
    puts out none, so a game starts with ~2 fewer demand cubes. A Park sits in the card's **inner 3
    × 3**, the only cells that land in a 2 × 2 block in every quadrant (in a 1 × 2 edge block it
    would lift one House at most), and never in a block with a historical House (never sold, so the
    bonus is wasted). No special tile: a supply Park, finished side up.
  - **Setup cost**: 12–20 historical tiles, L1 tiles since 2026-10-26: the L1 bag holds at least as
    many of each type as any 4 cards place (14 House / 7 Commercial / 4 Industrial, at 2P), and up
    to 4 supply Parks.
- **Building row (mayor clock)** (2026-10-15; K 2026-10-17): building base tiles (House, Market, …)
  are bought from a face-up row of **N + 3** (N players: 8 / 7 / 6 / 5 tiles at 5 / 4 / 3 / 2
  players since 2026-10-25; was 7 / 6 / 6 / 5). A Park comes from its own open supply but discards
  one tile from the row. **If you leave 2 tiles in the row, walk the mayor, then deal a fresh row**
  (2026-10-26; was refilling its empty slots; see Levels and era decks). So the mayor walks once per
  K tiles taken, K = N + 1 (10 / 11 / 12 / 12 walks). Who triggers each walk, and when, varies:
  turns that don't take a tile (finishing) interleave, and K is never a multiple of the player
  count. The row also pushes players into builds they didn't plan, without capping how many of one
  type a player can build.
- **Sliding row** (2026-10-25): the row's slots carry surcharges **+0, +0, +1, +1, +2, +2, +3, +3**
  (2026-10-27; was +0, +0, +1, +1, +1, +2, +2, +3, the third +1 undercosted); a row of N + 3 uses
  the first N + 3 (2P: up to +2). Taking a tile slides the rest toward +0. A fresh row comes only at
  walks, so the dear end empties fast and surcharges bite at the start of each round. A Park
  discards the **+0** tile (was the taker's pick): one less decision, and it clears the oldest tile.
- **Levels and era decks** (2026-10-26; trial): **96 building tiles**, one per plot, in **3 levels
  of 32** (L1, L2, L3); **24 Parks** (one per intersection) sit outside the levels. A **type** sets
  workers and what it counts; a **level** sets reach; each tile prints its **cost and base**.
  Wording in RULES.md, The row and Selling.
  - **Tile numbers** (2026-10-27, from the user's spreadsheets; revised the same day after the sim,
    `sim/sim.node.ts`):

    | Type        | Workers | Counts      | Per input | L1 cost → base | L2    | L3    |
    | ----------- | ------- | ----------- | --------- | -------------- | ----- | ----- |
    | Park        | 1       | —           | —         | 0 → 1          | —     | —     |
    | Residential | 1       | Parks       | +1        | 1 → 2          | 2 → 4 | 3 → 6 |
    | Commercial  | 2       | Residential | +2        | 2 → 2          | 3 → 4 | 4 → 6 |
    | Industrial  | 3       | Commercials | +4        | 4 → 2          | 5 → 4 | 6 → 6 |

    - Every type's base is **2 / 4 / 6**; cost sets the profit. Profit with nothing counted (L1 / L2
      / L3): Residential +1 / +2 / +3, Commercial 0 / +1 / +2, Industrial −2 / −1 / 0.
    - **Why revised**: aiming for a mix of about 1 Park : 4 Residential : 2 Commercial : 1
      Industrial. The first numbers (Residential and Commercial 3 / 5 / 7, Industrial 5 / 6 / 7 → 1
      / 3 / 5 at +5) built Industrial at under half that share. Lower Residential and Commercial
      bases shift money up the chain; Industrial's cheaper cost and +4 trim its jackpots without
      changing the common case (one shop beside it).
    - **Food chain**: Park → Residential → Commercial → Industrial. No type counts itself, and
      nothing counts Industrial: it's the top of the chain. Industrial is the swing build: an L1
      with 2 shops in its block makes +14 (3.5 per action); a shop with 2 Residentials, +8 (2.7).
    - The spreadsheets show **tradeoffs by value per action**; a rush on Residentials makes shops
      viable.
    - **Residential** (2026-10-27) is the type's name; House in older entries.
    - **Building a shop sets up a rival's Industrial**: shops feed Industrials one way.
  - **Workers by type** (2026-10-27; workers = level, 2026-10-26, was briefly in): **Residential 1,
    Commercial 2, Industrial 3**; a Park 1. Read by the user as the better rule: a rush on cheap,
    quick Residentials makes shops viable. Industrial takes all 3 starting workers.
  - **Own block twice, reach = level** (2026-10-26; was +3 own block, +1 one neighbor): each input
    in the building's own block counts **twice**; from L2, each in **neighboring blocks** counts
    **once**, **L2 one neighbor, L3 two** (seller's pick). Each count pays the type's per-input
    value (table).
    - **Why**: separate own-block and neighbor tallies are where players slip; "count your block
      twice" is one more glance. L1 (most of the early game) counts its block only, which keeps
      thinking down and the pull toward mixed use strong; reach makes L3 the one with potential.
    - A chart (count → coins, non-linear) stays a dial.
    - Considered the same day: workers = level (L1 1, L2 2, L3 3), with base rising steeply to carry
      later levels; count × level; reach 1 / 2 / 3 into one shared diminishing chart, unweighted
      (rings return); own block only with a chart per level (no interaction across streets); +1 per
      neighboring block with any input, or with 2+, up to your level (yes/no glances; at 2+, 1 × 1
      and 1 × 2 blocks never qualify); Industrial counting Commercials and Industrials. Picking the
      best L neighbors means counting each one, so it costs more than it looks: kept to 1–2
      neighbors, and only late.
  - **Why**: "quality" in places, as in Brass, where a tile's printed level sets its payout. Brass
    gets its arc from a private ladder; a shared row gets it from bags drawn in order.
  - **Historical buildings are L1 tiles**, finished side up (settles the historical tile source). It
    evens the eras across counts: low counts place more historical buildings but draw fewer tiles.
    The L1 bag must cover any setup deal: at least **14 Residential / 7 Commercial / 4 Industrial**
    (the most any 4 cards place, at 2P).
  - **Bags, not decks** (2026-10-27): a tile has two faces and no back, so a face-down deck can't
    hide it; each level is drawn blind from **its own bag**. The bags also sort setup and storage,
    and the level icons on both faces say which bag a tile goes back to.
  - **Dealing**: every slot but the last from the lowest bag with tiles, the last from the next deck
    up: L1s and one L2, then L2s and one L3, then L3s. The next era always arrives at the dearest
    surcharge.
  - **A fresh row at every walk** (Castles of Burgundy): the 2 leftovers (slid to +0) are discarded.
    Every row is a snapshot of its era, and the walker also decides which 2 tiles die. Costs 2 tiles
    a walk.

    | Players | Dealt (rows × slots + historical) | L1 rows | L2 rows | L3 rows | Spare |
    | ------- | --------------------------------- | ------- | ------- | ------- | ----- |
    | 2       | 12 × 5 + 16–20 = 76–80            | 3       | ~7      | ~2      | 16+   |
    | 3       | 12 × 6 + 12–16 = 84–88            | ~3      | ~6      | ~3      | 8+    |
    | 4       | 11 × 7 + 9–15 = 86–92             | 3       | ~5      | ~3      | 4+    |
    | 5       | 10 × 8 + 8–12 = 88–92             | ~3      | ~4      | 3       | 4+    |

    About **3 L1 builds per player** at 2P, 2.5 at 5P: every count engages with a few.
  - **Mix by era** (the lever): each deck has its own type mix, so the city's character changes as
    it grows. L1 is Residential-heavy (it must cover setup): the old city. **L3 can be
    Industry-heavy**: big business arrives late and cashes in on the shopping districts. Placeholder
    mixes (L1 20 / 8 / 4, L2 16 / 10 / 6, L3 10 / 10 / 12) are in `tiles/tiles.ts`.
  - Considered: a private ladder per company on the mat (Brass), with Develop as building a Park,
    and the clock as either type-only permits in the row (a component just for counting) or mayor
    icons under the mat's tiles (lumpy walks, no unplanned builds); 28 / 28 / 28 with refills
    instead of a fresh row (2P never left L2, 5P spent its last third in L3); a small L3 showpiece
    deck (~8); a soft three-pile blend.
- **Income = selling** (2026-10-15): companies are builders, not landlords: no rent, no activation.
  Every type earns when it's finished and sold. Roster as a risk/reward ladder:
  - **Housing**: low cost, low risk, low reward.
  - **Commercial** (was Market): medium / medium.
  - **Industrial**: highest cost to invest in, highest potential payout.
  - **Public services**: cost money, earn **favor with the mayor**. Likely left out of the first
    playtest.
- **Payoff chart** (2026-10-17; replaced the 2026-10-16 excess-counting chart): cost is paid in full
  on breaking ground; sale value is read on finishing. **Smallest numbers** that keep the
  incentives, at about **1 coin per action** (every build is two actions):

  | Type       | Workers | Actions | Cost | Sale | Counts                 | Floor |
  | ---------- | ------- | ------- | ---- | ---- | ---------------------- | ----- |
  | Park       | 1       | 2       | 0    | 1    | —                      | +1    |
  | Housing    | 2       | 3       | 1    | 3    | Parks                  | +2    |
  | Commercial | 3       | 4       | 2    | 2    | Houses                 | 0     |
  | Industrial | 4       | 5       | 4    | 1    | Industrials, itself in | 0     |

  Every count pays **+3** per building in its own block, **+1** per building in one neighbor.
  Numbers are placeholders (2026-10-26): inflation is fine until the system is plausible. Superseded
  2026-10-26 by Levels and era decks: cost and base printed per tile, workers = level, own block
  counted twice.

  - **Counting** (2026-10-26; replaces raised buildings and cubes below): a sale **counts** what it
    draws on, and takes nothing: **+3** each in **its own block**, **+1** each in **one orthogonal
    neighbor** (seller's pick). **House** counts Parks, **Commercial** Houses, **Industrial** other
    Industrials, itself included. No 1 + n cap, no wood. Wording in RULES.md, Selling.
    - **Why counting**: much easier to read a payoff: scan your block and one next to it. Blocks are
      small (1–4 plots), and players can count.
    - **Mixed use**: the +3 own block pulls each type's input into the same block, so the best
      Houses and shops sit in mixed blocks (Park, Houses, a shop). Next door is a small top-up.
      Without it, all-positive counting gave **predictable rings** (Parks, then Houses, then shops,
      then Industry).
    - **Industry concentrates**: Industrial counts Industrials, not Commercials, so it forms its own
      single-use zones (industrial parks), more realistic than a supply chain. It pulls against
      mixed use for plots, and it breaks the rings. "Itself included" so a lone Industrial isn't a
      dead loss (base 1 + 3 = its cost); the second in a block collects more. Commercial is now a
      dead end: nothing counts it.
    - **Reach 1 for every type** (superseded 2026-10-26 by reach = level): picking neighbors at sale
      is arithmetic (take the best), not a decision, and wide reach made every tier decent anywhere,
      blunting placement. Kept as a dial: widen one type if types feel samey.
    - **Interaction is over land**: with no depletion, a rival's sale never takes your demand; the
      fight is for plots. Accepted risk: a housing cluster ringed by shops pays each in full.
    - Considered the same day: a reach ladder (House 1, Commercial 2, Industrial 3, Civic 4) with
      own block at par; own block ×2; Nuisance (Houses −1 per Industrial in their block), still a
      candidate lever; saturation (−1 per same type in the block); a mixed-use bonus; Civic as
      MIN(House, Commercial, Industrial), which collapses to "count Industrials" at an 8 : 4 : 1
      deck.
  - **Raised buildings** (superseded 2026-10-26; 2026-10-25, replaced the cubes below): a finished
    tile stays **flat** (2D) until another building draws on it; then it's **raised**: a wooden
    building of its type goes on it. A flat finished building is unmet demand; wood marks economic
    integration, so the city fills in, in 3D, where the economy flows, and the flat parts are the
    underserved ones. Why: cubes were borrowed straight from Brass, and they'd fight wooden
    buildings on the board for room. Also no setup cubes: historical buildings just start flat.
    Parks get no wood: they're non-rival, nobody uses one up.
    - Read "takes a cube" in the older entries as "raises a building".
    - **Cycle** (penciled in, to math out): **Houses draw on Industrials** (jobs for residents), for
      a small bonus per Industrial raised (~+1, so Housing stays the safe build); reach undecided.
      Closes the loop, so every type has an input and an output, and Industrial gets raised at all.
      Hoped-for: richer interactions later.
    - **Wood**: colored by type at a minimum, maybe sized by type. Up to one piece per House,
      Commercial and Industrial tile.
    - Tried first the same day: wood laid on finishing, stood up when drawn on; dropped because a
      lying piece reads as fallen and standing pieces up in a crowd is fiddly.
  - **Cubes on the buildings** (superseded 2026-10-25; 2026-10-19: abstract demand, so plain cubes,
    sitting on the flipped tile; were hexes in the plaza 2026-10-18, shaped so they never read as
    plot squares): finishing a **House** puts a **demand cube** on its own tile; finishing a
    **Commercial** puts a **Commercial cube** (second color) on its tile. Finished tiles never move
    again, so a cube has a stable home, and the board shows which buildings' demand is still unmet.
    **Historical buildings put out their cubes at setup**, so at 2P and 3P an opening shop is a real
    option; at 4P and 5P Houses come first. The plaza is left to the mayor and the label.
  - **Taking cubes**: finishing a Commercial (Industrial), count the finished Commercials
    (Industrials) in its block, itself and historical ones included: **n**. It **must** take **up to
    1 + n** cubes of the type below, **its own block first**, then **Commercial: the blocks across
    the street** (up to 4; shoppers cross the street); **Industrial: its row and column** (freight
    lines, up to 11 blocks of 36; was 7 of 16). Taken cubes return to the supply. Nothing to
    calculate: look and pick up.
  - **Concentration**: a block's 1st shop takes up to 2, its 2nd up to 3, its 3rd up to 4: shopping
    districts (and industrial parks) pay, while depletion keeps shops competing for the same
    customers. First mover gets first pick but a small cap; later movers a bigger cap but fewer
    cubes left. A busy district can drain its neighbors.
  - **Ladder**: floors +2 / 0 / −3, per cube +1 / +3. Housing is safe; Commercial breaks even
    without demand and only beats a House from 3 cubes (a 2nd shop onward), so it's worth building
    from ~2 waiting cubes; Industrial is **rare and swingy** (breaks even at 1 cube, loses 3 at
    none), too dear to open with, and a rival's Industrial on your row or column can take the cubes
    you were waiting for.
  - Park +1 beats nothing; Housing +2 beats Park: the city pays you a little for Parks, Housing
    makes money. Parks lift every House in their block (a public good) but make no demand.
  - **Natural ratio**: balancing cube supply and demand, each level settles at **2–3 of the type
    below per building** (2 spread out, 3+ clustered), so Houses : Commercial : Industrial ≈ 4 : 2 :
    1 to 9 : 3 : 1; best guess **~5 : 2.5 : 1** (shops cluster, Industrials rarely share a block).
    Leftover cubes at game end are wasted demand.
  - **Supply mix** (2026-10-17, starting point): new construction is mostly Housing; shops and
    factories mostly come from **converting ruins**. A player who needs Commercial or Industrial and
    isn't seeing it in the row can always go convert a ruin.
    - **Row deck** (2026-10-25; was 9 : 3 : 1, 54 / 18 / 6): 78 tiles at **8 : 4 : 1** (48 House /
      24 Commercial / 6 Industrial). 4–5P draw ~62 of it, 2P ~44, so the mix varies game to game.
    - **Historical** (2026-10-25; was 17 / 15 / 4 / 4): the setup deck's 40 are **21 House / 11
      Commercial / 4 Industrial / 4 Park**; a game places 12–20 of them (see Setup cards), about **2
      Houses per Commercial at every count** (5.5 / 3 at 5P, 7 / 3.5 at 4P, 8.5 / 4 at 3P, 10.5 /
      5.5 at 2P) and a Park per Industrial, for flavor.
    - **Why** (2026-10-25): with blight gone, restored ruins no longer add shops, and the row's 9 :
      3 : 1 was too Housing-heavy, so the setup cards had leaned on historical Commercial (about 1 :
      1 at 4P), which made the starting city look shop-heavy. The extra Commercial moved from setup
      into the row: a 4P game (setup plus ~62 draws) lands near **7 : 3.5 : 1**, close to the
      natural ~5 : 2.5 : 1. Swapped to House: Founders Row's 4P, Guild Street's 5P, Chapel Lane's 2P
      and Exchange Place's 4P Commercials (every card keeps one).
  - **Full blocks** (2026-10-25; was "no Housing while blight stands in its neighborhood"): a
    **House can't be finished until every plot in its block has a tile** (historical included). A
    strong pull to complete 2 × 2 blocks; easy on 1 × 2 edges, free in 1 × 1 corners. Industrial and
    Commercial are unaffected.
- **Building source**: the building row (above); pay the building's cost.
- **Income/sink**: selling is the only income (plus credit income); tax and building costs are the
  sinks.
- **Starting purse** (2026-10-18; was 5 flat): **4 coins for the first player, +1 per seat** (4 / 5
  / 6 / 7 / 8). Below, the 2026-10-17 case for flat 5, kept as the thing to watch in playtests. No
  credit marker at setup until credit is worked out. Previously: **5 coins each, flat**. 4 is the
  floor for real choices (an Industrial all-in, or House + House + Commercial); 5 fills all 3 cones
  (Commercial + Commercial + House), so opening with several projects is a real alternative to
  build-sell-build-sell. No turn-order offset: going first is worth ~1–2 coins over a game, and +1
  per seat overcorrects by more than that (uneven offsets like 5 / 5 / 6 / 6 / 7 aren't smooth
  enough). Add +1 per seat only if playtests show the first seat winning more.
- **No blight** (2026-10-25; blight tiles 2026-10-16 to 2026-10-25): the board doesn't show blight;
  the **whole city is run down by default**, and every blank plot is a lot to build on. Breaking
  ground is unchanged; the restore (2 cones, knockdown, finish: three actions), knockdown, blight
  tiles, blight setup cards and the mayor's blight knockdown are all cut. Housing's blight lock
  became Full blocks (above). Lost: a cheaper, slower path for cash-poor players, tile-free turns
  that delay the mayor, and setup geography from where blight lands (setup cards now place only
  historical buildings).
- **Game end** (2026-10-15; cones 2026-10-17; scoring 2026-10-17): the game ends on the **last mayor
  walk** (agenda deck runs out: the mayor's term ends), including that walk's visits. With two cards
  face up, the last walks use them up (the choice narrows from two to one): **every agenda card seen
  is walked**. So walks = cards counted out − 1 (the opening walk), as in the budget table. Then:
  1. **Final sale**: every player, the one who ended the game included, may finish one coned
     building at full value.
  2. **Firesale**: every other coned project sells for its **base sale value − 1** (never below 0;
     no Parks or cubes counted): House 2, Commercial 1, Industrial 0. Starting late costs a little
     but never ruins you, so construction keeps driving the end instead of play stopping when the
     deck gets thin. **Since 2026-10-27: 1 coin per level** (Park 0), so a late start never beats
     its cost (base − 1 could: an L3 Residential cost 3 and firesold for 6).
- **Victory and ramp** (2026-10-17): **most money wins**. Two separate economies: coins are the
  score; **tax incentives** are what your company can do.
  - **Earning incentives**: break ground on a plot where the mayor left one; **finish a building on
    one of the mayor's corners** (was his neighborhood; influence with City Hall: the mayor rewards
    companies he sees delivering); later, Public services would pay mostly in incentives.
  - **At each walk, every player** collects **credit income**, and **every player except the
    walker** may **spend incentives on upgrades**: a better **credit rating** (lenders trust a
    company in good standing with City Hall), **more cones**, later special powers. The walker
    steers the mayor instead of upgrading: that offsets the walker's power, and gives everyone else
    something to do during the walk.
  - Triggering a walk costs only that walk's upgrade window (income still comes), a mild trade-off
    for the steering, so dodging walks shouldn't add much to the stall risk.
  - Credit balances itself: a step bought early pays on every remaining walk, one bought late barely
    pays back, so upgrading fades as the deck thins.
- **Focus**: core loop first.

## Terminology

| Term          | Meaning                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------- |
| Company       | A player; a construction company.                                                             |
| Block         | 1–4 plots; 36 in a 6 × 6 matrix, streets between them (was neighborhood).                     |
| Plot          | One square of a block; holds one tile.                                                        |
| Corner        | One of the 4 plots touching an intersection; every plot is a corner of exactly one.           |
| Stop          | An intersection the mayor steps onto on a walk: an incentive, and tax.                        |
| City Hall     | The C3 crossing, 4 plots left out round it for a plaza; the mayor starts there.               |
| Building      | A tile's finished side (Residential, shop, factory, Park); typed; earns when sold.            |
| Tile          | 35mm, two-sided: construction (cost on a gold coin) and finished; bought from the row.        |
| Row           | The face-up building row, N + 3 tiles; the mayor walks when it's down to 2, then a fresh row. |
| Level         | L1 / L2 / L3; 32 building tiles each, dealt in order (era decks). Historical are L1.          |
| Worker        | A player's marker on a project (3 each, up to 7); Park / House 1, Commercial 2, Industrial 3. |
| Break ground  | Pay a tile's full cost, place it, and put down its workers: a build's first action.           |
| Work          | Take 1 worker off each of your projects along a row or column, in order.                      |
| Finish        | Take a project's last worker off, flip the tile, and sell it.                                 |
| Historical    | A building placed at setup by a setup card; counts for neighbors, not sold.                   |
| Setup card    | A quadrant's map of historical buildings, badged by player count; 4 dealt, one a quadrant.    |
| Count         | Inputs in its own block twice, in level − 1 neighbors once; × the type's per-input value.     |
| Mayor         | Pawn that walks the streets to an agenda target: hands out incentives, taxes.                 |
| Agenda        | A card naming one intersection; two face up; the walker picks the target.                     |
| Walker        | The player whose build triggers a walk: steers the mayor, skips that walk's upgrades.         |
| Incentive     | Tax incentive: ramp currency (not money); spent on upgrades during walks.                     |
| Tax           | At every stop: 1 coin per coned corner, per company.                                          |
| Credit rating | An upgrade track; pays its level in coins to every player at each walk.                       |
| Upgrade       | Bought with incentives during a walk (not by the walker): credit, cones, later powers.        |
| Firesale      | After the final sale, unfinished projects sell for 1 coin per level (Park 0).                 |

## Open

- **Tile numbers** (2026-10-27): a starting table is in Levels and era decks; each level's type mix
  is still open.
- **Industrial's ceiling** (2026-10-27): at +4 per shop (was +5, ~+70), an L3 Industrial in a full
  shopping district could make ~+56 (Commercial's best is ~+28). Judged very unlikely to occur; let
  playtests show whether it can.
- **Historical tiles** (2026-10-26; was open since 2026-10-19): L1 tiles finished side up (see
  Levels and era decks). Setup still searches the L1 bag by type. Burgundy likely dropped.
- **Row component** (2026-10-25): the row will want its own component (a board or track to hold it);
  undecided. The type mix of each level's deck is a work in progress (was one 8 : 4 : 1 deck). The
  sliding row's surcharges need tuning.
- **Game length** (2026-10-26): builds now take 2–5 actions (was 2), roughly 1.7× the turns at the
  same build budget, less what lines save. Re-check the budget table and walks per count.

- **Upgrade menu** (to workshop; starter for testing): credit rating 1 step (max 3) for 2 / 3 / 4
  incentives, +1 coin per walk; +1 worker (max 7) for 3 / 4 / 5 / 6 incentives (2026-10-26; was 3
  each, max 5). Incentive supply: one per stop with an empty corner (~3.4 a walk early, max 8), +1
  per building finished on the mayor's corners. Later: special powers, advanced buildings needing
  several cones. (Considered: trading a cone in for credit; not thematic.)
- **Industry's share** (2026-10-26; eased 2026-10-27): Industrial counted Industrials, a rare input
  (6 of 78 row tiles). It now counts **Commercials**, which are common, so the problem is mostly
  gone; the Industry-heavy L3 deck stays the lever for how much Industry a game sees.
- **Commercial as a dead end** (2026-10-26; resolved 2026-10-27): Industrial counts shops.
- **5th type, Civic** (2026-10-26): wanted, room kept for 5 types; what it counts is tabled until
  there's a clever idea (an idea: it alone counts all 4 neighbors, "serves everyone"). Likely public
  services (paying in incentives).
- **Industrial's name**: it's a proxy for big business, not heavy manufacturing. Candidates: Office,
  Wholesale, Corporate, Enterprise.
- **Full-block lock** (2026-10-25): a player can cone a plot in a block and sit on it, holding the
  block's Houses hostage; the mayor's tax at his stops is the only pressure. Watch it.
- **Setup cards**: a draft of the 8 quadrant cards is in `setup/setupCards.ts` (printable at
  `/revival/cards`, dealt on screen at `/revival`); names are placeholders. Playtest them.
- **Tax pressure** (2026-10-25): tax needed all 4 corners built and almost never landed (sim); since
  2026-10-27 every stop taxes. Watch whether it now bites too hard. Incentives may also run thin
  mid-game as corners fill.
- **Public services**: pay mostly in tax incentives (decided direction); costs and amounts
  undecided.
- Graph topology: a 6 × 6 matrix of blocks with orthogonal adjacency (2026-10-24; was 4 × 4).
- Re-check economy now that income is selling (tax magnitudes, build costs, sale values).
- **Worker meeples (prototype idea; predates cones, which now play the claim role)**: the Block
  claim marker is a worker meeple (construction overseer / property manager) assigned to the Block.
  Building Houses "hires local workers" and grants more meeples, which raises how many Blocks you
  can have under construction at once; this is the owner's private payoff for Houses.
  **Anti-lockout**: when a Block is full, take your meeple back and leave a white "city employee"
  meeple on it. A player then always has a legal develop: either an open plot in a Block they hold
  (Park is free), or all Blocks full and every meeple is back to claim a new one. Unresolved:
  meeples per House, start count, whether the white meeple is needed at all (building colors may
  show ownership; all-Park Blocks have no owner color), whether the white meeple is also the
  score/"city revived" token, and a pass rule when no claimable Block remains.
- **Meeple side uses (prototype idea, not worker placement)**: some actions are worker-driven rather
  than coin-driven. First candidate: **lobbying**, placing a spare meeple on an Agenda card to force
  the mayor's day. Needs several revealed cards, a rule for ties/default, a decision on whether the
  meeple returns or is lost, and care that it's a free side action (the one action per turn stays
  "develop"). Other candidates: tax lawyer (exempt one site from a walk's tax), overtime (second
  develop). Keep the set small so the meeple economy stays legible.
- Supply mix: validate the starting mix (Payoff chart, Supply mix) with a quick greedy-player
  simulation now that the setup cards exist. Public services' share; how to let a game run
  housing-heavy or civic-heavy without the designer fixing one ratio.

## Known tensions

- Insolvency (lose cones) only fires if tax can actually exceed a purse; at 1 coin per coned plot it
  rarely will. An abandoned project's tile is wiped, but it was never a finished building, so
  finished buildings are never removed.

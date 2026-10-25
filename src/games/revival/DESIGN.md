# Revival

Abstract stage. Working notes: **why** the game is the way it is; decisions are recorded as made,
open questions at the bottom. What players do lives in `RULES.md`; the physical pieces in
`COMPONENTS.md`.

## Premise

Players are competing construction companies capitalizing on the turnaround of a major city. They
develop plots across neighborhoods and sell what they build; the mayor walks the city, trickling out
tax incentives that sway where it pays to build.

## Decided

- **City geometry** (2026-10-24; was a 4 × 4 matrix of ring neighborhoods, 128 plots): a **6 × 6
  matrix of blocks** on a 20 × 20in quad-fold board, plots split **1, 2, 2, 2, 2, 1** each way (5 ×
  5 per panel), so 2 × 2 blocks inside, 1 × 2 along the edges, 1 × 1 in the corners. Every block is
  a neighborhood. **Streets** between them are named **A–E** (west to east) and **1–5** (south to
  north); C and 3 run down the fold and cut, so they go unprinted. The mayor walks the streets and
  stands on intersections (rules TODO). **City Hall** is the C3 crossing: the 4 plots touching it
  are left out for a plaza, and the mayor starts there. **96 plots.**
- **Cones** (2026-10-17; replaced construction sites, Blocks and the Sell action); **workers** in
  RULES.md since 2026-10-19 (worker meeples for playtesting, same role): each player has
  **construction cones** in their color. A cone on a plot is a building under construction; it's the
  only thing a player owns on the board. Once the cone comes off, the building belongs to the city.
  - **3 cones each** at every player count (starting point): one or two speculative holds plus a
    working project. More players means fewer turns each, not more parallel projects. No limit per
    neighborhood: crowding cones into one neighborhood can block rivals out, and the mayor taxes
    every coned plot there once it's full.
  - **No passing**: with every cone out you must finish; with none out you must start something.
- **A turn is one decision** (principle, 2026-10-17): **choose one plot and move it one step
  forward**; its state decides the step (empty: break ground, picking the row tile or a Park; your
  project: finish and sell). How many cones a step uses is the plot's business, not a choice. The
  game's depth is combinatorial: which plot, and when. Keep new rules inside this shape.
- **Actions** (2026-10-17): a turn is **one action**, and there are only two: **place cones** (break
  ground) or **pick one up** (finish and sell). A build takes 1 cone, so two actions. Every payoff
  compares per action:
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
  incentives** (was tax breaks) and taxes speculation that sits in full neighborhoods. (Clearing
  blight the market won't went with the blight, 2026-10-25.) He **never pays anyone**: no
  activation, no rent.
- **Mayor movement**: inspired by _On the Underground_. **Two agenda cards are always face up**,
  each naming an intersection: **one card per intersection but City Hall** (24 since 2026-10-25; was
  16, one per neighborhood), named by its streets (D4), with a map of the street lines. The walker
  picks which one is his target; after the walk resolves, reveal a new card to make two again. So
  the player whose build triggers a walk also steers the mayor's agenda.
- **Scale**: one board at every player count; player count changes setup, not the map. Houses are
  countable at a glance.
- **Mayor walks; every neighborhood he _enters_ on the path is a visit** (not his start; the
  destination included): up to 6 on the 4 × 4 grid. On each visit, the first that applies:
  1. **Empty plot** there: he puts **one tax incentive** on one, always (stacking on a plot that
     already has one). Which plot barely matters, since value is read from the whole neighborhood:
     not meant to be a real decision. Whoever breaks ground on that plot takes it. Incentives are
     **ramp currency, not money** (see Victory and ramp).
  2. **Otherwise** (was 3, after a blight knockdown dropped 2026-10-25): he **taxes every company
     speculating there**: **1 coin per coned plot** they have in the neighborhood.
  - **Can't pay**: you lose **projects** (coned plots) **in the taxed neighborhood** (the ones
    bankrupting you; your pick) equal to the coins you can't pay, all their cones returning (tax and
    loss count plots, not cones, so a restore isn't hit twice), so you never go negative; you get
    kicked out. An **abandoned project is wiped**: its tile leaves the game and the plot is empty
    again. Punitive: the coins are gone. No rival gains a free building from it, and the reopened
    plot draws an incentive on the next visit instead of tax.
- **Park**: free filler build that **interlocks with housing**: "people want to live near parks".
  Parks **boost the sale value of Housing in their neighborhood**.
- **Walk**: an **L-shaped path** to the target (at most one turn), or a straight line when they
  share a row or column. The player whose build triggered the walk picks the target and the L.
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
  - **Row deck**: **78 tiles** (see Supply mix), more than the 62 any game draws, so each game sees
    a slightly different mix.
  - **Positive** buildings (was prefill) are **historical** parts of the city, on special base
    tiles. They **affect the value of buildings nearby** like any building, but you get **no credit
    for them when selling**. Capped at 18 so low counts aren't buried in setup.
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
  - **Setup cost**: 12–20 historical tiles plus a cube per historical House or Commercial. Tile
    stock: as many of each type as any 4 cards place (11 House / 8 Commercial / 4 Industrial), and
    up to 4 supply Parks.
- **Building row (mayor clock)** (2026-10-15; K 2026-10-17): building base tiles (House, Market, …)
  are bought from a face-up row of **N + 3** (N players: 8 / 7 / 6 / 5 tiles at 5 / 4 / 3 / 2
  players since 2026-10-25; was 7 / 6 / 6 / 5). A Park comes from its own open supply but discards
  one tile from the row. **If you leave 2 tiles in the row, walk the mayor, then refill it.** So the
  mayor walks once per K tiles taken, K = N + 1 (10 / 11 / 12 / 12 walks). Who triggers each walk,
  and when, varies: turns that don't take a tile (finishing) interleave, and K is never a multiple
  of the player count. The row also pushes players into builds they didn't plan, without capping how
  many of one type a player can build.
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

  | Type       | Cost | Sale                               | Floor | Best (cap)      |
  | ---------- | ---- | ---------------------------------- | ----- | --------------- |
  | Park       | 0    | 1                                  | +1    | +1              |
  | Housing    | 1    | 3, +1 per Park in its neighborhood | +2    | more with Parks |
  | Commercial | 2    | 2, +1 per demand cube taken        | 0     | +2 / +3 / +4 …  |
  | Industrial | 4    | 1, +3 per Commercial cube taken    | −3    | +3 / +6 / +9 …  |

  - **Cubes on the buildings** (2026-10-19: abstract demand, so plain cubes, sitting on the flipped
    tile; were hexes in the plaza 2026-10-18, shaped so they never read as plot squares): finishing
    a **House** puts a **demand cube** on its own tile; finishing a **Commercial** puts a
    **Commercial cube** (second color) on its tile. Finished tiles never move again, so a cube has a
    stable home, and the board shows which buildings' demand is still unmet. **Historical buildings
    put out their cubes at setup**, so at 2P and 3P an opening shop is a real option; at 4P and 5P
    Houses come first. The plaza is left to the mayor and the label.
  - **Taking cubes**: finishing a Commercial (Industrial), count the finished Commercials
    (Industrials) in its neighborhood, itself and historical ones included: **n**. It **must** take
    **up to 1 + n** cubes of the type below, **its own neighborhood first**, then **Commercial: the
    4 adjacent neighborhoods** (shoppers cross the street); **Industrial: its row and column**
    (freight lines, 7 neighborhoods). Taken cubes return to the supply. Nothing to calculate: look
    and pick up.
  - **Concentration**: a neighborhood's 1st shop takes up to 2, its 2nd up to 3, its 3rd up to 4:
    shopping districts (and industrial parks) pay, while depletion keeps shops competing for the
    same customers. First mover gets first pick but a small cap; later movers a bigger cap but fewer
    cubes left. A busy district can drain its neighbors.
  - **Ladder**: floors +2 / 0 / −3, per cube +1 / +3. Housing is safe; Commercial breaks even
    without demand and only beats a House from 3 cubes (a 2nd shop onward), so it's worth building
    from ~2 waiting cubes; Industrial is **rare and swingy** (breaks even at 1 cube, loses 3 at
    none), too dear to open with, and a rival's Industrial on your row or column can take the cubes
    you were waiting for.
  - Park +1 beats nothing; Housing +2 beats Park: the city pays you a little for Parks, Housing
    makes money. Parks lift every House in their neighborhood (a public good) but make no demand.
  - **Natural ratio**: balancing cube supply and demand, each level settles at **2–3 of the type
    below per building** (2 spread out, 3+ clustered), so Houses : Commercial : Industrial ≈ 4 : 2 :
    1 to 9 : 3 : 1; best guess **~5 : 2.5 : 1** (shops cluster, Industrials rarely share a
    neighborhood). Leftover cubes at game end are wasted demand.
  - **Supply mix** (2026-10-17, starting point): new construction is mostly Housing; shops and
    factories mostly come from **converting ruins**. A player who needs Commercial or Industrial and
    isn't seeing it in the row can always go convert a ruin.
    - **Row deck**: 78 tiles at **9 : 3 : 1** (54 House / 18 Commercial / 6 Industrial). 4–5P draw
      ~62 of it, 2P ~44, so the mix varies game to game.
    - **Historical**: the setup deck's 40 are **17 House / 15 Commercial / 4 Industrial / 4 Park**;
      a game places 12–20 of them (see Setup cards).
    - **Open** (2026-10-25): the old gut check leaned on restored blight to add shops and factories;
      with blight gone, every build comes from the row's 9 : 3 : 1, which it called far too
      Housing-heavy. Rebalance the row deck or lean on historical Commercial.
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
  is walked**. So walks = 15 − cards thrown out, as in the budget table. Then:
  1. **Final sale**: every player, the one who ended the game included, may finish one coned
     building at full value.
  2. **Firesale**: every other coned project sells for its **base sale value − 1** (never below 0;
     no Parks or cubes counted): House 2, Commercial 1, Industrial 0. Starting late costs a little
     but never ruins you, so construction keeps driving the end instead of play stopping when the
     deck gets thin.
- **Victory and ramp** (2026-10-17): **most money wins**. Two separate economies: coins are the
  score; **tax incentives** are what your company can do.
  - **Earning incentives**: break ground on a plot where the mayor left one; **finish a building in
    the mayor's current neighborhood** (influence with City Hall: the mayor rewards companies he
    sees delivering); later, Public services would pay mostly in incentives.
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

| Term            | Meaning                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| Company         | A player; a construction company.                                                          |
| Neighborhood    | A block of 1–4 plots; 36 in a 6 × 6 matrix, streets between them.                          |
| Plot            | One square of a block; holds one tile.                                                     |
| City Hall       | The C3 crossing, 4 plots left out round it for a plaza; the mayor starts there.            |
| Building        | A tile's finished side (House, shop, factory, Park); typed; earns when finished and sold.  |
| Tile            | 32mm, two-sided: construction (cost on a gold coin) and finished; bought from the row.     |
| Row             | The face-up building row, N + 3 tiles; the mayor walks when it's down to 2.                |
| Cone            | A player's marker on a project (3 each); comes off when it's finished.                     |
| Break ground    | Pay a tile's full cost, place it, and cone it: the first of a build's two actions.         |
| Finish          | Take your cone off, flip the tile, and sell it: the second action.                         |
| Historical      | A building placed at setup by a setup card; counts for neighbors, not sold.                |
| Setup card      | A quadrant's map of historical buildings, badged by player count; 4 dealt, one a quadrant. |
| Demand cube     | Put on a House's tile when it's finished; taken by Commercial sales.                       |
| Commercial cube | Put on a Commercial's tile when it's finished; taken by Industrial sales.                  |
| Mayor           | Pawn that walks the streets to an agenda target: hands out incentives, taxes.              |
| Agenda          | A card naming one intersection; two face up; the walker picks the target.                  |
| Walker          | The player whose build triggers a walk: steers the mayor, skips that walk's upgrades.      |
| Incentive       | Tax incentive: ramp currency (not money); spent on upgrades during walks.                  |
| Tax             | Where no plot is empty: 1 coin per coned plot, per company.                                |
| Credit rating   | An upgrade track; pays its level in coins to every player at each walk.                    |
| Upgrade         | Bought with incentives during a walk (not by the walker): credit, cones, later powers.     |
| Firesale        | After the final sale, unfinished projects sell for their base sale value − 1.              |

## Open

- **Historical tiles** (2026-10-19): row tiles finished side up (fiddly search by type), or their
  own tiles. Burgundy likely dropped.
- **Cones per project**: the construction side has room for a printed cone count; whether projects
  vary is undecided.

- **Upgrade menu** (to workshop; starter for testing): credit rating 1 step (max 3) for 2 / 3 / 4
  incentives, +1 coin per walk; +1 cone (max 5) for 3 incentives. Incentive supply: one per visited
  neighborhood with an empty plot (~3–4 a walk early), +1 per building finished in the mayor's
  neighborhood. Later: special powers, advanced buildings needing several cones. (Considered:
  trading a cone in for credit; not thematic.)
- **Industrial runaway**: capped by 1 + n and by Commercial cubes being scarce (one per shop), but
  +3 a cube makes the Commercial count in the deck and setup cards its strength dial. Watch 2P,
  where historical Commercials leave Commercial cubes at setup. Fallbacks: plus-shape reach (more
  busts), or a lower kicker.
- **Full-block lock** (2026-10-25): a player can cone a plot in a block and sit on it, holding the
  block's Houses hostage; the mayor's tax on full neighborhoods is the only pressure. Watch it.
- **Setup cards**: a draft of the 8 quadrant cards is in `setup/setupCards.ts` (printable at
  `/revival/cards`, dealt on screen at `/revival`); names are placeholders. Playtest them.
- **Streets and the mayor** (2026-10-24): he walks streets and stands on intersections; the agenda
  names intersections (2026-10-25), but the L-walk and visits are still written for the 4 × 4 ring
  city (which neighborhoods does a walk along a street visit?).
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

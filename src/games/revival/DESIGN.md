# Revival

Abstract stage. Working notes: **why** the game is the way it is; decisions are recorded as made,
open questions at the bottom. What players do lives in `RULES.md`; the physical pieces in
`COMPONENTS.md`.

## Premise

Players are competing construction companies capitalizing on the turnaround of a major city. They
develop plots across neighborhoods and sell what they build; the mayor walks the city, trickling out
tax incentives that sway where it pays to build.

## Decided

- **City geometry** (2026-10-17): a **4 × 4 matrix of neighborhoods** on a 20 × 20in quad-fold
  board, 2 × 2 per panel. Every neighborhood is a **ring of 8 plots** around an empty centre (the
  plaza, labelled with its coordinates A1–D4): 128 plots, 120 after the 8 parking lots. No Blocks or
  other groups of plots: a neighborhood is just its plots.
- **Cones** (2026-10-17; replaced construction sites, Blocks and the Sell action): each player has
  **construction cones** in their color. A cone on a plot is a building under construction; it's the
  only thing a player owns on the board. Once the cone comes off, the building belongs to the city.
  - **3 cones each** at every player count (starting point): one or two speculative holds plus a
    working project. More players means fewer turns each, not more parallel projects. No limit per
    neighborhood: crowding cones into one neighborhood can block rivals out, and the mayor taxes
    every coned plot there once it's full.
  - **No passing**: with every cone out you must finish (or knock down); with none out you must
    start something. Breaking ground takes a tile, but **coning a blight doesn't**, so restores (3
    tile-free turns each) let players delay the mayor. Bounded by the blight: at most ~90 such turns
    a game, shrinking as blight is restored or cleared. Watch whether restore-heavy play drags.
- **A turn is one decision** (principle, 2026-10-17): **choose one plot and move it one step
  forward**; its state decides the step (empty: break ground, picking the row tile or a Park;
  blight: cone it; your restore: knock it down; your project: finish and sell). How many cones a
  step uses is the plot's business, not a choice. The game's depth is combinatorial: which plot, and
  when. Keep new rules inside this shape.
- **Actions** (2026-10-17): a turn is **one action**, and there are only two: **place cones** (break
  ground) or **pick one up** (knock down, or finish and sell). A new build takes 1 cone, so two
  actions; a restore takes 2 cones, so three (see Blight). Every payoff compares per action:
  1. **Break ground**: put a tile on an empty plot, **pay its full cost** (base and building
     together), and put one of your cones on it:
     - a **base tile** (Housing / Commercial / Industrial) bought from the row;
     - a **Park** for 0 coins from the Park supply; it discards one tile from the row.
  2. **Finish and sell**: take your cone off, put the building on (no cost), and **sell it**: you're
     paid its sale value, read from the board **now**.
  - **Speculation** is the point of the split: break ground on a Commercial, see a rival's House
    coming nearby, and hold your cone until it's finished to sell higher. Only **finished**
    buildings count toward value; a coned base shows what's coming but counts for nothing yet.
    Holding sinks coins and a cone, and some values can fall while you wait.
  - No Uproot: finishing costs nothing, so no one gets stuck.
- **Mayor's role** (2026-10-15; 2026-10-17): he **turns the city around**: hands out **tax
  incentives** (was tax breaks), clears blight the market won't, and taxes speculation that sits in
  full neighborhoods. He **never pays anyone**: no activation, no rent.
- **Mayor movement**: inspired by _On the Underground_. **Two agenda cards are always face up**,
  each naming a neighborhood: **one card per neighborhood** (16; coordinates for now, names later).
  The walker picks which one is his target; after the walk resolves, reveal a new card to make two
  again. So the player whose build triggers a walk also steers the mayor's agenda.
- **Scale**: one board at every player count; player count changes setup, not the map. Houses are
  countable at a glance.
- **Mayor walks; every neighborhood he _enters_ on the path is a visit** (not his start; the
  destination included): up to 6 on the 4 × 4 grid. On each visit, the first that applies:
  1. **Empty plot** there: he puts **one tax incentive** on one, always (stacking on a plot that
     already has one). Which plot barely matters, since value is read from the whole neighborhood:
     not meant to be a real decision. Whoever breaks ground on that plot takes it. Incentives are
     **ramp currency, not money** (see Victory and ramp).
  2. **No empty plot but blight**: he **knocks one blight down**, **the walker's pick**, **even one
     a player has coned** (its black building and one of the player's cones come off, leaving a
     singly coned base: that player's first pick-up done for them). A blight nobody has coned is
     **removed from the board**, leaving an empty plot (the city clears the lot). The mayor takes
     matters into his own hands when the market won't. This also breaks the coned-blight lock on
     Housing once a neighborhood is full.
  3. **Neither**: he **taxes every company speculating there**: **1 coin per coned plot** they have
     in the neighborhood.
  - **Can't pay**: you lose **projects** (coned plots) **in the taxed neighborhood** (the ones
    bankrupting you; your pick) equal to the coins you can't pay, all their cones returning (tax and
    loss count plots, not cones, so a restore isn't hit twice), so you never go negative; you get
    kicked out. An **abandoned project is wiped**: its tile leaves the game and the plot is empty
    again (the same as the mayor clearing a blight nobody coned). Punitive: the coins are gone. No
    rival gains a free building from it, and the reopened plot draws an incentive on the next visit
    instead of tax. A coned blight can't be abandoned this way: while it stands, the mayor knocks it
    down rather than taxing.
- **Park**: free filler build that **interlocks with housing**: "people want to live near parks".
  Parks **boost the sale value of Housing in their neighborhood**.
- **Walk**: an **L-shaped path** to the target (at most one turn), or a straight line when they
  share a row or column. The player whose build triggered the walk picks the target and the L.
- **Build budget** (2026-10-17): **120 usable plots** (128, less 8 parking lots), the same at every
  player count. **Built + positive = 60** (half), and **blight + empty at peak = 60**, split **30 /
  30**: the board peaks **75% full**, leaving 30 empty plots (players feel there was more left to
  do, and the endgame never crunches down to a few legal plots). Blight holds its plot whether
  restored or not. (History: 100-plot board at 80% with 20 blight, builds 12 / 14 / 16 / 18; before
  that 70%.)

  | Players | Walk every K tiles | Builds each | Built | Walks | Agenda cards out | Positive | Blight | Empty |
  | ------- | ------------------ | ----------- | ----- | ----- | ---------------- | -------- | ------ | ----- |
  | 5       | 5                  | 12          | 60    | 12    | 3                | 0        | 30     | 30    |
  | 4       | 4                  | 15          | 60    | 15    | 0                | 0        | 30     | 30    |
  | 3       | 4                  | 16          | 48    | 12    | 3                | 12       | 30     | 30    |
  | 2       | 3                  | 21          | 42    | 14    | 1                | 18       | 30     | 30    |

  - **Agenda deck**: **16 cards**. One is revealed at setup to place the mayor, so at most **15
    walks**; walks = Built / K, and the extra cards are thrown out unseen.
  - **Built** (total builds = tiles taken from the row) is a floor on play time: turns that don't
    take a tile (open, finish, restore, sell) come on top. 10 or fewer builds per player is
    "comically low". 4P and 5P share a setup (no positive), so 4P runs as long as 5P in tiles.
  - **Row deck**: **78 tiles** (see Supply mix), more than the 62 any game draws, so each game sees
    a slightly different mix.
  - **Positive** buildings (was prefill) are **historical** parts of the city, on special base
    tiles. They **affect the value of buildings nearby** like any building, but you get **no credit
    for them when selling**. Capped at 18 so low counts aren't buried in setup.
  - **Setup cost**: blight 30 × 2 (tile and black building) + parking 8 + historical 0 / 12 / 18 × 2
    (tile and building) + a hex per historical House or Commercial (0 / 11 / 16) = **68 / 103 /
    120** pieces (4–5 / 3 / 2 players), split across players (see Setup cards). Cut if it drags:
    parking printed on the board (−8, but always in the same places). Not a cut: dropping wooden
    buildings anywhere (see V0 components).
- **Setup cards** (2026-10-17): the starting state is dealt, not printed. **8 blight cards** (every
  player count) and **8 historical (positive) cards** for 2–3P: one deck, its 3P buildings a badged
  subset of 2P's. Shuffle a deck and deal **one card to each of the 4 rows and 4 columns**, laid
  along the city's **west** (rows) and **north** (columns) edges; **historical cards along the east
  and south** (2026-10-18); entry 1 is the neighborhood nearest the card. A card lists 4 entries,
  one per neighborhood along its line, and each neighborhood takes its row card's entry and its
  column card's entry.
  - **Blight cards** carry the **30 blight** and the **8 parking lots** (one per card): everything
    that eats the city's land goes together. **Parking lots** are dead land, not plots: never
    developed, restored, taxed or counted by "every plot developed" checks. Entries list each
    piece's type (e.g. "House + Parking Lot", "2 House", "House + Commercial", "Factory"), **at most
    3 pieces**.
  - **Historical cards**: **at most 1** historical building per entry, its type listed: a historic
    main street, mostly Houses and Commercial (see Supply mix). **At 2P place all 18; at 3P only the
    12 with a burgundy "3" badge** (exactly 3 per entry position, so neither count favors a quarter
    of the city). One deck instead of a set per count.
  - **Where pieces go**: each line owns half of every ring. A **row** card fills the **top 3 plots**
    (blight, parking) and the **left-middle plot** (positive); a **column** card the **bottom 3**
    and the **right-middle**. The entry caps match, so nothing ever overflows, and every row and
    column can be resolved at once by different players.
  - Blight lands in **lines**: run-down avenues and hot crossings where two heavy cards meet, not
    blobs. Simulated with lumpy cards (3300, 3210, 3100, …): ~5 clean neighborhoods and ~2–3 with 4+
    blight per game. Where a card's weight sits sets the city's geography: heavy ends decay the
    edges, heavy middles decay downtown. Cards are read from a fixed edge, so a set must **mix
    front-, middle- and back-loaded cards**: an all-front-loaded set rots the north-west every game
    (3.6 blight per neighborhood there vs. 0.1 in the south-east); a mixed set (3300, 0123, 0310,
    0022, 3000, 0012, 0200, 0002) is as uneven with no bias. (Rejected: an epicentre stamp and a
    street-walking automaton; both cluster more but need a spill rule in most games, and the walker
    always rots the centre.)
- **Building row (mayor clock)** (2026-10-15; K 2026-10-17): building base tiles (House, Market, …)
  are bought from a face-up row of **K + 2** (K = 5 / 4 / 4 / 3 at 5 / 4 / 3 / 2 players: 7 / 6 / 6
  / 5 tiles). A Park comes from its own open supply but discards one tile from the row. **If you
  leave 2 tiles in the row, walk the mayor, then refill it.** So the mayor walks once per K tiles
  taken (12 / 15 / 12 / 14 walks). Who triggers each walk, and when, varies: turns that don't take a
  tile (finishing, restoring) interleave, and at 3P and 2P K isn't a multiple of the player count.
  The row also pushes players into builds they didn't plan, without capping how many of one type a
  player can build.
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
  | Commercial | 2    | 2, +1 per demand hex taken         | 0     | +2 / +3 / +4 …  |
  | Industrial | 4    | 1, +3 per Commercial hex taken     | −3    | +3 / +6 / +9 …  |

  - **Hexes in the plazas** (what the hole is for; hexagonal tokens, were cubes until 2026-10-18, so
    they never read as plot squares): finishing a **House** puts a **demand hex** in its
    neighborhood's plaza; finishing a **Commercial** puts a **Commercial hex** (second color) in its
    plaza. **Historical buildings put out their hexes at setup**, so at 2P and 3P an opening shop is
    a real option; at 4P and 5P Houses come first.
  - **Taking hexes**: finishing a Commercial (Industrial), count the finished Commercials
    (Industrials) in its neighborhood, itself and historical ones included: **n**. It **must** take
    **up to 1 + n** hexes of the type below, **its own plaza first**, then **Commercial: the 4
    adjacent plazas** (shoppers cross the street); **Industrial: its row and column** (freight
    lines, 7 plazas). Taken hexes return to the supply. Nothing to calculate: look and pick up.
  - **Concentration**: a neighborhood's 1st shop takes up to 2, its 2nd up to 3, its 3rd up to 4:
    shopping districts (and industrial parks) pay, while depletion keeps shops competing for the
    same customers. First mover gets first pick but a small cap; later movers a bigger cap but fewer
    hexes left. A busy district can drain its neighbors' plazas.
  - **Ladder**: floors +2 / 0 / −3, per hex +1 / +3. Housing is safe; Commercial breaks even without
    demand and only beats a House from 3 hexes (a 2nd shop onward), so it's worth building from ~2
    waiting hexes; Industrial is **rare and swingy** (breaks even at 1 hex, loses 3 at none), too
    dear to open with, and a rival's Industrial on your row or column can take the hexes you were
    waiting for.
  - Park +1 beats nothing; Housing +2 beats Park: the city pays you a little for Parks, Housing
    makes money. Parks lift every House in their neighborhood (a public good) but make no demand.
  - **Natural ratio**: balancing hex supply and demand, each level settles at **2–3 of the type
    below per building** (2 spread out, 3+ clustered), so Houses : Commercial : Industrial ≈ 4 : 2 :
    1 to 9 : 3 : 1; best guess **~5 : 2.5 : 1** (shops cluster, Industrials rarely share a
    neighborhood). Leftover hexes at game end are wasted demand.
  - **Supply mix** (2026-10-17, starting point): new construction is mostly Housing; shops and
    factories mostly come from **converting ruins**. A player who needs Commercial or Industrial and
    isn't seeing it in the row can always go convert a ruin.
    - **Row deck**: 78 tiles at **9 : 3 : 1** (54 House / 18 Commercial / 6 Industrial). 4–5P draw
      ~62 of it, 2P ~44, so the mix varies game to game.
    - **Blight**: 30 at **8 House / 12 Commercial / 10 Industrial** (dead storefronts and
      factories). Converting one also releases its neighborhood's Housing.
    - **Historical**: 2P's 18 are **10 House / 6 Commercial / 2 Industrial**; 3P's badged 12 are **7
      / 4 / 1**.
    - Gut check, assuming **about half the blight is restored**: 5P builds ~47 / 20 / 10 (4.7 : 2 :
      1), 2P ~44 / 22 / 10 (4.4 : 2.2 : 1), both near the natural ratio; the deck alone would be far
      too Housing-heavy. The half-restored guess is what a simulation should pin down. Every unconed
      blight the mayor clears is a lost conversion, so heavy clearing starves Industrial.
  - **Blight**: Housing can't be finished while blight stands in its neighborhood; **Industrial
    ignores blight** (run-down land is cheap); Commercial open.
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
- **Blight** (2026-10-16; 30 and the cone flow since 2026-10-17): the city starts with **30 blighted
  buildings at every player count**, dealt by the blight setup cards. Each is a **black wooden
  building** of its type standing on a single-sided **blight tile** (split black and the type's
  color). The game swaps buildings, it never flips tiles: a restored building stands on a tile that
  still shows its blight past (a bit of history; no rule reads it). Its type steers what gets built
  where. **Restoring** is **slower but cheaper** than building new, so cash-poor players restore and
  cash-rich players build new:
  1. **Cone a blight** (one action): pay its type's cost **minus 1** and put **two** of your cones
     on it (you need 2 free).
  2. **Knock it down** (pick up one cone): take the black building off with it; the tile beneath,
     still coned once, is now an ordinary coned base.
  3. **Finish** as usual (pick up the last cone): put the building on, sell.

  Three actions to a new build's two, for 1 coin off (and 2 cones tied up until the knockdown, a
  real capacity cost: if nobody restores in playtests, raise the discount): the worth of an action
  (a basic House earns +2 in two), so neither dominates; a blighted House restores for free, a
  safety valve for a broke player. A restore takes no tile, so it doesn't move the mayor clock. Slow
  restores, and the firesale's −1 on unfinished projects, make restoring an early-game move.
  (Half-price restores were rejected: restored Commercial and Industrial would beat new ones per
  action.)
  - **Housing can't be finished while any blight stands in its neighborhood** (a coned blight still
    counts until knocked down). You may still cone a House there, speculating that someone clears
    it. A knockdown is public: it can release every player's Housing in the neighborhood. Restores
    chain: a blighted House can't be finished while other blight stands there.
  - With lumpy setup cards only ~5 of 16 neighborhoods start clean, so early Housing sales are
    confined to ~40 plots until people knock down; card lumpiness sets this. Watch in playtest.
  - Higher player counts get crowded (few good plots); at lower counts positive buildings take up
    the space instead.
- **Game end** (2026-10-15; cones 2026-10-17; scoring 2026-10-17): the game ends on the **last mayor
  walk** (agenda deck runs out: the mayor's term ends), including that walk's visits. With two cards
  face up, the last walks use them up (the choice narrows from two to one): **every agenda card seen
  is walked**. So walks = 15 − cards thrown out, as in the budget table. Then:
  1. **Final sale**: every player, the one who ended the game included, may finish one coned
     building at full value.
  2. **Firesale**: every other coned project sells for its **base sale value − 1** (never below 0;
     no Parks or hexes counted): House 2, Commercial 1, Industrial 0. Starting late costs a little
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

| Term           | Meaning                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Company        | A player; a construction company.                                                                     |
| Neighborhood   | A ring of 8 plots around a plaza; 16 in a 4 × 4 matrix, A1 bottom-left.                               |
| Plot           | One square of a ring; holds one building.                                                             |
| Plaza          | A neighborhood's empty centre: its label, and its demand and Commercial hexes.                        |
| Building       | A wooden token (House, shop, factory, tree) on a tile; typed; earns when finished and sold.           |
| Base tile      | 30mm typed tile a building stands on; bought from the row, cost on a gold coin.                       |
| Row            | The face-up building row, K + 2 tiles; the mayor walks when it's down to 2.                           |
| Cone           | A player's marker on a project (3 each): 1 on a new build, 2 on a restore; one comes off per pick-up. |
| Break ground   | Pay a tile's full cost, place it, and cone it: the first of a build's two actions.                    |
| Finish         | Take your cone off, put the building on, and sell it: the second action.                              |
| Blight         | A black building on a blight tile; blocks Housing sales in its neighborhood.                          |
| Restore        | Put 2 cones on a blight (cost − 1); pick-ups knock it down, then finish it: three actions.            |
| Knock down     | Take a blight's black building off with one of its cones; by a player or the mayor.                   |
| Historical     | A building placed at setup (2–3P); burgundy split tile; counts for neighbors, not sold.               |
| Parking lot    | Dead land from the blight cards; not a plot.                                                          |
| Demand hex     | Put in the plaza when a House is finished; taken by Commercial sales.                                 |
| Commercial hex | Put in the plaza when a Commercial is finished; taken by Industrial sales.                            |
| Mayor          | Pawn that walks to an agenda target: hands out incentives, knocks down blight, taxes.                 |
| Agenda         | A card naming one neighborhood; two face up; the walker picks the target.                             |
| Walker         | The player whose build triggers a walk: steers the mayor, skips that walk's upgrades.                 |
| Incentive      | Tax incentive: ramp currency (not money); spent on upgrades during walks.                             |
| Tax            | Where no plot is empty and no blight stands: 1 coin per coned plot, per company.                      |
| Credit rating  | An upgrade track; pays its level in coins to every player at each walk.                               |
| Upgrade        | Bought with incentives during a walk (not by the walker): credit, cones, later powers.                |
| Firesale       | After the final sale, unfinished projects sell for their base sale value − 1.                         |

## Open

- **Upgrade menu** (to workshop; starter for testing): credit rating 1 step (max 3) for 2 / 3 / 4
  incentives, +1 coin per walk; +1 cone (max 5) for 3 incentives. Incentive supply: one per visited
  neighborhood with an empty plot (~3–4 a walk early), +1 per building finished in the mayor's
  neighborhood. Later: special powers, advanced buildings needing several cones. (Considered:
  trading a cone in for credit; not thematic.)
- **Restore numbers**: the 1-coin discount is provisional (restores cost 0 / 1 / 3). When the next
  agenda card is revealed (right after each walk?).
- **Industrial runaway**: capped by 1 + n and by Commercial hexes being scarce (one per shop), but
  +3 a hex makes the Commercial count in the deck, blight and historical cards its strength dial.
  Watch 2P, where historical Commercials leave Commercial hexes at setup. Fallbacks: plus-shape
  reach (more busts), or a lower kicker.
- **Blight and Commercial**: Housing is blocked and Industrial ignores blight (decided); Commercial:
  lean ignore it for the first playtest (one blight rule), else a value drag.
  - The lock: a player can cone a blight and never knock it down, holding a neighborhood's Housing
    hostage; capped by the mayor knocking blight down once the neighborhood is full. Accepted as
    interaction for now.
- **Setup cards**: drafts of the 8 blight and 8 historical cards are in `setup/` (printable at
  `/revival/cards`); street names are placeholders. Playtest them.
- **Public services**: pay mostly in tax incentives (decided direction); costs and amounts
  undecided.
- Graph topology: settled as a 4 × 4 matrix with orthogonal adjacency (2026-10-17).
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
  simulation once the setup cards exist, especially the share of blight restored. Public services'
  share; how to let a game run housing-heavy or civic-heavy without the designer fixing one ratio.

## Known tensions

- Insolvency (lose cones) only fires if tax can actually exceed a purse; at 1 coin per coned plot it
  rarely will. An abandoned project's tile is wiped, but it was never a finished building, so
  finished buildings are never removed.

# Regolith

Working title. A **worker-placement** game about **material science on another planet**, built
around one mechanism: placing a worker and getting it back are **separate moments**, and a single
shared clock decides when the second one comes. The higher a worker sits, the longer it waits and
the better it is paid.

This is the third shape of the game. The hex-tile colony builder (last at commit `e653fa8`) was
replaced by eleven silos with per-silo time markers that players ticked by hand (last at commit
`731e222`); that board is now folded into **three tracks under one level marker** that ticks itself
once a round.

## Theme

Each player runs a **materials lab** on a barren world. Nothing here is found — everything is
_processed_: regolith is dug, water is cracked out of it, metal and chemicals are refined from
those, and food (really biomatter) is grown from water. The lab is organised as three engineering
disciplines — **Physical**, **Chemical**, **Bio** — and each discipline is a track that climbs from
raw extraction to a thing the lab can own: a machine, a building, a battery, a life support system.

The planet is small and the infrastructure is shared. Every process runs in a space anyone can use,
and a lab's edge is **timing** — reading the clock, knowing which spaces are about to close, and
placing where the wait is worth it. What a lab _can_ own is bolted onto a space for everyone to use:
a **machine** or **battery** that makes a space yield more, a **life support system** that lets a
second worker in. The owner's reward is the **kicker**: it runs that space for free.

The labs are an **advance party**. The settlers are already on their way, and what is finished
before they land is what counts: every **Victory Point (VP)** is infrastructure handed over ready to
use, whether a building visit or a stockpile contributed to the common store.

## Goods

Six goods. Every player holds all six in an open supply. Values are the design yardstick, not a
printed number: recipes are written against this table, so a space can be checked by adding up each
side.

| Good     | ~Value | Source                 | Notes                                   |
| -------- | ------ | ---------------------- | --------------------------------------- |
| Energy   | 1      | Chem I–III             | Secondary input to most processes       |
| Rock     | 2      | Phys I–II              | Build material; feeds metal & chemicals |
| Water    | 3      | Bio I–II               | Feeds chemicals, food & life support    |
| Metal    | 4      | Phys III (rock)        | Machines; Phys V; most buildings        |
| Chemical | 5      | Chem IV (rock + water) | Batteries; Biolab, Foundry              |
| Food     | 6      | Bio III (water)        | Workers; life support; three buildings  |

- **Every goods space is positive-sum.** Tiers I–III ladder **+4 / +5 / +6** on every track, so
  height is paid for with wait, not with a worse deal.
- **Machines, buildings, batteries, workers and life support are not goods.** They are things you
  own, made at tiers IV and V (see Upgrades). Neither are **VP**, which buildings and contributions
  pay out (see Buildings, Contributions).

### The three tracks

| Tier | Physical                               | Net  | Chemical                                 | Net  | Bio                                        | Net  |
| ---- | -------------------------------------- | ---- | ---------------------------------------- | ---- | ------------------------------------------ | ---- |
| V    | 1 Metal + 2 Rock + 2 Energy → Building | (10) | 1 Rock + 1 Water + 1 Chemical → Battery  | (10) | 1 Food + 1 Water + 1 Energy → Life Support | (10) |
| IV   | 1 Metal + 2 Energy → Machine           | (6)  | 1 Rock + 1 Water + 2 Energy → 3 Chemical | +8   | 1 Food → +1 Worker                         | (6)  |
| III  | 1 Rock → 2 Metal                       | +6   | — → 6 Energy                             | +6   | 2 Water → 2 Food                           | +6   |
| II   | 1 Energy → 3 Rock                      | +5   | — → 5 Energy                             | +5   | 4 Energy → 3 Water                         | +5   |
| I    | — → 2 Rock                             | +4   | — → 4 Energy                             | +4   | 2 Energy → 2 Water                         | +4   |

Numbers in parentheses are the input value of a space that yields a thing rather than goods. The
three tracks are deliberately the same shape: three goods tiers, a **make** at IV for about 6, a
**build** at V for about 10. Chemical IV is the odd one — it is the only source of chemicals, so it
pays goods (net +8, the top of the ladder) instead of a thing, and the track's thing comes only at
V.

**Rock and Energy are free.** Phys I and all of Chem I–III cost nothing, which is what a player with
an empty supply does. Water is the first thing that costs energy, and everything above tier II needs
something from another track.

**Chemical IV is the only chemical source.** Three inputs from three tracks for 3 Chemical; a
battery on it pays 4. Every battery in the game passes through this one space.

## Board: Tracks and the Level Marker

The board is three **tracks** of five **spaces**, stacked I (bottom) to V (top), a fourth
**Buildings column** of five empty slots that fill as buildings are built, one **level marker** on a
track of its own, printed beside them and aligned with the tiers, and a **contribution board** that
takes goods instead of workers (see Contributions). Each space prints a **cost** (goods paid to
enter) and a **yield** (what the worker brings home), plus slots for the things that can be built on
it.

There are no per-track clocks. The level marker is the only clock, and it moves once per round for
everyone.

- **Level.** The marker sits on a tier, I to V. A round is played at that level.
- **Locked rows.** Every row **below** the marker is **locked**: no worker may be placed there. At
  level III, tiers I and II are closed on all three tracks.
- **Open spaces.** Any empty, unlocked space is open. A worker may be placed in **any** open space
  its owner can pay for — there is no forced-lowest rule. Choosing a high space is choosing a long
  wait.
- **Bump.** At the end of the round the marker climbs one tier. Every worker on the row it
  **leaves** is **bumped**: it returns to its owner with the space's yield, and that row locks
  behind it.
- **Reset.** The climb out of tier V bumps the top row and puts the marker back on tier I. Every row
  unlocks at once. That is one **cycle**: five rounds.
- **Wait.** A worker placed on tier _r_ while the marker is on level _L_ comes home after _r − L +
  1_ rounds. In round 1 of a cycle a worker on Phys I is back next round and a worker on Phys V is
  out for five. In round 5 only row V is open, and a worker placed there is back next round.

The open board shrinks as the cycle runs: 15 spaces at level I, then 12, 9, 6, and 3 at level V
(plus whatever buildings stand in the fourth column). The crunch is the design. Early in a cycle
everything is open and the question is how long you can stand to wait; late in a cycle almost
nothing is open and the question is whether you took the top spaces while they were cheap to wait
for. See Design Tensions.

## Round Structure

1. **Place.** Starting with the start player and going clockwise, each player in turn **places as
   many workers as they can afford**, one at a time, then the next player goes. Each placement is
   into an empty, unlocked space; **pay that space's cost immediately** from your supply. Can't pay,
   can't place. A player may stop with workers in hand. A player who places **no worker** this turn
   — by choice, or because every worker they own is out — may instead make **one contribution** (see
   Contributions). Place or contribute, never both.
2. **Tick.** Move the level marker up one tier. Bump the row it left (workers home, yields paid,
   upgrade markers placed — see Upgrades). If it left tier V, reset it to tier I.
3. **Pass the start marker** clockwise.

Paying on placement is the fundamental idea of the game: the cost is sunk before the yield arrives,
and the yield's arrival is fixed by the clock, not by anything you do after.

A player's whole placement happens before the next player's, so **the start player sees a full board
and the last player sees the leftovers**. The start marker rotating every round is what pays that
back.

**Game end.** The marker resets four times: **4 cycles, 20 rounds.** Most VP wins (see End &
Players).

## Upgrades

Tiers IV and V make things you own. Every one follows the same pattern as a goods space: place, pay,
wait, bump. The thing you made takes effect **when the worker is bumped**, not when it was placed —
one rule for every space.

- **Machine (Phys IV)** — `1 Metal + 2 Energy`. On placement, name an **empty machine slot** on any
  tier **I or II** space. On bump, put your marker in it. The space is now machined for
  **everyone**: every worker bumped from it takes **+1 of the space's yield good** (Phys I pays 3
  Rock, Chem II pays 6 Energy, Bio II pays 4 Water). **Kicker:** you enter that space **free** — no
  cost at all. Everyone else pays the printed cost. There is no toll; a machine is clunky, and once
  it is bolted down anyone can use it. One machine slot per space.
- **Life Support (Bio V)** — `1 Food + 1 Water + 1 Energy`. On placement, name an **empty life
  support slot** on any space of tier **I to IV**. On bump, put your marker in it. The space now has
  a **second worker slot**, open to **anyone**. The **second worker** on the space pays the cost
  **plus 2 Energy** to the supply — running two crews is not free — and both are bumped together.
  **Kicker:** you enter that space **free**, surcharge included. One life support per space, so a
  space holds at most two workers. The surcharge is printed in every life support cell as a
  reminder; nothing is owed to the owner.
- **Recruit (Bio IV)** — `1 Food`. On bump, take a **new worker**; it can be placed from the next
  round.
- **Building (Phys V)** — `1 Metal + 2 Rock + 2 Energy`. On placement, take an **unbuilt building**
  tile and put it in an **empty row** of the Buildings column **at once** — the one upgrade that
  does not wait for the bump, because there is nothing to hold: nobody owns a building. It is now a
  space (see Buildings). The worker waits out its row like any other. Five buildings, five rows:
  Phys V is dead once all are built.
- **Battery (Chem V)** — `1 Rock + 1 Water + 1 Chemical`. A machine for the upper tiers. On
  placement, name an **empty battery slot** on any tier **III or IV** space. On bump, put your
  marker in it. Every worker bumped from that space takes **+1 of its yield**: Phys III pays 3
  Metal, Chem IV pays 4 Chemical, Bio III pays 3 Food — and on the thing-spaces, **a second copy of
  the thing**: Recruit hands back **two workers**, Machine builds **two machines**. **Kicker:** you
  enter that space free. One battery slot per space. (Name still open: battery, power supply, fuel.)

A building has no owner. A space with both a booster and a life support has two owners, and each of
them enters it free. A space's kicker is the only thing an owner gets that others do not: the bonus
and the second slot are for the table.

**Cascades are intended.** A battery on Bio IV makes every recruit a double recruit; a battery on
Phys IV makes every machine two machines, each of which can sit on a free space. The game is short
(20 rounds) and the spaces are scarce, so the question is whether the cascade has time to run away.

## Buildings

Five **special buildings**, each a converter that turns two goods from two different tracks, plus
energy, into **1 VP**. They start off the board as tiles; Phys V puts one into the Buildings column,
and from then on it is a space like any other: anyone may place a worker there, pays the recipe on
placement, waits for the level marker like everyone else, and is bumped with 1 VP. **Nobody owns a
building** and nobody enters it free — the builder's edge is choosing what gets built and where, and
being first to know. Buildings take **no** booster and **no** life support: one worker, 1 VP per
visit.

| Building     | Recipe                          | Value |
| ------------ | ------------------------------- | ----- |
| Habitat      | 1 Metal + 1 Food + 2 Energy     | 12    |
| Biolab       | 1 Chemical + 1 Food + 1 Energy  | 12    |
| Pump Station | 1 Metal + 2 Water + 2 Energy    | 12    |
| Foundry      | 1 Metal + 1 Chemical + 3 Energy | 12    |
| Greenhouse   | 1 Food + 2 Rock + 2 Energy      | 12    |

**Every building VP costs 12** in goods, plus a worker's wait. The recipes differ in which tracks
they lean on, not in price, so the building a player wants is the one whose inputs their lab already
makes. Names are provisional.

**The builder chooses the row.** A building's wait is whatever tier it sits in, and rows lock like
any other: a Habitat in row I is open one round a cycle and pays out next round; in row V it is open
every round of the cycle to anyone who can bear the wait. Which row is the right one is meant to be
a real decision, and a way for the builder to shape who else can afford to use it.

## Contributions

The second way to score, and the only thing a player can do on a turn without placing a worker. The
**contribution board** is four tracks **shared by the table**, one per storable good — Energy,
Metal, Chemical, Food — each five **steps** long, with an escalating price per step and a payout per
step that is the same on every track.

| Step | Energy | Metal | Chemical | Food | VP |
| ---- | ------ | ----- | -------- | ---- | -- |
| 5    | 25     | 6     | 6        | 6    | 5  |
| 4    | 20     | 5     | 5        | 5    | 3  |
| 3    | 15     | 4     | 4        | 4    | 2  |
| 2    | 10     | 3     | 3        | 3    | 1  |
| 1    | 5      | 2     | 2        | 2    | 1  |

- **Who.** On your turn in the Place step, if you place **no worker** — because you choose not to,
  or because every worker you own is out on the board — you may make **one** contribution instead.
  Place or contribute, never both, and never more than one contribution a round.
- **How.** Pick a track. Pay its **lowest unfilled step** in full, from your supply, to the bank.
  Put your disc on that step and take its VP at once. Can't pay the lowest step, can't contribute to
  that track.
- **Shared and ordered.** The tracks are the table's, not yours. Steps fill from step 1 up — left to
  right as the board prints them — whoever fills them: the first Metal contributor pays 2 for 1 VP,
  the fifth pays 6 for 5 VP. A track with all five discs is closed.
- **Rock and Water cannot be contributed.** They are intermediate goods; the store takes only what a
  lab has finished.

**Cost per VP**, by the value table (Energy 1, Metal 4, Chemical 5, Food 6), with a building visit
for comparison:

| Step | Energy | Metal | Chemical | Food | Building  |
| ---- | ------ | ----- | -------- | ---- | --------- |
| 5    | 5      | 4.8   | 6        | 7.2  |           |
| 4    | 6.7    | 6.7   | 8.3      | 10   |           |
| 3    | 7.5    | 8     | 10       | 12   |           |
| 2    | 10     | 12    | 15       | 18   |           |
| 1    | 5      | 8     | 10       | 12   | 12 + wait |

Three things fall out. **Energy is the cheapest VP in the game**, 5 to 10 per point, and Chem I–III
make it for nothing; the Energy track is the glut's drain. **Step 2 is the worst deal on every
track** — the same 1 VP as step 1 for more goods — so whoever fills it is paying to open steps 3 to
5 for the table. **A contribution costs a whole turn**: the price on the board is goods, but the
real price is every placement not made that round, which is nothing at level V with all workers out
and a great deal at level I. There are **48 VP** on the contribution board, 12 per track.

## Components & Information

- **Board:** three tracks of five spaces, a **Buildings column** of five empty slots, a **level
  track** of five tiers with a cycle counter, and a **contribution board** of four tracks of five
  steps.
- **Building tiles:** five, cut out, kept beside the board until built. **VP tokens** for building
  payouts; contributions are scored from the discs on the board.
- **Level marker:** one 16mm disc. **Cycle marker:** one small cube on the counter.
- **Start marker.**
- **Workers** per player: 2 to start, more from Recruit.
- **Machine**, **battery** and **life support markers** per player, placed in the printed slots when
  the making worker is bumped. Buildings need no marker.
- **Contribution discs** per player, in player colour: about five.
- **Goods** as cubes or a tracked supply — all six held openly.
- **All information is open**: supplies public, every space's cost and yield printed, the marker's
  level visible. There is nothing hidden; the game is in reading how many rounds a space costs right
  now.

## Setup

- Level marker on tier I, cycle marker on 1. Every slot empty; the five building tiles beside the
  board; the contribution board empty.
- Each player: **2 workers**, **3 Energy**, nothing else. Three energy is enough for Bio I (2 Energy
  → 2 Water) or Phys II (1 Energy → 3 Rock) on turn one, so nobody is locked into the free spaces.
- Choose a start player.

## End & Players

- **Player count:** 2–4 to try; the board has 15 spaces and no forced placement, so 4 players × 2
  workers fills half of it in round 1.
- **End trigger:** 4 cycles (20 rounds), fixed.
- **Scoring:** most **VP** wins. VP come from building visits (1 each, taken on bump) and from
  contributions (the VP of every step holding your disc). Tie: more goods by value. Provisional —
  boosters, life supports and buildings built score nothing; watch whether they should.

## Design Tensions to Watch

- **Late-cycle crunch.** Rounds 4 and 5 of a cycle have six and three open spaces. Contributions are
  the intended outlet: a player with nothing to place still has a turn. Watch whether that is
  enough, or whether players still sit for two rounds every cycle. If dead: let a worker be placed
  on a locked row for a reduced yield, or shorten the cycle.
- **Round 5 as a gift.** At level V the top row is a one-round wait for the same price it was a
  five-round wait in round 1. Watch whether tier V is only ever taken in round 5, which makes the
  build spaces a once-a-cycle race for the start player.
- **Start player advantage.** A player places all their workers before the next player sees the
  board. Watch whether going first in round 1 or round 5 decides too much, even with rotation.
- **Free placement vs height.** Nothing forces a worker up. Watch whether tier I is always correct
  early (short wait, positive value) and the higher goods tiers are only used when the low rows lock
  — in which case the +5 / +6 ladder is not steep enough.
- **Energy glut.** Chem I–III pay 4 / 5 / 6 for nothing. Watch whether energy ever constrains anyone
  after round 2, and whether the energy prices on Water, Machine and Life Support are decoration.
- **Machine on a free space.** A machine on Phys I or Chem I costs 6 in inputs and pays its owner a
  free +1 space forever, with no toll. Watch whether the first machine is simply correct and whether
  the placement choice is real or always "the free space".
- **Second-slot surcharge.** The second worker on a life support space pays 2 Energy extra. Watch
  whether that is enough to make the owner's free entry matter, or so much that the second slot goes
  unused by anyone but the owner — which would make life support a private bay again.
- **Kicker vs sharing.** Everyone gets the bonus and the slot; only the owner gets it free. Watch
  whether owners resent rivals using their machine, and whether the free entry alone pays back the
  6–10 spent.
- **Recruit at 1 Food.** A third worker costs 1 Food (6 in value) and a Bio IV wait. Watch whether
  everyone recruits every cycle and worker count runs away, or whether food is scarce enough that it
  is a real choice.
- **Chemical IV as the bottleneck.** The only route to chemicals, so every battery goes through it.
  Watch whether it is contested every round it is open, and whether a life support or battery on it
  is the best build.
- **Battery cascades.** A battery on Recruit doubles workers; on Machine, doubles machines. Watch
  whether the first battery decides the game, whether it always lands on Bio IV, and how many
  workers a player holds by cycle 3. If it runs away: the +1 on a thing-space becomes +1 of a good
  instead.
- **Building row choice.** The builder picks a building's tier. Watch whether row I (cheap, once a
  cycle) or row V (always open, long wait) is simply correct, and whether builders place to help
  themselves or to shut rivals out.
- **Building for nothing.** The builder pays 10 and gets no kicker; the building is as much a
  rival's as theirs. Watch whether anyone builds, or whether Phys V waits for someone else to go
  first.
- **Energy as the cheap VP.** Energy steps cost 5 to 10 value per VP against 12 for a building
  visit, and energy is free. Watch whether the Energy track fills first every game and whether
  anyone bothers with Food's. If so: steepen Energy (5 / 10 / 20 / 30 / 40) or raise the others'
  payout.
- **Step 2 is a tax.** Same VP as step 1 for more goods. Watch whether every track stalls at step 2
  with nobody willing to open it, or whether someone always blinks. If it stalls: pay 1 / 2 / 3 / 4
  / 5, or let step 2 pay 2.
- **Contributing instead of placing.** Watch whether anyone contributes with workers in hand early
  in a cycle, or whether it is only ever the level-V move for players with everything out. The
  latter is fine as a valve; it is not fine if round 5 is a free 5 VP for whoever happens to be
  idle.
- **The 5 VP step.** Twenty-five energy or six of a good for 5 VP is the best deal on the board and
  it comes last. Watch whether players hoard for it, and whether steps 3 and 4 are filled only to
  reach it.
- **Buildings vs contributions.** A building visit is 12 goods plus a wait for 1 VP; every
  contribution step but step 2 is cheaper per VP, and it costs no worker. Watch the VP split at the
  end of the game. If buildings are never visited: pay 2 VP a visit, or give the builder a VP.

## Playtest Log

- **2026-09-08, 2 players.** Silo design. Played until each side had one machine; about forty
  minutes; far too slow. Ladder doubled, silos shortened, covers removed.
- **2026-09-09, three design passes (no play).** Silo design: structure cards dropped, bays built by
  Construction, upgrade prices halved, specialist defined, special projects cut. Every zone 1 tick.
- **2026-09-11, redesign (no play).** Eleven silos and their per-silo time markers replaced by three
  five-space tracks under one **global level marker** that ticks once a round. Rows below the marker
  lock; the climb out of V resets. Placement is free-choice; a player places all they can afford,
  then the next player. Diversification rule, advance action, bays, polymers, specialists, paying
  with time, tolls and the reset bonus all dropped. Machine = +1 yield on a tier I–II space; Life
  Support = second slot on a tier I–IV space; the owner of either enters that space free. Building
  and Battery are named blanks. 4 cycles = 20 rounds. Start: 2 workers, 3 Energy.
- **2026-09-11, second pass (no play).** Battery defined as the tier III–IV machine: +1 of the
  space's yield, a second copy on thing-spaces (two workers, two machines), owner enters free.
  Chemical IV retuned from `2 Chemical + 4 Energy` to `3 Chemical` (+8) so the track's energy stays
  on tiers I–III.
- **2026-09-11, third pass (no play).** Second worker on a life support space pays 2 Energy extra to
  the supply; owner still free. Printed in the life support cell.
- **2026-09-11, fourth pass (no play).** Five special buildings: Phys V builds one into a fourth
  column, owner's choice of row; each is a shared space converting two goods plus energy into a
  Progress Card. Recipes tuned to 12 value each; card undefined.
- **2026-09-11, fifth pass (no play).** Buildings have no owner and no kicker; Phys V places the
  tile at once on placement. Owner square dropped from the tiles.
- **2026-09-11, sixth pass (no play).** Progress Card replaced by a flat **1 VP** per building
  visit. **Contributions** added: four shared tracks (Energy 5–25, Metal / Chemical / Food 2–6) of
  five steps paying 1 / 1 / 2 / 3 / 5 VP, filled bottom-up, one per turn, only by a player who
  places no worker that turn. Scoring is now most VP.

## Prototype (v0)

Print-and-play pages live in `src/games/regolith`. `domain.ts` encodes the goods, values and tracks;
everything below renders from it, so a retune is a data change.

- **Track board** (`/regolith/print/board`): four portrait letter sheets. The first holds the
  Physical and Chemical tracks side by side; the second holds Bio and the **Buildings column** —
  five dashed, empty slots, one per tier; the third holds the **level track** — five 16mm circles,
  one per tier, aligned row for row with the spaces so the marker's row reads straight across, and a
  cycle counter of four boxes at the top — beside the five **building tiles**, cut along their
  dashed borders. A building tile is a space box with no strip and nothing to own. The fourth is the
  **contribution board**, half a sheet, drawn as a transit map: a route per track running left to
  right, five 22mm stations each, every station printing its good's mark and the quantity that step
  takes, and sized to take a contributor's disc. A route is told apart by its stroke — solid,
  double, dashed, dotted, keyed at the left — because the sheets print black and white; the step's
  VP is a **fare zone**, a tinted band down the sheet labelled once at the top, since the payout is
  the same on every track. It prints no title and no rules text: the rule for contributing is on the
  player aid. Every space is a box of the same width; five rows fill the sheet, so a box is about
  3.6 × 2.1in, enough for two meeples. A box reads left to right: the cost as resource tiles, a
  light dividing line, the yield as tiles (or an effect label), then a strip of what can be owned on
  the space: a **booster** cell (machine on tiers I–II, battery on III–IV) showing the +1 it grants,
  and a **life support** cell on tiers I–IV with the second worker's +2 Energy surcharge printed
  inside it, slightly lightened. Tier V prints no strip. The space's name is a small grey label
  top-left.
- **Resource tiles:** every good on the board is a 12mm square tile, the good's mark filling it,
  with the quantity in a black badge riding the top-right corner. A worker yield is a 16mm worker
  figure with a "+1" badge. Machine, building, battery, life support and VP yields are still words
  until they have marks.
- **Player aid** (`/regolith/print/aid`): the round, placement, contributions, the level marker
  (lock / bump / reset), upgrades and kickers, the goods value strip, setup and scoring.
- **Bring:** meeples for workers (2 per player plus spares for Recruit), one 16mm disc for the level
  marker, a cube for the cycle counter, a start marker, cubes for goods (a 5-energy piece helps),
  and three kinds of small marker per player for machines, batteries and life supports, about five
  discs per player for contributions, and VP tokens.

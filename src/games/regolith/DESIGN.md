# Regolith

Working title. A **worker-placement** game about **material science on another planet**, built
around one mechanism: placing a worker and getting it back are **separate actions**, and the wait
between them is the resource everyone is really competing for.

This is a ground-up redesign. The hex-tile colony builder that previously lived in this folder (last
seen at commit `e653fa8`) is replaced; its goods ladder survives in spirit, its board does not.

## Theme

Each player runs a **materials lab** on a barren world. Nothing here is found — everything is
_processed_: regolith is dug, water is cracked out of it, metal and chemicals are refined from
those, and food (really biomatter) is grown from water. Higher up the chain, metal becomes
**machinery** and chemicals become **polymers**, and those feed back into the extraction and
refining that made them.

The planet is small and the infrastructure is shared. Every process runs in a **silo** that anyone
can use, and a lab's edge is not owning a silo but **timing** it — being first in, choosing the
moment the clock ticks, and knowing when a crowded silo is a trap. What a lab _can_ own is the extra
room bolted onto a silo: an **annex** that lets one more worker in, and charges rent.

## Goods

Six goods. Every player holds all six in an open supply. Values are the design yardstick, not a
printed number: recipes are written against this table, so a zone can be checked by adding up each
side.

| Good     | ~Value | Source                     | Notes                                   |
| -------- | ------ | -------------------------- | --------------------------------------- |
| Energy   | 1      | A                          | Secondary input to most processes       |
| Rock     | 2      | B1                         | Build material; feeds metal & chemicals |
| Water    | 3      | B2                         | Feeds chemicals, food & specialists     |
| Metal    | 4      | C1 (rock + energy)         | Construction; machinery                 |
| Chemical | 5      | C2 (rock + water + energy) | Polymers                                |
| Food     | 6      | C3 (water + energy)        | Workers; specialists                    |

- **Every process is positive-sum.** Zones in a silo ladder **+4 / +6 / +8 / +10** in net value from
  bottom to top, so height is paid for with wait, not with a worse deal. (The first playtest ran at
  +2 / +3 / +4 and took forty minutes to reach one machine apiece; the ladder was doubled.)
- **Machinery** and **polymers** are not goods you hold. They are permanent upgrades placed on the
  board (see Upgrades). So are **annexes**.

### Tuned silos

Raw goods:

| Zone | Energy (A)   | Net | Rock (B1) | Net | Water (B2)   | Net |
| ---- | ------------ | --- | --------- | --- | ------------ | --- |
| 4    | 2 Water → 16 | +10 |           |     |              |     |
| 3    | 1 Water → 11 | +8  | — → 4     | +8  | 4 Energy → 4 | +8  |
| 2    | — → 6        | +6  | — → 3     | +6  | 3 Energy → 3 | +6  |
| 1    | — → 4        | +4  | — → 2     | +4  | 2 Energy → 2 | +4  |

Refined goods:

| Zone | Metal (C1)            | Net | Chemical (C2)                   | Net | Food (C3)              | Net |
| ---- | --------------------- | --- | ------------------------------- | --- | ---------------------- | --- |
| 2    | 2 Rock + 2 Energy → 3 | +6  | 1 Water + 1 Rock + 4 Energy → 3 | +6  | 3 Water + 3 Energy → 3 | +6  |
| 1    | 1 Rock + 2 Energy → 2 | +4  | 1 Water + 1 Rock + 1 Energy → 2 | +4  | 2 Water + 2 Energy → 2 | +4  |

All 1 tick per zone. Every zone is open from setup; nothing on the board is gated.

Upgrades (one zone each, 2 ticks, all payable with time — see Paying with time):

| Silo | Full price                  | Value | Reduced (time or specialist) | Value |
| ---- | --------------------------- | ----- | ---------------------------- | ----- |
| D1   | 2 Metal + 2 Energy          | 10    | 1 Metal + 1 Energy           | 5     |
| D2   | 2 Chemical + 2 Energy       | 12    | 1 Chemical + 1 Energy        | 6     |
| D3   | 2 Food + 2 Energy           | 14    | 1 Food + 1 Energy            | 7     |
| E1   | 2 Rock + 1 Metal + 3 Energy | 11    | 1 Rock + 2 Energy            | 4     |
| E2   | 2 Water + 1 Food + 3 Energy | 15    | 1 Water + 2 Energy           | 5     |

The 1-of-something in Construction and Specialist is deliberate: the reduced price drops the metal
and the food entirely, so a player with only raw goods can still build or train if they will wait
for it. Every upgrade was roughly halved in the second pass (2026-09-09) — the first playtest never
reached a second worker.

**Higher is strictly better.** Since a worker is forced into the lowest open zone, nobody _chooses_
the top: the last arrival earns the best deal and the longest wait. That is the crowding inversion
the silos are built on — first in is paid first, later in is paid better.

**Rock is free all the way up.** It is the one silo with no cost at any height, which makes it the
default second placement when a player has nothing to spend. Energy is free for its first two zones
and then runs on water.

**Energy is the input everything else eats.** Water, Metal, Chemical and Food all take energy, and
Energy pays it out in bulk — 4, 6, 11, 16 per visit. Expect energy to be plentiful and its silo to
be the most crowded; the tuning question is whether the two free zones are enough of a tax.

Special Projects is shaped but empty in `domain.ts`. **The 2-tick duration on all five upgrade zones
is a draft**, chosen so upgrades wait longer than goods, and is the next thing to retune if the D/E
silos feel sluggish.

## Board: Silos

The board is a set of **silos** — vertical tracks of stacked **zones**. Each zone prints a **cost**
(goods paid to work there), a **yield** (what the worker brings home) and a **duration** in ticks.
Beside every silo runs a **time marker** track. Beside every zone is an empty **annex** square,
unusable until someone builds it (see Annexes).

| Silo | Process                              | Zones | Ticks/zone (draft) |
| ---- | ------------------------------------ | ----- | ------------------ |
| A    | Get Energy                           | 4     | 1                  |
| B1   | Get Rock                             | 3     | 1                  |
| B2   | Get Water — energy                   | 3     | 1                  |
| C1   | Get Metal — rock + energy            | 2     | 1                  |
| C2   | Get Chemical — rock + water + energy | 2     | 1                  |
| C3   | Get Food — water + energy            | 2     | 1                  |
| D1   | Make Machinery — metal + energy      | 1     | 2 (+1 with time)   |
| D2   | Make Polymers — chemical + energy    | 1     | 2 (+1 with time)   |
| D3   | Recruit worker — food + energy       | 1     | 2 (+1 with time)   |
| E1   | Construction — rock + metal + energy | 1     | 2 (+1 with time)   |
| E2   | Specialist — water + food + energy   | 1     | 2 (+1 with time)   |
| F1   | Special Projects                     | 1     | TBD (not v1)       |

- **D makes, E builds.** The D silos turn goods into a thing you own — a machine, a polymer, a
  worker. The E silos change the board or a worker you already have.
- **Silo height falls as the chain deepens.** Raw goods have deep silos and cheap zones, so the
  crowding tax lands hardest where everyone wants to be. Deep-chain silos hold one worker and turn
  over fast.
- **Higher zones yield more.** The first Rock zone pays 2 Rock; each zone above pays more. The extra
  is the compensation for sitting further from the marker.
- **Short columns on purpose.** Every silo lost its top zone after the first playtest. Climbing a
  column is the fun part, and fewer spots to weigh makes the board less intimidating; the whole
  board being open from the start more than makes up the capacity.

### Annexes

Every zone has room for one extra worker slot, the **annex**, printed as an empty square on the
zone's right side. It does nothing until a player **builds** it via Construction (E1), which puts
that player's marker in the square.

- **A built annex is a second slot in its zone.** A worker placed there pays the zone's cost, waits
  the zone's ticks, is bumped with the zone and takes the zone's yield — identical to the base slot.
  It locks and unlocks with the zone.
- **Rent.** Anyone but the owner placing into an annex pays **1 Energy to the owner**, on top of the
  zone's cost. The owner places there free. Rent is a tax, not an income: it never pays back the 11
  the annex cost. The return is the room itself, and whatever VP annexes end up scoring.
- **Lowest to highest.** Within a silo, annexes must be built bottom-up: the first annex in Energy
  is on Energy I, the next on Energy II, and so on. A silo whose every zone has an annex cannot be
  chosen. This keeps the cheap, crowded zones the first to widen.
- **Capacity by player count.** At 2–3 players each zone holds one annex, which is what the board
  prints. At 4 players every zone should hold two; a second square is a print change for later.

Annexes are also the answer to the single-zone D/E silos sealing shut: an annex on Machinery is a
second machinist's chair, and its owner collects a little energy every time a rival sits in it.

## Turn Structure

Two **atoms** per turn, drawn from two verbs:

- **Place** — put a worker from your supply into a silo. It goes into the **lowest unlocked zone
  whose base slot is empty**, or into any empty, unlocked **annex** at or below that zone. You may
  never climb past an empty base slot; an annex is a choice, the base slot is not. **Pay that zone's
  cost immediately** (plus rent, in someone else's annex). Paying on placement is the fundamental
  idea of the game: the cost is sunk before you know when the yield arrives.
- **Advance** — move a silo's time marker **one tick**.

The three legal turns:

- **(A) Place, Place** — two workers into two **different** silos.
- **(B) Place, Advance** — one worker into one silo, one tick on a **different** silo.
- **(C) Advance, Advance** — one tick each on two **different** silos.

**Diversification is a hard rule.** Both atoms of a turn must touch different silos. You can never
place and then immediately tick the same silo, and you can never double-tick a silo in one turn. Two
of your own workers may share a zone (base and annex) across turns, never in one.

## The Time Marker

Each silo's marker climbs a tick track alongside the zones.

- **Bumping.** When the marker moves **past** a zone — exits it upward — any worker in that zone is
  **bumped**: it returns to its owner's supply along with the zone's **yield**. A zone with a
  duration of 2 needs two ticks to be passed, so machinery genuinely takes longer than rock. Base
  slot and annex bump together.
- **Locking.** Every zone the marker has passed is **locked**: it cannot be placed into until the
  marker resets. If the marker sits at zone 3, zones 1 and 2 are dead space; the next worker enters
  zone 3 or above.
- **Reset.** The tick that carries the marker past the **top zone** bumps that zone and immediately
  **returns the marker to the bottom**. Everything unlocks at once. There is no parked state — the
  last tick out is also the first tick of the next cycle. The player who ticks the reset takes **1
  Energy** from the supply: a small thank-you for reopening a silo for everyone. It is energy on
  every silo, not the silo's own good — a free structure for ticking Construction would be neither
  small nor obvious.
- **Advancing is almost pure tempo.** Apart from the reset energy it pays the advancer nothing
  directly and frequently pays an opponent. What it buys is control over _when_ yields arrive —
  yours on this silo, or a rival's delay when you spend your ticks elsewhere.

### Paying with time

The D and E zones can be paid with **time** instead of the full price. The rule is the same
everywhere: pay **one less of every good** in the zone's cost (a good at 1 becomes free) and place
**one time token** in the zone's box. While the marker sits at that zone, an advance **removes a
token instead of moving the marker**; only once the box is clear does the next advance carry the
marker on. Same outcome, same placement rules — the zone just takes one more tick to get through.

On the board this is a quarter time-disc in the zone's bottom-left corner with a **−1** badge;
nothing else is printed, because the discount follows from the cost above it. The saving is not a
fixed price for a tick — it is worth more on a three-input zone like Specialist than on Machinery —
which is intended: the zones where a player most wants to skip the wait are the ones where the wait
buys the most.

**Reductions never stack.** A zone marked −1 can be reduced once, by a token or by a specialist
(below), never both. If a zone is ever printed −2, that is two reductions on offer: a specialist
takes one free and may pay the other with a token.

The delay is positional, not personal. Zones **below** the token resolve at normal speed. Every
worker **above** it waits the extra ticks too, whoever they belong to. So paying with time is partly
paid by whoever arrives after you — a cheap early worker taxes the whole silo behind it.

It is a straight trade of goods for tempo, and it puts the game's central resource on the price tag:
a player flush with goods pays to get the worker back sooner; a player short on goods pays with a
turn, and makes the silo a worse place to follow into. Raw and refining silos never offer it, so the
choice only appears once a player is deep enough to have something to spend.

The combination is the game's central tradeoff: crowding a silo is cheap to enter and slow to leave,
and a silo whose top zones are full and whose marker is high is **closed** to everyone until
somebody spends ticks releasing the workers already in it.

## Upgrades

All five upgrade silos follow the same pattern as everything else: place, pay, wait, bump. The thing
you made takes effect **when the worker is bumped**, not when it was placed. This is fiddly, and it
is deliberate — one rule for every silo.

- **Construction (E1)** — **2 ticks.** `2 Rock + 1 Metal + 3 Energy`, or `1 Rock + 2 Energy` **+
  time**. On placement, name a **silo** that still has an unbuilt annex. On bump, put your marker in
  the **lowest unbuilt annex** of that silo — which may be higher than it was when you placed, if
  someone built there first. See Annexes. Construction replaces the structure-card deck of the first
  draft; annexes are the metal sink and, probably, the VP engine, but VP is deferred until the loop
  is fun.
- **Recruit (D3)** — **2 ticks.** `2 Food + 2 Energy`, or pay with time, for a new worker on bump.
  Worker count is the main tuning lever for how often turns fall back to (C); starting count **TBD
  from playtest**.
- **Machinery (D1)** — **2 ticks.** `2 Metal + 2 Energy`, or pay with time, for one machine. Choose
  a **single zone in a B silo** (Rock or Water) with a free machinery slot; when bumped, place your
  machinery marker in it. Anyone may still work the zone; **your** workers get a bonus yield there.
  Exclusive to its maker. Every B zone prints **two** slots, so at most two players can machine one
  zone. Bonus size TBD.
- **Polymers (D2)** — **2 ticks.** `2 Chemical + 2 Energy`, or pay with time, for one polymer. Same
  shape as machinery, targeting a **single zone in a C silo** (Metal, Chemical or Food): your
  workers convert better there. Two slots per C zone. Bonus size TBD.
- **Nothing else takes an upgrade.** Energy and the D/E/F silos have no machinery or polymer slots.
  Annexes are the only thing to own there.
- **Specialist (E2)** — **2 ticks.** `2 Water + 1 Food + 3 Energy`, or `1 Water + 2 Energy` **+
  time**. The worker you placed comes back as a **specialist** (swap the piece). Worker count is
  unchanged. A specialist **always pays the reduced price** on any zone with a time corner and
  places **no token** — it runs the machines fast enough not to need the extra tick. It cannot
  reduce further with a token (see Paying with time), and it is an ordinary worker everywhere else.
  A specialist may not be placed in E2. The intent is that specialists live in the D and E silos,
  where the saving is 5–10 value a visit against a 15-value training cost.
- **Special Projects (F1)** — single-zone silo for late-game sinks. **Not in v1.**

## Components & Information

- **Silo board** with tick tracks, one time marker per silo, and an annex square beside every zone.
- **Annex markers** per player, placed in an annex square when Construction resolves.
- **Time tokens**, a shared pool, placed in a zone's box when a worker pays with time.
- **Workers** per player (count TBD), plus specialist pieces to swap in.
- **Machinery / polymer markers** per player, placed in the printed slots on B and C zones.
- **Goods** as cubes or a tracked supply — all six held openly.
- **All information is open**: supplies public, every zone's cost and yield printed, marker
  positions visible. The only hidden thing is what the next player will tick.

## End & Players

- **Player count:** TBD; the diversification rule and small silos suggest 2–4. The board as printed
  is for 2–3 (one annex per zone).
- **End trigger and scoring:** **TBD, deliberately.** The first job is a loop that is fun to run;
  scoring is tuned after that. Candidates: annexes (flat, or by the height of the zone they widen),
  machinery/polymer placements, special projects, leftover goods by value.

## Design Tensions to Watch

- **Closed-silo deadlock.** A silo with its marker high and its upper zones full is sealed until
  someone ticks it, and ticking it pays the workers already inside. Watch whether the player who
  needs in ever wants to be the one who pays the tempo, or whether silos sit closed for whole rounds
  — and whether annexes on the D/E silos relieve it.
- **Advancing as gift.** Ticking is tempo and often helps a rival more than you. Watch whether
  players simply refuse to tick contested silos, leaving (A) as the default turn and grinding the
  game to place-only until workers run out — and whether 1 Energy for the reset tick is enough to
  make someone volunteer, or so small it is never the reason.
- **Worker starvation.** Two atoms a turn with workers stranded in silos means (C) turns are forced,
  not chosen. Watch how often that happens at the starting worker count, and whether D3 at 2 Food is
  now too easy.
- **Deferred upgrades.** Machinery, polymers, annexes and specialists all take effect on bump, so an
  upgrade can sit unrealised for turns while opponents choose not to tick. Watch whether this feels
  like tension or like being held hostage, especially in 1-zone silos where the marker cannot move
  without releasing you.
- **Time tokens as a tax on followers.** A cheap worker's tokens delay every zone above it. Watch
  whether the leader in a silo takes the cheap option by default, since the tempo cost mostly lands
  on later arrivals, and whether that makes crowded silos even less attractive to enter.
- **Height vs wait.** Higher zones pay more but wait longer. Watch whether the extra yield actually
  compensates, or whether the bottom zone is always correct and height is just a penalty.
- **Annex throughput.** An annex doubles a zone's output per cycle. Watch whether widening Energy I
  and Rock I floods the raw economy, and whether anyone ever builds past the bottom zone.
- **Annex as toll booth vs skip.** Followers may climb past a rival's annex rather than pay rent.
  Watch whether anyone ever pays rent voluntarily; if not, the annex is only ever room for its owner
  and the rent rule is dead weight.
- **Specialist dominance.** A specialist saves 5–10 value every D/E visit. Watch whether training
  one early is simply correct, and whether it makes paying with time — the tempo trade the game is
  built on — a rule nobody uses after the first specialist.
- **Value tuning holds at +4/+6/+8/+10.** Re-derive after any recipe change; a converter that drifts
  to neutral is slower than raw extraction, not just worse.
- **Energy glut.** Energy is cheap to make and paid out by the fistful. Watch whether it ever
  constrains anyone after the first few turns, or whether the energy prices on Water/Metal/Chemical
  — and the 1-energy rent — are decoration.
- **No VP yet.** Nothing scores. Watch what players race for anyway; that is the scoring rule.

## Playtest Log

- **2026-09-08, 2 players.** Played until each side had one machine; one player heading for a second
  worker, the other for polymers. About forty minutes. Far too slow. Changes: ladder doubled to
  +4/+6/+8/+10; every silo one zone shorter; covers removed and Construction repurposed to structure
  cards. Column-climbing was the fun part; the open board felt tight, which shortening plus
  uncovering should relieve.
- **2026-09-09, design pass (no play).** Structure cards dropped; Construction now builds annexes.
  Every upgrade price roughly halved and rewritten so the reduced price drops the refined good.
  Specialist (E2) defined as the worker that always gets the reduced price. Recruit moved to D3.
  Reset tick pays its advancer 1 Energy. VP deferred.

## Setup

- Board fully open. All markers on their silo's bottom tick. Every annex square empty.
- Each player: starting workers (TBD), empty supply.
- First turn is necessarily two placements into free zones — Energy and Rock — or a placement into
  one of them with nothing to spend elsewhere. Starting goods TBD.

## Prototype (v0)

Print-and-play pages live in `src/games/regolith`. `domain.ts` encodes the goods, values and silo
zones; everything below renders from it, so a retune is a data change.

- **Silo board** (`/regolith/print/board`): three portrait letter sheets of two tall silos each —
  A/B1, B2/C1, C2/C3 — and two landscape sheets for the single-zone silos: D1/D2/D3 and E1/E2/F1,
  two across with an odd last box centred. Every box is a tarot card on its side (4.75 : 2.75):
  portrait boxes are about 3.9 × 2.2in, landscape ones 5.1 × 3.0in. There is no sheet header, and
  every box has room for a meeple. A box reads left to right: the cost as resource tiles, a light
  dividing line, the yield as tiles (or an effect label), then a column of what can be owned on the
  zone. The tick track is the dividing line itself — one 16mm circle per tick, stacked up from the
  box's bottom edge and centred on the line, so the marker sits between cost and yield. The marker
  starts on zone I's bottom tick; there is no separate start cell. The zone's name is a small grey
  label top-left. A zone payable with time carries a quarter time-disc in its bottom-left corner
  with a −1 badge. The annex is a 22mm grey square at the box's top-right, labelled, big enough for
  an owner's marker and a meeple. Nothing about rent is printed: it is one rule for every square.
  Below it, B zones print two 13mm machinery slots and C zones two polymer slots; other silos print
  neither. Undefined zones print as dashed boxes to pencil in.
- **Resource tiles:** every good on the board is a 12mm square tile, the good's mark filling it,
  with the quantity in a black badge riding the top-right corner. Time is the same tile as a circle.
- **Shape code:** goods are cubes and time is discs, so anything printed for a good is square and
  anything printed for time is a circle. Count badges are rounded squares on both, so a badge never
  reads as a disc.
- **Player aid** (`/regolith/print/aid`): the three turn shapes, place / advance / bump / lock /
  reset (and its energy), paying with time, annexes, the goods value strip, upgrade effects, and
  blanks for the setup values still to be tuned.
- **Bring:** meeples for workers plus a distinct piece per player for specialists, one 16mm disc per
  silo for the time marker, a pool of discs for time tokens, cubes for goods (a 5-energy piece helps
  — Energy IV pays 16), and small markers per player for annex, machinery and polymer claims.

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
moment the clock ticks, and knowing when a crowded silo is a trap.

## Goods

Six goods. Every player holds all six in an open supply. Values are the design yardstick, not a
printed number: recipes are written against this table, so a zone can be checked by adding up each
side.

| Good     | ~Value | Source                     | Notes                                   |
| -------- | ------ | -------------------------- | --------------------------------------- |
| Energy   | 1      | A                          | Secondary input to most processes       |
| Rock     | 2      | B1                         | Build material; feeds metal & chemicals |
| Water    | 3      | B2                         | Feeds chemicals & food                  |
| Metal    | 4      | C1 (rock + energy)         | Construction; machinery                 |
| Chemical | 5      | C2 (rock + water + energy) | Polymers                                |
| Food     | 6      | C3 (water + energy)        | Workers; upgraded workers               |

- **Every process is positive-sum.** Zones in a silo ladder **+2 / +3 / +4 / +5** in net value from
  bottom to top (+6 for the five-zone Energy silo), so height is paid for with wait, not with a
  worse deal.
- **Machinery** and **polymers** are not goods you hold. They are permanent upgrades placed on the
  board (see Upgrades).

### Tuned silos

Raw goods:

| Zone | Energy (A)                  | Net | Rock (B1)      | Net | Water (B2)     | Net |
| ---- | --------------------------- | --- | -------------- | --- | -------------- | --- |
| 5    | 1 Chemical + 1 Metal → 15 ▣ | +6  |                |     |                |     |
| 4    | 2 Water → 11 ▣              | +5  | 1 Energy → 3 ▣ | +5  | 4 Energy → 3 ▣ | +5  |
| 3    | 1 Water → 7                 | +4  | — → 2 ▣        | +4  | 2 Energy → 2 ▣ | +4  |
| 2    | — → 3                       | +3  | 1 Energy → 2   | +3  | 3 Energy → 2   | +3  |
| 1    | — → 2                       | +2  | — → 1          | +2  | 1 Energy → 1   | +2  |

Refined goods:

| Zone | Metal (C1)              | Net | Chemical (C2)                     | Net | Food (C3)                | Net |
| ---- | ----------------------- | --- | --------------------------------- | --- | ------------------------ | --- |
| 3    | 3 Rock + 6 Energy → 4 ▣ | +4  | 3 Rock + 3 Water → 3 + 4 Energy ▣ | +4  | 5 Water + 5 Energy → 4 ▣ | +4  |
| 2    | 2 Rock + 5 Energy → 3 ▣ | +3  | 2 Rock + 2 Water → 2 + 3 Energy ▣ | +3  | 4 Water + 3 Energy → 3 ▣ | +3  |
| 1    | 1 Rock + 4 Energy → 2   | +2  | 1 Rock + 1 Water → 1 + 2 Energy   | +2  | 3 Water + 1 Energy → 2   | +2  |

All 1 tick per zone; ▣ marks a zone that **starts covered**. Rock and Water open with their bottom
two zones, Energy with three (the third energy source is needed too early to gate), and each
refining silo with just its bottom zone. Cover tiles so far: **Energy IV–V, Rock III–IV, Water
III–IV, Metal II–III, Chemical II–III, Food II–III** (VP per cover: TBD).

**Rock/Water zone 3 dominates zone 2** — cheaper in, same out. Since a worker is forced into the
lowest open zone, nobody _chooses_ zone 3: the third arrival earns the best deal and the longest
wait. That is the crowding inversion the silos are built on — first in is paid first, later in is
paid better.

**Chemical gives off energy.** It is the one two-output silo: the reaction pays energy alongside the
chemical, so a player with rock and water can start refining without an energy stockpile. Metal is
the opposite — energy-hungry from the first zone — which makes Chemical a natural on-ramp to Metal.

**Energy folds the chain back on itself.** Its upper zones take water, then chemical and metal, and
pay energy in bulk; Energy V is the single richest zone on the board. Intended: energy-hungry zones
elsewhere (Metal, Water IV, Food III) are what make it worth revisiting.

Construction, Recruit, Machinery and Polymers each have their first zone (see Upgrades); their
second zones, Upgraded Worker and Special Projects are shaped but empty in `domain.ts`. **The 2-tick
duration on all four is a draft**, chosen so upgrades wait longer than goods, and is the first thing
to retune if the D/E silos feel sluggish.

## Board: Silos

The board is a set of **silos** — vertical tracks of stacked **zones**. Each zone prints a **cost**
(goods paid to work there), a **yield** (what the worker brings home) and a **duration** in ticks.
Beside every silo runs a **time marker** track.

| Silo | Process                                   | Max zones | Ticks/zone (draft) |
| ---- | ----------------------------------------- | --------- | ------------------ |
| A    | Get Energy                                | 5         | 1                  |
| B1   | Get Rock                                  | 4         | 1                  |
| B2   | Get Water                                 | 4         | 1                  |
| C1   | Get Metal — rock (+ energy)               | 3         | 1                  |
| C2   | Get Chemical — rock + water, emits energy | 3         | 1                  |
| C3   | Get Food — water (+ energy)               | 3         | 1                  |
| D1   | Construction — metal + rock + energy      | 2         | 2 (+1 optional)    |
| D2   | Recruit worker — food + water + energy    | 2         | 2 (+1 optional)    |
| E1   | Make Machinery — metal + energy           | 2         | 2 (+1 optional)    |
| E2   | Make Polymers — chemical + energy         | 2         | 2 (+1 optional)    |
| E3   | Upgraded worker — food                    | 2         | TBD                |
| F1   | Special Projects                          | 1         | TBD (not v1)       |

- **Silo height falls as the chain deepens.** Raw goods have deep silos and cheap zones, so the
  crowding tax lands hardest where everyone wants to be. Deep-chain silos hold one or two workers
  and turn over fast.
- **Higher zones yield more.** The first Rock zone pays 1 Rock; each zone above pays a bit more. The
  extra is the compensation for sitting further from the marker.
- **Covered zones.** Much of the board starts **covered**: a silo's upper zones are hidden under
  **cover tiles** until **Construction** (D1) reveals them. Each cover is a named, buildable card
  ("Water III") printing its VP. The final form is a greyed-out cover showing what the structure
  costs, with the zone printed on the board beneath; the v0 kit prints it the other way round. Zones
  are always revealed bottom-to-top within a silo, so a silo never has a gap. Rock and Water open
  with 2 of 4, Energy 3 of 5, each C silo 1 of 3; D–F start heights TBD.

## Turn Structure

Two **atoms** per turn, drawn from two verbs:

- **Place** — put a worker from your supply into a silo. It goes into the **lowest unlocked, empty
  zone** and you **pay that zone's cost immediately**. Paying on placement is the fundamental idea
  of the game: the cost is sunk before you know when the yield arrives.
- **Advance** — move a silo's time marker **one tick**.

The three legal turns:

- **(A) Place, Place** — two workers into two **different** silos.
- **(B) Place, Advance** — one worker into one silo, one tick on a **different** silo.
- **(C) Advance, Advance** — one tick each on two **different** silos.

**Diversification is a hard rule.** Both atoms of a turn must touch different silos. You can never
place and then immediately tick the same silo, and you can never double-tick a silo in one turn.

## The Time Marker

Each silo's marker climbs a tick track alongside the zones.

- **Bumping.** When the marker moves **past** a zone — exits it upward — any worker in that zone is
  **bumped**: it returns to its owner's supply along with the zone's **yield**. A zone with a
  duration of 2 needs two ticks to be passed, so machinery genuinely takes longer than rock.
- **Locking.** Every zone the marker has passed is **locked**: it cannot be placed into until the
  marker resets. If the marker sits at zone 3, zones 1 and 2 are dead space; the next worker enters
  zone 3 or above.
- **Reset.** The tick that carries the marker past the **topmost revealed zone** bumps that zone and
  immediately **returns the marker to the bottom**. Everything unlocks at once. There is no parked
  state — the last tick out is also the first tick of the next cycle.
- **Advancing is pure tempo.** It pays the advancer nothing directly and frequently pays an
  opponent. What it buys is control over _when_ yields arrive — yours on this silo, or a rival's
  delay when you spend your ticks elsewhere.

### Paying with time

From the D silos on, some zones print **two prices**: a full price in goods, or a **cheaper price
plus time**. A worker taking the cheap route places **N time tokens in the zone's box** on
placement. While the marker sits at that zone, an advance **removes a token instead of moving the
marker**; only once the box is clear does the next advance carry the marker on. Same outcome, same
placement rules — the zone just takes N more ticks to get through.

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

All four upgrade silos follow the same pattern as everything else: place, pay, wait, bump. The thing
you made takes effect **when the worker is bumped**, not when it was placed. This is fiddly, and it
is deliberate — one rule for every silo.

- **Construction (D1)** — **2 ticks.** `2 Metal + 2 Rock + 2 Energy`, or
  `1 Metal + 1 Rock + 1
  Energy` **+ time**. On placement, choose a **covered zone** (the lowest
  covered zone of any silo) and put your marker on its cover. When the worker is bumped, remove the
  cover: the zone is revealed for everyone and you score **VP** for it. Construction is how the
  board grows, and the only way the crowding tax on a silo ever eases. Some structures may later
  carry their own build cost on top of the D1 price; none do yet. Zone 2 TBD.
- **Recruit (D2)** — **2 ticks.** `3 Food + 3 Water + 3 Energy`, or `2 Food + 2 Water + 2 Energy`
  **+ time**, for a new worker on bump. Worker count is the main tuning lever for how often turns
  fall back to (C); starting count **TBD from playtest**. Zone 2 TBD.
- **Machinery (E1)** — **2 ticks.** `3 Metal + 3 Energy`, or `2 Metal + 2 Energy` **+ time**, for
  one machine. Choose a **single zone in a B silo**; when bumped, place your machinery marker beside
  it. Anyone may still work the zone; **your** workers get a bonus yield there. Exclusive to its
  maker. Bonus size TBD. Zone 2 TBD.
- **Polymers (E2)** — **2 ticks.** `3 Chemical + 3 Energy`, or `2 Chemical + 2 Energy` **+ time**,
  for one polymer. Same shape as machinery, targeting a **single zone in a C silo**: your workers
  convert better there. Bonus size TBD. Zone 2 TBD.
- **Upgraded worker (E3)** — pay food. Returns an improved worker. **What it does is TBD.**
  Candidates: places below the marker, occupies a zone with a shorter duration, yields as if one
  zone higher, counts as an extra atom.
- **Special Projects (F1)** — single-zone silo for late-game sinks. **Not in v1.**

## Components & Information

- **Silo board** with covered zones (cover tiles), tick tracks, and one time marker per silo.
- **Time tokens**, a shared pool, placed in a zone's box when a worker pays with time.
- **Workers** per player (count TBD), plus upgraded-worker variants.
- **Machinery / polymer markers** per player, placed on zone sides.
- **Cover markers** per player, to claim a zone under construction.
- **Goods** as cubes or a tracked supply — all six held openly.
- **All information is open**: supplies public, every zone's cost and yield printed, marker
  positions visible. The only hidden thing is what the next player will tick.

## End & Players

- **Player count:** TBD; the diversification rule and small silos suggest 2–4.
- **End trigger and scoring:** **TBD.** Known VP sources so far: construction reveals. Open
  candidates: machinery/polymer placements, special projects, leftover goods by value. First goal is
  a working A–D loop; scoring is tuned after that loop feels right.

## Design Tensions to Watch

- **Closed-silo deadlock.** A silo with its marker high and its upper zones full is sealed until
  someone ticks it, and ticking it pays the workers already inside. Watch whether the player who
  needs in ever wants to be the one who pays the tempo, or whether silos sit closed for whole
  rounds.
- **Advancing as gift.** Ticking is pure tempo and often helps a rival more than you. Watch whether
  players simply refuse to tick contested silos, leaving (A) as the default turn and grinding the
  game to place-only until workers run out.
- **Worker starvation.** Two atoms a turn with workers stranded in silos means (C) turns are forced,
  not chosen. Watch how often that happens at the starting worker count, and whether D2 is worth its
  food + water when the alternative is waiting.
- **Deferred upgrades.** Machinery, polymers and construction all take effect on bump, so an upgrade
  can sit unrealised for turns while opponents choose not to tick. Watch whether this feels like
  tension or like being held hostage, especially in 2-zone silos where one rival worker above you
  controls your timing.
- **Time tokens as a tax on followers.** A cheap worker's tokens delay every zone above it. Watch
  whether the leader in a silo takes the cheap option by default, since the tempo cost mostly lands
  on later arrivals, and whether that makes crowded silos even less attractive to enter.
- **Height vs wait.** Higher zones pay more but wait longer. Watch whether the extra yield actually
  compensates, or whether the bottom zone is always correct and height is just a penalty.
- **Value tuning holds at +2/+3/+4.** Every lower zone nets +2 to +4 by the goods table. Re-derive
  after any recipe change; a converter that drifts to neutral is slower than raw extraction, not
  just worse.
- **Construction as the only relief valve.** Revealing zones is the sole way the board grows, and it
  also pays VP. Watch whether the player who builds is rewarded or just subsidising everyone's
  access.

## Setup

- Board with upper zones **covered**: Rock and Water open at 2 of 4, Energy 3 of 5, each C silo 1 of
  3, D–F TBD. All markers at the bottom.
- Each player: starting workers (TBD), empty supply.
- First turn is necessarily two placements or a placement into A with no goods to spend elsewhere —
  starting goods TBD.

## Prototype (v0)

Print-and-play pages live in `src/games/regolith`. `domain.ts` encodes the goods, values and silo
zones; everything below renders from it, so a retune is a data change.

- **Silo board** (`/regolith/print/board`): six portrait letter sheets of two silos each — A/B1,
  B2/C1, C2/C3, D1/D2, E1/E2, E3/F1. Two silos fill the printable page edge to edge, so each zone is
  a box about 3.6 × 1.9in (room for a meeple beside the recipe) printing its name, recipe and, where
  it has one, the cheaper time price with a token count. A tick track runs left of each silo: one
  16mm circle per tick, stacked from the bottom of the zone, split down the middle by the box's left
  border and resting on its bottom edge; the box's contents are centered clear of it. The marker
  starts on zone I's bottom tick; there is no separate start cell. Machinery and polymer markers
  have no printed slot: they sit beside the zone they claim. Covered zones are hatched. Undefined
  zones print as dashed boxes to pencil in.
- **Shape code:** goods are cubes and time is discs, so anything printed for a good is square and
  anything printed for time is a circle.
- **Cover tiles** (last two sheets of the same route): twelve tiles at zone-box size, two across and
  four down, each with its zone's recipe and an empty VP box, to lay over the hatched zones.
- **Player aid** (`/regolith/print/aid`): the three turn shapes, place / advance / bump / lock /
  reset, paying with time, the goods value strip, upgrade effects, and blanks for the setup values
  still to be tuned.
- **Bring:** meeples for workers, one 16mm disc per silo for the time marker, a pool of discs for
  time tokens, cubes for goods, and small markers per player for covers under construction and for
  machinery / polymer claims.

# Regolith

Working title. A **worker-placement** game about **material science on another planet**, built
around one mechanism: placing a worker and getting it back are **separate actions**, and the wait
between them is the resource everyone is really competing for.

This is a ground-up redesign. The hex-tile colony builder in this folder (see `domain.ts`) is the
previous iteration and is being replaced; its goods ladder survives in spirit, its board does not.

## Theme

Each player runs a **materials lab** on a barren world. Nothing here is found — everything is
_processed_: regolith is dug, water is cracked out of it, metal and chemicals are refined from those,
and food (really biomatter) is grown from water. Higher up the chain, metal becomes **machinery** and
chemicals become **polymers**, and those feed back into the extraction and refining that made them.

The planet is small and the infrastructure is shared. Every process runs in a **silo** that anyone can
use, and a lab's edge is not owning a silo but **timing** it — being first in, choosing the moment the
clock ticks, and knowing when a crowded silo is a trap.

## Goods

Six goods. Every player holds all six in an open supply. Values are the design yardstick, not a
printed number: recipes are written against this table, so a zone can be checked by adding up each
side.

| Good      | ~Value | Source                     | Notes                                   |
| --------- | ------ | -------------------------- | --------------------------------------- |
| Energy    | 1      | A                          | Secondary input to most processes       |
| Rock      | 2      | B1                         | Build material; feeds metal & chemicals |
| Water     | 3      | B2                         | Feeds chemicals & food                  |
| Metal     | 4      | C1 (rock + energy)         | Construction; machinery                 |
| Chemical  | 5      | C2 (rock + water + energy) | Polymers                                |
| Food      | 6      | C3 (water + energy)        | Workers; upgraded workers               |

- **Every process is positive-sum.** Lower zones are tuned so a recipe nets **+2 to +4** in value;
  higher zones in the same silo pay more for the longer wait. Example: `2 Energy + 2 Rock → 2 Metal`
  is 6 in, 8 out, net +2.
- **Machinery** and **polymers** are not goods you hold. They are permanent upgrades placed on the
  board (see Upgrades).

## Board: Silos

The board is a set of **silos** — vertical tracks of stacked **zones**. Each zone prints a **cost**
(goods paid to work there), a **yield** (what the worker brings home) and a **duration** in ticks.
Beside every silo runs a **time marker** track.

| Silo | Process                                  | Max zones | Ticks/zone (draft) |
| ---- | ---------------------------------------- | --------- | ------------------ |
| A    | Get Energy                               | 5         | 1                  |
| B1   | Get Rock                                 | 4         | 1                  |
| B2   | Get Water                                | 4         | 1                  |
| C1   | Get Metal — rock (+ energy)              | 3         | 1                  |
| C2   | Get Chemical — rock + water (+ energy)   | 3         | 1                  |
| C3   | Get Food — water (+ energy)              | 3         | 1                  |
| D1   | Construction — metal + rock              | 2         | TBD                |
| D2   | Recruit worker — food + water            | 2         | TBD                |
| E1   | Make Machinery — metal                   | 2         | 2                  |
| E2   | Make Polymers — chemical                 | 2         | 2–3                |
| E3   | Upgraded worker — food                   | 2         | TBD                |
| F1   | Special Projects                         | 1         | TBD (not v1)       |

- **Silo height falls as the chain deepens.** Raw goods have deep silos and cheap zones, so the
  crowding tax lands hardest where everyone wants to be. Deep-chain silos hold one or two workers
  and turn over fast.
- **Higher zones yield more.** The first Rock zone pays 1 Rock; each zone above pays a bit more.
  The extra is the compensation for sitting further from the marker.
- **Covered zones.** Much of the board starts **covered**: a silo's upper zones are hidden under
  tiles until **Construction** (D1) reveals them. Water might open with only 2 of its 4 zones. Zones
  are always revealed bottom-to-top within a silo, so a silo never has a gap.

## Turn Structure

Two **atoms** per turn, drawn from two verbs:

- **Place** — put a worker from your supply into a silo. It goes into the **lowest unlocked, empty
  zone** and you **pay that zone's cost immediately**. Paying on placement is the fundamental idea of
  the game: the cost is sunk before you know when the yield arrives.
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

The combination is the game's central tradeoff: crowding a silo is cheap to enter and slow to
leave, and a silo whose top zones are full and whose marker is high is **closed** to everyone until
somebody spends ticks releasing the workers already in it.

## Upgrades

All four upgrade silos follow the same pattern as everything else: place, pay, wait, bump. The thing
you made takes effect **when the worker is bumped**, not when it was placed. This is fiddly, and it
is deliberate — one rule for every silo.

- **Construction (D1)** — pay metal + rock. On placement, choose a **covered zone** (the lowest
  covered zone of any silo) and put your marker on its cover. When the worker is bumped, remove the
  cover: the zone is revealed for everyone and you score **VP** for it. Construction is how the board
  grows, and the only way the crowding tax on a silo ever eases.
- **Recruit (D2)** — pay food + water. When bumped, take a new worker into your supply. Worker count
  is the main tuning lever for how often turns fall back to (C); starting count **TBD from
  playtest**.
- **Machinery (E1)** — pay metal. Choose a **single zone in a B silo**; when bumped, place your
  machinery marker beside that zone. Anyone may still work the zone; **your** workers get a bonus
  yield there. Exclusive to its maker.
- **Polymers (E2)** — pay chemical. Same shape as machinery, targeting a **single zone in a C silo**:
  your workers convert better there.
- **Upgraded worker (E3)** — pay food. Returns an improved worker. **What it does is TBD.**
  Candidates: places below the marker, occupies a zone with a shorter duration, yields as if one zone
  higher, counts as an extra atom.
- **Special Projects (F1)** — single-zone silo for late-game sinks. **Not in v1.**

## Components & Information

- **Silo board** with covered zones (cover tiles), tick tracks, and one time marker per silo.
- **Workers** per player (count TBD), plus upgraded-worker variants.
- **Machinery / polymer markers** per player, placed on zone sides.
- **Cover markers** per player, to claim a zone under construction.
- **Goods** as cubes or a tracked supply — all six held openly.
- **All information is open**: supplies public, every zone's cost and yield printed, marker positions
  visible. The only hidden thing is what the next player will tick.

## End & Players

- **Player count:** TBD; the diversification rule and small silos suggest 2–4.
- **End trigger and scoring:** **TBD.** Known VP sources so far: construction reveals. Open
  candidates: machinery/polymer placements, special projects, leftover goods by value. First goal
  is a working A–D loop; scoring is tuned after that loop feels right.

## Design Tensions to Watch

- **Closed-silo deadlock.** A silo with its marker high and its upper zones full is sealed until
  someone ticks it, and ticking it pays the workers already inside. Watch whether the player who
  needs in ever wants to be the one who pays the tempo, or whether silos sit closed for whole rounds.
- **Advancing as gift.** Ticking is pure tempo and often helps a rival more than you. Watch whether
  players simply refuse to tick contested silos, leaving (A) as the default turn and grinding the
  game to place-only until workers run out.
- **Worker starvation.** Two atoms a turn with workers stranded in silos means (C) turns are forced,
  not chosen. Watch how often that happens at the starting worker count, and whether D2 is worth
  its food + water when the alternative is waiting.
- **Deferred upgrades.** Machinery, polymers and construction all take effect on bump, so an
  upgrade can sit unrealised for turns while opponents choose not to tick. Watch whether this feels
  like tension or like being held hostage, especially in 2-zone silos where one rival worker above
  you controls your timing.
- **Height vs wait.** Higher zones pay more but wait longer. Watch whether the extra yield actually
  compensates, or whether the bottom zone is always correct and height is just a penalty.
- **Value tuning holds at +2/+3/+4.** Every lower zone nets +2 to +4 by the goods table. Re-derive
  after any recipe change; a converter that drifts to neutral is slower than raw extraction, not
  just worse.
- **Construction as the only relief valve.** Revealing zones is the sole way the board grows, and
  it also pays VP. Watch whether the player who builds is rewarded or just subsidising everyone's
  access.

## Setup

- Board with upper zones **covered** (exact starting reveal per silo TBD). All markers at the bottom.
- Each player: starting workers (TBD), empty supply.
- First turn is necessarily two placements or a placement into A with no goods to spend elsewhere —
  starting goods TBD.

## Prototype (v0)

Print-and-play pages live in `src/games/regolith`. The existing hex-tile pages are the previous
design and will be retired.

- **Silo board:** twelve silos with zone costs/yields/durations printed, tick tracks, cover tiles.
- **Player aid:** the three turn shapes, the lock/bump/reset rules, goods value table.
- Cubes or tokens for goods, meeples for workers, a marker per silo for time, small markers per
  player for machinery, polymers and construction claims.

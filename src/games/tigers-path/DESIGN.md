# Tiger's Path

Working title. Path-and-clearing network game heavily inspired by **Hansa Teutonica**, with one
central twist: **board pieces are not player-owned**. All players interact with a shared pool of
five animal types.

## The Animals

| Animal   | Color  | Rank | In Jungle bag |
| -------- | ------ | ---- | ------------- |
| Tiger    | Orange | 1    | 26            |
| Elephant | Grey   | 2    | 28            |
| Monkey   | Brown  | 3    | 30            |
| Boar     | Purple | 4    | 32            |
| Snake    | Green  | 5    | 34            |

- **Contest hierarchy:** T > E > M > B > S. Tigers cannot be contested.
- **Rarity offsets rank:** stronger animals are rarer in the Jungle bag. The taper is deliberately
  gentle — enough tigers to complete paths, but you'll likely bootstrap your engine with weaker
  animals first.
- Each animal type keys one of the five **engine tracks** (see Engine).

## Board

- Network of **clearings** connected by **paths** made of spaces (Hansa-style).

## Turn Structure

**2 actions per turn** by default. Choose from:

- **(A) Claim a path** — pick an **empty** path of length N. Pay **N animals of one type X** from
  your sanctuary to fill every space **at once** (atomic — there is no placing cube-by-cube). The N
  animals **stay on the path** as a claimed structure, until someone contests it. Advances your **X
  engine track**.
- **(B) Claim a clearing** — pick a clearing **adjacent to a path already claimed with animal type
  X** (any player's claim qualifies — paths aren't owned, so this can run off infrastructure someone
  else built). Pay animals of type X from your sanctuary to fill an empty slot (cost is printed on
  the slot — see Clearings). The **paid cubes return to the Jungle bag**, and you place **one disc**
  of type X's color in the slot to mark its presence. Advances your **X engine track**.
- **(C) Contest a path** — target an **undefended full path** of length N. Pay **N+1 animals of a
  strictly higher-ranked type** than the path's current occupant, from your sanctuary (snakes can
  never contest; tigers can never be contested — both automatic consequences of the hierarchy). All
  **N contested animals go to the Jungle bag**, and the **+1 premium also goes to the Jungle bag**.
  Your N animals then fill the path as your new claim, same as (A). A path is **defended** —
  uncontestable — when the animal occupying it also has a **disc in both clearings it connects**.
- **(D) Recruit from the Jungle** — draw **N** animals from the Jungle bag (N = your Snake track).
  Choose **1 animal type**: keep **all** drawn animals of that type into your **sanctuary**. Every
  other drawn animal goes to the **Grasslands zone**. (An all-one-type draw keeps everything — no
  leak that turn; a mixed draw leaks more. The variance is deliberate.)
- **(E) Recruit from the Grasslands** — choose **1 animal type** present in the Grasslands zone.
  Take **up to N** animals of that type into your sanctuary (N = your **Monkey track**; take fewer
  if the zone holds fewer than N of that type).

## Clearings: Animal Presence

**Clearings track animal presence only — never player involvement.** No player markers, no
ownership. **Claim a clearing** (a distinct atomic action from claiming a path — see Turn Structure)
pays animals of type X to fill a slot in a clearing adjacent to an X-claimed path, placing one
X-colored disc there. Anyone can do this off anyone's claimed path.

Each clearing prints **1–4 slots**, and the count/mix varies per clearing (like path length varies
2/3/4). Each slot shows:

- an **inscribed shape** marking its **level** — Circle (1) < Triangle (2) < Square (3) < Pentagon
  (4)
- a **number** — the cost, in animals of type X, to fill it

Example: a slot drawn as a Circle containing the number 2 is a **level-1 slot** — the lowest level a
clearing can offer — filled by paying **2 animals of type X**.

- **Filling a slot is atomic**: pay the printed number of type-X animals at once (they go back to
  the Jungle bag), and place one disc. The slot is then **permanently occupied** — there's no
  clearing-equivalent of Contest, so once filled, a slot is gone for the rest of the game.
- **Slot level is gated by the Boar track.** Boar's power reads directly off the shape scale: its
  printed values (2/3/3/4/4/5/5/5) give the four thresholds — Circle ≥2, Triangle ≥3, Square ≥4,
  Pentagon ≥5. Everyone can fill Circle slots from the start; only a maxed-out Boar track reaches
  Pentagon. **The Powers board prints each shape next to the track value that unlocks it**, so the
  mapping is visible on the board, not just in the rules.
- **Slots fill in any order**, as soon as they're unlocked — no escalating ladder, no dependency
  between slots beyond sharing the clearing's printed spaces.

## Engine

**Five tracks, one per animal.** Advancing a track unlocks powers:

| Track    | Power                                               | Values (start → max)          |
| -------- | --------------------------------------------------- | ----------------------------- |
| Tiger    | Actions per turn                                    | 2 / 3 / 3 / 4 / 4 / 5 / 5 / 5 |
| Elephant | End-game score multiplier                           | 1 / 2 / 2 / 3 / 3 / 4 / 4 / 4 |
| Monkey   | Grasslands recruit size (take N, all of 1 type) (E) | 1 / 2 / 2 / 3 / 3 / 4 / 4 / 4 |
| Boar     | Clearing slots you can fill (this shape & smaller)  | 2 / 3 / 3 / 4 / 4 / 5 / 5 / 5 |
| Snake    | Jungle recruit size (D): draw N, keep 1 type        | 2 / 3 / 3 / 4 / 4 / 5 / 5 / 5 |

- **Eight positions per track** (start + 7 upgrades). Tracks advance by **claiming a path or a
  clearing of that animal type** — no separate spend, and both actions advance it.
- **The final position triggers the end game** and repeats the previous value — it grants no new
  power, only arms the trigger.
- **Repeated values (3/3, 4/4, 5/5) are deliberate ramp-damping** — not every step is a new tier.
  Without the plateaus the engine would spiral out of control.

## Components & Information

- **Cubes** = animals on paths (five colors), and the currency paid for everything.
- **Discs** = animal presence in clearings (same five colors). One disc per filled slot — presence
  is binary. Discs are unowned; the cubes you pay for a slot return to the Jungle bag.
- **All information is open**: sanctuaries public, Jungle bag contents deducible.

## End & Players

- **2–5 players** (target).
- **End trigger:** the instant any player reaches the **final position** of any track, the game ends
  **immediately** — no finish-the-round. Triggering is a weapon (you can end the game on a turn
  that's good for you and bad for an opponent).
- Scoring is settled — see the **Player Aid**.

## Design Tensions to Watch

- **Free-rider problem, moved to clearings:** Claim Path and Claim Clearing are separate actions,
  and Claim Clearing can run off **anyone's** claimed path. Watch whether harvesting a clearing off
  a path someone else paid to build (and already got a track advance from) feels clever or feels bad
  — it's the same tension the old shared-placement mechanic had, just relocated.
- **Claim snowball:** paths stay claimed permanently once filled, so the board only fills in one
  direction — contesting is the sole way back in. Watch whether the late game stalls once empty
  paths run out and no one can afford the N+1 contest cost on the paths that remain.
- **Tiger paths as monuments:** since nothing outranks Tiger, a Tiger-claimed path can **never** be
  contested — it's permanent for the rest of the game. Watch whether that makes early Tiger claims
  too strong (locking board territory forever) given only 26 in circulation.
- **Defended paths as earned monuments:** any path becomes uncontestable once its animal type holds
  a disc in both connected clearings — a permanence non-Tiger animals can _earn_ (≈3 actions: the
  path plus both end clearings). It rewards the path/clearing synergy and hardens the short-path
  denial game (a defended block can't be taxed through). Watch whether it accelerates board lock-up
  (compounding the stall above) and whether the 3-action cost keeps it from being a default.
- **Clearing slots as monuments too:** filled slots have no Contest equivalent either — once paid, a
  slot is blocked for the rest of the game. Watch whether this makes cheap Circle slots an early
  rush (grab low-friction blocking before anyone else can afford it) and whether Square/Pentagon
  slots ever get filled before the game naturally ends, given Boar has to be leveled to reach them.
- **Jungle bag as shared economy:** action (D) gifts every non-kept-type animal to the Grasslands
  zone (0 on a lucky all-one-type draw, more on a mixed one); contesting gifts the full N contested
  animals **plus** the +1 premium to the Jungle bag. Aggression leaks much harder than drawing does
  now — watch whether N+1 (a whole path plus a track advance) is actually worth it versus just
  claiming an empty path instead.

## Setup

- Board starts **empty**. Sanctuaries start **empty**. All tracks at start position.
- First player's opening move is necessarily a recruit from the Jungle.

## Prototype (v0)

Print-and-play pages live in `src/games/tigers-path`.

- **Powers board:** 5 tracks × 8 positions, sized for 5 player markers.
- **Player aid:** actions A–E, hierarchy, clearing slot levels (shape → Boar threshold), scoring.
- Cubes for animals on paths; discs for clearing presence; any drawstring bag (for the Jungle) and
  player markers.

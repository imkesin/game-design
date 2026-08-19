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

- **(A) Claim a path** — pick an **empty** path of length N. Pay **N animals of one type X**
  from your personal supply to fill every space **at once** (atomic — there is no placing
  cube-by-cube). The N animals **stay on the path** as a claimed structure, until someone
  contests it. Advances your **X engine track**.
- **(B) Claim a clearing** — pick a clearing **adjacent to a path already claimed with animal
  type X** (any player's claim qualifies — paths aren't owned, so this can run off infrastructure
  someone else built). Pay animals of type X from your personal supply into the clearing (cost is
  printed on the clearing itself, per slot — see Clearings). Advances your **X engine track**.
- **(C) Contest a path** — target a **full path** of length N. Pay **N+1 animals of a strictly
  higher-ranked type** than the path's current occupant, from your personal supply (snakes can
  never contest; tigers can never be contested — both automatic consequences of the hierarchy). All
  **N contested animals go to the Jungle bag**, and the **+1 premium also goes to the Jungle bag**.
  Your N animals then fill the path as your new claim, same as (A).
- **(D) Recruit from the Jungle** — draw **N** animals from the Jungle bag (N = your Snake track).
  Choose **1 animal type**: keep **all** drawn animals of that type into your **personal supply**.
  Every other drawn animal goes to the **Grasslands zone**. (An all-one-type draw keeps everything —
  no leak that turn; a mixed draw leaks more. The variance is deliberate.)
- **(E) Recruit from the Grasslands** — choose **1 animal type** present in the Grasslands zone.
  Take **up to N** animals of that type into your personal supply (N = your **Monkey track**; take
  fewer if the zone holds fewer than N of that type).

## Clearings: Animal Presence

**Clearings track animal presence only — never player involvement.** No player markers, no
ownership. **Claim a clearing** (a distinct atomic action from claiming a path — see Turn
Structure) pays animals of type X into a clearing adjacent to an X-claimed path, growing that
type's presence there. Anyone can do this off anyone's claimed path.

Each clearing prints **1–4 slots**, and the count/mix varies per clearing (like path length varies
2/3/4 — some clearings offer only a Circle slot, some run the whole way to Pentagon). Each slot
shows:

- an **inscribed shape** marking its **level** — Circle (1) < Triangle (2) < Square (3) < Pentagon (4)
- a **number** — the cost, in animals of type X, to fill it

Example: a slot drawn as a Circle containing the number 2 is a **level-1 slot** — the lowest level
a clearing can offer — filled by paying **2 animals of type X**.

- **Filling a slot is atomic**: pay the printed number of type-X animals at once, same as claiming
  a path. The slot is then **permanently occupied** — there's no clearing-equivalent of Contest,
  so once filled, a slot is gone for the rest of the game.
- **Slot level is gated by the Boar track.** Boar's power ("Clearing capacity you may add into")
  now reads directly off the shape scale: its printed values (2/3/3/4/4/5) are the four
  thresholds — Circle ≥2, Triangle ≥3, Square ≥4, Pentagon ≥5. Everyone can fill Circle slots from
  the start; only a maxed-out Boar track reaches Pentagon. **The Powers board should print each
  shape next to the track value that unlocks it**, so the mapping is visible on the board, not just
  in the rules.
- **Slots fill in any order**, as soon as they're unlocked — no escalating ladder, no
  group-growing, no dependency between slots beyond sharing the clearing's printed spaces. This
  replaces the old Liar's Dice ladder entirely.

**Clearings are a blocking resource, not a payout.** Filling a slot still advances your engine
track (as always) and permanently denies that slot's capacity to every other player, but nothing is
scored at the clearing itself. Scoring is planned to run entirely through **network strength**
(Elephant's end-game multiplier) instead — see Engine and Open Questions.

## Engine

**Five tracks, one per animal.** Advancing a track unlocks powers:

| Track    | Power                                              | Values (start → max)  |
| -------- | --------------------------------------------------- | --------------------- |
| Tiger    | Actions per turn                                   | 2 / 3 / 3 / 4 / 4 / 5 |
| Elephant | End-game multiplier on your largest established network | 1 / 2 / 3 / 4 / 5 / 6 |
| Monkey   | Animals recruited from the Grasslands zone (E)     | 1 / 2 / 2 / 3 / 3 / 4 |
| Boar     | Clearing capacity you may add into                 | 2 / 3 / 3 / 4 / 4 / 5 |
| Snake    | Jungle recruit size (D): draw N, keep 1 type       | 2 / 3 / 3 / 4 / 4 / 5 |

Six positions per track (start + 5 upgrades). Tracks advance by **claiming a path or a clearing
of that animal type** — no separate spend, and both actions advance it.

## Components & Information

- **Cubes** = animals on paths (five colors).
- **Round discs** = animal presence in clearings (same five colors; a filled slot holds discs of
  one type, count = the number printed on the slot). Discs are unowned — no player identity
  anywhere on the map.
- **All information is open**: personal supplies public, Jungle bag contents deducible.

## Players, End, Scoring

- **2–5 players** (target).
- End trigger undecided. Leading candidates: all clearings occupied, or a player reaching the top of
  a power track.
- Scoring plan has shifted: clearings no longer pay out directly (see Clearings), so the current
  tilt routes scoring entirely through **network strength** — Elephant's end-game multiplier. That
  reverses the earlier "not entirely end-game" stance; whether any non-end-game scoring survives
  is open — see Open Questions.

## Design Tensions to Watch

- **Free-rider problem, moved to clearings:** Claim Path and Claim Clearing are separate actions,
  and Claim Clearing can run off **anyone's** claimed path. Watch whether harvesting a clearing off
  a path someone else paid to build (and already got a track advance from) feels clever or feels
  bad — it's the same tension the old shared-placement mechanic had, just relocated.
- **Claim snowball:** paths now stay claimed permanently once filled, so the board only fills in
  one direction — contesting is the sole way back in. Watch whether the late game stalls once
  empty paths run out and no one can afford the N+1 contest cost on the paths that remain.
- **Tiger paths as monuments:** since nothing outranks Tiger, a Tiger-claimed path can **never**
  be contested — it's permanent for the rest of the game. Watch whether that makes early Tiger
  claims too strong (locking board territory forever) given only 26 in circulation.
- **Clearing slots as monuments too:** filled slots have no Contest equivalent either — once paid,
  a slot is blocked for the rest of the game. Watch whether this makes cheap Circle slots an early
  rush (grab low-friction blocking before anyone else can afford it) and whether Square/Pentagon
  slots ever get filled before the game naturally ends, given Boar has to be leveled to reach them.
- **Jungle bag as shared economy:** action (D) gifts every non-kept-type animal to the Grasslands
  zone (0 on a lucky all-one-type draw, more on a mixed one); contesting gifts the full N contested
  animals **plus** the +1 premium to the Jungle bag. Aggression leaks much harder than drawing does
  now — watch whether N+1 (a whole path + a re-paid clearing bid + a track advance) is actually
  worth it versus just claiming an empty path instead.

## Open Questions

- Scoring cadence: the network-strength tilt reads as entirely end-game (Elephant's multiplier
  fires once, at game end) — is there any interim/non-end-game scoring left, or is end-game the
  whole game now?
- End trigger.
- **Established network** — now the single scoring mechanism, so this is the load-bearing open
  question: Elephant's multiplier scores "your largest established network" of clearings, still
  undefined. Candidates: clearings linked by paths of your Elephant-claimed type; clearings whose
  slots you personally filled, regardless of adjacency; some connectivity rule over claimed paths
  independent of animal type. (The old "top shareholder" candidate is gone along with clearing
  dominance.)
- Clearing slot counts/shapes per clearing: 9 clearings need a printed 1–4 slot layout each (level
  mix per clearing) — not yet designed, parallel to how path lengths were chosen for the v0 map.

## Setup

- Board starts **empty**. Personal supplies start **empty**. All tracks at start position.
- First player's opening move is necessarily a recruit from the Jungle.

## Prototype (v0)

Print-and-play pages live in `src/games/tigers-path`. No scoring — playtest the action economy and
see what feels interesting.

- **Main board:** 9 clearings, 12 paths (3×2, 6×3, 3×4 — short paths kept scarce).
- **Powers board:** 5 tracks × 6 positions, sized for 5 player markers.
- **Player aid:** actions A–E, hierarchy, clearing slot levels (shape → Boar threshold).
- Cubes double as clearing discs; any drawstring bag (for the Jungle) and player markers work.

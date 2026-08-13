# Tiger's Path

Working title. Route-and-office network game heavily inspired by **Hansa Teutonica**, with one
central twist: **board pieces are not player-owned**. All players interact with a shared pool of
five animal types.

## The Animals

| Animal   | Color  | Rank | In bag |
| -------- | ------ | ---- | ------ |
| Tiger    | Orange | 1    | 12     |
| Elephant | Grey   | 2    | 14     |
| Monkey   | Brown  | 3    | 16     |
| Boar     | Purple | 4    | 18     |
| Snake    | Green  | 5    | 20     |

- **Displacement hierarchy:** T > E > M > B > S. Tigers cannot be displaced.
- **Rarity offsets rank:** stronger animals are rarer in the bag. The taper is deliberately gentle —
  enough tigers to complete routes, but you'll likely bootstrap your engine with weaker animals
  first.
- Each animal type keys one of the five **engine tracks** (see Engine).

## Board

- Network of **clearings** connected by **routes** made of spaces (Hansa-style).

## Turn Structure

**2 actions per turn** by default. Choose from:

- **(A) Place** — put an animal from your personal supply onto an empty route space.
- **(B) Move** — move animals of the same type **anywhere on the map** (any empty spaces), but
  **only animals on incomplete routes** may move. A full route is locked and can only be broken up
  by displacement — this forces displacement wars over contested routes. (Move count grows via the
  Elephant track.)
- **(C) Displace** — place a **strictly higher-ranked** animal from your personal supply onto an
  occupied space (snakes can never displace; tigers can never be displaced). **The displacer
  chooses** where the occupant relocates: any route with an empty space (Hansa Teutonica's rule).
  Then **all opposing players draw 1 animal from the bag**. (Deliberate: aggression is taxed harder
  at high player counts.)
- **(D) Claim a route** — requires the route to be **full of a single animal type**. Move all
  animals off the route, and pay **extra animals of that type from your personal supply** into a
  clearing at either end of the route (this is your bid — see Clearings). Of the route animals: **1
  goes to the general supply, the rest go into the bag**. Claiming with type X also **advances your
  X engine track**.
- **(E) Bag pull** — draw 2 animals from the bag: 1 to the **general supply**, 1 to your **personal
  supply**.
- **(F) Take** — take 1 animal from the general supply into your personal supply.

## Clearings: Animal Presence

**Clearings track animal presence only — never player involvement.** No player markers, no
ownership. Claiming a route pays extra animals (as discs) into an adjacent clearing, growing that
animal type's presence there.

Entry escalates on a **Liar's Dice ladder** — groups of a single animal type, ordered by count
first, then rank:

```
1S < 1B < 1M < 1E < 1T < 2S < 2B < 2M < 2E < 2T < 3S < ...
```

- First animal into an empty clearing: **1 extra** (1S is the floor).
- Each later entry must be **strictly higher on the ladder** than the highest group already present.
  (After 1 boar enters, the next entry needs 1 monkey+, or 2 snakes, etc.)
- Groups cannot be grown after entry, and each group must be a **different animal type**.
- A clearing holds **2 types by default**; adding a 3rd requires **Boar track powers**.

**Dominance = the highest ladder group in the clearing** (so the most recent entry always
dominates). How players profit is undecided; current tilt: **top shareholder** — the player with the
highest engine track in the dominant animal scores the clearing.

## Engine

**Five tracks, one per animal.** Advancing a track unlocks powers:

| Track    | Power                                     | Values (start → max)  |
| -------- | ----------------------------------------- | --------------------- |
| Tiger    | Actions per turn                          | 2 / 3 / 3 / 4 / 4 / 5 |
| Elephant | Number of pieces you can Move (B)         | 2 / 3 / 3 / 4 / 4 / 5 |
| Monkey   | Animals taken from general supply (F)     | 1 / 2 / 2 / 3 / 3 / 4 |
| Boar     | Clearing capacity you may add into        | 2 / 3 / 3 / 4 / 4 / 5 |
| Snake    | Bag pull size (E): keep N−1, put 1 public | 2 / 3 / 3 / 4 / 4 / 5 |

Six positions per track (start + 5 upgrades). Tracks advance by **claiming routes of that animal
type** — no separate spend.

## Components & Information

- **Cubes** = animals on routes (five colors).
- **Round discs** = animal presence in clearings (same five colors; two green discs = a 2-snake
  group). Discs are unowned — no player identity anywhere on the map.
- **All information is open**: personal supplies public, bag contents deducible.

## Players, End, Scoring

- **2–5 players** (target).
- End trigger undecided. Leading candidates: all clearings occupied, or a player reaching the top of
  a power track.
- Scoring undecided beyond: clearing dominance matters, top-shareholder payout is the tilt, and it
  will **not** be entirely end-game scoring.

## Design Tensions to Watch

- **Free-rider problem:** placement builds shared board state; the claim action + personal-supply
  payment is the gate that makes work claimable. Watch whether sniping a route someone else filled
  feels clever or feels bad.
- **Bag as shared economy:** action (E) always gifts one animal to the general supply, and
  displacement gifts a draw to every opponent. Aggression and drawing both leak value to the table —
  self-balancing, but tune the leak rate.
- **Tiger supply pressure:** tigers are undisplacable and top-tier on the ladder, and the bag taper
  (12 vs 20 snakes) is deliberately gentle. Watch for tiger monoculture in playtests — bag counts
  are the first-order balance knob if it appears.

## Open Questions

- Clearing point values: what does a clearing pay when scored?
- Payout mechanism: top-shareholder is the tilt, not locked. Ties on track level?
- Scoring cadence: not entirely end-game — but what triggers interim payouts?
- Clearing capacity: counted in **animals** or **types**? (Boar values suggest animals; a 2-snake
  first entry would then already fill a base clearing.)
- End trigger.

## Setup

- Board starts **empty**. Personal supplies start **empty**. All tracks at start position.
- First player's opening move is necessarily a bag pull.

## Prototype (v0)

Print-and-play pages live in `src/games/tigers-path`. No scoring — playtest the action economy and
see what feels interesting.

- **Main board:** 9 clearings, 12 routes (3×2, 6×3, 3×4 — short routes kept scarce).
- **Powers board:** 5 tracks × 6 positions, sized for 5 player markers.
- **Player aid:** actions A–F, ladder, hierarchy.
- Cubes double as clearing discs; any bag and player markers work.

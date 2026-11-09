# Fiber: action tiles and flip actions (thinking doc, not for print)

Draft 2026-11-05, revised 2026-11-06. Anything unknown is a **placeholder** (`$A`, `[who]`, `TBD`),
not an invented number. Companion to [DESIGN.md](./DESIGN.md).

## Two kinds of actions

|            | **Tile actions** (12 tiles)                       | **Flip actions** (6, fixed on the board)          |
| ---------- | ------------------------------------------------- | ------------------------------------------------- |
| What       | Card-specific action, Day face or Night face.     | Other actions triggered when a tile is flipped.   |
| Position   | **Variable**: tiles are shuffled into slots at setup, never move in play. | **Fixed** at printed positions on the board.      |
| Triggered by | Placing a worker on the tile.                   | Flipping the tile that sits in the linked slot.   |

- 12 tiles + 6 flip actions is the preferred shape (elegance), not a hard number.
- Flip actions are **actions**, not events: they belong to the game's engine and come back again
  and again. (My first draft treated them as one-off effects with markers. That was wrong.)
- Every flip also triggers **Refinance** (every player: income, then optionally 1 ladder step).
- Link between slots and flip actions: each flip action serves a pair of slots (start here).

## Story: every tile is a department with a Day shift and a Night shift

- **Day** (white workers): visible, public, field-facing. Baseline.
- **Night** (black workers): off-hours. Quiet, premium, back-office; trades cost for reach or a twist.
- **Design rule:** black-worker players must never feel punished; Night is *different*, not worse.
- **Tiles shuffle**, so each must be balanced independent of whichever slot it lands in.
- Terms: **Day / Night** for tile faces; **Lit / Unlit** for Hubs.

## Placeholder key

| Symbol | Meaning                                  | Guess        |
| ------ | ---------------------------------------- | ------------ |
| `$A`   | Night surcharge / small discount step    | $1           |
| `$L`   | Loan size                                | ~$5          |
| `$R`   | Roadshow payout                          | ~$3          |
| `$S`   | Price per Receipt when securitized       | ~$2          |
| `$I`   | IRU sale payout                          | ~$3          |
| `$T`   | Tariff increase cost                     | ~$2          |
| `$P`   | Discount-plan cash now                   | ~$4          |
| `$B`   | Settlement rebate on a Commissioner build | ~$2         |
| `$N`   | Anchor "serve" payout                    | ~$3          |
| `D`    | Income lost per Debt marker              | 1            |

## The 12 tile actions

| #  | Tile         | Day                                                                              | Night                                                                                   |
| -- | ------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1  | Trench Crew  | Lay 1 cable (printed cost).                                                      | Overnight pull: +`$A`, lay 1 cable and drop an Unlit Hub at the far end, no make-ready surcharge. |
| 2  | Pole Crew    | Place 1 Unlit Hub.                                                               | Place 2 Unlit Hubs in different nodes of one Region, +`$A` each.                        |
| 3  | Splice Shop  | Upgrade one of your Hubs to the node's Terminal; the Hub returns to your supply. | Build a Terminal directly (+`$A`) in an empty node your cable reaches. Skips the Hub.   |
| 4  | Canvass      | Light 1 Unlit Hub (drop cost; 2nd lighter in a node pays more).                  | Quiet sale: light 1 Hub with no 2nd-lighter premium, +`$A` flat.                        |
| 5  | Campaign     | Regional Marketing: light all your Unlit Hubs in one Region, paying each drop cost. | Promo: light up to 2 Hubs in one Region at a combined −`$A`.                          |
| 6  | Credit Desk  | Draw a loan: +`$L`, take a Debt marker (−`D` income).                            | Repay: pay `$L`, discard a Debt marker; or refinance debt for a notch-bonus kicker.     |
| 7  | Roadshow     | Pitch investors: take `$R`.                                                      | Securitize: turn in Receipts for `$S` each (spends the proof for cash).                 |
| 8  | Account Exec | Sign a neutral tenant: if a Terminal of yours touches a Legacy Telco blocker or Anchor tile, take 1 Receipt free. | IRU sale: lease an edge you own to a neutral carrier; take `$I`, no Receipt.      |
| 9  | Anchor Desk  | Contract the Anchor Institution in a node where you have a Lit Hub: take its benefit marker. | Serve the anchor: collect its benefit once now, e.g. `$N` / Receipt.            |
| 10 | Tariff Desk  | Raise prices: pay `$T`, income track +1 (permanent).                             | Discount plan: income track −1, take `$P` now.                                          |
| 11 | Lobbyist     | Move the Commissioner to a node with equal or less coverage.                     | Grant writer: if you have a Hub in the Commissioner's node, take 1 BEAD token.          |
| 12 | Counsel      | Pole-attachment settlement: lay a cable into the Commissioner's node at −`$B`.   | Clear a Legacy Telco blocker adjacent to your cable (pay its printed price); take its slot. |

Notes:

- Tile 2 Night burns Hub supply fast, pulling the end trigger closer. Intended.
- Tile 8 Day is the Wholesale proof's safety valve when rivals won't route through you.
- BEAD tokens also come from building into the Commissioner's node; both sources drain the
  finite pool.
- Debt (tile 6) is my addition; not confirmed.
- Pressure balance, loosely: builder 1-3, marketing 4-5, financier 6-10, opportunist 11-12.
  Opportunist is thin.

## The 6 flip actions (fixed on the board)

Known so far:

- They are actions, fixed at board positions, triggered by flipping the tile in a linked slot.
- They are "global": more than the flipper's own business.
- They are **meta-progression** (user, 2026-11-06): flips come less often than tile actions, so
  these move the long game forward (permanent or structural change), not the turn-to-turn
  economy. No clear rule for what they are yet.
- One example from the original intake: **a region's networks collect income** (subscribers pay).
  Check whether that is meta-progression enough, or belongs to Refinance's income step.
- **Refinance** fires on every flip regardless (not one of the six).

Meta-progression candidates to think with (none chosen): a permanent income-track bump, advancing a
shared track, unlocking a tier privilege for everyone, Commissioner movement, refreshing or
draining the BEAD pool, revealing or advancing Anchors.

| #  | Flip action | What it does                                                    |
| -- | ----------- | --------------------------------------------------------------- |
| F1 | TBD (candidate: Region income) | `[region]` collects income: each Lit Hub there pays its owner `$i`. `[region]` = TBD (fixed by position? chosen by flipper?). |
| F2 | TBD         | TBD                                                             |
| F3 | TBD         | TBD                                                             |
| F4 | TBD         | TBD                                                             |
| F5 | TBD         | TBD                                                             |
| F6 | TBD         | TBD                                                             |

## Coverage check: every verb has a home

| Verb                    | Day                | Night                  |
| ----------------------- | ------------------ | ---------------------- |
| Lay cable               | 1                  | 1                      |
| Place Hub               | 2                  | 2 (x2)                 |
| Upgrade to Terminal     | 3                  | 3 (direct)             |
| Light a Hub             | 4, 5               | 4, 5                   |
| Move Commissioner       | 11                 | (maybe a flip action)  |
| Collect BEAD            | 12 (rebate)        | 11 (grant)             |
| Clear Legacy blocker    | (none)             | 12                     |
| Get a Receipt           | 8                  | 7 (sell)               |
| Cash                    | 7                  | 6, 8                   |
| Income track            | 10                 | 10                     |
| Anchors                 | 9                  | 9                      |
| Refinance (ladder step) | via flip           | via flip               |

## Open questions

- **What the 6 flip actions are** (biggest gap).
- **Decided 2026-11-05:** tiles are shuffled randomly into slots; tiles never move during play;
  one flip action per slot pair (6), starting there. Direction-based (12) is a later option.
- **Income:** paid at Refinance from a Brass-style track vs. separate. Not confirmed.
- **Debt:** does it earn its place?
- **Crowding:** 12 tiles x 4 workers per player: enough contention at 2/3/4?
- **Flipper's first-mover perk** (DESIGN.md): not chosen.

# Revival

## Overview

In Revival, you manage a construction company cashing in on a city in its second act. A new mayor
has been elected, determined to turn the city around, and is willing to engage the private sector.

Each turn, your company must choose one: break ground on a new development, restore a blighted
building, or finish an existing project. The mayor will move across the city to inspect your work,
offering tax incentives in neighborhoods with less investment.

The company with the most money at the end of the mayor's term will be declared the winner.

## Setup

1. **City**: lay out the board.
2. **Blight**: shuffle the 8 blight cards and deal one to each row and column along the west and
   north edges. Entry 1 is the neighborhood nearest the card.
3. **Historical** (2–3 players): deal the 8 historical cards along the east and south edges and
   place them the same way as blight. When you place a historical building, put its cube on it.
4. **Agenda**: shuffle the 16 agenda cards and remove some (table). Reveal the first card, move the
   mayor to that neighborhood, and remove the card from play. Reveal 2 more face up beside the
   board: the mayor's agenda.
5. **Row**: shuffle the building tiles and deal the row face up (table). Parks go in a supply beside
   it.

| Players | Tiles in row | Agenda cards to remove | Historical buildings |
| ------- | ------------ | ---------------------- | -------------------- |
| **2**   | 5            | 1                      | All                  |
| **3**   | 6            | 3                      | Badged 3 only        |
| **4**   | 6            | 0                      | None                 |
| **5**   | 7            | 3                      | None                 |

6. **Companies**: each player takes a company mat and 3 workers. The first player gets 4 coins, the
   second 5, and so on.

## Your turn

Do **one** action. You can't pass.

- **Break ground** on an empty plot: put down a tile and one of your workers.
  - **Row tile**: pay its cost (gold coin).
  - **Park**: free, from the supply. Discard one tile from the row.
  - Take any incentives on the plot.
- **Restore a blight**: pay TODO (cost undecided) and put **two** workers on it.
- **Pick up a worker** from one of your plots:
  - **Knock down**: on a blight, swap it for a **row tile** of your pick (don't pay its cost),
    construction side up. It's now an ordinary project with one worker.
  - **Finish**: take your last worker off, flip the tile to its finished side, and **sell it**
    (below). If the mayor is in this neighborhood, take 1 incentive.

**End of turn**: if **2 or fewer tiles** are left in the row, you're the **walker**: the mayor
walks. Then refill the row.

## Selling

Values are on your sale card. Only **finished** buildings count; a tile with a worker on it counts
for nothing.

- **Park**: 1.
- **House**: 3, +1 per Park in its neighborhood. **Can't be finished while any blight stands in its
  neighborhood** (even one with workers on it). Put a **demand cube** on it.
- **Commercial**: 2, +1 per demand cube taken. Put a **Commercial cube** on it.
- **Industrial**: 1, +3 per Commercial cube taken.
- **Taking cubes**: count the finished buildings of its own type in its neighborhood, itself and
  historical ones included: **n**. Take **up to 1 + n** cubes (you must take what you can): its own
  neighborhood first, then
  - **Commercial**: the 4 adjacent neighborhoods.
  - **Industrial**: the neighborhoods in its row and column.

## The mayor's walk

1. **Target**: the walker picks one of the 2 face-up agenda cards, and an L-shaped path to it (at
   most one turn).
2. **Visits**: every neighborhood the mayor enters, destination included (not his start). On each,
   the first that applies:
   1. **An empty plot** → the walker puts 1 incentive on one (they stack).
   2. **Blight** → the walker picks one to knock down. With workers: 1 of them comes off and its
      owner knocks it down (their pick from the row). Without: the tile leaves; the plot is empty.
   3. **Neither** → **tax**: each company pays 1 coin per plot it has a worker on there. Can't pay:
      abandon that many of your plots with workers there (your pick); the tile leaves the game,
      workers come back.
3. **Credit**: every company collects its credit rating in coins.
4. **Upgrades**: everyone **except the walker** may spend incentives (mat):
   - Credit rating +1 step for 2 / 3 / 4 incentives (max 3).
   - +1 worker for 3 incentives (max 5).
5. **Agenda**: discard the target and reveal a new card, if any are left.

## End of the game

The game ends after the walk to the **last agenda card**. Then:

1. **Final sale**: every company may finish one project at full value.
2. **Firesale**: every other project with a worker sells for its base value − 1: House 2, Commercial
   1, Industrial 0, Park 0. No Parks or cubes counted.
3. **Most coins wins.**

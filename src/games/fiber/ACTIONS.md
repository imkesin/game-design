# Fiber: action tiles (thinking doc, not for print)

Draft 2026-11-05; **overhauled 2026-11-10** (6 paired tiles, flip actions dropped). Unknowns are
**placeholders** (`$A`, `TBD`), not invented numbers. Companion to [DESIGN.md](./DESIGN.md).

## Shape

- **6 double-sided tiles** beside the map. Each tile is one department: a **Day** action on one face,
  its **Night** counterpart on the other. Only the face-up side is usable, so **6 worker spaces** are
  open at any time.
- **Workers:** white place on Day faces, black on Night faces. Each player starts 2 white + 2 black.
- **Crowding:** a space costs more for each worker already on it.
- **Flip** (a turn's action instead of placing): pick a tile (or fixed order, see open questions),
  **take all workers on it into your own supply** (rivals' too), turn it over. That's all: **no global
  effect, no Refinance, no fixed board actions.**
- **Workers circulate** (2026-11-10): flipping takes rivals' workers, so counts and white/black mix
  shift between players. A flip is also **denial**: it strips a busy tile of everyone's workers.
- **Floor:** at least 1 tile of each side face-up, so the most lopsided board is 5/1.
- **Pattern:** Day usually _starts_ something, Night _completes_ it (place → splice, capitalize →
  refinance, market → bill). Cable/Hub is the exception: Night cable opens nodes for next Day's Hubs.

## Placeholder key

| Symbol | Meaning                          | Guess |
| ------ | -------------------------------- | ----- |
| `$L`   | Capital raised per Capitalization | ~$5   |
| `D`    | Income lost per Debt marker      | 1     |
| `$i`   | Billing per Lit Hub              | TBD   |

## The 6 tiles

| #  | Tile             | Day                                                                       | Night                                                                                 |
| -- | ---------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1  | Construction     | **Place Hubs** (Unlit) in nodes your network already reaches.              | **Lay cable** along an edge (printed dots).                                            |
| 2  | Terminals        | **Place a Terminal**, Unspliced side up, in a node's Terminal slot.        | **Splice:** flip one of your Terminals to Active. Cable may now leave that node.       |
| 3  | Government       | **Gather permits.** TBD.                                                   | **Lobby:** move the Commissioner (only to a node with equal or less coverage).        |
| 4  | Finance          | **Seek capitalization:** take `$L` and a Debt marker.                      | **Refinance:** step the credit ladder (cash + 1 proof); maybe also restructure Debt.  |
| 5  | Sales            | **Marketing:** light Unlit Hubs (drop cost; 2nd lighter in a node pays more). | **Billing:** collect income from your Lit Hubs.                                       |
| 6  | Reinvestment     | Player-board upgrade, Day flavour. TBD.                                    | Player-board upgrade, Night flavour. TBD.                                             |

Tile names are my labels; the verbs are the user's.

### Readings to confirm

- **Construction:** Hubs need cable reach (as before). With Hubs and cable on one tile, Day forces
  **local building** (densify where you already are) before Night **expansion**.
- **Terminals:** placed directly, no longer upgraded from a Hub. Hubs never return to supply, so
  supplies run down faster (see the supply-race end trigger in DESIGN.md).
- **Refinance:** now the **only** source of ladder steps, gated by Night and black workers. The
  metronome becomes "1 step per Refinance action".
- **Billing:** replaces income paid at Refinance / flip-income. Income track (Brass-style) vs
  per-Lit-Hub count still open.
- **Debt** is now in (user named "taking on debt").

## Coverage check

| Verb                    | Where                 |
| ----------------------- | --------------------- |
| Place Hub               | 1 Day                 |
| Lay cable               | 1 Night               |
| Place Terminal          | 2 Day                 |
| Activate Terminal       | 2 Night               |
| Permits                 | 3 Day (TBD)           |
| Move Commissioner       | 3 Night               |
| Cash / Debt             | 4 Day                 |
| Ladder step             | 4 Night               |
| Light a Hub             | 5 Day                 |
| Income                  | 5 Night               |
| Player-board upgrades   | 6 Day / 6 Night (TBD) |
| BEAD grant              | building into Commissioner's node (unchanged); maybe permits |
| Receipts                | rivals building/lighting through your Terminal (unchanged)   |

Dropped from the old 12-tile draft: Anchor Desk, Tariff Desk, Roadshow/securitize, IRU sale, Legacy
blocker clearing, Commissioner settlement. Some may return as Reinvestment upgrades.

## Open questions

- **Permits:** what they are and what they gate.
- **Reinvestment:** what the player board upgrades; how Day and Night upgrades differ.
- **Ladder pace:** Refinance is Night-only. If Finance sits on Day a long time, nobody climbs. Is that
  a feature (flip pressure) or a stall?
- **Crowding:** 6 spaces, up to 16 workers at 4p, color-locked. Likely very tight; crowding cost
  scale matters a lot.
- **Flip choice / sweep (user proposal, 2026-11-10):** all 6 tiles start **Day**. Flips sweep in a
  fixed order, end to end, until all are Night, then sweep back to Day. Fixed order makes the
  next-to-flip tile a known prize but removes free-pick denial. Not final.
- **Flip spam** (soaking workers by flipping repeatedly): user says don't worry about it for now.
- **Tile order:** fixed or shuffled at setup?
- **Flipper's perk:** probably unneeded; taking rivals' workers is the reward.
- **Worker hoarding:** can one player snowball workers? Is there a cap, or a floor for a player left
  with none (flip is always available, so an empty hand can still act)?
- **Crowding** (user agrees it's the worst problem): 6 actions is a deliberate trim; fix by cost
  scale or worker count, not more tiles.

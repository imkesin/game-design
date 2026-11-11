# Fiber (working title)

- **Status:** seed (title "Fiber" chosen 2026-11-04). 2026-11-05: merged second design thread
  (credit ladder, lit/unlit Hubs, BEAD Commissioner). Nothing is numbered, mapped or playtested.
- **One-liner:** Each player is a startup ISP extending fiber along the I-35 corridor (Austin to San
  Antonio), building cable and relay hubs, lighting neighborhoods, and climbing the credit-rating
  ladder before the financing window closes.
- **Inspired by:** Brass (connected network, income track), Terra Mystica (on-board upgrades),
  Concordia (compact regions), Hansa Teutonica (variable route costs), Barrage (parasitic use of
  rival infrastructure).

## Design philosophy

Euro-style, high-interaction spatial strategy, low admin overhead. Theme is grounded in real telecom
physics and finance: the ~12-mile optical reach limit, CapEx vs. OpEx, and "Dig Once" / open-access
colocation rules. Bureaucratic friction (pole-attachment fights, terrain) is **baked into printed
edge costs**, not tracked as permits.

### Three competing pressures

1. **Speculative builder (footprint):** claim high-leverage corridors and cheap pole slots before
   rivals, bleeding cash.
2. **Financial engineer (credit):** turn physical presence into cash-flowing assets so the rating
   agencies upgrade you.
3. **Public-private opportunist (subsidies):** divert trunks to underserved nodes to capture BEAD
   grants that subsidize the core network.

## Terminology

Provisional; audit when the pitch is written. Source thread used PoP/FDH; game terms stay
Terminal/Hub unless the user says otherwise.

- **Node**: a "Compound District", a town or district on the map. 1 Terminal slot, 2 Hub slots.
  Piece sizes (Terminal 20mm cube, Hub Ø15 × 10mm disc) and the node pad: see
  [COMPONENTS.md](./COMPONENTS.md).
- **Region**: a group of 2–3 nodes (Concordia-style). Unit of Marketing and of density thresholds.
- **Terminal** (real-world PoP): active relay facility. Large slot, one per node. Required before
  cable can leave the node. Earns rent from rivals routing through.
- **Hub** (real-world FDH): neighborhood splitter cabinet on utility poles. Small slot, two per node.
  Two-sided token: **Unlit** (homes passed) / **Lit** (homes connected).
- **Feeder cable**: an edge between nodes (buried middle-mile trunk).
- **Dark Fiber spine**: the highway backbone the map is anchored on.
- **Commissioner**: neutral pawn marking where BEAD grants are awarded.
- **Receipt**: token proving a rival paid to use your infrastructure (rental contract).

## Kernel

### Map

About 30 nodes on a graph anchored by the Dark Fiber spine, grouped into regions of 2–3 nodes.
Long-distance backbone links are abstracted into single-point entry links.

### Node lifecycle

1. Reach an empty node by cable. Drop an **Unlit** Hub into a small slot: secures the pole slot and
   territory, **$0 income**, **does not count** for the credit ladder. The node is a dead-end leaf.
2. **Light** the Hub (Marketing) to flip it permanently: recurring income, counts for density
   thresholds.
3. Place a Terminal (Day, **Unspliced** side up) in the node's single Terminal slot, then
   **Splice** it (Night, flip to Active). Placed directly; no longer upgraded from a Hub (2026-11-10).
   An Active Terminal makes the node a relay and unlocks outbound edges.

Rule: **every intermediate node needs an active Terminal before anyone can lay new cable out of
it.** Reflects the optical reach limit.

**Make-ready friction:** 1st Hub slot in a node is cheap (open poles); the 2nd costs extra (crowded
poles).

### Marketing (lighting)

- Pay the drop / acquisition cost to flip an Unlit Hub to Lit. Lit is permanent.
- **First to light** a node pays base cost; the **second** player to light in that node pays more
  (poaching locked-in subscribers).
- **Regional Marketing:** construction moves linearly along edges, but Marketing targets a 2–3 node
  Region, letting you flip several Unlit Hubs in one district at once.

### Open-access leasing and Receipts

No unbroken own-color chain required. Anyone can place a Hub in a connected node, or branch new
cable off a rival's Terminal. No reminder tokens on the board: graph topology shows who routes
through whom.

**Event-based Receipts (decided):** when a rival builds cable out of your Terminal or lights a Hub
behind it, they pay you **cash once** and you take a **Receipt token**, framed as holding rental
contracts from them. No upkeep, no path tracing at income time. Receipts are one of the three ladder
proofs and are spent on a step.

### Costs (provisional, mirror real capital budgets: civil work is 70–80% of spend)

| Piece        | Cost  | Role                                                                 |
| ------------ | ----- | -------------------------------------------------------------------- |
| Feeder cable | 1–3 dots | Biggest, most variable; printed per edge as dots in the stick slot (2026-11-09). $ per dot TBD. Leasing is the temptation. |
| Hub          | $1–$2 | Cheap foothold; 2nd slot in a node costs extra (make-ready).         |
| Terminal     | $4–$5 | Flat, heavy mid-game investment; claims the sole relay slot.         |
| Light a Hub  | TBD   | Drop cost; higher for the second lighter in a node.                  |

### Credit Rating ladder (victory engine)

- No generic VP. A discrete track of 4 tiers × notches (source: 10–12 steps, `B-` → `AAA`; my
  suggestion: 8, see Tensions). Ties broken by cash on hand.
- **Metronome:** at most **1 step per Refinance action**. No hoarding for a late dump.
- **Notch bonus (every step):** micro-reward, e.g. permanent income bump, reduced debt service,
  refinancing kickback.
- **Tier boundary (every 3rd step in source):** structural privilege, e.g. `BB-` unlocks Terminal
  upgrades; `BBB-` (investment grade) qualifies for BEAD grants or cheaper capital.
- **Cost of a step:** cash **plus 1 of 3 asset proofs**, checked off within the current tier:
  1. **Wholesale leverage:** turn in Receipts.
  2. **Footprint density:** a threshold of **Lit** Hubs on the board (permanent; later tiers need
     higher totals or regional majorities of Lit Hubs).
  3. **Public-private compliance:** turn in BEAD grant / tax-credit vouchers.

### Worker placement (overhauled 2026-11-10)

Spec: [ACTIONS.md](./ACTIONS.md). **6 double-sided tiles**, one per department, each with a Day action
and its Night counterpart; 6 spaces open at a time. White workers on Day faces, black on Night; 2 + 2
per player. Crowding raises the price of a busy space. **Flip** (a turn's action) takes all workers
on one tile **into the flipper's supply** (workers circulate between players; flipping doubles as
denial) and turns it over: **nothing else** (no global effect, no Refinance, no fixed flip
actions). Floor: at least 1 tile of each side (worst case 5/1).

**Refinance is now the Night side of the Finance tile** (Day side: seek capitalization / take Debt).
It replaces the old flip-triggered, all-player Refinance. Income comes from **Billing** (Night side of
Sales), not Refinance.

### BEAD grants and the Commissioner

- A single neutral pawn marks where BEAD subsidies are awarded.
- **Claiming:** building into the Commissioner's node awards a **BEAD Grant token** from a finite
  pool (candidate game clock). Grants can pay construction rebates or be turned in as the
  Compliance proof / slash a ladder step's cash cost.
- **Lobbying:** move the Commissioner to another node, **only to nodes with equal or less existing
  fiber coverage**.
- **Build-to-block:** build an extra Hub in a target node to raise its coverage and disqualify the
  Commissioner from moving there.

### Setup variability (fixed real-world map)

- **Randomized anchor institutions:** shuffle setup tiles onto major hubs each game: Data Centers
  (wholesale lease value up), Universities/Hospitals (steady E-Rate income), Boomtowns (cheaper
  drop costs).
- **Variable incumbent footprint:** setup cards seed neutral "Legacy Telco" blockers into different
  nodes, crowding corridors and fixing the Commissioner's start.

### Regional scoring

Source thread keeps regional majorities only as a ladder proof (Lit Hub majorities). The earlier
"regional majority bonus" income (county, school-district, enterprise contracts) is not decided.

## Open Questions

- **End trigger (2026-11-10, development race):** each player mat holds a fixed supply of
  **Hubs, Terminals and cables** (e.g. 12 Hubs). A player who **runs out of any one** of the three
  triggers the end. Replaces "all Hubs placed". Open: supply sizes per piece; what happens after the
  trigger (final round? last Refinance?); winner = highest rating, cash tiebreak (unchanged).
- **Rent chain depth:** only the immediate supplier (Terminal + cable), or the whole backhaul
  chain to the spine?
- **Marketing / churn:** one-time drop cost (current) vs ongoing churn. Avoid Food Chain Magnate
  overhead.
- **Permits** (Government Day) and **Reinvestment** (both sides): undefined. See ACTIONS.md.
- **Ladder shape:** number of notches, per-tier proof thresholds, notch bonuses, tier privileges,
  cash costs.
- **Lit-Hub income values**, drop cost scale, and the second-lighter premium.
- **Crowding cost scale** (stacks on printed cable costs, which may need to shrink).

## Tensions to watch

- **Ladder length vs Refinance count:** each step needs a Refinance action (Night, Finance tile,
  black worker). Ladder length now depends on how often Finance shows Night. 8 notches is my
  suggestion.
- **Refinance can stall:** if Finance sits on Day, nobody climbs. Flip pressure or a stall? Playtest.
- **Supply race: the cheapest pile decides.** Any of the three can end the game, so the pile that's
  cheapest to empty sets the pace. Size the supplies so each costs about the same to exhaust (e.g.
  12 Hubs × $1–2 ≈ 4 Terminals × $4–5). Unlit Hubs don't help the ladder, so a rush can still end
  the game before ratings climb.
- **Supply vs board space:** 12 Hubs × 4 players = 48 against ~30 Hub slots. At high player counts
  the board fills before anyone empties their Hubs, and Terminals (1 per node) and cables (1 per
  edge) are shared too. Supplies must scale with player count, or "no legal placement" needs to
  count as a trigger (or a flip-cycle cap as a backstop).
- **Too many systems:** worker placement, light/dark flips, lit/unlit, regional marketing, Commissioner,
  3-proof ladder. User chose to keep all of them for now; cut candidates if playtest bogs.
- **Fixed flip order (if kept) is a tempo tax:** reaching your workers may take several flips.
- **Lopsided board is a mild pressure, not a deadlock:** every player starts with both colors.
  At 5/1 the lone side has crowding spikes; watch it.
- **Worker circulation:** the flipper keeps everyone's workers from that tile. Strong denial; watch
  for a worker-rich leader snowballing.
- **Day/night clock:** Regolith already uses a sun terminator as its clock. Make sure Fiber's
  light/dark feels like a different mechanism. (Note: "Lit/Unlit" Hubs now reuse light language
  too; avoid confusing day/night tiles with lit/unlit Hubs.)
- **Pure parasitism:** if leasing is always cheaper than building, nobody builds. Receipts give the
  backbone builder a reason (ladder proof), but the Wholesale proof depends on rivals choosing to
  route through you.
- **Footprint-density snowball:** Lit Hubs are permanent and thresholds are cumulative, so the
  early lead compounds. Majority-based thresholds or a cap may be needed.
- **Node presence:** two Hub slots plus one Terminal = 3 pieces per node. Check contention for 2–4
  players.

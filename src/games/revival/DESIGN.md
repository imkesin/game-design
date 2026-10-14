# Revival

Abstract stage. Working notes; decisions are recorded as made, open questions at the bottom.

## Premise

Players are competing construction companies capitalizing on the turnaround of a major city. They
develop plots across neighborhoods; each day the mayor walks into neighborhoods and prosperity
follows: companies activate buildings and earn coins.

## Decided

- **City geometry**: Neighborhoods → Blocks (1+ per neighborhood) → Plots (1+ per block).
  Neighborhood and block sizes vary a lot.
- **Develop (claims implicitly)**: a turn is developing a single Plot. Developing in an unclaimed
  Block **claims** it; claims are **exclusive** (only the claimer develops its plots). Block claim
  may carry a coin cost equal to its size (e.g. 2 coins for a 2-plot block) as an experiment.
- **No monopolies**: a player may hold **at most one Block per Neighborhood**. A Neighborhood's
  block count is therefore its player capacity.
- **Round shape**: the day's agenda card is revealed **before** players act. Each player then takes
  **one action** (develop a plot). Then the mayor's day resolves. Stay near 1 action/turn.
- **Mayor movement**: inspired by _On the Underground_. Agenda cards define the mayor's day in two
  halves, both of which are neighborhood visits:
  1. **AM** — visit the neighborhood with the most **undeveloped private plots** (idle claimed land;
     read from the evolving board).
  2. **PM** — visit a named location printed on the card (forecastable). **AM = tax only; PM =
     activation only.** The board-steered AM stop is where idle land gets taxed; the printed PM stop
     is where income lands (forecastable).
- **Scale**: Blocks have **1–3 plots**; Neighborhoods average **~4 plots** with a spread of **2, 3,
  4, 5 and 6** (≈ 21 / 18 / 15 / 12 neighborhoods at 5 / 4 / 3 / 2 players). Tax is a small printed
  number; Houses are countable at a glance.
- **Mayor walks; every neighborhood he _enters_ on the path is a visit** (not just the destination).
  AM walk = tax at each neighborhood entered; PM walk = activation at each. Bigger graph ⇒ longer,
  richer routes and more income/tax events.
- **Park**: free filler build that **interlocks with housing**: "people want to live near parks". A
  Park **discounts the cost of building Houses** (scope: see Open). Parks are public land and
  **exempt from land tax**: a Park plot is not a private plot (no tax). Building a Park is a way to
  shed tax at the cost of an earning plot.
- **Walk**: shortest path to the target; the **active player picks among ties**.
- **Forced progress**: every turn a player **must** develop one plot; the city always moves forward.
  **A Park is free to build**, so the action is always affordable.
- **Action budget** (turns per player) and **map plot budget** (breathing room ≈ 20%):

  | Players | Actions each | Occupied | Empty | Plots |
  | ------- | ------------ | -------- | ----- | ----- |
  | 5       | 14           | 70       | 14    | 84    |
  | 4       | 15           | 60       | 12    | 72    |
  | 3       | 17           | 51       | 9     | 60    |
  | 2       | 19           | 38       | 10    | 48    |

  Derived at ~6 plots/neighborhood: ~14 / 12 / 10 / 8 neighborhoods. Derived end (not yet decided):
  the game runs a fixed number of rounds, ending as the map fills to its breathing-room remainder.
- **Tax (Georgist land tax)**: taxes land, not improvements. In each Neighborhood the mayor enters
  in the AM, **every Company with a Block there** pays **1 coin per private plot**. Private plot =
  any plot in your Block that is not a Park, built or not. Building never changes your tax; idle
  plots are pure drag, so filling a Block is the cheapest way to hold it. A leader-only version
  (most private plots pays; ties all pay) was tried and dropped: Block sizes are 1–3, so ties were
  constant. Tax is just your Block's printed size minus Parks. Constraint: it must be quick to
  calculate as the mayor moves. Role: thematic ("a city coming back to life collects taxes"), not a
  tuned brake. Unpayable tax: tentatively the payer **loses control of a Block** (unresolved; see
  Open). (A brief "zero tax" variant was floated and then withdrawn: not eliminating tax.)
- **Prosperity = activation.** When the mayor enters a neighborhood, each company with a Block there
  **activates all its Markets in that Block together** and is paid by cluster size.
  - **Market**: income is read from a table by the number of Markets in your Block (agglomeration;
    working numbers 1 / 2 / 3 Markets = 1 / 3 / 6 coins, to be tuned). Houses are **not counted at
    activation**.
  - **Market build gate (tiered)**: you may only develop your _k_-th Market in a neighborhood if
    enough Houses exist in its own _and adjacent_ Neighborhoods, any owner. Working numbers: 1st
    needs 2, 2nd needs 3, 3rd needs 4. Checked once at build time; Houses are never removed, so a
    gate stays open. Adjacency keeps tiny Neighborhoods viable. **Tax stays Neighborhood-local.**
  - **House**: **passive**, never activated. Exists to open Market gates; also the candidate source
    of worker meeples (see Open).
- **Building source**: open supply; pay the building's cost.
- **Income/sink**: activation is the only income; tax and developing (building cost, plus optional
  block claim cost) are the sinks. Players start with a **starting purse**.
- **Blight**: _cosmetic only_: some plots start with grey buildings so the city looks lived-in.
- **Focus**: core loop first. End condition deferred. Candidates floated: agenda deck runs out
  (mayor's term ends); blight fully cleared / city revived.

## Terminology

| Term         | Meaning                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| Company      | A player; a construction company.                                                   |
| Neighborhood | Largest map unit; contains Blocks. Sizes vary. Capacity = number of Blocks.         |
| Block        | Claimed exclusively by one Company (max one per Neighborhood each); contains Plots. |
| Plot         | Developed one at a time into a Building.                                            |
| Building     | Typed (House, Market, …); what a developed Plot holds; activated for coins.         |
| Mayor        | Pawn that moves per the Agenda each day.                                            |
| Agenda       | Daily card: AM condition (board-driven) + PM named location.                        |
| Tax          | Land tax: each Company with a Block pays 1 coin per private (non-Park) plot.        |
| Prosperity   | The mayor's visit; each Company with a Block there activates its Markets together.  |
| Activate     | Resolve a Block's Market cluster for coins (table by Market count).                 |
| Develop      | The one player action: turn a Plot into your Building (claims its Block).           |
| Claim        | Side effect of the first Develop in a Block; may cost coins = Block size.           |

## Open

- Adjacency cost: Houses are read raw at build time (no dials). Fallback if it drags: a Demand dial
  per Neighborhood, bumped +1 on itself and each adjacent Neighborhood when a House is built. Cap
  graph degree at 3–4 either way.
- Park discount scope and size: which Houses are cheaper (same Block / same Neighborhood / any Park
  anyone built)? Stacking? Note a free Park cheapens Houses that also feed rivals' Markets.
- Walk details: start point (last night's PM destination?), "active player" definition (first
  player? rotating?), whether a path may revisit nodes.
- Graph topology: adjacency among ~12–21 neighborhoods; map layout; 2-plot neighborhoods are 1–2
  Blocks, so Block count per neighborhood is now 1–3 (revisit "2–4 Blocks").
- Re-check economy now that visits are path-based (tax/yield magnitudes, build costs).
- Quick calculation: (1) tax = own Block's private plots (size minus Parks), no comparison; (2)
  Market gate = Houses in own + adjacent Neighborhoods, checked at build time only; income = count
  of Markets in own Block. Plain reading should suffice (distinct House/Market silhouettes).
  Fallback if playtests drag: monotone per-Neighborhood House counter bumped at build time; valid
  only while Buildings are never removed (conflicts with the lose-a-Block insolvency idea).
- **Worker meeples (prototype idea)**: the Block claim marker is a worker meeple (construction
  overseer / property manager) assigned to the Block. Building Houses "hires local workers" and
  grants more meeples, which raises how many Blocks you can have under construction at once; this is
  the owner's private payoff for Houses. **Anti-lockout**: when a Block is full, take your meeple
  back and leave a white "city employee" meeple on it. A player then always has a legal develop:
  either an open plot in a Block they hold (Park is free), or all Blocks full and every meeple is
  back to claim a new one. Unresolved: meeples per House, start count, whether the white meeple is
  needed at all (building colors may show ownership; all-Park Blocks have no owner color), whether
  the white meeple is also the score/"city revived" token, and a pass rule when no claimable Block
  remains.
- **Meeple side uses (prototype idea, not worker placement)**: some actions are worker-driven rather
  than coin-driven. First candidate: **lobbying**, placing a spare meeple on an Agenda card to force
  the mayor's day. Needs several revealed cards, a rule for ties/default, a decision on whether the
  meeple returns or is lost, and care that it's a free side action (the one action per turn stays
  "develop"). Other candidates: tax lawyer (exempt one Block from today's AM tax), overtime (second
  develop). Keep the set small so the meeple economy stays legible.
- Insolvency: what happens when tax can't be paid (lean: lose control of a Block; designer will
  design around it later). Does the Block's Buildings stay, go to the bank, or become blight?
- Tax scale: max tax is 3 coins (3 private plots) vs. Market yield up to ~8. Tax is a footnote
  unless numbers are tuned (e.g. tax per plot > 1, cheaper yields).
- Why would anyone build a House? Theme: a city needs a minimum population to support businesses, so
  Houses gate Markets (shared benefit, public-good problem). Leading private payoff: Houses grant
  worker meeples (expansion). Also floated: Houses = score (population); intentional chicken game.
- Small-Block economics: income table is superlinear but tax is linear per plot, so a 1-plot Block
  nets 0 (1 Market = 1 coin, 1 tax). Soften the table or give small Blocks a tax break.
- Roster beyond House/Market.
- Agenda conditions presumably count building types ("most parks"): confirm.
- Numbers: starting purse, building costs, activation yields.
- Block claim cost: lean drop, since the recurring land tax already charges for land. Free vs. coins
  = size (experiment).
- AM target: count only claimed (private) undeveloped plots, or unclaimed ones too? Destination
  tie-break (active player picks?) and fallback if no private undeveloped plots exist.
- Tax is now fixed per Block (size minus Parks), so tax is a pure claim-time and Park decision.
  Total tax per visit rises (every Company pays); needs a numbers pass vs. yields.
- Ramp/engine, game end, victory metric (deferred until the loop is fun).

## Known tensions

- Houses are a public good: the owner earns nothing, every Market in the neighborhood profits.
  Free-riding ("let rivals build the Houses, I build the Market") is the default line.
- Only one Building activates per Block per visit, so a second Market in the same Block is dead
  weight; extra plots in a Block want to be Houses.
- Tax is small (max 3 per visit) vs. Market yield, so it barely brakes anyone; build cost is the
  main brake. If tax stays thematic this is acceptable.
- Insolvency rule (lose a Block) only fires if tax can actually exceed a purse; at current scale it
  almost never will. It also removes Buildings, breaking the "never removed" counter shortcuts.

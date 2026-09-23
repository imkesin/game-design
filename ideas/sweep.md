# Sweep (working title)

- **Status:** seed
- **One-liner:** Radial worker placement where workers ripen in the light and only pay out once the
  rotating edge leaves them in the dark — and the only way to climb is to buy a card that shoves the
  clock forward for everyone.
- **Related:** shares a kernel with [Regolith](../src/games/regolith/DESIGN.md); needs its own
  theme.

## Vocabulary

Deliberately theme-neutral so the loop can be re-skinned without rewriting the rules. **Lit** and
**dark** halves, separated by **the edge**, which advances in **ticks**. The board is 12 **slices**,
each a ladder of 5 **rings**.

## Kernel

A radial board of 12 slices, each cut into 5 concentric rings. Six slices are lit, six are dark; the
edge between them is a diameter that advances one slice per tick.

Workers enter at ring 1 of a lit slice and climb outward one ring at a time. The further out, the
bigger the payout — but a worker pays nothing while it is lit, and a worker in the dark cannot
climb. You harvest only by pulling a worker out of a slice that has rotated into the dark. Light is
where value is built; dark is where it is realized, and frozen.

**Cards are where the actions live, and every card prints a time number.** Taking a card gives you
its action and then turns the edge by that number. Advance is one such action; the rest of the verb
set is undesigned. Deploy and Harvest sit outside this as free, time-independent base actions, so
the shared display is the throttle on the whole economy: the only clock, the only source of
leverage, and a market holding exactly as many cheap moves as there are cheap cards on the table.

## Relation to Regolith

**Keeps:** the terminator as the clock; the deploy-or-take-a-card turn; a polar/radial board.

**Changes:** in Regolith the map is terrain to discover and build on, and the sun drives production
in place. Here the radial board _is_ the action-selection space, the clock is fully player-driven,
and income is gated on rotation rather than on standing in the right light.

**Must change:** sun/shade is Regolith's identity and theme. See
[Theme Candidates](#theme-candidates).

## The Board

- **12 slices**, radial. Always 6 lit and 6 dark — the edge is a diameter with two crossing points,
  advancing one slice per tick. **One full revolution = 12 ticks.**
- **Each slice has a type** — the kind of action or reward it grants. The type is fixed to the slice
  and travels with it into and out of the dark. **Slice = what you get; ring = how much.**
- **5 rings** per slice, ring 1 innermost (lowest payout) out to ring 5 (highest). **One worker per
  space**, so a slice is a 5-rung ladder and the whole board holds 60 workers.
- **Runway** is how many ticks a lit slice has before it crosses into the dark.

### The lit half is always a runway gradient

Because the edge advances exactly one slice per tick, at any moment the six lit slices have runways
of exactly **6, 5, 4, 3, 2, 1** — one of each, always, with no bookkeeping. The leading three slices
are deep plays; the trailing three are quick turnarounds.

This makes placement a clean two-axis read: **which action type** × **how much runway**. And because
the deep slot rotates through the action types one tick at a time, forward planning is legible
without any extra components — "in two ticks, the slice I want will be at runway 6."

### Reach

A worker deployed into runway R climbs once per card taken, and each card burns its own value out of
that runway. Uncontested:

> **reach = min(5, 1 + ⌈R / v̄⌉)** — where v̄ is the average tick value of the cards you take

From the deep slot (R = 6): all 1-cards reaches **ring 5**; averaging 2 reaches **ring 4**;
averaging 3 reaches **ring 3**. Every card an _opponent_ takes drains your runway too, so at 2
players with both buying every turn the effective divisor roughly doubles — expect ring 3–4 in
practice.

**This is the most important consequence of the design: the route to ring 5 runs through the card
display, and opponents can block it by taking the cheap cards.** Ring 5 is not a matter of spending
enough turns; it is a project that requires assembling a run of 1-cards against interference.

## Turn Structure

One action per turn. **Resolve the action fully, then turn the edge** — this ordering is
load-bearing (see [The last step](#the-last-step)).

**Base actions — always available, always free of the clock:**

- **Deploy.** Place a worker from supply onto ring 1 of a **lit** slice.
- **Harvest.** Pull one of your own workers out of a **dark** space; take that slice's reward at
  that ring's magnitude; the worker returns to your supply.

**Card action — the only thing that moves the edge:**

- **Take a card.** Take a card from the display, resolve its action, then turn the edge by its
  printed time number. Refill the display. Resolving the action is optional; the time is not.

Everything else a worker can do in the light is on a card. Nothing in the dark costs time.

### Why Deploy and Harvest can never be card-gated

They stay outside the deck for a reason that is not about elegance: **a bad shuffle must never be
able to strand a player.** If the display happens to hold no way to place a worker, a player with an
empty board has no move that improves anything, and the game's flow collapses for reasons nobody at
the table can see or fix. Guaranteeing the two most basic verbs costs nothing and removes that
entire failure class.

It also preserves the free actions the clock depends on. Because Deploy and Harvest are free, the
clock rate is self-regulating — see [The Fiddle Budget](#the-fiddle-budget).

## Blocking and Skips

Blocking tolls rather than bars. Both entry and climbing land on the **first free ring at or above**
the target, paying **1 to the bank for each occupied ring passed over**.

- **Deploy.** Ring 1 is the entry point. If it is occupied, you may enter higher up by paying 1 per
  worker you skip. Rings 1–3 occupied means you enter at ring 4 for 3.
- **Advance (on a card take).** Normally one ring. If the ring above is occupied, you may skip to
  the first free ring above, paying 1 per worker skipped — **still one card and still its printed
  tick value**, no extra notches.
- You may only skip over **workers**, never over empty rings, so depth can never simply be bought.
  You can go deep only once somebody else has built the staircase.
- A slice with all 5 rings occupied cannot be entered, and a worker at ring 5 cannot climb.

Two consequences worth keeping:

1. **A skip converts money into tempo.** Three rings for one card is the most efficient climb in the
   game — so a crowded slice is _more_ attractive to a rich player, not less.
2. **Depth is gated on other people's work.** You cannot pay your way to ring 4 in an empty slice.
   Clustering is self-reinforcing but costly.

Skips are deliberately **not** a second source of edge movement. One clock, one trigger — if you
want to blast the edge forward, take a 3-card.

## Cards

Every card has the same shape:

> **[verb] [magnitude] — [time number]**

The variety comes from a **small closed verb set × magnitudes × prices**, not from bespoke effects.
That is what keeps the display readable: it is a market of actions with price tags, and it explains
itself without text. Adding a fortieth unique effect is how this design gets fiddly; adding a fourth
verb is not.

Cards are also the **amplified** versions of the base actions — deploy two, deploy ignoring tolls,
harvest two — so the deck can make Deploy and Harvest exciting without ever being required for them.

### The verb set — undesigned

**Advance** is settled: move one worker outward one ring. The rest is open and waits on knowing what
the game is actually about. Candidates, recorded so they aren't re-derived:

- **Slide** — move a worker sideways to the adjacent slice, same ring, destination empty and lit. It
  only makes sense on a radial board, and it does two jobs at once: it changes _what_ you will
  harvest, and it adjusts your deadline (toward the leading edge for runway, toward the trailing
  edge to cash out sooner).

  It is also self-limiting with no rule attached. Sliding toward the leading edge gains +1 runway,
  but the card costs v ticks, so the net is **1 − v**: at v = 1 you break even, at v ≥ 2 you lose
  ground. **You can never buy time by sliding, only redirect.** The edge always wins.

- **Deploy+** — place two, place ignoring skip tolls, place at a named ring.
- **Harvest+** — harvest two, or harvest from a slice that is still lit. The lit-harvest version is
  a big lever: it breaks the core rule for a price.

## Why It's Interesting

### The display is the contested resource

This is the interaction that doesn't depend on the board being crowded. Two players can be building
on opposite sides of the disc and still be at each other's throats over the single 1-card. Taking it
denies your opponent a cheap climb and forces them onto a 3 — which may shade their own half-built
ladder before it is ready. That attack is available every turn, from the first turn, with an
otherwise empty board.

### Every card is a gift to the table

A card's true cost is never its printed value — it's the board state when you take it. A 3 is cheap
when your workers are the ripest on the board and ruinous when your neighbour has three sitting one
slice from the edge. You cannot make progress privately: every climb you buy ripens everyone.

### The last step

A worker at runway 1 that advances will, by its own card, push its slice into the dark — landing at
the higher ring and freezing there. So the final climb always locks in the better payout and is
never wasted. It only works because the advance resolves before the edge turns.

### Freezing the table

A 3-card shades three slices at once, freezing every opponent mid-climb at whatever ring they happen
to occupy. Because you also get your own advance out of it, this is a rare thing in a worker
placement game: a genuine attack that costs you nothing but the card you wanted anyway.

### Riding through the dark

A worker you decline to harvest sits in the dark for 6 ticks and then re-enters the light — where it
can climb again from wherever it stopped. So you can deliberately skip a harvest to set up a
two-revolution worker that reaches ring 5. The cost is a worker locked up for 6+ ticks and a rung
denied to everyone else for that whole time. Banking capital is also a blocking move.

### Stalling is self-defeating

Deploy and Harvest are free of the clock, so a player can always decline to move time and wait for
someone else to shade their workers. But nothing shades until somebody buys a card, so a table of
mutual stallers harvests nothing at all — and the one who blinks gets a free climb out of it.
Blinking is a reward, not a sacrifice, which is what keeps the loop turning without a rule forcing
it.

## The Leapfrog Problem

The pattern to avoid: two players alternately climbing past each other up a ladder while the board
state barely changes. Four brakes, all already present:

1. **The ladder is only 5 tall.** A skip lands on the first free rung, so a contested slice exhausts
   itself within a few moves. There is no infinite ladder to fight over.
2. **Every climb costs a card.** Climbs are rationed by the display, not by your willingness to
   spend turns.
3. **Every climb costs ticks.** A skip war accelerates the shading of the very slice being fought
   over — the prize evaporates as they fight for it. Self-terminating.
4. **Tolls go to the bank, not to the owner.** Owner-paid tolls would conserve money at the table
   and fund the war indefinitely; draining it to the bank means a skip war is paid out of a finite
   pool.

### Parallel solitaire

The related worry: at 2 players, both build on separate slices and never touch. The clock makes this
tighter than it feels — with 6 runway and 4 climbs needed for ring 5, a single extra card bought by
your opponent is the difference between ring 5 and ring 4 — and the asymmetry is a real lever:
**whoever has more runway wants to burn time; whoever has less wants to stall.**

But the honest position is that the display, not the board, is what makes 2 players collide.
Architecture (A) buys **market** contention, not **spatial** contention. If the board still feels
inert at 2 players after testing, two cheap fixes are in reserve:

- **Narrow the lit half at low player counts.** A 2-player shade bar covering 8 slices leaves 4 lit,
  drops the contested pool from 30 spaces to 20, and leaves only two slices with real runway. One
  extra printed strip, zero rules change. (If this makes action types too scarce, use 6 types × 2
  copies placed **diametrically opposite** — because the edge is a diameter, exactly one copy of
  every type is then lit at all times.)
- **Raise worker supply** so demand exceeds supply.

Neither is worth adding before the first play.

## The Free Rider

Since deploy and harvest are both free of the clock, a player could in principle deploy their whole
supply at ring 1, never buy a card, let everyone else's cards shade their workers, and harvest for
nothing.

**This needs no rule — it's a constraint on the reward curve.** Free riding is deploy + harvest: 2
turns for R₁. Climbing to ring _k_ is deploy + (k−1) cards + harvest: k+1 turns for Rₖ. So climbing
to ring _k_ is the better rate whenever

> **Rₖ > R₁ × (k + 1) / 2**

which is R₂ > 1.5·R₁, R₃ > 2·R₁, R₄ > 2.5·R₁, R₅ > 3·R₁. A curve of **1, 2, 4, 6, 9** clears every
rung with room to spare. Anything growing faster than linear does the job, which is what you'd want
from a ring gradient anyway. **Ring 1 keeps a real reward.**

The parasite also can't survive alone: a free rider generates no ticks, so nothing ever shades, so
they harvest nothing. Free riding needs card-buyers to host it, and buying pays better.

## The Fiddle Budget

The loop has to stay light on the table, which rules some things out on grounds that have nothing to
do with elegance.

**One clock, one trigger.** The edge moves when a card is taken, and never otherwise. No per-action
checks, no second source from skips, nothing to remember. This was always the lowest-fiddle option;
the only reason it wasn't available before was that nobody would voluntarily buy a card. Bundling
the climb into the card take removes that hole and the fiddle in the same stroke.

**The edge must not advance every turn.** Beyond the upkeep, a per-turn tick breaks the ladder
outright. Runway maxes at 6, so counting ticks between your own turns: at 2 players a leading-edge
deploy freezes at ring 3; at 4 players, ring 2. Rings 4 and 5 become unreachable at any player count
and reach stops depending on anything interesting — it becomes a function of the player count.

**The free actions are load-bearing.** Because Deploy and Harvest are free, the clock rate is
self-regulating: when the table is buying, time races and forces harvests; when the table is
harvesting and deploying, time stalls and ladders grow long. Negative feedback with no rules
attached.

**Almost nothing needs tracking.** A worker is dark iff you can see its slice is dark. No timers, no
per-worker state, no memory.

**One moving part for the edge.** Not two rim tokens — a single **pivoting bar** pinned at the
centre with a brad: a diameter-length strip, shaded on one side, advanced one notch per tick. For
print-and-play that's a cut-out strip and a paper fastener, and the lit/dark split is unambiguous at
a glance.

## v0 — First Playtest

Cards carry nothing but a tick value. No effects, no delayed triggers, no content. The deck is the
master tuning dial and the thing the first session is actually testing.

- **Starting deck weighting:** roughly **1, 1, 1, 2, 2, 3**. Cheap enough that ring 4 is normal and
  ring 5 is an achievement.
- **Display size: 4 face up.** Small enough that the cheap card is genuinely contested each turn;
  large enough to offer a real choice.
- **What to watch:** does anyone reach ring 5, and was it because they assembled 1-cards or because
  nobody contested them? If ring 5 is routine, the deck is too cheap. If nobody passes ring 3, it's
  too expensive.

## Open Questions

**Worker supply.** Unset, and the main dial for how crowded the lit half gets.

**What is "1"?** Skips need a currency, and bank-paid tolls mean money must _enter_ the game
somewhere — from harvests, cards, or both. This is the first hard constraint on the otherwise
undefined reward content: at least one slice type has to mint the stuff.

**The twelve slice types.** Undesigned. This is the other generator of collision: nothing currently
makes two players want the _same_ slice rather than merely a good one.

**Do cards carry rewards, or only movement?** If slices are the nouns (what you harvest) and cards
are the verbs (how workers move), each layer does one job and card text stays a single fixed shape.
If cards also grant resources, there are two action vocabularies competing and the slice types risk
becoming decorative. Unresolved, and it gates the slice-type design above.

**The rest of the verb set.** Only Advance is settled. See [Cards](#cards).

**The reward curve.** Needs to beat Rₖ > R₁(k+1)/2 at every rung — see
[The Free Rider](#the-free-rider). 1, 2, 4, 6, 9 is the working guess.

**Card content.** Once cards carry more than a number, does the tick value correlate with strength?
The intuition is that stronger cards cost more ticks, which is self-balancing since a big shove is
only affordable when you are the ripest. Wants testing before it's believed.

**Delayed effects.** Cut from v0 as the fiddliest thing available. If they come back, the
marker-free form is "resolves when this slice next goes dark" — the card tucks under its slice and
timing rides on board state you can already see.

**Is riding through the dark too strong?** A ring-4 worker that skips its harvest to reach ring 5
next revolution gives up one payout and denies a rung for 6 ticks. Feels balanced; could be a trap
or could be the dominant line.

**Revolution events.** Does anything trigger when the edge completes a lap — upkeep, display
refresh, scoring?

**Does the lit half do anything besides host workers?** Right now it's a waiting room.

**Scoring.** Deliberately undefined, as in Regolith. The loop has to be fun before the win condition
is worth designing.

## Theme Candidates

The theme must motivate three things at once: (a) a boundary that **rotates** around a disc, (b)
value that **increases outward** from the centre, and (c) a payout that can **only** be taken on the
dark side. (c) is the hard one — most light/dark themes want you to harvest in the light.

- **Tide flats.** Rings are distance from shore; the tide line sweeps around a bay. You gather only
  from flats the water has left exposed. Motivates (c) cleanly, and "the tide comes in for everyone"
  sells the shared clock. Rotation around a disc is the weak joint.
- **Kiln / cooling floor.** Work is pushed outward from the heat; you can only handle a piece once
  it has left the fire. (b) and (c) are automatic, and rotating hearths are real equipment.
- **Night shift.** The crew can only work the half of the site out of the day's heat. A direct
  re-skin of the sun — probably too close to Regolith to count as a re-theme.
- **Fruiting bodies.** Growth in the light, fruiting only in the dark. Biologically apt for (c), and
  radial growth reads as mycelium spreading outward. Rotation is unmotivated.
- **Darkroom carousel.** Exposure in the light, development only in the dark. Perfect for (c) and
  the carousel is real equipment — but the economy is thin and hard to scale outward.

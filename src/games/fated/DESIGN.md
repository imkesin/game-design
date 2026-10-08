# Fated: The Art of the Love Story (working title; formerly Romantasy)

- **Status:** card layouts prototyped (protagonists, traits, scenes); scene content is placeholder
  (cost, minor actions); scene Love scoring shape decided, scene text not written
- **One-liner:** Each player is a rival author writing their own romantasy love story: grow two
  protagonists through trait cards, then contend for shared scenes that demand balanced development
  from both.
- **Inspired by:** Race for the Galaxy (card-only tableau engine).

## Terminology

- **Author**: a player. Each is a rival writing their own love story.
- **Love**: the victory metric (pink cubes). An abstraction for what makes a good love story. Scored
  at game end from each scene in your tableau.
- **Character Idea**: a card in hand, deck, Drive or discard. Played onto a protagonist (via
  Develop) it becomes a Trait. Deliberately distinct from scene ideas.
- **Quality**: one of six character qualities (Allure, Prowess, Passion, Devotion, Influence,
  Mystique). Roughly romance (Allure, Passion, Devotion) vs. fantasy (Prowess, Influence, Mystique).
- **Drive**: a protagonist's motivation, held as a pile of face-down Character Ideas. Spent when
  paying; added by Motivate.
- **Exhaustion**: the cost of effort, a grey cube on a trait. Drive is what you spend, exhaustion is
  what it costs.
- **Propose / Contend**: the active author **proposes** a scene; authors **contend** for it.
- **Minor action**: Explore (ideas), Develop (characters), Motivate (characters). Contending is the
  major action; minor actions are the lesser writing work around it. Framed from the author's seat.

Three card types (code names: `protagonist`, `trait`, `scene`):

- **Protagonist**: a lead character. Two per player, free choice of any two (no forced pairings; any
  of M–M, M–F, F–F romances is possible, though nothing optimizes for it).
- **Trait**: played onto a protagonist; sets which qualities it can pay and how much per Drive.
- **Scene**: a shared card players propose and **contend** for; the things the couple has done
  together, which make up the love story. (Formerly "plot".)

Retired terms: _plot_ → scene, _bid_ → contend, _resource_ → quality, _power bowl_ / _energy_ →
Drive, _alternative action_ → minor action.

## Kernel

Entirely card-based. 2–5 players, 45–60 minutes.

Each player has **two protagonists**. Trait cards played from hand build up each protagonist's side
of the tableau. The tableau is what lets you win **scenes**.

### Scene cards

Each scene has:

1. A **minimum cost** to start contending for it (see below).
2. A **minor action**, printed on the card: exactly one of Explore, Motivate, Develop.
3. **Love scoring**, printed on the card (see below).

Scenes have **no individual identity**: no names, no unique costs. Cost tier, minor action and
scoring are all that tell two scenes apart.

**Cost shape.** Three tiers: `1 + 1`, `2 + 2`, `3 + 3`. Each part is that amount of **Any Quality**
(wild, shown as an asterisk), paid by a single protagonist. The printed cost is the **minimum to
start**: contenders are expected to overpay, so cheap scenes are still worth fighting for.

**Scoring.** Each scene scores Love from your tableau, counted across **both protagonists**, either
**Instant** (once, when you win the scene) or **End Game** (when the game ends). The formula is
`N Love per M <quality>`, e.g. "1 Love per 3 Prowess". Which qualities you have built is what makes
a scene worth contending for, since the cost no longer names one. Ongoing abilities are optional.

### Turn arc

1. The active player draws **two scenes** and **proposes** one. The other returns to the **bottom of
   the scene deck**.
2. The active player may immediately **contend** by paying at least the minimum cost. Otherwise they
   perform the scene's **minor action**.
3. In turn order, each other player may either **contend** (paying more than the current highest
   contention) or perform the **minor action**.
4. **One pass only**: each player acts once. The proposer commits first, the last seat sees every
   contention.
5. The highest contender wins the scene into their tableau (max 6 scenes).

### Minor actions

The engine. Every scene carries one, so the scene deck's mix _is_ the economy.

- **Explore**: a way to draw cards.
- **Motivate**: add Drive to your protagonist, remove exhaustion.
- **Develop**: add traits to your protagonist (play from hand).

Amounts per action are TBD.

### Qualities

Qualities are split between the two protagonists (e.g. Prowess, Devotion, Allure). Most scenes
demand qualities from **both** sides (e.g. 2 Prowess from one lead, 2 Devotion from the other),
which forces balanced protagonist development.

Paying **exhausts** trait cards (grey exhaustion token on the card used). The tableau is a renewable
budget, not a consumable one.

Each protagonist also has **Drive**: a pile of face-down Character Ideas representing their
motivation. **Drive = how often, traits = what and how much.** A pile means Drive needs no
card-covering or tucking (ugly), and lets a player hold more Drive than they have traits.

### Contending ("auction-ish")

The printed cost is the minimum. Another player may come in over the top and pay **+1 of each
required quality** (e.g. 3 Prowess + 3 Devotion against a printed 2 + 2) to take the scene into
their own love story instead.

Payment is made **at contention time**, with Drive cards set aside on the scene. The winner's paid
Drive is discarded. **Each loser takes the Drive cards they paid back into their hand** as
compensation.

## Components (provisional, "aim for")

**30 protagonists:** every pair of the 6 qualities (6 choose 2 = 15), two copies each, varying in
art and presentation (no gender label). Each carries baseline symbols in its two qualities (exact
rules TBD). Players choose any two (pool mechanics TBD).

**90 trait cards**, values 1–5 (the number is cost, capacity and Drive), spread evenly across values
within each quality. Each card is its own entry in `cards/traitDeck.ts`.

| Value                         |  1 |  2 |  3 |  4 |  5 | Total |
| ----------------------------- | -: | -: | -: | -: | -: | ----: |
| Allure                        |  6 |  6 |  6 |  6 |  6 |    30 |
| Prowess, Passion              |  3 |  3 |  3 |  3 |  3 |    15 |
| Devotion, Influence, Mystique |  2 |  2 |  2 |  2 |  2 |    10 |
| **All (90)**                  | 18 | 18 | 18 | 18 | 18 |    90 |

The Prowess and Passion rows apply to each of those qualities separately (30 total); likewise the
last row applies to each of its three qualities (30 total). Mean card value is 3.0.

**Maximum tableau** per player:

- 1 protagonist + up to **4 traits**
- 1 protagonist + up to **4 traits**
- Up to **6 scenes**

That is at most 8 traits and 6 scenes per player (40 traits in tableaus at 5 players). Each
protagonist has 2 baseline symbols plus up to 4 traits, so exactly 6 symbol slots, one per quality
if you choose to spread.

The 90 are **one shared draw deck**. Drive fills draw from the top of it.

**30 scenes** (placeholder, `cards/sceneDeck.ts`, one line per card): three cost tiers (`1 + 1`,
`2 + 2`, `3 + 3`), ten scenes each. Each tier carries every minor action 3–4 times (10 each
overall). Each quality scores five scenes (15 Instant, 15 End Game). Placeholder rates: 1 Love per
3, 2 or 1 of the quality at tiers 1, 2, 3. Mix and rates are up for playtest.

## Decisions

- Contending is **per-quality** (like the old bid); a raise is **+1 of each required quality**. One
  pass, proposer first.
- Exhaust (not discard) trait cards to pay.
- Drive: face-down Character Ideas per protagonist; traits provide capacity.
- **Paying with a trait = exhaust it (grey cube) + spend one Drive** from that protagonist. The
  trait then yields its full value (e.g. a trait worth 2 Prowess pays 2 for 1 cube + 1 Drive card).
  So a 2+2 scene can cost one trait and one Drive card on each side. Traits set which qualities you
  can pay and how much per Drive; Drive sets how often.
- **Setup:** each player deals 6 trait cards, then places 1 into each protagonist's Drive (2 total,
  face down), leaving 4 in hand. (My reading; confirm.)
- **Baseline symbols are exhaustable like a trait:** a protagonist's two printed symbols are
  pre-played traits, paid with a cube plus a Drive card as usual.
- **Six qualities:** Allure, Prowess, Passion, Devotion, Influence, Mystique.
- **Playing a trait costs N discards from hand**, where N is the trait's number (a 2 Influence trait
  costs 2 other cards). This prices value-2 traits, so they are no free lunch.
- **Traits are played only via the Develop minor action.**
- Hand refill comes from the Explore minor action, not a fixed draw.
- Minor actions: **Explore** (draw), **Motivate** (add Drive, remove exhaustion), **Develop** (play
  traits). No fixed refresh phase.
- **A trait's number does triple duty:** its play cost (discards), its capacity per exhaust, and its
  Drive value if discarded. Discarding a 4 Allure for Motivate puts 4 cards from the top of your
  deck face-down into your protagonists' Drive.
- Some minor actions (Motivate) let you **split a discarded card's number** across effects (e.g.
  remove 1 exhaustion cube, add 3 Drive).
- **Love replaces VP.** Each won scene scores Love from the tableau across both protagonists, either
  **Instant** (when won) or **End Game**. Ongoing abilities are optional.
- End trigger: **first player to fill their 6th scene** ends the game (provisional; finish the round
  TBD).
- **Replacing a trait** (slots full): the replaced trait is discarded and its number is deducted
  from the new trait's discard cost. Replacing with an equal or lower number is free.
- Minor actions are the primary engine; scenes are goal posts.
- Each minor action is **printed on the scene** (one of the three).
- **Minor action recipients:** only players who did **not** contend. The winner does not get it; a
  losing contender gets only their Drive refund.
- **Cubes stay on a lost contention:** exhaustion is a real cost to losing; only Drive is refunded.
- **Payment at contention time; winner pays, losers get their paid Drive cards back into hand.**
- Unchosen scene returns to deck bottom.
- Ending: first to fill a 6th scene triggers the end (provisional); End Game scoring is Love, per
  above.

## Open Questions

- **Raises:** a raise is +1 on each requirement, so a `1 + 1` raised once is a `2 + 2`. Must the two
  requirements of a cost be paid by different protagonists?

- **Overpay waste:** a value-2 trait against a need of 1 wastes the extra. Is that fine, or can
  surplus carry over?
- **Overbid granularity:** +1 of each quality often forces an extra trait + Drive per side, so
  overbids may be steep. Watch in playtest.
- **Low-ball contending:** Drive returning to hand is a free Drive-to-hand move. Watch for
  contending cheaply to be outbid, as a cheaper Explore.
- **One pass:** the proposer commits first; last seat sees all contentions. Playtest the edge.
- **Minor action mix:** each scene prints one of Explore / Motivate / Develop, so the scene deck's
  mix _is_ the economy. Magnitudes per action are TBD. Players cannot pick; they take what's
  revealed.
- **Shared deck drain:** trait cards played stay in tableaus and Drive cards sit face-down, so the
  deck permanently loses cards to play. Check the 90 holds at 5 players; reshuffle the discard when
  the deck is empty.
- **Scale:** mean card value is 3 and costs top out at `3 + 3`, so overpay waste (a 5 against a need
  of 3) is a core puzzle rather than a corner case.
- **Hand limit:** playing a 3 costs 3 discards, a 5 costs 5. Is there a max hand size?
- **Baseline value:** what number do a protagonist's two baseline symbols carry? (Placeholder: 1
  each, implied and not printed on the card.)
- **Baseline "or":** the card now puts a bar between the two stacked symbols, reading as "or". Is a
  baseline one symbol you choose between (exhaust once for either), or two separate symbols (exhaust
  each)? The earlier decision above says two separate.
- **Drive split:** when adding N Drive, can you split between the two protagonists freely?
- **Drive inflation:** high-number traits flood Drive, which may shift the bottleneck entirely to
  exhaustion cubes. Number distribution matters; test.
- **End trigger:** does the round finish when someone fills their 6th scene?
- **Free downgrades:** replacing a trait with an equal or lower number costs nothing, so quality
  respec is free. Intended flexibility or a loophole?
- **Scene abilities:** ongoing triggers vs. static discounts; keep the list small at first.
- **Love formulas:** only `N Love per M <quality>` exists so far. Other shapes (sets, balance
  between protagonists)? Do Instant scenes pay more than End Game, since the tableau is smaller when
  won? Does the placeholder rate by tier (3, 2, 1 per) hold up?
- **Contention vs. scoring:** scenes score from the tableau, so contention price and Love value can
  drift apart. Watch for dominant cheap high-Love scenes.
- **Theme:** what the traits and scenes actually are (scenes are now anonymous, so theme lives in
  the art and scoring text). Title is "Fated: The Art of the Love Story" (short: Fated).

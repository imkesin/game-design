# Fated: The Art of the Love Story (working title; formerly Romantasy)

- **Status:** card layouts prototyped (protagonists, traits, scenes); scene content is placeholder
  (cost, alternative actions); scene Love scoring shape decided, scene text not written
- **One-liner:** Each player is a rival author writing their own romantasy love story: grow two
  protagonists through trait cards, then contend for shared scenes that demand balanced development
  from both.
- **Inspired by:** Race for the Galaxy (card-only tableau engine).

## Terminology

- **Author**: a player. Each is a rival writing their own love story.
- **Love**: the victory metric (pink cubes). Scored at game end from each scene in your tableau.

Three card types (code names: `protagonist`, `trait`, `scene`):

- **Protagonist**: a lead protagonist. Two per player.
- **Trait**: played onto a protagonist; sets which resources it can pay and how much per energy.
- **Scene**: a shared card players propose and **contend** for; the things the couple has done
  together, which make up the love story. (Formerly "plot".)

Retired terms: _plot_ → scene, _bid_ → contend, _minor action_ → alternative action.

## Kernel

Entirely card-based. 2–5 players, 45–60 minutes.

Each player has **two protagonists** (a "male" and a "female" lead). Trait cards played from hand
build up each protagonist's side of the tableau. The tableau is what lets you win **scenes**.

### Scene cards

Each scene has:

1. A **name**.
2. A **minimum cost** to start contending for it (see below).
3. An **alternative action**, printed on the card: exactly one of Explore, Motivate, Develop.

Scene **Love scoring** is end-of-game and reads your tableau's synergy, e.g. "1 Love per Devotion
across both protagonists". Scene text is not yet written; ongoing abilities are optional.

**Cost shape.** A cost is one or two **requirements**, each an amount (1–5) of a specific resource
or of **anything** (wild, shown as an asterisk). Each requirement is paid by a single protagonist.
Examples: `3 Allure + 3 Passion`; `2 Prowess + 2 Anything` ("Archery Lesson": the wild part is left
to the players' imagination); `4 Anything` from one protagonist only. The printed cost is the
**minimum to start**: contenders are expected to overpay, so cheap scenes are still worth fighting
for.

### Turn arc

1. The active player draws **two scenes** and **proposes** one. The other returns to the **bottom of
   the scene deck**.
2. The active player may immediately **contend** by paying at least the minimum cost. Otherwise they
   perform the scene's **alternative action**.
3. In turn order, each other player may either **contend** (paying more than the current highest
   contention) or perform the **alternative action**.
4. **One pass only**: each player acts once. The proposer commits first, the last seat sees every
   contention.
5. The highest contender wins the scene into their tableau (max 6 scenes).

### Alternative actions

The engine. Every scene carries one, so the scene deck's mix _is_ the economy.

- **Explore**: a way to draw cards.
- **Motivate**: add power to your protagonist (bowl), remove exhaustion.
- **Develop**: add traits to your protagonist (play from hand).

Amounts per action are TBD.

### Resources

Resources are split between the two protagonists (e.g. Prowess, Devotion, Kindness). Most scenes
demand resources from **both** sides (e.g. 2 Prowess from one lead, 2 Devotion from the other),
which forces balanced protagonist development.

Paying **exhausts** trait cards (grey exhaustion token on the card used). The tableau is a renewable
budget, not a consumable one.

Each protagonist also has a **power bowl**: a pile of face-down cards representing their energy.
**Bowl = energy, traits = capacity.** The bowl exists so energy needs no card-covering or tucking
(ugly), and it lets a player hold more energy than they have traits.

### Contending ("auction-ish")

The printed cost is the minimum. Another player may come in over the top and pay **+1 of each
required type** (e.g. 3 Prowess + 3 Kindness against a printed 2 + 2) to take the scene into their
own love story instead.

Payment is made **at contention time**, with energy cards from the bowl set aside on the scene. The
winner's paid energy is discarded. **Each loser takes the energy cards they paid back into their
hand** as compensation.

## Components (provisional, "aim for")

**30 protagonists:** every pair of the 6 resource types (6 choose 2 = 15), once male and once
female. Each carries baseline symbols in its two types (exact rules TBD).

**90 trait cards**, values 1–7 (the number is cost, capacity and energy):

| Value                         |  1 |  2 |  3 |  4 |  5 |  6 |  7 | Total |
| ----------------------------- | -: | -: | -: | -: | -: | -: | -: | ----: |
| Allure                        |  2 |  4 |  6 |  6 |  6 |  4 |  2 |    30 |
| Prowess, Passion              |  1 |  2 |  3 |  3 |  3 |  2 |  1 |    15 |
| Devotion, Influence, Mystique |  1 |  1 |  2 |  2 |  2 |  1 |  1 |    10 |
| **All (90)**                  |  7 | 11 | 18 | 18 | 18 | 11 |  7 |    90 |

The Prowess and Passion rows apply to each of those types separately (30 total); likewise the last
row applies to each of its three types (30 total). Mean card value is 4.0.

**Maximum tableau** per player:

- 1 F protagonist + up to **4 traits**
- 1 M protagonist + up to **4 traits**
- Up to **6 scenes**

That is at most 8 traits and 6 scenes per player (40 traits in tableaus at 5 players). Each
protagonist has 2 baseline symbols plus up to 4 traits, so exactly 6 symbol slots, one per resource
type if you choose to spread.

The 90 are **one shared draw deck**. Bowl fills draw from the top of it.

**30 scenes** (placeholder, `cards/sceneDeck.ts`): five cost levels (1–5), six scenes each. Per
level: two specific pairs (`N a + N b`), two specific + anything (`N a + N any`), and two
anything-only (`N any`). Each level carries every alternative action twice (10 each overall), and
each resource appears five times across the deck. Names, mix and costs are up for playtest.

## Decisions

- Contending is **per-type** (like the old bid); a raise is **+1 of each required type**. One pass,
  proposer first.
- Exhaust (not discard) trait cards to pay.
- Power bowl: face-down energy cards per protagonist; traits provide capacity.
- **Paying with a trait = exhaust it (grey cube) + spend one energy** from that protagonist's bowl.
  The trait then yields its full value (e.g. a trait worth 2 Prowess pays 2 for 1 cube + 1 bowl
  card). So a 2+2 scene can cost one trait and one bowl card on each side. Traits set which types
  you can pay and how much per energy; the bowl sets how often.
- **Setup:** each player deals 6 trait cards, then places 1 into each power bowl (2 total, face
  down), leaving 4 in hand. (My reading; confirm.)
- **Baseline symbols are exhaustable like a trait:** a protagonist's two printed symbols are
  pre-played traits, paid with a cube plus a bowl card as usual.
- **Six resource types:** Allure, Prowess, Passion, Devotion, Influence, Mystique.
- **Playing a trait costs N discards from hand**, where N is the trait's number (a 2 Influence trait
  costs 2 other cards). This prices value-2 traits, so they are no free lunch.
- **Traits are played only via the Develop alternative action.**
- Hand refill comes from the Explore alternative action, not a fixed draw.
- Alternative actions: **Explore** (draw), **Motivate** (add to bowl, remove exhaustion),
  **Develop** (play traits). No fixed refresh phase.
- **A trait's number does triple duty:** its play cost (discards), its capacity per exhaust, and its
  energy value if discarded. Discarding a 4 Allure for the bowl action puts 4 cards from the top of
  your deck face-down into your power bowls.
- Some alternative actions (Motivate) let you **split a discarded card's number** across effects
  (e.g. remove 1 exhaustion cube, add 3 energy).
- **Love replaces VP.** Each won scene scores Love at game end from the tableau (synergy across
  traits and protagonists). Ongoing abilities are optional.
- End trigger: **first player to fill their 6th scene** ends the game (provisional; finish the round
  TBD).
- **Replacing a trait** (slots full): the replaced trait is discarded and its number is deducted
  from the new trait's discard cost. Replacing with an equal or lower number is free.
- Alternative actions are the primary engine; scenes are goal posts.
- Each alternative action is **printed on the scene** (one of the three).
- **Alternative action recipients:** only players who did **not** contend. The winner does not get
  it; a losing contender gets only their energy refund.
- **Cubes stay on a lost contention:** exhaustion is a real cost to losing; only bowl energy is
  refunded.
- **Payment at contention time; winner pays, losers get their paid energy cards back into hand.**
- Unchosen scene returns to deck bottom.
- Ending: first to fill a 6th scene triggers the end (provisional); scoring is Love, per above.

## Open Questions

- **Wild raises:** a raise is +1 of each _required_ type. For an "anything" requirement, is the +1
  any resource? Must the two requirements of a cost be paid by different protagonists?
- **Wild-only cost:** `5 Anything` is half the total of `5 + 5`, so single-wild scenes are
  structurally cheaper. Intended (they are the cheap, flexible scenes) or compensate elsewhere?

- **Overpay waste:** a value-2 trait against a need of 1 wastes the extra. Is that fine, or can
  surplus carry over?
- **Overbid granularity:** +1 of each type often forces an extra trait + energy per side, so
  overbids may be steep. Watch in playtest.
- **Low-ball contending:** energy returning to hand is a free bowl-to-hand move. Watch for
  contending cheaply to be outbid, as a cheaper Explore.
- **One pass:** the proposer commits first; last seat sees all contentions. Playtest the edge.
- **Alternative action mix:** each scene prints one of Explore / Motivate / Develop, so the scene
  deck's mix _is_ the economy. Magnitudes per action are TBD. Players cannot pick; they take what's
  revealed.
- **Shared deck drain:** trait cards played stay in tableaus and bowl cards sit face-down, so the
  deck permanently loses cards to play. Check the 90 holds at 5 players; reshuffle the discard when
  the deck is empty.
- **Scale:** mean card value is 4, so scenes must cost much more than the earlier "2+2" examples,
  and overpay waste (a 7 against a need of 3) becomes a core puzzle rather than a corner case.
- **Hand limit:** playing a 4 costs 4 discards, a 7 costs 7. Is there a max hand size?
- **Baseline value:** what number do a protagonist's two baseline symbols carry? (Placeholder: 1
  each, implied and not printed on the card.)
- **Baseline "or":** the card now puts a bar between the two stacked symbols, reading as "or". Is a
  baseline one symbol you choose between (exhaust once for either), or two separate symbols (exhaust
  each)? The earlier decision above says two separate.
- **Bowl split:** when adding N energy, can you split between the two protagonists' bowls freely?
- **Energy inflation:** high-number traits flood the bowl, which may shift the bottleneck entirely
  to exhaustion cubes. Number distribution matters; test.
- **End trigger:** does the round finish when someone fills their 6th scene?
- **Free downgrades:** replacing a trait with an equal or lower number costs nothing, so type respec
  is free. Intended flexibility or a loophole?
- **Scene abilities:** ongoing triggers vs. static discounts; keep the list small at first.
- **Love formulas:** the catalog of scene scoring rules (per-resource counts, sets, balance between
  protagonists). Do cheap scenes score less, or is cost independent of Love?
- **Contention vs. scoring:** scenes score from the tableau, so contention price and Love value can
  drift apart. Watch for dominant cheap high-Love scenes.
- **Theme:** what the traits and scenes actually are. Title is "Fated: The Art of the Love Story"
  (short: Fated).

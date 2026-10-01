# Romantasy (working title)

- **Status:** card layouts prototyped (protagonists, traits); plots undefined
- **One-liner:** Each player co-writes a romantasy novel: grow two protagonists through trait cards,
  then bid on shared plot beats that demand balanced development from both.
- **Inspired by:** Race for the Galaxy (card-only tableau engine).

## Kernel

Entirely card-based. 2–5 players, 45–60 minutes.

Each player has **two protagonists** (a "male" and a "female" lead). Trait cards played from hand
build up each protagonist's side of the tableau. The tableau is what lets you acquire **plot
cards**: the things the couple has done together, which make up the love story.

### Turn loop

1. Active player draws **two plot cards** and chooses one.
2. If they can complete it, they pay the cost in resources.
3. Otherwise they may use the plot card's **minor action** instead.
4. Going around the table, every other player may **bid** to add the card to their own love story,
   or leverage its minor action.

### Resources

Resources are split between the two protagonists (e.g. Prowess, Devotion, Kindness). Most plots
demand resources from **both** sides (e.g. 2 Prowess from one lead, 2 Devotion from the other),
which forces balanced character development.

Paying **exhausts** trait cards (grey exhaustion token on the card used). The tableau is a renewable
budget, not a consumable one.

Each protagonist also has a **power bowl**: a pile of face-down cards representing their energy.
**Bowl = energy, traits = capacity.** The bowl exists so energy needs no card-covering or tucking
(ugly), and it lets a player hold more energy than they have traits.

### Bidding ("auction-ish")

The printed cost is the minimum. Another player may come in over the top and pay **+1 of each
required type** (e.g. 3 Prowess + 3 Kindness against a printed 2 + 2) to take the plot into their
own love story instead.

### Minor actions

Every plot card has a minor action. Minor actions are the **engine fuel**: the main way to draw
cards and keep the tableau running. They are not a consolation prize, so declining a plot you could
afford can be correct.

Anyone who does **not** bid on the card may take its minor action, the active player included. The
active player can reveal a plot and take its minor action without ever intending to buy it.

### Leftovers

The unchosen plot card of the two drawn returns to the **bottom of the plot deck**.

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
- Up to **6 plot points**

That is at most 8 traits and 6 plots per player (40 traits in tableaus at 5 players). Each
protagonist has 2 baseline symbols plus up to 4 traits, so exactly 6 symbol slots, one per resource
type if you choose to spread.

The 90 are **one shared draw deck**. Bowl fills draw from the top of it.

Plot cards are **not** being finalized yet.

## Decisions

- Auction-ish bidding; overbid is **+1 of each required type**.
- Exhaust (not discard) trait cards to pay.
- Power bowl: face-down energy cards per protagonist; traits provide capacity.
- **Paying with a trait = exhaust it (grey cube) + spend one energy** from that protagonist's bowl.
  The trait then yields its full value (e.g. a trait worth 2 Prowess pays 2 for 1 cube + 1 bowl
  card). So a 2+2 plot can cost one trait and one bowl card on each side. Traits set which types you
  can pay and how much per energy; the bowl sets how often.
- **Setup:** each player deals 6 trait cards, then places 1 into each power bowl (2 total, face
  down), leaving 4 in hand. (My reading; confirm.)
- **Baseline symbols are exhaustable like a trait:** a protagonist's two printed symbols are
  pre-played traits, paid with a cube plus a bowl card as usual.
- **Six resource types:** Allure, Prowess, Passion, Devotion, Influence, Mystique.
- **Playing a trait costs N discards from hand**, where N is the trait's number (a 2 Influence trait
  costs 2 other cards). This prices value-2 traits, so they are no free lunch.
- **Traits are played only via a minor action.**
- Hand refill comes from minor actions, not a fixed draw.
- Minor actions include: draw cards into hand, add cards to a bowl, remove exhaustion tokens. No
  fixed refresh phase.
- **A trait's number does triple duty:** its play cost (discards), its capacity per exhaust, and its
  energy value if discarded. Discarding a 4 Allure for the bowl action puts 4 cards from the top of
  your deck face-down into your power bowls.
- Some minor actions let you **split a discarded card's number** across effects (e.g. remove 1
  exhaustion cube, add 3 energy).
- Completing a plot gives **VP + an ongoing ability** (provisional).
- End trigger: **first player to fill their 6th plot point** ends the game (provisional; finish the
  round TBD).
- **Replacing a trait** (slots full): the replaced trait is discarded and its number is deducted
  from the new trait's discard cost. Replacing with an equal or lower number is free.
- Minor actions are the primary engine; plots are goal posts.
- Non-bidders (active player included) may take the minor action.
- Unchosen plot returns to deck bottom.
- Scoring/ending: deliberately undecided; design the engine first.

## Open Questions

- **Overpay waste:** a value-2 trait against a need of 1 wastes the extra. Is that fine, or can
  surplus carry over?
- **Overbid granularity:** +1 of each type often forces an extra trait + energy per side, so
  overbids may be steep. Watch in playtest.
- **Overbid rules:** can the active player re-raise? Cap on raising rounds? Order of bids?
- **Minor action mix:** each plot has one minor action, so the plot deck's mix (draw / bowl /
  un-exhaust / play trait) _is_ the economy. Players cannot pick; they take what's revealed.
- **Shared deck drain:** trait cards played stay in tableaus and bowl cards sit face-down, so the
  deck permanently loses cards to play. Check the 90 holds at 5 players; reshuffle the discard when
  the deck is empty.
- **Scale:** mean card value is 4, so plots must cost much more than the earlier "2+2" examples, and
  overpay waste (a 7 against a need of 3) becomes a core puzzle rather than a corner case.
- **Hand limit:** playing a 4 costs 4 discards, a 7 costs 7. Is there a max hand size?
- **Baseline value:** what number do a protagonist's two baseline symbols carry? (Placeholder: 1
  each, implied and not printed on the card.)
- **Baseline "or":** the card now puts a bar between the two stacked symbols, reading as "or". Is a
  baseline one symbol you choose between (exhaust once for either), or two separate symbols (exhaust
  each)? The earlier decision above says two separate.
- **Bowl split:** when adding N energy, can you split between the two protagonists' bowls freely?
- **Energy inflation:** high-number traits flood the bowl, which may shift the bottleneck entirely
  to exhaustion cubes. Number distribution matters; test.
- **End trigger:** does the round finish when someone fills their 6th plot? Plot VP is undefined, so
  "who wins" is too.
- **Free downgrades:** replacing a trait with an equal or lower number costs nothing, so type respec
  is free. Intended flexibility or a loophole?
- **Plot abilities:** ongoing triggers vs. static discounts; keep the list small at first.
- **Scoring/ending:** undecided. Plots as VP? Tropes as sets? Acts?
- **Theme:** the name; what the traits and plots actually are.

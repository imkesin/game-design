# Regolith

Working title. A game about **deploying robots onto a small, slowly rotating planet**, built around
one mechanism: a robot works only in sunlight, and it comes home when the **shade catches it**. You
choose where to put it; the planet's rotation decides when you get it back.

This is the **fourth shape** of the game. The hex-tile colony builder (last at commit `e653fa8`) was
replaced by eleven silos with per-silo time markers (last at `731e222`, played 2026-09-08), which
were replaced by three tracks under one global level marker (last at `bf9c7da`, never played). That
abstract track board is now a **map**: a polar projection of the planet, with the sunlit half as the
playable area and the terminator as the clock.

The scope is deliberately narrow. This is not terraforming. It is an advance party of machines,
landing, charging, driving out, digging, and driving back before dark.

## Theme

You look down on the planet from one of its poles. The sun is low and off to one side, so exactly
**half the disc is lit** at any moment. The planet turns slowly. Where the light is, equipment runs;
where it isn't, nothing does.

Each player runs a **landing base** somewhere on the surface and a small fleet of general-purpose
**robots**. You send a robot out to a site, it works while the sun is on it, and when the terminator
sweeps past it the robot shuts down, drives home, and hands you what it dug up. The cost of sending
it is **energy**, and energy is proportional to **distance** — which is why you pave roads and plant
outposts, and why where you landed matters for the whole game.

What is under the surface is unknown until you look. Sites are **opened** with chemicals: you blast
and you see. Until a site is opened, no robot may be sent there.

## The Map

A disc, seen from the pole, divided into **12 zones** like clock positions, and **3 rings** from the
pole outward.

- **Locations.** Each zone holds **1 to 3 locations**, not one per ring — the fill is irregular, so
  some zones are deep and some are nearly empty. At two players the board carries **24 locations**
  in total, an average of two per zone.
- **Paths.** Locations are joined by printed paths. The network is **not a uniform grid**: some
  neighbours are unconnected, some paths cut across zones, and a few locations are reachable only
  the long way around. This irregularity is what makes siting a base a real decision.
- **Path cost.** Every path costs **2 energy** to traverse. A path with a **road** on it costs
  **1**.
- **Distance.** The cost to deploy a robot to a location is the **cheapest total path cost** from
  your nearest base or outpost to that location.

**The centre is not playable.** It is where the dial is physically mounted, so nothing sits there
and nothing routes through it. That gives the rings a job for free: because a robot cannot cross the
middle, the **inner ring is the short lap** around the planet and the **rim is the long way round**.
Two zones on opposite sides of the disc are far apart along the rim and much closer along the inner
ring — so the inner band is transit as much as it is sites, and a base sited inward trades nearby
locations for lateral reach.

## The Sun

One marker — a **dial** at the center of the board, or a pointer on a rim track — shows where the
terminator lies. It cuts the disc in half along a diameter.

- **Lit zones.** Exactly **6 contiguous zones** are in sunlight. The other 6 are dark.
- **Deployment.** A robot may only be placed into a **lit** location whose site has been **opened**.
- **Shade.** When the dial turns, the zones the light leaves go dark. **Every robot in a
  newly-darkened zone comes home at once**, to its owner, carrying the site's yield. That is the
  only way a robot returns.
- **Wait.** A robot placed in the zone that just dawned is out for six ticks; one placed in the zone
  about to go dark is home on the next tick. The wait is chosen at placement and cannot be changed.
- **Rotation.** Twelve ticks is one full rotation — one **day**.

There is no round structure and no automatic tick. **The sun moves only when a player takes a
card.**

## Turn Structure

On your turn, do exactly one of:

**(A) Deploy.** Place **any number of robots** from your hand onto open, lit, empty locations. The
**first robot is free** wherever it goes; **every robot after it pays its distance in energy**. You
may place none. The sun does **not** move.

**(B) Take a card.** Take one card from the river. **Turn the dial by the card's time symbol first**
— resolving every shade recovery that causes — and **then** perform the card's action. Refill the
river.

Then play passes.

Robots **earn**; cards **spend**; and only spending moves the clock. That is the whole loop.

**Energy buys the size of your turn.** A player with nothing can always make one real play — one
robot, anywhere on the lit half, however far. What energy buys is the _second_ robot and the third:
a broke player takes token turns and a rich one takes decisive ones. That is the same shape as the
free use on every card action (see Cards), and it is why nobody ever has a dead turn.

Because deploying never advances the sun, a player can hold the clock still as long as they have
robots and energy. Two things stop that: energy runs out, and the lit half runs out of open empty
locations. Sooner or later somebody has to turn the dial, and turning it hands every player at the
table their robots back — including your opponent's.

**Ordering matters.** The dial turns before the card's action resolves, so a high-time card hands
you the cargo from your returning robots _before_ you have to pay for what the card does. A
high-time card funds itself. It also destroys the dusk zones you were eyeing, and dawns new ones you
have not opened yet.

## Cards

A small face-up **river** — start with **3** — refilled from a shuffled deck. Take one, slide the
rest, deal one.

Every card carries:

- a **time symbol**, 0 to 2, which is how far the dial turns before the action resolves;
- an **action**, one of four;
- a **size**: how many uses it grants **spatially free**.

| Action          | Does                                                     | Material  |
| --------------- | -------------------------------------------------------- | --------- |
| **Network**     | Lay links (roads); plant outposts                        | Rock      |
| **Survey**      | Open sites: draw a resource token from the bag and place | Chemicals |
| **Manufacture** | Add robots to your fleet                                 | Metal     |
| **Energy**      | Take energy                                              | —         |

**Size is how many free uses you get, not a cap.** `Network 1` lets you lay one link anywhere for
its material cost alone; you may lay **any number more** as long as you pay each one's **distance in
energy**. Same for Survey. So no card is ever dead — a small card still does something — and a rich
player can push a card far past its printed size.

Manufacture is the exception: robots are built at your base, which is at distance 0, so it never
charges energy. Its size is a real cap.

Four actions is thin; the variety has to come from the **pairing of time symbol with size**. A
`time 0 / Network 1` card and a `time 2 / Network 3` card are different offers for the same verb,
and choosing between them is choosing how much clock you are willing to spend.

**Energy cards are the reach valve.** A player with no energy is never stuck — they still get one
free robot and one free use of any card — but they are pinned to token turns. The river has to be
able to refuel them, so Energy should be the most common card in the deck.

**Game end:** the deck runs out. At roughly one tick per card, a deck of ~24 is about two full
rotations.

## The Base

At setup each player places a base on **any location** on the board. The base **covers** that
location — it is no longer a resource site — and it is the origin for all your distance
calculations.

The base is also a **deploy slot of its own**, at distance 0.

- **Charging.** Deploy a robot onto your own base for **free**. When the shade reaches your base,
  that robot comes home with **energy** — provisionally **3**. An **outpost** charges the same way
  for less, provisionally **2**.
- **No special case.** A base is a location like any other. You may only deploy to it while it is
  **lit**, and it pays out **on bump**, exactly as a resource site does.

This is why there is no income phase and no solar-array building. Energy is earned the same way
everything else is: by committing a robot and waiting for the dark. A broke player always has a
legal, free action, and it costs them a robot and its time rather than nothing.

Your base position sets your whole rhythm, and sharply, because charging is only possible while your
base is lit. For half of every rotation the light is on your doorstep: deployments are cheap and you
can refuel. For the other half you cannot charge at all, and you are working at long range on
whatever energy you banked — or not working.

## Resources

Four, and each one **is** a system rather than merely paying for one. A player looking at their
supply should be able to read off what they are currently able to do.

| Resource     | System           | Buys                                         |
| ------------ | ---------------- | -------------------------------------------- |
| **Energy**   | **Distance**     | Every step away from your base, for anything |
| **Rock**     | **Construction** | Links and outposts                           |
| **Metal**    | **Fleet**        | New robots                                   |
| **Chemical** | **Discovery**    | Opening sites                                |

**Energy is the distance system and nothing else is.** Rock, metal and chemicals are flat material
prices — a link costs the same rock wherever it is. What varies with geography is always paid in
energy, whether you are deploying a robot, laying a link or blasting a site open. A player short on
energy is not short on options, only on **reach**: they can still act, but only close to home or
only once.

No conversion, no refining, no value ladder. A location yields its resource when the robot on it
comes home, and **the site is not consumed** — the token stays face-up and anyone may work it again.
A surveyed neighbourhood is a permanent asset, which is what makes siting a base and choosing early
survey targets matter for the whole game.

## Discovery

Locations start **empty and unknown**. A robot may not be deployed to a location that has not been
opened.

The **Survey** action opens sites: pay chemicals per site, and **draw a token from a bag** and place
it. Nothing is pre-seeded at setup, so there is no setup cost and no fixed dead neighbourhood; the
tradeoff is that you cannot scout ahead of your own spending, and the remaining distribution is
public knowledge. The card's size covers that many sites **spatially free**; blasting open anything
beyond them also costs that site's distance in energy.

Chemicals therefore gate the size of the playable board. Early on, the lit half is mostly closed and
there is very little to fight over; as chemicals accumulate the map opens up.

## Construction

The **Network** action does two things, both paid in rock:

- **Link.** Put a road on one path. It costs 1 energy to traverse instead of 2, **for everyone**,
  forever. Your edge is that you chose the line, and the line points at your base. (Consistent with
  the previous design's rule that built things are shared and carry no toll.)
- **Outpost.** Plant an outpost on an opened location. Distance is then measured from your **nearest
  base or outpost**, so your reach grows outward as a real footprint.

The card's size covers that many builds spatially free. Beyond them, each build costs its rock
**plus that spot's distance in energy** — so paving the far side of the planet is possible but
expensive, and paving outward from what you already own is cheap.

## Manufacture

Pay metal, add a robot to your fleet. You start with **2**.

Robot count is the deepest constraint in the game: it caps how much you can have working, how much
energy you can charge, and how often you are forced onto the card track.

## Setup (2 players, provisional)

- Assemble the board: 12 zones, 3 rings, 24 locations, printed path network.
- Dial on any zone boundary; 6 zones lit.
- Each player places a base on any location, in turn order. All locations start closed.
- Each player takes **2 robots** and a small starting supply — enough chemicals to open the first
  couple of sites and enough energy to reach them. Exact amounts TBD.
- Shuffle the deck, deal a river of 3.
- Whoever placed their base second takes the first turn.

## Scoring

**There is none in v0, deliberately.** The question this prototype answers is whether the sun-sweep
deployment loop is fun. Play it with no win condition and watch what the two players actually fight
over — the contested thing is the thing that should score.

Candidates, when the time comes: map footprint (outposts, roads, zone presence), delivery of
resources against public demands, or the shared escalating contribution tracks from the previous
design.

## Design Tensions to Watch

- **Who turns the dial.** Taking a card hands _every_ player their robots back. Watch for a standoff
  where both players keep deploying rather than being the one to advance the clock, and whether
  running out of open lit locations breaks it reliably enough.
- **Drip-feeding the free robot.** The first robot each turn is free and deploying does not move the
  clock, so placing **one robot per turn** may simply be correct: you would never pay energy again,
  and unlimited placement would be a dead rule. The counter-pressure is that each drip turn is a
  turn your opponent spends taking the spot you wanted or turning the dial. **Play it and see**; if
  it does dominate, the fix is to refresh the free placement **once per sun tick** rather than once
  per turn, or to grant one free placement **per base and outpost** so the footprint carries it.
- **Unlimited deployment.** The other tail of the same rule: a rich player can dump their whole
  fleet into the best spots before the other replies. Watch whether the first big deploy of each
  dawn decides too much, and whether an escalating energy cost per robot is needed.
- **Free reach at any distance.** The free use ignores distance entirely, so aiming it at the
  farthest prize on the board is always correct and roads never help the one placement that matters
  most. Watch whether links get built at all, or whether everyone just fires their free shot across
  the planet each turn.
- **Dusk is strictly better.** A robot placed one tick before the shade is a one-tick loan; one
  placed at dawn is locked up for six. Nothing pays for the long wait except that the good spots
  will not survive until dusk. Watch whether anybody ever deploys into a dawn zone. If not, the
  **solar-charge discount** is the fix on the shelf: a deployment costs less energy the more sunlit
  ticks remain, because the robot charges itself as it works.
- **Chemicals as the throttle.** Nothing can be deployed to until it is surveyed, so chemicals gate
  the whole board. Watch whether the opening is dead for several turns, and whether the starting
  supply needs to be larger or a few sites should start open.
- **Energy cards as filler.** The unstick valve can become the default move for a player who cannot
  see anything better. Watch whether Energy is taken more often than everything else combined.
- **Four actions is thin.** Variety comes entirely from time-symbol pairings. Watch whether the
  river feels like a real choice or like three versions of the same card.
- **Time 0 cards.** A card that acts without turning the dial is a free action and probably the best
  card in the deck. Watch whether they are simply taken on sight.
- **Base siting.** The base covers a location, is your distance origin, and is your only energy
  source. That is three jobs on one decision made before anything is revealed. Watch whether siting
  is a coin flip or a read, and whether a bad site is unrecoverable.
- **The dark half.** You cannot charge while your base is in shade, so energy arrives in a burst
  once a rotation and has to last. Watch whether the dark half is a real squeeze or just a pause,
  and whether an outpost on the far side is simply mandatory to smooth it out.
- **Roads are shared.** A road you paid for helps an opponent whose base is on the other end of it.
  Watch whether anybody builds, or whether both players wait for the other to pave.
- **Permanent wells.** Sites never deplete, so an early survey of a rich patch next to your base is
  an asset nobody can take away. Watch whether the first two or three surveys decide the game, and
  whether the loser has any route back.
- **The inner ring.** Its job is being the short lap, not being richer. Watch whether anybody
  actually routes through it, or whether everyone works their own arc of the rim and the inner band
  is dead board.
- **Robot scarcity.** Charging at base and working a site compete for the same two robots. Watch
  whether the opening is dominated by charging, and whether Manufacture is the only correct early
  card.

## Open Questions

- **Do outposts also charge?** An outpost is a remote base; letting it take a charging robot would
  make it much stronger and give a reason to plant one in a well-lit zone far from home. Probably
  yes, at a lower yield.
- **Bag composition.** How many tokens, of what, in what quantities, and whether quantity varies by
  token.
- **Deck composition.** How many cards, the mix of the four actions, the distribution of time
  symbols, and whether the printed fallback resource survives.
- **Starting supply.** Enough to open two sites and reach them, without making the first three turns
  scripted.
- **Player counts above two.** The previous scaling note was 12 locations per player; at 3–4 players
  that suggests deeper zones or a fourth ring. Not addressed here — v0 is a two-player board.

## Playtest Log

- **2026-09-08, 2 players.** Silo design. Played until each side had one machine; about forty
  minutes; far too slow. Ladder doubled, silos shortened, covers removed.
- **2026-09-09, three design passes (no play).** Silo design: structure cards dropped, bays built by
  Construction, upgrade prices halved, specialist defined, special projects cut.
- **2026-09-11, six passes (no play).** Eleven silos replaced by three tracks under one global level
  marker; machines, life support, batteries, recruit, five buildings and the contribution board all
  defined. Never played.
- **2026-09-16, fourth shape (no play).** Tracks replaced by a **polar map**. 12 zones, 3 rings,
  irregular 1–3 locations per zone, printed path network. The level marker becomes the
  **terminator**: half the board is lit, and shade recovery replaces the bump. Deployment cost is
  **distance in energy** from your nearest base or outpost; roads halve path cost. Base is sited on
  any location and doubles as a free distance-0 **charging slot**, which replaces every form of
  income. Six goods cut to four (Energy, Rock, Metal, Chemicals), each with exactly one job.
  Discovery added: sites are closed until **surveyed** with chemicals, drawn from a bag.
  - Turn structure went through two shapes in one session. First: a Puerto-Rico-style draft of N+1
    role cards with follow, the leader doing more, and the first player taking the leftover to
    rotate order. Abandoned because **Deploy is the only verb that touches the map** — every other
    role exists to make deployment better, so a round without a Deploy card is a round where the
    game does not happen.
  - Settled on a **Tzolk'in-shaped loop**: a turn is either _deploy any number of robots_ (no clock
    movement) or _take a card_ (turn the dial by its time symbol, then act). Robots earn, cards
    spend, and only spending moves the sun. Follow, the leader privilege and the N+1 rotation are
    all obsolete under this structure.
  - Cards reduced to four actions — Build, Survey, Manufacture, Energy — the things the board cannot
    represent. Offered as a small face-up river.
  - **Scoring deliberately left undefined.**
  - Considered and shelved: yield scaling with sunlit rounds; a solar-charge discount pricing the
    wait; tableau-building with the action cards; on-map machines with the owner-free kicker; base
    buildings; chemicals as a separate mechanic from surveying.
- **2026-09-18, fifth pass (no play).** The **free first use** added as a general grammar: the first
  robot you place each turn is free at **any distance**, and a card's **size** is how many uses it
  grants spatially free rather than a cap. Everything past the free ones pays its **distance in
  energy**, so energy buys the _size_ of a turn and nobody ever has a dead one.
  - **Energy is the distance system and nothing else is.** Rock, metal and chemicals are flat
    material prices; anything that varies with geography is paid in energy, whether deploying,
    laying a link or blasting a site. Resources are now named for the system each one is, so a
    player can read their supply and see what they are able to do.
  - Build renamed **Network**. Manufacture happens at the base (distance 0), so its size is a real
    cap and it is the one action energy cannot extend.
  - Known and accepted risk: deploying does not move the clock, so drip-feeding one free robot per
    turn may dominate and make unlimited placement a dead rule. Fixes on the shelf are refreshing
    the free placement per sun tick, or one free placement per base and outpost. Decision was to
    play it and find out.
  - Charging simplified: no lit/dark yield table. A base is a location like any other — deployable
    only while lit, paying out on bump — so a robot charges **once**, provisionally 3 at a base and
    2 at an outpost. The rhythm comes from being unable to charge at all during your dark half.
  - Sites **do not deplete**: a robot hauls a copy and the token stays, so a surveyed patch is a
    permanent asset. The centre of the disc is the dial's mount, not playable space, which makes the
    inner ring the short lap and the rim the long way round.
  - Obsolete material removed from the repo: the three-track board, the contribution board, both
    print routes, and the food and water marks. `domain.ts` rewritten to the four resources and the
    settled constants. Recoverable at `bf9c7da`.

## Prototype (v0)

The existing print routes in `src/games/regolith` render the **three-track** board and are now
obsolete: `components/TrackBoard.tsx`, `components/ContributionBoard.tsx`, and the `TRACKS`/`TIERS`
data in `domain.ts`. The `marks/` set is still useful — `energy`, `rock`, `metal`, `chemical`,
`time` and `worker` all survive; `food` and `water` do not.

What v0 needs printed:

- **The map.** One sheet: the disc, 12 zone divisions, 3 rings, the irregular locations and the path
  network. Locations sized to take a face-up resource token and a robot. Paths wide enough to take a
  road marker.
- **The dial.** A rotating pointer at the center, or a 12-step track around the rim with one marker,
  shading the six lit zones unambiguously. This has to read instantly from across the table — it is
  the single most-consulted piece of information in the game.
- **Cards.** Time symbol, action, size, fallback resource.
- **Tokens.** Resource tokens for the bag; robots; road and outpost markers per player; two bases.
- **Player aid.** The two turn options, the deploy cost rule, and the shade-recovery rule.

import type { TradeTrack } from "./domain"

/**
 * The seven trade tracks, one per adjacent pair in the resource chain (Maple
 * Syrup through Flour). Each ladder is centred on its starting rate, so `levels`
 * sets how far the rate can travel in either direction — 5 levels is two steps
 * each way.
 *
 * Every track is five rungs, and that number is doing two jobs at once.
 *
 * The first is simply how far a price may move. Length used to be a per-market
 * lever — the strip once ran 5, 7, 7, 7, 9, 9, 9 and printed as a wedge, the
 * idea being that a short ladder is a tight market. It was a lever nobody could
 * feel. What a player reads off a ladder is the numbers on it, and the long
 * tracks reached 6:2 and 2:6 in the staples, which is not a market moving but a
 * market broken. Two steps in each direction is enough for a shove to matter and
 * short enough that nothing silly is printable.
 *
 * The second is what the numerals come out as, because the two follow from each
 * other. A track centred on `2:2` runs `2:4` down to `4:2` — nothing above 4 and
 * the two sides perfectly mirrored. A track centred on `2:4` runs `2:6` down to
 * `2:2`, which reaches 6 but never crosses parity at all: Syrup and Bananas keep
 * their side pinned at 2 on every rung they have.
 *
 * That floor is the whole reason the first track can open off parity safely.
 * Opening at `2:4`, it converts a player's two starting syrup into exactly one
 * topping-eater's hire (see `STARTING_SYRUP`), which is the game's intended
 * first move; five rungs is what guarantees those two syrup always fetch at
 * least two chocolate, however hard the table shoves. A player whose opening
 * gets moved is delayed, never blocked. At seven rungs the same ladder reached
 * `3:2`, where two syrup buys nothing — that hole is what going back to five
 * closes.
 */
export const tradeTracks: readonly TradeTrack[] = [
  {
    id: "maple-syrup-chocolate",
    left: "maple-syrup",
    right: "chocolate",
    startingRatio: { left: 2, right: 4 },
    levels: 5
  },
  {
    id: "chocolate-blueberries",
    left: "chocolate",
    right: "blueberries",
    startingRatio: { left: 2, right: 2 },
    levels: 5
  },
  {
    id: "blueberries-bananas",
    left: "blueberries",
    right: "bananas",
    startingRatio: { left: 2, right: 2 },
    levels: 5
  },
  {
    id: "bananas-eggs",
    left: "bananas",
    right: "eggs",
    startingRatio: { left: 2, right: 4 },
    levels: 5
  },
  {
    id: "eggs-milk",
    left: "eggs",
    right: "milk",
    startingRatio: { left: 2, right: 2 },
    levels: 5
  },
  {
    id: "milk-butter",
    left: "milk",
    right: "butter",
    startingRatio: { left: 2, right: 2 },
    levels: 5
  },
  {
    id: "butter-flour",
    left: "butter",
    right: "flour",
    startingRatio: { left: 2, right: 2 },
    levels: 5
  }
]

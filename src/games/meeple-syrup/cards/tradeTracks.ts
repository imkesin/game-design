import type { TradeTrack } from "./domain"

/**
 * The seven trade tracks, one per adjacent pair in the resource chain (Maple
 * Syrup through Flour). Each ladder is centred on its starting rate, so `levels`
 * sets how far the rate can travel in either direction — 5 levels is two steps
 * each way, 9 is four.
 *
 * Lengths grow left to right (5, 7, 7, 7, 9, 9, 9), so the strip of ladders
 * prints as a wedge: the syrup end of the chain is a tight market, the staples
 * end a loose one.
 *
 * The first track carries more weight than the rest and its numbers are load
 * bearing. Opening at `2:4`, it converts a player's two starting syrup into
 * exactly one topping-eater's hire (see `STARTING_SYRUP`), which is the game's
 * intended first move. Five rungs makes it the shortest ladder on the board, so
 * the rate a player is likeliest to want on turn one is also the one hardest to
 * shove out from under them — and because Syrup's side stays pinned at 2 across
 * all five, the worst that opening ever fetches is half a hire.
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
    levels: 7
  },
  {
    id: "blueberries-bananas",
    left: "blueberries",
    right: "bananas",
    startingRatio: { left: 2, right: 2 },
    levels: 7
  },
  {
    id: "bananas-eggs",
    left: "bananas",
    right: "eggs",
    startingRatio: { left: 2, right: 4 },
    levels: 7
  },
  {
    id: "eggs-milk",
    left: "eggs",
    right: "milk",
    startingRatio: { left: 2, right: 2 },
    levels: 9
  },
  {
    id: "milk-butter",
    left: "milk",
    right: "butter",
    startingRatio: { left: 2, right: 2 },
    levels: 9
  },
  {
    id: "butter-flour",
    left: "butter",
    right: "flour",
    startingRatio: { left: 2, right: 2 },
    levels: 9
  }
]

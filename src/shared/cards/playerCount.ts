/**
 * Player-count vocabulary shared by every game: all of them are 2-5 player, and
 * every deck is authored as a per-count copy table. Games re-export these from
 * their own domain module so game code keeps importing from one place.
 */
export const PLAYER_COUNTS = [2, 3, 4, 5] as const
export type PlayerCount = typeof PLAYER_COUNTS[number]

/**
 * Copies present in the printed deck, keyed by player count. Every count is
 * required so omissions are impossible; 0 means the card is absent at that
 * count.
 */
export type Copies = Record<PlayerCount, number>

/** A copy table that is identical at every player count. */
export function flatCopies(count: number): Copies {
  return { 2: count, 3: count, 4: count, 5: count }
}

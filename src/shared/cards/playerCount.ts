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
  return {
    2: count,
    3: count,
    4: count,
    5: count
  }
}

/** A copy table written as one row in `PLAYER_COUNTS` order: `perCount(3, 4, 5, 5)`. */
export function perCount(two: number, three: number, four: number, five: number): Copies {
  return {
    2: two,
    3: three,
    4: four,
    5: five
  }
}

/** Sum of several copy tables, count by count. */
export function sumCopies(tables: Iterable<Copies>): Copies {
  const total: Copies = { 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const table of tables) {
    for (const players of PLAYER_COUNTS) total[players] += table[players]
  }
  return total
}

/**
 * Assert that a named group of copy tables prints exactly `expected` cards at
 * every player count. Call at module scope next to the table it guards so a
 * mis-typed copy count fails on import rather than at the printer.
 *
 * Also rejects a table that shrinks as players are added: `expandDeck` stamps
 * each copy with the count at which it enters and can only add copies, so a
 * decreasing table would print more cards than it claims — and the totals here
 * would pass while the deck is wrong.
 */
export function assertCopyTotals(
  label: string,
  tables: Readonly<Record<string, Copies>>,
  expected: Copies
): void {
  for (const [key, table] of Object.entries(tables)) {
    PLAYER_COUNTS.reduce((previous, players) => {
      if (table[players] < previous) {
        throw new Error(
          `${label}: ${key} drops from ${previous} to ${
            table[players]
          } copies at ${players} players; copy counts may only grow.`
        )
      }
      return table[players]
    }, 0)
  }

  const actual = sumCopies(Object.values(tables))
  const wrong = PLAYER_COUNTS
    .filter((players) => actual[players] !== expected[players])
    .map((players) => `${players} players: ${actual[players]}, expected ${expected[players]}`)

  if (wrong.length > 0) throw new Error(`${label}: wrong card total — ${wrong.join("; ")}`)
}

import { type Copies, PLAYER_COUNTS, type PlayerCount } from "./playerCount"

/** Any authored catalog entry: intrinsic card data plus its per-count copy table. */
type Definition = { readonly copies: Copies }

/**
 * `Omit` that distributes over unions, so a discriminated card union survives
 * having `copies` stripped. The built-in `Omit` would collapse
 * `FieldCard | ImprovementCard` down to their common keys.
 */
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never

/**
 * A single physical card: a definition minus its copy table, stamped with the
 * player-count symbol it bears.
 */
export type Expanded<T extends Definition> = DistributiveOmit<T, "copies"> & {
  readonly minPlayerCount: PlayerCount
}

/**
 * Expand a catalog into the physical deck for `players`: one entry per printed
 * copy. A card whose copy count grows with player count is split so each copy
 * carries the player-count symbol at which it enters (`minPlayerCount`) — copies
 * {2:1,3:1,4:2} yield one "2" copy and one "4" copy. Copies whose symbol exceeds
 * `players` are filtered out, so the result holds exactly `copies[players]` of
 * each card.
 */
export function expandDeck<T extends Definition>(
  source: readonly T[],
  players: PlayerCount
): readonly Expanded<T>[] {
  return source.flatMap(({ copies, ...base }) =>
    PLAYER_COUNTS.reduce<{ previous: number; cards: Expanded<T>[] }>(
      ({ previous, cards }, minPlayerCount) => {
        const introduced = copies[minPlayerCount] - previous

        if (minPlayerCount <= players && introduced > 0) {
          cards.push(
            // The rest element is `Omit<T, "copies">`; TypeScript cannot see that
            // it satisfies the distributed form for an unresolved `T`.
            ...Array.from({ length: introduced }, () => ({ ...base, minPlayerCount }) as Expanded<T>)
          )
        }
        return { previous: copies[minPlayerCount], cards }
      },
      {
        previous: 0,
        cards: []
      }
    ).cards
  )
}

/**
 * Turn a catalog definition into a single physical card for preview, stamped
 * with the lowest player count at which it appears.
 */
export function previewCard<T extends Definition>({ copies, ...base }: T): Expanded<T> {
  const minPlayerCount = PLAYER_COUNTS.find((n) => copies[n] > 0) ?? PLAYER_COUNTS[0]
  return { ...base, minPlayerCount } as Expanded<T>
}

import { type Grid, type NeighborhoodSpec, PLOT, round, shape, type SkylineFile, snapToGrid } from "./skyline.ts"

/** Pure edits to a skyline map, for the editor to apply (and undo). Each keeps plots on the grid. */

export const LIMIT = { columns: 3, plots: 3 }

const same = ([x, y]: readonly [string, string], a: string, b: string) => (x === a && y === b) || (x === b && y === a)

export function isLinked(file: SkylineFile, a: string, b: string) {
  return file.links.some((link) => same(link, a, b))
}

export function toggleLink(file: SkylineFile, a: string, b: string): SkylineFile {
  if (a === b) return file
  return isLinked(file, a, b)
    ? { ...file, links: file.links.filter((link) => !same(link, a, b)) }
    : { ...file, links: [...file.links, [a, b]] }
}

/** A new neighborhood on the grid, centred near `at`; returns its name too. */
export function add(file: SkylineFile, grid: Grid, at: { x: number; y: number }): [SkylineFile, string] {
  const taken = new Set(file.neighborhoods.map((n) => n.name))
  let k = 1
  while (taken.has(`New ${k}`)) k++
  const columns = [2, 2]
  const { width, height } = shape(columns)
  const n: NeighborhoodSpec = {
    name: `New ${k}`,
    ...snapToGrid(grid, { x: at.x - width / 2, y: at.y - height / 2 }),
    columns
  }
  return [{ ...file, neighborhoods: [...file.neighborhoods, n] }, n.name]
}

export function remove(file: SkylineFile, name: string): SkylineFile {
  return {
    neighborhoods: file.neighborhoods.filter((n) => n.name !== name),
    links: file.links.filter(([a, b]) => a !== name && b !== name)
  }
}

/** Why `to` can't be a new name for `from`, if it can't. */
export function renameError(file: SkylineFile, from: string, to: string) {
  if (to === "") return "A neighborhood needs a name."
  if (to !== from && file.neighborhoods.some((n) => n.name === to)) return `“${to}” is already taken.`
  return undefined
}

/** Renames a neighborhood and every link to it. */
export function rename(file: SkylineFile, from: string, to: string): SkylineFile {
  const swap = (name: string) => (name === from ? to : name)
  return {
    neighborhoods: file.neighborhoods.map((n) => (n.name === from ? { ...n, name: to } : n)),
    links: file.links.map(([a, b]) => [swap(a), swap(b)])
  }
}

/**
 * New columns for a neighborhood, keeping its bottom where it was. `shift` is
 * how many columns were added (+) or removed (−) on the left, so the columns
 * that stay don't move.
 */
export function reshape(file: SkylineFile, name: string, columns: number[], shift = 0): SkylineFile {
  return {
    ...file,
    neighborhoods: file.neighborhoods.map((n) =>
      n.name === name
        ? {
          ...n,
          columns,
          x: round(n.x - shift * PLOT),
          y: round(n.y + shape(n.columns).height - shape(columns).height)
        }
        : n
    )
  }
}

/** Moves every neighborhood onto the grid. */
export function snapAll(file: SkylineFile, grid: Grid): SkylineFile {
  const moved = file.neighborhoods.map((n) => ({ ...n, ...snapToGrid(grid, n) }))
  return moved.every((n, i) => n.x === file.neighborhoods[i]!.x && n.y === file.neighborhoods[i]!.y)
    ? file
    : { ...file, neighborhoods: moved }
}

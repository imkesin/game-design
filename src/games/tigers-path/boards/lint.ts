import type { BoardGraph } from "./types.ts"

/**
 * Structural lint for a hand-authored board graph — the gameplay rules that the
 * geometry solver can't see (BOARD_PLAN §5, §10). Runs inside `buildSpec`, so
 * both `tp:map:build` and `tp:map:paint` fail with named reasons before any
 * layout work happens.
 *
 * The length-2 rules exist because a 2-cube path is the opener: it's the first
 * thing a band can afford, and it makes the adjacent clearing cheap to enter.
 *  - Opener quota: exactly 2 × players length-2 paths, so every band can get
 *    going without racing for a scarce handful.
 *  - Matching: no two length-2 paths share a clearing — otherwise one clearing
 *    becomes a double-cheap hub and the openers cluster instead of spreading.
 *  - Cost floor: every clearing a length-2 path touches has min slot cost ≥ 3,
 *    so the cheapest clearing anywhere costs 5 cubes to establish (2-path +
 *    cost-3 slot, or 3-path + cost-2 circle) — never 4.
 *  - Marquee: at most one 4-slot clearing (§5), never more than 4 slots.
 */
export function lintBoard(graph: BoardGraph, label = "board"): void {
  const byId = new Map(graph.clearings.map((c) => [c.id, c]))
  const problems: string[] = []

  for (const p of graph.paths) {
    for (const end of [p.from, p.to]) {
      if (!byId.has(end)) problems.push(`path ${p.id} references unknown clearing "${end}"`)
    }
  }

  const openers = graph.paths.filter((p) => p.length === 2)
  const quota = 2 * graph.players
  if (openers.length !== quota) {
    problems.push(`${openers.length} length-2 paths; expected ${quota} (2 × ${graph.players} players)`)
  }

  const touched = new Map<string, string[]>()
  for (const p of openers) {
    for (const end of [p.from, p.to]) touched.set(end, [...(touched.get(end) ?? []), p.id])
  }
  for (const [id, paths] of touched) {
    if (paths.length > 1) problems.push(`length-2 paths share clearing ${id}: ${paths.join(", ")}`)
    const clearing = byId.get(id)
    if (!clearing) continue
    const minCost = Math.min(...clearing.slots.map((s) => s.cost))
    if (minCost < 3) {
      problems.push(`clearing ${id} (min slot cost ${minCost}) touches length-2 path ${paths[0]}; needs ≥ 3`)
    }
  }

  const marquees = graph.clearings.filter((c) => c.slots.length >= 4)
  if (marquees.length > 1) {
    problems.push(
      `${marquees.length} clearings with 4 slots (${
        marquees.map((c) => c.id).join(", ")
      }); the marquee must be the only one`
    )
  }
  for (const c of marquees) {
    if (c.slots.length > 4) problems.push(`clearing ${c.id} has ${c.slots.length} slots; cap is 4`)
  }

  if (problems.length > 0) {
    throw new Error(`${label}: board lint failed\n  - ${problems.join("\n  - ")}`)
  }
}

/** Capacity summary for a build log line — actions = paths + slots (BOARD_PLAN §1). */
export function boardCapacity(
  graph: BoardGraph
): { clearings: number; paths: number; slots: number; actions: number; openers: number } {
  const slots = graph.clearings.reduce((n, c) => n + c.slots.length, 0)
  return {
    clearings: graph.clearings.length,
    paths: graph.paths.length,
    slots,
    actions: graph.paths.length + slots,
    openers: graph.paths.filter((p) => p.length === 2).length
  }
}

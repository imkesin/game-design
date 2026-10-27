import { parseArgs } from "node:util"
import { crossingName, layoutOf } from "../blocks/blocks.ts"
import { CITY } from "../blocks/city.ts"
import { deal } from "../setup/deal.ts"
import type { Players } from "../setup/setupCard.ts"
import { type BuildingKind, type Level, TILES } from "../tiles/tiles.ts"

/**
 * A rough economy sim of the whole city, 4 setup cards dealt as RULES.md says:
 * `npx tsx src/games/revival/sim/sim.node.ts [--players 3] [--games 100]
 * [--seed 1] [--tempo 1.5] [--width 8] [--workers 4] [--no-lines] [--incentive-value 2] [--log]
 * [--cost industrial=4,5,6] [--sale house=2,4,6] [--sale park=2]
 * [--per industrial=4] [--per park=1]`: prices by level, each flag repeatable, override the tiles'
 * and the rules'.
 *
 * The mayor walks as RULES.md says (opening walk, L-shaped paths, an incentive
 * on an empty corner and a tax at each stop), but incentives buy nothing: no
 * credit, no upgrades, so a company keeps its `--workers` all game and
 * incentives only count. Work goes along a line
 * (`--no-lines`: 1 project only), and stops before a House that can't
 * finish yet. Then the final sale (each company finishes its best
 * project at full value) and the firesale. A company with no legal move
 * passes; everyone passing in a row also ends the game.
 *
 * Every company looks one step ahead: for each of its `--width` best moves
 * (greedily), it plays the others greedily, then its own best next move, and
 * keeps the move that ends richest: coins, plus each project at what it would
 * sell for now, less `--tempo` coins (what a turn is worth) per worker still
 * on it. Incentives held only break ties, unless `--incentive-value` gives
 * them a worth in coins (a guess: they buy nothing here; the score is coins
 * only). Once the game is over, it's what the
 * final sale and firesale pay. Nobody sees the bags or the walks: a fresh row
 * is unknown until it's dealt. The walker picks the target and L that tax
 * rivals most and itself least, and puts each incentive in the block where it
 * has the most buildings.
 */

type Leveled = Exclude<BuildingKind, "park">

/** A row tile's construction face. */
type Project = { kind: Leveled; level: Level; cost: number; sale: number }

/**
 * On a plot; `workers` still on it, 0 once finished. A Park's `level` is 0.
 * Historical buildings have no owner.
 */
type Building = { kind: BuildingKind; level: Level | 0; sale: number; owner?: number; workers: number; placed: number }

type Company = { coins: number; idle: number; incentives: number }

type State = {
  plots: readonly (Building | undefined)[]
  row: readonly Project[]
  /** L1, L2, L3, each shuffled; tiles come off the end. */
  bags: readonly (readonly Project[])[]
  parks: number
  companies: readonly Company[]
  turn: number
  clock: number
  /** Walks left in the game. */
  walks: number
  /** Incentives waiting on each plot. */
  incentives: readonly number[]
  /** The intersection the mayor stands on. */
  mayor: number
  /** The 2 face-up agenda cards, then the rest of the game's deck. */
  agenda: readonly number[]
  deck: readonly number[]
}

/** `work`: the plots worked, in order along a line. */
type Move = { slot: number | "park"; block: number } | { work: readonly number[] }

/** `base`: the tile's own sale value, before the count. `took`: turns (everyone's) from breaking ground to the sale. */
type Sale = { kind: BuildingKind; level: Level | 0; owner: number; value: number; base: number; took: number }

const SURCHARGE = [0, 0, 1, 1, 2, 2, 3, 3] as const
const ROW_SIZE = { 2: 5, 3: 6, 4: 7, 5: 8 } as const satisfies Record<Players, number>
/** Agenda cards less the opening walk's. */
const WALKS = { 2: 12, 3: 12, 4: 11, 5: 10 } as const satisfies Record<Players, number>
const WORKERS = { park: 1, house: 1, commercial: 2, industrial: 3 } as const satisfies Record<BuildingKind, number>
const DRAWS = { house: "park", commercial: "house", industrial: "commercial" } as const satisfies Record<
  Leveled,
  BuildingKind
>
/** By seat: the first company takes a minor hit. */
const startCoins = (seat: number) => (seat === 0 ? 3 : 4)

const { values } = parseArgs({
  options: {
    players: { type: "string", default: "3" },
    games: { type: "string", default: "100" },
    seed: { type: "string", default: "1" },
    tempo: { type: "string", default: "1.5" },
    width: { type: "string", default: "8" },
    cost: { type: "string", multiple: true, default: [] },
    sale: { type: "string", multiple: true, default: [] },
    per: { type: "string", multiple: true, default: [] },
    workers: { type: "string", default: "4" },
    lines: { type: "boolean", default: true },
    "incentive-value": { type: "string", default: "0.001" },
    log: { type: "boolean", default: false }
  },
  allowNegative: true
})
const TEMPO = Number(values.tempo)
const WIDTH = Number(values.width)
/** Each company's workers, all game: no upgrades (the rules start at 3). */
const WORKERS_EACH = Number(values.workers)
const INCENTIVE_VALUE = Number(values["incentive-value"])
/** `kind=a,b,c` by level (a Park's sale, or a count's pay, is one number). */
function overrides(specs: readonly string[]) {
  return new Map(specs.map((spec) => {
    const [kind = "", list = ""] = spec.split("=")
    if (!["park", "house", "commercial", "industrial"].includes(kind)) throw new Error(`unknown kind in "${spec}"`)
    return [kind, list.split(",").map(Number)] as const
  }))
}
const COSTS = overrides(values.cost)
const SALES = overrides(values.sale)
const PERS = overrides(values.per)
const PARK_SALE = SALES.get("park")?.[0] ?? 1
/** What each counted building pays. */
const PER = {
  house: PERS.get("house")?.[0] ?? 1,
  commercial: PERS.get("commercial")?.[0] ?? 2,
  industrial: PERS.get("industrial")?.[0] ?? 4
} satisfies Record<Leveled, number>
/** A trial rule, off by default: a Park pays this per other finished Park in its own block (not doubled, no reach). */
const PARK_PER = PERS.get("park")?.[0] ?? 0

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0)

/** Block-columns' widths left to right, block-rows' heights top to bottom, in plots. */
const WIDTHS = CITY.cols.flat()
const HEIGHTS = CITY.rows.flat().toReversed()
const SIDE = sum(WIDTHS)

/** The city's blocks, row by row from the top-left, each as its plots' (x, y) from the board's top-left. */
const CITY_BLOCKS = HEIGHTS.flatMap((_, r) =>
  WIDTHS.map((_, c) =>
    layoutOf(CITY, HEIGHTS.length - 1 - r, c).plots.map(([x, y]) =>
      [sum(WIDTHS.slice(0, c)) + x, sum(HEIGHTS.slice(0, r)) + y] as const
    )
  )
)

/** Plots by index; `BLOCKS` holds each block's plot indices. */
const XY = CITY_BLOCKS.flat()
const BLOCKS = CITY_BLOCKS.reduce<number[][]>(
  (acc, plots) => [...acc, plots.map((_, k) => acc.flat().length + k)],
  []
)
const BLOCK_OF = BLOCKS.flatMap((plots, b) => plots.map(() => b))
const plotAt = (x: number, y: number) => XY.findIndex(([px, py]) => px === x && py === y)

/** Plot indices by (x, y), -1 off the board or on the plaza. */
const GRID = Array.from({ length: SIDE * SIDE }, (_, k) => plotAt(k % SIDE, Math.floor(k / SIDE)))
const gridAt = (x: number, y: number) => (x < 0 || y < 0 || x >= SIDE || y >= SIDE ? -1 : (GRID[y * SIDE + x] ?? -1))
const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const

/**
 * Intersections, `row * STREETS + col`: north–south street `col` from the west,
 * east–west street `row` from the south, as on the agenda cards. Each one's
 * corners are the 4 plots touching it (none at City Hall).
 */
const STREETS = WIDTHS.length - 1
const HALL = CITY.hall.row * STREETS + CITY.hall.col
const CORNERS = Array.from({ length: STREETS * STREETS }, (_, k) => {
  const [col, row] = [k % STREETS, Math.floor(k / STREETS)]
  const [x, y] = [sum(WIDTHS.slice(0, col + 1)), sum(HEIGHTS.slice(0, STREETS - row))]
  return [gridAt(x - 1, y - 1), gridAt(x, y - 1), gridAt(x - 1, y), gridAt(x, y)].filter((i) => i >= 0)
})
const CROSSING_OF = XY.map((_, i) => CORNERS.findIndex((corners) => corners.includes(i)))
if (CROSSING_OF.some((k, i) => k < 0 || CORNERS.filter((c) => c.includes(i)).length !== 1)) {
  throw new Error("every plot should be a corner of exactly one intersection")
}
const nameOf = (k: number) => crossingName(k % STREETS, Math.floor(k / STREETS))

/** The intersections an L-shaped walk steps onto, start excluded, target included: one per way to turn. */
function pathsTo(from: number, to: number): number[][] {
  const at = (col: number, row: number) => row * STREETS + col
  const [c0, r0, c1, r1] = [from % STREETS, Math.floor(from / STREETS), to % STREETS, Math.floor(to / STREETS)]
  const run = (a: number, b: number) =>
    Array.from({ length: Math.abs(b - a) }, (_, i) => a + Math.sign(b - a) * (i + 1))
  const across = [...run(c0, c1).map((c) => at(c, r0)), ...run(r0, r1).map((r) => at(c1, r))]
  const up = [...run(r0, r1).map((r) => at(c0, r)), ...run(c0, c1).map((c) => at(c, r1))]
  return c0 === c1 || r0 === r1 ? [across] : [across, up]
}

/** Each block's neighbors across a street (not diagonal). */
const NEIGHBORS = BLOCKS.map((_, b) => {
  const [r, c] = [Math.floor(b / WIDTHS.length), b % WIDTHS.length]
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
    .filter(([nr = -1, nc = -1]) => nr >= 0 && nr < HEIGHTS.length && nc >= 0 && nc < WIDTHS.length)
    .map(([nr = 0, nc = 0]) => nr * WIDTHS.length + nc)
})

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rng = () => number

function shuffle<T>(list: readonly T[], rng: Rng): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j] as T, out[i] as T]
  }
  return out
}

const finishedIn = (plots: State["plots"], block: number, kind: BuildingKind) =>
  (BLOCKS[block] ?? []).filter((j) => {
    const b = plots[j]
    return b?.workers === 0 && b.kind === kind
  }).length

/** Own block twice, plus the best `level - 1` neighboring blocks once each. */
function saleOf(plots: State["plots"], i: number) {
  const b = plots[i]
  if (b === undefined) return 0
  const { kind, level, sale } = b
  if (kind === "park") {
    const others = finishedIn(plots, BLOCK_OF[i] ?? 0, "park") - (b.workers === 0 ? 1 : 0)
    return sale + PARK_PER * others
  }
  const block = BLOCK_OF[i] ?? 0
  const near = (NEIGHBORS[block] ?? [])
    .map((n) => finishedIn(plots, n, DRAWS[kind]))
    .toSorted((x, y) => y - x)
    .slice(0, level - 1)
  return sale + PER[kind] * (2 * finishedIn(plots, block, DRAWS[kind]) + sum(near))
}

const hasRoom = (plots: State["plots"], block: number) => (BLOCKS[block] ?? []).some((i) => plots[i] === undefined)
const over = (s: State) => s.walks === 0 || s.plots.every((b) => b !== undefined)

/** A House's last worker stays on until its block is full. */
function workable(plots: State["plots"], i: number) {
  const b = plots[i]
  if (b === undefined || b.workers === 0) return false
  return b.kind !== "house" || b.workers > 1 || !hasRoom(plots, BLOCK_OF[i] ?? 0)
}

function movesOf(s: State): Move[] {
  const me = s.companies[s.turn]
  if (me === undefined || over(s)) return []
  const slots: (number | "park")[] = []
  const seen = new Set<string>()
  s.row.forEach((tile, slot) => {
    const key = `${tile.kind}${tile.level}`
    if (seen.has(key)) return
    seen.add(key)
    if (me.coins >= tile.cost + (SURCHARGE[slot] ?? 0) && me.idle >= WORKERS[tile.kind]) slots.push(slot)
  })
  if (s.parks > 0 && me.idle >= WORKERS.park) slots.push("park")
  const blocks = BLOCKS.map((_, b) => b).filter((b) => hasRoom(s.plots, b))
  const works = s.plots.flatMap((_, i) => linesFrom(s, i).map((work) => ({ work })))
  return [...slots.flatMap((slot) => blocks.map((block) => ({ slot, block }))), ...works]
}

/** Every line of the company's projects it could work from `start`: each way along its row and column, any length. */
function linesFrom(s: State, start: number): number[][] {
  const mine = (i: number) => s.plots[i]?.owner === s.turn && workable(s.plots, i)
  if (!mine(start)) return []
  const lines = [[start]]
  if (!values.lines) return lines
  for (const [dx, dy] of DIRECTIONS) {
    let [x = 0, y = 0] = XY[start] ?? []
    const line = [start]
    for (;;) {
      ;[x, y] = [x + dx, y + dy]
      const i = gridAt(x, y)
      if (i < 0 || !mine(i)) break
      line.push(i)
      lines.push([...line])
    }
  }
  return lines
}

const pass = (s: State): State => ({ ...s, turn: (s.turn + 1) % s.companies.length, clock: s.clock + 1 })

function apply(s: State, move: Move): { state: State; sales: Sale[] } {
  const plots = [...s.plots]
  const companies = s.companies.map((c) => ({ ...c }))
  const me = companies[s.turn] as Company

  if ("work" in move) {
    const sales: Sale[] = []
    for (const i of move.work) {
      const b = plots[i]
      if (b === undefined) throw new Error(`no project on plot ${i}`)
      plots[i] = { ...b, workers: b.workers - 1 }
      me.idle++
      if (b.workers > 1) continue
      const value = saleOf(plots, i)
      me.coins += value
      if (CROSSING_OF[i] === s.mayor) me.incentives++
      sales.push({ kind: b.kind, level: b.level, owner: s.turn, value, base: b.sale, took: s.clock - b.placed })
    }
    return { state: { ...pass(s), plots, companies }, sales }
  }

  const { slot, block } = move
  const row = [...s.row]
  let parks = s.parks
  let tile: { kind: BuildingKind; level: Level | 0; sale: number }
  if (slot === "park") {
    parks--
    row.shift()
    tile = { kind: "park", level: 0, sale: PARK_SALE }
  } else {
    const [taken] = row.splice(slot, 1)
    if (taken === undefined) throw new Error(`no tile in slot ${slot}`)
    me.coins -= taken.cost + (SURCHARGE[slot] ?? 0)
    tile = taken
  }
  me.idle -= WORKERS[tile.kind]
  const empty = (BLOCKS[block] ?? []).filter((i) => plots[i] === undefined)
  const at = empty.reduce<number | undefined>(
    (top, i) => (top === undefined || (s.incentives[i] ?? 0) > (s.incentives[top] ?? 0) ? i : top),
    undefined
  )
  if (at === undefined) throw new Error(`block ${block} is full`)
  const incentives = [...s.incentives]
  me.incentives += incentives[at] ?? 0
  incentives[at] = 0
  plots[at] = {
    kind: tile.kind,
    level: tile.level,
    sale: tile.sale,
    owner: s.turn,
    workers: WORKERS[tile.kind],
    placed: s.clock
  }
  return { state: { ...pass(s), plots, row, parks, companies, incentives }, sales: [] }
}

type Walk = { state: State; target: number; stops: number; placed: number; taxed: number[]; abandoned: number }

/**
 * The mayor walks `path`, `walker` choosing (RULES.md, The mayor's walk): at
 * each stop, an incentive on an empty corner if there is one, then a tax of 1
 * coin per project on the corners; a company that can't pay abandons that
 * many of its taxed projects, its least valuable first.
 */
function walkPath(s: State, walker: number, path: readonly number[], rng: Rng): Walk {
  const plots = [...s.plots]
  const incentives = [...s.incentives]
  const companies = s.companies.map((c) => ({ ...c }))
  const taxed = companies.map(() => 0)
  let [placed, abandoned] = [0, 0]
  for (const stop of path) {
    const corners = CORNERS[stop] ?? []
    if (corners.length === 0) continue
    const empty = corners.filter((i) => plots[i] === undefined)
    if (empty.length > 0) {
      const mine = (i: number) => (BLOCKS[BLOCK_OF[i] ?? 0] ?? []).filter((j) => plots[j]?.owner === walker).length
      const at = best(empty, mine, rng) ?? 0
      incentives[at] = (incentives[at] ?? 0) + 1
      placed++
    }
    companies.forEach((c, p) => {
      const projects = corners.filter((i) => plots[i]?.owner === p && (plots[i]?.workers ?? 0) > 0)
      const owed = projects.length
      const paid = Math.min(owed, c.coins)
      c.coins -= paid
      taxed[p] = (taxed[p] ?? 0) + paid
      const lost = projects.toSorted((a, b) => saleOf(plots, a) - saleOf(plots, b)).slice(0, owed - paid)
      for (const i of lost) {
        c.idle += plots[i]?.workers ?? 0
        plots[i] = undefined
        abandoned++
      }
    })
  }
  const target = path.at(-1) ?? s.mayor
  return {
    state: { ...s, plots, incentives, companies, mayor: target },
    target,
    stops: path.length,
    placed,
    taxed,
    abandoned
  }
}

/** The walker's pick of target and L: the most tax on rivals for the least on itself. */
function walk(s: State, walker: number, rng: Rng): Walk {
  const options = s.agenda.flatMap((target) => pathsTo(s.mayor, target).map((path) => walkPath(s, walker, path, rng)))
  const rivals = Math.max(s.companies.length - 1, 1)
  const chosen = best(options, (w) => (sum(w.taxed) - 2 * (w.taxed[walker] ?? 0)) / rivals, rng)
  if (chosen === undefined) return { state: s, target: s.mayor, stops: 0, placed: 0, taxed: [], abandoned: 0 }
  const [next, ...deck] = s.deck
  const agenda = [...s.agenda.filter((k) => k !== chosen.target), ...(next === undefined ? [] : [next])]
  return { ...chosen, state: { ...chosen.state, agenda, deck } }
}

/** Deal a row (RULES.md, The row): the lowest bag with tiles, the last slot from the next bag up. */
function dealRow(s: State, size: number): State {
  const bags = s.bags.map((b) => [...b])
  const take = (from: number) => bags.slice(from).find((b) => b.length > 0)?.pop()
  const row: Project[] = []
  for (let slot = 0; slot < size; slot++) {
    const lowest = bags.findIndex((b) => b.length > 0)
    if (lowest < 0) break
    const tile = slot === size - 1 ? (take(Math.min(lowest + 1, bags.length - 1)) ?? take(lowest)) : take(lowest)
    if (tile !== undefined) row.push(tile)
  }
  return { ...s, row, bags }
}

/** End of turn: a row down to 2 tiles means the walker walks the mayor, then a fresh row. */
function endTurn(s: State, size: number, walker: number, rng: Rng): { state: State; walked?: Walk } {
  if (s.row.length > 2) return { state: s }
  const walked = walk(s, walker, rng)
  const after = { ...walked.state, walks: s.walks - 1 }
  return { state: after.walks === 0 ? after : dealRow(after, size), walked }
}

/** End of turn as a company foresees it: the last walk ends the game; a fresh row is unknown. */
const foresee = (s: State): State => (s.row.length <= 2 && s.walks === 1 ? { ...s, walks: 0 } : s)

const step = (s: State, m: Move) => foresee(apply(s, m).state)

/** Each company's projects as the end of the game sells them: the best one at full value, the rest firesold. */
function endgame(s: State, p: number) {
  const [top, ...rest] = s.plots
    .flatMap((b, i) => (b?.owner === p && b.workers > 0 ? [{ full: saleOf(s.plots, i), fire: b.level }] : []))
    .toSorted((a, b) => b.full - b.fire - (a.full - a.fire))
  return { top, rest }
}

function score(s: State, p: number) {
  const coins = s.companies[p]?.coins ?? 0
  if (over(s)) {
    const { top, rest } = endgame(s, p)
    return coins + (top?.full ?? 0) + sum(rest.map((x) => x.fire))
  }
  return s.plots.reduce(
    (total, b, i) => (b?.owner === p && b.workers > 0 ? total + saleOf(s.plots, i) - TEMPO * b.workers : total),
    coins + INCENTIVE_VALUE * (s.companies[p]?.incentives ?? 0)
  )
}

function best<T>(options: readonly T[], value: (o: T) => number, rng: Rng): T | undefined {
  let [top, picks] = [-Infinity, [] as T[]]
  for (const o of options) {
    const v = value(o)
    if (v > top) [top, picks] = [v, [o]]
    else if (v === top) picks.push(o)
  }
  return picks[Math.floor(rng() * picks.length)]
}

const greedy = (s: State, rng: Rng) => best(movesOf(s), (m) => score(step(s, m), s.turn), rng)

function lookahead(s: State, rng: Rng) {
  const p = s.turn
  const shortlist = shuffle(movesOf(s), rng)
    .map((m) => ({ m, v: score(step(s, m), p) }))
    .toSorted((a, b) => b.v - a.v)
    .slice(0, WIDTH)
    .map(({ m }) => m)
  return best(shortlist, (m) => {
    let t = step(s, m)
    for (let k = 1; k < s.companies.length; k++) {
      const reply = greedy(t, rng)
      t = reply === undefined ? pass(t) : step(t, reply)
    }
    const next = movesOf(t)
    return next.length === 0 ? score(t, p) : Math.max(...next.map((n) => score(step(t, n), p)))
  }, rng)
}

type Result = {
  coins: number[]
  built: Map<string, number>
  sales: Sale[]
  works: number
  /** Workers taken off over all Work actions. */
  worked: number
  passes: number
  turns: number
  walks: number
  /** Each company's coins right after each walk. */
  byWalk: number[][]
  /** Incentives each company ends with. */
  incentives: number[]
  /** Per game: incentives the mayor put down, tax paid, projects abandoned, stops. */
  placed: number
  taxed: number
  abandoned: number
  stops: number
  filled: number
  /** Ended with every company passing, before the last walk. */
  stuck: boolean
  finalSale: number[]
  firesold: number
  board: State["plots"]
  log: string[]
}

const LETTER = { house: "h", commercial: "c", industrial: "i", park: "p" } as const
const label = (kind: BuildingKind, level: Level | 0) => (kind === "park" ? "park" : `${kind} L${level}`)

function play(players: Players, rng: Rng): Result {
  const setup = deal(players, rng)
  const plots: (Building | undefined)[] = XY.map(() => undefined)
  for (const [key, { face }] of setup.plots) {
    const [x = 0, y = 0] = key.split(",").map(Number)
    if (face.kind === "blight") continue
    plots[plotAt(x, y)] = { kind: face.kind, level: face.kind === "park" ? 0 : 1, sale: 0, workers: 0, placed: 0 }
  }
  const historical = (kind: BuildingKind) => plots.filter((b) => b?.kind === kind).length
  const used = new Map<Leveled, number>()
  const bags = ([1, 2, 3] as const).map((level) =>
    shuffle(
      TILES.flatMap(({ a }) => {
        if (a.kind === "blight" || a.kind === "park" || a.level !== level) return []
        const n = used.get(a.kind) ?? 0
        if (level === 1) used.set(a.kind, n + 1)
        if (level === 1 && n < historical(a.kind)) return []
        const cost = COSTS.get(a.kind)?.[level - 1] ?? a.cost ?? 0
        const sale = SALES.get(a.kind)?.[level - 1] ?? a.sale ?? 0
        return [{ kind: a.kind, level, cost, sale }]
      }),
      rng
    )
  )
  const size = ROW_SIZE[players]
  const agenda = shuffle(CORNERS.map((_, k) => k).filter((k) => k !== HALL), rng).slice(0, WALKS[players] + 1)
  const [opening = HALL, ...faceUp] = agenda
  const unwalked: State = {
    plots,
    row: [],
    bags,
    parks: TILES.filter(({ a }) => a.kind === "park").length - historical("park"),
    companies: Array.from({ length: players }, (_, i) => ({ coins: startCoins(i), idle: WORKERS_EACH, incentives: 0 })),
    turn: 0,
    clock: 0,
    walks: WALKS[players],
    incentives: plots.map(() => 0),
    mayor: HALL,
    agenda: faceUp.slice(0, 2),
    deck: faceUp.slice(2)
  }
  const openingPath = pathsTo(HALL, opening)
  const opened = walkPath(unwalked, 0, openingPath[Math.floor(rng() * openingPath.length)] ?? [], rng)
  let s: State = dealRow(opened.state, size)

  const result: Result = {
    placed: opened.placed,
    coins: [],
    built: new Map(),
    sales: [],
    works: 0,
    worked: 0,
    passes: 0,
    turns: 0,
    walks: 0,
    byWalk: [],
    incentives: [],
    taxed: 0,
    abandoned: 0,
    stops: 0,
    filled: 0,
    stuck: false,
    finalSale: [],
    firesold: 0,
    board: [],
    log: []
  }
  let passesInARow = 0
  while (!over(s) && passesInARow < players) {
    const p = s.turn
    const move = lookahead(s, rng)
    if (move === undefined) {
      passesInARow++
      result.passes++
      result.log.push(`P${p + 1} passes`)
      s = pass(s)
    } else {
      passesInARow = 0
      const { state, sales } = apply(s, move)
      let what: string
      if ("work" in move) {
        result.works++
        result.worked += move.work.length
        const worked = move.work.map((i) => {
          const b = state.plots[i]
          return `${b === undefined ? "?" : label(b.kind, b.level)} (block ${BLOCK_OF[i]}, ${b?.workers} left)`
        })
        what = `works ${worked.join(", ")}` + (sales.length ? ` · sells ${sales.map((x) => x.value).join(" ")}` : "")
      } else {
        const tile = move.slot === "park" ? undefined : s.row[move.slot]
        const name = tile === undefined ? "park" : label(tile.kind, tile.level)
        result.built.set(name, (result.built.get(name) ?? 0) + 1)
        what = `builds ${name}${move.slot === "park" ? "" : ` (slot ${move.slot})`} → block ${move.block}`
      }
      result.sales.push(...sales)
      result.log.push(`P${p + 1} ${what}  [${state.companies.map((c) => c.coins).join(" ")}]`)
      s = state
    }
    const { state: ended, walked } = endTurn(s, size, p, rng)
    s = ended
    if (walked !== undefined) {
      result.walks++
      result.byWalk.push(s.companies.map((c) => c.coins))
      result.placed += walked.placed
      result.taxed += sum(walked.taxed)
      result.abandoned += walked.abandoned
      result.stops += walked.stops
      const tax = walked.taxed.some((t) => t > 0) ? ` · tax ${walked.taxed.join(" ")}` : ""
      result.log.push(
        `— walk ${result.walks}: P${p + 1} walks to ${nameOf(walked.target)}, ${walked.stops} stops · ` +
          `${walked.placed} incentives${tax}${walked.abandoned ? ` · ${walked.abandoned} abandoned` : ""}`
      )
    }
    result.turns++
  }

  const coins = s.companies.map((c, p) => {
    const { top, rest } = endgame(s, p)
    if (top !== undefined) result.finalSale.push(top.full)
    result.firesold += rest.length
    return c.coins + (top?.full ?? 0) + sum(rest.map((x) => x.fire))
  })
  const filled = s.plots.filter((b) => b !== undefined).length / s.plots.length
  const incentives = s.companies.map((c) => c.incentives)
  return { ...result, coins, incentives, filled, stuck: passesInARow >= players, board: s.plots }
}

/** Kind (capital once finished), level, company; `*` historical, `##` the plaza. */
function draw(plots: State["plots"]) {
  const edges = (sizes: readonly number[]) => sizes.map((_, i) => sum(sizes.slice(0, i + 1)))
  const [xEdges, yEdges] = [edges(WIDTHS), edges(HEIGHTS)]
  const lines: string[] = []
  for (let y = 0; y < SIDE; y++) {
    let line = ""
    for (let x = 0; x < SIDE; x++) {
      const i = plotAt(x, y)
      const b = plots[i]
      const letter = b === undefined ? "" : b.workers === 0 ? LETTER[b.kind].toUpperCase() : LETTER[b.kind]
      const cell = i < 0
        ? "##"
        : b === undefined
        ? "..."
        : `${letter}${b.level || " "}${b.owner === undefined ? "*" : b.owner + 1}`
      line += cell.padEnd(4) + (xEdges.includes(x + 1) ? "  " : "")
    }
    lines.push(line.trimEnd())
    if (yEdges.includes(y + 1) && y + 1 < SIDE) lines.push("")
  }
  return lines.join("\n")
}

const players = Number(values.players) as Players
if (!(players in ROW_SIZE)) throw new Error(`players must be 2–5`)
const games = Number(values.games)
const rng = mulberry32(Number(values.seed))

const results = Array.from({ length: games }, () => play(players, rng))

const avg = (xs: readonly number[]) => sum(xs) / Math.max(xs.length, 1)
const fmt = (n: number) => n.toFixed(1)
const perGame = (f: (r: Result) => number) => fmt(avg(results.map(f)))

console.log(
  `City · ${players} players · ${games} games · seed ${values.seed} · ${WORKERS_EACH} workers · tempo ${TEMPO} · width ${WIDTH} · incentive ${INCENTIVE_VALUE}${
    [
      ...values.cost.map((x) => ` · cost ${x}`),
      ...values.sale.map((x) => ` · sale ${x}`),
      ...values.per.map((x) => ` · per ${x}`)
    ]
      .join("")
  }\n`
)
console.log("Company  avg coins  min–max  wins")
for (let p = 0; p < players; p++) {
  const coins = results.map((r) => r.coins[p] ?? 0)
  const wins = results.reduce((total, r) => {
    const top = Math.max(...r.coins)
    const tied = r.coins.filter((c) => c === top).length
    return total + (r.coins[p] === top ? 1 / tied : 0)
  }, 0)
  const range = `${Math.min(...coins)}–${Math.max(...coins)}`
  console.log(
    `P${p + 1} (${startCoins(p)}c)  ${fmt(avg(coins)).padStart(9)}  ${range.padStart(7)}  ${
      fmt((100 * wins) / games).padStart(4)
    }%`
  )
}

console.log("\nPer game        built  finished  avg sale  min–max  rounds to finish  counted any")
const kinds = [
  ...(["house", "commercial", "industrial"] as const).flatMap((kind) =>
    ([1, 2, 3] as const).map((level) => ({ kind, level }))
  ),
  { kind: "park" as const, level: 0 as const }
]
for (const { kind, level } of kinds) {
  const name = label(kind, level)
  const sales = results.flatMap((r) => r.sales.filter((x) => x.kind === kind && x.level === level))
  const sold = sales.map((x) => x.value)
  const range = sold.length ? `${Math.min(...sold)}–${Math.max(...sold)}` : "—"
  console.log(
    `${name.padEnd(14)} ${perGame((r) => r.built.get(name) ?? 0).padStart(6)}  ${
      fmt(sales.length / games).padStart(8)
    }  ${fmt(avg(sold)).padStart(8)}  ${range.padStart(7)}  ${
      fmt(avg(sales.map((x) => x.took / players))).padStart(16)
    }  ${fmt((100 * sales.filter((x) => x.value > x.base).length) / Math.max(sales.length, 1)).padStart(10)}%`
  )
}
console.log(
  `\nTurns ${perGame((r) => r.turns)} · works ${perGame((r) => r.works)} (${
    fmt(avg(results.map((r) => r.worked / Math.max(r.works, 1))))
  } workers each) · passes ${perGame((r) => r.passes)} · ` +
    `walks ${perGame((r) => r.walks)} · city built ${perGame((r) => 100 * r.filled)}% · stuck games ${
      results.filter((r) => r.stuck).length
    }`
)
console.log(
  `Mayor: ${perGame((r) => r.stops / Math.max(r.walks, 1))} stops a walk · incentives put down ${
    perGame((r) => r.placed)
  }, held at the end ${perGame((r) => sum(r.incentives))} (${
    fmt(avg(results.flatMap((r) => r.incentives)))
  } each) · tax paid ${perGame((r) => r.taxed)} · projects abandoned ${perGame((r) => r.abandoned)}`
)
console.log(
  `End: final sale avg ${fmt(avg(results.flatMap((r) => r.finalSale)))} · projects firesold ${
    perGame((r) => r.firesold)
  } per game`
)

const quantile = (xs: readonly number[], q: number) => {
  const sorted = xs.toSorted((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0
}
console.log("\nCoins after each walk (every company; leader and last by rank in that game)")
console.log("Walk   median  25–75%    leader  last place  games")
const ranked = (coins: readonly number[]) => coins.toSorted((a, b) => b - a)
const walkRows = [
  ...Array.from({ length: WALKS[players] }, (_, w) => ({
    name: `${w + 1}`,
    snapshots: results.flatMap((r) => (r.byWalk[w] === undefined ? [] : [r.byWalk[w]]))
  })),
  { name: "end", snapshots: results.map((r) => r.coins) }
]
for (const { name, snapshots } of walkRows) {
  const all = snapshots.flat()
  const spread = `${quantile(all, 0.25)}–${quantile(all, 0.75)}`
  console.log(
    `${name.padEnd(4)} ${`${quantile(all, 0.5)}`.padStart(8)}  ${spread.padEnd(8)}  ${
      `${quantile(snapshots.map((c) => ranked(c)[0] ?? 0), 0.5)}`.padStart(6)
    }  ${`${quantile(snapshots.map((c) => ranked(c).at(-1) ?? 0), 0.5)}`.padStart(10)}  ${
      `${snapshots.length}`.padStart(5)
    }`
  )
}

const first = results[0]
if (first !== undefined) {
  console.log(
    `\nGame 1 final board (kind, capital once finished; level; company or * historical; ## plaza; coins ${
      first.coins.join(" ")
    }):\n`
  )
  console.log(draw(first.board))
  if (values.log) console.log(`\n${first.log.join("\n")}`)
}

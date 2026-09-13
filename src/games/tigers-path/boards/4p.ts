import type { BoardGraph } from "./types.ts"

/**
 * Tiger's Path — 4P board (North). A hand-placed 22-clearing network on its own
 * Arch-C sheet, independently tuned (not a superset of 2P/3P — `../BOARD_PLAN.md`
 * §2). Targets are authored LANDSCAPE-native (x across the 23in width, y down
 * the 17in height) — the first board that isn't a portrait half-sheet.
 *
 * Capacity (BOARD_PLAN §1): 32 paths + 38 slots = **70 actions**, deliberately a
 * notch under the ~75 proportional target — 3P's first draft ran loose, so 4P
 * starts tight and grows only if playtests come in short. Path mix is fixed by
 * player count: 8 length-2 (2 × players), 4 length-4 (1 × players), 20
 * length-3 — 92 cubes on the board. To reach the 70-action budget (BOARD_PLAN §1)
 * the paths must come to 33 — 8 length-2 (2 × players), 4 length-4 (1 × players),
 * 21 length-3 — which lands avg degree at 3.0, denser than the ~2.4 the other
 * boards run. Adding slots back is the alternative: 40 slots wants only 30 paths.
 *
 * Clearings are ordered north to south and named on an elevation gradient — bare
 * alpine rock along the top edge, conifer belt, mid forest, broadleaf slope, and
 * wet riverine ground flanking the Grassland at the bottom. The name tells you
 * roughly where a clearing sits; it carries no mechanical weight.
 *
 * Structure (§5), with one deviation: there is **no 4-slot clearing**. Four
 * players all fighting a single prize node means two of them disengage, so the
 * heart is split in two — a pair of 3-slot clearings: Monal Crag (53,7) on the
 * north rim and Sambar Wallow (61,46) in the middle of the board. Neither is
 * entered by a 4-cube path: the interior runs at length 3 and the four
 * commitments sit out on the rim (N Juniper–Birch, W Chir–Langur, E Yew–Goral,
 * S Ash–Musk), so the expensive moves are the ones that cross the board rather
 * than the ones that reach a prize. Only Sambar Wallow's levels are skewed high (2/3/4);
 * Monal Crag currently runs 1/2/3, so it reads as the cheaper of the two hearts
 * rather than a late-game climax.
 *
 * Slot costs anticipate the opener rules (§5, §10): a clearing that will take a
 * length-2 opener needs a minimum slot cost of 3, so the two cost-2 circles —
 * Birch Line (N) and Blue Pine Bowl (N-centre) — must stay off the opener
 * matching. The Grassland occupies the bottom centre; nothing routes
 * through it.
 */
export const BOARD_4P: BoardGraph = {
  players: 4,
  clearings: [
    // Alpine rim — bare rock and treeline, the high north.
    {
      id: "bharal-ledge",
      name: "Bharal Ledge",
      target: { x: 95, y: 6 },
      slots: [
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "monal-crag",
      name: "Monal Crag",
      target: { x: 53, y: 7 },
      slots: [
        { level: 1, cost: 3 }
      ]
    },
    {
      id: "juniper-scree",
      name: "Juniper Scree",
      target: { x: 5, y: 10 },
      slots: [
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "birch-line",
      name: "Birch Line",
      target: { x: 22, y: 13 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    // Upper conifer belt — blue pine, chir, kharsu oak.
    {
      id: "tahr-notch",
      name: "Tahr Notch",
      target: { x: 79, y: 20 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 4 }
      ]
    },
    {
      id: "blue-pine-bowl",
      name: "Blue Pine Bowl",
      target: { x: 45, y: 24 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "snow-pine-rise",
      name: "Snow Pine Rise",
      target: { x: 64, y: 25 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "chir-ridge",
      name: "Chir Ridge",
      target: { x: 11, y: 30 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "kharsu-oak",
      name: "Kharsu Oak",
      target: { x: 29, y: 31 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    // Mid forest — the two hearts sit on this band.
    {
      id: "goral-step",
      name: "Goral Step",
      target: { x: 92, y: 36 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "walnut-bench",
      name: "Walnut Bench",
      target: { x: 78, y: 40 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 }
      ]
    },
    {
      id: "moss-spring",
      name: "Moss Spring",
      target: { x: 41, y: 45 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "sambar-wallow",
      name: "Sambar Wallow",
      target: { x: 61, y: 46 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "langur-bluff",
      name: "Langur Bluff",
      target: { x: 17, y: 49 },
      slots: [
        { level: 2, cost: 3 }
      ]
    },
    // Lower broadleaf — the slope easing off toward the field.
    {
      id: "barbet-copse",
      name: "Barbet Copse",
      target: { x: 29, y: 55 },
      slots: [
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "yew-thicket",
      name: "Yew Thicket",
      target: { x: 83, y: 64 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "musk-deer-hollow",
      name: "Musk Deer Hollow",
      target: { x: 51, y: 65 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "serow-ledge",
      name: "Serow Ledge",
      target: { x: 6, y: 68 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "alder-bend",
      name: "Alder Bend",
      target: { x: 67, y: 72 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 }
      ]
    },
    // Riverine lowland — wet ground flanking the Grassland.
    {
      id: "ash-ford",
      name: "Ash Ford",
      target: { x: 25, y: 78 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "willow-spit",
      name: "Willow Spit",
      target: { x: 90, y: 80 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "crane-shallows",
      name: "Crane Shallows",
      target: { x: 12, y: 91 },
      slots: [
        { level: 2, cost: 3 }
      ]
    }
  ],
  paths: [
    // North-west pocket. Juniper–Chir is the NW opener: the only edge of the
    // three that can be, since a length-2 may not touch Birch Line's cost-2
    // circle, and a matching allows at most one edge of a triangle anyway.
    // Juniper–Birch is the northern commitment.
    { id: "juniper-scree--chir-ridge", from: "juniper-scree", to: "chir-ridge", length: 2 },
    { id: "juniper-scree--birch-line", from: "juniper-scree", to: "birch-line", length: 4 },
    { id: "birch-line--chir-ridge", from: "birch-line", to: "chir-ridge", length: 3 },
    // West edge running south — the slope down from the conifer belt to the
    // wet corner. Chir–Langur is the western commitment, Langur–Serow the W opener.
    { id: "chir-ridge--langur-bluff", from: "chir-ridge", to: "langur-bluff", length: 4 },
    { id: "langur-bluff--serow-ledge", from: "langur-bluff", to: "serow-ledge", length: 2 },
    { id: "serow-ledge--crane-shallows", from: "serow-ledge", to: "crane-shallows", length: 3 },
    // South-west lowland turning back inland and climbing the centre-west.
    // Crane–Ash is the SW opener, Barbet–Moss the W-centre one.
    { id: "crane-shallows--ash-ford", from: "crane-shallows", to: "ash-ford", length: 2 },
    { id: "ash-ford--barbet-copse", from: "ash-ford", to: "barbet-copse", length: 3 },
    { id: "barbet-copse--moss-spring", from: "barbet-copse", to: "moss-spring", length: 2 },
    { id: "moss-spring--blue-pine-bowl", from: "moss-spring", to: "blue-pine-bowl", length: 3 },
    { id: "blue-pine-bowl--kharsu-oak", from: "blue-pine-bowl", to: "kharsu-oak", length: 3 },
    { id: "kharsu-oak--birch-line", from: "kharsu-oak", to: "birch-line", length: 3 },
    // The central spine, north rim down to the field. Both hearts hang off it.
    // The interior runs at length 3 throughout: the 4-cube commitments sit on
    // the rim instead, so crossing the board the long way round is what costs.
    { id: "blue-pine-bowl--monal-crag", from: "blue-pine-bowl", to: "monal-crag", length: 3 },
    { id: "monal-crag--snow-pine-rise", from: "monal-crag", to: "snow-pine-rise", length: 3 },
    { id: "snow-pine-rise--sambar-wallow", from: "snow-pine-rise", to: "sambar-wallow", length: 3 },
    { id: "sambar-wallow--musk-deer-hollow", from: "sambar-wallow", to: "musk-deer-hollow", length: 3 },
    // South-east lowland, skirting the Grassland. Musk–Alder is the centre-south
    // opener, Yew–Willow the eastern one.
    { id: "musk-deer-hollow--alder-bend", from: "musk-deer-hollow", to: "alder-bend", length: 2 },
    { id: "alder-bend--yew-thicket", from: "alder-bend", to: "yew-thicket", length: 3 },
    { id: "yew-thicket--willow-spit", from: "yew-thicket", to: "willow-spit", length: 2 },
    // East flank, climbing the coast back to the alpine corner. Yew–Goral is the
    // longest run on the board and takes a 4; Tahr–Bharal is the NE opener, so
    // the corner pentagon is worth walking out for.
    { id: "yew-thicket--goral-step", from: "yew-thicket", to: "goral-step", length: 4 },
    { id: "goral-step--tahr-notch", from: "goral-step", to: "tahr-notch", length: 3 },
    { id: "tahr-notch--bharal-ledge", from: "tahr-notch", to: "bharal-ledge", length: 2 },
    { id: "tahr-notch--snow-pine-rise", from: "tahr-notch", to: "snow-pine-rise", length: 3 },
    // Chords closing the two corner peninsulas and the south-west pocket.
    { id: "bharal-ledge--goral-step", from: "bharal-ledge", to: "goral-step", length: 3 },
    { id: "serow-ledge--ash-ford", from: "serow-ledge", to: "ash-ford", length: 3 },
    // The only link between the two southern lobes, skirting the top of the
    // Grassland — 6.4in, the longest run on the board, and the fourth commitment.
    { id: "ash-ford--musk-deer-hollow", from: "ash-ford", to: "musk-deer-hollow", length: 4 },
    // Interior chords through the centre-west, breaking up the hollow ring.
    { id: "kharsu-oak--moss-spring", from: "kharsu-oak", to: "moss-spring", length: 3 },
    { id: "moss-spring--musk-deer-hollow", from: "moss-spring", to: "musk-deer-hollow", length: 3 },
    // East-centre junction: Walnut Bench ties the spine, the east coast and the
    // centre heart together, and Willow reaches back to Alder across the corner.
    { id: "walnut-bench--snow-pine-rise", from: "walnut-bench", to: "snow-pine-rise", length: 2 },
    { id: "walnut-bench--sambar-wallow", from: "walnut-bench", to: "sambar-wallow", length: 3 },
    { id: "walnut-bench--yew-thicket", from: "walnut-bench", to: "yew-thicket", length: 3 },
    { id: "willow-spit--alder-bend", from: "willow-spit", to: "alder-bend", length: 3 }
  ]
}

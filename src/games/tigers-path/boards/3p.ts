import type { BoardGraph } from "./types.ts"

/**
 * Tiger's Path — 3P board (West). A 20-clearing planar network, independently
 * tuned (not a superset of 2P — see `../BOARD_PLAN.md` §2). Targets are authored
 * LANDSCAPE and rotated into the portrait West half of the shared Sheet 1.
 *
 * Capacity anchor (BOARD_PLAN §1): 26 paths + 33 slots = 59 actions.
 *
 * Structure (§4-5):
 *  - Marquee: Gaur Meadow — the unique degree-5 clearing AND the only 4-slot
 *    clearing, its slots skewed to high levels for a late-game climax. Reached by
 *    three length-4 paths so the heart stays expensive to hold.
 *  - Hubs (degree 4): Cane Brake, Tamarind Row, Leopard Steps.
 *  - Peninsulas (degree 1): only Sunset Ridge and Wild Mango, at the far frontier
 *    corners; the rest of the eastern cluster forms a small contestable loop.
 *
 * Path lengths skew to 3 (cheap blocking); four length-4 paths guard the marquee
 * and a hub approach. Length-2 paths are deliberately rare (3 of 26) and every
 * clearing one touches has a minimum slot cost of 3 — you can never claim a
 * 2-cube path and then upgrade an adjacent slot for another cheap 2.
 */
export const BOARD_3P: BoardGraph = {
  clearings: [
    {
      id: "dawn-marsh",
      name: "Dawn Marsh",
      target: { x: 8, y: 20 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "ironwood",
      name: "Ironwood",
      target: { x: 7, y: 50 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "west-fork",
      name: "West Fork",
      target: { x: 9, y: 82 },
      slots: [{ level: 1, cost: 2 }]
    },
    {
      id: "bulbul-perch",
      name: "Bulbul Perch",
      target: { x: 28, y: 8 },
      slots: [{ level: 1, cost: 2 }]
    },
    {
      id: "fig-hollow",
      name: "Fig Hollow",
      target: { x: 29, y: 33 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "cane-brake",
      name: "Cane Brake",
      target: { x: 27, y: 62 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "fern-gully",
      name: "Fern Gully",
      target: { x: 30, y: 90 },
      slots: [{ level: 1, cost: 2 }]
    },
    {
      id: "peacock-roost",
      name: "Peacock Roost",
      target: { x: 48, y: 16 },
      slots: [
        { level: 1, cost: 2 },
        { level: 3, cost: 3 }
      ]
    },
    {
      id: "tamarind-row",
      name: "Tamarind Row",
      target: { x: 47, y: 44 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "teak-stand",
      name: "Teak Stand",
      target: { x: 49, y: 73 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "otter-bend",
      name: "Otter Bend",
      target: { x: 50, y: 95 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "sal-thicket",
      name: "Sal Thicket",
      target: { x: 66, y: 12 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "gaur-meadow",
      name: "Gaur Meadow",
      target: { x: 63, y: 43 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 3, cost: 4 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "leopard-steps",
      name: "Leopard Steps",
      target: { x: 68, y: 76 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "deodar-rise",
      name: "Deodar Rise",
      target: { x: 86, y: 12 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "sunset-ridge",
      name: "Sunset Ridge",
      target: { x: 95, y: 6 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "nilgai-flats",
      name: "Nilgai Flats",
      target: { x: 86, y: 88 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "wild-mango",
      name: "Wild Mango",
      target: { x: 96, y: 95 },
      slots: [{ level: 3, cost: 4 }]
    },
    {
      id: "cobra-rocks",
      name: "Cobra Rocks",
      target: { x: 73, y: 18 },
      slots: [{ level: 3, cost: 3 }]
    },
    {
      id: "sloth-hollow",
      name: "Sloth Hollow",
      target: { x: 66, y: 62 },
      slots: [{ level: 2, cost: 3 }]
    }
  ],
  paths: [
    { id: "dawn-marsh--ironwood", from: "dawn-marsh", to: "ironwood", length: 3 },
    { id: "ironwood--west-fork", from: "ironwood", to: "west-fork", length: 3 },
    { id: "dawn-marsh--bulbul-perch", from: "dawn-marsh", to: "bulbul-perch", length: 3 },
    { id: "ironwood--fig-hollow", from: "ironwood", to: "fig-hollow", length: 3 },
    { id: "west-fork--cane-brake", from: "west-fork", to: "cane-brake", length: 3 },
    { id: "bulbul-perch--peacock-roost", from: "bulbul-perch", to: "peacock-roost", length: 3 },
    { id: "fig-hollow--cane-brake", from: "fig-hollow", to: "cane-brake", length: 3 },
    { id: "fig-hollow--tamarind-row", from: "fig-hollow", to: "tamarind-row", length: 4 },
    { id: "cane-brake--fern-gully", from: "cane-brake", to: "fern-gully", length: 3 },
    { id: "cane-brake--teak-stand", from: "cane-brake", to: "teak-stand", length: 3 },
    { id: "fern-gully--otter-bend", from: "fern-gully", to: "otter-bend", length: 3 },
    { id: "peacock-roost--tamarind-row", from: "peacock-roost", to: "tamarind-row", length: 3 },
    { id: "peacock-roost--sal-thicket", from: "peacock-roost", to: "sal-thicket", length: 3 },
    { id: "tamarind-row--gaur-meadow", from: "tamarind-row", to: "gaur-meadow", length: 4 },
    { id: "tamarind-row--teak-stand", from: "tamarind-row", to: "teak-stand", length: 3 },
    { id: "otter-bend--leopard-steps", from: "otter-bend", to: "leopard-steps", length: 2 },
    { id: "sal-thicket--gaur-meadow", from: "sal-thicket", to: "gaur-meadow", length: 4 },
    { id: "gaur-meadow--sloth-hollow", from: "gaur-meadow", to: "sloth-hollow", length: 3 },
    { id: "gaur-meadow--cobra-rocks", from: "gaur-meadow", to: "cobra-rocks", length: 3 },
    { id: "gaur-meadow--leopard-steps", from: "gaur-meadow", to: "leopard-steps", length: 4 },
    { id: "sloth-hollow--leopard-steps", from: "sloth-hollow", to: "leopard-steps", length: 3 },
    { id: "cobra-rocks--deodar-rise", from: "cobra-rocks", to: "deodar-rise", length: 3 },
    { id: "sal-thicket--deodar-rise", from: "sal-thicket", to: "deodar-rise", length: 3 },
    { id: "deodar-rise--sunset-ridge", from: "deodar-rise", to: "sunset-ridge", length: 2 },
    { id: "leopard-steps--nilgai-flats", from: "leopard-steps", to: "nilgai-flats", length: 3 },
    { id: "nilgai-flats--wild-mango", from: "nilgai-flats", to: "wild-mango", length: 2 }
  ]
}

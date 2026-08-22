import type { BoardGraph } from "./types.ts"

/**
 * Tiger's Path — 3P board (West). A 20-clearing planar network, independently
 * tuned (not a superset of 2P — see `../BOARD_PLAN.md` §2). Targets are authored
 * PORTRAIT-native (x across, y down) for the West half of the shared Sheet 1.
 *
 * Capacity anchor (BOARD_PLAN §1): ~59 actions. Currently 24 paths + 39 slots =
 * 63 (a touch rich; trim toward 59 in the balance pass).
 *
 * Structure (§5):
 *  - Marquee: Gaur Meadow — the contested heart, its slots skewed to high levels
 *    for a late-game climax. Should become the sole 4-slot clearing (still 3).
 *  - Topology is a flat, even mesh (avg degree ~2.4); degree is emergent, not
 *    targeted. Peninsulas (degree 1) are kept few: West Fork, Teak Stand,
 *    Leopard Steps.
 *
 * Path lengths skew to 3; three length-4 paths for real commitments. Length-2
 * paths stay relatively rare, and each should touch only clearings whose cheapest
 * slot costs ≥3 (§10) — else a 2-cube path + a cheap adjacent slot claims a whole
 * clearing too cheaply.
 */
export const BOARD_3P: BoardGraph = {
  clearings: [
    {
      id: "west-fork",
      name: "West Fork",
      target: { x: 5, y: 5 },
      slots: [
        { level: 1, cost: 3 }
      ]
    },
    {
      id: "dawn-marsh",
      name: "Dawn Marsh",
      target: { x: 20, y: 25 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "ironwood",
      name: "Ironwood",
      target: { x: 35, y: 22 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 4 }
      ]
    },
    {
      id: "bulbul-perch",
      name: "Bulbul Perch",
      target: { x: 53, y: 28 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "fig-hollow",
      name: "Fig Hollow",
      target: { x: 52, y: 46 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "cane-brake",
      name: "Cane Brake",
      target: { x: 48, y: 57 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 4 }
      ]
    },
    {
      id: "peacock-roost",
      name: "Peacock Roost",
      target: { x: 59, y: 65 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "tamarind-row",
      name: "Tamarind Row",
      target: { x: 76, y: 76 },
      slots: [
        { level: 2, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "deodar-rise",
      name: "Deodar Rise",
      target: { x: 93, y: 90 },
      slots: [
        { level: 1, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "fern-gully",
      name: "Fern Gully",
      target: { x: 8, y: 38 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "otter-bend",
      name: "Otter Bend",
      target: { x: 28, y: 43 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 4 }
      ]
    },
    {
      id: "gaur-meadow",
      name: "Gaur Meadow",
      target: { x: 26, y: 58 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "sal-thicket",
      name: "Sal Thicket",
      target: { x: 5, y: 71 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "teak-stand",
      name: "Teak Stand",
      target: { x: 8, y: 91 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "leopard-steps",
      name: "Leopard Steps",
      target: { x: 30, y: 74 },
      slots: [
        { level: 1, cost: 3 }
      ]
    },
    {
      id: "sunset-ridge",
      name: "Sunset Ridge",
      target: { x: 50, y: 6 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "nilgai-flats",
      name: "Nilgai Flats",
      target: { x: 80, y: 11 },
      slots: [
        { level: 1, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "wild-mango",
      name: "Wild Mango",
      target: { x: 95, y: 33 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "cobra-rocks",
      name: "Cobra Rocks",
      target: { x: 75, y: 51 },
      slots: [
        { level: 1, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "sloth-hollow",
      name: "Sloth Hollow",
      target: { x: 91, y: 70 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    }
  ],
  paths: [
    { id: "west-fork--dawn-marsh", from: "west-fork", to: "dawn-marsh", length: 3 },
    { id: "dawn-marsh--ironwood", from: "dawn-marsh", to: "ironwood", length: 2 },
    { id: "dawn-marsh--fern-gully", from: "dawn-marsh", to: "fern-gully", length: 3 },
    { id: "ironwood--sunset-ridge", from: "ironwood", to: "sunset-ridge", length: 3 },
    { id: "ironwood--bulbul-perch", from: "ironwood", to: "bulbul-perch", length: 3 },
    { id: "bulbul-perch--fig-hollow", from: "bulbul-perch", to: "fig-hollow", length: 3 },
    { id: "fig-hollow--cobra-rocks", from: "fig-hollow", to: "cobra-rocks", length: 3 },
    {
      id: "fig-hollow--cane-brake",
      from: "fig-hollow",
      to: "cane-brake",
      length: 2
    },
    { id: "sunset-ridge--nilgai-flats", from: "sunset-ridge", to: "nilgai-flats", length: 3 },
    {
      id: "nilgai-flats--wild-mango",
      from: "nilgai-flats",
      to: "wild-mango",
      length: 2,
      bend: "east"
    },
    { id: "wild-mango--cobra-rocks", from: "wild-mango", to: "cobra-rocks", length: 3 },
    {
      id: "cobra-rocks--sloth-hollow",
      from: "cobra-rocks",
      to: "sloth-hollow",
      length: 3,
      bend: "east"
    },
    { id: "cane-brake--peacock-roost", from: "cane-brake", to: "peacock-roost", length: 3 },
    { id: "peacock-roost--tamarind-row", from: "peacock-roost", to: "tamarind-row", length: 3 },
    {
      id: "tamarind-row--deodar-rise",
      from: "tamarind-row",
      to: "deodar-rise",
      length: 2,
      bend: "south"
    },
    {
      id: "bulbul-perch--nilgai-flats",
      from: "bulbul-perch",
      to: "nilgai-flats",
      length: 3,
      bend: "north"
    },
    { id: "bulbul-perch--wild-mango", from: "bulbul-perch", to: "wild-mango", length: 4 },
    { id: "fern-gully--otter-bend", from: "fern-gully", to: "otter-bend", length: 3 },
    {
      id: "otter-bend--gaur-meadow",
      from: "otter-bend",
      to: "gaur-meadow",
      length: 4
    },
    { id: "gaur-meadow--cane-brake", from: "gaur-meadow", to: "cane-brake", length: 3 },
    { id: "gaur-meadow--leopard-steps", from: "gaur-meadow", to: "leopard-steps", length: 3 },
    { id: "gaur-meadow--sal-thicket", from: "gaur-meadow", to: "sal-thicket", length: 3 },
    {
      id: "sal-thicket--teak-stand",
      from: "sal-thicket",
      to: "teak-stand",
      length: 2
    },
    {
      id: "deodar-rise--sloth-hollow",
      from: "deodar-rise",
      to: "sloth-hollow",
      length: 4,
      bend: "east"
    }
  ]
}

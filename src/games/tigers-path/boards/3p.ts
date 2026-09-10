import type { BoardGraph } from "./types.ts"

/**
 * Tiger's Path — 3P board (West). An 18-clearing planar network, independently
 * tuned (not a superset of 2P — see `../BOARD_PLAN.md` §2). Targets are authored
 * PORTRAIT-native (x across, y down) for the West half of the shared Sheet 1.
 *
 * Capacity (BOARD_PLAN §1): 22 paths + 34 slots = 56 actions — deliberately a
 * notch under the ~59 anchor. The first 20-clearing draft ran 63; the tighten
 * pass dropped two degree-1 peninsulas (West Fork, Leopard Steps) and thinned
 * two corridor/corner clearings to one slot (Otter Bend, Deodar Rise).
 *
 * Structure (§5):
 *  - Marquee: Gaur Meadow — the contested heart, a 3-slot clearing with its
 *    slots skewed to high levels for a late-game climax. Its approaches are
 *    a 4-path (Otter Bend) and two 3-paths; no length-2 path touches it.
 *  - Topology is a flat, even mesh (avg degree ~2.4); degree is emergent, not
 *    targeted. Teak Stand is the only peninsula (degree 1).
 *
 * Length-2 paths are the openers (§5, §10): exactly 2 × players = 6 of them,
 * spread around the board (NW, W, SW, centre, NE, SE) so every band can get
 * going fast. Two rules, enforced by `lint.ts` at build time:
 *  - no two length-2 paths share a clearing (they form a matching), and
 *  - every clearing a length-2 path touches has a minimum slot cost of 3 — so
 *    the cheapest way to establish any clearing is 5 cubes, whether that's a
 *    2-path + cost-3 slot or a 3-path + cost-2 circle.
 * Cost-2 circles therefore live only on clearings off the matching: Sunset
 * Ridge (N), Sloth Hollow (E), Peacock Roost (S) — each region's alternative
 * cheap start.
 */
export const BOARD_3P: BoardGraph = {
  players: 3,
  clearings: [
    {
      id: "dawn-marsh",
      name: "Dawn Marsh",
      target: { x: 16, y: 20 },
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
        { level: 3, cost: 3 }
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
      slots: [{ level: 1, cost: 3 }]
    },
    {
      id: "fern-gully",
      name: "Fern Gully",
      target: { x: 8, y: 40 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "otter-bend",
      name: "Otter Bend",
      target: { x: 28, y: 43 },
      slots: [{ level: 1, cost: 3 }]
    },
    {
      id: "gaur-meadow",
      name: "Gaur Meadow",
      target: { x: 26, y: 60 },
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
    // North-west: Dawn Marsh–Ironwood is the NW opener; Fern Gully–Otter Bend the W one.
    { id: "dawn-marsh--ironwood", from: "dawn-marsh", to: "ironwood", length: 2 },
    { id: "dawn-marsh--fern-gully", from: "dawn-marsh", to: "fern-gully", length: 3 },
    { id: "fern-gully--otter-bend", from: "fern-gully", to: "otter-bend", length: 2 },
    { id: "otter-bend--gaur-meadow", from: "otter-bend", to: "gaur-meadow", length: 4 },
    // North ridge.
    { id: "ironwood--sunset-ridge", from: "ironwood", to: "sunset-ridge", length: 3 },
    { id: "ironwood--bulbul-perch", from: "ironwood", to: "bulbul-perch", length: 3 },
    { id: "sunset-ridge--nilgai-flats", from: "sunset-ridge", to: "nilgai-flats", length: 3 },
    { id: "bulbul-perch--nilgai-flats", from: "bulbul-perch", to: "nilgai-flats", length: 3, bend: "north" },
    // North-east opener + the long eastern commitment.
    { id: "nilgai-flats--wild-mango", from: "nilgai-flats", to: "wild-mango", length: 2, bend: "east" },
    { id: "bulbul-perch--wild-mango", from: "bulbul-perch", to: "wild-mango", length: 4 },
    { id: "wild-mango--cobra-rocks", from: "wild-mango", to: "cobra-rocks", length: 3 },
    // Centre: Fig Hollow–Cane Brake is the central opener.
    { id: "bulbul-perch--fig-hollow", from: "bulbul-perch", to: "fig-hollow", length: 3 },
    { id: "fig-hollow--cobra-rocks", from: "fig-hollow", to: "cobra-rocks", length: 3 },
    { id: "fig-hollow--cane-brake", from: "fig-hollow", to: "cane-brake", length: 2 },
    { id: "gaur-meadow--cane-brake", from: "gaur-meadow", to: "cane-brake", length: 3 },
    { id: "cane-brake--peacock-roost", from: "cane-brake", to: "peacock-roost", length: 3 },
    // East + south-east: Tamarind Row–Deodar Rise is the SE opener.
    { id: "cobra-rocks--sloth-hollow", from: "cobra-rocks", to: "sloth-hollow", length: 3, bend: "east" },
    { id: "peacock-roost--tamarind-row", from: "peacock-roost", to: "tamarind-row", length: 3 },
    { id: "tamarind-row--deodar-rise", from: "tamarind-row", to: "deodar-rise", length: 2, bend: "south" },
    { id: "deodar-rise--sloth-hollow", from: "deodar-rise", to: "sloth-hollow", length: 4, bend: "east" },
    // South-west: Sal Thicket–Teak Stand is the SW opener.
    { id: "gaur-meadow--sal-thicket", from: "gaur-meadow", to: "sal-thicket", length: 3 },
    { id: "sal-thicket--teak-stand", from: "sal-thicket", to: "teak-stand", length: 2 }
  ]
}

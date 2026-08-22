import type { BoardGraph } from "./types.ts"

/**
 * Tiger's Path — 2P board (East). A 14-clearing planar network; each clearing
 * carries a soft `target` (its home region) that the build-time generator
 * relaxes into a crossing-free, evenly-spaced organic layout. `hidden-spring`,
 * `heron-reach`, and `palm-shade` are deliberate peninsulas (degree 1) to
 * exercise the layout on dead-ends.
 *
 * Capacity anchor: 17 paths + 26 slots = 43 actions (see `../BOARD_PLAN.md` §1).
 * Lengths run scarce-short (2) through 4; path pressure concentrates on Old
 * Banyan and Mangrove Edge.
 */
export const BOARD_2P: BoardGraph = {
  clearings: [
    {
      id: "riverbend",
      name: "Riverbend",
      target: { x: 70, y: 5 },
      slots: [
        { level: 1, cost: 3 },
        { level: 3, cost: 4 }
      ]
    },
    {
      id: "bamboo-grove",
      name: "Bamboo Grove",
      target: { x: 94, y: 54 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "salt-lick",
      name: "Salt Lick",
      target: { x: 75, y: 70 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 4 }
      ]
    },
    {
      id: "misty-hollow",
      name: "Misty Hollow",
      target: { x: 95, y: 90 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "old-banyan",
      name: "Old Banyan",
      target: { x: 51, y: 43 },
      slots: [
        { level: 2, cost: 2 },
        { level: 3, cost: 2 },
        { level: 4, cost: 3 }
      ]
    },
    {
      id: "mangrove-edge",
      name: "Mangrove Edge",
      target: { x: 40, y: 65 },
      slots: [
        { level: 2, cost: 3 },
        { level: 3, cost: 3 },
        { level: 4, cost: 4 }
      ]
    },
    {
      id: "termite-hill",
      name: "Termite Hill",
      target: { x: 55, y: 95 },
      slots: [
        { level: 1, cost: 2 },
        { level: 3, cost: 3 }
      ]
    },
    {
      id: "sunning-rocks",
      name: "Sunning Rocks",
      target: { x: 10, y: 90 },
      slots: [
        { level: 1, cost: 2 },
        { level: 4, cost: 3 }
      ]
    },
    {
      id: "kapok-crown",
      name: "Kapok Crown",
      target: { x: 15, y: 55 },
      slots: [
        { level: 1, cost: 2 },
        { level: 2, cost: 3 }
      ]
    },
    {
      id: "orchid-glade",
      name: "Orchid Glade",
      target: { x: 30, y: 10 },
      slots: [
        { level: 1, cost: 2 },
        { level: 3, cost: 3 }
      ]
    },
    {
      id: "lotus-pool",
      name: "Lotus Pool",
      target: { x: 20, y: 30 },
      slots: [
        { level: 1, cost: 3 },
        { level: 2, cost: 4 }
      ]
    },
    {
      id: "hidden-spring",
      name: "Hidden Spring",
      target: { x: 0, y: 0 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "heron-reach",
      name: "Heron Reach",
      target: { x: 100, y: 0 },
      slots: [{ level: 2, cost: 3 }]
    },
    {
      id: "palm-shade",
      name: "Palm Shade",
      target: { x: 25, y: 48 },
      slots: [{ level: 2, cost: 3 }]
    }
  ],
  paths: [
    { id: "riverbend--bamboo-grove", from: "riverbend", to: "bamboo-grove", length: 4 },
    { id: "bamboo-grove--salt-lick", from: "bamboo-grove", to: "salt-lick", length: 3 },
    { id: "salt-lick--misty-hollow", from: "salt-lick", to: "misty-hollow", length: 2 },
    { id: "riverbend--old-banyan", from: "riverbend", to: "old-banyan", length: 3 },
    { id: "bamboo-grove--old-banyan", from: "bamboo-grove", to: "old-banyan", length: 3 },
    { id: "old-banyan--mangrove-edge", from: "old-banyan", to: "mangrove-edge", length: 3 },
    { id: "salt-lick--termite-hill", from: "salt-lick", to: "termite-hill", length: 3 },
    { id: "termite-hill--sunning-rocks", from: "termite-hill", to: "sunning-rocks", length: 3 },
    { id: "mangrove-edge--sunning-rocks", from: "mangrove-edge", to: "sunning-rocks", length: 4 },
    { id: "kapok-crown--mangrove-edge", from: "kapok-crown", to: "mangrove-edge", length: 3 },
    { id: "kapok-crown--sunning-rocks", from: "kapok-crown", to: "sunning-rocks", length: 3 },
    { id: "orchid-glade--old-banyan", from: "orchid-glade", to: "old-banyan", length: 3 },
    { id: "orchid-glade--lotus-pool", from: "orchid-glade", to: "lotus-pool", length: 3 },
    { id: "lotus-pool--kapok-crown", from: "lotus-pool", to: "kapok-crown", length: 4 },
    { id: "lotus-pool--hidden-spring", from: "lotus-pool", to: "hidden-spring", length: 2 },
    { id: "riverbend--heron-reach", from: "riverbend", to: "heron-reach", length: 2 },
    { id: "mangrove-edge--palm-shade", from: "mangrove-edge", to: "palm-shade", length: 2 }
  ]
}

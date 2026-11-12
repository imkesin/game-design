/**
 * Every color on the Fiber map, named by role. The board is greys only, so player colors are the
 * only saturation on the table. The palette section under the map renders this list.
 */

export const COLOR = {
  paper: "#ffffff",
  gridMinor: "#f0f0f0",
  hatch: "#8a8a8a",
  gridMajor: "#d4d4d4",
  gridLabel: "#a3a3a3",
  cable: "#4d4d4d",
  regionBorder: "#bdbdbd",
  /** Real geography under the network, from OpenStreetMap; each knocks the hatch out with a paper casing. */
  highway: "#cfcfcf",
  river: "#b0b0b0",
  /** Stick-slot borders: constant across regions, like the links. */
  board: "#737373",
  /** Pads and name tabs, one per tint level: lighter regions get lighter towns. OKLab L steps ~0.08. */
  pad0: "#a9a9a9",
  pad1: "#8f8f8f",
  pad2: "#777777",
  pad3: "#606060",
  /** Terminal and Hub slot halo: a solid ring with a translucent well, both white. */
  halo: "#ffffff",
  label: "#ffffff",
  /** Stick slots stay solid white: halos made the network links too busy. */
  stickSlot: "#ffffff",
  playerOne: "#ff3b1f",
  playerTwo: "#0a66ff"
} as const

/**
 * Region levels, lightest to darkest: each is a family of a faint hatch on bare paper (no fill)
 * and the grey of the region's pads and name tabs, so a region's towns read as one group. Regions
 * get a level by map coloring (touching regions never share one). Links and borders stay constant.
 */
export const LEVELS = [
  { hatch: "plain", pad: "pad0" },
  { hatch: "dots", pad: "pad1" },
  { hatch: "diagonal", pad: "pad2" },
  { hatch: "cross", pad: "pad3" }
] as const satisfies readonly { hatch: string; pad: ColorName }[]

export type Hatch = (typeof LEVELS)[number]["hatch"]

/**
 * Hatch geometry (mm): line spacing, dot spacing, line weight, dot radius. One ink, hairlines; tone
 * comes from spacing. Ink coverage: dots ~1.1%, diagonal 7.5%, cross ~14%. Dots read heavier than
 * their coverage, so they are spread wider than the arithmetic alone suggests (2026-11-11).
 */
export const HATCH = { pitch: 2, dotPitch: 5, line: 0.15, dot: 0.3 }

/** Share of paper a level's hatch covers with ink. */
export function hatchCoverage(hatch: Hatch) {
  const line = HATCH.line / HATCH.pitch
  if (hatch === "dots") return (Math.PI * HATCH.dot ** 2) / HATCH.dotPitch ** 2
  if (hatch === "diagonal") return line
  if (hatch === "cross") return 2 * line - line ** 2
  return 0
}

/** Opacity of a slot's centre well over the board grey. */
export const WELL_OPACITY = 0.7

export type ColorName = keyof typeof COLOR

export type Swatch = {
  name: ColorName
  role: string
  /** What it usually sits on, to preview it in place. */
  on?: ColorName
  opacity?: number
}

export const PALETTE: { group: string; swatches: Swatch[] }[] = [
  {
    group: "Sheet",
    swatches: [
      { name: "paper", role: "Sheet background" },
      { name: "hatch", role: "Region hatch marks (dots, lines)", on: "paper" },
      { name: "regionBorder", role: "Region border: one 0.5mm dashed line", on: "paper" },
      { name: "highway", role: "I-35 and I-10, traced from OpenStreetMap", on: "paper" },
      { name: "river", role: "Rivers, traced from OpenStreetMap", on: "paper" },
      { name: "gridMinor", role: "½in grid (screen aid)" },
      { name: "gridMajor", role: "1in grid (screen aid)" },
      { name: "gridLabel", role: "Grid inch labels" }
    ]
  },
  {
    group: "Board",
    swatches: [
      { name: "board", role: "Stick-slot borders (constant)" },
      { name: "label", role: "Town name text", on: "board" },
      { name: "cable", role: "Link line between pads (darkest grey)", on: "paper" }
    ]
  },
  {
    group: "Slots",
    swatches: [
      { name: "halo", role: "Terminal / Hub slot ring (inset, solid)", on: "board" },
      { name: "halo", role: "Terminal / Hub slot well (centre)", on: "board", opacity: WELL_OPACITY },
      { name: "stickSlot", role: "Stick slot (solid)", on: "board" }
    ]
  },
  {
    group: "Players",
    swatches: [
      { name: "playerOne", role: "Player 1 pieces" },
      { name: "playerTwo", role: "Player 2 pieces" }
    ]
  }
]

import { BORDER, RONDEL } from "./boardLayout.ts"

/**
 * The rondel's wheel: a ring of spaces around a hub, drawn inside the square
 * zone `boardLayout` reserves in the board's bottom-right corner.
 *
 * Everything here is in millimetres on that square, origin at its top-left —
 * the same units the board's other furniture is drawn in, so a stroke weight
 * quoted here means what it means on a card. The component turns these into
 * percentages, which is the one place the wheel stops being metric.
 *
 * All of the trig lives here so the component does none: it draws the points it
 * is handed.
 */

const MM_PER_INCH = 25.4

/** The zone is square, so one figure describes it. */
export const ZONE = RONDEL.cols * MM_PER_INCH

/** Spaces in the ring. */
export const SPACES = 7

/**
 * Stroke weights, taken from the board's scale rather than set here.
 *
 * Rim and hub are both boundaries of the rondel, so both carry its weight; the
 * wheel is one piece of furniture and reads as one. The spokes take the step
 * below, which is what keeps them subordinate to the two circles they run
 * between while still reading as structure a piece can sit either side of —
 * they divide the wheel, they do not bound it.
 */
export const RIM_STROKE = BORDER.rondel
export const HUB_STROKE = BORDER.rondel
export const SPOKE_STROKE = BORDER.inner

/**
 * How far the rim sits inside the zone, derived from what it has to clear
 * rather than picked by eye.
 *
 * The rondel's zone runs to the live area's right and bottom edges, so the
 * board frame is drawn over the outer `BORDER.frame` of it. Past that the rim
 * needs half its own stroke — a stroke straddles its path — and then a
 * millimetre of daylight, without which the wheel reads as leaning on the frame.
 */
const INSET = BORDER.frame + RIM_STROKE / 2 + 1

/** The rim: the largest circle the zone holds, less that inset. */
export const RIM = ZONE / 2 - INSET

const K = Math.sin(Math.PI / SPACES)

/**
 * The hub, derived rather than chosen.
 *
 * A space is bounded two ways: by the ring's depth (`RIM - HUB`), and by its
 * share of the arc at mid-radius (`(RIM + HUB) · sin(π / SPACES)`). Those move in
 * opposite directions as the hub grows, so exactly one hub makes them equal —
 * and that is the hub whose spaces come out squarest, which is the shape that
 * holds the most content. Solving `RIM - HUB = (RIM + HUB) · K` gives this.
 *
 * Derived, so it re-solves itself if the ring ever holds six spaces or eight;
 * a hand-picked radius would quietly go lopsided the moment the count changed.
 */
export const HUB = RIM * (1 - K) / (1 + K)

/**
 * One circle as a path. Two arcs rather than one, because a single 360° arc is
 * degenerate — its start and end coincide, and nothing is drawn.
 */
const circlePath = (r: number) => {
  const c = ZONE / 2
  return `M ${c - r} ${c} A ${r} ${r} 0 1 0 ${c + r} ${c} A ${r} ${r} 0 1 0 ${c - r} ${c} Z`
}

/**
 * The wheel's white, as the rim's circle with the hub's punched out of it under
 * an even-odd fill.
 *
 * A ring rather than a disc so the sea's hatch carries on through the hub: the
 * wheel masks the map only where it has something to say, and the middle stays a
 * window rather than becoming a lid. Even-odd, so the hole does not depend on
 * the two subpaths being wound in opposite directions.
 *
 * Left unstroked here — rim and hub are stroked separately, at weights that
 * differ.
 */
export const RING_PATH = `${circlePath(RIM)} ${circlePath(HUB)}`

/** Where a space's content sits: halfway through the ring. */
const MID = (RIM + HUB) / 2

const STEP = (2 * Math.PI) / SPACES

/**
 * The first space sits at twelve o'clock and the rest run clockwise. SVG's y
 * axis points down, so the quarter turn is subtracted rather than added.
 */
const centerAngle = (index: number) => -Math.PI / 2 + index * STEP

const at = (radius: number, angle: number) => ({
  x: ZONE / 2 + radius * Math.cos(angle),
  y: ZONE / 2 + radius * Math.sin(angle)
})

/**
 * The largest circle that fits inside a space. Because of the hub derived above
 * it touches the inner arc, the outer arc and both spokes at once, so its radius
 * is simply half the ring's depth.
 */
const INSCRIBED = (RIM - HUB) / 2

/**
 * The content box: the square inside that circle.
 *
 * Labels are set upright rather than rotated with their space, so a box shaped
 * to the wedge it sits in would overrun the wedge a quarter-turn away. Taking
 * the square inside the inscribed circle makes one box valid at every angle,
 * which is what lets all seven spaces be drawn identically instead of each being
 * fitted by hand.
 */
export const BOX = 2 * INSCRIBED / Math.SQRT2

/** Where each space's content box is centred. */
export const SPACE_CENTERS = Array.from({ length: SPACES }, (_, i) => at(MID, centerAngle(i)))

/** Spokes fall between spaces, half a step off each centre, and span the ring only. */
export const SPOKES = Array.from({ length: SPACES }, (_, i) => {
  const angle = centerAngle(i) + STEP / 2
  return { from: at(HUB, angle), to: at(RIM, angle) }
})

/**
 * PLACEHOLDER. The wheel's actions are not designed yet.
 *
 * Real words rather than lorem, because the thing worth judging on the printed
 * sheet is whether a space holds a label at this size — and deliberately a mix
 * of lengths, so the longest one is what gets checked. Replace outright.
 */
export const SPACE_LABELS: readonly string[] = [
  "BRIBE",
  "ALLOCATE TAX COLL.",
  "TAX",
  "ALLOCATE MAGISTRATE",
  "ORDER",
  "ALLOCATE ENGINEER",
  "INFRA"
]

// Loud at import rather than a wheel that silently prints six labels in seven
// spaces, which on a printed sheet is only noticed once it is printed.
if (SPACE_LABELS.length !== SPACES) {
  throw new Error(`Rondel: ${SPACE_LABELS.length} labels for ${SPACES} spaces`)
}

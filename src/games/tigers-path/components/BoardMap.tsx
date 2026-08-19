import { ClearingSlotIcon } from "~/games/tigers-path/components/ClearingSlotIcon"
import { CLEARINGS, PATHS, shapeForLevel } from "~/games/tigers-path/domain"
import type { Clearing, Path } from "~/games/tigers-path/domain"
import { css, cx } from "~/generated/styled-system/css"
import { paperFrame } from "~/shared/components/paperFrame"

/**
 * The v0 map: a 3x3 lattice of clearings with a path on every adjacent pair,
 * laid out as one `grid-template-areas` grid. Clearings take the odd tracks,
 * paths the even ones, so the whole board is grid placement — no absolute
 * positioning, no coordinates.
 *
 * A path is drawn as a road: a skinny white band with a darker edge down
 * each side, running the full length of its grid cell and a little beyond,
 * so it tucks under the ellipses at both ends and the two clearings read as
 * physically connected. It is noticeably narrower than the cube spaces —
 * a road peeking out from under them, not a lane they sit inside.
 *
 * The layering has no z-index anywhere, but DOM order alone does not decide
 * it: within a shared paint context, `position: static` boxes (step 3 of the
 * CSS painting order) paint *before* any positioned box with `z-index: auto`
 * (step 6), no matter where either sits in the tree. The road is `absolute`
 * and the cube space is `relative`, so both are step-6 boxes — that pair
 * sorts correctly by DOM order. The clearing ellipse has to be `relative`
 * too, or it stays a step-3 box and paints under the road regardless of
 * being written later in the JSX.
 *
 * Path spaces are half-inch squares (roomy for 8-10mm cubes, and contests
 * mean cubes get fingered constantly). Clearings are ellipses that fill their
 * cell — the name up top, its printed slots (shape = level, number = cost)
 * in a row underneath; discs pile onto a slot once it's filled.
 *
 * The board stays mute about paths (no lengths printed) but not clearings —
 * slot shape/cost is printed ground truth, same as a path's cube count is
 * printed ground truth via the spaces themselves.
 */

/** Clearing cell size, inches. Wide enough for a name line plus a row of up to 3 slot icons at their 12mm print floor. */
const CLEARING_W = 1.7
const CLEARING_H = 1.35

/** A path's cube space, inches. */
const SPACE = 0.5
const SPACE_GAP = 0.08

/** Path tracks: horizontal columns fit length 4, vertical rows fit length 3. */
const H_PATH_W = 4 * SPACE + 3 * SPACE_GAP + 0.1
const V_PATH_H = 3 * SPACE + 2 * SPACE_GAP + 0.1

/** How far a trail reaches past its cell, under the clearing ellipses. */
const TRAIL_REACH = 0.25

const TEMPLATE_AREAS = `
  "a  ab b  bc c"
  "ad .  be .  cf"
  "d  de e  ef f"
  "dg .  eh .  fi"
  "g  gh h  hi i"
`

const board = css({
  display: "grid",
  placeContent: "center",
  width: "100%",
  height: "100%"
})

const clearingNode = css({
  position: "relative",
  display: "grid",
  placeItems: "center",
  borderWidth: "0.5mm",
  borderStyle: "solid",
  borderRadius: "9999px"
})

const clearingBody = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  rowGap: "0.04in"
})

const clearingName = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap"
})

const clearingSlots = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  columnGap: "0.04in",
  rowGap: "0.04in"
})

const pathTrack = css({
  position: "relative",
  display: "flex",
  placeSelf: "stretch",
  alignItems: "center",
  justifyContent: "center"
})

/**
 * The road. Skinny relative to the 0.5in cube spaces — about a third their
 * width — so it reads as ground showing at the edges of the spaces rather
 * than a lane containing them.
 */
const TRAIL_W = 0.16

const trail = css({
  position: "absolute",
  background: "white",
  borderColor: "stone.500",
  borderStyle: "solid",
  borderWidth: 0
})

const hTrail = css({
  top: "50%",
  transform: "translateY(-50%)",
  left: `${-TRAIL_REACH}in`,
  right: `${-TRAIL_REACH}in`,
  height: `${TRAIL_W}in`,
  borderBlockWidth: "0.4mm"
})

const vTrail = css({
  left: "50%",
  transform: "translateX(-50%)",
  top: `${-TRAIL_REACH}in`,
  bottom: `${-TRAIL_REACH}in`,
  width: `${TRAIL_W}in`,
  borderInlineWidth: "0.4mm"
})

/** A cube space. Opaque, so the road passes behind it. */
const cubeSpace = css({
  position: "relative",
  width: "0.5in",
  height: "0.5in",
  borderWidth: "0.4mm",
  borderStyle: "solid",
  borderColor: "stone.600",
  borderRadius: "1.5mm",
  background: "stone.50",
  flex: "none"
})

function ClearingNode({ clearing }: { clearing: Clearing }) {
  return (
    <div
      className={cx(clearingNode, paperFrame({ color: "stone" }))}
      style={{ gridArea: clearing.area }}
    >
      <div className={clearingBody}>
        <span className={clearingName}>{clearing.name}</span>
        <div className={clearingSlots}>
          {clearing.slots.map((slot, i) => (
            <ClearingSlotIcon key={i} shape={shapeForLevel(slot.level)} cost={slot.cost} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PathTrack({ path }: { path: Path }) {
  const horizontal = path.orientation === "h"
  return (
    <div
      className={pathTrack}
      style={{
        gridArea: path.area,
        flexDirection: horizontal ? "row" : "column",
        gap: `${SPACE_GAP}in`
      }}
    >
      <div className={cx(trail, horizontal ? hTrail : vTrail)} />
      {Array.from({ length: path.length }, (_, i) => <div key={i} className={cubeSpace} />)}
    </div>
  )
}

export function BoardMap() {
  return (
    <div
      className={board}
      style={{
        gridTemplateAreas: TEMPLATE_AREAS,
        gridTemplateColumns: `${CLEARING_W}in ${H_PATH_W}in ${CLEARING_W}in ${H_PATH_W}in ${CLEARING_W}in`,
        gridTemplateRows: `${CLEARING_H}in ${V_PATH_H}in ${CLEARING_H}in ${V_PATH_H}in ${CLEARING_H}in`
      }}
    >
      {PATHS.map((path) => <PathTrack key={path.id} path={path} />)}
      {CLEARINGS.map((clearing) => <ClearingNode key={clearing.id} clearing={clearing} />)}
    </div>
  )
}

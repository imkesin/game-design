import { CLEARINGS, ROUTES } from "~/games/tigers-path/domain"
import type { Clearing, Route } from "~/games/tigers-path/domain"
import { css, cx } from "~/generated/styled-system/css"
import { paperFrame } from "~/shared/components/paperFrame"

/**
 * The v0 map: a 3x3 lattice of clearings with a route on every adjacent pair,
 * laid out as one `grid-template-areas` grid. Clearings take the odd tracks,
 * routes the even ones, so the whole board is grid placement — no absolute
 * positioning, no coordinates.
 *
 * A route is drawn as a road: a skinny white band with a darker edge down
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
 * Route spaces are half-inch squares (roomy for 8-10mm cubes, and displacement
 * means cubes get fingered constantly). Clearings are ellipses that fill their
 * cell — the name across the middle, discs piling around it; capacity is a
 * rules fact (Boar track), not a board fact.
 *
 * The board is deliberately mute about rules: no lengths printed, no ladder.
 */

/** Clearing cell size, inches. Width > height because names run horizontal. */
const CLEARING_W = 1.5
const CLEARING_H = 1.35

/** A route's cube space, inches. */
const SPACE = 0.5
const SPACE_GAP = 0.08

/** Route tracks: horizontal columns fit length 4, vertical rows fit length 3. */
const H_ROUTE_W = 4 * SPACE + 3 * SPACE_GAP + 0.1
const V_ROUTE_H = 3 * SPACE + 2 * SPACE_GAP + 0.1

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

const clearingName = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap"
})

const routeTrack = css({
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
      <span className={clearingName}>{clearing.name}</span>
    </div>
  )
}

function RouteTrack({ route }: { route: Route }) {
  const horizontal = route.orientation === "h"
  return (
    <div
      className={routeTrack}
      style={{
        gridArea: route.area,
        flexDirection: horizontal ? "row" : "column",
        gap: `${SPACE_GAP}in`
      }}
    >
      <div className={cx(trail, horizontal ? hTrail : vTrail)} />
      {Array.from({ length: route.length }, (_, i) => <div key={i} className={cubeSpace} />)}
    </div>
  )
}

export function BoardMap() {
  return (
    <div
      className={board}
      style={{
        gridTemplateAreas: TEMPLATE_AREAS,
        gridTemplateColumns: `${CLEARING_W}in ${H_ROUTE_W}in ${CLEARING_W}in ${H_ROUTE_W}in ${CLEARING_W}in`,
        gridTemplateRows: `${CLEARING_H}in ${V_ROUTE_H}in ${CLEARING_H}in ${V_ROUTE_H}in ${CLEARING_H}in`
      }}
    >
      {ROUTES.map((route) => <RouteTrack key={route.id} route={route} />)}
      {CLEARINGS.map((clearing) => <ClearingNode key={clearing.id} clearing={clearing} />)}
    </div>
  )
}

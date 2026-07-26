import { Fragment } from "react"
import { CrateCount } from "~/components/CrateCount"
import type { CrateTone } from "~/components/icons/FruitCrateIcon"
import { paperFrame, softBand } from "~/components/paperFrame"
import { ClaimSlot } from "~/components/slots/ClaimSlot"
import { FruitCrateSlot } from "~/components/slots/FruitCrateSlot"
import { ANY_CRATE, foreignMarketZones } from "~/domain/ForeignMarketDefinitions"
import type { CrateRef, ForeignMarketZone, ForeignMarketZoneName, Quest } from "~/domain/ForeignMarketDefinitions"
import { css, cx } from "~/generated/styled-system/css"

// The whole rail: a single zone card, vertically centred over the full height.
const track = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100%"
})

const zoneFrame = css({
  display: "flex",
  flexDirection: "column",
  border: "0.3mm solid",
  borderRadius: "card",
  overflow: "hidden"
})

const zoneHeader = css({
  textAlign: "center",
  fontSize: "name",
  fontWeight: 700,
  letterSpacing: "0.02em",
  paddingBlock: "2"
})

// The zone body is a two-column table: a fixed left marker column (claim slots,
// with an empty top-left cell reserved for a compass) and the content column
// (route slots up top, then the quest recipes). Sharing the columns shifts the
// route slots right so they align over the recipes rather than over the claims.
// columnGap is 0 so the row dividers read as one continuous line; the marker
// cell's trailing padding supplies the gutter instead.
const zoneBody = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  paddingInline: "1",
  paddingBottom: "2"
})

// Top-left cell: intentionally empty for now — a compass will live here.
const compassCell = css({ gridColumn: 1 })

// The two route columns sit centred as a tight pair (γ left, δ right) — a tidy
// header over the ladder, each column a vertical stack of blank crate slots.
const slotPair = css({
  gridColumn: 2,
  display: "flex",
  justifyContent: "center",
  alignItems: "end",
  gap: "4",
  paddingBlock: "3"
})

// Marker column cell holding a row's claim slot; trailing padding is the gutter
// to the recipe. Recipe cell fills the content column.
const markerCell = css({
  gridColumn: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingBlock: "0.5",
  paddingInlineEnd: "2"
})
const recipeCell = css({ gridColumn: 2, display: "flex", alignItems: "center", paddingBlock: "0.5" })
const rowDivider = css({
  borderBlockEndWidth: "0.2mm",
  borderBlockEndStyle: "solid",
  borderBlockEndColor: "stone.400/40"
})

// Each route column wrapped in a tall rectangle: a vertical stack of blank
// crates up top, its Greek variable large below. The wrapper border + the crate
// rims share the variable's accent colour (set inline), so the whole frame
// carries the zone colour.
const routeSlot = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1",
  paddingInline: "2",
  paddingBlock: "2",
  border: "0.3mm solid",
  borderRadius: "card"
})

// The variable label: a large, high-contrast Greek letter (bigger than the one
// on the cubes) beneath the crate — no chip needed, the accent colour lives on
// the crate frame instead.
const routeVar = css({
  fontSize: "calc(7 * var(--u))",
  fontWeight: 700,
  lineHeight: 1
})

// Each variable's accent hue + tone, derived from its zone: the zone accent hue,
// first slot light and second dark, so a variable reads the same light/dark
// wherever it appears — header frame or recipe cube.
const ZONE_ACCENT: Partial<Record<ForeignMarketZoneName, string>> = {
  Western: "blue"
}

// The wildcard crate: a generic mid-grey cube stamped `✱`, deliberately toneless
// so it reads as "any fruit" rather than a bound route colour.
const ANY_STYLE = { hue: "zinc", tone: "mid" as CrateTone }
const ANY_GLYPH = "✱"

const REF_STYLE: Record<CrateRef, { hue: string; tone: CrateTone }> = (() => {
  const map = { [ANY_CRATE]: ANY_STYLE } as Record<CrateRef, { hue: string; tone: CrateTone }>
  for (const zone of foreignMarketZones) {
    const hue = ZONE_ACCENT[zone.name] ?? "zinc"
    zone.variables.forEach((v, i) => {
      map[v] = { hue, tone: i === 0 ? "light" : "dark" }
    })
  }
  return map
})()

/** The glyph stamped on a term's cube face: the Greek variable, or `✱` for any. */
function refGlyph(ref: CrateRef) {
  return ref === ANY_CRATE ? ANY_GLYPH : ref
}

// Accent colours for a header slot: the crate frame carries the hue (lighter for
// the pair's light variable, darker for the dark one) and the big letter is a
// high-contrast dark shade of the same hue.
function slotAccent({ hue, tone }: { hue: string; tone: CrateTone }) {
  return {
    rim: `var(--colors-${hue}-${tone === "dark" ? 700 : 400})`,
    ink: `var(--colors-${hue}-${tone === "dark" ? 800 : 700})`
  }
}

// A quest is now a plain AND of 1–3 terms, so the recipe just flows its cubes
// left-to-right, centred in the cell, with a `+` between each. No fixed columns:
// with OR gone there's nothing to align across rows.
const recipe = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: "1",
  fontSize: "body",
  flex: 1
})

const plus = css({ fontSize: "body", fontWeight: 700, color: "stone.500" })

function QuestRecipe({ quest }: { quest: Quest }) {
  return (
    <div className={recipe}>
      {quest.map((term, j) => {
        const { hue, tone } = REF_STYLE[term.ref]
        return (
          <Fragment key={j}>
            {j > 0 && <span className={plus}>+</span>}
            <CrateCount qty={term.qty} variable={refGlyph(term.ref)} color={hue} tone={tone} />
          </Fragment>
        )
      })}
    </div>
  )
}

function Zone({ zone }: { zone: ForeignMarketZone }) {
  return (
    <div className={cx(zoneFrame, paperFrame({ color: "stone" }))}>
      <div className={cx(zoneHeader, softBand({ color: "stone" }))}>{zone.name} Trade Route</div>
      <div className={zoneBody}>
        <div className={compassCell} />
        <div className={slotPair}>
          {zone.variables.map((v) => {
            const { rim, ink } = slotAccent(REF_STYLE[v])
            return (
              <div
                key={v}
                className={routeSlot}
                style={{ borderColor: rim }}
              >
                {Array.from({ length: zone.slotsPerVariable }, (_, i) => (
                  <FruitCrateSlot key={i} size={12} rim={rim} />
                ))}
                <span className={routeVar} style={{ color: ink }}>{v}</span>
              </div>
            )
          })}
        </div>
        {zone.quests.map((quest, i) => {
          const divider = i < zone.quests.length - 1 && rowDivider
          return (
            <Fragment key={i}>
              <div className={cx(markerCell, divider)}>
                <ClaimSlot size={16} />
              </div>
              <div className={cx(recipeCell, divider)}>
                <QuestRecipe quest={quest} />
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export function ForeignMarketTrack() {
  return (
    <div className={track}>
      {foreignMarketZones.map((zone) => <Zone key={zone.name} zone={zone} />)}
    </div>
  )
}

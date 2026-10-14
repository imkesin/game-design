import { Desk } from "~/games/revival/city/Desk"
import { mm } from "~/games/revival/city/mm"
import { Paper } from "~/games/revival/city/Paper"
import { PrefabBox } from "~/games/revival/city/PrefabBox"
import { type Geometry, geometry, LAYOUTS } from "~/games/revival/city/prefabs"
import { css } from "~/generated/styled-system/css"

/**
 * Every prefab neighborhood at true size on Letter sheets, fewest plots first.
 * The layouts live in `city/prefabs.ts`.
 */

const IN = 25.4
/** US Letter, portrait, and its printable area with ¼in margins. */
const LETTER = { width: 8.5 * IN, height: 11 * IN }
const PRINTABLE = { width: 8 * IN, height: 10.5 * IN }

/** Stacks prefabs on a sheet so they can be compared at true size. */
const sheet = css({ display: "grid", justifyItems: "center", rowGap: "12" })

/** Plot count above each prefab; part of the sheet, so it prints too. */
const LABEL_H = 6

const labelled = css({ display: "grid", gridTemplateAreas: `"label" "prefab"`, justifyItems: "start" })

const label = css({
  gridArea: "label",
  alignSelf: "center",
  color: "#666",
  fontSize: "calc(3.2 * var(--u))",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  lineHeight: 1
})

function Labelled({ geo }: { geo: Geometry }) {
  return (
    <div className={labelled} style={{ gridTemplateRows: `${mm(LABEL_H)} auto` }}>
      <div className={label}>{geo.plots.length} plots · {geo.parts.join(" + ")}</div>
      <PrefabBox geo={geo} style={{ gridArea: "prefab" }} />
    </div>
  )
}

/** Smallest-first part lists, compared part by part: [1,1,1] < [1,2] < [3]. */
const byParts = (a: readonly number[], b: readonly number[]) => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i]! - b[i]!
  return a.length - b.length
}

/** Fewest plots first; within a count, the most broken-up first (1 + 1 before 2). */
const PREFABS = LAYOUTS.map(geometry).sort((a, b) => a.plots.length - b.plots.length || byParts(a.parts, b.parts))

const GAP = 12

/** Prefabs stacked greedily onto as few sheets as fit the printable height. */
const SHEETS = PREFABS.reduce<{ used: number; items: Geometry[] }[]>((sheets, geo) => {
  const height = LABEL_H + geo.height
  const last = sheets.at(-1)
  if (last !== undefined && last.used + GAP + height <= PRINTABLE.height) {
    last.items.push(geo)
    last.used += GAP + height
  } else {
    sheets.push({ used: height, items: [geo] })
  }
  return sheets
}, [])

export function PrefabsPage() {
  return (
    <Desk title="Revival — Prefab neighborhoods">
      {SHEETS.map((page, i) => (
        <Paper
          key={i}
          {...LETTER}
          areaWidth={PRINTABLE.width}
          areaHeight={PRINTABLE.height}
          title="Letter 8.5×11in · printable 8×10.5in"
        >
          <div className={sheet}>
            {page.items.map((geo, j) => <Labelled key={j} geo={geo} />)}
          </div>
        </Paper>
      ))}
    </Desk>
  )
}

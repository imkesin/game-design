import { Fragment } from "react"
import { ResourceTile } from "~/games/regolith/components/ResourceTile"
import {
  BUILDING_VP,
  BUILDINGS,
  CONTRIBUTION_VP,
  CONTRIBUTIONS,
  contributionValuePerVp,
  CYCLES,
  GOODS,
  netValue,
  TIERS,
  TRACKS,
  VALUE,
  valueOf
} from "~/games/regolith/domain"
import type { Terms, Track } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * Sanity table for the track design: every track's spaces with cost, outcome
 * and net value, read straight from the domain. Not a print page.
 */

const page = css({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  padding: "32px 24px",
  color: "#e5e5e5"
})

const title = css({ fontSize: "24px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" })

const meta = css({ color: "#a3a3a3", fontSize: "13px", maxWidth: "560px", textAlign: "center", lineHeight: 1.5 })

const grid = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "16px",
  width: "100%",
  maxWidth: "1100px"
})

const card = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr auto 1fr auto",
  gridAutoRows: "min-content",
  columnGap: "8px",
  rowGap: "4px",
  alignItems: "baseline",
  border: "1px solid #404040",
  borderRadius: "6px",
  padding: "12px",
  fontSize: "13px"
})

const head = css({
  gridColumn: "1 / -1",
  display: "flex",
  justifyContent: "space-between",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: "4px"
})

const dim = css({ color: "#a3a3a3" })
const arrow = css({ color: "#737373" })
const net = css({ color: "#86efac", fontVariantNumeric: "tabular-nums" })
const cost = css({ color: "#fcd34d", fontVariantNumeric: "tabular-nums" })
const links = css({ display: "flex", gap: "20px" })
const link = css({ color: "#e5e5e5", fontSize: "15px", textDecoration: "underline" })
// White because the tiles are print components: black on white is what they are for.
const gallery = css({
  width: "100%",
  maxWidth: "1100px",
  background: "#fff",
  color: "#000",
  borderRadius: "6px",
  padding: "16px",
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  columnGap: "24px",
  rowGap: "12px",
  alignItems: "center",
  fontSize: "13px"
})
const galleryLabel = css({ color: "#525252", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" })
const tileRow = css({ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" })

function terms(ts: Terms) {
  if (ts.length === 0) return "—"
  return ts.map((x) => `${x.qty} ${x.good}`).join(" + ")
}

const ROMAN = ["I", "II", "III", "IV", "V"]

function TrackCard({ track }: { track: Track }) {
  // Top space first so the card reads like the track stands on the board.
  const rows = track.spaces.map((space, i) => ({ space, tier: i + 1 })).reverse()
  return (
    <div className={card}>
      <div className={head}>
        <span>{track.id} · {track.name}</span>
        <span className={dim}>{track.spaces.length} spaces</span>
      </div>
      {rows.map(({ space, tier }) => {
        const nv = netValue(space)
        return (
          <Fragment key={tier}>
            <span className={dim}>{ROMAN[tier - 1]}</span>
            <span>{terms(space.cost)}</span>
            <span className={arrow}>→</span>
            <span>{space.outcome.kind === "goods" ? terms(space.outcome.goods) : space.outcome.kind}</span>
            {nv === undefined
              ? <span className={cost}>({valueOf(space.cost)})</span>
              : <span className={net}>+{nv}</span>}
          </Fragment>
        )
      })}
    </div>
  )
}

export function PreviewPage() {
  const values = Object.entries(VALUE).map(([g, v]) => `${g} ${v}`).join(" · ")
  return (
    <div className={page}>
      <span className={title}>Regolith</span>
      <span className={meta}>
        Track design, spaces read from the domain. Values:{" "}
        {values}. Spaces listed top to bottom; a worker enters any empty, unlocked space and pays its cost on placement.
        Green is net value per visit; amber is the input value of a space that yields a thing. {CYCLES} cycles of{" "}
        {TIERS} rounds.
      </span>
      <div className={links}>
        <a className={link} href="/regolith/print/board">Track board (4 portrait sheets) →</a>
        <a className={link} href="/regolith/print/aid">Player aid →</a>
      </div>
      <div className={gallery}>
        <span className={galleryLabel}>Tiles · 12mm</span>
        <div className={tileRow}>
          {GOODS.map((g) => <ResourceTile key={g} kind={g} qty={VALUE[g]} />)}
          <ResourceTile kind="time" qty={1} />
        </div>
        <span className={galleryLabel}>Bare</span>
        <div className={tileRow}>
          {GOODS.map((g) => <ResourceTile key={g} kind={g} />)}
          <ResourceTile kind="time" />
        </div>
        <span className={galleryLabel}>Counts</span>
        <div className={tileRow}>
          {[1, 2, 3, 4, 5, 6].map((n) => <ResourceTile key={n} kind="energy" qty={n} />)}
        </div>
        <span className={galleryLabel}>Sizes</span>
        <div className={tileRow}>
          {[8, 10, 12, 16].map((n) => <ResourceTile key={n} kind="water" qty={2} size={n} />)}
        </div>
      </div>
      <div className={grid}>
        {TRACKS.map((t) => <TrackCard key={t.id} track={t} />)}
        <div className={card}>
          <div className={head}>
            <span>Buildings</span>
            <span className={dim}>{BUILDINGS.length} tiles</span>
          </div>
          {BUILDINGS.map((bd) => (
            <Fragment key={bd.id}>
              <span className={dim}>{bd.id}</span>
              <span>{terms(bd.cost)}</span>
              <span className={arrow}>→</span>
              <span>{bd.name}: {BUILDING_VP} VP</span>
              <span className={cost}>({valueOf(bd.cost)})</span>
            </Fragment>
          ))}
        </div>
        <div className={card}>
          <div className={head}>
            <span>Contributions</span>
            <span className={dim}>value per VP</span>
          </div>
          {CONTRIBUTION_VP.map((_, i) => i + 1).reverse().map((step) => (
            <Fragment key={step}>
              <span className={dim}>{step}</span>
              <span>{CONTRIBUTIONS.map((c) => `${c.steps[step - 1]} ${c.good}`).join(" / ")}</span>
              <span className={arrow}>→</span>
              <span>{CONTRIBUTION_VP[step - 1]} VP</span>
              <span className={cost}>
                ({CONTRIBUTIONS.map((c) =>
                  contributionValuePerVp(c, step).toFixed(1).replace(/\.0$/, "")
                ).join(" / ")})
              </span>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

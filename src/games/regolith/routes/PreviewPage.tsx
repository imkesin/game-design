import { Fragment } from "react"
import { ResourceTile } from "~/games/regolith/components/ResourceTile"
import { GOODS, netValue, reducedCost, SILOS, VALUE } from "~/games/regolith/domain"
import type { Silo, Terms } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * Sanity table for the silo redesign: every silo's zones with cost, outcome,
 * ticks and net value, read straight from the domain. Not a print page.
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

const meta = css({ color: "#a3a3a3", fontSize: "13px", maxWidth: "520px", textAlign: "center", lineHeight: 1.5 })

const grid = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "16px",
  width: "100%",
  maxWidth: "1100px"
})

const card = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr auto 1fr auto auto",
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
const todo = css({ gridColumn: "1 / -1", color: "#737373", fontStyle: "italic" })
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

function SiloCard({ silo }: { silo: Silo }) {
  // Top zone first so the card reads like the silo stands on the board.
  const rows = silo.zones.map((zone, i) => ({ zone, n: i + 1 })).reverse()
  return (
    <div className={card}>
      <div className={head}>
        <span>{silo.id} · {silo.name}</span>
        <span className={dim}>{silo.zones.length}/{silo.maxZones} zones</span>
      </div>
      {rows.length === 0 && <span className={todo}>zones undefined</span>}
      {rows.map(({ zone, n }) => {
        const nv = netValue(zone)
        const cheap = reducedCost(zone)
        return (
          <Fragment key={n}>
            <span className={dim}>{n}</span>
            <span>{terms(zone.cost)}</span>
            <span className={arrow}>→</span>
            <span>{zone.outcome.kind === "goods" ? terms(zone.outcome.goods) : zone.outcome.kind}</span>
            <span className={dim}>{zone.ticks}t</span>
            <span className={net}>{nv === undefined ? "" : `+${nv}`}</span>
            {cheap && (
              <>
                <span />
                <span className={dim}>or {terms(cheap)} (time / specialist)</span>
                <span className={arrow}>→</span>
                <span className={dim}>same</span>
                <span className={dim}>+{zone.timeTicks}t</span>
                <span />
              </>
            )}
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
        Silo redesign, zones read from the domain. Values:{" "}
        {values}. Zones listed top to bottom; a worker enters the lowest open zone (or a bay of its own at or below it)
        and pays its cost on placement.
      </span>
      <div className={links}>
        <a className={link} href="/regolith/print/board">Silo board (3 portrait + 2 landscape sheets) →</a>
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
          {[1, 2, 3, 4, 6, 11, 16].map((n) => <ResourceTile key={n} kind="energy" qty={n} />)}
        </div>
        <span className={galleryLabel}>Sizes</span>
        <div className={tileRow}>
          {[8, 10, 12, 16].map((n) => <ResourceTile key={n} kind="water" qty={2} size={n} />)}
        </div>
      </div>
      <div className={grid}>
        {SILOS.map((s) => <SiloCard key={s.id} silo={s} />)}
      </div>
    </div>
  )
}

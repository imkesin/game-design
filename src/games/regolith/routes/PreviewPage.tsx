import { Fragment } from "react"
import { covers, netValue, SILOS, VALUE } from "~/games/regolith/domain"
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
const coveredRow = css({ color: "#737373" })
const links = css({ display: "flex", gap: "20px" })
const link = css({ color: "#e5e5e5", fontSize: "15px", textDecoration: "underline" })
const coverList = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  columnGap: "12px",
  rowGap: "4px",
  fontSize: "13px",
  border: "1px solid #404040",
  borderRadius: "6px",
  padding: "12px",
  width: "100%",
  maxWidth: "1100px"
})

function terms(ts: Terms) {
  if (ts.length === 0) return "—"
  return ts.map((x) => `${x.qty} ${x.good}`).join(" + ")
}

function SiloCard({ silo }: { silo: Silo }) {
  const start = silo.startZones === undefined ? "?" : silo.startZones
  // Top zone first so the card reads like the silo stands on the board.
  const rows = silo.zones.map((zone, i) => ({ zone, n: i + 1 })).reverse()
  return (
    <div className={card}>
      <div className={head}>
        <span>{silo.id} · {silo.name}</span>
        <span className={dim}>{silo.zones.length}/{silo.maxZones} zones · start {start}</span>
      </div>
      {rows.length === 0 && <span className={todo}>zones undefined</span>}
      {rows.map(({ zone, n }) => {
        const nv = netValue(zone)
        return (
          <Fragment key={n}>
            <span className={zone.cover ? coveredRow : dim}>{zone.cover ? `${n}▣` : n}</span>
            <span>{terms(zone.cost)}</span>
            <span className={arrow}>→</span>
            <span>{zone.outcome.kind === "goods" ? terms(zone.outcome.goods) : zone.outcome.kind}</span>
            <span className={dim}>{zone.ticks}t</span>
            <span className={net}>{nv === undefined ? "" : `+${nv}`}</span>
            {zone.timeOption && (
              <>
                <span />
                <span className={dim}>or {terms(zone.timeOption.cost)}</span>
                <span className={arrow}>→</span>
                <span className={dim}>same</span>
                <span className={dim}>+{zone.timeOption.extraTicks}t</span>
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
        {values}. Zones listed top to bottom; a worker enters the lowest open zone and pays its cost on placement. ▣
        marks a zone that starts covered.
      </span>
      <div className={links}>
        <a className={link} href="/regolith/print/board">Silo board + covers (5 portrait sheets) →</a>
        <a className={link} href="/regolith/print/aid">Player aid →</a>
      </div>
      <div className={grid}>
        {SILOS.map((s) => <SiloCard key={s.id} silo={s} />)}
      </div>
      <div className={coverList}>
        <span className={head}>Cover tiles · {covers().length}</span>
        {covers().map((c) => (
          <Fragment key={c.name}>
            <span>{c.name}</span>
            <span className={dim}>{c.silo.id}</span>
            <span className={dim}>{c.cover.vp === undefined ? "? VP" : `${c.cover.vp} VP`}</span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

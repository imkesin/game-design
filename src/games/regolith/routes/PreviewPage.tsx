import { Fragment } from "react"
import { ResourceTile } from "~/games/regolith/components/ResourceTile"
import { WorkerTile } from "~/games/regolith/components/WorkerTile"
import {
  BASE_CHARGE,
  CARD_ACTION_CAPPED,
  CARD_ACTION_MATERIAL,
  CARD_ACTIONS,
  FREE_PLACEMENTS_PER_TURN,
  LIT_ZONES,
  LOCATIONS_2P,
  OUTPOST_CHARGE,
  PATH_COST,
  RESOURCE_BUYS,
  RESOURCE_SYSTEM,
  RESOURCES,
  RINGS,
  RIVER_SIZE,
  ROAD_PATH_COST,
  START_ROBOTS,
  START_SUPPLY,
  TICKS_PER_DAY,
  TIME_SYMBOL_MAX,
  TIME_SYMBOL_MIN,
  ZONES
} from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * What the fourth shape has actually settled, read straight from the domain,
 * plus the tile gallery. There is no board sheet yet: the path network, the
 * bag and the deck are all open, so there is nothing to print. Not a print
 * page.
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

const meta = css({ color: "#a3a3a3", fontSize: "13px", maxWidth: "620px", textAlign: "center", lineHeight: 1.6 })

const grid = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "16px",
  width: "100%",
  maxWidth: "1100px"
})

const card = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gridAutoRows: "min-content",
  columnGap: "12px",
  rowGap: "6px",
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
const num = css({ color: "#fcd34d", fontVariantNumeric: "tabular-nums" })

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
const tileRow = css({ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" })

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Fragment>
      <span className={dim}>{label}</span>
      <span className={num}>{value}</span>
    </Fragment>
  )
}

export function PreviewPage() {
  const supply = START_SUPPLY.map((x) => `${x.qty} ${x.resource}`).join(" + ")
  return (
    <div className={page}>
      <span className={title}>Regolith</span>
      <span className={meta}>
        Fourth shape: a polar map where the sun's terminator is the clock. A turn is either deploying any number of
        robots — which does not move the clock — or taking a card, which turns the dial by its time symbol and then
        acts. Robots earn, cards spend, and only spending moves the sun. No board sheet yet: the path network, the bag
        and the deck are all open. See DESIGN.md.
      </span>
      <div className={gallery}>
        <span className={galleryLabel}>Tiles · 12mm</span>
        <div className={tileRow}>
          {RESOURCES.map((r) => <ResourceTile key={r} kind={r} qty={2} />)}
          <ResourceTile kind="time" qty={1} />
          <WorkerTile />
        </div>
        <span className={galleryLabel}>Bare</span>
        <div className={tileRow}>
          {RESOURCES.map((r) => <ResourceTile key={r} kind={r} />)}
          <ResourceTile kind="time" />
        </div>
        <span className={galleryLabel}>Counts</span>
        <div className={tileRow}>
          {[1, 2, 3, 4, 5, 6].map((n) => <ResourceTile key={n} kind="energy" qty={n} />)}
        </div>
        <span className={galleryLabel}>Charge</span>
        <div className={tileRow}>
          <WorkerTile label={`+${BASE_CHARGE}`} />
          <WorkerTile label={`+${OUTPOST_CHARGE}`} />
        </div>
        <span className={galleryLabel}>Sizes</span>
        <div className={tileRow}>
          {[8, 10, 12, 16].map((n) => <ResourceTile key={n} kind="rock" qty={2} size={n} />)}
        </div>
      </div>
      <div className={grid}>
        <div className={card}>
          <div className={head}>
            <span>Resources</span>
            <span className={dim}>one system each</span>
          </div>
          {RESOURCES.map((r) => (
            <Fragment key={r}>
              <span className={num}>{RESOURCE_SYSTEM[r]}</span>
              <span>
                {r} — {RESOURCE_BUYS[r]}
              </span>
            </Fragment>
          ))}
        </div>
        <div className={card}>
          <div className={head}>
            <span>Board</span>
            <span className={dim}>2 players</span>
          </div>
          <Row label="Zones" value={String(ZONES)} />
          <Row label="Rings" value={String(RINGS)} />
          <Row label="Locations" value={`${LOCATIONS_2P} · 1–3 per zone, irregular`} />
          <Row label="Lit at once" value={`${LIT_ZONES} contiguous zones`} />
          <Row label="One day" value={`${TICKS_PER_DAY} ticks`} />
          <Row label="Path cost" value={`${PATH_COST} energy · ${ROAD_PATH_COST} with a road`} />
        </div>
        <div className={card}>
          <div className={head}>
            <span>Cards</span>
            <span className={dim}>river of {RIVER_SIZE}</span>
          </div>
          {CARD_ACTIONS.map((a) => (
            <Fragment key={a}>
              <span className={num}>{a}</span>
              <span>
                {CARD_ACTION_MATERIAL[a] === undefined ? "—" : `${CARD_ACTION_MATERIAL[a]} each`}
                {CARD_ACTION_CAPPED[a] ? " · size is a cap" : " · extras cost distance"}
              </span>
            </Fragment>
          ))}
          <Row label="Time symbol" value={`${TIME_SYMBOL_MIN}–${TIME_SYMBOL_MAX} ticks, turned before the action`} />
          <Row label="Size" value="how many uses are spatially free" />
        </div>
        <div className={card}>
          <div className={head}>
            <span>Start</span>
            <span className={dim}>provisional</span>
          </div>
          <Row label="Robots" value={String(START_ROBOTS)} />
          <Row label="Supply" value={supply} />
          <Row label="Base" value="any location, covers it, distance 0" />
          <Row label="Charge" value={`+${BASE_CHARGE} base · +${OUTPOST_CHARGE} outpost, on bump`} />
          <Row label="Free placements" value={`${FREE_PLACEMENTS_PER_TURN} per turn, any distance`} />
        </div>
      </div>
    </div>
  )
}

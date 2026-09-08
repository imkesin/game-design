import { TermList, TimeTerm } from "~/games/regolith/components/SiloBoard"
import { GOODS, VALUE } from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * One-page player aid: the three turn shapes, the marker rules, paying with
 * time, and the upgrade effects. Portrait letter, two columns. Rules text is
 * the DESIGN.md wording cut to table size.
 */

const printCss = `
  :root { --u: 1mm; }
  @page { size: 8.5in 11in; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .screen-only { display: none !important; }
    .print-root { background: #fff !important; padding: 0 !important; display: block !important; }
    .sheet { box-shadow: none !important; margin: 0 !important; }
  }
`

const screen = css({
  background: "#525252",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  padding: "24px"
})

const note = css({
  position: "fixed",
  top: "12px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10,
  background: "#262626",
  color: "#e5e5e5",
  fontSize: "13px",
  padding: "8px 14px",
  borderRadius: "8px"
})

const sheet = css({
  width: "8.5in",
  height: "11in",
  padding: "0.45in",
  boxSizing: "border-box",
  background: "#fff",
  color: "#000",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  flex: "none",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridTemplateRows: "auto 1fr",
  gridTemplateAreas: `"title title" "left right"`,
  columnGap: "0.35in",
  rowGap: "0.2in",
  fontFamily: "system-ui, sans-serif",
  fontSize: "9pt",
  lineHeight: 1.35
})

const title = css({
  gridArea: "title",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  borderBottom: "0.6mm solid #000",
  paddingBottom: "1.5mm",
  fontSize: "18pt",
  fontWeight: 900,
  letterSpacing: "0.1em",
  textTransform: "uppercase"
})
const subtitle = css({ fontSize: "8pt", fontWeight: 600, color: "#555", letterSpacing: "0.06em" })
const col = css({ display: "flex", flexDirection: "column", gap: "3.5mm" })
const h = css({
  fontSize: "8pt",
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  borderBottom: "0.3mm solid #000",
  paddingBottom: "0.6mm",
  marginBottom: "1.2mm"
})
const p = css({ margin: 0 })
const list = css({ margin: 0, paddingLeft: "4mm", display: "flex", flexDirection: "column", gap: "1mm" })
const b = css({ fontWeight: 800 })
const turns = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  columnGap: "3mm",
  rowGap: "1mm",
  alignItems: "baseline"
})
const turnKey = css({
  fontWeight: 900,
  fontSize: "10pt",
  border: "0.3mm solid #000",
  borderRadius: "1mm",
  padding: "0 1.5mm",
  justifySelf: "start"
})
const goods = css({
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "1mm",
  textAlign: "center",
  fontSize: "8pt",
  fontWeight: 700
})
const good = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5mm",
  border: "0.3mm solid #000",
  borderRadius: "1mm",
  padding: "1mm 0"
})
const goodVal = css({ fontSize: "7pt", color: "#555", fontWeight: 600 })

export function AidPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`screen-only ${note}`}>Cmd-P · Letter portrait · Margins: None · Scale: 100%</div>
        <div className={`sheet ${sheet}`}>
          <div className={title}>
            <span>Regolith</span>
            <span className={subtitle}>player aid · v0</span>
          </div>

          <div className={col} style={{ gridArea: "left" }}>
            <section>
              <div className={h}>Your turn: two atoms, two different silos</div>
              <div className={turns}>
                <span className={turnKey}>A</span>
                <span>
                  <span className={b}>Place + Place.</span> Two workers into two different silos.
                </span>
                <span className={turnKey}>B</span>
                <span>
                  <span className={b}>Place + Advance.</span> One worker into a silo, one tick on a different silo.
                </span>
                <span className={turnKey}>C</span>
                <span>
                  <span className={b}>Advance + Advance.</span> One tick each on two different silos.
                </span>
              </div>
              <p className={p} style={{ marginTop: "1.5mm" }}>
                Both atoms of a turn must touch <span className={b}>different</span>{" "}
                silos. Never place and tick the same silo, never double-tick one.
              </p>
            </section>

            <section>
              <div className={h}>Place</div>
              <ul className={list}>
                <li>
                  Your worker enters the <span className={b}>lowest unlocked, empty zone</span>{" "}
                  of the silo. No choosing higher.
                </li>
                <li>
                  <span className={b}>Pay the zone's cost now</span>, in full, from your supply. Can't pay, can't place.
                </li>
                <li>
                  Zones the marker has already passed are <span className={b}>locked</span> until it resets.
                </li>
                <li>A silo with no open, empty zone above the marker is closed.</li>
              </ul>
            </section>

            <section>
              <div className={h}>Advance</div>
              <ul className={list}>
                <li>
                  Move the silo's time marker <span className={b}>one tick</span> up its track.
                </li>
                <li>
                  When the marker <span className={b}>leaves a zone</span> (passes its top tick), the worker there is
                  {" "}
                  <span className={b}>bumped</span>: it returns to its owner with the zone's outcome.
                </li>
                <li>
                  Leaving the <span className={b}>top revealed zone</span> bumps it and the marker{" "}
                  <span className={b}>resets to the bottom tick</span> at once. Everything unlocks.
                </li>
                <li>Advancing pays you nothing directly. It is tempo — yours or someone else's.</li>
              </ul>
            </section>

            <section>
              <div className={h}>Paying with time</div>
              <p className={p}>
                Some zones print a second, cheaper price ending in{" "}
                <TimeTerm count={1} size={3.8} />. Taking it, put that many <span className={b}>time tokens</span>{" "}
                in the zone's box. While the marker sits at that zone, an advance{" "}
                <span className={b}>removes a token instead of moving</span>. Zones below resolve at normal speed; every
                worker above waits too.
              </p>
            </section>
          </div>

          <div className={col} style={{ gridArea: "right" }}>
            <section>
              <div className={h}>Goods · value</div>
              <div className={goods}>
                {GOODS.map((g) => (
                  <div key={g} className={good}>
                    <TermList terms={[{ good: g, qty: VALUE[g] }]} size={4.5} />
                    <span className={goodVal}>{g}</span>
                  </div>
                ))}
              </div>
              <p className={p} style={{ marginTop: "1.5mm", fontSize: "8pt", color: "#444" }}>
                Every zone pays out more than it costs. Higher zones pay more and wait longer.
              </p>
            </section>

            <section>
              <div className={h}>Upgrades resolve on bump</div>
              <ul className={list}>
                <li>
                  <span className={b}>Construction (D1).</span>{" "}
                  On placement, choose the lowest covered zone of any silo and put your marker on its cover. On bump,
                  remove the cover: the zone opens for everyone, you score its VP.
                </li>
                <li>
                  <span className={b}>Recruit (D2).</span> On bump, take a new worker.
                </li>
                <li>
                  <span className={b}>Machinery (E1).</span>{" "}
                  Choose a zone in a B silo. On bump, put your marker beside it. Your workers yield a bonus there;
                  anyone may still use it.
                </li>
                <li>
                  <span className={b}>Polymers (E2).</span>{" "}
                  Same, for a zone in a C silo. Your workers convert better there.
                </li>
                <li>
                  <span className={b}>Upgraded worker (E3), Special projects (F1).</span> Not in v0.
                </li>
              </ul>
            </section>

            <section>
              <div className={h}>Setup · v0 (pencil in)</div>
              <ul className={list}>
                <li>Cover tiles on every hatched zone. Every marker disc on its silo's bottom tick.</li>
                <li>Workers per player: ____ &nbsp; Starting goods: ____</li>
                <li>Game ends: ____ &nbsp; Score: VP from covers + ____</li>
                <li>Bonus for machinery / polymer markers: ____</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

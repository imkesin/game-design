import { TermList } from "~/games/regolith/components/TrackBoard"
import {
  BUILDING_VP,
  CONTRIBUTION_VP,
  CONTRIBUTIONS,
  CYCLES,
  GOODS,
  LIFE_SUPPORT_SURCHARGE,
  START_GOODS,
  START_WORKERS,
  TIERS,
  VALUE
} from "~/games/regolith/domain"
import { css } from "~/generated/styled-system/css"

/**
 * One-page player aid: the round, placement, contributions, the level
 * marker, upgrades and their kickers, the goods value strip, setup and
 * scoring. Portrait letter, two columns. Rules text is the DESIGN.md wording
 * cut to table size.
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
const steps = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  columnGap: "3mm",
  rowGap: "1mm",
  alignItems: "baseline"
})
const stepKey = css({
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
// Open spaces by level: a small strip of five, so the crunch is visible.
const levels = css({
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "1mm",
  textAlign: "center",
  fontSize: "8pt",
  marginTop: "1.5mm"
})
const level = css({ border: "0.3mm solid #000", borderRadius: "1mm", padding: "0.8mm 0" })
const levelNum = css({ fontWeight: 900, fontSize: "10pt" })
const levelOpen = css({ fontSize: "7pt", color: "#555" })

const ROMAN = ["I", "II", "III", "IV", "V"]

export function AidPrintPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`print-root ${screen}`}>
        <div className={`screen-only ${note}`}>Cmd-P · Letter portrait · Margins: None · Scale: 100%</div>
        <div className={`sheet ${sheet}`}>
          <div className={title}>
            <span>Regolith</span>
            <span className={subtitle}>player aid · v1 · tracks</span>
          </div>

          <div className={col} style={{ gridArea: "left" }}>
            <section>
              <div className={h}>The round</div>
              <div className={steps}>
                <span className={stepKey}>1</span>
                <span>
                  <span className={b}>Place.</span> Start player first, then clockwise. On your turn place{" "}
                  <span className={b}>as many workers as you can afford</span>, one at a time, then the next player
                  goes. You may stop with workers in hand. Placing <span className={b}>none</span>, you may{" "}
                  <span className={b}>contribute</span> instead.
                </span>
                <span className={stepKey}>2</span>
                <span>
                  <span className={b}>Tick.</span> Move the level marker{" "}
                  <span className={b}>up one tier</span>. Bump the row it left. Leaving tier{" "}
                  {ROMAN[TIERS - 1]}: reset it to tier I.
                </span>
                <span className={stepKey}>3</span>
                <span>
                  <span className={b}>Pass the start marker</span> clockwise.
                </span>
              </div>
              <p className={p} style={{ marginTop: "1.5mm" }}>
                The game is <span className={b}>{CYCLES} cycles</span> of {TIERS} rounds: {CYCLES * TIERS} rounds.
              </p>
            </section>

            <section>
              <div className={h}>Place</div>
              <ul className={list}>
                <li>
                  Into <span className={b}>any empty, unlocked space</span>{" "}
                  on any track. Nothing forces you up; higher pays more and waits longer.
                </li>
                <li>
                  <span className={b}>Pay the space's cost now</span>, in full, from your supply. Can't pay, can't
                  place.
                </li>
                <li>
                  Rows{" "}
                  <span className={b}>below the level marker are locked</span>. A space with a life support has two
                  slots; the{" "}
                  <span className={b}>
                    second worker pays <TermList terms={LIFE_SUPPORT_SURCHARGE} size={4.5} /> extra
                  </span>{" "}
                  to the supply. Both bump together.
                </li>
                <li>
                  If you own the machine, battery or life support on a space, you enter it{" "}
                  <span className={b}>free</span>.
                </li>
              </ul>
            </section>

            <section>
              <div className={h}>Contribute · instead of placing</div>
              <ul className={list}>
                <li>
                  On your turn, if you place <span className={b}>no worker</span>{" "}
                  — by choice, or because every worker you own is out — you may make{" "}
                  <span className={b}>one contribution</span>. Never both.
                </li>
                <li>
                  Pick a track: {CONTRIBUTIONS.map((c) => c.good).join(", ")}. Pay its{" "}
                  <span className={b}>leftmost open step</span>{" "}
                  to the bank, put your disc on it, and take its VP now. Can't pay it, can't contribute there.
                </li>
                <li>
                  The tracks are the table's. Steps pay <span className={b}>{CONTRIBUTION_VP.join(" / ")} VP</span>{" "}
                  left to right, whoever fills them. Rock and Water cannot be contributed.
                </li>
              </ul>
            </section>

            <section>
              <div className={h}>The level marker</div>
              <ul className={list}>
                <li>
                  When the marker <span className={b}>leaves a row</span>, every worker on that row is{" "}
                  <span className={b}>bumped</span>: home to its owner with the space's yield (or its upgrade placed).
                  That row is locked until the reset.
                </li>
                <li>
                  A worker on tier <span className={b}>r</span> placed at level <span className={b}>L</span>{" "}
                  comes home in <span className={b}>r − L + 1</span> rounds.
                </li>
                <li>
                  Leaving tier {ROMAN[TIERS - 1]} bumps it and <span className={b}>resets</span>{" "}
                  the marker to tier I. Everything unlocks. Advance the cycle counter.
                </li>
              </ul>
              <div className={levels}>
                {Array.from({ length: TIERS }, (_, i) => (
                  <div key={i} className={level}>
                    <div className={levelNum}>{ROMAN[i]}</div>
                    <div className={levelOpen}>{(TIERS - i) * 3} open</div>
                  </div>
                ))}
              </div>
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
                Every goods space pays out more than it costs. Tiers I–III ladder +4 / +5 / +6.
              </p>
            </section>

            <section>
              <div className={h}>Upgrades resolve on bump</div>
              <ul className={list}>
                <li>
                  <span className={b}>Machine (Phys IV).</span>{" "}
                  On placement, name an empty machine slot on a tier I or II space. On bump, put your marker in it.{" "}
                  <span className={b}>Everyone</span> bumped from that space takes <span className={b}>+1</span>{" "}
                  of its yield good. <span className={b}>Kicker:</span> you enter it free.
                </li>
                <li>
                  <span className={b}>Battery (Chem V).</span>{" "}
                  Same as a machine, for a tier III or IV space: +1 of its yield — a second worker from Recruit, a
                  second machine from Machine. <span className={b}>Kicker:</span> you enter it free.
                </li>
                <li>
                  <span className={b}>Life Support (Bio V).</span>{" "}
                  On placement, name an empty life support slot on a tier I–IV space. On bump, put your marker in it.
                  The space now holds <span className={b}>two workers</span>, anyone's; the second pays{" "}
                  <TermList terms={LIFE_SUPPORT_SURCHARGE} size={4.5} /> extra. <span className={b}>Kicker:</span>{" "}
                  you enter it free.
                </li>
                <li>
                  <span className={b}>Recruit (Bio IV).</span> On bump, take a new worker. Place it from next round.
                </li>
                <li>
                  <span className={b}>Building (Phys V).</span>{" "}
                  On placement, put an unbuilt building tile into an empty row of the Buildings column{" "}
                  <span className={b}>at once</span>. It is now a space: anyone places there, pays its recipe, and is
                  bumped with <span className={b}>{BUILDING_VP} VP</span>. No owner, no kicker, no slots.
                </li>
                <li>
                  No tolls. A machine, battery or life support is for the whole table; only the free entry is yours. A
                  building is nobody's.
                </li>
              </ul>
            </section>

            <section>
              <div className={h}>Setup · v1</div>
              <ul className={list}>
                <li>Level marker on tier I, cycle counter on 1. Every slot empty.</li>
                <li>
                  Each player: <span className={b}>{START_WORKERS} workers</span>,{" "}
                  <TermList terms={START_GOODS} size={4.5} />, nothing else.
                </li>
                <li>Choose a start player.</li>
                <li>Five building tiles beside the board, unbuilt. Contribution board empty. VP tokens in a pile.</li>
                <li>
                  <span className={b}>Score:</span> most VP after {CYCLES * TIERS}{" "}
                  rounds — building visits plus your discs on the contribution board. Tie: more goods by value.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

import type { ReactNode } from "react"
import { css } from "~/generated/styled-system/css"

/**
 * The host's rules sheet on one Letter portrait page, in four full-width rows:
 * setup (with what changes by player count), turn flow, mayor movement, and
 * the end game. Playtest copy, not a rulebook: the sale card carries values
 * and hexes.
 */

type Count = {
  players: number
  /** Face-up row tiles: K + 2, where the mayor walks once per K tiles taken. */
  display: number
  /** Agenda cards thrown out unseen at setup. */
  agendaOut: number
  historical: boolean
}

const COUNTS: readonly Count[] = [
  { players: 2, display: 5, agendaOut: 1, historical: true },
  { players: 3, display: 6, agendaOut: 3, historical: true },
  { players: 4, display: 6, agendaOut: 0, historical: false },
  { players: 5, display: 7, agendaOut: 3, historical: false }
]

const printCss = `
  @page { size: 8.5in 11in; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .rules-root { background: #fff !important; padding: 0 !important; }
    .rules-sheet { box-shadow: none !important; }
  }
`

const root = css({
  display: "grid",
  justifyItems: "center",
  alignContent: "start",
  padding: "24px",
  minHeight: "100vh",
  background: "#525252"
})

const sheet = css({
  display: "grid",
  gridTemplateAreas: `
    "title"
    "setup"
    "turn"
    "mayor"
    "end"`,
  alignContent: "start",
  rowGap: "4mm",
  width: "8.5in",
  height: "11in",
  boxSizing: "border-box",
  padding: "0.45in",
  background: "white",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  fontFamily: "sans-serif",
  fontSize: "3.1mm",
  lineHeight: 1.35,
  color: "#1f1f1f",
  printColorAdjust: "exact"
})

const title = css({
  gridArea: "title",
  display: "grid",
  gridTemplateAreas: `"name . note"`,
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "baseline",
  paddingBottom: "2mm",
  borderBottom: "0.5mm solid #1f1f1f"
})

const sectionCss = css({
  display: "grid",
  alignContent: "start",
  gap: "1.5mm",
  paddingBottom: "4mm",
  borderBottom: "0.25mm solid #d4d4d4",
  "&:last-child": { borderBottom: "none" }
})

const heading = css({
  fontSize: "3.6mm",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase"
})

const list = css({
  display: "grid",
  gap: "1.2mm",
  margin: 0,
  paddingLeft: "5mm",
  "& ol, & ul": { display: "grid", gap: "0.6mm", marginTop: "0.6mm", paddingLeft: "4.5mm" }
})

const table = css({
  borderCollapse: "collapse",
  "& th, & td": { padding: "0.8mm 4mm", borderBottom: "0.25mm solid #d4d4d4", textAlign: "center" },
  "& th": { fontSize: "2.7mm", fontWeight: 700, color: "#5a5a5a", verticalAlign: "bottom" },
  "& td:first-child, & th:first-child": { textAlign: "left", paddingLeft: 0 }
})

const special = css({ paddingLeft: "5mm" })

function Section({ area, name, children }: { area: string; name: string; children: ReactNode }) {
  return (
    <section className={sectionCss} style={{ gridArea: area }}>
      <span className={heading}>{name}</span>
      {children}
    </section>
  )
}

export function RulesPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`rules-root ${root}`}>
        <div className={`rules-sheet ${sheet}`}>
          <div className={title}>
            <span style={{ gridArea: "name", fontSize: "6mm", fontWeight: 700 }}>Revival</span>
            <span style={{ gridArea: "note", fontSize: "2.7mm", color: "#5a5a5a" }}>
              Playtest rules · most coins wins
            </span>
          </div>

          <Section area="setup" name="Setup">
            <ul className={list}>
              <li>Blight cards</li>
              <li>
                Company
                <ul>
                  <li>Each player takes a mat, a sale card, 3 cones, 5 coins, and a credit marker on 0</li>
                </ul>
              </li>
            </ul>
            <table className={table}>
              <thead>
                <tr>
                  <th>Players</th>
                  <th>Tiles in display</th>
                  <th>Agenda cards to remove</th>
                  <th>Historical buildings</th>
                </tr>
              </thead>
              <tbody>
                {COUNTS.map((c) => (
                  <tr key={c.players}>
                    <td>
                      <b>{c.players}</b>
                    </td>
                    <td>{c.display}</td>
                    <td>{c.agendaOut}</td>
                    <td>{c.historical ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section area="turn" name="Turn flow">
            <span>Each turn, do one:</span>
            <ul className={list}>
              <li>
                <b>Break ground on a building project</b>
                <ul>
                  <li>One of the buildings from the row</li>
                  <li>A Park</li>
                  <li>A blighted building on the board</li>
                </ul>
              </li>
            </ul>
            <span className={special}>
              <b>Special</b>: if, at the end of your turn, 2 or fewer building tiles remain in the row, you move the
              mayor. Then refill the row to its count.
            </span>
            <ul className={list}>
              <li>
                <b>Pull a cone off a construction site</b>
                <ul>
                  <li>If no cones are left on it, you’ve finished the project and get the cash for the building</li>
                </ul>
              </li>
            </ul>
          </Section>

          <Section area="mayor" name="Mayor movement">
            <ol className={list}>
              <li>
                <b>Target</b>: the walker picks one of the 2 face-up agenda cards, and an L path to it (at most one
                turn).
              </li>
              <li>
                <b>Visits</b>: every neighborhood the mayor enters, destination included (not his start). Each visit,
                the first that applies:
                <ol>
                  <li>
                    <b>An empty plot</b> → the walker puts 1 incentive on one (stacks).
                  </li>
                  <li>
                    <b>Blight</b>{" "}
                    → the walker knocks one down. Coned: the black building and 1 of its cones come off. Not coned: tile
                    and building leave; the plot is empty.
                  </li>
                  <li>
                    <b>Neither</b>{" "}
                    → tax: each company pays 1 coin per coned plot there. Can’t pay: abandon that many coned plots there
                    (your pick); the tile leaves the game, cones return.
                  </li>
                </ol>
              </li>
              <li>
                <b>Credit</b>: every company collects its credit level in coins.
              </li>
              <li>
                <b>Upgrades</b>: everyone <b>except the walker</b> may spend incentives (mat).
              </li>
              <li>Discard the target; reveal a new agenda card. Refill the display.</li>
            </ol>
          </Section>

          <Section area="end" name="End game">
            <span>
              The game ends after the walk that uses the <b>last agenda card</b>. Then:
            </span>
            <ol className={list}>
              <li>
                <b>Final sale</b>: every company may finish one project at full value.
              </li>
              <li>
                <b>Firesale</b>: every other coned plot sells for its base sale value − 1 (House 2, Commercial 1,
                Industrial 0, Park 0); no Parks or hexes counted.
              </li>
              <li>
                <b>Most coins wins.</b>
              </li>
            </ol>
          </Section>
        </div>
      </div>
    </>
  )
}

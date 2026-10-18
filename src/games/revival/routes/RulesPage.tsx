import { marked } from "marked"
import { css } from "~/generated/styled-system/css"
import rules from "../RULES.md?raw"

/** The host's rules sheet: RULES.md on Letter-width paper, flowing onto as many pages as it needs. */

const html = marked.parse(rules, { async: false })

const printCss = `
  @page { size: 8.5in 11in; margin: 0.5in; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .rules-root { background: #fff !important; padding: 0 !important; }
    .rules-sheet { box-shadow: none !important; width: auto !important; padding: 0 !important; }
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
  alignContent: "start",
  width: "8.5in",
  minHeight: "11in",
  boxSizing: "border-box",
  padding: "0.5in",
  background: "white",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  fontFamily: "sans-serif",
  fontSize: "3.3mm",
  lineHeight: 1.4,
  color: "#1f1f1f",
  "& > *": { margin: 0 },
  "& > * + *": { marginTop: "2mm" },
  "& h1": { fontSize: "6mm", fontWeight: 700, paddingBottom: "2mm", borderBottom: "0.5mm solid #1f1f1f" },
  "& h2": {
    marginTop: "6mm",
    paddingTop: "3mm",
    borderTop: "0.25mm solid #d4d4d4",
    fontSize: "3.8mm",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    breakAfter: "avoid"
  },
  "& h1 + * ": { color: "#5a5a5a" },
  "& h1 + * + h2": { borderTop: "none", paddingTop: 0 },
  "& ul, & ol": { display: "grid", gap: "1mm", paddingLeft: "6mm" },
  "& li > ul, & li > ol": { marginTop: "1mm" },
  "& ul": { listStyleType: "disc" },
  "& ul ul": { listStyleType: "circle" },
  "& ol": { listStyleType: "decimal" },
  "& ol ol": { listStyleType: "lower-alpha" },
  "& strong": { fontWeight: 700 },
  "& li": { breakInside: "avoid" },
  "& table": { borderCollapse: "collapse", breakInside: "avoid" },
  "& th, & td": { padding: "0.8mm 4mm", borderBottom: "0.25mm solid #d4d4d4", textAlign: "center" },
  "& th": { fontSize: "2.9mm", color: "#5a5a5a", verticalAlign: "bottom" },
  "& th:first-child, & td:first-child": { textAlign: "left", paddingLeft: 0 }
})

export function RulesPage() {
  return (
    <>
      <style>{printCss}</style>
      <div className={`rules-root ${root}`}>
        <article className={`rules-sheet ${sheet}`} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </>
  )
}

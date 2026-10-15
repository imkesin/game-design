import { type ReactNode, useEffect, useState } from "react"
import { css } from "~/generated/styled-system/css"

/**
 * Screen shell for true-size paper sheets: a title, a zoom slider (screen
 * only), and print rules that pin `--u` to 1mm and drop everything but the
 * sheets (`.print-only` is the reverse of `.screen-only`). Print with
 * Margins = None and Scale = 100%.
 */

const printCss = (pageSize: string) => `
  @page { size: ${pageSize}; margin: 0; }
  @media screen { .print-only { display: none !important; } }
  @media print {
    :root { --u: 1mm !important; }
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .screen-only { display: none !important; }
    .desk-root { padding: 0 !important; background: #fff !important; gap: 0 !important; }
  }
`

const page = css({
  minHeight: "100vh",
  display: "grid",
  gridTemplateAreas: `"header" "desk"`,
  gridTemplateRows: "auto 1fr",
  background: "#e5e5e5",
  color: "#000"
})

const header = css({
  gridArea: "header",
  display: "grid",
  gridAutoFlow: "column",
  justifyContent: "start",
  alignItems: "center",
  gap: "20px",
  padding: "16px 24px",
  background: "#fff",
  fontSize: "14px",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
})

const control = css({ display: "grid", gridAutoFlow: "column", gap: "8px", alignItems: "center" })

const desk = css({ gridArea: "desk", display: "grid", justifyItems: "center", gap: "24px", padding: "24px" })

const ZOOM_KEY = "revival:zoom"

export function Desk(
  { title, notes, pageSize = "letter portrait", children }: {
    title: string
    notes?: ReactNode
    /** CSS `@page` size for printing. */
    pageSize?: string
    children: ReactNode
  }
) {
  const [zoom, setZoom] = useState(() => {
    try {
      return Number(localStorage.getItem(ZOOM_KEY) ?? 1) || 1
    } catch {
      return 1
    }
  })

  useEffect(() => {
    document.documentElement.style.setProperty("--u", `${zoom}mm`)
  }, [zoom])

  return (
    <div className={page}>
      <style>{printCss(pageSize)}</style>
      <div className={`${header} screen-only`}>
        <span>{title}</span>
        <label className={control}>
          Zoom
          <input
            type="range"
            min={0.3}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => {
              try {
                localStorage.setItem(ZOOM_KEY, e.target.value)
              } catch {
                // Private mode: just don't remember.
              }
              setZoom(Number(e.target.value))
            }}
          />
          <span style={{ width: "5ch", fontVariantNumeric: "tabular-nums" }}>{zoom.toFixed(1)}×</span>
        </label>
        {notes}
      </div>
      <div className={`${desk} desk-root`}>{children}</div>
    </div>
  )
}

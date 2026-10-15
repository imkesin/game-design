import type { ReactNode } from "react"
import { css } from "~/generated/styled-system/css"
import { mm } from "./mm.ts"

/**
 * A sheet of paper with a working area centred on it, true size in mm. On
 * screen it casts a shadow and marks the area dashed and labelled.
 */

const sheet = css({
  display: "grid",
  gridTemplateAreas: `"page"`,
  placeItems: "center",
  background: "white",
  boxShadow: "0 1px 6px rgba(0,0,0,0.35)"
})

const guide = css({
  gridArea: "page",
  outline: "dashed #2563eb",
  outlineWidth: "calc(0.5 * var(--u))",
  outlineOffset: "calc(0.5 * var(--u))"
})

const label = css({
  gridArea: "page",
  alignSelf: "start",
  marginTop: "calc(1.5 * var(--u))",
  color: "#2563eb",
  fontSize: "calc(3.5 * var(--u))",
  letterSpacing: "0.08em",
  whiteSpace: "nowrap"
})

const content = css({ gridArea: "page" })

export function Paper(
  { width, height, areaWidth, areaHeight, title, children }: {
    width: number
    height: number
    areaWidth: number
    areaHeight: number
    title: string
    children: ReactNode
  }
) {
  return (
    <div className={sheet} style={{ width: mm(width), height: mm(height) }}>
      <div className={`${guide} screen-only`} style={{ width: mm(areaWidth), height: mm(areaHeight) }} />
      <div className={`${label} screen-only`}>{title}</div>
      <div className={content}>{children}</div>
    </div>
  )
}

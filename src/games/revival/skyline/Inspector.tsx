import type { FocusEvent } from "react"
import { css } from "~/generated/styled-system/css"
import { LIMIT } from "./edit.ts"
import type { NeighborhoodSpec, SkylineFile } from "./skyline.ts"
import { Tally } from "./Tally.tsx"

/** Screen-only panel for editing the selected neighborhood. */

const panel = css({
  position: "fixed",
  top: "72px",
  right: "24px",
  zIndex: 1,
  width: "280px",
  display: "grid",
  gridTemplateAreas: `"tally" "name" "columns" "neighbors" "remove" "hint"`,
  gap: "14px",
  padding: "14px",
  background: "white",
  border: "1px solid #bbb",
  borderRadius: "6px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
  fontSize: "13px",
  color: "#333"
})

const field = css({ display: "grid", gap: "6px" })

const label = css({ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#777" })

const input = css({ padding: "4px 6px", border: "1px solid #999", borderRadius: "4px", fontSize: "14px" })

const button = css({
  padding: "2px 8px",
  border: "1px solid #999",
  borderRadius: "4px",
  background: "white",
  _disabled: { opacity: 0.35 }
})

/** Add-left, the columns, add-right; each column is +, its plot count, −. */
const columnsGrid = css({
  display: "grid",
  gridAutoFlow: "column",
  gridTemplateRows: "auto auto auto",
  justifyContent: "start",
  alignItems: "center",
  justifyItems: "center",
  gap: "4px 6px"
})

const count = css({ fontSize: "16px", fontWeight: 700 })

const side = css({ gridRow: "1 / -1" })

const muted = css({ color: "#777" })

const hint = css({ gridArea: "hint", color: "#777", fontSize: "12px" })

export function Inspector(
  { file, selected, neighbors, onRename, onColumns, onRemove }: {
    file: SkylineFile
    selected: NeighborhoodSpec | undefined
    /** The selected neighborhood's neighbors, across a street or a bridge. */
    neighbors: readonly string[]
    /** Returns why the name was refused, if it was. */
    onRename: (to: string) => string | undefined
    onColumns: (columns: number[], shift?: number) => void
    onRemove: () => void
  }
) {
  const help = (
    <div className={hint}>
      Click a neighborhood to edit it, drag to move it. Water (W), Bridge (B) and Ground (G) paint grid cells: a stroke
      starting on water (or a bridge) clears it; a Ground stroke grows the territory it starts in, or clears ground when
      it starts on unheld land. Grow fills the rest. Delete removes, ⌘Z undoes, Esc stops painting.
    </div>
  )
  const tally = (
    <div style={{ gridArea: "tally" }}>
      <Tally neighborhoods={file.neighborhoods} selected={selected} />
    </div>
  )
  if (selected === undefined) {
    return (
      <div className={`${panel} screen-only`}>
        {tally}
        {help}
      </div>
    )
  }

  const { name, columns } = selected
  const set = (i: number, plots: number) => onColumns(columns.map((c, k) => (k === i ? plots : c)))
  const drop = (i: number) => onColumns(columns.filter((_, k) => k !== i), i === 0 ? -1 : 0)
  const full = columns.length >= LIMIT.columns

  function commit(event: FocusEvent<HTMLInputElement>) {
    const to = event.currentTarget.value.trim()
    if (to === name) return
    if (onRename(to) !== undefined) event.currentTarget.value = name
  }

  return (
    <div className={`${panel} screen-only`}>
      {tally}
      <label className={field} style={{ gridArea: "name" }}>
        <span className={label}>Name</span>
        <input
          key={name}
          className={input}
          defaultValue={name}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Escape") event.currentTarget.value = name
            if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur()
          }}
        />
      </label>
      <div className={field} style={{ gridArea: "columns" }}>
        <span className={label}>Columns (plots each)</span>
        <div className={columnsGrid}>
          <button
            type="button"
            className={`${button} ${side}`}
            disabled={full}
            onClick={() => onColumns([1, ...columns], 1)}
          >
            + col
          </button>
          {columns.map((plots, i) => [
            <button
              key={`up${i}`}
              type="button"
              className={button}
              disabled={plots >= LIMIT.plots}
              onClick={() => set(i, plots + 1)}
            >
              +
            </button>,
            <span key={`n${i}`} className={count}>{plots}</span>,
            <button
              key={`down${i}`}
              type="button"
              className={button}
              disabled={plots === 1 && columns.length === 1}
              title={plots === 1 ? "Remove this column" : undefined}
              onClick={() => (plots === 1 ? drop(i) : set(i, plots - 1))}
            >
              {plots === 1 ? "×" : "−"}
            </button>
          ])}
          <button
            type="button"
            className={`${button} ${side}`}
            disabled={full}
            onClick={() => onColumns([...columns, 1])}
          >
            + col
          </button>
        </div>
      </div>
      <div className={field} style={{ gridArea: "neighbors" }}>
        <span className={label}>Neighbors ({neighbors.length})</span>
        <span className={neighbors.length === 0 ? muted : undefined}>
          {neighbors.length === 0 ? "None: paint or grow its territory up to another." : neighbors.join(", ")}
        </span>
      </div>
      <button type="button" className={button} style={{ gridArea: "remove", justifySelf: "start" }} onClick={onRemove}>
        Delete neighborhood
      </button>
      {help}
    </div>
  )
}

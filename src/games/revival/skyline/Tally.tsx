import { css, cx } from "~/generated/styled-system/css"
import type { NeighborhoodSpec } from "./skyline.ts"

/**
 * Neighborhoods by size (total plots) against the target mix: a filled square
 * per neighborhood up to the target, hollow for those still missing, red for
 * any over it.
 */

/** How many neighborhoods of each size the city wants. */
const TARGET = new Map([[2, 3], [3, 4], [4, 4], [5, 4], [6, 3]])

const table = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "center",
  gap: "4px 10px",
  fontVariantNumeric: "tabular-nums"
})

const label = css({ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#777" })

const heading = css({ gridColumn: "1 / -1" })

const row = css({ display: "contents", color: "#555" })

/** The selected neighborhood's size. */
const mine = css({ color: "#2563eb", fontWeight: 700 })

const squares = css({ display: "grid", gridAutoFlow: "column", justifyContent: "start", gap: "3px" })

const square = css({ width: "10px", height: "10px", border: "1.5px solid #333", borderRadius: "1px" })

const filled = css({ background: "#333" })

const over = css({ background: "#dc2626", borderColor: "#dc2626" })

const total = css({ gridColumn: "1 / -1", color: "#777", fontSize: "12px" })

export function Tally(
  { neighborhoods, selected }: { neighborhoods: readonly NeighborhoodSpec[]; selected?: NeighborhoodSpec | undefined }
) {
  const size = (n: NeighborhoodSpec) => n.columns.reduce((a, b) => a + b, 0)
  const have = new Map<number, number>()
  for (const n of neighborhoods) have.set(size(n), (have.get(size(n)) ?? 0) + 1)
  const sizes = [...new Set([...TARGET.keys(), ...have.keys()])].sort((a, b) => a - b)
  const wanted = [...TARGET.values()].reduce((a, b) => a + b, 0)
  const built = neighborhoods.reduce((sum, n) => sum + size(n), 0)
  const plots = [...TARGET].reduce((sum, [s, k]) => sum + s * k, 0)

  return (
    <div className={table}>
      <span className={cx(label, heading)}>Sizes (plots)</span>
      {sizes.map((s) => {
        const [count, target] = [have.get(s) ?? 0, TARGET.get(s) ?? 0]
        return (
          <div key={s} className={cx(row, selected !== undefined && size(selected) === s && mine)}>
            <span>{s}</span>
            <span className={squares}>
              {Array.from(
                { length: Math.max(count, target) },
                (_, k) => (
                  <span key={k} className={cx(square, k < Math.min(count, target) && filled, k >= target && over)} />
                )
              )}
            </span>
            <span>{count}/{target}</span>
          </div>
        )
      })}
      <span className={total}>{`${neighborhoods.length}/${wanted} neighborhoods · ${built}/${plots} plots`}</span>
    </div>
  )
}

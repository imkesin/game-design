import { css } from "~/generated/styled-system/css"

/**
 * A claim slot at the front of a Foreign Market quest row: a plain disc a player
 * drops a token into when they complete that quest. The circular sibling of
 * WorkerSlot's octagon and FruitCrateSlot's square — a distinct silhouette so a
 * claim marker never reads as a crate or worker spot. Faint stone rim + white
 * fill so a placed token reads clearly on top, and it survives a black-and-white
 * print.
 *
 * Drawn as inline SVG so it stays print-crisp and scales with `--u`.
 */

const STROKE = 0.4
const R = 5 - STROKE / 2 // rim sits on the 10u box edge

const slot = css({ display: "block", width: "10", height: "10", flexShrink: 0 })

export function ClaimSlot({ size, className }: { size?: number; className?: string }) {
  const sizeStyle = size ? { width: `calc(${size} * var(--u))`, height: `calc(${size} * var(--u))` } : undefined
  return (
    <svg
      className={className ? `${slot} ${className}` : slot}
      style={sizeStyle}
      viewBox="0 0 10 10"
      role="img"
      aria-label="claim slot"
    >
      <circle cx={5} cy={5} r={R} fill="white" stroke="var(--colors-stone-400)" strokeWidth={STROKE} />
    </svg>
  )
}

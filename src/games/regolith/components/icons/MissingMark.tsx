import type { MarkProps } from "~/games/regolith/components/icons/markProps"

/**
 * Drawn for a good with no `marks/<good>.svg` yet: a dashed box and a query.
 * Deliberately unmistakable rather than a plausible stand-in — a borrowed
 * icon that reads as the wrong thing is worse than an obvious hole, because
 * it survives playtesting unnoticed.
 */
export function MissingMark({ size = 24, color = "currentColor", opacity }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
      <rect
        x={2.5}
        y={2.5}
        width={19}
        height={19}
        rx={3}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="3 2.5"
      />
      <text
        x={12}
        y={12}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={color}
      >
        ?
      </text>
    </svg>
  )
}

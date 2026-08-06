/**
 * A short stack of pancakes, drawn rather than borrowed: Lucide has no pancake,
 * and every substitute (cookie, cake slice) already means a resource here.
 *
 * Three stacked ellipses, narrowing upward so the stack reads as a stack and
 * not as one thick disc, with a pat on top whose presence is the difference
 * between a topped pancake and a plain one — `plain` is the only pancake with
 * nothing on it, so the glyph says so.
 *
 * Takes its colour from `currentColor`, which the caller sets from the
 * pancake's own tint (see `resources.ts`).
 */
export function PancakeMark({ topped, size }: { topped: boolean; size: string }) {
  return (
    <svg
      style={{ width: size, height: size, display: "block", flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      role="img"
      aria-label={topped ? "topped pancake" : "plain pancake"}
    >
      <ellipse cx="12" cy="17.5" rx="8.5" ry="3.2" />
      <ellipse cx="12" cy="13" rx="8" ry="3" />
      <ellipse cx="12" cy="8.8" rx="7" ry="2.8" />
      {topped && <circle cx="12" cy="8.4" r="1.5" fill="currentColor" stroke="none" />}
    </svg>
  )
}

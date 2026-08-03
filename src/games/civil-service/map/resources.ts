/**
 * The goods a province produces.
 *
 * A resource belongs to a *province*, but it is authored onto one of that
 * province's hexes: the province is an outline, not a place, and a marker needs
 * somewhere definite to sit. Which hex is a purely visual choice.
 *
 * The board prints only which good it is. What that good pays is on the
 * double-sided chip that lands on the marker, hidden until it is flipped.
 */

export type Resource = "tea" | "spices" | "cotton" | "indigo"

export const RESOURCES: readonly Resource[] = ["tea", "spices", "cotton", "indigo"]

export const isResource = (value: unknown): value is Resource => RESOURCES.includes(value as Resource)

/**
 * Printed inside the marker. Set in type rather than in glyphs, so a good is
 * named outright instead of asking the table to learn four icons — and short
 * enough that the longest of them still crosses one hex.
 */
/**
 * Gold a good pays, printed on the board's payoff table.
 *
 * On the board and nowhere else: the table is a reminder of the scale, while
 * what any one chip actually pays stays on its hidden face until it is flipped.
 */
export const RESOURCE_PAYOFF: Record<Resource, number> = {
  cotton: 4,
  spices: 6,
  indigo: 10,
  tea: 18
}

export const RESOURCE_LABEL: Record<Resource, string> = {
  tea: "TEA",
  spices: "SPICES",
  cotton: "COTTON",
  indigo: "INDIGO"
}

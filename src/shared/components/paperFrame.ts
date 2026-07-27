import { cva } from "~/generated/styled-system/css"

/**
 * Paper surface + inverted dark band, tinted by a single Panda color scale:
 * `{color}.50` paper / `{color}.900` ink / `{color}.500` border for the
 * surface, background/ink inverted for the band. Shared by every card-like
 * surface that follows this recipe — Card's field/field-improvement kinds,
 * MarketStall's fruit colors, and LaborSupply's brown. Card.tsx's frame has no
 * visible border, so the borderColor is simply unused there.
 */
export const paperFrame = cva({
  variants: {
    color: {
      red: { background: "red.50", color: "red.900", borderColor: "red.500" },
      blue: { background: "blue.50", color: "blue.900", borderColor: "blue.500" },
      orange: { background: "orange.50", color: "orange.900", borderColor: "orange.500" },
      yellow: { background: "yellow.50", color: "yellow.900", borderColor: "yellow.500" },
      amber: { background: "amber.50", color: "amber.900", borderColor: "amber.500" },
      lime: { background: "lime.50", color: "lime.900", borderColor: "lime.500" },
      green: { background: "green.50", color: "green.900", borderColor: "green.500" },
      violet: { background: "violet.50", color: "violet.900", borderColor: "violet.500" },
      purple: { background: "purple.50", color: "purple.900", borderColor: "purple.500" },
      pink: { background: "pink.50", color: "pink.900", borderColor: "pink.500" },
      stone: { background: "stone.50", color: "stone.900", borderColor: "stone.500" },
      brown: { background: "brown.50", color: "brown.900", borderColor: "brown.500" },
      zinc: { background: "zinc.50", color: "zinc.900", borderColor: "zinc.500" },
      cyan: { background: "cyan.50", color: "cyan.900", borderColor: "cyan.500" },
      neutral: { background: "neutral.50", color: "neutral.900", borderColor: "neutral.500" }
    }
  }
})

/**
 * One notch darker than the paper surface (`{color}.100` vs `.50`), on the same
 * scale. For structural subregions that should read as chrome rather than
 * content — e.g. MarketStall's induces panel.
 */
export const panelTint = cva({
  variants: {
    color: {
      red: { background: "red.200" },
      blue: { background: "blue.200" },
      orange: { background: "orange.200" },
      yellow: { background: "yellow.200" },
      amber: { background: "amber.200" },
      lime: { background: "lime.200" },
      green: { background: "green.200" },
      violet: { background: "violet.200" },
      purple: { background: "purple.200" },
      pink: { background: "pink.200" },
      stone: { background: "stone.200" },
      brown: { background: "brown.200" },
      zinc: { background: "zinc.200" },
      cyan: { background: "cyan.200" },
      neutral: { background: "neutral.200" }
    }
  }
})

/**
 * A low-contrast header band: a light tint of the scale (`{color}.200`) with
 * mid-dark ink (`{color}.700`), so the header reads as quiet chrome rather than
 * the shouting inverse of `darkBand`. Used by the board's supporting supplies
 * (Foreign Markets, Labor Supply) so they don't compete with the market stalls.
 */
export const softBand = cva({
  variants: {
    color: {
      red: { background: "red.200", color: "red.700" },
      blue: { background: "blue.200", color: "blue.700" },
      orange: { background: "orange.200", color: "orange.700" },
      yellow: { background: "yellow.200", color: "yellow.700" },
      amber: { background: "amber.200", color: "amber.700" },
      lime: { background: "lime.200", color: "lime.700" },
      green: { background: "green.200", color: "green.700" },
      violet: { background: "violet.200", color: "violet.700" },
      purple: { background: "purple.200", color: "purple.700" },
      pink: { background: "pink.200", color: "pink.700" },
      stone: { background: "stone.200", color: "stone.700" },
      brown: { background: "brown.200", color: "brown.700" },
      zinc: { background: "zinc.200", color: "zinc.700" },
      cyan: { background: "cyan.200", color: "cyan.700" },
      neutral: { background: "neutral.200", color: "neutral.700" }
    }
  }
})

export const darkBand = cva({
  variants: {
    color: {
      red: { background: "red.900", color: "red.50" },
      blue: { background: "blue.900", color: "blue.50" },
      orange: { background: "orange.900", color: "orange.50" },
      yellow: { background: "yellow.900", color: "yellow.50" },
      amber: { background: "amber.900", color: "amber.50" },
      lime: { background: "lime.900", color: "lime.50" },
      green: { background: "green.900", color: "green.50" },
      violet: { background: "violet.900", color: "violet.50" },
      purple: { background: "purple.900", color: "purple.50" },
      pink: { background: "pink.900", color: "pink.50" },
      stone: { background: "stone.900", color: "stone.50" },
      brown: { background: "brown.900", color: "brown.50" },
      zinc: { background: "zinc.900", color: "zinc.50" },
      cyan: { background: "cyan.900", color: "cyan.50" },
      neutral: { background: "neutral.900", color: "neutral.50" }
    }
  }
})

/**
 * Border colours darker than the band of the same name — `softRail` sits under
 * `softBand`, `vividRail` under `vividBand`, `strongRail` under `darkBand`.
 *
 * For a rule drawn *across* a band rather than beside it, which is the case for any
 * border that runs the full edge of a card: taking the band's own colour would make
 * the border vanish wherever it crosses the band, and jumping to the scale's dark
 * end makes a near-black rule regardless of the band's weight. Stepping down keeps
 * the border a deepening of the band it crosses, so its weight reads the same on a
 * light band as on a dark one.
 *
 * `softRail` and `vividRail` are two steps down rather than one: at one step the
 * light-band rails (Guidance in particular) washed out at the card's edge.
 * `strongRail` is `{color}.950` — a half step, because `darkBand` is already at
 * `.900` and `.950` is the last rung on the scale.
 */
export const softRail = cva({
  variants: {
    color: {
      red: { borderColor: "red.400" },
      blue: { borderColor: "blue.400" },
      orange: { borderColor: "orange.400" },
      yellow: { borderColor: "yellow.400" },
      amber: { borderColor: "amber.400" },
      lime: { borderColor: "lime.400" },
      green: { borderColor: "green.400" },
      violet: { borderColor: "violet.400" },
      purple: { borderColor: "purple.400" },
      pink: { borderColor: "pink.400" },
      stone: { borderColor: "stone.400" },
      brown: { borderColor: "brown.400" },
      zinc: { borderColor: "zinc.400" },
      cyan: { borderColor: "cyan.400" },
      neutral: { borderColor: "neutral.400" }
    }
  }
})

export const vividRail = cva({
  variants: {
    color: {
      red: { borderColor: "red.600" },
      blue: { borderColor: "blue.600" },
      orange: { borderColor: "orange.600" },
      yellow: { borderColor: "yellow.600" },
      amber: { borderColor: "amber.600" },
      lime: { borderColor: "lime.600" },
      green: { borderColor: "green.600" },
      violet: { borderColor: "violet.600" },
      purple: { borderColor: "purple.600" },
      pink: { borderColor: "pink.600" },
      stone: { borderColor: "stone.600" },
      brown: { borderColor: "brown.600" },
      zinc: { borderColor: "zinc.600" },
      cyan: { borderColor: "cyan.600" },
      neutral: { borderColor: "neutral.600" }
    }
  }
})

export const strongRail = cva({
  variants: {
    color: {
      red: { borderColor: "red.950" },
      blue: { borderColor: "blue.950" },
      orange: { borderColor: "orange.950" },
      yellow: { borderColor: "yellow.950" },
      amber: { borderColor: "amber.950" },
      lime: { borderColor: "lime.950" },
      green: { borderColor: "green.950" },
      violet: { borderColor: "violet.950" },
      purple: { borderColor: "purple.950" },
      pink: { borderColor: "pink.950" },
      stone: { borderColor: "stone.950" },
      brown: { borderColor: "brown.950" },
      zinc: { borderColor: "zinc.950" },
      cyan: { borderColor: "cyan.950" },
      neutral: { borderColor: "neutral.950" }
    }
  }
})

/**
 * Ink for card art: a light-but-present tint of the scale (`{color}.300`), set as
 * `color` so an inlined SVG picks it up through `fill="currentColor"`.
 *
 * One rung for every band weight, deliberately. Art is the same element on every
 * card — a tinted mark under the name — and pegging it to the paper rather than to
 * the band keeps that relationship identical across the deck instead of making the
 * art heavier on a `strong` card than on a `soft` one.
 *
 * `.300` is the lightest rung that still reads as the card's hue at a glance while
 * staying clearly subordinate to the name. It sits between the paper (`.50`) and the
 * band on a `strong` or `vivid` card. On `soft` — Guidance alone — the band is itself
 * only `.200`, and the one rung below it (`.100`) is indistinguishable from the
 * paper, so there the art goes a step *darker* than the band rather than vanishing.
 */
export const artTint = cva({
  variants: {
    color: {
      red: { color: "red.300" },
      blue: { color: "blue.300" },
      orange: { color: "orange.300" },
      yellow: { color: "yellow.300" },
      amber: { color: "amber.300" },
      lime: { color: "lime.300" },
      green: { color: "green.300" },
      violet: { color: "violet.300" },
      purple: { color: "purple.300" },
      pink: { color: "pink.300" },
      stone: { color: "stone.300" },
      brown: { color: "brown.300" },
      zinc: { color: "zinc.300" },
      cyan: { color: "cyan.300" },
      neutral: { color: "neutral.300" }
    }
  }
})

/**
 * A bright band from the light half of the scale (`{color}.400`) with dark ink
 * (`{color}.900`). Between `softBand` and `darkBand`: for a colour whose identity
 * lives in the bright part of its scale, where the `.900` end reads as brown or
 * black instead of the hue it is named for.
 */
export const vividBand = cva({
  variants: {
    color: {
      red: { background: "red.400", color: "red.900" },
      blue: { background: "blue.400", color: "blue.900" },
      orange: { background: "orange.400", color: "orange.900" },
      yellow: { background: "yellow.400", color: "yellow.900" },
      amber: { background: "amber.400", color: "amber.900" },
      lime: { background: "lime.400", color: "lime.900" },
      green: { background: "green.400", color: "green.900" },
      violet: { background: "violet.400", color: "violet.900" },
      purple: { background: "purple.400", color: "purple.900" },
      pink: { background: "pink.400", color: "pink.900" },
      stone: { background: "stone.400", color: "stone.900" },
      brown: { background: "brown.400", color: "brown.900" },
      zinc: { background: "zinc.400", color: "zinc.900" },
      cyan: { background: "cyan.400", color: "cyan.900" },
      neutral: { background: "neutral.400", color: "neutral.900" }
    }
  }
})

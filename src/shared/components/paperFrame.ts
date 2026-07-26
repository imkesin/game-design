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
      orange: { background: "orange.50", color: "orange.900", borderColor: "orange.500" },
      yellow: { background: "yellow.50", color: "yellow.900", borderColor: "yellow.500" },
      amber: { background: "amber.50", color: "amber.900", borderColor: "amber.500" },
      lime: { background: "lime.50", color: "lime.900", borderColor: "lime.500" },
      green: { background: "green.50", color: "green.900", borderColor: "green.500" },
      violet: { background: "violet.50", color: "violet.900", borderColor: "violet.500" },
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
      orange: { background: "orange.200" },
      yellow: { background: "yellow.200" },
      amber: { background: "amber.200" },
      lime: { background: "lime.200" },
      green: { background: "green.200" },
      violet: { background: "violet.200" },
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
      orange: { background: "orange.200", color: "orange.700" },
      yellow: { background: "yellow.200", color: "yellow.700" },
      amber: { background: "amber.200", color: "amber.700" },
      lime: { background: "lime.200", color: "lime.700" },
      green: { background: "green.200", color: "green.700" },
      violet: { background: "violet.200", color: "violet.700" },
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
      orange: { background: "orange.900", color: "orange.50" },
      yellow: { background: "yellow.900", color: "yellow.50" },
      amber: { background: "amber.900", color: "amber.50" },
      lime: { background: "lime.900", color: "lime.50" },
      green: { background: "green.900", color: "green.50" },
      violet: { background: "violet.900", color: "violet.50" },
      pink: { background: "pink.900", color: "pink.50" },
      stone: { background: "stone.900", color: "stone.50" },
      brown: { background: "brown.900", color: "brown.50" },
      zinc: { background: "zinc.900", color: "zinc.50" },
      cyan: { background: "cyan.900", color: "cyan.50" },
      neutral: { background: "neutral.900", color: "neutral.50" }
    }
  }
})

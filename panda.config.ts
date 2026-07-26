import { defineConfig } from "@pandacss/dev"
import { CARD_TRIM_H_MM, CARD_TRIM_W_MM } from "./src/shared/print/cardSize"

/**
 * Card-unit token system.
 *
 * Every physical dimension is expressed as a multiple of `--u`, a CSS length
 * that equals one millimetre of real-world size. On screen `--u` is enlarged
 * (zoom); at print time it pins to `1mm` so output is dimensionally exact.
 *
 *   token "12"  ->  calc(12 * var(--u))
 *
 * Tokens are registered under both `spacing` (padding/margin/gap) and `sizes`
 * (width/height) so the same numeric scale drives every layout property.
 */
const u = (n: number) => ({ value: `calc(${n} * var(--u))` })

// Integer unit scale 0..100 covers everything from hairline padding to the
// full 94mm card height. Generated at build time; zero runtime cost.
const unitScale = Object.fromEntries(
  Array.from({ length: 101 }, (_, n) => [String(n), u(n)])
)

// Poker geometry (mm): 63x88 trim, 3mm bleed/edge -> 69x94 full bleed,
// safe zone inset 3mm inside the trim.
const cardSizes = {
  bleed: u(3),
  cardW: u(69),
  cardH: u(94),
  trimW: u(CARD_TRIM_W_MM),
  trimH: u(CARD_TRIM_H_MM),
  safeW: u(57),
  safeH: u(82)
}

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  theme: {
    extend: {
      tokens: {
        spacing: unitScale,
        sizes: { ...unitScale, ...cardSizes },
        radii: {
          card: u(3)
        },
        // Panda's built-in palette has no brown scale; add Material Design's
        // brown to match the step convention (50..900) of the other scales.
        colors: {
          brown: {
            50: { value: "#efebe9" },
            100: { value: "#d7ccc8" },
            200: { value: "#bcaaa4" },
            300: { value: "#a1887f" },
            400: { value: "#8d6e63" },
            500: { value: "#795548" },
            600: { value: "#6d4c41" },
            700: { value: "#5d4037" },
            800: { value: "#4e342e" },
            900: { value: "#3e2723" },
            // Not part of Material Design's brown; inferred by continuing the
            // scale's darkening curve to match the 900->950 drop-off seen in
            // Panda's built-in scales (e.g. stone 900 #1c1917 -> 950 #0c0a09).
            950: { value: "#1b110f" }
          }
        },
        fontSizes: {
          // Numina's action cards carry nothing but their name, so it is set at
          // display size — the largest step in the scale.
          hero: u(6),
          title: u(5),
          name: u(3.8),
          body: u(3.4),
          // One step down from `body`, for paragraph-style rules text
          // (field-improvement) rather than table/label text.
          paragraph: u(2.8),
          micro: u(2.2)
        }
      }
    }
  },

  outdir: "src/generated/styled-system"
})

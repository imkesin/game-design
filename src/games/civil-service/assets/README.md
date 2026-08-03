# Civil Service card art

Drop SVGs in here. The filename is the card's name, lowercased:

| File            | Cards it lands on                      |
| --------------- | -------------------------------------- |
| `abundance.svg` | Abundance Action + Abundance permanent |
| `ingenuity.svg` | Ingenuity Action + Ingenuity permanent |
| `devotion.svg`  | Devotion Action + Devotion permanent   |
| `guidance.svg`  | Guidance Action + Guidance permanent   |
| `impulse.svg`   | Impulse Action + Impulse permanent     |
| `disaster.svg`  | Disaster                               |

No code change needed — `cardArt.ts` globs this directory. A missing file leaves that card's art
area open, so the deck prints at any stage of illustration.

## Colour is not yours to set

The card recolours the art to its own palette: every fill becomes `currentColor`, which resolves to
`artTint` — `{scale}.300`, a light tint of that Power's colour, sitting between the paper and the
name band. Whatever colours the file ships with are discarded, so export however your tool likes and
in any colour you like.

All three ways an export can state a fill are covered — a `fill="#333"` attribute, CSS in a `style`
attribute or a `<style>` block, and naming no fill at all (which SVG defaults to black). Any export
preset works; there is no need to fiddle with Illustrator's Style Elements vs. Presentation
Attributes setting.

Consequences worth knowing:

- **Art is monochrome by design.** A two-tone or shaded illustration flattens to one tint. Carry
  detail in negative space — gaps the paper shows through — rather than in contrasting fills.
- **`fill="none"` survives.** It is left alone, so stroke-only art keeps its outlines. But strokes
  are _not_ recoloured, so a stroked shape stays whatever colour it was exported as. Prefer filled
  shapes; if you need outlines, expand them to fills first.
- **Gradients flatten.** `fill:url(#someGradient)` becomes the flat tint like any other fill.

To change the tint for every card at once, edit `artTint` in `~/shared/components/paperFrame`.

## Geometry

- **Give every file a `viewBox`.** Without one there is nothing to scale.
- **Nothing is cropped.** The mark is centred and scaled to fit whole, so any aspect ratio works —
  but a very wide or very tall file leaves a lot of empty paper on the other axis. The area it fits
  into is about 57 × 56mm, near square.
- **Don't add your own `preserveAspectRatio`.** The default (`xMidYMid meet`) is what centres and
  fits it.
- Trim the file's own padding. Empty space inside the `viewBox` shrinks the mark, since it is the
  `viewBox` — not the artwork — that gets fitted to the area.

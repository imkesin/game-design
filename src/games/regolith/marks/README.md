# Tile marks

Drop an SVG in here and it becomes that good's mark on the hex tiles — no code change needed.

## Naming

The filename is the good's id, from the `Good` union in `../domain.ts`:

```
water.svg   rock.svg   carbon.svg   metal.svg   sulfur.svg   food.svg
```

A file here **overrides** the built-in mark for that good (see `../components/resourceMarks.ts`,
which mixes Lucide icons with the hand-drawn glyphs in `../components/icons/`). Delete the file to
go back to the built-in.

## What kind of SVG works

- **Square `viewBox`.** The mark is drawn into a square box inside the hex, so a non-square source
  will look stretched.
- **Black art, or `currentColor`.** The sheets print pure black-and-white to keep prototype printing
  cheap. The file's own `fill`/`stroke` are left alone, so both solid silhouettes (game-icons.net)
  and line art (Lucide-style) work.
- **No background layer.** Download without one. A full-canvas background path in the common
  `M0 0h512v512H0z` form is stripped automatically, but anything else will paint over the tile.

## Sourcing

[game-icons.net](https://game-icons.net) is the best fit for this kind of iconography (SVG, built to
read at token size, has real coal/ore/ingot/vent marks). It's **CC BY 3.0** — attribution is
required, so note the author in `ATTRIBUTION.md` here as you add files.

Solid silhouettes use noticeably more toner than line art at this size. If that matters more than
legibility, prefer outline-style sources.

## Sizing

Marks are all drawn at the same box size, but art that bleeds to the edge of its `viewBox` (typical
for game-icons.net) reads bigger than art inset inside it (typical for Lucide). If a dropped-in mark
comes out too large or too small next to the others, say so — that's a per-mark scale factor, easy
to add.

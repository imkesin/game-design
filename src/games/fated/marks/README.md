# Marks

Drop an SVG in here and it replaces that mark on every card, with no code change.

## Naming

The filename picks the mark it replaces:

```
allure.svg   prowess.svg   passion.svg   devotion.svg   influence.svg   mystique.svg
any.svg                                  (the Any Quality mark in scene costs)
explore.svg  motivate.svg  develop.svg   (the minor-action marks)
```

A file here replaces the built-in Lucide mark; with no file, the built-in stays. A name that is none
of the above is ignored, with a console warning.

## What kind of SVG works

- **Square `viewBox`.** The mark is drawn into a square box.
- **Black art, or `currentColor`.** Black fills and strokes (`#000`, `#000000`, `black`) are turned
  into `currentColor`, so the mark takes its quality's ink like the built-in ones. Other colours are
  left alone.
- **No background layer.** A full-canvas black background path in the common `M0 0h512v512H0z` form
  is stripped; anything else will paint over the mark.
- `strokeWidth` has no effect on a dropped-in mark: the file's own strokes are used as drawn.

Art that fills its `viewBox` to the edge reads bigger than art inset inside it. If a mark comes out
too large or small beside the others, say so; that is a per-mark scale.

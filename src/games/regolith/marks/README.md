# Good marks

Drop an SVG in here and it becomes that good's mark on the silo board — no code change needed.

## Naming

The filename is the good's id, from the `Good` union in `../domain.ts` — the six goods:

```
energy.svg   rock.svg   water.svg   metal.svg   chemical.svg   food.svg
```

Plus `time.svg`, the time-token mark, which is not a good and is fetched by name.

Plus `worker.svg`, the worker mark, also fetched by name: `WorkerTile` draws it with a "+1" badge
for the Recruit yield and an up-chevron badge for the Specialist yield, so one file covers both.

A file here is the _only_ source of that good's mark — there are no built-ins (see
`../components/resourceMarks.ts`). A good with no file draws an obvious dashed placeholder, so a
missing mark shows up on the board rather than silently borrowing something that reads wrong.

## What kind of SVG works

- **Square `viewBox`.** The mark is drawn into a square box, so a non-square source will look
  stretched.
- **Black art, or `currentColor`.** The sheets print pure black-and-white to keep prototype printing
  cheap. The file's own `fill`/`stroke` are left alone, so both solid silhouettes (game-icons.net)
  and line art (Lucide-style) work.
- **No background layer.** Download without one. A full-canvas background path in the common
  `M0 0h512v512H0z` form is stripped automatically, but anything else will paint over the mark.

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

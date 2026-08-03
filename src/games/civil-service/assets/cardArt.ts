/**
 * Card art, discovered from this directory rather than imported file by file: an
 * illustration lands on its cards by being dropped in here under a lookup key —
 * an Officer suit id (`scribe.svg`, shared by all 9 cards in that suit) or a
 * Legacy card's own id (`legacy-1.svg`). Nothing to register, and a card whose
 * file does not exist yet resolves to `undefined`, which the Card renders as
 * the open art area, so the deck prints at every stage of illustration.
 *
 * `query: "?raw"` gives the SVG's source, not a URL, because the Card inlines it (see
 * components/Card). That is what lets the art take the card's own tint: an SVG loaded
 * through `<img>` is an isolated document and cannot see the page's `currentColor`.
 */
const files = import.meta.glob<string>("./*.svg", {
  eager: true,
  query: "?raw",
  import: "default"
})

/**
 * The two ways an export states a fill colour, so both can be rewritten to
 * `currentColor`: as a presentation attribute (`fill="#231f20"`) and as CSS, whether in
 * a `style` attribute or a `<style>` block — the same text substitution reaches both,
 * since a `<style>` block's rules are just more source.
 *
 * Rewriting on the way in, rather than asking the files to say `currentColor`
 * themselves, is what keeps the drop-in promise: art arrives from a design tool with
 * baked colours in whichever of these forms that tool favours, and normalising here
 * means nobody has to hand-edit it.
 *
 * `none` is excluded from both. It is structural rather than a colour choice — it marks
 * a shape that exists to be stroked, or to be a clip or mask target — so filling it
 * would turn an outline into a solid blob.
 *
 * A file that names no fill at all is not handled here but by the Card, which sets
 * `fill: currentColor` on the root `<svg>`; SVG inherits `fill`, so shapes that state
 * nothing take the card's ink and only an explicit `none` opts out. The attribute form
 * has to be rewritten rather than left to that inheritance, because a presentation
 * attribute on a shape beats a value inherited from an ancestor.
 */
const COLOURED_FILL_ATTRIBUTE = /fill="(?!none")[^"]*"/g

// `fill-rule` and `fill-opacity` are untouched: the colon has to follow `fill` directly.
const COLOURED_FILL_STYLE = /fill:\s*(?!none\b)[^;}"']+/g

/**
 * The SVG source for a lookup key (already lowercase — a suit id or card id),
 * with its fills handed over to the card's ink, or `undefined` while no file
 * exists for it.
 */
export function artFor(key: string): string | undefined {
  return files[`./${key}.svg`]
    ?.replace(COLOURED_FILL_ATTRIBUTE, "fill=\"currentColor\"")
    .replace(COLOURED_FILL_STYLE, "fill:currentColor")
}

/**
 * Spread onto a card definition to attach its art. Omits the key entirely when there
 * is no file, which `exactOptionalPropertyTypes` requires — `art: undefined` is not
 * the same as absent.
 */
export function artProps(key: string): { art?: string } {
  const art = artFor(key)
  return art === undefined ? {} : { art }
}

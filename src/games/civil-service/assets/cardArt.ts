import { DISASTER, type PowerName } from "~/games/civil-service/domain/CoreDefinitions"

/**
 * Card art, discovered from this directory rather than imported file by file: an
 * illustration lands on its cards by being dropped in here as its card's name,
 * lowercased — `abundance.svg`, `disaster.svg`. Nothing to register, and a card
 * whose file does not exist yet resolves to `undefined`, which the Card renders as
 * the open art area, so the deck prints at every stage of illustration.
 *
 * A Power's Action and its permanent share one file, because they are the same card
 * wearing one extra cue (see cards/permanentSupply).
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

/** Cards that can carry art: the five Powers, plus Disaster. */
export type ArtName = PowerName | typeof DISASTER.name

/**
 * The SVG source for a card's name with its fills handed over to the card's ink, or
 * `undefined` while no file exists for it.
 */
export function artFor(name: ArtName): string | undefined {
  return files[`./${name.toLowerCase()}.svg`]
    ?.replace(COLOURED_FILL_ATTRIBUTE, "fill=\"currentColor\"")
    .replace(COLOURED_FILL_STYLE, "fill:currentColor")
}

/**
 * Spread onto a card definition to attach its art. Omits the key entirely when there
 * is no file, which `exactOptionalPropertyTypes` requires — `art: undefined` is not
 * the same as absent.
 */
export function artProps(name: ArtName): { art?: string } {
  const art = artFor(name)
  return art === undefined ? {} : { art }
}

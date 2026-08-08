/**
 * A pinecone drawn in Lucide's idiom, because Lucide has no pinecone.
 *
 * Same contract as the marks in `resourceMarks.ts` — 24x24 box, no fill,
 * `currentColor` stroke, round caps and joins — so it drops into the same
 * watermark slot as `RESOURCE_MARKS` and scales with the same `size` /
 * `strokeWidth` props. It is a stand-in on the same terms as the rest: swapped
 * out when the deck has real illustration.
 *
 * Six rows of scales and no outline. An outlined body with chevrons inside was
 * the first attempt and it reads as a map pin — the silhouette of a pinecone is
 * the scales, so drawing the border and filling it in gets the shape exactly
 * backwards. Rows narrow top and bottom to carry the taper on their own.
 *
 * Row pitch is shorter than scallop depth so consecutive rows overlap. Spaced
 * apart they read as stacked waves at watermark size, which is the size this
 * mark is mostly seen at; overlapped they read as scales at every size down to
 * about 26px, and the blank is also the card most often glimpsed at a corner in
 * a fanned hand.
 */
export function PineconeMark({
  size = 24,
  strokeWidth = 2,
  className
}: {
  size?: number | string
  strokeWidth?: number
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5.6V3" />
      <path d="M9.4 5.9q1.3 3 2.6 0 1.3 3 2.6 0" />
      <path d="M7 8.9q1.67 3.2 3.33 0 1.67 3.2 3.33 0 1.67 3.2 3.33 0" />
      <path d="M6.3 12q1.9 3.2 3.8 0 1.9 3.2 3.8 0 1.9 3.2 3.8 0" />
      <path d="M7.4 15.1q1.53 3 3.07 0 1.53 3 3.07 0 1.53 3 3.07 0" />
      <path d="M9.4 18.2q1.3 2.8 2.6 0 1.3 2.8 2.6 0" />
      <path d="M10.8 21q1.2 2.2 2.4 0" />
    </svg>
  )
}

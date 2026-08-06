import { Bird, Cat, Dog, type LucideIcon, Mountain, PawPrint, Squirrel, TreePine } from "lucide-react"
import type { AnimalCard as AnimalCardData, AnimalSpeciesId, OrderedPancake } from "~/games/meeple-syrup/cards/domain"
import { PANCAKE_BY_ID, RESOURCE_BY_ID } from "~/games/meeple-syrup/cards/resources"
import { Amounts } from "~/games/meeple-syrup/components/Amounts"
import { PancakeMark } from "~/games/meeple-syrup/components/PancakeMark"
import { RESOURCE_MARKS } from "~/games/meeple-syrup/components/resourceMarks"
import { css, cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"
import { artTint, darkBand, paperFrame, paperShade, strongRail } from "~/shared/components/paperFrame"
import type { CardVariant } from "./ResourceCard"

/**
 * An animal card: hire cost, converter, order — the three things an animal is
 * (see `AnimalCard` in the domain), each in its own band so they can be read
 * independently and in any order.
 *
 *     ┌────────────────────────────┐
 *     │  MOOSE              flour  │   species, and which of its seven
 *     ├────────────────────────────┤
 *     │  HIRE   2🍪 + 6🌾          │   what it costs to get
 *     ├────────────────────────────┤
 *     │           art              │
 *     ├────────────────────────────┤
 *     │  CONVERTS  3🍪 → 4🌾       │   what it does forever after
 *     ├────────────────────────────┤
 *     │  ORDER  🥞 Plain           │   what it wants served
 *     └────────────────────────────┘
 *
 * Hire sits directly under the name and above the art, where a cost belongs on
 * a card you are deciding whether to buy; the converter and the order sit below
 * it, because those only matter once you own it. The art takes whatever height
 * the four bands leave.
 *
 * The header carries the output resource alongside the species name, which is
 * redundant with the exchange band and earns it anyway: eight cards share a
 * name and only the output tells them apart, and the header is all that shows
 * when the deck is fanned or stacked.
 *
 * That band is labelled MULTIPLIES rather than CONVERTS on the one card per
 * species whose output is its own input. The amounts already say it — the same
 * mark on both sides, and more of it coming out than went in — but this is the
 * only card in the deck that is a source rather than a sink, and it should not
 * take a second look to notice.
 *
 * The order prints no score value, though scores now differ. It is left implied
 * because the order already says it: three of one topping is the big order and
 * two pancakes is the small one, and the count is a better tell than a numeral
 * would be. The order band is shaded paper rather than a second dark band so the
 * pancake marks can keep their own tints, which are the topping colours the
 * order will cost (see `resources.ts`).
 *
 * Variants are the shared pair — see `ResourceCard`.
 */

/**
 * Species marks, standing in until the deck has real illustration. Lucide names
 * five of these seven; Moose and Bighorn take their habitat instead of a sixth
 * and seventh paw print, which is the more useful placeholder — a card you can
 * tell apart at a glance beats a card that is literal.
 */
const SPECIES_MARKS: Record<AnimalSpeciesId, LucideIcon> = {
  moose: TreePine,
  bear: PawPrint,
  bighorn: Mountain,
  loon: Bird,
  lynx: Cat,
  fox: Dog,
  beaver: Squirrel
}

const frame = css({
  position: "relative",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "var(--gutter) 1fr var(--gutter)",
  // name · hire · art (all the slack) · converts · order
  gridTemplateRows: "auto auto 1fr auto auto",
  overflow: "hidden"
})

const bleedFrame = css({
  width: "cardW",
  height: "cardH",
  "--gutter": "calc(6 * var(--u))"
})

const trimFrame = css({
  width: "trimW",
  height: "trimH",
  "--gutter": "calc(3 * var(--u))"
})

const accentOutline = css({
  outlineWidth: "0.2mm",
  outlineStyle: "solid"
})

const header = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  paddingTop: "var(--gutter)",
  paddingBottom: "3"
})

const headerContent = css({
  gridColumn: "2",
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "2",
  minWidth: 0
})

const nameText = css({
  fontSize: "title",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  lineHeight: 1.05,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
})

// Mirrors the resource card's category chip: same size, same weight, same
// corner, so both decks index the same way when spread on a table.
const outputText = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  opacity: 0.75,
  whiteSpace: "nowrap"
})

/**
 * The three data bands below the name share one shape: a small caps label in a
 * fixed column, the content beside it. The fixed label column is what makes
 * HIRE, CONVERTS and ORDER line up down the card, so the eye can drop straight
 * to the row it wants.
 */
const band = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "center",
  borderBlockStartWidth: "0.3mm",
  borderBlockStartStyle: "solid",
  paddingBlock: "2"
})

const bandContent = css({
  gridColumn: "2",
  minWidth: 0,
  display: "grid",
  // Wide enough for MULTIPLIES, the longest of the four labels. Sized to the
  // label rather than to the content so a rate that retunes into a longer word
  // doesn't silently collide with the amounts beside it.
  gridTemplateColumns: "calc(16 * var(--u)) 1fr",
  alignItems: "center",
  columnGap: "2",
  rowGap: "1"
})

const bandLabel = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  opacity: 0.6,
  lineHeight: 1
})

// The gap has to beat the gap *inside* an amount or a chip, or a two-pancake
// order reads as one four-part run: "1 PLAIN 1 BANANA".
const bandBody = css({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  columnGap: "3",
  rowGap: "1"
})

// The last band bleeds to the bottom edge, so its padding mirrors the header's.
const lastBand = css({
  paddingBottom: "var(--gutter)"
})

const artRegion = css({
  gridColumn: "1 / -1",
  position: "relative",
  minHeight: 0,
  overflow: "hidden"
})

const artIcon = css({
  position: "absolute",
  inset: "var(--gutter)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})

/**
 * The output resource's own mark, dropped into the corner of the art.
 *
 * The species mark is the same on all seven of a species' cards, so on its own
 * the largest region of the card carries none of what distinguishes this one —
 * seven Mooses laid on a table are seven identical pines. The badge is the fix:
 * the pair (pale species mark, saturated output mark) is unique across all 49
 * and readable at the distance a tableau is actually looked at.
 *
 * It sits at the output's `.600` rather than the art's `.300` because it is
 * doing the opposite job to the species mark behind it — that one is texture,
 * this one is information.
 */
const outputBadge = css({
  position: "absolute",
  right: "var(--gutter)",
  bottom: "var(--gutter)",
  display: "flex"
})

const arrow = css({
  fontSize: "body",
  fontWeight: 700,
  opacity: 0.55,
  lineHeight: 1
})

const pancakeChip = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5"
})

const pancakeCount = css({
  fontSize: "body",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1
})

const pancakeName = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  lineHeight: 1,
  whiteSpace: "nowrap"
})

/** Big enough to name the resource across a table, small enough to stay a badge. */
const OUTPUT_BADGE = "calc(9 * var(--u))"

const PANCAKE_MARK = "calc(5.5 * var(--u))"

// Repeats collapse into a count: "2 Plain", not two identical marks. A count of
// one goes unwritten — every order names two pancakes, so on a split order the
// two "1"s would be noise in front of the only thing worth reading.
function tally(pancakes: readonly OrderedPancake[]): ReadonlyArray<readonly [OrderedPancake, number]> {
  const counts = new Map<OrderedPancake, number>()
  for (const id of pancakes) counts.set(id, (counts.get(id) ?? 0) + 1)
  return [...counts]
}

// The wildcard takes purple, which no pancake and no resource claims, so it
// cannot be mistaken for one particular variant being asked for.
const WILDCARD = { name: "Any Topping", color: "purple", topped: true } as const

function PancakeChip({ pancake, count }: { pancake: OrderedPancake; count: number }) {
  const { name, color, topped } = pancake === "topped"
    ? WILDCARD
    : { ...PANCAKE_BY_ID[pancake], topped: PANCAKE_BY_ID[pancake].topping !== undefined }
  return (
    <span className={pancakeChip} style={{ color: `var(--colors-${color}-700)` }}>
      {count > 1 && <span className={pancakeCount}>{count}</span>}
      <PancakeMark topped={topped} size={PANCAKE_MARK} />
      <span className={pancakeName}>{name}</span>
    </span>
  )
}

export function AnimalCard({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: AnimalCardData
  variant?: CardVariant
  showGuides?: boolean
}) {
  const { color } = card
  const output = RESOURCE_BY_ID[card.output]
  const Mark = SPECIES_MARKS[card.species]
  const OutputMark = RESOURCE_MARKS[card.output]
  const rail = strongRail({ color })

  return (
    <div
      className={cx(
        frame,
        paperFrame({ color }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline,
        variant === "trim" && rail
      )}
    >
      <div className={cx(header, darkBand({ color }))}>
        <div className={headerContent}>
          <span className={nameText}>{card.name}</span>
          <span className={outputText}>{RESOURCE_BY_ID[card.output].name}</span>
        </div>
      </div>

      <div className={cx(band, paperShade({ color }), rail)}>
        <div className={bandContent}>
          <span className={bandLabel}>Hire</span>
          <span className={bandBody}>
            <Amounts amounts={card.hire} />
          </span>
        </div>
      </div>

      <div className={artRegion}>
        <div className={cx(artIcon, artTint({ color }))}>
          <Mark size="60%" strokeWidth={1.4} />
        </div>
        <div
          className={outputBadge}
          style={{ color: `var(--colors-${output.color}-600)` }}
        >
          <OutputMark size={OUTPUT_BADGE} strokeWidth={1.6} />
        </div>
      </div>

      <div className={cx(band, rail)}>
        <div className={bandContent}>
          <span className={bandLabel}>{card.output === card.input ? "Multiplies" : "Converts"}</span>
          <span className={bandBody}>
            <Amounts amounts={[{ count: card.rate.spend, resource: card.input }]} />
            <span className={arrow}>→</span>
            <Amounts amounts={[{ count: card.rate.receive, resource: card.output }]} />
          </span>
        </div>
      </div>

      <div className={cx(band, lastBand, paperShade({ color }), rail)}>
        <div className={bandContent}>
          <span className={bandLabel}>Order</span>
          <span className={bandBody}>
            {tally(card.order.pancakes).map(([pancake, count]) => (
              <PancakeChip key={pancake} pancake={pancake} count={count} />
            ))}
            {card.order.syrup > 0 && <Amounts amounts={[{ count: card.order.syrup, resource: "maple-syrup" }]} />}
          </span>
        </div>
      </div>

      {showGuides && variant === "bleed" && <Guides />}
    </div>
  )
}

import {
  ArrowLeftRight,
  Backpack,
  Bird,
  Cat,
  Dog,
  type LucideIcon,
  Mountain,
  PawPrint,
  Squirrel,
  TreePine
} from "lucide-react"
import type { AnimalDeckCard, AnimalSpeciesId, OrderedPancake, PassiveId } from "~/games/meeple-syrup/cards/domain"
import { PANCAKE_BY_ID, PASSIVE_BY_ID, RESOURCE_BY_ID } from "~/games/meeple-syrup/cards/resources"
import { AMOUNT_MARK, Amounts } from "~/games/meeple-syrup/components/Amounts"
import {
  accentOutline,
  bleedFrame,
  cardFrame,
  type CardVariant,
  categoryText,
  dataBand,
  fiveBandRows,
  footerBand,
  headerBand,
  headerContent,
  trimFrame
} from "~/games/meeple-syrup/components/cardFrame"
import { PancakeMark } from "~/games/meeple-syrup/components/PancakeMark"
import { RESOURCE_MARKS } from "~/games/meeple-syrup/components/resourceMarks"
import { css, cx } from "~/generated/styled-system/css"
import { Guides } from "~/shared/components/Guides"
import { artTint, darkBand, paperFrame, paperShade, strongRail } from "~/shared/components/paperFrame"

/**
 * An animal card: hire cost, what it does, order — the three things an animal
 * is (see `AnimalCard` in the domain), each in its own band so they can be read
 * independently and in any order.
 *
 *     ┌────────────────────────────┐
 *     │  MOOSE              flour  │   species, and which of its ten
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
 * a card you are deciding whether to buy; what it does and the order sit below
 * it, because those only matter once you own it. The art takes whatever height
 * the four bands leave.
 *
 * The header carries the output resource alongside the species name, which is
 * redundant with the exchange band and earns it anyway: ten cards share a name
 * and only that chip tells them apart, and the header is all that shows when
 * the deck is fanned or stacked.
 *
 * That band is labelled MULTIPLIES rather than CONVERTS on the one card per
 * species whose output is its own input. The amounts already say it — the same
 * mark on both sides, and more of it coming out than went in — but this is the
 * only card in the deck that is a source rather than a sink, and it should not
 * take a second look to notice.
 *
 * Layabouts (`LayaboutCard`) reuse every band but that one. They have no
 * converter, so the middle band reads ALWAYS and prints a standing `+1`, and
 * the header chip and the art badge carry the bonus where a converter carries
 * its output. Nothing else moves: the hire and the order are the species', and
 * printing them in the same places on the same frame is what says so.
 *
 * The order prints no score value, though scores now differ. It is left implied
 * because the order already says it: three of one topping is the big order and
 * two pancakes is the small one, and the count is a better tell than a numeral
 * would be. The order band is shaded paper rather than a second dark band so the
 * pancake marks can keep their own tints, which are the topping colours the
 * order will cost (see `resources.ts`).
 *
 * The frame, the band heights and the two variants are the game's shared ones —
 * see `cardFrame`, which is also where the arithmetic lives for why this card's
 * art region and a resource card's numeral region are related rather than equal.
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

/** What a layabout puts in the art badge, where a converter puts its output. */
const PASSIVE_MARKS: Record<PassiveId, LucideIcon> = {
  forage: Backpack,
  trade: ArrowLeftRight
}

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

/**
 * The three data bands below the name share one shape beyond the height every
 * band in the game has (`dataBand`): a small caps label in a fixed column, the
 * content beside it. The fixed label column is what makes HIRE, CONVERTS and
 * ORDER line up down the card, so the eye can drop straight to the row it wants.
 */
const bandContent = css({
  gridColumn: "2",
  minWidth: 0,
  display: "grid",
  // Wide enough for MULTIPLIES, the longest of the five labels. Sized to the
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
 * The output resource's own mark — or, on a layabout, its bonus's — dropped
 * into the corner of the art.
 *
 * The species mark is the same on all ten of a species' cards, so on its own
 * the largest region of the card carries none of what distinguishes this one —
 * ten Mooses laid on a table are ten identical pines. The badge is the fix: the
 * pair (pale species mark, saturated output mark) is unique across all 70 and
 * readable at the distance a tableau is actually looked at.
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

/**
 * The count-mark-name run, shared by the order band's pancakes and the layabout
 * band's `+1`. Both are the same thing typographically — a small tally in front
 * of a tinted glyph and its name — so they share the styles and line up.
 */
const chip = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5"
})

const chipCount = css({
  fontSize: "body",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1
})

const chipName = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  lineHeight: 1,
  whiteSpace: "nowrap"
})

/** Big enough to name the resource across a table, small enough to stay a badge. */
const OUTPUT_BADGE = "calc(9 * var(--u))"

/**
 * The order band's glyph. Larger than `AMOUNT_MARK` because a pancake is a
 * filled shape rather than a line drawing and reads smaller at the same size,
 * and because nothing shares this band with an amount — the order is pancakes
 * on all 70 cards.
 *
 * The rule band gets no constant of its own: whatever is in it, converter
 * amounts or a layabout's `+1`, sizes at `AMOUNT_MARK`, because the two
 * alternate in one slot from card to card and have to land at the same height.
 */
const ORDER_MARK = "calc(5.5 * var(--u))"

// Repeats collapse into a count: "2 Plain", not two identical marks. A count of
// one goes unwritten — every order names two pancakes, so on a split order the
// two "1"s would be noise in front of the only thing worth reading.
function tally(pancakes: readonly OrderedPancake[]): ReadonlyArray<readonly [OrderedPancake, number]> {
  const counts = new Map<OrderedPancake, number>()
  for (const id of pancakes) counts.set(id, (counts.get(id) ?? 0) + 1)
  return [...counts]
}

/**
 * The wildcard takes purple, which no pancake and no resource claims, so it
 * cannot be mistaken for one particular variant being asked for.
 *
 * TOPPED rather than ANY TOPPING, and the reason is Beaver. Its order is the
 * only one in the deck that names two *different* pancakes, so it is the only
 * band that has to seat two full chips — and ANY TOPPING was the widest chip
 * printed, which put the tightest band in the deck on the one card that could
 * least afford it.
 *
 * The short word is the better one anyway. Beaver asks for one plain and one
 * topped, and PLAIN / TOPPED is an opposition the eye completes on its own,
 * where PLAIN / ANY TOPPING reads as two unrelated requests. It is also the
 * name the rules already use: `"topped"` is the literal in `OrderedPancake`.
 */
const WILDCARD = { name: "Topped", color: "purple", topped: true } as const

function PancakeChip({ pancake, count }: { pancake: OrderedPancake; count: number }) {
  const { name, color, topped } = pancake === "topped"
    ? WILDCARD
    : { ...PANCAKE_BY_ID[pancake], topped: PANCAKE_BY_ID[pancake].topping !== undefined }
  return (
    <span className={chip} style={{ color: `var(--colors-${color}-700)` }}>
      {count > 1 && <span className={chipCount}>{count}</span>}
      <PancakeMark topped={topped} size={ORDER_MARK} />
      <span className={chipName}>{name}</span>
    </span>
  )
}

/**
 * The layabout's whole rule: `+1 FORAGE` or `+1 TRADE`.
 *
 * The `+1` is spelled out rather than left implied by the word, because these
 * stack and a player holding three of them needs the card to read as an
 * addend. It also keeps the band the same shape as a converter's `3🍪 → 4🌾` —
 * a number, a mark, and what it is.
 */
function PassiveChip({ passive }: { passive: PassiveId }) {
  const { action, color } = PASSIVE_BY_ID[passive]
  const Mark = PASSIVE_MARKS[passive]
  return (
    <span className={chip} style={{ color: `var(--colors-${color}-700)` }}>
      <span className={chipCount}>+1</span>
      <Mark size={AMOUNT_MARK} strokeWidth={2} />
      <span className={chipName}>{action}</span>
    </span>
  )
}

export function AnimalCard({
  card,
  variant = "bleed",
  showGuides = false
}: {
  card: AnimalDeckCard
  variant?: CardVariant
  showGuides?: boolean
}) {
  const { color } = card
  const Mark = SPECIES_MARKS[card.species]
  const rail = strongRail({ color })

  // The header chip and the art badge answer the same question — which of this
  // species' ten is this — so they are picked together rather than branched
  // twice further down.
  const { chipText, badgeColor, BadgeMark } = card.kind === "animal"
    ? {
      chipText: RESOURCE_BY_ID[card.output].name,
      badgeColor: RESOURCE_BY_ID[card.output].color,
      BadgeMark: RESOURCE_MARKS[card.output]
    }
    : {
      chipText: PASSIVE_BY_ID[card.passive].name,
      badgeColor: PASSIVE_BY_ID[card.passive].color,
      BadgeMark: PASSIVE_MARKS[card.passive]
    }

  return (
    <div
      className={cx(
        cardFrame,
        fiveBandRows,
        paperFrame({ color }),
        variant === "bleed" ? bleedFrame : trimFrame,
        variant === "trim" && accentOutline,
        variant === "trim" && rail
      )}
    >
      <div className={cx(headerBand, darkBand({ color }))}>
        <div className={headerContent}>
          <span className={nameText}>{card.name}</span>
          <span className={categoryText}>{chipText}</span>
        </div>
      </div>

      <div className={cx(dataBand, paperShade({ color }), rail)}>
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
          style={{ color: `var(--colors-${badgeColor}-600)` }}
        >
          <BadgeMark size={OUTPUT_BADGE} strokeWidth={1.6} />
        </div>
      </div>

      <div className={cx(dataBand, rail)}>
        <div className={bandContent}>
          {card.kind === "animal"
            ? (
              <>
                <span className={bandLabel}>{card.output === card.input ? "Multiplies" : "Converts"}</span>
                <span className={bandBody}>
                  <Amounts amounts={[{ count: card.rate.spend, resource: card.input }]} />
                  <span className={arrow}>→</span>
                  <Amounts amounts={[{ count: card.rate.receive, resource: card.output }]} />
                </span>
              </>
            )
            : (
              <>
                <span className={bandLabel}>Always</span>
                <span className={bandBody}>
                  <PassiveChip passive={card.passive} />
                </span>
              </>
            )}
        </div>
      </div>

      <div className={cx(dataBand, footerBand, paperShade({ color }), rail)}>
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

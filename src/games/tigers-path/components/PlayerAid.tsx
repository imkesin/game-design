import { AnimalDot } from "~/games/tigers-path/components/AnimalDot"
import { ClearingSlotIcon } from "~/games/tigers-path/components/ClearingSlotIcon"
import { ANIMALS, SLOT_LEVELS } from "~/games/tigers-path/domain"
import { css, cx } from "~/generated/styled-system/css"
import { darkBand, paperFrame, softBand } from "~/shared/components/paperFrame"

/**
 * The whole rulebook, one sheet — v0 has no scoring, so the aid IS the rules.
 * The five actions are the thing consulted every turn, so they get the sheet:
 * a 2×3 grid of full cards, each a numbered ACTION with its name at display
 * size and the rule underneath. The sixth cell is the reference corner — the
 * lookups (hierarchy, slot levels, setup) that a turn rarely needs but a game
 * needs somewhere.
 */

const aid = css({
  display: "grid",
  gridTemplateRows: "auto auto 1fr",
  rowGap: "0.14in",
  width: "100%",
  height: "100%"
})

const header = css({
  paddingInline: "3",
  paddingBlock: "1.5",
  borderRadius: "3mm"
})

const title = css({
  fontSize: "name",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  lineHeight: 1
})

const turnBar = css({
  paddingInline: "3",
  paddingBlock: "2",
  borderRadius: "3mm",
  fontSize: "body",
  fontWeight: 600,
  lineHeight: 1.3
})

const grid = css({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridTemplateRows: "repeat(3, 1fr)",
  // Column-major so the left column is the three track-advancing actions and
  // the right column is the two recruits — the grouping is the layout.
  gridAutoFlow: "column",
  gap: "0.16in",
  minHeight: 0
})

const cell = css({
  display: "grid",
  gridTemplateRows: "auto 1fr",
  borderWidth: "0.5mm",
  borderStyle: "solid",
  borderRadius: "3mm",
  overflow: "hidden"
})

const cellHead = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  columnGap: "2.5",
  alignItems: "center",
  paddingInline: "3",
  paddingBlock: "2"
})

const badge = css({
  display: "grid",
  placeItems: "center",
  width: "0.36in",
  height: "0.36in",
  borderRadius: "999px",
  fontSize: "name",
  fontWeight: 800,
  lineHeight: 1
})

/** The Scoring header carries no badge, so it would sit shorter than the action
 * headers whose height the 0.36in badge sets. Reserve that same height here so
 * the tile's band lines up with the rest of the grid. */
const scoringHead = css({
  minHeight: "calc(0.36in + 4 * var(--u))"
})

/** The group cue: the same glyph on every card in a group (an up-arrow for the
 * track-advancers, a plus for the recruits), so the pairing reads without text. */
const groupGlyph = css({
  width: "0.28in",
  height: "0.28in",
  opacity: 0.85
})

const kicker = css({
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  opacity: 0.72,
  lineHeight: 1
})

const actionName = css({
  fontSize: "title",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.01em",
  lineHeight: 1.02
})

const cellBody = css({
  padding: "3",
  display: "grid",
  alignContent: "start",
  rowGap: "1.5",
  fontSize: "body",
  lineHeight: 1.32
})

/** A scan-friendly point: a small muted bullet, hanging only its own width so
 * wrapped lines align without a heavy indent. */
const bullet = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  columnGap: "1.5",
  alignItems: "baseline"
})

const bulletMark = css({
  fontSize: "micro",
  color: "stone.400",
  transform: "translateY(-0.02in)"
})

/** A card whose body shares space with a right-wall sidebar (Contest only). */
const bodyWithSidebar = css({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  minHeight: 0
})

/** The hierarchy ladder, mounted on the right wall of Contest. Order is
 * top-to-bottom, so the ">" between ranks is implied by the descent. */
const sidebar = css({
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  rowGap: "2",
  paddingInline: "2.5",
  paddingBlock: "1.5"
})

const sidebarRank = css({
  display: "grid",
  justifyItems: "center",
  rowGap: "0.5",
  fontSize: "micro",
  fontWeight: 700,
  lineHeight: 1
})

/** Scoring's bullets: sized like the action cards' body so the tile doesn't read
 * as a lesser footnote, but tinted a lighter grey to stay a step subordinate. */
const scoringBody = css({
  padding: "3",
  display: "grid",
  alignContent: "start",
  rowGap: "1.5",
  fontSize: "body",
  lineHeight: 1.3,
  color: "stone.500"
})

type ActionGroup = "advance" | "gain"

/** Each group's colour and glyph — shared by every card in the group so the two
 * families (advance a track / gain cubes) read at a glance, without a label. */
const GROUPS = {
  advance: { color: "orange", Glyph: AdvanceGlyph },
  gain: { color: "green", Glyph: GainGlyph }
} as const

const ACTIONS: readonly { name: string; group: ActionGroup; points: readonly string[] }[] = [
  {
    name: "Claim a Path",
    group: "advance",
    points: [
      "Pick an empty path of length N.",
      "Use N animals of one type from your sanctuary to fill it all at once.",
      "Advance that animal's track 1 step."
    ]
  },
  {
    name: "Claim a Clearing",
    group: "advance",
    points: [
      "Pick a clearing next to a path already claimed by animals of type T.",
      "Pay type T all at once for an empty slot your Boar number has unlocked; the printed number is its cost.",
      "Those cubes return to the Jungle bag — then place one disc of type T's color in the slot.",
      "Advance T's track 1 step."
    ]
  },
  {
    name: "Contest a Path",
    group: "advance",
    points: [
      "Target an undefended full path of length N.",
      "Use N+1 animals of a strictly higher-ranked type T to take over the path — the N losing animals and the +1 premium all go to the Jungle bag.",
      "Your N animals occupy the claimed path, and you advance T's track 1 step.",
      "Tigers are never contested; snakes never contest."
    ]
  },
  {
    name: "Recruit — Jungle",
    group: "gain",
    points: [
      "Draw your Snake number of animals from the Jungle bag.",
      "Keep 1 type of the animals drawn; the rest go to the Grasslands zone."
    ]
  },
  {
    name: "Recruit — Grasslands",
    group: "gain",
    points: [
      "Take up to your Monkey number of animals, all of a single type.",
      "Move them from the Grasslands zone into your sanctuary."
    ]
  }
]

const SCORING: readonly React.ReactNode[] = [
  <>
    <strong>End:</strong> The instant any track reaches its final step.
  </>,
  <>
    <strong>One animal:</strong>{" "}
    The player who ends the game locks their top animal; the rest are drafted by highest track position (ties → more in
    sanctuary).
  </>,
  <>
    <strong>Network:</strong> An animal's connected clearings.
  </>,
  <>
    <strong>Score</strong> = Network size × Elephant number.
  </>
]

function AdvanceGlyph() {
  return (
    <svg className={groupGlyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
      <path d="M12 20 V6" strokeLinecap="round" />
      <path d="M6 11 L12 5 L18 11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GainGlyph() {
  return (
    <svg className={groupGlyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
      <path d="M12 5 V19 M5 12 H19" strokeLinecap="round" />
    </svg>
  )
}

function Points({ points }: { points: readonly string[] }) {
  return (
    <div className={cellBody}>
      {points.map((point) => (
        <span key={point} className={bullet}>
          <span className={bulletMark}>●</span>
          <span>{point}</span>
        </span>
      ))}
    </div>
  )
}

function ActionCell(
  { label, name, group, points, sidebar: side }: {
    label: string
    name: string
    group: ActionGroup
    points: readonly string[]
    sidebar?: React.ReactNode
  }
) {
  const { color, Glyph } = GROUPS[group]
  return (
    <div className={cx(cell, paperFrame({ color: "stone" }))}>
      <div className={cx(cellHead, darkBand({ color }))}>
        <span
          className={badge}
          style={{ background: `var(--colors-${color}-400)`, color: `var(--colors-${color}-950)` }}
        >
          {label}
        </span>
        <div>
          <div className={kicker}>Action</div>
          <div className={actionName}>{name}</div>
        </div>
        <Glyph />
      </div>
      {side ?
        (
          <div className={bodyWithSidebar}>
            <Points points={points} />
            {side}
          </div>
        ) :
        <Points points={points} />}
    </div>
  )
}

function HierarchyLadder() {
  return (
    <div className={cx(sidebar, softBand({ color: "stone" }))}>
      {ANIMALS.map((animal) => (
        <span key={animal.id} className={sidebarRank}>
          <AnimalDot animal={animal} size={0.24} />
          <span>{animal.name}</span>
        </span>
      ))}
    </div>
  )
}

function SlotsLadder() {
  return (
    <div className={cx(sidebar, softBand({ color: "stone" }))}>
      {SLOT_LEVELS.map((slot) => (
        <span key={slot.level} className={sidebarRank}>
          <ClearingSlotIcon shape={slot.shape} size={7} />
          <span>Boar {slot.boarThreshold}+</span>
        </span>
      ))}
    </div>
  )
}

export function PlayerAid() {
  return (
    <div className={aid}>
      <div className={cx(header, darkBand({ color: "stone" }))}>
        <span className={title}>Tiger's Path</span>
      </div>

      <div className={cx(turnBar, softBand({ color: "stone" }))}>
        Each turn, take actions equal to your <strong>Tiger number</strong> (starts at 2). Repeats allowed.
      </div>

      <div className={grid}>
        {ACTIONS.map((action, i) => (
          <ActionCell
            key={action.name}
            label={String.fromCharCode(65 + i)}
            name={action.name}
            group={action.group}
            points={action.points}
            sidebar={action.name === "Contest a Path" ?
              <HierarchyLadder /> :
              action.name === "Claim a Clearing" ?
              <SlotsLadder /> :
              undefined}
          />
        ))}

        <div className={cx(cell, paperFrame({ color: "stone" }))}>
          <div className={cx(cellHead, scoringHead, softBand({ color: "stone" }))}>
            <div>
              <div className={kicker}>End Game</div>
              <div className={actionName}>Scoring</div>
            </div>
          </div>
          <div className={scoringBody}>
            {SCORING.map((point, i) => (
              <span key={i} className={bullet}>
                <span className={bulletMark}>●</span>
                <span>{point}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

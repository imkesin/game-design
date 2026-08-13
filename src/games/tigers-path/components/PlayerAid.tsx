import { Fragment } from "react"
import { AnimalDot } from "~/games/tigers-path/components/AnimalDot"
import { ANIMAL_BY_ID, ANIMALS } from "~/games/tigers-path/domain"
import { css, cx } from "~/generated/styled-system/css"
import { darkBand, paperFrame } from "~/shared/components/paperFrame"

/**
 * The whole rulebook, one sheet — v0 has no scoring, so the aid IS the rules.
 * Three zones: the six actions (the thing consulted every turn, so it gets the
 * top and the most space), then the two lookup strips (hierarchy, ladder),
 * then clearing law and setup as prose footnotes.
 */

const aid = css({
  display: "grid",
  alignContent: "start",
  rowGap: "0.16in",
  width: "100%",
  height: "100%"
})

const title = css({
  fontSize: "title",
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase"
})

const subtitle = css({
  fontSize: "body",
  fontWeight: 600,
  color: "stone.600"
})

const section = css({
  borderWidth: "0.4mm",
  borderStyle: "solid",
  borderRadius: "3mm",
  overflow: "hidden"
})

const sectionHead = css({
  paddingInline: "3",
  paddingBlock: "1",
  fontSize: "body",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase"
})

const sectionBody = css({
  paddingInline: "3",
  paddingBlock: "2",
  display: "grid",
  rowGap: "1.5"
})

const actionRow = css({
  display: "grid",
  gridTemplateColumns: "0.32in 1.15in 1fr",
  columnGap: "2",
  alignItems: "baseline",
  fontSize: "body",
  lineHeight: 1.35
})

const actionKey = css({
  fontWeight: 800,
  fontSize: "name"
})

const actionName = css({
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em"
})

const strip = css({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  columnGap: "1.5",
  rowGap: "1",
  fontSize: "body",
  fontWeight: 700
})

const prose = css({
  fontSize: "body",
  lineHeight: 1.4
})

const ACTIONS: readonly { key: string; name: string; text: string }[] = [
  {
    key: "A",
    name: "Place",
    text: "Put 1 animal from your supply onto any empty route space."
  },
  {
    key: "B",
    name: "Move",
    text:
      "Move up to your Elephant number of animals of one type to empty spaces, anywhere. Only animals on incomplete routes may move — a full route is locked."
  },
  {
    key: "C",
    name: "Displace",
    text:
      "Put a higher-ranked animal from your supply onto an occupied space. You choose where the occupant relocates: any route with an empty space. Every opponent draws 1 from the bag."
  },
  {
    key: "D",
    name: "Claim",
    text:
      "A route full of one type: clear it (1 cube to general supply, the rest to the bag), pay extra animals of that type from your supply into a clearing at either end (see ladder), and advance that animal's track 1 step."
  },
  {
    key: "E",
    name: "Bag pull",
    text: "Draw your Snake number from the bag: 1 to the general supply, the rest to your supply."
  },
  {
    key: "F",
    name: "Take",
    text: "Take your Monkey number of animals from the general supply."
  }
]

/** The first six rungs of the entry ladder, then a trailing ellipsis. */
const LADDER: readonly { count: number; animal: (typeof ANIMALS)[number] }[] = [
  ...[...ANIMALS].reverse().map((animal) => ({ count: 1, animal })),
  { count: 2, animal: ANIMAL_BY_ID.snake },
  { count: 2, animal: ANIMAL_BY_ID.boar }
]

function Section({ head, children }: { head: string; children: React.ReactNode }) {
  return (
    <div className={cx(section, paperFrame({ color: "stone" }))}>
      <div className={cx(sectionHead, darkBand({ color: "stone" }))}>{head}</div>
      <div className={sectionBody}>{children}</div>
    </div>
  )
}

export function PlayerAid() {
  return (
    <div className={aid}>
      <div>
        <div className={title}>Tiger's Path</div>
        <div className={subtitle}>
          On your turn, take actions equal to your Tiger number (start 2). Repeats allowed.
        </div>
      </div>

      <Section head="Actions">
        {ACTIONS.map((action) => (
          <div key={action.key} className={actionRow}>
            <span className={actionKey}>{action.key}</span>
            <span className={actionName}>{action.name}</span>
            <span>{action.text}</span>
          </div>
        ))}
      </Section>

      <Section head="Hierarchy — left displaces right">
        <div className={strip}>
          {ANIMALS.map((animal, i) => (
            <Fragment key={animal.id}>
              {i > 0 && <span>&gt;</span>}
              <AnimalDot animal={animal} />
              <span>{animal.name}</span>
            </Fragment>
          ))}
        </div>
        <span className={prose}>Tigers are never displaced. Snakes never displace.</span>
      </Section>

      <Section head="Clearing entry — the ladder">
        <div className={strip}>
          {LADDER.map((rung, i) => (
            <Fragment key={i}>
              {i > 0 && <span>&lt;</span>}
              <span>{rung.count}</span>
              <AnimalDot animal={rung.animal} size={0.24} />
            </Fragment>
          ))}
          <span>&lt; …</span>
        </div>
        <span className={prose}>
          First entry into an empty clearing: any 1 animal. A later entry must be a single-type group strictly higher on
          the ladder than the highest group already there. Each type enters a clearing once, and a group never grows
          after entry.
        </span>
        <span className={prose}>
          A clearing holds 2 animals by default. To push it past that, your Boar number must cover the clearing's new
          total.
        </span>
      </Section>

      <Section head="Setup">
        <div className={strip}>
          {ANIMALS.map((animal) => (
            <Fragment key={animal.id}>
              <AnimalDot animal={animal} size={0.24} />
              <span>×{animal.bagCount}</span>
            </Fragment>
          ))}
          <span className={prose}>→ all 80 cubes into the bag.</span>
        </div>
        <span className={prose}>
          Board empty, supplies empty, every marker on Start. First player's opening move is necessarily a bag pull. v0
          has no scoring — play to find out what feels strong.
        </span>
      </Section>
    </div>
  )
}

import { AnimalDot } from "~/games/tigers-path/components/AnimalDot"
import { ANIMALS } from "~/games/tigers-path/domain"
import type { Animal } from "~/games/tigers-path/domain"
import { css, cx } from "~/generated/styled-system/css"
import { panelTint, paperShade, softBand } from "~/shared/components/paperFrame"

/**
 * The powers board: five engine tracks, one row per animal in hierarchy order,
 * six positions each. Every player has a marker on every track, so a position
 * cell is mostly empty space — the numeral sits in a corner tab and the rest
 * of the cell is parking for up to five markers.
 *
 * The start position is a notch darker than the rest of its row (`.200`
 * against `.100`, same move as meeple-syrup's trade ladders) — markers begin
 * there and the shade has to be findable without a legend.
 *
 * A row is the animal's own colour end to end: label band at `.200` with dark
 * ink, positions at `.100`. The board doubles as the hierarchy reference —
 * rows run strongest to weakest, top to bottom.
 */

const LABEL_W = 2.1
const CELL_W = 1.28
const ROW_H = 1.0

const board = css({
  display: "grid",
  placeContent: "center",
  rowGap: "0.12in",
  width: "100%",
  height: "100%"
})

const labelCell = css({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  alignItems: "center",
  columnGap: "2",
  paddingInline: "2.5",
  borderWidth: "0.4mm",
  borderStyle: "solid",
  borderStartStartRadius: "4mm",
  borderEndStartRadius: "4mm",
  borderInlineEndWidth: 0
})

const labelText = css({
  display: "grid",
  rowGap: "0.5"
})

const labelName = css({
  fontSize: "name",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  lineHeight: 1
})

const labelPower = css({
  fontSize: "micro",
  fontWeight: 600,
  lineHeight: 1.2
})

const valueCell = css({
  position: "relative",
  borderWidth: "0.4mm",
  borderStyle: "solid",
  borderInlineEndWidth: 0,
  _last: {
    borderInlineEndWidth: "0.4mm",
    borderStartEndRadius: "4mm",
    borderEndEndRadius: "4mm"
  }
})

/** The numeral tab: top-left corner, out of the markers' way. */
const valueTag = css({
  position: "absolute",
  top: 0,
  left: 0,
  paddingInline: "1.5",
  paddingBlock: "0.5",
  fontSize: "body",
  fontWeight: 700,
  lineHeight: 1,
  borderEndEndRadius: "2mm"
})

const startTag = css({
  position: "absolute",
  bottom: "0.5",
  right: "1.5",
  fontSize: "micro",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  opacity: 0.6
})

function ink(animal: Animal) {
  return { color: `var(--colors-${animal.color}-800)` }
}

function rail(animal: Animal) {
  return { borderColor: `var(--colors-${animal.color}-600)` }
}

function TrackRow({ animal }: { animal: Animal }) {
  return (
    <div
      className={css({ display: "grid" })}
      style={{
        gridTemplateColumns: `${LABEL_W}in repeat(${animal.trackValues.length}, ${CELL_W}in)`,
        height: `${ROW_H}in`
      }}
    >
      <div
        className={cx(labelCell, softBand({ color: animal.color }))}
        style={rail(animal)}
      >
        <AnimalDot animal={animal} size={0.34} />
        <div className={labelText}>
          <span className={labelName}>{animal.name}</span>
          <span className={labelPower}>{animal.power}</span>
        </div>
      </div>
      {animal.trackValues.map((value, i) => {
        const shade = i === 0 ? panelTint : paperShade
        return (
          <div
            key={i}
            className={cx(valueCell, shade({ color: animal.color }))}
            style={rail(animal)}
          >
            <span className={cx(valueTag, panelTint({ color: animal.color }))} style={ink(animal)}>
              {value}
            </span>
            {i === 0 && <span className={startTag} style={ink(animal)}>Start</span>}
          </div>
        )
      })}
    </div>
  )
}

export function PowersBoard() {
  return (
    <div className={board}>
      {ANIMALS.map((animal) => <TrackRow key={animal.id} animal={animal} />)}
    </div>
  )
}

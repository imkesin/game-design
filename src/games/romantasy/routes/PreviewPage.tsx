import { useEffect, useState } from "react"
import { protagonistDeck } from "~/games/romantasy/cards/protagonistDeck"
import { RESOURCE_BY_ID } from "~/games/romantasy/cards/resources"
import { traitDeck } from "~/games/romantasy/cards/traitDeck"
import { ProtagonistCard } from "~/games/romantasy/components/ProtagonistCard"
import { TraitCard } from "~/games/romantasy/components/TraitCard"
import { css } from "~/generated/styled-system/css"
import { ZoomControl } from "~/shared/components/ZoomControl"

/**
 * Screen preview. The picker holds one card at bleed size with the print
 * guides on; the grids below show every distinct face at trim size, one per
 * printed face rather than per copy.
 */

const page = css({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  padding: "24px"
})

const row = css({
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  flexWrap: "wrap",
  justifyContent: "center"
})

const link = css({
  color: "#e5e5e5",
  fontSize: "14px",
  textDecoration: "underline"
})

const heading = css({
  color: "#a3a3a3",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase"
})

const select = css({
  background: "#262626",
  color: "#e5e5e5",
  border: "1px solid #404040",
  borderRadius: "6px",
  padding: "6px 10px",
  fontSize: "14px"
})

/** Both decks under one id space, so the picker can be a single `<select>`. */
const options = [
  ...traitDeck.map((card) => ({
    id: card.id,
    label: `${RESOURCE_BY_ID[card.resource].name} ${card.value} — ${card.name}`,
    card
  })),
  ...protagonistDeck.map((card) => ({
    id: card.id,
    label: `${card.name} (${card.sex})`,
    card
  }))
]

function CardFace(
  { card, ...props }: { card: (typeof options)[number]["card"]; variant?: "trim"; showGuides?: boolean }
) {
  return card.kind === "trait"
    ? <TraitCard card={card} {...props} />
    : <ProtagonistCard card={card} {...props} />
}

export function PreviewPage() {
  const [zoom, setZoom] = useState(2.5)
  const [showGuides, setShowGuides] = useState(true)
  const [selectedId, setSelectedId] = useState(options[0]?.id)
  const selected = (options.find((o) => o.id === selectedId) ?? options[0])?.card

  // `--u` must live on the root: Panda hoists the card-unit tokens to `:root`.
  useEffect(() => {
    document.documentElement.style.setProperty("--u", `${zoom}mm`)
  }, [zoom])

  return (
    <div className={page}>
      <ZoomControl
        zoom={zoom}
        onZoom={setZoom}
        showGuides={showGuides}
        onToggleGuides={setShowGuides}
      />
      <select className={select} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      {selected !== undefined && <CardFace card={selected} showGuides={showGuides} />}

      <span className={heading}>
        Traits — {traitDeck.reduce((n, c) => n + c.copies, 0)} cards, {traitDeck.length} distinct
      </span>
      <div className={row}>
        {traitDeck.map((card) => <TraitCard key={card.id} variant="trim" card={card} />)}
      </div>

      <span className={heading}>Protagonists — {protagonistDeck.length} cards</span>
      <div className={row}>
        {protagonistDeck.map((card) => <ProtagonistCard key={card.id} variant="trim" card={card} />)}
      </div>

      <a className={link} href="/romantasy/print/cards">Print sheet →</a>
    </div>
  )
}

export default PreviewPage

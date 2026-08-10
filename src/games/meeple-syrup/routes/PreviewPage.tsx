import { useEffect, useState } from "react"
import { animalDeck } from "~/games/meeple-syrup/cards/animalDeck"
import { forageBag } from "~/games/meeple-syrup/cards/forageBag"
import { PASSIVE_BY_ID, RESOURCE_BY_ID } from "~/games/meeple-syrup/cards/resources"
import { AnimalCard } from "~/games/meeple-syrup/components/AnimalCard"
import { PineconeCard } from "~/games/meeple-syrup/components/PineconeCard"
import { ResourceCard } from "~/games/meeple-syrup/components/ResourceCard"
import { css } from "~/generated/styled-system/css"
import { ZoomControl } from "~/shared/components/ZoomControl"

/**
 * Screen preview for both decks. The picker holds one card at bleed size with
 * the print guides on — the only view that shows the safe area — and the grids
 * below show every distinct card at trim size, one per denomination rather than
 * one per printed copy, since copies are identical.
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
  ...animalDeck.map((card) => ({
    id: card.id,
    label: card.kind === "layabout"
      ? `${card.name} — ${PASSIVE_BY_ID[card.passive].name}`
      : `${card.name} — ${RESOURCE_BY_ID[card.input].name} → ${RESOURCE_BY_ID[card.output].name}`,
    card
  })),
  ...forageBag.map((card) => ({
    id: card.id,
    label: card.kind === "blank"
      ? "Pinecone"
      : `${RESOURCE_BY_ID[card.resource].name} x${card.quantity}`,
    card
  }))
]

/** One card at whatever size the caller asked for, dispatched on `kind`. */
function CardFace(
  { card, ...props }: { card: (typeof options)[number]["card"]; variant?: "trim"; showGuides?: boolean }
) {
  switch (card.kind) {
    case "animal":
    case "layabout":
      return <AnimalCard card={card} {...props} />
    case "resource":
      return <ResourceCard card={card} {...props} />
    case "blank":
      return <PineconeCard {...props} />
  }
}

export function PreviewPage() {
  const [zoom, setZoom] = useState(2.5)
  const [showGuides, setShowGuides] = useState(true)
  const [selectedId, setSelectedId] = useState(options[0]?.id)
  const selected = (options.find((o) => o.id === selectedId) ?? options[0])?.card

  // `--u` must live on the root: Panda hoists the card-unit tokens to `:root`,
  // so their `var(--u)` is resolved there. Setting it on a nested wrapper has
  // no effect. `--u` is therefore a single global scale knob.
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

      <span className={heading}>Animals — {animalDeck.length} cards</span>
      <div className={row}>
        {animalDeck.map((card) => <AnimalCard key={card.id} variant="trim" card={card} />)}
      </div>

      <span className={heading}>
        Forage bag — {forageBag.reduce((n, c) => n + c.copies, 0)} cards, {forageBag.length} distinct
      </span>
      <div className={row}>
        {forageBag.map((card) => <CardFace key={card.id} variant="trim" card={card} />)}
      </div>

      {
        /* The trade tracks are board furniture sized in inches, so they live on
          the board sheet rather than here, where `--u` is the zoom knob. */
      }
      <a className={link} href="/meeple-syrup/print/board">View the board →</a>
    </div>
  )
}

export default PreviewPage

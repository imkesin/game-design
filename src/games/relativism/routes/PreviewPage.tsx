import { useEffect, useState } from "react"
import { statementDeck } from "~/games/relativism/cards/statementDeck"
import { voteDeck } from "~/games/relativism/cards/voteDeck"
import { StatementCard } from "~/games/relativism/components/StatementCard"
import { VoteCard } from "~/games/relativism/components/VoteCard"
import { css } from "~/generated/styled-system/css"
import { ZoomControl } from "~/shared/components/ZoomControl"

const page = css({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "24px",
  padding: "24px"
})

const row = css({
  display: "flex",
  gap: "24px",
  alignItems: "center"
})

const select = css({
  background: "#262626",
  color: "#e5e5e5",
  border: "1px solid #404040",
  borderRadius: "6px",
  padding: "6px 10px",
  fontSize: "14px"
})

export function PreviewPage() {
  const [zoom, setZoom] = useState(2.5)
  const [showGuides, setShowGuides] = useState(true)
  const [selectedId, setSelectedId] = useState(statementDeck[0]?.id)
  const selected = statementDeck.find((card) => card.id === selectedId) ?? statementDeck[0]

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
        {statementDeck.map((card) => (
          <option key={card.id} value={card.id}>
            {card.text}
          </option>
        ))}
      </select>
      {selected && <StatementCard card={selected} showGuides={showGuides} />}
      <div className={row}>
        {voteDeck.map((card) => <VoteCard key={card.id} card={card} showGuides={showGuides} />)}
      </div>
    </div>
  )
}

export default PreviewPage

import { useEffect, useState } from "react"
import { legacyDeck } from "~/games/civil-service/cards/legacyDeck"
import { officerDeck } from "~/games/civil-service/cards/officerDeck"
import { Card } from "~/games/civil-service/components/Card"
import { css } from "~/generated/styled-system/css"
import { previewCard } from "~/shared/cards/deckUtils"
import { ZoomControl } from "~/shared/components/ZoomControl"

const page = css({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  padding: "24px"
})

// Every face at once — Officers in one row, Legacies in the next, so each deck
// can be scanned as a whole and the two are easy to compare side by side.
const gallery = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: "24px"
})

export function PreviewPage() {
  const [zoom, setZoom] = useState(1.6)
  const [showGuides, setShowGuides] = useState(true)

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
      <div className={gallery}>
        {officerDeck.map((definition) => (
          <Card key={definition.id} card={previewCard(definition)} showGuides={showGuides} />
        ))}
      </div>
      <div className={gallery}>
        {legacyDeck.map((definition) => (
          <Card key={definition.id} card={previewCard(definition)} showGuides={showGuides} />
        ))}
      </div>
    </div>
  )
}

export default PreviewPage

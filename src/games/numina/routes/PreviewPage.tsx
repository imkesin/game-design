import { useEffect, useState } from "react"
import { actionDeck } from "~/games/numina/cards/actionDeck"
import { permanentSupply } from "~/games/numina/cards/permanentSupply"
import { Card } from "~/games/numina/components/Card"
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

// Every face at once — the deck is six cards, so the whole thing fits on screen
// and the Powers can be compared side by side. The permanent supply follows in its
// own row, directly under the Actions it mirrors, so the rail that separates them is
// judged against the card it has to be told apart from.
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
        {actionDeck.map((definition) => (
          <Card key={definition.id} card={previewCard(definition)} showGuides={showGuides} />
        ))}
      </div>
      <div className={gallery}>
        {permanentSupply.map((definition) => (
          <Card key={definition.id} card={previewCard(definition)} showGuides={showGuides} />
        ))}
      </div>
    </div>
  )
}

export default PreviewPage

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { games } from "~/games"
import { GameIndex } from "~/shared/components/GameIndex"

// Game-namespaced pathname routing. The first path segment selects a game; the
// remainder selects a target within that game's route table — `/graft/print/
// board` renders graft's board sheet, `/graft` its interactive preview. When no
// (or an unknown) game segment is present, `/` renders the game index. Vite's
// dev server does SPA history fallback, so no router dependency is needed for
// the MVP.
const segments = window.location.pathname.split("/").filter(Boolean)
const gameId = segments[0]
const game = gameId !== undefined ? games[gameId] : undefined

let Root
if (game === undefined) {
  document.title = "Game Design"
  Root = () => <GameIndex games={games} />
} else {
  const target = "/" + segments.slice(1).join("/")
  Root = game.routes[target] ?? game.routes["/"]!
  document.title = game.name
  // Active-game marker for per-game Panda theming (see ~/games/graft/theme).
  document.documentElement.dataset.theme = game.id
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)

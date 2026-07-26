import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { DEFAULT_GAME, games } from "~/games"

// Game-namespaced pathname routing. The first path segment selects a game
// (falling back to DEFAULT_GAME when it is absent or unknown), and the
// remainder selects a target within that game's route table — `/graft/print/
// board` renders graft's board sheet, `/graft` (or `/`) its interactive
// preview. Vite's dev server does SPA history fallback, so no router dependency
// is needed for the MVP.
const segments = window.location.pathname.split("/").filter(Boolean)
const hasGame = segments[0] !== undefined && segments[0] in games
const gameId = hasGame ? segments[0]! : DEFAULT_GAME
const rest = hasGame ? segments.slice(1) : segments
const target = "/" + rest.join("/")

const game = games[gameId]!
const Root = game.routes[target] ?? game.routes["/"]!

// Active-game marker for per-game Panda theming (see ~/games/graft/theme).
document.documentElement.dataset.theme = gameId

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)

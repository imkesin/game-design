import { css } from "~/generated/styled-system/css"
import type { Game } from "~/shared/game"

const page = css({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "24px",
  padding: "24px",
  background: "#171717",
  color: "#e5e5e5"
})

const title = css({
  fontSize: "24px",
  fontWeight: 600,
  letterSpacing: "0.02em"
})

const list = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: "240px"
})

const link = css({
  display: "block",
  padding: "12px 16px",
  background: "#262626",
  border: "1px solid #404040",
  borderRadius: "8px",
  color: "#e5e5e5",
  fontSize: "16px",
  textDecoration: "none",
  _hover: { background: "#303030" }
})

/** Landing page served at `/`: links to each registered game. */
export function GameIndex({ games }: { games: Record<string, Game> }) {
  return (
    <div className={page}>
      <h1 className={title}>Game Design</h1>
      <nav className={list}>
        {Object.values(games).map((game) => (
          <a key={game.id} className={link} href={`/${game.id}`}>
            {game.name}
          </a>
        ))}
      </nav>
    </div>
  )
}

export default GameIndex

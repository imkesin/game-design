import { PLAYER_COUNTS, type PlayerCount } from "~/shared/cards/playerCount"

/** Screen-only player-count picker for the print sheets' note bar. */
export function PlayerCountSelect({
  value,
  onChange
}: {
  value: PlayerCount
  onChange: (players: PlayerCount) => void
}) {
  return (
    <label style={{ marginLeft: "12px" }}>
      Players{" "}
      <select value={value} onChange={(e) => onChange(Number(e.target.value) as PlayerCount)}>
        {PLAYER_COUNTS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  )
}

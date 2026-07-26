# Game Design

Print-and-play renderer for a set of prototype tabletop games. Each game lives
under `src/games/<id>/` and is mounted at `/<id>`; the root `/` lists them.

## Develop

```sh
pnpm install
pnpm run dev
```

## Structure

- `src/shared/` — cross-game primitives (print sizing, slots, controls, the
  game registry types, and the `/` landing page).
- `src/games/<id>/` — a self-contained game module: its `routes`, components,
  domain, and assets. Register it in `src/games/index.ts`.

## Games

- **Graft** (`/graft`) — interactive preview at `/graft`; print sheets under
  `/graft/print/*`.

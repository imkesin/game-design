---
name: k-game-pitch
description: Write or critique the three-sentence pitch for a prototype game in this repo. Use when asked to pitch, summarize, define, or sharpen a game idea.
---

# k-game-pitch

Every game needs a pitch, and this should be stored in a PITCH.md file in the game's root.

## Template

1. **Identity & Setting** — "In **[Game]**, you are **[Identity/Role]** working toward/competing for
   **[High-level objective]**."
2. **Mechanic Mapping** — "Each turn, you **[Verb 1]** **[Noun 1]** and **[Verb 2]** **[Noun 2]** to
   build/develop **[System]**."
3. **Tension & Resolution** — "The game ends when **[Trigger]**, and the player with the most
   **[Victory Metric]** wins."

The template should not be followed strictly; capturing the essence of those three ideas is most
important.

## Sources

Read before drafting, in priority order:

- `src/games/<game>/DESIGN.md` — spec, if the game has one
- `src/games/<game>/` code (`domain`, `cards`) — to confirm names/verbs

## Output format

```
**Pitch — <Game>**

1. In …
2. Each turn, …
3. The game ends when …
```

## Examples

### Galactic Cruise

1. In Galactic Cruise, players are competing company supervisors vying to replace the retiring CEO
   of a luxury space-tourism business.
2. Each turn, you place a worker to execute paired actions across a connected network—acquiring
   blueprints, constructing ships, and attracting guests—or launch a ship into orbit with a worker
   as pilot.
3. Launching ships and hitting company milestones places progress cubes onto a shared track,
   triggering the end of the game where the supervisor with the most Victory Points wins.

## Nouns & Verbs

The secondary goal of this exercise is to clearly define the nouns and verbs of the game.

After drafting, audit the **key** terms only: the role, the slot 2 verbs and nouns, the system, the
trigger, and the victory metric. Not every term needs to appear in the pitch.

For each, find the game's own term in DESIGN.md (Terminology section first). The must conforms to
the game.

## Interview

This is a collaborative exercise with the user (game designer). Interview them until you are
aligned.

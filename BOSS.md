# Boss Fight Guide

## Trigger
- The boss spawns automatically when the player enters any boss-arena room.
- The boss arena is rows `7-9`, columns `7-9`.
- The arena entrance is `(8, 7)`.
- The boss only spawns once per run.

## Placeholder Boss
- The boss uses a simple 16x16 generated sprite for now.
- It is its own sprite kind: `SpriteKind.Boss`.
- Boss shots use `SpriteKind.BossShot`.

## Fight Rules
- Boss HP: `12`.
- Each player laser hit removes `1` HP.
- Boss HP is shown in a `fancyText` label at the top of the screen.
- The boss follows the player and gets faster as it loses HP.
- The boss fires aimed shots. Its fire rate increases as it loses HP.
- Touching the boss or a boss shot triggers normal player-hit logic:
  - `Ghost Step` / `Backup Shield` can absorb the hit.
  - Otherwise, it is game over.
- While the boss is active, the player cannot leave the boss arena.
- Defeating the boss shows `BOSS DEFEATED` and ends the game with a win.

## Pause Behavior
- Opening the skill tree, debug menu, or a minigame pauses the boss and clears boss shots.
- Closing those overlays resumes the boss.
- The boss stays hidden while an overlay is open.

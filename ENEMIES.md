# Cyber Chomp — How to Make Enemies

This project already has `SpriteKind.Follower`, so you can use that as the enemy kind. You do not need to create a new kind unless you want separate enemy types.

## Current setup in `main.ts`

Enemies are already wired in:

- `spawnEnemy(x, y, speed, row, col)` creates one enemy, stores the room it belongs to, and makes it chase the player when it is in the player’s room.
- `spawnRoomEnemies(row, col)` spawns a room’s enemies the first time you enter that room.
- Enemies are persistent. They are not deleted when you change rooms.
- Each enemy remembers its room in `enemy.data.roomRow` and `enemy.data.roomCol`.
- `updateEnemies()` runs every frame. Enemies in the player’s room chase directly; enemies in other rooms walk to the correct door.
- `rebuildEnemyPaths()` runs a breadth-first search over `dungeonGrid` doors to find the next room toward the player.
- Touching an enemy in your room calls `game.over(false)`.
- The console room `(2, 1)` and the 3×3 boss arena are kept enemy-free.
- Spawn count is random, from 1 up to `min(2 + floor(distance / 2), 5)`.
- Enemy speed is `25` (slow tank), `65` (fast rusher), or a random `35–50` (standard).

Change the spawn and speed rolls in `spawnRoomEnemies` to tune difficulty.

## How room-to-room pathfinding works

Every room is spawned once. A `roomSpawned` grid records which rooms have already been populated.

When the player enters a room, `loadRoom` calls `rebuildEnemyPaths()`. That BFS walks the dungeon doors outward from the player’s room and fills `nextRoomIndex`. For every room, `nextRoomIndex[room]` is the next room on the shortest path toward the player.

Each frame, `updateEnemies()` does this for every enemy:

- **Same room as the player:** make it visible and call `enemy.follow(cyberPacman, speed)`.
- **Different room:** hide it, stop its follow behavior, and move it toward the door that leads to `nextRoomIndex[its room]`.
- When it reaches that door, it crosses into the next room, updates `data.roomRow` / `data.roomCol`, and appears just inside the door on the far side.
- It keeps doing this until it reaches the player’s room, then it starts chasing directly.

Only enemies in the current room are visible and dangerous. Enemies in other rooms are invisible and cannot trigger the game-over overlap.

The console room `(2, 1)` and the boss arena are excluded from enemy paths, so they stay safe.

To tune movement speed, change `enemy.data.speed`. To change which rooms enemies avoid, edit the exclusions in `rebuildEnemyPaths`.

## 1. Create one enemy

```ts
function spawnEnemy (x: number, y: number) {
    const enemy = sprites.create(img`
        . . 2 2 2 . .
        . 2 2 2 2 2 .
        2 2 2 2 2 2 2
        2 2 2 2 2 2 2
        . 2 2 2 2 2 .
        . . 2 2 2 . .
        `, SpriteKind.Follower)
    enemy.setPosition(x, y)
}
```

Or use an image asset:

```ts
const enemy = sprites.create(assets.image`drone`, SpriteKind.Follower)
```

## 2. Make it move

Chase the player:

```ts
enemy.follow(cyberPacman, 35)
```

The `35` is the speed. Raise it to make the enemy harder.

Or move it in a fixed direction:

```ts
enemy.setVelocity(0, 40)
```

## 3. One touch = game over

```ts
sprites.onOverlap(SpriteKind.Player, SpriteKind.Follower, function (player, enemy) {
    if (minigameActive == "" && !debugActivated) {
        game.over(false)
    }
})
```

The `minigameActive` check prevents enemies from killing you while you are inside a minigame. The `debugActivated` check does the same while the debug menu is open.

## 4. Spawn enemies per room

`loadRoom` spawns a room only the first time you enter it:

```ts
let idx = roomIndex(row, col)
if (!roomSpawned[idx]) {
    roomSpawned[idx] = true
    spawnRoomEnemies(row, col)
}
rebuildEnemyPaths()
updateEnemies()
```

Then spawn the room’s enemies, remembering which room they belong to:

```ts
if (row == 2 && col == 1) {
    // console room: no enemies
} else if (isBossCell(row, col)) {
    // boss spawn later
} else {
    spawnEnemy(40, 40, 40, row, col)
    spawnEnemy(120, 80, 40, row, col)
}
```

## 5. Surround the player with enemies

This is useful for the Data Rush trap or any “surrounded” moment:

```ts
for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4
    const enemy = sprites.create(img`
        2 2 2
        2 2 2
        2 2 2
        `, SpriteKind.Follower)
    enemy.setPosition(
        80 + Math.cos(angle) * 45,
        60 + Math.sin(angle) * 45
    )
    enemy.data.roomRow = currentRoomRow
    enemy.data.roomCol = currentRoomCol
    enemy.follow(cyberPacman, 45)
}
```

## 6. Defeating enemies and gaining XP

Give yourself a projectile kind first:

```ts
namespace SpriteKind {
    export const Laser = SpriteKind.create()
}
```

Then handle laser hits:

```ts
sprites.onOverlap(SpriteKind.Laser, SpriteKind.Follower, function (laser, enemy) {
    laser.destroy()
    enemy.destroy()
    gainXp(10)
})
```

Simple XP and level-up logic:

```ts
let xp = 0
let level = 1
let skillPoints = 0

function gainXp (amount: number) {
    xp += amount
    while (xp >= level * 10) {
        xp -= level * 10
        level += 1
        skillPoints += 1
    }
}
```

## 7. Bosses

Use the same enemy kind, but make them bigger and slower:

```ts
const boss = sprites.create(assets.image`drone`, SpriteKind.Follower)
boss.setScale(2, ScaleAnchor.Middle)
boss.data.roomRow = currentRoomRow
boss.data.roomCol = currentRoomCol
boss.follow(cyberPacman, 20)
```

For the Ghost boss, use the same idea with a different image and a different movement pattern.

## 8. Tips for this project

- Enemies persist between rooms, so do not clear them in `loadRoom`.
- Always set `enemy.data.roomRow` and `enemy.data.roomCol` when you create an enemy, or pathfinding will skip it.
- Do not spawn enemies in the console room `(2, 1)`.
- Guard `onOverlap` with `minigameActive == ""` so enemies cannot kill you during a minigame.
- Also guard overlap handlers with `enemyInRoom(enemy, currentRoomRow, currentRoomCol)` so off-room enemies cannot hurt you.
- If enemies should not move during a minigame or the debug menu, call `pauseAllEnemies()`.
- For designed rooms, use fixed spawn positions based on `row` and `col` instead of random positions.
- Keep boss enemies in the 3×3 arena and use `isBossCell(row, col)` to decide when to spawn them.

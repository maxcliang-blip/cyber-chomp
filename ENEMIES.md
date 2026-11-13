# Cyber Chomp — How to Make Enemies

This project already has `SpriteKind.Follower`, so you can use that as the enemy kind. You do not need to create a new kind unless you want separate enemy types.

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

Put this at the top of `loadRoom` so old enemies are removed when you change rooms:

```ts
sprites.destroyAllSpritesOfKind(SpriteKind.Follower)
```

Then spawn based on the room:

```ts
if (row == 2 && col == 1) {
    // console room: no enemies
} else if (isBossCell(row, col)) {
    // boss spawn later
} else {
    spawnEnemy(40, 40)
    spawnEnemy(120, 80)
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
boss.follow(cyberPacman, 20)
```

For the Ghost boss, use the same idea with a different image and a different movement pattern.

## 8. Tips for this project

- Clear enemies at the start of `loadRoom` so they do not follow you between rooms.
- Do not spawn enemies in the console room `(2, 1)`.
- Guard `onOverlap` with `minigameActive == ""` so enemies cannot kill you during a minigame.
- If an enemy should not move during a minigame, call `enemy.setVelocity(0, 0)` or `enemy.unfollow()` when the minigame starts.
- For designed rooms, use fixed spawn positions based on `row` and `col` instead of random positions.
- Keep boss enemies in the 3×3 arena and use `isBossCell(row, col)` to decide when to spawn them.

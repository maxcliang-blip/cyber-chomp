namespace SpriteKind {
    export const Wall = SpriteKind.create()
    export const Follower = SpriteKind.create()
    export const Hud = SpriteKind.create()
    export const popuptext = SpriteKind.create()
    export const minigameSprites = SpriteKind.create()
    export const minigameHud = SpriteKind.create()
}
let showMinimap = true
function renderDebugOptions() {
    cleanUIElements(debugOptions)
    labels = [`1. Coordinates: ${showCoordinates ? "ON" : "OFF"}`, "2. Visualize Map", "3. Resume Game", `4. Minimap: ${showMinimap ? "ON" : "OFF"}`]
    for (let k = 0; k <= 3; k++) {
        opt = fancyText.create(`${debugSelection == k ? "> " : " "}${labels[k]}`)
        fancyText.setColor(opt, debugSelection == k ? 2 : 15)
        fancyText.setFont(opt, fancyText.bold_sans_7)
        opt.setPosition(80, 40 + k * 12)
        debugOptions.push(opt)
    }
}
function playFirewallSequence(withCountdown: boolean) {
    acceptingFirewallInput = false
    firewallInputIndex = 0
    sequence2 = currentFirewallSequence()
    control.runInBackground(function () {
        if (withCountdown) {
            const countdown = fancyText.create("Starting in: 3", 0, 15, fancyText.bold_sans_7)
            countdown.setKind(SpriteKind.minigameHud)
            countdown.setPosition(80, 10)
            for (let count2 = 3; count2 >= 1; count2--) {
                if (minigameActive != "firewall") {
                    return
                }
                fancyText.setText(countdown, `Starting in: ${count2}`)
                pause(1000)
            }
            if (minigameActive != "firewall") {
                return
            }
            fancyText.setText(countdown, "GO!")
            pause(400)
            sprites.destroy(countdown)
        } else {
            const roundText = fancyText.create(`ROUND ${firewallRound}`, 0, 15, fancyText.bold_sans_7)
            roundText.setKind(SpriteKind.minigameHud)
            roundText.setPosition(80, 10)
            pause(800)
            if (minigameActive != "firewall") {
                return
            }
            sprites.destroy(roundText)
        }
        resetFirewallNodes()
        for (let idx of sequence2) {
            if (minigameActive != "firewall") {
                return
            }
            const t = Math.floor(idx / 3)
            const e = idx % 3
            nodelist[t][e].setImage(sequencenode.image)
            pause(350)
            if (minigameActive != "firewall") {
                return
            }
            nodelist[t][e].setImage(blanknode.image)
            pause(150)
        }
        if (minigameActive == "firewall") {
            acceptingFirewallInput = true
        }
    })
}
function clearMinigameHud() {
    sprites.destroyAllSpritesOfKind(SpriteKind.minigameHud)
}
function startMinigame(kind: string) {
    if (debugActivated || minigameActive != "") {
        return
    }
    minigameActive = kind
    minigameReturnX = cyberPacman.x
    minigameReturnY = cyberPacman.y
    pauseAllEnemies()
    controller.moveSprite(cyberPacman, 0, 0)
    minimapSprite.setFlag(SpriteFlag.Invisible, true)
    pauseButton.setFlag(SpriteFlag.Invisible, true)
    if (coordsText) {
        sprites.destroy(coordsText)
        coordsText = null
    }
    clearMinigameSprites()
    clearMinigameHud()
    if (kind == "firewall") {
        startFirewall()
    }
}
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    handleNavigation(-1)
})
function pregenerateRoomTemplates() {
    let templates: Image[] = []
    for (let j = 0; j <= 15; j++) {
        baseImg = image.create(SCREEN_WIDTH, SCREEN_HEIGHT)
        baseImg.fill(1)
        for (let bit = 0; bit <= 3; bit++) {
            if ((j & (1 << bit)) != 0) {
                baseImg = drawDoor(baseImg, bit)
            }
        }
        templates.push(baseImg)
    }
    return templates
}
function clearEnemies() {
    sprites.destroyAllSpritesOfKind(SpriteKind.Follower)
    roomSpawned = []
    nextRoomIndex = []
}
function pauseAllEnemies() {
    for (let enemy of sprites.allOfKind(SpriteKind.Follower)) {
        enemy.unfollow()
        enemy.setFlag(SpriteFlag.Invisible, true)
    }
}
function cleanUIElements(arr: Sprite[]) {
    while (arr.length) {
        item = arr.pop()
        if (item) {
            sprites.destroy(item)
        }
    }
}
function clearMinigameSprites() {
    sprites.destroyAllSpritesOfKind(SpriteKind.minigameSprites)
}
function startFirewall() {
    scene.setBackgroundImage(bg)
    cyberPacman.setFlag(SpriteFlag.Invisible, true)
    if (console1) {
        console1.setFlag(SpriteFlag.Invisible, true)
    }
    popup1.setFlag(SpriteFlag.Invisible, true)
    console1hidden = true
    popup1hidden = true
    blanknode = sprites.create(img`
        . f f f f f . 
        f 1 1 1 1 1 f 
        f 1 1 1 1 1 f 
        f 1 1 1 1 1 f 
        f 1 1 1 1 1 f 
        f 1 1 1 1 1 f 
        . f f f f f . 
        `, SpriteKind.minigameHud)
    sequencenode = sprites.create(img`
        . f f f f f . 
        f 8 8 8 8 8 f 
        f 8 8 8 8 8 f 
        f 8 8 8 8 8 f 
        f 8 8 8 8 8 f 
        f 8 8 8 8 8 f 
        . f f f f f . 
        `, SpriteKind.minigameHud)
    correctnode = sprites.create(img`
        . f f f f f . 
        f 7 7 7 7 7 f 
        f 7 7 7 7 7 f 
        f 7 7 7 7 7 f 
        f 7 7 7 7 7 f 
        f 7 7 7 7 7 f 
        . f f f f f . 
        `, SpriteKind.minigameHud)
    wrongnode = sprites.create(img`
        . f f f f f . 
        f 2 2 2 2 2 f 
        f 2 2 2 2 2 f 
        f 2 2 2 2 2 f 
        f 2 2 2 2 2 f 
        f 2 2 2 2 2 f 
        . f f f f f . 
        `, SpriteKind.minigameHud)
    sequencenode.setFlag(SpriteFlag.Invisible, true)
    blanknode.setFlag(SpriteFlag.Invisible, true)
    correctnode.setFlag(SpriteFlag.Invisible, true)
    wrongnode.setFlag(SpriteFlag.Invisible, true)
    nodelist = []
    for (let row = 0; row <= 2; row++) {
        let rowList: Sprite[] = []
        for (let col = 0; col <= 2; col++) {
            newNode = sprites.create(blanknode.image, SpriteKind.minigameHud)
            newNode.setPosition(50 + col * 30, 30 + row * 30)
            rowList.push(newNode)
        }
        nodelist.push(rowList)
    }
    firewallRound = 1
    round1sequence = makeFirewallSequence(3)
    round2sequence = makeFirewallSequence(4)
    round3sequence = makeFirewallSequence(5)
    playFirewallSequence(true)
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (debugActivated || minigameActive != "") {
        return
    }
    if (facingright) {
        projectile = sprites.createProjectileFromSprite(img`
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
            . . 3 3 3 3 3 3 3 3 3 3 3 3 . . 
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
            . . 3 3 3 3 3 3 3 3 3 3 3 3 . . 
            . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            `, cyberPacman, 200, 0)
    } else {
        projectile = sprites.createProjectileFromSprite(img`
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
            . . 3 3 3 3 3 3 3 3 3 3 3 3 . . 
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
            . . 3 3 3 3 3 3 3 3 3 3 3 3 . . 
            . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            `, cyberPacman, -200, 0)
    }
})
function drawDungeonMap(canvas: Image, offsetX: number, offsetY: number, cellSize: number, gap: number) {
    for (let a = 0; a <= GRID_SIZE - 1; a++) {
        for (let h = 0; h <= GRID_SIZE - 1; h++) {
            bits = dungeonGrid[a][h]
            if (bits > 0) {
                x = offsetX + h * (cellSize + gap)
                y = offsetY + a * (cellSize + gap)
                canvas.fillRect(x, y, cellSize, cellSize, (a == currentRoomRow && h == currentRoomCol) ? 4 : (isBossCell(a, h) ? 2 : 1))
                if ((bits & 1) == 0) {
                    canvas.drawLine(x, y, x + cellSize - 1, y, 15)
                }
                if ((bits & 2) == 0) {
                    canvas.drawLine(x + cellSize - 1, y, x + cellSize - 1, y + cellSize - 1, 15)
                }
                if ((bits & 4) == 0) {
                    canvas.drawLine(x, y + cellSize - 1, x + cellSize - 1, y + cellSize - 1, 15)
                }
                if ((bits & 8) == 0) {
                    canvas.drawLine(x, y, x, y + cellSize - 1, 15)
                }
            }
        }
    }
}
function endMinigame(won: boolean) {
    clearMinigameSprites()
    clearMinigameHud()
    acceptingFirewallInput = false
    minigameActive = ""
    if (won) {

    }
    minimapSprite.setFlag(SpriteFlag.Invisible, false)
    pauseButton.setFlag(SpriteFlag.Invisible, false)
    cyberPacman.setFlag(SpriteFlag.Invisible, false)
    controller.moveSprite(cyberPacman, SPEED, SPEED)
    loadRoom(currentRoomRow, currentRoomCol)
    cyberPacman.setPosition(minigameReturnX, minigameReturnY)
}
function getFirewallNodeAt(x: number, y: number) {
    for (let u = 0; u <= 2; u++) {
        for (let f = 0; f <= 2; f++) {
            if (Math.abs(x - nodelist[u][f].x) <= 15 && Math.abs(y - nodelist[u][f].y) <= 15) {
                return u * 3 + f
            }
        }
    }
    return -1
}
function visualizeMap() {
    if (debugTitle) {
        sprites.destroy(debugTitle)
        debugTitle = null
    }
    if (debugHint) {
        sprites.destroy(debugHint)
        debugHint = null
    }
    cleanUIElements(debugOptions)
    cv = image.create(SCREEN_WIDTH, SCREEN_HEIGHT)
    cv.fill(11)
    drawDungeonMap(cv, 30, 10, 8, 2)
    scene.setBackgroundImage(cv)
    mapExitPrompt = fancyText.create("Press (Comma) to Close Map")
    fancyText.setColor(mapExitPrompt, 15)
    fancyText.setFont(mapExitPrompt, fancyText.bold_sans_7)
    mapExitPrompt.setPosition(80, 112)
}
function createMinimapImage() {
    size = GRID_SIZE * 4 + 4
    mm = image.create(size, size)
    mm.fill(11)
    mm.drawRect(0, 0, size, size, 15)
    drawDungeonMap(mm, 2, 2, 4, 0)
    return mm
}
browserEvents.A.onEvent(browserEvents.KeyEvent.Pressed, function () {
    if (debugActivated || minigameActive != "") {
        return
    }
    if (!(console1hidden) && !(popup1hidden)) {
        startMinigame("firewall")
    }
})
function spawnRoomEnemies(row: number, col: number) {
    if (row == 2 && col == 1) { return }
    if (isBossCell(row, col)) { return }

    // Special rule for room (0, 0): one enemy in the top-right corner.
    if (row == 0 && col == 0) {
        spawnEnemy(125, 30, 40, row, col)
        return
    }

    let distance = Math.abs(row - 2) + Math.abs(col - 1)
    let maxEnemies = Math.min(2 + Math.floor(distance / 2), 5)
    let count = randint(1, maxEnemies)
    let safeZones = [[125, 30]
        , [125, 90]
    ]

    for (let i = 0; i < count; i++) {
        let zone = safeZones[randint(0, safeZones.length - 1)]
        let x = zone[0] + randint(-10, 10)
        let y = zone[1] + randint(-10, 10)

        // 3. Roll an enemy type
        let roll = randint(1, 10)
        let speed = 40
        if (roll <= 2) {
            speed = 65 // Fast rusher
        } else if (roll <= 4) {
            speed = 25 // Slow tank
        } else {
            speed = randint(35, 50) // Standard enemy
        }

        spawnEnemy(x, y, speed, row, col)
    }
}
function roomIndex(row: number, col: number) {
    return row * GRID_SIZE + col
}
function initRoomSpawned() {
    if (roomSpawned.length == 0) {
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            roomSpawned.push(false)
        }
    }
}
function enemyInRoom(enemy: Sprite, row: number, col: number) {
    return enemy.data.roomRow == row && enemy.data.roomCol == col
}
function rebuildEnemyPaths() {
    nextRoomIndex = []
    let dist: number[] = []
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        nextRoomIndex.push(-1)
        dist.push(-1)
    }
    if (currentRoomRow < 0 || currentRoomRow >= GRID_SIZE || currentRoomCol < 0 || currentRoomCol >= GRID_SIZE) {
        return
    }
    let startIdx = roomIndex(currentRoomRow, currentRoomCol)
    dist[startIdx] = 0
    nextRoomIndex[startIdx] = startIdx
    // The console room and the boss arena stay safe, so enemies wait outside them.
    if ((currentRoomRow == 2 && currentRoomCol == 1) || isBossCell(currentRoomRow, currentRoomCol)) {
        return
    }
    let queue: number[] = [startIdx]
    let head = 0
    while (head < queue.length) {
        let idx = queue[head]
        head += 1
        let r = Math.floor(idx / GRID_SIZE)
        let c = idx % GRID_SIZE
        let bits = dungeonGrid[r][c]
        let neighbors: number[][] = []
        if ((bits & 1) != 0 && r > 0 && (dungeonGrid[r - 1][c] & 4) != 0) {
            neighbors.push([r - 1, c])
        }
        if ((bits & 2) != 0 && c < GRID_SIZE - 1 && (dungeonGrid[r][c + 1] & 8) != 0) {
            neighbors.push([r, c + 1])
        }
        if ((bits & 4) != 0 && r < GRID_SIZE - 1 && (dungeonGrid[r + 1][c] & 1) != 0) {
            neighbors.push([r + 1, c])
        }
        if ((bits & 8) != 0 && c > 0 && (dungeonGrid[r][c - 1] & 2) != 0) {
            neighbors.push([r, c - 1])
        }
        for (let n of neighbors) {
            let nr = n[0]
            let nc = n[1]
            if (nr == 2 && nc == 1) { continue }
            if (isBossCell(nr, nc)) { continue }
            let nIdx = roomIndex(nr, nc)
            if (dist[nIdx] < 0) {
                dist[nIdx] = dist[idx] + 1
                nextRoomIndex[nIdx] = idx
                queue.push(nIdx)
            }
        }
    }
}
function moveEnemyTowardPlayerRoom(enemy: Sprite) {
    let r = enemy.data.roomRow
    let c = enemy.data.roomCol
    let idx = roomIndex(r, c)
    let next = nextRoomIndex[idx]
    if (next == null || next < 0 || next == idx) {
        enemy.unfollow()
        return
    }
    let nr = Math.floor(next / GRID_SIZE)
    let nc = next % GRID_SIZE
    let doorX = 80
    let doorY = 60
    if (nr < r) {
        doorY = 6
    } else if (nr > r) {
        doorY = 114
    } else if (nc < c) {
        doorX = 6
    } else {
        doorX = 154
    }
    let dx = doorX - enemy.x
    let dy = doorY - enemy.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    let speed = enemy.data.speed || 40
    if (dist < 8) {
        // Cross into the next room and appear just inside the door on the far side.
        enemy.data.roomRow = nr
        enemy.data.roomCol = nc
        if (nr < r) {
            enemy.setPosition(80, 114)
        } else if (nr > r) {
            enemy.setPosition(80, 6)
        } else if (nc < c) {
            enemy.setPosition(154, 60)
        } else {
            enemy.setPosition(6, 60)
        }
        enemy.setVelocity(0, 0)
    } else {
        enemy.setVelocity(dx / dist * speed, dy / dist * speed)
    }
}
function updateEnemies() {
    initRoomSpawned()
    for (let enemy of sprites.allOfKind(SpriteKind.Follower)) {
        if (!enemy || enemy.data.roomRow == null) {
            continue
        }
        if (enemyInRoom(enemy, currentRoomRow, currentRoomCol)) {
            enemy.setFlag(SpriteFlag.Invisible, false)
            enemy.follow(cyberPacman, enemy.data.speed || 40)
        } else {
            enemy.setFlag(SpriteFlag.Invisible, true)
            enemy.unfollow()
            moveEnemyTowardPlayerRoom(enemy)
        }
    }
}


function isClose(mySprite: Sprite, mySprite2: Sprite, dist: number) {
    return distance(mySprite.x, mySprite2.x, mySprite.y, mySprite2.y) < dist
}
function distance(x1: number, x2: number, y1: number, y2: number) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    handleNavigation(1)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Follower, function (player2, enemy) {
    if (debugActivated || minigameActive != "") {
        return
    }
    if (!enemyInRoom(enemy, currentRoomRow, currentRoomCol)) {
        return
    }
    if (control.millis() < enemyGraceUntil) {
        return
    }
    if (gameOverTriggered) {
        return
    }
    gameOverTriggered = true
    game.over(false)
})
browserEvents.Enter.onEvent(browserEvents.KeyEvent.Pressed, function () {
    if (!(debugActivated)) {
        return
    }
    if (mapExitPrompt || debugSelection == 2) {
        restoreGameplayState()
    } else if (debugSelection == 0) {
        showCoordinates = !(showCoordinates)
        renderDebugOptions()
    } else if (debugSelection == 1) {
        visualizeMap()
    }
    else if (debugSelection == 3) {
        showMinimap = !(showMinimap)
        renderDebugOptions()
    }
})
function makeFirewallSequence(length: number) {
    let sequence: number[] = []
    for (let index = 0; index < length; index++) {
        sequence.push(Math.floor(Math.random() * 9))
    }
    return sequence
}
function handleNavigation(dir: number) {
    if (debugActivated && !(mapExitPrompt)) {
        debugSelection = (debugSelection + dir + 4) % 4
        renderDebugOptions()
    }
}
browserEvents.MouseLeft.onEvent(browserEvents.MouseButtonEvent.Pressed, function (x, y) {
    if (minigameActive == "firewall" && acceptingFirewallInput) {
        nodeIndex = getFirewallNodeAt(x, y)
        if (nodeIndex >= 0) {
            handleFirewallInput(nodeIndex)
        }
        return
    }
    if (!(debugActivated) && minigameActive == "" && x < 160 && x > 145 && y < 20 && y > 0) {
        debugActivated = true
        renderDebugMenu()
    } else if (debugActivated && minigameActive == "" && x < 160 && x > 145 && y < 20 && y > 0) {
        restoreGameplayState()
    }
})
function restoreGameplayState() {
    if (debugTitle) {
        sprites.destroy(debugTitle)
        debugTitle = null
    }
    if (debugHint) {
        sprites.destroy(debugHint)
        debugHint = null
    }
    if (mapExitPrompt) {
        sprites.destroy(mapExitPrompt)
        mapExitPrompt = null
    }
    cleanUIElements(debugOptions)
    if (minimapSprite) {
        minimapSprite.setFlag(SpriteFlag.Invisible, false)
    }
    pauseButton.setImage(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . f f f . . . f f f . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `)
    cyberPacman.setFlag(SpriteFlag.Invisible, false)
    cyberPacman.setPosition(debugPlayerX, debugPlayerY)
    controller.moveSprite(cyberPacman, SPEED, SPEED)
    debugActivated = false
    loadRoom(currentRoomRow, currentRoomCol)
}
function renderDebugMenu() {
    if (coordsText) {
        sprites.destroy(coordsText)
        coordsText = null
    }
    if (fancyText.getText(popup1) == "(A)") {
        popup1.setFlag(SpriteFlag.Invisible, true)
        popup1hidden = true
    }
    if (minimapSprite) {
        minimapSprite.setFlag(SpriteFlag.Invisible, true)
    }
    cyberPacman.setFlag(SpriteFlag.Invisible, true)
    pauseAllEnemies()
    if (console1) {
        console1.setFlag(SpriteFlag.Invisible, true)
    }
    debugPlayerX = cyberPacman.x
    debugPlayerY = cyberPacman.y
    controller.moveSprite(cyberPacman, 0, 0)
    pauseButton.setImage(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . f . . . . . . . . . . . . 
        . . . f f f . . . . . . . . . . 
        . . . f f f f f . . . . . . . . 
        . . . f f f f f f f . . . . . . 
        . . . f f f f f f f f . . . . . 
        . . . f f f f f f f f f . . . . 
        . . . f f f f f f f f . . . . . 
        . . . f f f f f f . . . . . . . 
        . . . f f f f . . . . . . . . . 
        . . . f f f . . . . . . . . . . 
        . . . f . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `)
    bg = image.create(SCREEN_WIDTH, SCREEN_HEIGHT)
    bg.fill(1)
    scene.setBackgroundImage(bg)
    if (debugTitle) {
        sprites.destroy(debugTitle)
    }
    if (debugHint) {
        sprites.destroy(debugHint)
    }
    debugTitle = fancyText.create("Debug Menu")
    fancyText.setColor(debugTitle, 15)
    fancyText.setFont(debugTitle, fancyText.bold_sans_7)
    debugTitle.setPosition(80, 18)
    debugHint = fancyText.create("Up/Down: move\nEnter: select Comma: close")
    fancyText.setColor(debugHint, 15)
    fancyText.setFont(debugHint, fancyText.bold_sans_7)
    debugHint.setPosition(80, 95)
    debugSelection = 0
    debugActivated = true
    renderDebugOptions()
}
function isBossCell(row: number, col: number) {
    return row >= BOSS_ROW && row < BOSS_ROW + BOSS_SIZE && col >= BOSS_COL && col < BOSS_COL + BOSS_SIZE
}
function currentFirewallSequence() {
    if (firewallRound == 2) {
        return round2sequence
    }
    if (firewallRound == 3) {
        return round3sequence
    }
    return round1sequence
}
browserEvents.Comma.onEvent(browserEvents.KeyEvent.Pressed, function () {
    if (debugActivated) {
        restoreGameplayState()
    } else if (minigameActive != "") {
        endMinigame(false)
    }
})
function spawnEnemy(x: number, y: number, speed: number, row: number, col: number) {
    enemy4 = sprites.create(img`
        . . . e e e e . . . 
        . . e e 2 2 e e . . 
        . e e 2 2 2 2 e e . 
        e e 2 2 2 2 2 2 e e 
        e e 2 2 2 2 2 2 e e 
        e e 2 2 2 2 2 2 e e 
        e e 2 2 2 2 2 2 e e 
        . e e 2 2 2 2 e e . 
        . . e e 2 2 e e . . 
        . . . e e e e . . . 
        `, SpriteKind.Follower)
    enemy4.setPosition(x, y)
    enemy4.data.speed = speed
    enemy4.data.roomRow = row
    enemy4.data.roomCol = col
    enemy4.follow(cyberPacman, speed)
    return enemy4
}
function drawBossBackground(row: number, col: number) {
    if (!(bossBackground)) {
        bossBackground = image.create(SCREEN_WIDTH, SCREEN_HEIGHT)
    }
    bossBackground.fill(1)
    r = row - BOSS_ROW
    c = col - BOSS_COL
    if (r == 0) {
        bossBackground.fillRect(0, 0, SCREEN_WIDTH, 3, 2)
    }
    if (r == BOSS_SIZE - 1) {
        bossBackground.fillRect(0, SCREEN_HEIGHT - 3, SCREEN_WIDTH, 3, 2)
    }
    if (c == 0) {
        if (r == BOSS_ENTRANCE_ROW - BOSS_ROW) {
            bossBackground.fillRect(0, 0, 3, 52, 2)
            bossBackground.fillRect(0, 68, 3, SCREEN_HEIGHT - 68, 2)
            drawDoor(bossBackground, 3, 2)
        } else {
            bossBackground.fillRect(0, 0, 3, SCREEN_HEIGHT, 2)
        }
    }
    if (c == BOSS_SIZE - 1) {
        bossBackground.fillRect(SCREEN_WIDTH - 3, 0, 3, SCREEN_HEIGHT, 2)
    }
}
function resetFirewallNodes() {
    for (let s = 0; s <= 2; s++) {
        for (let d = 0; d <= 2; d++) {
            nodelist[s][d].setImage(blanknode.image)
        }
    }
}
sprites.onOverlap(SpriteKind.Follower, SpriteKind.Projectile, function (enemy7, laser) {
    if (debugActivated || minigameActive != "") {
        return
    }
    if (!enemyInRoom(enemy7, currentRoomRow, currentRoomCol)) {
        return
    }
    sprites.destroy(enemy7)
    sprites.destroy(laser)
})
function handleFirewallInput(nodeIndex: number) {
    if (!(acceptingFirewallInput) || minigameActive != "firewall") {
        return
    }
    sequence3 = currentFirewallSequence()
    v = Math.floor(nodeIndex / 3)
    g = nodeIndex % 3
    node = nodelist[v][g]
    if (nodeIndex == sequence3[firewallInputIndex]) {
        node.setImage(correctnode.image)
        firewallInputIndex += 1
        if (firewallInputIndex >= sequence3.length) {
            acceptingFirewallInput = false
            if (firewallRound >= 3) {
                clearText = fancyText.create("FIREWALL BREACHED", 0, 7, fancyText.bold_sans_7)
                clearText.setKind(SpriteKind.minigameHud)
                clearText.setPosition(80, 10)
                control.runInBackground(function () {
                    pause(900)
                    if (minigameActive == "firewall") {
                        hasRedKey = true
                        consoleRemoved = true
                        console1hidden = true
                        if (console1) {
                            sprites.destroy(console1)
                            console1 = null
                        }
                        endMinigame(true)
                    }
                })
            } else {
                clearText2 = fancyText.create(`ROUND ${firewallRound} CLEAR`, 0, 7, fancyText.bold_sans_7)
                clearText2.setKind(SpriteKind.minigameHud)
                clearText2.setPosition(80, 10)
                control.runInBackground(function () {
                    pause(900)
                    if (minigameActive == "firewall") {
                        sprites.destroy(clearText2)
                        firewallRound += 1
                        playFirewallSequence(false)
                    }
                })
            }
        } else {
            control.runInBackground(function () {
                pause(250)
                if (minigameActive == "firewall") {
                    node.setImage(blanknode.image)
                }
            })
        }
    } else {
        acceptingFirewallInput = false
        node.setImage(wrongnode.image)
        failText = fancyText.create("SEQUENCE FAILED", 0, 2, fancyText.bold_sans_7)
        failText.setKind(SpriteKind.minigameHud)
        failText.setPosition(80, 10)
        control.runInBackground(function () {
            pause(900)
            if (minigameActive == "firewall") {
                endMinigame(false)
            }
        })
    }
}
let bossEdgeDown = false
let bossEdgeUp = false
let bossEdgeRight = false
let bossEdgeLeft = false
let inDoorX = false
let inDoorY = false
let lastY = 0
let lastX = 0
let hittingWall = false
let failText: fancyText.TextSprite = null
let clearText: fancyText.TextSprite = null
let g = 0
let v = 0
let sequence3: number[] = []
let c = 0
let r = 0
let debugPlayerY = 0
let debugPlayerX = 0
let nodeIndex = 0
let gameOverTriggered = false
let point: number[] = []
let start = 0
let count = 0
let spawnPoints: number[][] = []
let mm: Image = null
let size = 0
let cv: Image = null
let y = 0
let x = 0
let projectile: Sprite = null
let round3sequence: number[] = []
let round2sequence: number[] = []
let round1sequence: number[] = []
let newNode: Sprite = null
let wrongnode: Sprite = null
let correctnode: Sprite = null
let item: Sprite = null
let debugActivated = false
let firewallInputIndex = 0
let opt: fancyText.TextSprite = null
let debugOptions: fancyText.TextSprite[] = []
let pauseButton: Sprite = null
let popup1hidden = false
let SCREEN_HEIGHT = 0
let SCREEN_WIDTH = 0
let GRID_SIZE = 0
let popup1: fancyText.TextSprite = null
let BOSS_ENTRANCE_ROW = 0
let BOSS_SIZE = 0
let cyberPacman: Sprite = null
let BOSS_COL = 0
let BOSS_ROW = 0
let facingright = false
let roomSpawned: boolean[] = []
let nextRoomIndex: number[] = []
let clearText2: fancyText.TextSprite = null
let node: Sprite = null
let enemy4: Sprite = null
let speed = 0
let sequence2: number[] = []
let firewallRound = 0
let dungeonGrid: number[][] = []
let blanknode: Sprite = null
let sequencenode: Sprite = null
let nodelist: Sprite[][] = []
let acceptingFirewallInput = false
let hasRedKey = false
let hasBlueKey = false
let hasArenakey = false
let tempcount = 0
let showCoordinates = false
let currentRoomRow = 0
let currentRoomCol = 0
let roomBitValue = 0
let debugSelection = 0
let coordsText: fancyText.TextSprite = null
let mapExitPrompt: fancyText.TextSprite = null
let debugTitle: fancyText.TextSprite = null
let debugHint: fancyText.TextSprite = null
let labels: string[] = []
let bits = 0
let console1: Sprite = null
let consoleRemoved = false
let console1hidden = false
let roomTemplates: Image[] = []
let minimapSprite: Sprite = null
let bossBackground: Image = null
let bg: Image = null
let enemyGraceUntil = 0
let minigameActive = ""
let baseImg: Image = null
facingright = true
function loadRoom(row: number, col: number) {
    enemyGraceUntil = control.millis() + 1000
    initRoomSpawned()
    // Lasers belong to the room they were fired in.
    sprites.destroyAllSpritesOfKind(SpriteKind.Projectile)
    console1hidden = true
    if (console1) {
        console1.setFlag(SpriteFlag.Invisible, true)
    }
    for (let w of sprites.allOfKind(SpriteKind.Wall)) {
        w.destroy()
    }
    if (coordsText) {
        sprites.destroy(coordsText)
        coordsText = null
    }
    
    roomBitValue = dungeonGrid[row][col]
    if (showCoordinates) {
        coordsText = fancyText.create(`(${row}, ${col})`)
        fancyText.setColor(coordsText, 15)
        fancyText.setFont(coordsText, fancyText.bold_sans_7)
        coordsText.setPosition(15, 10)
    }
    if (minimapSprite) {
        minimapSprite.setImage(createMinimapImage())
    }
    if (row == 2 && col == 1 && !consoleRemoved && console1) {
        console1hidden = false
        console1.setFlag(SpriteFlag.Invisible, false)
        console1.setPosition(100, 30)
    }
    if (isBossCell(row, col)) {
        drawBossBackground(row, col)
        scene.setBackgroundImage(bossBackground)
    } else {
        scene.setBackgroundImage(roomTemplates[roomBitValue])
    }
    let idx = roomIndex(row, col)
    if (!roomSpawned[idx]) {
        roomSpawned[idx] = true
        spawnRoomEnemies(row, col)
    }
    rebuildEnemyPaths()
    updateEnemies()
}
function drawDoor(bg: Image, side: number, color: number = 15) {
    for (let n = 0; n <= 20; n++) {
        if (side == 0) {
            bg.drawLine(Math.map(n, 0, 20, 72, 60), n, Math.map(n, 0, 20, 88, 100), n, color)
        }
        if (side == 1) {
            bg.drawLine(159 - n, Math.map(n, 0, 20, 52, 40), 159 - n, Math.map(n, 0, 20, 68, 80), color)
        }
        if (side == 2) {
            bg.drawLine(Math.map(n, 0, 20, 72, 60), 119 - n, Math.map(n, 0, 20, 88, 100), 119 - n, color)
        }
        if (side == 3) {
            bg.drawLine(n, Math.map(n, 0, 20, 52, 40), n, Math.map(n, 0, 20, 68, 80), color)
        }
    }
    return bg
}
BOSS_ROW = 7
BOSS_COL = 7
cyberPacman = sprites.create(assets.image`pacman`, SpriteKind.Player)
BOSS_SIZE = 3
BOSS_ENTRANCE_ROW = BOSS_ROW + 1
dungeonGrid = [
    [
        2,
        14,
        10,
        14,
        14,
        12,
        2,
        14,
        12,
        4
    ],
    [
        6,
        11,
        12,
        5,
        5,
        3,
        10,
        9,
        3,
        13
    ],
    [
        7,
        8,
        5,
        1,
        5,
        4,
        6,
        14,
        8,
        5
    ],
    [
        7,
        12,
        3,
        10,
        9,
        7,
        9,
        3,
        10,
        9
    ],
    [
        5,
        7,
        10,
        12,
        4,
        7,
        12,
        6,
        14,
        8
    ],
    [
        1,
        5,
        4,
        5,
        7,
        9,
        5,
        5,
        3,
        12
    ],
    [
        6,
        9,
        5,
        5,
        3,
        12,
        7,
        9,
        2,
        9
    ],
    [
        5,
        2,
        11,
        11,
        10,
        13,
        5,
        6,
        14,
        12
    ],
    [
        7,
        10,
        12,
        6,
        12,
        3,
        15,
        15,
        15,
        13
    ],
    [
        3,
        8,
        3,
        9,
        3,
        10,
        9,
        3,
        11,
        9
    ]
]
firewallRound = 1
let minigameReturnX: number
let minigameReturnY: number
popup1 = fancyText.create("(A)")
popup1.setKind(SpriteKind.popuptext)
popup1.setPosition(120, 20)
fancyText.setColor(popup1, 15)
popup1.setFlag(SpriteFlag.Invisible, true)
showCoordinates = true
GRID_SIZE = 10
SCREEN_WIDTH = 160
SCREEN_HEIGHT = 120
let SPEED=100
cyberPacman.setScale(0.25, ScaleAnchor.Middle)
cyberPacman.setPosition(80, 60)
controller.moveSprite(cyberPacman, SPEED, SPEED)
popup1hidden = true
console1 = sprites.create(img`
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 
    `, SpriteKind.Hud)
console1.setFlag(SpriteFlag.Invisible, true)
console1hidden = true
pauseButton = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . f f f . . . f f f . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Hud)
pauseButton.setPosition(155, 10)
keymap.setPlayerKeys(1, keymap.KeyCode.UpArrow, keymap.KeyCode.DownArrow, keymap.KeyCode.LeftArrow, keymap.KeyCode.RightArrow, keymap.KeyCode.Space, keymap.KeyCode.None)
roomTemplates = pregenerateRoomTemplates()
minimapSprite = sprites.create(createMinimapImage(), SpriteKind.Hud)
minimapSprite.setPosition(25, 95)
minimapSprite.z = -1
bg = image.create(160, 120)
bg.fill(1)
loadRoom(0, 0)
game.onUpdate(function () {
    if (debugActivated || minigameActive != "") {
        return
    }
    if (!(console1hidden) && isClose(cyberPacman, console1, 20)) {
        if (popup1hidden) {
            popup1.setFlag(SpriteFlag.Invisible, false)
            popup1hidden = false
        }
    } else if (!(popup1hidden)) {
        popup1.setFlag(SpriteFlag.Invisible, true)
        popup1hidden = true
    }
    if (facingright && cyberPacman.vx < 0) {
        cyberPacman.image.flipX()
        facingright = false
    } else if (!(facingright) && cyberPacman.vx > 0) {
        cyberPacman.image.flipX()
        facingright = true
    }
    hittingWall = false
    for (let wall of sprites.allOfKind(SpriteKind.Wall)) {
        if (cyberPacman.overlapsWith(wall)) {
            hittingWall = true
            break;
        }
    }
    if (!(showMinimap)){
        minimapSprite.setFlag(SpriteFlag.Invisible, true)
    }
    else {
        minimapSprite.setFlag(SpriteFlag.Invisible, false)
    }
    if (!(hittingWall)) {
        lastX = cyberPacman.x
        lastY = cyberPacman.y
    } else {
        cyberPacman.x = lastX
        cyberPacman.y = lastY
    }
    inDoorY = cyberPacman.y >= 52 && cyberPacman.y <= 68
    inDoorX = cyberPacman.x >= 72 && cyberPacman.x <= 88
    bossEdgeLeft = isBossCell(currentRoomRow, currentRoomCol) && isBossCell(currentRoomRow, currentRoomCol - 1)
    bossEdgeRight = isBossCell(currentRoomRow, currentRoomCol) && isBossCell(currentRoomRow, currentRoomCol + 1)
    bossEdgeUp = isBossCell(currentRoomRow, currentRoomCol) && isBossCell(currentRoomRow - 1, currentRoomCol)
    bossEdgeDown = isBossCell(currentRoomRow, currentRoomCol) && isBossCell(currentRoomRow + 1, currentRoomCol)
    if (cyberPacman.x < 0) {
        if ((bossEdgeLeft || inDoorY) && (roomBitValue & 8) != 0 && currentRoomCol > 0) {
            currentRoomCol += 0 - 1
            cyberPacman.x = 155
            loadRoom(currentRoomRow, currentRoomCol)
        } else {
            cyberPacman.x = 0
        }
    } else if (cyberPacman.x > SCREEN_WIDTH) {
        if ((bossEdgeRight || inDoorY) && (roomBitValue & 2) != 0 && currentRoomCol < GRID_SIZE - 1) {
            currentRoomCol += 1
            cyberPacman.x = 5
            loadRoom(currentRoomRow, currentRoomCol)
        } else {
            cyberPacman.x = SCREEN_WIDTH
        }
    } else if (cyberPacman.y < 0) {
        if ((bossEdgeUp || inDoorX) && (roomBitValue & 1) != 0 && currentRoomRow > 0) {
            currentRoomRow += 0 - 1
            cyberPacman.y = 115
            loadRoom(currentRoomRow, currentRoomCol)
        } else {
            cyberPacman.y = 0
        }
    } else if (cyberPacman.y > SCREEN_HEIGHT) {
        if ((bossEdgeDown || inDoorX) && (roomBitValue & 4) != 0 && currentRoomRow < GRID_SIZE - 1) {
            currentRoomRow += 1
            cyberPacman.y = 5
            loadRoom(currentRoomRow, currentRoomCol)
        } else {
            cyberPacman.y = SCREEN_HEIGHT
        }
    }
    updateEnemies()
})

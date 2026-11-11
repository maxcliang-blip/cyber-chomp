namespace SpriteKind {
    export const Wall = SpriteKind.create()
    export const Follower = SpriteKind.create()
    export const Hud = SpriteKind.create()
    export const popuptext = SpriteKind.create()
    export const minigameSprites = SpriteKind.create()
    export const minigameHud = SpriteKind.create()
}
function renderDebugOptions () {
    cleanUIElements(debugOptions)
    labels = [`1. Coordinates: ${showCoordinates ? "ON" : "OFF"}`, "2. Visualize Map", "3. Resume Game"]
    for (let k = 0; k <= 2; k++) {
        opt = fancyText.create(`${debugSelection == k ? "> " : " "}${labels[k]}`)
        fancyText.setColor(opt, debugSelection == k ? 2 : 15)
        fancyText.setFont(opt, fancyText.bold_sans_7)
        opt.setPosition(80, 45 + k * 12)
        debugOptions.push(opt)
    }
}
function clearMinigameHud () {
    sprites.destroyAllSpritesOfKind(SpriteKind.minigameHud)
}
function startMinigame (kind: string) {
    if (debugActivated || minigameActive != "") {
        return
    }
    minigameActive = kind
    minigameReturnX = cyberPacman.x
    minigameReturnY = cyberPacman.y
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
function pregenerateRoomTemplates () {
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
function cleanUIElements (arr: Sprite[]) {
    while (arr.length) {
        const item = arr.pop()
        if (item) {
            sprites.destroy(item)
        }
    }
}
function loadRoom (row: number, col: number) {
    console1hidden = true
    console1.setFlag(SpriteFlag.Invisible, true)
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
    if (row == 2 && col == 1) {
        console1hidden = false
        console1.setFlag(SpriteFlag.Invisible, false)
        console1.setPosition(100, 30)
    }
    scene.setBackgroundImage(roomTemplates[roomBitValue])
}
function clearMinigameSprites () {
    sprites.destroyAllSpritesOfKind(SpriteKind.minigameSprites)
}
function startFirewall () {
    // Placeholder until the Firewall Breach minigame is implemented.
    // Without this, starting the minigame hides the player forever (soft-lock).
    scene.setBackgroundImage(bg)
    cyberPacman.setFlag(SpriteFlag.Invisible, true)
    console1.setFlag(SpriteFlag.Invisible, true)
    popup1.setFlag(SpriteFlag.Invisible, true)
    console1hidden = true
    popup1hidden = true
    const placeholder = fancyText.create("Firewall Breach\ncoming soon...")
    placeholder.setKind(SpriteKind.minigameHud)
    fancyText.setColor(placeholder, 15)
    fancyText.setFont(placeholder, fancyText.bold_sans_7)
    placeholder.setPosition(80, 60)
    control.runInBackground(function () {
        pause(1200)
        if (minigameActive == "firewall") {
            endMinigame(false)
        }
    })
}
function drawDoor (bg: Image, side: number) {
    for (let i = 0; i <= 20; i++) {
        if (side == 0) {
            bg.drawLine(Math.map(i, 0, 20, 72, 60), i, Math.map(i, 0, 20, 88, 100), i, 15)
        }
        if (side == 1) {
            bg.drawLine(159 - i, Math.map(i, 0, 20, 52, 40), 159 - i, Math.map(i, 0, 20, 68, 80), 15)
        }
        if (side == 2) {
            bg.drawLine(Math.map(i, 0, 20, 72, 60), 119 - i, Math.map(i, 0, 20, 88, 100), 119 - i, 15)
        }
        if (side == 3) {
            bg.drawLine(i, Math.map(i, 0, 20, 52, 40), i, Math.map(i, 0, 20, 68, 80), 15)
        }
    }
    return bg
}
function drawDungeonMap (canvas: Image, offsetX: number, offsetY: number, cellSize: number, gap: number) {
    for (let s = 0; s <= GRID_SIZE - 1; s++) {
        for (let d = 0; d <= GRID_SIZE - 1; d++) {
            bits = dungeonGrid[s][d]
            if (bits > 0) {
                x = offsetX + d * (cellSize + gap)
                y = offsetY + s * (cellSize + gap)
                canvas.fillRect(x, y, cellSize, cellSize, (s == currentRoomRow && d == currentRoomCol) ? 4 : 1)
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
function endMinigame (won: boolean) {
    clearMinigameSprites()
    clearMinigameHud()
    minigameActive = ""
    if (won) {
    	
    }
    minimapSprite.setFlag(SpriteFlag.Invisible, false)
    pauseButton.setFlag(SpriteFlag.Invisible, false)
    cyberPacman.setFlag(SpriteFlag.Invisible, false)
    loadRoom(currentRoomRow, currentRoomCol)
    cyberPacman.setPosition(minigameReturnX, minigameReturnY)
}
function visualizeMap () {
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
function createMinimapImage () {
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
    if (!console1hidden && !(popup1hidden)) {
        startMinigame("firewall")
    }
})
function isClose (mySprite: Sprite, mySprite2: Sprite, dist: number) {
    return distance(mySprite.x, mySprite2.x, mySprite.y, mySprite2.y) < dist
}
function distance (x1: number, x2: number, y1: number, y2: number) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    handleNavigation(1)
})
function generateDungeonGrid (rows: number, cols: number) {
    let stack: number[][] = []
    let visited: boolean[][] = []
    for (let r = 0; r <= rows - 1; r++) {
        dungeonGrid.push([])
        visited.push([])
        for (let index = 0; index < cols; index++) {
            dungeonGrid[r].push(0)
            visited[r].push(false)
        }
    }
    visited[0][0] = true
    stack.push([0, 0])
    while (stack.length > 0) {
        let neighbors: number[][] = []
        curr = stack[stack.length - 1]
        cr = curr[0]
        cc = curr[1]
        if (cr > 0 && !(visited[cr - 1][cc])) {
            neighbors.push([
            cr - 1,
            cc,
            1,
            4
            ])
        }
        if (cc < cols - 1 && !(visited[cr][cc + 1])) {
            neighbors.push([
            cr,
            cc + 1,
            2,
            8
            ])
        }
        if (cr < rows - 1 && !(visited[cr + 1][cc])) {
            neighbors.push([
            cr + 1,
            cc,
            4,
            1
            ])
        }
        if (cc > 0 && !(visited[cr][cc - 1])) {
            neighbors.push([
            cr,
            cc - 1,
            8,
            2
            ])
        }
        if (neighbors.length > 0) {
            choice = neighbors[Math.randomRange(0, neighbors.length - 1)]
            dungeonGrid[cr][cc] |= choice[2];
dungeonGrid[choice[0]][choice[1]] |= choice[3]
visited[choice[0]][choice[1]] = true
            stack.push([choice[0], choice[1]])
        } else {
            stack.pop()
        }
    }
}
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
})
function handleNavigation (dir: number) {
    if (debugActivated && !(mapExitPrompt)) {
        debugSelection = (debugSelection + dir + 3) % 3
        renderDebugOptions()
    }
}
browserEvents.MouseLeft.onEvent(browserEvents.MouseButtonEvent.Pressed, function (x, y) {
    if (!(debugActivated) && minigameActive == "" && x < 160 && x > 145 && y < 20 && y > 0) {
        debugActivated = true
        renderDebugMenu()
    }
})
function restoreGameplayState () {
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
        . . . . . . . . . . . . . . . . . . f f f . . f f f . . . . . . . . . . f f f . . f f f . . . . . . . . . . f f f . . f f f . . . . . . . . . . f f f . . f f f . . . . . . . . . . f f f . . f f f . . . . . . . . . . f f f . . f f f . . . . . . . . . . f f f . . f f f . . . . . . . . . . f f f . . f f f . . . . . . . . . . f f f . . f f f . . . . . . . . . . 
        `)
    cyberPacman.setFlag(SpriteFlag.Invisible, false)
    cyberPacman.setPosition(debugPlayerX, debugPlayerY)
    controller.moveSprite(cyberPacman, 100, 100)
    debugActivated = false
    loadRoom(currentRoomRow, currentRoomCol)
}
function renderDebugMenu () {
    if (coordsText) {
        sprites.destroy(coordsText)
        coordsText = null
    }
    if (minimapSprite) {
        minimapSprite.setFlag(SpriteFlag.Invisible, true)
    }
    cyberPacman.setFlag(SpriteFlag.Invisible, true)
    debugPlayerX = cyberPacman.x
    debugPlayerY = cyberPacman.y
    controller.moveSprite(cyberPacman, 0, 0)
    pauseButton.setImage(img`
        . . . . . . . . . . . . . . . . . f f . . . . . . . . . . . . . . f f f f . . . . . . . . . . . . f f f f f f . . . . . . . . . . f f f f f f f f . . . . . . . . f f f f f f f f f . . . . . . . f f f f f f f f . . . . . . . . f f f f f f . . . . . . . . . . f f f f f . . . . . . . . . . . f f f f . . . . . . . . . . . . f f . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
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
browserEvents.Comma.onEvent(browserEvents.KeyEvent.Pressed, function () {
    if (debugActivated) {
        restoreGameplayState()
    }
})
let lastY = 0
let lastX = 0
let hittingWall = false
let debugPlayerY = 0
let debugPlayerX = 0
let debugActivated = false
let curr: number[] = []
let mm: Image = null
let size = 0
let cv: Image = null
let y = 0
let x = 0
let baseImg: Image = null
let minigameActive = ""
let opt: fancyText.TextSprite = null
let debugOptions: fancyText.TextSprite[] = []
let bg: Image = null
let minimapSprite: Sprite = null
let roomTemplates: Image[] = []
let pauseButton: Sprite = null
let console1hidden = false
let console1: Sprite = null
let popup1hidden = false
let cyberPacman: Sprite = null
let SCREEN_HEIGHT = 0
let SCREEN_WIDTH = 0
let GRID_SIZE = 0
let popup1: fancyText.TextSprite = null
let choice: number[] = []
let cc = 0
let cr = 0
let bits = 0
let labels: string[] = []
let debugHint: fancyText.TextSprite = null
let debugTitle: fancyText.TextSprite = null
let mapExitPrompt: fancyText.TextSprite = null
let coordsText: fancyText.TextSprite = null
let dungeonGrid: number[][] = []
let debugSelection = 0
let roomBitValue = 0
let currentRoomCol = 0
let currentRoomRow = 0
let showCoordinates = false
let tempcount = 0
let hasArenakey = false
let hasBlueKey = false
let hasRedKey = false
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
cyberPacman = sprites.create(assets.image`pacman`, SpriteKind.Player)
cyberPacman.setScale(0.25, ScaleAnchor.Middle)
cyberPacman.setPosition(80, 60)
controller.moveSprite(cyberPacman, 200, 200)
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
// A is "/" for the laser. B is unbound until a B action exists.
keymap.setPlayerKeys(1, keymap.KeyCode.UpArrow, keymap.KeyCode.DownArrow, keymap.KeyCode.LeftArrow, keymap.KeyCode.RightArrow, keymap.KeyCode.ForwardSlash, keymap.KeyCode.None)
generateDungeonGrid(GRID_SIZE, GRID_SIZE)
roomTemplates = pregenerateRoomTemplates()
minimapSprite = sprites.create(createMinimapImage(), SpriteKind.Hud)
minimapSprite.setPosition(25, 95)
// Keep the minimap below the player so the player is never hidden by it.
minimapSprite.z = -1
loadRoom(2, 1)
bg = image.create(160, 120)
bg.fill(1)
let blanknode = sprites.create(img`
    . f f f f f . 
    f 1 1 1 1 1 f 
    f 1 1 1 1 1 f 
    f 1 1 1 1 1 f 
    f 1 1 1 1 1 f 
    f 1 1 1 1 1 f 
    . f f f f f . 
    `, SpriteKind.Hud)
blanknode.setFlag(SpriteFlag.Invisible, true)
game.onUpdate(function () {
    if (debugActivated) {
        return
    }
    if (!console1hidden && isClose(cyberPacman, console1, 20)) {
        if (popup1hidden) {
            popup1.setFlag(SpriteFlag.Invisible, false)
            popup1hidden = false
        }
    } else if (!(popup1hidden)) {
        popup1.setFlag(SpriteFlag.Invisible, true)
        popup1hidden = true
    }
    hittingWall = false
    for (let wall of sprites.allOfKind(SpriteKind.Wall)) {
        if (cyberPacman.overlapsWith(wall)) {
            hittingWall = true
            break;
        }
    }
    if (!(hittingWall)) {
        lastX = cyberPacman.x
        lastY = cyberPacman.y
    } else {
        cyberPacman.x = lastX
        cyberPacman.y = lastY
    }
    if (cyberPacman.x < 0) {
        if (cyberPacman.y >= 52 && cyberPacman.y <= 68 && (roomBitValue & 8) != 0 && currentRoomCol > 0) {
            currentRoomCol += 0 - 1
            loadRoom(currentRoomRow, currentRoomCol)
            cyberPacman.x = 155
        } else {
            cyberPacman.x = 0
        }
    } else if (cyberPacman.x > SCREEN_WIDTH) {
        if (cyberPacman.y >= 52 && cyberPacman.y <= 68 && (roomBitValue & 2) != 0 && currentRoomCol < GRID_SIZE - 1) {
            currentRoomCol += 1
            loadRoom(currentRoomRow, currentRoomCol)
            cyberPacman.x = 5
        } else {
            cyberPacman.x = SCREEN_WIDTH
        }
    } else if (cyberPacman.y < 0) {
        if (cyberPacman.x >= 72 && cyberPacman.x <= 88 && (roomBitValue & 1) != 0 && currentRoomRow > 0) {
            currentRoomRow += 0 - 1
            loadRoom(currentRoomRow, currentRoomCol)
            cyberPacman.y = 115
        } else {
            cyberPacman.y = 0
        }
    } else if (cyberPacman.y > SCREEN_HEIGHT) {
        if (cyberPacman.x >= 72 && cyberPacman.x <= 88 && (roomBitValue & 4) != 0 && currentRoomRow < GRID_SIZE - 1) {
            currentRoomRow += 1
            loadRoom(currentRoomRow, currentRoomCol)
            cyberPacman.y = 5
        } else {
            cyberPacman.y = SCREEN_HEIGHT
        }
    }
})

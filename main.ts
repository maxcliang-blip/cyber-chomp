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
function isBossCell (row: number, col: number) {
    return row >= BOSS_ROW && row < BOSS_ROW + BOSS_SIZE && col >= BOSS_COL && col < BOSS_COL + BOSS_SIZE
}
function drawBossBackground (row: number, col: number) {
    if (!bossBackground) {
        bossBackground = image.create(SCREEN_WIDTH, SCREEN_HEIGHT)
    }
    bossBackground.fill(1)
    const r = row - BOSS_ROW
    const c = col - BOSS_COL
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
function loadRoom (row: number, col: number) {
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
}
function clearMinigameSprites () {
    sprites.destroyAllSpritesOfKind(SpriteKind.minigameSprites)
}
function startFirewall () {
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
            let newNode = sprites.create(blanknode.image, SpriteKind.minigameHud)
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
function makeFirewallSequence (length: number) {
    const sequence: number[] = []
    for (let i = 0; i < length; i++) {
        sequence.push(Math.floor(Math.random() * 9))
    }
    return sequence
}
function currentFirewallSequence () {
    if (firewallRound == 2) {
        return round2sequence
    }
    if (firewallRound == 3) {
        return round3sequence
    }
    return round1sequence
}
function resetFirewallNodes () {
    for (let r = 0; r <= 2; r++) {
        for (let c = 0; c <= 2; c++) {
            nodelist[r][c].setImage(blanknode.image)
        }
    }
}
function playFirewallSequence (withCountdown: boolean) {
    acceptingFirewallInput = false
    firewallInputIndex = 0
    const sequence = currentFirewallSequence()
    control.runInBackground(function () {
        if (withCountdown) {
            const countdown = fancyText.create("Starting in: 3", 0, 15, fancyText.bold_sans_7)
            countdown.setKind(SpriteKind.minigameHud)
            countdown.setPosition(80, 10)
            for (let count = 3; count >= 1; count--) {
                if (minigameActive != "firewall") {
                    return
                }
                fancyText.setText(countdown, `Starting in: ${count}`)
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
        for (let idx of sequence) {
            if (minigameActive != "firewall") {
                return
            }
            const r = Math.floor(idx / 3)
            const c = idx % 3
            nodelist[r][c].setImage(sequencenode.image)
            pause(350)
            if (minigameActive != "firewall") {
                return
            }
            nodelist[r][c].setImage(blanknode.image)
            pause(150)
        }
        if (minigameActive == "firewall") {
            acceptingFirewallInput = true
        }
    })
}
function getFirewallNodeAt (x: number, y: number) {
    for (let r = 0; r <= 2; r++) {
        for (let c = 0; c <= 2; c++) {
            if (Math.abs(x - nodelist[r][c].x) <= 15 && Math.abs(y - nodelist[r][c].y) <= 15) {
                return r * 3 + c
            }
        }
    }
    return -1
}
function handleFirewallInput (nodeIndex: number) {
    if (!acceptingFirewallInput || minigameActive != "firewall") {
        return
    }
    const sequence = currentFirewallSequence()
    const r = Math.floor(nodeIndex / 3)
    const c = nodeIndex % 3
    const node = nodelist[r][c]
    if (nodeIndex == sequence[firewallInputIndex]) {
        node.setImage(correctnode.image)
        firewallInputIndex += 1
        if (firewallInputIndex >= sequence.length) {
            acceptingFirewallInput = false
            if (firewallRound >= 3) {
                const clearText = fancyText.create("FIREWALL BREACHED", 0, 7, fancyText.bold_sans_7)
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
                const clearText = fancyText.create(`ROUND ${firewallRound} CLEAR`, 0, 7, fancyText.bold_sans_7)
                clearText.setKind(SpriteKind.minigameHud)
                clearText.setPosition(80, 10)
                control.runInBackground(function () {
                    pause(900)
                    if (minigameActive == "firewall") {
                        sprites.destroy(clearText)
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
        const failText = fancyText.create("SEQUENCE FAILED", 0, 2, fancyText.bold_sans_7)
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
function drawDoor (bg: Image, side: number, color: number = 15) {
    for (let i = 0; i <= 20; i++) {
        if (side == 0) {
            bg.drawLine(Math.map(i, 0, 20, 72, 60), i, Math.map(i, 0, 20, 88, 100), i, color)
        }
        if (side == 1) {
            bg.drawLine(159 - i, Math.map(i, 0, 20, 52, 40), 159 - i, Math.map(i, 0, 20, 68, 80), color)
        }
        if (side == 2) {
            bg.drawLine(Math.map(i, 0, 20, 72, 60), 119 - i, Math.map(i, 0, 20, 88, 100), 119 - i, color)
        }
        if (side == 3) {
            bg.drawLine(i, Math.map(i, 0, 20, 52, 40), i, Math.map(i, 0, 20, 68, 80), color)
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
                canvas.fillRect(x, y, cellSize, cellSize, (s == currentRoomRow && d == currentRoomCol) ? 4 : (isBossCell(s, d) ? 2 : 1))
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
    acceptingFirewallInput = false
    minigameActive = ""
    if (won) {
    	
    }
    minimapSprite.setFlag(SpriteFlag.Invisible, false)
    pauseButton.setFlag(SpriteFlag.Invisible, false)
    cyberPacman.setFlag(SpriteFlag.Invisible, false)
    controller.moveSprite(cyberPacman, 200, 200)
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
    if (minigameActive == "firewall" && acceptingFirewallInput) {
        const nodeIndex = getFirewallNodeAt(x, y)
        if (nodeIndex >= 0) {
            handleFirewallInput(nodeIndex)
        }
        return
    }
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
    } else if (minigameActive != "") {
        // Temporary escape hatch so an unfinished minigame cannot soft-lock the game.
        endMinigame(false)
    }
})
let lastY = 0
let lastX = 0
let hittingWall = false
let debugPlayerY = 0
let debugPlayerX = 0
let debugActivated = false
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
let bossBackground: Image = null
let minimapSprite: Sprite = null
let roomTemplates: Image[] = []
let pauseButton: Sprite = null
let console1hidden = false
let consoleRemoved = false
let console1: Sprite = null
let popup1hidden = false
let cyberPacman: Sprite = null
let SCREEN_HEIGHT = 0
let SCREEN_WIDTH = 0
let GRID_SIZE = 0
let popup1: fancyText.TextSprite = null
let bits = 0
let labels: string[] = []
let debugHint: fancyText.TextSprite = null
let debugTitle: fancyText.TextSprite = null
let mapExitPrompt: fancyText.TextSprite = null
let coordsText: fancyText.TextSprite = null
// Fixed 10x10 dungeon layout. Each number is a bitmask of open doors:
// 1 = north, 2 = east, 4 = south, 8 = west.
// The 3x3 boss arena is at rows 7-9, cols 7-9, entered from the west.
const BOSS_ROW = 7
const BOSS_COL = 7
const BOSS_SIZE = 3
const BOSS_ENTRANCE_ROW = BOSS_ROW + 1
const dungeonGrid: number[][] = [
    [2, 14, 10, 14, 14, 12, 2, 14, 12, 4],
    [6, 11, 12, 5, 5, 3, 10, 9, 3, 13],
    [7, 8, 5, 1, 5, 4, 6, 14, 8, 5],
    [7, 12, 3, 10, 9, 7, 9, 3, 10, 9],
    [5, 7, 10, 12, 4, 7, 12, 6, 14, 8],
    [1, 5, 4, 5, 7, 9, 5, 5, 3, 12],
    [6, 9, 5, 5, 3, 12, 7, 9, 2, 9],
    [5, 2, 11, 11, 10, 13, 5, 6, 14, 12],
    [7, 10, 12, 6, 12, 3, 15, 15, 15, 13],
    [3, 8, 3, 9, 3, 10, 9, 3, 11, 9],
]
let debugSelection = 0
let roomBitValue = 0
let currentRoomCol = 0
let currentRoomRow = 0
let showCoordinates = false
let tempcount = 0
let hasArenakey = false
let hasBlueKey = false
let hasRedKey = false
let acceptingFirewallInput = false
let firewallInputIndex = 0
let firewallRound = 1
let round1sequence: number[] = []
let round2sequence: number[] = []
let round3sequence: number[] = []
let nodelist: Sprite[][] = []
let wrongnode: Sprite = null
let correctnode: Sprite = null
let sequencenode: Sprite = null
let blanknode: Sprite = null
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
roomTemplates = pregenerateRoomTemplates()
minimapSprite = sprites.create(createMinimapImage(), SpriteKind.Hud)
minimapSprite.setPosition(25, 95)
// Keep the minimap below the player so the player is never hidden by it.
minimapSprite.z = -1
bg = image.create(160, 120)
bg.fill(1)
loadRoom(2, 1)
game.onUpdate(function () {
    if (debugActivated || minigameActive != "") {
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
    const inDoorY = cyberPacman.y >= 52 && cyberPacman.y <= 68
    const inDoorX = cyberPacman.x >= 72 && cyberPacman.x <= 88
    const bossEdgeLeft = isBossCell(currentRoomRow, currentRoomCol) && isBossCell(currentRoomRow, currentRoomCol - 1)
    const bossEdgeRight = isBossCell(currentRoomRow, currentRoomCol) && isBossCell(currentRoomRow, currentRoomCol + 1)
    const bossEdgeUp = isBossCell(currentRoomRow, currentRoomCol) && isBossCell(currentRoomRow - 1, currentRoomCol)
    const bossEdgeDown = isBossCell(currentRoomRow, currentRoomCol) && isBossCell(currentRoomRow + 1, currentRoomCol)
    if (cyberPacman.x < 0) {
        if ((bossEdgeLeft || inDoorY) && (roomBitValue & 8) != 0 && currentRoomCol > 0) {
            currentRoomCol += 0 - 1
            loadRoom(currentRoomRow, currentRoomCol)
            cyberPacman.x = 155
        } else {
            cyberPacman.x = 0
        }
    } else if (cyberPacman.x > SCREEN_WIDTH) {
        if ((bossEdgeRight || inDoorY) && (roomBitValue & 2) != 0 && currentRoomCol < GRID_SIZE - 1) {
            currentRoomCol += 1
            loadRoom(currentRoomRow, currentRoomCol)
            cyberPacman.x = 5
        } else {
            cyberPacman.x = SCREEN_WIDTH
        }
    } else if (cyberPacman.y < 0) {
        if ((bossEdgeUp || inDoorX) && (roomBitValue & 1) != 0 && currentRoomRow > 0) {
            currentRoomRow += 0 - 1
            loadRoom(currentRoomRow, currentRoomCol)
            cyberPacman.y = 115
        } else {
            cyberPacman.y = 0
        }
    } else if (cyberPacman.y > SCREEN_HEIGHT) {
        if ((bossEdgeDown || inDoorX) && (roomBitValue & 4) != 0 && currentRoomRow < GRID_SIZE - 1) {
            currentRoomRow += 1
            loadRoom(currentRoomRow, currentRoomCol)
            cyberPacman.y = 5
        } else {
            cyberPacman.y = SCREEN_HEIGHT
        }
    }
})

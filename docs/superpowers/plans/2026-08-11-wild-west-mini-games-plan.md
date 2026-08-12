# Wild West Mini Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a foolproof, 8-game Wild West mini-game collection for a projector, controlled by Buzz Controllers.

**Architecture:** Vanilla HTML5 Canvas, modular JS files, global state machine, Gamepad API for input.

**Tech Stack:** HTML, CSS, Vanilla JS. (No build tools)

## Global Constraints

- Must run via `index.html` without a server/build step.
- Must support 4 Buzz Controllers via Gamepad API.
- Only uses Red Button (primary) and colored buttons for menu.
- Aesthetic: Wild West theme, massive fonts, high contrast.

---

### Task 1: Project Setup & State Machine

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/main.js`
- Create: `tests/test_state.js`

**Interfaces:**
- Consumes: None
- Produces: `changeState(newState)`, global `gameState` object.

- [x] **Step 1: Write the failing test for state machine**

```javascript
// tests/test_state.js
const assert = require('assert');
// Mock window/document if needed or keep state logic pure
const { gameState, changeState } = require('../js/main.js');

try {
    changeState('GAME_ACTIVE');
    assert.strictEqual(gameState.current, 'GAME_ACTIVE');
    console.log("State machine passed");
} catch(e) {
    console.error("Failed:", e.message);
    process.exit(1);
}
```

- [x] **Step 2: Run test to verify it fails**

Run: `node tests/test_state.js`
Expected: FAIL (Cannot find module)

- [x] **Step 3: Write minimal implementation**

```javascript
// js/main.js
const gameState = { current: 'MENU' };
function changeState(newState) {
    gameState.current = newState;
}
// Export for testing in Node, but safe for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, changeState };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `node tests/test_state.js`
Expected: PASS

- [x] **Step 5: Create Scaffolding**
Create `index.html` that includes `js/main.js` and sets up a `<canvas id="gameCanvas"></canvas>`. Create `css/style.css` with basic fullscreen canvas styling.

- [x] **Step 6: Commit**

```bash
git add .
git commit -m "feat: project setup and state machine"
```

---

### Task 2: Input Handler (Gamepad API)

**Files:**
- Create: `js/input.js`
- Create: `tests/test_input.js`

**Interfaces:**
- Consumes: Gamepad API
- Produces: `getInputState()`, returning `{ players: [ { red: false, blue: false, yellow: false } ] }`

- [x] **Step 1: Write the failing test**

```javascript
// tests/test_input.js
const assert = require('assert');
const { parseGamepadState } = require('../js/input.js');

const mockGamepad = { buttons: [{pressed: true}, {pressed: false}] }; // Assume 0 is Red
const state = parseGamepadState([mockGamepad]);
assert.strictEqual(state.players[0].red, true);
console.log("Input mapping passed");
```

- [x] **Step 2: Run test to verify it fails**

Run: `node tests/test_input.js`
Expected: FAIL

- [x] **Step 3: Write minimal implementation**

```javascript
// js/input.js
// Standard Gamepad mappings vary, but let's assume button 0 is Red.
function parseGamepadState(gamepads) {
    const state = { players: [] };
    for (let i = 0; i < 4; i++) {
        let gp = gamepads[i];
        if (gp) {
            state.players.push({
                red: gp.buttons[0]?.pressed || false,
                blue: gp.buttons[1]?.pressed || false,
                yellow: gp.buttons[2]?.pressed || false
            });
        } else {
            state.players.push({ red: false, blue: false, yellow: false });
        }
    }
    return state;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseGamepadState };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `node tests/test_input.js`
Expected: PASS

- [x] **Step 5: Hook into game loop**
In `js/main.js`, add a `requestAnimationFrame` loop that calls `navigator.getGamepads()` and passes it to `parseGamepadState`.

- [x] **Step 6: Commit**

```bash
git add js/input.js js/main.js tests/test_input.js
git commit -m "feat: input handler using gamepad api"
```

---

### Task 3: Menu Carousel

**Files:**
- Create: `js/menu.js`
- Modify: `js/main.js`

**Interfaces:**
- Consumes: `getInputState()`
- Produces: Rendered carousel on Canvas, `selectedGame` index.

- [x] **Step 1: Write the failing test**

```javascript
// tests/test_menu.js
const assert = require('assert');
const { updateMenu, menuState } = require('../js/menu.js');

menuState.selectedIndex = 0;
// Simulate blue button (move left)
updateMenu({ players: [{ blue: true, yellow: false, red: false }]});
assert.strictEqual(menuState.selectedIndex, 7); // Loops back to end of 8 games
console.log("Menu update passed");
```

- [x] **Step 2: Run test to verify it fails**

Run: `node tests/test_menu.js`
Expected: FAIL

- [x] **Step 3: Write minimal implementation**

```javascript
// js/menu.js
const menuState = { selectedIndex: 0, cooldown: 0 };
const gamesList = ['Quick Draw', 'Gold Rush', 'Lasso Catch', 'Bandit Whack', 'Dynamite Toss', 'Horse Race', 'Snake Bite', 'Telegraph'];

function updateMenu(input) {
    if (menuState.cooldown > 0) menuState.cooldown--;
    
    if (menuState.cooldown === 0) {
        if (input.players[0].blue) { // Move Left
            menuState.selectedIndex = (menuState.selectedIndex - 1 + gamesList.length) % gamesList.length;
            menuState.cooldown = 15;
        } else if (input.players[0].yellow) { // Move Right
            menuState.selectedIndex = (menuState.selectedIndex + 1) % gamesList.length;
            menuState.cooldown = 15;
        } else if (input.players[0].red) { // Select
            // Trigger changeState logic
        }
    }
}
function drawMenu(ctx, width, height) {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,width,height);
    ctx.fillStyle = "white";
    ctx.font = "40px sans-serif";
    ctx.fillText("Selected: " + gamesList[menuState.selectedIndex], width/2 - 100, height/2);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateMenu, menuState, gamesList };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `node tests/test_menu.js`
Expected: PASS

- [x] **Step 5: Hook up rendering**
In `js/main.js`, add `drawMenu()` and `updateMenu()` to the main loop when `gameState.current === 'MENU'`.

- [x] **Step 6: Commit**

```bash
git add js/menu.js js/main.js tests/test_menu.js
git commit -m "feat: menu carousel logic"
```

---

### Task 4: Base Game Wrapper

**Files:**
- Create: `js/game_wrapper.js`
- Modify: `js/main.js`

**Interfaces:**
- Consumes: Game configurations.
- Produces: Timer, scoreboard display, cleanup routines.

- [x] **Step 1: Setup Time Limit Logic**
Create a wrapper that automatically ends a game after 60 seconds and shows a scoreboard for 10 seconds, then calls `changeState('MENU')`.

- [x] **Step 2: Commit**

```bash
git add js/game_wrapper.js js/main.js
git commit -m "feat: 60s timer and scoreboard wrapper"
```

*(Note: Subsequent tasks will implement the 8 individual games following this same pattern of logical state tests and canvas rendering injection, but we will start execution on Tasks 1-4 first to validate the architecture).*

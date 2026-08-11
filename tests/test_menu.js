// tests/test_menu.js
const assert = require('assert');
const { updateMenu, menuState, gamesList, drawMenu } = require('../js/menu.js');

// Test 1: Move left (blue button) wraps from index 0 to last index (7)
menuState.selectedIndex = 0;
menuState.cooldown = 0;
updateMenu({ players: [{ blue: true, yellow: false, red: false }] });
assert.strictEqual(menuState.selectedIndex, 7, 'Blue button should wrap selectedIndex from 0 to 7');

// Reset cooldown for next test
menuState.cooldown = 0;

// Test 2: Move right (yellow button) increments selectedIndex
menuState.selectedIndex = 0;
updateMenu({ players: [{ blue: false, yellow: true, red: false }] });
assert.strictEqual(menuState.selectedIndex, 1, 'Yellow button should increment selectedIndex from 0 to 1');

// Reset cooldown
menuState.cooldown = 0;

// Test 3: Move right (yellow button) wraps from 7 to 0
menuState.selectedIndex = 7;
updateMenu({ players: [{ blue: false, yellow: true, red: false }] });
assert.strictEqual(menuState.selectedIndex, 0, 'Yellow button should wrap selectedIndex from 7 to 0');

// Test 4: Cooldown prevents rapid repeated navigation
menuState.selectedIndex = 0;
menuState.cooldown = 10;
updateMenu({ players: [{ blue: false, yellow: true, red: false }] });
assert.strictEqual(menuState.selectedIndex, 0, 'Index should not change while cooldown > 0');

// Test 4b: Negative cooldown is treated defensively as ready (<= 0)
menuState.selectedIndex = 0;
menuState.cooldown = -5;
updateMenu({ players: [{ blue: false, yellow: true, red: false }] });
assert.strictEqual(menuState.selectedIndex, 1, 'Negative cooldown should be treated defensively as ready');

// Test 5: Red button triggers state change to GAME_ACTIVE
let stateChangedTo = null;
global.changeState = (newState) => {
    stateChangedTo = newState;
};
menuState.cooldown = 0;
updateMenu({ players: [{ blue: false, yellow: false, red: true }] });
assert.strictEqual(stateChangedTo, 'GAME_ACTIVE', 'Red button should trigger changeState("GAME_ACTIVE")');

// Test 6: drawMenu executes without errors with mock context
const mockCtx = {
    fillStyle: '',
    font: '',
    strokeStyle: '',
    lineWidth: 1,
    textAlign: '',
    textBaseline: '',
    fillRect: () => {},
    strokeRect: () => {},
    fillText: () => {},
    save: () => {},
    restore: () => {}
};
drawMenu(mockCtx, 800, 600);

console.log("Menu update passed");

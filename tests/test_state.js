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

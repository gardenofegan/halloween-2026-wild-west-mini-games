// tests/test_state.js
const assert = require('assert');
const { gameState, changeState, updateInput } = require('../js/main.js');

try {
    changeState('GAME_ACTIVE');
    assert.strictEqual(gameState.current, 'GAME_ACTIVE');

    updateInput();
    assert.ok(gameState.input, 'gameState.input should be populated after updateInput');
    assert.strictEqual(gameState.input.players.length, 4, 'gameState.input should contain 4 players');

    console.log("State machine passed");
} catch(e) {
    console.error("Failed:", e.message);
    process.exit(1);
}

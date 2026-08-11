// tests/test_game_wrapper.js
const assert = require('assert');
const { updateGame, gameStateWrapper, drawGameWrapper } = require('../js/game_wrapper.js');

// Test 1: Timer counts down and transitions state from PLAYING to SCOREBOARD
gameStateWrapper.timer = 60;
gameStateWrapper.state = 'PLAYING';

// Simulate 61 seconds passing at 60fps (3660 frames)
for (let i = 0; i < 3660; i++) {
    updateGame();
}

assert.strictEqual(gameStateWrapper.state, 'SCOREBOARD', 'State should be SCOREBOARD after timer expires');

// Test 2: Scoreboard counts down and triggers changeState('MENU')
let stateChangedTo = null;
if (typeof global !== 'undefined') {
    global.changeState = (newState) => {
        stateChangedTo = newState;
    };
}
if (typeof window !== 'undefined') {
    window.changeState = (newState) => {
        stateChangedTo = newState;
    };
}

// Scoreboard timer starts at 600 frames (10s). Fast-forward 600 frames.
for (let i = 0; i < 600; i++) {
    updateGame();
}
assert.strictEqual(stateChangedTo, 'MENU', 'changeState("MENU") should be called after scoreboard timer expires');

// Test 3: drawGameWrapper executes cleanly with mock context
const mockCtx = {
    fillStyle: '',
    font: '',
    textAlign: '',
    fillRect: () => {},
    fillText: () => {}
};
drawGameWrapper(mockCtx, 800, 600);

console.log("Game wrapper timer passed");

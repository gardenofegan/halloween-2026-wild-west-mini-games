// tests/test_game_wrapper.js
const assert = require('assert');
const { updateGame, gameStateWrapper, drawGameWrapper, resetGameWrapper } = require('../js/game_wrapper.js');

// Test 1: Timer counts down and transitions state from PLAYING to SCOREBOARD
resetGameWrapper();

// Simulate 60 seconds passing at 60fps (3600 frames)
for (let i = 0; i < 3600; i++) {
    updateGame();
}

assert.strictEqual(gameStateWrapper.state, 'SCOREBOARD', 'State should be SCOREBOARD after timer expires');
assert.strictEqual(gameStateWrapper.scoreBoardTimer, 600, 'Scoreboard timer should start at 600 frames');

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

// Reset state specifically for Scoreboard test: 600 frames (10s countdown)
gameStateWrapper.state = 'SCOREBOARD';
gameStateWrapper.scoreBoardTimer = 600;

// Run 599 frames - state should NOT have changed to MENU yet
for (let i = 0; i < 599; i++) {
    updateGame();
}
assert.strictEqual(stateChangedTo, null, 'changeState("MENU") should not be called before 600 frames');
assert.strictEqual(gameStateWrapper.state, 'SCOREBOARD', 'State should still be SCOREBOARD at frame 599');

// Frame 600: scoreboard timer expires
updateGame();
assert.strictEqual(stateChangedTo, 'MENU', 'changeState("MENU") should be called after scoreboard timer expires');
assert.strictEqual(gameStateWrapper.state, 'IDLE', 'State should transition to IDLE after scoreboard timer expires');

// Test 3: Additional updateGame call when IDLE does not re-trigger changeState('MENU')
stateChangedTo = null;
updateGame();
assert.strictEqual(stateChangedTo, null, 'changeState("MENU") should not be called repeatedly');

// Test 4: drawGameWrapper executes cleanly with mock context
const mockCtx = {
    fillStyle: '',
    font: '',
    textAlign: '',
    fillRect: () => {},
    fillText: () => {}
};
drawGameWrapper(mockCtx, 800, 600);

console.log("Game wrapper timer passed");

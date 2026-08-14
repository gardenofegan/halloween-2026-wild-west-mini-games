// tests/test_game_wrapper.js
const assert = require('assert');
const { updateGame, gameStateWrapper, drawGameWrapper, resetGameWrapper } = require('../js/game_wrapper.js');

// Test 1: Timer counts down and transitions state from PLAYING to SCOREBOARD
resetGameWrapper();
const mockInput = { players: [{ red: false }, { red: false }, { red: false }, { red: false }] };
updateGame(mockInput); // First frame for edge detection
mockInput.players[0].red = true;
updateGame(mockInput); // Check in player 1

// Simulate 300 frames for check-in to finish
for (let i = 0; i < 300; i++) {
    updateGame(mockInput);
}
assert.strictEqual(gameStateWrapper.state, 'PLAYING', 'State should transition from CHECK_IN to PLAYING');

// Simulate 30 seconds passing at 60fps (1800 frames)
for (let i = 0; i < 1800; i++) {
    updateGame(mockInput);
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
    updateGame(mockInput);
}
assert.strictEqual(stateChangedTo, null, 'changeState("MENU") should not be called before 600 frames');
assert.strictEqual(gameStateWrapper.state, 'SCOREBOARD', 'State should still be SCOREBOARD at frame 599');

// Frame 600: scoreboard timer expires
updateGame(mockInput);
assert.strictEqual(stateChangedTo, 'MENU', 'changeState("MENU") should be called after scoreboard timer expires');
assert.strictEqual(gameStateWrapper.state, 'IDLE', 'State should transition to IDLE after scoreboard timer expires');

// Test 3: Additional updateGame call when IDLE does not re-trigger changeState('MENU')
stateChangedTo = null;
updateGame(mockInput);
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

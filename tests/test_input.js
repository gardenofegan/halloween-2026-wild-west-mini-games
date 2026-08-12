// tests/test_input.js
const assert = require('assert');
const { parseGamepadState, getInputState } = require('../js/input.js');

// Test 1: Mapped gamepad state parsing for 4 players
const mockGamepad0 = { buttons: [{ pressed: true }, { pressed: false }, { pressed: true }, { pressed: false }, { pressed: false }] };
const mockGamepad1 = { buttons: [{ pressed: false }, { pressed: true }, { pressed: false }, { pressed: true }, { pressed: true }] };

const state = parseGamepadState([mockGamepad0, mockGamepad1]);

assert.strictEqual(state.players.length, 4, 'Should always return 4 player slots');
assert.strictEqual(state.players[0].red, true, 'Player 1 red button pressed');
assert.strictEqual(state.players[0].green, false, 'Player 1 green button not pressed');
assert.strictEqual(state.players[0].yellow, true, 'Player 1 yellow button pressed');
assert.strictEqual(state.players[0].blue, false, 'Player 1 blue button not pressed');

assert.strictEqual(state.players[1].red, false, 'Player 2 red button not pressed');
assert.strictEqual(state.players[1].green, true, 'Player 2 green button pressed');
assert.strictEqual(state.players[1].orange, true, 'Player 2 orange button pressed');
assert.strictEqual(state.players[1].blue, true, 'Player 2 blue button pressed');
assert.strictEqual(state.players[1].yellow, false, 'Player 2 yellow button not pressed');

assert.strictEqual(state.players[2].red, false, 'Player 3 default red false');
assert.strictEqual(state.players[3].red, false, 'Player 4 default red false');

// Test 2: Safe handling of empty/null gamepad array
const emptyState = parseGamepadState([]);
assert.strictEqual(emptyState.players.length, 4);
assert.strictEqual(emptyState.players[0].red, false);

// Test 3: getInputState handles missing navigator gracefully
const defaultInputState = getInputState();
assert.strictEqual(defaultInputState.players.length, 4);

console.log("Input mapping passed");

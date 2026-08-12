const assert = require('assert');
const fs = require('fs');
const path = require('path');

// We need to require the file but it might not exist yet, or we'll just let it fail.
let quickDraw;
try {
    quickDraw = require('../js/games/quick_draw.js');
} catch(e) {
    console.error('Failed to load quick_draw.js: ', e.message);
    process.exit(1);
}

function runTests() {
    console.log('Testing Quick Draw...');
    
    // Test Initial State
    quickDraw.reset();
    assert.deepStrictEqual(quickDraw.scores, [0, 0, 0, 0], 'Scores should reset to 0');
    assert.strictEqual(quickDraw.state, 'WAITING', 'Initial state should be WAITING');
    
    // Simulate False Start
    quickDraw.update({
        players: [
            { red: true, blue: false, yellow: false, green: false }, // Player 1 false start
            { red: false, blue: false, yellow: false, green: false },
            { red: false, blue: false, yellow: false, green: false },
            { red: false, blue: false, yellow: false, green: false }
        ]
    });
    
    assert.strictEqual(quickDraw.falseStarts[0], true, 'Player 1 should have false started');
    
    // Wait until DRAW state
    let safetyCounter = 0;
    while(quickDraw.state === 'WAITING' && safetyCounter < 60 * 10) {
        quickDraw.update({ players: [{}, {}, {}, {}] });
        safetyCounter++;
    }
    
    assert.strictEqual(quickDraw.state, 'DRAW', 'State should transition to DRAW');
    
    // Player 1 tries to press red (false started)
    quickDraw.update({
        players: [
            { red: true },
            { red: false },
            { red: false },
            { red: false }
        ]
    });
    assert.strictEqual(quickDraw.scores[0], 0, 'Player 1 cannot score after false start');
    assert.strictEqual(quickDraw.state, 'DRAW', 'State should still be DRAW');

    // Player 2 presses red correctly
    quickDraw.update({
        players: [
            { red: false },
            { red: true },
            { red: false },
            { red: false }
        ]
    });
    
    assert.strictEqual(quickDraw.scores[1], 1, 'Player 2 should score 1 point');
    assert.strictEqual(quickDraw.state, 'ROUND_OVER', 'State should change to ROUND_OVER');
    
    // Wait out ROUND_OVER
    safetyCounter = 0;
    while(quickDraw.state === 'ROUND_OVER' && safetyCounter < 60 * 5) {
        quickDraw.update({ players: [{}, {}, {}, {}] });
        safetyCounter++;
    }
    
    assert.strictEqual(quickDraw.state, 'WAITING', 'State should return to WAITING');
    assert.deepStrictEqual(quickDraw.falseStarts, [false, false, false, false], 'False starts should be reset');
    
    console.log('All Quick Draw tests passed!');
}

runTests();

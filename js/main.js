// js/main.js
let inputModule;
if (typeof require !== 'undefined') {
    try {
        inputModule = require('./input.js');
    } catch (e) {
        // Ignored in non-CommonJS module contexts
    }
}

const gameState = { current: 'MENU', input: null };

function changeState(newState) {
    gameState.current = newState;
}

function updateInput() {
    const fetchInput = (typeof getInputState === 'function')
        ? getInputState
        : (inputModule && inputModule.getInputState);
    if (fetchInput) {
        gameState.input = fetchInput();
    }
}

function gameLoop() {
    updateInput();
    if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(gameLoop);
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        gameLoop();
    });
}

// Export for testing in Node, but safe for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, changeState, updateInput, gameLoop };
}

// js/main.js
const gameState = { current: 'MENU' };

function changeState(newState) {
    gameState.current = newState;
}

// Export for testing in Node, but safe for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, changeState };
}

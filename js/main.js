// js/main.js
let inputModule;
let menuModule;
if (typeof require !== 'undefined') {
    try {
        inputModule = require('./input.js');
        menuModule = require('./menu.js');
    } catch (e) {
        // Ignored in non-CommonJS module contexts
    }
}

const gameState = { current: 'MENU', input: null };

function changeState(newState) {
    gameState.current = newState;
}

if (typeof window !== 'undefined') {
    window.changeState = changeState;
}
if (typeof global !== 'undefined') {
    global.changeState = changeState;
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

    const doUpdateMenu = (typeof updateMenu === 'function')
        ? updateMenu
        : (menuModule && menuModule.updateMenu);
    const doDrawMenu = (typeof drawMenu === 'function')
        ? drawMenu
        : (menuModule && menuModule.drawMenu);

    if (gameState.current === 'MENU') {
        if (doUpdateMenu && gameState.input) {
            doUpdateMenu(gameState.input);
        }
        if (typeof document !== 'undefined') {
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx && doDrawMenu) {
                    doDrawMenu(ctx, canvas.width, canvas.height);
                }
            }
        }
    }

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

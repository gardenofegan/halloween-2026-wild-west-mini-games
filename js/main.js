// js/main.js
let inputModule;
let menuModule;
let gameWrapperModule;
if (typeof require !== 'undefined') {
    try {
        inputModule = require('./input.js');
        menuModule = require('./menu.js');
        gameWrapperModule = require('./game_wrapper.js');
    } catch (e) {
        // Ignored in non-CommonJS module contexts
    }
}

const gameState = { current: 'MENU', input: null };

function changeState(newState) {
    gameState.current = newState;
    if (newState === 'GAME_ACTIVE') {
        const doResetGame = (typeof resetGameWrapper === 'function')
            ? resetGameWrapper
            : (gameWrapperModule && gameWrapperModule.resetGameWrapper);
        if (doResetGame) {
            doResetGame();
        }
    }
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

let cachedCanvas = null;

function gameLoop() {
    updateInput();

    const doUpdateMenu = (typeof updateMenu === 'function')
        ? updateMenu
        : (menuModule && menuModule.updateMenu);
    const doDrawMenu = (typeof drawMenu === 'function')
        ? drawMenu
        : (menuModule && menuModule.drawMenu);
    const doUpdateGame = (typeof updateGame === 'function')
        ? updateGame
        : (gameWrapperModule && gameWrapperModule.updateGame);
    const doDrawGameWrapper = (typeof drawGameWrapper === 'function')
        ? drawGameWrapper
        : (gameWrapperModule && gameWrapperModule.drawGameWrapper);

    if (gameState.current === 'MENU') {
        if (doUpdateMenu && gameState.input) {
            doUpdateMenu(gameState.input);
        }
        if (typeof document !== 'undefined') {
            if (!cachedCanvas) {
                cachedCanvas = document.getElementById('gameCanvas');
            }
            if (cachedCanvas) {
                const ctx = cachedCanvas.getContext('2d');
                if (ctx && doDrawMenu) {
                    doDrawMenu(ctx, cachedCanvas.width, cachedCanvas.height);
                }
            }
        }
    } else if (gameState.current === 'GAME_ACTIVE') {
        if (doUpdateGame) {
            doUpdateGame();
        }
        if (typeof document !== 'undefined') {
            if (!cachedCanvas) {
                cachedCanvas = document.getElementById('gameCanvas');
            }
            if (cachedCanvas) {
                const ctx = cachedCanvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, cachedCanvas.width, cachedCanvas.height);
                    ctx.fillStyle = '#2b1d0c';
                    ctx.fillRect(0, 0, cachedCanvas.width, cachedCanvas.height);
                    if (doDrawGameWrapper) {
                        doDrawGameWrapper(ctx, cachedCanvas.width, cachedCanvas.height);
                    }
                }
            }
        }
    }

    if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(gameLoop);
    }
}

if (typeof window !== 'undefined') {
    if (typeof document !== 'undefined' && document.readyState !== 'loading') {
        gameLoop();
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            gameLoop();
        });
    }
}

// Export for testing in Node, but safe for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, changeState, updateInput, gameLoop };
}

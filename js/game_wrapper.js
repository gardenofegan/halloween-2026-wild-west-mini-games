// js/game_wrapper.js
const gameStateWrapper = { timer: 3600, state: 'PLAYING', scoreBoardTimer: 600 }; // 60s at 60fps, 10s scoreboard

function resetGameWrapper() {
    gameStateWrapper.timer = 3600;
    gameStateWrapper.state = 'PLAYING';
    gameStateWrapper.scoreBoardTimer = 600;
}

function updateGame() {
    if (gameStateWrapper.state === 'PLAYING') {
        gameStateWrapper.timer--;
        if (gameStateWrapper.timer <= 0) {
            gameStateWrapper.state = 'SCOREBOARD';
            gameStateWrapper.scoreBoardTimer = 600;
        }
    } else if (gameStateWrapper.state === 'SCOREBOARD') {
        gameStateWrapper.scoreBoardTimer--;
        if (gameStateWrapper.scoreBoardTimer <= 0) {
            gameStateWrapper.state = 'IDLE';
            // Trigger changeState('MENU')
            if (typeof window !== 'undefined' && window.changeState) {
                window.changeState('MENU');
            } else if (typeof global !== 'undefined' && global.changeState) {
                global.changeState('MENU');
            } else if (typeof changeState === 'function') {
                changeState('MENU');
            }
        }
    }
}

function drawGameWrapper(ctx, width, height) {
    if (gameStateWrapper.state === 'SCOREBOARD') {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 60px 'Rye', 'Impact', sans-serif";
        ctx.fillText("TIME'S UP! SCOREBOARD:", width / 2, height / 2 - 50);
    } else {
        // Draw the 60s timer in the corner
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.font = "bold 30px 'Rye', sans-serif";
        ctx.fillText("Time: " + Math.max(0, Math.ceil(gameStateWrapper.timer / 60)), width - 20, 40);
    }
}

if (typeof window !== 'undefined') {
    window.gameStateWrapper = gameStateWrapper;
    window.resetGameWrapper = resetGameWrapper;
    window.updateGame = updateGame;
    window.drawGameWrapper = drawGameWrapper;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateGame, gameStateWrapper, drawGameWrapper, resetGameWrapper };
}

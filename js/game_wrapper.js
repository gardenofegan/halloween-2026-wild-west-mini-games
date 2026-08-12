// js/game_wrapper.js
const gameStateWrapper = { timer: 3600, state: 'CHECK_IN', checkInTimer: 300, scoreBoardTimer: 600, activeGame: null, activePlayers: [false, false, false, false], prevInput: null };

function resetGameWrapper(gameIndex) {
    gameStateWrapper.timer = 3600;
    gameStateWrapper.state = 'CHECK_IN';
    gameStateWrapper.checkInTimer = 300; // 5 seconds
    gameStateWrapper.scoreBoardTimer = 600;
    gameStateWrapper.activePlayers = [false, false, false, false];
    gameStateWrapper.prevInput = null;
    
    // Look up game by index
    let gameModule = null;
    if (typeof window !== 'undefined') {
        if (gameIndex === 0 && window.quickDraw) gameModule = window.quickDraw;
        if (gameIndex === 1 && window.goldRush) gameModule = window.goldRush;
        if (gameIndex === 2 && window.lassoCatch) gameModule = window.lassoCatch;
        if (gameIndex === 3 && window.banditWhack) gameModule = window.banditWhack;
        if (gameIndex === 4 && window.dynamiteToss) gameModule = window.dynamiteToss;
        if (gameIndex === 5 && window.horseRace) gameModule = window.horseRace;
        if (gameIndex === 6 && window.snakeBite) gameModule = window.snakeBite;
        if (gameIndex === 7 && window.telegraphDecoder) gameModule = window.telegraphDecoder;
        // add others as they are built
    } else if (typeof global !== 'undefined') {
        try {
            if (gameIndex === 0) gameModule = require('./games/quick_draw.js');
            if (gameIndex === 1) gameModule = require('./games/gold_rush.js');
            if (gameIndex === 2) gameModule = require('./games/lasso_catch.js');
            if (gameIndex === 3) gameModule = require('./games/bandit_whack.js');
            if (gameIndex === 4) gameModule = require('./games/dynamite_toss.js');
            if (gameIndex === 5) gameModule = require('./games/horse_race.js');
            if (gameIndex === 6) gameModule = require('./games/snake_bite.js');
            if (gameIndex === 7) gameModule = require('./games/telegraph_decoder.js');
        } catch (e) {}
    }
    
    gameStateWrapper.activeGame = gameModule;
    if (gameStateWrapper.activeGame && gameStateWrapper.activeGame.reset) {
        gameStateWrapper.activeGame.reset();
    }
}

function updateGame(input) {
    if (!gameStateWrapper.prevInput) {
        gameStateWrapper.prevInput = { players: input.players.map(p => ({ ...p })) };
        return;
    }

    const isPressed = (playerIndex, btn) => {
        return input.players[playerIndex][btn] && !gameStateWrapper.prevInput.players[playerIndex][btn];
    };

    if (gameStateWrapper.state === 'CHECK_IN') {
        gameStateWrapper.checkInTimer--;
        let newJoin = false;
        
        for (let i = 0; i < 4; i++) {
            if (isPressed(i, 'red') && !gameStateWrapper.activePlayers[i]) {
                gameStateWrapper.activePlayers[i] = true;
                newJoin = true;
            }
        }
        
        if (newJoin) {
            gameStateWrapper.checkInTimer = 300; // Reset countdown to 5s if someone joins
        }
        
        const anyJoined = gameStateWrapper.activePlayers.some(p => p);
        if (anyJoined && gameStateWrapper.checkInTimer <= 0) {
            gameStateWrapper.state = 'PLAYING';
        }
    } else if (gameStateWrapper.state === 'PLAYING') {
        gameStateWrapper.timer--;
        if (gameStateWrapper.timer <= 0) {
            gameStateWrapper.state = 'SCOREBOARD';
            gameStateWrapper.scoreBoardTimer = 600;
        } else if (gameStateWrapper.activeGame && gameStateWrapper.activeGame.update) {
            // Filter input for active players only
            const filteredInput = {
                players: input.players.map((p, i) => gameStateWrapper.activePlayers[i] ? { ...p } : { red: false, green: false, yellow: false, orange: false, blue: false })
            };
            gameStateWrapper.activeGame.update(filteredInput, gameStateWrapper.activePlayers);
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
    
    gameStateWrapper.prevInput = { players: input.players.map(p => ({ ...p })) };
}

function drawGameWrapper(ctx, width, height) {
    if (gameStateWrapper.state === 'CHECK_IN') {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, width, height);
        
        ctx.textAlign = "center";
        ctx.fillStyle = "#f5a623";
        ctx.font = "bold 60px 'Rye', 'Impact', sans-serif";
        ctx.fillText("PRESS RED TO JOIN!", width / 2, height / 2 - 100);

        const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db'];
        ctx.font = "bold 40px 'Rye', 'Impact', sans-serif";
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = gameStateWrapper.activePlayers[i] ? colors[i] : "#555";
            ctx.fillText(`PLAYER ${i + 1}`, width / 4 * i + width / 8, height / 2);
            if (gameStateWrapper.activePlayers[i]) {
                ctx.fillText("READY!", width / 4 * i + width / 8, height / 2 + 50);
            }
        }

        const anyJoined = gameStateWrapper.activePlayers.some(p => p);
        if (anyJoined) {
            ctx.fillStyle = "white";
            ctx.font = "bold 40px 'Rye', 'Impact', sans-serif";
            ctx.fillText(`Game starting in ${Math.ceil(gameStateWrapper.checkInTimer / 60)}...`, width / 2, height / 2 + 150);
        }
        return;
    }

    if (gameStateWrapper.state === 'PLAYING' && gameStateWrapper.activeGame && gameStateWrapper.activeGame.draw) {
        gameStateWrapper.activeGame.draw(ctx, width, height);
    }

    if (gameStateWrapper.state === 'SCOREBOARD') {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 60px 'Rye', 'Impact', sans-serif";
        ctx.fillText("TIME'S UP! SCOREBOARD:", width / 2, height / 2 - 100);

        if (gameStateWrapper.activeGame && gameStateWrapper.activeGame.scores) {
            const scores = gameStateWrapper.activeGame.scores;
            const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db']; // Red, Green, Yellow, Blue
            for (let i = 0; i < 4; i++) {
                ctx.fillStyle = colors[i];
                ctx.fillText(`Player ${i + 1}: ${scores[i]}`, width / 2, height / 2 + (i * 60));
            }
        }
    } else if (gameStateWrapper.state === 'PLAYING') {
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

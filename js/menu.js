// js/menu.js
const menuState = { selectedIndex: 0, cooldown: 0 };
const gamesList = [
    'Quick Draw',
    'Gold Rush',
    'Lasso Catch',
    'Bandit Whack',
    'Dynamite Toss',
    'Horse Race',
    'Snake Bite',
    'Telegraph'
];

function updateMenu(input) {
    if (menuState.cooldown > 0) menuState.cooldown--;

    if (!input || !input.players || !input.players[0]) return;

    if (menuState.cooldown <= 0) {
        if (input.players[0].blue) { // Move Left
            menuState.selectedIndex = (menuState.selectedIndex - 1 + gamesList.length) % gamesList.length;
            menuState.cooldown = 15;
        } else if (input.players[0].yellow) { // Move Right
            menuState.selectedIndex = (menuState.selectedIndex + 1) % gamesList.length;
            menuState.cooldown = 15;
        } else if (input.players[0].red) { // Select
            const doChangeState = (typeof changeState === 'function')
                ? changeState
                : (typeof window !== 'undefined' && window.changeState
                    ? window.changeState
                    : (typeof global !== 'undefined' && global.changeState
                        ? global.changeState
                        : null));
            if (doChangeState) {
                doChangeState('GAME_ACTIVE');
            }
        }
    }
}

function drawMenu(ctx, width, height) {
    if (ctx.save) ctx.save();

    // Background: Dark Wild West wood theme
    ctx.fillStyle = "#1a0f00";
    ctx.fillRect(0, 0, width, height);

    // Outer decorative border frame
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 8;
    if (typeof ctx.strokeRect === 'function') {
        ctx.strokeRect(20, 20, width - 40, height - 40);
    }

    // Set text alignment to center
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Header Title
    ctx.fillStyle = "#d4a359";
    ctx.font = "bold 48px 'Rye', 'Impact', sans-serif";
    ctx.fillText("★ WILD WEST MINI-GAMES ★", width / 2, height * 0.2);

    // Selected Game Box
    const boxWidth = Math.min(width * 0.7, 600);
    const boxHeight = 140;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    ctx.fillStyle = "#3d2314";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = "#d4a359";
    ctx.lineWidth = 4;
    if (typeof ctx.strokeRect === 'function') {
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    }

    // Game Title in Massive Font
    ctx.fillStyle = "#fff8dc";
    ctx.font = "bold 56px 'Rye', 'Impact', sans-serif";
    ctx.fillText(gamesList[menuState.selectedIndex], width / 2, height / 2);

    // Navigation Prompts
    ctx.font = "bold 24px 'Rye', 'Impact', sans-serif";

    // Blue button (Left)
    ctx.fillStyle = "#4a90e2";
    ctx.fillText("◄ [BLUE] PREV", width / 2 - boxWidth / 2 - 110, height / 2);

    // Yellow button (Right)
    ctx.fillStyle = "#f5a623";
    ctx.fillText("NEXT [YELLOW] ►", width / 2 + boxWidth / 2 + 110, height / 2);

    // Red button prompt
    ctx.fillStyle = "#e74c3c";
    ctx.font = "bold 32px 'Rye', 'Impact', sans-serif";
    ctx.fillText("PRESS BIG RED BUTTON TO START!", width / 2, height * 0.82);

    if (ctx.restore) ctx.restore();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateMenu, menuState, gamesList, drawMenu };
}

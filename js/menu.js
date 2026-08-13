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

const menuAssets = {
    panel: null, buttonBlue: null, buttonYellow: null, buttonRed: null, navSound: null, selectSound: null
};
if (typeof window !== 'undefined') {
    menuAssets.panel = new Image(); menuAssets.panel.src = 'assets/images/ui-pack/PNG/panel_brown.png';
    menuAssets.buttonBlue = new Image(); menuAssets.buttonBlue.src = 'assets/images/ui-pack/PNG/buttonLong_blue.png';
    menuAssets.buttonYellow = new Image(); menuAssets.buttonYellow.src = 'assets/images/ui-pack/PNG/buttonLong_beige.png';
    menuAssets.buttonRed = new Image(); menuAssets.buttonRed.src = 'assets/images/ui-pack/PNG/buttonLong_brown.png';
    if (typeof Audio !== 'undefined') {
        menuAssets.navSound = new Audio('assets/images/ui-pack/Sounds/tap-a.ogg');
        menuAssets.selectSound = new Audio('assets/images/ui-pack/Sounds/click-a.ogg');
    }
}
function playSnd(s) { if(s) { s.cloneNode().play().catch(e=>{}); } }

function updateMenu(input) {
    if (menuState.cooldown > 0) menuState.cooldown--;

    if (!input || !input.players || !input.players[0]) return;

    if (menuState.cooldown <= 0) {
        if (input.players[0].blue) { // Move Left
            playSnd(menuAssets.navSound);
            menuState.selectedIndex = (menuState.selectedIndex - 1 + gamesList.length) % gamesList.length;
            menuState.cooldown = 15;
        } else if (input.players[0].yellow) { // Move Right
            playSnd(menuAssets.navSound);
            menuState.selectedIndex = (menuState.selectedIndex + 1) % gamesList.length;
            menuState.cooldown = 15;
        } else if (input.players[0].red) { // Select
            playSnd(menuAssets.selectSound);
            const doChangeState = (typeof changeState === 'function')
                ? changeState
                : (typeof window !== 'undefined' && window.changeState
                    ? window.changeState
                    : (typeof global !== 'undefined' && global.changeState
                        ? global.changeState
                        : null));
            if (doChangeState) {
                doChangeState('GAME_ACTIVE', menuState.selectedIndex);
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
    ctx.fillText("* WILD WEST MINI-GAMES *", width / 2, height * 0.2);

    // Selected Game Box
    const boxWidth = Math.min(width * 0.7, 600);
    const boxHeight = 140;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    if (menuAssets.panel && menuAssets.panel.complete) {
        ctx.drawImage(menuAssets.panel, boxX, boxY, boxWidth, boxHeight);
    } else {
        ctx.fillStyle = "#3d2314";
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = "#d4a359";
        ctx.lineWidth = 4;
        if (typeof ctx.strokeRect === 'function') {
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        }
    }

    // Game Title in Massive Font
    ctx.fillStyle = "#fff8dc";
    ctx.font = "bold 56px 'Rye', 'Impact', sans-serif";
    ctx.fillText(gamesList[menuState.selectedIndex], width / 2, height / 2);

    // Navigation Prompts
    ctx.font = "bold 24px 'Rye', 'Impact', sans-serif";

    // Blue button (Left)
    if (menuAssets.buttonBlue && menuAssets.buttonBlue.complete) {
        ctx.drawImage(menuAssets.buttonBlue, boxX - 320, height / 2 - 40, 300, 80);
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("< [BLUE] PREV", boxX - 170, height / 2);

    // Yellow button (Right)
    if (menuAssets.buttonYellow && menuAssets.buttonYellow.complete) {
        ctx.drawImage(menuAssets.buttonYellow, boxX + boxWidth + 20, height / 2 - 40, 300, 80);
    }
    ctx.fillStyle = "#333"; // dark text on beige
    ctx.fillText("NEXT [YELLOW] >", boxX + boxWidth + 170, height / 2);

    // Red button prompt
    ctx.font = "bold 32px 'Rye', 'Impact', sans-serif";
    if (menuAssets.buttonRed && menuAssets.buttonRed.complete) {
        ctx.drawImage(menuAssets.buttonRed, width / 2 - 400, height * 0.8 - 40, 800, 80);
    }
    ctx.fillStyle = "#fff";
    ctx.fillText("PRESS BIG RED BUTTON TO START!", width / 2, height * 0.8);

    if (ctx.restore) ctx.restore();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateMenu, menuState, gamesList, drawMenu };
}

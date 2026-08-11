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

    if (menuState.cooldown === 0) {
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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.font = "40px sans-serif";
    ctx.fillText("Selected: " + gamesList[menuState.selectedIndex], width / 2 - 100, height / 2);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateMenu, menuState, gamesList, drawMenu };
}

// js/input.js
/**
 * Standard Gamepad mappings for Buzz Controllers / standard gamepads:
 * Button 0: Red (Primary)
 * Button 1: Blue
 * Button 2: Yellow
 */

function parseGamepadState(gamepads) {
    const state = { players: [] };
    const pads = gamepads || [];
    for (let i = 0; i < 4; i++) {
        let gp = pads[i];
        if (gp) {
            state.players.push({
                red: !!(gp.buttons && gp.buttons[0] && gp.buttons[0].pressed),
                blue: !!(gp.buttons && gp.buttons[1] && gp.buttons[1].pressed),
                yellow: !!(gp.buttons && gp.buttons[2] && gp.buttons[2].pressed)
            });
        } else {
            state.players.push({ red: false, blue: false, yellow: false });
        }
    }
    return state;
}

function getInputState() {
    let gamepads = [];
    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
        gamepads = navigator.getGamepads();
    }
    return parseGamepadState(gamepads);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseGamepadState, getInputState };
}

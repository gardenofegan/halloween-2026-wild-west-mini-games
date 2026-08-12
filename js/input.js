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
    
    // Check if it's a single 20-button gamepad (Buzz Controller adapter)
    const isSingleBuzzAdapter = pads[0] && pads[0].buttons && pads[0].buttons.length >= 20;

    for (let i = 0; i < 4; i++) {
        let gp;
        let buttonOffset = 0;
        
        if (isSingleBuzzAdapter) {
            gp = pads[0];
            buttonOffset = i * 5;
        } else {
            gp = pads[i];
            buttonOffset = 0;
        }

        if (gp) {
            state.players.push({
                red: !!(gp.buttons && gp.buttons[buttonOffset + 0] && gp.buttons[buttonOffset + 0].pressed),
                yellow: !!(gp.buttons && gp.buttons[buttonOffset + 1] && gp.buttons[buttonOffset + 1].pressed),
                green: !!(gp.buttons && gp.buttons[buttonOffset + 2] && gp.buttons[buttonOffset + 2].pressed),
                orange: !!(gp.buttons && gp.buttons[buttonOffset + 3] && gp.buttons[buttonOffset + 3].pressed),
                blue: !!(gp.buttons && gp.buttons[buttonOffset + 4] && gp.buttons[buttonOffset + 4].pressed)
            });
        } else {
            state.players.push({ red: false, green: false, yellow: false, orange: false, blue: false });
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

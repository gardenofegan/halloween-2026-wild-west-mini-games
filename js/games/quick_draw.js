// js/games/quick_draw.js
const quickDraw = {
    name: 'Quick Draw',
    scores: [0, 0, 0, 0],
    state: 'WAITING',
    timer: 0,
    falseStarts: [false, false, false, false],
    winnerIndex: -1,
    
    prevInput: null,

    reset: function() {
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        this.startNewRound();
    },

    startNewRound: function() {
        this.state = 'WAITING';
        this.falseStarts = [false, false, false, false];
        this.winnerIndex = -1;
        // Random timer between 2 and 6 seconds (120 to 360 frames at 60fps)
        this.timer = Math.floor(Math.random() * 240) + 120;
    },

    update: function(input) {
        if (!input || !input.players) return;

        if (!this.prevInput) {
            this.prevInput = { players: input.players.map(p => ({ ...p })) };
            return; // Skip first frame to prevent menu button holds from bleeding in
        }

        const isPressed = (playerIndex, btn) => {
            return input.players[playerIndex][btn] && !this.prevInput.players[playerIndex][btn];
        };

        if (this.state === 'WAITING') {
            this.timer--;
            
            // Check for false starts
            for (let i = 0; i < 4; i++) {
                if (isPressed(i, 'red') && !this.falseStarts[i]) {
                    this.falseStarts[i] = true;
                }
            }

            if (this.timer <= 0) {
                this.state = 'DRAW';
            }
        } else if (this.state === 'DRAW') {
            for (let i = 0; i < 4; i++) {
                if (isPressed(i, 'red') && !this.falseStarts[i]) {
                    // We have a winner
                    this.winnerIndex = i;
                    this.scores[i]++;
                    this.state = 'ROUND_OVER';
                    this.timer = 180; // Show winner for 3 seconds (180 frames)
                    break;
                }
            }
        } else if (this.state === 'ROUND_OVER') {
            this.timer--;
            if (this.timer <= 0) {
                this.startNewRound();
            }
        }

        this.prevInput = { players: input.players.map(p => ({ ...p })) };
    },

    draw: function(ctx, width, height) {
        ctx.textAlign = 'center';
        
        if (this.state === 'WAITING') {
            ctx.fillStyle = 'white';
            ctx.font = "bold 60px 'Rye', 'Impact', sans-serif";
            ctx.fillText("WAIT FOR IT...", width / 2, height / 2);
            
            // Show false starts
            ctx.font = "bold 30px 'Rye', sans-serif";
            for (let i = 0; i < 4; i++) {
                if (this.falseStarts[i]) {
                    ctx.fillStyle = 'red';
                    ctx.fillText(`Player ${i+1} FALSE START!`, width / 2, height / 2 + 50 + i * 40);
                }
            }
        } else if (this.state === 'DRAW') {
            ctx.fillStyle = '#ff3333';
            ctx.font = "bold 120px 'Rye', 'Impact', sans-serif";
            ctx.fillText("DRAW!", width / 2, height / 2);
        } else if (this.state === 'ROUND_OVER') {
            ctx.fillStyle = 'yellow';
            ctx.font = "bold 80px 'Rye', 'Impact', sans-serif";
            ctx.fillText(`PLAYER ${this.winnerIndex + 1} WINS ROUND!`, width / 2, height / 2);
        }

        // Draw current scores at bottom
        ctx.font = "bold 30px 'Rye', sans-serif";
        const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db'];
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillText(`P${i+1}: ${this.scores[i]}`, width / 4 * i + width / 8, height - 50);
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = quickDraw;
}
if (typeof window !== 'undefined') {
    window.quickDraw = quickDraw;
}

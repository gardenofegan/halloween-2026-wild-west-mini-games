// js/games/snake_bite.js
const snakeBite = {
    name: 'Snake Bite',
    scores: [0, 0, 0, 0],
    
    state: 'RATTLING', // RATTLING, STRIKING, ROUND_OVER
    timer: 0,
    eliminated: [false, false, false, false],
    winnerIndex: -1,
    
    prevInput: null,

    reset: function() {
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        this.startNewRound();
    },

    startNewRound: function() {
        this.state = 'RATTLING';
        this.eliminated = [false, false, false, false];
        this.winnerIndex = -1;
        // Random rattle time between 2 and 6 seconds (120 to 360 frames)
        this.timer = Math.floor(Math.random() * 240) + 120;
    },

    update: function(input, activePlayers) {
        if (!input || !input.players) return;

        if (!this.prevInput) {
            this.prevInput = { players: input.players.map(p => ({ ...p })) };
            return;
        }

        const isPressed = (playerIndex, btn) => {
            return input.players[playerIndex][btn] && !this.prevInput.players[playerIndex][btn];
        };

        if (this.state === 'RATTLING') {
            this.timer--;
            
            let allEliminated = true;
            let anyActive = false;

            // Check for false starts
            for (let i = 0; i < 4; i++) {
                if (activePlayers && activePlayers[i]) {
                    anyActive = true;
                    if (isPressed(i, 'red') && !this.eliminated[i]) {
                        this.eliminated[i] = true;
                    }
                    if (!this.eliminated[i]) {
                        allEliminated = false;
                    }
                }
            }

            // If everyone got eliminated, restart round early
            if (anyActive && allEliminated) {
                this.startNewRound();
                this.prevInput = { players: input.players.map(p => ({ ...p })) };
                return;
            }

            if (this.timer <= 0) {
                this.state = 'STRIKING';
            }
        } else if (this.state === 'STRIKING') {
            for (let i = 0; i < 4; i++) {
                if (activePlayers && activePlayers[i] && !this.eliminated[i]) {
                    if (isPressed(i, 'red')) {
                        // We have a winner
                        this.winnerIndex = i;
                        this.scores[i]++;
                        this.state = 'ROUND_OVER';
                        this.timer = 120; // Show winner for 2 seconds (120 frames)
                        break;
                    }
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
        const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db'];
        
        if (this.state === 'RATTLING') {
            ctx.fillStyle = '#fff';
            ctx.font = "bold 50px 'Rye', 'Impact', sans-serif";
            ctx.fillText("DON'T MOVE YET...", width / 2, 80);

            // Draw Snake Rattling
            ctx.save();
            ctx.translate(width / 2, height / 2 + 50);
            
            // Coil body
            ctx.fillStyle = '#6b8e23'; // Olive green
            ctx.beginPath();
            ctx.ellipse(0, 0, 120, 40, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0, -30, 90, 30, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head (looking calm)
            ctx.beginPath();
            ctx.arc(-40, -80, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-55, -90, 5, 0, Math.PI * 2); // Eye
            ctx.fill();
            
            // Rattle tail vibrating
            const shake = (Math.floor(Date.now() / 30) % 2 === 0) ? 10 : -10;
            ctx.fillStyle = '#d4a359';
            ctx.beginPath();
            ctx.ellipse(80 + shake, -20, 20, 10, Math.PI/4, 0, Math.PI * 2);
            ctx.fill();

            // Rattle lines
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(70 + shake, -25); ctx.lineTo(90 + shake, -5);
            ctx.moveTo(80 + shake, -30); ctx.lineTo(100 + shake, -10);
            ctx.stroke();

            ctx.restore();

        } else if (this.state === 'STRIKING') {
            ctx.fillStyle = '#e74c3c';
            ctx.font = "bold 80px 'Rye', 'Impact', sans-serif";
            ctx.fillText("STRIKE!", width / 2, 100);

            // Draw Snake Striking
            ctx.save();
            ctx.translate(width / 2, height / 2 + 50);
            
            // Coil body (smaller, uncoiled)
            ctx.fillStyle = '#6b8e23';
            ctx.beginPath();
            ctx.ellipse(0, 0, 80, 20, 0, 0, Math.PI * 2);
            ctx.fill();

            // Long stretched neck
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-150, -150);
            ctx.lineWidth = 40;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#6b8e23';
            ctx.stroke();

            // Huge open mouth head
            ctx.translate(-150, -150);
            ctx.fillStyle = '#6b8e23';
            ctx.beginPath();
            ctx.arc(0, 0, 50, Math.PI * 1.2, Math.PI * 0.8, true);
            ctx.fill();

            // Fangs
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(-40, -10);
            ctx.lineTo(-45, 30);
            ctx.lineTo(-20, -10);
            ctx.fill();

            // Angry Eye
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(-10, -20, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

        } else if (this.state === 'ROUND_OVER') {
            ctx.fillStyle = 'yellow';
            ctx.font = "bold 80px 'Rye', 'Impact', sans-serif";
            ctx.fillText(`PLAYER ${this.winnerIndex + 1} SURVIVES!`, width / 2, height / 2);
        }

        // Draw Player Status / Scores
        ctx.font = "bold 35px 'Rye', sans-serif";
        for (let i = 0; i < 4; i++) {
            const px = width / 4 * i + width / 8;
            
            if (this.eliminated[i]) {
                ctx.fillStyle = '#777'; // Gray out eliminated
                ctx.fillText(`P${i+1}: BITTEN!`, px, height - 60);
                // Draw cross out line
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(px - 60, height - 70);
                ctx.lineTo(px + 60, height - 50);
                ctx.stroke();
            } else {
                ctx.fillStyle = colors[i];
                ctx.fillText(`P${i+1}: ${this.scores[i]}`, px, height - 60);
            }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = snakeBite;
}
if (typeof window !== 'undefined') {
    window.snakeBite = snakeBite;
}

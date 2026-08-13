// js/games/snake_bite.js
const snakeBite = {
    name: 'Snake Bite',
    scores: [0, 0, 0, 0],
    
    state: 'RATTLING', // RATTLING, STRIKING, ROUND_OVER
    timer: 0,
    eliminated: [false, false, false, false],
    winnerIndex: -1,
    
    prevInput: null,
    images: {},

    loadImages: function() {
        if (typeof Image !== 'undefined' && !this.images.snake) {
            this.images.snake = new Image();
            this.images.snake.src = 'assets/images/animals/PNG/Round/snake.png';
        }
    },

    reset: function() {
        this.loadImages();
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
            
            const shake = (Math.floor(Date.now() / 30) % 2 === 0) ? 5 : -5;
            ctx.translate(shake, 0);

            if (this.images.snake && this.images.snake.complete) {
                const w = this.images.snake.width * 2;
                const h = this.images.snake.height * 2;
                ctx.drawImage(this.images.snake, -w/2, -h/2, w, h);
            }
            ctx.restore();

        } else if (this.state === 'STRIKING') {
            ctx.fillStyle = '#e74c3c';
            ctx.font = "bold 80px 'Rye', 'Impact', sans-serif";
            ctx.fillText("STRIKE!", width / 2, 100);

            // Draw Snake Striking
            ctx.save();
            ctx.translate(width / 2, height / 2 + 50);
            
            if (this.images.snake && this.images.snake.complete) {
                // Make it huge and slightly moved up
                const w = this.images.snake.width * 6;
                const h = this.images.snake.height * 6;
                ctx.drawImage(this.images.snake, -w/2, -h/2 - 100, w, h);
            }
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

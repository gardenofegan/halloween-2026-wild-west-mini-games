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
        if (typeof Image !== 'undefined' && !this.images.snakes) {
            this.images.snakes = [];
            const files = ['SnakeAlbino-Walk.png', 'SnakeBlue-Walk.png', 'SnakeBrown-Walk.png', 'SnakeCorn-Walk.png', 'SnakeGreen-Walk.png', 'SnakeRed-Walk.png'];
            for (let f of files) {
                let img = new Image();
                img.src = 'assets/images/snakes/' + f;
                this.images.snakes.push(img);
            }
        }
        if (typeof Audio !== 'undefined' && !this.audio) {
            this.audio = {
                rattle: new Audio('assets/audio/impact-audio/impactGeneric_light_000.ogg'),
                strike: new Audio('assets/audio/impact-audio/impactSoft_heavy_000.ogg')
            };
            this.audio.rattle.volume = 0.5;
        }
    },

    reset: function() {
        this.loadImages();
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        this.globalAnimTimer = 0;
        this.currentSnakeIndex = 0;
        this.startNewRound();
    },

    startNewRound: function() {
        this.state = 'RATTLING';
        this.eliminated = [false, false, false, false];
        this.winnerIndex = -1;
        this.currentSnakeIndex = Math.floor(Math.random() * 6);
        // Random rattle time between 2 and 6 seconds (120 to 360 frames)
        this.timer = Math.floor(Math.random() * 240) + 120;
    },

    update: function(input, activePlayers) {
        if (!input || !input.players) return;

        if (!this.prevInput) {
            this.prevInput = { players: input.players.map(p => ({ ...p })) };
            return;
        }

        this.globalAnimTimer++;

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
                if (this.audio && this.audio.strike) {
                    this.audio.strike.currentTime = 0;
                    this.audio.strike.play().catch(e=>{});
                }
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
        
        let snakeImg = null;
        if (this.images.snakes && this.images.snakes.length > 0) {
            snakeImg = this.images.snakes[this.currentSnakeIndex];
        }

        if (this.state === 'RATTLING') {
            ctx.fillStyle = '#fff';
            ctx.font = "bold 50px 'Rye', 'Impact', sans-serif";
            ctx.fillText("DON'T MOVE YET...", width / 2, 80);

            // Draw Snake Rattling
            ctx.save();
            ctx.translate(width / 2, height / 2 + 50);
            
            // The rattle shake
            const shake = (Math.floor(Date.now() / 30) % 2 === 0) ? 10 : -10;
            ctx.translate(shake, 0);

            // Audio tick for rattle
            if (this.globalAnimTimer % 5 === 0 && this.audio && this.audio.rattle) {
                this.audio.rattle.currentTime = 0;
                this.audio.rattle.play().catch(e=>{});
            }

            if (snakeImg && snakeImg.complete) {
                const frameH = snakeImg.height;
                const frameW = frameH; // Assuming square frames
                const numFrames = Math.max(1, Math.floor(snakeImg.width / frameW));
                
                // Fast animation for rattling
                const frameIndex = Math.floor(this.globalAnimTimer * 0.5) % numFrames;
                const scale = 12; // Massive on screen
                
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(snakeImg, 
                    frameIndex * frameW, 0, frameW, frameH, 
                    (-frameW * scale)/2, (-frameH * scale)/2, frameW * scale, frameH * scale);
                ctx.imageSmoothingEnabled = true;
            }
            ctx.restore();

        } else if (this.state === 'STRIKING') {
            ctx.fillStyle = '#e74c3c';
            ctx.font = "bold 80px 'Rye', 'Impact', sans-serif";
            ctx.fillText("STRIKE!", width / 2, 100);

            // Draw Snake Striking
            ctx.save();
            ctx.translate(width / 2, height / 2 + 50);
            
            if (snakeImg && snakeImg.complete) {
                const frameH = snakeImg.height;
                const frameW = frameH;
                const numFrames = Math.max(1, Math.floor(snakeImg.width / frameW));
                
                // Pick a wide mouth or final frame if available, otherwise frame 0
                const frameIndex = numFrames - 1; // Assuming last frame is most extended/aggressive
                const scale = 24; // MEGA massive for the strike
                
                // Move snake up as if leaping at the screen
                ctx.translate(0, -100);
                
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(snakeImg, 
                    frameIndex * frameW, 0, frameW, frameH, 
                    (-frameW * scale)/2, (-frameH * scale)/2, frameW * scale, frameH * scale);
                ctx.imageSmoothingEnabled = true;
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

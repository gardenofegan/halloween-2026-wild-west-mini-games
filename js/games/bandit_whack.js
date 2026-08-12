// js/games/bandit_whack.js
const banditWhack = {
    name: 'Bandit Whack',
    scores: [0, 0, 0, 0],
    
    // 6 positions for bandits to pop out from (e.g. windows/barrels)
    positions: [
        { x: 400, y: 300 },
        { x: 960, y: 300 },
        { x: 1520, y: 300 },
        { x: 400, y: 700 },
        { x: 960, y: 700 },
        { x: 1520, y: 700 }
    ],

    // State of bandits in each position
    // null if empty, otherwise { colorIndex: 0-3, timer: framesLeft, state: 'active' | 'whacked' }
    bandits: [null, null, null, null, null, null],
    spawnTimer: 0,
    spawnRate: 60, // frames between spawns

    prevInput: null,

    reset: function() {
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        this.bandits = [null, null, null, null, null, null];
        this.spawnTimer = 30;
        this.spawnRate = 60;
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

        // Handle Spawning
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            // Find empty positions
            let emptyIndexes = [];
            for (let i = 0; i < this.bandits.length; i++) {
                if (this.bandits[i] === null) {
                    emptyIndexes.push(i);
                }
            }

            if (emptyIndexes.length > 0) {
                // Pick random empty position
                let spawnIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
                
                // Pick random active player's color
                let activeColors = [];
                for (let i = 0; i < 4; i++) {
                    if (activePlayers && activePlayers[i]) activeColors.push(i);
                }
                
                // Fallback if no active players (e.g. testing)
                if (activeColors.length === 0) activeColors = [0, 1, 2, 3];

                // 20% chance for a 'dummy' color (if less than 4 players are active, use an inactive color as a trap)
                let colorIndex = activeColors[Math.floor(Math.random() * activeColors.length)];
                if (activeColors.length < 4 && Math.random() < 0.2) {
                    let inactiveColors = [0, 1, 2, 3].filter(c => !activeColors.includes(c));
                    if (inactiveColors.length > 0) {
                        colorIndex = inactiveColors[Math.floor(Math.random() * inactiveColors.length)];
                    }
                }

                // Random active time between 45 (0.75s) and 90 (1.5s) frames
                this.bandits[spawnIndex] = {
                    colorIndex: colorIndex,
                    timer: Math.floor(Math.random() * 45) + 45,
                    state: 'active'
                };
            }
            
            // Randomize next spawn (30 to 75 frames)
            this.spawnTimer = Math.floor(Math.random() * 45) + 30;
        }

        // Update Bandits
        for (let i = 0; i < this.bandits.length; i++) {
            if (this.bandits[i] !== null) {
                this.bandits[i].timer--;
                if (this.bandits[i].timer <= 0) {
                    this.bandits[i] = null; // Bandit leaves
                }
            }
        }

        // Handle Player Input
        for (let i = 0; i < 4; i++) {
            if (activePlayers && activePlayers[i]) {
                if (isPressed(i, 'red')) {
                    // Check if a bandit of their color is active
                    let whackedAny = false;
                    for (let j = 0; j < this.bandits.length; j++) {
                        let bandit = this.bandits[j];
                        if (bandit && bandit.state === 'active' && bandit.colorIndex === i) {
                            bandit.state = 'whacked';
                            bandit.timer = 15; // Show whacked state briefly
                            this.scores[i] += 1;
                            whackedAny = true;
                            break; // Only whack one per press
                        }
                    }

                    if (!whackedAny) {
                        // Penalty!
                        this.scores[i] = Math.max(0, this.scores[i] - 1); // Deduct point, floor at 0
                        // Visual feedback could be added here
                    }
                }
            }
        }

        this.prevInput = { players: input.players.map(p => ({ ...p })) };
    },

    draw: function(ctx, width, height) {
        ctx.textAlign = 'center';
        
        ctx.fillStyle = '#f5a623';
        ctx.font = "bold 50px 'Rye', 'Impact', sans-serif";
        ctx.fillText("WHACK THE BANDIT IN YOUR COLOR!", width / 2, 60);
        ctx.font = "bold 30px 'Rye', sans-serif";
        ctx.fillText("(Careful! Hitting when your color isn't there costs a point!)", width / 2, 110);

        const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db'];

        // Draw Player Scores
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i];
            ctx.textAlign = 'center';
            ctx.font = "bold 40px 'Rye', sans-serif";
            ctx.fillText(`P${i+1}: ${this.scores[i]}`, width / 8 + i * (width / 4), height - 40);
        }

        // Draw the playing field (barrels/windows)
        for (let i = 0; i < this.positions.length; i++) {
            let pos = this.positions[i];

            // Draw Barrel/Hole
            ctx.fillStyle = '#3d2314'; // Dark brown
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y + 40, 90, 40, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a0f00'; // Hole inside
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y + 40, 70, 25, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw Bandit if exists
            let bandit = this.bandits[i];
            if (bandit) {
                ctx.save();
                ctx.translate(pos.x, pos.y);
                
                if (bandit.state === 'whacked') {
                    // Draw dizzy bandit
                    ctx.fillStyle = colors[bandit.colorIndex];
                    ctx.fillRect(-40, -10, 80, 50); // Squished body
                    ctx.fillStyle = '#ffcccc';
                    ctx.beginPath();
                    ctx.arc(0, -30, 30, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // X eyes
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-15, -40); ctx.lineTo(-5, -30);
                    ctx.moveTo(-5, -40); ctx.lineTo(-15, -30);
                    ctx.moveTo(5, -40); ctx.lineTo(15, -30);
                    ctx.moveTo(15, -40); ctx.lineTo(5, -30);
                    ctx.stroke();

                    // WHACK Text
                    ctx.fillStyle = '#fff';
                    ctx.font = "bold 40px 'Impact', sans-serif";
                    ctx.rotate(-0.2);
                    ctx.fillText("WHACK!", 0, -10);

                } else {
                    // Active Bandit
                    ctx.fillStyle = colors[bandit.colorIndex];
                    ctx.fillRect(-40, -60, 80, 100); // Body / Bandana
                    
                    // Head/Face showing above bandana
                    ctx.fillStyle = '#ffccaa';
                    ctx.fillRect(-30, -100, 60, 40);
                    
                    // Eyes (mean look)
                    ctx.fillStyle = '#000';
                    ctx.fillRect(-20, -90, 10, 5);
                    ctx.fillRect(10, -90, 10, 5);
                    ctx.beginPath();
                    ctx.moveTo(-25, -95); ctx.lineTo(-10, -90); // Left eyebrow
                    ctx.moveTo(25, -95); ctx.lineTo(10, -90);  // Right eyebrow
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Bandana knot
                    ctx.fillStyle = colors[bandit.colorIndex];
                    ctx.beginPath();
                    ctx.moveTo(-30, -60);
                    ctx.lineTo(-50, -40);
                    ctx.lineTo(-40, -30);
                    ctx.fill();
                }

                ctx.restore();
            }

            // Draw Barrel front (to cover bandit lower half)
            ctx.fillStyle = '#5c3a21'; // Lighter brown
            ctx.fillRect(pos.x - 90, pos.y + 40, 180, 90);
            // Barrel bands
            ctx.fillStyle = '#222';
            ctx.fillRect(pos.x - 90, pos.y + 60, 180, 10);
            ctx.fillRect(pos.x - 90, pos.y + 110, 180, 10);
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = banditWhack;
}
if (typeof window !== 'undefined') {
    window.banditWhack = banditWhack;
}

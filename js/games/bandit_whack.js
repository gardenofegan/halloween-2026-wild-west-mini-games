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
    images: {},

    loadImages: function() {
        if (typeof Image !== 'undefined' && !this.images.barrel) {
            this.images.barrel = new Image();
            this.images.barrel.src = 'assets/images/Barrel32x32.png';
        }
        if (typeof Audio !== 'undefined' && !this.audio) {
            this.audio = {
                whack: new Audio('assets/audio/impact-audio/impactPunch_medium_000.ogg'),
                miss: new Audio('assets/audio/impact-audio/impactWood_light_000.ogg')
            };
        }
    },

    banditPixels: [
        [0,0,0,5,5,5,5,5,5,5,5,5,5,0,0,0],
        [0,0,5,1,1,1,1,1,1,1,1,1,1,5,0,0],
        [0,5,1,3,3,3,3,3,3,3,3,3,3,1,5,0],
        [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
        [0,0,0,5,2,2,2,2,2,2,2,2,5,0,0,0],
        [0,0,0,5,2,4,5,2,2,5,4,2,5,0,0,0],
        [0,0,0,5,2,4,4,2,2,4,4,2,5,0,0,0],
        [0,0,0,5,2,2,2,2,2,2,2,2,5,0,0,0],
        [0,0,0,5,3,3,3,3,3,3,3,3,5,0,0,0],
        [0,0,0,5,3,3,3,3,3,3,3,3,5,0,0,0],
        [0,0,5,3,3,3,3,3,3,3,3,3,3,5,0,0],
        [0,5,3,3,3,5,3,3,3,3,5,3,3,3,5,0],
        [5,3,3,3,5,0,5,3,3,5,0,5,3,3,3,5],
        [5,3,3,5,0,0,0,5,5,0,0,0,5,3,3,5],
        [5,3,5,0,0,0,0,0,0,0,0,0,0,5,3,5],
        [5,5,0,0,0,0,0,0,0,0,0,0,0,0,5,5]
    ],

    banditWhackedPixels: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,5,5,5,5,5,5,5,5,5,5,0,0,0],
        [0,0,5,1,1,1,1,1,1,1,1,1,1,5,0,0],
        [0,5,1,3,3,3,3,3,3,3,3,3,3,1,5,0],
        [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
        [0,0,0,5,2,2,2,2,2,2,2,2,5,0,0,0],
        [0,0,0,5,2,5,2,2,2,2,5,2,5,0,0,0], 
        [0,0,0,5,2,2,5,2,2,5,2,2,5,0,0,0],
        [0,0,0,5,2,5,2,2,2,2,5,2,5,0,0,0],
        [0,0,0,5,3,3,3,3,3,3,3,3,5,0,0,0],
        [0,0,5,3,3,3,3,3,3,3,3,3,3,5,0,0],
        [0,5,3,3,3,5,3,3,3,3,5,3,3,3,5,0],
        [5,3,3,3,5,0,5,3,3,5,0,5,3,3,3,5],
        [5,3,3,5,0,0,0,5,5,0,0,0,5,3,3,5]
    ],

    reset: function() {
        this.loadImages();
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
                            if (this.audio && this.audio.whack) {
                                this.audio.whack.currentTime = 0;
                                this.audio.whack.play().catch(e => {});
                            }
                            break; // Only whack one per press
                        }
                    }

                    if (!whackedAny) {
                        // Penalty!
                        this.scores[i] = Math.max(0, this.scores[i] - 1); // Deduct point, floor at 0
                        if (this.audio && this.audio.miss) {
                            this.audio.miss.currentTime = 0;
                            this.audio.miss.play().catch(e => {});
                        }
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

            // Draw Bandit if exists
            let bandit = this.bandits[i];
            if (bandit) {
                ctx.save();
                ctx.translate(pos.x - 80, pos.y - 120); 
                
                const pixels = (bandit.state === 'whacked') ? this.banditWhackedPixels : this.banditPixels;
                const size = 10; // 16 * 10 = 160 width
                
                const palette = {
                    1: '#4e342e', // Hat (Dark Brown)
                    2: '#ffccaa', // Skin
                    3: colors[bandit.colorIndex], // Bandana & Hat Band
                    4: '#ffffff', // Eyes
                    5: '#000000'  // Outline
                };

                for (let r = 0; r < 16; r++) {
                    for (let c = 0; c < 16; c++) {
                        let p = pixels[r][c];
                        if (p !== 0) {
                            ctx.fillStyle = palette[p];
                            ctx.fillRect(c * size, r * size, size, size);
                        }
                    }
                }
                
                if (bandit.state === 'whacked') {
                    ctx.fillStyle = '#fff';
                    ctx.font = "bold 40px 'Impact', sans-serif";
                    ctx.translate(80, 50);
                    ctx.rotate(-0.2);
                    ctx.fillText("WHACK!", 0, -10);
                }

                ctx.restore();
            }

            // Draw Barrel front (to cover bandit lower half)
            if (this.images.barrel && this.images.barrel.complete) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(this.images.barrel, pos.x - 100, pos.y - 20, 200, 200);
                ctx.imageSmoothingEnabled = true;
            } else {
                ctx.fillStyle = '#5c3a21'; // Lighter brown
                ctx.fillRect(pos.x - 90, pos.y + 40, 180, 90);
                // Barrel bands
                ctx.fillStyle = '#222';
                ctx.fillRect(pos.x - 90, pos.y + 60, 180, 10);
                ctx.fillRect(pos.x - 90, pos.y + 110, 180, 10);
            }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = banditWhack;
}
if (typeof window !== 'undefined') {
    window.banditWhack = banditWhack;
}

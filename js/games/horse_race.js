// js/games/horse_race.js
const horseRace = {
    name: 'Horse Race',
    scores: [0, 0, 0, 0],
    
    // Each player has multiple targets (cows) in their lane
    hurdles: [],
    spawnInterval: 80,
    spawnTimer: 40,
    globalAnimTimer: 0,
    maxScore: 300,
    startX: 150,

    players: [
        { stumbleTimer: 0, jumpTimer: 0 },
        { stumbleTimer: 0, jumpTimer: 0 },
        { stumbleTimer: 0, jumpTimer: 0 },
        { stumbleTimer: 0, jumpTimer: 0 }
    ],

    prevInput: null,
    images: {},

    loadImages: function() {
        if (typeof Image !== 'undefined' && !this.images.horses) {
            this.images.horses = [];
            // Load distinct horse sprites from the 8 available
            const horseIndices = [1, 3, 5, 8];
            for (let i of horseIndices) {
                const img = new Image();
                img.src = `assets/images/Horse Pack/Horse Pack/Horses/${i}.png`;
                this.images.horses.push(img);
            }
        }
        if (typeof Audio !== 'undefined' && !this.audio) {
            this.audio = {
                jump: new Audio('assets/audio/rpg-audio/footstep00.ogg'),
                miss: new Audio('assets/audio/impact-audio/impactWood_heavy_000.ogg')
            };
        }
    },

    reset: function() {
        this.loadImages();
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        this.hurdles = [];
        this.spawnInterval = 80;
        this.spawnTimer = 40; // First hurdle spawns quickly
        this.globalAnimTimer = 0;

        for (let i = 0; i < 4; i++) {
            this.players[i].stumbleTimer = 0;
            this.players[i].jumpTimer = 0;
        }
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

        this.globalAnimTimer++;

        // Spawn hurdles
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnInterval;
            const colorTypes = ['blue', 'orange', 'green', 'yellow'];
            const colorIdx = Math.floor(Math.random() * 4);
            this.hurdles.push({ 
                x: 1920 + 50, 
                color: colorTypes[colorIdx], 
                stringIdx: colorIdx, 
                hitBy: [false, false, false, false],
                clearedBy: [false, false, false, false]
            });
            // Gradually speed up the spawn rate (cap at 35 frames)
            if (this.spawnInterval > 35) this.spawnInterval -= 1;
        }

        // Move hurdles
        const hurdleSpeed = 12;
        for (let h of this.hurdles) {
            h.x -= hurdleSpeed;
        }
        
        // Remove offscreen hurdles
        if (this.hurdles.length > 0 && this.hurdles[0].x < -100) {
            this.hurdles.shift();
        }

        const HIT_TOLERANCE = 50;
        const width = 1920;

        // Process Player Input
        for (let i = 0; i < 4; i++) {
            if (!activePlayers || !activePlayers[i]) continue;
            let p = this.players[i];
            
            // Dynamic Hit Zone: Horse advances right as score goes up
            let playerX = this.startX + (this.scores[i] / this.maxScore) * (width - 400);
            if (playerX > width - 200) playerX = width - 200; // Cap to keep on screen
            
            if (p.stumbleTimer > 0) p.stumbleTimer--;
            if (p.jumpTimer > 0) p.jumpTimer--;
            
            let pressedColor = null;
            if (isPressed(i, 'blue')) pressedColor = 'blue';
            else if (isPressed(i, 'orange')) pressedColor = 'orange';
            else if (isPressed(i, 'green')) pressedColor = 'green';
            else if (isPressed(i, 'yellow')) pressedColor = 'yellow';

            if (pressedColor) {
                if (p.stumbleTimer > 0) {
                    // Mashing while stumbling resets penalty
                    p.stumbleTimer = 20;
                } else {
                    let hit = false;
                    for (let h of this.hurdles) {
                        if (h.hitBy[i]) continue;
                        if (Math.abs(h.x - playerX) < HIT_TOLERANCE) {
                            h.hitBy[i] = true;
                            if (h.color === pressedColor) {
                                // Perfect jump
                                this.scores[i] += 10;
                                p.jumpTimer = 45; // Jump animation duration
                                h.clearedBy[i] = true; // Marks it cleared so we don't draw it for this player
                                hit = true;
                                if (this.audio && this.audio.jump) {
                                    this.audio.jump.currentTime = 0;
                                    this.audio.jump.play().catch(e=>{});
                                }
                            } else {
                                // Wrong button
                                p.stumbleTimer = 30;
                                hit = true;
                                if (this.audio && this.audio.miss) {
                                    this.audio.miss.currentTime = 0;
                                    this.audio.miss.play().catch(e=>{});
                                }
                            }
                            break; // Process only the closest hurdle
                        }
                    }
                    if (!hit) {
                        // Pressed button but no hurdle in zone -> early/late penalty
                        p.stumbleTimer = 20;
                        if (this.audio && this.audio.miss) {
                            this.audio.miss.currentTime = 0;
                            this.audio.miss.play().catch(e=>{});
                        }
                    }
                }
            }
            
            // Check for missed hurdles that passed the player
            for (let h of this.hurdles) {
                if (!h.hitBy[i] && h.x < playerX - HIT_TOLERANCE) {
                    h.hitBy[i] = true;
                    p.stumbleTimer = 30; // Tripped over it
                    if (this.audio && this.audio.miss) {
                        this.audio.miss.currentTime = 0;
                        this.audio.miss.play().catch(e=>{});
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
        ctx.fillText("JUMP THE COLORED HURDLES!", width / 2, 60);

        const laneHeight = 160;
        const startY = 120;

        const stringColors = {
            'blue': '#3498db',
            'orange': '#e67e22',
            'green': '#2ecc71',
            'yellow': '#f1c40f'
        };

        for (let i = 0; i < 4; i++) {
            let laneY = startY + i * laneHeight;

            // Track background
            ctx.fillStyle = (i % 2 === 0) ? '#2c3e50' : '#34495e';
            ctx.fillRect(0, laneY, width, laneHeight);

            // Draw the 4 guitar strings
            const stringOffsets = [30, 60, 90, 120];
            ctx.strokeStyle = '#7f8c8d';
            ctx.lineWidth = 3;
            for (let offset of stringOffsets) {
                ctx.beginPath();
                ctx.moveTo(0, laneY + offset);
                ctx.lineTo(width, laneY + offset);
                ctx.stroke();
            }

            // Calculate dynamic player X based on score
            let playerX = this.startX + (this.scores[i] / this.maxScore) * (width - 400);
            if (playerX > width - 200) playerX = width - 200;

            // Draw Hit Zone line (The "Fret" moves with the horse)
            ctx.strokeStyle = 'rgba(236, 240, 241, 0.4)'; // Make it slightly transparent so it's not distracting
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(playerX, laneY);
            ctx.lineTo(playerX, laneY + 150);
            ctx.stroke();

            // Draw Player Score
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.font = "bold 30px 'Rye', sans-serif";
            ctx.fillText(`P${i+1}: ${this.scores[i]}`, 20, laneY + 140);

            let p = this.players[i];

            // Draw Hurdles in this lane
            for (let h of this.hurdles) {
                // If cleared by this player, we don't draw it (illusion of clearing it)
                if (h.clearedBy[i]) continue;
                
                const hurdleY = laneY + stringOffsets[h.stringIdx];
                const colorHex = stringColors[h.color];
                
                // Draw hurdle pole to the ground
                ctx.strokeStyle = '#bdc3c7';
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(h.x, hurdleY);
                ctx.lineTo(h.x, laneY + 150); // ground
                ctx.stroke();

                // Draw the colored block (gem)
                ctx.fillStyle = colorHex;
                ctx.fillRect(h.x - 20, hurdleY - 15, 40, 30);
                
                // Gem highlight
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(h.x - 15, hurdleY - 10, 30, 10);
            }

            // Draw Horse
            let yOffset = 0;
            if (p.jumpTimer > 0) {
                // Parabola jump
                let t = (22.5 - p.jumpTimer) / 22.5; // -1 to 1 based on 45 max timer
                yOffset = -(1 - t*t) * 90; // peak at 90 pixels high
            }

            ctx.save();
            // Horse center (moves across the screen as score increases)
            ctx.translate(playerX, laneY + 150 + yOffset);

            // Stumble/Fall visual
            if (p.stumbleTimer > 0) {
                // Flash transparent
                if (Math.floor(this.globalAnimTimer / 5) % 2 === 0) {
                    ctx.globalAlpha = 0.5;
                }
                
                // Draw "MISS" text above the horse
                ctx.fillStyle = '#e74c3c';
                ctx.font = "bold 24px 'Impact', sans-serif";
                ctx.fillText("MISS", 0, -80);
            }

            // Sprite sheet rendering
            if (this.images.horses && this.images.horses[i] && this.images.horses[i].complete) {
                const horseImg = this.images.horses[i];
                const frameW = 64;
                const frameH = 48; // Corrected frame height!
                
                let frameX = 0;
                let frameY = 624; // Row Index 13: Gallop Right
                let scale = 2.2; // Scale up to maintain size
                
                // Offset horizontal position of the horse so it is centered on the fret
                const xOffset = -frameW * scale / 2 + 10;

                if (p.stumbleTimer > 0) {
                    frameY = 1008; // Row Index 21: Right Fall / Die
                    // Hold the first frame of falling
                    frameX = 0;
                } else {
                    // Running profile animation (Gallop Right)
                    // Has 6 frames
                    frameX = Math.floor(this.globalAnimTimer * 0.4) % 6;
                }
                
                ctx.drawImage(horseImg, frameX * frameW, frameY, frameW, frameH, xOffset, -frameH * scale, frameW * scale, frameH * scale);
            } else {
                // Fallback box
                ctx.fillStyle = p.stumbleTimer > 0 ? '#e74c3c' : '#fff';
                ctx.fillRect(-30, -60, 60, 60);
            }

            ctx.restore();
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = horseRace;
}
if (typeof window !== 'undefined') {
    window.horseRace = horseRace;
}

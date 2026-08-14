// js/games/lasso_catch.js
const lassoCatch = {
    name: 'Lasso Catch',
    scores: [0, 0, 0, 0],
    
    // Each player has multiple targets (cows) in their lane
    lanes: [ [], [], [], [] ],
    playerStates: [
        { cooldown: 0, status: '' },
        { cooldown: 0, status: '' },
        { cooldown: 0, status: '' },
        { cooldown: 0, status: '' }
    ],

    prevInput: null,
    images: {},

    loadImages: function() {
        if (typeof Image !== 'undefined' && !this.images.cows) {
            this.images.cows = [];
            const cowFiles = [
                'cows_spritesheet_black0.png',
                'cows_spritesheet_black1.png',
                'cows_spritesheet_brown.png',
                'cows_spritesheet_white0.png',
                'cows_spritesheet_white1.png',
                'cows_spritesheet_white_darkspots.png',
                'cows_spritesheet_white_pinkspots.png'
            ];
            for (let file of cowFiles) {
                let img = new Image();
                img.src = `assets/images/Cows/Cows/${file}`;
                this.images.cows.push(img);
            }
        }
    },

    reset: function() {
        this.loadImages();
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        for (let i = 0; i < 4; i++) {
            this.playerStates[i] = { cooldown: 0, status: '' };
            this.lanes[i] = [];
            for (let j = 0; j < 4; j++) {
                // Space them out initially so they aren't all clumped
                const startLeft = Math.random() > 0.5;
                const xPos = startLeft ? -200 - Math.random() * 1000 : 2120 + Math.random() * 1000;
                this.lanes[i].push(this.createCow(xPos));
            }
        }
    },

    createCow: function(startX) {
        const startLeft = Math.random() > 0.5;
        return {
            x: startX !== undefined ? startX : (startLeft ? -200 : 2120),
            direction: startLeft ? 1 : -1,
            speed: Math.random() * 3 + 5, // 5 to 8 (much more manageable speed)
            cooldown: 0,
            cowIndex: Math.floor(Math.random() * 7),
            animTimer: Math.random() * 4
        };
    },

    resetTarget: function(target) {
        const newCow = this.createCow();
        target.x = newCow.x;
        target.direction = newCow.direction;
        target.speed = newCow.speed;
        target.cooldown = newCow.cooldown;
        target.cowIndex = newCow.cowIndex;
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

        const width = 1920;
        const targetZoneCenter = width / 2;
        const targetZoneWidth = 120;

        for (let i = 0; i < 4; i++) {
            if (activePlayers && activePlayers[i]) {
                const lane = this.lanes[i];
                let throwActive = isPressed(i, 'red');
                let caughtAny = false;

                if (this.playerStates[i].cooldown > 0) {
                    this.playerStates[i].cooldown--;
                }

                if (throwActive && this.playerStates[i].cooldown <= 0) {
                    for (let j = 0; j < lane.length; j++) {
                        const target = lane[j];
                        if (target.cooldown <= 0) {
                            const dist = Math.abs(target.x - targetZoneCenter);
                            if (dist < targetZoneWidth / 2) {
                                this.scores[i] += 1;
                                target.cooldown = 30; // Cow stays caught for a bit
                                caughtAny = true;
                                this.playerStates[i].status = 'CAUGHT!';
                                this.playerStates[i].cooldown = 5; // Very small cooldown so they can catch back-to-back cows
                                break; // Only catch one cow per throw
                            }
                        }
                    }
                    if (!caughtAny) {
                        this.playerStates[i].status = 'MISSED!';
                        this.playerStates[i].cooldown = 15; // Small penalty for missing
                    }
                }

                for (let j = 0; j < lane.length; j++) {
                    const target = lane[j];
                    if (target.cooldown > 0) {
                        target.cooldown--;
                        if (target.cooldown <= 0) {
                            this.resetTarget(target);
                        }
                    } else {
                        target.x += target.speed * target.direction;
                        target.animTimer += target.speed * 0.02;

                        if (target.direction === 1 && target.x > width + 200) {
                            this.resetTarget(target);
                        } else if (target.direction === -1 && target.x < -200) {
                            this.resetTarget(target);
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
        ctx.fillText("PRESS RED TO LASSO THE COW IN THE CENTER!", width / 2, 60);

        const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db'];
        const laneHeight = 200;
        const startY = 150;
        const targetZoneCenter = width / 2;
        const targetZoneWidth = 120;

        // Draw central target zone for all lanes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(targetZoneCenter - targetZoneWidth / 2, startY, targetZoneWidth, laneHeight * 4);
        
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(targetZoneCenter - targetZoneWidth / 2, startY);
        ctx.lineTo(targetZoneCenter - targetZoneWidth / 2, startY + laneHeight * 4);
        ctx.moveTo(targetZoneCenter + targetZoneWidth / 2, startY);
        ctx.lineTo(targetZoneCenter + targetZoneWidth / 2, startY + laneHeight * 4);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        for (let i = 0; i < 4; i++) {
            const laneY = startY + i * laneHeight;
            
            // Draw lane separator
            ctx.strokeStyle = '#3d2314';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, laneY + laneHeight);
            ctx.lineTo(width, laneY + laneHeight);
            ctx.stroke();

            // Draw player score/info on the left
            ctx.fillStyle = colors[i];
            ctx.textAlign = 'left';
            ctx.font = "bold 40px 'Rye', sans-serif";
            ctx.fillText(`P${i+1} SCORE: ${this.scores[i]}`, 20, laneY + 120);

            // Draw player status
            const pState = this.playerStates[i];
            if (pState && pState.cooldown > 0) {
                ctx.textAlign = 'center';
                ctx.fillStyle = pState.status === 'CAUGHT!' ? '#2ecc71' : '#e74c3c';
                ctx.font = "bold 40px 'Rye', sans-serif";
                ctx.fillText(pState.status, targetZoneCenter, laneY + laneHeight / 2 - 60);
                
                if (pState.status === 'CAUGHT!') {
                    ctx.strokeStyle = '#d4a359';
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.ellipse(targetZoneCenter, laneY + laneHeight / 2, 50, 30, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            const laneCows = this.lanes[i];
            if (laneCows) {
                for (let j = 0; j < laneCows.length; j++) {
                    const target = laneCows[j];
                    
                    ctx.save();
                    ctx.translate(target.x, laneY + laneHeight / 2);
                    
                    if (this.images.cows && this.images.cows[target.cowIndex] && this.images.cows[target.cowIndex].complete) {
                        const cowImg = this.images.cows[target.cowIndex];
                        const frameW = 32;
                        const frameH = cowImg.height >= 256 ? 32 : cowImg.height; 
                        const scale = 3;
                        
                        if (target.direction === -1) {
                            ctx.scale(-1, 1);
                        }
                        
                        // Use row 4 (y=128) which has 4 full frames of walking animation
                        const frameY = 128; 
                        let frameX = 0;
                        if (target.cooldown <= 0) {
                            // Use all 4 frames linearly
                            frameX = Math.floor(target.animTimer) % 4;
                        }
                        
                        ctx.drawImage(cowImg, frameX * frameW, frameY, frameW, frameH, -frameW * scale / 2, -frameH * scale / 2, frameW * scale, frameH * scale);
                    } else {
                        // Fallback Cow
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(-30, -20, 60, 40);
                        ctx.fillStyle = '#000';
                        ctx.fillRect(-20, -10, 20, 20); 
                        ctx.fillRect(10, 0, 15, 15);
                        ctx.fillStyle = '#fff';
                        if (target.direction === 1) {
                            ctx.fillRect(20, -30, 30, 30);
                            ctx.fillStyle = '#000';
                            ctx.fillRect(40, -25, 5, 5);
                        } else {
                            ctx.fillRect(-50, -30, 30, 30);
                            ctx.fillStyle = '#000';
                            ctx.fillRect(-45, -25, 5, 5);
                        }
                    }
                    ctx.restore();
                }
            }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = lassoCatch;
}
if (typeof window !== 'undefined') {
    window.lassoCatch = lassoCatch;
}

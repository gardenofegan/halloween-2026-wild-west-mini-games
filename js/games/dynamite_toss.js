// js/games/dynamite_toss.js
const dynamiteToss = {
    name: 'Dynamite Toss',
    scores: [0, 0, 0, 0],
    
    // Each player's state
    // state: 'IDLE', 'CHARGING', 'ANIMATING_SUCCESS', 'ANIMATING_FAIL'
    players: [
        { state: 'IDLE', power: 0, direction: 1, targetMin: 70, targetMax: 85, timer: 0 },
        { state: 'IDLE', power: 0, direction: 1, targetMin: 70, targetMax: 85, timer: 0 },
        { state: 'IDLE', power: 0, direction: 1, targetMin: 70, targetMax: 85, timer: 0 },
        { state: 'IDLE', power: 0, direction: 1, targetMin: 70, targetMax: 85, timer: 0 }
    ],

    prevInput: null,
    images: {},

    loadImages: function() {
        if (typeof Image !== 'undefined' && !this.images.dynamite) {
            this.images.dynamite = new Image();
            this.images.dynamite.src = 'assets/images/platformer/Base pack/Items/bomb.png';
            this.images.boom = new Image();
            this.images.boom.src = 'assets/images/explosion/Sprite_Sheets/Exploding Red Oil Barrel.png';
            this.images.smoke = new Image();
            this.images.smoke.src = 'assets/images/particle/PNG (Transparent)/smoke_01.png';
        }
        if (typeof Audio !== 'undefined' && !this.audio) {
            this.audio = {
                boom: new Audio('assets/audio/impact-audio/impactMining_000.ogg'),
                fizzle: new Audio('assets/audio/impact-audio/impactGlass_light_000.ogg')
            };
        }
    },

    reset: function() {
        this.loadImages();
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        for (let i = 0; i < 4; i++) {
            this.resetPlayer(i);
        }
    },

    resetPlayer: function(index) {
        let p = this.players[index];
        p.state = 'IDLE';
        p.power = 0;
        p.direction = 1;
        // Randomize the sweet spot slightly each time
        let center = Math.random() * 40 + 40; // 40 to 80
        p.targetMin = center - 8;
        p.targetMax = center + 8;
        p.timer = 0;
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
        const isReleased = (playerIndex, btn) => {
            return !input.players[playerIndex][btn] && this.prevInput.players[playerIndex][btn];
        };
        const isHeld = (playerIndex, btn) => {
            return input.players[playerIndex][btn];
        };

        for (let i = 0; i < 4; i++) {
            if (activePlayers && activePlayers[i]) {
                let p = this.players[i];

                if (p.state === 'IDLE') {
                    if (isPressed(i, 'red')) {
                        p.state = 'CHARGING';
                        p.power = 0;
                        p.direction = 1;
                    }
                } else if (p.state === 'CHARGING') {
                    // Oscillate power
                    const speed = 2.5; // Power units per frame
                    p.power += p.direction * speed;
                    if (p.power >= 100) {
                        p.power = 100;
                        p.direction = -1;
                    } else if (p.power <= 0) {
                        p.power = 0;
                        p.direction = 1;
                    }

                    if (isReleased(i, 'red')) {
                        // Check if in sweet spot
                        if (p.power >= p.targetMin && p.power <= p.targetMax) {
                            p.state = 'ANIMATING_SUCCESS';
                            p.timer = 60; // 1 second animation
                            this.scores[i] += 1;
                            if (this.audio && this.audio.boom) {
                                this.audio.boom.currentTime = 0;
                                this.audio.boom.play().catch(e=>{});
                            }
                        } else {
                            p.state = 'ANIMATING_FAIL';
                            p.timer = 60;
                            if (this.audio && this.audio.fizzle) {
                                this.audio.fizzle.currentTime = 0;
                                this.audio.fizzle.play().catch(e=>{});
                            }
                        }
                    }
                } else if (p.state === 'ANIMATING_SUCCESS' || p.state === 'ANIMATING_FAIL') {
                    p.timer--;
                    if (p.timer <= 0) {
                        this.resetPlayer(i);
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
        ctx.fillText("HOLD RED TO AIM, RELEASE IN THE GREEN ZONE!", width / 2, 60);

        const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db'];
        const sectionWidth = width / 4;

        for (let i = 0; i < 4; i++) {
            const startX = i * sectionWidth;
            const centerX = startX + sectionWidth / 2;
            const bottomY = height - 100;
            let p = this.players[i];

            // Draw player divider
            if (i > 0) {
                ctx.strokeStyle = '#3d2314';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(startX, 100);
                ctx.lineTo(startX, height);
                ctx.stroke();
            }

            // Draw Score
            ctx.fillStyle = colors[i];
            ctx.font = "bold 40px 'Rye', sans-serif";
            ctx.fillText(`P${i+1}: ${this.scores[i]}`, centerX, 150);

            // Draw Safe (The grey square is a Bank Safe!)
            ctx.fillStyle = '#555';
            ctx.fillRect(centerX - 60, bottomY - 120, 120, 120);
            ctx.fillStyle = '#777';
            ctx.fillRect(centerX - 50, bottomY - 110, 100, 100);
            
            // Dial/Handle
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(centerX, bottomY - 60, 25, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw handle cross
            ctx.fillStyle = '#111';
            ctx.fillRect(centerX - 5, bottomY - 95, 10, 70);
            ctx.fillRect(centerX - 35, bottomY - 65, 70, 10);

            // Add a huge '$' sign to make it clear it's a bank safe
            ctx.fillStyle = '#f1c40f'; // Gold
            ctx.font = "bold 30px 'Rye', sans-serif";
            ctx.fillText("$", centerX - 35, bottomY - 80);

            // Draw State Animations
            if (p.state === 'ANIMATING_SUCCESS') {
                // EXPLOSION
                if (this.images.boom && this.images.boom.complete) {
                    const frameW = 32;
                    const frameH = 32;
                    const numFrames = 12;
                    // Map 60..0 to 0..11 frames
                    let frameIndex = Math.floor(((60 - p.timer) / 60) * numFrames);
                    if (frameIndex >= numFrames) frameIndex = numFrames - 1;

                    const scale = 8; // 32 * 8 = 256
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(this.images.boom,
                        frameIndex * frameW, 0, frameW, frameH,
                        centerX - (frameW*scale)/2, bottomY - 60 - (frameH*scale)/2, frameW * scale, frameH * scale);
                    ctx.imageSmoothingEnabled = true;
                } else {
                    const boomRadius = (60 - p.timer) * 3;
                    ctx.fillStyle = (Math.floor(p.timer / 4) % 2 === 0) ? '#ff0' : '#f00';
                    ctx.beginPath();
                    ctx.arc(centerX, bottomY - 60, boomRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.fillStyle = '#fff';
                ctx.font = "bold 50px 'Impact', sans-serif";
                ctx.fillText("BOOM!", centerX, bottomY - 60);
            } else if (p.state === 'ANIMATING_FAIL') {
                // FIZZLE
                ctx.fillStyle = '#000';
                ctx.font = "bold 40px 'Impact', sans-serif";
                ctx.fillText("FIZZLE...", centerX, bottomY - 150);
                
                if (this.images.smoke && this.images.smoke.complete) {
                    ctx.drawImage(this.images.smoke, centerX - 50, bottomY - 110, 100, 100);
                } else {
                    // Draw burnt mark
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.beginPath();
                    ctx.arc(centerX, bottomY - 60, 50, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw Power Meter
            const meterHeight = 400;
            const meterWidth = 40;
            const meterX = centerX - 120;
            const meterY = bottomY - 120 - meterHeight;

            // Background
            ctx.fillStyle = '#222';
            ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

            // Sweet Spot Zone
            const zoneY = meterY + meterHeight - (p.targetMax / 100 * meterHeight);
            const zoneHeight = ((p.targetMax - p.targetMin) / 100) * meterHeight;
            ctx.fillStyle = '#2ecc71'; // Green
            ctx.fillRect(meterX, zoneY, meterWidth, zoneHeight);

            // Outline
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

            // Power Needle
            if (p.state === 'CHARGING' || p.state === 'ANIMATING_SUCCESS' || p.state === 'ANIMATING_FAIL') {
                const needleY = meterY + meterHeight - (p.power / 100 * meterHeight);
                ctx.fillStyle = (p.state === 'CHARGING') ? '#e74c3c' : (p.state === 'ANIMATING_SUCCESS' ? '#2ecc71' : '#e74c3c');
                ctx.beginPath();
                ctx.moveTo(meterX - 20, needleY);
                ctx.lineTo(meterX, needleY - 10);
                ctx.lineTo(meterX, needleY + 10);
                ctx.fill();
                
                // Also fill the bar below needle for juice
                ctx.fillStyle = (p.state === 'CHARGING') ? '#e74c3c' : (p.state === 'ANIMATING_SUCCESS' ? '#2ecc71' : '#e74c3c');
                ctx.fillRect(meterX + 5, needleY, meterWidth - 10, (meterY + meterHeight) - needleY);
            }

            // Draw Dynamite (Player's hand)
            if (p.state === 'CHARGING' || p.state === 'IDLE') {
                if (this.images.dynamite && this.images.dynamite.complete) {
                    ctx.drawImage(this.images.dynamite, centerX + 40, bottomY - 220, 70, 70);
                } else {
                    ctx.fillStyle = '#e74c3c';
                    ctx.fillRect(centerX + 60, bottomY - 200, 30, 80); // Stick
                    ctx.fillStyle = '#111';
                    ctx.fillRect(centerX + 70, bottomY - 220, 10, 20); // Wick
                }
                
                if (p.state === 'CHARGING') {
                    // Spark
                    ctx.fillStyle = (Math.floor(Date.now() / 100) % 2 === 0) ? '#ff0' : '#f90';
                    ctx.beginPath();
                    ctx.arc(centerX + 75, bottomY - 225, 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = dynamiteToss;
}
if (typeof window !== 'undefined') {
    window.dynamiteToss = dynamiteToss;
}

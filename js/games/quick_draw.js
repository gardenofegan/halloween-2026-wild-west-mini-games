// js/games/quick_draw.js
const quickDraw = {
    name: 'Quick Draw',
    scores: [0, 0, 0, 0],
    state: 'WAITING',
    timer: 0,
    falseStarts: [false, false, false, false],
    winnerIndex: -1,
    
    prevInput: null,
    
    images: {},
    imagesLoaded: false,

    loadImages: function() {
        if (this.imagesLoaded) return;
        const imgList = {
            back: 'assets/images/Adventurer/Poses/adventurer_back.png',
            stand: 'assets/images/Adventurer/Poses/adventurer_stand.png',
            cheer: 'assets/images/Adventurer/Poses/adventurer_cheer1.png',
            hurt: 'assets/images/Adventurer/Poses/adventurer_hurt.png',
            rifle: 'assets/images/rifle.png',
            shot: 'assets/images/shot_yellow_large.png',
            bulletWinner: 'assets/images/icon_bullet_gold_long.png',
            bulletLoser: 'assets/images/icon_bullet_silver_long.png',
            crosshair: 'assets/images/crosshair_white_large.png'
        };
        for (let key in imgList) {
            let img = new Image();
            img.src = imgList[key];
            this.images[key] = img;
        }
        this.imagesLoaded = true;
    },

    reset: function() {
        if (typeof Image !== 'undefined') this.loadImages();
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        this.startNewRound();
    },

    startNewRound: function() {
        this.state = 'WAITING';
        this.falseStarts = [false, false, false, false];
        this.winnerIndex = -1;
        this.shotTimers = [-1, -1, -1, -1];
        // Random timer between 2 and 6 seconds (120 to 360 frames at 60fps)
        this.timer = Math.floor(Math.random() * 240) + 120;
    },

    update: function(input, activePlayers) {
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
            
            let allFalseStarted = true;
            let anyActive = false;

            // Check for false starts
            for (let i = 0; i < 4; i++) {
                if (activePlayers && activePlayers[i]) {
                    anyActive = true;
                    if (isPressed(i, 'red') && !this.falseStarts[i]) {
                        this.falseStarts[i] = true;
                    }
                    if (!this.falseStarts[i]) {
                        allFalseStarted = false;
                    }
                }
            }

            if (anyActive && allFalseStarted) {
                this.startNewRound();
                this.prevInput = { players: input.players.map(p => ({ ...p })) };
                return;
            }

            if (this.timer <= 0) {
                this.state = 'DRAW';
            }
        } else if (this.state === 'DRAW' || this.state === 'ROUND_OVER') {
            for (let i = 0; i < 4; i++) {
                if (activePlayers && activePlayers[i]) {
                    if (isPressed(i, 'red') && !this.falseStarts[i] && this.shotTimers[i] === -1) {
                        this.shotTimers[i] = 0;
                        if (this.state === 'DRAW') {
                            this.winnerIndex = i;
                            this.scores[i]++;
                            this.state = 'ROUND_OVER';
                            this.timer = 180; // Show winner for 3 seconds
                        }
                    }
                }
            }
            if (this.state === 'ROUND_OVER') {
                this.timer--;
                if (this.timer <= 0) {
                    this.startNewRound();
                }
            }
        }
        
        // Update shot timers
        for (let i = 0; i < 4; i++) {
            if (this.shotTimers && this.shotTimers[i] >= 0) {
                this.shotTimers[i]++;
            }
        }

        this.prevInput = { players: input.players.map(p => ({ ...p })) };
    },

    draw: function(ctx, width, height) {
        ctx.textAlign = 'center';
        const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db'];
        
        // Draw the 4 Cowboys
        const groundY = height / 2 + 100;
        
        // Draw a simple ground line
        ctx.fillStyle = '#3d2314';
        ctx.fillRect(0, groundY, width, height - groundY);
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(0, groundY, width, 20);

        for (let i = 0; i < 4; i++) {
            if (this.state === 'ROUND_OVER' && this.winnerIndex !== -1 && i !== this.winnerIndex) {
                ctx.filter = 'grayscale(80%)';
                ctx.globalAlpha = 0.8;
            } else {
                ctx.filter = 'none';
                ctx.globalAlpha = 1.0;
            }
            
            const px = width / 8 + i * (width / 4);
            const py = groundY - 100; // Character base near ground
            
            // Draw player color platform
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.ellipse(px, groundY, 80, 20, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw crosshair target above
            if (this.images.crosshair && this.images.crosshair.complete) {
                const cw = this.images.crosshair.width;
                const ch = this.images.crosshair.height;
                ctx.drawImage(this.images.crosshair, px - cw / 2, py - 350, cw, ch);
            }

            // Which image to draw?
            let currentImg = this.images.back;
            let showRifle = false;
            let showShot = false;

            if (this.state === 'WAITING') {
                if (this.falseStarts[i]) {
                    currentImg = this.images.hurt; // They messed up
                } else {
                    currentImg = this.images.back;
                }
            } else if (this.state === 'DRAW') {
                currentImg = this.images.stand;
            } else if (this.state === 'ROUND_OVER') {
                if (i === this.winnerIndex) {
                    currentImg = this.images.cheer;
                } else {
                    currentImg = this.images.hurt;
                }
            }
            
            if (this.shotTimers && this.shotTimers[i] >= 0) {
                showRifle = true;
                if (this.shotTimers[i] < 10) showShot = true; // muzzle flash for first 10 frames
            }

            // Draw character (scale up)
            if (currentImg && currentImg.complete) {
                const imgW = currentImg.width * 2;
                const imgH = currentImg.height * 2;
                ctx.drawImage(currentImg, px - imgW / 2, py - imgH + 50, imgW, imgH);
            }

            // Draw Rifle and Shot
            if (showRifle && this.images.rifle && this.images.rifle.complete) {
                const rw = this.images.rifle.width;
                const rh = this.images.rifle.height;
                // Position rifle in hand (lowered to py - 10)
                ctx.drawImage(this.images.rifle, px + 20, py - 10, rw, rh);
                
                if (showShot && this.images.shot && this.images.shot.complete) {
                    const sw = this.images.shot.width;
                    const sh = this.images.shot.height;
                    ctx.drawImage(this.images.shot, px + 20 + rw, py - 10 - sh/2 + rh/2, sw, sh);
                }
            }
            
            // Draw bullet flying
            if (this.shotTimers && this.shotTimers[i] >= 0) {
                let bulletY = (py - 10) - (this.shotTimers[i] * 30);
                let targetY = py - 350 + (this.images.crosshair ? this.images.crosshair.height/2 : 0);
                
                if (i === this.winnerIndex) {
                    if (bulletY <= targetY) {
                        bulletY = targetY;
                        // Draw hit explosion on crosshair
                        if (this.images.shot && this.images.shot.complete) {
                            ctx.drawImage(this.images.shot, px - this.images.shot.width/2, targetY - this.images.shot.height/2);
                        }
                    } else if (this.images.bulletWinner && this.images.bulletWinner.complete) {
                        ctx.drawImage(this.images.bulletWinner, px - this.images.bulletWinner.width/2, bulletY);
                    }
                } else {
                    if (this.images.bulletLoser && this.images.bulletLoser.complete) {
                        ctx.drawImage(this.images.bulletLoser, px - this.images.bulletLoser.width/2 + 20, bulletY); // Offset slightly
                    }
                    if (bulletY < targetY - 20) {
                        ctx.filter = 'none';
                        ctx.globalAlpha = 1.0;
                        ctx.fillStyle = 'white';
                        ctx.strokeStyle = 'black';
                        ctx.lineWidth = 4;
                        ctx.font = "bold 50px 'Rye', sans-serif";
                        ctx.strokeText("MISS", px, targetY);
                        ctx.fillText("MISS", px, targetY);
                    }
                }
            }
            
            if (this.state === 'WAITING' && this.falseStarts[i]) {
                ctx.fillStyle = 'red';
                ctx.font = "bold 30px 'Rye', sans-serif";
                ctx.fillText("FALSE START!", px, py - 150);
            }
            ctx.filter = 'none';
            ctx.globalAlpha = 1.0;
        }

        // Top Status Text
        if (this.state === 'WAITING') {
            ctx.fillStyle = 'white';
            ctx.font = "bold 80px 'Rye', 'Impact', sans-serif";
            ctx.fillText("WAIT FOR IT...", width / 2, 120);
        } else if (this.state === 'DRAW') {
            ctx.fillStyle = '#ff3333';
            ctx.font = "bold 150px 'Rye', 'Impact', sans-serif";
            ctx.fillText("DRAW!", width / 2, 150);
        } else if (this.state === 'ROUND_OVER') {
            ctx.fillStyle = 'yellow';
            ctx.font = "bold 80px 'Rye', 'Impact', sans-serif";
            ctx.fillText(`PLAYER ${this.winnerIndex + 1} WINS ROUND!`, width / 2, 120);
        }

        // Draw current scores at bottom
        ctx.font = "bold 40px 'Rye', sans-serif";
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

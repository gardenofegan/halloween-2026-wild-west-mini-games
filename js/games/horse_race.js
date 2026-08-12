// js/games/horse_race.js
const horseRace = {
    name: 'Horse Race',
    scores: [0, 0, 0, 0],
    
    // Rhythm mechanics
    beatInterval: 40, // 90 BPM at 60fps
    beatTimer: 40,
    tolerance: 8, // +/- frames for a successful hit

    players: [
        { stumbleTimer: 0, hasHitThisBeat: false, color: '#e74c3c' },
        { stumbleTimer: 0, hasHitThisBeat: false, color: '#2ecc71' },
        { stumbleTimer: 0, hasHitThisBeat: false, color: '#f1c40f' },
        { stumbleTimer: 0, hasHitThisBeat: false, color: '#3498db' }
    ],

    prevInput: null,

    reset: function() {
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        this.beatTimer = this.beatInterval;
        for (let i = 0; i < 4; i++) {
            this.players[i].stumbleTimer = 0;
            this.players[i].hasHitThisBeat = false;
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

        // Advance beat timer
        this.beatTimer--;
        let isOnBeat = false;
        if (this.beatTimer <= 0) {
            this.beatTimer = this.beatInterval;
            // Reset "hit this beat" flags for everyone
            for (let i = 0; i < 4; i++) {
                this.players[i].hasHitThisBeat = false;
            }
        }

        // Determine if currently within tolerance window
        if (this.beatTimer <= this.tolerance || this.beatTimer >= this.beatInterval - this.tolerance) {
            isOnBeat = true;
        }

        // Process Player Input
        for (let i = 0; i < 4; i++) {
            let p = this.players[i];
            
            if (p.stumbleTimer > 0) {
                p.stumbleTimer--;
            }

            if (activePlayers && activePlayers[i]) {
                if (isPressed(i, 'red')) {
                    if (p.stumbleTimer > 0) {
                        // Already stumbling, mashing makes it worse (resets stumble timer)
                        p.stumbleTimer = 30;
                    } else if (isOnBeat && !p.hasHitThisBeat) {
                        // Perfect hit!
                        this.scores[i] += 10;
                        p.hasHitThisBeat = true;
                    } else {
                        // Missed beat or mashed twice in one window
                        p.stumbleTimer = 45; // Stumble for 0.75 seconds
                        p.hasHitThisBeat = true; // Prevent further scoring on this beat if they were early
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
        ctx.fillText("GALLOP ON THE BEAT!", width / 2, 60);

        // Draw Rhythm Pulse
        let scale = 1.0;
        let isOnBeat = (this.beatTimer <= this.tolerance || this.beatTimer >= this.beatInterval - this.tolerance);
        
        if (isOnBeat) {
            scale = 1.3;
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = '#555';
            // Slight pulse animation based on distance from beat
            scale = 1.0 + (1 - (Math.min(this.beatTimer, this.beatInterval - this.beatTimer) / (this.beatInterval / 2))) * 0.1;
        }

        ctx.save();
        ctx.translate(width / 2, 160);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
        
        if (isOnBeat) {
            ctx.fillStyle = '#e74c3c';
            ctx.font = "bold 30px 'Impact', sans-serif";
            ctx.fillText("BEAT!", 0, 10);
        }
        ctx.restore();

        // Draw Race Tracks
        const trackHeight = 150;
        const startY = 280;
        const maxScore = 500; // Target score for full screen width

        for (let i = 0; i < 4; i++) {
            let p = this.players[i];
            let laneY = startY + i * trackHeight;

            // Track background
            ctx.fillStyle = (i % 2 === 0) ? '#4a2f1d' : '#3d2314';
            ctx.fillRect(0, laneY, width, trackHeight);

            // Track lines
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.setLineDash([15, 15]);
            ctx.beginPath();
            ctx.moveTo(0, laneY + trackHeight);
            ctx.lineTo(width, laneY + trackHeight);
            ctx.stroke();
            ctx.setLineDash([]);

            // Player progress X
            let progressX = 100 + (this.scores[i] / maxScore) * (width - 250);
            // Cap visual progress or loop it (looping is better so they don't go off screen)
            progressX = progressX % (width - 150);

            // Draw Horse
            ctx.save();
            ctx.translate(progressX, laneY + trackHeight - 20);

            if (p.stumbleTimer > 0) {
                // Stumbling
                ctx.rotate(Math.PI / 4); // Tilt forward
                ctx.fillStyle = p.color;
                ctx.fillRect(-40, -60, 80, 40); // Body
                ctx.fillStyle = '#fff';
                ctx.font = "bold 20px 'Rye', sans-serif";
                ctx.fillText("STUMBLE!", 0, -80);
            } else {
                // Running (animate legs based on beatTimer if we want, or just static)
                let gallopOffset = isOnBeat ? -10 : 0;
                ctx.translate(0, gallopOffset);
                
                ctx.fillStyle = p.color;
                // Simple Horse shape
                ctx.fillRect(-50, -80, 80, 50); // Body
                ctx.fillRect(10, -110, 30, 40); // Head/Neck
                
                // Legs
                ctx.fillStyle = '#222';
                if (gallopOffset < 0) {
                    // Stretched legs
                    ctx.fillRect(-60, -30, 10, 30);
                    ctx.fillRect(20, -30, 10, 30);
                } else {
                    // Standing legs
                    ctx.fillRect(-40, -30, 10, 30);
                    ctx.fillRect(10, -30, 10, 30);
                }
            }
            
            ctx.restore();

            // Score/Info
            ctx.fillStyle = p.color;
            ctx.textAlign = 'left';
            ctx.font = "bold 40px 'Rye', sans-serif";
            ctx.fillText(`P${i+1} DISTANCE: ${this.scores[i]}`, 20, laneY + 50);
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = horseRace;
}
if (typeof window !== 'undefined') {
    window.horseRace = horseRace;
}

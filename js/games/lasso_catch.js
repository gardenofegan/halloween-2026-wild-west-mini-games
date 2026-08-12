// js/games/lasso_catch.js
const lassoCatch = {
    name: 'Lasso Catch',
    scores: [0, 0, 0, 0],
    
    // Each player has a target moving back and forth
    targets: [
        { x: 0, speed: 5, direction: 1, cooldown: 0 },
        { x: 0, speed: 6, direction: 1, cooldown: 0 },
        { x: 0, speed: 7, direction: 1, cooldown: 0 },
        { x: 0, speed: 4, direction: 1, cooldown: 0 }
    ],

    prevInput: null,

    reset: function() {
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        for (let i = 0; i < 4; i++) {
            this.resetTarget(i);
        }
    },

    resetTarget: function(index) {
        // Start randomly on left or right
        const startLeft = Math.random() > 0.5;
        this.targets[index].x = startLeft ? -200 : 2120; // Offscreen based on 1920 width
        this.targets[index].direction = startLeft ? 1 : -1;
        this.targets[index].speed = Math.random() * 8 + 6; // Random speed between 6 and 14
        this.targets[index].cooldown = 0;
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

        const width = 1920; // Base canvas width
        const targetZoneCenter = width / 2;
        const targetZoneWidth = 120;

        for (let i = 0; i < 4; i++) {
            if (activePlayers && activePlayers[i]) {
                const target = this.targets[i];

                if (target.cooldown > 0) {
                    target.cooldown--;
                    if (target.cooldown <= 0) {
                        this.resetTarget(i);
                    }
                } else {
                    // Move target
                    target.x += target.speed * target.direction;

                    // Bounce off edges (or wrap around, but bouncing is fun)
                    if (target.x < -100) {
                        target.direction = 1;
                        target.x = -100;
                    } else if (target.x > width + 100) {
                        target.direction = -1;
                        target.x = width + 100;
                    }

                    // Check for throw
                    if (isPressed(i, 'red')) {
                        // Did they catch it?
                        const dist = Math.abs(target.x - targetZoneCenter);
                        if (dist < targetZoneWidth / 2) {
                            // Caught!
                            this.scores[i] += 1;
                            target.cooldown = 60; // Wait 1 second before respawning
                        } else {
                            // Missed! Penalty delay
                            target.cooldown = 30; // Stunned/Miss animation state
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

            const target = this.targets[i];
            
            // Draw the cow/target
            ctx.save();
            ctx.translate(target.x, laneY + laneHeight / 2);
            
            if (target.cooldown > 0) {
                // If cooldown > 30, it was a catch. If <= 30, it was a miss.
                // But we don't strictly know if it was a catch or miss just from cooldown,
                // let's assume if it's perfectly in center, it was a catch.
                const dist = Math.abs(target.x - targetZoneCenter);
                if (dist < targetZoneWidth / 2) {
                    // Caught
                    ctx.fillStyle = '#2ecc71'; // Green
                    ctx.font = "bold 30px 'Rye', sans-serif";
                    ctx.textAlign = 'center';
                    ctx.fillText("CAUGHT!", 0, -40);
                    
                    // Draw Lasso circle
                    ctx.strokeStyle = '#d4a359';
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 50, 30, 0, 0, Math.PI * 2);
                    ctx.stroke();
                } else {
                    // Missed
                    ctx.fillStyle = '#e74c3c'; // Red
                    ctx.font = "bold 30px 'Rye', sans-serif";
                    ctx.textAlign = 'center';
                    ctx.fillText("MISSED!", 0, -40);
                }
            }
            
            // Draw Cow Body
            ctx.fillStyle = '#fff';
            ctx.fillRect(-30, -20, 60, 40);
            ctx.fillStyle = '#000';
            ctx.fillRect(-20, -10, 20, 20); // Cow spots
            ctx.fillRect(10, 0, 15, 15);
            
            // Draw Cow Head based on direction
            ctx.fillStyle = '#fff';
            if (target.direction === 1) {
                ctx.fillRect(20, -30, 30, 30);
                ctx.fillStyle = '#000';
                ctx.fillRect(40, -25, 5, 5); // Eye
            } else {
                ctx.fillRect(-50, -30, 30, 30);
                ctx.fillStyle = '#000';
                ctx.fillRect(-45, -25, 5, 5); // Eye
            }
            
            ctx.restore();
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = lassoCatch;
}
if (typeof window !== 'undefined') {
    window.lassoCatch = lassoCatch;
}

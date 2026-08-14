// js/games/gold_rush.js
const goldRush = {
    name: 'Gold Rush',
    scores: [0, 0, 0, 0],
    
    prevInput: null,
    images: {},

    loadImages: function() {
        if (typeof Image !== 'undefined' && !this.images.gold) {
            this.images.gold = new Image();
            this.images.gold.src = 'assets/images/platformer/Base pack/Items/coinGold.png';
        }
    },

    reset: function() {
        this.loadImages();
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
    },

    update: function(input, activePlayers) {
        if (!input || !input.players) return;

        if (!this.prevInput) {
            this.prevInput = { players: input.players.map(p => ({ ...p })) };
            return; // Skip first frame
        }

        const isPressed = (playerIndex, btn) => {
            return input.players[playerIndex][btn] && !this.prevInput.players[playerIndex][btn];
        };

        for (let i = 0; i < 4; i++) {
            if (activePlayers && activePlayers[i]) {
                if (isPressed(i, 'red')) {
                    this.scores[i] += 1;
                }
            }
        }

        this.prevInput = { players: input.players.map(p => ({ ...p })) };
    },

    draw: function(ctx, width, height) {
        ctx.textAlign = 'center';
        
        ctx.fillStyle = '#f5a623';
        ctx.font = "bold 60px 'Rye', 'Impact', sans-serif";
        ctx.fillText("MASH RED TO MINE GOLD!", width / 2, 80);

        const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db']; // Red, Green, Yellow, Blue
        const cartWidth = width / 5;
        const cartHeight = 150;
        const maxScore = 200; // Expected max score, just for visual scaling
        const startY = height - 100;

        for (let i = 0; i < 4; i++) {
            const x = width / 8 + i * (width / 4);
            
            // Draw track
            ctx.fillStyle = '#5c4033';
            ctx.fillRect(x - cartWidth / 2, startY + 10, cartWidth, 10);
            
            const fillRatio = this.scores[i] / maxScore;
            
            // 1. Draw cart back wall (dark wood)
            ctx.fillStyle = '#2a1302';
            ctx.fillRect(x - cartWidth / 2.5, startY - cartHeight, cartWidth * 0.8, cartHeight);

            // 2. Draw gold filling inside
            const goldHeight = cartHeight * fillRatio;
            if (goldHeight > 0) {
                // Yellow background fill
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(x - cartWidth / 2.5 + 5, startY - goldHeight, cartWidth * 0.8 - 10, goldHeight);
                
                // Scatter gold coins
                if (this.images.gold && this.images.gold.complete && this.scores[i] > 0) {
                    const numCoins = Math.min(Math.floor(this.scores[i] / 2), 60);
                    for(let c = 0; c < numCoins; c++) {
                        const cx = x - cartWidth / 2.5 + 10 + ((c * 47) % (cartWidth * 0.8 - 40));
                        const cy = startY - 30 - ((c * 31) % Math.max(goldHeight - 20, 1));
                        ctx.drawImage(this.images.gold, cx, cy, 30, 30);
                    }
                    
                    // Overflow coins if over maxScore
                    if (fillRatio > 1) {
                        const numOverflow = Math.min(Math.floor((this.scores[i] - maxScore) / 2), 40);
                        for(let c = 0; c < numOverflow; c++) {
                            const cx = x - cartWidth / 2.5 + 10 + ((c * 53) % (cartWidth * 0.8 - 40));
                            const cy = startY - cartHeight - 30 - ((c * 17) % (goldHeight - cartHeight + 30));
                            ctx.drawImage(this.images.gold, cx, cy, 30, 30);
                        }
                    }
                }
            }

            // 3. Draw Cart Front Cage (wooden bars)
            ctx.fillStyle = '#4a2f1d'; // Lighter wood
            // Frame
            ctx.fillRect(x - cartWidth / 2.5, startY - cartHeight, cartWidth * 0.8, 10); // Top bar
            ctx.fillRect(x - cartWidth / 2.5, startY - 10, cartWidth * 0.8, 10); // Bottom bar
            ctx.fillRect(x - cartWidth / 2.5, startY - cartHeight, 10, cartHeight); // Left bar
            ctx.fillRect(x + cartWidth / 2.5 - 10, startY - cartHeight, 10, cartHeight); // Right bar
            // Vertical bars
            for (let b = 1; b < 5; b++) {
                ctx.fillRect(x - cartWidth / 2.5 + b * (cartWidth * 0.8 / 5), startY - cartHeight, 10, cartHeight);
            }

            // 4. Draw minecart wheels
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(x - cartWidth / 4, startY, 20, 0, Math.PI * 2);
            ctx.arc(x + cartWidth / 4, startY, 20, 0, Math.PI * 2);
            ctx.fill();
            // Wheel centers
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(x - cartWidth / 4, startY, 6, 0, Math.PI * 2);
            ctx.arc(x + cartWidth / 4, startY, 6, 0, Math.PI * 2);
            ctx.fill();

            // 5. Draw player color outline
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 4;
            ctx.strokeRect(x - cartWidth / 2.5 - 4, startY - cartHeight - 4, cartWidth * 0.8 + 8, cartHeight + 8);

            // Draw score text
            ctx.fillStyle = colors[i];
            ctx.font = "bold 40px 'Rye', sans-serif";
            ctx.fillText(`P${i+1}: ${this.scores[i]}`, x, startY - cartHeight - 30);
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = goldRush;
}
if (typeof window !== 'undefined') {
    window.goldRush = goldRush;
}

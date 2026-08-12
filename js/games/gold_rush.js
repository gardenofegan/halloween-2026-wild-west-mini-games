// js/games/gold_rush.js
const goldRush = {
    name: 'Gold Rush',
    scores: [0, 0, 0, 0],
    
    prevInput: null,

    reset: function() {
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
        const startY = height - 100;
        const maxScore = 200; // Expected max score, just for visual scaling

        for (let i = 0; i < 4; i++) {
            const x = width / 8 + i * (width / 4);
            
            // Draw track
            ctx.fillStyle = '#5c4033';
            ctx.fillRect(x - cartWidth / 2, startY + 10, cartWidth, 10);
            
            // Draw minecart body
            ctx.fillStyle = '#3a2312';
            ctx.fillRect(x - cartWidth / 2.5, startY - cartHeight, cartWidth * 0.8, cartHeight);
            
            // Draw minecart wheels
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(x - cartWidth / 4, startY, 20, 0, Math.PI * 2);
            ctx.arc(x + cartWidth / 4, startY, 20, 0, Math.PI * 2);
            ctx.fill();

            // Draw gold inside the cart
            const fillPercentage = Math.min(this.scores[i] / maxScore, 1);
            const goldHeight = cartHeight * fillPercentage;
            
            if (goldHeight > 0) {
                ctx.fillStyle = '#ffd700'; // Gold color
                // Draw gold filling from bottom of cart
                ctx.fillRect(x - cartWidth / 2.5 + 5, startY - goldHeight, cartWidth * 0.8 - 10, goldHeight);
            }

            // Draw player color outline
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 4;
            ctx.strokeRect(x - cartWidth / 2.5, startY - cartHeight, cartWidth * 0.8, cartHeight);

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

// js/games/telegraph_decoder.js
const telegraphDecoder = {
    name: 'Telegraph Decoder',
    scores: [0, 0, 0, 0],
    
    state: 'WATCH', // 'WATCH', 'REPEAT', 'RESULT'
    sequence: [],
    
    // Watch phase state
    playbackIndex: 0,
    playbackTimer: 0,
    isSignalOn: false,
    
    // Player phase state
    players: [
        { inputs: [], pressTimer: 0, failed: false, success: false },
        { inputs: [], pressTimer: 0, failed: false, success: false },
        { inputs: [], pressTimer: 0, failed: false, success: false },
        { inputs: [], pressTimer: 0, failed: false, success: false }
    ],

    resultTimer: 0,
    winnerIndex: -1,
    level: 3, // Start with sequence of 3

    prevInput: null,
    images: {},

    loadImages: function() {
        if (typeof Image !== 'undefined' && !this.images.lightOn) {
            this.images.lightOn = new Image();
            this.images.lightOn.src = 'assets/images/ui-pack/PNG/buttonRound_beige.png';
            this.images.lightOff = new Image();
            this.images.lightOff.src = 'assets/images/ui-pack/PNG/buttonRound_grey.png';
        }
        if (typeof Audio !== 'undefined' && !this.audio) {
            this.audio = {
                tone: new Audio('assets/audio/digital-audio/tone1.ogg'),
                wrong: new Audio('assets/audio/digital-audio/pepSound1.ogg'),
                correct: new Audio('assets/audio/digital-audio/powerUp1.ogg')
            };
        }
    },

    reset: function() {
        this.loadImages();
        this.scores = [0, 0, 0, 0];
        this.prevInput = null;
        this.level = 3;
        this.startNewSequence();
    },

    startNewSequence: function() {
        this.state = 'WATCH';
        this.sequence = [];
        for (let i = 0; i < this.level; i++) {
            this.sequence.push(Math.random() > 0.5 ? 'short' : 'long');
        }
        
        this.playbackIndex = 0;
        this.playbackTimer = 60; // 1 second pause before starting
        this.isSignalOn = false;
        
        this.winnerIndex = -1;
        for (let i = 0; i < 4; i++) {
            this.players[i].inputs = [];
            this.players[i].pressTimer = 0;
            this.players[i].failed = false;
            this.players[i].success = false;
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
        const isReleased = (playerIndex, btn) => {
            return !input.players[playerIndex][btn] && this.prevInput.players[playerIndex][btn];
        };
        const isHeld = (playerIndex, btn) => {
            return input.players[playerIndex][btn];
        };

        if (this.state === 'WATCH') {
            this.playbackTimer--;
            
            if (this.playbackTimer <= 0) {
                if (!this.isSignalOn) {
                    if (this.playbackIndex >= this.sequence.length) {
                        // Done playing sequence
                        this.state = 'REPEAT';
                    } else {
                        // Turn signal ON
                        this.isSignalOn = true;
                        this.playbackTimer = this.sequence[this.playbackIndex] === 'long' ? 45 : 15;
                        if (this.audio && this.audio.tone) {
                            this.audio.tone.currentTime = 0;
                            this.audio.tone.play().catch(e=>{});
                        }
                    }
                } else {
                    // Turn signal OFF
                    this.isSignalOn = false;
                    this.playbackIndex++;
                    this.playbackTimer = 15; // Gap between signals
                }
            }
        } else if (this.state === 'REPEAT') {
            let allFailed = true;
            let anyActive = false;

            for (let i = 0; i < 4; i++) {
                if (activePlayers && activePlayers[i]) {
                    anyActive = true;
                    let p = this.players[i];
                    
                    if (!p.failed && !p.success) {
                        allFailed = false;

                        if (isPressed(i, 'red')) {
                            if (this.audio && this.audio.tone) {
                                this.audio.tone.currentTime = 0;
                                this.audio.tone.play().catch(e=>{});
                            }
                        }

                        if (isHeld(i, 'red')) {
                            p.pressTimer++;
                        }
                        
                        if (isReleased(i, 'red')) {
                            // Determine if short or long (threshold 15 frames)
                            let signal = p.pressTimer >= 15 ? 'long' : 'short';
                            p.pressTimer = 0;
                            
                            p.inputs.push(signal);
                            
                            // Check against sequence
                            let currentIndex = p.inputs.length - 1;
                            if (p.inputs[currentIndex] !== this.sequence[currentIndex]) {
                                p.failed = true;
                                if (this.audio && this.audio.wrong) {
                                    this.audio.wrong.currentTime = 0;
                                    this.audio.wrong.play().catch(e=>{});
                                }
                            } else if (p.inputs.length === this.sequence.length) {
                                // They got the whole sequence!
                                p.success = true;
                                this.winnerIndex = i;
                                this.scores[i]++;
                                this.level = Math.min(this.level + 1, 7); // Increase difficulty
                                this.state = 'RESULT';
                                this.resultTimer = 120;
                                if (this.audio && this.audio.correct) {
                                    this.audio.correct.currentTime = 0;
                                    this.audio.correct.play().catch(e=>{});
                                }
                            }
                        }
                    }
                }
            }

            if (anyActive && allFailed && this.state !== 'RESULT') {
                // Everyone failed, retry same level or maybe drop level? Let's just restart same level
                this.state = 'RESULT';
                this.resultTimer = 120;
                this.winnerIndex = -1; // No winner
            }

        } else if (this.state === 'RESULT') {
            this.resultTimer--;
            if (this.resultTimer <= 0) {
                this.startNewSequence();
            }
        }

        this.prevInput = { players: input.players.map(p => ({ ...p })) };
    },

    draw: function(ctx, width, height) {
        ctx.textAlign = 'center';
        
        ctx.fillStyle = '#f5a623';
        ctx.font = "bold 50px 'Rye', 'Impact', sans-serif";
        ctx.fillText("TELEGRAPH DECODER", width / 2, 60);

        if (this.state === 'WATCH') {
            ctx.fillStyle = '#fff';
            ctx.font = "bold 40px 'Rye', sans-serif";
            ctx.fillText("MEMORIZE THE SIGNAL...", width / 2, 120);

            // Draw central light
            const lightImg = this.isSignalOn ? this.images.lightOn : this.images.lightOff;
            if (lightImg && lightImg.complete) {
                ctx.drawImage(lightImg, width / 2 - 80, height / 2 - 130, 160, 160);
            } else {
                ctx.beginPath();
                ctx.arc(width / 2, height / 2 - 50, 80, 0, Math.PI * 2);
                ctx.fillStyle = this.isSignalOn ? '#f1c40f' : '#222';
                ctx.fill();
                ctx.lineWidth = 10;
                ctx.strokeStyle = '#111';
                ctx.stroke();
            }

            if (this.isSignalOn) {
                // Glow
                let gradient = ctx.createRadialGradient(width/2, height/2-50, 80, width/2, height/2-50, 150);
                gradient.addColorStop(0, 'rgba(241, 196, 15, 0.5)');
                gradient.addColorStop(1, 'rgba(241, 196, 15, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2 - 50, 150, 0, Math.PI * 2);
                ctx.fill();
            }

        } else if (this.state === 'REPEAT') {
            ctx.fillStyle = '#fff';
            ctx.font = "bold 40px 'Rye', sans-serif";
            ctx.fillText("REPEAT THE SIGNAL! (Quick tap = DOT, Hold = DASH)", width / 2, 120);

            // Draw Central Reference Sequence
            let refDotRadius = 15;
            let refDashWidth = 60;
            let refSpacing = 20;
            
            let totalRefWidth = 0;
            for (let j = 0; j < this.sequence.length; j++) {
                totalRefWidth += (this.sequence[j] === 'short' ? refDotRadius * 2 : refDashWidth) + refSpacing;
            }
            totalRefWidth -= refSpacing;

            let currentRefX = (width / 2) - (totalRefWidth / 2);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let j = 0; j < this.sequence.length; j++) {
                if (this.sequence[j] === 'short') {
                    ctx.beginPath();
                    ctx.arc(currentRefX + refDotRadius, height / 2 - 50, refDotRadius, 0, Math.PI * 2);
                    ctx.fill();
                    currentRefX += refDotRadius * 2 + refSpacing;
                } else {
                    ctx.fillRect(currentRefX, height / 2 - 65, refDashWidth, 30);
                    currentRefX += refDashWidth + refSpacing;
                }
            }
        } else if (this.state === 'RESULT') {
            if (this.winnerIndex >= 0) {
                ctx.fillStyle = '#2ecc71';
                ctx.font = "bold 80px 'Rye', sans-serif";
                ctx.fillText(`PLAYER ${this.winnerIndex + 1} DECODED IT!`, width / 2, height / 2 - 50);
            } else {
                ctx.fillStyle = '#e74c3c';
                ctx.font = "bold 80px 'Rye', sans-serif";
                ctx.fillText("EVERYONE FAILED!", width / 2, height / 2 - 50);
            }
        }

        // Draw Player Areas at the bottom
        const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db'];
        const sectionWidth = width / 4;
        
        for (let i = 0; i < 4; i++) {
            let p = this.players[i];
            let startX = i * sectionWidth;
            let centerX = startX + sectionWidth / 2;
            let bottomY = height - 50;

            // Divider
            if (i > 0) {
                ctx.strokeStyle = '#3d2314';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(startX, height - 300);
                ctx.lineTo(startX, height);
                ctx.stroke();
            }

            // Score
            ctx.fillStyle = colors[i];
            ctx.font = "bold 40px 'Rye', sans-serif";
            ctx.fillText(`P${i+1}: ${this.scores[i]}`, centerX, height - 250);

            // Status Text
            if (p.failed) {
                ctx.fillStyle = '#e74c3c';
                ctx.fillText("FAILED", centerX, height - 200);
            } else if (p.success) {
                ctx.fillStyle = '#2ecc71';
                ctx.fillText("CRACKED!", centerX, height - 200);
            } else if (this.state === 'REPEAT') {
                ctx.fillStyle = '#fff';
                ctx.fillText("YOUR TURN", centerX, height - 200);
            }

            // Draw inputs so far
            let dotRadius = 10;
            let dashWidth = 40;
            let spacing = 15;
            
            // Calculate total width of inputs to center them
            let totalWidth = 0;
            for (let j = 0; j < p.inputs.length; j++) {
                totalWidth += (p.inputs[j] === 'short' ? dotRadius * 2 : dashWidth) + spacing;
            }
            totalWidth -= spacing;

            let currentX = centerX - totalWidth / 2;
            
            // Draw inputs so far (filled)
            ctx.fillStyle = p.failed ? '#e74c3c' : (p.success ? '#2ecc71' : colors[i]);
            
            let drawX = currentX;
            for (let j = 0; j < p.inputs.length; j++) {
                if (p.inputs[j] === 'short') {
                    ctx.beginPath();
                    ctx.arc(drawX + dotRadius, bottomY - 100, dotRadius, 0, Math.PI * 2);
                    ctx.fill();
                    drawX += dotRadius * 2 + spacing;
                } else {
                    ctx.fillRect(drawX, bottomY - 110, dashWidth, 20);
                    drawX += dashWidth + spacing;
                }
            }

            // Draw current press indicator (telegraph key feedback)
            if (p.pressTimer > 0) {
                ctx.fillStyle = p.pressTimer >= 15 ? '#fff' : '#aaa'; // Turns white when held long enough for a dash
                ctx.beginPath();
                ctx.arc(centerX, bottomY - 30, 15, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = telegraphDecoder;
}
if (typeof window !== 'undefined') {
    window.telegraphDecoder = telegraphDecoder;
}

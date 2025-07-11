// Visual Effects Manager - Handles all visual effects and animations
class VisualEffects {
    constructor(terminal) {
        this.terminal = terminal;
    }

    showGlugFx() {
        if (!this.terminal) return;
        
        let fx = document.createElement('div');
        fx.className = 'glug-fx';
        fx.textContent = '*glug*';
        
        // Randomize direction and rotation
        const angle = Math.random() * 2 * Math.PI;
        const distance = 80 + Math.random() * 80; // 80-160px
        const x = Math.round(Math.cos(angle) * distance);
        const y = Math.round(Math.sin(angle) * distance) - 180; // bias upward
        const rotate = Math.round((Math.random() - 0.5) * 120); // -60deg to +60deg
        
        fx.style.setProperty('--glug-x', `${x}px`);
        fx.style.setProperty('--glug-y', `${y}px`);
        fx.style.setProperty('--glug-rotate', `${rotate}deg`);
        
        // Position relative to terminal
        this.terminal.style.position = 'relative';
        this.terminal.appendChild(fx);
        
        // Triple shake
        const doShake = () => {
            this.terminal.classList.remove('shake');
            this.terminal.style.setProperty('--shake-x', '1px');
            this.terminal.style.setProperty('--shake-y', '1px');
            void this.terminal.offsetWidth;
            this.terminal.classList.add('shake');
            setTimeout(() => this.terminal.classList.remove('shake'), 120);
        };
        
        doShake();
        setTimeout(doShake, 180);
        setTimeout(doShake, 360);
        
        setTimeout(() => {
            fx.remove();
            this.terminal.classList.remove('shake');
        }, 2200);
    }

    showCrunchFx() {
        if (!this.terminal) return;
        
        let fx = document.createElement('div');
        fx.className = 'crunch-fx';
        fx.textContent = '*crunch*';
        
        // Randomize direction and rotation
        const angle = Math.random() * 2 * Math.PI;
        const distance = 80 + Math.random() * 80; // 80-160px
        const x = Math.round(Math.cos(angle) * distance);
        const y = Math.round(Math.sin(angle) * distance) - 180; // bias upward
        const rotate = Math.round((Math.random() - 0.5) * 120); // -60deg to +60deg
        
        fx.style.setProperty('--crunch-x', `${x}px`);
        fx.style.setProperty('--crunch-y', `${y}px`);
        fx.style.setProperty('--crunch-rotate', `${rotate}deg`);
        
        // Position relative to terminal
        this.terminal.style.position = 'relative';
        this.terminal.appendChild(fx);
        
        // Triple shake
        const doShake = () => {
            this.terminal.classList.remove('shake');
            this.terminal.style.setProperty('--shake-x', '1px');
            this.terminal.style.setProperty('--shake-y', '1px');
            void this.terminal.offsetWidth;
            this.terminal.classList.add('shake');
            setTimeout(() => this.terminal.classList.remove('shake'), 120);
        };
        
        doShake();
        setTimeout(doShake, 180);
        setTimeout(doShake, 360);
        
        setTimeout(() => {
            fx.remove();
            this.terminal.classList.remove('shake');
        }, 2200);
    }

    showDamageFx(amount) {
        if (!this.terminal) return;
        
        let fx = document.createElement('div');
        fx.className = 'damage-fx';
        fx.textContent = `${amount}`;
        
        // Position enemy damage on the right side (damage you deal)
        const x = 60 + Math.round((Math.random() - 0.5) * 40); // 40 to 80px (right side)
        const y = -120 + Math.round(Math.random() * 40); // -120 to -80px
        
        fx.style.setProperty('--damage-x', `${x}px`);
        fx.style.setProperty('--damage-y', `${y}px`);
        
        this.terminal.style.position = 'relative';
        this.terminal.appendChild(fx);
        
        setTimeout(() => fx.remove(), 1300);
    }

    showPlayerDamageFx(amount) {
        if (!this.terminal) return;
        
        let fx = document.createElement('div');
        fx.className = 'player-damage-fx';
        fx.textContent = `-${amount}`;
        
        // Position player damage on the left side (damage you take)
        const x = -80 + Math.round((Math.random() - 0.5) * 40); // -100 to -60px (left side)
        const y = -120 + Math.round(Math.random() * 40); // -120 to -80px
        
        fx.style.setProperty('--player-damage-x', `${x}px`);
        fx.style.setProperty('--player-damage-y', `${y}px`);
        
        this.terminal.style.position = 'relative';
        this.terminal.appendChild(fx);
        
        setTimeout(() => fx.remove(), 1300);
    }

    showArmorDamageFx(amount) {
        if (!this.terminal) return;
        
        let fx = document.createElement('div');
        fx.className = 'armor-damage-fx';
        fx.textContent = `-${amount}`;
        
        // Position armor damage in the center
        const x = Math.round((Math.random() - 0.5) * 40); // -20 to +20px (center)
        const y = -140 + Math.round(Math.random() * 40); // -140 to -100px (slightly higher)
        
        fx.style.setProperty('--armor-damage-x', `${x}px`);
        fx.style.setProperty('--armor-damage-y', `${y}px`);
        
        this.terminal.style.position = 'relative';
        this.terminal.appendChild(fx);
        
        setTimeout(() => fx.remove(), 1300);
    }

    showZRainFx() {
        const fxLayer = document.getElementById('fx-layer');
        if (!fxLayer) return;
        
        fxLayer.style.pointerEvents = 'none';
        fxLayer.style.position = 'absolute';
        fxLayer.style.top = '0';
        fxLayer.style.left = '0';
        fxLayer.style.width = '100%';
        fxLayer.style.height = '400px';
        
        const zCount = 8 + Math.floor(Math.random() * 4); // 8-11 Z's
        const zElements = [];
        
        for (let i = 0; i < zCount; i++) {
            let fx = document.createElement('div');
            fx.className = 'sleep-fx';
            fx.textContent = 'Z';
            
            // Random horizontal position (10% to 90% of fxLayer width)
            const left = 10 + Math.random() * 80;
            fx.style.left = `${left}%`;
            fx.style.top = '0%';
            
            // Stagger animation start
            fx.style.animationDelay = `${Math.random() * 2.5}s`;
            fxLayer.appendChild(fx);
            zElements.push(fx);
        }
        
        setTimeout(() => {
            zElements.forEach(fx => fx.remove());
        }, 5000);
    }

    showAttackShake(intensity) {
        if (!this.terminal) return;
        
        const shakeIntensity = Math.min(1 + intensity * 0.7, 6); // px, less intense
        this.terminal.style.setProperty('--shake-x', shakeIntensity + 'px');
        this.terminal.style.setProperty('--shake-y', shakeIntensity + 'px');
        this.terminal.classList.remove('shake'); // restart if needed
        void this.terminal.offsetWidth;
        this.terminal.classList.add('shake');
        setTimeout(() => this.terminal.classList.remove('shake'), 400);
    }

    startRainEffect(intensity = 'normal') {
        if (!this.terminal) return;
        
        // Clear any existing rain
        this.stopRainEffect();
        
        // Create rain container
        this.rainContainer = document.createElement('div');
        this.rainContainer.className = 'rain-container';
        this.rainContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 10;
        `;
        
        this.terminal.style.position = 'relative';
        this.terminal.appendChild(this.rainContainer);
        
        // Set rain intensity parameters
        this.currentRainIntensity = intensity;
        
        // Create rain drops
        this.createRainDrops();
        
        // Continue creating new drops periodically based on intensity
        const intervalMap = {
            'light': 300,    // Slower for light rain
            'normal': 200,   // Standard speed
            'heavy': 150,    // Faster for heavy rain
            'storm': 100     // Very fast for storm
        };
        
        this.rainInterval = setInterval(() => {
            this.createRainDrops();
        }, intervalMap[intensity] || 200);
        
        // Start terminal rumble based on intensity
        this.startRainRumble(intensity);
    }

    stopRainEffect() {
        if (this.rainContainer) {
            this.rainContainer.remove();
            this.rainContainer = null;
        }
        if (this.rainInterval) {
            clearInterval(this.rainInterval);
            this.rainInterval = null;
        }
        // Stop rain rumble
        this.stopRainRumble();
    }

    startRainRumble(intensity) {
        if (!this.terminal) return;
        
        // Clear any existing rumble
        this.stopRainRumble();
        
        const rumbleParams = {
            'light': { enabled: false, intensity: 0, interval: 0 },
            'normal': { enabled: true, intensity: 0.5, interval: 150 },
            'heavy': { enabled: true, intensity: 1.0, interval: 100 },
            'storm': { enabled: true, intensity: 2.0, interval: 75 }
        };
        
        const params = rumbleParams[intensity] || rumbleParams['normal'];
        
        if (!params.enabled) return;
        
        // Start continuous rumble
        this.rainRumbleInterval = setInterval(() => {
            // Randomize the shake direction slightly for more natural feel
            const shakeX = params.intensity + (Math.random() - 0.5) * 0.5;
            const shakeY = params.intensity + (Math.random() - 0.5) * 0.5;
            
            this.terminal.style.setProperty('--shake-x', shakeX + 'px');
            this.terminal.style.setProperty('--shake-y', shakeY + 'px');
            this.terminal.classList.remove('shake');
            void this.terminal.offsetWidth;
            this.terminal.classList.add('shake');
        }, params.interval);
    }

    stopRainRumble() {
        if (this.rainRumbleInterval) {
            clearInterval(this.rainRumbleInterval);
            this.rainRumbleInterval = null;
        }
        if (this.terminal) {
            this.terminal.classList.remove('shake');
        }
    }

    createRainDrops() {
        if (!this.rainContainer) return;
        
        // Rain intensity parameters
        const intensityParams = {
            'light': {
                dropCount: 2 + Math.floor(Math.random() * 2), // 2-3 drops
                width: 1,
                height: 6,
                color: 'rgba(150, 200, 255, 0.4)', // Light blue
                fallTime: 2.0
            },
            'normal': {
                dropCount: 3 + Math.floor(Math.random() * 3), // 3-5 drops
                width: 1,
                height: 8,
                color: 'rgba(100, 150, 255, 0.6)', // Medium blue
                fallTime: 1.5
            },
            'heavy': {
                dropCount: 5 + Math.floor(Math.random() * 4), // 5-8 drops
                width: 1.5,
                height: 10,
                color: 'rgba(70, 120, 200, 0.7)', // Darker blue
                fallTime: 1.2
            },
            'storm': {
                dropCount: 8 + Math.floor(Math.random() * 5), // 8-12 drops
                width: 2,
                height: 12,
                color: 'rgba(40, 80, 150, 0.8)', // Very dark blue
                fallTime: 1.0
            }
        };
        
        const params = intensityParams[this.currentRainIntensity] || intensityParams['normal'];
        
        for (let i = 0; i < params.dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.cssText = `
                position: absolute;
                width: ${params.width}px;
                height: ${params.height}px;
                background: linear-gradient(to bottom, ${params.color}, ${params.color.replace('0.8', '0.4').replace('0.7', '0.3').replace('0.6', '0.2').replace('0.4', '0.1')});
                border-radius: ${params.width}px;
                left: ${Math.random() * 100}%;
                top: -${params.height + 2}px;
                animation: rain-fall ${params.fallTime}s linear forwards;
                pointer-events: none;
            `;
            
            this.rainContainer.appendChild(drop);
            
            // Remove drop after animation
            setTimeout(() => {
                if (drop.parentNode) {
                    drop.remove();
                }
            }, params.fallTime * 1000);
        }
    }

    showSleepTransition(durationMs, callback) {
        if (!this.terminal) return;
        
        // Fade out
        this.terminal.style.transition = 'opacity 5s';
        this.terminal.style.opacity = '0';
        
        setTimeout(() => {
            // Fade in
            this.terminal.style.transition = '';
            this.terminal.style.opacity = '1';
            if (callback) callback();
        }, durationMs);
    }

    showClinkFx() {
        if (!this.terminal) return;
        
        let fx = document.createElement('div');
        fx.className = 'clink-fx';
        fx.textContent = '*clink*';
        
        // Randomize direction and rotation
        const angle = Math.random() * 2 * Math.PI;
        const distance = 80 + Math.random() * 80; // 80-160px
        const x = Math.round(Math.cos(angle) * distance);
        const y = Math.round(Math.sin(angle) * distance) - 180; // bias upward
        const rotate = Math.round((Math.random() - 0.5) * 120); // -60deg to +60deg
        
        fx.style.setProperty('--clink-x', `${x}px`);
        fx.style.setProperty('--clink-y', `${y}px`);
        fx.style.setProperty('--clink-rotate', `${rotate}deg`);
        
        // Position relative to terminal
        this.terminal.style.position = 'relative';
        this.terminal.appendChild(fx);
        
        // Triple shake
        const doShake = () => {
            this.terminal.classList.remove('shake');
            this.terminal.style.setProperty('--shake-x', '1px');
            this.terminal.style.setProperty('--shake-y', '1px');
            void this.terminal.offsetWidth;
            this.terminal.classList.add('shake');
            setTimeout(() => this.terminal.classList.remove('shake'), 120);
        };
        
        doShake();
        setTimeout(doShake, 180);
        setTimeout(doShake, 360);
        
        setTimeout(() => {
            fx.remove();
            this.terminal.classList.remove('shake');
        }, 2200);
    }
}

function nudgeTerminal(direction) {
    const terminal = document.getElementById('terminal');
    if (!terminal) return;
    let x = 0, y = 0, amount = 13
    2; // px
    switch (direction) {
        case 'north': y = -amount; break;
        case 'south': y = amount; break;
        case 'east':  x = amount; break;
        case 'west':  x = -amount; break;
        default: break;
    }
    terminal.style.transition = 'transform 0.15s cubic-bezier(.4,2,.6,1)';
    terminal.style.transform = `translate(${x}px, ${y}px)`;
    setTimeout(() => {
        terminal.style.transform = 'translate(0,0)';
        setTimeout(() => {
            terminal.style.transition = '';
        }, 150);
    }, 150);
}

// Export for use in other modules
window.VisualEffects = VisualEffects;
window.nudgeTerminal = nudgeTerminal; 
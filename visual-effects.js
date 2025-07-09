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
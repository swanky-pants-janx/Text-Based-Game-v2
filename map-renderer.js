// Map Renderer - Handles all map drawing and rendering logic
class MapRenderer {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;
        
        // Devtool settings
        this.devtoolEnabled = false;
        this.devtoolShowPlayer = false;
        this.devtoolShowExits = false;
        this.devtoolShowReveal = false;
        this.devtoolShowEnemies = false;
        
        // Viewport settings
        this.viewportCells = 7; // 7x7 grid
        this.halfViewport = Math.floor(this.viewportCells / 2);
    }

    drawMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#111';

        // Dynamically calculate gridSize so the grid fills the canvas
        const gridSizeX = this.canvas.width / this.viewportCells;
        const gridSizeY = this.canvas.height / this.viewportCells;
        const gridSize = Math.min(gridSizeX, gridSizeY);

        // Find world bounds
        const worldCoords = Object.values(world).map(loc => loc.coords);
        const minX = Math.min(...worldCoords.map(c => c.x));
        const maxX = Math.max(...worldCoords.map(c => c.x));
        const minY = Math.min(...worldCoords.map(c => c.y));
        const maxY = Math.max(...worldCoords.map(c => c.y));
        
        // Player position
        const playerPos = world[this.gameState.playerLocation].coords;
        
        // Calculate viewport top-left
        let startX = playerPos.x - this.halfViewport;
        let startY = playerPos.y - this.halfViewport;
        
        // Clamp to world bounds
        if (startX < minX) startX = minX;
        if (startX + this.viewportCells - 1 > maxX) startX = maxX - this.viewportCells + 1;
        if (startY < minY) startY = minY;
        if (startY + this.viewportCells - 1 > maxY) startY = maxY - this.viewportCells + 1;
        
        // Prevent negative overflow
        startX = Math.max(minX, Math.min(startX, maxX - this.viewportCells + 1));
        startY = Math.max(minY, Math.min(startY, maxY - this.viewportCells + 1));

        // Draw grid lines
        for (let gx = 0; gx < this.viewportCells; gx++) {
            for (let gy = 0; gy < this.viewportCells; gy++) {
                const x = gx * gridSize;
                const y = gy * gridSize;
                this.ctx.strokeRect(x, y, gridSize, gridSize);
            }
        }

        // Devtool: reveal all walkable locations in viewport
        if (this.devtoolEnabled && this.devtoolShowReveal) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 102, 255, 0.25)'; // visible blue
            for (const key in world) {
                const pos = world[key].coords;
                if (
                    pos.x >= startX && pos.x < startX + this.viewportCells &&
                    pos.y >= startY && pos.y < startY + this.viewportCells
                ) {
                    this.ctx.fillRect((pos.x - startX) * gridSize, (pos.y - startY) * gridSize, gridSize, gridSize);
                }
            }
            this.ctx.restore();
        }

        // Draw visited locations in viewport
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        this.gameState.visitedLocations.forEach(locationKey => {
            const pos = world[locationKey].coords;
            if (
                pos.x >= startX && pos.x < startX + this.viewportCells &&
                pos.y >= startY && pos.y < startY + this.viewportCells
            ) {
                this.ctx.fillRect((pos.x - startX) * gridSize, (pos.y - startY) * gridSize, gridSize, gridSize);
            }
        });

        // Draw current player location (always visible, centered unless at edge)
        this.ctx.fillStyle = '#111';
        const px = (playerPos.x - startX) * gridSize;
        const py = (playerPos.y - startY) * gridSize;
        this.ctx.fillRect(px, py, gridSize, gridSize);

        // Devtool: highlight player position
        if (this.devtoolEnabled && this.devtoolShowPlayer) {
            this.ctx.save();
            this.ctx.strokeStyle = '#f00';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(px + 2, py + 2, gridSize - 4, gridSize - 4);
            this.ctx.restore();
        }

        // Devtool: show exit arrows (in viewport)
        if (this.devtoolEnabled && this.devtoolShowExits) {
            this.ctx.save();
            this.ctx.strokeStyle = '#e53935'; // visible red
            this.ctx.fillStyle = '#e53935';
            this.ctx.lineWidth = 2;
            const exits = world[this.gameState.playerLocation].exits;
            const centerX = px + gridSize / 2;
            const centerY = py + gridSize / 2;
            
            for (const dir in exits) {
                let dx = 0, dy = 0;
                if (dir === 'north') dy = -1;
                if (dir === 'south') dy = 1;
                if (dir === 'east') dx = 1;
                if (dir === 'west') dx = -1;
                
                if (dx !== 0 || dy !== 0) {
                    const arrowX = centerX + dx * gridSize * 0.4;
                    const arrowY = centerY + dy * gridSize * 0.4;
                    this.ctx.beginPath();
                    this.ctx.moveTo(centerX, centerY);
                    this.ctx.lineTo(arrowX, arrowY);
                    this.ctx.stroke();
                    
                    // Draw arrowhead
                    this.ctx.beginPath();
                    this.ctx.arc(arrowX, arrowY, 4, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
            this.ctx.restore();
        }

        // Devtool: show enemy locations (in viewport)
        if (this.devtoolEnabled && this.devtoolShowEnemies) {
            this.ctx.save();
            this.ctx.fillStyle = '#ff0000'; // bright red
            this.ctx.strokeStyle = '#ffffff'; // white border
            this.ctx.lineWidth = 1;
            
            for (const key in world) {
                const pos = world[key].coords;
                const enemies = world[key].enemies || [];
                
                if (
                    pos.x >= startX && pos.x < startX + this.viewportCells &&
                    pos.y >= startY && pos.y < startY + this.viewportCells &&
                    enemies.length > 0
                ) {
                    const x = (pos.x - startX) * gridSize + gridSize / 2;
                    const y = (pos.y - startY) * gridSize + gridSize / 2;
                    const radius = Math.min(gridSize * 0.15, 8); // proportional to grid size, max 8px
                    
                    // Draw white border
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius + 1, 0, 2 * Math.PI);
                    this.ctx.fill();
                    
                    // Draw red dot
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
            this.ctx.restore();
        }

        // Draw coordinates on top if devtool is enabled
        if (this.devtoolEnabled) {
            this.ctx.fillStyle = '#111';
            this.ctx.font = `${Math.floor(gridSize * 0.3)}px IBM Plex Mono, Roboto Mono, monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            for (let gx = 0; gx < this.viewportCells; gx++) {
                for (let gy = 0; gy < this.viewportCells; gy++) {
                    const worldX = startX + gx;
                    const worldY = startY + gy;
                    const x = gx * gridSize + gridSize / 2;
                    const y = gy * gridSize + gridSize / 2;
                    this.ctx.fillText(`${worldX}:${worldY}`, x, y);
                }
            }
        }
    }

    setDevtoolEnabled(enabled) {
        this.devtoolEnabled = enabled;
    }

    toggleDevtoolExits() {
        this.devtoolShowExits = !this.devtoolShowExits;
        return this.devtoolShowExits;
    }

    toggleDevtoolReveal() {
        this.devtoolShowReveal = !this.devtoolShowReveal;
        return this.devtoolShowReveal;
    }

    toggleDevtoolPlayer() {
        this.devtoolShowPlayer = !this.devtoolShowPlayer;
        return this.devtoolShowPlayer;
    }

    toggleDevtoolEnemies() {
        this.devtoolShowEnemies = !this.devtoolShowEnemies;
        return this.devtoolShowEnemies;
    }
}

// Export for use in other modules
window.MapRenderer = MapRenderer; 
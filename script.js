document.addEventListener('DOMContentLoaded', () => {
    // Text animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => observer.observe(el));

    // Terminal Game Logic
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminal = document.getElementById('terminal');
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');

    let playerLocation = 'start';
    const visitedLocations = ['start'];
    const gridSize = 40;
    let devtoolEnabled = false;
    let gameTime = new Date(0, 0, 0, 8, 0, 0); // Start at 8:00 AM
    let playerState = 'standing';
    let playerFacing = 'north';
    let devtoolShowPlayer = false;
    let devtoolShowExits = false;
    let devtoolShowReveal = false;
    let equippedWeapon = null;
    let playerIsDead = false;

    const playerStats = {
        health: 100,
        maxHealth: 100,
        hunger: 100,
        maxHunger: 100,
        thirst: 100,
        maxThirst: 100,
        bodyParts: {
            'Right Eye': { health: 100, maxHealth: 100 },
            'Left Eye': { health: 100, maxHealth: 100 },
            'Head': { health: 100, maxHealth: 100 },
            'Nose': { health: 100, maxHealth: 100 },
            'Mouth': { health: 100, maxHealth: 100 },
            'Right Arm': { health: 100, maxHealth: 100 },
            'Left Arm': { health: 100, maxHealth: 100 },
            'Torso': { health: 100, maxHealth: 100 },
            'Stomach': { health: 100, maxHealth: 100 },
            'Right Leg': { health: 100, maxHealth: 100 },
            'Left Leg': { health: 100, maxHealth: 100 },
        }
    };

    const directionAliases = {
        'n': 'north', 'north': 'north', 'forward': 'north',
        's': 'south', 'south': 'south', 'back': 'south',
        'e': 'east', 'east': 'east',
        'w': 'west', 'west': 'west',
        'u': 'up', 'up': 'up',
        'd': 'down', 'down': 'down'
    };

    // Inventory and items
    let inventory = {};

    // Load items database
    // Assumes items.js is loaded before script.js
    // const items = ...

    function checkDeath() {
        // If player is already dead, don't show death message again
        if (playerIsDead) {
            return true;
        }
        
        let deathMessage = null;
        
        if (playerStats.hunger <= 0) {
            deathMessage = "You died of hunger.";
        } else if (playerStats.thirst <= 0) {
            deathMessage = "You died of thirst.";
        }
        
        if (deathMessage) {
            // Mark player as dead
            playerIsDead = true;
            
            // Set health to 0
            playerStats.health = 0;
            
            // Change heart emoji to skull
            const healthLabel = document.querySelector('.status-bar label');
            if (healthLabel) {
                healthLabel.textContent = '💀';
            }
            
            // Update health text to show 0/100
            const healthText = document.getElementById('health-text');
            if (healthText) {
                healthText.textContent = '0/100';
            }
            
            // Display death message
            printToTerminal(deathMessage);
            
            return true; // Player is dead
        }
        
        return false; // Player is alive
    }

    function updateStatusBars() {
        const healthBar = document.getElementById('health-bar');
        const hungerBar = document.getElementById('hunger-bar');
        const thirstBar = document.getElementById('thirst-bar');
        const healthText = document.getElementById('health-text');
        const hungerText = document.getElementById('hunger-text');
        const thirstText = document.getElementById('thirst-text');

        healthBar.style.width = `${(playerStats.health / playerStats.maxHealth) * 100}%`;
        hungerBar.style.width = `${(playerStats.hunger / playerStats.maxHunger) * 100}%`;
        thirstBar.style.width = `${(playerStats.thirst / playerStats.maxThirst) * 100}%`;

        healthText.textContent = `${playerStats.health}/${playerStats.maxHealth}`;
        hungerText.textContent = `${playerStats.hunger}/${playerStats.maxHunger}`;
        thirstText.textContent = `${playerStats.thirst}/${playerStats.maxThirst}`;
    }

    function updatePlayerStateDisplay() {
        const stateDisplay = document.getElementById('player-state-display');
        if (stateDisplay) {
            stateDisplay.textContent = `State: ${playerState}`;
        }
    }

    function updateTimeDisplay() {
        const timeDisplay = document.getElementById('time-display');
        const hours = String(gameTime.getHours()).padStart(2, '0');
        const minutes = String(gameTime.getMinutes()).padStart(2, '0');
        timeDisplay.textContent = `Time: ${hours}:${minutes}`;
        updatePlayerStateDisplay();
    }

    function advanceTime(minutes) {
        gameTime.setMinutes(gameTime.getMinutes() + minutes);
        updateTimeDisplay();
    }

    function drawMap() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#111';

        // Viewport settings
        const viewportCells = 7; // 7x7 grid
        const halfViewport = Math.floor(viewportCells / 2);
        // Dynamically calculate gridSize so the grid fills the canvas
        const gridSizeX = canvas.width / viewportCells;
        const gridSizeY = canvas.height / viewportCells;
        const gridSize = Math.min(gridSizeX, gridSizeY);

        // Find world bounds
        const worldCoords = Object.values(world).map(loc => loc.coords);
        const minX = Math.min(...worldCoords.map(c => c.x));
        const maxX = Math.max(...worldCoords.map(c => c.x));
        const minY = Math.min(...worldCoords.map(c => c.y));
        const maxY = Math.max(...worldCoords.map(c => c.y));
        // Player position
        const playerPos = world[playerLocation].coords;
        // Calculate viewport top-left
        let startX = playerPos.x - halfViewport;
        let startY = playerPos.y - halfViewport;
        // Clamp to world bounds
        if (startX < minX) startX = minX;
        if (startX + viewportCells - 1 > maxX) startX = maxX - viewportCells + 1;
        if (startY < minY) startY = minY;
        if (startY + viewportCells - 1 > maxY) startY = maxY - viewportCells + 1;
        // Prevent negative overflow
        startX = Math.max(minX, Math.min(startX, maxX - viewportCells + 1));
        startY = Math.max(minY, Math.min(startY, maxY - viewportCells + 1));

        // Draw grid lines
        for (let gx = 0; gx < viewportCells; gx++) {
            for (let gy = 0; gy < viewportCells; gy++) {
                const x = gx * gridSize;
                const y = gy * gridSize;
                ctx.strokeRect(x, y, gridSize, gridSize);
            }
        }

        // Devtool: reveal all walkable locations in viewport
        if (devtoolEnabled && devtoolShowReveal) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 102, 255, 0.25)'; // visible blue
            for (const key in world) {
                const pos = world[key].coords;
                if (
                    pos.x >= startX && pos.x < startX + viewportCells &&
                    pos.y >= startY && pos.y < startY + viewportCells
                ) {
                    ctx.fillRect((pos.x - startX) * gridSize, (pos.y - startY) * gridSize, gridSize, gridSize);
                }
            }
            ctx.restore();
        }

        // Draw visited locations in viewport
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        visitedLocations.forEach(locationKey => {
            const pos = world[locationKey].coords;
            if (
                pos.x >= startX && pos.x < startX + viewportCells &&
                pos.y >= startY && pos.y < startY + viewportCells
            ) {
                ctx.fillRect((pos.x - startX) * gridSize, (pos.y - startY) * gridSize, gridSize, gridSize);
            }
        });

        // Draw current player location (always visible, centered unless at edge)
        ctx.fillStyle = '#111';
        const px = (playerPos.x - startX) * gridSize;
        const py = (playerPos.y - startY) * gridSize;
        ctx.fillRect(px, py, gridSize, gridSize);

        // Devtool: highlight player position
        if (devtoolEnabled && devtoolShowPlayer) {
            ctx.save();
            ctx.strokeStyle = '#f00';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 2, py + 2, gridSize - 4, gridSize - 4);
            ctx.restore();
        }

        // Devtool: show exit arrows (in viewport)
        if (devtoolEnabled && devtoolShowExits) {
            ctx.save();
            ctx.strokeStyle = '#e53935'; // visible red
            ctx.fillStyle = '#e53935';
            ctx.lineWidth = 2;
            const exits = world[playerLocation].exits;
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
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(arrowX, arrowY);
                    ctx.stroke();
                    // Draw arrowhead
                    ctx.beginPath();
                    ctx.arc(arrowX, arrowY, 4, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // Draw coordinates on top if devtool is enabled
        if (devtoolEnabled) {
            ctx.fillStyle = '#111';
            ctx.font = `${Math.floor(gridSize * 0.3)}px IBM Plex Mono, Roboto Mono, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let gx = 0; gx < viewportCells; gx++) {
                for (let gy = 0; gy < viewportCells; gy++) {
                    const worldX = startX + gx;
                    const worldY = startY + gy;
                    const x = gx * gridSize + gridSize / 2;
                    const y = gy * gridSize + gridSize / 2;
                    ctx.fillText(`${worldX}:${worldY}`, x, y);
                }
            }
        }
    }

    function printToTerminal(text, isCommand = false) {
        const line = document.createElement('div');
        if (isCommand) {
            line.innerHTML = `<span class="prompt">></span> ${text}`;
        } else {
            line.textContent = text;
        }
        terminalOutput.appendChild(line);
        
        // Keep only the last 10 entries to prevent terminal from getting too long
        const maxEntries = 10;
        const lines = terminalOutput.getElementsByTagName('div');
        while (lines.length > maxEntries) {
            terminalOutput.removeChild(lines[0]); // Remove the oldest line
        }
        
        if (terminal) {
            terminal.scrollTop = terminal.scrollHeight;
        }
    }

    function sleep(durationMs, callback) {
        const terminalInput = document.getElementById('terminal-input');
        terminalInput.disabled = true;
        let dots = '';
        const loadingAnimation = setInterval(() => {
            dots += '.';
            if (dots.length > 3) dots = '.';
            // To show the animation, we need to find the last line and update it.
            const outputLines = terminalOutput.getElementsByTagName('div');
            const lastLine = outputLines[outputLines.length - 1];
            lastLine.textContent = `Sleeping ${dots}`;
        }, 500);

        printToTerminal('Sleeping .'); // Initial message

        setTimeout(() => {
            clearInterval(loadingAnimation);
            terminalInput.disabled = false;
            callback();
            terminalInput.focus();
        }, durationMs);
    }

    function updateCompassDisplay() {
        const compassDisplay = document.getElementById('compass-display');
        if (compassDisplay) {
            compassDisplay.textContent = `Facing: ${playerFacing.charAt(0).toUpperCase() + playerFacing.slice(1)}`;
        }
    }

    function recalculatePlayerHealth() {
        // Sum all body part healths and maxHealths
        const total = Object.values(playerStats.bodyParts).reduce((sum, part) => sum + part.health, 0);
        const totalMax = Object.values(playerStats.bodyParts).reduce((sum, part) => sum + part.maxHealth, 0);
        playerStats.health = Math.round((total / totalMax) * 100);
        playerStats.maxHealth = 100;
        updateStatusBars();
    }

    function printRoomDescriptionWithExits() {
        const room = world[playerLocation];
        console.log("DEBUG EXITS", playerLocation, room.exits); // DEBUG
        let desc = room.description;
        // Show items
        const itemsHere = room.items || [];
        if (itemsHere.length > 0) {
            const itemNames = itemsHere.map(key => items[key]?.name || key).join(', ');
            desc += `\nYou see: ${itemNames}`;
        }
        // Show enemies
        const enemiesHere = room.enemies || [];
        if (enemiesHere.length > 0) {
            const enemyNames = enemiesHere.map((enemy, i) => `${enemy.name} (${i + 1})`);
            desc += `\nEnemies in room: ${enemyNames.join(', ')}`;
        }
        // Show exits
        const exits = Object.keys(room.exits || {});
        if (exits.length > 0) {
            desc += `\nExits: ${exits.join(', ')}`;
        } else {
            desc += `\nThere are no visible exits.`;
        }
        printToTerminal(desc);
    }

    function processCommand(commandText) {
        printToTerminal(commandText, true);
        const input = commandText.toLowerCase().trim().split(' ');
        const command = input[0];
        const argument = input.slice(1).join(' ');

        let response = '';

        switch (command) {
            case 'help':
                response = 'Available commands: help, clear, look, move/walk/go [direction], sleep [hh:mm], devtool [enabled|disabled|exits|reveal|damage], sit, stand, lay, eat [item], drink [item], take [item/all/x and x and x], drop [item/all/x and x and x], attack [target], equip [weapon], unequip';
                break;
            case 'sleep':
                if (playerState !== 'laying') {
                    response = "You need to lie down before you can sleep.";
                    break;
                }
                const timeParts = argument.split(':');
                if (timeParts.length === 2) {
                    const hours = parseInt(timeParts[0], 10);
                    const minutes = parseInt(timeParts[1], 10);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        const totalMinutes = (hours * 60) + minutes;
                        const terminalDiv = document.getElementById('terminal');
                        if (terminalDiv) {
                            terminalDiv.style.transition = 'opacity 5s';
                            terminalDiv.style.opacity = '0';
                        }
                        sleep(5000, () => {
                            if (terminalDiv) {
                                terminalDiv.style.transition = '';
                                terminalDiv.style.opacity = '1';
                            }
                            advanceTime(totalMinutes);
                            // Sleeping makes you hungry and thirsty, but might restore a little health
                            playerStats.hunger = Math.max(0, playerStats.hunger - (hours * 5));
                            playerStats.thirst = Math.max(0, playerStats.thirst - (hours * 8));
                            // Heal all body parts a little
                            Object.values(playerStats.bodyParts).forEach(part => {
                                part.health = Math.min(part.maxHealth, part.health + (hours * 2));
                            });
                            recalculatePlayerHealth();
                            
                            // Check for death before updating status bars
                            if (checkDeath()) {
                                // Player died during sleep, don't show "You wake up"
                                return;
                            }
                            
                            updateStatusBars();
                            printToTerminal("You wake up.");
                        });
                        return; // Return early to handle async sleep
                    }
                }
                response = "Invalid time format. Use 'sleep hh:mm'.";
                break;
            case 'devtool':
                if (argument === 'enabled') {
                    devtoolEnabled = true;
                    response = 'Devtool enabled. Coordinates are now visible.';
                } else if (argument === 'disabled') {
                    devtoolEnabled = false;
                    response = 'Devtool disabled. Coordinates are now hidden.';
                } else if (argument === 'exits') {
                    devtoolShowExits = !devtoolShowExits;
                    response = `Devtool: Exit arrows ${devtoolShowExits ? 'enabled' : 'disabled'}.`;
                } else if (argument === 'reveal') {
                    devtoolShowReveal = !devtoolShowReveal;
                    response = `Devtool: Map reveal ${devtoolShowReveal ? 'enabled' : 'disabled'}.`;
                } else if (argument === 'damage') {
                    // Damage a random body part for a random amount (10-40)
                    const parts = Object.keys(playerStats.bodyParts);
                    const part = parts[Math.floor(Math.random() * parts.length)];
                    const amount = Math.floor(Math.random() * 31) + 10; // 10-40
                    playerStats.bodyParts[part].health = Math.max(0, playerStats.bodyParts[part].health - amount);
                    recalculatePlayerHealth();
                    response = `Devtool: ${part} damaged for ${amount} points.`;
                    updateBodyPartsMenu && updateBodyPartsMenu();
                } else {
                    response = 'Usage: devtool [enabled|disabled|exits|reveal|damage]';
                }
                drawMap(); // Redraw map immediately
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                return;
            case 'look': {
                printRoomDescriptionWithExits();
                return;
            }
            case 'move':
            case 'walk':
            case 'go': {
                if (playerState === 'sitting') {
                    response = "You need to stand up before you can move.";
                    break;
                } else if (playerState === 'laying') {
                    response = "You need to stand up before you can move.";
                    break;
                }
                const direction = directionAliases[argument];
                if (!direction) {
                    response = `I don't understand where you want to go. Try north, south, east, or west.`;
                } else if (world[playerLocation].exits[direction]) {
                    playerLocation = world[playerLocation].exits[direction];
                    playerFacing = direction;
                    if (!visitedLocations.includes(playerLocation)) {
                        visitedLocations.push(playerLocation);
                    }
                    printRoomDescriptionWithExits();
                    updateCompassDisplay();
                    return;
                } else {
                    response = `You can't go that way.`;
                }
                updateCompassDisplay();
                break;
            }
            case 'sit':
                if (playerState === 'sitting') {
                    response = "You are already sitting.";
                } else {
                    playerState = 'sitting';
                    updatePlayerStateDisplay();
                    response = "You sit down.";
                }
                break;
            case 'stand':
                if (playerState === 'standing') {
                    response = "You are already standing.";
                } else {
                    playerState = 'standing';
                    updatePlayerStateDisplay();
                    response = "You stand up.";
                }
                break;
            case 'lay':
            case 'lie':
                if (playerState === 'laying') {
                    response = "You are already laying down.";
                } else {
                    playerState = 'laying';
                    updatePlayerStateDisplay();
                    response = "You lay down.";
                }
                break;
            case 'eat': {
                const itemKey = Object.keys(items).find(key => items[key].name.toLowerCase() === argument || key === argument.replace(/ /g, '_'));
                if (!itemKey || !items[itemKey] || items[itemKey].type !== 'food') {
                    response = `You can't eat that.`;
                    break;
                }
                if (!inventory[itemKey] || inventory[itemKey] <= 0) {
                    response = `You don't have any ${items[itemKey].name}.`;
                    break;
                }
                // --- Crunch FX ---
                setTimeout(() => showCrunchFx(), 0);
                setTimeout(() => showCrunchFx(), 700);
                setTimeout(() => showCrunchFx(), 1400);
                // --- End Crunch FX ---
                playerStats.hunger = Math.min(playerStats.maxHunger, playerStats.hunger + (items[itemKey].effect.hunger || 0));
                inventory[itemKey]--;
                response = `You eat the ${items[itemKey].name}. (+${items[itemKey].effect.hunger} hunger)`;
                updateStatusBars();
                updateInventoryMenu && updateInventoryMenu();
                break;
            }
            case 'drink': {
                // Try to match by key or by name (case-insensitive, ignore spaces and underscores)
                const normalizedArg = argument.replace(/\s|_/g, '').toLowerCase();
                const itemKey = Object.keys(items).find(key => {
                    const item = items[key];
                    return (
                        key.replace(/\s|_/g, '').toLowerCase() === normalizedArg ||
                        item.name.replace(/\s|_/g, '').toLowerCase() === normalizedArg
                    );
                });
                if (!itemKey || !items[itemKey] || (items[itemKey].type !== 'drink' && items[itemKey].type !== 'potion')) {
                    response = `You can't drink that.`;
                    break;
                }
                if (!inventory[itemKey] || inventory[itemKey] <= 0) {
                    response = `You don't have any ${items[itemKey].name}.`;
                    break;
                }
                // --- Glug FX ---
                setTimeout(() => showGlugFx(), 0);
                setTimeout(() => showGlugFx(), 1000);
                setTimeout(() => showGlugFx(), 2000);
                // --- End Glug FX ---
                if (items[itemKey].type === 'drink') {
                    playerStats.thirst = Math.min(playerStats.maxThirst, playerStats.thirst + (items[itemKey].effect.thirst || 0));
                    response = `You drink the ${items[itemKey].name}. (+${items[itemKey].effect.thirst} thirst)`;
                } else if (items[itemKey].type === 'potion') {
                    if (items[itemKey].effect.health) {
                        // Distribute healing only among damaged body parts
                        let healAmount = items[itemKey].effect.health;
                        let damagedParts = Object.values(playerStats.bodyParts).filter(part => part.health < part.maxHealth);
                        if (damagedParts.length > 0) {
                            let perPart = Math.floor(healAmount / damagedParts.length);
                            let remainder = healAmount % damagedParts.length;
                            damagedParts.forEach((part, idx) => {
                                let heal = perPart + (idx < remainder ? 1 : 0);
                                let missing = part.maxHealth - part.health;
                                let actualHeal = Math.min(heal, missing);
                                part.health += actualHeal;
                                healAmount -= actualHeal;
                            });
                        }
                        recalculatePlayerHealth();
                        updateBodyPartsMenu && updateBodyPartsMenu();
                        response = `You drink the ${items[itemKey].name}. (Healed damaged body parts)`;
                    } else if (items[itemKey].effect.mana) {
                        response = `You drink the ${items[itemKey].name}. (+${items[itemKey].effect.mana} mana)`;
                    } else {
                        response = `You drink the ${items[itemKey].name}.`;
                    }
                }
                inventory[itemKey]--;
                updateStatusBars();
                updateInventoryMenu && updateInventoryMenu();
                break;
            }
            case 'take':
            case 'pickup':
            case 'pick': {
                const itemsHere = world[playerLocation].items || [];
                if (!argument) {
                    response = 'Take what?';
                    break;
                }
                
                // Handle "take all"
                if (argument.toLowerCase() === 'all') {
                    if (itemsHere.length === 0) {
                        response = "There's nothing here to take.";
                        break;
                    }
                    const takenItems = [];
                    itemsHere.forEach(itemKey => {
                        inventory[itemKey] = (inventory[itemKey] || 0) + 1;
                        takenItems.push(items[itemKey]?.name || itemKey);
                    });
                    world[playerLocation].items = [];
                    response = `You pick up: ${takenItems.join(', ')}.`;
                    updateInventoryMenu && updateInventoryMenu();
                    break;
                }
                
                // Handle "take x and x and x" format
                if (argument.includes(' and ')) {
                    const itemNames = argument.split(' and ').map(name => name.trim());
                    const takenItems = [];
                    const failedItems = [];
                    
                    itemNames.forEach(itemName => {
                        const normalizedArg = itemName.replace(/\s|_/g, '').toLowerCase();
                        const itemKey = itemsHere.find(key => {
                            const item = items[key];
                            return (
                                key.replace(/\s|_/g, '').toLowerCase() === normalizedArg ||
                                item?.name.replace(/\s|_/g, '').toLowerCase() === normalizedArg
                            );
                        });
                        
                        if (itemKey) {
                            inventory[itemKey] = (inventory[itemKey] || 0) + 1;
                            takenItems.push(items[itemKey]?.name || itemKey);
                            // Remove from room (we'll clean up duplicates later)
                            const index = world[playerLocation].items.indexOf(itemKey);
                            if (index > -1) {
                                world[playerLocation].items.splice(index, 1);
                            }
                        } else {
                            failedItems.push(itemName);
                        }
                    });
                    
                    // Clean up the room items array
                    world[playerLocation].items = world[playerLocation].items.filter(key => 
                        !takenItems.includes(items[key]?.name || key)
                    );
                    
                    if (takenItems.length > 0) {
                        response = `You pick up: ${takenItems.join(', ')}.`;
                        if (failedItems.length > 0) {
                            response += `\nCouldn't find: ${failedItems.join(', ')}.`;
                        }
                    } else {
                        response = `Couldn't find any of the requested items.`;
                    }
                    updateInventoryMenu && updateInventoryMenu();
                    break;
                }
                
                // Handle single item (original logic)
                const normalizedArg = argument.replace(/\s|_/g, '').toLowerCase();
                const itemKey = itemsHere.find(key => {
                    const item = items[key];
                    return (
                        key.replace(/\s|_/g, '').toLowerCase() === normalizedArg ||
                        item?.name.replace(/\s|_/g, '').toLowerCase() === normalizedArg
                    );
                });
                if (!itemKey) {
                    response = "That item isn't here.";
                    break;
                }
                // Add to inventory
                inventory[itemKey] = (inventory[itemKey] || 0) + 1;
                // Remove from room
                world[playerLocation].items = itemsHere.filter(key => key !== itemKey);
                response = `You pick up the ${items[itemKey]?.name || itemKey}.`;
                updateInventoryMenu && updateInventoryMenu();
                break;
            }
            case 'attack': {
                console.log('Attack command triggered with argument:', argument);
                if (!argument) {
                    response = 'Attack what?';
                    break;
                }
                // Support 'attack slime 2'
                const enemiesHere = (world[playerLocation].enemies || []);
                console.log('Enemies in room:', enemiesHere);
                const match = argument.match(/^([a-zA-Z_ ]+?)(?:\s*(\d+))?$/);
                let targetType = match ? match[1].trim().toLowerCase() : argument.toLowerCase();
                let targetIndex = match && match[2] ? parseInt(match[2], 10) - 1 : 0;
                console.log('Looking for target type:', targetType, 'index:', targetIndex);
                const candidates = enemiesHere
                    .map((enemy, i) => ({ enemy, i }))
                    .filter(({ enemy }) => {
                        const matches = enemy.name.toLowerCase() === targetType || enemy.type === targetType;
                        console.log(`Enemy ${enemy.name} (${enemy.type}) matches ${targetType}:`, matches);
                        return matches;
                    });
                if (candidates.length === 0) {
                    response = `There is no '${argument}' here to attack.`;
                    break;
                }
                const { enemy, i } = candidates[targetIndex] || candidates[0];
                // Player attacks enemy
                let playerDamage;
                if (equippedWeapon && items[equippedWeapon] && items[equippedWeapon].type === 'weapon') {
                    const weaponAttack = items[equippedWeapon].effect?.attack || 1;
                    
                    // Handle weapon damage ranges
                    if (weaponAttack && typeof weaponAttack === 'object' && weaponAttack.min !== undefined && weaponAttack.max !== undefined) {
                        // New format: attack range
                        playerDamage = Math.floor(Math.random() * (weaponAttack.max - weaponAttack.min + 1)) + weaponAttack.min;
                    } else if (typeof weaponAttack === 'number') {
                        // Old format: single attack value
                        playerDamage = weaponAttack;
                    } else {
                        // Fallback
                        playerDamage = 1;
                    }
                } else {
                    playerDamage = Math.floor(Math.random() * 2) + 1; // 1-2 for unarmed
                }
                enemy.health -= playerDamage;
                response = `You attack the ${enemy.name} (${targetIndex + 1}) for ${playerDamage} damage.`;
                // --- Terminal shake effect (restored) ---
                if (terminal) {
                    const intensity = Math.min(1 + playerDamage * 0.7, 6); // px, less intense
                    terminal.style.setProperty('--shake-x', intensity + 'px');
                    terminal.style.setProperty('--shake-y', intensity + 'px');
                    terminal.classList.remove('shake'); // restart if needed
                    void terminal.offsetWidth;
                    terminal.classList.add('shake');
                    setTimeout(() => terminal.classList.remove('shake'), 400);
                }
                // --- End shake effect ---
                showDamageFx(playerDamage);
                if (enemy.health <= 0) {
                    response += `\nYou have defeated the ${enemy.name} (${targetIndex + 1})!`;
                    // Remove enemy from room
                    world[playerLocation].enemies.splice(i, 1);
                    // Optionally: handle drops, onDefeat, etc.
                    break;
                }
                // Enemy attacks player
                const parts = Object.keys(playerStats.bodyParts);
                const part = parts[Math.floor(Math.random() * parts.length)];
                let amount = 1;
                
                // Handle damage ranges for enemies
                if (enemy.attack && typeof enemy.attack === 'object' && enemy.attack.min !== undefined && enemy.attack.max !== undefined) {
                    // New format: attack range
                    amount = Math.floor(Math.random() * (enemy.attack.max - enemy.attack.min + 1)) + enemy.attack.min;
                } else if (typeof enemy.attack === 'number') {
                    // Old format: single attack value
                    amount = enemy.attack;
                } else {
                    // Fallback
                    amount = 1;
                }
                playerStats.bodyParts[part].health = Math.max(0, playerStats.bodyParts[part].health - amount);
                recalculatePlayerHealth();
                response += `\nThe ${enemy.name} attacks your ${part} for ${amount} damage!`;
                updateBodyPartsMenu && updateBodyPartsMenu();
                if (playerStats.health <= 0) {
                    response += `\nYou have been defeated!`;
                }
                updateStatusBars();
                break;
            }
            case 'equip': {
                if (!argument) {
                    response = 'Equip what?';
                    break;
                }
                const itemKey = Object.keys(items).find(key => {
                    const item = items[key];
                    return (
                        key.replace(/\s|_/g, '').toLowerCase() === argument.replace(/\s|_/g, '').toLowerCase() ||
                        item.name.replace(/\s|_/g, '').toLowerCase() === argument.replace(/\s|_/g, '').toLowerCase()
                    );
                });
                if (!itemKey || !items[itemKey] || items[itemKey].type !== 'weapon') {
                    response = `You can't equip that.`;
                    break;
                }
                if (!inventory[itemKey] || inventory[itemKey] <= 0) {
                    response = `You don't have any ${items[itemKey].name}.`;
                    break;
                }
                
                // Check if weapon is already equipped
                if (equippedWeapon === itemKey) {
                    response = `${items[itemKey].name} is already equipped.`;
                    break;
                }
                
                equippedWeapon = itemKey;
                response = `You equip the ${items[itemKey].name}.`;
                
                // Update inventory menu to show equipped status
                updateInventoryMenu();
                break;
            }
            case 'unequip': {
                if (!equippedWeapon) {
                    response = "You don't have anything equipped.";
                    break;
                }
                const weaponName = items[equippedWeapon].name;
                equippedWeapon = null;
                response = `You unequip the ${weaponName}.`;
                
                // Update inventory menu to remove equipped status
                updateInventoryMenu();
                break;
            }
            case 'drop': {
                if (!argument) {
                    response = 'Drop what?';
                    break;
                }
                
                // Handle "drop all"
                if (argument.toLowerCase() === 'all') {
                    const inventoryKeys = Object.keys(inventory).filter(key => inventory[key] > 0);
                    if (inventoryKeys.length === 0) {
                        response = "You don't have anything to drop.";
                        break;
                    }
                    const droppedItems = [];
                    inventoryKeys.forEach(itemKey => {
                        // If dropping equipped weapon, unequip it first
                        if (equippedWeapon === itemKey) {
                            equippedWeapon = null;
                        }
                        
                        // Add to room items
                        if (!world[playerLocation].items) {
                            world[playerLocation].items = [];
                        }
                        world[playerLocation].items.push(itemKey);
                        
                        droppedItems.push(items[itemKey]?.name || itemKey);
                        delete inventory[itemKey];
                    });
                    response = `You drop: ${droppedItems.join(', ')}.`;
                    updateInventoryMenu();
                    break;
                }
                
                // Handle "drop x and x and x" format
                if (argument.includes(' and ')) {
                    const itemNames = argument.split(' and ').map(name => name.trim());
                    const droppedItems = [];
                    const failedItems = [];
                    
                    itemNames.forEach(itemName => {
                        const normalizedArg = itemName.replace(/\s|_/g, '').toLowerCase();
                        const itemKey = Object.keys(items).find(key => {
                            const item = items[key];
                            return (
                                key.replace(/\s|_/g, '').toLowerCase() === normalizedArg ||
                                item.name.replace(/\s|_/g, '').toLowerCase() === normalizedArg
                            );
                        });
                        
                        if (itemKey && inventory[itemKey] && inventory[itemKey] > 0) {
                            // If dropping equipped weapon, unequip it first
                            if (equippedWeapon === itemKey) {
                                equippedWeapon = null;
                            }
                            
                            // Remove from inventory
                            inventory[itemKey]--;
                            if (inventory[itemKey] <= 0) {
                                delete inventory[itemKey];
                            }
                            
                            // Add to room items
                            if (!world[playerLocation].items) {
                                world[playerLocation].items = [];
                            }
                            world[playerLocation].items.push(itemKey);
                            
                            droppedItems.push(items[itemKey]?.name || itemKey);
                        } else {
                            failedItems.push(itemName);
                        }
                    });
                    
                    if (droppedItems.length > 0) {
                        response = `You drop: ${droppedItems.join(', ')}.`;
                        if (failedItems.length > 0) {
                            response += `\nCouldn't drop: ${failedItems.join(', ')}.`;
                        }
                    } else {
                        response = `Couldn't drop any of the requested items.`;
                    }
                    updateInventoryMenu();
                    break;
                }
                
                // Handle single item (original logic)
                const itemKey = Object.keys(items).find(key => {
                    const item = items[key];
                    return (
                        key.replace(/\s|_/g, '').toLowerCase() === argument.replace(/\s|_/g, '').toLowerCase() ||
                        item.name.replace(/\s|_/g, '').toLowerCase() === argument.replace(/\s|_/g, '').toLowerCase()
                    );
                });
                if (!itemKey || !items[itemKey]) {
                    response = `You don't have any ${argument}.`;
                    break;
                }
                if (!inventory[itemKey] || inventory[itemKey] <= 0) {
                    response = `You don't have any ${items[itemKey].name}.`;
                    break;
                }
                
                // If dropping equipped weapon, unequip it first
                if (equippedWeapon === itemKey) {
                    equippedWeapon = null;
                }
                
                // Remove from inventory
                inventory[itemKey]--;
                if (inventory[itemKey] <= 0) {
                    delete inventory[itemKey];
                }
                
                // Add to room items
                if (!world[playerLocation].items) {
                    world[playerLocation].items = [];
                }
                world[playerLocation].items.push(itemKey);
                
                response = `You drop the ${items[itemKey].name}.`;
                
                // Update inventory menu
                updateInventoryMenu();
                break;
            }
            default:
                response = `Command not found: ${commandText}`;
        }
        
        if (response) printToTerminal(response);
    }

    function updateBodyPartsMenu() {
        const bodyPartsList = document.getElementById('body-parts-list');
        bodyPartsList.innerHTML = '';
        for (const part in playerStats.bodyParts) {
            const li = document.createElement('li');
            const partData = playerStats.bodyParts[part];
            li.innerHTML = `<span>${part}</span><span>${partData.health}/${partData.maxHealth}</span>`;
            bodyPartsList.appendChild(li);
        }
    }

    function createEnemyInstance(type, index = 1) {
        // Check if enemies object exists and has the type
        if (typeof enemies === 'undefined' || !enemies[type]) {
            // Fallback enemy data if enemies.js isn't loaded
            return {
                id: `${type}-${index}`,
                type: type,
                name: type.charAt(0).toUpperCase() + type.slice(1),
                health: 20,
                maxHealth: 20,
                attack: 3,
                defense: 0,
                drops: [],
                onDefeat: null
            };
        }
        
        const base = enemies[type];
        return {
            id: `${type}-${index}`,
            type,
            name: base.name,
            health: base.health,
            maxHealth: base.maxHealth,
            attack: base.attack,
            defense: base.defense,
            drops: base.drops,
            onDefeat: base.onDefeat
        };
    }

    function showGlugFx() {
        const terminal = document.getElementById('terminal');
        if (!terminal) return;
        let fx = document.createElement('div');
        fx.className = 'glug-fx';
        fx.textContent = '*glug*';
        // Randomize direction and rotation (same as crunch)
        const angle = Math.random() * 2 * Math.PI;
        const distance = 80 + Math.random() * 80; // 80-160px
        const x = Math.round(Math.cos(angle) * distance);
        const y = Math.round(Math.sin(angle) * distance) - 180; // bias upward
        const rotate = Math.round((Math.random() - 0.5) * 120); // -60deg to +60deg
        fx.style.setProperty('--glug-x', `${x}px`);
        fx.style.setProperty('--glug-y', `${y}px`);
        fx.style.setProperty('--glug-rotate', `${rotate}deg`);
        // Position relative to terminal
        terminal.style.position = 'relative';
        terminal.appendChild(fx);
        // Triple shake
        function doShake() {
            terminal.classList.remove('shake');
            terminal.style.setProperty('--shake-x', '1px');
            terminal.style.setProperty('--shake-y', '1px');
            void terminal.offsetWidth;
            terminal.classList.add('shake');
            setTimeout(() => terminal.classList.remove('shake'), 120);
        }
        doShake();
        setTimeout(doShake, 180);
        setTimeout(doShake, 360);
        setTimeout(() => {
            fx.remove();
            terminal.classList.remove('shake');
        }, 2200);
    }

    function showCrunchFx() {
        const terminal = document.getElementById('terminal');
        if (!terminal) return;
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
        terminal.style.position = 'relative';
        terminal.appendChild(fx);
        // Triple shake
        function doShake() {
            terminal.classList.remove('shake');
            terminal.style.setProperty('--shake-x', '1px');
            terminal.style.setProperty('--shake-y', '1px');
            void terminal.offsetWidth;
            terminal.classList.add('shake');
            setTimeout(() => terminal.classList.remove('shake'), 120);
        }
        doShake();
        setTimeout(doShake, 180);
        setTimeout(doShake, 360);
        setTimeout(() => {
            fx.remove();
            terminal.classList.remove('shake');
        }, 2200);
    }

    function showDamageFx(amount) {
        const terminal = document.getElementById('terminal');
        if (!terminal) return;
        let fx = document.createElement('div');
        fx.className = 'damage-fx';
        fx.textContent = `${amount}`;
        // Randomize slight horizontal offset
        const x = Math.round((Math.random() - 0.5) * 60); // -30 to +30px
        const y = -120 + Math.round(Math.random() * 40); // -120 to -80px
        fx.style.setProperty('--damage-x', `${x}px`);
        fx.style.setProperty('--damage-y', `${y}px`);
        terminal.style.position = 'relative';
        terminal.appendChild(fx);
        setTimeout(() => fx.remove(), 1300);
    }

    function showZRainFx() {
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

    // Add menu toggle logic for stats button
    const bodyPartsBtn = document.getElementById('body-parts-btn');
    const inventoryBtn = document.getElementById('inventory-btn');
    const statsBtn = document.getElementById('stats-btn');
    const bodyPartsMenu = document.getElementById('body-parts-menu');
    const inventoryMenu = document.getElementById('inventory-menu');
    const statsMenu = document.getElementById('stats-menu');

    function hideAllMenus() {
        bodyPartsMenu.classList.add('hidden-menu');
        inventoryMenu.classList.add('hidden-menu');
        statsMenu.classList.add('hidden-menu');
    }

    if (bodyPartsBtn && bodyPartsMenu) {
        bodyPartsBtn.addEventListener('click', () => {
            const isOpen = !bodyPartsMenu.classList.contains('hidden-menu');
            hideAllMenus();
            if (isOpen) bodyPartsMenu.classList.remove('hidden-menu');
        });
    }
    if (inventoryBtn && inventoryMenu) {
        inventoryBtn.addEventListener('click', () => {
            const isOpen = !inventoryMenu.classList.contains('hidden-menu');
            hideAllMenus();
            if (isOpen) inventoryMenu.classList.remove('hidden-menu');
        });
    }
    if (statsBtn && statsMenu) {
        statsBtn.addEventListener('click', () => {
            const isOpen = !statsMenu.classList.contains('hidden-menu');
            hideAllMenus();
            if (isOpen) statsMenu.classList.remove('hidden-menu');
        });
    }

    if (terminalInput) {
        const bodyPartsList = document.getElementById('body-parts-list');
        const inventoryList = document.getElementById('inventory-list');

        function updateInventoryMenu() {
            inventoryList.innerHTML = '';
            const keys = Object.keys(inventory).filter(key => inventory[key] > 0);
            if (keys.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'Your inventory is empty.';
                inventoryList.appendChild(li);
            } else {
                // Categorize items
                const categories = {};
                keys.forEach(key => {
                    const type = items[key]?.type || 'other';
                    if (!categories[type]) categories[type] = [];
                    categories[type].push(key);
                });
                // Define display order and names
                const typeOrder = [
                    { type: 'food', label: 'Food' },
                    { type: 'drink', label: 'Drinks' },
                    { type: 'potion', label: 'Potions' },
                    { type: 'weapon', label: 'Weapons' },
                    { type: 'other', label: 'Other' }
                ];
                typeOrder.forEach(({ type, label }) => {
                    if (categories[type] && categories[type].length > 0) {
                        const header = document.createElement('li');
                        header.textContent = label;
                        header.style.fontWeight = 'bold';
                        header.style.marginTop = '0.5em';
                        inventoryList.appendChild(header);
                        categories[type].forEach(key => {
                            const li = document.createElement('li');
                            let text = `${items[key]?.name || key} (${inventory[key]})`;
                            if (type === 'weapon' && typeof equippedWeapon === 'string' && equippedWeapon === key) {
                                text += ' (equipped)';
                            }
                            li.textContent = text;
                            inventoryList.appendChild(li);
                        });
                    }
                });
            }
        }

        printToTerminal("Welcome to the Adventure Game! Type 'help' for commands.");
        printRoomDescriptionWithExits();
        drawMap();
        updateStatusBars();
        updateTimeDisplay();
        updatePlayerStateDisplay();
        updateCompassDisplay();

        terminalInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && terminalInput.value) {
                const command = terminalInput.value.toLowerCase().trim().split(' ')[0];
                processCommand(terminalInput.value);

                if (command !== 'sleep') {
                    advanceTime(5);
                    // Decrease stats over time
                    playerStats.hunger = Math.max(0, playerStats.hunger - 1);
                    playerStats.thirst = Math.max(0, playerStats.thirst - 2);
                }
                updateStatusBars();
                
                // Check for death after updating stats
                if (checkDeath()) {
                    // If player is dead, disable input
                    terminalInput.disabled = true;
                    terminalInput.placeholder = "You are dead. Refresh to restart.";
                } else {
                    drawMap();
                    terminalInput.value = '';
                    terminalInput.focus();
                }
            }
        });
    }

    // After world and enemies are loaded
    for (const roomKey in world) {
        const room = world[roomKey];
        if (Array.isArray(room.enemies)) {
            room.enemies = room.enemies.map((type, idx) => {
                const enemyType = typeof type === 'string' ? type : type.type;
                const enemy = createEnemyInstance(enemyType, idx + 1);
                console.log(`Created enemy in ${roomKey}:`, enemy);
                return enemy;
            }).filter(enemy => enemy !== null); // Remove any null enemies
        }
    }
});

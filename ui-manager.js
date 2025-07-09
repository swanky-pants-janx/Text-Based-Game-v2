// UI Manager - Handles all UI updates and display logic
class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.terminalOutput = document.getElementById('terminal-output');
        this.terminal = document.getElementById('terminal');
        this.terminalInput = document.getElementById('terminal-input');
        
        // Status bar elements
        this.healthBar = document.getElementById('health-bar');
        this.hungerBar = document.getElementById('hunger-bar');
        this.thirstBar = document.getElementById('thirst-bar');
        this.healthText = document.getElementById('health-text');
        this.hungerText = document.getElementById('hunger-text');
        this.thirstText = document.getElementById('thirst-text');
        
        // Menu elements
        this.bodyPartsBtn = document.getElementById('body-parts-btn');
        this.bodyPartsMenu = document.getElementById('body-parts-menu');
        this.bodyPartsList = document.getElementById('body-parts-list');
        this.inventoryBtn = document.getElementById('inventory-btn');
        this.inventoryMenu = document.getElementById('inventory-menu');
        this.inventoryList = document.getElementById('inventory-list');
        
        // Display elements
        this.timeDisplay = document.getElementById('time-display');
        this.playerStateDisplay = document.getElementById('player-state-display');
        this.compassDisplay = document.getElementById('compass-display');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.bodyPartsBtn) {
            this.bodyPartsBtn.addEventListener('click', () => {
                const isOpen = !this.bodyPartsMenu.classList.contains('hidden-menu');
                this.bodyPartsMenu.classList.toggle('hidden-menu');
                if (!isOpen) this.inventoryMenu.classList.add('hidden-menu');
                this.updateBodyPartsMenu();
            });
        }

        if (this.inventoryBtn) {
            this.inventoryBtn.addEventListener('click', () => {
                const isOpen = !this.inventoryMenu.classList.contains('hidden-menu');
                this.inventoryMenu.classList.toggle('hidden-menu');
                if (!isOpen) this.bodyPartsMenu.classList.add('hidden-menu');
                this.updateInventoryMenu();
            });
        }
    }

    printToTerminal(text, isCommand = false) {
        const line = document.createElement('div');
        if (isCommand) {
            line.innerHTML = `<span class="prompt">></span> ${text}`;
        } else {
            line.innerHTML = text.replace(/\n/g, '<br>');
        }
        this.terminalOutput.appendChild(line);
        
        // Keep only the last 10 entries to prevent terminal from getting too long
        const maxEntries = 10;
        const lines = this.terminalOutput.getElementsByTagName('div');
        while (lines.length > maxEntries) {
            this.terminalOutput.removeChild(lines[0]);
        }
        
        if (this.terminal) {
            this.terminal.scrollTop = this.terminal.scrollHeight;
        }
    }

    updateStatusBars() {
        if (this.healthBar) {
            this.healthBar.style.width = `${(this.gameState.playerStats.health / this.gameState.playerStats.maxHealth) * 100}%`;
        }
        if (this.hungerBar) {
            this.hungerBar.style.width = `${(this.gameState.playerStats.hunger / this.gameState.playerStats.maxHunger) * 100}%`;
        }
        if (this.thirstBar) {
            this.thirstBar.style.width = `${(this.gameState.playerStats.thirst / this.gameState.playerStats.maxThirst) * 100}%`;
        }

        if (this.healthText) {
            this.healthText.textContent = `${this.gameState.playerStats.health}/${this.gameState.playerStats.maxHealth}`;
        }
        if (this.hungerText) {
            this.hungerText.textContent = `${this.gameState.playerStats.hunger}/${this.gameState.playerStats.maxHunger}`;
        }
        if (this.thirstText) {
            this.thirstText.textContent = `${this.gameState.playerStats.thirst}/${this.gameState.playerStats.maxThirst}`;
        }
    }

    updatePlayerStateDisplay() {
        if (this.playerStateDisplay) {
            this.playerStateDisplay.textContent = `State: ${this.gameState.playerState}`;
        }
    }

    updateTimeDisplay() {
        if (this.timeDisplay) {
            this.timeDisplay.textContent = `Time: ${this.gameState.getTimeString()}`;
        }
        this.updatePlayerStateDisplay();
    }

    updateCompassDisplay() {
        if (this.compassDisplay) {
            this.compassDisplay.textContent = `Facing: ${this.gameState.playerFacing.charAt(0).toUpperCase() + this.gameState.playerFacing.slice(1)}`;
        }
    }

    updateBodyPartsMenu() {
        if (!this.bodyPartsList) return;
        
        this.bodyPartsList.innerHTML = '';
        for (const part in this.gameState.playerStats.bodyParts) {
            const li = document.createElement('li');
            const partData = this.gameState.playerStats.bodyParts[part];
            li.innerHTML = `<span>${part}</span><span>${partData.health}/${partData.maxHealth}</span>`;
            this.bodyPartsList.appendChild(li);
        }
    }

    updateInventoryMenu() {
        if (!this.inventoryList) return;
        
        this.inventoryList.innerHTML = '';
        const keys = this.gameState.getInventoryItems();
        
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
            { type: 'armor', label: 'Armor' },
            { type: 'other', label: 'Other' }
        ];
        
        let hasAnyItems = false;
        
        typeOrder.forEach(({ type, label }) => {
            if (categories[type] && categories[type].length > 0) {
                hasAnyItems = true;
                const header = document.createElement('li');
                header.textContent = label;
                header.style.fontWeight = 'bold';
                header.style.marginTop = '0.5em';
                this.inventoryList.appendChild(header);
                
                categories[type].forEach(key => {
                    const li = document.createElement('li');
                    const item = items[key];
                    const isInInventory = this.gameState.inventory[key] && this.gameState.inventory[key] > 0;
                    const isEquipped = type === 'weapon' && this.gameState.equippedWeapon === key;
                    const isArmorEquipped = type === 'armor' && item && this.gameState.equippedArmor[item.slot] && 
                        this.gameState.equippedArmor[item.slot].itemKey === key;
                    
                    let text = `${item?.name || key}`;
                    
                    if (isInInventory) {
                        text += ` (${this.gameState.inventory[key]})`;
                    }
                    
                    if (isEquipped) {
                        text += ' (equipped)';
                    } else if (isArmorEquipped) {
                        const armor = this.gameState.equippedArmor[item.slot];
                        text += ` (equipped - ${armor.currentDurability}/${armor.maxDurability})`;
                    }
                    
                    li.textContent = text;
                    this.inventoryList.appendChild(li);
                });
            }
        });
        
        // Add equipped armor that's not in inventory (separate section)
        const equippedArmorItems = [];
        Object.entries(this.gameState.equippedArmor).forEach(([slot, armor]) => {
            if (armor && armor.itemKey) {
                const isInInventory = this.gameState.inventory[armor.itemKey] && this.gameState.inventory[armor.itemKey] > 0;
                if (!isInInventory) {
                    equippedArmorItems.push({ slot, armor });
                }
            }
        });
        
        if (equippedArmorItems.length > 0) {
            if (!hasAnyItems) {
                const header = document.createElement('li');
                header.textContent = 'Armor';
                header.style.fontWeight = 'bold';
                header.style.marginTop = '0.5em';
                this.inventoryList.appendChild(header);
            }
            
            equippedArmorItems.forEach(({ slot, armor }) => {
                const li = document.createElement('li');
                const item = items[armor.itemKey];
                const text = `${item?.name || armor.itemKey} (equipped - ${armor.currentDurability}/${armor.maxDurability})`;
                li.textContent = text;
                this.inventoryList.appendChild(li);
            });
            
            hasAnyItems = true;
        }
        
        if (!hasAnyItems) {
            const li = document.createElement('li');
            li.textContent = 'Your inventory is empty.';
            this.inventoryList.appendChild(li);
        }
    }

    updateStatsMenu() {
        const xpSpan = document.getElementById('player-xp');
        const levelSpan = document.getElementById('player-level');
        const nextLevelSpan = document.getElementById('player-next-level-xp');
        if (xpSpan) xpSpan.textContent = this.gameState.xp;
        if (levelSpan) levelSpan.textContent = this.gameState.level.toString().padStart(2, '0');
        if (nextLevelSpan) nextLevelSpan.textContent = this.gameState.getNextLevelProgress();
    }

    setDeathState() {
        // Change heart emoji to skull
        const healthLabel = document.querySelector('.status-bar label');
        if (healthLabel) {
            healthLabel.textContent = '💀';
        }
        
        // Update health text to show 0/100
        if (this.healthText) {
            this.healthText.textContent = '0/100';
        }
        
        // Disable input
        if (this.terminalInput) {
            this.terminalInput.disabled = true;
            this.terminalInput.placeholder = "You are dead. Refresh to restart.";
        }
    }

    updateAllDisplays() {
        this.updateStatusBars();
        this.updateTimeDisplay();
        this.updatePlayerStateDisplay();
        this.updateCompassDisplay();
        this.updateBodyPartsMenu();
        this.updateInventoryMenu();
    }
}

// Export for use in other modules
window.UIManager = UIManager; 
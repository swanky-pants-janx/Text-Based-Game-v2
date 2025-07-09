// Command Processor - Handles all command parsing and execution
class CommandProcessor {
    constructor(gameState, uiManager, inventorySystem, combatSystem, mapRenderer, visualEffects) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.inventorySystem = inventorySystem;
        this.combatSystem = combatSystem;
        this.mapRenderer = mapRenderer;
        this.visualEffects = visualEffects;
    }

    processCommand(commandText) {
        this.uiManager.printToTerminal(commandText, true);
        const input = commandText.toLowerCase().trim().split(' ');
        const command = input[0];
        const argument = input.slice(1).join(' ');

        let response = '';

        switch (command) {
            case 'darkmode':
                document.body.classList.add('darkmode');
                response = 'Dark mode enabled.';
                break;
            case 'lightmode':
                document.body.classList.remove('darkmode');
                response = 'Light mode enabled.';
                break;
            case 'help':
                response = 'Available commands: help, clear, look, move/walk/go [direction], sleep [hh:mm], devtool [enabled|disabled|damage|xp], sit, stand, lay, eat [item], drink [item], take [item/all/x and x and x], drop [item/all/x and x and x], attack [target], equip [weapon/armor], unequip [weapon], armor [status|equip|unequip], save, load';
                break;

            case 'sleep':
                response = this.handleSleep(argument);
                break;

            case 'devtool':
                response = this.handleDevtool(argument);
                break;

            case 'clear':
                this.uiManager.terminalOutput.innerHTML = '';
                return;

            case 'look':
                response = this.handleLook(argument);
                break;

            case 'move':
            case 'walk':
            case 'go':
                response = this.handleMove(argument);
                break;

            case 'sit':
                response = this.handleSit();
                break;

            case 'stand':
                response = this.handleStand();
                break;

            case 'lay':
            case 'lie':
                response = this.handleLay();
                break;

            case 'eat':
                response = this.handleEat(argument);
                break;

            case 'drink':
                response = this.handleDrink(argument);
                break;

            case 'take':
            case 'pickup':
            case 'pick':
                response = this.handleTake(argument);
                break;

            case 'attack':
                response = this.handleAttack(argument);
                break;

            case 'equip':
                response = this.handleEquip(argument);
                break;

            case 'unequip':
                response = this.handleUnequip(argument);
                break;
            case 'armor':
                response = this.handleArmor(argument);
                break;

            case 'drop':
                response = this.handleDrop(argument);
                break;

            case 'save': {
                // Save gameState and world
                try {
                    console.log('Current world state before save:', window.world);
                    console.log('Current player location:', this.gameState.playerLocation);
                    console.log('Items in current room:', window.world[this.gameState.playerLocation].items);
                    console.log('Enemies in current room:', window.world[this.gameState.playerLocation].enemies);
                    
                    // Create a deep copy of the current world state, filtering out undefined values
                    const cleanWorld = JSON.parse(JSON.stringify(window.world, (key, value) => {
                        if (value === undefined) return null;
                        return value;
                    }));
                    
                    console.log('Clean world state to be saved:', cleanWorld);
                    
                    const saveData = {
                        gameState: this.serializeGameState(),
                        world: cleanWorld
                    };
                    const code = btoa(unescape(encodeURIComponent(JSON.stringify(saveData))));
                    // Try to copy to clipboard
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(code).then(() => {
                            response = `Your save code has been copied to your clipboard!`;
                        }, () => {
                            response = `Your save code: ${code}\n(Could not copy to clipboard, please copy manually.)`;
                        });
                    } else {
                        response = `Your save code: ${code}\n(Could not copy to clipboard, please copy manually.)`;
                    }
                } catch (e) {
                    response = 'Failed to generate save code: ' + e.message;
                    console.error('Save error details:', e);
                }
                break;
            }
            case 'load': {
                if (!argument) {
                    response = 'Usage: load <save code>';
                    break;
                }
                try {
                    const decoded = decodeURIComponent(escape(atob(argument)));
                    const saveData = JSON.parse(decoded);
                    this.restoreGameState(saveData.gameState);
                    window.world = saveData.world;
                    this.uiManager.printToTerminal('Game loaded!');
                    this.uiManager.updateAllDisplays && this.uiManager.updateAllDisplays();
                    this.uiManager.updateStatsMenu && this.uiManager.updateStatsMenu();
                    this.mapRenderer.drawMap();
                    response = '';
                } catch (e) {
                    response = 'Invalid or corrupted save code.';
                }
                break;
            }

            default:
                response = `Command not found: ${commandText}`;
        }

        this.uiManager.printToTerminal(response);
    }

    handleSleep(argument) {
        if (this.gameState.playerState !== 'laying') {
            return "You need to lie down before you can sleep.";
        }

        const timeParts = argument.split(':');
        if (timeParts.length === 2) {
            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);
            if (!isNaN(hours) && !isNaN(minutes)) {
                const totalMinutes = (hours * 60) + minutes;
                
                this.visualEffects.showSleepTransition(5000, () => {
                    this.gameState.advanceTime(totalMinutes);
                    this.uiManager.updateTimeDisplay();
                    
                    // Sleeping makes you hungry and thirsty, but might restore a little health
                    this.gameState.playerStats.hunger = Math.max(0, this.gameState.playerStats.hunger - (hours * 5));
                    this.gameState.playerStats.thirst = Math.max(0, this.gameState.playerStats.thirst - (hours * 8));
                    
                    // Heal all body parts a little
                    Object.values(this.gameState.playerStats.bodyParts).forEach(part => {
                        part.health = Math.min(part.maxHealth, part.health + (hours * 2));
                    });

                    // For every minute slept, heal 1 random damaged body part by 1
                    for (let i = 0; i < totalMinutes; i++) {
                        // Get all damaged body parts
                        const damagedParts = Object.values(this.gameState.playerStats.bodyParts).filter(part => part.health < part.maxHealth);
                        if (damagedParts.length === 0) break;
                        // Pick a random damaged part
                        const randomIndex = Math.floor(Math.random() * damagedParts.length);
                        damagedParts[randomIndex].health = Math.min(damagedParts[randomIndex].maxHealth, damagedParts[randomIndex].health + 1);
                    }
                    
                    this.gameState.recalculatePlayerHealth();
                    
                    // Check for death before updating status bars
                    const deathCheck = this.gameState.checkDeath();
                    if (deathCheck.isDead) {
                        this.uiManager.setDeathState();
                        this.uiManager.printToTerminal(deathCheck.message);
                        return;
                    }
                    
                    this.uiManager.updateStatusBars();
                    this.uiManager.printToTerminal("You wake up.");
                });
                
                return ''; // Return early to handle async sleep
            }
        }
        return "Invalid time format. Use 'sleep hh:mm'.";
    }

    handleDevtool(argument) {
        // Handle "devtool give [item name]" command
        if (argument.startsWith('give ')) {
            const itemName = argument.slice(5).trim();
            return this.handleDevtoolGive(itemName);
        }
        
        switch (argument) {
                    case 'enabled':
            this.mapRenderer.setDevtoolEnabled(true);
            if (!this.mapRenderer.devtoolShowExits) this.mapRenderer.toggleDevtoolExits();
            if (!this.mapRenderer.devtoolShowReveal) this.mapRenderer.toggleDevtoolReveal();
            if (!this.mapRenderer.devtoolShowEnemies) this.mapRenderer.toggleDevtoolEnemies();
            return 'Devtool enabled. Exit arrows, map reveal, and enemy indicators enabled.';
                    case 'disabled':
            this.mapRenderer.setDevtoolEnabled(false);
            if (this.mapRenderer.devtoolShowExits) this.mapRenderer.toggleDevtoolExits();
            if (this.mapRenderer.devtoolShowReveal) this.mapRenderer.toggleDevtoolReveal();
            if (this.mapRenderer.devtoolShowEnemies) this.mapRenderer.toggleDevtoolEnemies();
            return 'Devtool disabled. Exit arrows, map reveal, and enemy indicators disabled.';
            case 'damage':
                const damageResult = this.combatSystem.damageRandomBodyPart(Math.floor(Math.random() * 31) + 10);
                return `Devtool: ${damageResult.part} damaged for ${damageResult.amount} points.`;
            case 'testarmor':
                return this.handleDevtoolTestArmor();
            case 'armorstatus':
                return this.handleDevtoolArmorStatus();
            case 'xp':
                this.gameState.gainXP(50);
                this.uiManager.updateStatsMenu && this.uiManager.updateStatsMenu();
                return 'Devtool: 50 XP granted.';
            default:
                return 'Usage: devtool [enabled|disabled|damage|testarmor|armorstatus|xp|give <item name>]';
        }
    }

    handleDevtoolGive(itemName) {
        // Find the item by name in the items object
        const itemKey = Object.keys(items).find(key => {
            const item = items[key];
            return (
                key.replace(/\s|_/g, '').toLowerCase() === itemName.replace(/\s|_/g, '').toLowerCase() ||
                item.name.replace(/\s|_/g, '').toLowerCase() === itemName.replace(/\s|_/g, '').toLowerCase()
            );
        });
        
        if (!itemKey || !items[itemKey]) {
            return `Devtool: Item '${itemName}' not found.`;
        }
        
        // Add the item to inventory
        this.gameState.addToInventory(itemKey, 1);
        this.uiManager.updateInventoryMenu();
        
        return `Devtool: Added ${items[itemKey].name} to your inventory.`;
    }

    handleDevtoolTestArmor() {
        // Give player some armor to test with
        const testArmor = ['iron_helmet', 'iron_breastplate', 'iron_greaves'];
        let results = [];
        
        testArmor.forEach(armorKey => {
            if (!this.gameState.hasItem(armorKey)) {
                this.gameState.addToInventory(armorKey, 1);
                results.push(`Added ${items[armorKey].name} to inventory`);
            }
        });
        
        this.uiManager.updateInventoryMenu();
        
        if (results.length > 0) {
            return `Devtool: Armor test items added.\n${results.join('\n')}\n\nNow equip armor and use 'devtool damage' to test damage absorption.`;
        } else {
            return `Devtool: You already have test armor. Equip it and use 'devtool damage' to test.`;
        }
    }

    handleDevtoolArmorStatus() {
        const status = this.gameState.getDetailedArmorStatus();
        let output = 'Devtool: Detailed Armor Status:\n';
        
        Object.entries(status).forEach(([slot, armor]) => {
            if (armor) {
                output += `${slot}: ${armor.name} (${armor.durability}/${armor.maxDurability} - ${armor.percentage}%)\n`;
            } else {
                output += `${slot}: None\n`;
            }
        });
        
        return output.trim();
    }

    handleLook(argument) {
        if (argument.startsWith('at ')) {
            const targetArg = argument.slice(3).trim();
            
            // First check for items in the room
            const roomItems = this.inventorySystem.getRoomItems();
            const roomItem = roomItems.find(item => 
                item.key.replace(/\s|_/g, '').toLowerCase() === targetArg.replace(/\s|_/g, '').toLowerCase() ||
                item.name.replace(/\s|_/g, '').toLowerCase() === targetArg.replace(/\s|_/g, '').toLowerCase()
            );
            
            if (roomItem) {
                const itemData = items[roomItem.key];
                let desc = `${roomItem.name}: ${roomItem.description}`;
                if (itemData && itemData.type === 'weapon' && itemData.effect && itemData.effect.attack) {
                    desc += ` (Damage: ${itemData.effect.attack.min}-${itemData.effect.attack.max})`;
                }
                return desc;
            }
            
            // Then check for items in inventory
            const inventoryItemKey = this.inventorySystem.findItemByArgument(targetArg);
            if (inventoryItemKey && items[inventoryItemKey] && this.gameState.hasItem(inventoryItemKey)) {
                const item = items[inventoryItemKey];
                let desc = `${item.name}: ${item.description}`;
                if (item.type === 'weapon' && item.effect && item.effect.attack) {
                    desc += ` (Damage: ${item.effect.attack.min}-${item.effect.attack.max})`;
                }
                return desc;
            }
            
            // Finally check for enemies
            const enemyData = this.combatSystem.findEnemyByArgument(targetArg);
            if (enemyData) {
                const { enemy, targetIndex } = enemyData;
                let description = "A mysterious creature.";
                if (typeof enemies !== 'undefined' && enemies[enemy.type]) {
                    description = enemies[enemy.type].description;
                }
                return `${enemy.name} (${targetIndex}): ${enemy.health}/${enemy.maxHealth} HP. ${description}`;
            }
            
            return `You don't see any '${targetArg}' here.`;
        }
        // General look command
        let lines = [];
        // Enemies
        const roomEnemies = this.inventorySystem.getRoomEnemies();
        if (roomEnemies.length > 0) {
            const enemyNames = roomEnemies.map(enemy => enemy.displayName);
            lines.push(`Enemies in room: ${enemyNames.join(', ')}`);
        } else {
            lines.push('No enemies in the room.');
        }
        // Items
        const roomItems = this.inventorySystem.getRoomItems();
        if (roomItems.length > 0) {
            const itemNames = roomItems.map(item => item.name).join(', ');
            lines.push(`You see: ${itemNames}`);
        } else {
            lines.push('No items in the room.');
        }
        // Exits
        const exits = Object.keys(world[this.gameState.playerLocation].exits || {});
        if (exits.length > 0) {
            lines.push(`Exits: ${exits.join(', ')}`);
        } else {
            lines.push('There are no visible exits.');
        }
        return lines.join('\n');
    }

    handleMove(argument) {
        // Check if player can move based on their state
        if (this.gameState.playerState === 'sitting' || this.gameState.playerState === 'laying') {
            return "You need to stand up before you can move.";
        }
        const direction = this.gameState.directionAliases[argument];
        if (!direction) {
            return `I don't understand where you want to go. Try north, south, east, or west.`;
        }
        if (this.gameState.movePlayer(direction)) {
            // Nudge terminal in the direction of movement
            if (typeof window.nudgeTerminal === 'function') window.nudgeTerminal(direction);
            // Advance time and decrease hunger/thirst only on successful move
            this.gameState.advanceTime(5);
            this.gameState.playerStats.hunger = Math.max(0, this.gameState.playerStats.hunger - 1);
            this.gameState.playerStats.thirst = Math.max(0, this.gameState.playerStats.thirst - 2);
            this.uiManager.updateTimeDisplay();
            this.uiManager.updateStatusBars();
            let lines = [];
            lines.push(world[this.gameState.playerLocation].description);
            // Enemies
            const roomEnemies = this.inventorySystem.getRoomEnemies();
            if (roomEnemies.length > 0) {
                const enemyNames = roomEnemies.map(enemy => enemy.displayName);
                lines.push(`Enemies in room: ${enemyNames.join(', ')}`);
            }
            this.uiManager.updateCompassDisplay();
            return lines.join('\n');
        } else {
            return `You can't go that way.`;
        }
    }

    handleSit() {
        if (this.gameState.playerState === 'sitting') {
            return "You are already sitting.";
        } else {
            this.gameState.playerState = 'sitting';
            this.uiManager.updatePlayerStateDisplay();
            return "You sit down.";
        }
    }

    handleStand() {
        if (this.gameState.playerState === 'standing') {
            return "You are already standing.";
        } else {
            this.gameState.playerState = 'standing';
            this.uiManager.updatePlayerStateDisplay();
            return "You stand up.";
        }
    }

    handleLay() {
        if (this.gameState.playerState === 'laying') {
            return "You are already laying down.";
        } else {
            this.gameState.playerState = 'laying';
            this.uiManager.updatePlayerStateDisplay();
            return "You lay down.";
        }
    }

    handleEat(argument) {
        const itemKey = this.inventorySystem.findItemByArgument(argument);
        const result = this.inventorySystem.useItem(itemKey, 'eat');
        
        if (result.success && result.effects) {
            // Show eating effects
            result.effects.forEach(effect => {
                if (effect === 'crunch') {
                    setTimeout(() => this.visualEffects.showCrunchFx(), 0);
                    setTimeout(() => this.visualEffects.showCrunchFx(), 700);
                    setTimeout(() => this.visualEffects.showCrunchFx(), 1400);
                }
            });
        }
        
        return result.message;
    }

    handleDrink(argument) {
        const itemKey = this.inventorySystem.findItemByArgument(argument);
        const result = this.inventorySystem.useItem(itemKey, 'drink');
        
        if (result.success && result.effects) {
            // Show drinking effects
            result.effects.forEach(effect => {
                if (effect === 'glug') {
                    setTimeout(() => this.visualEffects.showGlugFx(), 0);
                    setTimeout(() => this.visualEffects.showGlugFx(), 1000);
                    setTimeout(() => this.visualEffects.showGlugFx(), 2000);
                }
            });
        }
        
        return result.message;
    }

    handleTake(argument) {
        if (!argument) {
            return 'Take what?';
        }
        
        // Handle "take all"
        if (argument.toLowerCase() === 'all') {
            const takenItems = this.inventorySystem.takeAllItems();
            if (takenItems.length === 0) {
                return "There's nothing here to take.";
            }
            return `You pick up: ${takenItems.join(', ')}.`;
        }
        
        // Handle "take x and x and x" format
        if (argument.includes(' and ')) {
            const itemNames = argument.split(' and ').map(name => name.trim());
            const result = this.inventorySystem.takeMultipleItems(itemNames);
            
            if (result.takenItems.length > 0) {
                let response = `You pick up: ${result.takenItems.join(', ')}.`;
                if (result.failedItems.length > 0) {
                    response += `\nCouldn't find: ${result.failedItems.join(', ')}.`;
                }
                return response;
            } else {
                return `Couldn't find any of the requested items.`;
            }
        }
        
        // Handle single item
        const itemKey = this.inventorySystem.findItemByArgument(argument, true);
        if (!itemKey) {
            return "That item isn't here.";
        }
        
        if (this.inventorySystem.takeItem(itemKey)) {
            return `You pick up the ${items[itemKey]?.name || itemKey}.`;
        }
        
        return "Failed to pick up item.";
    }

    handleAttack(argument) {
        const result = this.combatSystem.attackEnemy(argument);
        // Only update time/hunger/thirst if the attack was successful
        if (result.success) {
            this.gameState.advanceTime(5);
            this.gameState.playerStats.hunger = Math.max(0, this.gameState.playerStats.hunger - 1);
            this.gameState.playerStats.thirst = Math.max(0, this.gameState.playerStats.thirst - 2);
            this.uiManager.updateTimeDisplay();
            this.uiManager.updateStatusBars();
        }
        return result.message;
    }

    handleEquip(argument) {
        if (!argument) {
            return 'Equip what?';
        }
        
        console.log('NEW COMMAND PROCESSOR: handleEquip called with:', argument);
        
        const itemKey = this.inventorySystem.findItemByArgument(argument);
        if (!itemKey) {
            return `You don't have any ${argument}.`;
        }
        
        const item = items[itemKey];
        if (!item) {
            return `That item doesn't exist.`;
        }
        
        console.log('NEW COMMAND PROCESSOR: Item found:', item);
        
        // Check if it's armor and use armor equipping system
        if (item.type === 'armor') {
            console.log('NEW COMMAND PROCESSOR: Item is armor, calling equipArmor');
            return this.equipArmor(argument);
        }
        
        // Otherwise try to equip as weapon
        const result = this.inventorySystem.equipWeapon(itemKey);
        
        if (result === false) {
            return `You can't equip that.`;
        }
        
        return result.message;
    }

    handleUnequip(argument) {
        // If no argument, try to unequip weapon (backward compatibility)
        if (!argument) {
            const result = this.inventorySystem.unequipWeapon();
            return result.message;
        }
        
        // Check if it's a weapon
        if (this.gameState.equippedWeapon) {
            const weaponItem = items[this.gameState.equippedWeapon];
            if (weaponItem && weaponItem.name.toLowerCase().includes(argument.toLowerCase())) {
                const result = this.inventorySystem.unequipWeapon();
                return result.message;
            }
        }
        
        // Check if it's armor by looking for the item in equipped armor
        const validSlots = ['head_armor', 'torso_armor', 'leggings'];
        for (const slot of validSlots) {
            const armor = this.gameState.equippedArmor[slot];
            if (armor) {
                const armorItem = items[armor.itemKey];
                if (armorItem && armorItem.name.toLowerCase().includes(argument.toLowerCase())) {
                    return this.unequipArmor(slot);
                }
            }
        }
        
        return `You don't have any ${argument} equipped.`;
    }

    handleArmor(argument) {
        if (!argument) {
            return this.getArmorStatus();
        }

        const args = argument.toLowerCase().split(' ');
        const command = args[0];

        switch (command) {
            case 'status':
                return this.getArmorStatus();
            case 'equip':
                if (args.length < 2) {
                    return 'Usage: armor equip [armor name]';
                }
                const equipItemName = args.slice(1).join(' ');
                return this.equipArmor(equipItemName);
            case 'unequip':
                if (args.length < 2) {
                    return 'Usage: armor unequip [slot]';
                }
                const slot = args[1];
                return this.unequipArmor(slot);
            default:
                return 'Usage: armor [status|equip|unequip]';
        }
    }

    getArmorStatus() {
        const equippedArmor = this.gameState.equippedArmor;
        let status = 'Armor Status:\n';
        
        const slots = ['head_armor', 'torso_armor', 'leggings'];
        const slotNames = {
            'head_armor': 'Head',
            'torso_armor': 'Torso', 
            'leggings': 'Legs'
        };

        slots.forEach(slot => {
            const armor = equippedArmor[slot];
            if (armor) {
                const item = items[armor.itemKey];
                const durabilityPercent = Math.round((armor.currentDurability / armor.maxDurability) * 100);
                status += `${slotNames[slot]}: ${item.name} (${armor.currentDurability}/${armor.maxDurability} - ${durabilityPercent}%)\n`;
            } else {
                status += `${slotNames[slot]}: None\n`;
            }
        });

        return status.trim();
    }

    equipArmor(itemName) {
        const itemKey = this.inventorySystem.findItemByArgument(itemName);
        if (!itemKey) {
            return `You don't have any ${itemName}.`;
        }

        // Check if player actually has this item in inventory
        if (!this.gameState.hasItem(itemKey)) {
            return `You don't have any ${itemName}.`;
        }

        const item = items[itemKey];
        if (item.type !== 'armor') {
            return `That's not an armor item.`;
        }

        const result = this.gameState.equipArmor(itemKey);
        if (result.success) {
            // Remove from inventory since it's now equipped
            this.gameState.removeFromInventory(itemKey, 1);
            this.uiManager.updateInventoryMenu();
            return `${result.message} Use 'armor status' to see your equipped armor.`;
        } else {
            return result.message;
        }
    }

    unequipArmor(slot) {
        const validSlots = ['head_armor', 'torso_armor', 'leggings'];
        if (!validSlots.includes(slot)) {
            return 'Valid slots: head_armor, torso_armor, leggings';
        }

        const result = this.gameState.unequipArmor(slot);
        if (result.success) {
            this.uiManager.updateInventoryMenu();
            return result.message;
        } else {
            return result.message;
        }
    }

    handleDrop(argument) {
        if (!argument) {
            return 'Drop what?';
        }
        
        // Handle "drop all"
        if (argument.toLowerCase() === 'all') {
            const droppedItems = this.inventorySystem.dropAllItems();
            if (droppedItems.length === 0) {
                return "You don't have anything to drop.";
            }
            return `You drop: ${droppedItems.join(', ')}.`;
        }
        
        // Handle "drop x and x and x" format
        if (argument.includes(' and ')) {
            const itemNames = argument.split(' and ').map(name => name.trim());
            const result = this.inventorySystem.dropMultipleItems(itemNames);
            
            if (result.droppedItems.length > 0) {
                let response = `You drop: ${result.droppedItems.join(', ')}.`;
                if (result.failedItems.length > 0) {
                    response += `\nCouldn't drop: ${result.failedItems.join(', ')}.`;
                }
                return response;
            } else {
                return `Couldn't drop any of the requested items.`;
            }
        }
        
        // Handle single item
        const itemKey = this.inventorySystem.findItemByArgument(argument);
        if (!itemKey) {
            return `You don't have any ${argument}.`;
        }
        
        // Check if item is in inventory or equipped
        const hasInInventory = this.gameState.hasItem(itemKey);
        const isEquippedWeapon = this.gameState.equippedWeapon === itemKey;
        const isEquippedArmor = Object.values(this.gameState.equippedArmor).some(armor => 
            armor && armor.itemKey === itemKey
        );
        
        if (!hasInInventory && !isEquippedWeapon && !isEquippedArmor) {
            return `You don't have any ${argument}.`;
        }
        
        if (this.inventorySystem.dropItem(itemKey)) {
            return `You drop the ${items[itemKey].name}.`;
        }
        
        return "Failed to drop item.";
    }

    // Helper to serialize gameState (excluding methods)
    serializeGameState() {
        // Only include serializable properties
        const gs = this.gameState;
        return {
            playerLocation: gs.playerLocation,
            visitedLocations: gs.visitedLocations,
            gameTime: gs.gameTime.getTime(),
            playerState: gs.playerState,
            playerFacing: gs.playerFacing,
            equippedWeapon: gs.equippedWeapon,
            playerIsDead: gs.playerIsDead,
            inventory: gs.inventory,
            playerStats: gs.playerStats,
            xp: gs.xp,
            level: gs.level
        };
    }

    // Helper to restore gameState from object
    restoreGameState(data) {
        const gs = this.gameState;
        gs.playerLocation = data.playerLocation;
        gs.visitedLocations = data.visitedLocations;
        gs.gameTime = new Date(data.gameTime);
        gs.playerState = data.playerState;
        gs.playerFacing = data.playerFacing;
        gs.equippedWeapon = data.equippedWeapon;
        gs.playerIsDead = data.playerIsDead;
        gs.inventory = data.inventory;
        gs.playerStats = data.playerStats;
        gs.xp = data.xp;
        gs.level = data.level;
    }
}

// Export for use in other modules
window.CommandProcessor = CommandProcessor; 
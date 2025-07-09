// Inventory System - Handles all inventory and item management
class InventorySystem {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
    }

    findItemByArgument(argument, searchInRoom = false) {
        const normalizedArg = argument.replace(/\s|_/g, '').toLowerCase();
        
        if (searchInRoom) {
            const itemsHere = world[this.gameState.playerLocation].items || [];
            return itemsHere.find(key => {
                const item = items[key];
                return (
                    key.replace(/\s|_/g, '').toLowerCase() === normalizedArg ||
                    item?.name.replace(/\s|_/g, '').toLowerCase() === normalizedArg
                );
            });
        } else {
            return Object.keys(items).find(key => {
                const item = items[key];
                return (
                    key.replace(/\s|_/g, '').toLowerCase() === normalizedArg ||
                    item?.name.replace(/\s|_/g, '').toLowerCase() === normalizedArg
                );
            });
        }
    }

    takeItem(itemKey) {
        if (!itemKey) return false;
        let item = items[itemKey];
        if (!item && typeof worldObjects !== 'undefined') item = worldObjects[itemKey];
        if (item && item.type === 'worldobject') return false;
        this.gameState.addToInventory(itemKey, 1);
        
        // Remove from room
        const itemsHere = world[this.gameState.playerLocation].items || [];
        world[this.gameState.playerLocation].items = itemsHere.filter(key => key !== itemKey);
        
        this.uiManager.updateInventoryMenu();
        return true;
    }

    takeAllItems() {
        const itemsHere = world[this.gameState.playerLocation].items || [];
        if (itemsHere.length === 0) return [];
        
        const takenItems = [];
        itemsHere.forEach(itemKey => {
            let item = items[itemKey];
            if (!item && typeof worldObjects !== 'undefined') item = worldObjects[itemKey];
            if (item && item.type === 'worldobject') return;
            this.gameState.addToInventory(itemKey, 1);
            takenItems.push(item?.name || itemKey);
        });
        
        // Remove only non-worldobject items from room
        world[this.gameState.playerLocation].items = itemsHere.filter(itemKey => {
            let item = items[itemKey];
            if (!item && typeof worldObjects !== 'undefined') item = worldObjects[itemKey];
            return item && item.type === 'worldobject';
        });
        this.uiManager.updateInventoryMenu();
        return takenItems;
    }

    takeMultipleItems(itemNames) {
        const takenItems = [];
        const failedItems = [];
        
        itemNames.forEach(itemName => {
            const itemKey = this.findItemByArgument(itemName, true);
            let item = items[itemKey];
            if (!item && typeof worldObjects !== 'undefined') item = worldObjects[itemKey];
            
            if (itemKey && item && item.type !== 'worldobject') {
                this.gameState.addToInventory(itemKey, 1);
                takenItems.push(item?.name || itemKey);
                
                // Remove from room
                const index = world[this.gameState.playerLocation].items.indexOf(itemKey);
                if (index > -1) {
                    world[this.gameState.playerLocation].items.splice(index, 1);
                }
            } else {
                failedItems.push(itemName);
            }
        });
        
        this.uiManager.updateInventoryMenu();
        return { takenItems, failedItems };
    }

    dropItem(itemKey) {
        if (!itemKey) return false;
        
        // Check if it's in inventory
        const hasInInventory = this.gameState.hasItem(itemKey);
        
        // Check if it's equipped as weapon
        const isEquippedWeapon = this.gameState.equippedWeapon === itemKey;
        
        // Check if it's equipped as armor
        let isEquippedArmor = false;
        let armorSlot = null;
        Object.entries(this.gameState.equippedArmor).forEach(([slot, armor]) => {
            if (armor && armor.itemKey === itemKey) {
                isEquippedArmor = true;
                armorSlot = slot;
            }
        });
        
        // If not in inventory and not equipped, can't drop it
        if (!hasInInventory && !isEquippedWeapon && !isEquippedArmor) {
            return false;
        }
        
        // If dropping equipped weapon, unequip it first
        if (isEquippedWeapon) {
            this.gameState.equippedWeapon = null;
        }
        
        // If dropping equipped armor, unequip it first
        if (isEquippedArmor) {
            this.gameState.equippedArmor[armorSlot] = null;
        }
        
        // Remove from inventory if it was there
        if (hasInInventory) {
            this.gameState.removeFromInventory(itemKey, 1);
        }
        
        // Add to room items
        if (!world[this.gameState.playerLocation].items) {
            world[this.gameState.playerLocation].items = [];
        }
        world[this.gameState.playerLocation].items.push(itemKey);
        
        this.uiManager.updateInventoryMenu();
        return true;
    }

    dropAllItems() {
        const inventoryKeys = this.gameState.getInventoryItems();
        const equippedWeapon = this.gameState.equippedWeapon;
        const equippedArmor = this.gameState.equippedArmor;
        
        if (inventoryKeys.length === 0 && !equippedWeapon && 
            !Object.values(equippedArmor).some(armor => armor !== null)) {
            return [];
        }
        
        const droppedItems = [];
        
        // Drop inventory items
        inventoryKeys.forEach(itemKey => {
            // If dropping equipped weapon, unequip it first
            if (this.gameState.equippedWeapon === itemKey) {
                this.gameState.equippedWeapon = null;
            }
            
            // Add to room items
            if (!world[this.gameState.playerLocation].items) {
                world[this.gameState.playerLocation].items = [];
            }
            world[this.gameState.playerLocation].items.push(itemKey);
            
            droppedItems.push(items[itemKey]?.name || itemKey);
            delete this.gameState.inventory[itemKey];
        });
        
        // Drop equipped weapon if any
        if (equippedWeapon) {
            this.gameState.equippedWeapon = null;
            if (!world[this.gameState.playerLocation].items) {
                world[this.gameState.playerLocation].items = [];
            }
            world[this.gameState.playerLocation].items.push(equippedWeapon);
            droppedItems.push(items[equippedWeapon]?.name || equippedWeapon);
        }
        
        // Drop equipped armor if any
        Object.entries(equippedArmor).forEach(([slot, armor]) => {
            if (armor) {
                this.gameState.equippedArmor[slot] = null;
                if (!world[this.gameState.playerLocation].items) {
                    world[this.gameState.playerLocation].items = [];
                }
                world[this.gameState.playerLocation].items.push(armor.itemKey);
                droppedItems.push(items[armor.itemKey]?.name || armor.itemKey);
            }
        });
        
        this.uiManager.updateInventoryMenu();
        return droppedItems;
    }

    dropMultipleItems(itemNames) {
        const droppedItems = [];
        const failedItems = [];
        
        itemNames.forEach(itemName => {
            const itemKey = this.findItemByArgument(itemName);
            
            if (itemKey) {
                // Check if it's in inventory
                const hasInInventory = this.gameState.hasItem(itemKey);
                
                // Check if it's equipped as weapon
                const isEquippedWeapon = this.gameState.equippedWeapon === itemKey;
                
                // Check if it's equipped as armor
                let isEquippedArmor = false;
                let armorSlot = null;
                Object.entries(this.gameState.equippedArmor).forEach(([slot, armor]) => {
                    if (armor && armor.itemKey === itemKey) {
                        isEquippedArmor = true;
                        armorSlot = slot;
                    }
                });
                
                if (hasInInventory || isEquippedWeapon || isEquippedArmor) {
                    // If dropping equipped weapon, unequip it first
                    if (isEquippedWeapon) {
                        this.gameState.equippedWeapon = null;
                    }
                    
                    // If dropping equipped armor, unequip it first
                    if (isEquippedArmor) {
                        this.gameState.equippedArmor[armorSlot] = null;
                    }
                    
                    // Remove from inventory if it was there
                    if (hasInInventory) {
                        this.gameState.removeFromInventory(itemKey, 1);
                    }
                    
                    // Add to room items
                    if (!world[this.gameState.playerLocation].items) {
                        world[this.gameState.playerLocation].items = [];
                    }
                    world[this.gameState.playerLocation].items.push(itemKey);
                    
                    droppedItems.push(items[itemKey]?.name || itemKey);
                } else {
                    failedItems.push(itemName);
                }
            } else {
                failedItems.push(itemName);
            }
        });
        
        this.uiManager.updateInventoryMenu();
        return { droppedItems, failedItems };
    }

    equipWeapon(itemKey) {
        if (!itemKey || !items[itemKey] || items[itemKey].type !== 'weapon') {
            return false;
        }
        
        if (!this.gameState.hasItem(itemKey)) {
            return false;
        }
        
        // Check if weapon is already equipped
        if (this.gameState.equippedWeapon === itemKey) {
            return { success: false, message: `${items[itemKey].name} is already equipped.` };
        }
        
        this.gameState.equippedWeapon = itemKey;
        this.uiManager.updateInventoryMenu();
        return { success: true, message: `You equip the ${items[itemKey].name}.` };
    }

    unequipWeapon() {
        if (!this.gameState.equippedWeapon) {
            return { success: false, message: "You don't have anything equipped." };
        }
        
        const weaponName = items[this.gameState.equippedWeapon].name;
        this.gameState.equippedWeapon = null;
        this.uiManager.updateInventoryMenu();
        return { success: true, message: `You unequip the ${weaponName}.` };
    }

    useItem(itemKey, action) {
        if (!itemKey || !this.gameState.hasItem(itemKey)) {
            return { success: false, message: `You don't have any ${items[itemKey]?.name || itemKey}.` };
        }
        
        const item = items[itemKey];
        if (!item) {
            return { success: false, message: "That item doesn't exist." };
        }
        
        switch (action) {
            case 'eat':
                if (item.type !== 'food') {
                    return { success: false, message: "You can't eat that." };
                }
                
                this.gameState.playerStats.hunger = Math.min(
                    this.gameState.playerStats.maxHunger, 
                    this.gameState.playerStats.hunger + (item.effect.hunger || 0)
                );
                this.gameState.removeFromInventory(itemKey, 1);
                this.uiManager.updateStatusBars();
                this.uiManager.updateInventoryMenu();
                return { 
                    success: true, 
                    message: `You eat the ${item.name}. (+${item.effect.hunger} hunger)`,
                    effects: ['crunch']
                };
                
            case 'drink':
                if (item.type !== 'drink' && item.type !== 'potion') {
                    return { success: false, message: "You can't drink that." };
                }
                
                if (item.type === 'drink') {
                    this.gameState.playerStats.thirst = Math.min(
                        this.gameState.playerStats.maxThirst, 
                        this.gameState.playerStats.thirst + (item.effect.thirst || 0)
                    );
                    this.gameState.removeFromInventory(itemKey, 1);
                    this.uiManager.updateStatusBars();
                    this.uiManager.updateInventoryMenu();
                    return { 
                        success: true, 
                        message: `You drink the ${item.name}. (+${item.effect.thirst} thirst)`,
                        effects: ['glug']
                    };
                } else if (item.type === 'potion') {
                    if (item.effect.health) {
                        // Distribute healing only among damaged body parts
                        let healAmount = item.effect.health;
                        let damagedParts = Object.values(this.gameState.playerStats.bodyParts)
                            .filter(part => part.health < part.maxHealth);
                        
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
                        
                        this.gameState.recalculatePlayerHealth();
                        this.gameState.removeFromInventory(itemKey, 1);
                        this.uiManager.updateStatusBars();
                        this.uiManager.updateBodyPartsMenu();
                        this.uiManager.updateInventoryMenu();
                        return { 
                            success: true, 
                            message: `You drink the ${item.name}. (Healed damaged body parts)`,
                            effects: ['glug']
                        };
                    } else if (item.effect.mana) {
                        this.gameState.removeFromInventory(itemKey, 1);
                        this.uiManager.updateInventoryMenu();
                        return { 
                            success: true, 
                            message: `You drink the ${item.name}. (+${item.effect.mana} mana)`,
                            effects: ['glug']
                        };
                    } else {
                        this.gameState.removeFromInventory(itemKey, 1);
                        this.uiManager.updateInventoryMenu();
                        return { 
                            success: true, 
                            message: `You drink the ${item.name}.`,
                            effects: ['glug']
                        };
                    }
                }
                break;
                
            default:
                return { success: false, message: "You can't use that item that way." };
        }
    }

    getRoomItems() {
        const itemsHere = world[this.gameState.playerLocation].items || [];
        return itemsHere.map(key => {
            let item = items[key];
            if (!item && typeof worldObjects !== 'undefined') item = worldObjects[key];
            return {
                key,
                name: item?.name || key,
                description: item?.description || "A mysterious item.",
                type: item?.type || undefined
            };
        });
    }

    getRoomEnemies() {
        const enemiesHere = world[this.gameState.playerLocation].enemies || [];
        return enemiesHere.map((enemy, i) => ({
            ...enemy,
            index: i + 1,
            displayName: `${enemy.name} (${i + 1})`
        }));
    }
}

// Export for use in other modules
window.InventorySystem = InventorySystem; 
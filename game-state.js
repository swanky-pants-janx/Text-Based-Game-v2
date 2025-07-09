// Game State Management
class GameState {
    constructor() {
        this.playerLocation = 'start';
        this.visitedLocations = ['start'];
        this.gameTime = new Date(0, 0, 0, 8, 0, 0); // Start at 8:00 AM
        this.playerState = 'standing';
        this.playerFacing = 'north';
        this.equippedWeapon = null;
        this.playerIsDead = false;
        this.inventory = {};
        
        // Armor equipment slots - track equipped armor pieces
        this.equippedArmor = {
            head_armor: null,
            torso_armor: null,
            leggings: null
        };

        this.playerStats = {
            health: 100,
            maxHealth: 100,
            hunger: 100,
            maxHunger: 100,
            thirst: 100,
            maxThirst: 100,
            bodyParts: {
                'Right Eye': { health: 50, maxHealth: 50 },
                'Left Eye': { health: 50, maxHealth: 50 },
                'Head': { health: 50, maxHealth: 50 },
                'Nose': { health: 50, maxHealth: 50 },
                'Mouth': { health: 50, maxHealth: 50 },
                'Right Arm': { health: 50, maxHealth: 50 },
                'Left Arm': { health: 50, maxHealth: 50 },
                'Torso': { health: 50, maxHealth: 50 },
                'Stomach': { health: 50, maxHealth: 50 },
                'Right Leg': { health: 50, maxHealth: 50 },
                'Left Leg': { health: 50, maxHealth: 50 },
            }
        };

        this.xp = 0;
        this.level = 1;

        this.directionAliases = {
            'n': 'north', 'north': 'north', 'forward': 'north',
            's': 'south', 'south': 'south', 'back': 'south',
            'e': 'east', 'east': 'east',
            'w': 'west', 'west': 'west',
            'u': 'up', 'up': 'up',
            'd': 'down', 'down': 'down'
        };
    }

    advanceTime(minutes) {
        this.gameTime.setMinutes(this.gameTime.getMinutes() + minutes);
    }

    getTimeString() {
        const hours = String(this.gameTime.getHours()).padStart(2, '0');
        const minutes = String(this.gameTime.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    movePlayer(direction) {
        const actualDirection = this.directionAliases[direction];
        if (!actualDirection) return false;
        
        if (world[this.playerLocation].exits[actualDirection]) {
            this.playerLocation = world[this.playerLocation].exits[actualDirection];
            this.playerFacing = actualDirection;
            if (!this.visitedLocations.includes(this.playerLocation)) {
                this.visitedLocations.push(this.playerLocation);
            }
            return true;
        }
        return false;
    }

    recalculatePlayerHealth() {
        const total = Object.values(this.playerStats.bodyParts).reduce((sum, part) => sum + part.health, 0);
        const totalMax = Object.values(this.playerStats.bodyParts).reduce((sum, part) => sum + part.maxHealth, 0);
        this.playerStats.health = Math.round((total / totalMax) * 100);
        this.playerStats.maxHealth = 100;
    }

    checkDeath() {
        if (this.playerIsDead) return true;
        
        let deathMessage = null;
        
        if (this.playerStats.hunger <= 0) {
            deathMessage = "You died of hunger.";
        } else if (this.playerStats.thirst <= 0) {
            deathMessage = "You died of thirst.";
        }
        
        if (deathMessage) {
            this.playerIsDead = true;
            this.playerStats.health = 0;
            return { isDead: true, message: deathMessage };
        }
        
        return { isDead: false, message: null };
    }

    addToInventory(itemKey, quantity = 1) {
        this.inventory[itemKey] = (this.inventory[itemKey] || 0) + quantity;
    }

    removeFromInventory(itemKey, quantity = 1) {
        if (!this.inventory[itemKey] || this.inventory[itemKey] < quantity) {
            return false;
        }
        this.inventory[itemKey] -= quantity;
        if (this.inventory[itemKey] <= 0) {
            delete this.inventory[itemKey];
        }
        return true;
    }

    hasItem(itemKey, quantity = 1) {
        return this.inventory[itemKey] && this.inventory[itemKey] >= quantity;
    }

    getInventoryItems() {
        return Object.keys(this.inventory).filter(key => this.inventory[key] > 0);
    }

    gainXP(amount) {
        this.xp += amount;
        while (this.xp >= this.getXPForNextLevel()) {
            this.xp -= this.getXPForNextLevel();
            this.level++;
        }
    }

    getXPForNextLevel() {
        // Each new level requires 25 more XP than the previous
        return 100 + (this.level - 1) * 25;
    }

    getNextLevelProgress() {
        return `${this.xp}/${this.getXPForNextLevel()}`;
    }

    // Armor management methods
    equipArmor(itemKey) {
        const item = items[itemKey];
        if (!item || item.type !== 'armor') {
            return { success: false, message: 'That is not armor.' };
        }

        const slot = item.slot;
        if (!this.equippedArmor.hasOwnProperty(slot)) {
            return { success: false, message: 'Invalid armor slot.' };
        }

        // Unequip current armor in that slot if any
        if (this.equippedArmor[slot]) {
            this.unequipArmor(slot);
        }

        // Equip the new armor
        this.equippedArmor[slot] = {
            itemKey: itemKey,
            maxDurability: item.maxDurability,
            currentDurability: item.currentDurability
        };

        return { success: true, message: `You equip the ${item.name}.` };
    }

    unequipArmor(slot) {
        if (!this.equippedArmor[slot]) {
            return { success: false, message: 'You are not wearing anything in that slot.' };
        }

        const equippedArmor = this.equippedArmor[slot];
        const itemKey = equippedArmor.itemKey;
        const item = items[itemKey];

        // Add the armor back to inventory
        this.addToInventory(itemKey, 1);

        // Clear the slot
        this.equippedArmor[slot] = null;

        return { success: true, message: `You unequip the ${item.name}.` };
    }

    getArmorForBodyPart(bodyPart) {
        // Map body parts to armor slots
        const bodyPartToArmorSlot = {
            'Right Eye': 'head_armor',
            'Left Eye': 'head_armor',
            'Head': 'head_armor',
            'Nose': 'head_armor',
            'Mouth': 'head_armor',
            'Right Arm': 'torso_armor',
            'Left Arm': 'torso_armor',
            'Torso': 'torso_armor',
            'Stomach': 'torso_armor',
            'Right Leg': 'leggings',
            'Left Leg': 'leggings'
        };

        const slot = bodyPartToArmorSlot[bodyPart];
        return slot ? this.equippedArmor[slot] : null;
    }

    damageArmor(bodyPart, damage) {
        const armor = this.getArmorForBodyPart(bodyPart);
        if (!armor || armor.currentDurability <= 0) {
            console.log(`[ARMOR DEBUG] No armor for ${bodyPart} or armor has 0 durability`);
            return { armorAbsorbed: 0, armorBroken: false, brokenArmorName: null };
        }

        console.log(`[ARMOR DEBUG] ${bodyPart} hit for ${damage} damage. Armor durability: ${armor.currentDurability}/${armor.maxDurability}`);

        // Armor absorbs the damage
        const absorbedDamage = Math.min(armor.currentDurability, damage);
        armor.currentDurability -= absorbedDamage;

        console.log(`[ARMOR DEBUG] Armor absorbed ${absorbedDamage} damage. New durability: ${armor.currentDurability}/${armor.maxDurability}`);

        // Check if armor broke
        const armorBroken = armor.currentDurability <= 0;
        let brokenArmorName = null;
        
        if (armorBroken) {
            // Remove broken armor - it's destroyed, not returned to inventory
            const slot = this.getArmorSlotForBodyPart(bodyPart);
            const itemKey = armor.itemKey;
            brokenArmorName = items[itemKey]?.name || itemKey;
            console.log(`[ARMOR DEBUG] Armor broke! Destroying ${brokenArmorName} in slot ${slot}`);
            this.equippedArmor[slot] = null;
            
            // Trigger UI updates
            if (window.uiManager) {
                window.uiManager.updateInventoryMenu();
            }
        }

        return { armorAbsorbed: absorbedDamage, armorBroken, brokenArmorName };
    }

    getArmorSlotForBodyPart(bodyPart) {
        const bodyPartToArmorSlot = {
            'Right Eye': 'head_armor',
            'Left Eye': 'head_armor',
            'Head': 'head_armor',
            'Nose': 'head_armor',
            'Mouth': 'head_armor',
            'Right Arm': 'torso_armor',
            'Left Arm': 'torso_armor',
            'Torso': 'torso_armor',
            'Stomach': 'torso_armor',
            'Right Leg': 'leggings',
            'Left Leg': 'leggings'
        };

        return bodyPartToArmorSlot[bodyPart];
    }

    // Debug method to get detailed armor status
    getDetailedArmorStatus() {
        const status = {};
        Object.entries(this.equippedArmor).forEach(([slot, armor]) => {
            if (armor) {
                const item = items[armor.itemKey];
                status[slot] = {
                    name: item?.name || armor.itemKey,
                    durability: armor.currentDurability,
                    maxDurability: armor.maxDurability,
                    percentage: Math.round((armor.currentDurability / armor.maxDurability) * 100)
                };
            } else {
                status[slot] = null;
            }
        });
        return status;
    }
}

// Export for use in other modules
window.GameState = GameState; 
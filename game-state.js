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

        // Weather system
        this.weather = {
            isRaining: false,
            intensity: 'none', // 'none', 'light', 'normal', 'heavy', 'storm'
            initialized: false
        };
        this.nextWeatherChangeTime = 60 + Math.floor(Math.random() * 60); // First change 1-2 hours after start

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
        this.checkWeatherChange(minutes);
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

    // Weather system methods
    initializeWeather() {
        if (this.weather.initialized) return;
        // 15% chance of rain at game start
        this.weather.isRaining = Math.random() < 0.15;
        if (this.weather.isRaining) {
            // Random intensity distribution
            const intensityRoll = Math.random();
            if (intensityRoll < 0.4) {
                this.weather.intensity = 'light';
            } else if (intensityRoll < 0.7) {
                this.weather.intensity = 'normal';
            } else if (intensityRoll < 0.9) {
                this.weather.intensity = 'heavy';
            } else {
                this.weather.intensity = 'storm';
            }
        } else {
            this.weather.intensity = 'none';
        }
        this.weather.initialized = true;
        // Set first weather change
        let minDur, maxDur;
        switch (this.weather.intensity) {
            case 'storm': minDur = 90; maxDur = 180; break;
            case 'heavy': minDur = 60; maxDur = 120; break;
            case 'normal': minDur = 40; maxDur = 90; break;
            case 'light': minDur = 30; maxDur = 60; break;
            default: minDur = 40; maxDur = 120; break; // clear
        }
        const currentMinutes = this.gameTime.getHours() * 60 + this.gameTime.getMinutes();
        this.nextWeatherChangeTime = currentMinutes + minDur + Math.floor(Math.random() * (maxDur - minDur + 1));
    }

    setWeather(isRaining, intensity = 'normal') {
        this.weather.isRaining = isRaining;
        this.weather.intensity = isRaining ? intensity : 'none';
        this.weather.initialized = true;
        // Reset next weather change timer based on new weather
        let minDur, maxDur;
        switch (this.weather.intensity) {
            case 'storm': minDur = 90; maxDur = 180; break;
            case 'heavy': minDur = 60; maxDur = 120; break;
            case 'normal': minDur = 40; maxDur = 90; break;
            case 'light': minDur = 30; maxDur = 60; break;
            default: minDur = 40; maxDur = 120; break; // clear
        }
        const currentMinutes = this.gameTime.getHours() * 60 + this.gameTime.getMinutes();
        this.nextWeatherChangeTime = currentMinutes + minDur + Math.floor(Math.random() * (maxDur - minDur + 1));
    }

    getWeatherStatus() {
        if (!this.weather.initialized) {
            this.initializeWeather();
        }
        return this.weather.isRaining ? 'raining' : 'clear';
    }

    getWeatherDescription() {
        if (!this.weather.initialized) {
            this.initializeWeather();
        }
        
        if (!this.weather.isRaining) {
            return "The skies are currently clear.";
        }
        
        const intensityDescriptions = {
            'light': "It's currently drizzling lightly.",
            'normal': "It's currently raining.",
            'heavy': "It's currently raining heavily.",
            'storm': "A storm is raging overhead!"
        };
        
        return intensityDescriptions[this.weather.intensity] || "It's currently raining.";
    }

    getRainIntensity() {
        if (!this.weather.initialized) {
            this.initializeWeather();
        }
        return this.weather.intensity;
    }

    // Call this after sleep as well, passing total minutes slept
    checkWeatherChange(minutesAdvanced) {
        // Convert current time to total minutes since midnight
        const currentMinutes = this.gameTime.getHours() * 60 + this.gameTime.getMinutes();
        let changes = 0;
        while (currentMinutes >= this.nextWeatherChangeTime) {
            this.rollWeather();
            changes++;
            // Set next change time based on new weather
            let minDur, maxDur;
            switch (this.weather.intensity) {
                case 'storm': minDur = 90; maxDur = 180; break;
                case 'heavy': minDur = 60; maxDur = 120; break;
                case 'normal': minDur = 40; maxDur = 90; break;
                case 'light': minDur = 30; maxDur = 60; break;
                default: minDur = 40; maxDur = 120; break; // clear
            }
            this.nextWeatherChangeTime += minDur + Math.floor(Math.random() * (maxDur - minDur + 1));
        }
        if (changes > 0 && window.uiManager) {
            window.uiManager.printToTerminal(this.getWeatherDescription());
            if (window.visualEffects) {
                if (this.weather.isRaining) {
                    window.visualEffects.startRainEffect(this.weather.intensity);
                } else {
                    window.visualEffects.stopRainEffect();
                }
            }
        }
    }

    rollWeather() {
        // Weighted transitions based on current weather
        const current = this.weather.intensity;
        let next;
        if (current === 'none') {
            // Clear: 80% stay clear, 10% light, 6% normal, 3% heavy, 1% storm
            const r = Math.random();
            if (r < 0.8) next = 'none';
            else if (r < 0.9) next = 'light';
            else if (r < 0.96) next = 'normal';
            else if (r < 0.99) next = 'heavy';
            else next = 'storm';
        } else if (current === 'light') {
            // Light: 60% clear, 20% light, 15% normal, 4% heavy, 1% storm
            const r = Math.random();
            if (r < 0.6) next = 'none';
            else if (r < 0.8) next = 'light';
            else if (r < 0.95) next = 'normal';
            else if (r < 0.99) next = 'heavy';
            else next = 'storm';
        } else if (current === 'normal') {
            // Normal: 40% clear, 20% light, 25% normal, 10% heavy, 5% storm
            const r = Math.random();
            if (r < 0.4) next = 'none';
            else if (r < 0.6) next = 'light';
            else if (r < 0.85) next = 'normal';
            else if (r < 0.95) next = 'heavy';
            else next = 'storm';
        } else if (current === 'heavy') {
            // Heavy: 30% clear, 10% light, 20% normal, 30% heavy, 10% storm
            const r = Math.random();
            if (r < 0.3) next = 'none';
            else if (r < 0.4) next = 'light';
            else if (r < 0.6) next = 'normal';
            else if (r < 0.9) next = 'heavy';
            else next = 'storm';
        } else if (current === 'storm') {
            // Storm: 10% clear, 10% light, 20% normal, 30% heavy, 30% storm
            const r = Math.random();
            if (r < 0.1) next = 'none';
            else if (r < 0.2) next = 'light';
            else if (r < 0.4) next = 'normal';
            else if (r < 0.7) next = 'heavy';
            else next = 'storm';
        }
        this.weather.isRaining = next !== 'none';
        this.weather.intensity = next;
        this.weather.initialized = true;
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
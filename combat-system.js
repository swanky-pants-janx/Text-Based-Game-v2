// Combat System - Handles all combat logic and enemy management
class CombatSystem {
    constructor(gameState, uiManager, visualEffects) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.visualEffects = visualEffects;
    }

    createEnemyInstance(type, index = 1) {
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

    findEnemyByArgument(argument) {
        const enemiesHere = world[this.gameState.playerLocation].enemies || [];
        const match = argument.match(/^([a-zA-Z_ ]+?)(?:\s*(\d+))?$/);
        let targetType = match ? match[1].trim().toLowerCase() : argument.toLowerCase();
        let targetIndex = match && match[2] ? parseInt(match[2], 10) - 1 : 0;
        
        const candidates = enemiesHere
            .map((enemy, i) => ({ enemy, i }))
            .filter(({ enemy }) => enemy.name.toLowerCase() === targetType || enemy.type === targetType);
        
        if (candidates.length === 0) return null;
        
        const { enemy, i } = candidates[targetIndex] || candidates[0];
        return { enemy, index: i, targetIndex: targetIndex + 1 };
    }

    calculatePlayerDamage() {
        if (this.gameState.equippedWeapon && items[this.gameState.equippedWeapon] && items[this.gameState.equippedWeapon].type === 'weapon') {
            const weaponAttack = items[this.gameState.equippedWeapon].effect?.attack || 1;
            
            // Handle weapon damage ranges
            if (weaponAttack && typeof weaponAttack === 'object' && weaponAttack.min !== undefined && weaponAttack.max !== undefined) {
                // New format: attack range
                return Math.floor(Math.random() * (weaponAttack.max - weaponAttack.min + 1)) + weaponAttack.min;
            } else if (typeof weaponAttack === 'number') {
                // Old format: single attack value
                return weaponAttack;
            } else {
                // Fallback
                return 1;
            }
        } else {
            return Math.floor(Math.random() * 2) + 1; // 1-2 for unarmed
        }
    }

    calculateEnemyDamage(enemy) {
        // Handle damage ranges for enemies
        if (enemy.attack && typeof enemy.attack === 'object' && enemy.attack.min !== undefined && enemy.attack.max !== undefined) {
            // New format: attack range
            return Math.floor(Math.random() * (enemy.attack.max - enemy.attack.min + 1)) + enemy.attack.min;
        } else if (typeof enemy.attack === 'number') {
            // Old format: single attack value
            return enemy.attack;
        } else {
            // Fallback
            return 1;
        }
    }

    attackEnemy(argument) {
        if (!argument) {
            return { success: false, message: 'Attack what?' };
        }

        const enemyData = this.findEnemyByArgument(argument);
        if (!enemyData) {
            return { success: false, message: `There is no '${argument}' here to attack.` };
        }

        const { enemy, index, targetIndex } = enemyData;
        
        // Player attacks enemy
        const playerDamage = this.calculatePlayerDamage();
        enemy.health -= playerDamage;
        
        let response = `You attack the ${enemy.name} (${targetIndex}) for ${playerDamage} damage.`;
        
        // Show attack effects
        this.visualEffects.showAttackShake(playerDamage);
        this.visualEffects.showDamageFx(playerDamage);
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
            response += `\nYou have defeated the ${enemy.name} (${targetIndex})!`;
            
            // Remove enemy from room
            world[this.gameState.playerLocation].enemies.splice(index, 1);
            
            // Award XP
            this.gameState.gainXP(25);
            this.uiManager.updateStatsMenu && this.uiManager.updateStatsMenu();
            // Handle enemy defeat effects
            if (enemy.onDefeat) {
                // Could add special effects here
            }
            
            return { success: true, message: response, enemyDefeated: true };
        }
        
        // Enemy attacks player
        const parts = Object.keys(this.gameState.playerStats.bodyParts);
        const part = parts[Math.floor(Math.random() * parts.length)];
        const enemyDamage = this.calculateEnemyDamage(enemy);
        
        // Check if armor can absorb the damage
        console.log(`[COMBAT DEBUG] Enemy attacks ${part} for ${enemyDamage} damage`);
        const armorResult = this.gameState.damageArmor(part, enemyDamage);
        const actualDamage = enemyDamage - armorResult.armorAbsorbed;
        
        console.log(`[COMBAT DEBUG] Armor absorbed: ${armorResult.armorAbsorbed}, Actual damage: ${actualDamage}, Armor broken: ${armorResult.armorBroken}`);
        
        // Show armor damage effects if armor absorbed damage
        if (armorResult.armorAbsorbed > 0) {
            this.visualEffects.showArmorDamageFx(armorResult.armorAbsorbed);
            this.visualEffects.showAttackShake(armorResult.armorAbsorbed);
        }
        
        // Apply remaining damage to body part
        this.gameState.playerStats.bodyParts[part].health = Math.max(0, this.gameState.playerStats.bodyParts[part].health - actualDamage);
        this.gameState.recalculatePlayerHealth();
        
        // Show player damage effects if damage was taken
        if (actualDamage > 0) {
            this.visualEffects.showPlayerDamageFx(actualDamage);
            this.visualEffects.showAttackShake(actualDamage);
        }
        
        // Build damage message
        let damageMessage = `The ${enemy.name} attacks your ${part} for ${enemyDamage} damage!`;
        if (armorResult.armorAbsorbed > 0) {
            damageMessage += ` Your armor absorbs ${armorResult.armorAbsorbed} damage.`;
            if (armorResult.armorBroken) {
                damageMessage += ` Your ${armorResult.brokenArmorName} breaks!`;
            }
        }
        if (actualDamage > 0) {
            damageMessage += ` You take ${actualDamage} damage.`;
        }
        
        response += `\n${damageMessage}`;
        
        this.uiManager.updateBodyPartsMenu();
        this.uiManager.updateStatusBars();
        this.uiManager.updateInventoryMenu();
        
        if (this.gameState.playerStats.health <= 0) {
            response += `\nYou have been defeated!`;
        }
        
        return { success: true, message: response, enemyDefeated: false };
    }

    damageRandomBodyPart(amount) {
        const parts = Object.keys(this.gameState.playerStats.bodyParts);
        const part = parts[Math.floor(Math.random() * parts.length)];
        
        // Check if armor can absorb the damage
        const armorResult = this.gameState.damageArmor(part, amount);
        const actualDamage = amount - armorResult.armorAbsorbed;
        
        // Show armor damage effects if armor absorbed damage
        if (armorResult.armorAbsorbed > 0) {
            this.visualEffects.showArmorDamageFx(armorResult.armorAbsorbed);
            this.visualEffects.showAttackShake(armorResult.armorAbsorbed);
        }
        
        // Apply remaining damage to body part
        this.gameState.playerStats.bodyParts[part].health = Math.max(0, this.gameState.playerStats.bodyParts[part].health - actualDamage);
        this.gameState.recalculatePlayerHealth();
        
        // Show player damage effects if damage was taken
        if (actualDamage > 0) {
            this.visualEffects.showPlayerDamageFx(actualDamage);
            this.visualEffects.showAttackShake(actualDamage);
        }
        
        this.uiManager.updateBodyPartsMenu();
        this.uiManager.updateStatusBars();
        this.uiManager.updateInventoryMenu();
        
        return { 
            part, 
            amount: actualDamage, 
            armorAbsorbed: armorResult.armorAbsorbed, 
            armorBroken: armorResult.armorBroken 
        };
    }

    maybeEnemiesAttackPlayer() {
        const enemiesHere = world[this.gameState.playerLocation].enemies || [];
        let messages = [];
        for (let i = 0; i < enemiesHere.length; i++) {
            const enemy = enemiesHere[i];
            if (enemy && Math.random() < 0.4) { // 40% chance to attack
                // Use the same logic as enemy retaliation
                const parts = Object.keys(this.gameState.playerStats.bodyParts);
                const part = parts[Math.floor(Math.random() * parts.length)];
                const enemyDamage = this.calculateEnemyDamage(enemy);
                const armorResult = this.gameState.damageArmor(part, enemyDamage);
                const actualDamage = enemyDamage - armorResult.armorAbsorbed;
                if (armorResult.armorAbsorbed > 0) {
                    this.visualEffects.showArmorDamageFx(armorResult.armorAbsorbed);
                    this.visualEffects.showAttackShake(armorResult.armorAbsorbed);
                }
                this.gameState.playerStats.bodyParts[part].health = Math.max(0, this.gameState.playerStats.bodyParts[part].health - actualDamage);
                this.gameState.recalculatePlayerHealth();
                if (actualDamage > 0) {
                    this.visualEffects.showPlayerDamageFx(actualDamage);
                    this.visualEffects.showAttackShake(actualDamage);
                }
                let damageMessage = `The ${enemy.name} attacks your ${part} for ${enemyDamage} damage!`;
                if (armorResult.armorAbsorbed > 0) {
                    damageMessage += ` Your armor absorbs ${armorResult.armorAbsorbed} damage.`;
                    if (armorResult.armorBroken) {
                        damageMessage += ` Your ${armorResult.brokenArmorName} breaks!`;
                    }
                }
                if (actualDamage > 0) {
                    damageMessage += ` You take ${actualDamage} damage.`;
                }
                messages.push(damageMessage);
            }
        }
        if (messages.length > 0) {
            this.uiManager.updateBodyPartsMenu();
            this.uiManager.updateStatusBars();
            this.uiManager.updateInventoryMenu();
            if (this.gameState.playerStats.health <= 0) {
                messages.push('You have been defeated!');
            }
        }
        return messages;
    }

    initializeEnemies() {
        // After world and enemies are loaded
        for (const roomKey in world) {
            const room = world[roomKey];
            if (Array.isArray(room.enemies)) {
                room.enemies = room.enemies.map((type, idx) => {
                    const enemyType = typeof type === 'string' ? type : type.type;
                    const enemy = this.createEnemyInstance(enemyType, idx + 1);
                    console.log(`Created enemy in ${roomKey}:`, enemy);
                    return enemy;
                }).filter(enemy => enemy !== null); // Remove any null enemies
            }
        }
    }

    reinitializeEnemiesAfterLoad() {
        // After loading a save, reinitialize any enemies that are still strings
        for (const roomKey in world) {
            const room = world[roomKey];
            if (Array.isArray(room.enemies)) {
                room.enemies = room.enemies.map((enemy, idx) => {
                    // If enemy is still a string, convert it to an object
                    if (typeof enemy === 'string') {
                        const enemyObj = this.createEnemyInstance(enemy, idx + 1);
                        console.log(`Reinitialized enemy in ${roomKey}:`, enemyObj);
                        return enemyObj;
                    }
                    // If enemy is already an object, keep it as is
                    return enemy;
                }).filter(enemy => enemy !== null);
            }
        }
    }
}

// Export for use in other modules
window.CombatSystem = CombatSystem; 
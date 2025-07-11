// Main Game Initialization - Coordinates all game systems
document.addEventListener('DOMContentLoaded', () => {
    // Text animation for the main page
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => observer.observe(el));

    // Initialize game systems
    const gameState = new GameState();
    const uiManager = new UIManager(gameState);
    const visualEffects = new VisualEffects(document.getElementById('terminal'));
    const mapRenderer = new MapRenderer(document.getElementById('map-canvas'), gameState);
    const inventorySystem = new InventorySystem(gameState, uiManager);
    const combatSystem = new CombatSystem(gameState, uiManager, visualEffects);
    const commandProcessor = new CommandProcessor(gameState, uiManager, inventorySystem, combatSystem, mapRenderer, visualEffects);

    // Initialize enemies
    combatSystem.initializeEnemies();

    // Set up input handling
    const terminalInput = document.getElementById('terminal-input');
    let lastCommand = '';
    if (terminalInput) {
        terminalInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && terminalInput.value) {
                lastCommand = terminalInput.value;
                const command = terminalInput.value.toLowerCase().trim().split(' ')[0];
                commandProcessor.processCommand(terminalInput.value);
                uiManager.updateStatusBars();
                
                // Check for death after updating stats
                const deathCheck = gameState.checkDeath();
                if (deathCheck.isDead) {
                    uiManager.setDeathState();
                    uiManager.printToTerminal(deathCheck.message);
                } else {
                    mapRenderer.drawMap();
                    terminalInput.value = '';
                    terminalInput.focus();
                }
            }
        });
        terminalInput.addEventListener('keydown', function(event) {
            if (event.key === 'ArrowUp') {
                if (lastCommand) {
                    terminalInput.value = lastCommand;
                    // Move cursor to end
                    setTimeout(() => {
                        terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
                    }, 0);
                    event.preventDefault();
                }
            }
        });
    }

    // Initialize weather system
    gameState.initializeWeather();
    
    // Start rain effect if it's raining
    if (gameState.weather.isRaining) {
        visualEffects.startRainEffect(gameState.getRainIntensity());
    }
    
    // Initialize game display
    uiManager.printToTerminal("Welcome to the Adventure Game! Type 'help' for commands.");
    uiManager.printToTerminal(world[gameState.playerLocation].description);
    // Print exits for the starting room
    const startExits = Object.keys(world[gameState.playerLocation].exits || {});
    if (startExits.length > 0) {
        uiManager.printToTerminal(`Exits: ${startExits.join(', ')}`);
    } else {
        uiManager.printToTerminal('There are no visible exits.');
    }
    // Show weather status at game start
    uiManager.printToTerminal(gameState.getWeatherDescription());
    
    mapRenderer.drawMap();
    uiManager.updateAllDisplays();
    uiManager.updateStatsMenu && uiManager.updateStatsMenu();

    // Set up save/load modal functionality
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const modal = document.getElementById('save-load-modal');
    const modalTitle = document.getElementById('modal-title');
    const saveSection = document.getElementById('save-section');
    const loadSection = document.getElementById('load-section');
    const saveCodeDisplay = document.getElementById('save-code-display');
    const loadCodeInput = document.getElementById('load-code-input');
    const loadConfirmBtn = document.getElementById('load-confirm-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    function showModal(title, showSave = false, showLoad = false) {
        modalTitle.textContent = title;
        saveSection.style.display = showSave ? 'block' : 'none';
        loadSection.style.display = showLoad ? 'block' : 'none';
        modal.style.display = 'block';
    }

    function hideModal() {
        modal.style.display = 'none';
        saveCodeDisplay.value = '';
        loadCodeInput.value = '';
    }

    saveBtn.addEventListener('click', () => {
        try {
            // Create a deep copy of the current world state, filtering out undefined values
            const cleanWorld = JSON.parse(JSON.stringify(window.world, (key, value) => {
                if (value === undefined) return null;
                return value;
            }));
            
            // Serialize game state manually since the method isn't working
            const serializedGameState = {
                playerLocation: gameState.playerLocation,
                visitedLocations: gameState.visitedLocations,
                gameTime: gameState.gameTime.getTime(),
                playerState: gameState.playerState,
                playerFacing: gameState.playerFacing,
                equippedWeapon: gameState.equippedWeapon,
                equippedArmor: gameState.equippedArmor,
                playerIsDead: gameState.playerIsDead,
                inventory: gameState.inventory,
                playerStats: gameState.playerStats,
                xp: gameState.xp,
                level: gameState.level,
                weather: gameState.weather
            };
            
            const saveData = {
                gameState: serializedGameState,
                world: cleanWorld
            };
            const code = btoa(unescape(encodeURIComponent(JSON.stringify(saveData))));
            saveCodeDisplay.value = code;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(code).then(() => {
                    showModal('Save Game', true, false);
                }, () => {
                    showModal('Save Game', true, false);
                });
            } else {
                showModal('Save Game', true, false);
            }
        } catch (e) {
            uiManager.printToTerminal('Failed to generate save code: ' + e.message);
            console.error('Save error details:', e);
        }
    });

    loadBtn.addEventListener('click', () => {
        showModal('Load Game', false, true);
    });

    loadConfirmBtn.addEventListener('click', () => {
        const code = loadCodeInput.value.trim();
        if (!code) {
            uiManager.printToTerminal('Please enter a save code.');
            return;
        }
        
        try {
            const decoded = decodeURIComponent(escape(atob(code)));
            const saveData = JSON.parse(decoded);
            console.log('Modal load - Loaded save data:', saveData);
            console.log('Modal load - Loaded world state:', saveData.world);
            
            // Restore game state manually since the method isn't working
            const data = saveData.gameState;
            gameState.playerLocation = data.playerLocation;
            gameState.visitedLocations = data.visitedLocations;
            gameState.gameTime = new Date(data.gameTime);
            gameState.playerState = data.playerState;
            gameState.playerFacing = data.playerFacing;
            gameState.equippedWeapon = data.equippedWeapon;
            gameState.equippedArmor = data.equippedArmor || { head_armor: null, torso_armor: null, leggings: null };
            gameState.playerIsDead = data.playerIsDead;
            gameState.inventory = data.inventory;
            gameState.playerStats = data.playerStats;
            gameState.xp = data.xp;
            gameState.level = data.level;
            gameState.weather = data.weather || { isRaining: false, initialized: false };
            window.world = saveData.world;
            console.log('Modal load - Restored world state:', window.world);
            console.log('Modal load - Current player location after load:', gameState.playerLocation);
            console.log('Modal load - Items in current room after load:', window.world[gameState.playerLocation].items);
            console.log('Modal load - Enemies in current room after load:', window.world[gameState.playerLocation].enemies);
            
            // Reinitialize enemies after loading
            combatSystem.reinitializeEnemiesAfterLoad();
            
            // Restore weather effects
            if (gameState.weather.isRaining) {
                visualEffects.startRainEffect(gameState.getRainIntensity());
            } else {
                visualEffects.stopRainEffect();
            }
            
            uiManager.printToTerminal('Game loaded successfully!');
            uiManager.updateAllDisplays && uiManager.updateAllDisplays();
            uiManager.updateStatsMenu && uiManager.updateStatsMenu();
            mapRenderer.drawMap();
            hideModal();
        } catch (e) {
            uiManager.printToTerminal('Invalid or corrupted save code: ' + e.message);
            console.error('Load error details:', e);
        }
    });

    closeModalBtn.addEventListener('click', hideModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
}); 
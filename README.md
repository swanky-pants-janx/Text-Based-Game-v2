# Text Adventure Game - Modular Architecture

This text adventure game has been refactored from a monolithic 1280-line script into a well-organized, modular architecture for better maintainability, readability, and extensibility.

## File Structure

### Core Game Files
- **`play.html`** - Main game interface
- **`style-new.css`** - Game styling
- **`world.js`** - World data and room definitions
- **`items.js`** - Item definitions and properties
- **`enemies.js`** - Enemy definitions and stats

### Modular JavaScript Architecture

#### 1. **`game-state.js`** - Game State Management
- Manages all player data (health, hunger, thirst, body parts)
- Handles player location and movement
- Manages inventory and equipped items
- Controls game time and death mechanics
- Provides utility methods for state changes

#### 2. **`ui-manager.js`** - User Interface Management
- Handles all UI updates and display logic
- Manages status bars, menus, and terminal output
- Controls inventory and body parts displays
- Handles death state UI changes
- Provides centralized UI update methods

#### 3. **`visual-effects.js`** - Visual Effects System
- Manages all visual feedback and animations
- Handles eating/drinking effects (crunch/glug)
- Controls damage number displays
- Manages terminal shake effects
- Handles sleep transition effects

#### 4. **`map-renderer.js`** - Map Rendering System
- Handles all canvas-based map drawing
- Manages viewport calculations and grid rendering
- Controls devtool features (coordinates, exits, reveal)
- Handles visited location highlighting
- Provides map update methods

#### 5. **`inventory-system.js`** - Inventory Management
- Handles all item-related operations
- Manages taking, dropping, and using items
- Controls equipment system
- Handles bulk operations (take all, drop all)
- Provides item search and validation

#### 6. **`combat-system.js`** - Combat Logic
- Manages all combat-related functionality
- Handles enemy creation and management
- Controls damage calculations
- Manages attack sequences
- Handles enemy defeat and removal

#### 7. **`command-processor.js`** - Command Processing
- Central hub for all user command processing
- Parses and routes commands to appropriate systems
- Handles command validation and error messages
- Coordinates between different game systems
- Provides clean command interface

#### 8. **`main.js`** - Game Initialization
- Coordinates all game systems
- Sets up event listeners
- Initializes game state
- Handles main game loop
- Minimal, focused on orchestration

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Each module has a single, well-defined responsibility
- Changes to one system don't affect others
- Clear boundaries between different game aspects

### 2. **Maintainability**
- Easy to find and modify specific functionality
- Reduced cognitive load when working on features
- Clear dependencies between modules

### 3. **Readability**
- Much easier to understand individual components
- Self-documenting code structure
- Logical organization of game features

### 4. **Extensibility**
- Easy to add new features without affecting existing code
- Clear interfaces between modules
- Modular design supports future enhancements

### 5. **Debugging**
- Issues can be isolated to specific modules
- Easier to test individual components
- Clear error boundaries

### 6. **Performance**
- Better code organization can lead to optimized loading
- Easier to implement lazy loading if needed
- Clearer memory management

## Module Dependencies

```
main.js
├── game-state.js
├── ui-manager.js (depends on game-state.js)
├── visual-effects.js
├── map-renderer.js (depends on game-state.js)
├── inventory-system.js (depends on game-state.js, ui-manager.js)
├── combat-system.js (depends on game-state.js, ui-manager.js, visual-effects.js)
└── command-processor.js (depends on all other modules)
```

## Usage

The game loads all modules in the correct order via script tags in `play.html`. The `main.js` file initializes all systems and coordinates their interactions.

## Migration from Monolithic Structure

The original `script.js` (1280 lines) has been completely replaced by this modular structure. All functionality has been preserved while dramatically improving code organization and maintainability.

## Future Enhancements

This modular structure makes it easy to add:
- New command types
- Additional visual effects
- More complex inventory systems
- Enhanced combat mechanics
- Save/load functionality
- Multiplayer features
- Plugin system for mods

TO RUN GAME:

Paste in terminal:
  python3 -m http.server 8000

Then in browser, post: http://localhost:8000/play.html# Text-Based-Game-v.2
# Text-Based-Game-v2

# Text-Based Adventure Game v. 0.0.1

A challenging text-based survival adventure game where you explore a mysterious world, manage your resources, and fight for survival against dangerous enemies.

## 🎮 Game Overview

You wake up in an unknown location with no memory of how you got there. Your body is in poor condition, and you're hungry and thirsty. You must explore the world around you, find resources, manage your health, and survive against various threats.

## 🎯 Core Gameplay Mechanics

### **Survival Management**
- **Health System**: Your body has multiple parts (head, torso, arms, legs) each with their own health
- **Hunger & Thirst**: Must eat and drink regularly to survive
- **Body Part Damage**: Different body parts can be injured, affecting your abilities
- **Death**: When any body part reaches 0 health, you die

### **Weather & Rain System**
- **Dynamic Weather**: The world can have clear skies or rain, with a chance of rain at the start of each game
- **Rain Intensities**: Rain can be light, normal, heavy, or a storm, each with unique visual and gameplay effects
- **Visual Rain Effects**: Animated rain droplets fall in the terminal, with color and speed based on intensity
- **Terminal Rumble**: The terminal shakes continuously during rain, with intensity matching the rain (gentle for normal, strong for heavy, intense for storms)
- **Weather Commands**: Use `look up` to check the sky, and `devtool weather [clear|light|normal|heavy|storm]` to set the weather

### **Combat System**
- **Turn-based Combat**: Strategic battles against various enemies
- **Weapon System**: Find and equip weapons for different damage types
- **Armor System**: Equip armor pieces that absorb damage and protect your body parts
- **Armor Durability**: Armor takes damage and breaks when durability reaches zero
- **Visual Combat Feedback**: Floating damage numbers and screen effects during combat

### **Inventory & Equipment**
- **Item Management**: Pick up, drop, and manage various items
- **Equipment Slots**: Equip weapons and armor pieces
- **Bulk Operations**: Take all items from rooms or drop multiple items at once
- **Item Durability**: Equipment wears out with use

### **Exploration**
- **Grid-based World**: Navigate through a procedurally generated world
- **Room Discovery**: Explore new areas and find resources
- **Map System**: Visual representation of discovered areas
- **Movement**: Use cardinal directions (north, south, east, west) to move

## 🛠️ Available Commands

### **Movement**
- `north`, `south`, `east`, `west` - Move in that direction
- `look` - Examine your current location
- `look up` - Check the sky and current weather

### **Inventory & Items**
- `take [item]` - Pick up a specific item
- `take all` - Pick up all items in the room
- `drop [item]` - Drop a specific item
- `drop all` - Drop all items
- `inventory` - View your inventory and equipped items
- `equip [weapon]` - Equip a weapon
- `equip armor [armor piece]` - Equip armor
- `unequip [item]` - Remove equipped item

### **Survival**
- `eat [food]` - Consume food to reduce hunger
- `drink [liquid]` - Drink to reduce thirst
- `sleep` - Rest to recover health (if safe)

### **Combat**
- `attack [enemy]` - Attack a specific enemy
- `attack all` - Attack all enemies in the room

### **Information**
- `status` - Check your health, hunger, and thirst
- `help` - Show available commands

## 🆕 Recent Features

### **Weather & Rain Effects**
- **Dynamic Weather**: The game world can now have clear skies or rain, with a random chance of rain at the start of each game
- **Rain Intensities**: Rain can be light, normal, heavy, or a storm, each with unique droplet color, speed, and terminal rumble
- **Continuous Terminal Rumble**: The terminal shakes continuously during rain, with intensity matching the rain
- **Weather Commands**: Use `look up` to check the sky, and `devtool weather [clear|light|normal|heavy|storm]` to set the weather instantly

### **Enhanced Armor System**
- **Damage Absorption**: Armor absorbs incoming damage before it reaches your body
- **Durability System**: Armor pieces have durability that decreases with damage
- **Breakage Mechanics**: When armor durability reaches zero, it breaks and must be unequipped
- **Visual Feedback**: Special effects when armor takes damage or breaks
- **Strategic Depth**: Choose when to use armor vs. when to preserve it

### **Improved Combat Visuals**
- **Floating Damage Numbers**: Color-coded damage numbers appear during combat
  - Red numbers (right side): Enemy damage
  - Orange numbers (left side): Player damage  
  - Light blue numbers (center): Armor damage
- **Screen Effects**: Visual feedback when taking damage
- **Spatial Separation**: Damage numbers are positioned to avoid overlap

### **Developer Tools**
- **Devtool Mode**: Access advanced debugging features
- **Map Overlay**: Red dots show enemy locations on the map
- **Armor Testing**: Special commands to test armor mechanics
- **Status Monitoring**: Detailed information about game state

## 🎨 Technical Architecture

The game uses a modular JavaScript architecture for maintainability and extensibility:

### **Core Systems**
- **Game State Management** (`game-state.js`) - Player data, location, inventory, weather
- **UI Management** (`ui-manager.js`) - Interface updates and displays
- **Visual Effects** (`visual-effects.js`) - Combat animations, rain, and feedback
- **Map Rendering** (`map-renderer.js`) - World visualization
- **Inventory System** (`inventory-system.js`) - Item management
- **Combat System** (`combat-system.js`) - Battle mechanics
- **Command Processor** (`command-processor.js`) - Input handling

### **Benefits**
- **Modular Design**: Easy to add new features
- **Maintainable Code**: Clear separation of concerns
- **Extensible**: Simple to implement new mechanics
- **Debug-Friendly**: Isolated systems for easier troubleshooting

## 🚀 How to Play

1. **Start the Game**: Open `index.html` in a web browser
2. **Learn the Basics**: Type `help` to see available commands
3. **Explore**: Use movement commands to discover the world
4. **Survive**: Manage your health, hunger, and thirst
5. **Fight**: Equip weapons and armor to defend yourself
6. **Progress**: Find better equipment and explore deeper areas

## 🎯 Game Tips

- **Always check your status** - Monitor health, hunger, and thirst regularly
- **Manage your inventory** - Don't carry unnecessary items
- **Use armor strategically** - Save it for tough battles
- **Explore thoroughly** - Check every room for resources
- **Plan your fights** - Some enemies are tougher than others
- **Rest when safe** - Sleep to recover health between adventures
- **Check the weather** - Rain can affect the atmosphere and immersion!

## 🔧 Running the Game

### Local Development
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000/index.html` in your browser.

### Direct File
Simply open `index.html` in any modern web browser.

---

*Version 0.0.1 - A challenging survival adventure awaits! Weather the storm!*

## Changelog

### v.0.0.2
- [x] Add so that rain/weather can happen randomly/can sleep it away
- [x] Fixed location naming
- [x] “Look up” command bug fix
- [x] Added armour repair tool
- [x] Removed XP from stats menu
- [x] Fixed equipped armour not showing in correct category in inventory menu
- [x] Enemy can randomly attack you now when you enter a room
- [x] Multiple enemies can be in a room

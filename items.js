// Items database for the game
const items = {
    // Food items
    bread: {
        name: 'Bread',
        type: 'food',
        description: 'A stale loaf of bread. It looks a few days old but still edible.',
        effect: { hunger: 20 }
    },
    apple: {
        name: 'Apple',
        type: 'food',
        description: 'A bright red apple. It looks fresh and juicy.',
        effect: { hunger: 10 }
    },
    banana: {
        name: 'Banana',
        type: 'food',
        description: 'A yellow banana. It has some brown spots but is still good to eat.',
        effect: { hunger: 15 }
    },
    cheese: {
        name: 'Cheese',
        type: 'food',
        description: 'A wedge of aged cheese. It has a strong, pungent aroma.',
        effect: { hunger: 25 }
    },
    meat: {
        name: 'Dried Meat',
        type: 'food',
        description: 'Strips of dried meat. Tough but nutritious and long-lasting.',
        effect: { hunger: 35 }
    },
    berries: {
        name: 'Wild Berries',
        type: 'food',
        description: 'A handful of small, dark berries. They look safe to eat.',
        effect: { hunger: 8 }
    },
    mushroom: {
        name: 'Mushroom',
        type: 'food',
        description: 'A large, brown mushroom. It appears to be edible.',
        effect: { hunger: 12 }
    },
    
    // Drink items
    flask_of_water: {
        name: 'Flask of Water',
        type: 'drink',
        description: 'A leather flask filled with clear, fresh water.',
        effect: { thirst: 30 }
    },
    ale: {
        name: 'Ale',
        type: 'drink',
        description: 'A mug of dark ale. It has a rich, malty flavor.',
        effect: { thirst: 25 }
    },
    milk: {
        name: 'Milk',
        type: 'drink',
        description: 'A bottle of fresh milk. It looks creamy and wholesome.',
        effect: { thirst: 20 }
    },
    tea: {
        name: 'Herbal Tea',
        type: 'drink',
        description: 'A warm cup of herbal tea. It has a soothing, aromatic scent.',
        effect: { thirst: 15 }
    },
    
    // Potions
    health_potion: {
        name: 'Health Potion',
        type: 'potion',
        description: 'A red potion that glows faintly. It radiates healing energy.',
        effect: { health: 40 }
    },
    mana_potion: {
        name: 'Mana Potion',
        type: 'potion',
        description: 'A blue potion that sparkles with magical energy.',
        effect: { mana: 40 }
    },
    healing_elixir: {
        name: 'Healing Elixir',
        type: 'potion',
        description: 'A golden elixir that pulses with powerful healing magic.',
        effect: { health: 60 }
    },
    
    // Weapons
    rusted_dagger: {
        name: 'Rusted Dagger',
        type: 'weapon',
        description: 'A small dagger with a rusty blade. It\'s seen better days but still sharp enough to use.',
        effect: { 
            attack: {
                min: 2,
                max: 5
            }
        }
    },
    iron_sword: {
        name: 'Iron Sword',
        type: 'weapon',
        description: 'A well-crafted iron sword with a leather-wrapped hilt. It feels balanced and deadly.',
        effect: { 
            attack: {
                min: 6,
                max: 10
            }
        }
    },
    wooden_staff: {
        name: 'Wooden Staff',
        type: 'weapon',
        description: 'A sturdy wooden staff, about as tall as you are. It\'s smooth and well-worn.',
        effect: { 
            attack: {
                min: 4,
                max: 7
            }
        }
    },
    stone_axe: {
        name: 'Stone Axe',
        type: 'weapon',
        description: 'A heavy stone axe with a sharp blade. It\'s crude but effective.',
        effect: { 
            attack: {
                min: 8,
                max: 12
            }
        }
    },
    hunting_bow: {
        name: 'Hunting Bow',
        type: 'weapon',
        description: 'A finely crafted wooden bow with a taut string. It\'s designed for accuracy.',
        effect: { 
            attack: {
                min: 5,
                max: 9
            }
        }
    },
    
    // Armor items - Head Armor
    cloth_cap: {
        name: 'Cloth Cap',
        type: 'armor',
        slot: 'head_armor',
        description: 'A simple cloth cap that provides minimal protection.',
        quality: 'poor',
        maxDurability: 20,
        currentDurability: 20
    },
    leather_helmet: {
        name: 'Leather Helmet',
        type: 'armor',
        slot: 'head_armor',
        description: 'A sturdy leather helmet that offers decent head protection.',
        quality: 'average',
        maxDurability: 40,
        currentDurability: 40
    },
    iron_helmet: {
        name: 'Iron Helmet',
        type: 'armor',
        slot: 'head_armor',
        description: 'A solid iron helmet that provides excellent head protection.',
        quality: 'good',
        maxDurability: 60,
        currentDurability: 60
    },
    
    // Armor items - Torso Armor
    cloth_shirt: {
        name: 'Cloth Shirt',
        type: 'armor',
        slot: 'torso_armor',
        description: 'A simple cloth shirt that offers minimal protection.',
        quality: 'poor',
        maxDurability: 25,
        currentDurability: 25
    },
    leather_vest: {
        name: 'Leather Vest',
        type: 'armor',
        slot: 'torso_armor',
        description: 'A durable leather vest that provides decent torso protection.',
        quality: 'average',
        maxDurability: 50,
        currentDurability: 50
    },
    iron_breastplate: {
        name: 'Iron Breastplate',
        type: 'armor',
        slot: 'torso_armor',
        description: 'A heavy iron breastplate that offers excellent torso protection.',
        quality: 'good',
        maxDurability: 75,
        currentDurability: 75
    },
    
    // Armor items - Leggings
    cloth_pants: {
        name: 'Cloth Pants',
        type: 'armor',
        slot: 'leggings',
        description: 'Simple cloth pants that provide minimal leg protection.',
        quality: 'poor',
        maxDurability: 20,
        currentDurability: 20
    },
    leather_greaves: {
        name: 'Leather Greaves',
        type: 'armor',
        slot: 'leggings',
        description: 'Sturdy leather greaves that offer decent leg protection.',
        quality: 'average',
        maxDurability: 40,
        currentDurability: 40
    },
    iron_greaves: {
        name: 'Iron Greaves',
        type: 'armor',
        slot: 'leggings',
        description: 'Heavy iron greaves that provide excellent leg protection.',
        quality: 'good',
        maxDurability: 60,
        currentDurability: 60
    }
}; 

// World Objects (static, non-pickup, non-movable, but can be looked at)
const worldObjects = {
    signpost: {
        key: 'signpost',
        name: 'Signpost',
        description: 'A weathered wooden signpost. The writing is faded.',
        type: 'worldobject'
    },
    statue: {
        key: 'statue',
        name: 'Statue',
        description: 'A stone statue of a forgotten hero. Moss covers its base.',
        type: 'worldobject'
    },
    painting: {
        key: 'painting',
        name: 'Painting',
        description: 'A dusty painting in a gilded frame. The subject is unrecognizable.',
        type: 'worldobject'
    }
}; 
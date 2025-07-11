// --- Random World Generation with Original Keys and Exits ---

const roomTemplates = [
    {
        key: 'start',
        name: 'Forest Clearing',
        description: 'You are in a small clearing surrounded by tall, ancient trees. Sunlight barely pierces the canopy above.',
        objects: ['old lamp'],
    },
    {
        key: 'upper road',
        name: 'Overgrown Path',
        description: 'You are on an overgrown path. The wind rustles through the leaves.',
        objects: ['signpost'],
    },
    {
        key: 'hallway',
        name: 'Narrow Ravine',
        description: 'You are in a narrow ravine, its walls covered in moss and ferns.',
        objects: ['painting'],
    },
    {
        key: 'kitchen',
        name: 'Crumbling Campsite',
        description: 'You find the remains of an old campsite. Ashes and broken utensils are scattered about.',
        objects: ['table', 'cabinet'],
    },
    {
        key: 'dark_forest',
        name: 'Dark Forest',
        description: 'You are in a dark forest. Shadows dance around you.',
        objects: ['strange tree'],
    },
    {
        key: 'forest',
        name: 'Forest',
        description: 'You are in a forest, it is quite smelly. You do not know where you are.',
        objects: ['bushes'],
    },
    {
        key: 'dark_forest_2',
        name: 'Dark Forest 2',
        description: 'The forest grows even darker here.',
        objects: ['fallen log'],
    },
    {
        key: 'dark_forest_3',
        name: 'Dark Forest 3',
        description: 'You can barely see your hands in front of you.',
        objects: ['owl'],
    },
    {
        key: 'dark_forest_4',
        name: 'Dark Forest 4',
        description: 'It is almost pitch black. You feel uneasy.',
        objects: ['glowing eyes'],
    },
    // New rooms for a larger map
    {
        key: 'abandoned_shack',
        name: 'Abandoned Shack',
        description: 'A rickety shack stands alone, its door creaking in the wind.',
        objects: ['broken chair'],
    },
    {
        key: 'riverbank',
        name: 'Riverbank',
        description: 'You stand by a slow-moving river. The water is murky.',
        objects: ['smooth stone'],
    },
    {
        key: 'meadow',
        name: 'Meadow',
        description: 'A peaceful meadow with wildflowers and buzzing insects.',
        objects: ['wildflowers'],
    },
    {
        key: 'graveyard',
        name: 'Graveyard',
        description: 'Old gravestones jut from the earth. It feels cold here.',
        objects: ['gravestone'],
    },
    {
        key: 'ruined_tower',
        name: 'Ruined Tower',
        description: 'A crumbling tower looms above, its stones covered in moss.',
        objects: ['loose stone'],
    },
    {
        key: 'market_square',
        name: 'Market Square',
        description: 'Empty stalls line the square. The air smells faintly of spices.',
        objects: ['empty stall'],
    },
    {
        key: 'old_bridge',
        name: 'Old Bridge',
        description: 'A wooden bridge crosses a narrow ravine. Some planks are missing.',
        objects: ['broken plank'],
    },
    {
        key: 'mysterious_cave',
        name: 'Mysterious Cave',
        description: 'The cave mouth yawns before you, darkness within.',
        objects: ['stalagmite'],
    },
    {
        key: 'orchard',
        name: 'Orchard',
        description: 'Rows of old fruit trees. Some apples lie on the ground.',
        objects: ['apple tree'],
    },
    {
        key: 'watchtower',
        name: 'Watchtower',
        description: 'A tall watchtower overlooks the area. The stairs are broken.',
        objects: ['rusty bell'],
    },
    {
        key: 'overgrown_garden',
        name: 'Overgrown Garden',
        description: 'Weeds and vines choke what was once a beautiful garden.',
        objects: ['stone bench'],
    },
    {
        key: 'ancient_library',
        name: 'Ancient Library',
        description: 'Dusty shelves and scattered books fill this forgotten place.',
        objects: ['old book'],
    },
    {
        key: 'collapsed_mine',
        name: 'Collapsed Mine',
        description: 'Timbers have given way, blocking most of the tunnels.',
        objects: ['rusty pickaxe'],
    },
    {
        key: 'sunken_path',
        name: 'Sunken Path',
        description: 'A path dips below the surrounding land, muddy and slick.',
        objects: ['muddy boots'],
    },
    {
        key: 'stone_circle',
        name: 'Stone Circle',
        description: 'Ancient stones stand in a ring, their purpose lost to time.',
        objects: ['carved stone'],
    },
];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function randomFromArray(arr, n) {
    const copy = arr.slice();
    shuffle(copy);
    return copy.slice(0, n);
}

const allItemKeys = Object.keys(items);
const foodKeys = allItemKeys.filter(k => items[k].type === 'food');
const drinkKeys = allItemKeys.filter(k => items[k].type === 'drink');
const weaponKeys = allItemKeys.filter(k => items[k].type === 'weapon');
const armorKeys = allItemKeys.filter(k => items[k].type === 'armor');
const otherKeys = allItemKeys.filter(k => items[k].type === 'other');
const enemyKeys = Object.keys(enemies);
const worldObjectKeys = Object.keys(worldObjects);

// Debug: Check if armor keys are found
console.log('Available armor keys:', armorKeys);
console.log('Total armor items found:', armorKeys.length);

function generateWorld() {
    // Always place start at 5:5
    const startCoords = { x: 5, y: 5 };
    const usedCoords = new Set([`5,5`]);
    const world = {};
    // Place start room
    world['start'] = {
        ...roomTemplates[0],
        id: 'start',
        coords: { ...startCoords },
        exits: {},
        items: randomFromArray(foodKeys, Math.floor(Math.random()*2)).concat(
            randomFromArray(drinkKeys, Math.floor(Math.random()*2)),
            randomFromArray(weaponKeys, Math.floor(Math.random()*2)),
            randomFromArray(armorKeys, Math.floor(Math.random()*2)),
            randomFromArray(otherKeys, Math.floor(Math.random()*2)),
            randomFromArray(worldObjectKeys, Math.floor(Math.random()*2))
        ),
        enemies: [], // No enemies in the starting room
        locked: false,
        visited: false,
        onEnter: null
    };
    // Shuffle and place other rooms adjacent to already placed rooms
    const directions = [
        { dx: 0, dy: -1, dir: 'north', opp: 'south' },
        { dx: 0, dy: 1, dir: 'south', opp: 'north' },
        { dx: -1, dy: 0, dir: 'west', opp: 'east' },
        { dx: 1, dy: 0, dir: 'east', opp: 'west' }
    ];
    let placed = [{ key: 'start', coords: { ...startCoords } }];
    let roomQueue = shuffle(roomTemplates.slice(1));
    let roomNum = 1;
    const keyToCoords = { 'start': { ...startCoords } };
    while (roomQueue.length > 0) {
        // Pick a random placed room to attach to
        const attachTo = placed[Math.floor(Math.random() * placed.length)];
        // Find a free adjacent spot
        let freeDirs = directions.filter(d => {
            const nx = attachTo.coords.x + d.dx;
            const ny = attachTo.coords.y + d.dy;
            return !usedCoords.has(`${nx},${ny}`);
        });
        if (freeDirs.length === 0) continue;
        const dir = freeDirs[Math.floor(Math.random() * freeDirs.length)];
        const nx = attachTo.coords.x + dir.dx;
        const ny = attachTo.coords.y + dir.dy;
        const template = roomQueue.pop();
        const key = template.key;
        world[key] = {
            ...template,
            id: key,
            coords: { x: nx, y: ny },
            exits: {},
            items: randomFromArray(foodKeys, Math.floor(Math.random()*2)).concat(
                randomFromArray(drinkKeys, Math.floor(Math.random()*2)),
                randomFromArray(weaponKeys, Math.floor(Math.random()*2)),
                randomFromArray(armorKeys, Math.floor(Math.random()*2)),
                randomFromArray(otherKeys, Math.floor(Math.random()*2)),
                randomFromArray(worldObjectKeys, Math.floor(Math.random()*2))
            ),
            enemies: Math.random() < 0.5 ? randomFromArray(enemyKeys, Math.floor(Math.random()*5) + 1) : [],
            locked: false,
            visited: false,
            onEnter: null
        };
        usedCoords.add(`${nx},${ny}`);
        keyToCoords[key] = { x: nx, y: ny };
        // Connect exits using original keys
        world[attachTo.key].exits = world[attachTo.key].exits || {};
        world[key].exits = world[key].exits || {};
        world[attachTo.key].exits[dir.dir] = key;
        world[key].exits[dir.opp] = attachTo.key;
        placed.push({ key, coords: { x: nx, y: ny } });
        roomNum++;
    }
    return world;
}

const world = generateWorld();

// Expose world globally for save/load system
window.world = world;

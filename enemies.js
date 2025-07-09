// Enemies database for the game
const enemies = {
    slime: {
        id: 'slime',
        name: 'Slime',
        description: 'A wobbly green slime. It looks weak but sticky.',
        health: 20,
        maxHealth: 20,
        attack: {
            min: 3,
            max: 6
        },
        defense: 0,
        drops: [], // items dropped on defeat
        onDefeat: null // event or function
    },
    goblin: {
        id: 'goblin',
        name: 'Goblin',
        description: 'A sneaky goblin with sharp teeth and a crude dagger.',
        health: 25,
        maxHealth: 25,
        attack: { min: 4, max: 8 },
        defense: 1,
        drops: ['rusted_dagger'],
        onDefeat: null
    },
    wolf: {
        id: 'wolf',
        name: 'Wolf',
        description: 'A wild wolf with hungry eyes and sharp fangs.',
        health: 30,
        maxHealth: 30,
        attack: { min: 6, max: 10 },
        defense: 2,
        drops: ['meat'],
        onDefeat: null
    },
    skeleton: {
        id: 'skeleton',
        name: 'Skeleton',
        description: 'A rattling skeleton wielding a broken sword.',
        health: 28,
        maxHealth: 28,
        attack: { min: 5, max: 9 },
        defense: 3,
        drops: ['bone'],
        onDefeat: null
    },
    orc: {
        id: 'orc',
        name: 'Orc',
        description: 'A hulking orc with a massive club.',
        health: 40,
        maxHealth: 40,
        attack: { min: 8, max: 14 },
        defense: 4,
        drops: ['iron_sword'],
        onDefeat: null
    },
    shadow: {
        id: 'shadow',
        name: 'Shadow',
        description: 'A mysterious shadow that moves unnaturally.',
        health: 18,
        maxHealth: 18,
        attack: { min: 9, max: 13 },
        defense: 0,
        drops: [],
        onDefeat: null
    }
}; 
/**
 * The Sevii Islands from FireRed/LeafGreen. Wild encounters come from the games' data; the
 * "trials" follow the islands' post-game story (Team Rocket and the Ruby & Sapphire quest),
 * ending at the Trainer Tower on Seven Island.
 */
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { trial } from "./trainers";
import type { ZoneDefinition } from "./zones";

function zone(options: Omit<ZoneDefinition, "region">): ZoneDefinition {
    return { region: "sevii", ...options };
}

export const SEVII_ZONES: ZoneDefinition[] = [
    zone({
        id: "kindleRoad",
        name: "Kindle Road",
        badgesRequired: 0,
        blurb: "One Island's hot-spring trail up to Mt. Ember."
    }),
    zone({
        id: "treasureBeach",
        name: "Treasure Beach",
        badgesRequired: 0,
        blurb: "A beach where shiny things wash ashore."
    }),
    zone({
        id: "mtEmber",
        name: "Mt. Ember",
        badgesRequired: 0,
        blurb: "An active volcano. Team Rocket is digging for something inside."
    }),
    zone({
        id: "capeBrink",
        name: "Cape Brink",
        badgesRequired: 1,
        blurb: "Two Island's northern cape, home of a Move Tutor."
    }),
    zone({
        id: "bondBridge",
        name: "Bond Bridge",
        badgesRequired: 1,
        blurb: "A long bridge joining Three Island to the forest."
    }),
    zone({
        id: "threeIslePort",
        name: "Three Isle Port",
        badgesRequired: 1,
        blurb: "A rocky port where Dunsparce burrow."
    }),
    zone({
        id: "berryForest",
        name: "Berry Forest",
        badgesRequired: 1,
        blurb: "Little Lostelle went berry picking here and never came back."
    }),
    zone({
        id: "fourIsland",
        name: "Four Island",
        badgesRequired: 2,
        blurb: "Lorelei's home island and its seaside Day Care."
    }),
    zone({
        id: "icefallCave",
        name: "Icefall Cave",
        badgesRequired: 2,
        blurb: "A frozen cave where Team Rocket traps Lapras."
    }),
    zone({
        id: "resortGorgeous",
        name: "Resort Gorgeous",
        badgesRequired: 3,
        blurb: "A luxury resort with a demanding Selphy."
    }),
    zone({
        id: "waterLabyrinth",
        name: "Water Labyrinth",
        badgesRequired: 3,
        blurb: "A maze of channels near the Pokémon Day Care's egg keeper."
    }),
    zone({
        id: "memorialPillar",
        name: "Memorial Pillar",
        badgesRequired: 3,
        blurb: "A quiet grave marker for a beloved Onix."
    }),
    zone({
        id: "lostCave",
        name: "Lost Cave",
        badgesRequired: 3,
        blurb: "A cave so twisting that a woman got lost inside."
    }),
    zone({
        id: "waterPath",
        name: "Water Path",
        badgesRequired: 4,
        blurb: "Six Island's winding path to Ruin Valley."
    }),
    zone({
        id: "ruinValley",
        name: "Ruin Valley",
        badgesRequired: 4,
        blurb: "The valley hiding the Dotted Hole — and the Sapphire."
    }),
    zone({
        id: "greenPath",
        name: "Green Path",
        badgesRequired: 4,
        blurb: "A short trail to the Pattern Bush."
    }),
    zone({
        id: "patternBush",
        name: "Pattern Bush",
        badgesRequired: 4,
        blurb: "Strange patterns in the grass draw in Bug Pokémon."
    }),
    zone({
        id: "outcastIsland",
        name: "Outcast Island",
        badgesRequired: 4,
        blurb: "A remote island once used as a Rocket hideout."
    }),
    zone({
        id: "alteringCave",
        name: "Altering Cave",
        badgesRequired: 4,
        blurb: "Its Pokémon change with the signals from the Network Machine."
    }),
    zone({
        id: "canyonEntrance",
        name: "Canyon Entrance",
        badgesRequired: 5,
        blurb: "The gateway to Seven Island's Sevault Canyon."
    }),
    zone({
        id: "sevaultCanyon",
        name: "Sevault Canyon",
        badgesRequired: 5,
        blurb: "Towering cliffs where Skarmory nest."
    }),
    zone({
        id: "tanobyRuins",
        name: "Tanoby Ruins",
        badgesRequired: 5,
        blurb: "Seven ancient chambers covered in strange markings."
    })
];

export const SEVII_TRIALS: GymDefinition[] = [
    trial({
        id: "emberRockets",
        name: "Rocket Grunts",
        title: "Team Rocket, Mt. Ember",
        town: "One Island",
        badge: "Ruby",
        badgeNumber: 1,
        specialty: "poison",
        statMultiplier: 1.3,
        team: [
            { id: 20, level: 34 },
            { id: 109, level: 35 },
            { id: 24, level: 36 }
        ],
        keyItems: [],
        rewardText: "You recover the Ruby. Celio's ferry now reaches Two and Three Islands.",
        quote: "We found the Ruby first! Beat it, kid!"
    }),
    trial({
        id: "lostelleHypno",
        name: "Hypno",
        title: "Berry Forest",
        town: "Three Island",
        badge: "Lostelle's Thanks",
        badgeNumber: 2,
        specialty: "psychic",
        statMultiplier: 1.6,
        team: [{ id: 97, level: 40 }],
        keyItems: [],
        rewardText: "Lostelle is safe. The ferry's route opens to Four Island.",
        quote: "Hypno swings its pendulum. Lostelle is fast asleep behind it."
    }),
    trial({
        id: "icefallRockets",
        name: "Rocket Admins",
        title: "Team Rocket, Icefall Cave",
        town: "Four Island",
        badge: "Lorelei's Trust",
        badgeNumber: 3,
        specialty: "poison",
        statMultiplier: 1.7,
        team: [
            { id: 42, level: 42 },
            { id: 89, level: 43 },
            { id: 229, level: 44 }
        ],
        keyItems: [],
        rewardText: "With Lorelei's help the Lapras go free. Five Island awaits.",
        quote: "These Lapras will fetch a fortune! Out of our way!"
    }),
    trial({
        id: "warehouseRockets",
        name: "Rocket Warehouse",
        title: "Team Rocket, Five Island",
        town: "Five Island",
        badge: "Warehouse Key",
        badgeNumber: 4,
        specialty: "poison",
        statMultiplier: 1.9,
        team: [
            { id: 89, level: 46 },
            { id: 24, level: 47 },
            { id: 110, level: 48 },
            { id: 229, level: 48 }
        ],
        keyItems: [],
        rewardText: "Team Rocket's Sevii operation collapses. Six Island is open.",
        quote: "Our plans for the Network Machine won't be stopped by a child."
    }),
    trial({
        id: "gideon",
        name: "Gideon",
        title: "Dotted Hole Thief",
        town: "Six Island",
        badge: "Sapphire",
        badgeNumber: 5,
        specialty: "electric",
        statMultiplier: 2.1,
        team: [
            { id: 101, level: 50 },
            { id: 82, level: 50 },
            { id: 233, level: 52 }
        ],
        keyItems: [],
        rewardText:
            "You return the Sapphire to Celio. The Network Machine links Kanto and Hoenn, and Seven Island opens.",
        quote: "The Sapphire's secrets are worth more than your little adventure."
    })
];

export function seviiFinale(): TrainerDefinition[] {
    const floors: [string, string, { id: number; level: number }[]][] = [
        [
            "Ace Trainer Keaton",
            "Trainer Tower, Floor 1",
            [
                { id: 214, level: 54 },
                { id: 227, level: 54 },
                { id: 181, level: 55 }
            ]
        ],
        [
            "Ace Trainer Jada",
            "Trainer Tower, Floor 2",
            [
                { id: 229, level: 56 },
                { id: 212, level: 56 },
                { id: 171, level: 56 },
                { id: 196, level: 57 }
            ]
        ],
        [
            "The Tower Master",
            "Trainer Tower, Summit",
            [
                { id: 208, level: 58 },
                { id: 230, level: 58 },
                { id: 169, level: 58 },
                { id: 197, level: 58 },
                { id: 149, level: 60 },
                { id: 248, level: 62 }
            ]
        ]
    ];
    return floors.map(([name, title, team], i) => ({
        id: `trainerTower${i + 1}`,
        name,
        title,
        specialty: null,
        team,
        timeLimit: 30 + team.length * 15,
        statMultiplier: 2.4 + i * 0.2,
        prizeMoney: Math.max(...team.map(p => p.level)) * 80,
        quote:
            i === 2
                ? "Few climb this far. Let's see if you're worthy of the summit."
                : "The Tower only gets harder from here."
    }));
}

export const SEVII_SPECIALS: SpecialEncounter[] = [
    {
        kind: "legendary",
        id: "emberMoltres",
        region: "sevii",
        speciesId: 146,
        level: 50,
        zoneId: "mtEmber",
        place: "Mt. Ember Summit",
        badgesRequired: 1,
        strength: 2.1,
        text: "A legendary bird of flame roosts at the volcano's peak."
    },
    {
        kind: "gift",
        id: "togepiEgg",
        region: "sevii",
        speciesId: 175,
        level: 5,
        place: "Water Labyrinth",
        badgesRequired: 3,
        text: "An old man's Pokémon found an Egg. He's sure you'll raise it well."
    },
    {
        kind: "gift",
        id: "tanobyUnown",
        region: "sevii",
        speciesId: 201,
        level: 25,
        place: "Tanoby Chambers",
        badgesRequired: 5,
        text: "Once the Network Machine is fixed, Unown appear in the seven chambers."
    },
    {
        kind: "legendary",
        id: "navelHoOh",
        region: "sevii",
        speciesId: 250,
        level: 70,
        zoneId: "tanobyRuins",
        place: "Navel Rock",
        badgesRequired: 5,
        postGame: true,
        strength: 2.9,
        text: "A rainbow-winged Pokémon lands on the peak of Navel Rock."
    },
    {
        kind: "legendary",
        id: "navelLugia",
        region: "sevii",
        speciesId: 249,
        level: 70,
        zoneId: "tanobyRuins",
        place: "Navel Rock",
        badgesRequired: 5,
        postGame: true,
        strength: 2.9,
        text: "Deep beneath Navel Rock, a silver Pokémon sleeps."
    }
];

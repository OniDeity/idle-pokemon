/**
 * Hoenn, from Ruby, Sapphire and Emerald. Wild encounters come from the three games' data
 * (merged like Red and Blue); the Gyms, Elite Four and Champion Wallace use Emerald's teams.
 */
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { timeLimit, trial } from "./trainers";
import type { ZoneDefinition } from "./zones";

function zone(options: Omit<ZoneDefinition, "region">): ZoneDefinition {
    return { region: "hoenn", ...options };
}

export const HOENN_ZONES: ZoneDefinition[] = [
    zone({
        id: "route101",
        name: "Route 101",
        badgesRequired: 0,
        blurb: "Where Professor Birch was chased by a Poochyena, just north of Littleroot Town."
    }),
    zone({
        id: "route103",
        name: "Route 103",
        badgesRequired: 0,
        blurb: "A short path north of Oldale Town, ending at the sea where your rival trains."
    }),
    zone({
        id: "route102",
        name: "Route 102",
        badgesRequired: 0,
        blurb: "Ponds and tall grass between Oldale Town and Petalburg City."
    }),
    zone({
        id: "route104",
        name: "Route 104",
        badgesRequired: 0,
        blurb: "A beach and a flower shop around Petalburg Woods, with Mr. Briney's cottage."
    }),
    zone({
        id: "petalburgWoods",
        name: "Petalburg Woods",
        badgesRequired: 0,
        blurb: "A dense forest where a Team Aqua (or Magma) grunt corners a Devon researcher."
    }),
    zone({
        id: "route116",
        name: "Route 116",
        badgesRequired: 0,
        blurb: "East of Rustboro City, toward the Rusturf Tunnel and the Tunneler's dig."
    }),
    zone({
        id: "petalburgCity",
        name: "Petalburg City",
        badgesRequired: 1,
        blurb: "Your father Norman's hometown, with a pond to fish in."
    }),
    zone({
        id: "rusturfTunnel",
        name: "Rusturf Tunnel",
        badgesRequired: 1,
        blurb: "A half-dug tunnel toward Verdanturf, where Whismur echo off the walls."
    }),
    zone({
        id: "dewfordTown",
        name: "Dewford Town",
        badgesRequired: 1,
        blurb: "A fishing village on an island, reached on Mr. Briney's boat."
    }),
    zone({
        id: "graniteCave",
        name: "Granite Cave",
        badgesRequired: 1,
        blurb: "A cave north of Dewford where Steven studies stones and Sableye lurk."
    }),
    zone({
        id: "slateportCity",
        name: "Slateport City",
        badgesRequired: 1,
        blurb: "A port city with a market, a shipyard and the Oceanic Museum."
    }),
    zone({
        id: "route110",
        name: "Route 110",
        badgesRequired: 1,
        blurb: "Under the Cycling Road from Slateport to Mauville City."
    }),
    zone({
        id: "route117",
        name: "Route 117",
        badgesRequired: 2,
        blurb: "Flowers and the Pokémon Day Care, west of Mauville City."
    }),
    zone({
        id: "route118",
        name: "Route 118",
        badgesRequired: 3,
        blurb: "Where a fisherman hands out the Good Rod, east of Mauville City."
    }),
    zone({
        id: "newMauville",
        name: "New Mauville",
        badgesRequired: 3,
        blurb: "Wattson's abandoned underground power plant, buzzing with Electric Pokémon."
    }),
    zone({
        id: "route112",
        name: "Route 112",
        badgesRequired: 3,
        blurb: "The foot of Mt. Chimney, with the cable car up to the summit."
    }),
    zone({
        id: "fieryPath",
        name: "Fiery Path",
        badgesRequired: 3,
        blurb: "A sweltering tunnel through Mt. Chimney's flank."
    }),
    zone({
        id: "route113",
        name: "Route 113",
        badgesRequired: 3,
        blurb: "Mt. Chimney's ash falls like snow on the grass toward Fallarbor Town."
    }),
    zone({
        id: "route114",
        name: "Route 114",
        badgesRequired: 3,
        blurb: "Rocky hills past Fallarbor Town and Lanette's house."
    }),
    zone({
        id: "meteorFalls",
        name: "Meteor Falls",
        badgesRequired: 3,
        blurb: "Waterfalls in a cave where meteorites fell, and where Team Magma and Aqua clash."
    }),
    zone({
        id: "jaggedPass",
        name: "Jagged Pass",
        badgesRequired: 3,
        blurb: "A steep, bumpy path down from Mt. Chimney toward Lavaridge Town."
    }),
    zone({
        id: "route111",
        name: "Route 111",
        badgesRequired: 4,
        blurb: "North of Mauville, a sandstorm-swept desert you can only cross with Go-Goggles."
    }),
    zone({
        id: "mirageTower",
        name: "Mirage Tower",
        badgesRequired: 4,
        blurb: "A crumbling sand tower in the desert that holds an ancient fossil."
    }),
    zone({
        id: "seaRoutes105to109",
        name: "Routes 105–109 (sea)",
        badgesRequired: 5,
        blurb: "The open sea around Dewford, from Route 104 east to Slateport's beach."
    }),
    zone({
        id: "abandonedShip",
        name: "Abandoned Ship",
        badgesRequired: 5,
        blurb: "The wreck of the S.S. Cactus on Route 108, half flooded."
    }),
    zone({
        id: "hoennAlteringCave",
        name: "Altering Cave",
        badgesRequired: 5,
        blurb: "A cave off Route 103 that's only ever had Zubat, unless something alters it."
    }),
    zone({
        id: "route119",
        name: "Route 119",
        badgesRequired: 5,
        blurb: "Tall grass, a rushing river and the Weather Institute, under endless rain."
    }),
    zone({
        id: "route120",
        name: "Route 120",
        badgesRequired: 5,
        blurb: "Where Steven shows you an invisible Kecleon with the Devon Scope, south of Fortree."
    }),
    zone({
        id: "route121",
        name: "Route 121",
        badgesRequired: 6,
        blurb: "Between Fortree and Lilycove, by the entrance to the Safari Zone."
    }),
    zone({
        id: "hoennSafariZone",
        name: "Safari Zone",
        badgesRequired: 6,
        blurb: "Hoenn's Safari Zone, with Mach and Acro Bike areas full of Johto Pokémon."
    }),
    zone({
        id: "route122",
        name: "Route 122",
        badgesRequired: 6,
        blurb: "A stretch of sea around Mt. Pyre."
    }),
    zone({
        id: "mtPyre",
        name: "Mt. Pyre",
        badgesRequired: 6,
        blurb: "A mountain of graves for Pokémon that have passed on, haunted by Shuppet."
    }),
    zone({
        id: "mtPyreSummit",
        name: "Mt. Pyre Summit",
        badgesRequired: 6,
        blurb: "The misty summit where the Red and Blue Orbs are kept."
    }),
    zone({
        id: "route123",
        name: "Route 123",
        badgesRequired: 6,
        blurb: "A berry master's garden on the road back west to Route 118."
    }),
    zone({
        id: "lilycoveCity",
        name: "Lilycove City",
        badgesRequired: 6,
        blurb: "A seaside city with a department store, the Contest Hall and a museum."
    }),
    zone({
        id: "magmaHideout",
        name: "Magma Hideout",
        badgesRequired: 6,
        blurb: "Team Magma's base inside Mt. Chimney, where they try to wake Groudon."
    }),
    zone({
        id: "seaRoutes124to125",
        name: "Routes 124–125 (sea)",
        badgesRequired: 6,
        blurb: "The sea from Lilycove out to Mossdeep, with the Treasure Hunter's house."
    }),
    zone({
        id: "mossdeepCity",
        name: "Mossdeep City",
        badgesRequired: 6,
        blurb: "An island city with a Space Center, and the home of Steven Stone."
    }),
    zone({
        id: "shoalCave",
        name: "Shoal Cave",
        badgesRequired: 6,
        blurb: "An icy cave north of Mossdeep that floods and drains with the tide."
    }),
    zone({
        id: "underwater",
        name: "Underwater",
        badgesRequired: 7,
        blurb: "Dive into the deep trenches of Routes 124 and 126, among the seaweed."
    }),
    zone({
        id: "seafloorCavern",
        name: "Seafloor Cavern",
        badgesRequired: 7,
        blurb: "A cavern beneath Route 128 where Kyogre (or Groudon) sleeps."
    }),
    zone({
        id: "seaRoutes126to128",
        name: "Routes 126–128 (sea)",
        badgesRequired: 7,
        blurb: "The sea around Sootopolis's crater, down to the Seafloor Cavern."
    }),
    zone({
        id: "sootopolisCity",
        name: "Sootopolis City",
        badgesRequired: 7,
        blurb: "A city in a sunken crater, reached by diving under its wall."
    }),
    zone({
        id: "caveOfOrigin",
        name: "Cave of Origin",
        badgesRequired: 7,
        blurb: "Said to be where life began, inside Sootopolis's crater."
    }),
    zone({
        id: "skyPillar",
        name: "Sky Pillar",
        badgesRequired: 7,
        blurb: "An ancient tower on an island off Route 131, where Rayquaza rests."
    }),
    zone({
        id: "seaRoutes129to131",
        name: "Routes 129–131 (sea)",
        badgesRequired: 7,
        blurb: "Warm ocean currents past Sky Pillar, where Wailord swim."
    }),
    zone({
        id: "pacifidlogTown",
        name: "Pacifidlog Town",
        badgesRequired: 7,
        blurb: "A town of log rafts floating on the sea."
    }),
    zone({
        id: "seaRoutes132to134",
        name: "Routes 132–134 (sea)",
        badgesRequired: 7,
        blurb: "Fast currents from Pacifidlog back toward Slateport."
    }),
    zone({
        id: "everGrandeCity",
        name: "Ever Grande City",
        badgesRequired: 8,
        blurb: "Waterfalls and flowers at the foot of the Pokémon League."
    }),
    zone({
        id: "hoennVictoryRoad",
        name: "Victory Road",
        badgesRequired: 8,
        blurb: "Hoenn's last test before the League, where Wally waits."
    }),
    zone({
        id: "meteorFallsDeep",
        name: "Meteor Falls (deep)",
        badgesRequired: 8,
        postGame: true,
        blurb: "Up the waterfalls, the back of Meteor Falls where Bagon dream of flight."
    }),
    zone({
        id: "desertUnderpass",
        name: "Desert Underpass",
        badgesRequired: 8,
        postGame: true,
        blurb: "A tunnel under the desert, where old Fossil Pokémon still live."
    }),
    zone({
        id: "safariZoneExpansion",
        name: "Safari Zone Expansion",
        badgesRequired: 8,
        postGame: true,
        blurb: "The Safari Zone's new areas, opened after the League."
    }),
    zone({
        id: "artisanCave",
        name: "Artisan Cave",
        badgesRequired: 8,
        postGame: true,
        blurb: "A cave under the Battle Frontier, home to Smeargle."
    }),
    zone({
        id: "mirageIsland",
        name: "Mirage Island",
        badgesRequired: 8,
        postGame: true,
        blurb: "An island off Route 130 that only appears now and then. Wynaut live there."
    })
];

/**
 * Stat multipliers for Hoenn's leaders, tuned with scripts/simulateProgression.ts with Double
 * Battles (unlocked past Roxanne): a first clear after Johto takes about 9.5-13 hours (Winona
 * around 5.5 hours in). Tate & Liza fight a double battle and Juan comes in near the level cap,
 * so theirs come back down.
 */
const HOENN_GYM_STRENGTHS = [2.0, 3.6, 4.3, 5.5, 4.5, 5.1, 3.3, 4.1];
const HOENN_ELITE_FOUR_STRENGTH = 3.09;
const HOENN_CHAMPION_STRENGTH = 3.28;

function hoennGym(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "badgeIcon">
): GymDefinition {
    return trial({
        ...options,
        statMultiplier: HOENN_GYM_STRENGTHS[options.badgeNumber - 1],
        // PokeAPI numbers Hoenn's badges 17-24, after Kanto's and Johto's.
        badgeIcon: `badges/${options.badgeNumber + 16}.png`
    });
}

export const HOENN_GYMS: GymDefinition[] = [
    hoennGym({
        id: "roxanne",
        name: "Roxanne",
        title: "Rustboro City Gym Leader",
        town: "Rustboro City",
        badge: "Stone Badge",
        badgeNumber: 1,
        specialty: "rock",
        team: [
            { id: 74, level: 12 },
            { id: 74, level: 12 },
            { id: 299, level: 15 }
        ],
        keyItems: ["oldRod"],
        rewardText:
            "Mr. Briney sails you to Dewford, where a fisherman gives you the Old Rod. Rusturf Tunnel and Slateport open.",
        quote: "I became a Gym Leader so I might apply what I learned at the Pokémon Trainer's School."
    }),
    hoennGym({
        id: "brawly",
        name: "Brawly",
        title: "Dewford Town Gym Leader",
        town: "Dewford Town",
        badge: "Knuckle Badge",
        badgeNumber: 2,
        specialty: "fighting",
        team: [
            { id: 66, level: 16 },
            { id: 307, level: 16 },
            { id: 296, level: 19 }
        ],
        keyItems: [],
        rewardText: "The Cycling Road takes you north to Mauville City.",
        quote: "I'm Brawly! Dewford's Gym Leader! I've been churned in the rough waves here."
    }),
    hoennGym({
        id: "wattson",
        name: "Wattson",
        title: "Mauville City Gym Leader",
        town: "Mauville City",
        badge: "Dynamo Badge",
        badgeNumber: 3,
        specialty: "electric",
        team: [
            { id: 100, level: 20 },
            { id: 309, level: 20 },
            { id: 82, level: 22 },
            { id: 310, level: 24 }
        ],
        keyItems: ["bicycle", "rockSmash", "goodRod"],
        rewardText:
            "Rydel lends you a Bike, Rock Smash breaks rocks with the Dynamo Badge, and a fisherman on Route 118 gives you the Good Rod.",
        quote: "Wahahahah! I've given up on my plans to convert the city, I have."
    }),
    hoennGym({
        id: "flannery",
        name: "Flannery",
        title: "Lavaridge Town Gym Leader",
        town: "Lavaridge Town",
        badge: "Heat Badge",
        badgeNumber: 4,
        specialty: "fire",
        team: [
            { id: 322, level: 24 },
            { id: 218, level: 24 },
            { id: 323, level: 26 },
            { id: 324, level: 29 }
        ],
        keyItems: [],
        rewardText: "Go-Goggles from your rival let you cross the desert on Route 111.",
        quote: "Welcome… No, wait. Puny Trainer, how good to see you've made it here!"
    }),
    hoennGym({
        id: "norman",
        name: "Norman",
        title: "Petalburg City Gym Leader",
        town: "Petalburg City",
        badge: "Balance Badge",
        badgeNumber: 5,
        specialty: "normal",
        team: [
            { id: 327, level: 27 },
            { id: 288, level: 27 },
            { id: 264, level: 29 },
            { id: 289, level: 31 }
        ],
        keyItems: ["surf"],
        rewardText: "Wally's father gives you HM03 Surf. Hoenn's seas open up.",
        quote: "I'm going to use all my know-how as a Gym Leader against my own child!"
    }),
    hoennGym({
        id: "winona",
        name: "Winona",
        title: "Fortree City Gym Leader",
        town: "Fortree City",
        badge: "Feather Badge",
        badgeNumber: 6,
        specialty: "flying",
        team: [
            { id: 333, level: 29 },
            { id: 357, level: 29 },
            { id: 279, level: 30 },
            { id: 227, level: 31 },
            { id: 334, level: 33 }
        ],
        keyItems: [],
        rewardText: "Lilycove, Mt. Pyre and the eastern seas open up.",
        quote: "I have become one with Bird Pokémon and have soared the skies…"
    }),
    hoennGym({
        id: "tateAndLiza",
        name: "Tate & Liza",
        title: "Mossdeep City Gym Leaders",
        town: "Mossdeep City",
        badge: "Mind Badge",
        badgeNumber: 7,
        specialty: "psychic",
        team: [
            { id: 344, level: 41 },
            { id: 178, level: 41 },
            { id: 337, level: 42 },
            { id: 338, level: 42 }
        ],
        keyItems: ["dive", "superRod"],
        doubles: true,
        rewardText:
            "Steven teaches you HM08 Dive, and a fisherman in Mossdeep gives you the Super Rod.",
        quote: "Hehehe… Were you surprised? That there are two Gym Leaders?"
    }),
    hoennGym({
        id: "juan",
        name: "Juan",
        title: "Sootopolis City Gym Leader",
        town: "Sootopolis City",
        badge: "Rain Badge",
        badgeNumber: 8,
        specialty: "water",
        team: [
            { id: 370, level: 41 },
            { id: 340, level: 41 },
            { id: 364, level: 43 },
            { id: 342, level: 43 },
            { id: 230, level: 46 }
        ],
        keyItems: [],
        rewardText: "With the Rain Badge you can climb Waterfall to Ever Grande City.",
        quote: "Let me ask you. Did you know? Ah, I should not be so coy…"
    })
];

function leagueMember(
    id: string,
    name: string,
    title: string,
    specialty: TrainerDefinition["specialty"],
    statMultiplier: number,
    team: [number, number][],
    quote: string
): TrainerDefinition {
    const ace = Math.max(...team.map(([, level]) => level));
    return {
        id,
        name,
        title,
        specialty,
        team: team.map(([species, level]) => ({ id: species, level })),
        timeLimit: timeLimit(team.length),
        statMultiplier,
        prizeMoney: ace * 100,
        quote
    };
}

/** The Hoenn Elite Four and Champion Wallace (Emerald's teams), back to back. */
export function hoennFinale(): TrainerDefinition[] {
    const e4 = HOENN_ELITE_FOUR_STRENGTH;
    return [
        leagueMember(
            "sidney",
            "Sidney",
            "Elite Four",
            "dark",
            e4,
            [
                [262, 46],
                [275, 48],
                [332, 46],
                [342, 48],
                [359, 49]
            ],
            "I like that look you're giving me. I guess you'll give me a good match."
        ),
        leagueMember(
            "phoebe",
            "Phoebe",
            "Elite Four",
            "ghost",
            e4,
            [
                [356, 48],
                [354, 49],
                [302, 50],
                [354, 49],
                [356, 51]
            ],
            "I trained on Mt. Pyre. While I trained, I gained the ability to commune with Ghost Pokémon."
        ),
        leagueMember(
            "glacia",
            "Glacia",
            "Elite Four",
            "ice",
            e4,
            [
                [364, 50],
                [362, 50],
                [364, 52],
                [362, 52],
                [365, 53]
            ],
            "I've traveled from afar to Hoenn so that I may hone my icy skills."
        ),
        leagueMember(
            "hoennDrake",
            "Drake",
            "Elite Four",
            "dragon",
            e4,
            [
                [372, 52],
                [334, 54],
                [330, 53],
                [330, 53],
                [373, 55]
            ],
            "I am the last of the Pokémon League Elite Four, Drake the Dragon master!"
        ),
        leagueMember(
            "wallace",
            "Wallace",
            "Champion",
            "water",
            HOENN_CHAMPION_STRENGTH,
            [
                [321, 57],
                [73, 55],
                [272, 56],
                [340, 56],
                [130, 56],
                [350, 58]
            ],
            "Welcome. My name is Wallace. The Champion of the Pokémon League."
        )
    ];
}

/** Hoenn's gifts, trades and legendaries (Ruby, Sapphire and Emerald together). */
export const HOENN_SPECIALS: SpecialEncounter[] = [
    {
        kind: "trade",
        id: "rustboroMakuhita",
        region: "hoenn",
        speciesId: 296,
        level: 5,
        place: "Rustboro City",
        badgesRequired: 0,
        wants: 287,
        text: "A girl in Rustboro wants to see a Slakoth. Her Makuhita, Makit, is yours in return."
    },
    {
        kind: "trade",
        id: "rustboroSeedot",
        region: "hoenn",
        speciesId: 273,
        level: 4,
        place: "Rustboro City",
        badgesRequired: 0,
        wants: 280,
        text: "A boy in Rustboro would love to meet a Ralts. He'll give you his Seedot, Dots."
    },
    {
        kind: "gift",
        id: "azurillEgg",
        region: "hoenn",
        speciesId: 298,
        level: 5,
        place: "Route 117 Day Care",
        badgesRequired: 2,
        text: "The Day Care couple found an Egg by their Marill. It hatches into an Azurill."
    },
    {
        kind: "trade",
        id: "nincadaShedinja",
        region: "hoenn",
        speciesId: 292,
        level: 20,
        place: "Wherever Nincada evolves",
        badgesRequired: 2,
        wants: 291,
        text: "When Nincada evolves into Ninjask with room in your party, its empty shell comes alive as Shedinja."
    },
    {
        kind: "gift",
        id: "lavaridgeWynaut",
        region: "hoenn",
        speciesId: 360,
        level: 5,
        place: "Lavaridge Town",
        badgesRequired: 3,
        text: "An old woman by the hot springs gives you an Egg. It hatches into a Wynaut."
    },
    {
        kind: "gift",
        id: "rootFossilLileep",
        region: "hoenn",
        speciesId: 345,
        level: 20,
        place: "Mirage Tower, revived at Devon Corp.",
        badgesRequired: 4,
        text: "The Root Fossil from Mirage Tower, revived in Rustboro: an ancient Lileep."
    },
    {
        kind: "gift",
        id: "clawFossilAnorith",
        region: "hoenn",
        speciesId: 347,
        level: 20,
        place: "Mirage Tower, revived at Devon Corp.",
        badgesRequired: 4,
        text: "The Claw Fossil from Mirage Tower, revived in Rustboro: an ancient Anorith."
    },
    {
        kind: "gift",
        id: "weatherInstituteCastform",
        region: "hoenn",
        speciesId: 351,
        level: 25,
        place: "Weather Institute, Route 119",
        badgesRequired: 5,
        text: "After you drive Team Aqua (or Magma) out, the researchers give you their Castform."
    },
    {
        kind: "trade",
        id: "fortreeMeowth",
        region: "hoenn",
        speciesId: 52,
        level: 5,
        place: "Fortree City",
        badgesRequired: 5,
        wants: 300,
        text: "Kobe in Fortree wants to see a Skitty. He'll give you his Meowth, Babs."
    },
    {
        kind: "trade",
        id: "fortreePlusle",
        region: "hoenn",
        speciesId: 311,
        level: 15,
        place: "Fortree City",
        badgesRequired: 5,
        wants: 313,
        text: "A woman in Fortree would love to meet a Volbeat. Her Plusle, Plusy, is yours for it."
    },
    {
        kind: "trade",
        id: "pacifidlogCorsola",
        region: "hoenn",
        speciesId: 222,
        level: 20,
        place: "Pacifidlog Town",
        badgesRequired: 7,
        wants: 182,
        text: "Someone in Pacifidlog wants to see a Bellossom. Their Corsola, Corsy, is yours in return."
    },
    {
        kind: "trade",
        id: "pacifidlogHorsea",
        region: "hoenn",
        speciesId: 116,
        level: 20,
        place: "Pacifidlog Town",
        badgesRequired: 7,
        wants: 371,
        text: "A man in Pacifidlog would love to meet a Bagon. His Horsea, Seasor, is yours for it."
    },
    {
        kind: "legendary",
        id: "hoennKyogre",
        region: "hoenn",
        speciesId: 382,
        level: 45,
        zoneId: "caveOfOrigin",
        place: "Cave of Origin",
        badgesRequired: 7,
        strength: 2.6,
        text: "Awakened by Team Aqua with the Blue Orb, Kyogre floods Sootopolis from the Cave of Origin."
    },
    {
        kind: "legendary",
        id: "hoennGroudon",
        region: "hoenn",
        speciesId: 383,
        level: 45,
        zoneId: "caveOfOrigin",
        place: "Cave of Origin",
        badgesRequired: 7,
        strength: 2.6,
        text: "Awakened by Team Magma with the Red Orb, Groudon dries the land from the Cave of Origin."
    },
    {
        kind: "legendary",
        id: "hoennRayquaza",
        region: "hoenn",
        speciesId: 384,
        level: 70,
        zoneId: "skyPillar",
        place: "Sky Pillar, apex",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Rayquaza, who quelled Groudon and Kyogre, rests again at the top of Sky Pillar."
    },
    {
        kind: "gift",
        id: "stevensBeldum",
        region: "hoenn",
        speciesId: 374,
        level: 5,
        place: "Steven's house, Mossdeep City",
        badgesRequired: 8,
        postGame: true,
        text: "Steven has gone traveling. He left a Poké Ball for you: a Beldum."
    },
    {
        kind: "legendary",
        id: "hoennRegirock",
        region: "hoenn",
        speciesId: 377,
        level: 40,
        zoneId: "route111",
        place: "Desert Ruins, Route 111",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "Read the braille in the Sealed Chamber, and the Desert Ruins open on Regirock."
    },
    {
        kind: "legendary",
        id: "hoennRegice",
        region: "hoenn",
        speciesId: 378,
        level: 40,
        zoneId: "seaRoutes105to109",
        place: "Island Cave, Route 105",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "Deep in the Island Cave on Route 105, Regice waits in the cold."
    },
    {
        kind: "legendary",
        id: "hoennRegisteel",
        region: "hoenn",
        speciesId: 379,
        level: 40,
        zoneId: "route120",
        place: "Ancient Tomb, Route 120",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "In the Ancient Tomb on Route 120, Registeel stands guard."
    },
    {
        kind: "legendary",
        id: "hoennLatias",
        region: "hoenn",
        speciesId: 380,
        level: 40,
        zoneId: "route118",
        place: "Roaming Hoenn",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "A red-and-white Pokémon flies across Hoenn. Latias roams free."
    },
    {
        kind: "legendary",
        id: "hoennLatios",
        region: "hoenn",
        speciesId: 381,
        level: 40,
        zoneId: "route121",
        place: "Roaming Hoenn",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "A blue-and-white Pokémon flies across Hoenn. Latios roams free."
    },
    {
        kind: "gift",
        id: "wishingStarJirachi",
        region: "hoenn",
        speciesId: 385,
        level: 5,
        place: "Any Pokémon Center (Colosseum Bonus Disc)",
        badgesRequired: 8,
        postGame: true,
        text: "A Wishing Star arrives from the Colosseum Bonus Disc: Jirachi, who wakes once every thousand years."
    },
    {
        kind: "legendary",
        id: "birthIslandDeoxys",
        region: "hoenn",
        speciesId: 386,
        level: 30,
        zoneId: "lilycoveCity",
        place: "Birth Island (Aurora Ticket, from Lilycove Harbor)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Solve the triangle puzzle on Birth Island, and Deoxys takes shape."
    },
    {
        kind: "legendary",
        id: "farawayIslandMew",
        region: "hoenn",
        speciesId: 151,
        level: 30,
        zoneId: "lilycoveCity",
        place: "Faraway Island (Old Sea Map, from Lilycove Harbor)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.3,
        text: "On Faraway Island, a Mew darts through the tall grass, playing hide and seek."
    },
    {
        kind: "legendary",
        id: "navelRockLugia",
        region: "hoenn",
        speciesId: 249,
        level: 70,
        zoneId: "lilycoveCity",
        place: "Navel Rock (Mystic Ticket, from Lilycove Harbor)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "At the bottom of Navel Rock, Lugia waits in the dark."
    },
    {
        kind: "legendary",
        id: "navelRockHoOh",
        region: "hoenn",
        speciesId: 250,
        level: 70,
        zoneId: "lilycoveCity",
        place: "Navel Rock (Mystic Ticket, from Lilycove Harbor)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "At the summit of Navel Rock, Ho-Oh descends."
    }
];

/**
 * Johto, from HeartGold and SoulSilver. Wild encounters come from the games' data (with the time
 * of day kept per entry); the Gyms, Elite Four and Champion use their HeartGold/SoulSilver teams.
 */
import type { EncounterEntry, EncounterPoolId } from "./data";
import { enc } from "./data";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { timeLimit, trial } from "./trainers";
import type { ZoneDefinition } from "./zones";

function zone(options: Omit<ZoneDefinition, "region">): ZoneDefinition {
    return { region: "johto", ...options };
}

export const JOHTO_ZONES: ZoneDefinition[] = [
    zone({
        id: "route29",
        name: "Route 29",
        badgesRequired: 0,
        blurb: "The first steps out of New Bark Town, toward Cherrygrove City."
    }),
    zone({
        id: "route46",
        name: "Route 46",
        badgesRequired: 0,
        blurb: "A rocky ledge-filled path climbing north from Route 29."
    }),
    zone({
        id: "route30",
        name: "Route 30",
        badgesRequired: 0,
        blurb: "Berry trees and Mr. Pokémon's house, north of Cherrygrove."
    }),
    zone({
        id: "route31",
        name: "Route 31",
        badgesRequired: 0,
        blurb: "The road into Violet City, past the mouth of Dark Cave."
    }),
    zone({
        id: "darkCave",
        name: "Dark Cave",
        badgesRequired: 0,
        blurb: "A pitch-black cave where Dunsparce burrow. Flash would help."
    }),
    zone({
        id: "sproutTower",
        name: "Sprout Tower",
        badgesRequired: 0,
        blurb: "A swaying pagoda of Bellsprout-training monks in Violet City."
    }),
    zone({
        id: "route32",
        name: "Route 32",
        badgesRequired: 1,
        blurb: "A long seaside road south of Violet City, with a Pokémon Center by Union Cave."
    }),
    zone({
        id: "ruinsOfAlph",
        name: "Ruins of Alph",
        badgesRequired: 1,
        blurb: "Ancient ruins with stone panels of a mysterious Pokémon."
    }),
    zone({
        id: "ruinsOfAlphChambers",
        name: "Ruins of Alph Chambers",
        badgesRequired: 1,
        blurb: "Solve the panel puzzles and the Unown appear, letter by letter.",
        encounters: {
            // HeartGold/SoulSilver's chambers have all 28 Unown; ! and ? are rare.
            walk: Array.from({ length: 28 }, (_, i) => enc(4000 + i, 5, 5, i < 26 ? 10 : 3))
        }
    }),
    zone({
        id: "unionCave",
        name: "Union Cave",
        badgesRequired: 1,
        blurb: "A cave under Route 32. On Fridays, something big swims in its depths."
    }),
    zone({
        id: "route33",
        name: "Route 33",
        badgesRequired: 1,
        blurb: "A short, always-rainy route into Azalea Town."
    }),
    zone({
        id: "slowpokeWell",
        name: "Slowpoke Well",
        badgesRequired: 1,
        blurb: "Team Rocket has been cutting off Slowpoke tails down here."
    }),
    zone({
        id: "newBarkTown",
        name: "New Bark Town",
        badgesRequired: 2,
        blurb: "Professor Elm's hometown, where the winds of a new beginning blow."
    }),
    zone({
        id: "cherrygroveCity",
        name: "Cherrygrove City",
        badgesRequired: 2,
        blurb: "A quiet seaside city where a guide gent shows newcomers around."
    }),
    zone({
        id: "violetCity",
        name: "Violet City",
        badgesRequired: 2,
        blurb: "An old city with a pond and Earl's Pokémon Academy."
    }),
    zone({
        id: "azaleaTown",
        name: "Azalea Town",
        badgesRequired: 2,
        blurb: "Kurt's town of Apricorn trees and Slowpoke."
    }),
    zone({
        id: "ilexForest",
        name: "Ilex Forest",
        badgesRequired: 2,
        blurb: "A dense, sacred forest with a shrine to its guardian."
    }),
    zone({
        id: "route34",
        name: "Route 34",
        badgesRequired: 2,
        blurb: "The road to Goldenrod, past the Pokémon Day Care."
    }),
    zone({
        id: "route35",
        name: "Route 35",
        badgesRequired: 2,
        blurb: "North of Goldenrod City, on the way to the National Park."
    }),
    zone({
        id: "nationalPark",
        name: "National Park",
        badgesRequired: 2,
        blurb: "A park full of Bug Pokémon, home of the Bug-Catching Contest."
    }),
    zone({
        id: "route36",
        name: "Route 36",
        badgesRequired: 3,
        blurb: "Once blocked by a strange tree that wiggled when watered."
    }),
    zone({
        id: "route37",
        name: "Route 37",
        badgesRequired: 3,
        blurb: "A short wooded route where Stantler roam."
    }),
    zone({
        id: "ecruteakCity",
        name: "Ecruteak City",
        badgesRequired: 3,
        blurb: "A historic city of two towers and the Kimono Girls."
    }),
    zone({
        id: "burnedTower",
        name: "Burned Tower",
        badgesRequired: 3,
        blurb: "Burned down by lightning; three Pokémon perished and were reborn."
    }),
    zone({
        id: "route38",
        name: "Route 38",
        badgesRequired: 3,
        blurb: "West of Ecruteak, toward the Moomoo Farm."
    }),
    zone({
        id: "route39",
        name: "Route 39",
        badgesRequired: 3,
        blurb: "Pastures around Moomoo Farm, where a sick Miltank needs berries."
    }),
    zone({
        id: "olivineCity",
        name: "Olivine City",
        badgesRequired: 4,
        blurb: "A port city whose lighthouse's Ampharos has fallen ill."
    }),
    zone({
        id: "route40",
        name: "Route 40",
        badgesRequired: 4,
        blurb: "Open sea west of Olivine, toward Cianwood."
    }),
    zone({
        id: "route41",
        name: "Route 41",
        badgesRequired: 4,
        blurb: "Rough seas around the Whirl Islands."
    }),
    zone({
        id: "whirlIslands",
        name: "Whirl Islands",
        badgesRequired: 4,
        blurb: "Whirlpool-ringed islands. Something huge sleeps at the bottom."
    }),
    zone({
        id: "cianwoodCity",
        name: "Cianwood City",
        badgesRequired: 4,
        blurb: "A far-flung island city with a pharmacy and a fighting Gym."
    }),
    zone({
        id: "route42",
        name: "Route 42",
        badgesRequired: 4,
        blurb: "The route east of Ecruteak, running around Mt. Mortar."
    }),
    zone({
        id: "mtMortar",
        name: "Mt. Mortar",
        badgesRequired: 4,
        blurb: "A huge cave of waterfalls where a karate master trains."
    }),
    zone({
        id: "route47",
        name: "Route 47",
        badgesRequired: 5,
        blurb: "Sheer cliffs and caves west of Cianwood, on the way to the Safari Zone."
    }),
    zone({
        id: "route48",
        name: "Route 48",
        badgesRequired: 5,
        blurb: "Grassland at the gates of the Safari Zone."
    }),
    zone({
        id: "johtoSafariZone",
        name: "Safari Zone",
        badgesRequired: 5,
        blurb: "Baoba's Safari Zone: twelve areas of Pokémon from across the world."
    }),
    zone({
        id: "route43",
        name: "Route 43",
        badgesRequired: 5,
        blurb: "Team Rocket charges a toll at the gate on the way to the lake."
    }),
    zone({
        id: "lakeOfRage",
        name: "Lake of Rage",
        badgesRequired: 5,
        blurb: "A lake whose Magikarp are being forced to evolve by a strange signal."
    }),
    zone({
        id: "route44",
        name: "Route 44",
        badgesRequired: 7,
        blurb: "The road from Mahogany Town to the Ice Path."
    }),
    zone({
        id: "icePath",
        name: "Ice Path",
        badgesRequired: 7,
        blurb: "Slippery frozen caves between Mahogany and Blackthorn."
    }),
    zone({
        id: "blackthornCity",
        name: "Blackthorn City",
        badgesRequired: 7,
        blurb: "A mountain city of dragon tamers."
    }),
    zone({
        id: "darkCaveBlackthorn",
        name: "Dark Cave (deep)",
        badgesRequired: 7,
        blurb: "Dark Cave's far side, opening onto Blackthorn City."
    }),
    zone({
        id: "dragonsDen",
        name: "Dragon's Den",
        badgesRequired: 8,
        blurb: "A sacred cave behind the Blackthorn Gym where dragon masters train."
    }),
    zone({
        id: "route45",
        name: "Route 45",
        badgesRequired: 8,
        blurb: "A steep mountain path south of Blackthorn."
    }),
    zone({
        id: "route27",
        name: "Route 27",
        badgesRequired: 8,
        blurb: "The coastal road west of New Bark Town, toward the Pokémon League."
    }),
    zone({
        id: "tohjoFalls",
        name: "Tohjo Falls",
        badgesRequired: 8,
        blurb: "A waterfall cave on the border of Johto and Kanto."
    }),
    zone({
        id: "route26",
        name: "Route 26",
        badgesRequired: 8,
        blurb: "The last road north to Victory Road."
    }),
    zone({
        id: "johtoVictoryRoad",
        name: "Victory Road",
        badgesRequired: 8,
        blurb: "Johto's gate to the Indigo Plateau."
    }),
    zone({
        id: "route28",
        name: "Route 28",
        badgesRequired: 8,
        postGame: true,
        blurb: "A hidden path west of Kanto's Route 22, leading to Mt. Silver."
    }),
    zone({
        id: "mtSilver",
        name: "Mt. Silver",
        badgesRequired: 8,
        postGame: true,
        blurb: "A towering mountain. A silent Trainer waits at the summit."
    })
];

/** A HeartGold/SoulSilver swarm: Pokémon that flood one place, as the Pokégear radio reports. */
export interface Swarm {
    zoneId: string;
    speciesId: number;
    pools: Partial<Record<EncounterPoolId, EncounterEntry[]>>;
}

/**
 * HeartGold/SoulSilver's Johto swarms. With the Radio Card, each can be tuned in to once per
 * journey, for a fee, and its Pokémon join that place's pool for the rest of the journey.
 */
export const JOHTO_SWARMS: Swarm[] = [
    { zoneId: "darkCave", speciesId: 206, pools: { walk: [enc(206, 2, 3)] } },
    {
        zoneId: "route32",
        speciesId: 211,
        pools: {
            oldRod: [enc(211, 10, 10)],
            goodRod: [enc(211, 20, 20)],
            superRod: [enc(211, 40, 40)]
        }
    },
    { zoneId: "route35", speciesId: 193, pools: { walk: [enc(193, 12, 12)] } },
    { zoneId: "route38", speciesId: 209, pools: { walk: [enc(209, 16, 16)] } },
    {
        zoneId: "route44",
        speciesId: 223,
        pools: {
            oldRod: [enc(223, 10, 10)],
            goodRod: [enc(223, 20, 20)],
            superRod: [enc(223, 40, 40)]
        }
    },
    { zoneId: "route47", speciesId: 132, pools: { walk: [enc(132, 35, 35)] } },
    { zoneId: "mtMortar", speciesId: 183, pools: { walk: [enc(183, 13, 15)] } }
];

/** What tuning in to one swarm costs. */
export const SWARM_PRICE = 3000;

/**
 * The Bug-Catching Contest's entry fee: paid once a journey, it adds the contest's bugs to the
 * National Park's grass for the rest of the journey.
 */
export const BUG_CONTEST_FEE = 2000;

/** The contest's grass (HeartGold/SoulSilver's Kanto-bug table). */
export const BUG_CONTEST_POOL: EncounterEntry[] = [
    enc(10, 7, 18, 20),
    enc(13, 7, 18, 20),
    enc(11, 9, 18, 10),
    enc(14, 9, 18, 10),
    enc(48, 10, 16, 10),
    enc(46, 10, 17, 10),
    enc(12, 12, 15, 5),
    enc(15, 12, 15, 5),
    enc(123, 13, 14, 5),
    enc(127, 13, 14, 5)
];

/**
 * Stat multipliers for Johto's leaders, tuned with scripts/simulateProgression.ts (a first clear
 * after Kanto, Orange and Sevii takes about 10-12 hours, anime places included). Johto's leaders
 * keep lower levels than Kanto's through the mid-game, so their multipliers climb faster; Pryce
 * and Clair sit near the level cap, so theirs come back down.
 */
const JOHTO_GYM_STRENGTHS = [1.3, 2.4, 3.3, 4.1, 4.6, 5.0, 4.2, 3.7];
const JOHTO_ELITE_FOUR_STRENGTH = 3.575;
const JOHTO_CHAMPION_STRENGTH = 3.795;

function johtoGym(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "badgeIcon">
): GymDefinition {
    return trial({
        ...options,
        statMultiplier: JOHTO_GYM_STRENGTHS[options.badgeNumber - 1],
        // PokeAPI numbers Johto's badges 9-16, after Kanto's.
        badgeIcon: `badges/${options.badgeNumber + 8}.png`
    });
}

export const JOHTO_GYMS: GymDefinition[] = [
    johtoGym({
        id: "falkner",
        name: "Falkner",
        title: "Violet City Gym Leader",
        town: "Violet City",
        badge: "Zephyr",
        badgeNumber: 1,
        specialty: "flying",
        team: [
            { id: 16, level: 9 },
            { id: 17, level: 13 }
        ],
        keyItems: ["oldRod"],
        rewardText: "A fisherman on Route 32 hands you the Old Rod. The road south opens.",
        quote: "People say you can clip Flying-type Pokémon's wings with a jolt of electricity…"
    }),
    johtoGym({
        id: "bugsy",
        name: "Bugsy",
        title: "Azalea Town Gym Leader",
        town: "Azalea Town",
        badge: "Hive",
        badgeNumber: 2,
        specialty: "bug",
        team: [
            { id: 11, level: 15 },
            { id: 14, level: 15 },
            { id: 123, level: 17 }
        ],
        keyItems: ["headbutt", "bicycle"],
        rewardText:
            "In Ilex Forest you learn Headbutt to shake trees, and Goldenrod's bike shop lends you a Bicycle.",
        quote: "My research will make me the authority on Bug Pokémon!"
    }),
    johtoGym({
        id: "whitney",
        name: "Whitney",
        title: "Goldenrod City Gym Leader",
        town: "Goldenrod City",
        badge: "Plain",
        badgeNumber: 3,
        specialty: "normal",
        team: [
            { id: 35, level: 17 },
            { id: 241, level: 19 }
        ],
        keyItems: ["squirtBottle", "rockSmash", "radioCard"],
        rewardText:
            "The flower shop gives you a SquirtBottle, a man on Route 36 teaches you Rock Smash, and you win a Radio Card at the Radio Tower quiz.",
        quote: "Everyone was into Pokémon, so I got into it too! They're super cute!"
    }),
    johtoGym({
        id: "morty",
        name: "Morty",
        title: "Ecruteak City Gym Leader",
        town: "Ecruteak City",
        badge: "Fog",
        badgeNumber: 4,
        specialty: "ghost",
        team: [
            { id: 92, level: 21 },
            { id: 93, level: 21 },
            { id: 93, level: 23 },
            { id: 94, level: 25 }
        ],
        keyItems: ["surf"],
        rewardText: "With the Fog Badge you can use Surf. The seas west of Olivine open up.",
        quote: "Here in Ecruteak, Pokémon have been revered. It's said a rainbow-hued Pokémon will come down…"
    }),
    johtoGym({
        id: "chuck",
        name: "Chuck",
        title: "Cianwood City Gym Leader",
        town: "Cianwood City",
        badge: "Storm",
        badgeNumber: 5,
        specialty: "fighting",
        team: [
            { id: 57, level: 27 },
            { id: 62, level: 31 }
        ],
        keyItems: ["goodRod"],
        rewardText:
            "Olivine's fishing guru gives you the Good Rod, and the cliffs of Route 47 open.",
        quote: "WAHAHAH! So you've come this far! Let me tell you, I'm tough!"
    }),
    johtoGym({
        id: "jasmine",
        name: "Jasmine",
        title: "Olivine City Gym Leader",
        town: "Olivine City",
        badge: "Mineral",
        badgeNumber: 6,
        specialty: "steel",
        team: [
            { id: 81, level: 30 },
            { id: 81, level: 30 },
            { id: 208, level: 35 }
        ],
        keyItems: [],
        rewardText: "Amphy the lighthouse Ampharos is well again. Mahogany Town awaits.",
        quote: "…Thank you for your help at the Lighthouse… But this is different."
    }),
    johtoGym({
        id: "pryce",
        name: "Pryce",
        title: "Mahogany Town Gym Leader",
        town: "Mahogany Town",
        badge: "Glacier",
        badgeNumber: 7,
        specialty: "ice",
        team: [
            { id: 86, level: 30 },
            { id: 87, level: 32 },
            { id: 221, level: 34 }
        ],
        keyItems: [],
        rewardText: "Team Rocket is driven out of Mahogany, and the Ice Path to Blackthorn opens.",
        quote: "Pokémon have many experiences in their lives, just like we do."
    }),
    johtoGym({
        id: "clair",
        name: "Clair",
        title: "Blackthorn City Gym Leader",
        town: "Blackthorn City",
        badge: "Rising",
        badgeNumber: 8,
        specialty: "dragon",
        team: [
            { id: 148, level: 38 },
            { id: 148, level: 38 },
            { id: 130, level: 38 },
            { id: 230, level: 41 }
        ],
        keyItems: ["superRod"],
        rewardText:
            "After the Dragon's Den, Clair hands over the Rising Badge. A fisherman gives you the Super Rod, and the road to the League opens.",
        quote: "I am Clair. The world's best dragon master."
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

/** The Johto Elite Four and Champion Lance, back to back. */
export function johtoFinale(): TrainerDefinition[] {
    const e4 = JOHTO_ELITE_FOUR_STRENGTH;
    return [
        leagueMember(
            "johtoWill",
            "Will",
            "Elite Four",
            "psychic",
            e4,
            [
                [178, 40],
                [124, 41],
                [103, 41],
                [80, 41],
                [178, 42]
            ],
            "I have trained all around the world, making my Psychic Pokémon powerful."
        ),
        leagueMember(
            "johtoKoga",
            "Koga",
            "Elite Four",
            "poison",
            e4,
            [
                [168, 40],
                [49, 41],
                [205, 43],
                [89, 42],
                [169, 44]
            ],
            "Fwahahahaha! A ninja's art is to confuse and deceive."
        ),
        leagueMember(
            "johtoBruno",
            "Bruno",
            "Elite Four",
            "fighting",
            e4,
            [
                [237, 42],
                [106, 42],
                [107, 42],
                [95, 43],
                [68, 46]
            ],
            "We will grind you down with our superior power! Hoo hah!"
        ),
        leagueMember(
            "johtoKaren",
            "Karen",
            "Elite Four",
            "dark",
            e4,
            [
                [197, 42],
                [45, 42],
                [94, 45],
                [198, 44],
                [229, 47]
            ],
            "Strong Pokémon. Weak Pokémon. That is only the selfish perception of people."
        ),
        leagueMember(
            "johtoLance",
            "Lance",
            "Champion",
            "dragon",
            JOHTO_CHAMPION_STRENGTH,
            [
                [130, 46],
                [149, 49],
                [149, 49],
                [142, 48],
                [6, 48],
                [149, 50]
            ],
            "I've been waiting for you. As the most powerful Trainer and as the Champion…"
        )
    ];
}

/** Johto's gifts, trades, Game Corner prizes, one-of-a-kind encounters and Red. */
export const JOHTO_SPECIALS: SpecialEncounter[] = [
    {
        kind: "trade",
        id: "violetOnix",
        region: "johto",
        speciesId: 95,
        level: 10,
        place: "Violet City",
        badgesRequired: 0,
        wants: 69,
        text: "Kyle would love to meet a Bellsprout. His Onix, Rocky, is yours for the chance."
    },
    {
        kind: "gift",
        id: "johtoTogepiEgg",
        region: "johto",
        speciesId: 175,
        level: 5,
        place: "Violet City Pokémon Center",
        badgesRequired: 1,
        text: "Professor Elm's aide hands you the mysterious Egg Mr. Pokémon found."
    },
    {
        kind: "gift",
        id: "unionCaveLapras",
        region: "johto",
        speciesId: 131,
        level: 20,
        place: "Union Cave, deepest floor",
        badgesRequired: 1,
        text: "A gentle Lapras surfaces in the depths of Union Cave and swims up to you."
    },
    {
        kind: "gift",
        id: "kenyaSpearow",
        region: "johto",
        speciesId: 21,
        level: 20,
        place: "Route 35 gatehouse",
        badgesRequired: 2,
        text: "Deliver Kenya and her Mail to a man on Route 31, and he lets you keep her."
    },
    {
        kind: "gift",
        id: "billsEevee",
        region: "johto",
        speciesId: 133,
        level: 5,
        place: "Bill's house, Goldenrod City",
        badgesRequired: 2,
        text: "Bill can't keep this Eevee he found. Will you raise it?"
    },
    {
        kind: "gift",
        id: "oddEgg",
        region: "johto",
        speciesId: 172,
        pool: [172, 173, 174, 236, 238, 239, 240],
        shinyChance: 0.14,
        level: 5,
        place: "Route 34 Day Care",
        badgesRequired: 2,
        text: "The Day Care man found an Odd Egg. It could hatch into any baby Pokémon — and it's often shiny!"
    },
    {
        kind: "trade",
        id: "goldenrodMachop",
        region: "johto",
        speciesId: 66,
        level: 15,
        place: "Goldenrod Department Store",
        badgesRequired: 2,
        wants: 96,
        text: "Mike wants to see a Drowzee. He'll give you his Machop, Muscle."
    },
    ...(
        [
            [63, 15, 2000],
            [23, 15, 7000],
            [27, 15, 7000],
            [147, 15, 21000]
        ] as const
    ).map(
        ([speciesId, level, price]): SpecialEncounter => ({
            kind: "gift",
            id: `goldenrodGameCorner${speciesId}`,
            region: "johto",
            speciesId,
            level,
            place: "Goldenrod Game Corner",
            badgesRequired: 2,
            price,
            text: "Trade in coins at the prize counter."
        })
    ),
    {
        kind: "legendary",
        id: "route36Sudowoodo",
        region: "johto",
        speciesId: 185,
        level: 20,
        zoneId: "route36",
        place: "Route 36",
        badgesRequired: 3,
        keyItem: "squirtBottle",
        strength: 1.6,
        text: "A strange tree blocks the road. It wiggles when you water it with the SquirtBottle!"
    },
    {
        kind: "gift",
        id: "kirksShuckle",
        region: "johto",
        speciesId: 213,
        level: 15,
        place: "Kirk's house, Cianwood City",
        badgesRequired: 4,
        text: "Kirk is afraid Team Rocket will steal his Shuckle, Shuckie. He asks you to look after it."
    },
    {
        kind: "trade",
        id: "olivineVoltorb",
        region: "johto",
        speciesId: 100,
        level: 20,
        place: "Olivine City",
        badgesRequired: 4,
        wants: 98,
        text: "Tim would love to see a Krabby. He'll give you his Voltorb, Volty."
    },
    {
        kind: "legendary",
        id: "johtoRaikou",
        region: "johto",
        speciesId: 243,
        level: 40,
        zoneId: "route38",
        place: "Roaming Johto",
        badgesRequired: 4,
        strength: 2.3,
        text: "Awakened in the Burned Tower, Raikou races across Johto like lightning."
    },
    {
        kind: "legendary",
        id: "johtoEntei",
        region: "johto",
        speciesId: 244,
        level: 40,
        zoneId: "route42",
        place: "Roaming Johto",
        badgesRequired: 4,
        strength: 2.3,
        text: "Entei roams the land, its roar shaking the mountains like an erupting volcano."
    },
    {
        kind: "gift",
        id: "karateTyrogue",
        region: "johto",
        speciesId: 236,
        level: 10,
        place: "Mt. Mortar",
        badgesRequired: 5,
        text: "The Karate King, Kiyo, is so impressed by your battle that he gives you a Tyrogue."
    },
    {
        kind: "legendary",
        id: "redGyarados",
        region: "johto",
        speciesId: 7022,
        level: 30,
        zoneId: "lakeOfRage",
        place: "Lake of Rage",
        badgesRequired: 5,
        strength: 2.0,
        text: "A Gyarados as red as fire rampages across the lake, driven mad by a strange signal."
    },
    {
        kind: "trade",
        id: "blackthornDodrio",
        region: "johto",
        speciesId: 85,
        level: 30,
        place: "Blackthorn City",
        badgesRequired: 7,
        wants: 148,
        text: "Emy has always wanted to see a Dragonair. She'll trade you her Dodrio, Doris."
    },
    {
        kind: "legendary",
        id: "whirlLugia",
        region: "johto",
        speciesId: 249,
        level: 45,
        zoneId: "whirlIslands",
        place: "Whirl Islands, deep below",
        badgesRequired: 7,
        strength: 2.5,
        text: "With the Silver Wing, you dive to the bottom of the Whirl Islands. Lugia is waiting."
    },
    {
        kind: "gift",
        id: "dragonsDenDratini",
        region: "johto",
        speciesId: 147,
        level: 15,
        place: "Dragon's Den",
        badgesRequired: 8,
        text: "Passing the Dragon Master's test, you're entrusted with a Dratini that knows Extreme Speed."
    },
    {
        kind: "legendary",
        id: "johtoSuicune",
        region: "johto",
        speciesId: 245,
        level: 40,
        zoneId: "tohjoFalls",
        place: "Tohjo Falls",
        badgesRequired: 8,
        strength: 2.4,
        text: "Suicune, the aurora Pokémon you've chased across Johto, finally stands its ground."
    },
    {
        kind: "legendary",
        id: "bellTowerHoOh",
        region: "johto",
        speciesId: 250,
        level: 45,
        zoneId: "ecruteakCity",
        place: "Bell Tower, roof",
        badgesRequired: 8,
        strength: 2.5,
        text: "With the Rainbow Wing, the Bell Tower opens. A rainbow-colored Pokémon lands on its roof."
    },
    {
        kind: "legendary",
        id: "ilexCelebi",
        region: "johto",
        speciesId: 251,
        level: 30,
        zoneId: "ilexForest",
        place: "Ilex Forest shrine",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Kurt asks you to place the GS Ball at the shrine. The guardian of the forest appears!"
    },
    {
        kind: "legendary",
        id: "ilexSpikyPichu",
        region: "johto",
        speciesId: 4028,
        level: 30,
        zoneId: "ilexForest",
        place: "Ilex Forest shrine",
        badgesRequired: 8,
        postGame: true,
        strength: 2.0,
        text: "A Pichu with a spiky ear plays at the shrine, as if it came here through time."
    },
    {
        kind: "boss",
        id: "mtSilverRed",
        region: "johto",
        speciesId: 25,
        level: 88,
        place: "Mt. Silver summit",
        badgesRequired: 8,
        postGame: true,
        trainer: {
            id: "red",
            name: "Red",
            title: "Pokémon Trainer",
            specialty: null,
            team: [
                { id: 25, level: 88 },
                { id: 196, level: 84 },
                { id: 143, level: 82 },
                { id: 3, level: 84 },
                { id: 6, level: 84 },
                { id: 9, level: 84 }
            ],
            timeLimit: timeLimit(6),
            statMultiplier: 3.0,
            prizeMoney: 8800,
            quote: "…"
        },
        prizeBalls: { masterBall: 1 },
        text: "A silent Trainer waits in the snow at the top of Mt. Silver. Beat him to win a Master Ball."
    }
];

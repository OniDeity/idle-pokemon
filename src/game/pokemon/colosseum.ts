/**
 * Orre, as Pokémon Colosseum tells it. There are no wild Pokémon: every place's encounters are
 * trainers' Pokémon, which can't be caught, plus the Shadow Pokémon Cipher hands out, which the
 * Snag Machine can take. Shadow Pokémon (and their trainers and levels) follow Serebii's list
 * of Colosseum's obtainable Pokémon; the Cipher admins' teams follow its Cipher page.
 */
import type { EncounterEntry } from "./data";
import { enc, SHADOW_OFFSET } from "./data";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { timeLimit, trial } from "./trainers";
import type { ZoneDefinition } from "./zones";

type Shadow = [species: number, level: number, trainer: string];
type Fodder = [species: number, minLevel: number, maxLevel: number];

/** Who hands out each Shadow Pokémon met around Orre, by its Shadow form's id. */
export const SHADOW_TRAINERS: Record<number, string> = {};

/** Shadow Pokémon make up about this share of a place's battles until they're all snagged. */
const SHADOW_WEIGHT = 6;

function place(
    id: string,
    name: string,
    badgesRequired: number,
    blurb: string,
    fodder: Fodder[],
    shadows: Shadow[],
    extra: Partial<ZoneDefinition> = {}
): ZoneDefinition {
    const walk: EncounterEntry[] = [
        ...fodder.map(([species, min, max]) => enc(species, min, max, 10)),
        ...shadows.map(([species, level, trainer]) => {
            SHADOW_TRAINERS[SHADOW_OFFSET + species] = trainer;
            return enc(SHADOW_OFFSET + species, level, level, SHADOW_WEIGHT);
        })
    ];
    return {
        id,
        name,
        region: "orre",
        badgesRequired,
        blurb,
        trainerBattles: true,
        encounters: { walk },
        ...extra
    };
}

export const COLOSSEUM_ZONES: ZoneDefinition[] = [
    place(
        "outskirtStand",
        "Outskirt Stand",
        0,
        "A diner built from an old train, the only stop for miles of desert.",
        [
            [263, 22, 26],
            [276, 22, 26],
            [278, 22, 26],
            [285, 22, 26],
            [293, 22, 26]
        ],
        []
    ),
    place(
        "phenacCity",
        "Phenac City",
        0,
        "A city of fountains in the desert, where a Mystery Troop guards the gates.",
        [
            [273, 25, 30],
            [270, 25, 30],
            [261, 25, 30],
            [280, 25, 30],
            [300, 25, 30],
            [265, 25, 30]
        ],
        [
            [296, 30, "Miror B. Peon Trudly"],
            [153, 30, "Mystery Troop Verde"],
            [156, 30, "Mystery Troop Rosso"],
            [159, 30, "Mystery Troop Bluno"]
        ]
    ),
    place(
        "pyriteTown",
        "Pyrite Town",
        0,
        "A lawless town of rogues and riders, under Miror B.'s thumb.",
        [
            [262, 28, 33],
            [274, 28, 33],
            [294, 28, 33],
            [302, 28, 33],
            [335, 28, 33],
            [336, 28, 33]
        ],
        [
            [200, 30, "Rider Vant"],
            [218, 30, "St. Performer Lon"],
            [164, 30, "Rider Nover"],
            [180, 30, "Performer Diogo"],
            [188, 30, "Rider Leba"],
            [195, 30, "Bandana Guy Divel"],
            [162, 33, "Rogue Cail"],
            [193, 33, "Cipher Peon Nore"],
            [223, 20, "Miror B. Peon Reath"],
            [226, 33, "Miror B. Peon Ferma"],
            [211, 33, "Hunter Doken"]
        ]
    ),
    place(
        "pyriteCave",
        "Pyrite Cave",
        0,
        "The tunnels under Pyrite Town, where Miror B. dances in the dark.",
        [
            [74, 30, 35],
            [75, 30, 35],
            [42, 30, 35],
            [299, 30, 35],
            [337, 30, 35],
            [271, 30, 35]
        ],
        [
            [206, 33, "Rider Sosh"],
            [307, 33, "Rider Twan"],
            [333, 33, "Hunter Zalo"]
        ]
    ),
    place(
        "agateVillage",
        "Agate Village",
        1,
        "A quiet village of retired Trainers, home of the Relic Stone and Celebi's shrine.",
        [
            [107, 33, 38],
            [286, 33, 38],
            [352, 33, 38],
            [327, 33, 38],
            [264, 33, 38]
        ],
        [[237, 38, "Cipher Peon Skrub"]]
    ),
    place(
        "mtBattle",
        "Mt. Battle",
        1,
        "A mountain of battle platforms; a hundred straight wins draws a legend to the top.",
        [
            [67, 35, 42],
            [297, 35, 42],
            [308, 35, 42],
            [323, 35, 42],
            [324, 35, 42],
            [277, 35, 42]
        ],
        []
    ),
    place(
        "theUnder",
        "The Under",
        2,
        "An underground city of neon and smugglers, run on Venus's broadcasts.",
        [
            [89, 40, 45],
            [110, 40, 45],
            [303, 40, 45],
            [342, 40, 45],
            [354, 40, 45]
        ],
        [
            [166, 43, "Cipher Peon Kloak"],
            [207, 43, "Hunter Frena"],
            [215, 43, "Rider Nelis"],
            [221, 43, "Bodybuilder Lonia"],
            [234, 43, "Chaser Liaks"]
        ]
    ),
    place(
        "deepColosseum",
        "Deep Colosseum",
        2,
        "The Under's secret arena, ruled by Deep King Agnol.",
        [
            [275, 44, 48],
            [295, 44, 48],
            [291, 44, 48],
            [272, 44, 48]
        ],
        [[213, 45, "Deep King Agnol"]]
    ),
    place(
        "shadowLab",
        "Shadow Pokémon Lab",
        3,
        "Ein's laboratory, where Cipher closes the hearts of Pokémon.",
        [
            [82, 42, 46],
            [101, 42, 46],
            [233, 42, 46],
            [344, 42, 46],
            [338, 42, 46]
        ],
        [
            [168, 43, "Cipher Peon Lesar"],
            [190, 43, "Cipher Peon Cole"],
            [198, 43, "Cipher Peon Lare"],
            [205, 43, "Cipher Peon Vana"],
            [210, 43, "Cipher Peon Tanie"],
            [329, 43, "Cipher Peon Remil"]
        ]
    ),
    place(
        "realgamTower",
        "Realgam Tower",
        4,
        "Cipher's glittering base, with a Colosseum at its peak.",
        [
            [65, 46, 52],
            [282, 46, 52],
            [365, 46, 52],
            [362, 46, 52],
            [334, 46, 52],
            [350, 46, 52]
        ],
        [
            [192, 45, "Cipher Peon Baila"],
            [225, 45, "Cipher Peon Arton"],
            [214, 45, "Cipher Peon Dioge"],
            [241, 48, "Bodybuilder Jonas"],
            [359, 48, "Rider Delan"],
            [229, 48, "Cipher Peon Nella"],
            [357, 49, "Cipher Peon Ston"]
        ]
    ),
    place(
        "snagemHideout",
        "Snagem Hideout",
        4,
        "Team Snagem's old desert base, where the Snag Machine was built.",
        [
            [342, 44, 48],
            [319, 44, 48],
            [262, 44, 48],
            [229, 44, 48]
        ],
        [
            [235, 45, "Snagem Grunt Biden"],
            [217, 45, "Snagem Grunt Agrev"]
        ]
    ),
    place(
        "outskirtStandCipher",
        "Outskirt Stand (Cipher's last stand)",
        4,
        "With Cipher beaten, a lone Peon makes a last stand at the diner.",
        [
            [263, 40, 45],
            [276, 40, 45],
            [285, 40, 45]
        ],
        [[176, 20, "Cipher Peon Fein"]],
        { postGame: true }
    )
];

/**
 * Stat multipliers for the Cipher admins and Realgam Tower, tuned with
 * scripts/simulateProgression.ts (which purifies Shadow Pokémon as they open their hearts, and has
 * Hoenn's Double Battles): a first clear after Hoenn takes about 11 hours (Miror B. around 40 minutes in, Ein around 7.5
 * hours).
 */
const ADMIN_STRENGTHS = [3.0, 3.8, 4.02, 4.26];
const REALGAM_STRENGTH = 3.0;

function admin(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "keyItems"> & {
        keyItems?: Parameters<typeof trial>[0]["keyItems"];
    }
): GymDefinition {
    return trial({
        keyItems: [],
        ...options,
        statMultiplier: ADMIN_STRENGTHS[options.badgeNumber - 1]
    });
}

export const COLOSSEUM_TRIALS: GymDefinition[] = [
    admin({
        id: "mirorB",
        name: "Miror B.",
        title: "Cipher Admin",
        town: "Pyrite Cave",
        badge: "Pyrite Town freed",
        badgeNumber: 1,
        specialty: "water",
        team: [
            { id: 185, level: 35 },
            { id: 272, level: 29 },
            { id: 272, level: 30 },
            { id: 272, level: 28 },
            { id: 272, level: 31 }
        ],
        snag: [185],
        rewardText:
            "Pyrite Town is free. In Agate Village, Eagun shows you the Relic Stone, which can purify a Shadow Pokémon's heart.",
        quote: "Let's get this party started! My Ludicolo are ready to dance!"
    }),
    admin({
        id: "dakim",
        name: "Dakim",
        title: "Cipher Admin",
        town: "Mt. Battle",
        badge: "Mt. Battle saved",
        badgeNumber: 2,
        specialty: "ground",
        team: [
            { id: 244, level: 40 },
            { id: 375, level: 37 },
            { id: 259, level: 36 },
            { id: 76, level: 38 },
            { id: 323, level: 38 }
        ],
        snag: [244],
        rewardText: "Vander gives you the Time Flute. Dakim retreats toward The Under.",
        quote: "I'll smash you flat! Entei, burn them to the ground!"
    }),
    admin({
        id: "venus",
        name: "Venus",
        title: "Cipher Admin",
        town: "The Under",
        badge: "The Under's broadcasts stopped",
        badgeNumber: 3,
        specialty: "normal",
        team: [
            { id: 245, level: 40 },
            { id: 301, level: 45 },
            { id: 45, level: 44 },
            { id: 354, level: 45 },
            { id: 208, level: 45 }
        ],
        snag: [245],
        rewardText: "Venus flees to the Shadow Pokémon Lab, and you find the Card Key to follow.",
        quote: "Aren't my Pokémon simply darling? Suicune, show them your beauty."
    }),
    admin({
        id: "ein",
        name: "Ein",
        title: "Cipher Admin",
        town: "Shadow Pokémon Lab",
        badge: "Shadow Pokémon Lab shut down",
        badgeNumber: 4,
        specialty: "electric",
        team: [
            { id: 243, level: 40 },
            { id: 171, level: 47 },
            { id: 334, level: 46 },
            { id: 367, level: 47 },
            { id: 42, level: 48 }
        ],
        snag: [243],
        rewardText:
            "Ein escapes, saying he has handed the ultimate Shadow Pokémon to Cipher's boss. Realgam Tower awaits.",
        quote: "My research is perfect. A Shadow Pokémon is a fighting machine without a heart."
    })
];

function realgam(
    id: string,
    name: string,
    title: string,
    team: [number, number][],
    snag: number[],
    quote: string
): TrainerDefinition {
    const ace = Math.max(...team.map(([, level]) => level));
    return {
        id,
        name,
        title,
        specialty: null,
        team: team.map(([species, level]) => ({ id: species, level })),
        timeLimit: timeLimit(team.length),
        statMultiplier: REALGAM_STRENGTH,
        prizeMoney: ace * 100,
        quote,
        snag
    };
}

/** Realgam Tower's Colosseum: Gonzap, then Nascour, then Cipher's head, Evice. */
export function colosseumFinale(): TrainerDefinition[] {
    return [
        realgam(
            "gonzap",
            "Gonzap",
            "Team Snagem's Head",
            [
                [227, 47],
                [342, 52],
                [127, 52],
                [297, 53],
                [275, 53]
            ],
            [227],
            "You stole my Snag Machine. Now I'm taking it back!"
        ),
        realgam(
            "nascour",
            "Nascour",
            "Cipher Admin",
            [
                [376, 50],
                [282, 55],
                [178, 54],
                [356, 55],
                [365, 56],
                [257, 54]
            ],
            [376],
            "Cipher will rule Orre's battles. Metagross, crush this child."
        ),
        realgam(
            "evice",
            "Evice",
            "Cipher's Head",
            [
                [248, 55],
                [373, 60],
                [68, 61],
                [212, 60],
                [289, 60],
                [199, 61]
            ],
            [248],
            "I am the mayor of Phenac and the head of Cipher. Behold my ultimate Shadow Pokémon!"
        )
    ];
}

export const COLOSSEUM_SPECIALS: SpecialEncounter[] = [
    {
        kind: "gift",
        id: "dukingPlusle",
        region: "orre",
        speciesId: 311,
        level: 13,
        place: "Pyrite Town, Duking's house",
        badgesRequired: 1,
        text: "Duking thanks you for freeing Pyrite Town with his Plusle."
    },
    {
        kind: "legendary",
        id: "mtBattleHoOh",
        region: "orre",
        speciesId: 250,
        level: 70,
        zoneId: "mtBattle",
        place: "Mt. Battle, after 100 straight wins",
        badgesRequired: 4,
        postGame: true,
        strength: 2.8,
        text: "A hundred straight wins on Mt. Battle, and Ho-Oh descends to test you."
    }
];

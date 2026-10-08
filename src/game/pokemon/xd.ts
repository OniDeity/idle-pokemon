/**
 * Orre five years later, as Pokémon XD: Gale of Darkness tells it. Like Colosseum, places are
 * trainer battles holding Cipher's Shadow Pokémon (from Serebii's list of XD's obtainable
 * Pokémon, with their trainers and levels), plus XD's own wild Pokémon at the Poké Spots, which
 * come for Poké Snacks. The Cipher admins' teams follow Serebii's XD walkthrough.
 */
import type { EncounterEntry } from "./data";
import { enc, SHADOW_OFFSET } from "./data";
import { SHADOW_TRAINERS } from "./colosseum";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { timeLimit, trial } from "./trainers";
import type { RegionId, ZoneDefinition } from "./zones";

type Shadow = [species: number, level: number, trainer: string];
type Fodder = [species: number, minLevel: number, maxLevel: number];

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
        region: "orreXd",
        badgesRequired,
        blurb,
        trainerBattles: true,
        encounters: { walk },
        ...extra
    };
}

/**
 * XD's Poké Spots and their snack-loving wild Pokémon (common, uncommon, rare), as one table each.
 * The Cave Spot is also where Wanderer Miror B. turns up with a Shadow Voltorb.
 */
const POKE_SPOTS: [id: string, name: string, blurb: string, species: [number, number][]][] = [
    [
        "rock",
        "Rock Poké Spot",
        "A rocky hollow in the desert where Sandshrew and Gligar come for snacks.",
        [
            [27, 60],
            [207, 30],
            [328, 10]
        ]
    ],
    [
        "oasis",
        "Oasis Poké Spot",
        "A spring among the dunes, visited by Hoppip and Phanpy.",
        [
            [187, 60],
            [231, 30],
            [283, 10]
        ]
    ],
    [
        "cave",
        "Cave Poké Spot",
        "A cool cave mouth where Zubat, Aron and Wooper gather.",
        [
            [41, 60],
            [304, 30],
            [194, 10]
        ]
    ]
];

/** All three spots' Pokémon, for the Poké Spots that other regions get once unlocked. */
const ALL_SPOT_SPECIES: [number, number][] = POKE_SPOTS.flatMap(([, , , species]) => species);

export const XD_ZONES: ZoneDefinition[] = [
    place(
        "gateonPort",
        "Gateon Port & HQ Lab",
        0,
        "Orre's harbor town, and Professor Krane's Pokémon HQ Lab where your journey starts.",
        [
            [263, 8, 12],
            [278, 8, 12],
            [276, 8, 12],
            [293, 8, 12],
            [300, 8, 12]
        ],
        [
            [216, 11, "Spy Naps"],
            [165, 10, "Casual Guy Cyle"],
            [261, 10, "Bodybuilder Kilen"]
        ]
    ),
    place(
        "cipherLab",
        "Cipher Lab",
        0,
        "Cipher's hidden laboratory, where Lovrina's peons guard rows of Shadow Pokémon.",
        [
            [273, 14, 19],
            [285, 14, 19],
            [81, 14, 19],
            [100, 14, 19],
            [109, 14, 19]
        ],
        [
            [228, 17, "Cipher Peon Resix"],
            [343, 17, "Cipher Peon Browsix"],
            [363, 17, "Cipher Peon Blusix"],
            [179, 17, "Cipher Peon Yellosix"],
            [316, 17, "Cipher Peon Purpsix"],
            [273, 17, "Cipher Peon Greesix"],
            [167, 14, "Cipher Peon Nexir"],
            [322, 14, "Cipher Peon Solox"],
            [285, 15, "Cipher R&D Klots"],
            [318, 15, "Cipher Peon Cabol"]
        ]
    ),
    place(
        "onbsStation",
        "ONBS Station",
        1,
        "Orre's broadcasting tower, seized by Commander Exol's peons.",
        [
            [309, 17, 22],
            [100, 17, 22],
            [81, 17, 22],
            [325, 17, 22],
            [177, 17, 22]
        ],
        [
            [296, 18, "Cipher Peon Torkin"],
            [37, 18, "Cipher Peon Mesin"],
            [355, 19, "Cipher Peon Labor"],
            [280, 20, "Cipher Peon Feldas"],
            [303, 22, "Cipher Commander Exol"]
        ]
    ),
    place(
        "phenacCityXd",
        "Phenac City",
        1,
        "Phenac's fountains, the Mayor's House and the Training School, all crawling with Cipher.",
        [
            [270, 20, 24],
            [183, 20, 24],
            [300, 20, 24],
            [280, 20, 24],
            [360, 20, 24]
        ],
        [
            [361, 20, "Cipher Peon Exinn"],
            [204, 20, "Cipher Peon Gonrag"],
            [177, 22, "Cipher Peon Eloin"],
            [315, 22, "Cipher Peon Fasin"],
            [52, 22, "Cipher Peon Fostin"]
        ]
    ),
    place(
        "phenacStadium",
        "Phenac Stadium",
        1,
        "The stadium where Snattle, Phenac's own mayor, holds court for Cipher.",
        [
            [294, 22, 27],
            [271, 22, 27],
            [274, 22, 27],
            [66, 22, 27],
            [281, 22, 27]
        ],
        [
            [220, 22, "Cipher Peon Greck"],
            [21, 22, "Cipher Peon Ezin"],
            [88, 23, "Cipher Peon Faltly"],
            [86, 23, "Cipher Peon Egrog"],
            [299, 26, "Wanderer Miror B."]
        ]
    ),
    ...POKE_SPOTS.map(([key, name, blurb, species]) => ({
        id: `${key}PokeSpot`,
        name,
        region: "orreXd" as RegionId,
        badgesRequired: 1,
        blurb: `${blurb} Each visit uses a Poké Snack.`,
        pokeSpot: true,
        encounters: {
            walk: [
                ...species.map(([id, weight]) => enc(id, 10, 20, weight)),
                ...(key === "cave" ? [enc(SHADOW_OFFSET + 100, 19, 19, 5)] : [])
            ]
        }
    })),
    place(
        "mtBattleXd",
        "Mt. Battle",
        1,
        "Mt. Battle reopened: a hundred wins earns one of Johto's first partners.",
        [
            [67, 25, 33],
            [297, 25, 33],
            [308, 25, 33],
            [324, 25, 33],
            [323, 25, 33],
            [277, 25, 33]
        ],
        []
    ),
    place(
        "pyriteTownXd",
        "Pyrite Town",
        2,
        "Pyrite cleaned up since Colosseum; Duking still trades Pokémon here.",
        [
            [262, 26, 31],
            [264, 26, 31],
            [302, 26, 31],
            [336, 26, 31],
            [342, 26, 31]
        ],
        []
    ),
    place(
        "outskirtStandXd",
        "Outskirt Stand",
        2,
        "The desert diner again, where a Trainer named Danny hands over a Shadow Togepi.",
        [
            [264, 25, 30],
            [277, 25, 30],
            [279, 25, 30],
            [286, 25, 30]
        ],
        [[175, 25, "Hordel"]]
    ),
    place(
        "cipherKeyLair",
        "Cipher Key Lair",
        2,
        "Gorigan's lair beneath the desert, a factory of Shadow Pokémon.",
        [
            [42, 28, 34],
            [110, 28, 34],
            [89, 28, 34],
            [228, 28, 34],
            [262, 28, 34]
        ],
        [
            [335, 28, "Thug Zook"],
            [46, 28, "Cipher Peon Humah"],
            [58, 28, "Cipher Peon Humah"],
            [90, 29, "Cipher Peon Gorog"],
            [15, 30, "Cipher Peon Lok"],
            [17, 30, "Cipher Peon Lok"],
            [114, 30, "Cipher Peon Targ"],
            [12, 30, "Cipher Peon Targ"],
            [82, 30, "Cipher Peon Snidle"],
            [49, 32, "Cipher Peon Angic"],
            [70, 32, "Cipher Peon Angic"],
            [24, 33, "Cipher Peon Smarton"]
        ]
    ),
    place(
        "citadarkIsle",
        "Citadark Isle",
        3,
        "Cipher's island fortress, reached by sea through a storm.",
        [
            [319, 33, 41],
            [342, 33, 41],
            [356, 33, 41],
            [359, 33, 41],
            [229, 33, 41],
            [110, 33, 41]
        ],
        [
            [55, 33, "Navigator Abson"],
            [302, 33, "Navigator Abson"],
            [20, 34, "Chaser Furgy"],
            [85, 34, "Chaser Furgy"],
            [83, 36, "Cipher Admin Lovrina"],
            [334, 36, "Cipher Admin Lovrina"],
            [115, 36, "Cipher Peon Litnar"],
            [354, 37, "Cipher Peon Litnar"],
            [126, 36, "Cipher Peon Grupel"],
            [127, 35, "Cipher Peon Grupel"],
            [219, 38, "Cipher Peon Kolest"],
            [78, 40, "Cipher Peon Kolest"]
        ]
    ),
    place(
        "citadarkTower",
        "Citadark Isle Tower",
        4,
        "The fortress's inner tower, where the admins make their last stand.",
        [
            [282, 40, 46],
            [365, 40, 46],
            [362, 40, 46],
            [344, 40, 46],
            [375, 40, 46],
            [65, 40, 46]
        ],
        [
            [106, 38, "Cipher Peon Petro"],
            [107, 38, "Cipher Peon Karbon"],
            [108, 38, "Cipher Peon Gefta"],
            [123, 40, "Cipher Peon Leden"],
            [113, 39, "Cipher Peon Leden"],
            [338, 41, "Cipher Admin Snattle"],
            [121, 41, "Cipher Admin Snattle"],
            [62, 43, "Cipher Admin Gorigan"],
            [122, 43, "Cipher Admin Gorigan"],
            [51, 40, "Cipher Peon Stron"]
        ]
    ),
    place(
        "gateonPortMirorB",
        "Gateon Port (Miror B.'s return)",
        5,
        "With Cipher beaten, Wanderer Miror B. dances back into port with a Shadow Dragonite.",
        [[272, 50, 57]],
        [[149, 55, "Wanderer Miror B."]],
        { postGame: true }
    )
];

SHADOW_TRAINERS[SHADOW_OFFSET + 100] = "Wanderer Miror B.";

/** Levels for each region's Poké Spots once the Poké Spots mechanic carries them there. */
const SPOT_LEVELS: Partial<Record<RegionId, [number, number]>> = {
    kanto: [8, 18],
    orange: [15, 25],
    sevii: [30, 40],
    johto: [12, 22],
    hoenn: [14, 24],
    orre: [28, 36]
};

/** Every other region's Poké Spots: XD's nine spot Pokémon, once the mechanic is unlocked. */
export const CARRIED_POKE_SPOTS: ZoneDefinition[] = (
    Object.entries(SPOT_LEVELS) as [RegionId, [number, number]][]
).map(([region, [min, max]]) => ({
    id: `${region}PokeSpots`,
    name: "Poké Spots",
    region,
    badgesRequired: 0,
    blurb: "XD's Poké Spots, here too: snack-loving wild Pokémon come out for a Poké Snack each.",
    pokeSpot: true,
    mechanic: "pokeSpots",
    encounters: { walk: ALL_SPOT_SPECIES.map(([id, weight]) => enc(id, min, max, weight)) }
}));

/**
 * Stat multipliers for XD's admins and Citadark Isle, tuned with
 * scripts/simulateProgression.ts (with Double Battles): a first clear after Colosseum takes about
 * 10-11 hours.
 */
const XD_ADMIN_STRENGTHS = [1.97, 2.62, 2.3, 2.41, 2.85];
const CITADARK_STRENGTH = 3.17;
/**
 * v2.12.3's retune: the simulator's first clear had drifted to about 9 hours, so every trial and the
 * finale are this much stronger (strengths above are the earlier tuning), back to about 11.
 */
const XD_TUNING = 1.06;

function admin(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "keyItems">
): GymDefinition {
    return trial({
        keyItems: [],
        ...options,
        statMultiplier: XD_TUNING * XD_ADMIN_STRENGTHS[options.badgeNumber - 1]
    });
}

export const XD_TRIALS: GymDefinition[] = [
    admin({
        id: "lovrina",
        name: "Lovrina",
        title: "Cipher Admin",
        town: "Cipher Lab",
        badge: "Cipher Lab raided",
        badgeNumber: 1,
        specialty: "grass",
        team: [
            { id: 370, level: 20 },
            { id: 267, level: 19 },
            { id: 315, level: 19 },
            { id: 301, level: 18 }
        ],
        snag: [301],
        rewardText:
            "You rescue Professor Krane, and the ONBS Station and Phenac City open up. Poké Spots dot the desert.",
        quote: "My lab, my darling Shadow Pokémon! You'll pay for this, little snoop!"
    }),
    admin({
        id: "snattle",
        name: "Snattle",
        title: "Cipher Admin",
        town: "Phenac Stadium",
        badge: "Phenac Stadium freed",
        badgeNumber: 2,
        specialty: "water",
        team: [
            { id: 171, level: 26 },
            { id: 195, level: 26 },
            { id: 337, level: 25 },
            { id: 351, level: 27 },
            { id: 375, level: 28 }
        ],
        snag: [337],
        rewardText: "Phenac's mayor is unmasked. Pyrite Town and the Outskirt Stand lie ahead.",
        quote: "Phenac's mayor, a Cipher admin? Why, nobody will ever believe you."
    }),
    admin({
        id: "gorigan",
        name: "Gorigan",
        title: "Cipher Admin",
        town: "Cipher Key Lair",
        badge: "Cipher Key Lair cleared",
        badgeNumber: 3,
        specialty: "fighting",
        team: [
            { id: 305, level: 36 },
            { id: 364, level: 36 },
            { id: 199, level: 36 },
            { id: 217, level: 36 },
            { id: 57, level: 34 },
            { id: 97, level: 34 }
        ],
        snag: [57, 97],
        rewardText: "The lair's shadow factory is down. A ship can take you to Citadark Isle.",
        quote: "Muscle wins every argument! My Pokémon and I will crush you!"
    }),
    admin({
        id: "ardos",
        name: "Ardos",
        title: "Cipher Admin",
        town: "Citadark Isle",
        badge: "Ardos defeated",
        badgeNumber: 4,
        specialty: "flying",
        team: [
            { id: 277, level: 43 },
            { id: 65, level: 44 },
            { id: 230, level: 44 },
            { id: 214, level: 44 },
            { id: 125, level: 43 },
            { id: 143, level: 43 }
        ],
        snag: [277, 125, 143],
        rewardText: "Greevil's blue bodyguard falls. The fortress's tower is open.",
        quote: "Cipher never dies. You'll learn that, child."
    }),
    admin({
        id: "eldes",
        name: "Eldes",
        title: "Cipher Admin",
        town: "Citadark Isle",
        badge: "Eldes defeated",
        badgeNumber: 5,
        specialty: "dragon",
        team: [
            { id: 291, level: 45 },
            { id: 310, level: 44 },
            { id: 373, level: 50 },
            { id: 330, level: 45 },
            { id: 105, level: 44 },
            { id: 131, level: 44 }
        ],
        snag: [310, 373, 105, 131],
        rewardText: "Greevil's red bodyguard stands aside. Only Greevil and XD001 remain.",
        quote: "My father's dream... I will see it through, even against you."
    })
];

function citadark(
    id: string,
    name: string,
    title: string,
    team: [number, number][],
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
        statMultiplier: CITADARK_STRENGTH,
        prizeMoney: ace * 100,
        quote,
        // Everything on these teams is a Shadow Pokémon.
        snag: team.map(([species]) => species)
    };
}

/** Citadark Isle's summit: XD001, Shadow Lugia, then Cipher's Grand Master Greevil. */
export function xdFinale(): TrainerDefinition[] {
    return xdFinaleUntuned().map(t => ({ ...t, statMultiplier: t.statMultiplier * XD_TUNING }));
}

function xdFinaleUntuned(): TrainerDefinition[] {
    return [
        citadark(
            "xd001",
            "XD001",
            "Shadow Pokémon",
            [[249, 50]],
            "The ceiling opens, and the storm-black Lugia, XD001, dives at you."
        ),
        citadark(
            "greevil",
            "Greevil",
            "Cipher's Grand Master",
            [
                [146, 50],
                [112, 46],
                [144, 50],
                [103, 46],
                [145, 50],
                [128, 46]
            ],
            "XD001 was only the beginning. Behold the legendary birds, made Shadow!"
        )
    ];
}

export const XD_SPECIALS: SpecialEncounter[] = [
    {
        kind: "trade",
        id: "dannyElekid",
        region: "orreXd",
        speciesId: 239,
        level: 20,
        place: "Outskirt Stand, Danny",
        badgesRequired: 2,
        wants: 175,
        text: "Danny wants to see the Togepi he gave you, purified, and offers an Elekid."
    },
    {
        kind: "trade",
        id: "dukingMeditite",
        region: "orreXd",
        speciesId: 307,
        level: 20,
        place: "Pyrite Town, Duking",
        badgesRequired: 2,
        wants: 328,
        text: "Duking trades a Meditite for a look at a Trapinch from the Poké Spots."
    },
    {
        kind: "trade",
        id: "dukingShuckle",
        region: "orreXd",
        speciesId: 213,
        level: 20,
        place: "Pyrite Town, Duking",
        badgesRequired: 2,
        wants: 283,
        text: "Duking trades a Shuckle for a look at a Surskit from the Poké Spots."
    },
    {
        kind: "trade",
        id: "dukingLarvitar",
        region: "orreXd",
        speciesId: 246,
        level: 20,
        place: "Pyrite Town, Duking",
        badgesRequired: 2,
        wants: 194,
        text: "Duking trades a Larvitar for a look at a Wooper from the Poké Spots."
    },
    ...(
        [
            ["mtBattleChikorita", 152],
            ["mtBattleCyndaquil", 155],
            ["mtBattleTotodile", 158]
        ] as [string, number][]
    ).map(
        ([id, speciesId]): SpecialEncounter => ({
            kind: "gift",
            id,
            region: "orreXd",
            speciesId,
            level: 70,
            place: "Mt. Battle, after the 100-battle challenge",
            badgesRequired: 5,
            postGame: true,
            text: "Clearing Mt. Battle's challenge earns one of Johto's first partners."
        })
    )
];

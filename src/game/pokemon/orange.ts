/**
 * The Orange Islands, from the animated series: four Orange Crew Gym challenges and the
 * Winner's Cup against Drake. Encounter tables are hand-authored from the islands' episodes.
 */
import { enc } from "./data";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { trial } from "./trainers";
import type { ZoneDefinition } from "./zones";

function zone(options: Omit<ZoneDefinition, "region" | "anime">): ZoneDefinition {
    return { region: "orange", anime: true, ...options };
}

export const ORANGE_ZONES: ZoneDefinition[] = [
    zone({
        id: "valenciaIsland",
        name: "Valencia Island",
        badgesRequired: 0,
        blurb: "Professor Ivy's island, where the Pokémon grow in unusual colors.",
        encounters: {
            walk: [
                enc(10, 3, 6, 20),
                enc(43, 4, 8, 15),
                enc(16, 4, 8, 15),
                enc(102, 6, 9, 10),
                enc(2046, 4, 8, 15),
                enc(2029, 4, 8, 10),
                enc(2032, 4, 8, 10),
                enc(2020, 8, 10, 5),
                enc(2012, 8, 10, 4),
                enc(2070, 8, 10, 4),
                enc(2044, 8, 11, 4),
                enc(2045, 10, 12, 2)
            ],
            surf: [enc(72, 5, 10, 70), enc(98, 5, 10, 30)]
        }
    }),
    zone({
        id: "tangeloIsland",
        name: "Tangelo Island",
        badgesRequired: 0,
        blurb: "A rocky island where a young Lapras once hid from poachers.",
        encounters: {
            walk: [
                enc(19, 5, 9, 20),
                enc(21, 5, 9, 20),
                enc(23, 6, 10, 15),
                enc(52, 6, 10, 15),
                enc(98, 6, 10, 20),
                enc(27, 6, 10, 10)
            ],
            surf: [enc(72, 6, 12, 50), enc(116, 6, 12, 30), enc(131, 12, 14, 2)]
        }
    }),
    zone({
        id: "mikanIsland",
        name: "Mikan Island",
        badgesRequired: 0,
        blurb: "Home of Cissy, the first Orange Crew Gym Leader, and her water challenges.",
        encounters: {
            walk: [
                enc(54, 8, 12, 25),
                enc(120, 8, 12, 20),
                enc(86, 9, 13, 15),
                enc(90, 8, 12, 20),
                enc(118, 8, 12, 20)
            ],
            surf: [enc(116, 8, 14, 40), enc(90, 8, 14, 30), enc(86, 10, 14, 30)]
        }
    }),
    zone({
        id: "sunburstIsland",
        name: "Sunburst Island",
        badgesRequired: 1,
        blurb: "A town of glassblowers famous for its crystal Dragonite.",
        encounters: {
            walk: [
                enc(183, 12, 16, 25),
                enc(60, 12, 16, 20),
                enc(120, 13, 17, 15),
                enc(118, 13, 17, 15),
                enc(58, 12, 16, 10),
                enc(77, 13, 17, 15)
            ],
            surf: [enc(72, 12, 18, 50), enc(170, 14, 18, 30), enc(129, 10, 15, 20)]
        }
    }),
    zone({
        id: "navelIsland",
        name: "Navel Island",
        badgesRequired: 1,
        blurb: "Danny's island, crowned with an icy mountain and a geyser.",
        encounters: {
            walk: [
                enc(74, 14, 18, 25),
                enc(27, 14, 18, 20),
                enc(29, 14, 18, 15),
                enc(32, 14, 18, 15),
                enc(56, 15, 19, 15),
                enc(95, 18, 20, 5),
                enc(87, 20, 22, 3)
            ]
        }
    }),
    zone({
        id: "moroIsland",
        name: "Moro Island",
        badgesRequired: 1,
        blurb: "A mist-covered island whose Gastly are said to be the ghosts of Pokémon past.",
        encounters: {
            walk: [
                enc(92, 15, 19, 40),
                enc(41, 15, 19, 30),
                enc(93, 20, 22, 10),
                enc(42, 20, 22, 10),
                enc(200, 18, 20, 5)
            ]
        }
    }),
    zone({
        id: "pinkanIsland",
        name: "Pinkan Island",
        badgesRequired: 2,
        blurb: "A protected reserve where Pinkan Berries turn every Pokémon pink.",
        encounters: {
            walk: [
                enc(1010, 20, 23, 10),
                enc(1013, 20, 23, 10),
                enc(1016, 20, 24, 10),
                enc(1019, 20, 24, 10),
                enc(1029, 21, 25, 8),
                enc(1032, 21, 25, 8),
                enc(1046, 21, 25, 8),
                enc(1048, 21, 25, 8),
                enc(1050, 21, 25, 8),
                enc(1056, 21, 25, 8),
                enc(1069, 21, 25, 8),
                enc(1103, 23, 26, 6),
                enc(1111, 23, 26, 6),
                enc(1085, 24, 26, 4),
                enc(1047, 25, 27, 3),
                enc(1057, 25, 27, 3),
                enc(1045, 25, 27, 2),
                enc(1034, 26, 28, 2),
                enc(1112, 26, 28, 2)
            ]
        }
    }),
    zone({
        id: "trovitaIsland",
        name: "Trovita Island",
        badgesRequired: 2,
        blurb: "Rudy's island, where a lighthouse stands above a water-filled Gym.",
        encounters: {
            walk: [
                enc(81, 22, 26, 25),
                enc(100, 22, 26, 25),
                enc(120, 22, 26, 20),
                enc(125, 26, 28, 5),
                enc(179, 22, 26, 20),
                enc(121, 26, 28, 5)
            ],
            surf: [enc(170, 22, 28, 50), enc(222, 22, 28, 30), enc(211, 24, 28, 20)]
        }
    }),
    zone({
        id: "mandarinIsland",
        name: "Mandarin Island South",
        badgesRequired: 2,
        blurb: "A busy port town with a Pokémon Center, a PokéMart and plenty of trouble.",
        encounters: {
            walk: [
                enc(66, 21, 25, 20),
                enc(56, 21, 25, 15),
                enc(58, 21, 25, 15),
                enc(77, 22, 26, 15),
                enc(20, 23, 26, 15),
                enc(96, 22, 26, 15),
                enc(209, 20, 24, 5)
            ]
        }
    }),
    zone({
        id: "kumquatIsland",
        name: "Kumquat Island",
        badgesRequired: 3,
        blurb: "A resort island and home of Luana, the last Orange Crew Gym Leader.",
        encounters: {
            walk: [
                enc(79, 28, 32, 25),
                enc(54, 28, 32, 20),
                enc(61, 29, 33, 20),
                enc(55, 32, 34, 10),
                enc(80, 33, 35, 5),
                enc(194, 28, 32, 20)
            ],
            surf: [enc(73, 30, 36, 50), enc(117, 30, 34, 30), enc(195, 32, 36, 20)]
        }
    }),
    zone({
        id: "murcottIsland",
        name: "Murcott Island",
        badgesRequired: 3,
        blurb: "Berry farms stretch across the island — and something big is eating them.",
        encounters: {
            walk: [
                enc(69, 28, 32, 20),
                enc(70, 32, 34, 10),
                enc(43, 28, 32, 20),
                enc(44, 32, 34, 10),
                enc(46, 28, 32, 15),
                enc(47, 32, 34, 10),
                enc(187, 28, 32, 15)
            ]
        }
    }),
    zone({
        id: "pummeloIsland",
        name: "Pummelo Island",
        badgesRequired: 4,
        blurb: "The Orange League stadium, where Drake defends the Winner's Cup.",
        encounters: {
            walk: [
                enc(123, 36, 40, 15),
                enc(127, 36, 40, 15),
                enc(115, 36, 40, 10),
                enc(128, 36, 40, 15),
                enc(214, 36, 40, 10),
                enc(147, 34, 38, 5)
            ],
            surf: [
                enc(117, 36, 42, 30),
                enc(119, 36, 42, 30),
                enc(73, 38, 42, 30),
                enc(148, 40, 44, 5),
                enc(131, 40, 44, 5)
            ]
        }
    }),
    zone({
        id: "shamoutiIsland",
        name: "Shamouti Island",
        badgesRequired: 4,
        postGame: true,
        blurb: "An island of legend: Fire, Ice and Lightning, and the Guardian of the Sea.",
        encounters: {
            walk: [
                enc(79, 45, 50, 20),
                enc(80, 50, 52, 10),
                enc(199, 50, 52, 5),
                enc(55, 45, 50, 20),
                enc(103, 45, 50, 20),
                enc(148, 48, 52, 5),
                enc(230, 50, 52, 2)
            ],
            surf: [enc(131, 45, 50, 30), enc(73, 45, 50, 40), enc(226, 45, 50, 30)]
        }
    })
];

type Row = [id: number, minLevel: number, maxLevel: number, weight?: number];

function island(
    id: string,
    name: string,
    badgesRequired: number,
    blurb: string,
    walk: Row[],
    extra: Partial<ZoneDefinition> = {}
): ZoneDefinition {
    return zone({
        id,
        name,
        badgesRequired,
        blurb,
        encounters: { walk: walk.map(([sid, min, max, weight]) => enc(sid, min, max, weight)) },
        ...extra
    });
}

/** The rest of the Orange Archipelago from Bulbapedia's list of anime-exclusive locations. */
export const MORE_ORANGE_ZONES: ZoneDefinition[] = [
    island(
        "kinnowIsland",
        "Kinnow Island",
        1,
        "Port of the Pokémon Showboat and its traveling stars.",
        [
            [54, 12, 17, 25],
            [60, 12, 17, 20],
            [118, 12, 17, 20],
            [90, 12, 17, 15],
            [61, 17, 18, 5],
            [55, 17, 18, 4]
        ]
    ),
    island(
        "mandarinNorth",
        "Mandarin Island North",
        1,
        "A town where a strange device turned Pokémon against their Trainers.",
        [
            [25, 12, 17, 20],
            [19, 12, 17, 20],
            [81, 12, 17, 20],
            [100, 12, 17, 20],
            [20, 16, 18, 8],
            [125, 17, 18, 2]
        ]
    ),
    island(
        "ghostShip",
        "Ghost Ship",
        1,
        "A sunken wreck off Moro Island, crewed by Ghost Pokémon.",
        [
            [92, 15, 19, 35],
            [200, 15, 19, 20],
            [41, 15, 19, 25],
            [93, 19, 20, 8],
            [94, 20, 21, 2]
        ]
    ),
    island("goldenIsland", "Golden Island", 2, "An island whose people worship Meowth as a god.", [
        [52, 20, 25, 35],
        [27, 20, 25, 20],
        [108, 20, 25, 15],
        [53, 25, 27, 8],
        [28, 25, 27, 5]
    ]),
    island(
        "sevenGrapefruitIslands",
        "Seven Grapefruit Islands",
        2,
        "Seven fruit-covered isles where a Snorlax once ate everything.",
        [
            [43, 20, 25, 20],
            [69, 20, 25, 20],
            [102, 20, 25, 15],
            [191, 20, 25, 15],
            [204, 20, 25, 15],
            [12, 22, 26, 10],
            [143, 26, 28, 1]
        ]
    ),
    island("trovitopolis", "Trovitopolis", 2, "A tourist city stalked by a mystery Pokémon.", [
        [88, 22, 27, 25],
        [109, 22, 27, 25],
        [96, 22, 27, 25],
        [89, 27, 28, 5],
        [110, 27, 28, 5]
    ]),
    island(
        "fairchildIsland",
        "Fairchild Island",
        3,
        "Where a Trainer bound for glory challenged Ash.",
        [
            [25, 28, 33, 20],
            [35, 28, 33, 20],
            [39, 28, 33, 20],
            [60, 28, 33, 15],
            [61, 32, 34, 8],
            [26, 33, 34, 3],
            [36, 33, 34, 3]
        ]
    ),
    island(
        "cleopatraIsland",
        "Cleopatra Island",
        3,
        "A frozen shore where Charizard needed warming up.",
        [
            [77, 28, 33, 20],
            [58, 28, 33, 20],
            [126, 30, 34, 8],
            [240, 28, 32, 8],
            [4, 28, 32, 3],
            [5, 32, 34, 2],
            [220, 28, 33, 20]
        ]
    ),
    island(
        "ascorbiaIsland",
        "Ascorbia Island",
        3,
        "Two villages feuding over the island's only spring.",
        [
            [60, 28, 33, 20],
            [61, 30, 34, 15],
            [54, 28, 33, 20],
            [118, 28, 33, 20],
            [7, 28, 32, 3],
            [62, 34, 35, 2],
            [186, 34, 35, 2]
        ]
    ),
    island(
        "butwalIsland",
        "Butwal Island",
        3,
        "Home of a feast-loving cook and his hungry Pokémon.",
        [
            [52, 28, 33, 20],
            [108, 28, 33, 20],
            [241, 28, 33, 20],
            [128, 28, 33, 15],
            [143, 33, 34, 2]
        ]
    ),
    island("rindIsland", "Rind Island", 3, "Where a wacky Pokémon Watcher studied Bug Pokémon.", [
        [123, 28, 33, 15],
        [127, 28, 33, 15],
        [12, 28, 33, 20],
        [15, 28, 33, 20],
        [214, 30, 34, 8],
        [48, 28, 33, 20]
    ]),
    island("tarrocoIsland", "Tarroco Island", 4, "Where Lapras rejoined its herd.", [
        [131, 36, 42, 15],
        [130, 38, 42, 10],
        [117, 36, 42, 20],
        [91, 36, 42, 15],
        [73, 36, 42, 20],
        [226, 36, 42, 15]
    ]),
    island(
        "hamlinIsland",
        "Hamlin Island",
        4,
        "Its tunnels hide a sleeping Snorlax and Diglett galore.",
        [
            [50, 36, 40, 25],
            [51, 38, 42, 20],
            [74, 36, 42, 20],
            [75, 38, 42, 15],
            [143, 42, 43, 2]
        ]
    ),
    island(
        "fireIsland",
        "Fire Island",
        4,
        "Home of the Titan of Fire.",
        [
            [58, 50, 55, 25],
            [59, 55, 58, 5],
            [77, 50, 55, 25],
            [78, 55, 58, 8],
            [126, 52, 56, 15],
            [218, 50, 55, 20]
        ],
        { postGame: true }
    ),
    island(
        "iceIsland",
        "Ice Island",
        4,
        "Home of the Titan of Ice.",
        [
            [86, 50, 55, 20],
            [87, 55, 58, 8],
            [91, 52, 56, 15],
            [124, 52, 56, 15],
            [220, 50, 55, 20],
            [221, 55, 58, 8],
            [225, 50, 55, 14]
        ],
        { postGame: true }
    ),
    island(
        "lightningIsland",
        "Lightning Island",
        4,
        "Home of the Titan of Lightning.",
        [
            [25, 50, 55, 20],
            [26, 55, 58, 8],
            [125, 52, 56, 15],
            [135, 55, 58, 4],
            [179, 50, 55, 20],
            [180, 52, 56, 15],
            [181, 56, 58, 4]
        ],
        { postGame: true }
    )
];

export const ORANGE_TRIALS: GymDefinition[] = [
    trial({
        id: "cissy",
        name: "Cissy",
        title: "Mikan Island Gym Leader",
        town: "Mikan Island",
        badge: "Coral-Eye Badge",
        badgeNumber: 1,
        specialty: "water",
        statMultiplier: 2.5,
        team: [
            { id: 117, level: 18 },
            { id: 9, level: 20 }
        ],
        keyItems: [],
        rewardText: "Your Lapras ferry now sails to Sunburst, Navel and Moro Islands.",
        quote: "My challenges test more than battling skill. Show me your aim!"
    }),
    trial({
        id: "danny",
        name: "Danny",
        title: "Navel Island Gym Leader",
        town: "Navel Island",
        badge: "Sea Ruby Badge",
        badgeNumber: 2,
        specialty: "ground",
        statMultiplier: 3.1,
        team: [
            { id: 31, level: 26 },
            { id: 74, level: 24 },
            { id: 123, level: 26 }
        ],
        keyItems: [],
        rewardText: "Pinkan, Trovita and Mandarin Islands are within reach.",
        quote: "Race me to the top of the mountain, then we'll battle!"
    }),
    trial({
        id: "rudy",
        name: "Rudy",
        title: "Trovita Island Gym Leader",
        town: "Trovita Island",
        badge: "Spike Shell Badge",
        badgeNumber: 3,
        specialty: null,
        statMultiplier: 3.8,
        team: [
            { id: 125, level: 32 },
            { id: 121, level: 32 },
            { id: 103, level: 34 }
        ],
        keyItems: [],
        rewardText: "The ferry continues to Kumquat and Murcott Islands.",
        quote: "Before we battle, let's see how well you handle a target challenge."
    }),
    trial({
        id: "luana",
        name: "Luana",
        title: "Kumquat Island Gym Leader",
        town: "Kumquat Island",
        badge: "Jade Star Badge",
        badgeNumber: 4,
        specialty: null,
        statMultiplier: 4.4,
        team: [
            { id: 65, level: 38 },
            { id: 105, level: 38 }
        ],
        keyItems: [],
        rewardText: "With four badges, you may challenge Drake on Pummelo Island.",
        quote: "Double battles demand that your Pokémon trust each other."
    })
];

export function orangeFinale(): TrainerDefinition[] {
    const team = [
        { id: 132, level: 44 },
        { id: 95, level: 44 },
        { id: 94, level: 45 },
        { id: 3, level: 46 },
        { id: 125, level: 45 },
        { id: 149, level: 48 }
    ];
    return [
        {
            id: "drake",
            name: "Drake",
            title: "Orange Crew Supreme Gym Leader",
            specialty: null,
            team,
            timeLimit: 30 + team.length * 15,
            statMultiplier: 4.7,
            prizeMoney: 48 * 100,
            quote: "No one has taken the Winner's Cup from me. Not once."
        }
    ];
}

export const ORANGE_SPECIALS: SpecialEncounter[] = [
    {
        kind: "legendary",
        id: "crystalOnix",
        region: "orange",
        speciesId: 3095,
        level: 35,
        zoneId: "sunburstIsland",
        place: "Sunburst Island",
        badgesRequired: 1,
        strength: 1.9,
        text: "An Onix made of living glass. Water can't hurt it, but fire might crack it."
    },
    {
        kind: "gift",
        id: "ivyVileplume",
        region: "orange",
        speciesId: 45,
        level: 12,
        place: "Valencia Island",
        badgesRequired: 0,
        price: 1000,
        text: "Professor Ivy's assistants raise Oddish; one grown Vileplume needs a new home."
    },
    {
        kind: "gift",
        id: "traceyMarill",
        region: "orange",
        speciesId: 183,
        level: 14,
        place: "Tangelo Island",
        badgesRequired: 0,
        text: "A Pokémon Watcher sketching by the shore asks you to look after his Marill."
    },
    {
        kind: "gift",
        id: "traceyScyther",
        region: "orange",
        speciesId: 123,
        level: 20,
        place: "Tangelo Island",
        badgesRequired: 1,
        text: "An old, battle-scarred Scyther is looking for a Trainer to travel with."
    },
    {
        kind: "gift",
        id: "sunburstDragonite",
        region: "orange",
        speciesId: 147,
        level: 15,
        place: "Sunburst Island",
        badgesRequired: 1,
        price: 12000,
        text: "The glassblower's apprentice raises a Dratini that dreams of the sea."
    },
    {
        kind: "gift",
        id: "pinkanPikachu",
        region: "orange",
        speciesId: 1025,
        level: 20,
        place: "Pinkan Island",
        badgesRequired: 2,
        text: "Officer Jenny trusts you with one of the reserve's pink Pikachu."
    },
    {
        kind: "trade",
        id: "trovitaTrade",
        region: "orange",
        speciesId: 199,
        level: 30,
        place: "Trovita Island",
        badgesRequired: 3,
        wants: 80,
        text: "Rudy's sister Mahri loves Slowbro and will swap her Slowking to meet one."
    },
    {
        kind: "legendary",
        id: "murcottSnorlax",
        region: "orange",
        speciesId: 7021,
        level: 35,
        zoneId: "murcottIsland",
        place: "Murcott Island",
        badgesRequired: 3,
        strength: 1.6,
        text: "A Snorlax has been eating the island's berry crop. Wake it up!"
    },
    {
        kind: "legendary",
        id: "shamoutiMoltres",
        region: "orange",
        speciesId: 146,
        level: 55,
        zoneId: "fireIsland",
        place: "Fire Island",
        badgesRequired: 4,
        postGame: true,
        strength: 2.3,
        text: "The Titan of Fire guards its treasure on Fire Island."
    },
    {
        kind: "legendary",
        id: "shamoutiArticuno",
        region: "orange",
        speciesId: 144,
        level: 55,
        zoneId: "iceIsland",
        place: "Ice Island",
        badgesRequired: 4,
        postGame: true,
        strength: 2.3,
        text: "The Titan of Ice rests on Ice Island."
    },
    {
        kind: "legendary",
        id: "shamoutiZapdos",
        region: "orange",
        speciesId: 145,
        level: 55,
        zoneId: "lightningIsland",
        place: "Lightning Island",
        badgesRequired: 4,
        postGame: true,
        strength: 2.3,
        text: "The Titan of Lightning crackles above Lightning Island."
    },
    {
        kind: "legendary",
        id: "shamoutiLugia",
        region: "orange",
        speciesId: 249,
        level: 70,
        zoneId: "shamoutiIsland",
        place: "Shamouti Shrine",
        badgesRequired: 4,
        postGame: true,
        strength: 2.9,
        text: "The Guardian of the Sea rises when the three Titans are calmed."
    }
];

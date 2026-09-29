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
        blurb: "Professor Ivy's island lab, where your Orange Islands journey begins.",
        encounters: {
            walk: [
                enc(10, 3, 6, 20),
                enc(12, 7, 10, 10),
                enc(43, 4, 8, 20),
                enc(46, 4, 8, 15),
                enc(16, 4, 8, 20),
                enc(102, 6, 9, 15)
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
        blurb: "A protected island where Pinkan Berries tint every Pokémon pink.",
        encounters: {
            walk: [
                enc(103, 22, 26, 15),
                enc(111, 22, 26, 15),
                enc(33, 21, 25, 15),
                enc(56, 21, 25, 15),
                enc(25, 20, 24, 15),
                enc(12, 21, 25, 10),
                enc(70, 21, 25, 10),
                enc(35, 20, 24, 5)
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

export const ORANGE_TRIALS: GymDefinition[] = [
    trial({
        id: "cissy",
        name: "Cissy",
        title: "Mikan Island Gym Leader",
        town: "Mikan Island",
        badge: "Coral-Eye Badge",
        badgeNumber: 1,
        specialty: "water",
        statMultiplier: 1,
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
        statMultiplier: 1.25,
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
        statMultiplier: 1.5,
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
        statMultiplier: 1.75,
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
            statMultiplier: 2.2,
            prizeMoney: 48 * 100,
            quote: "No one has taken the Winner's Cup from me. Not once."
        }
    ];
}

export const ORANGE_SPECIALS: SpecialEncounter[] = [
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
        speciesId: 25,
        level: 20,
        place: "Pinkan Island",
        badgesRequired: 2,
        text: "Officer Jenny lets you take one of the island's friendly Pikachu."
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
        speciesId: 143,
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
        zoneId: "shamoutiIsland",
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
        zoneId: "shamoutiIsland",
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
        zoneId: "shamoutiIsland",
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

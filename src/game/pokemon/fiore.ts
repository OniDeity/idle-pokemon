/**
 * Fiore, from Pokémon Ranger. There are no Trainers or Gyms: you're a Pokémon Ranger, and the
 * region's trials are the game's missions against the Go-Rock Squad, each ending in a boss
 * capture. Wild Pokémon are captured with the Capture Styler instead of Poké Balls. The Pokémon
 * and their places come from the game's Browser (Serebii's list, with Fiore's English place
 * names); Ranger has no levels, so each place takes levels from where it falls in the story.
 */
import { enc } from "./data";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { timeLimit, trial } from "./trainers";
import type { ZoneDefinition } from "./zones";

function zone(options: Omit<ZoneDefinition, "region">): ZoneDefinition {
    return { region: "fiore", ...options };
}

export const FIORE_ZONES: ZoneDefinition[] = [
    zone({
        id: "lyraForest",
        name: "Lyra Forest",
        badgesRequired: 0,
        blurb: "Ringtown's forest, where Larry's Taillow got lost and every Rookie Ranger starts out.",
        encounters: {
            walk: [
                enc(1, 3, 7, 10),
                enc(69, 3, 7, 10),
                enc(123, 3, 7, 10),
                enc(152, 3, 7, 10),
                enc(155, 3, 7, 10),
                enc(167, 3, 7, 10),
                enc(187, 3, 7, 10),
                enc(198, 3, 7, 10),
                enc(231, 3, 7, 10),
                enc(255, 3, 7, 10),
                enc(258, 3, 7, 10),
                enc(263, 3, 7, 10),
                enc(276, 3, 7, 10),
                enc(290, 3, 7, 10),
                enc(292, 3, 7, 10),
                enc(2, 6, 10, 6),
                enc(8, 6, 10, 6),
                enc(70, 6, 10, 6),
                enc(212, 6, 10, 6),
                enc(256, 6, 10, 6),
                enc(259, 6, 10, 6),
                enc(264, 6, 10, 6),
                enc(277, 6, 10, 6),
                enc(291, 6, 10, 6),
                enc(3, 9, 13, 3),
                enc(15, 9, 13, 3),
                enc(71, 9, 13, 3),
                enc(157, 9, 13, 3),
                enc(260, 9, 13, 3)
            ]
        }
    }),
    zone({
        id: "fallCity",
        name: "Fall City",
        badgesRequired: 1,
        blurb: "Fiore's autumn port, with the Lucky Clock Tower and Fall City's Ranger Base.",
        encounters: {
            walk: [
                enc(52, 8, 13, 10),
                enc(81, 8, 13, 10),
                enc(98, 8, 13, 10),
                enc(100, 8, 13, 10),
                enc(131, 8, 13, 10),
                enc(172, 8, 13, 10),
                enc(209, 8, 13, 10),
                enc(278, 8, 13, 10),
                enc(296, 8, 13, 10),
                enc(300, 8, 13, 10),
                enc(309, 8, 13, 10),
                enc(25, 11, 16, 6),
                enc(39, 11, 16, 6),
                enc(82, 11, 16, 6),
                enc(310, 11, 16, 6),
                enc(9, 14, 19, 3),
                enc(26, 14, 19, 3),
                enc(272, 14, 19, 3)
            ]
        }
    }),
    zone({
        id: "eastRoad",
        name: "East Road",
        badgesRequired: 1,
        blurb: "The road between Fall City and Ringtown, buzzing with Electric Pokémon.",
        encounters: {
            walk: [
                enc(81, 9, 14, 10),
                enc(100, 9, 14, 10),
                enc(172, 9, 14, 10),
                enc(276, 9, 14, 10),
                enc(309, 9, 14, 10),
                enc(352, 9, 14, 10),
                enc(25, 12, 17, 6),
                enc(82, 12, 17, 6),
                enc(310, 12, 17, 6),
                enc(26, 15, 20, 3),
                enc(257, 15, 20, 3)
            ]
        }
    }),
    zone({
        id: "kisaraPlains",
        name: "Kisara Plains",
        badgesRequired: 1,
        blurb: "Open plains in the middle of Fiore, home to herds of Tauros and Doduo.",
        encounters: {
            walk: [
                enc(21, 10, 15, 10),
                enc(63, 10, 15, 10),
                enc(79, 10, 15, 10),
                enc(81, 10, 15, 10),
                enc(84, 10, 15, 10),
                enc(100, 10, 15, 10),
                enc(128, 10, 15, 10),
                enc(172, 10, 15, 10),
                enc(227, 10, 15, 10),
                enc(309, 10, 15, 10),
                enc(325, 10, 15, 10),
                enc(22, 13, 18, 6),
                enc(25, 13, 18, 6),
                enc(78, 13, 18, 6),
                enc(82, 13, 18, 6),
                enc(85, 13, 18, 6),
                enc(281, 13, 18, 6),
                enc(310, 13, 18, 6),
                enc(26, 16, 21, 3)
            ]
        }
    }),
    zone({
        id: "fallCityWaterworks",
        name: "Fall City Waterworks",
        badgesRequired: 2,
        blurb: "The underground waterway where a Grimer outbreak threatens Fall City's water.",
        encounters: {
            walk: [
                enc(7, 14, 19, 10),
                enc(19, 14, 19, 10),
                enc(88, 14, 19, 10),
                enc(96, 14, 19, 10),
                enc(109, 14, 19, 10),
                enc(114, 14, 19, 10),
                enc(158, 14, 19, 10),
                enc(307, 14, 19, 10),
                enc(341, 14, 19, 10),
                enc(20, 17, 22, 6),
                enc(89, 17, 22, 6),
                enc(159, 17, 22, 6),
                enc(342, 17, 22, 6),
                enc(160, 20, 25, 3)
            ]
        }
    }),
    zone({
        id: "oliveJungle",
        name: "Olive Jungle",
        badgesRequired: 3,
        blurb: "A steamy jungle by Summerland, where the Go-Rock Squad hid Percy's Politoed.",
        encounters: {
            walk: [
                enc(23, 18, 23, 10),
                enc(43, 18, 23, 10),
                enc(48, 18, 23, 10),
                enc(56, 18, 23, 10),
                enc(167, 18, 23, 10),
                enc(207, 18, 23, 10),
                enc(214, 18, 23, 10),
                enc(231, 18, 23, 10),
                enc(252, 18, 23, 10),
                enc(265, 18, 23, 10),
                enc(270, 18, 23, 10),
                enc(287, 18, 23, 10),
                enc(57, 21, 26, 6),
                enc(153, 21, 26, 6),
                enc(168, 21, 26, 6),
                enc(253, 21, 26, 6),
                enc(266, 21, 26, 6),
                enc(271, 21, 26, 6),
                enc(288, 21, 26, 6),
                enc(154, 24, 29, 3),
                enc(186, 24, 29, 3),
                enc(267, 24, 29, 3),
                enc(272, 24, 29, 3)
            ]
        }
    }),
    zone({
        id: "safraSea",
        name: "Safra Sea",
        badgesRequired: 3,
        blurb: "The sea between Fall City and Summerland, crossed on the Lapras Guy's Lapras.",
        encounters: {
            walk: [
                enc(54, 19, 24, 10),
                enc(116, 19, 24, 10),
                enc(118, 19, 24, 10),
                enc(120, 19, 24, 10),
                enc(129, 19, 24, 10),
                enc(223, 19, 24, 10),
                enc(318, 19, 24, 10),
                enc(320, 19, 24, 10),
                enc(370, 19, 24, 10),
                enc(117, 22, 27, 6),
                enc(119, 22, 27, 6),
                enc(121, 22, 27, 6),
                enc(130, 22, 27, 6),
                enc(224, 22, 27, 6),
                enc(226, 22, 27, 6),
                enc(279, 22, 27, 6),
                enc(319, 22, 27, 6),
                enc(230, 25, 30, 3)
            ]
        }
    }),
    zone({
        id: "jungleRelic",
        name: "Jungle Relic",
        badgesRequired: 4,
        blurb: "An ancient pyramid in Olive Jungle, guarded by four dragons and a statue of Entei.",
        encounters: {
            walk: [
                enc(4, 23, 28, 10),
                enc(218, 23, 28, 10),
                enc(322, 23, 28, 10),
                enc(374, 23, 28, 10),
                enc(5, 26, 31, 6),
                enc(44, 26, 31, 6),
                enc(59, 26, 31, 6),
                enc(75, 26, 31, 6),
                enc(112, 26, 31, 6),
                enc(126, 26, 31, 6),
                enc(219, 26, 31, 6),
                enc(229, 26, 31, 6),
                enc(253, 26, 31, 6),
                enc(323, 26, 31, 6),
                enc(6, 29, 34, 3),
                enc(62, 29, 34, 3),
                enc(254, 29, 34, 3),
                enc(289, 29, 34, 3),
                enc(330, 29, 34, 3)
            ]
        }
    }),
    zone({
        id: "krokkaTunnel",
        name: "Krokka Tunnel",
        badgesRequired: 4,
        blurb: "The tunnel between Ringtown and Fall City, blocked by rockfalls until you clear them.",
        encounters: {
            walk: [
                enc(41, 22, 27, 10),
                enc(46, 22, 27, 10),
                enc(50, 22, 27, 10),
                enc(60, 22, 27, 10),
                enc(66, 22, 27, 10),
                enc(69, 22, 27, 10),
                enc(74, 22, 27, 10),
                enc(324, 22, 27, 10),
                enc(47, 25, 30, 6),
                enc(51, 25, 30, 6),
                enc(61, 25, 30, 6),
                enc(75, 25, 30, 6),
                enc(208, 25, 30, 6),
                enc(297, 25, 30, 6),
                enc(68, 28, 33, 3)
            ]
        }
    }),
    zone({
        id: "panulaCave",
        name: "Panula Cave",
        badgesRequired: 5,
        blurb: "An icy cave under Sekra Range, with Ghost and Ice Pokémon in its depths.",
        encounters: {
            walk: [
                enc(215, 27, 32, 10),
                enc(220, 27, 32, 10),
                enc(293, 27, 32, 10),
                enc(338, 27, 32, 10),
                enc(359, 27, 32, 10),
                enc(361, 27, 32, 10),
                enc(42, 30, 35, 6),
                enc(61, 30, 35, 6),
                enc(124, 30, 35, 6),
                enc(202, 30, 35, 6),
                enc(221, 30, 35, 6),
                enc(294, 30, 35, 6),
                enc(308, 30, 35, 6),
                enc(356, 30, 35, 6),
                enc(362, 30, 35, 6),
                enc(62, 33, 38, 3),
                enc(169, 33, 38, 3),
                enc(295, 33, 38, 3)
            ]
        }
    }),
    zone({
        id: "duskFactory",
        name: "Dusk Factory",
        badgesRequired: 6,
        blurb: "The factory where the Go-Rock Squad mass-produces Super Stylers.",
        encounters: {
            walk: [
                enc(58, 31, 36, 10),
                enc(81, 31, 36, 10),
                enc(92, 31, 36, 10),
                enc(100, 31, 36, 10),
                enc(127, 31, 36, 10),
                enc(137, 31, 36, 10),
                enc(172, 31, 36, 10),
                enc(309, 31, 36, 10),
                enc(25, 34, 39, 6),
                enc(67, 34, 39, 6),
                enc(82, 34, 39, 6),
                enc(93, 34, 39, 6),
                enc(97, 34, 39, 6),
                enc(122, 34, 39, 6),
                enc(310, 34, 39, 6),
                enc(26, 37, 42, 3)
            ]
        }
    }),
    zone({
        id: "sekraRange",
        name: "Sekra Range",
        badgesRequired: 7,
        blurb: "Snowy mountains north of Wintown, hiding the Go-Rock Squad's base in a cliff.",
        encounters: {
            walk: [
                enc(114, 35, 40, 10),
                enc(115, 35, 40, 10),
                enc(129, 35, 40, 10),
                enc(207, 35, 40, 10),
                enc(215, 35, 40, 10),
                enc(246, 35, 40, 10),
                enc(273, 35, 40, 10),
                enc(280, 35, 40, 10),
                enc(333, 35, 40, 10),
                enc(24, 38, 43, 6),
                enc(61, 38, 43, 6),
                enc(156, 38, 43, 6),
                enc(221, 38, 43, 6),
                enc(247, 38, 43, 6),
                enc(274, 38, 43, 6),
                enc(334, 38, 43, 6),
                enc(45, 41, 46, 3),
                enc(76, 41, 46, 3),
                enc(149, 41, 46, 3),
                enc(275, 41, 46, 3),
                enc(282, 41, 46, 3)
            ]
        }
    }),
    zone({
        id: "goRockSquadBase",
        name: "Go-Rock Squad Base",
        badgesRequired: 8,
        blurb: "Gordor's hideout inside Sekra Range, home to the Go-Rock Quads.",
        encounters: {
            walk: [
                enc(374, 40, 45, 10),
                enc(125, 43, 48, 6),
                enc(375, 43, 48, 6),
                enc(248, 46, 51, 3),
                enc(376, 46, 51, 3)
            ]
        }
    }),
    zone({
        id: "fioreTemple",
        name: "Fiore Temple",
        badgesRequired: 8,
        postGame: true,
        blurb: "The ancient temple at the peak of Sekra Range, where Gordor commands the legendary beasts.",
        encounters: {
            walk: [
                enc(142, 50, 56, 10),
                enc(371, 50, 56, 10),
                enc(134, 53, 59, 6),
                enc(135, 53, 59, 6),
                enc(136, 53, 59, 6),
                enc(168, 53, 59, 6),
                enc(196, 53, 59, 6),
                enc(197, 53, 59, 6),
                enc(232, 53, 59, 6),
                enc(253, 53, 59, 6),
                enc(308, 53, 59, 6),
                enc(317, 53, 59, 6),
                enc(372, 53, 59, 6),
                enc(76, 56, 62, 3),
                enc(94, 56, 62, 3),
                enc(373, 56, 62, 3)
            ]
        }
    })
];

/**
 * Stat multipliers for Fiore's mission bosses, tuned with scripts/simulateProgression.ts so a
 * first clear after Sinnoh takes about 10-12 hours.
 */
const FIORE_MISSION_STRENGTHS = [2.0, 3.4, 4.0, 4.4, 4.2, 2.9, 3.6, 3.75];
const FIORE_FINALE_STRENGTH = 3.335;
const FIORE_GORDOR_STRENGTH = 3.45;
/**
 * v2.12.3's retune: with Hoenn and both Orre journeys tougher, the simulator's Fiore swung to
 * 12-29 hours (one seed's weak team walled at Garret and the Temple), so its missions and finale
 * are a little weaker; ×0.95-0.97 still walled that seed at 23-25 h.
 */
const FIORE_TUNING = 0.94;

function mission(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "keyItems">
): GymDefinition {
    return trial({
        keyItems: [],
        ...options,
        statMultiplier: FIORE_TUNING * FIORE_MISSION_STRENGTHS[options.badgeNumber - 1]
    });
}

/** Pokémon Ranger's missions, each ending with the capture that clears it. */
export const FIORE_MISSIONS: GymDefinition[] = [
    mission({
        id: "escortTheProfessor",
        name: "Rhydon",
        title: "Rampaging Pokémon",
        town: "Lyra Forest",
        badge: "Escort the Professor",
        badgeNumber: 1,
        specialty: "ground",
        team: [
            { id: 69, level: 12 },
            { id: 112, level: 14 }
        ],
        rewardText:
            "Professor Hastings reaches Fall City safely, though the Go-Rock Squad stole his Super Styler prototype.",
        quote: "Two Go-Rock Squad goons enraged a Rhydon on their way out of the forest!"
    }),
    mission({
        id: "fallCityCaseFiles",
        name: "Machoke",
        title: "Rampaging Pokémon",
        town: "Fall City",
        badge: "Fall City Case Files",
        badgeNumber: 2,
        specialty: "fighting",
        team: [
            { id: 300, level: 17 },
            { id: 67, level: 19 }
        ],
        rewardText:
            "Fall City's Lucky Clock Tower is safe, the five lost Skitty are home, and the Waterworks open up.",
        quote: "A Machoke is pounding on the Lucky Clock Tower!"
    }),
    mission({
        id: "grimerOutbreak",
        name: "Muk",
        title: "Rampaging Pokémon",
        town: "Fall City Waterworks",
        badge: "Grimer Outbreak",
        badgeNumber: 3,
        specialty: "poison",
        team: [
            { id: 88, level: 22 },
            { id: 88, level: 22 },
            { id: 89, level: 24 }
        ],
        rewardText:
            "Fall City's water is clean again, and the Lapras Guy ferries you across the Safra Sea to Summerland.",
        quote: "A Muk and two more Grimer threaten Fall City's water supply!"
    }),
    mission({
        id: "wheresPolitoed",
        name: "Go-Rock Squad goon",
        title: "Go-Rock Squad",
        town: "Olive Jungle",
        badge: "Where's Politoed?",
        badgeNumber: 4,
        specialty: "fighting",
        team: [
            { id: 56, level: 26 },
            { id: 56, level: 26 },
            { id: 57, level: 28 },
            { id: 186, level: 29 }
        ],
        rewardText:
            "Percy's Politoed is freed from the Super Styler, and the Go-Rock Quads show their faces.",
        quote: "This Politoed is ours now! Mankey, Primeape, get that Ranger!"
    }),
    mission({
        id: "clearTheRockfalls",
        name: "Tiffany",
        title: "Go-Rock Quad",
        town: "Krokka Tunnel",
        badge: "Clear the Rockfalls",
        badgeNumber: 5,
        specialty: "fire",
        team: [
            { id: 324, level: 31 },
            { id: 323, level: 33 }
        ],
        rewardText: "Hariyama smashes the rockfalls, and Krokka Tunnel is open again.",
        quote: "Hear my song, Camerupt! Let's show this Ranger some real power!"
    }),
    mission({
        id: "saveTheJungleRelic",
        name: "Clyde",
        title: "Go-Rock Quad",
        town: "Jungle Relic",
        badge: "Save the Jungle Relic!",
        badgeNumber: 6,
        specialty: "dragon",
        team: [
            { id: 230, level: 34 },
            { id: 330, level: 35 },
            { id: 373, level: 36 },
            { id: 6, level: 36 },
            { id: 289, level: 38 }
        ],
        rewardText:
            "With Kingdra, Flygon, Salamence and Charizard calmed and Clyde's Slaking captured, the Jungle Relic is safe. Gordor reveals himself and his Power Styler.",
        quote: "Slaking, flatten 'em! The boss's plan can't be stopped now!"
    }),
    mission({
        id: "investigateTheFactory",
        name: "Garret",
        title: "Go-Rock Quad",
        town: "Dusk Factory",
        badge: "Investigate the Factory",
        badgeNumber: 7,
        specialty: "steel",
        team: [
            { id: 82, level: 39 },
            { id: 101, level: 40 },
            { id: 212, level: 42 }
        ],
        rewardText:
            "The Dusk Factory's power is cut, and with it the Go-Rock Squad's supply of Super Stylers.",
        quote: "Scizor, cut this Ranger down to size!"
    }),
    mission({
        id: "aquamoleToTheNorth",
        name: "Steelix",
        title: "Rampaging Pokémon",
        town: "Krokka Tunnel",
        badge: "Aquamole to the North",
        badgeNumber: 8,
        specialty: "steel",
        team: [
            { id: 130, level: 44 },
            { id: 208, level: 47 }
        ],
        rewardText:
            "The Aquamole carries you north, and Elita sends you to infiltrate the Go-Rock Squad Base in Sekra Range.",
        quote: "A Go-Rock goon set a Steelix loose to shake Krokka Tunnel apart!"
    })
];

function boss(
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

/** Hideout Infiltration and the Fiore Temple: the Go-Rock Quads, Billy, then Gordor's beasts. */
export function fioreFinale(): TrainerDefinition[] {
    return fioreFinaleUntuned().map(t => ({
        ...t,
        statMultiplier: t.statMultiplier * FIORE_TUNING
    }));
}

function fioreFinaleUntuned(): TrainerDefinition[] {
    const quads = FIORE_FINALE_STRENGTH;
    return [
        boss(
            "goRockQuads",
            "Tiffany, Clyde & Garret",
            "Go-Rock Quads",
            null,
            quads,
            [
                [6, 48],
                [323, 50],
                [289, 50],
                [212, 50]
            ],
            "You got this far? Then it's the three of us at once!"
        ),
        boss(
            "billy",
            "Billy",
            "Go-Rock Quad",
            "rock",
            quads,
            [
                [246, 49],
                [247, 51],
                [248, 53]
            ],
            "Gordor's in the Fiore Temple with the Power Styler. You'll never get there!"
        ),
        boss(
            "gordor",
            "Gordor",
            "Go-Rock Squad Boss",
            null,
            FIORE_GORDOR_STRENGTH,
            [
                [243, 55],
                [245, 55],
                [244, 57]
            ],
            "With the Power Styler, the legendary beasts obey me! Fiore will need the Go-Rock Squad, not the Rangers!"
        )
    ];
}

/** Fiore's special missions and extra missions: its legends, and the Browser's last entry. */
export const FIORE_SPECIALS: SpecialEncounter[] = [
    {
        kind: "legendary",
        id: "jungleRelicEntei",
        region: "fiore",
        speciesId: 244,
        level: 40,
        zoneId: "jungleRelic",
        place: "Jungle Relic",
        badgesRequired: 6,
        strength: 2.4,
        text: "Freed from Gordor's Power Styler, Entei rampages through the Jungle Relic. Capture it to soothe it."
    },
    {
        kind: "legendary",
        id: "templeRaikou",
        region: "fiore",
        speciesId: 243,
        level: 55,
        zoneId: "fioreTemple",
        place: "Fiore Temple (the Drowzee man's tunnel)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Free of Gordor's control, Raikou returns to the Fiore Temple."
    },
    {
        kind: "legendary",
        id: "templeSuicune",
        region: "fiore",
        speciesId: 245,
        level: 55,
        zoneId: "fioreTemple",
        place: "Fiore Temple (the Drowzee man's tunnel)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Free of Gordor's control, Suicune returns to the Fiore Temple."
    },
    {
        kind: "legendary",
        id: "safraKyogre",
        region: "fiore",
        speciesId: 382,
        level: 60,
        zoneId: "safraSea",
        place: "Safra Sea (Search the Safra Sea!)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "Strange waves rock the Safra Sea: Kyogre, wounded in a battle with Groudon, thrashes in pain."
    },
    {
        kind: "legendary",
        id: "summerlandGroudon",
        region: "fiore",
        speciesId: 383,
        level: 60,
        zoneId: "oliveJungle",
        place: "Summerland (Summerland Rescue Duo!)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "Earthquakes shake Summerland: Groudon is in pain from Kyogre's attack."
    },
    {
        kind: "legendary",
        id: "templeRayquaza",
        region: "fiore",
        speciesId: 384,
        level: 65,
        zoneId: "fioreTemple",
        place: "Fiore Temple's summit (The Temple's Sinister Shadows?)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.8,
        text: "The Go-Rock Squad's remnants tried to capture Rayquaza at the top of the Fiore Temple and only made it furious."
    },
    {
        kind: "legendary",
        id: "sekraRegirock",
        region: "fiore",
        speciesId: 377,
        level: 50,
        zoneId: "sekraRange",
        place: "Sekra Range (Break, Soak and Burn field moves)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "Behind boulders, water and fire in Sekra Range, Regirock waits."
    },
    {
        kind: "legendary",
        id: "panulaRegice",
        region: "fiore",
        speciesId: 378,
        level: 50,
        zoneId: "panulaCave",
        place: "Panula Cave (Burn, Break and Cut field moves)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "Deep in Panula Cave, past ice that only fire can melt, Regice waits."
    },
    {
        kind: "legendary",
        id: "krokkaRegisteel",
        region: "fiore",
        speciesId: 379,
        level: 50,
        zoneId: "krokkaTunnel",
        place: "Krokka Tunnel (Cut and Break field moves)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "Behind Krokka Tunnel's hardest rocks, Registeel waits."
    },
    {
        kind: "legendary",
        id: "sekraSnorlax",
        region: "fiore",
        speciesId: 143,
        level: 45,
        zoneId: "sekraRange",
        place: "Sekra Range (Browser Completion)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.2,
        text: "A Snorlax has slept in Sekra Range all along. Once every other Pokémon in Fiore is in your Browser, it wakes up."
    },
    {
        kind: "legendary",
        id: "rangerDeoxys",
        region: "fiore",
        speciesId: 386,
        level: 50,
        zoneId: "fioreTemple",
        place: "Fiore Temple (Gain Deoxys's Trust?!)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "A wary Deoxys changes Forme to escape each capture, until it sees you only want to connect with it."
    },
    {
        kind: "legendary",
        id: "lyraCelebi",
        region: "fiore",
        speciesId: 251,
        level: 50,
        zoneId: "lyraForest",
        place: "Lyra Forest (Rescue Celebi!)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "Go-Rock Squad stragglers corner a Celebi in Lyra Forest. Murph asks you to capture it to calm it."
    },
    {
        kind: "legendary",
        id: "mirageMew",
        region: "fiore",
        speciesId: 151,
        level: 50,
        zoneId: "oliveJungle",
        place: "Olive Jungle (Find Mew, the Mirage)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "Professor Hastings needs Mew's data for his Styler research. It was last seen deep in Olive Jungle."
    },
    {
        kind: "gift",
        id: "preciousEggManaphy",
        region: "fiore",
        speciesId: 490,
        level: 1,
        place: "Ringtown Ranger Base (Recover the Precious Egg!)",
        badgesRequired: 8,
        postGame: true,
        text: "You win back the Manaphy Egg from the Go-Rock Squad's last holdouts, and Gordor, reformed, helps. It hatches into Manaphy."
    }
];

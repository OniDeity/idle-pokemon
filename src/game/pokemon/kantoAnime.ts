/**
 * Kanto locations that only exist in the animated series. Encounter tables are hand-authored
 * from the Pokémon seen in each location's episodes, at levels that fit the badge tier.
 */
import { CLONE_OFFSET, enc } from "./data";
import type { SpecialEncounter } from "./specials";
import type { ZoneDefinition } from "./zones";

export const KANTO_ANIME_ZONES: ZoneDefinition[] = [
    {
        id: "billsLighthouse",
        name: "Bill's Lighthouse",
        region: "kanto",
        anime: true,
        badgesRequired: 1,
        blurb: "A seaside lighthouse north of Cerulean City, where Bill waits for a legendary visitor.",
        encounters: {
            walk: [
                enc(72, 12, 17, 30),
                enc(98, 12, 17, 25),
                enc(116, 12, 16, 15),
                enc(90, 12, 16, 15),
                enc(86, 14, 18, 10),
                enc(118, 12, 16, 5)
            ]
        }
    },
    {
        id: "pokemonTech",
        name: "Pokémon Tech",
        region: "kanto",
        anime: true,
        badgesRequired: 2,
        blurb: "An elite academy for Trainers who want to skip the Gym circuit.",
        encounters: {
            walk: [
                enc(70, 17, 21, 20),
                enc(75, 18, 22, 10),
                enc(74, 15, 19, 20),
                enc(104, 16, 20, 20),
                enc(44, 18, 21, 15),
                enc(64, 17, 20, 10),
                enc(35, 16, 19, 5)
            ]
        }
    },
    {
        id: "hiddenVillage",
        name: "Hidden Village",
        region: "kanto",
        anime: true,
        badgesRequired: 2,
        blurb: "Melanie's secret refuge for abandoned Pokémon, guarded by a Bulbasaur.",
        encounters: {
            walk: [
                enc(1, 12, 16, 20),
                enc(43, 12, 16, 20),
                enc(16, 13, 17, 15),
                enc(19, 13, 17, 15),
                enc(10, 12, 15, 10),
                enc(39, 12, 16, 10),
                enc(2, 18, 20, 3)
            ]
        }
    },
    {
        id: "portaVista",
        name: "Porta Vista",
        region: "kanto",
        anime: true,
        badgesRequired: 3,
        blurb: "A beach resort whose seaside hotel once angered a colony of Tentacool.",
        encounters: {
            walk: [
                enc(72, 20, 26, 35),
                enc(120, 20, 25, 15),
                enc(98, 20, 25, 15),
                enc(79, 20, 25, 15),
                enc(90, 20, 24, 10),
                enc(73, 28, 32, 5)
            ]
        }
    },
    {
        id: "chrysanthemumIsland",
        name: "Chrysanthemum Island",
        region: "kanto",
        anime: true,
        badgesRequired: 3,
        blurb: "A tourist island with a sandy beach and a Pokémon Contest hall.",
        encounters: {
            walk: [
                enc(54, 20, 25, 25),
                enc(86, 21, 25, 20),
                enc(120, 20, 25, 20),
                enc(116, 20, 24, 15),
                enc(118, 20, 24, 15),
                enc(131, 25, 25, 1)
            ]
        }
    },
    {
        id: "maidensPeak",
        name: "Maiden's Peak",
        region: "kanto",
        anime: true,
        badgesRequired: 4,
        blurb: "A cliffside town haunted by the legend of a maiden waiting for her love.",
        encounters: {
            walk: [
                enc(92, 24, 28, 40),
                enc(93, 27, 30, 15),
                enc(41, 24, 28, 25),
                enc(42, 28, 30, 10),
                enc(96, 25, 28, 10)
            ]
        }
    },
    {
        id: "gringeyCity",
        name: "Gringey City",
        region: "kanto",
        anime: true,
        badgesRequired: 5,
        blurb: "An abandoned factory town whose pollution drew in swarms of Grimer.",
        encounters: {
            walk: [
                enc(88, 30, 35, 35),
                enc(109, 30, 35, 25),
                enc(81, 30, 34, 15),
                enc(100, 30, 34, 10),
                enc(89, 36, 38, 8),
                enc(110, 36, 38, 7)
            ]
        }
    },
    {
        id: "darkCity",
        name: "Dark City",
        region: "kanto",
        anime: true,
        badgesRequired: 5,
        blurb: "A lawless town where two unofficial Gyms feud with Pokémon brawls.",
        encounters: {
            walk: [
                enc(19, 30, 33, 15),
                enc(20, 34, 36, 15),
                enc(52, 30, 33, 15),
                enc(53, 34, 36, 10),
                enc(56, 30, 33, 15),
                enc(57, 35, 37, 8),
                enc(66, 30, 34, 15),
                enc(123, 34, 36, 3),
                enc(106, 35, 35, 2),
                enc(107, 35, 35, 2)
            ]
        }
    },
    {
        id: "grampaCanyon",
        name: "Grampa Canyon",
        region: "kanto",
        anime: true,
        badgesRequired: 6,
        blurb: "A fossil dig site outside Neon Town where prehistoric Pokémon awoke.",
        encounters: {
            walk: [
                enc(74, 34, 38, 20),
                enc(75, 38, 42, 10),
                enc(95, 36, 40, 15),
                enc(138, 34, 38, 15),
                enc(140, 34, 38, 15),
                enc(139, 40, 42, 5),
                enc(141, 40, 42, 5),
                enc(142, 42, 44, 2)
            ]
        }
    },
    {
        id: "pokemopolis",
        name: "Pokémopolis",
        region: "kanto",
        anime: true,
        badgesRequired: 7,
        blurb: "Ancient ruins near Pallet Town, home to a giant Gengar, Alakazam and Jigglypuff of legend.",
        encounters: {
            walk: [
                enc(93, 40, 44, 25),
                enc(64, 40, 44, 20),
                enc(96, 40, 44, 20),
                enc(97, 44, 47, 10),
                enc(94, 46, 48, 5),
                enc(65, 46, 48, 5),
                enc(122, 40, 44, 10)
            ]
        }
    }
];

type Row = [id: number, minLevel: number, maxLevel: number, weight?: number];

/** Compact builder for the long tail of anime locations. */
function anime(
    id: string,
    name: string,
    badgesRequired: number,
    blurb: string,
    walk: Row[],
    extra: Partial<ZoneDefinition> = {}
): ZoneDefinition {
    return {
        id,
        name,
        region: "kanto",
        anime: true,
        badgesRequired,
        blurb,
        encounters: { walk: walk.map(([sid, min, max, weight]) => enc(sid, min, max, weight)) },
        ...extra
    };
}

/** Every other Kanto location from Bulbapedia's list of animated-series-exclusive locations. */
export const MORE_KANTO_ANIME_ZONES: ZoneDefinition[] = [
    anime("ajGym", "A.J.'s Gym", 0, "An unofficial Gym whose Trainer claims 98 straight wins.", [
        [27, 4, 8, 20],
        [19, 3, 7, 20],
        [16, 3, 7, 20],
        [23, 4, 8, 15],
        [32, 4, 7, 15],
        [21, 4, 7, 10]
    ]),
    anime(
        "mossgreenVillage",
        "Mossgreen Village",
        0,
        "A forest village where a Paras struggled to evolve.",
        [
            [46, 4, 8, 30],
            [43, 4, 8, 20],
            [69, 4, 8, 20],
            [10, 3, 6, 10],
            [13, 3, 6, 10],
            [47, 9, 10, 3]
        ]
    ),
    anime(
        "roysHometown",
        "Roy's Hometown",
        0,
        "A sleepy island where an ancient Poké Ball legend begins.",
        [
            [16, 3, 7, 20],
            [19, 3, 7, 20],
            [161, 3, 7, 20],
            [194, 4, 7, 15],
            [187, 4, 7, 15],
            [183, 4, 7, 10]
        ]
    ),
    anime(
        "hopHopHopTown",
        "HopHopHop Town",
        1,
        "A town whose children were all put to sleep by a Hypno.",
        [
            [96, 9, 13, 30],
            [39, 9, 13, 20],
            [52, 9, 13, 20],
            [163, 9, 12, 20],
            [97, 14, 15, 3]
        ]
    ),
    anime(
        "neonTown",
        "Neon Town",
        1,
        "A bright city just outside Grampa Canyon. Jigglypuff sings here.",
        [
            [39, 9, 13, 30],
            [35, 9, 13, 20],
            [52, 9, 13, 20],
            [58, 10, 13, 15],
            [173, 8, 10, 4],
            [174, 8, 10, 4]
        ]
    ),
    anime(
        "rifureVillage",
        "Rifure Village",
        1,
        "A quiet village where a young Trainer sought courage.",
        [
            [165, 9, 13, 20],
            [167, 9, 13, 20],
            [161, 9, 13, 20],
            [163, 9, 13, 15],
            [191, 9, 12, 15],
            [162, 14, 15, 3]
        ]
    ),
    anime(
        "vermilionForest",
        "Vermilion Forest",
        2,
        "Woods near Vermilion where Mew was once spotted.",
        [
            [25, 14, 18, 15],
            [172, 12, 15, 5],
            [10, 14, 17, 15],
            [11, 14, 17, 10],
            [12, 16, 19, 5],
            [43, 14, 18, 20],
            [190, 14, 18, 15]
        ]
    ),
    anime(
        "ceriseLab",
        "Cerise Laboratory",
        2,
        "Professor Cerise's Vermilion lab, full of Pokémon to study.",
        [
            [133, 14, 18, 10],
            [25, 14, 18, 20],
            [179, 14, 18, 25],
            [180, 18, 20, 5],
            [81, 14, 18, 20],
            [100, 14, 18, 20]
        ]
    ),
    anime(
        "gaivaDam",
        "Gaiva Dam",
        2,
        "A dam construction site the local Diglett keep undermining.",
        [
            [50, 14, 19, 40],
            [51, 20, 22, 8],
            [54, 14, 18, 15],
            [60, 14, 18, 20],
            [118, 14, 18, 15]
        ]
    ),
    anime(
        "fightingSpiritGym",
        "Fighting Spirit Gym",
        2,
        "A martial-arts Gym whose Hitmonchan trained for P1.",
        [
            [66, 15, 20, 35],
            [56, 15, 20, 30],
            [57, 20, 22, 8],
            [236, 15, 18, 8],
            [106, 20, 20, 2],
            [107, 20, 20, 2]
        ]
    ),
    anime(
        "scissorStreet",
        "Scissor Street",
        2,
        "A street of Pokémon salons and fashion boutiques.",
        [
            [37, 14, 19, 25],
            [58, 14, 19, 25],
            [52, 14, 19, 20],
            [209, 14, 18, 20],
            [133, 16, 18, 4]
        ]
    ),
    anime(
        "houseOfImite",
        "House of Imite",
        2,
        "A strange mansion where a Ditto copies everything it sees.",
        [
            [132, 15, 20, 35],
            [92, 15, 20, 25],
            [202, 15, 20, 20],
            [122, 18, 20, 5],
            [96, 15, 19, 15]
        ]
    ),
    anime(
        "leafForest",
        "Leaf Forest",
        3,
        "Home of the Exeggutor Squad and its marching Exeggcute.",
        [
            [102, 20, 25, 30],
            [43, 20, 25, 15],
            [44, 24, 26, 10],
            [114, 20, 25, 15],
            [191, 20, 24, 15],
            [103, 26, 28, 4],
            [192, 26, 28, 3]
        ]
    ),
    anime(
        "evolutionMountain",
        "Evolution Mountain",
        3,
        "Stone Town's mountain of evolution stones, and the Eevee brothers.",
        [
            [74, 20, 25, 30],
            [75, 25, 27, 10],
            [95, 20, 25, 20],
            [133, 20, 24, 10],
            [134, 26, 27, 2],
            [135, 26, 27, 2],
            [136, 26, 27, 2]
        ]
    ),
    anime("hutberPort", "Hutber Port", 3, "Porta Vista's harbor, where Tentacruel once rampaged.", [
        [72, 20, 25, 30],
        [98, 20, 25, 20],
        [79, 20, 25, 20],
        [223, 20, 25, 15],
        [73, 27, 29, 5],
        [99, 27, 29, 5]
    ]),
    anime("pokemonLand", "Pokémon Land", 3, "An island theme park with giant Pokémon statues.", [
        [86, 20, 25, 20],
        [90, 20, 25, 20],
        [116, 20, 25, 20],
        [170, 20, 25, 20],
        [222, 20, 25, 15],
        [226, 25, 27, 3]
    ]),
    anime(
        "camomileIsland",
        "Camomile Island",
        3,
        "A Battle Frontier stopover famed for its fishing.",
        [
            [54, 22, 27, 20],
            [118, 22, 27, 20],
            [119, 27, 29, 8],
            [211, 22, 27, 20],
            [86, 22, 27, 20],
            [55, 27, 29, 5]
        ]
    ),
    anime(
        "mtHideaway",
        "Mt. Hideaway",
        4,
        "A mountain village whose Trainer had a tough-as-steel Onix.",
        [
            [74, 25, 30, 20],
            [75, 28, 30, 10],
            [95, 25, 30, 20],
            [207, 25, 30, 20],
            [231, 25, 30, 20],
            [208, 30, 32, 2]
        ]
    ),
    anime("sunnytown", "Sunnytown", 4, "A seaside town terrorized by a bike gang on the bridge.", [
        [88, 24, 29, 20],
        [109, 24, 29, 20],
        [41, 24, 29, 20],
        [42, 28, 30, 10],
        [19, 24, 28, 15],
        [20, 28, 30, 10]
    ]),
    anime(
        "xanaduNursery",
        "Xanadu Nursery",
        4,
        "A greenhouse famous for a Gloom perfume and flower Pokémon.",
        [
            [43, 24, 29, 20],
            [44, 26, 29, 20],
            [69, 24, 29, 15],
            [187, 24, 28, 15],
            [188, 27, 29, 10],
            [45, 30, 31, 3],
            [182, 30, 31, 3]
        ]
    ),
    anime(
        "campPokehearst",
        "Camp Pokéhearst",
        4,
        "A summer camp on the way to Hollywood's film studios.",
        [
            [52, 24, 29, 25],
            [35, 24, 29, 20],
            [39, 24, 29, 20],
            [241, 26, 29, 10],
            [53, 30, 31, 4],
            [113, 28, 30, 2]
        ]
    ),
    anime("pokemonThemePark", "Pokémon Theme Park", 4, "Where Pikachu went on vacation.", [
        [25, 24, 29, 20],
        [183, 24, 29, 20],
        [209, 24, 29, 20],
        [104, 24, 29, 15],
        [202, 24, 29, 15],
        [175, 24, 26, 3]
    ]),
    anime(
        "ninjaSchool",
        "Pokémon Ninja School",
        4,
        "A hidden school for ninja Trainers and their Pokémon.",
        [
            [109, 25, 30, 20],
            [42, 25, 30, 15],
            [49, 27, 30, 15],
            [213, 25, 30, 15],
            [215, 25, 30, 15],
            [204, 25, 30, 20]
        ]
    ),
    anime(
        "metallicaIsland",
        "Metallica Island",
        5,
        "An industrial island with a Battle Frontier arena.",
        [
            [81, 28, 34, 25],
            [100, 28, 34, 25],
            [227, 28, 34, 20],
            [82, 33, 35, 8],
            [101, 33, 35, 8],
            [208, 34, 35, 2]
        ]
    ),
    anime(
        "potpourriIsland",
        "Potpourri Island",
        5,
        "An island of flower shops, just off Wisteria Town.",
        [
            [44, 28, 34, 20],
            [70, 28, 34, 20],
            [190, 28, 34, 15],
            [203, 28, 34, 15],
            [234, 28, 34, 20],
            [45, 34, 35, 3],
            [71, 34, 35, 3]
        ]
    ),
    anime(
        "commerceCity",
        "Commerce City",
        5,
        "A merchant city where a Smeargle paints for tourists.",
        [
            [52, 28, 34, 20],
            [58, 28, 34, 20],
            [96, 28, 34, 20],
            [122, 30, 34, 10],
            [235, 28, 34, 15],
            [53, 34, 35, 5]
        ]
    ),
    anime("creminiTown", "Cremini Town", 5, "A snowy town where three Jynx cared for a Smoochum.", [
        [124, 30, 34, 15],
        [238, 28, 30, 10],
        [220, 28, 34, 25],
        [225, 28, 34, 20],
        [86, 28, 34, 20],
        [87, 34, 35, 4]
    ]),
    anime(
        "gardeniaTown",
        "Gardenia Town",
        5,
        "A flower town where love blossomed at a Pokémon ranch.",
        [
            [43, 28, 34, 15],
            [102, 28, 34, 20],
            [187, 28, 34, 15],
            [188, 28, 34, 15],
            [191, 28, 34, 20],
            [189, 34, 35, 3]
        ]
    ),
    anime("eeveeLab", "Eevee Evolution Lab", 5, "A lab studying every way an Eevee can evolve.", [
        [133, 28, 34, 40],
        [134, 32, 35, 5],
        [135, 32, 35, 5],
        [136, 32, 35, 5],
        [196, 32, 35, 4],
        [197, 32, 35, 4]
    ]),
    anime(
        "mulberryCity",
        "Mulberry City",
        6,
        "A city whose Battle Frontier rivals put on a show.",
        [
            [53, 32, 38, 15],
            [20, 32, 38, 15],
            [22, 32, 38, 15],
            [198, 32, 38, 20],
            [228, 32, 38, 20],
            [229, 38, 40, 4]
        ]
    ),
    anime("sableCity", "Sable City", 6, "A desert town on the edge of the Battle Frontier.", [
        [27, 32, 38, 15],
        [28, 36, 38, 10],
        [104, 32, 38, 15],
        [105, 36, 38, 8],
        [111, 32, 38, 15],
        [207, 32, 38, 15],
        [231, 32, 38, 15],
        [232, 38, 40, 4]
    ]),
    anime(
        "fennelValley",
        "Fennel Valley",
        6,
        "A valley that grows the herbs of the Pokémon healing arts.",
        [
            [44, 32, 38, 15],
            [102, 32, 38, 15],
            [114, 32, 38, 15],
            [165, 32, 36, 15],
            [166, 36, 38, 10],
            [214, 36, 38, 4],
            [103, 38, 40, 4]
        ]
    ),
    anime("silverTown", "Silver Town", 6, "A fighting town and its weekend warriors.", [
        [66, 32, 38, 20],
        [67, 34, 38, 15],
        [236, 32, 36, 15],
        [106, 36, 38, 5],
        [107, 36, 38, 5],
        [237, 36, 38, 5],
        [68, 38, 40, 3]
    ]),
    anime(
        "teamRocketHQ",
        "Team Rocket HQ",
        6,
        "Giovanni's secret headquarters and training academy.",
        [
            [23, 32, 38, 15],
            [24, 36, 38, 10],
            [109, 32, 38, 15],
            [110, 36, 38, 8],
            [52, 32, 38, 15],
            [88, 32, 38, 15],
            [228, 32, 38, 10],
            [53, 38, 40, 4]
        ]
    ),
    anime(
        "saydaIsland",
        "Sayda Island",
        6,
        "A remote island where an Aerodactyl was revived from amber.",
        [
            [138, 32, 38, 20],
            [140, 32, 38, 20],
            [139, 38, 40, 5],
            [141, 38, 40, 5],
            [246, 32, 36, 5],
            [142, 38, 40, 2],
            [74, 32, 38, 20]
        ]
    ),
    anime("terracottaTown", "Terracotta Town", 7, "Site of the Battle Pyramid and ancient ruins.", [
        [104, 36, 42, 20],
        [105, 40, 44, 10],
        [95, 36, 42, 20],
        [75, 38, 42, 20],
        [76, 42, 44, 3],
        [208, 42, 44, 3]
    ]),
    anime(
        "pokelantis",
        "Pokélantis",
        7,
        "A sunken ancient kingdom whose ghostly king still lingers.",
        [
            [92, 36, 42, 15],
            [93, 38, 42, 15],
            [200, 36, 42, 20],
            [177, 36, 42, 20],
            [178, 40, 44, 8],
            [94, 42, 44, 3],
            [201, 36, 42, 5]
        ]
    ),
    anime(
        "oldShoreWharf",
        "Old Shore Wharf",
        7,
        "The stormy pier where Trainers set sail for New Island.",
        [
            [72, 36, 42, 20],
            [73, 38, 42, 20],
            [117, 36, 42, 15],
            [119, 36, 42, 15],
            [130, 40, 44, 5],
            [131, 40, 44, 2]
        ]
    ),
    anime(
        "dragoniteIsland",
        "Dragonite Island",
        8,
        "An island paradise where Dragonite gather.",
        [
            [147, 45, 50, 20],
            [148, 50, 55, 20],
            [149, 55, 58, 5],
            [130, 45, 55, 25],
            [131, 50, 55, 10]
        ],
        { postGame: true }
    ),
    anime(
        "newIsland",
        "New Island",
        8,
        "Mewtwo's fortress. The clones of great Trainers' Pokémon still linger.",
        [
            [CLONE_OFFSET + 3, 55, 60, 4],
            [CLONE_OFFSET + 6, 55, 60, 4],
            [CLONE_OFFSET + 9, 55, 60, 4],
            [CLONE_OFFSET + 1, 50, 55, 6],
            [CLONE_OFFSET + 4, 50, 55, 6],
            [CLONE_OFFSET + 7, 50, 55, 6],
            [CLONE_OFFSET + 25, 50, 55, 8],
            [CLONE_OFFSET + 52, 50, 55, 8],
            [CLONE_OFFSET + 31, 52, 58, 6],
            [CLONE_OFFSET + 18, 52, 58, 6],
            [CLONE_OFFSET + 111, 50, 55, 6],
            [CLONE_OFFSET + 27, 50, 55, 6],
            [CLONE_OFFSET + 28, 52, 58, 5],
            [CLONE_OFFSET + 123, 52, 58, 5],
            [CLONE_OFFSET + 106, 52, 58, 5],
            [CLONE_OFFSET + 87, 52, 58, 5],
            [CLONE_OFFSET + 45, 52, 58, 5],
            [CLONE_OFFSET + 55, 52, 58, 5],
            [CLONE_OFFSET + 54, 50, 55, 6],
            [CLONE_OFFSET + 117, 52, 58, 5],
            [CLONE_OFFSET + 73, 52, 58, 5],
            [CLONE_OFFSET + 130, 52, 58, 4],
            [CLONE_OFFSET + 38, 52, 58, 5],
            [CLONE_OFFSET + 37, 50, 55, 6],
            [CLONE_OFFSET + 78, 52, 58, 5],
            [CLONE_OFFSET + 134, 52, 58, 5],
            [CLONE_OFFSET + 40, 52, 58, 5]
        ],
        { postGame: true }
    ),
    anime(
        "cameranPalace",
        "Cameran Palace",
        8,
        "Rota's castle, where the Aura Guardian's festival is held.",
        [
            [25, 45, 52, 20],
            [43, 45, 52, 15],
            [182, 48, 52, 10],
            [190, 45, 52, 15],
            [198, 45, 52, 15],
            [215, 45, 52, 15]
        ],
        { postGame: true }
    ),
    anime(
        "treeOfBeginning",
        "Tree of Beginning",
        8,
        "A living crystal tree near Rota that shelters countless Pokémon — and Mew.",
        [
            [45, 50, 58, 15],
            [102, 50, 58, 15],
            [114, 50, 58, 15],
            [123, 50, 58, 10],
            [214, 50, 58, 10],
            [190, 50, 58, 15],
            [204, 50, 58, 15],
            [203, 50, 58, 10]
        ],
        { postGame: true }
    )
];

export const KANTO_ANIME_SPECIALS: SpecialEncounter[] = [
    {
        kind: "legendary",
        id: "pinkButterfree",
        region: "kanto",
        speciesId: 3012,
        level: 25,
        zoneId: "portaVista",
        place: "Butterfree mating grounds",
        badgesRequired: 3,
        strength: 1.3,
        text: "A pink Butterfree leads the migration out to sea. Win its trust!"
    },
    {
        kind: "legendary",
        id: "treeMew",
        region: "kanto",
        speciesId: 151,
        level: 60,
        zoneId: "treeOfBeginning",
        place: "Tree of Beginning",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "The guardian of the Tree of Beginning plays among its crystal roots."
    },
    {
        kind: "legendary",
        id: "lighthouseDragonite",
        region: "kanto",
        speciesId: 7153,
        level: 60,
        zoneId: "billsLighthouse",
        place: "Bill's Lighthouse",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "A giant Dragonite answers the lighthouse's call from across the sea."
    },
    {
        kind: "legendary",
        id: "giantGengar",
        region: "kanto",
        speciesId: 7151,
        level: 60,
        zoneId: "pokemopolis",
        place: "Pokémopolis",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "The ancient bell rings, and a towering Gengar rises from the ruins."
    },
    {
        kind: "legendary",
        id: "giantAlakazam",
        region: "kanto",
        speciesId: 7150,
        level: 60,
        zoneId: "pokemopolis",
        place: "Pokémopolis",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "A colossal Alakazam, guardian of Pokémopolis, stands in your way."
    },
    {
        kind: "legendary",
        id: "giantJigglypuff",
        region: "kanto",
        speciesId: 7152,
        level: 60,
        zoneId: "pokemopolis",
        place: "Pokémopolis",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "A giant Jigglypuff wakes among the ruins, and its lullaby shakes the ground."
    },
    {
        kind: "gift",
        id: "themeParkPikachu",
        region: "kanto",
        speciesId: 3101,
        level: 25,
        place: "Pokémon Theme Park",
        badgesRequired: 4,
        text: "A Pikachu clinging to a bunch of balloons drifts down and decides to stay."
    },
    {
        kind: "gift",
        id: "originalCapPikachu",
        region: "kanto",
        speciesId: 10094,
        level: 50,
        place: "Pallet Town",
        badgesRequired: 8,
        postGame: true,
        text: "A Pikachu wearing a familiar red cap is waiting outside Professor Oak's lab."
    }
];

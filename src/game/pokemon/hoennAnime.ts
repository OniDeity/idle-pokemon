/**
 * Hoenn locations that only exist in the animated series (Advanced Generation) and the sixth and
 * seventh movies. Encounter tables are hand-authored from the wild Pokémon seen in each
 * location's episodes, at levels that fit the badges Ash had when he got there.
 */
import { enc } from "./data";
import type { SpecialEncounter } from "./specials";
import type { ZoneDefinition } from "./zones";

type Row = [id: number, minLevel: number, maxLevel: number, weight?: number];

function anime(
    id: string,
    name: string,
    badgesRequired: number,
    blurb: string,
    walk: Row[],
    surf: Row[] = [],
    extra: Partial<ZoneDefinition> = {}
): ZoneDefinition {
    const pool = (rows: Row[]) => rows.map(([sid, min, max, weight]) => enc(sid, min, max, weight));
    return {
        id,
        name,
        region: "hoenn",
        anime: true,
        badgesRequired,
        blurb,
        encounters: {
            ...(walk.length > 0 ? { walk: pool(walk) } : {}),
            ...(surf.length > 0 ? { surf: pool(surf) } : {})
        },
        ...extra
    };
}

/** Meta Groudon, the artificial Groudon Butler built in "Jirachi: Wish Maker". */
export const META_GROUDON = 3383;

/** Every Hoenn location from the anime's Advanced Generation series and its two Hoenn movies. */
export const HOENN_ANIME_ZONES: ZoneDefinition[] = [
    anime(
        "oldaleRuins",
        "Oldale Ruins",
        0,
        "Ruins outside Oldale Town where Team Rocket's dig turned up Wurmple and Silcoon.",
        [
            [265, 3, 5, 30],
            [266, 4, 6, 15],
            [268, 4, 6, 15],
            [263, 3, 5, 20],
            [261, 3, 5, 20]
        ]
    ),
    anime(
        "rinshinTown",
        "Rinshin Town",
        0,
        "A growing town between Petalburg Woods and Rustboro, where Shroomish fill an old mansion.",
        [
            [285, 4, 7, 40],
            [276, 4, 6, 20],
            [263, 4, 6, 20],
            [286, 9, 9, 3]
        ]
    ),
    anime(
        "lakeMay",
        "Lake May",
        3,
        'A lake that shares May\'s name, from "Love at First Flight".',
        [
            [276, 16, 20, 35],
            [277, 20, 22, 10],
            [283, 16, 20, 20],
            [270, 16, 20, 20]
        ],
        [
            [283, 16, 20, 30],
            [270, 16, 20, 30],
            [183, 16, 20, 20]
        ]
    ),
    anime(
        "mirageKingdom",
        "Mirage Kingdom",
        3,
        "A desert kingdom that worships Togepi; whoever holds one ascends to the throne.",
        [
            [175, 15, 18, 10],
            [328, 18, 22, 25],
            [331, 18, 22, 25],
            [27, 18, 22, 25],
            [343, 18, 22, 15]
        ]
    ),
    anime(
        "togepiParadise",
        "Togepi Paradise",
        3,
        "A hidden land through the Togepi temple's portal, where Togepi live in peace.",
        [
            [175, 15, 20, 70],
            [176, 22, 22, 10],
            [311, 18, 20, 10],
            [312, 18, 20, 10]
        ]
    ),
    anime(
        "theGreenhouse",
        "The Greenhouse",
        3,
        'A green research house full of Grass Pokémon, from "I Feel Skitty!".',
        [
            [300, 16, 20, 25],
            [43, 16, 20, 20],
            [270, 16, 20, 20],
            [315, 18, 20, 15],
            [182, 22, 22, 5],
            [189, 22, 22, 5]
        ]
    ),
    anime(
        "valleyOfSteel",
        "Valley of Steel",
        4,
        "Between Lavaridge and Mauville, where territorial Steel Pokémon drive off any visitor.",
        [
            [81, 22, 26, 30],
            [82, 26, 28, 15],
            [227, 24, 28, 20],
            [304, 22, 26, 20],
            [208, 30, 30, 5],
            [305, 28, 30, 10]
        ]
    ),
    anime(
        "foothillTown",
        "Foothill Town",
        4,
        "A town at the foot of the mountains, where Delcatty and Skitty play together.",
        [
            [300, 22, 26, 30],
            [301, 26, 28, 5],
            [263, 22, 26, 20],
            [264, 26, 28, 10],
            [276, 22, 26, 20],
            [285, 22, 26, 15]
        ]
    ),
    anime(
        "northPetalburg",
        "North Petalburg",
        5,
        "A city north of Petalburg where a double-battle tournament drew Trainers from all over.",
        [
            [278, 24, 28, 25],
            [276, 24, 28, 20],
            [263, 24, 28, 20],
            [288, 26, 28, 10],
            [287, 24, 26, 15],
            [311, 24, 28, 5],
            [312, 24, 28, 5]
        ]
    ),
    anime(
        "forbiddenForest",
        "Forbidden Forest",
        5,
        "A forest off limits to humans, where May caught her Bulbasaur among its guardians.",
        [
            [1, 24, 26, 10],
            [2, 28, 30, 5],
            [3, 32, 32, 2],
            [43, 24, 28, 25],
            [270, 24, 28, 20],
            [285, 24, 28, 20],
            [315, 26, 28, 15]
        ]
    ),
    anime(
        "kiriKiriMountains",
        "Kiri Kiri Mountains",
        5,
        "Mountains whose ancient Baltoy civilization keeps time with Claydol.",
        [
            [343, 24, 28, 45],
            [344, 32, 34, 10],
            [74, 24, 28, 25],
            [66, 24, 28, 20]
        ]
    ),
    anime(
        "rubelloTown",
        "Rubello Town",
        5,
        "A town between Petalburg and Fortree whose Pokémon Contest asks for a ribbon to enter.",
        [
            [263, 24, 28, 25],
            [278, 24, 28, 20],
            [300, 24, 28, 15],
            [311, 24, 28, 10],
            [312, 24, 28, 10],
            [352, 26, 28, 20]
        ]
    ),
    anime(
        "crossgateTown",
        "Crossgate Town",
        5,
        "A crossroads town where Ash's Taillow evolved into Swellow.",
        [
            [276, 24, 28, 30],
            [277, 28, 30, 10],
            [333, 24, 28, 20],
            [263, 24, 28, 20],
            [264, 28, 30, 10],
            [287, 24, 28, 10]
        ]
    ),
    anime(
        "shroomishForest",
        "Shroomish Forest",
        5,
        'A forest full of Shroomish, from "A Shroomish Skirmish".',
        [
            [285, 24, 28, 50],
            [286, 28, 30, 10],
            [290, 24, 28, 20],
            [276, 24, 28, 20]
        ]
    ),
    anime(
        "cameruptPoint",
        "Camerupt Point",
        5,
        "A hill of grazing Numel and Camerupt near Volley Town.",
        [
            [322, 24, 28, 40],
            [323, 33, 33, 10],
            [218, 24, 28, 20],
            [324, 26, 28, 10],
            [337, 30, 30, 5],
            [327, 24, 28, 15]
        ]
    ),
    anime(
        "volleyTown",
        "Volley Town",
        5,
        'A town near Camerupt Point, visited in "Crazy as a Lunatone".',
        [
            [337, 28, 30, 10],
            [338, 28, 30, 10],
            [263, 24, 28, 25],
            [322, 24, 28, 25],
            [278, 24, 28, 30]
        ]
    ),
    anime(
        "bananaSlakothGarden",
        "Banana Slakoth Garden",
        6,
        'A banana garden named for its Slakoth, from "The Garden of Eatin\'".',
        [
            [287, 26, 30, 45],
            [288, 30, 32, 10],
            [285, 26, 30, 20],
            [357, 28, 30, 10],
            [311, 26, 30, 15]
        ]
    ),
    anime(
        "bombaIsland",
        "Bomba Island",
        6,
        "The island where Jimmy trains to referee under Serena, reached on the wrong ferry.",
        [
            [278, 27, 31, 30],
            [279, 31, 33, 10],
            [296, 27, 31, 20],
            [307, 27, 31, 20],
            [263, 27, 31, 20]
        ],
        [
            [72, 27, 31, 40],
            [278, 27, 31, 30],
            [320, 27, 31, 30]
        ]
    ),
    anime(
        "maisieIsland",
        "Maisie Island",
        6,
        'An island visited in "Clamperl of Wisdom".',
        [
            [278, 27, 31, 40],
            [341, 27, 31, 30],
            [263, 27, 31, 30]
        ],
        [
            [366, 27, 31, 40],
            [72, 27, 31, 30],
            [318, 27, 31, 30]
        ]
    ),
    anime(
        "wazooIsland",
        "Wazoo Island",
        6,
        'An island with Relicanth in its deep water, from "The Relicanth Really Can".',
        [
            [278, 27, 31, 50],
            [341, 27, 31, 30],
            [342, 31, 33, 20]
        ],
        [
            [369, 30, 33, 20],
            [366, 27, 31, 40],
            [72, 27, 31, 40]
        ]
    ),
    anime(
        "abcIslands",
        "A-B-C Islands",
        6,
        "Three rival islands: Island B's Clamperl become Gorebyss, Island C's become Huntail.",
        [
            [278, 27, 31, 50],
            [263, 27, 31, 50]
        ],
        [
            [366, 27, 31, 50],
            [367, 32, 34, 10],
            [368, 32, 34, 10],
            [72, 27, 31, 30]
        ]
    ),
    anime(
        "muscleIsland",
        "Muscle Island",
        6,
        "An island of bodybuilders who train alongside their Fighting Pokémon.",
        [
            [296, 27, 31, 35],
            [297, 31, 33, 10],
            [66, 27, 31, 25],
            [67, 31, 33, 10],
            [307, 27, 31, 20]
        ]
    ),
    anime(
        "monsuIsland",
        "Monsu Island",
        6,
        "The island where Team Magma tried to raise Groudon from the depths.",
        [
            [322, 27, 31, 30],
            [218, 27, 31, 25],
            [324, 28, 31, 15],
            [74, 27, 31, 30]
        ]
    ),
    anime(
        "walesIsland",
        "Wales Island",
        7,
        "Professor Proctor's island, where fossil Pokémon were brought back to life.",
        [
            [286, 30, 34, 30],
            [278, 30, 34, 30],
            [345, 30, 32, 10],
            [347, 30, 32, 10],
            [346, 40, 40, 2],
            [348, 40, 40, 2]
        ]
    ),
    anime(
        "izabeIsland",
        "Izabe Island",
        7,
        "A large island of towns and fields, home of Purika City's Pokémon Contest.",
        [
            [278, 30, 34, 30],
            [263, 30, 34, 20],
            [264, 32, 34, 15],
            [331, 30, 34, 15],
            [332, 32, 34, 10],
            [359, 34, 36, 5]
        ]
    ),
    anime("purikaCity", "Purika City", 7, "Izabe Island's city, with a Pokémon Contest Hall.", [
        [278, 30, 34, 35],
        [300, 30, 34, 25],
        [311, 30, 34, 20],
        [312, 30, 34, 20]
    ]),
    anime(
        "cerosiTown",
        "Cerosi Town",
        7,
        "A dusty Izabe Island town where a Cacturne caused trouble.",
        [
            [331, 30, 34, 40],
            [332, 32, 34, 15],
            [328, 30, 34, 20],
            [27, 30, 34, 25]
        ]
    ),
    anime(
        "riyadoTown",
        "Riyado Town",
        7,
        "A village whose people blamed Absol for disasters it only came to warn them of.",
        [
            [359, 32, 34, 10],
            [263, 30, 34, 30],
            [264, 32, 34, 15],
            [276, 30, 34, 25],
            [277, 32, 34, 20]
        ]
    ),
    anime("gibanIsland", "Giban Island", 7, 'An island visited in "Showdown at Linoone".', [
        [263, 30, 34, 30],
        [264, 32, 34, 30],
        [278, 30, 34, 20],
        [311, 30, 34, 10],
        [312, 30, 34, 10]
    ]),
    anime(
        "dontoIsland",
        "Donto Island",
        7,
        'An island of beaches, visited in "Date Expectations".',
        [
            [278, 30, 34, 30],
            [279, 32, 34, 10],
            [300, 30, 34, 20],
            [370, 30, 34, 20],
            [263, 30, 34, 20]
        ],
        [
            [370, 30, 34, 40],
            [72, 30, 34, 30],
            [320, 30, 34, 30]
        ]
    ),
    anime(
        "wailmerIsland",
        "Wailmer Island",
        7,
        'An island named for the Wailmer in its waters, from "Island Time".',
        [[278, 30, 34, 100]],
        [
            [320, 30, 34, 60],
            [321, 40, 40, 5],
            [72, 30, 34, 35]
        ]
    ),
    anime(
        "forina",
        "Forina",
        8,
        "Jirachi's resting place, a rugged wilderness where Butler tried to rebuild Groudon.",
        [
            [263, 38, 42, 20],
            [264, 40, 42, 15],
            [283, 38, 42, 15],
            [284, 40, 42, 10],
            [331, 38, 42, 15],
            [332, 40, 42, 10],
            [322, 38, 42, 15]
        ],
        [],
        { postGame: true }
    ),
    anime(
        "laRousseCity",
        "LaRousse City",
        8,
        "A high-tech city of moving walkways and windmills, where Deoxys and Rayquaza clashed.",
        [
            [311, 40, 44, 25],
            [312, 40, 44, 25],
            [81, 40, 44, 20],
            [82, 42, 44, 10],
            [137, 40, 40, 5],
            [100, 40, 44, 15]
        ],
        [],
        { postGame: true }
    ),
    anime(
        "southCity",
        "South City",
        8,
        'A city seen in "Destiny Deoxys".',
        [
            [278, 40, 44, 30],
            [279, 42, 44, 10],
            [311, 40, 44, 20],
            [312, 40, 44, 20],
            [263, 40, 44, 20]
        ],
        [],
        { postGame: true }
    )
];

/** Hoenn's anime-only legends and keepsakes. */
export const HOENN_ANIME_SPECIALS: SpecialEncounter[] = [
    {
        kind: "legendary",
        id: "metaGroudon",
        region: "hoenn",
        speciesId: META_GROUDON,
        level: 60,
        zoneId: "forina",
        place: "Forina, under the Millennium Comet",
        badgesRequired: 8,
        postGame: true,
        strength: 2.8,
        text: "Butler's machine drains Jirachi's power into Groudon's fossil, and Meta Groudon rises, devouring everything around it!"
    },
    {
        kind: "gift",
        id: "hoennCapPikachu",
        region: "hoenn",
        speciesId: 10095,
        level: 50,
        place: "Littleroot Town",
        badgesRequired: 8,
        postGame: true,
        text: "A Pikachu in a red-and-black cap hops off the truck in Littleroot, ready for another adventure."
    }
];

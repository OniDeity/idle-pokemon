/**
 * Johto locations that only exist in the animated series (Johto Journeys through Master Quest,
 * the third to fifth movies, Pokémon Chronicles and later series' visits). Encounter tables are
 * hand-authored from the wild Pokémon seen in each location's episodes, at levels that fit the
 * badge tier Ash had reached when he got there.
 */
import { CLONE_OFFSET, enc } from "./data";
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
        region: "johto",
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

/** The Pudgy Pidgey of Pudgy Pidgey Isle, too well fed to fly. */
export const PUDGY_PIDGEY = 3016;
/** Silver, the young Lugia of Ogi Isle. */
export const SILVER_LUGIA = 3249;
/** The Celebi the Iron-Masked Marauder corrupted with a Dark Ball. */
export const DARK_CELEBI = 3251;
/** The Iron-Masked Marauder's Tyranitar, under a Dark Ball. */
export const DARK_TYRANITAR = 3248;
/** The Entei the Unown conjured from Molly's wishes in "Spell of the Unown". */
export const UNOWN_ENTEI = 3244;

/** Every Johto location from Bulbapedia's list of animated-series-exclusive locations. */
export const JOHTO_ANIME_ZONES: ZoneDefinition[] = [
    anime(
        "palmHills",
        "Palm Hills",
        0,
        "A resort town of villas and pools, where Madame Muchmoney's Snubbull kept running away.",
        [
            [209, 3, 6, 25],
            [16, 2, 5, 20],
            [161, 2, 5, 20],
            [187, 3, 5, 15],
            [183, 3, 5, 10],
            [58, 4, 6, 10]
        ]
    ),
    anime("florando", "Florando", 0, "A town of flower gardens, where Bailey's Bellossom dance.", [
        [43, 3, 6, 30],
        [16, 2, 5, 20],
        [54, 3, 6, 15],
        [56, 3, 6, 15],
        [60, 3, 6, 15],
        [182, 6, 6, 3]
    ]),
    anime(
        "catalliaCity",
        "Catallia City",
        0,
        "The city where the Black Arachnid's Spinarak patrol for Officer Jenny.",
        [
            [167, 3, 6, 35],
            [19, 2, 5, 25],
            [52, 3, 6, 20],
            [21, 3, 5, 18],
            [168, 7, 7, 2]
        ]
    ),
    anime(
        "blueMoonFalls",
        "Blue Moon Falls",
        0,
        "A waterfall that shines blue under the full moon, where wild Quagsire gather.",
        [
            [194, 3, 6, 30],
            [10, 3, 5, 20],
            [60, 3, 6, 20],
            [118, 3, 6, 15],
            [12, 7, 8, 10],
            [195, 8, 8, 5]
        ]
    ),
    anime(
        "happyTown",
        "Happy Town",
        0,
        "A cheerful town whose Pokémon Center is run by a Nurse Joy and her Blissey.",
        [
            [43, 3, 6, 25],
            [69, 3, 6, 25],
            [16, 2, 5, 22],
            [104, 4, 6, 15],
            [132, 4, 6, 10],
            [113, 6, 6, 3]
        ]
    ),
    anime(
        "bigTown",
        "Big Town",
        1,
        "A bustling town where the Pichu Brothers and their posse get into mischief.",
        [
            [172, 4, 8, 35],
            [19, 4, 7, 19],
            [52, 5, 8, 15],
            [228, 5, 8, 15],
            [7, 5, 8, 8],
            [25, 6, 9, 8]
        ]
    ),
    anime("bloomingvale", "Bloomingvale", 1, "A sunny town that holds a Sunflora beauty contest.", [
        [191, 5, 8, 35],
        [187, 5, 8, 20],
        [16, 5, 8, 20],
        [209, 5, 8, 15],
        [165, 5, 8, 10],
        [192, 9, 9, 4]
    ]),
    anime(
        "palmpona",
        "Palmpona",
        2,
        "A market town where Pokémon are traded, fairly or otherwise.",
        [
            [19, 8, 11, 20],
            [52, 8, 12, 15],
            [108, 8, 12, 15],
            [202, 9, 12, 10],
            [20, 10, 12, 10],
            [35, 8, 11, 10],
            [39, 8, 11, 10],
            [16, 8, 11, 10]
        ]
    ),
    anime(
        "onixTunnel",
        "Onix Tunnel",
        2,
        "A tunnel dug by wild Onix, which they guard against intruders.",
        [
            [95, 10, 13, 30],
            [74, 8, 12, 25],
            [41, 8, 12, 25],
            [16, 8, 11, 10],
            [206, 9, 12, 5]
        ]
    ),
    anime(
        "lenTown",
        "Len Town",
        2,
        "Home of a psychic Girafarig and its Trainer, who solves mysteries for the town.",
        [
            [63, 9, 12, 20],
            [96, 9, 13, 20],
            [102, 9, 13, 20],
            [79, 9, 13, 15],
            [203, 10, 13, 10],
            [22, 12, 13, 5],
            [122, 11, 13, 5],
            [65, 13, 13, 1]
        ]
    ),
    anime(
        "wayAwayIsland",
        "Way Away Island",
        3,
        "A remote island where a delivery boy and his Pidgey carry the mail.",
        [
            [10, 12, 15, 15],
            [60, 12, 15, 15],
            [69, 12, 15, 15],
            [74, 12, 15, 15],
            [22, 13, 16, 10],
            [88, 12, 16, 10],
            [108, 13, 16, 8],
            [123, 14, 17, 4]
        ]
    ),
    anime(
        "bonitaville",
        "Bonitaville",
        3,
        "A town of Pokémon breeders, famous for its Vulpix and Ninetales.",
        [
            [37, 12, 15, 25],
            [39, 12, 15, 15],
            [29, 12, 15, 15],
            [32, 12, 15, 15],
            [27, 12, 15, 15],
            [17, 13, 16, 10],
            [38, 16, 16, 2]
        ]
    ),
    anime(
        "pokemonJujitsuAcademy",
        "Pokémon Jujitsu Academy",
        3,
        "A dojo that teaches Pokémon jujitsu. Aya's Ariados is its star pupil.",
        [
            [167, 12, 15, 25],
            [48, 12, 15, 20],
            [16, 12, 15, 20],
            [228, 13, 16, 10],
            [56, 13, 16, 10],
            [168, 16, 17, 6],
            [106, 16, 17, 2]
        ]
    ),
    anime(
        "wobbuffetVillage",
        "Wobbuffet Village",
        3,
        "Everyone here has a Wobbuffet, and battles are banned during the Wobbuffet Festival.",
        [
            [202, 12, 16, 40],
            [66, 12, 15, 20],
            [56, 12, 15, 20],
            [19, 12, 15, 14],
            [57, 16, 17, 4],
            [67, 16, 17, 2]
        ]
    ),
    anime(
        "remoraidMountain",
        "Remoraid Mountain",
        4,
        "A lake below the Colossal Tree Tribe's ruins, where a Remoraid's light shows the way.",
        [
            [43, 16, 20, 20],
            [16, 16, 20, 20],
            [41, 16, 20, 15],
            [74, 16, 20, 15],
            [69, 16, 20, 15],
            [44, 18, 21, 10]
        ],
        [
            [223, 16, 22, 60],
            [129, 15, 20, 30],
            [224, 22, 22, 10]
        ]
    ),
    anime(
        "sunfloraLodge",
        "Sunflora Lodge",
        4,
        "A snowy mountain inn where a photographer waits for Articuno.",
        [
            [191, 16, 19, 30],
            [187, 16, 19, 20],
            [16, 16, 19, 15],
            [220, 16, 19, 15],
            [188, 18, 21, 10],
            [192, 19, 21, 10]
        ]
    ),
    anime(
        "snowtopMountain",
        "Snowtop Mountain",
        4,
        "Articuno's mountain, where a boy and his Swinub watch for the spring thaw.",
        [
            [220, 16, 20, 30],
            [21, 16, 20, 20],
            [74, 16, 20, 15],
            [75, 18, 21, 15],
            [58, 16, 20, 10],
            [86, 16, 20, 10]
        ]
    ),
    anime(
        "whitestone",
        "Whitestone",
        4,
        "An artists' town where a painter's Smeargle covers the walls.",
        [
            [235, 17, 21, 35],
            [16, 16, 20, 20],
            [161, 16, 20, 15],
            [163, 16, 20, 12],
            [19, 16, 20, 10],
            [162, 19, 21, 8]
        ]
    ),
    anime("rikishiiTown", "Rikishii Town", 4, "The town that hosts the Pokémon Sumo Conference.", [
        [66, 16, 20, 25],
        [56, 16, 20, 20],
        [74, 16, 20, 20],
        [236, 16, 20, 12],
        [75, 20, 22, 8],
        [57, 20, 22, 6],
        [67, 20, 22, 6],
        [107, 20, 22, 3]
    ]),
    anime(
        "lakeLucid",
        "Lake Lucid",
        4,
        "A polluted lake that the local Water Pokémon helped bring back to life.",
        [
            [88, 17, 21, 25],
            [60, 16, 20, 20],
            [118, 16, 20, 20],
            [194, 16, 20, 20],
            [86, 17, 21, 15],
            [89, 21, 22, 5]
        ],
        [
            [72, 16, 21, 25],
            [118, 16, 21, 25],
            [120, 16, 20, 15],
            [223, 16, 20, 15],
            [86, 18, 22, 10],
            [129, 15, 20, 10]
        ]
    ),
    anime(
        "inlandCity",
        "Inland City",
        4,
        "The port where the ferry leaves for the Whirl Islands.",
        [
            [19, 16, 20, 20],
            [16, 16, 20, 20],
            [52, 17, 21, 20],
            [109, 17, 21, 14],
            [20, 20, 22, 6],
            [17, 20, 22, 6]
        ],
        [
            [72, 16, 21, 30],
            [183, 16, 20, 25],
            [120, 16, 21, 25],
            [222, 18, 22, 20]
        ]
    ),
    anime(
        "bluePointIsle",
        "Blue Point Isle",
        4,
        "A Whirl Island with a Pokémon Center and a reef full of Corsola.",
        [
            [222, 18, 22, 25],
            [120, 17, 21, 20],
            [98, 17, 21, 20],
            [90, 17, 21, 15]
        ],
        [
            [222, 18, 22, 25],
            [170, 18, 22, 25],
            [120, 17, 21, 20],
            [72, 17, 21, 20],
            [116, 17, 21, 10]
        ]
    ),
    anime(
        "pudgyPidgeyIsle",
        "Pudgy Pidgey Isle",
        4,
        "A Whirl Island whose Pidgey have no predators, eat all day and have forgotten how to fly.",
        [
            [PUDGY_PIDGEY, 16, 20, 40],
            [16, 16, 20, 25],
            [21, 16, 20, 15],
            [222, 17, 21, 15],
            [22, 20, 22, 5]
        ]
    ),
    anime(
        "bluefinland",
        "Bluefinland",
        4,
        "A seaside town where a Chinchou's light guides the fishing boats home.",
        [
            [98, 17, 21, 35],
            [222, 17, 21, 35],
            [90, 17, 21, 30]
        ],
        [
            [170, 18, 22, 40],
            [72, 17, 21, 30],
            [222, 17, 21, 25],
            [171, 22, 23, 5]
        ]
    ),
    anime(
        "blueLagoon",
        "Blue Lagoon",
        4,
        "A glowing lagoon where wild Chinchou gather at night.",
        [
            [222, 17, 21, 30],
            [120, 17, 21, 25],
            [90, 17, 21, 25],
            [98, 17, 21, 20]
        ],
        [
            [170, 18, 22, 30],
            [222, 18, 22, 25],
            [72, 17, 21, 25],
            [120, 17, 21, 18],
            [121, 22, 22, 2]
        ]
    ),
    anime(
        "megiCity",
        "Megi City",
        4,
        "A Whirl Islands town where a Corsola was falsely blamed for trouble.",
        [
            [222, 17, 21, 25],
            [52, 17, 21, 20],
            [19, 16, 20, 20],
            [16, 16, 20, 20],
            [90, 17, 21, 15]
        ]
    ),
    anime(
        "yellowRockIsle",
        "Yellow Rock Isle",
        4,
        "A rocky Whirl Island on the way to the Whirl Cup.",
        [
            [74, 17, 21, 25],
            [41, 17, 21, 25],
            [95, 18, 22, 15],
            [222, 17, 21, 15],
            [98, 17, 21, 15],
            [75, 21, 22, 5]
        ]
    ),
    anime(
        "ogiCity",
        "Ogi City",
        4,
        "A fishing town on the Whirl Islands, where Luka's Mantine was born.",
        [
            [52, 17, 21, 35],
            [19, 16, 20, 35],
            [16, 16, 20, 30]
        ],
        [
            [72, 17, 21, 25],
            [90, 17, 21, 20],
            [116, 17, 21, 20],
            [170, 17, 21, 15],
            [223, 17, 21, 15],
            [226, 20, 23, 5]
        ]
    ),
    anime(
        "issRaspberryWreck",
        "I.S.S. Raspberry Wreck",
        4,
        "A sunken ship off Ogi City, where a wild Mantine leads its school.",
        [],
        [
            [226, 20, 24, 25],
            [223, 18, 22, 25],
            [90, 18, 22, 20],
            [72, 18, 22, 20],
            [116, 18, 22, 10]
        ]
    ),
    anime(
        "redRockIsle",
        "Red Rock Isle",
        5,
        "A volcanic Whirl Island near the Whirl Cup arena.",
        [
            [74, 20, 24, 25],
            [98, 20, 24, 20],
            [222, 20, 24, 20],
            [95, 20, 24, 15],
            [218, 20, 24, 15],
            [99, 24, 25, 5]
        ],
        [
            [72, 20, 24, 30],
            [86, 20, 24, 20],
            [222, 20, 24, 20],
            [90, 20, 24, 18],
            [73, 24, 26, 8],
            [87, 25, 26, 4]
        ]
    ),
    anime(
        "scarletCity",
        "Scarlet City",
        5,
        "The host of the Whirl Cup, a Water-type tournament on the Whirl Islands.",
        [
            [52, 20, 24, 20],
            [54, 20, 24, 20],
            [19, 20, 24, 20],
            [60, 20, 24, 20],
            [20, 24, 26, 8],
            [61, 24, 26, 7],
            [55, 24, 26, 5]
        ],
        [
            [223, 20, 24, 25],
            [211, 20, 24, 20],
            [170, 20, 24, 20],
            [116, 20, 24, 20],
            [224, 25, 26, 5],
            [171, 25, 26, 5],
            [117, 24, 26, 5]
        ]
    ),
    anime(
        "diglettVillage",
        "Diglett Village",
        5,
        "A farming island whose Diglett till the fields, until thieves came for them.",
        [
            [50, 20, 24, 50],
            [84, 20, 24, 15],
            [27, 20, 24, 10],
            [51, 25, 26, 10],
            [85, 25, 26, 5],
            [28, 24, 26, 5]
        ]
    ),
    anime(
        "kasadoCity",
        "Kasado City",
        5,
        "A harbor town on the Whirl Islands, where Ash and Ritchie met again.",
        [
            [52, 20, 24, 20],
            [19, 20, 24, 20],
            [16, 20, 24, 20],
            [58, 20, 24, 15],
            [27, 20, 24, 15],
            [17, 24, 26, 10]
        ]
    ),
    anime(
        "silverRockIsle",
        "Silver Rock Isle",
        5,
        "A Whirl Island of pale cliffs, on the way to Ogi Isle.",
        [
            [74, 20, 24, 25],
            [27, 20, 24, 20],
            [50, 20, 24, 20],
            [104, 20, 24, 15],
            [111, 22, 25, 12],
            [28, 24, 26, 8]
        ]
    ),
    anime(
        "ogiIsle",
        "Ogi Isle",
        5,
        "Lugia's island, where Professor Oak's friend studies it and Silver was born.",
        [
            [16, 20, 24, 25],
            [21, 20, 24, 20],
            [163, 20, 24, 20],
            [165, 20, 24, 15],
            [22, 24, 26, 8],
            [164, 24, 26, 7],
            [166, 24, 26, 5]
        ],
        [
            [90, 20, 24, 35],
            [72, 20, 24, 30],
            [120, 20, 24, 20],
            [222, 20, 24, 8],
            [91, 25, 26, 5],
            [121, 26, 26, 2]
        ]
    ),
    anime(
        "transitTown",
        "Transit Town",
        5,
        "A town on the road to Olivine, where Wings Alexander trains Hoothoot to fly.",
        [
            [163, 20, 24, 35],
            [16, 20, 24, 20],
            [19, 20, 24, 15],
            [164, 24, 26, 10],
            [17, 24, 26, 8],
            [21, 20, 24, 7],
            [20, 24, 26, 5]
        ]
    ),
    anime(
        "arborville",
        "Arborville",
        6,
        "A village at the edge of the forest that Celebi protects.",
        [
            [10, 22, 26, 15],
            [13, 22, 26, 15],
            [16, 22, 26, 15],
            [161, 22, 26, 15],
            [165, 22, 26, 10],
            [167, 22, 26, 10],
            [204, 22, 26, 10],
            [163, 22, 26, 10]
        ]
    ),
    anime(
        "lakeOfLife",
        "Lake of Life",
        6,
        "The forest's sacred lake. Its water healed Celebi, and Suicune runs across it.",
        [
            [194, 23, 27, 25],
            [183, 23, 27, 25],
            [60, 23, 27, 20],
            [184, 26, 28, 10],
            [195, 26, 28, 10],
            [61, 26, 28, 10]
        ],
        [
            [118, 23, 27, 30],
            [129, 20, 27, 25],
            [194, 23, 27, 20],
            [60, 23, 27, 15],
            [119, 27, 28, 7],
            [130, 28, 28, 3]
        ]
    ),
    anime(
        "greenfield",
        "Greenfield",
        6,
        "A flower-covered town, until the Unown sealed the Hale mansion in crystal.",
        [
            [43, 23, 27, 20],
            [187, 23, 27, 20],
            [191, 23, 27, 15],
            [16, 23, 27, 15],
            [44, 25, 28, 10],
            [188, 25, 28, 10],
            [192, 26, 28, 5],
            [182, 28, 28, 3],
            [17, 26, 28, 2]
        ]
    ),
    anime("eggseter", "Eggseter", 6, "A town of extreme Pokémon sports, where Gary returned.", [
        [161, 23, 27, 20],
        [177, 23, 27, 15],
        [190, 23, 27, 15],
        [194, 23, 27, 15],
        [128, 24, 28, 15],
        [216, 23, 27, 14],
        [162, 27, 28, 6]
    ]),
    anime(
        "lakeSlowpoke",
        "Lake Slowpoke",
        7,
        "A lake town where a festival honors the Slowpoke that bring the rain.",
        [
            [79, 26, 30, 45],
            [60, 26, 30, 17],
            [118, 26, 30, 15],
            [54, 26, 30, 15],
            [80, 30, 31, 8]
        ],
        [
            [79, 26, 30, 25],
            [90, 26, 30, 15],
            [118, 26, 30, 15],
            [129, 20, 30, 15],
            [170, 26, 30, 15],
            [171, 30, 31, 7],
            [119, 29, 31, 6],
            [130, 30, 31, 2]
        ]
    ),
    anime(
        "slowpokeTemple",
        "Slowpoke Temple",
        7,
        "The lakeside temple of a priestess who leads the Slowpoke Festival.",
        [
            [79, 26, 30, 50],
            [80, 29, 31, 15],
            [63, 26, 30, 15],
            [92, 26, 30, 12],
            [93, 29, 31, 5],
            [199, 30, 31, 3]
        ]
    ),
    anime(
        "maroonTown",
        "Maroon Town",
        7,
        "A town where a fake Professor Oak fooled everyone for a while.",
        [
            [16, 26, 30, 20],
            [19, 26, 30, 20],
            [52, 26, 30, 17],
            [27, 26, 30, 15],
            [17, 28, 31, 10],
            [20, 29, 31, 8],
            [28, 29, 31, 6],
            [133, 26, 30, 4]
        ]
    ),
    anime(
        "battlePark",
        "Battle Park",
        7,
        "A park that lends visitors strong Pokémon to battle, all trained to come home.",
        [
            [2, 27, 30, 10],
            [5, 27, 30, 10],
            [8, 27, 30, 10],
            [238, 26, 30, 10],
            [1, 26, 28, 8],
            [4, 26, 28, 8],
            [7, 26, 28, 8],
            [3, 30, 32, 4],
            [6, 30, 32, 4],
            [9, 30, 32, 4]
        ]
    ),
    anime(
        "dragonHolyLand",
        "Dragon Holy Land",
        7,
        "A sacred valley near Blackthorn City, where Clair trains and wild Dragonite roam.",
        [
            [147, 26, 30, 25],
            [161, 26, 30, 15],
            [187, 26, 30, 10],
            [48, 26, 30, 10],
            [148, 30, 32, 8],
            [162, 29, 31, 8],
            [12, 26, 30, 8],
            [39, 26, 30, 8],
            [43, 26, 30, 8],
            [189, 30, 32, 4],
            [149, 34, 36, 1]
        ]
    ),
    anime(
        "charicificValley",
        "Charicific Valley",
        8,
        "Liza's refuge, where wild Charizard train against each other and grow huge.",
        [
            [4, 30, 34, 30],
            [5, 34, 36, 25],
            [6, 36, 40, 25],
            [58, 30, 34, 12],
            [126, 32, 36, 8]
        ]
    ),
    anime(
        "marinePokemonLab",
        "Marine Pokémon Laboratory",
        8,
        "A seaside lab that cares for Water Pokémon and lost young Lapras.",
        [
            [54, 30, 34, 20],
            [86, 30, 34, 20],
            [98, 30, 34, 20],
            [222, 30, 34, 22],
            [55, 34, 36, 6],
            [87, 34, 36, 6],
            [99, 34, 36, 6]
        ],
        [
            [73, 30, 34, 25],
            [171, 30, 34, 20],
            [211, 30, 34, 20],
            [226, 30, 34, 15],
            [90, 30, 34, 14],
            [131, 30, 36, 6]
        ]
    ),
    anime(
        "coastlineGym",
        "Coastline Gym",
        8,
        "Dorian's unofficial Gym, built under the sea.",
        [],
        [
            [211, 30, 34, 30],
            [171, 32, 36, 25],
            [226, 30, 34, 25],
            [170, 30, 34, 20]
        ]
    ),
    anime(
        "marionTown",
        "Marion Town",
        8,
        "A forest town where a Nurse Joy once looked after a sick Celebi.",
        [
            [43, 30, 34, 20],
            [69, 30, 34, 20],
            [16, 30, 34, 20],
            [161, 30, 34, 15],
            [187, 30, 34, 15],
            [113, 32, 36, 5],
            [242, 36, 36, 1]
        ]
    ),
    anime(
        "johtoSilverTown",
        "Silver Town",
        8,
        "Home of the Silver Conference, the Johto League tournament.",
        [
            [19, 30, 34, 10],
            [20, 34, 36, 10],
            [228, 30, 34, 10],
            [43, 30, 34, 8],
            [44, 34, 36, 8],
            [69, 30, 34, 8],
            [200, 30, 34, 8],
            [236, 30, 34, 8],
            [70, 34, 36, 6],
            [229, 36, 38, 4],
            [133, 30, 34, 3],
            [112, 36, 38, 3],
            [106, 36, 38, 2],
            [107, 36, 38, 2],
            [237, 36, 38, 2]
        ],
        [
            [223, 30, 34, 40],
            [129, 30, 34, 30],
            [224, 34, 38, 15],
            [118, 30, 34, 10],
            [130, 36, 38, 5]
        ]
    ),
    anime(
        "hoOhShrine",
        "Ho-Oh Shrine",
        8,
        "A shrine near Silver Town, where Harrison's Sneasel once raided the shrine's food.",
        [
            [66, 30, 34, 20],
            [215, 30, 34, 20],
            [12, 30, 34, 15],
            [61, 30, 34, 15],
            [163, 30, 34, 14],
            [62, 34, 36, 8],
            [67, 34, 36, 8]
        ]
    ),
    anime(
        "altoMare",
        "Alto Mare",
        8,
        "A city of canals and gondolas, watched over by the Eon Pokémon.",
        [
            [19, 30, 34, 25],
            [52, 30, 34, 25],
            [16, 30, 34, 20],
            [54, 30, 34, 20],
            [138, 32, 36, 3],
            [140, 32, 36, 3],
            [142, 36, 38, 1]
        ],
        [
            [72, 30, 34, 30],
            [118, 30, 34, 25],
            [116, 30, 34, 20],
            [60, 30, 34, 15],
            [129, 25, 34, 10]
        ]
    ),
    anime(
        "secretGarden",
        "Secret Garden",
        8,
        "Alto Mare's hidden garden, where the Soul Dew is kept.",
        [
            [182, 34, 38, 15],
            [191, 30, 34, 15],
            [187, 30, 34, 15],
            [43, 30, 34, 15],
            [12, 32, 36, 10],
            [192, 34, 38, 10],
            [45, 36, 38, 5],
            [189, 36, 38, 5],
            [196, 38, 38, 1]
        ],
        [
            [118, 30, 34, 50],
            [60, 30, 34, 30],
            [119, 34, 38, 20]
        ]
    ),
    anime(
        "eclipseCastle",
        "Eclipse Castle",
        8,
        "An old castle named for the eclipse, visited in Pokémon Journeys.",
        [
            [92, 42, 46, 25],
            [163, 42, 46, 20],
            [200, 42, 46, 15],
            [198, 42, 46, 15],
            [93, 45, 48, 12],
            [164, 45, 48, 10],
            [94, 50, 50, 3]
        ],
        [],
        { postGame: true }
    ),
    anime(
        "mochewCity",
        "Mochew City",
        8,
        "A Johto city visited in Pokémon Horizons, with a famously strict Pokémon Center.",
        [
            [52, 45, 50, 20],
            [19, 45, 50, 20],
            [16, 45, 50, 20],
            [58, 45, 50, 12],
            [20, 48, 52, 10],
            [53, 48, 52, 8],
            [18, 50, 52, 5],
            [59, 52, 54, 3]
        ],
        [],
        { postGame: true }
    ),
    anime(
        "woodyPark",
        "Woody Park",
        8,
        "A wooded park outside Mochew City.",
        [
            [11, 45, 50, 15],
            [14, 45, 50, 15],
            [165, 45, 50, 15],
            [167, 45, 50, 15],
            [204, 45, 50, 10],
            [12, 48, 52, 8],
            [15, 48, 52, 8],
            [166, 48, 52, 5],
            [168, 48, 52, 5],
            [205, 48, 52, 4]
        ],
        [],
        { postGame: true }
    ),
    anime(
        "exceedTestingCenter",
        "Exceed Testing Center",
        8,
        "Exceed's research site, where its newest technology gets tested on Pokémon.",
        [
            [81, 45, 50, 30],
            [100, 45, 50, 25],
            [82, 48, 52, 15],
            [101, 48, 52, 12],
            [137, 48, 52, 10],
            [233, 52, 54, 3]
        ],
        [],
        { postGame: true }
    ),
    anime(
        "mountQuena",
        "Mount Quena",
        8,
        "Mewtwo led the clones from New Island here, where they live in peace.",
        [
            [CLONE_OFFSET + 1, 50, 55, 6],
            [CLONE_OFFSET + 4, 50, 55, 6],
            [CLONE_OFFSET + 7, 50, 55, 6],
            [CLONE_OFFSET + 25, 50, 55, 8],
            [CLONE_OFFSET + 52, 50, 55, 8],
            [CLONE_OFFSET + 27, 50, 55, 6],
            [CLONE_OFFSET + 54, 50, 55, 6],
            [CLONE_OFFSET + 37, 50, 55, 6],
            [CLONE_OFFSET + 111, 50, 55, 6],
            [CLONE_OFFSET + 40, 52, 58, 5],
            [CLONE_OFFSET + 18, 52, 58, 5],
            [CLONE_OFFSET + 31, 52, 58, 5],
            [CLONE_OFFSET + 28, 52, 58, 5],
            [CLONE_OFFSET + 123, 52, 58, 5],
            [CLONE_OFFSET + 106, 52, 58, 5],
            [CLONE_OFFSET + 87, 52, 58, 5],
            [CLONE_OFFSET + 45, 52, 58, 5],
            [CLONE_OFFSET + 55, 52, 58, 5],
            [CLONE_OFFSET + 117, 52, 58, 5],
            [CLONE_OFFSET + 73, 52, 58, 5],
            [CLONE_OFFSET + 38, 52, 58, 5],
            [CLONE_OFFSET + 78, 52, 58, 5],
            [CLONE_OFFSET + 134, 52, 58, 4],
            [CLONE_OFFSET + 130, 52, 58, 4],
            [CLONE_OFFSET + 3, 55, 60, 4],
            [CLONE_OFFSET + 6, 55, 60, 4],
            [CLONE_OFFSET + 9, 55, 60, 4]
        ],
        [],
        { postGame: true }
    )
];

/** The one-of-a-kind Pokémon of the Johto anime and movies. */
export const JOHTO_ANIME_SPECIALS: SpecialEncounter[] = [
    {
        kind: "legendary",
        id: "silverLugia",
        region: "johto",
        speciesId: SILVER_LUGIA,
        level: 30,
        zoneId: "ogiIsle",
        place: "Ogi Isle",
        badgesRequired: 5,
        strength: 2.0,
        text: "A young Lugia, separated from its mother, hides in the island's caves."
    },
    {
        kind: "legendary",
        id: "unownEntei",
        region: "johto",
        speciesId: UNOWN_ENTEI,
        level: 55,
        zoneId: "greenfield",
        place: "The crystal mansion",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "The Unown's crystal spreads over Greenfield, and the Entei they conjured guards it."
    },
    {
        kind: "legendary",
        id: "darkTyranitar",
        region: "johto",
        speciesId: DARK_TYRANITAR,
        level: 58,
        zoneId: "arborville",
        place: "The forest outside Arborville",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "The Iron-Masked Marauder's Tyranitar tears through the forest. Break the Dark Ball's hold!"
    },
    {
        kind: "legendary",
        id: "darkCelebi",
        region: "johto",
        speciesId: DARK_CELEBI,
        level: 60,
        zoneId: "lakeOfLife",
        place: "Lake of Life",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "A Dark Ball has turned Celebi against the forest. Free it at the Lake of Life!"
    }
];

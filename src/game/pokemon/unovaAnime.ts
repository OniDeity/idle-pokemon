/**
 * Unova locations that only exist in the animated series (Best Wishes, Adventures in Unova and
 * Beyond's Decolore Islands) and the three Unova movies. The places are the Pokémon Fandom wiki's
 * "Anime locations" that are also "Unova locations"; each table is hand-picked from the wild
 * Pokémon of the place's debut episode or movie (its cast list, or its plot where the wiki has
 * none), at levels that fit the badges Ash had by then. Places with no wild Pokémon (battle clubs,
 * the Vertress Conference, Team Plasma's hideouts) are left out.
 */
import { enc } from "./data";
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
        region: "unova",
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

const postGame = { postGame: true };

export const UNOVA_ANIME_ZONES: ZoneDefinition[] = [
    anime(
        "unovaClockTower",
        "Clock Tower",
        1,
        "A town's old clock tower, whose bell a Darmanitan was stuck inside (BW008).",
        [[554, 12, 16, 30]]
    ),
    anime(
        "antimonyResearchLab",
        "Antimony Research Lab",
        1,
        "A lab by the cliffs where Dwebble look for the right rock to call home (BW011).",
        [[557, 12, 16, 30]]
    ),
    anime(
        "litwickMansion",
        "Litwick Mansion",
        2,
        "A mansion lit by Litwick, which drain the life of visitors who stay too long (BW028).",
        [[607, 18, 21, 30]]
    ),
    anime(
        "rainbowValley",
        "Rainbow Valley",
        2,
        "A valley on Cottonee's migration route, where a Cottonee fell in love with Cilan's Pansage (BW031).",
        [[546, 16, 21, 30]]
    ),
    anime(
        "area28",
        "Area 28",
        2,
        "A field where a UFO was spotted and a wild Elgyem turned up (BW032).",
        [[605, 18, 21, 30]]
    ),
    anime(
        "milosIsland",
        "Milos Island",
        4,
        "An island of legends about the Forces of Nature, home to a lonely Deino (BW058).",
        [
            [590, 26, 29, 25],
            [602, 26, 29, 20],
            [633, 26, 28, 5]
        ]
    ),
    anime(
        "herosRuin",
        "Hero's Ruin",
        5,
        "Ruins of the hero who rode Zekrom, guarded by Sigilyph and haunted by Yamask (BW066).",
        [
            [561, 30, 33, 20],
            [562, 29, 32, 20],
            [622, 29, 32, 15],
            [554, 29, 32, 15],
            [543, 29, 31, 15]
        ]
    ),
    anime(
        "mistraltonTower",
        "Mistralton Tower",
        5,
        "A tower of trials near Mistralton City, climbed for the right to challenge Skyla (BW071).",
        [
            [607, 30, 33, 20],
            [531, 30, 33, 15]
        ]
    ),
    anime(
        "villageOfDragons",
        "Village of Dragons",
        8,
        "Iris's hometown in the mountains, where Dragon-type Pokémon and their trainers live (BW009).",
        [
            [610, 46, 49, 25],
            [611, 50, 52, 10],
            [612, 54, 54, 3],
            [621, 48, 52, 12]
        ],
        [],
        postGame
    ),
    anime(
        "ferroseedResearch",
        "Ferroseed Research Institute",
        6,
        "A lab whose wild Ferroseed swarm the grounds; a Ferrothorn rules them (BW083).",
        [[597, 33, 37, 30]]
    ),
    anime(
        "eindoakTown",
        "Eindoak Town",
        6,
        "A town of the Harvest Festival around the Sword of the Vale, Victini's home (MS014).",
        [
            [585, 32, 36, 15],
            [586, 36, 38, 5],
            [509, 32, 35, 12],
            [548, 32, 35, 12],
            [546, 32, 35, 12],
            [529, 32, 35, 10],
            [506, 32, 35, 10],
            [522, 32, 35, 10],
            [574, 32, 35, 6],
            [575, 36, 38, 3]
        ]
    ),
    anime(
        "kingdomOfTheVale",
        "Kingdom of the Vale",
        6,
        "The ruins of the People of the Vale, whose king once commanded Reshiram and Zekrom (MS014).",
        [
            [627, 32, 35, 10],
            [629, 32, 35, 10],
            [577, 32, 35, 20],
            [578, 36, 38, 8],
            [574, 32, 35, 15],
            [575, 36, 38, 6]
        ]
    ),
    anime(
        "roshanCity",
        "Roshan City",
        7,
        "A city where the Swords of Justice met Ash, and Kyurem's chase began (MS015).",
        [
            [504, 34, 37, 15],
            [505, 38, 40, 6],
            [540, 34, 37, 10],
            [541, 38, 40, 5],
            [542, 41, 41, 2],
            [522, 34, 37, 10],
            [523, 38, 40, 4],
            [572, 34, 37, 10],
            [573, 40, 40, 3],
            [509, 34, 37, 10],
            [569, 38, 40, 4],
            [544, 34, 37, 8],
            [545, 41, 41, 2]
        ]
    ),
    anime(
        "windyStation",
        "Windy Station",
        7,
        "A snowy mountain station where Kyurem's blizzard caught up with the Swords of Justice (MS015).",
        [
            [613, 34, 38, 30],
            [614, 40, 41, 8],
            [615, 38, 40, 6]
        ]
    ),
    anime(
        "fullCourt",
        "Full Court",
        7,
        "A sheer mountain arena where Keldeo faced Kyurem (MS015).",
        [
            [585, 34, 37, 15],
            [586, 39, 41, 5],
            [631, 36, 39, 10],
            [529, 34, 37, 15],
            [536, 36, 38, 8],
            [537, 40, 41, 3]
        ]
    ),
    anime(
        "honeyIsland",
        "Honey Island",
        8,
        "A Decolore island famous for its honey, and the Beedrill and Ursaring it draws (BW126).",
        [
            [415, 45, 50, 25],
            [14, 45, 48, 20],
            [15, 50, 52, 10],
            [216, 45, 48, 12],
            [217, 52, 54, 4]
        ],
        [],
        postGame
    ),
    anime(
        "scalchopIsland",
        "Scalchop Island",
        8,
        "A Decolore island where Oshawott and its evolutions compete to be Scalchop King (BW128).",
        [
            [501, 45, 48, 20],
            [502, 48, 52, 8],
            [503, 54, 54, 2]
        ],
        [
            [501, 45, 48, 20],
            [502, 48, 52, 8]
        ],
        postGame
    ),
    anime(
        "grandSpectralaIsland",
        "Grand Spectrala Island",
        8,
        "The Island of Illusions, where Zorua and Zoroark fool travelers (BW129).",
        [
            [570, 45, 48, 15],
            [571, 52, 52, 3],
            [590, 45, 48, 20],
            [531, 45, 48, 15]
        ],
        [
            [580, 45, 48, 30],
            [581, 50, 52, 8],
            [550, 45, 50, 20]
        ],
        postGame
    ),
    anime(
        "grandSpectralaIslet",
        "Grand Spectrala Islet",
        8,
        "An islet reached only at low tide, where a Zoroark protects the island's illusions (BW129).",
        [
            [570, 46, 49, 20],
            [571, 52, 54, 10]
        ],
        [],
        postGame
    ),
    anime(
        "toromIsland",
        "Torom Island",
        8,
        "A Decolore island whose Rotom hide in the islanders' appliances (BW130).",
        [[479, 45, 50, 30]],
        [],
        postGame
    ),
    anime(
        "wayfarerIsland",
        "Wayfarer Island",
        8,
        "A resting stop for migrating Butterfree, where Swablu and Swanna gather too (BW132).",
        [
            [10, 45, 47, 15],
            [11, 46, 48, 15],
            [12, 48, 52, 20],
            [333, 45, 48, 15],
            [334, 52, 54, 4],
            [216, 45, 48, 8],
            [217, 52, 54, 3]
        ],
        [
            [580, 45, 48, 20],
            [581, 50, 52, 10]
        ],
        postGame
    ),
    anime(
        "capaciaIsland",
        "Capacia Island",
        8,
        "A Decolore island with a Pokémon Center whose wild Dunsparce dig under the paths (BW133).",
        [[206, 45, 50, 30]],
        [],
        postGame
    ),
    anime(
        "caveIsland",
        "Cave Island",
        8,
        "A Decolore island whose caves hide a different-colored Druddigon (BW138).",
        [
            [621, 46, 50, 20],
            [590, 45, 48, 15],
            [591, 50, 52, 6]
        ],
        [],
        postGame
    ),
    anime(
        "pokemonHills",
        "Pokémon Hills",
        8,
        "New Tork City's park, built as a home for Pokémon, where the Genesect army settled (MS016).",
        [
            [133, 45, 48, 10],
            [113, 45, 48, 6],
            [181, 50, 52, 6],
            [46, 45, 48, 10],
            [47, 50, 52, 5],
            [12, 48, 52, 8],
            [527, 45, 48, 12],
            [528, 50, 52, 5],
            [302, 45, 48, 8],
            [632, 45, 48, 10],
            [585, 45, 48, 8],
            [586, 50, 52, 3]
        ],
        [],
        postGame
    ),
    anime(
        "newTorkCity",
        "New Tork City",
        8,
        "A city of skyscrapers whose old power plant the Genesect made their nest (MS016).",
        [
            [527, 45, 48, 20],
            [528, 50, 52, 8],
            [302, 45, 48, 12],
            [632, 45, 48, 15],
            [505, 45, 50, 15],
            [74, 45, 48, 10],
            [229, 50, 52, 4]
        ],
        [],
        postGame
    )
];

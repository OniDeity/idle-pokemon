/**
 * Almia, from Pokémon Ranger: Shadows of Almia. Like Fiore, there are no Trainers or Gyms: the
 * region's trials are the game's missions against Team Dim Sun, each ending in a boss capture,
 * and wild Pokémon are captured with the Capture Styler. The Pokémon and their places come from
 * the game's Browser (Serebii's list); Ranger has no levels, so each place takes levels from
 * where it falls in the story.
 *
 * Almia's own feature is the game's Field Abilities: some Pokémon hide behind obstacles (a tree
 * to Tackle, a rock to Crush) and only come out once a Pokémon in your box has that Field
 * Ability at that power. Each species' ability is the Browser's; Pokémon Almia doesn't have get
 * one from their type and evolution stage.
 */
import type { EncounterEntry, FieldAbility, FieldNeed, PokemonType } from "./data";
import { enc, getSpecies, SPECIES } from "./data";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { timeLimit, trial } from "./trainers";
import { OBLIVIA_FIELD } from "./oblivia";
import type { ZoneDefinition } from "./zones";

export const FIELD_ABILITY_NAMES: Record<FieldAbility, string> = {
    cut: "Cut",
    crush: "Crush",
    tackle: "Tackle",
    burn: "Burn",
    soak: "Soak",
    electrify: "Electrify",
    recharge: "Recharge",
    psyPower: "Psy Power",
    roar: "Roar"
};

/** The Browser's Field Abilities: [ability, power] by species. */
const BROWSER_FIELD: Record<number, [FieldAbility, number]> = {
    4: ["burn", 1],
    5: ["burn", 2],
    6: ["burn", 4],
    7: ["soak", 1],
    8: ["soak", 2],
    13: ["tackle", 1],
    15: ["crush", 2],
    19: ["tackle", 1],
    20: ["cut", 2],
    21: ["cut", 1],
    22: ["cut", 3],
    25: ["recharge", 3],
    26: ["recharge", 4],
    37: ["burn", 1],
    38: ["burn", 4],
    39: ["tackle", 1],
    40: ["tackle", 2],
    41: ["cut", 1],
    42: ["crush", 2],
    43: ["cut", 1],
    44: ["cut", 2],
    45: ["cut", 3],
    56: ["crush", 1],
    57: ["crush", 3],
    58: ["burn", 2],
    59: ["burn", 4],
    63: ["tackle", 1],
    67: ["crush", 2],
    68: ["crush", 3],
    71: ["cut", 2],
    73: ["crush", 2],
    74: ["crush", 1],
    75: ["crush", 2],
    76: ["crush", 4],
    77: ["burn", 1],
    78: ["burn", 3],
    81: ["recharge", 2],
    82: ["recharge", 5],
    85: ["tackle", 2],
    89: ["tackle", 2],
    92: ["psyPower", 1],
    93: ["psyPower", 2],
    94: ["psyPower", 3],
    96: ["crush", 2],
    97: ["psyPower", 2],
    100: ["electrify", 2],
    101: ["electrify", 3],
    109: ["tackle", 1],
    110: ["tackle", 2],
    111: ["tackle", 2],
    112: ["tackle", 3],
    115: ["crush", 2],
    116: ["tackle", 2],
    117: ["soak", 3],
    120: ["cut", 1],
    121: ["cut", 3],
    123: ["cut", 3],
    126: ["burn", 2],
    127: ["cut", 2],
    128: ["tackle", 2],
    133: ["crush", 1],
    134: ["soak", 3],
    135: ["electrify", 3],
    136: ["burn", 3],
    138: ["tackle", 2],
    139: ["soak", 3],
    142: ["crush", 4],
    147: ["tackle", 1],
    167: ["tackle", 1],
    168: ["tackle", 3],
    169: ["crush", 3],
    170: ["recharge", 2],
    171: ["recharge", 4],
    172: ["recharge", 1],
    179: ["electrify", 1],
    180: ["electrify", 2],
    181: ["electrify", 3],
    182: ["cut", 3],
    185: ["crush", 2],
    190: ["tackle", 1],
    193: ["cut", 2],
    197: ["cut", 3],
    198: ["cut", 1],
    203: ["tackle", 2],
    204: ["tackle", 1],
    205: ["crush", 2],
    207: ["cut", 1],
    211: ["soak", 1],
    212: ["cut", 4],
    218: ["burn", 1],
    219: ["burn", 2],
    220: ["tackle", 1],
    221: ["tackle", 3],
    222: ["crush", 2],
    225: ["crush", 1],
    228: ["tackle", 1],
    229: ["burn", 2],
    230: ["crush", 4],
    236: ["crush", 1],
    239: ["electrify", 2],
    240: ["burn", 1],
    241: ["tackle", 2],
    246: ["crush", 1],
    247: ["crush", 2],
    248: ["crush", 4],
    254: ["cut", 3],
    257: ["burn", 3],
    273: ["tackle", 1],
    274: ["tackle", 2],
    275: ["cut", 3],
    276: ["cut", 1],
    277: ["cut", 2],
    278: ["soak", 1],
    279: ["soak", 3],
    280: ["tackle", 1],
    282: ["psyPower", 3],
    287: ["cut", 1],
    291: ["cut", 2],
    296: ["crush", 2],
    297: ["crush", 3],
    299: ["crush", 2],
    302: ["cut", 2],
    303: ["crush", 2],
    304: ["tackle", 1],
    305: ["tackle", 2],
    306: ["tackle", 4],
    315: ["cut", 2],
    319: ["crush", 4],
    320: ["tackle", 2],
    322: ["burn", 1],
    323: ["burn", 3],
    330: ["cut", 4],
    331: ["tackle", 1],
    332: ["crush", 2],
    334: ["cut", 2],
    344: ["crush", 3],
    353: ["psyPower", 1],
    354: ["psyPower", 2],
    355: ["psyPower", 1],
    356: ["psyPower", 2],
    359: ["cut", 4],
    361: ["crush", 1],
    362: ["crush", 3],
    363: ["tackle", 1],
    364: ["crush", 2],
    365: ["crush", 3],
    367: ["crush", 3],
    368: ["crush", 2],
    371: ["tackle", 1],
    372: ["tackle", 2],
    373: ["crush", 4],
    388: ["tackle", 2],
    389: ["tackle", 4],
    391: ["burn", 2],
    392: ["burn", 3],
    394: ["cut", 2],
    397: ["cut", 2],
    399: ["crush", 1],
    400: ["soak", 2],
    402: ["cut", 2],
    403: ["electrify", 1],
    404: ["electrify", 2],
    405: ["electrify", 3],
    406: ["tackle", 1],
    407: ["cut", 3],
    409: ["tackle", 5],
    411: ["tackle", 3],
    414: ["cut", 2],
    415: ["cut", 1],
    416: ["crush", 3],
    418: ["soak", 1],
    420: ["tackle", 1],
    421: ["tackle", 2],
    422: ["soak", 1],
    423: ["soak", 2],
    424: ["crush", 2],
    427: ["crush", 1],
    428: ["crush", 2],
    429: ["psyPower", 3],
    430: ["cut", 3],
    431: ["cut", 1],
    432: ["tackle", 2],
    434: ["crush", 1],
    436: ["crush", 1],
    437: ["crush", 3],
    438: ["tackle", 1],
    440: ["crush", 1],
    441: ["cut", 1],
    444: ["cut", 3],
    445: ["crush", 5],
    447: ["crush", 1],
    451: ["crush", 1],
    454: ["crush", 2],
    455: ["cut", 2],
    456: ["soak", 1],
    457: ["soak", 2],
    458: ["tackle", 1],
    460: ["crush", 3],
    461: ["cut", 4],
    462: ["electrify", 3],
    463: ["crush", 3],
    465: ["tackle", 2],
    466: ["electrify", 3],
    467: ["burn", 5],
    468: ["cut", 3],
    470: ["cut", 3],
    471: ["crush", 3],
    474: ["crush", 3],
    475: ["cut", 5],
    476: ["crush", 4],
    477: ["psyPower", 3],
    478: ["crush", 3]
};

const TYPE_FIELD: Partial<Record<PokemonType, FieldAbility>> = {
    fire: "burn",
    water: "soak",
    ice: "soak",
    electric: "electrify",
    psychic: "psyPower",
    ghost: "psyPower",
    rock: "crush",
    ground: "crush",
    fighting: "crush",
    steel: "crush",
    dragon: "crush",
    poison: "crush",
    normal: "tackle",
    grass: "cut",
    bug: "cut",
    flying: "cut",
    dark: "cut",
    fairy: "cut"
};

/** Each species' pre-evolution. */
const EVOLVES_FROM = new Map<number, number>(
    SPECIES.flatMap(s => s.evolutions.map(e => [e.into, s.id] as [number, number]))
);

function evolutionStage(id: number): number {
    let stage = 0;
    for (let at = EVOLVES_FROM.get(id); at != null && stage < 3; at = EVOLVES_FROM.get(at)) {
        stage++;
    }
    return stage;
}

/**
 * A Pokémon's Field Ability and its power: the Browser's for Almia's Pokémon, otherwise from its
 * first type, ×1 to ×3 by evolution stage (one more for strong final forms).
 */
export function fieldAbilityOf(speciesId: number): [FieldAbility, number] {
    const species = getSpecies(speciesId);
    const base = species.baseSpecies ?? speciesId;
    const listed = BROWSER_FIELD[base] ?? OBLIVIA_FIELD[base];
    if (listed != null) return listed;
    const ability = TYPE_FIELD[species.types[0]] ?? "tackle";
    const total = species.baseStats.reduce((sum, stat) => sum + stat, 0);
    return [ability, Math.min(4, evolutionStage(base) + 1 + (total >= 500 ? 1 : 0))];
}

/** The strongest power of each Field Ability among these Pokémon. */
export function fieldPowers(speciesIds: Iterable<number>): Partial<Record<FieldAbility, number>> {
    const powers: Partial<Record<FieldAbility, number>> = {};
    for (const id of speciesIds) {
        const [ability, power] = fieldAbilityOf(id);
        powers[ability] = Math.max(powers[ability] ?? 0, power);
    }
    return powers;
}

export function meetsFieldNeed(
    need: FieldNeed | undefined,
    powers: Partial<Record<FieldAbility, number>>
): boolean {
    return need == null || (powers[need.ability] ?? 0) >= need.power;
}

/** An encounter behind an obstacle that needs a Field Ability. */
function hidden(entry: EncounterEntry, ability: FieldAbility, power: number): EncounterEntry {
    return { ...entry, obstacle: { ability, power } };
}

function zone(options: Omit<ZoneDefinition, "region">): ZoneDefinition {
    return { region: "almia", ...options };
}

export const ALMIA_ZONES: ZoneDefinition[] = [
    zone({
        id: "rangerSchool",
        name: "Ranger School",
        badgesRequired: 0,
        blurb: "Almia's Ranger School by Vientown, where every Ranger starts as a student (and a Tangrowth crashes graduation).",
        encounters: {
            walk: [
                enc(4, 3, 7, 10),
                enc(7, 3, 7, 10),
                enc(41, 3, 7, 10),
                enc(84, 3, 7, 10),
                enc(92, 3, 7, 10),
                enc(172, 3, 7, 10),
                enc(276, 3, 7, 10),
                hidden(enc(287, 3, 7, 10), "tackle", 1),
                enc(399, 3, 7, 10),
                enc(417, 3, 7, 10),
                enc(427, 3, 7, 10),
                enc(438, 3, 7, 10),
                enc(453, 3, 7, 10),
                hidden(enc(465, 6, 10, 6), "crush", 2)
            ]
        }
    }),
    zone({
        id: "vientown",
        name: "Vientown",
        badgesRequired: 0,
        blurb: "The seaside town with Almia's first Ranger Base, its beach and its farm.",
        encounters: {
            walk: [
                enc(172, 4, 8, 10),
                enc(276, 4, 8, 10),
                enc(387, 4, 8, 10),
                enc(396, 4, 8, 10),
                enc(399, 4, 8, 10),
                enc(417, 4, 8, 10),
                enc(422, 4, 8, 10),
                enc(431, 4, 8, 10),
                enc(446, 4, 8, 10)
            ]
        }
    }),
    zone({
        id: "vienForest",
        name: "Vien Forest",
        badgesRequired: 0,
        blurb: "The forest between Vientown and Pueltown, burned in part by a runaway Gigaremo.",
        encounters: {
            walk: [
                enc(13, 5, 9, 10),
                enc(84, 5, 9, 10),
                enc(172, 5, 9, 10),
                enc(276, 5, 9, 10),
                enc(403, 5, 9, 10),
                enc(408, 5, 9, 10),
                enc(415, 5, 9, 10),
                enc(418, 5, 9, 10),
                enc(420, 5, 9, 10),
                enc(427, 5, 9, 10),
                enc(438, 5, 9, 10),
                enc(440, 5, 9, 10),
                enc(8, 8, 12, 6),
                enc(25, 8, 12, 6),
                enc(205, 8, 12, 6),
                enc(315, 8, 12, 6),
                enc(388, 8, 12, 6),
                enc(400, 8, 12, 6),
                enc(402, 8, 12, 6),
                enc(404, 8, 12, 6),
                enc(419, 8, 12, 6),
                enc(424, 8, 12, 6),
                enc(428, 8, 12, 6),
                enc(470, 8, 12, 6),
                enc(9, 11, 15, 3),
                enc(15, 11, 15, 3),
                enc(275, 11, 15, 3),
                hidden(enc(389, 11, 15, 3), "tackle", 4),
                enc(407, 11, 15, 3)
            ]
        }
    }),
    zone({
        id: "marineCave",
        name: "Marine Cave",
        badgesRequired: 0,
        blurb: "A sea cave by Vientown Beach, home to Nosepass and Shellos.",
        encounters: {
            walk: [
                enc(7, 6, 10, 10),
                enc(41, 6, 10, 10),
                enc(74, 6, 10, 10),
                enc(172, 6, 10, 10),
                enc(299, 6, 10, 10),
                enc(422, 6, 10, 10),
                enc(75, 9, 13, 6),
                enc(423, 9, 13, 6)
            ]
        }
    }),
    zone({
        id: "pueltown",
        name: "Pueltown",
        badgesRequired: 1,
        blurb: "Almia's port city, where Team Dim Sun's machines first make the Pokémon dizzy.",
        encounters: {
            walk: [
                enc(19, 8, 12, 10),
                enc(58, 8, 12, 10),
                enc(81, 8, 12, 10),
                enc(84, 8, 12, 10),
                enc(100, 8, 12, 10),
                enc(133, 8, 12, 10),
                enc(172, 8, 12, 10),
                enc(198, 8, 12, 10),
                enc(236, 8, 12, 10),
                enc(239, 8, 12, 10),
                enc(240, 8, 12, 10),
                enc(278, 8, 12, 10),
                enc(441, 8, 12, 10),
                enc(20, 11, 15, 6)
            ]
        }
    }),
    zone({
        id: "unionRoad",
        name: "Union Road",
        badgesRequired: 1,
        blurb: "The road up to the Ranger Union, Almia's Ranger headquarters.",
        encounters: {
            walk: [
                enc(21, 9, 13, 10),
                hidden(enc(43, 9, 13, 10), "tackle", 1),
                enc(58, 9, 13, 10),
                enc(81, 9, 13, 10),
                enc(84, 9, 13, 10),
                enc(179, 9, 13, 10),
                enc(190, 9, 13, 10),
                hidden(enc(193, 9, 13, 10), "tackle", 1),
                enc(204, 9, 13, 10),
                enc(406, 9, 13, 10),
                enc(277, 12, 16, 6),
                enc(400, 12, 16, 6),
                enc(419, 12, 16, 6)
            ]
        }
    }),
    zone({
        id: "perilCliff",
        name: "Peril Cliff",
        badgesRequired: 1,
        blurb: "Steep cliffs above Union Road, where fossil Pokémon and Shieldon turn up.",
        encounters: {
            walk: [
                enc(21, 10, 15, 10),
                enc(56, 10, 15, 10),
                enc(66, 10, 15, 10),
                enc(74, 10, 15, 10),
                enc(81, 10, 15, 10),
                enc(127, 10, 15, 10),
                enc(204, 10, 15, 10),
                enc(207, 10, 15, 10),
                enc(246, 10, 15, 10),
                enc(303, 10, 15, 10),
                enc(304, 10, 15, 10),
                enc(322, 10, 15, 10),
                enc(406, 10, 15, 10),
                enc(410, 10, 15, 10),
                enc(75, 13, 18, 6),
                enc(277, 13, 18, 6),
                enc(397, 13, 18, 6),
                enc(400, 13, 18, 6),
                enc(409, 13, 18, 6),
                enc(421, 13, 18, 6)
            ]
        }
    }),
    zone({
        id: "chromaHighway",
        name: "Chroma Highway",
        badgesRequired: 2,
        blurb: "The road through Chicole Village's farmland to the Chroma Highlands.",
        encounters: {
            walk: [
                enc(77, 13, 18, 10),
                enc(84, 13, 18, 10),
                enc(128, 13, 18, 10),
                enc(203, 13, 18, 10),
                enc(241, 13, 18, 10),
                hidden(enc(273, 13, 18, 10), "tackle", 1),
                enc(401, 13, 18, 10),
                enc(415, 13, 18, 10),
                enc(25, 16, 21, 6),
                enc(85, 16, 21, 6),
                enc(180, 16, 21, 6),
                enc(185, 16, 21, 6),
                enc(274, 16, 21, 6),
                hidden(enc(291, 16, 21, 6), "tackle", 1),
                enc(416, 16, 21, 6)
            ]
        }
    }),
    zone({
        id: "chromaHighlands",
        name: "Chroma Highlands",
        badgesRequired: 2,
        blurb: "Windswept highlands where Team Dim Sun sets two Rampardos on you and your leader.",
        encounters: {
            walk: [
                enc(63, 15, 20, 10),
                enc(227, 15, 20, 10),
                enc(390, 15, 20, 10),
                enc(455, 15, 20, 10),
                enc(25, 18, 23, 6),
                hidden(enc(44, 18, 23, 6), "tackle", 2),
                enc(78, 18, 23, 6),
                enc(411, 18, 23, 6),
                enc(15, 21, 26, 3),
                hidden(enc(45, 21, 26, 3), "tackle", 3),
                enc(398, 21, 26, 3)
            ]
        }
    }),
    zone({
        id: "cargoShip",
        name: "Cargo Ship",
        badgesRequired: 3,
        blurb: "Kincaid's ship off Pueltown, crewed by Team Dim Sun and sinking by the end of the mission.",
        encounters: {
            walk: [
                enc(96, 18, 23, 10),
                enc(100, 18, 23, 10),
                enc(167, 18, 23, 10),
                enc(228, 18, 23, 10),
                enc(280, 18, 23, 10),
                enc(296, 18, 23, 10),
                enc(67, 21, 26, 6),
                enc(125, 21, 26, 6),
                enc(126, 21, 26, 6),
                enc(391, 21, 26, 6),
                enc(400, 21, 26, 6),
                enc(404, 21, 26, 6),
                enc(432, 21, 26, 6),
                enc(463, 21, 26, 6),
                enc(462, 24, 29, 3)
            ]
        }
    }),
    zone({
        id: "puelSea",
        name: "Puel Sea",
        badgesRequired: 3,
        blurb: "The sea off Pueltown, crossed by boat to the Chroma coast.",
        encounters: {
            walk: [
                enc(120, 19, 24, 10),
                enc(170, 19, 24, 10),
                enc(211, 19, 24, 10),
                enc(222, 19, 24, 10),
                enc(456, 19, 24, 10),
                enc(458, 19, 24, 10),
                enc(226, 22, 27, 6),
                enc(319, 22, 27, 6),
                enc(457, 22, 27, 6)
            ]
        }
    }),
    zone({
        id: "hiaValley",
        name: "Hia Valley",
        badgesRequired: 4,
        blurb: "The frozen valley and the Ice Lake, with Shiver Camp below Almia Castle.",
        encounters: {
            walk: [
                enc(37, 22, 27, 10),
                enc(220, 22, 27, 10),
                hidden(enc(225, 22, 27, 10), "tackle", 1),
                enc(363, 22, 27, 10),
                enc(393, 22, 27, 10),
                enc(433, 22, 27, 10),
                enc(25, 25, 30, 6),
                enc(39, 25, 30, 6),
                enc(42, 25, 30, 6),
                enc(124, 25, 30, 6),
                enc(221, 25, 30, 6),
                enc(323, 25, 30, 6),
                enc(364, 25, 30, 6),
                enc(394, 25, 30, 6),
                enc(419, 25, 30, 6),
                hidden(enc(460, 25, 30, 6), "tackle", 3),
                enc(471, 25, 30, 6),
                enc(26, 28, 33, 3),
                enc(373, 28, 33, 3),
                enc(395, 28, 33, 3)
            ]
        }
    }),
    zone({
        id: "almiaCastle",
        name: "Almia Castle",
        badgesRequired: 4,
        blurb: "An old castle above Hia Valley, where Lucario guards the Blue Gem.",
        encounters: {
            walk: [
                enc(37, 24, 29, 10),
                enc(123, 24, 29, 10),
                enc(147, 24, 29, 10),
                enc(215, 24, 29, 10),
                enc(361, 24, 29, 10),
                enc(447, 24, 29, 10),
                enc(38, 27, 32, 6),
                enc(93, 27, 32, 6),
                enc(110, 27, 32, 6),
                enc(124, 27, 32, 6),
                enc(134, 27, 32, 6),
                enc(148, 27, 32, 6),
                enc(362, 27, 32, 6),
                enc(429, 27, 32, 6),
                enc(461, 27, 32, 6),
                enc(478, 27, 32, 6),
                enc(26, 30, 35, 3),
                enc(40, 30, 35, 3),
                enc(365, 30, 35, 3)
            ]
        }
    }),
    zone({
        id: "chromaRuins",
        name: "Chroma Ruins",
        badgesRequired: 5,
        blurb: "Ruins in the highlands where Sven hunts for the stolen Shadow Crystal and Spiritomb waits.",
        encounters: {
            walk: [
                enc(27, 27, 32, 10),
                enc(109, 27, 32, 10),
                enc(115, 27, 32, 10),
                enc(200, 27, 32, 10),
                enc(302, 27, 32, 10),
                enc(355, 27, 32, 10),
                enc(25, 30, 35, 6),
                enc(97, 30, 35, 6),
                enc(125, 30, 35, 6),
                enc(197, 30, 35, 6),
                enc(247, 30, 35, 6),
                enc(281, 30, 35, 6),
                enc(411, 30, 35, 6),
                enc(426, 30, 35, 6),
                hidden(enc(476, 30, 35, 6), "psyPower", 3)
            ]
        }
    }),
    zone({
        id: "volcanoCave",
        name: "Volcano Cave",
        badgesRequired: 5,
        blurb: "Boyleland's volcano, where Lavana and Heatran stand between you and the Red Gem.",
        encounters: {
            walk: [
                enc(4, 28, 33, 10),
                enc(81, 28, 33, 10),
                enc(111, 28, 33, 10),
                enc(218, 28, 33, 10),
                enc(278, 28, 33, 10),
                enc(324, 28, 33, 10),
                enc(353, 28, 33, 10),
                enc(371, 28, 33, 10),
                enc(425, 28, 33, 10),
                enc(434, 28, 33, 10),
                enc(439, 28, 33, 10),
                enc(443, 28, 33, 10),
                enc(459, 28, 33, 10),
                enc(5, 31, 36, 6),
                enc(25, 31, 36, 6),
                enc(75, 31, 36, 6),
                enc(89, 31, 36, 6),
                enc(112, 31, 36, 6),
                enc(126, 31, 36, 6),
                enc(136, 31, 36, 6),
                enc(219, 31, 36, 6),
                enc(279, 31, 36, 6),
                enc(297, 31, 36, 6),
                enc(305, 31, 36, 6),
                enc(372, 31, 36, 6),
                enc(423, 31, 36, 6),
                enc(426, 31, 36, 6),
                enc(6, 34, 39, 3),
                enc(26, 34, 39, 3),
                enc(306, 34, 39, 3),
                enc(392, 34, 39, 3),
                enc(467, 34, 39, 3)
            ]
        }
    }),
    zone({
        id: "seaOfWailord",
        name: "Sea of Wailord",
        badgesRequired: 6,
        blurb: "Deep water where Team Dim Sun's Marine Unit holds captured Wailord.",
        encounters: {
            walk: [
                enc(116, 31, 36, 10),
                enc(138, 31, 36, 10),
                hidden(enc(320, 31, 36, 10), "cut", 3),
                enc(73, 34, 39, 6),
                enc(117, 34, 39, 6),
                enc(121, 34, 39, 6),
                enc(139, 34, 39, 6),
                enc(171, 34, 39, 6),
                enc(226, 34, 39, 6),
                enc(319, 34, 39, 6),
                enc(367, 34, 39, 6),
                enc(368, 34, 39, 6),
                enc(230, 37, 42, 3)
            ]
        }
    }),
    zone({
        id: "oilFieldHideout",
        name: "Oil Field Hideout",
        badgesRequired: 6,
        blurb: "Team Dim Sun's offshore hideout, building Miniremo units for Kincaid.",
        encounters: {
            walk: [
                enc(228, 32, 37, 10),
                enc(82, 35, 40, 6),
                enc(93, 35, 40, 6),
                enc(122, 35, 40, 6),
                enc(229, 35, 40, 6),
                enc(356, 35, 40, 6),
                enc(404, 35, 40, 6),
                enc(414, 35, 40, 6),
                enc(430, 35, 40, 6),
                enc(435, 35, 40, 6),
                enc(68, 38, 43, 3),
                enc(254, 38, 43, 3),
                enc(405, 38, 43, 3),
                enc(466, 38, 43, 3)
            ]
        }
    }),
    zone({
        id: "harubaDesert",
        name: "Haruba Desert",
        badgesRequired: 7,
        blurb: "Sand dunes around Haruba Village and the way into the Hippowdon Temple.",
        encounters: {
            walk: [
                enc(331, 35, 40, 10),
                enc(451, 35, 40, 10),
                enc(22, 38, 43, 6),
                enc(82, 38, 43, 6),
                enc(112, 38, 43, 6),
                enc(135, 38, 43, 6),
                enc(185, 38, 43, 6),
                enc(279, 38, 43, 6),
                enc(332, 38, 43, 6),
                enc(450, 38, 43, 6)
            ]
        }
    }),
    zone({
        id: "hippowdonTemple",
        name: "Hippowdon Temple",
        badgesRequired: 7,
        blurb: "The desert temple where Cresselia protects the Yellow Gem.",
        encounters: {
            walk: [
                enc(302, 37, 42, 10),
                enc(396, 37, 42, 10),
                enc(436, 37, 42, 10),
                enc(449, 37, 42, 10),
                enc(451, 37, 42, 10),
                enc(28, 40, 45, 6),
                enc(82, 40, 45, 6),
                enc(168, 40, 45, 6),
                enc(196, 40, 45, 6),
                enc(344, 40, 45, 6),
                enc(354, 40, 45, 6),
                enc(426, 40, 45, 6),
                enc(437, 40, 45, 6),
                enc(444, 40, 45, 6),
                enc(71, 43, 48, 3),
                enc(76, 43, 48, 3),
                enc(94, 43, 48, 3),
                enc(182, 43, 48, 3),
                enc(248, 43, 48, 3),
                enc(445, 43, 48, 3),
                enc(477, 43, 48, 3)
            ]
        }
    }),
    zone({
        id: "altruTower",
        name: "Altru Tower",
        badgesRequired: 8,
        blurb: "Altru Inc.'s tower above Pueltown, home of the Incredible Machine and the Shadow Crystal.",
        encounters: {
            walk: [
                enc(123, 41, 46, 10),
                enc(359, 41, 46, 10),
                enc(57, 44, 49, 6),
                enc(59, 44, 49, 6),
                enc(82, 44, 49, 6),
                enc(97, 44, 49, 6),
                enc(101, 44, 49, 6),
                enc(112, 44, 49, 6),
                enc(125, 44, 49, 6),
                enc(134, 44, 49, 6),
                enc(168, 44, 49, 6),
                enc(212, 44, 49, 6),
                enc(444, 44, 49, 6),
                enc(65, 47, 52, 3),
                enc(76, 47, 52, 3),
                enc(94, 47, 52, 3),
                enc(169, 47, 52, 3),
                enc(181, 47, 52, 3),
                enc(257, 47, 52, 3),
                enc(282, 47, 52, 3),
                enc(475, 47, 52, 3)
            ]
        }
    }),
    zone({
        id: "altruPark",
        name: "Altru Park",
        badgesRequired: 8,
        postGame: true,
        blurb: "Almia after Operation Brighton: with the Shadow Crystal purified, new Pokémon come out across the region.",
        encounters: {
            walk: [
                enc(142, 50, 55, 10),
                enc(334, 53, 58, 6),
                enc(330, 56, 61, 3),
                enc(468, 56, 61, 3),
                enc(474, 56, 61, 3)
            ]
        }
    })
];

/**
 * Stat multipliers for Almia's mission bosses, tuned with scripts/simulateProgression.ts so a
 * first clear after Fiore takes about 10-12 hours.
 */
const ALMIA_MISSION_STRENGTHS = [2.2, 3.6, 4.3, 4.8, 4.5, 4.7, 4.8, 5.2];
const ALMIA_FINALE_STRENGTH = 4.602;
const ALMIA_DARKRAI_STRENGTH = 4.761;

function mission(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "keyItems">
): GymDefinition {
    return trial({
        keyItems: [],
        ...options,
        statMultiplier: ALMIA_MISSION_STRENGTHS[options.badgeNumber - 1]
    });
}

/** Shadows of Almia's missions, each ending with the boss capture that clears it. */
export const ALMIA_MISSIONS: GymDefinition[] = [
    mission({
        id: "rangerSchoolGraduation",
        name: "Tangrowth",
        title: "Rampaging Pokémon",
        town: "Ranger School",
        badge: "Graduation Day",
        badgeNumber: 1,
        specialty: "grass",
        team: [
            { id: 114, level: 12 },
            { id: 465, level: 14 }
        ],
        rewardText:
            "You graduate from the Ranger School and join the Vientown Ranger Base as a Ranger.",
        quote: "A Tangrowth bursts up from the school's basement in the middle of graduation!"
    }),
    mission({
        id: "dizzyPueltown",
        name: "Toxicroak",
        title: "Team Dim Sun",
        town: "Pueltown",
        badge: "The Dizzy Machines",
        badgeNumber: 2,
        specialty: "poison",
        team: [
            { id: 453, level: 17 },
            { id: 454, level: 19 }
        ],
        rewardText:
            "Pueltown's Pokémon stop reeling once the machines are smashed, and you meet Team Dim Sun.",
        quote: "So you're the Ranger breaking our machines? Toxicroak, show this kid who's boss!"
    }),
    mission({
        id: "chromaHighlandsRampardos",
        name: "Rampardos",
        title: "Team Dim Sun",
        town: "Chroma Highlands",
        badge: "Rampardos on the Highlands",
        badgeNumber: 3,
        specialty: "rock",
        team: [
            { id: 408, level: 22 },
            { id: 409, level: 23 },
            { id: 409, level: 24 }
        ],
        rewardText:
            "Both Rampardos are calm again, and you and your leader chase Team Dim Sun out of the highlands.",
        quote: "Two Rampardos, under Team Dim Sun's control, come charging down the highlands!"
    }),
    mission({
        id: "cargoShipKincaid",
        name: "Kincaid",
        title: "Team Dim Sun Vice President",
        town: "Cargo Ship",
        badge: "The Sinking Cargo Ship",
        badgeNumber: 4,
        specialty: "poison",
        team: [
            { id: 451, level: 26 },
            { id: 451, level: 26 },
            { id: 452, level: 29 }
        ],
        rewardText:
            "Kincaid, the Ranger School's teacher, is unmasked as Team Dim Sun's vice president. He sinks his ship to escape, and you get everyone off.",
        quote: "No running in the hallways... or on my ship! Drapion, deal with this Ranger."
    }),
    mission({
        id: "almiaCastleBlueGem",
        name: "Ice",
        title: "Sinis Trio",
        town: "Almia Castle",
        badge: "The Blue Gem",
        badgeNumber: 5,
        specialty: "ice",
        team: [
            { id: 215, level: 31 },
            { id: 478, level: 32 },
            { id: 448, level: 34 }
        ],
        rewardText:
            "Lucario, the Blue Gem's guardian, trusts you with the Gem once you've beaten back Ice of the Sinis Trio.",
        quote: "The Blue Gem belongs to Team Dim Sun. Froslass, freeze this Ranger where they stand."
    }),
    mission({
        id: "volcanoCaveRedGem",
        name: "Lavana",
        title: "Sinis Trio",
        town: "Volcano Cave",
        badge: "The Red Gem",
        badgeNumber: 6,
        specialty: "fire",
        team: [
            { id: 391, level: 34 },
            { id: 391, level: 34 },
            { id: 392, level: 36 },
            { id: 485, level: 38 }
        ],
        rewardText:
            "Lavana flees the heat with her makeup ruined, and Heatran gives up the Red Gem.",
        quote: "This volcano is ruining my makeup! Infernape, burn them so we can leave!"
    }),
    mission({
        id: "oilFieldKincaid",
        name: "Kincaid",
        title: "Team Dim Sun Vice President",
        town: "Oil Field Hideout",
        badge: "Infiltrate the Oil Field",
        badgeNumber: 7,
        specialty: "ground",
        team: [
            { id: 230, level: 39 },
            { id: 472, level: 42 }
        ],
        rewardText:
            "The Wailord are free, Isaac learns what Team Dim Sun really wants, and Kincaid flees the hideout in an escape pod.",
        quote: "The Miniremo don't matter any more. The Incredible Machine is nearly done!"
    }),
    mission({
        id: "hippowdonYellowGem",
        name: "Heath",
        title: "Sinis Trio",
        town: "Hippowdon Temple",
        badge: "The Yellow Gem",
        badgeNumber: 8,
        specialty: "psychic",
        team: [
            { id: 488, level: 44 },
            { id: 462, level: 47 }
        ],
        rewardText:
            "Cresselia hands over the Yellow Gem, but Heath trades Keith back for it and leaves a Magnezone behind.",
        quote: "Hand over the Yellow Gem if you want your friend back. And take this Magnezone as a thank you!"
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

/**
 * Operation Brighton: the Sinis Trio at the Ranger Union and up Altru Tower, then Blake Hall's
 * Dusknoir and the Darkrai of the Shadow Crystal at the top.
 */
export function almiaFinale(): TrainerDefinition[] {
    const trio = ALMIA_FINALE_STRENGTH;
    return [
        boss(
            "rangerUnionRaid",
            "Heath & Ice",
            "Sinis Trio",
            null,
            trio,
            [
                [466, 48],
                [445, 50]
            ],
            "While you're busy with Electivire, we'll be taking Isaac back to Altru!"
        ),
        boss(
            "sinisTrio",
            "Heath, Lavana & Ice",
            "Sinis Trio",
            null,
            trio,
            [
                [464, 50],
                [467, 50],
                [475, 51]
            ],
            "Altru Tower is ours! Rhyperior, Magmortar, Gallade: all at once!"
        ),
        boss(
            "blakeHall",
            "Blake Hall",
            "Team Dim Sun Boss",
            "dark",
            ALMIA_DARKRAI_STRENGTH,
            [
                [477, 54],
                [491, 57]
            ],
            "With the Incredible Machine at Level Dark, every Pokémon in Almia will follow the Shadow Crystal!"
        )
    ];
}

/** Almia's legends, bosses that come back for a capture, and its special missions. */
export const ALMIA_SPECIALS: SpecialEncounter[] = [
    {
        kind: "legendary",
        id: "chromaRuinsSpiritomb",
        region: "almia",
        speciesId: 442,
        level: 30,
        zoneId: "chromaRuins",
        place: "Chroma Ruins (the five Odd Keystones)",
        badgesRequired: 5,
        strength: 2.3,
        text: "Five Odd Keystones lie deep in the Chroma Ruins. Spiritomb leaps from stone to stone."
    },
    {
        kind: "legendary",
        id: "volcanoHeatran",
        region: "almia",
        speciesId: 485,
        level: 45,
        zoneId: "volcanoCave",
        place: "Volcano Cave",
        badgesRequired: 6,
        strength: 2.5,
        text: "With the Red Gem safe, Heatran stays in the depths of the Volcano Cave."
    },
    {
        kind: "legendary",
        id: "hippowdonCresselia",
        region: "almia",
        speciesId: 488,
        level: 50,
        zoneId: "hippowdonTemple",
        place: "Hippowdon Temple",
        badgesRequired: 8,
        strength: 2.6,
        text: "Cresselia returns to the Hippowdon Temple to watch over its Gem."
    },
    {
        kind: "legendary",
        id: "altruDarkrai",
        region: "almia",
        speciesId: 491,
        level: 50,
        zoneId: "altruTower",
        place: "Altru Tower (Liberate the Tower)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.8,
        text: "Team Dim Sun's remnants regroup at Altru Tower, and Darkrai comes back to help you stop them."
    },
    {
        kind: "legendary",
        id: "hiaValleyDialga",
        region: "almia",
        speciesId: 483,
        level: 60,
        zoneId: "almiaCastle",
        place: "Almia Castle (Dialga in Hia Valley?)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.8,
        text: "A rift in time opens in Almia Castle, and Dialga steps through it."
    },
    {
        kind: "legendary",
        id: "harubaPalkia",
        region: "almia",
        speciesId: 484,
        level: 60,
        zoneId: "hippowdonTemple",
        place: "Hippowdon Temple (Palkia in Haruba Desert!?)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.8,
        text: "Doors lead to the wrong places all over Almia: Palkia has torn through space into the Hippowdon Temple."
    },
    {
        kind: "legendary",
        id: "pueltownShaymin",
        region: "almia",
        speciesId: 492,
        level: 30,
        zoneId: "pueltown",
        place: "Pueltown (For the Bride & Shaymin)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "The bride's bouquet at a Pueltown wedding turns out to be Shaymin, and Team Dim Sun scares it off."
    },
    {
        kind: "legendary",
        id: "vienCelebi",
        region: "almia",
        speciesId: 251,
        level: 50,
        zoneId: "vienForest",
        place: "Vien Forest",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Celebi appears where the burned part of Vien Forest has grown back."
    },
    {
        kind: "legendary",
        id: "vienRegirock",
        region: "almia",
        speciesId: 377,
        level: 50,
        zoneId: "vienForest",
        place: "Vien Forest (a boulder that needs Crush ×5)",
        badgesRequired: 8,
        postGame: true,
        fieldNeed: { ability: "crush", power: 5 },
        strength: 2.6,
        text: "Behind a huge boulder deep in Vien Forest, Regirock waits."
    },
    {
        kind: "legendary",
        id: "almiaRegice",
        region: "almia",
        speciesId: 378,
        level: 50,
        zoneId: "almiaCastle",
        place: "Almia Castle (an iceberg that needs Burn ×5)",
        badgesRequired: 8,
        postGame: true,
        fieldNeed: { ability: "burn", power: 5 },
        strength: 2.6,
        text: "Regice sleeps inside a block of ice in Almia Castle."
    },
    {
        kind: "legendary",
        id: "chromaRegisteel",
        region: "almia",
        speciesId: 379,
        level: 50,
        zoneId: "chromaRuins",
        place: "Chroma Ruins (vines that need Cut ×5)",
        badgesRequired: 8,
        postGame: true,
        fieldNeed: { ability: "cut", power: 5 },
        strength: 2.6,
        text: "Thick vines hide a chamber in the Chroma Ruins, and Registeel inside it."
    },
    {
        kind: "legendary",
        id: "hippowdonRegigigas",
        region: "almia",
        speciesId: 486,
        level: 70,
        zoneId: "hippowdonTemple",
        place: "Hippowdon Temple's sealed chamber",
        badgesRequired: 8,
        postGame: true,
        strength: 3.0,
        text: "With Regirock, Regice and Registeel, the sealed door deep in the Hippowdon Temple opens on Regigigas."
    },
    {
        kind: "gift",
        id: "almiaManaphyEgg",
        region: "almia",
        speciesId: 490,
        level: 1,
        place: "Vientown (Recover the Manaphy Egg)",
        badgesRequired: 8,
        postGame: true,
        text: "A Happiny runs off with the Manaphy Egg it found on the beach. You get it back, and it hatches into Manaphy."
    },
    {
        kind: "gift",
        id: "kaitosRiolu",
        region: "almia",
        speciesId: 447,
        level: 30,
        place: "Oil Field Hideout (Rescue Kidnapped Riolu!)",
        badgesRequired: 8,
        postGame: true,
        text: "You rescue Kaito's Riolu from Team Dim Sun's remnants on the Oil Field, and Kaito lets it go with you."
    }
];

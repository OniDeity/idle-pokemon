/**
 * Oblivia, from Pokémon Ranger: Guardian Signs. A Capture Styler region like Fiore and Almia: the
 * trials are missions against the Pokémon Pinchers, each ending in a boss capture. Wild Pokémon
 * come from the game's Browser (Serebii's list), with its obstacles (Almia's Field Abilities)
 * and the hidden Pokémon that only a legendary beast's Roar scares out.
 *
 * Oblivia's own feature is the Ranger Signs: capturing one of its story legendaries (Raikou,
 * Entei, Suicune, Latias and Latios, Ho-Oh, the legendary birds, Lugia) earns its Sign for good,
 * and its Pokémon comes to help in every region: its types join Poké Assist, and the legendary
 * beasts' Roar brings out hidden Pokémon.
 */
import type { EncounterEntry, FieldAbility, FieldNeed } from "./data";
import { enc } from "./data";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { timeLimit, trial } from "./trainers";
import type { ZoneDefinition } from "./zones";

/** Guardian Signs' Field Abilities by species (Slash → Cut, Break → Crush, Slam → Tackle...). */
export const OBLIVIA_FIELD: Record<number, [FieldAbility, number]> = {
    1: ["cut", 1],
    2: ["cut", 2],
    3: ["cut", 4],
    4: ["burn", 1],
    5: ["burn", 2],
    6: ["crush", 4],
    9: ["soak", 3],
    16: ["cut", 1],
    17: ["cut", 2],
    18: ["cut", 3],
    25: ["recharge", 3],
    26: ["recharge", 4],
    27: ["crush", 1],
    28: ["cut", 3],
    37: ["burn", 1],
    38: ["burn", 2],
    41: ["cut", 2],
    42: ["cut", 3],
    43: ["cut", 1],
    44: ["cut", 2],
    45: ["cut", 3],
    56: ["crush", 2],
    57: ["crush", 3],
    72: ["crush", 1],
    73: ["crush", 2],
    74: ["crush", 1],
    75: ["crush", 2],
    76: ["crush", 3],
    81: ["recharge", 2],
    82: ["recharge", 4],
    85: ["tackle", 3],
    92: ["psyPower", 1],
    93: ["psyPower", 2],
    94: ["psyPower", 3],
    98: ["cut", 1],
    99: ["cut", 2],
    100: ["electrify", 1],
    101: ["electrify", 3],
    106: ["crush", 3],
    107: ["crush", 2],
    109: ["tackle", 2],
    110: ["crush", 2],
    116: ["tackle", 1],
    117: ["crush", 2],
    123: ["cut", 2],
    125: ["electrify", 2],
    126: ["burn", 2],
    133: ["tackle", 2],
    134: ["soak", 2],
    135: ["electrify", 3],
    136: ["burn", 2],
    140: ["crush", 2],
    141: ["cut", 3],
    150: ["psyPower", 1],
    152: ["cut", 1],
    153: ["cut", 3],
    154: ["cut", 1],
    155: ["burn", 1],
    156: ["burn", 2],
    157: ["tackle", 1],
    158: ["soak", 1],
    159: ["crush", 3],
    160: ["tackle", 1],
    161: ["tackle", 1],
    162: ["tackle", 3],
    163: ["cut", 1],
    164: ["psyPower", 2],
    165: ["tackle", 1],
    166: ["crush", 3],
    167: ["tackle", 1],
    168: ["tackle", 2],
    169: ["cut", 1],
    170: ["recharge", 1],
    171: ["recharge", 3],
    172: ["electrify", 1],
    173: ["tackle", 1],
    174: ["crush", 1],
    175: ["tackle", 1],
    176: ["cut", 2],
    177: ["psyPower", 1],
    178: ["psyPower", 2],
    179: ["recharge", 1],
    180: ["recharge", 2],
    181: ["recharge", 5],
    182: ["cut", 3],
    183: ["soak", 1],
    184: ["soak", 2],
    185: ["crush", 2],
    186: ["soak", 3],
    187: ["cut", 1],
    188: ["cut", 1],
    189: ["cut", 2],
    190: ["crush", 1],
    191: ["cut", 1],
    192: ["cut", 2],
    193: ["cut", 2],
    194: ["soak", 1],
    195: ["soak", 2],
    196: ["psyPower", 2],
    197: ["cut", 3],
    198: ["cut", 1],
    200: ["psyPower", 1],
    203: ["tackle", 1],
    204: ["tackle", 1],
    205: ["tackle", 3],
    206: ["crush", 1],
    207: ["cut", 2],
    209: ["tackle", 2],
    210: ["tackle", 3],
    211: ["tackle", 2],
    212: ["cut", 4],
    213: ["crush", 1],
    214: ["tackle", 3],
    215: ["cut", 2],
    216: ["crush", 1],
    217: ["tackle", 2],
    220: ["tackle", 2],
    221: ["tackle", 3],
    222: ["crush", 2],
    223: ["crush", 1],
    224: ["crush", 2],
    225: ["crush", 3],
    226: ["cut", 4],
    227: ["tackle", 3],
    228: ["tackle", 2],
    229: ["burn", 2],
    230: ["crush", 4],
    231: ["tackle", 2],
    232: ["tackle", 3],
    233: ["crush", 2],
    234: ["tackle", 2],
    235: ["tackle", 2],
    236: ["crush", 1],
    237: ["crush", 3],
    239: ["electrify", 1],
    240: ["burn", 1],
    242: ["tackle", 3],
    246: ["crush", 2],
    247: ["crush", 3],
    248: ["crush", 4],
    252: ["cut", 1],
    253: ["cut", 2],
    254: ["cut", 4],
    255: ["burn", 1],
    256: ["crush", 3],
    257: ["crush", 4],
    258: ["soak", 1],
    259: ["soak", 2],
    260: ["soak", 3],
    261: ["crush", 1],
    262: ["crush", 2],
    270: ["cut", 1],
    271: ["cut", 3],
    272: ["cut", 4],
    278: ["cut", 1],
    279: ["cut", 2],
    280: ["psyPower", 1],
    281: ["psyPower", 2],
    282: ["psyPower", 3],
    296: ["crush", 2],
    297: ["crush", 4],
    302: ["cut", 1],
    304: ["tackle", 1],
    305: ["tackle", 2],
    306: ["tackle", 4],
    309: ["electrify", 1],
    310: ["electrify", 3],
    315: ["cut", 2],
    318: ["crush", 1],
    319: ["crush", 3],
    322: ["burn", 1],
    323: ["burn", 3],
    343: ["crush", 1],
    344: ["psyPower", 2],
    347: ["cut", 2],
    348: ["cut", 4],
    355: ["psyPower", 1],
    356: ["psyPower", 2],
    359: ["cut", 4],
    363: ["crush", 2],
    364: ["crush", 3],
    365: ["crush", 4],
    366: ["cut", 1],
    367: ["crush", 3],
    368: ["cut", 2],
    369: ["crush", 2],
    370: ["cut", 1],
    371: ["tackle", 1],
    372: ["tackle", 3],
    373: ["burn", 4],
    374: ["crush", 1],
    375: ["crush", 2],
    376: ["crush", 1],
    387: ["tackle", 1],
    388: ["tackle", 3],
    389: ["tackle", 4],
    390: ["burn", 1],
    391: ["burn", 2],
    392: ["burn", 3],
    393: ["soak", 1],
    394: ["cut", 2],
    395: ["cut", 3],
    396: ["cut", 1],
    397: ["cut", 3],
    399: ["crush", 1],
    400: ["soak", 2],
    401: ["tackle", 1],
    402: ["cut", 2],
    403: ["electrify", 1],
    404: ["electrify", 2],
    405: ["electrify", 3],
    406: ["cut", 1],
    407: ["cut", 3],
    408: ["crush", 2],
    409: ["crush", 3],
    410: ["tackle", 2],
    411: ["tackle", 4],
    414: ["cut", 2],
    415: ["cut", 1],
    416: ["crush", 3],
    417: ["recharge", 1],
    418: ["soak", 2],
    419: ["soak", 3],
    420: ["cut", 1],
    421: ["cut", 2],
    422: ["soak", 2],
    423: ["soak", 3],
    424: ["crush", 3],
    425: ["tackle", 1],
    426: ["psyPower", 1],
    427: ["crush", 1],
    428: ["crush", 3],
    429: ["psyPower", 3],
    430: ["cut", 3],
    431: ["cut", 1],
    432: ["tackle", 2],
    434: ["tackle", 1],
    435: ["tackle", 2],
    436: ["psyPower", 1],
    437: ["psyPower", 2],
    438: ["tackle", 1],
    439: ["tackle", 1],
    440: ["crush", 1],
    441: ["tackle", 2],
    443: ["crush", 1],
    444: ["cut", 2],
    445: ["crush", 1],
    446: ["crush", 1],
    447: ["crush", 2],
    448: ["crush", 4],
    449: ["tackle", 3],
    450: ["crush", 4],
    451: ["crush", 2],
    452: ["crush", 4],
    453: ["crush", 1],
    454: ["crush", 4],
    455: ["cut", 2],
    456: ["cut", 1],
    457: ["cut", 2],
    458: ["cut", 1],
    459: ["crush", 2],
    460: ["crush", 3],
    461: ["cut", 4],
    462: ["electrify", 3],
    463: ["crush", 3],
    464: ["tackle", 4],
    465: ["crush", 3],
    466: ["electrify", 3],
    467: ["burn", 3],
    468: ["cut", 3],
    469: ["cut", 4],
    470: ["cut", 4],
    471: ["crush", 4],
    472: ["cut", 4],
    473: ["tackle", 4],
    474: ["crush", 3],
    475: ["cut", 4],
    476: ["tackle", 3],
    477: ["psyPower", 2],
    478: ["crush", 4],
    489: ["cut", 2]
};

/** The legendary beasts, whose Ranger Signs Roar to scare hidden Pokémon out. */
export const ROAR_SIGNS = [243, 244, 245];

/** An encounter behind an obstacle (a Field Ability, or a beast's Roar). */
function hidden(
    entry: EncounterEntry,
    ability: FieldNeed["ability"],
    power: number
): EncounterEntry {
    return { ...entry, obstacle: { ability, power } };
}

function zone(options: Omit<ZoneDefinition, "region">): ZoneDefinition {
    return { region: "oblivia", ...options };
}

export const OBLIVIA_ZONES: ZoneDefinition[] = [
    zone({
        id: "dolceIsland",
        name: "Dolce Island",
        badgesRequired: 0,
        blurb: "The quiet island where your journey starts, until the Pokémon Pinchers' ship roars overhead.",
        encounters: {
            walk: [
                enc(1, 3, 7, 10),
                enc(98, 3, 7, 10),
                enc(161, 3, 7, 10),
                enc(172, 3, 7, 10),
                enc(179, 3, 7, 10),
                enc(187, 3, 7, 10),
                enc(191, 3, 7, 10),
                enc(216, 3, 7, 10),
                enc(278, 3, 7, 10),
                enc(417, 3, 7, 10),
                enc(183, 6, 10, 6),
                enc(217, 6, 10, 6)
            ]
        }
    }),
    zone({
        id: "obliviaSky",
        name: "Oblivia Skies",
        badgesRequired: 0,
        blurb: "The open skies over Oblivia, crossed on a Staraptor (and later on Latios or Latias).",
        encounters: {
            walk: [
                enc(16, 5, 9, 10),
                enc(227, 5, 9, 10),
                enc(396, 5, 9, 10),
                enc(425, 5, 9, 10),
                enc(441, 5, 9, 10),
                enc(17, 8, 12, 6),
                enc(397, 8, 12, 6),
                enc(426, 8, 12, 6),
                enc(430, 8, 12, 6),
                enc(18, 11, 15, 3),
                enc(398, 11, 15, 3),
                enc(468, 11, 15, 3)
            ]
        }
    }),
    zone({
        id: "coconaVillage",
        name: "Cocona Village",
        badgesRequired: 0,
        blurb: "Renbow Island's seaside village, with Booker's house, Rand and Leanne's Ranger Base and the old shrine.",
        encounters: {
            walk: [enc(98, 4, 8, 10), enc(158, 4, 8, 10), enc(172, 4, 8, 10), enc(278, 4, 8, 10)]
        }
    }),
    zone({
        id: "teakwoodForest",
        name: "Teakwood Forest",
        badgesRequired: 0,
        blurb: "The forest behind Cocona Village, the way into the island's heights.",
        encounters: {
            walk: [
                enc(163, 5, 9, 10),
                enc(167, 5, 9, 10),
                enc(172, 5, 9, 10),
                enc(187, 5, 9, 10),
                enc(198, 5, 9, 10),
                enc(234, 5, 9, 10),
                enc(401, 5, 9, 10),
                enc(417, 5, 9, 10),
                enc(453, 5, 9, 10)
            ]
        }
    }),
    zone({
        id: "latolatoTrail",
        name: "Mt. Latolato",
        badgesRequired: 1,
        blurb: "Mt. Latolato and the trail around it, with a hidden flower garden to the west.",
        encounters: {
            walk: [
                enc(165, 8, 12, 10),
                enc(172, 8, 12, 10),
                enc(236, 8, 12, 10),
                enc(258, 8, 12, 10),
                enc(309, 8, 12, 10),
                hidden(enc(438, 8, 12, 10), "soak", 1),
                hidden(enc(75, 11, 15, 6), "soak", 2),
                enc(180, 11, 15, 6),
                hidden(enc(188, 11, 15, 6), "roar", 1),
                enc(202, 11, 15, 6),
                hidden(enc(421, 11, 15, 6), "roar", 1),
                enc(3, 14, 18, 3),
                enc(182, 14, 18, 3)
            ]
        }
    }),
    zone({
        id: "hinderCape",
        name: "Hinder Cape",
        badgesRequired: 1,
        blurb: "Renbow Island's windswept northern cape.",
        encounters: {
            walk: [
                enc(1, 9, 13, 10),
                hidden(enc(43, 9, 13, 10), "burn", 1),
                enc(179, 9, 13, 10),
                enc(191, 9, 13, 10),
                enc(280, 9, 13, 10),
                hidden(enc(387, 9, 13, 10), "roar", 1),
                enc(393, 9, 13, 10),
                enc(399, 9, 13, 10),
                enc(420, 9, 13, 10),
                enc(2, 12, 16, 6),
                enc(279, 12, 16, 6)
            ]
        }
    }),
    zone({
        id: "raspCavern",
        name: "Rasp Cavern",
        badgesRequired: 1,
        blurb: "A cavern of trials under Renbow Island, its rocks hiding more than rocks.",
        encounters: {
            walk: [
                enc(41, 10, 15, 10),
                hidden(enc(74, 10, 15, 10), "soak", 1),
                enc(109, 10, 15, 10),
                enc(206, 10, 15, 10),
                enc(261, 10, 15, 10),
                enc(359, 10, 15, 10),
                enc(408, 10, 15, 10),
                enc(417, 10, 15, 10),
                enc(434, 10, 15, 10),
                enc(57, 13, 18, 6),
                enc(166, 13, 18, 6),
                enc(358, 13, 18, 6),
                enc(409, 13, 18, 6),
                enc(435, 13, 18, 6),
                enc(181, 16, 21, 3)
            ]
        }
    }),
    zone({
        id: "renbowBeaches",
        name: "Renbow Beaches",
        badgesRequired: 1,
        blurb: "Curl Bay and Lapras Beach along Renbow Island's shore.",
        encounters: {
            walk: [
                enc(98, 9, 13, 10),
                enc(131, 9, 13, 10),
                enc(174, 9, 13, 10),
                enc(187, 9, 13, 10),
                enc(190, 9, 13, 10),
                enc(417, 9, 13, 10),
                enc(418, 9, 13, 10),
                enc(422, 9, 13, 10),
                enc(446, 9, 13, 10),
                enc(99, 12, 16, 6)
            ]
        }
    }),
    zone({
        id: "wirelessTower",
        name: "Wireless Tower",
        badgesRequired: 1,
        blurb: "The tower where the Pokémon Pinchers chase Raikou to the top.",
        encounters: {
            walk: [
                enc(81, 11, 16, 10),
                enc(100, 11, 16, 10),
                enc(190, 11, 16, 10),
                enc(207, 11, 16, 10),
                hidden(enc(213, 11, 16, 10), "soak", 1),
                enc(239, 11, 16, 10),
                enc(304, 11, 16, 10),
                enc(374, 11, 16, 10),
                enc(403, 11, 16, 10),
                enc(107, 14, 19, 6),
                enc(135, 14, 19, 6),
                enc(233, 14, 19, 6),
                enc(305, 14, 19, 6),
                enc(358, 14, 19, 6),
                enc(404, 14, 19, 6)
            ]
        }
    }),
    zone({
        id: "coralSea",
        name: "Coral Sea",
        badgesRequired: 2,
        blurb: "The reef off Renbow Island, explored by diving.",
        encounters: {
            walk: [
                enc(116, 13, 18, 10),
                enc(170, 13, 18, 10),
                enc(222, 13, 18, 10),
                enc(318, 13, 18, 10),
                enc(366, 13, 18, 10),
                enc(370, 13, 18, 10),
                enc(458, 13, 18, 10),
                enc(319, 16, 21, 6),
                enc(230, 19, 24, 3)
            ]
        }
    }),
    zone({
        id: "milondaRoad",
        name: "Milonda Road",
        badgesRequired: 2,
        blurb: "Mitonga Island's main road, past the Noir Forest.",
        encounters: {
            walk: [
                enc(27, 14, 19, 10),
                enc(81, 14, 19, 10),
                enc(155, 14, 19, 10),
                enc(161, 14, 19, 10),
                hidden(enc(175, 14, 19, 10), "roar", 1),
                enc(240, 14, 19, 10),
                enc(252, 14, 19, 10),
                enc(406, 14, 19, 10),
                enc(440, 14, 19, 10),
                hidden(enc(192, 17, 22, 6), "burn", 2),
                enc(356, 17, 22, 6),
                enc(414, 17, 22, 6),
                enc(476, 17, 22, 6),
                enc(189, 20, 25, 3),
                enc(477, 20, 25, 3)
            ]
        }
    }),
    zone({
        id: "oldMansion",
        name: "Old Mansion",
        badgesRequired: 2,
        blurb: "A crumbling mansion on Mitonga Island, with Blue Eye waiting in its basement.",
        encounters: {
            walk: [
                enc(37, 15, 20, 10),
                enc(81, 15, 20, 10),
                enc(92, 15, 20, 10),
                enc(133, 15, 20, 10),
                enc(152, 15, 20, 10),
                enc(194, 15, 20, 10),
                enc(200, 15, 20, 10),
                enc(216, 15, 20, 10),
                hidden(enc(270, 15, 20, 10), "electrify", 2),
                enc(355, 15, 20, 10),
                hidden(enc(406, 15, 20, 10), "burn", 1),
                enc(431, 15, 20, 10),
                enc(438, 15, 20, 10),
                enc(439, 15, 20, 10),
                enc(42, 18, 23, 6),
                enc(44, 18, 23, 6),
                enc(153, 18, 23, 6),
                enc(164, 18, 23, 6),
                enc(168, 18, 23, 6),
                enc(176, 18, 23, 6),
                enc(195, 18, 23, 6),
                enc(196, 18, 23, 6),
                enc(217, 18, 23, 6),
                enc(253, 18, 23, 6),
                enc(262, 18, 23, 6),
                enc(432, 18, 23, 6),
                enc(154, 21, 26, 3),
                enc(242, 21, 26, 3)
            ]
        }
    }),
    zone({
        id: "daybreakRuins",
        name: "Daybreak Ruins",
        badgesRequired: 3,
        blurb: "Ancient ruins where Red Eye tries to capture Entei.",
        encounters: {
            walk: [
                enc(27, 18, 23, 10),
                enc(56, 18, 23, 10),
                enc(81, 18, 23, 10),
                enc(177, 18, 23, 10),
                enc(302, 18, 23, 10),
                enc(343, 18, 23, 10),
                enc(410, 18, 23, 10),
                enc(436, 18, 23, 10),
                enc(443, 18, 23, 10),
                enc(28, 21, 26, 6),
                enc(156, 21, 26, 6),
                enc(178, 21, 26, 6),
                enc(281, 21, 26, 6),
                enc(400, 21, 26, 6),
                enc(424, 21, 26, 6)
            ]
        }
    }),
    zone({
        id: "dangerousCliff",
        name: "Dangerous Cliff",
        badgesRequired: 4,
        blurb: "The cliffside path that only a legendary beast can cross.",
        encounters: {
            walk: [
                enc(56, 21, 26, 10),
                enc(172, 21, 26, 10),
                enc(415, 21, 26, 10),
                enc(141, 24, 29, 6),
                enc(402, 24, 29, 6)
            ]
        }
    }),
    zone({
        id: "pinchersSubmarine",
        name: "Pokémon Pinchers' Submarine",
        badgesRequired: 4,
        blurb: "The Pokémon Pinchers' submarine off Mitonga Island, until it crashes.",
        encounters: {
            walk: [
                enc(165, 22, 27, 10),
                enc(193, 22, 27, 10),
                enc(207, 22, 27, 10),
                enc(215, 22, 27, 10),
                enc(296, 22, 27, 10),
                enc(390, 22, 27, 10),
                enc(415, 22, 27, 10),
                enc(443, 22, 27, 10),
                enc(25, 25, 30, 6),
                enc(28, 25, 30, 6),
                enc(162, 25, 30, 6),
                enc(356, 25, 30, 6),
                enc(409, 25, 30, 6),
                enc(414, 25, 30, 6),
                enc(429, 25, 30, 6),
                enc(160, 28, 33, 3)
            ]
        }
    }),
    zone({
        id: "falderaVolcano",
        name: "Faldera Volcano",
        badgesRequired: 4,
        blurb: "Faldera Island's active volcano and Moltres's nest.",
        encounters: {
            walk: [
                enc(4, 24, 29, 10),
                enc(172, 24, 29, 10),
                enc(231, 24, 29, 10),
                enc(246, 24, 29, 10),
                enc(252, 24, 29, 10),
                enc(255, 24, 29, 10),
                enc(296, 24, 29, 10),
                enc(322, 24, 29, 10),
                enc(390, 24, 29, 10),
                enc(5, 27, 32, 6),
                enc(25, 27, 32, 6),
                enc(57, 27, 32, 6),
                enc(110, 27, 32, 6),
                enc(136, 27, 32, 6),
                enc(232, 27, 32, 6),
                enc(247, 27, 32, 6),
                enc(256, 27, 32, 6),
                enc(259, 27, 32, 6),
                enc(323, 27, 32, 6),
                enc(358, 27, 32, 6),
                enc(372, 27, 32, 6),
                enc(391, 27, 32, 6),
                enc(423, 27, 32, 6),
                enc(76, 30, 35, 3),
                enc(248, 30, 35, 3),
                enc(257, 30, 35, 3),
                enc(467, 30, 35, 3)
            ]
        }
    }),
    zone({
        id: "sobianaRoad",
        name: "Sobiana Road",
        badgesRequired: 5,
        blurb: "Sophian Island's road from the Aqua Resort into the island.",
        encounters: {
            walk: [
                enc(193, 26, 31, 10),
                enc(204, 26, 31, 10),
                enc(209, 26, 31, 10),
                enc(235, 26, 31, 10),
                enc(455, 26, 31, 10),
                enc(159, 29, 34, 6),
                enc(183, 29, 34, 6),
                enc(185, 29, 34, 6),
                enc(205, 29, 34, 6),
                enc(210, 29, 34, 6),
                enc(315, 29, 34, 6),
                enc(416, 29, 34, 6),
                enc(26, 32, 37, 3)
            ]
        }
    }),
    zone({
        id: "canalRuins",
        name: "Canal Ruins",
        badgesRequired: 5,
        blurb: "Waterways and sunken ruins where Suicune is under attack.",
        encounters: {
            walk: [
                enc(173, 27, 32, 10),
                enc(203, 27, 32, 10),
                enc(214, 27, 32, 10),
                enc(369, 27, 32, 10),
                enc(456, 27, 32, 10),
                enc(489, 27, 32, 3),
                enc(85, 30, 35, 6),
                enc(117, 30, 35, 6),
                enc(134, 30, 35, 6),
                enc(162, 30, 35, 6),
                enc(166, 30, 35, 6),
                enc(171, 30, 35, 6),
                hidden(enc(185, 30, 35, 6), "soak", 2),
                enc(271, 30, 35, 6),
                enc(367, 30, 35, 6),
                enc(368, 30, 35, 6),
                enc(388, 30, 35, 6),
                hidden(enc(463, 30, 35, 6), "roar", 1),
                enc(26, 33, 38, 3),
                hidden(enc(45, 33, 38, 3), "burn", 3),
                enc(186, 33, 38, 3),
                enc(272, 33, 38, 3)
            ]
        }
    }),
    zone({
        id: "silverFalls",
        name: "Silver Falls",
        badgesRequired: 5,
        blurb: "A waterfall in Sophian Island's hills.",
        encounters: {
            walk: [
                enc(172, 28, 33, 10),
                enc(270, 28, 33, 10),
                enc(183, 31, 36, 6),
                enc(9, 34, 39, 3),
                enc(184, 34, 39, 3)
            ]
        }
    }),
    zone({
        id: "mtSorbet",
        name: "Mt. Sorbet",
        badgesRequired: 5,
        blurb: "Sophian Island's snowy peak and Articuno's nest.",
        encounters: {
            walk: [
                enc(215, 29, 34, 10),
                enc(225, 29, 34, 10),
                enc(238, 29, 34, 10),
                enc(363, 29, 34, 10),
                enc(371, 29, 34, 10),
                enc(427, 29, 34, 10),
                enc(459, 29, 34, 10),
                enc(38, 32, 37, 6),
                enc(237, 32, 37, 6),
                enc(358, 32, 37, 6),
                enc(364, 32, 37, 6),
                enc(391, 32, 37, 6),
                enc(394, 32, 37, 6),
                enc(428, 32, 37, 6),
                hidden(enc(460, 32, 37, 6), "burn", 3),
                enc(471, 32, 37, 6),
                enc(26, 35, 40, 3),
                enc(157, 35, 40, 3),
                enc(365, 35, 40, 3),
                enc(373, 35, 40, 3),
                enc(392, 35, 40, 3),
                enc(395, 35, 40, 3)
            ]
        }
    }),
    zone({
        id: "obliviaRuins",
        name: "Oblivia Ruins",
        badgesRequired: 6,
        blurb: "The great ruins where the Pinchers try to join the power of the three legendary birds.",
        encounters: {
            walk: [
                enc(140, 31, 36, 10),
                enc(228, 31, 36, 10),
                enc(347, 31, 36, 10),
                enc(374, 31, 36, 10),
                enc(433, 31, 36, 10),
                enc(443, 31, 36, 10),
                enc(447, 31, 36, 10),
                enc(451, 31, 36, 10),
                enc(82, 34, 39, 6),
                enc(93, 34, 39, 6),
                enc(126, 34, 39, 6),
                enc(197, 34, 39, 6),
                enc(199, 34, 39, 6),
                enc(344, 34, 39, 6),
                enc(348, 34, 39, 6),
                enc(375, 34, 39, 6),
                enc(411, 34, 39, 6),
                enc(419, 34, 39, 6),
                enc(437, 34, 39, 6),
                enc(444, 34, 39, 6),
                enc(448, 34, 39, 6),
                enc(26, 37, 42, 3),
                enc(94, 37, 42, 3),
                enc(254, 37, 42, 3),
                enc(260, 37, 42, 3),
                enc(445, 37, 42, 3)
            ]
        }
    }),
    zone({
        id: "underseaCavern",
        name: "Undersea Cavern",
        badgesRequired: 6,
        blurb: "A cavern under the Eastern Sea, home of one of the Eon beacons.",
        encounters: {
            walk: [
                enc(72, 33, 38, 10),
                enc(170, 33, 38, 10),
                enc(211, 33, 38, 10),
                enc(223, 33, 38, 10),
                enc(73, 36, 41, 6),
                enc(171, 36, 41, 6),
                enc(224, 36, 41, 6),
                enc(226, 36, 41, 6),
                enc(367, 36, 41, 6),
                enc(457, 36, 41, 6),
                enc(230, 39, 44, 3)
            ]
        }
    }),
    zone({
        id: "mtLayuda",
        name: "Mt. Layuda",
        badgesRequired: 7,
        blurb: "Layuda Island's mountain and Zapdos's nest, guarded by Pinchers with Magnezone and Metagross.",
        encounters: {
            walk: [
                enc(220, 36, 41, 10),
                enc(449, 36, 41, 10),
                enc(82, 39, 44, 6),
                enc(101, 39, 44, 6),
                enc(125, 39, 44, 6),
                enc(221, 39, 44, 6),
                enc(310, 39, 44, 6),
                enc(358, 39, 44, 6),
                enc(450, 39, 44, 6),
                enc(452, 39, 44, 6),
                enc(461, 39, 44, 6),
                enc(472, 39, 44, 6),
                enc(181, 42, 47, 3),
                enc(376, 42, 47, 3),
                enc(405, 42, 47, 3),
                enc(466, 42, 47, 3),
                enc(473, 42, 47, 3)
            ]
        }
    }),
    zone({
        id: "skyFortress",
        name: "Sky Fortress",
        badgesRequired: 8,
        blurb: "The Pokémon Pinchers' flying fortress, where Dr. Edward wakes Mewtwo.",
        encounters: {
            walk: [
                enc(81, 41, 46, 10),
                enc(82, 44, 49, 6),
                enc(106, 44, 49, 6),
                enc(126, 44, 49, 6),
                enc(229, 44, 49, 6),
                enc(297, 44, 49, 6),
                enc(358, 44, 49, 6),
                enc(429, 44, 49, 6),
                enc(444, 44, 49, 6),
                enc(454, 44, 49, 6),
                enc(461, 44, 49, 6),
                enc(465, 44, 49, 6),
                enc(470, 44, 49, 6),
                enc(472, 44, 49, 6),
                enc(478, 44, 49, 6),
                enc(181, 47, 52, 3),
                enc(282, 47, 52, 3),
                enc(306, 47, 52, 3),
                enc(407, 47, 52, 3),
                enc(462, 47, 52, 3),
                enc(464, 47, 52, 3),
                enc(466, 47, 52, 3),
                enc(467, 47, 52, 3),
                enc(474, 47, 52, 3),
                enc(475, 47, 52, 3)
            ]
        }
    })
];

/**
 * Stat multipliers for Oblivia's mission bosses, tuned with scripts/simulateProgression.ts so a
 * first clear after Almia takes about 10-12 hours.
 */
const OBLIVIA_MISSION_STRENGTHS = [2.8, 4.4, 4.8, 5.0, 5.2, 5.4, 5.6, 4.6];
const OBLIVIA_FINALE_STRENGTH = 3.22;
const OBLIVIA_MEWTWO_STRENGTH = 3.332;
/**
 * v2.12's retune: with the Fame upgrades' Mastery and Fan Club, the simulator's first clear fell
 * under 10 hours, so every trial and the finale are this much stronger (strengths above are the
 * earlier tuning). The sim is very sensitive here: ×1.05 doubled some runs.
 */
const OBLIVIA_TUNING = 1.05;

function mission(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "keyItems">
): GymDefinition {
    return trial({
        keyItems: [],
        ...options,
        statMultiplier: OBLIVIA_TUNING * OBLIVIA_MISSION_STRENGTHS[options.badgeNumber - 1]
    });
}

/** Guardian Signs' missions, each ending with the boss capture that clears it. */
export const OBLIVIA_MISSIONS: GymDefinition[] = [
    mission({
        id: "coconaShrineCelebi",
        name: "Celebi",
        title: "Rampaging Pokémon",
        town: "Cocona Village",
        badge: "The Shrine's Visitor",
        badgeNumber: 1,
        specialty: "psychic",
        team: [{ id: 251, level: 14 }],
        rewardText:
            "Celebi calms down at Cocona Village's shrine, and the Ranger Base takes you on.",
        quote: "Something is stirring at the old shrine above Cocona Village!"
    }),
    mission({
        id: "wirelessTowerRaikou",
        name: "Raikou",
        title: "Enraged Pokémon",
        town: "Wireless Tower",
        badge: "The Wireless Tower",
        badgeNumber: 2,
        specialty: "electric",
        team: [{ id: 243, level: 19 }],
        rewardText:
            "Blue Eyes flees, Raikou's fury breaks the Pinchers' grip on the tower, and Raikou gives you its Ranger Sign.",
        quote: "Raikou's out of control? Then it's all yours, Ranger. Good luck!"
    }),
    mission({
        id: "oldMansionBlueEyes",
        name: "Blue Eyes",
        title: "Pokémon Pinchers Admin",
        town: "Old Mansion",
        badge: "Amun's Book",
        badgeNumber: 3,
        specialty: "grass",
        team: [
            { id: 152, level: 22 },
            { id: 153, level: 23 },
            { id: 154, level: 25 }
        ],
        rewardText:
            "Ukulele Pichu stuns Blue Eyes, and Amun's book stays out of the Pinchers' hands.",
        quote: "That book is ours, Ranger. Meganium, push them out of my mansion!"
    }),
    mission({
        id: "daybreakRuinsEntei",
        name: "Entei",
        title: "Enraged Pokémon",
        town: "Daybreak Ruins",
        badge: "The Daybreak Trade",
        badgeNumber: 4,
        specialty: "fire",
        team: [{ id: 244, level: 29 }],
        rewardText:
            "Entei calms down and gives you its Ranger Sign, and Red Eyes trades your partner back for Blue Eyes.",
        quote: "Entei bursts out of the ruins in the middle of Red Eyes's trade!"
    }),
    mission({
        id: "pinchersSubmarine",
        name: "Blue Eyes",
        title: "Pokémon Pinchers Admin",
        town: "Pokémon Pinchers' Submarine",
        badge: "Sink the Submarine",
        badgeNumber: 5,
        specialty: "water",
        team: [
            { id: 159, level: 31 },
            { id: 160, level: 33 }
        ],
        rewardText:
            "The captured Pokémon are free. Fired by her boss, Blue Eyes crashes the submarine and escapes.",
        quote: "Keep the Pokémon locked up tight! Feraligatr, don't let them reach the hold!"
    }),
    mission({
        id: "redEyesBirds",
        name: "Red Eyes",
        title: "Pokémon Pinchers Admin",
        town: "Mt. Sorbet",
        badge: "Chasing Red Eyes",
        badgeNumber: 6,
        specialty: "fire",
        team: [
            { id: 6, level: 35 },
            { id: 157, level: 37 }
        ],
        rewardText:
            "Moltres and Articuno are awake, but Red Eyes admits defeat on Mt. Sorbet and leaves the Pinchers.",
        quote: "Moltres is awake, and Articuno's next! You can't keep up with me, Ranger!"
    }),
    mission({
        id: "obliviaRuinsPurpleEyes",
        name: "Purple Eyes",
        title: "Pokémon Pinchers Admin",
        town: "Oblivia Ruins",
        badge: "The Oblivia Ruins",
        badgeNumber: 7,
        specialty: "dragon",
        team: [
            { id: 443, level: 38 },
            { id: 445, level: 41 }
        ],
        rewardText: "Nema and Leanne are safe, but Purple Eyes has learned where Zapdos sleeps.",
        quote: "I'm the Pinchers' true leader. And the ruins have told me where Zapdos sleeps."
    }),
    mission({
        id: "mtLayudaZapdos",
        name: "Purple Eyes",
        title: "Pokémon Pinchers Admin",
        town: "Mt. Layuda",
        badge: "Zapdos's Nest",
        badgeNumber: 8,
        specialty: "steel",
        team: [
            { id: 82, level: 43 },
            { id: 82, level: 43 },
            { id: 462, level: 44 },
            { id: 405, level: 44 },
            { id: 405, level: 44 },
            { id: 376, level: 46 }
        ],
        rewardText:
            "You stop Purple Eyes at Zapdos's nest, but a stranger wakes Zapdos anyway, and the Sky Fortress rises.",
        quote: "Steelhead armor, Magnezone, Metagross: nothing stops me now!"
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
 * The Sky Fortress: the Societea's Kasa, Hocus and Arley, then Ed "the Thinker" and his
 * Mewtwo, then Purple Eyes with the Golden Armor's full power.
 */
export function obliviaFinale(): TrainerDefinition[] {
    return obliviaFinaleUntuned().map(t => ({
        ...t,
        statMultiplier: t.statMultiplier * OBLIVIA_TUNING
    }));
}

function obliviaFinaleUntuned(): TrainerDefinition[] {
    const societea = OBLIVIA_FINALE_STRENGTH;
    return [
        boss(
            "kasa",
            "Kasa",
            "Societea",
            "normal",
            societea,
            [[132, 50]],
            "Raikou? Entei? Suicune? Which one am I? Ditto, show them!"
        ),
        boss(
            "hocus",
            "Hocus",
            "Societea",
            "poison",
            societea,
            [[169, 51]],
            "Lost in my clouds? Then meet my enlarged Crobat!"
        ),
        boss(
            "arley",
            "Arley",
            "Societea",
            "normal",
            societea,
            [[486, 53]],
            "The legendary Regigigas obeys the Societea. Every step it takes shakes the fortress!"
        ),
        boss(
            "edward",
            'Ed "the Thinker"',
            "Societea Leader",
            "psychic",
            OBLIVIA_MEWTWO_STRENGTH,
            [[150, 55]],
            "The Golden Armor raised this fortress, and Mewtwo will raise me over the world!"
        ),
        boss(
            "purpleEyesArmor",
            "Purple Eyes",
            "Pokémon Pinchers Admin",
            "psychic",
            OBLIVIA_MEWTWO_STRENGTH,
            [
                [282, 54],
                [150, 58]
            ],
            "With the whole Golden Armor, Mewtwo answers to me now!"
        )
    ];
}

function legend(
    id: string,
    speciesId: number,
    level: number,
    zoneId: string,
    place: string,
    badgesRequired: number,
    strength: number,
    text: string,
    extra: { postGame?: boolean; rangerSign?: boolean } = {}
): SpecialEncounter {
    return {
        kind: "legendary",
        id,
        region: "oblivia",
        speciesId,
        level,
        zoneId,
        place,
        badgesRequired,
        strength,
        text,
        ...extra
    };
}

/** Oblivia's legends (most give a Ranger Sign) and its Wi-Fi missions. */
export const OBLIVIA_SPECIALS: SpecialEncounter[] = [
    legend(
        "coconaCelebi",
        251,
        30,
        "coconaVillage",
        "Cocona Village's shrine",
        1,
        2.2,
        "Celebi lingers by the shrine, between the present and Oblivia's past."
    ),
    legend(
        "wirelessRaikou",
        243,
        35,
        "wirelessTower",
        "Wireless Tower",
        2,
        2.3,
        "Raikou waits at the top of the Wireless Tower. Capture it for its Ranger Sign.",
        { rangerSign: true }
    ),
    legend(
        "daybreakEntei",
        244,
        38,
        "daybreakRuins",
        "Daybreak Ruins",
        4,
        2.4,
        "Entei returns to the Daybreak Ruins' monument. Capture it for its Ranger Sign.",
        { rangerSign: true }
    ),
    legend(
        "canalSuicune",
        245,
        40,
        "canalRuins",
        "Canal Ruins",
        5,
        2.5,
        "Pokémon Pinchers have Suicune cornered in the Canal Ruins. Free it and capture it for its Ranger Sign.",
        { rangerSign: true }
    ),
    legend(
        "tilikuleLatias",
        380,
        45,
        "obliviaSky",
        "The sky over Tilikule Monument (the five beacons)",
        7,
        2.6,
        "With the beacons on Dolce Island, Faldera Volcano, the Undersea Cavern, Sobiana Road and Tilikule lit, Latias flies up from the monument.",
        { rangerSign: true }
    ),
    legend(
        "tilikuleLatios",
        381,
        45,
        "obliviaSky",
        "The sky over Tilikule Monument (the five beacons)",
        7,
        2.6,
        "Latios follows Latias up from Tilikule Monument.",
        { rangerSign: true }
    ),
    legend(
        "westSeaHoOh",
        250,
        50,
        "obliviaSky",
        "The West Sea's Rainbow Dais",
        8,
        2.7,
        "The West Sea's pillar rises, and Ho-Oh lands on the Rainbow Dais. Capture it for its Ranger Sign.",
        { rangerSign: true }
    ),
    legend(
        "sorbetArticuno",
        144,
        55,
        "mtSorbet",
        "Mt. Sorbet's summit (the Golden Armor)",
        8,
        2.8,
        "Articuno flies home to Mt. Sorbet with a piece of the Golden Armor.",
        { postGame: true, rangerSign: true }
    ),
    legend(
        "layudaZapdos",
        145,
        55,
        "mtLayuda",
        "Mt. Layuda's summit (the Golden Armor)",
        8,
        2.8,
        "Zapdos flies home to Mt. Layuda with a piece of the Golden Armor.",
        { postGame: true, rangerSign: true }
    ),
    legend(
        "falderaMoltres",
        146,
        55,
        "falderaVolcano",
        "Faldera Volcano's summit (the Golden Armor)",
        8,
        2.8,
        "Moltres flies home to Faldera Volcano with a piece of the Golden Armor.",
        { postGame: true, rangerSign: true }
    ),
    legend(
        "easternSeaLugia",
        249,
        60,
        "underseaCavern",
        "The Eastern Sea (after a full Browser)",
        8,
        3.0,
        "The reformed Blue Eyes calls for help in the Undersea Cavern, and Lugia rises from the sea.",
        { postGame: true, rangerSign: true }
    ),
    legend(
        "falderaHeatran",
        485,
        50,
        "falderaVolcano",
        "Faldera Volcano (Investigate the Odd Eruption!)",
        8,
        2.7,
        "Murph asks you to find out why Faldera Volcano keeps erupting: Heatran.",
        { postGame: true }
    ),
    legend(
        "latolatoShaymin",
        492,
        30,
        "latolatoTrail",
        "Latolato Trail's flower garden (Rescue the Lost Shaymin!)",
        8,
        2.4,
        "A Shaymin runs away from Rand's house to the flower garden on Latolato Trail.",
        { postGame: true }
    ),
    legend(
        "obliviaGiratina",
        487,
        60,
        "obliviaRuins",
        "Oblivia Ruins (Find Giratina's Griseous Orb!)",
        8,
        2.9,
        "Leira takes you into the Oblivia Ruins, where Giratina is searching for its Griseous Orb.",
        { postGame: true }
    ),
    legend(
        "fortressDialga",
        483,
        65,
        "skyFortress",
        "Sky Fortress (Pledge to Arceus)",
        8,
        3.0,
        "Dialga appears in the Sky Fortress's top observation room.",
        { postGame: true }
    ),
    legend(
        "fortressPalkia",
        484,
        65,
        "skyFortress",
        "Sky Fortress (Pledge to Arceus)",
        8,
        3.0,
        "Palkia waits at the end of a cloud maze in the Sky Fortress.",
        { postGame: true }
    ),
    legend(
        "fortressArceus",
        493,
        70,
        "skyFortress",
        "Sky Fortress (Pledge to Arceus)",
        8,
        3.2,
        "With Dialga, Palkia and Giratina beside you, Arceus comes down to the Sky Fortress's observation deck.",
        { postGame: true }
    ),
    {
        kind: "gift",
        id: "coralSeaManaphyEgg",
        region: "oblivia",
        speciesId: 490,
        level: 1,
        place: "Coral Sea (Protect the Blue Sphere!)",
        badgesRequired: 8,
        postGame: true,
        text: "You chase a Pokémon Napper through the Coral Sea's currents and win back the Manaphy Egg. It hatches into Manaphy."
    }
];

/**
 * Unova two years on, from Black 2 and White 2. Wild encounters come from both games' data; the
 * Gyms, Elite Four and Champion Iris use the games' regular (not Challenge Mode) teams. Black 2
 * and White 2 bring the Hidden Grottoes, and after the League the Pokémon World Tournament,
 * where Leaders and Champions of the regions you've cleared wait.
 */
import type { EncounterEntry } from "./data";
import { GYMS } from "./trainers";
import { HOENN_GYMS } from "./hoenn";
import { JOHTO_GYMS } from "./johto";
import { SINNOH_GYMS } from "./sinnoh";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition, TrainerPokemon } from "./trainers";
import { timeLimit, trial } from "./trainers";
import { UNOVA_EXTRAS, UNOVA_GYMS } from "./unova";
import type { EntralinkTower } from "./entralink";
import { towerPool, towerSpecies } from "./entralink";
import type { RegionId, ZoneDefinition } from "./zones";

function zone(options: Omit<ZoneDefinition, "region">): ZoneDefinition {
    return { region: "unova2", ...options };
}

function bridge(zoneId: string) {
    return { walk: UNOVA_EXTRAS.phenomena[zoneId]?.flyingShadow ?? [] };
}

export const UNOVA2_ZONES: ZoneDefinition[] = [
    zone({
        id: "b2w2Route19",
        name: "Route 19",
        badgesRequired: 0,
        blurb: "A short road out of Aspertia City, where Bianca shows you how to catch Pokémon."
    }),
    zone({
        id: "b2w2Route20",
        name: "Route 20",
        badgesRequired: 1,
        blurb: "Autumn-colored trees and puddles from Floccesy Town to Virbank City."
    }),
    zone({
        id: "floccesyRanch",
        name: "Floccesy Ranch",
        badgesRequired: 1,
        blurb: "A farm where a Herdier has gone missing; its Hidden Grotto is the first you'll find."
    }),
    zone({
        id: "virbankComplex",
        name: "Virbank Complex",
        badgesRequired: 1,
        blurb: "The factories by Virbank City's port, where Team Plasma's ship first docks."
    }),
    zone({
        id: "casteliaSewers",
        name: "Castelia Sewers",
        badgesRequired: 2,
        blurb: "The tunnels under Castelia City, where you and Hugh chase Team Plasma with Burgh."
    }),
    zone({
        id: "b2w2Route4",
        name: "Route 4",
        badgesRequired: 3,
        blurb: "The road from Castelia to Nimbasa, finished at last and lined with houses."
    }),
    zone({
        id: "b2w2DesertResort",
        name: "Desert Resort",
        badgesRequired: 3,
        blurb: "The desert off Route 4, home to the Relic Castle's sinking ruins."
    }),
    zone({
        id: "b2w2RelicCastle",
        name: "Relic Castle",
        badgesRequired: 3,
        blurb: "The ancient castle in the sand, with the Relic Passage leading out of its basement."
    }),
    zone({
        id: "b2w2Route16",
        name: "Route 16",
        badgesRequired: 3,
        blurb: "East of Nimbasa City, toward the Marvelous Bridge and Lostlorn Forest."
    }),
    zone({
        id: "b2w2LostlornForest",
        name: "Lostlorn Forest",
        badgesRequired: 3,
        blurb: "A quiet forest north of Route 16, with a Hidden Grotto among its trees."
    }),
    zone({
        id: "b2w2Route5",
        name: "Route 5",
        badgesRequired: 4,
        blurb: "The road west of Nimbasa, where Bianca hands you HM02 Fly."
    }),
    zone({
        id: "b2w2DriftveilDrawbridge",
        name: "Driftveil Drawbridge",
        badgesRequired: 4,
        blurb: "The drawbridge into Driftveil City, with Ducklett's shadows overhead.",
        encounters: bridge("b2w2DriftveilDrawbridge")
    }),
    zone({
        id: "relicPassage",
        name: "Relic Passage",
        badgesRequired: 4,
        blurb: "A long tunnel from the Pokémon World Tournament to the Relic Castle and Castelia's sewers."
    }),
    zone({
        id: "b2w2Route6",
        name: "Route 6",
        badgesRequired: 5,
        blurb: "The Season Research Lab's road, where Cheren hands you HM03 Surf."
    }),
    zone({
        id: "b2w2ChargestoneCave",
        name: "Chargestone Cave",
        badgesRequired: 5,
        blurb: "Floating stones charged with electricity, on the way to Mistralton City."
    }),
    zone({
        id: "b2w2MistraltonCave",
        name: "Mistralton Cave",
        badgesRequired: 5,
        blurb: "A cave off Route 6; Cobalion's old home deep inside stands empty now."
    }),
    zone({
        id: "b2w2Route7",
        name: "Route 7",
        badgesRequired: 6,
        blurb: "Raised walkways over the grass north of Mistralton City."
    }),
    zone({
        id: "b2w2CelestialTower",
        name: "Celestial Tower",
        badgesRequired: 6,
        blurb: "The tower of graves on Route 7; Mesprit visits its summit after the League."
    }),
    zone({
        id: "reversalMountain",
        name: "Reversal Mountain",
        badgesRequired: 6,
        blurb: "A volcano east of Lentimas Town, crossed with Bianca on the way to Undella."
    }),
    zone({
        id: "strangeHouse",
        name: "Strange House",
        badgesRequired: 6,
        blurb: "A haunted house by Route 14 whose rooms rearrange themselves."
    }),
    zone({
        id: "b2w2UndellaBay",
        name: "Undella Bay",
        badgesRequired: 6,
        blurb: "Undella Town's resort bay, where Cynthia's villa stands on the shore."
    }),
    zone({
        id: "b2w2Route13",
        name: "Route 13",
        badgesRequired: 6,
        blurb: "Cliffs from Undella up to Lacunosa Town, where Cobalion now stands."
    }),
    zone({
        id: "b2w2Route14",
        name: "Route 14",
        badgesRequired: 6,
        blurb: "Mist and waterfalls from Undella Town toward the Abundant Shrine."
    }),
    zone({
        id: "b2w2AbundantShrine",
        name: "Abundant Shrine",
        badgesRequired: 6,
        blurb: "The shrine to the god of abundance; the Reveal Glass shows the Forces of Nature's true forms."
    }),
    zone({
        id: "b2w2Route12",
        name: "Route 12",
        badgesRequired: 6,
        blurb: "Countryside from Lacunosa Town, where Zinzolin challenges you to a double battle."
    }),
    zone({
        id: "b2w2VillageBridge",
        name: "Village Bridge",
        badgesRequired: 6,
        blurb: "The village on the bridge, its band still playing."
    }),
    zone({
        id: "b2w2Route11",
        name: "Route 11",
        badgesRequired: 6,
        blurb: "The road into Opelucid City, where Virizion now stands by the falls."
    }),
    zone({
        id: "b2w2Route9",
        name: "Route 9",
        badgesRequired: 7,
        blurb: "The road from Opelucid, frozen over by the Plasma Frigate's cannon."
    }),
    zone({
        id: "b2w2Route21",
        name: "Route 21",
        badgesRequired: 7,
        blurb: "The sea between Humilau City and the Seaside Cave."
    }),
    zone({
        id: "b2w2Route22",
        name: "Route 22",
        badgesRequired: 7,
        blurb: "Rocky shores past Humilau City, where Colress meets you by Terrakion."
    }),
    zone({
        id: "seasideCave",
        name: "Seaside Cave",
        badgesRequired: 7,
        blurb: "A cave along the coast, blocked by a Crustle until the Colress Machine moves it."
    }),
    zone({
        id: "b2w2GiantChasm",
        name: "Giant Chasm",
        badgesRequired: 8,
        blurb: "The crater where the Plasma Frigate lands and Ghetsis calls on Kyurem."
    }),
    zone({
        id: "b2w2Route23",
        name: "Route 23",
        badgesRequired: 8,
        blurb: "The last road to Victory Road, with Badge Check Gates along the way."
    }),
    zone({
        id: "b2w2VictoryRoad",
        name: "Victory Road",
        badgesRequired: 8,
        blurb: "A new Victory Road through N's ruined castle, below the Pokémon League."
    }),
    zone({
        id: "b2w2Route1",
        name: "Route 1",
        badgesRequired: 8,
        postGame: true,
        blurb: "The quiet road out of Nuvema Town, open to you after the League."
    }),
    zone({
        id: "b2w2Route2",
        name: "Route 2",
        badgesRequired: 8,
        postGame: true,
        blurb: "The road from Accumula Town, where Ghetsis once spoke."
    }),
    zone({
        id: "b2w2Route3",
        name: "Route 3",
        badgesRequired: 8,
        postGame: true,
        blurb: "The Day Care's road by Striaton City, with two Hidden Grottoes."
    }),
    zone({
        id: "b2w2WellspringCave",
        name: "Wellspring Cave",
        badgesRequired: 8,
        postGame: true,
        blurb: "The small cave off Route 3."
    }),
    zone({
        id: "b2w2Dreamyard",
        name: "Dreamyard",
        badgesRequired: 8,
        postGame: true,
        blurb: "The ruined lab by Striaton City, where Latios and Latias fly after the League."
    }),
    zone({
        id: "b2w2PinwheelForest",
        name: "Pinwheel Forest",
        badgesRequired: 8,
        postGame: true,
        blurb: "The forest west of Nacrene City, with two Hidden Grottoes."
    }),
    zone({
        id: "b2w2Route15",
        name: "Route 15",
        badgesRequired: 8,
        postGame: true,
        blurb: "Rocky trails and a trailer of traders, west of the Black Tower and White Treehollow."
    }),
    zone({
        id: "b2w2MarvelousBridge",
        name: "Marvelous Bridge",
        badgesRequired: 8,
        postGame: true,
        blurb: "The great bridge to Route 16, with Swanna's shadows overhead.",
        encounters: bridge("b2w2MarvelousBridge")
    }),
    zone({
        id: "b2w2Route17",
        name: "Route 17",
        badgesRequired: 8,
        postGame: true,
        blurb: "Rough sea west of Undella Bay."
    }),
    zone({
        id: "b2w2Route18",
        name: "Route 18",
        badgesRequired: 8,
        postGame: true,
        blurb: "An island by Route 17, with a Hidden Grotto up on its cliffs."
    }),
    zone({
        id: "b2w2P2Laboratory",
        name: "P2 Laboratory",
        badgesRequired: 8,
        postGame: true,
        blurb: "The old lab where the Plasma Frigate docks after the League, Colress aboard."
    }),
    zone({
        id: "b2w2TwistMountain",
        name: "Twist Mountain",
        badgesRequired: 8,
        postGame: true,
        blurb: "The mine on the way to Icirrus City; Regigigas sleeps in its depths."
    }),
    zone({
        id: "b2w2IcirrusCity",
        name: "Icirrus City",
        badgesRequired: 8,
        postGame: true,
        blurb: "The marshy city in the north, its Gym now Brycen's movie set."
    }),
    zone({
        id: "b2w2DragonspiralTower",
        name: "Dragonspiral Tower",
        badgesRequired: 8,
        postGame: true,
        blurb: "Unova's oldest tower, where N's legendary dragon returns to its stone."
    }),
    zone({
        id: "b2w2Route8",
        name: "Route 8",
        badgesRequired: 8,
        postGame: true,
        blurb: "Puddles and marsh east of Icirrus City."
    }),
    zone({
        id: "b2w2MoorOfIcirrus",
        name: "Moor of Icirrus",
        badgesRequired: 8,
        postGame: true,
        blurb: "The misty moor where the Swords of Justice once met."
    }),
    zone({
        id: "clayTunnel",
        name: "Clay Tunnel",
        badgesRequired: 8,
        postGame: true,
        blurb: "Clay's mining tunnel north of Driftveil, leading to the Underground Ruins."
    }),
    zone({
        id: "undergroundRuins",
        name: "Underground Ruins",
        badgesRequired: 8,
        postGame: true,
        blurb: "Ancient chambers deep in the Clay Tunnel, where the Regis rest."
    }),
    zone({
        id: "natureSanctuary",
        name: "Nature Sanctuary",
        badgesRequired: 8,
        postGame: true,
        blurb: "A protected garden off Undella Town, open only to the Champion."
    }),
    zone({
        id: "b2w2WhiteForest",
        name: "White Forest",
        badgesRequired: 8,
        postGame: true,
        blurb: "White Forest two years on, home to the White Treehollow. The Entralink's residents still bring Pokémon from other regions (all Lv. 5).",
        encounters: {},
        entralink: { town: "forest" }
    }),
    zone({
        id: "b2w2BlackCity",
        name: "Black City",
        badgesRequired: 8,
        postGame: true,
        blurb: "Black City two years on, home to the Black Tower. Its residents battle you, and the market's boss rewards every 25 wins.",
        trainerBattles: true,
        encounters: {},
        entralink: { town: "city", levels: [55, 60] }
    }),
    zone({
        id: "blackTower",
        name: "Black Tower",
        badgesRequired: 8,
        postGame: true,
        blurb: "Black City's skyscraper of ten areas, each with trainers and a boss: the residents' city Pokémon, fully grown.",
        trainerBattles: true,
        encounters: { walk: towerPool("blackTower", 60, 68) }
    }),
    zone({
        id: "whiteTreehollow",
        name: "White Treehollow",
        badgesRequired: 8,
        postGame: true,
        blurb: "White Forest's hollow tree of ten areas, each with trainers and a boss: the residents' forest Pokémon, fully grown.",
        trainerBattles: true,
        encounters: { walk: towerPool("whiteTreehollow", 60, 68) }
    })
];

/**
 * Hidden Grottoes (Black 2 and White 2's mechanic): one fills every GROTTO_BATTLES wild battles
 * won, wherever you are. The Pokémon inside waits to be caught, and is caught for sure.
 */
export const GROTTO_BATTLES = 80;

/**
 * What's in a Hidden Grotto here: Black 2 and White 2's grotto table where the place has one,
 * otherwise one of the place's Pokémon, a species the Pokédex is missing when there is one.
 */
export function grottoPool(
    zoneId: string,
    placeEntries: EncounterEntry[],
    missing: (id: number) => boolean
): EncounterEntry[] {
    const grotto = UNOVA_EXTRAS.grottoes[zoneId];
    if (grotto != null && grotto.length > 0) return grotto;
    const wanted = placeEntries.filter(e => missing(e.id));
    return wanted.length > 0 ? wanted : placeEntries;
}

/**
 * Stat multipliers for Black 2 and White 2's leaders, tuned with scripts/simulateProgression.ts:
 * twelve regions' Renown, and a first clear takes about 11 hours on average (7-16 by starter and
 * luck). Drayden and the League are the longest walls.
 */
const UNOVA2_GYM_STRENGTHS = [1.8, 3.0, 3.6, 4.6, 4.4, 4.5, 5.3, 5.4];
const UNOVA2_ELITE_FOUR_STRENGTH = 4.41;
const UNOVA2_CHAMPION_STRENGTH = 4.66;
/**
 * v2.12's retune: with the Fame upgrades' Mastery and Fan Club, the simulator's first clear fell
 * under 10 hours, so every trial and the finale are this much stronger (strengths above are the
 * earlier tuning). The sim is very sensitive here: ×1.05 doubled some runs.
 */
// 1.01 in v2.12.1; 1.03 since v2.14's Triple and Rotation Battles (on for this whole journey):
// five seeds averaged 7.9 h at 1.01 and 10.8 h at 1.03 (single runs 5-15 h).
const UNOVA2_TUNING = 1.03;

function unova2Gym(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "badgeIcon">,
    badgeIcon: number
): GymDefinition {
    return trial({
        ...options,
        statMultiplier: UNOVA2_TUNING * UNOVA2_GYM_STRENGTHS[options.badgeNumber - 1],
        badgeIcon: `badges/${badgeIcon}.png`
    });
}

export const UNOVA2_GYMS: GymDefinition[] = [
    unova2Gym(
        {
            id: "cheren",
            name: "Cheren",
            title: "Aspertia City Gym Leader",
            town: "Aspertia City",
            badge: "Basic Badge",
            badgeNumber: 1,
            specialty: "normal",
            team: [
                { id: 504, level: 11 },
                { id: 506, level: 13 }
            ],
            keyItems: [],
            rewardText: "Route 20, Floccesy Ranch and its Hidden Grotto lead on to Virbank City.",
            quote: "I'm Cheren! I'm a Gym Leader and a teacher at the Trainers' School. Let's see what you've learned!"
        },
        34
    ),
    unova2Gym(
        {
            id: "roxie",
            name: "Roxie",
            title: "Virbank City Gym Leader",
            town: "Virbank City",
            badge: "Toxic Badge",
            badgeNumber: 2,
            specialty: "poison",
            team: [
                { id: 109, level: 16 },
                { id: 544, level: 18 }
            ],
            keyItems: ["bicycle"],
            rewardText:
                "A boat takes you to Castelia City, where you're given a Bicycle. Its sewers are full of Team Plasma.",
            quote: "Let's rock! My poisonous Pokémon will make your head spin!"
        },
        35
    ),
    unova2Gym(
        {
            id: "burgh2",
            name: "Burgh",
            title: "Castelia City Gym Leader",
            town: "Castelia City",
            badge: "Insect Badge",
            badgeNumber: 3,
            specialty: "bug",
            team: [
                { id: 541, level: 22 },
                { id: 557, level: 22 },
                { id: 542, level: 24 }
            ],
            keyItems: [],
            rewardText: "Route 4 and the Desert Resort lead north to Nimbasa City.",
            quote: "Welcome to my silken Gym! My Bug-type Pokémon have been waiting to inspire you!"
        },
        36
    ),
    unova2Gym(
        {
            id: "elesa2",
            name: "Elesa",
            title: "Nimbasa City Gym Leader",
            town: "Nimbasa City",
            badge: "Bolt Badge",
            badgeNumber: 4,
            specialty: "electric",
            team: [
                { id: 587, level: 28 },
                { id: 180, level: 28 },
                { id: 523, level: 30 }
            ],
            keyItems: [],
            rewardText:
                "Route 5, Driftveil City and the Pokémon World Tournament open, and the Relic Passage runs beneath them.",
            quote: "Welcome to my runway. Your Pokémon had better shine as bright as mine!"
        },
        37
    ),
    unova2Gym(
        {
            id: "clay2",
            name: "Clay",
            title: "Driftveil City Gym Leader",
            town: "Driftveil City",
            badge: "Quake Badge",
            badgeNumber: 5,
            specialty: "ground",
            team: [
                { id: 552, level: 31 },
                { id: 28, level: 31 },
                { id: 530, level: 33 }
            ],
            keyItems: ["surf"],
            rewardText:
                "On Route 6, Cheren hands you HM03 Surf. Chargestone Cave leads on to Mistralton City.",
            quote: "Two years on and I'm still the best in Driftveil. Come on, show me your grit!"
        },
        38
    ),
    unova2Gym(
        {
            id: "skyla2",
            name: "Skyla",
            title: "Mistralton City Gym Leader",
            town: "Mistralton City",
            badge: "Jet Badge",
            badgeNumber: 6,
            specialty: "flying",
            team: [
                { id: 528, level: 37 },
                { id: 227, level: 37 },
                { id: 581, level: 39 }
            ],
            keyItems: [],
            rewardText:
                "Skyla flies you to Lentimas Town. Reversal Mountain, Undella Bay and Lacunosa Town lead to Opelucid.",
            quote: "I'm Skyla! Let's see you fly through my Gym's winds!"
        },
        39
    ),
    unova2Gym(
        {
            id: "drayden2",
            name: "Drayden",
            title: "Opelucid City Gym Leader",
            town: "Opelucid City",
            badge: "Legend Badge",
            badgeNumber: 7,
            specialty: "dragon",
            team: [
                { id: 621, level: 46 },
                { id: 330, level: 46 },
                { id: 612, level: 48 }
            ],
            keyItems: [],
            rewardText:
                "The Plasma Frigate freezes Opelucid. Beat Zinzolin, then head east to Humilau City.",
            quote: "Show me the strength you've built on your journey. Come at me with everything you have!"
        },
        41
    ),
    unova2Gym(
        {
            id: "marlon",
            name: "Marlon",
            title: "Humilau City Gym Leader",
            town: "Humilau City",
            badge: "Wave Badge",
            badgeNumber: 8,
            specialty: "water",
            team: [
                { id: 565, level: 49 },
                { id: 321, level: 49 },
                { id: 593, level: 51 }
            ],
            keyItems: ["superRod"],
            rewardText:
                "The Plasma Frigate waits in the Giant Chasm, and Route 23 leads to Victory Road. Cedric Juniper hands you a Super Rod.",
            quote: "You don't look strong... but you got here, so let's ride the waves together!"
        },
        42
    )
];

function leagueMember(
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

/** The Elite Four and Champion Iris, back to back (Black 2 and White 2's first round). */
export function unova2Finale(): TrainerDefinition[] {
    return unova2FinaleUntuned().map(t => ({
        ...t,
        statMultiplier: t.statMultiplier * UNOVA2_TUNING
    }));
}

function unova2FinaleUntuned(): TrainerDefinition[] {
    const e4 = UNOVA2_ELITE_FOUR_STRENGTH;
    return [
        leagueMember(
            "shauntal2",
            "Shauntal",
            "Elite Four",
            "ghost",
            e4,
            [
                [563, 56],
                [426, 56],
                [623, 56],
                [609, 58]
            ],
            "I'm writing a story about the Champion who'll beat me. Let's see if it's you!"
        ),
        leagueMember(
            "grimsley2",
            "Grimsley",
            "Elite Four",
            "dark",
            e4,
            [
                [510, 56],
                [560, 56],
                [553, 56],
                [625, 58]
            ],
            "Win or lose, you only ever get one chance. I'm Grimsley; let's roll the dice."
        ),
        leagueMember(
            "caitlin2",
            "Caitlin",
            "Elite Four",
            "psychic",
            e4,
            [
                [518, 56],
                [579, 56],
                [561, 56],
                [576, 58]
            ],
            "I've grown since I last battled here. Show me the strength of your heart."
        ),
        leagueMember(
            "marshal2",
            "Marshal",
            "Elite Four",
            "fighting",
            e4,
            [
                [538, 56],
                [539, 56],
                [620, 56],
                [534, 58]
            ],
            "Alder taught me that Pokémon battles bring us closer. Now, let us battle!"
        ),
        leagueMember(
            "iris",
            "Iris",
            "Champion",
            "dragon",
            UNOVA2_CHAMPION_STRENGTH,
            [
                [635, 57],
                [621, 57],
                [567, 57],
                [306, 57],
                [131, 57],
                [612, 59]
            ],
            "I'm Iris, the Champion of Unova! Let's have the most incredible battle ever!"
        )
    ];
}

/** Team Plasma, before the League: Colress on the Plasma Frigate, then Ghetsis with Kyurem. */
const PLASMA_COLRESS: TrainerDefinition = leagueMember(
    "colress",
    "Colress",
    "Team Plasma",
    "steel",
    3.1,
    [
        [82, 50],
        [375, 50],
        [606, 50],
        [462, 50],
        [601, 52]
    ],
    "I'm researching the strength that brings out the best in Pokémon. Will you help me find it?"
);

const PLASMA_GHETSIS: TrainerDefinition = leagueMember(
    "ghetsis2",
    "Ghetsis",
    "Team Plasma",
    "dark",
    3.2,
    [
        [563, 50],
        [537, 50],
        [604, 50],
        [452, 50],
        [454, 50],
        [635, 52]
    ],
    "With Kyurem's power, Unova will freeze, and I alone will rule it!"
);

/** A Pokémon World Tournament team: one ace from each Leader, raised to the tournament's level. */
function aces(gyms: GymDefinition[], level: number): TrainerPokemon[] {
    return gyms.slice(-6).map(gym => {
        const ace = gym.team.reduce((best, p) => (p.level >= best.level ? p : best));
        return { id: ace.id, level };
    });
}

function tournament(
    id: string,
    name: string,
    team: TrainerPokemon[],
    statMultiplier: number,
    quote: string
): TrainerDefinition {
    return {
        id,
        name,
        title: "Pokémon World Tournament",
        specialty: null,
        team,
        timeLimit: timeLimit(team.length),
        statMultiplier,
        prizeMoney: 100 * Math.max(...team.map(p => p.level)),
        quote
    };
}

const REGION_NAMES: Partial<Record<RegionId, string>> = {
    kanto: "Kanto",
    johto: "Johto",
    hoenn: "Hoenn",
    sinnoh: "Sinnoh",
    unova: "Unova (Black/White)"
};

/** The legacy cups for other regions' Leaders: [region, id, name, Leaders]. */
const PWT_LEADERS: [RegionId, string, string, GymDefinition[]][] = [
    ["kanto", "Kanto", "Kanto", GYMS],
    ["johto", "Johto", "Johto", JOHTO_GYMS],
    ["hoenn", "Hoenn", "Hoenn", HOENN_GYMS],
    ["sinnoh", "Sinnoh", "Sinnoh", SINNOH_GYMS],
    // Black and White's Leaders, as they were two years ago.
    ["unova", "BlackWhite", "Black and White", UNOVA_GYMS]
];

/** The World Tournament's Champions: Red, Lance, Steven, Wallace, Cynthia and Alder. */
const PWT_CHAMPIONS: TrainerDefinition = tournament(
    "pwtChampions",
    "Champions Tournament",
    [
        { id: 149, level: 75 },
        { id: 376, level: 75 },
        { id: 350, level: 75 },
        { id: 445, level: 75 },
        { id: 637, level: 75 },
        { id: 25, level: 77 }
    ],
    3.6,
    "Red, Lance, Steven, Wallace, Cynthia and Alder have come to Unova. Only one of you can win."
);

/** How much more Fame a journey earns once the Champions Tournament is won. */
export const CHAMPIONS_FAME_BONUS = 1.25;

/** Black 2 and White 2's gifts, trades, legendaries, Team Plasma and the World Tournament. */
export const UNOVA2_SPECIALS: SpecialEncounter[] = [
    {
        kind: "trade",
        id: "route4Petilil",
        region: "unova2",
        speciesId: 548,
        level: 20,
        place: "Route 4",
        badgesRequired: 3,
        wants: 546,
        text: "A trainer on Route 4 wants to see a Cottonee. Her Petilil, Petulia, is yours for it."
    },
    {
        kind: "trade",
        id: "route4Cottonee",
        region: "unova2",
        speciesId: 546,
        level: 20,
        place: "Route 4",
        badgesRequired: 3,
        wants: 548,
        text: "In White 2, the trainer would rather see a Petilil. Her Cottonee, Fluffee, is yours."
    },
    {
        kind: "gift",
        id: "driftveilZorua",
        region: "unova2",
        speciesId: 570,
        level: 25,
        place: "Driftveil City",
        badgesRequired: 4,
        text: "Rood, a sage of the old Team Plasma, asks you to look after the Zorua N left behind."
    },
    {
        kind: "gift",
        id: "weatherInstituteDeerling",
        region: "unova2",
        speciesId: 585,
        level: 30,
        place: "Route 6, the Season Research Lab",
        badgesRequired: 5,
        text: "A scientist at the Season Research Lab lets you take one of the Deerling they study."
    },
    {
        kind: "trade",
        id: "route7Gigalith",
        region: "unova2",
        speciesId: 526,
        level: 35,
        place: "Route 7",
        badgesRequired: 6,
        wants: 587,
        text: "The Hiker in Route 7's house wants an Emolga this time. His Gigalith is yours in return."
    },
    {
        kind: "legendary",
        id: "route13Cobalion",
        region: "unova2",
        speciesId: 638,
        level: 45,
        zoneId: "b2w2Route13",
        place: "Route 13",
        badgesRequired: 6,
        strength: 2.3,
        text: "Driven out of Mistralton Cave, Cobalion stands in the middle of Route 13."
    },
    {
        kind: "legendary",
        id: "route11Virizion",
        region: "unova2",
        speciesId: 640,
        level: 45,
        zoneId: "b2w2Route11",
        place: "Route 11",
        badgesRequired: 6,
        strength: 2.3,
        text: "Virizion stands at the western end of Route 11, however cold it gets."
    },
    {
        kind: "trade",
        id: "humilauTangrowth",
        region: "unova2",
        speciesId: 465,
        level: 45,
        place: "Humilau City",
        badgesRequired: 7,
        wants: 226,
        text: "A trainer in Humilau City wants to see a Mantine. His Tangrowth, Tangles, is yours."
    },
    {
        kind: "legendary",
        id: "route22Terrakion",
        region: "unova2",
        speciesId: 639,
        level: 45,
        zoneId: "b2w2Route22",
        place: "Route 22",
        badgesRequired: 7,
        strength: 2.4,
        text: "Terrakion waits on a hidden ledge of Route 22, where Colress gives you his machine."
    },
    {
        kind: "boss",
        id: "plasmaFrigateColress",
        region: "unova2",
        speciesId: 601,
        level: 52,
        place: "the Plasma Frigate",
        badgesRequired: 8,
        trainer: PLASMA_COLRESS,
        prizeBalls: { ultraBall: 5 },
        text: "At the helm of the Plasma Frigate, in the Giant Chasm, Colress wants to test the strength of your Pokémon."
    },
    {
        kind: "boss",
        id: "giantChasmGhetsis",
        region: "unova2",
        speciesId: 635,
        level: 52,
        place: "the Giant Chasm",
        badgesRequired: 8,
        trainer: PLASMA_GHETSIS,
        prizeBalls: { ultraBall: 10 },
        text: "Deep in the Giant Chasm, Ghetsis fuses Kyurem with N's dragon. Free them, then face Ghetsis himself."
    },
    {
        kind: "gift",
        id: "fennelEevee",
        region: "unova2",
        speciesId: 133,
        level: 10,
        place: "Castelia City, Fennel's lab",
        badgesRequired: 8,
        postGame: true,
        text: "One of Fennel's Dream World researchers gives you an Eevee with its Hidden Ability."
    },
    {
        kind: "gift",
        id: "nacreneHappiny",
        region: "unova2",
        speciesId: 440,
        level: 1,
        place: "Nacrene City gate",
        badgesRequired: 8,
        postGame: true,
        text: "A Pokémon Breeder in Nacrene City's gate gives you an Egg. It hatches into Happiny."
    },
    {
        kind: "gift",
        id: "nacreneTirtouga",
        region: "unova2",
        speciesId: 564,
        level: 25,
        place: "Nacrene Museum (Cover Fossil)",
        badgesRequired: 8,
        postGame: true,
        text: "Lenora congratulates you on the League with a Cover Fossil, revived into Tirtouga."
    },
    {
        kind: "gift",
        id: "nacreneArchen",
        region: "unova2",
        speciesId: 566,
        level: 25,
        place: "Nacrene Museum (Plume Fossil)",
        badgesRequired: 8,
        postGame: true,
        text: "...or a Plume Fossil, revived into Archen."
    },
    {
        kind: "gift",
        id: "bengaGible",
        region: "unova2",
        speciesId: 443,
        level: 1,
        shinyChance: 1,
        place: "Floccesy Town (beat Benga)",
        badgesRequired: 8,
        postGame: true,
        text: "Beat Alder's grandson Benga at the Black Tower, and he gives you a shiny Gible."
    },
    {
        kind: "gift",
        id: "bengaDratini",
        region: "unova2",
        speciesId: 147,
        level: 1,
        shinyChance: 1,
        place: "Floccesy Town (beat Benga)",
        badgesRequired: 8,
        postGame: true,
        text: "Beat Benga at the White Treehollow instead, and it's a shiny Dratini."
    },
    {
        kind: "gift",
        id: "b2w2MarvelousMagikarp",
        region: "unova2",
        speciesId: 129,
        level: 5,
        price: 500,
        place: "Marvelous Bridge",
        badgesRequired: 8,
        postGame: true,
        text: "The salesman on the Marvelous Bridge is still selling Magikarp for ₽500."
    },
    {
        kind: "trade",
        id: "b2w2Route15Rotom",
        region: "unova2",
        speciesId: 479,
        level: 60,
        place: "Route 15",
        badgesRequired: 8,
        postGame: true,
        wants: 132,
        text: "The girl in Route 15's trailer still wants a Ditto. Her Rotom, Bucky, is yours."
    },
    {
        kind: "trade",
        id: "accumulaAmbipom",
        region: "unova2",
        speciesId: 424,
        level: 40,
        place: "Accumula Town",
        badgesRequired: 8,
        postGame: true,
        wants: 530,
        text: "A woman in Accumula Town wants to see an Excadrill. Her Ambipom, Ambidexter, is yours."
    },
    {
        kind: "trade",
        id: "accumulaAlakazam",
        region: "unova2",
        speciesId: 65,
        level: 40,
        place: "Accumula Town",
        badgesRequired: 8,
        postGame: true,
        wants: 450,
        text: "Then she'd love to see a Hippowdon. Her Alakazam, Beardy, is yours in return."
    },
    {
        kind: "legendary",
        id: "dragonspiralZekrom2",
        region: "unova2",
        speciesId: 644,
        level: 70,
        zoneId: "b2w2DragonspiralTower",
        place: "Dragonspiral Tower (N's Dark Stone)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.8,
        text: "Beaten in his castle's ruins, N's Zekrom turns back into the Dark Stone. At Dragonspiral Tower, it awakens for you."
    },
    {
        kind: "legendary",
        id: "dragonspiralReshiram2",
        region: "unova2",
        speciesId: 643,
        level: 70,
        zoneId: "b2w2DragonspiralTower",
        place: "Dragonspiral Tower (N's Light Stone)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.8,
        text: "In White 2, N's dragon is Reshiram, and it's the Light Stone that awakens at Dragonspiral Tower."
    },
    {
        kind: "legendary",
        id: "giantChasmKyurem2",
        region: "unova2",
        speciesId: 646,
        level: 70,
        zoneId: "b2w2GiantChasm",
        place: "Giant Chasm, the deepest cave",
        badgesRequired: 8,
        postGame: true,
        strength: 2.8,
        text: "Its fusion undone, Kyurem waits in the Giant Chasm, leaving the DNA Splicers behind when caught."
    },
    {
        kind: "trade",
        id: "dnaSplicersBlackKyurem",
        region: "unova2",
        speciesId: 10022,
        level: 70,
        place: "Giant Chasm (DNA Splicers, with Zekrom)",
        badgesRequired: 8,
        postGame: true,
        wants: 646,
        text: "The DNA Splicers fuse Kyurem with Zekrom: Black Kyurem."
    },
    {
        kind: "trade",
        id: "dnaSplicersWhiteKyurem",
        region: "unova2",
        speciesId: 10023,
        level: 70,
        place: "Giant Chasm (DNA Splicers, with Reshiram)",
        badgesRequired: 8,
        postGame: true,
        wants: 646,
        text: "...or with Reshiram: White Kyurem."
    },
    {
        kind: "legendary",
        id: "dreamyardLatios",
        region: "unova2",
        speciesId: 381,
        level: 68,
        zoneId: "b2w2Dreamyard",
        place: "Dreamyard",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Latios ambushes you at the Dreamyard's entrance, then flies deeper inside."
    },
    {
        kind: "legendary",
        id: "dreamyardLatias",
        region: "unova2",
        speciesId: 380,
        level: 68,
        zoneId: "b2w2Dreamyard",
        place: "Dreamyard",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "In White 2, it's Latias that waits for you in the Dreamyard."
    },
    {
        kind: "legendary",
        id: "nacreneUxie",
        region: "unova2",
        speciesId: 480,
        level: 65,
        zoneId: "b2w2PinwheelForest",
        place: "Nacrene City, outside the museum",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "From the Cave of Being, the lake guardians scatter across Unova. Uxie hides outside the Nacrene Museum."
    },
    {
        kind: "legendary",
        id: "celestialMesprit",
        region: "unova2",
        speciesId: 481,
        level: 65,
        zoneId: "b2w2CelestialTower",
        place: "Celestial Tower, the summit",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "Mesprit waits by the bell at the top of the Celestial Tower."
    },
    {
        kind: "legendary",
        id: "route23Azelf",
        region: "unova2",
        speciesId: 482,
        level: 65,
        zoneId: "b2w2Route23",
        place: "Route 23",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "Azelf hides far along the west side of Route 23."
    },
    {
        kind: "legendary",
        id: "ruinsRegirock",
        region: "unova2",
        speciesId: 377,
        level: 65,
        zoneId: "undergroundRuins",
        place: "Underground Ruins",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "Solve the Underground Ruins' puzzle, and Regirock wakes in the Rocky Mountain Room."
    },
    {
        kind: "legendary",
        id: "ruinsRegice",
        region: "unova2",
        speciesId: 378,
        level: 65,
        zoneId: "undergroundRuins",
        place: "Underground Ruins (Iceberg Key)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "With the Iceberg Key, Regice takes Regirock's place in the ruins."
    },
    {
        kind: "legendary",
        id: "ruinsRegisteel",
        region: "unova2",
        speciesId: 379,
        level: 65,
        zoneId: "undergroundRuins",
        place: "Underground Ruins (Iron Key)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "With the Iron Key, it's Registeel that waits in the ruins."
    },
    {
        kind: "legendary",
        id: "twistRegigigas",
        region: "unova2",
        speciesId: 486,
        level: 68,
        zoneId: "b2w2TwistMountain",
        place: "Twist Mountain, the depths",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "Bring Regirock, Regice and Registeel to Twist Mountain's depths, and Regigigas awakens."
    },
    {
        kind: "legendary",
        id: "marvelousCresselia",
        region: "unova2",
        speciesId: 488,
        level: 68,
        zoneId: "b2w2MarvelousBridge",
        place: "Marvelous Bridge (Lunar Wing)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "A ghost in the Strange House leads you to the Lunar Wing. Take it to the Marvelous Bridge, and Cresselia appears."
    },
    {
        kind: "legendary",
        id: "reversalHeatran",
        region: "unova2",
        speciesId: 485,
        level: 68,
        zoneId: "reversalMountain",
        place: "Reversal Mountain (Magma Stone)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Take the Magma Stone from Route 18's cliffs to Reversal Mountain, and Heatran rises."
    },
    {
        kind: "legendary",
        id: "dreamRadarTornadus",
        region: "unova2",
        speciesId: 641,
        level: 40,
        zoneId: "b2w2AbundantShrine",
        place: "Pokémon Dream Radar",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "Pokémon Dream Radar's clouds hide Tornadus. Send it over to Black 2 and White 2."
    },
    {
        kind: "legendary",
        id: "dreamRadarThundurus",
        region: "unova2",
        speciesId: 642,
        level: 40,
        zoneId: "b2w2AbundantShrine",
        place: "Pokémon Dream Radar",
        badgesRequired: 8,
        postGame: true,
        strength: 2.4,
        text: "...and Thundurus, crackling in the Dream Radar's storm clouds."
    },
    {
        kind: "legendary",
        id: "dreamRadarLandorus",
        region: "unova2",
        speciesId: 645,
        level: 40,
        zoneId: "b2w2AbundantShrine",
        place: "Pokémon Dream Radar",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "With Tornadus and Thundurus caught, Landorus appears on the Dream Radar too."
    },
    {
        kind: "trade",
        id: "revealGlassTornadus",
        region: "unova2",
        speciesId: 10019,
        level: 40,
        place: "Abundant Shrine (Reveal Glass)",
        badgesRequired: 8,
        postGame: true,
        wants: 641,
        text: "The Abundant Shrine's Reveal Glass shows Tornadus's true form: its Therian Forme."
    },
    {
        kind: "trade",
        id: "revealGlassThundurus",
        region: "unova2",
        speciesId: 10020,
        level: 40,
        place: "Abundant Shrine (Reveal Glass)",
        badgesRequired: 8,
        postGame: true,
        wants: 642,
        text: "The Reveal Glass shows Thundurus's Therian Forme."
    },
    {
        kind: "trade",
        id: "revealGlassLandorus",
        region: "unova2",
        speciesId: 10021,
        level: 40,
        place: "Abundant Shrine (Reveal Glass)",
        badgesRequired: 8,
        postGame: true,
        wants: 645,
        text: "The Reveal Glass shows Landorus's Therian Forme."
    },
    {
        kind: "legendary",
        id: "moorKeldeo",
        region: "unova2",
        speciesId: 647,
        level: 50,
        zoneId: "b2w2MoorOfIcirrus",
        place: "Moor of Icirrus (event)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "The colt of the Swords of Justice, Keldeo, comes to the Moor of Icirrus to meet Cobalion, Terrakion and Virizion."
    },
    {
        kind: "trade",
        id: "pledgeGroveKeldeo",
        region: "unova2",
        speciesId: 10024,
        level: 50,
        place: "Pledge Grove (Secret Sword)",
        badgesRequired: 8,
        postGame: true,
        wants: 647,
        text: "In the Pledge Grove past the Moor of Icirrus, Keldeo learns Secret Sword and takes its Resolute Form."
    },
    {
        kind: "gift",
        id: "relicSongMeloetta",
        region: "unova2",
        speciesId: 648,
        level: 50,
        place: "Castelia City (event)",
        badgesRequired: 8,
        postGame: true,
        text: "An old man in Castelia City teaches the Relic Song, and Meloetta, the Melody Pokémon, comes to sing it."
    },
    {
        kind: "legendary",
        id: "plasmaFrigateGenesect",
        region: "unova2",
        speciesId: 649,
        level: 50,
        zoneId: "b2w2P2Laboratory",
        place: "P2 Laboratory (event)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Team Plasma's ancient Bug Pokémon, rebuilt with a cannon on its back: Genesect, in the P2 Laboratory."
    },
    ...(
        [
            [4307, "douse", "Douse Drive", "Water"],
            [4308, "shock", "Shock Drive", "Electric"],
            [4309, "burn", "Burn Drive", "Fire"],
            [4310, "chill", "Chill Drive", "Ice"]
        ] as [number, string, string, string][]
    ).map(
        ([speciesId, drive, item, type]): SpecialEncounter => ({
            kind: "trade",
            id: `genesect${drive[0].toUpperCase()}${drive.slice(1)}`,
            region: "unova2",
            speciesId,
            level: 50,
            place: `P2 Laboratory (${item})`,
            badgesRequired: 8,
            postGame: true,
            wants: 649,
            text: `Holding the ${item}, Genesect's Techno Blast turns ${type}-type.`
        })
    ),
    {
        kind: "boss",
        id: "pwtUnovaLeaders",
        region: "unova2",
        speciesId: 612,
        level: 66,
        place: "the World Tournament (Unova Leaders)",
        badgesRequired: 8,
        postGame: true,
        trainer: tournament(
            "pwtUnova",
            "Unova Leaders Tournament",
            aces(UNOVA2_GYMS, 66),
            3.2,
            "Unova's Gym Leaders, old and new, line up for the first of the World Tournament's legacy cups."
        ),
        prizeBalls: { ultraBall: 10 },
        text: "After the League, the Pokémon World Tournament's legacy cups open with Unova's Gym Leaders."
    },
    ...PWT_LEADERS.map(
        ([region, slug, name, gyms]): SpecialEncounter => ({
            kind: "boss",
            id: `pwt${slug}Leaders`,
            region: "unova2",
            speciesId: gyms[gyms.length - 1].team[gyms[gyms.length - 1].team.length - 1].id,
            level: 68,
            place: `the World Tournament (${name} Leaders)`,
            badgesRequired: 8,
            postGame: true,
            requiresCleared: [region],
            trainer: tournament(
                `pwt${slug}`,
                `${name} Leaders Tournament`,
                aces(gyms, 68),
                3.3,
                `${name}'s Gym Leaders have come to Driftveil City. They remember the Champion you were.`
            ),
            prizeBalls: { ultraBall: 10 },
            text: `${name}'s Gym Leaders come to the World Tournament, once you've cleared ${REGION_NAMES[region]}.`
        })
    ),
    {
        kind: "boss",
        id: "pwtChampions",
        region: "unova2",
        speciesId: 25,
        level: 77,
        place: "the World Tournament (Champions)",
        badgesRequired: 8,
        postGame: true,
        requiresCleared: ["kanto", "johto", "hoenn", "sinnoh", "unova"],
        trainer: PWT_CHAMPIONS,
        fameBonus: CHAMPIONS_FAME_BONUS,
        prizeBalls: { masterBall: 1 },
        text: "With Kanto, Johto, Hoenn, Sinnoh and Unova cleared, the Champions Tournament opens. Win it for ×1.25 Fame this journey and a Master Ball."
    },
    towerBoss(
        "blackTower",
        "Black Tower",
        "The tenth area's boss has climbed the whole skyscraper. Show the city what you've got!"
    ),
    towerBoss(
        "whiteTreehollow",
        "White Treehollow",
        "The tenth area's boss waits at the heart of the tree, with the forest's strongest."
    )
];

/** The Black Tower's or White Treehollow's Area 10 boss, with the six strongest of its Pokémon. */
function towerBoss(tower: EntralinkTower, place: string, quote: string): SpecialEncounter {
    const team = towerSpecies(tower)
        .slice(0, 6)
        .map(id => ({ id, level: 72 }));
    return {
        kind: "boss",
        id: `${tower}Boss`,
        region: "unova2",
        speciesId: team[0].id,
        level: 72,
        place: `the ${place} (Area 10)`,
        badgesRequired: 8,
        postGame: true,
        trainer: {
            id: `${tower}Boss`,
            name: `${place} Boss`,
            title: "Area 10",
            specialty: null,
            team,
            timeLimit: timeLimit(team.length),
            statMultiplier: 3.3,
            prizeMoney: 7200,
            quote
        },
        prizeBalls: { ultraBall: 10 },
        text: `After the League, the ${place}'s ten areas open. Its Area 10 boss fields the strongest of the residents' Pokémon.`
    };
}

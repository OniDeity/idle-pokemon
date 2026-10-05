/**
 * Sinnoh, from Diamond, Pearl and Platinum. Wild encounters come from the three games' data
 * (merged like Ruby and Sapphire); the Gyms, Elite Four and Champion Cynthia use Platinum's teams
 * and Gym order. Sinnoh's own features live here too: Honey Trees, the Poké Radar's patches,
 * Pal Park, and the Distortion World after the League.
 */
import type { EncounterEntry, EncounterPoolId } from "./data";
import { enc, ENCOUNTERS, WILD_VARIANTS } from "./data";
import sinnohExtrasJson from "data/pokemon/sinnohExtras.json";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { timeLimit, trial } from "./trainers";
import type { ZoneDefinition, ZonePools } from "./zones";

function zone(options: Omit<ZoneDefinition, "region">): ZoneDefinition {
    return { region: "sinnoh", ...options };
}

/** East of Mt. Coronet, Shellos and Gastrodon are the blue East Sea forms. */
const EAST_SEA: Record<number, number> = { 422: 4204, 423: 4205 };
function eastSea(zoneId: string): ZonePools {
    const pools: ZonePools = {};
    for (const [pool, entries] of Object.entries(ENCOUNTERS[zoneId] ?? {}) as [
        EncounterPoolId,
        EncounterEntry[]
    ][]) {
        pools[pool] = entries.map(e => ({ ...e, id: EAST_SEA[e.id] ?? e.id }));
    }
    return pools;
}

export const SINNOH_ZONES: ZoneDefinition[] = [
    zone({
        id: "route201",
        name: "Route 201",
        badgesRequired: 0,
        blurb: "Between Twinleaf Town and Sandgem, where Professor Rowan's briefcase lies in the grass."
    }),
    zone({
        id: "lakeVerity",
        name: "Lake Verity",
        badgesRequired: 0,
        blurb: "The lake of emotion by Twinleaf Town, where your journey begins."
    }),
    zone({
        id: "route202",
        name: "Route 202",
        badgesRequired: 0,
        blurb: "Your rival shows you how to catch Pokémon on the way to Jubilife City."
    }),
    zone({
        id: "route203",
        name: "Route 203",
        badgesRequired: 0,
        blurb: "Your rival challenges you on the road east of Jubilife City."
    }),
    zone({
        id: "oreburghGate",
        name: "Oreburgh Gate",
        badgesRequired: 0,
        blurb: "A cave passage into the mining city of Oreburgh."
    }),
    zone({
        id: "oreburghMine",
        name: "Oreburgh Mine",
        badgesRequired: 0,
        blurb: "The coal mine where Roark works when he isn't running the Gym."
    }),
    zone({
        id: "route204",
        name: "Route 204",
        badgesRequired: 1,
        blurb: "Grass and ponds north of Jubilife, split by the Ravaged Path."
    }),
    zone({
        id: "ravagedPath",
        name: "Ravaged Path",
        badgesRequired: 1,
        blurb: "A tunnel full of cracked rocks for Rock Smash, under Route 204."
    }),
    zone({
        id: "route207",
        name: "Route 207",
        badgesRequired: 1,
        blurb: "A rocky, muddy slope from Oreburgh City up to Mt. Coronet."
    }),
    zone({
        id: "valleyWindworks",
        name: "Valley Windworks",
        badgesRequired: 1,
        blurb: "Wind turbines by the sea, taken over by Commander Mars of Team Galactic."
    }),
    zone({
        id: "route205",
        name: "Route 205",
        badgesRequired: 1,
        blurb: "A river and bridges from Floaroma Town to the edge of Eterna Forest."
    }),
    zone({
        id: "eternaForest",
        name: "Eterna Forest",
        badgesRequired: 1,
        blurb: "A dark forest you cross with Cheryl, with the Old Chateau hidden inside."
    }),
    zone({
        id: "route211West",
        name: "Route 211 (west)",
        badgesRequired: 1,
        blurb: "A short climb from Eterna City into Mt. Coronet's western tunnel."
    }),
    zone({
        id: "oldChateau",
        name: "Old Chateau",
        badgesRequired: 2,
        blurb: "An abandoned mansion in Eterna Forest, with a strange TV and a lot of Gastly."
    }),
    zone({
        id: "route206",
        name: "Route 206",
        badgesRequired: 2,
        blurb: "Cycling Road, south of Eterna City, and the rocky trail beneath it."
    }),
    zone({
        id: "waywardCave",
        name: "Wayward Cave",
        badgesRequired: 2,
        blurb: "A maze under Cycling Road where Mira gets lost and Gible live."
    }),
    zone({
        id: "mtCoronet",
        name: "Mt. Coronet",
        badgesRequired: 2,
        blurb: "The tunnel through the mountain that splits Sinnoh in two."
    }),
    zone({
        id: "route208",
        name: "Route 208",
        badgesRequired: 2,
        blurb: "East of Mt. Coronet, with a Berry Master's house on the way to Hearthome."
    }),
    zone({
        id: "route209",
        name: "Route 209",
        badgesRequired: 3,
        blurb: "Hills toward Solaceon Town, with the Lost Tower and the Hallowed Tower."
    }),
    zone({
        id: "lostTower",
        name: "Lost Tower",
        badgesRequired: 3,
        blurb: "A tower of graves for departed Pokémon, haunted by Ghost Pokémon."
    }),
    zone({
        id: "solaceonRuins",
        name: "Solaceon Ruins",
        badgesRequired: 3,
        blurb: "Ancient ruins whose rooms are full of Unown, one letter per room.",
        encounters: {
            // The ruins have all 28 Unown; ! and ? wait in the deepest room.
            walk: Array.from({ length: 28 }, (_, i) => enc(4000 + i, 14, 30, i < 26 ? 10 : 3))
        }
    }),
    zone({
        id: "route210South",
        name: "Route 210 (south)",
        badgesRequired: 3,
        blurb: "Tall grass north of Solaceon Town, blocked further on by confused Psyduck."
    }),
    zone({
        id: "route215",
        name: "Route 215",
        badgesRequired: 3,
        blurb: "A rainy road west of Veilstone City, with a black belt training in the rain."
    }),
    zone({
        id: "route214",
        name: "Route 214",
        badgesRequired: 4,
        blurb: "A rocky road south of Veilstone, toward the Spring Path and Valor Lakefront."
    }),
    zone({
        id: "maniacTunnel",
        name: "Maniac Tunnel",
        badgesRequired: 4,
        blurb: "The Ruin Maniac keeps digging his cave deeper the more Unown you catch."
    }),
    zone({
        id: "valorLakefront",
        name: "Valor Lakefront",
        badgesRequired: 4,
        blurb: "The Hotel Grand Lake and its restaurant, on the shore of Lake Valor."
    }),
    zone({
        id: "route213",
        name: "Route 213",
        badgesRequired: 4,
        blurb: "A beach by Pastoria City, with the Hotel Grand Lake's cottages. East Sea Shellos live here.",
        encounters: eastSea("route213")
    }),
    zone({
        id: "route212",
        name: "Route 212",
        badgesRequired: 4,
        blurb: "Rainy marshes from Hearthome to Pastoria, past the Pokémon Mansion.",
        encounters: eastSea("route212")
    }),
    zone({
        id: "greatMarsh",
        name: "Great Marsh",
        badgesRequired: 4,
        blurb: "Pastoria's Safari Zone: deep mud and Pokémon from far-off lands."
    }),
    zone({
        id: "route210West",
        name: "Route 210 (west)",
        badgesRequired: 5,
        blurb: "Foggy cliffs on the way to Celestic Town, once the Psyduck move aside."
    }),
    zone({
        id: "route211East",
        name: "Route 211 (east)",
        badgesRequired: 5,
        blurb: "The mountain path between Celestic Town and Mt. Coronet."
    }),
    zone({
        id: "fuegoIronworks",
        name: "Fuego Ironworks",
        badgesRequired: 5,
        blurb: "Mr. Fuego's ironworks by the sea, reached by Surf from Floaroma."
    }),
    zone({
        id: "route218",
        name: "Route 218",
        badgesRequired: 5,
        blurb: "A short sea crossing between Canalave City and Jubilife City."
    }),
    zone({
        id: "seaRoutes219to221",
        name: "Routes 219–221",
        badgesRequired: 5,
        blurb: "The sea south of Sandgem Town, down to Route 221 and Pal Park's gate."
    }),
    zone({
        id: "ironIsland",
        name: "Iron Island",
        badgesRequired: 6,
        blurb: "A mine island off Canalave where you team up with Riley against Team Galactic."
    }),
    zone({
        id: "lakeValor",
        name: "Lake Valor",
        badgesRequired: 6,
        blurb: "Drained by Team Galactic's bomb, as they take Azelf from its cavern."
    }),
    zone({
        id: "route216",
        name: "Route 216",
        badgesRequired: 6,
        blurb: "Deep snow north of Mt. Coronet, where you can barely walk."
    }),
    zone({
        id: "route217",
        name: "Route 217",
        badgesRequired: 6,
        blurb: "A blizzard on the way to Snowpoint City."
    }),
    zone({
        id: "acuityLakefront",
        name: "Acuity Lakefront",
        badgesRequired: 6,
        blurb: "Snowy woods between Snowpoint City and Lake Acuity."
    }),
    zone({
        id: "lakeAcuity",
        name: "Lake Acuity",
        badgesRequired: 6,
        blurb: "The lake of knowledge, where your rival fails to stop Team Galactic."
    }),
    zone({
        id: "mtCoronetPeak",
        name: "Mt. Coronet (summit)",
        badgesRequired: 7,
        blurb: "The climb to the Spear Pillar, where Cyrus calls Dialga and Palkia."
    }),
    zone({
        id: "route222",
        name: "Route 222",
        badgesRequired: 7,
        blurb: "A beach on the way to Sunyshore City, popular with fishermen.",
        encounters: eastSea("route222")
    }),
    zone({
        id: "route223",
        name: "Route 223",
        badgesRequired: 7,
        blurb: "The sea north of Sunyshore, with waterfalls up to the Pokémon League."
    }),
    zone({
        id: "sinnohVictoryRoad",
        name: "Victory Road",
        badgesRequired: 8,
        blurb: "The last cave before the Pokémon League, needing every HM you have."
    }),
    zone({
        id: "trophyGarden",
        name: "Trophy Garden",
        badgesRequired: 8,
        postGame: true,
        blurb: "Mr. Backlot's garden behind the Pokémon Mansion, where rare Pokémon visit."
    }),
    zone({
        id: "victoryRoadBack",
        name: "Victory Road (back)",
        badgesRequired: 8,
        postGame: true,
        blurb: "Victory Road's back rooms, open once you have the National Pokédex."
    }),
    zone({
        id: "route224",
        name: "Route 224",
        badgesRequired: 8,
        postGame: true,
        blurb: "Past the Pokémon League, by the Seabreak Path and a strange white rock.",
        encounters: eastSea("route224")
    }),
    zone({
        id: "route225",
        name: "Route 225",
        badgesRequired: 8,
        postGame: true,
        blurb: "A rugged path north of the Fight Area, in the Battle Zone."
    }),
    zone({
        id: "route226",
        name: "Route 226",
        badgesRequired: 8,
        postGame: true,
        blurb: "Sea and cliffs west of the Survival Area, where a man studies other languages."
    }),
    zone({
        id: "route227",
        name: "Route 227",
        badgesRequired: 8,
        postGame: true,
        blurb: "Volcanic ash falls on the way to Stark Mountain."
    }),
    zone({
        id: "starkMountain",
        name: "Stark Mountain",
        badgesRequired: 8,
        postGame: true,
        blurb: "A volcano where Charon of Team Galactic hunts for Heatran."
    }),
    zone({
        id: "route228",
        name: "Route 228",
        badgesRequired: 8,
        postGame: true,
        blurb: "A sandstorm-swept desert east of the Survival Area."
    }),
    zone({
        id: "route229",
        name: "Route 229",
        badgesRequired: 8,
        postGame: true,
        blurb: "Thick woods by the Resort Area's villa."
    }),
    zone({
        id: "route230",
        name: "Route 230",
        badgesRequired: 8,
        postGame: true,
        blurb: "A sea route from the Fight Area back to Route 221.",
        encounters: eastSea("route230")
    }),
    zone({
        id: "snowpointTemple",
        name: "Snowpoint Temple",
        badgesRequired: 8,
        postGame: true,
        blurb: "An icy temple under Snowpoint City, where Regigigas sleeps."
    }),
    zone({
        id: "turnbackCave",
        name: "Turnback Cave",
        badgesRequired: 8,
        postGame: true,
        blurb: "A maze of rooms past the Spring Path; the Distortion World lies beyond its last pillar."
    }),
    zone({
        id: "sendoffSpring",
        name: "Sendoff Spring",
        badgesRequired: 8,
        postGame: true,
        blurb: "A peaceful spring at the foot of Mt. Coronet, in front of Turnback Cave."
    }),
    zone({
        id: "palPark",
        name: "Pal Park",
        badgesRequired: 8,
        postGame: true,
        palPark: true,
        blurb: "Pokémon from the regions you've cleared since becoming Sinnoh's Champion migrate here.",
        encounters: {}
    })
];

/**
 * Stat multipliers for Sinnoh's leaders, tuned with scripts/simulateProgression.ts: after
 * Orre (XD), Sinnoh's trainers carry seven regions' Renown, and a first clear takes about 11
 * hours with any starter. Candice and Volkner are the longest walls.
 */
const SINNOH_GYM_STRENGTHS = [1.52, 2.74, 3.27, 4.0, 3.0, 4.0, 3.3, 3.1];
const SINNOH_ELITE_FOUR_STRENGTH = 2.7;
const SINNOH_CHAMPION_STRENGTH = 2.86;

function sinnohGym(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "badgeIcon">
): GymDefinition {
    return trial({
        ...options,
        statMultiplier: SINNOH_GYM_STRENGTHS[options.badgeNumber - 1],
        // PokeAPI numbers Sinnoh's badges 25-32, after Kanto's, Johto's and Hoenn's.
        badgeIcon: `badges/${options.badgeNumber + 24}.png`
    });
}

export const SINNOH_GYMS: GymDefinition[] = [
    sinnohGym({
        id: "roark",
        name: "Roark",
        title: "Oreburgh City Gym Leader",
        town: "Oreburgh City",
        badge: "Coal Badge",
        badgeNumber: 1,
        specialty: "rock",
        team: [
            { id: 74, level: 12 },
            { id: 95, level: 12 },
            { id: 408, level: 14 }
        ],
        keyItems: ["rockSmash", "oldRod"],
        rewardText:
            "Rock Smash clears the Ravaged Path, a fisherman in Jubilife gives you the Old Rod, and the roads to Floaroma and Eterna open.",
        quote: "I'm Roark! The Oreburgh Pokémon Gym Leader! I'll show you how strong Rock-type Pokémon are!"
    }),
    sinnohGym({
        id: "gardenia",
        name: "Gardenia",
        title: "Eterna City Gym Leader",
        town: "Eterna City",
        badge: "Forest Badge",
        badgeNumber: 2,
        specialty: "grass",
        team: [
            { id: 387, level: 20 },
            { id: 421, level: 20 },
            { id: 407, level: 22 }
        ],
        keyItems: ["bicycle"],
        rewardText:
            "After you drive Team Galactic out of Eterna, Rad Rickshaw gives you a Bicycle. Cycling Road and Mt. Coronet open.",
        quote: "I'm Gardenia, the Eterna Gym Leader! I love Grass-type Pokémon to bits!"
    }),
    sinnohGym({
        id: "fantina",
        name: "Fantina",
        title: "Hearthome City Gym Leader",
        town: "Hearthome City",
        badge: "Relic Badge",
        badgeNumber: 3,
        specialty: "ghost",
        team: [
            { id: 355, level: 24 },
            { id: 93, level: 24 },
            { id: 429, level: 26 }
        ],
        keyItems: ["goodRod"],
        rewardText:
            "A fisherman on Route 209 gives you the Good Rod. Solaceon Town and Veilstone City lie ahead.",
        quote: "You are going to fight with me? Hm, hm, hm. I am Fantina, the Gym Leader!"
    }),
    sinnohGym({
        id: "maylene",
        name: "Maylene",
        title: "Veilstone City Gym Leader",
        town: "Veilstone City",
        badge: "Cobble Badge",
        badgeNumber: 4,
        specialty: "fighting",
        team: [
            { id: 307, level: 28 },
            { id: 67, level: 29 },
            { id: 448, level: 32 }
        ],
        keyItems: [],
        rewardText: "Pastoria City, Route 212 and the Great Marsh open up to the south.",
        quote: "I'm Maylene. I'm the Veilstone Gym Leader. I'll fight barefoot, if you don't mind."
    }),
    sinnohGym({
        id: "crasherWake",
        name: "Crasher Wake",
        title: "Pastoria City Gym Leader",
        town: "Pastoria City",
        badge: "Fen Badge",
        badgeNumber: 5,
        specialty: "water",
        team: [
            { id: 130, level: 33 },
            { id: 195, level: 34 },
            { id: 419, level: 37 }
        ],
        keyItems: ["surf"],
        rewardText:
            "Cynthia's SecretPotion clears the Psyduck from Route 210, and in Celestic Town her grandmother gives you HM03 Surf.",
        quote: "Hahahaha! Everybody wants to fight the masked Crasher Wake! Wahahahaha!"
    }),
    sinnohGym({
        id: "byron",
        name: "Byron",
        title: "Canalave City Gym Leader",
        town: "Canalave City",
        badge: "Mine Badge",
        badgeNumber: 6,
        specialty: "steel",
        team: [
            { id: 82, level: 37 },
            { id: 208, level: 38 },
            { id: 411, level: 41 }
        ],
        keyItems: [],
        rewardText:
            "Riley waits on Iron Island, and the three lakes call: Valor, Acuity and Verity.",
        quote: "Welcome! I am Byron, the Canalave Gym Leader! Roark is my son!"
    }),
    sinnohGym({
        id: "candice",
        name: "Candice",
        title: "Snowpoint City Gym Leader",
        town: "Snowpoint City",
        badge: "Icicle Badge",
        badgeNumber: 7,
        specialty: "ice",
        team: [
            { id: 215, level: 40 },
            { id: 221, level: 40 },
            { id: 460, level: 42 },
            { id: 478, level: 44 }
        ],
        keyItems: [],
        rewardText:
            "You stop Cyrus at the Spear Pillar. The way to Sunyshore City opens, and the lake guardians return.",
        quote: "I'm Candice! Snowpoint's Gym Leader! Diamond dust! I'm totally focused!"
    }),
    sinnohGym({
        id: "volkner",
        name: "Volkner",
        title: "Sunyshore City Gym Leader",
        town: "Sunyshore City",
        badge: "Beacon Badge",
        badgeNumber: 8,
        specialty: "electric",
        team: [
            { id: 135, level: 46 },
            { id: 26, level: 46 },
            { id: 405, level: 48 },
            { id: 466, level: 50 }
        ],
        keyItems: ["superRod"],
        rewardText:
            "Waterfall carries you up to Victory Road, and a fisherman by the lighthouse gives you the Super Rod.",
        quote: "Since I became Gym Leader, I haven't had one battle that made me burn hot."
    })
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

/** The Sinnoh Elite Four and Champion Cynthia (Platinum's teams), back to back. */
export function sinnohFinale(): TrainerDefinition[] {
    const e4 = SINNOH_ELITE_FOUR_STRENGTH;
    return [
        leagueMember(
            "aaron",
            "Aaron",
            "Elite Four",
            "bug",
            e4,
            [
                [469, 49],
                [212, 49],
                [416, 50],
                [214, 51],
                [452, 53]
            ],
            "I'm Aaron of the Elite Four. I love Bug Pokémon. Bug Pokémon are cool and tough!"
        ),
        leagueMember(
            "bertha",
            "Bertha",
            "Elite Four",
            "ground",
            e4,
            [
                [340, 50],
                [472, 53],
                [76, 52],
                [464, 55],
                [450, 52]
            ],
            "Well, would you look at what we have here? I'm Bertha of the Elite Four."
        ),
        leagueMember(
            "flint",
            "Flint",
            "Elite Four",
            "fire",
            e4,
            [
                [229, 52],
                [136, 55],
                [78, 53],
                [392, 55],
                [467, 57]
            ],
            "Hey! I'm Flint! I'm one of the Elite Four. I'll set you ablaze!"
        ),
        leagueMember(
            "lucian",
            "Lucian",
            "Elite Four",
            "psychic",
            e4,
            [
                [122, 53],
                [196, 55],
                [437, 54],
                [65, 56],
                [475, 59]
            ],
            "Hello. I'm Lucian of the Elite Four. Let me finish this chapter first."
        ),
        leagueMember(
            "cynthia",
            "Cynthia",
            "Champion",
            null,
            SINNOH_CHAMPION_STRENGTH,
            [
                [442, 58],
                [407, 58],
                [468, 60],
                [448, 60],
                [350, 58],
                [445, 62]
            ],
            "I'm Cynthia, the Champion of the Sinnoh region. I accept your challenge!"
        )
    ];
}

/**
 * The Distortion World, after the League: Cyrus, who followed Giratina into its world, waits at
 * the bottom of it. Beating him there is worth extra Fame for the journey, and the Griseous Orb
 * lets Giratina keep its Origin Forme.
 */
export const DISTORTION_CYRUS: TrainerDefinition = {
    id: "distortionCyrus",
    name: "Cyrus",
    title: "Team Galactic Boss",
    specialty: "dark",
    team: [
        { id: 229, level: 64 },
        { id: 169, level: 65 },
        { id: 130, level: 65 },
        { id: 430, level: 66 },
        { id: 461, level: 68 }
    ],
    timeLimit: timeLimit(5),
    statMultiplier: 3.6,
    prizeMoney: 6800,
    quote: "The world is incomplete... In this world, I will make the spirit-free world I desire!"
};

/** How much more Fame a journey earns once Cyrus is beaten in the Distortion World. */
export const DISTORTION_FAME_BONUS = 1.25;

/** Sinnoh's gifts, trades, legendaries and the Distortion World (Diamond, Pearl, Platinum). */
export const SINNOH_SPECIALS: SpecialEncounter[] = [
    {
        kind: "trade",
        id: "oreburghAbra",
        region: "sinnoh",
        speciesId: 63,
        level: 7,
        place: "Oreburgh City",
        badgesRequired: 0,
        wants: 66,
        text: "A girl in Oreburgh would love to see a Machop. Her Abra, Kenya, is yours for it."
    },
    {
        kind: "legendary",
        id: "windworksDrifloon",
        region: "sinnoh",
        speciesId: 425,
        level: 15,
        zoneId: "valleyWindworks",
        place: "Valley Windworks",
        badgesRequired: 1,
        strength: 1.4,
        text: "Once Team Galactic leaves the Valley Windworks, a Drifloon floats by the door on Fridays."
    },
    {
        kind: "gift",
        id: "cynthiaTogepi",
        region: "sinnoh",
        speciesId: 175,
        level: 5,
        place: "Eterna City",
        badgesRequired: 2,
        text: "For your help against Team Galactic in Eterna, Cynthia gives you an Egg. It hatches into a Togepi."
    },
    {
        kind: "trade",
        id: "eternaChatot",
        region: "sinnoh",
        speciesId: 441,
        level: 20,
        place: "Eterna City condominiums",
        badgesRequired: 2,
        wants: 418,
        text: "A man in Eterna's condominiums wants to see a Buizel. His Chatot, Charap, is yours in return."
    },
    {
        kind: "gift",
        id: "hearthomeHappiny",
        region: "sinnoh",
        speciesId: 440,
        level: 5,
        place: "Hearthome City, west gate",
        badgesRequired: 2,
        text: "A hiker in Hearthome's west gate gives you an Egg he can't take care of. It hatches into a Happiny."
    },
    {
        kind: "gift",
        id: "bebeEevee",
        region: "sinnoh",
        speciesId: 133,
        level: 20,
        place: "Bebe's house, Hearthome City",
        badgesRequired: 2,
        text: "Bebe, who runs the PC storage system, thanks you for using it with an Eevee."
    },
    {
        kind: "legendary",
        id: "chateauRotom",
        region: "sinnoh",
        speciesId: 479,
        level: 20,
        zoneId: "oldChateau",
        place: "Old Chateau, the TV room",
        badgesRequired: 2,
        strength: 1.6,
        text: "At night, the old TV in the Old Chateau flickers on. A Rotom lives inside."
    },
    {
        kind: "legendary",
        id: "hallowedSpiritomb",
        region: "sinnoh",
        speciesId: 442,
        level: 25,
        zoneId: "route209",
        place: "Hallowed Tower, Route 209",
        badgesRequired: 3,
        keyItem: "oddKeystone",
        strength: 1.8,
        text: "Set the Odd Keystone from the Underground into the Hallowed Tower, and Spiritomb's 108 spirits answer."
    },
    {
        kind: "gift",
        id: "veilstonePorygon",
        region: "sinnoh",
        speciesId: 137,
        level: 25,
        place: "Veilstone City",
        badgesRequired: 3,
        text: "A man in Veilstone City's northern houses gives you a Porygon."
    },
    {
        kind: "gift",
        id: "ironIslandRiolu",
        region: "sinnoh",
        speciesId: 447,
        level: 5,
        place: "Iron Island",
        badgesRequired: 6,
        text: "After you clear Team Galactic out of Iron Island together, Riley gives you an Egg. It hatches into a Riolu."
    },
    {
        kind: "trade",
        id: "snowpointHaunter",
        region: "sinnoh",
        speciesId: 93,
        level: 37,
        place: "Snowpoint City",
        badgesRequired: 6,
        wants: 308,
        text: "A girl in Snowpoint would love to see a Medicham. Her Haunter, Gaspar, is yours for it."
    },
    {
        kind: "legendary",
        id: "lakeAcuityUxie",
        region: "sinnoh",
        speciesId: 480,
        level: 50,
        zoneId: "lakeAcuity",
        place: "Lake Acuity's cavern",
        badgesRequired: 7,
        strength: 2.4,
        text: "Freed from Team Galactic, Uxie, the Being of Knowledge, returns to its cavern in Lake Acuity."
    },
    {
        kind: "legendary",
        id: "lakeValorAzelf",
        region: "sinnoh",
        speciesId: 482,
        level: 50,
        zoneId: "lakeValor",
        place: "Lake Valor's cavern",
        badgesRequired: 7,
        strength: 2.4,
        text: "Freed from Team Galactic, Azelf, the Being of Willpower, returns to its cavern in Lake Valor."
    },
    {
        kind: "legendary",
        id: "roamingMesprit",
        region: "sinnoh",
        speciesId: 481,
        level: 50,
        zoneId: "lakeVerity",
        place: "Roaming Sinnoh",
        badgesRequired: 7,
        strength: 2.4,
        text: "Mesprit, the Being of Emotion, meets you at Lake Verity, then flees to roam Sinnoh's grass."
    },
    {
        kind: "gift",
        id: "sinnohCapPikachu",
        region: "sinnoh",
        speciesId: 10096,
        level: 10,
        place: "Twinleaf Town",
        badgesRequired: 8,
        postGame: true,
        text: "Wearing the cap Ash wore across Sinnoh, a Pikachu comes to visit your mom in Twinleaf Town."
    },
    {
        kind: "trade",
        id: "route226Magikarp",
        region: "sinnoh",
        speciesId: 129,
        level: 20,
        place: "Route 226, the island house",
        badgesRequired: 8,
        postGame: true,
        wants: 456,
        text: "A foreign man on Route 226 wants to see a Finneon. His Magikarp, Foppa, is yours in return."
    },
    {
        kind: "legendary",
        id: "spearPillarDialga",
        region: "sinnoh",
        speciesId: 483,
        level: 70,
        zoneId: "mtCoronetPeak",
        place: "Spear Pillar (Adamant Orb)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "With the Adamant Orb from Mt. Coronet, Dialga answers at the Spear Pillar."
    },
    {
        kind: "legendary",
        id: "spearPillarPalkia",
        region: "sinnoh",
        speciesId: 484,
        level: 70,
        zoneId: "mtCoronetPeak",
        place: "Spear Pillar (Lustrous Orb)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "With the Lustrous Orb from Mt. Coronet, Palkia answers at the Spear Pillar."
    },
    {
        kind: "legendary",
        id: "turnbackGiratina",
        region: "sinnoh",
        speciesId: 487,
        level: 70,
        zoneId: "turnbackCave",
        place: "Turnback Cave, past the third pillar",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "Past the three pillars of Turnback Cave, Giratina waits at the edge of its own world."
    },
    {
        kind: "boss",
        id: "distortionWorld",
        region: "sinnoh",
        speciesId: 461,
        level: 68,
        place: "the Distortion World",
        badgesRequired: 8,
        postGame: true,
        trainer: DISTORTION_CYRUS,
        keyItem: "griseousOrb",
        fameBonus: DISTORTION_FAME_BONUS,
        prizeBalls: { ultraBall: 10 },
        text: "Through Turnback Cave, into the Distortion World: Cyrus waits at the bottom to remake the world. Beat him for ×1.25 Fame this journey and the Griseous Orb."
    },
    {
        kind: "legendary",
        id: "distortionGiratina",
        region: "sinnoh",
        speciesId: 10007,
        level: 70,
        zoneId: "turnbackCave",
        place: "the Distortion World (Griseous Orb)",
        badgesRequired: 8,
        postGame: true,
        keyItem: "griseousOrb",
        strength: 2.8,
        text: "In its own world, with the Griseous Orb's power, Giratina takes its Origin Forme."
    },
    {
        kind: "legendary",
        id: "starkHeatran",
        region: "sinnoh",
        speciesId: 485,
        level: 50,
        zoneId: "starkMountain",
        place: "Stark Mountain, the deepest chamber",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "After Charon is arrested, Heatran rises from Stark Mountain's magma."
    },
    {
        kind: "legendary",
        id: "snowpointRegigigas",
        region: "sinnoh",
        speciesId: 486,
        level: 70,
        zoneId: "snowpointTemple",
        place: "Snowpoint Temple, the lowest floor",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "Bring Regirock, Regice and Registeel, and Regigigas stirs at the bottom of Snowpoint Temple."
    },
    {
        kind: "legendary",
        id: "fullmoonCresselia",
        region: "sinnoh",
        speciesId: 488,
        level: 50,
        zoneId: "route218",
        place: "Fullmoon Island, then roaming Sinnoh",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "A sailor's son in Canalave can't wake from his nightmares. Cresselia's Lunar Wing will help."
    },
    {
        kind: "legendary",
        id: "sinnohArticuno",
        region: "sinnoh",
        speciesId: 144,
        level: 60,
        zoneId: "route217",
        place: "Roaming Sinnoh (after Professor Oak)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "Professor Oak, visiting Eterna City, tells you Articuno has been seen flying over Sinnoh."
    },
    {
        kind: "legendary",
        id: "sinnohZapdos",
        region: "sinnoh",
        speciesId: 145,
        level: 60,
        zoneId: "route222",
        place: "Roaming Sinnoh (after Professor Oak)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "Professor Oak, visiting Eterna City, tells you Zapdos has been seen flying over Sinnoh."
    },
    {
        kind: "legendary",
        id: "sinnohMoltres",
        region: "sinnoh",
        speciesId: 146,
        level: 60,
        zoneId: "route227",
        place: "Roaming Sinnoh (after Professor Oak)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.5,
        text: "Professor Oak, visiting Eterna City, tells you Moltres has been seen flying over Sinnoh."
    },
    {
        kind: "trade",
        id: "rotomHeat",
        region: "sinnoh",
        speciesId: 10008,
        level: 20,
        place: "Team Galactic HQ, Veilstone City (Rotom Catalog)",
        badgesRequired: 8,
        postGame: true,
        wants: 479,
        text: "In Team Galactic's old headquarters, Rotom slips into a microwave oven: Heat Rotom."
    },
    {
        kind: "trade",
        id: "rotomWash",
        region: "sinnoh",
        speciesId: 10009,
        level: 20,
        place: "Team Galactic HQ, Veilstone City (Rotom Catalog)",
        badgesRequired: 8,
        postGame: true,
        wants: 479,
        text: "In Team Galactic's old headquarters, Rotom slips into a washing machine: Wash Rotom."
    },
    {
        kind: "trade",
        id: "rotomFrost",
        region: "sinnoh",
        speciesId: 10010,
        level: 20,
        place: "Team Galactic HQ, Veilstone City (Rotom Catalog)",
        badgesRequired: 8,
        postGame: true,
        wants: 479,
        text: "In Team Galactic's old headquarters, Rotom slips into a refrigerator: Frost Rotom."
    },
    {
        kind: "trade",
        id: "rotomFan",
        region: "sinnoh",
        speciesId: 10011,
        level: 20,
        place: "Team Galactic HQ, Veilstone City (Rotom Catalog)",
        badgesRequired: 8,
        postGame: true,
        wants: 479,
        text: "In Team Galactic's old headquarters, Rotom slips into an electric fan: Fan Rotom."
    },
    {
        kind: "trade",
        id: "rotomMow",
        region: "sinnoh",
        speciesId: 10012,
        level: 20,
        place: "Team Galactic HQ, Veilstone City (Rotom Catalog)",
        badgesRequired: 8,
        postGame: true,
        wants: 479,
        text: "In Team Galactic's old headquarters, Rotom slips into a lawn mower: Mow Rotom."
    },
    {
        kind: "legendary",
        id: "newmoonDarkrai",
        region: "sinnoh",
        speciesId: 491,
        level: 50,
        zoneId: "route218",
        place: "Newmoon Island (Member Card, from Canalave's inn)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "Sleep at the inn in Canalave City, and wake on Newmoon Island. Darkrai waits in its heart."
    },
    {
        kind: "legendary",
        id: "flowerParadiseShaymin",
        region: "sinnoh",
        speciesId: 492,
        level: 30,
        zoneId: "route224",
        place: "Flower Paradise (Oak's Letter, from Route 224)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.2,
        text: "With Professor Oak at the white rock on Route 224, a path opens to the Flower Paradise. Shaymin is there."
    },
    {
        kind: "trade",
        id: "gracideaShaymin",
        region: "sinnoh",
        speciesId: 10006,
        level: 30,
        place: "Floaroma Town (Gracidea)",
        badgesRequired: 8,
        postGame: true,
        wants: 492,
        text: "A girl in Floaroma Town gives you a Gracidea. Shown it, Shaymin takes its Sky Forme."
    },
    {
        kind: "legendary",
        id: "hallOfOriginArceus",
        region: "sinnoh",
        speciesId: 493,
        level: 80,
        zoneId: "mtCoronetPeak",
        place: "Hall of Origin (Azure Flute, at the Spear Pillar)",
        badgesRequired: 8,
        postGame: true,
        strength: 3,
        text: "Play the Azure Flute at the Spear Pillar, and a stairway of light climbs to the Hall of Origin. Arceus waits at the top."
    },
    {
        kind: "gift",
        id: "rangerManaphy",
        region: "sinnoh",
        speciesId: 490,
        level: 1,
        place: "Any Pokémon Center (Pokémon Ranger's Manaphy Egg)",
        badgesRequired: 8,
        postGame: true,
        text: "The Manaphy Egg from Pokémon Ranger's special mission arrives. It hatches into Manaphy, the Prince of the Sea."
    },
    {
        kind: "trade",
        id: "dayCarePhione",
        region: "sinnoh",
        speciesId: 489,
        level: 1,
        place: "Solaceon Town Day Care",
        badgesRequired: 8,
        postGame: true,
        wants: 490,
        text: "Leave Manaphy at the Solaceon Day Care with a Ditto, and the Egg it finds hatches into a Phione."
    }
];

/**
 * Honey Trees: slather Honey on one and, some time later, a Pokémon is on it. Every tree shares
 * the same tables; a few trees (picked by your Trainer ID, as in the games) are Munchlax trees.
 */
export interface HoneyTree {
    id: string;
    name: string;
    /** The place the tree grows in; it's there once that place is open. */
    zoneId?: string;
    /** For trees outside a place with wild Pokémon (Floaroma Meadow). */
    badgesRequired: number;
}

export const HONEY_TREES: HoneyTree[] = [
    { id: "floaromaMeadow", name: "Floaroma Meadow", badgesRequired: 1 },
    {
        id: "valleyWindworks",
        name: "Valley Windworks",
        zoneId: "valleyWindworks",
        badgesRequired: 1
    },
    { id: "route205South", name: "Route 205 (south)", zoneId: "route205", badgesRequired: 1 },
    { id: "route205East", name: "Route 205 (east)", zoneId: "route205", badgesRequired: 1 },
    { id: "eternaForest", name: "Eterna Forest", zoneId: "eternaForest", badgesRequired: 1 },
    { id: "route206", name: "Route 206", zoneId: "route206", badgesRequired: 2 },
    { id: "route207", name: "Route 207", zoneId: "route207", badgesRequired: 1 },
    { id: "route208", name: "Route 208", zoneId: "route208", badgesRequired: 2 },
    { id: "route209", name: "Route 209", zoneId: "route209", badgesRequired: 3 },
    { id: "route210South", name: "Route 210 (south)", zoneId: "route210South", badgesRequired: 3 },
    { id: "route210West", name: "Route 210 (west)", zoneId: "route210West", badgesRequired: 5 },
    { id: "route211", name: "Route 211", zoneId: "route211East", badgesRequired: 5 },
    { id: "route212North", name: "Route 212 (north)", zoneId: "route212", badgesRequired: 4 },
    { id: "route212South", name: "Route 212 (south)", zoneId: "route212", badgesRequired: 4 },
    { id: "route213", name: "Route 213", zoneId: "route213", badgesRequired: 4 },
    { id: "route214", name: "Route 214", zoneId: "route214", badgesRequired: 4 },
    { id: "route215", name: "Route 215", zoneId: "route215", badgesRequired: 3 },
    { id: "route218", name: "Route 218", zoneId: "route218", badgesRequired: 5 },
    { id: "route221", name: "Route 221", zoneId: "seaRoutes219to221", badgesRequired: 5 },
    { id: "route222", name: "Route 222", zoneId: "route222", badgesRequired: 7 },
    { id: "fuegoIronworks", name: "Fuego Ironworks", zoneId: "fuegoIronworks", badgesRequired: 5 }
];

/** Price of slathering one tree (Honey is ₽100 in Floaroma Town). */
export const HONEY_PRICE = 100;
/** Wild battles won after slathering before a Pokémon comes to the tree (six hours in the games). */
export const HONEY_BATTLES = 60;
/** How many trees are Munchlax trees, and the chance a Munchlax comes to one. */
export const MUNCHLAX_TREES = 4;
export const MUNCHLAX_CHANCE = 0.01;
/** On any tree, the chance the Pokémon comes from the rarer table (with Heracross). */
export const RARE_HONEY_CHANCE = 0.2;

interface SinnohExtras {
    radar: Record<string, ZonePools>;
    swarm: Record<string, ZonePools>;
    dualSlot: Record<string, Record<string, ZonePools>>;
    honey: Record<"a" | "b" | "c", EncounterEntry[]>;
}
export const SINNOH_EXTRAS = sinnohExtrasJson as unknown as SinnohExtras;

/** The trees your Trainer ID makes Munchlax trees. */
export function munchlaxTrees(trainerId: number): string[] {
    const ids: string[] = [];
    let seed = trainerId;
    while (ids.length < MUNCHLAX_TREES) {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        const tree = HONEY_TREES[seed % HONEY_TREES.length].id;
        if (!ids.includes(tree)) ids.push(tree);
    }
    return ids;
}

/** What comes to a Honey Tree: the common table, the rarer one, or (on a Munchlax tree) Munchlax. */
export function honeyTable(munchlaxTree: boolean, roll: number): EncounterEntry[] {
    if (munchlaxTree && roll < MUNCHLAX_CHANCE) return SINNOH_EXTRAS.honey.c;
    return roll < MUNCHLAX_CHANCE + RARE_HONEY_CHANCE
        ? SINNOH_EXTRAS.honey.b
        : SINNOH_EXTRAS.honey.a;
}

/** Every species a Honey Tree can bring. */
export const HONEY_SPECIES: number[] = [
    ...new Set(Object.values(SINNOH_EXTRAS.honey).flatMap(entries => entries.map(e => e.id)))
];

function pick<T>(entries: [T, number][], rng: () => number): T {
    let roll = rng() * entries.reduce((sum, [, w]) => sum + w, 0);
    return (entries.find(([, w]) => (roll -= w) <= 0) ?? entries[entries.length - 1])[0];
}

/** The Pokémon that comes to a slathered tree, decided when the Honey goes on (as in the games). */
export function rollHoneyTree(
    munchlaxTree: boolean,
    rng: () => number = Math.random
): { speciesId: number; level: number } {
    const entry = pick(
        honeyTable(munchlaxTree, rng()).map(e => [e, e.weight] as [EncounterEntry, number]),
        rng
    );
    // Burmy wears whatever cloak it last made from its surroundings.
    const cloak = WILD_VARIANTS[entry.id];
    const speciesId = cloak != null && rng() < cloak.chance ? pick(cloak.variants, rng) : entry.id;
    return {
        speciesId,
        level: entry.minLevel + Math.floor(rng() * (entry.maxLevel - entry.minLevel + 1))
    };
}

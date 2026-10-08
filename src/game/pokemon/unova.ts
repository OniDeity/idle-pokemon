/**
 * Unova, from Black and White. Wild encounters come from both games' data (merged like Ruby and
 * Sapphire); the Gyms, Elite Four, N and Ghetsis use Black's teams and order (Drayden, not Iris,
 * runs Opelucid's Gym). Black and White bring three generation mechanics: the Seasons, the
 * phenomena (shaking grass, dust clouds, rippling water, flying shadows) and critical captures.
 */
import type { EncounterEntry, PokemonType, Season } from "./data";
import { getSpecies } from "./data";
import unovaExtrasJson from "data/pokemon/unovaExtras.json";
import type { SpecialEncounter } from "./specials";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { timeLimit, trial } from "./trainers";
import type { ZoneDefinition } from "./zones";

/** The phenomena Black and White's places have, by kind. */
export type PhenomenonKind = "shakingGrass" | "dustCloud" | "ripplingWater" | "flyingShadow";

interface UnovaExtras {
    phenomena: Record<string, Partial<Record<PhenomenonKind, EncounterEntry[]>>>;
    grottoes: Record<string, EncounterEntry[]>;
}
export const UNOVA_EXTRAS = unovaExtrasJson as unknown as UnovaExtras;

function zone(options: Omit<ZoneDefinition, "region">): ZoneDefinition {
    return { region: "unova", ...options };
}

/** A bridge's only Pokémon are the flying shadows over it (Ducklett, Swanna). */
function bridge(zoneId: string) {
    return { walk: UNOVA_EXTRAS.phenomena[zoneId]?.flyingShadow ?? [] };
}

export const UNOVA_ZONES: ZoneDefinition[] = [
    zone({
        id: "unovaRoute1",
        name: "Route 1",
        badgesRequired: 0,
        blurb: "Your first steps out of Nuvema Town, with Cheren and Bianca racing ahead."
    }),
    zone({
        id: "unovaRoute2",
        name: "Route 2",
        badgesRequired: 0,
        blurb: "The road from Accumula Town, where Ghetsis first speaks of liberating Pokémon."
    }),
    zone({
        id: "dreamyard",
        name: "Dreamyard",
        badgesRequired: 0,
        blurb: "The ruins of a research lab by Striaton City, where Munna leave Dream Mist."
    }),
    zone({
        id: "unovaRoute3",
        name: "Route 3",
        badgesRequired: 1,
        blurb: "Past the Pokémon Day Care and its preschool, with ponds north of Striaton City."
    }),
    zone({
        id: "wellspringCave",
        name: "Wellspring Cave",
        badgesRequired: 1,
        blurb: "A small cave off Route 3, where Team Plasma hide with a stolen Pokémon."
    }),
    zone({
        id: "pinwheelForest",
        name: "Pinwheel Forest",
        badgesRequired: 2,
        blurb: "A thick forest west of Nacrene City; Team Plasma takes the Dragon Skull through it."
    }),
    zone({
        id: "unovaRoute4",
        name: "Route 4",
        badgesRequired: 3,
        blurb: "A sandstorm-swept road north of Castelia City, still under construction."
    }),
    zone({
        id: "desertResort",
        name: "Desert Resort",
        badgesRequired: 3,
        blurb: "A desert off Route 4, its sands hiding the entrance to the Relic Castle."
    }),
    zone({
        id: "relicCastle",
        name: "Relic Castle",
        badgesRequired: 3,
        blurb: "An ancient castle sinking into the sand, where the Cover and Plume Fossils lie."
    }),
    zone({
        id: "relicCastleBasement",
        name: "Relic Castle (basement)",
        badgesRequired: 7,
        blurb: "The castle's sunken floors, where Ghetsis waits after N flies off on his dragon."
    }),
    zone({
        id: "relicCastleDepths",
        name: "Relic Castle (depths)",
        badgesRequired: 8,
        postGame: true,
        blurb: "The deepest rooms of the castle, where the sun of the desert rests."
    }),
    zone({
        id: "unovaRoute16",
        name: "Route 16",
        badgesRequired: 3,
        blurb: "A short road east of Nimbasa City, toward the Marvelous Bridge."
    }),
    zone({
        id: "lostlornForest",
        name: "Lostlorn Forest",
        badgesRequired: 3,
        blurb: "A quiet forest north of Route 16, with an abandoned trailer and a Zoroark's tricks."
    }),
    zone({
        id: "unovaRoute5",
        name: "Route 5",
        badgesRequired: 4,
        blurb: "Performers and a trailer camp on the way west from Nimbasa City."
    }),
    zone({
        id: "driftveilDrawbridge",
        name: "Driftveil Drawbridge",
        badgesRequired: 4,
        blurb: "A drawbridge into Driftveil City; Ducklett's shadows cross it now and then.",
        encounters: bridge("driftveilDrawbridge")
    }),
    zone({
        id: "coldStorage",
        name: "Cold Storage",
        badgesRequired: 4,
        blurb: "Driftveil's freezer warehouses, where Team Plasma's Zinzolin hides out."
    }),
    zone({
        id: "unovaRoute6",
        name: "Route 6",
        badgesRequired: 5,
        blurb: "A seasonal road past the Season Research Lab, toward Chargestone Cave."
    }),
    zone({
        id: "chargestoneCave",
        name: "Chargestone Cave",
        badgesRequired: 5,
        blurb: "A cave of floating electrified stones, where N waits at the end."
    }),
    zone({
        id: "mistraltonCave",
        name: "Mistralton Cave",
        badgesRequired: 5,
        blurb: "A cave off Route 6; deep inside, past the water, lies the Guidance Chamber."
    }),
    zone({
        id: "unovaRoute7",
        name: "Route 7",
        badgesRequired: 6,
        blurb: "Raised walkways over tall grass, from Mistralton City to the Celestial Tower."
    }),
    zone({
        id: "celestialTower",
        name: "Celestial Tower",
        badgesRequired: 6,
        blurb: "A tower of graves, where Skyla goes to ring the bell at the top."
    }),
    zone({
        id: "twistMountain",
        name: "Twist Mountain",
        badgesRequired: 6,
        blurb: "A winding mine on the way to Icirrus City, where Alder hands you HM03 Surf."
    }),
    zone({
        id: "icirrusCity",
        name: "Icirrus City",
        badgesRequired: 6,
        blurb: "A rainy city of marshes, frozen solid in winter."
    }),
    zone({
        id: "dragonspiralTower",
        name: "Dragonspiral Tower",
        badgesRequired: 7,
        blurb: "Unova's oldest tower, where N awakens the legendary dragon."
    }),
    zone({
        id: "unovaRoute8",
        name: "Route 8",
        badgesRequired: 7,
        blurb: "Puddles and marsh between Icirrus City and the Tubeline Bridge."
    }),
    zone({
        id: "moorOfIcirrus",
        name: "Moor of Icirrus",
        badgesRequired: 7,
        blurb: "A misty moor off Route 8, full of Stunfisk hiding in the mud."
    }),
    zone({
        id: "unovaRoute9",
        name: "Route 9",
        badgesRequired: 7,
        blurb: "The road past the Shopping Mall Nine into Opelucid City."
    }),
    zone({
        id: "unovaRoute10",
        name: "Route 10",
        badgesRequired: 8,
        blurb: "Badge Check Gates and Rumination's high grass on the way to Victory Road."
    }),
    zone({
        id: "unovaVictoryRoad",
        name: "Victory Road",
        badgesRequired: 8,
        blurb: "A mountain of ruins below the Pokémon League, with the Trial Chamber hidden inside."
    }),
    zone({
        id: "unovaRoute18",
        name: "Route 18",
        badgesRequired: 6,
        blurb: "An island reached by Surf from Route 17, where a man in red has an Egg to give."
    }),
    zone({
        id: "p2Laboratory",
        name: "P2 Laboratory",
        badgesRequired: 6,
        blurb: "An abandoned lab on an island by Route 17, its secrets about Genesect forgotten."
    }),
    zone({
        id: "challengersCave",
        name: "Challenger's Cave",
        badgesRequired: 8,
        postGame: true,
        blurb: "A dark cave under Route 9's Shopping Mall, full of powerful Pokémon."
    }),
    zone({
        id: "unovaRoute11",
        name: "Route 11",
        badgesRequired: 8,
        postGame: true,
        blurb: "A waterfall-crossed road east of Opelucid, open once you're Champion."
    }),
    zone({
        id: "villageBridge",
        name: "Village Bridge",
        badgesRequired: 8,
        postGame: true,
        blurb: "A village built on a bridge, where a band plays for whoever stops by."
    }),
    zone({
        id: "unovaRoute12",
        name: "Route 12",
        badgesRequired: 8,
        postGame: true,
        blurb: "A countryside road toward Lacunosa Town, which locks its doors at night."
    }),
    zone({
        id: "unovaRoute13",
        name: "Route 13",
        badgesRequired: 8,
        postGame: true,
        blurb: "Cliffs and beaches from Lacunosa Town down to Undella Town."
    }),
    zone({
        id: "giantChasm",
        name: "Giant Chasm",
        badgesRequired: 8,
        postGame: true,
        blurb: "A crater where a meteorite once fell. Something in the cave freezes everything around it."
    }),
    zone({
        id: "unovaRoute14",
        name: "Route 14",
        badgesRequired: 8,
        postGame: true,
        blurb: "Waterfalls and mist between Undella Town and the Black City or White Forest."
    }),
    zone({
        id: "abundantShrine",
        name: "Abundant Shrine",
        badgesRequired: 8,
        postGame: true,
        blurb: "A shrine to the god of abundance, where Landorus answers the Forces of Nature."
    }),
    zone({
        id: "undellaBay",
        name: "Undella Bay",
        badgesRequired: 8,
        postGame: true,
        blurb: "A resort bay where Cynthia spends her summers; the sea goes out to Route 17."
    }),
    zone({
        id: "unovaRoute15",
        name: "Route 15",
        badgesRequired: 8,
        postGame: true,
        blurb: "Rocky trails west of the Black City or White Forest, with a trailer of rare finds."
    }),
    zone({
        id: "marvelousBridge",
        name: "Marvelous Bridge",
        badgesRequired: 8,
        postGame: true,
        blurb: "A great bridge to Route 16, where Swanna's shadows fly overhead.",
        encounters: bridge("marvelousBridge")
    })
];

/**
 * The Seasons (Black and White's mechanic): they change every SEASON_BATTLES wild battles,
 * from spring. In Unova, wild tables change with them; Deerling and Sawsbuck wear the season's
 * coat. In other regions each season brings out its own types, and Deerling wander the grass.
 */
export const SEASON_BATTLES = 150;

export function seasonAt(battlesWon: number): Season {
    return (["spring", "summer", "autumn", "winter"] as Season[])[
        Math.floor(battlesWon / SEASON_BATTLES) % 4
    ];
}

export const SEASON_NAMES: Record<Season, string> = {
    spring: "Spring",
    summer: "Summer",
    autumn: "Autumn",
    winter: "Winter"
};

/** The types each season brings out in other regions' grass. */
export const SEASON_TYPES: Record<Season, PokemonType[]> = {
    spring: ["grass", "bug", "normal"],
    summer: ["fire", "water", "electric"],
    autumn: ["ground", "ghost", "dark"],
    winter: ["ice", "steel", "psychic"]
};
/** How much likelier an in-season type is in other regions' grass. */
export const SEASON_TYPE_BOOST = 1.5;
/** Share of other regions' grass that seasonal Deerling make up. */
export const SEASON_DEERLING_SHARE = 0.03;

/** Deerling's and Sawsbuck's coats by season (spring is the species itself). */
const SEASON_FORMS: Record<number, Record<Season, number>> = {
    585: { spring: 585, summer: 4301, autumn: 4302, winter: 4303 },
    586: { spring: 586, summer: 4304, autumn: 4305, winter: 4306 }
};

/** The form a wild Pokémon takes in this season (Deerling's coat), or the species itself. */
export function seasonForm(id: number, season: Season | undefined): number {
    return season != null ? (SEASON_FORMS[id]?.[season] ?? id) : id;
}

/** Whether a species is in season: one of its types is the season's. */
export function inSeason(id: number, season: Season): boolean {
    return getSpecies(id).types.some(type => SEASON_TYPES[season].includes(type));
}

/**
 * Phenomena (Black and White's mechanic): this share of encounters is a phenomenon where one can
 * happen. In Unova each kind has its own table; elsewhere shaking grass brings any of the
 * place's grass Pokémon (rare ones as often as common ones, at the top of its levels) or an
 * Audino, and rippling water does the same for the water.
 */
export const PHENOMENON_CHANCE = 0.08;
/** Outside Unova, the share of shaking grass that's an Audino. */
export const AUDINO_SHARE = 0.25;
export const AUDINO = 531;

/**
 * Critical captures (Black and White's mechanic): sometimes a ball shakes once and the catch is
 * certain. The chance grows with the Pokédex: Black and White's factor by species caught, times
 * the normal chance, over six.
 */
export function criticalCaptureFactor(dexCaught: number): number {
    if (dexCaught > 600) return 2.5;
    if (dexCaught > 450) return 2;
    if (dexCaught > 300) return 1.5;
    if (dexCaught > 150) return 1;
    if (dexCaught > 30) return 0.5;
    return 0;
}

export function criticalCaptureChance(chance: number, dexCaught: number, boost = 1): number {
    return Math.min(1, (chance * criticalCaptureFactor(dexCaught) * boost) / 6);
}

/**
 * Stat multipliers for Unova's leaders, tuned with scripts/simulateProgression.ts: after Oblivia,
 * Unova's trainers carry eleven regions' Renown, and a first clear takes about 10.5 hours on
 * average (5-14 by starter and luck). Elesa, Drayden and the League are the longest walls.
 */
const UNOVA_GYM_STRENGTHS = [1.8, 3.0, 3.6, 3.8, 3.9, 4.6, 5.0, 4.6];
const UNOVA_ELITE_FOUR_STRENGTH = 3.25;
const UNOVA_N_STRENGTH = 3.38;
const UNOVA_GHETSIS_STRENGTH = 3.5;

function unovaGym(
    options: Omit<Parameters<typeof trial>[0], "statMultiplier" | "badgeIcon">,
    badgeIcon: number
): GymDefinition {
    return trial({
        ...options,
        statMultiplier: UNOVA_GYM_STRENGTHS[options.badgeNumber - 1],
        // PokeAPI numbers Unova's badges from 33 (Black and White's and Black 2 and White 2's).
        badgeIcon: `badges/${badgeIcon}.png`
    });
}

export const UNOVA_GYMS: GymDefinition[] = [
    unovaGym(
        {
            id: "striatonTrio",
            name: "Cilan, Chili & Cress",
            title: "Striaton City Gym Leaders",
            town: "Striaton City",
            badge: "Trio Badge",
            badgeNumber: 1,
            specialty: null,
            team: [
                { id: 506, level: 12 },
                { id: 511, level: 14 }
            ],
            // The brother whose type beats your starter is the one you face.
            forStarter: {
                495: {
                    name: "Chili",
                    specialty: "fire",
                    team: [
                        { id: 506, level: 12 },
                        { id: 513, level: 14 }
                    ],
                    quote: "Ta-da! The Fire-type scorcher Chili, that's me, will be your opponent!"
                },
                498: {
                    name: "Cress",
                    specialty: "water",
                    team: [
                        { id: 506, level: 12 },
                        { id: 515, level: 14 }
                    ],
                    quote: "I'm a Water-type specialist, Cress. Let me show you how refreshing we can be!"
                },
                501: {
                    name: "Cilan",
                    specialty: "grass",
                    team: [
                        { id: 506, level: 12 },
                        { id: 511, level: 14 }
                    ],
                    quote: "I'm Cilan, and I'll serve up a battle of Grass-type flavor, if you please!"
                }
            },
            keyItems: [],
            rewardText:
                "Route 3 and the Wellspring Cave open, and the Dreamyard's Munna need your help.",
            quote: "Welcome to the Striaton City Pokémon Gym, also a restaurant! Which of us will you face?"
        },
        33
    ),
    unovaGym(
        {
            id: "lenora",
            name: "Lenora",
            title: "Nacrene City Gym Leader",
            town: "Nacrene City",
            badge: "Basic Badge",
            badgeNumber: 2,
            specialty: "normal",
            team: [
                { id: 507, level: 18 },
                { id: 505, level: 20 }
            ],
            keyItems: [],
            rewardText:
                "Team Plasma steals the Dragon Skull from the museum; chase them into Pinwheel Forest.",
            quote: "So, you want to challenge me? Let me see what you and your Pokémon are made of!"
        },
        34
    ),
    unovaGym(
        {
            id: "burgh",
            name: "Burgh",
            title: "Castelia City Gym Leader",
            town: "Castelia City",
            badge: "Insect Badge",
            badgeNumber: 3,
            specialty: "bug",
            team: [
                { id: 544, level: 21 },
                { id: 557, level: 21 },
                { id: 542, level: 23 }
            ],
            keyItems: ["bicycle"],
            rewardText:
                "Route 4 and the Desert Resort open, and in Nimbasa City the Day Care man gives you a Bicycle for chasing off Team Plasma.",
            quote: "I am Burgh, the Gym Leader. I paint my art with the help of my Bug-type Pokémon!"
        },
        36
    ),
    unovaGym(
        {
            id: "elesa",
            name: "Elesa",
            title: "Nimbasa City Gym Leader",
            town: "Nimbasa City",
            badge: "Bolt Badge",
            badgeNumber: 4,
            specialty: "electric",
            team: [
                { id: 587, level: 25 },
                { id: 587, level: 25 },
                { id: 523, level: 27 }
            ],
            keyItems: [],
            rewardText:
                "Route 5 and the Driftveil Drawbridge lead west, where Team Plasma hides in the Cold Storage.",
            quote: "Welcome to my Gym. I'll electrify you with my dazzling Pokémon!"
        },
        37
    ),
    unovaGym(
        {
            id: "clay",
            name: "Clay",
            title: "Driftveil City Gym Leader",
            town: "Driftveil City",
            badge: "Quake Badge",
            badgeNumber: 5,
            specialty: "ground",
            team: [
                { id: 552, level: 29 },
                { id: 536, level: 29 },
                { id: 530, level: 31 }
            ],
            keyItems: [],
            rewardText: "Route 6 opens, past the Season Research Lab, toward Chargestone Cave.",
            quote: "Ah, you're the one who stopped Team Plasma! Now show me what you've got!"
        },
        38
    ),
    unovaGym(
        {
            id: "skyla",
            name: "Skyla",
            title: "Mistralton City Gym Leader",
            town: "Mistralton City",
            badge: "Jet Badge",
            badgeNumber: 6,
            specialty: "flying",
            team: [
                { id: 528, level: 33 },
                { id: 521, level: 33 },
                { id: 581, level: 35 }
            ],
            keyItems: ["surf"],
            rewardText:
                "In Twist Mountain, Alder gives you HM03 Surf. Route 7, the Celestial Tower and the sea to Route 18 open.",
            quote: "I'm Skyla, Mistralton's Gym Leader! Let's fly into an amazing battle!"
        },
        39
    ),
    unovaGym(
        {
            id: "brycen",
            name: "Brycen",
            title: "Icirrus City Gym Leader",
            town: "Icirrus City",
            badge: "Freeze Badge",
            badgeNumber: 7,
            specialty: "ice",
            team: [
                { id: 583, level: 37 },
                { id: 615, level: 37 },
                { id: 614, level: 39 }
            ],
            keyItems: [],
            rewardText:
                "N awakens the legendary dragon atop Dragonspiral Tower. Route 8 and Route 9 lead on to Opelucid City.",
            quote: "There is also strength in being with other people and Pokémon. Show me yours!"
        },
        40
    ),
    unovaGym(
        {
            id: "drayden",
            name: "Drayden",
            title: "Opelucid City Gym Leader",
            town: "Opelucid City",
            badge: "Legend Badge",
            badgeNumber: 8,
            specialty: "dragon",
            team: [
                { id: 611, level: 41 },
                { id: 621, level: 41 },
                { id: 612, level: 43 }
            ],
            keyItems: ["superRod"],
            rewardText:
                "Route 10 and Victory Road lead to the Pokémon League, and Looker hands you a Super Rod for the road.",
            quote: "Can you find the courage to defeat the Dragon-type Pokémon I've raised?"
        },
        41
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

/**
 * The Elite Four, then N's Castle: N with Zekrom, then Ghetsis, back to back (Black's teams).
 * Unova's Champion Alder is beaten by N before you arrive; he's battled after the League.
 */
export function unovaFinale(): TrainerDefinition[] {
    const e4 = UNOVA_ELITE_FOUR_STRENGTH;
    return [
        leagueMember(
            "shauntal",
            "Shauntal",
            "Elite Four",
            "ghost",
            e4,
            [
                [563, 48],
                [593, 48],
                [623, 48],
                [609, 50]
            ],
            "Excuse me. You're a challenger, right? I'm the Elite Four's Shauntal, and I'll be your opponent."
        ),
        leagueMember(
            "grimsley",
            "Grimsley",
            "Elite Four",
            "dark",
            e4,
            [
                [560, 48],
                [510, 48],
                [553, 48],
                [625, 50]
            ],
            "Life is a serious battle, and you have to use the tools you're given. I'm Grimsley of the Elite Four."
        ),
        leagueMember(
            "caitlin",
            "Caitlin",
            "Elite Four",
            "psychic",
            e4,
            [
                [579, 48],
                [518, 48],
                [561, 48],
                [576, 50]
            ],
            "It's you who woke me from my sleep. I am Caitlin of the Elite Four."
        ),
        leagueMember(
            "marshal",
            "Marshal",
            "Elite Four",
            "fighting",
            e4,
            [
                [538, 48],
                [539, 48],
                [534, 48],
                [620, 50]
            ],
            "Greetings, challenger. My name is Marshal. I am a protégé of my master, Alder."
        ),
        leagueMember(
            "n",
            "N",
            "Team Plasma's King",
            "dragon",
            UNOVA_N_STRENGTH,
            [
                [644, 52],
                [565, 50],
                [584, 50],
                [567, 50],
                [571, 50],
                [601, 50]
            ],
            "My Zekrom has chosen me as its hero. Now, whose ideals will win out: yours or mine?"
        ),
        leagueMember(
            "ghetsis",
            "Ghetsis",
            "Team Plasma",
            "dark",
            UNOVA_GHETSIS_STRENGTH,
            [
                [563, 52],
                [626, 52],
                [537, 52],
                [625, 52],
                [604, 52],
                [635, 54]
            ],
            "N was nothing but a puppet I made to rule the world. I'll crush you with my own hands!"
        )
    ];
}

/** Alder, Unova's Champion, battled once the League is cleared (Black and White's second round). */
export const UNOVA_ALDER: TrainerDefinition = {
    id: "alder",
    name: "Alder",
    title: "Unova Champion",
    specialty: null,
    team: [
        { id: 617, level: 75 },
        { id: 626, level: 75 },
        { id: 621, level: 75 },
        { id: 584, level: 75 },
        { id: 589, level: 75 },
        { id: 637, level: 77 }
    ],
    timeLimit: timeLimit(6),
    statMultiplier: 3.4,
    prizeMoney: 7700,
    quote: "Your Pokémon are full of spirit! Now, let's see how far you can push them!"
};

/** How much more Fame a journey earns once Alder is beaten (like the Distortion World). */
export const ALDER_FAME_BONUS = 1.25;

/** The Dreamyard's gift, by starter: the monkey whose type beats the starter's. */
const DREAMYARD_MONKEY: Record<number, number> = { 495: 515, 498: 511, 501: 513 };

/** Unova's gifts, trades, legendaries and Alder (Black and White). */
export const UNOVA_SPECIALS: SpecialEncounter[] = [
    {
        kind: "gift",
        id: "dreamyardMonkey",
        region: "unova",
        speciesId: 515,
        byStarter: DREAMYARD_MONKEY,
        level: 10,
        place: "Dreamyard",
        badgesRequired: 0,
        text: "At the Dreamyard, Fennel's friend gives you an elemental monkey: whichever has the advantage over your starter's type."
    },
    {
        kind: "trade",
        id: "nacrenePetilil",
        region: "unova",
        speciesId: 548,
        level: 15,
        place: "Nacrene City",
        badgesRequired: 1,
        wants: 546,
        text: "A woman in Nacrene City would love to see a Cottonee. Her Petilil, Lillil, is yours for it."
    },
    {
        kind: "trade",
        id: "nacreneCottonee",
        region: "unova",
        speciesId: 546,
        level: 15,
        place: "Nacrene City",
        badgesRequired: 1,
        wants: 548,
        text: "In White, the same woman would rather see a Petilil. Her Cottonee, Fluffee, is yours for it."
    },
    {
        kind: "gift",
        id: "relicCastleTirtouga",
        region: "unova",
        speciesId: 564,
        level: 25,
        place: "Nacrene Museum (Cover Fossil)",
        badgesRequired: 3,
        text: "The Cover Fossil from the Relic Castle, revived by the Nacrene Museum into Tirtouga."
    },
    {
        kind: "gift",
        id: "relicCastleArchen",
        region: "unova",
        speciesId: 566,
        level: 25,
        place: "Nacrene Museum (Plume Fossil)",
        badgesRequired: 3,
        text: "The Plume Fossil from the Relic Castle, revived by the Nacrene Museum into Archen."
    },
    {
        kind: "gift",
        id: "casteliaZorua",
        region: "unova",
        speciesId: 570,
        level: 10,
        place: "Castelia City",
        badgesRequired: 3,
        postGame: true,
        text: "A lost girl in Castelia City turns out to be a Zorua in disguise, drawn out by a Celebi from your Hall of Fame. It joins you."
    },
    {
        kind: "legendary",
        id: "libertyVictini",
        region: "unova",
        speciesId: 494,
        level: 15,
        zoneId: "unovaRoute4",
        place: "Liberty Garden (Liberty Pass, by boat from Castelia)",
        badgesRequired: 3,
        keyItem: "libertyPass",
        strength: 1.6,
        text: "With the Liberty Pass, a boat from Castelia takes you to Liberty Garden. Past Team Plasma, Victini waits in the lighthouse basement."
    },
    {
        kind: "trade",
        id: "driftveilBasculin",
        region: "unova",
        speciesId: 550,
        level: 25,
        place: "Driftveil City",
        badgesRequired: 4,
        wants: 572,
        text: "A man two houses from Driftveil's Pokémon Center wants to see a Minccino. His Red-Striped Basculin, Redeye, is yours."
    },
    {
        kind: "trade",
        id: "driftveilBlueBasculin",
        region: "unova",
        speciesId: 10016,
        level: 25,
        place: "Driftveil City",
        badgesRequired: 4,
        wants: 572,
        text: "In White, his Basculin, Blueye, has blue stripes instead. Show him a Minccino and it's yours too."
    },
    {
        kind: "trade",
        id: "route7Emolga",
        region: "unova",
        speciesId: 587,
        level: 30,
        place: "Route 7",
        badgesRequired: 6,
        wants: 525,
        text: "A Hiker in Route 7's first house wants to see a Boldore. His Emolga, Minipete, is yours for it."
    },
    {
        kind: "legendary",
        id: "mistraltonCobalion",
        region: "unova",
        speciesId: 638,
        level: 42,
        zoneId: "mistraltonCave",
        place: "Mistralton Cave, the Guidance Chamber",
        badgesRequired: 6,
        strength: 2.3,
        text: "Across the water deep in Mistralton Cave, Cobalion, leader of the Swords of Justice, stands guard."
    },
    {
        kind: "gift",
        id: "route18Larvesta",
        region: "unova",
        speciesId: 636,
        level: 1,
        place: "Route 18",
        badgesRequired: 6,
        text: "In a house on Route 18, a man in a red suit gives you an Egg. It hatches into Larvesta."
    },
    {
        kind: "legendary",
        id: "trialChamberTerrakion",
        region: "unova",
        speciesId: 639,
        level: 42,
        zoneId: "unovaVictoryRoad",
        place: "Victory Road, the Trial Chamber",
        badgesRequired: 8,
        strength: 2.4,
        text: "Near the top of Victory Road, a new cave has opened: Terrakion waits in the Trial Chamber."
    },
    {
        kind: "legendary",
        id: "ruminationVirizion",
        region: "unova",
        speciesId: 640,
        level: 42,
        zoneId: "pinwheelForest",
        place: "Pinwheel Forest, the Rumination Field",
        badgesRequired: 8,
        strength: 2.4,
        text: "Once Cobalion and Terrakion have tested you, Virizion appears in Pinwheel Forest's Rumination Field."
    },
    {
        kind: "legendary",
        id: "roamingTornadus",
        region: "unova",
        speciesId: 641,
        level: 40,
        zoneId: "unovaRoute7",
        place: "Roaming Unova (after Route 7's storm)",
        badgesRequired: 8,
        strength: 2.3,
        text: "A strange storm hits Route 7. When it lifts, Tornadus flies off to roam Unova in the rain."
    },
    {
        kind: "legendary",
        id: "roamingThundurus",
        region: "unova",
        speciesId: 642,
        level: 40,
        zoneId: "unovaRoute7",
        place: "Roaming Unova (after Route 7's storm)",
        badgesRequired: 8,
        strength: 2.3,
        text: "In White, it's Thundurus that the storm on Route 7 sets loose, to roam Unova's thunderclouds."
    },
    {
        kind: "legendary",
        id: "nsCastleReshiram",
        region: "unova",
        speciesId: 643,
        level: 50,
        zoneId: "dragonspiralTower",
        place: "N's Castle, then Dragonspiral Tower (Light Stone)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "The Light Stone answers your ideals: Reshiram, the Vast White Pokémon, awakens to stand against N's Zekrom."
    },
    {
        kind: "legendary",
        id: "dragonspiralZekrom",
        region: "unova",
        speciesId: 644,
        level: 50,
        zoneId: "dragonspiralTower",
        place: "Dragonspiral Tower (Dark Stone)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "In White, it's the Dark Stone and Zekrom, the Deep Black Pokémon, that wait at the top of Dragonspiral Tower."
    },
    {
        kind: "boss",
        id: "championAlder",
        region: "unova",
        speciesId: 637,
        level: 77,
        place: "the Pokémon League",
        badgesRequired: 8,
        postGame: true,
        trainer: UNOVA_ALDER,
        fameBonus: ALDER_FAME_BONUS,
        prizeBalls: { ultraBall: 10 },
        text: "With N gone, Alder takes back the Champion's seat and waits for a real battle. Beat him for ×1.25 Fame this journey."
    },
    {
        kind: "gift",
        id: "unovaCapPikachu",
        region: "unova",
        speciesId: 10097,
        level: 10,
        place: "Nuvema Town",
        badgesRequired: 8,
        postGame: true,
        text: "Wearing the cap Ash wore across Unova, a Pikachu comes to visit your mom in Nuvema Town."
    },
    {
        kind: "legendary",
        id: "dreamyardMusharna",
        region: "unova",
        speciesId: 518,
        level: 50,
        zoneId: "dreamyard",
        place: "Dreamyard, the basement",
        badgesRequired: 8,
        postGame: true,
        strength: 2,
        text: "On Fridays, a Musharna dozes in the Dreamyard's basement, surrounded by Dream Mist."
    },
    {
        kind: "legendary",
        id: "relicCastleVolcarona",
        region: "unova",
        speciesId: 637,
        level: 70,
        zoneId: "relicCastleDepths",
        place: "Relic Castle, the deepest room",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "At the very bottom of the Relic Castle, the sun of the desert rests: a Volcarona."
    },
    {
        kind: "legendary",
        id: "giantChasmKyurem",
        region: "unova",
        speciesId: 646,
        level: 75,
        zoneId: "giantChasm",
        place: "Giant Chasm, the cave",
        badgesRequired: 8,
        postGame: true,
        strength: 2.8,
        text: "In the cave at the heart of the Giant Chasm, Kyurem, the Boundary Pokémon, freezes the air around it."
    },
    {
        kind: "legendary",
        id: "abundantLandorus",
        region: "unova",
        speciesId: 645,
        level: 70,
        zoneId: "abundantShrine",
        place: "Abundant Shrine (with Tornadus and Thundurus)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.7,
        text: "Bring Tornadus and Thundurus to the Abundant Shrine, and Landorus, the god of abundance, swoops down."
    },
    {
        kind: "trade",
        id: "route15Rotom",
        region: "unova",
        speciesId: 479,
        level: 60,
        place: "Route 15",
        badgesRequired: 8,
        postGame: true,
        wants: 132,
        text: "A girl in Route 15's trailer wants to see a Ditto. Her Rotom, Eeks, is yours in return."
    },
    {
        kind: "trade",
        id: "undellaMunchlax",
        region: "unova",
        speciesId: 446,
        level: 60,
        place: "Undella Town (summer)",
        badgesRequired: 8,
        postGame: true,
        wants: 573,
        text: "A holidaymaker in Undella Town would love to see a Cinccino. His Munchlax, Gorge, is yours."
    },
    {
        kind: "gift",
        id: "marvelousMagikarp",
        region: "unova",
        speciesId: 129,
        level: 5,
        price: 500,
        place: "Marvelous Bridge",
        badgesRequired: 8,
        postGame: true,
        text: "A salesman on the Marvelous Bridge sells a Pokémon rare in Unova: a Magikarp, for ₽500."
    }
];

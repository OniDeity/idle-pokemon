/**
 * Medals (Black 2 and White 2's Medal Rally, made into the game's achievements). Each medal
 * has up to four tiers, Bronze to Platinum, earned once a lifetime count or a record reaches
 * the tier's goal; every tier earned pays Fame. Medals are kept for good, like the Pokédex.
 */
import type { ChallengeId } from "./challenges";
import { CHALLENGE_LIST } from "./challenges";
import type { RegionId } from "./zones";
import { REGION_LIST } from "./regions";

/** Lifetime counts the game keeps for medals (never reset by the Hall of Fame). */
export type MedalStat =
    | "wildBattles"
    | "catches"
    | "shiniesFound"
    | "trainersBeaten"
    | "trialsWon"
    | "legendariesCaught"
    | "bossesBeaten"
    | "eggsHatched"
    | "evolutions"
    | "fossilsRevived"
    | "wallsDug"
    | "honeyShaken"
    | "shadowsSnagged"
    | "shadowsPurified"
    | "contestsWon"
    | "musicalsWon"
    | "tradesMade"
    | "giftsReceived"
    | "grottoesVisited"
    | "phenomena"
    | "criticalCaptures"
    | "seasonsTurned"
    | "moneyEarned"
    | "playTime"
    | "bestRadarChain";

/** What a medal can read: the lifetime counts, plus what the Pokédex and Hall of Fame keep. */
export interface MedalContext {
    stats: Partial<Record<MedalStat, number>>;
    dexCaught: number;
    shinySpecies: number;
    variantsCaught: number;
    /** Clears per region. */
    clears: Partial<Record<RegionId, number>>;
    mechanicsUnlocked: number;
    platesFound: number;
    rangerSigns: number;
    ribbons: number;
    /** Finished journeys: their play time in seconds and the challenges they were cleared with. */
    journeys: { time: number; challenges: ChallengeId[] }[];
}

export type MedalCategory = "adventure" | "battle" | "collection" | "region" | "challenge";

export const MEDAL_CATEGORY_NAMES: Record<MedalCategory, string> = {
    adventure: "Adventure",
    battle: "Battle",
    collection: "Collection",
    region: "Regions",
    challenge: "Challenges"
};

export interface MedalDefinition {
    id: string;
    name: string;
    category: MedalCategory;
    /** What the medal asks for; "{n}" is replaced by the tier's goal. */
    description: string;
    /** Goals for each tier, Bronze first (one goal means a single Gold medal). */
    goals: number[];
    value: (ctx: MedalContext) => number;
    /** For records where less is better (the fastest clear): the goal is a ceiling. */
    lowerIsBetter?: boolean;
    /** How a goal is written ("10 h", "₽1M"). */
    format?: (goal: number) => string;
}

export const TIER_NAMES = ["Bronze", "Silver", "Gold", "Platinum"];
/** Fame for each tier, Bronze to Platinum. */
export const TIER_FAME = [1, 2, 5, 12];
/** A single-tier medal counts as Gold. */
export const SINGLE_TIER = 2;

const stat = (id: MedalStat) => (ctx: MedalContext) => ctx.stats[id] ?? 0;

function compact(n: number): string {
    if (n >= 1e9) return `${n / 1e9}B`;
    if (n >= 1e6) return `${n / 1e6}M`;
    if (n >= 1e3) return `${n / 1e3}k`;
    return String(n);
}

function counter(
    id: MedalStat,
    name: string,
    category: MedalCategory,
    description: string,
    goals: number[]
): MedalDefinition {
    return { id, name, category, description, goals, value: stat(id), format: compact };
}

const hours = (goal: number) => `${goal / 3600} h`;

export const MEDALS: MedalDefinition[] = [
    // Adventure
    {
        id: "pokedex",
        name: "Pokédex Pro",
        category: "adventure",
        description: "Register {n} species as caught in the Pokédex.",
        goals: [50, 151, 386, 649],
        value: ctx => ctx.dexCaught
    },
    {
        id: "variants",
        name: "Form Finder",
        category: "adventure",
        description: "Register {n} forms and variants in the Pokédex.",
        goals: [10, 50, 150, 300],
        value: ctx => ctx.variantsCaught
    },
    {
        id: "shinyDex",
        name: "Shiny Collector",
        category: "adventure",
        description: "Catch shiny Pokémon of {n} species.",
        goals: [1, 10, 50, 150],
        value: ctx => ctx.shinySpecies
    },
    counter(
        "shiniesFound",
        "Sparkle Spotter",
        "adventure",
        "Come across {n} shiny Pokémon.",
        [1, 10, 50, 250]
    ),
    counter(
        "wildBattles",
        "Wanderer",
        "adventure",
        "Win {n} wild battles.",
        [1000, 10000, 100000, 1000000]
    ),
    counter(
        "catches",
        "Catcher",
        "adventure",
        "Catch {n} Pokémon (repeats count).",
        [100, 1000, 10000, 50000]
    ),
    counter("moneyEarned", "Big Earner", "adventure", "Earn ₽{n} in total.", [1e5, 1e7, 1e9, 1e11]),
    {
        id: "playTime",
        name: "Old Hand",
        category: "adventure",
        description: "Spend {n} on journeys.",
        goals: [10 * 3600, 100 * 3600, 500 * 3600, 2000 * 3600],
        value: stat("playTime"),
        format: hours
    },
    {
        id: "mechanics",
        name: "Mechanic",
        category: "adventure",
        description: "Unlock {n} generation mechanics.",
        goals: [3, 8, 13, 17],
        value: ctx => ctx.mechanicsUnlocked
    },
    // Battle
    counter(
        "trialsWon",
        "Gym Challenger",
        "battle",
        "Win {n} Gym battles or trials.",
        [8, 50, 200, 600]
    ),
    counter(
        "trainersBeaten",
        "Ace Trainer",
        "battle",
        "Beat {n} Trainers.",
        [50, 500, 2000, 10000]
    ),
    counter(
        "legendariesCaught",
        "Legend Hunter",
        "battle",
        "Catch or capture {n} legendary Pokémon.",
        [1, 20, 100, 300]
    ),
    counter(
        "bossesBeaten",
        "Boss Buster",
        "battle",
        "Beat {n} famous Trainers (Red, Cyrus...).",
        [1, 10, 50, 150]
    ),
    {
        id: "hallOfFame",
        name: "Hall of Famer",
        category: "battle",
        description: "Enter the Hall of Fame {n} times.",
        goals: [1, 10, 30, 100],
        value: ctx => Object.values(ctx.clears).reduce((sum, n) => sum + (n ?? 0), 0)
    },
    {
        id: "fastestClear",
        name: "Speedrunner",
        category: "battle",
        description: "Clear a region in {n} of play or less.",
        goals: [10 * 3600, 6 * 3600, 3 * 3600, 3600],
        lowerIsBetter: true,
        value: ctx => Math.min(Infinity, ...ctx.journeys.map(j => j.time)),
        format: hours
    },
    counter(
        "criticalCaptures",
        "Critical Catcher",
        "battle",
        "Land {n} critical captures.",
        [5, 50, 500, 2500]
    ),
    // Collection
    counter(
        "eggsHatched",
        "Egg Hatcher",
        "collection",
        "Hatch {n} Day Care Eggs.",
        [10, 100, 1000, 5000]
    ),
    counter(
        "evolutions",
        "Evolution Expert",
        "collection",
        "Evolve {n} Pokémon.",
        [25, 250, 1000, 5000]
    ),
    counter(
        "tradesMade",
        "Trade Partner",
        "collection",
        "Make {n} in-game trades.",
        [5, 50, 200, 500]
    ),
    counter(
        "giftsReceived",
        "Gift Receiver",
        "collection",
        "Receive {n} gift Pokémon.",
        [5, 50, 200, 500]
    ),
    counter(
        "fossilsRevived",
        "Fossil Maniac",
        "collection",
        "Revive {n} fossils.",
        [1, 10, 50, 200]
    ),
    counter("wallsDug", "Digger", "collection", "Dig {n} Underground walls.", [10, 100, 500, 2000]),
    counter(
        "honeyShaken",
        "Honey Hunter",
        "collection",
        "Shake {n} Honey Trees.",
        [5, 50, 250, 1000]
    ),
    counter(
        "shadowsSnagged",
        "Snag Master",
        "collection",
        "Snag {n} Shadow Pokémon.",
        [1, 30, 150, 500]
    ),
    counter(
        "shadowsPurified",
        "Purifier",
        "collection",
        "Purify {n} Shadow Pokémon.",
        [1, 25, 100, 400]
    ),
    counter(
        "contestsWon",
        "Contest Star",
        "collection",
        "Win {n} Pokémon Contests.",
        [1, 20, 100, 400]
    ),
    counter(
        "musicalsWon",
        "Musical Star",
        "collection",
        "Win {n} Pokémon Musicals.",
        [1, 20, 100, 400]
    ),
    {
        id: "ribbons",
        name: "Ribbon Collector",
        category: "collection",
        description: "Hold {n} Contest ribbons.",
        goals: [1, 10, 50, 200],
        value: ctx => ctx.ribbons
    },
    {
        id: "plates",
        name: "Plate Collector",
        category: "collection",
        description: "Dig up {n} of Arceus's Plates.",
        goals: [1, 6, 12, 17],
        value: ctx => ctx.platesFound
    },
    {
        id: "rangerSigns",
        name: "Top Ranger",
        category: "collection",
        description: "Earn {n} Ranger Signs.",
        goals: [1, 4, 8, 11],
        value: ctx => ctx.rangerSigns
    },
    counter(
        "bestRadarChain",
        "Radar Chainer",
        "collection",
        "Build a Poké Radar chain of {n}.",
        [10, 20, 30, 40]
    ),
    counter(
        "phenomena",
        "Phenomenal",
        "collection",
        "Meet {n} Pokémon in phenomena.",
        [25, 250, 2500, 10000]
    ),
    counter(
        "grottoesVisited",
        "Grotto Explorer",
        "collection",
        "Visit {n} Hidden Grottoes.",
        [5, 50, 250, 1000]
    ),
    counter(
        "seasonsTurned",
        "Four Seasons",
        "collection",
        "See the season turn {n} times.",
        [4, 40, 200, 1000]
    ),
    // Regions: one Gold medal for each region's first clear, and tiers for clearing them all.
    ...REGION_LIST.map(
        (region): MedalDefinition => ({
            id: `clear_${region.id}`,
            name: `${region.name} Champion`,
            category: "region",
            description: `Clear ${region.name}'s ${region.finaleName}.`,
            goals: [1],
            value: ctx => ctx.clears[region.id] ?? 0
        })
    ),
    {
        id: "globetrotter",
        name: "Globetrotter",
        category: "region",
        description: "Clear {n} different regions.",
        goals: [3, 6, 9, REGION_LIST.length],
        value: ctx => Object.values(ctx.clears).filter(n => (n ?? 0) > 0).length
    },
    // Challenges
    {
        id: "challenger",
        name: "Challenger",
        category: "challenge",
        description: "Clear {n} journeys with at least one challenge.",
        goals: [1, 10, 50, 150],
        value: ctx => ctx.journeys.filter(j => j.challenges.length > 0).length
    },
    {
        id: "keyMaster",
        name: "Key Master",
        category: "challenge",
        description: "Clear a journey with {n} challenges at once.",
        goals: [2, 3, 4, CHALLENGE_LIST.length],
        value: ctx => Math.max(0, ...ctx.journeys.map(j => j.challenges.length))
    },
    ...CHALLENGE_LIST.map(
        (challenge): MedalDefinition => ({
            id: `challenge_${challenge.id}`,
            name: challenge.medal,
            category: "challenge",
            description: `Clear a journey with the ${challenge.name} challenge.`,
            goals: [1],
            value: ctx => ctx.journeys.filter(j => j.challenges.includes(challenge.id)).length
        })
    )
];

export const MEDALS_BY_ID: Record<string, MedalDefinition> = Object.fromEntries(
    MEDALS.map(m => [m.id, m])
);

/** How many tiers of a medal its value reaches (0 for none). */
export function tierReached(medal: MedalDefinition, value: number): number {
    return medal.goals.filter(goal => (medal.lowerIsBetter ? value <= goal : value >= goal)).length;
}

/** Fame for earning a medal's tier (1-based); a single-tier medal pays as Gold. */
export function tierFame(medal: MedalDefinition, tier: number): number {
    return medal.goals.length === 1 ? TIER_FAME[SINGLE_TIER] : TIER_FAME[tier - 1];
}

/** The name of a medal's tier (1-based): a single-tier medal is Gold. */
export function tierName(medal: MedalDefinition, tier: number): string {
    return medal.goals.length === 1 ? TIER_NAMES[SINGLE_TIER] : TIER_NAMES[tier - 1];
}

/** The medal tiers newly reached, given the tiers already earned. */
export function newMedals(
    ctx: MedalContext,
    earned: Partial<Record<string, number>>
): { medal: MedalDefinition; tier: number }[] {
    const found: { medal: MedalDefinition; tier: number }[] = [];
    for (const medal of MEDALS) {
        const reached = tierReached(medal, medal.value(ctx));
        for (let tier = (earned[medal.id] ?? 0) + 1; tier <= reached; tier++) {
            found.push({ medal, tier });
        }
    }
    return found;
}

/** The Medal Rally rank for a number of medal tiers earned, with its title. */
export const MEDAL_RANKS: [number, string][] = [
    [0, "Newcomer"],
    [10, "Beginner"],
    [30, "Novice"],
    [60, "Elite"],
    [100, "Master"],
    [150, "Legend"]
];

export function medalRank(tiers: number): string {
    return [...MEDAL_RANKS].reverse().find(([needed]) => tiers >= needed)![1];
}

/** Each Medal Rally rank past Newcomer adds this much to every Hall of Fame entry's Fame. */
export const RANK_FAME_BONUS = 0.05;

/** The Fame multiplier a number of medal tiers earns through its Medal Rally rank. */
export function rankFameMultiplier(tiers: number): number {
    const rank = MEDAL_RANKS.filter(([needed]) => tiers >= needed).length - 1;
    return 1 + RANK_FAME_BONUS * rank;
}

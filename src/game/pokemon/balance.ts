/**
 * Every tunable number that shapes progression lives here, so the game and the balance
 * simulator (scripts/simulateProgression.ts) always agree.
 */
import type { GrowthRate, Species } from "./data";
import type { BallId, KeyItemId } from "./items";
import { BALLS, itemSprite } from "./items";
import type { BattlerStats } from "./stats";
import { attacksPerSecond, damagePerHit, maxHp, TRAINER_IV, xpForLevel, xpYield } from "./stats";
import type { TrainerDefinition } from "./trainers";
import { getSpecies } from "./data";
import type { MechanicId } from "./mechanics";
import type { ZoneExtras } from "./zones";
import { activePools } from "./zones";

/** Seconds spent looking for the next wild Pokémon. */
export const BASE_SEARCH_TIME = 2;
/** Global experience rate. The mainline curves are tuned for ~1 battle a minute, not ~20. */
export const XP_RATE = 0.0025;
export const BASE_SHINY_CHANCE = 1 / 4096;
/** Each extra catch of a species makes that species hit harder, up to a cap. */
export const DUPLICATE_BONUS_PER_CATCH = 0.02;
export const DUPLICATE_BONUS_MAX_CATCHES = 25;
/** Shiny Pokémon are a little stronger, too. */
export const SHINY_DAMAGE_BONUS = 1.2;
/** Every species registered as caught boosts the whole party's damage. */
export const DEX_DAMAGE_BONUS_PER_SPECIES = 0.003;
/** Each variant form in the Pokédex (Pinkan, regional, female, patterns...) adds +1% shiny odds. */
export const SHINY_BONUS_PER_VARIANT = 0.01;
/** The Capture Styler (Pokémon Ranger regions): catches like an Ultra Ball, with no ball used. */
export const STYLER_POWER = 2;
/** Poké Assist (Fiore's mechanic): wild-battle damage when a box Pokémon has a type advantage. */
export const POKE_ASSIST_BONUS = 1.25;
/** Max stock of each ball type; also where auto-restock tops up to. */
export const BALL_RESTOCK_TARGET = 20;

export function moneyYield(level: number): number {
    return 2 + level * 0.5;
}

/**
 * Experience for defeating a Pokémon. Low-level opponents give up to 4× extra, fading out by
 * level 20, so the first hours move quickly without making the late game trivial.
 */
export function battleXp(defeated: BattlerStats, trainerOwned = false): number {
    const earlyBoost = 1 + 3 * Math.max(0, (20 - defeated.level) / 20);
    return xpYield(defeated, trainerOwned) * earlyBoost;
}

/** What an Apricorn Ball needs to know about the catch. */
export interface BallContext {
    species: Species;
    level: number;
    /** How the wild Pokémon was found ("fishing" for the Lure Ball). */
    kind: string;
    /** The highest level in the party, for the Level Ball. */
    partyLevel: number;
    /** Whether the player already has a Pokémon of this evolution family, for the Love Ball. */
    familyOwned: boolean;
}

/**
 * A ball's effect on one catch, as [capture-rate multiplier, capture-rate bonus]. Plain balls only
 * multiply; Kurt's Apricorn Balls depend on the Pokémon (HeartGold/SoulSilver's rules).
 */
export function ballEffect(ball: BallId, ctx: BallContext): [number, number] {
    switch (ball) {
        case "levelBall": {
            const ratio = ctx.partyLevel / Math.max(1, ctx.level);
            return [ratio >= 4 ? 8 : ratio >= 2 ? 4 : ratio > 1 ? 2 : 1, 0];
        }
        case "lureBall":
            return [ctx.kind === "fishing" ? 3 : 1, 0];
        case "moonBall":
            return [ctx.species.evolutions.some(e => e.stone === "moonStone") ? 4 : 1, 0];
        case "loveBall":
            return [ctx.familyOwned ? 8 : 1, 0];
        case "fastBall":
            return [ctx.species.baseStats[5] >= 100 ? 4 : 1, 0];
        case "heavyBall": {
            const w = ctx.species.weight;
            return [1, w >= 300 ? 40 : w >= 200 ? 30 : w >= 100 ? 20 : -20];
        }
        default:
            return [BALLS[ball].catchMultiplier, 0];
    }
}

/** Catch chance with a particular ball, Apricorn effects included. */
export function ballCatchChance(ball: BallId, ctx: BallContext, bonus = 1): number {
    const [multiplier, add] = ballEffect(ball, ctx);
    return catchChance(Math.max(1, ctx.species.captureRate + add), multiplier, bonus);
}

/** Chance a thrown ball catches a defeated wild Pokémon. Softened from the mainline formula. */
export function catchChance(captureRate: number, ballMultiplier: number, bonus = 1): number {
    if (!Number.isFinite(ballMultiplier)) {
        return 1;
    }
    return Math.min(1, Math.pow((captureRate * ballMultiplier * bonus) / 255, 0.75));
}

export interface DexMilestone {
    caught: number;
    name: string;
    description: string;
    sprite: string;
}

/** Rewards Professor Oak's aides hand out as the Pokédex fills. Never lost on Hall of Fame. */
export const DEX_MILESTONES: DexMilestone[] = [
    {
        caught: 10,
        name: "Exp. Share",
        description: "+15% experience.",
        sprite: itemSprite("exp-share")
    },
    {
        caught: 20,
        name: "Amulet Coin",
        description: "+25% Pokédollars from battles.",
        sprite: itemSprite("amulet-coin")
    },
    {
        caught: 30,
        name: "Ball Restocker",
        description: "Automatically buys balls when you run low (if you can afford them).",
        sprite: itemSprite("poke-ball")
    },
    {
        caught: 40,
        name: "Lucky Egg",
        description: "+25% experience.",
        sprite: itemSprite("lucky-egg")
    },
    {
        caught: 60,
        name: "Scope Lens",
        description: "+10% damage.",
        sprite: itemSprite("scope-lens")
    },
    {
        caught: 80,
        name: "Nugget Stash",
        description: "+25% Pokédollars from battles.",
        sprite: itemSprite("nugget")
    },
    {
        caught: 100,
        name: "Oak's Letter",
        description: "+20% damage and +10% catch chance.",
        sprite: itemSprite("oaks-letter")
    },
    {
        caught: 120,
        name: "Silph Scope",
        description: "+20% experience and Pokédollars.",
        sprite: itemSprite("silph-scope")
    },
    {
        caught: 151,
        name: "Shiny Charm",
        description: "Shiny Pokémon appear three times as often.",
        sprite: itemSprite("shiny-charm")
    },
    {
        caught: 175,
        name: "Rainbow Wing",
        description: "+25% Fame from every Hall of Fame entry.",
        sprite: itemSprite("rainbow-wing")
    },
    {
        caught: 200,
        name: "Silver Wing",
        description: "+20% damage and experience.",
        sprite: itemSprite("silver-wing")
    },
    {
        caught: 250,
        name: "Poké Radar",
        description:
            "Chain grass encounters in any region: the Pokémon it locks on to turns up half the time, and is likelier to be shiny the longer the chain (up to ×6 at 40). In Sinnoh its patches bring radar-only Pokémon too.",
        sprite: itemSprite("poke-radar")
    },
    {
        caught: 300,
        name: "Destiny Knot",
        description: "The Day Care finds Eggs twice as fast.",
        sprite: itemSprite("destiny-knot")
    },
    {
        caught: 350,
        name: "Luck Incense",
        description: "+25% Pokédollars from battles.",
        sprite: itemSprite("luck-incense")
    },
    {
        caught: 400,
        name: "Expert Belt",
        description: "+20% damage.",
        sprite: itemSprite("expert-belt")
    },
    {
        caught: 450,
        name: "Azure Flute",
        description: "+25% Fame from every Hall of Fame entry.",
        sprite: itemSprite("azure-flute")
    },
    {
        caught: 480,
        name: "Life Orb",
        description: "+20% damage and experience.",
        sprite: itemSprite("life-orb")
    },
    {
        caught: 500,
        name: "Liberty Pass",
        description:
            "Professor Juniper's ticket to Liberty Garden: every Unova (Black/White) journey can meet Victini there, past the Insect Badge.",
        sprite: itemSprite("liberty-pass")
    },
    {
        caught: 520,
        name: "Oval Charm",
        description: "The Day Care finds Eggs 25% faster.",
        sprite: itemSprite("oval-charm")
    },
    {
        caught: 540,
        name: "Muscle Band",
        description: "+20% damage.",
        sprite: itemSprite("muscle-band")
    },
    {
        caught: 560,
        name: "Wise Glasses",
        description: "+20% experience.",
        sprite: itemSprite("wise-glasses")
    },
    {
        caught: 580,
        name: "Big Nugget",
        description: "+25% Pokédollars from battles.",
        sprite: itemSprite("big-nugget")
    },
    {
        caught: 600,
        name: "Pass Orb",
        description: "+25% Fame from every Hall of Fame entry.",
        sprite: itemSprite("pass-orb")
    },
    {
        caught: 620,
        name: "Dream Ball",
        description: "+20% catch chance.",
        sprite: itemSprite("dream-ball")
    },
    {
        caught: 649,
        name: "Comet Shard",
        description:
            "Every species, #1 to #649: +25% damage, experience and Fame from every Hall of Fame entry.",
        sprite: itemSprite("comet-shard")
    }
];

export function hasMilestone(dexCaught: number, name: string): boolean {
    return DEX_MILESTONES.some(m => m.name === name && dexCaught >= m.caught);
}

export interface UpgradeDefinition {
    id: string;
    /** Only offered once this generation mechanic is unlocked (the Day Care, Contests). */
    mechanic?: MechanicId;
    name: string;
    description: string;
    baseCost: number;
    costGrowth: number;
    maxLevel: number;
    badgesRequired: number;
    sprite: string;
    /**
     * Mastery: levels past maxLevel, each with a smaller effect, at prices that keep rising
     * (MASTERY_COST_GROWTH a level), so a finished upgrade still has somewhere to go.
     */
    mastery?: { levels: number; description: string };
    /** Hall of Fame entries needed before it's offered (the Journey page's late-game upgrades). */
    entriesRequired?: number;
    /** The Hall of Fame page it's listed on (default: battle, or mechanics with a mechanic). */
    tab?: UpgradeTab;
    /** What its levels do right now, e.g. "−50% search time". */
    effect?: (level: number) => string;
}

export type UpgradeTab = "battle" | "catching" | "journey" | "mechanics";

/**
 * The Journey page's new upgrades (Starter Kit, Mart Membership, Exp. All, Fan Club) open after
 * this many Hall of Fame entries: earlier, they drew Fame away from Champion's Might and the
 * simulator's Johto took 40% longer.
 */
export const JOURNEY_UPGRADE_ENTRIES = 4;

/** Each Mastery level costs this much more than the one before. */
export const MASTERY_COST_GROWTH = 1.4;
/** The share of an upgrade's Fame a refund gives back. */
export const REFUND_SHARE = 0.9;

export function upgradeCost(upgrade: UpgradeDefinition, level: number): number {
    if (level < upgrade.maxLevel) {
        return Math.round(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
    }
    return Math.round(
        upgrade.baseCost *
            Math.pow(upgrade.costGrowth, upgrade.maxLevel) *
            Math.pow(MASTERY_COST_GROWTH, level - upgrade.maxLevel)
    );
}

/** The highest level an upgrade can reach, Mastery included. */
export function upgradeTopLevel(upgrade: UpgradeDefinition): number {
    return upgrade.maxLevel + (upgrade.mastery?.levels ?? 0);
}

/** Fame spent on an upgrade's levels so far (what a refund is worked out from). */
export function upgradeSpent(upgrade: UpgradeDefinition, level: number): number {
    let total = 0;
    for (let i = 0; i < level; i++) total += upgradeCost(upgrade, i);
    return total;
}

/** An additive bonus: `per` a level up to `max`, then `mastery` a Mastery level. */
function tiered(level = 0, max: number, per: number, mastery: number): number {
    return per * Math.min(level, max) + mastery * Math.max(0, level - max);
}

/** A reduction: −`per` a level up to `max`, then ×0.95 a Mastery level. */
function shrinking(level = 0, max: number, per: number): number {
    return (1 - per * Math.min(level, max)) * Math.pow(0.95, Math.max(0, level - max));
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

/**
 * What each Fame upgrade's levels do, Mastery included. Everything that reads a Fame upgrade
 * goes through these, so the game, the simulator and the shop's "Now:" line agree.
 */
export const FAME_EFFECTS = {
    /** Search time multiplier (Scouting Network). */
    scout: (level?: number) => shrinking(level, 5, 0.1),
    /** Catch chance multiplier (Catching Technique). */
    catcher: (level?: number) => 1 + tiered(level, 10, 0.1, 0.05),
    /** Shiny chance multiplier (Shiny Hunter). */
    shinyHunter: (level?: number) => 1 + tiered(level, 10, 0.5, 0.25),
    /** Wild battles per Day Care Egg multiplier (Flame Body). */
    flameBody: (level?: number) => shrinking(level, 5, 0.1),
    /** Egg shiny chance multiplier (Masuda Method). */
    masudaMethod: (level?: number) => 1 + tiered(level, 6, 0.5, 0.25),
    /** Condition each Pokéblock adds (Pokéblock Kit). */
    pokeblockGain: (level?: number) => 10 + tiered(level, 4, 5, 2),
    /** Contest win chance bonus (Contest Star). */
    contestChance: (level?: number) => tiered(level, 5, 0.05, 0.02),
    /** Contest time multiplier (Contest Star). */
    contestTime: (level?: number) => shrinking(level, 5, 0.1),
    /** Phenomenon chance multiplier (Encounter Power). */
    encounterPower: (level?: number) => 1 + tiered(level, 4, 0.25, 0.1),
    /** Critical capture chance multiplier (Capture Power). */
    capturePower: (level?: number) => 1 + tiered(level, 4, 0.25, 0.1),
    /** In-season experience and money bonus (Season Power). */
    seasonPower: (level?: number) => tiered(level, 5, 0.1, 0.05),
    /** Wild battles per Hidden Grotto multiplier (Grotto Power). */
    grottoPower: (level?: number) => shrinking(level, 5, 0.1),
    /** Extra starting levels (Head Start). */
    headStart: (level?: number) => 5 * Math.min(level ?? 0, 3),
    /** Hall of Fame Fame multiplier (Pokémon Fan Club). */
    fanClub: (level?: number) => 1 + 0.03 * (level ?? 0),
    /** Money and Poké Balls a journey starts with (Starter Kit). */
    starterMoney: (level?: number) => 1000 * (level ?? 0),
    starterBalls: (level?: number) => 10 * (level ?? 0),
    /** Share of the party's experience box Pokémon get (Exp. All). */
    expAll: (level?: number) => 0.05 * (level ?? 0),
    /** Shiny chance bonus per Egg of the species hatched before, up to 25 (Breeder's Lineage). */
    lineage: (level?: number) => 0.02 * (level ?? 0),
    /** Poké Mart price multiplier (Mart Membership). */
    martPrice: (level?: number) => 1 - 0.05 * (level ?? 0)
};

/** Eggs of a species that still raise Breeder's Lineage's bonus. */
export const LINEAGE_MAX_EGGS = 25;

/** Pokédollar upgrades sold at the Poké Mart. Reset on Hall of Fame. */
export const MART_UPGRADES = {
    protein: {
        id: "protein",
        name: "Protein",
        description: "+5% damage per level.",
        baseCost: 300,
        costGrowth: 1.3,
        maxLevel: 200,
        badgesRequired: 0,
        sprite: itemSprite("protein")
    },
    rareCandy: {
        id: "rareCandy",
        name: "Rare Candy",
        description: "+10% experience per level.",
        baseCost: 250,
        costGrowth: 1.5,
        maxLevel: 30,
        badgesRequired: 1,
        sprite: itemSprite("rare-candy")
    },
    payDay: {
        id: "payDay",
        name: "Coin Case",
        description: "+10% Pokédollars per level.",
        baseCost: 400,
        costGrowth: 1.55,
        maxLevel: 25,
        badgesRequired: 1,
        sprite: itemSprite("coin-case")
    },
    iron: {
        id: "iron",
        name: "Iron",
        description: "+5% party HP per level.",
        baseCost: 300,
        costGrowth: 1.3,
        maxLevel: 200,
        badgesRequired: 0,
        sprite: itemSprite("iron")
    },
    repel: {
        id: "repel",
        name: "Max Repel",
        description: "Weak Pokémon avoid you: -8% search time per level.",
        baseCost: 1000,
        costGrowth: 2.2,
        maxLevel: 5,
        badgesRequired: 2,
        sprite: itemSprite("max-repel")
    }
} satisfies Record<string, UpgradeDefinition>;
export type MartUpgradeId = keyof typeof MART_UPGRADES;
export const MART_UPGRADE_LIST = Object.values(MART_UPGRADES) as (UpgradeDefinition & {
    id: MartUpgradeId;
})[];

/** Upgrades bought with Fame in the Hall of Fame. Permanent. */
export const HOF_UPGRADES = {
    power: {
        id: "power",
        name: "Champion's Might",
        description: "+10% damage and party HP per level.",
        baseCost: 5,
        costGrowth: 1.5,
        maxLevel: 50,
        badgesRequired: 0,
        sprite: itemSprite("x-attack"),
        effect: level => `+${level * 10}% damage and HP`
    },
    wisdom: {
        id: "wisdom",
        name: "Veteran's Wisdom",
        description: "+10% experience per level.",
        baseCost: 5,
        costGrowth: 1.5,
        maxLevel: 50,
        badgesRequired: 0,
        sprite: itemSprite("exp-share"),
        effect: level => `+${level * 10}% experience`
    },
    fortune: {
        id: "fortune",
        name: "Sponsorship",
        description: "+10% Pokédollars per level.",
        baseCost: 5,
        costGrowth: 1.5,
        maxLevel: 50,
        badgesRequired: 0,
        sprite: itemSprite("nugget"),
        effect: level => `+${level * 10}% Pokédollars`
    },
    scout: {
        id: "scout",
        name: "Scouting Network",
        description: "-10% search time per level.",
        baseCost: 3,
        costGrowth: 2,
        maxLevel: 5,
        badgesRequired: 0,
        sprite: itemSprite("dowsing-machine"),
        mastery: {
            levels: 10,
            description: "Mastery: each level cuts the search time by another 5%."
        },
        effect: level => `-${pct(1 - FAME_EFFECTS.scout(level))} search time`
    },
    headStart: {
        id: "headStart",
        name: "Head Start",
        description: "Your starter begins each journey 5 levels higher per level.",
        baseCost: 2,
        costGrowth: 2,
        maxLevel: 3,
        badgesRequired: 0,
        sprite: itemSprite("rare-candy"),
        tab: "journey",
        effect: level => `+${FAME_EFFECTS.headStart(level)} starting levels`
    },
    starterKit: {
        id: "starterKit",
        name: "Starter Kit",
        description: "Each journey begins with ₽1,000 and 10 Poké Balls more per level.",
        baseCost: 5,
        costGrowth: 2.2,
        maxLevel: 5,
        badgesRequired: 0,
        sprite: itemSprite("poke-ball"),
        entriesRequired: JOURNEY_UPGRADE_ENTRIES,
        tab: "journey",
        effect: level =>
            `₽${FAME_EFFECTS.starterMoney(level).toLocaleString()} and ${FAME_EFFECTS.starterBalls(level)} Poké Balls`
    },
    martMembership: {
        id: "martMembership",
        name: "Mart Membership",
        description:
            "-5% Poké Mart prices (Poké Balls, evolution items and Mart upgrades) per level.",
        baseCost: 8,
        costGrowth: 2,
        maxLevel: 6,
        badgesRequired: 0,
        sprite: itemSprite("discount-coupon"),
        entriesRequired: JOURNEY_UPGRADE_ENTRIES,
        tab: "journey",
        effect: level => `-${pct(1 - FAME_EFFECTS.martPrice(level))} Poké Mart prices`
    },
    expAll: {
        id: "expAll",
        name: "Exp. All",
        description:
            "Box Pokémon outside the party get 5% of the party's experience per level (up to the level cap).",
        baseCost: 8,
        costGrowth: 2,
        maxLevel: 5,
        badgesRequired: 0,
        sprite: itemSprite("lucky-punch"),
        entriesRequired: JOURNEY_UPGRADE_ENTRIES,
        tab: "journey",
        effect: level => `box Pokémon get ${pct(FAME_EFFECTS.expAll(level))} of the experience`
    },
    fanClub: {
        id: "fanClub",
        name: "Pokémon Fan Club",
        description: "Your fans spread the word: +3% Fame from every Hall of Fame entry per level.",
        baseCost: 25,
        costGrowth: 1.6,
        maxLevel: 20,
        badgesRequired: 0,
        sprite: itemSprite("fame-checker"),
        entriesRequired: JOURNEY_UPGRADE_ENTRIES,
        tab: "journey",
        effect: level => `+${pct(FAME_EFFECTS.fanClub(level) - 1)} Fame`
    },
    catcher: {
        id: "catcher",
        name: "Catching Technique",
        description: "+10% catch chance per level.",
        baseCost: 2,
        costGrowth: 1.8,
        maxLevel: 10,
        badgesRequired: 0,
        sprite: itemSprite("great-ball"),
        tab: "catching",
        mastery: { levels: 20, description: "Mastery: +5% catch chance per level." },
        effect: level => `+${pct(FAME_EFFECTS.catcher(level) - 1)} catch chance`
    },
    shinyHunter: {
        id: "shinyHunter",
        name: "Shiny Hunter",
        description: "+50% shiny chance per level.",
        baseCost: 5,
        costGrowth: 2,
        maxLevel: 10,
        badgesRequired: 0,
        sprite: itemSprite("shiny-stone"),
        tab: "catching",
        mastery: { levels: 20, description: "Mastery: +25% shiny chance per level." },
        effect: level => `×${FAME_EFFECTS.shinyHunter(level)} shiny chance`
    },
    roddysRod: {
        id: "roddysRod",
        name: "Roddy's Old Rod",
        description:
            "Roddy Tackle from Magikarp Jump tunes up your rod: Magikarp can bite with Magikarp Jump patterns. Each level hooks the next rod's patterns.",
        baseCost: 3,
        costGrowth: 2,
        maxLevel: 7,
        badgesRequired: 0,
        sprite: itemSprite("old-rod"),
        tab: "catching",
        effect: level => `${level} of 7 rods' patterns`
    },
    flameBody: {
        id: "flameBody",
        name: "Flame Body",
        description:
            "A warm Pokémon keeps the Day Care's Eggs cozy: -10% wild battles per Egg per level.",
        baseCost: 3,
        costGrowth: 2,
        maxLevel: 5,
        badgesRequired: 0,
        mechanic: "breeding",
        sprite: itemSprite("fire-stone"),
        mastery: {
            levels: 5,
            description: "Mastery: each level cuts the wild battles per Egg by another 5%."
        },
        effect: level => `-${pct(1 - FAME_EFFECTS.flameBody(level))} wild battles per Egg`
    },
    masudaMethod: {
        id: "masudaMethod",
        name: "Masuda Method",
        description:
            "Eggs from far-off parents: Day Care Eggs are +50% likelier to be shiny per level (shiny parents too).",
        baseCost: 4,
        costGrowth: 2,
        maxLevel: 6,
        badgesRequired: 0,
        mechanic: "breeding",
        sprite: itemSprite("shiny-stone"),
        mastery: { levels: 10, description: "Mastery: +25% shiny Eggs per level." },
        effect: level => `×${FAME_EFFECTS.masudaMethod(level)} shiny Eggs`
    },
    breederLineage: {
        id: "breederLineage",
        name: "Breeder's Lineage",
        description: `Every Egg of a species you've hatched before makes its next Eggs +2% likelier to be shiny per level (up to ${LINEAGE_MAX_EGGS} Eggs).`,
        baseCost: 4,
        costGrowth: 2,
        maxLevel: 5,
        badgesRequired: 0,
        mechanic: "breeding",
        sprite: itemSprite("oval-charm"),
        effect: level =>
            `+${pct(FAME_EFFECTS.lineage(level))} shiny Eggs per Egg before (up to ×${1 + FAME_EFFECTS.lineage(level) * LINEAGE_MAX_EGGS})`
    },
    pokeblockKit: {
        id: "pokeblockKit",
        name: "Pokéblock Kit",
        description: "Richer Berries: each Pokéblock raises a condition by +5 more per level.",
        baseCost: 3,
        costGrowth: 2,
        maxLevel: 4,
        badgesRequired: 0,
        mechanic: "contests",
        sprite: itemSprite("pokeblock-case"),
        mastery: { levels: 5, description: "Mastery: +2 more condition per Pokéblock per level." },
        effect: level => `+${FAME_EFFECTS.pokeblockGain(level)} condition per Pokéblock`
    },
    contestStar: {
        id: "contestStar",
        name: "Contest Star",
        description: "+5% chance to win each contest and -10% contest time per level.",
        baseCost: 3,
        costGrowth: 2,
        maxLevel: 5,
        badgesRequired: 0,
        mechanic: "contests",
        sprite: itemSprite("contest-pass"),
        mastery: {
            levels: 5,
            description:
                "Mastery: +2% win chance per level, and each cuts contest time by another 5%."
        },
        effect: level =>
            `+${pct(FAME_EFFECTS.contestChance(level))} win chance, -${pct(1 - FAME_EFFECTS.contestTime(level))} contest time`
    },
    encounterPower: {
        id: "encounterPower",
        name: "Encounter Power",
        description:
            "A Pass Power: phenomena (shaking grass, rippling water) happen +25% more often per level.",
        baseCost: 4,
        costGrowth: 2,
        maxLevel: 4,
        badgesRequired: 0,
        mechanic: "phenomena",
        sprite: itemSprite("pretty-wing"),
        mastery: { levels: 6, description: "Mastery: +10% more phenomena per level." },
        effect: level => `×${FAME_EFFECTS.encounterPower(level).toFixed(2)} phenomena`
    },
    capturePower: {
        id: "capturePower",
        name: "Capture Power",
        description: "A Pass Power: critical captures happen +25% more often per level.",
        baseCost: 4,
        costGrowth: 2,
        maxLevel: 4,
        badgesRequired: 0,
        mechanic: "criticalCapture",
        sprite: itemSprite("dream-ball"),
        mastery: { levels: 6, description: "Mastery: +10% more critical captures per level." },
        effect: level => `×${FAME_EFFECTS.capturePower(level).toFixed(2)} critical captures`
    },
    seasonPower: {
        id: "seasonPower",
        name: "Season Power",
        description:
            "In-season wild Pokémon (the season's types) give +10% experience and Pokédollars per level.",
        baseCost: 4,
        costGrowth: 2,
        maxLevel: 5,
        badgesRequired: 0,
        mechanic: "seasons",
        sprite: itemSprite("gracidea"),
        mastery: { levels: 10, description: "Mastery: +5% more per level." },
        effect: level => `+${pct(FAME_EFFECTS.seasonPower(level))} from in-season Pokémon`
    },
    grottoPower: {
        id: "grottoPower",
        name: "Grotto Power",
        description: "Hidden Grottoes fill in 10% fewer wild battles per level.",
        baseCost: 4,
        costGrowth: 2,
        maxLevel: 5,
        badgesRequired: 0,
        mechanic: "hiddenGrottoes",
        sprite: itemSprite("dowsing-machine"),
        mastery: {
            levels: 5,
            description: "Mastery: each level cuts the wild battles per grotto by another 5%."
        },
        effect: level => `-${pct(1 - FAME_EFFECTS.grottoPower(level))} wild battles per grotto`
    }
} satisfies Record<string, UpgradeDefinition>;
export type HofUpgradeId = keyof typeof HOF_UPGRADES;
export const HOF_UPGRADE_LIST = Object.values(HOF_UPGRADES) as (UpgradeDefinition & {
    id: HofUpgradeId;
})[];

export interface BonusInputs {
    dexCaught: number;
    shinyCaught: number;
    /** Variant forms in the Pokédex: each makes shinies a little more common. */
    variantsCaught?: number;
    mart: Partial<Record<MartUpgradeId, number>>;
    hof: Partial<Record<HofUpgradeId, number>>;
    keyItems: Partial<Record<KeyItemId, boolean>>;
}

export interface Bonuses {
    damage: number;
    hp: number;
    xp: number;
    money: number;
    catch: number;
    shiny: number;
    searchTime: number;
    autoRestock: boolean;
}

export function computeBonuses(input: BonusInputs): Bonuses {
    const { dexCaught, mart, hof, keyItems } = input;
    const lvl = (n: number | undefined) => n ?? 0;
    const milestone = (name: string) => hasMilestone(dexCaught, name);

    const damage =
        (1 + dexCaught * DEX_DAMAGE_BONUS_PER_SPECIES) *
        (1 + 0.05 * lvl(mart.protein)) *
        (milestone("Scope Lens") ? 1.1 : 1) *
        (milestone("Oak's Letter") ? 1.2 : 1) *
        (milestone("Silver Wing") ? 1.2 : 1) *
        (milestone("Expert Belt") ? 1.2 : 1) *
        (milestone("Life Orb") ? 1.2 : 1) *
        (milestone("Muscle Band") ? 1.2 : 1) *
        (milestone("Comet Shard") ? 1.25 : 1) *
        (1 + 0.1 * lvl(hof.power));
    const hp = (1 + 0.05 * lvl(mart.iron)) * (1 + 0.1 * lvl(hof.power));
    const xp =
        XP_RATE *
        (1 + 0.1 * lvl(mart.rareCandy)) *
        (milestone("Exp. Share") ? 1.15 : 1) *
        (milestone("Lucky Egg") ? 1.25 : 1) *
        (milestone("Silph Scope") ? 1.2 : 1) *
        (milestone("Silver Wing") ? 1.2 : 1) *
        (milestone("Life Orb") ? 1.2 : 1) *
        (milestone("Wise Glasses") ? 1.2 : 1) *
        (milestone("Comet Shard") ? 1.25 : 1) *
        (1 + 0.1 * lvl(hof.wisdom));
    const money =
        (1 + 0.1 * lvl(mart.payDay)) *
        (milestone("Amulet Coin") ? 1.25 : 1) *
        (milestone("Nugget Stash") ? 1.25 : 1) *
        (milestone("Silph Scope") ? 1.2 : 1) *
        (milestone("Luck Incense") ? 1.25 : 1) *
        (milestone("Big Nugget") ? 1.25 : 1) *
        (1 + 0.1 * lvl(hof.fortune));
    const catchBonus =
        (milestone("Oak's Letter") ? 1.1 : 1) *
        (milestone("Dream Ball") ? 1.2 : 1) *
        FAME_EFFECTS.catcher(hof.catcher);
    const shiny =
        (milestone("Shiny Charm") ? 3 : 1) *
        FAME_EFFECTS.shinyHunter(hof.shinyHunter) *
        (1 + SHINY_BONUS_PER_VARIANT * (input.variantsCaught ?? 0));
    const searchTime =
        (BASE_SEARCH_TIME / (keyItems.bicycle ? 2 : 1)) *
        (1 - 0.08 * lvl(mart.repel)) *
        FAME_EFFECTS.scout(hof.scout);

    return {
        damage,
        hp,
        xp,
        money,
        catch: catchBonus,
        shiny,
        searchTime,
        autoRestock: milestone("Ball Restocker")
    };
}

export interface PartyBattler extends BattlerStats {
    /** Per-Pokémon damage multiplier (shiny, duplicate catches). */
    multiplier: number;
}

export function memberMultiplier(shiny: boolean, timesCaught: number): number {
    const extraCatches = Math.min(Math.max(0, timesCaught - 1), DUPLICATE_BONUS_MAX_CATCHES);
    return (shiny ? SHINY_DAMAGE_BONUS : 1) * (1 + extraCatches * DUPLICATE_BONUS_PER_CATCH);
}

/**
 * Experience earned at the level cap isn't wasted: it becomes Effort, a damage bonus of +25%
 * per square root of a level's worth of experience. Grinding against a tough trainer always
 * makes progress, just more slowly the longer it goes on.
 */
export const EFFORT_BONUS = 0.25;
export function effortMultiplier(growthRate: GrowthRate, level: number, effort: number): number {
    if (effort <= 0) return 1;
    const from = Math.min(level, 99);
    const perLevel = Math.max(1, xpForLevel(growthRate, from + 1) - xpForLevel(growthRate, from));
    return 1 + EFFORT_BONUS * Math.sqrt(effort / perLevel);
}

/** Damage per second each party member deals to the target. */
export function memberDps(member: PartyBattler, target: BattlerStats, damageBonus: number) {
    return (
        damagePerHit(member, target) *
        attacksPerSecond(member.species) *
        member.multiplier *
        damageBonus
    );
}

/**
 * Picks the party member to send out against a target: the one with the best trade of
 * (time the enemy needs to faint it) vs (time it needs to faint the enemy).
 * Pass `hp` as null for wild battles, where only damage output matters.
 */
export function bestMatchup(
    party: PartyBattler[],
    target: BattlerStats,
    damageBonus: number,
    hp: number[] | null
): number {
    let best = -1;
    let bestScore = -Infinity;
    party.forEach((member, i) => {
        if (hp != null && hp[i] <= 0) {
            return;
        }
        const ours = memberDps(member, target, damageBonus);
        let score = ours;
        if (hp != null) {
            const theirs = damagePerHit(target, member) * attacksPerSecond(target.species);
            score = theirs > 0 ? (hp[i] * ours) / theirs : Infinity;
        }
        if (score > bestScore) {
            best = i;
            bestScore = score;
        }
    });
    return best;
}

/**
 * Double battles (Hoenn's generation mechanic): a partner fights beside the active Pokémon. It's
 * the strongest other member still standing; it attacks the same target, isn't attacked, and
 * lands this share of its usual damage (it supports more than it leads).
 */
export const PARTNER_DAMAGE = 0.5;

export function battlePartner(
    party: PartyBattler[],
    target: BattlerStats,
    damageBonus: number,
    active: number,
    hp: number[] | null
): number {
    let best = -1;
    let bestDps = 0;
    party.forEach((member, i) => {
        if (i === active || (hp != null && hp[i] <= 0)) return;
        const dps = memberDps(member, target, damageBonus);
        if (dps > bestDps) {
            best = i;
            bestDps = dps;
        }
    });
    return best;
}

/**
 * Damage per second against this wild Pokémon: whoever is sent out, plus a partner in double
 * battles.
 */
export function wildDps(
    party: PartyBattler[],
    target: BattlerStats,
    damageBonus: number,
    doubles = false
) {
    const index = bestMatchup(party, target, damageBonus, null);
    if (index === -1) return 0;
    const partner = doubles ? battlePartner(party, target, damageBonus, index, null) : -1;
    return (
        memberDps(party[index], target, damageBonus) +
        (partner === -1 ? 0 : PARTNER_DAMAGE * memberDps(party[partner], target, damageBonus))
    );
}

export function trainerBattler(
    pokemon: { id: number; level: number },
    statMultiplier = 1
): BattlerStats {
    return {
        species: getSpecies(pokemon.id),
        level: pokemon.level,
        iv: TRAINER_IV,
        statMultiplier
    };
}

export function trainerTeam(trainer: Pick<TrainerDefinition, "team" | "statMultiplier">) {
    return trainer.team.map(p => trainerBattler(p, trainer.statMultiplier));
}

export interface TrainerBattleState {
    /** Index into the enemy team of the Pokémon currently battling. */
    enemyIndex: number;
    enemyHp: number;
    /** Index into the party of the Pokémon currently battling, or -1 before one is picked. */
    active: number;
    /** Remaining HP of each party member, in party order. */
    partyHp: number[];
    elapsed: number;
    /** In double battles, the party member fighting beside the active one (-1 for none). */
    partner?: number;
}

/** Who fights two at a time: the player (the double battles mechanic) and the trainer. */
export interface BattleRules {
    doubles?: boolean;
    enemyDoubles?: boolean;
}

export interface TrainerBattleOutcome {
    won: boolean;
    /** Seconds the battle lasted. */
    time: number;
    reason: "victory" | "fainted" | "timeout";
    /** Party HP left, as a fraction of the total. */
    hpRemaining: number;
    state: TrainerBattleState;
}

export function partyMaxHp(party: PartyBattler[], hpBonus: number): number[] {
    return party.map(member => Math.round(maxHp(member) * hpBonus));
}

export function initialTrainerBattle(
    party: PartyBattler[],
    enemies: BattlerStats[],
    hpBonus: number
): TrainerBattleState {
    return {
        enemyIndex: 0,
        enemyHp: enemies.length > 0 ? maxHp(enemies[0]) : 0,
        active: -1,
        partyHp: partyMaxHp(party, hpBonus),
        elapsed: 0
    };
}

/**
 * Advances a two-sided battle by up to `dt` seconds. One Pokémon from each side battles at a
 * time; the player's side sends out its best matchup whenever a new opponent appears or its
 * active Pokémon faints. In double battles a partner attacks beside it, and a double-battle
 * trainer's next Pokémon attacks from the field too. Damage is continuous and solved
 * event-by-event, so the result is exact for any step size (the real-time battle and the
 * forecast always agree).
 */
export function stepTrainerBattle(
    party: PartyBattler[],
    enemies: BattlerStats[],
    state: TrainerBattleState,
    damageBonus: number,
    dt: number,
    timeLimit = Infinity,
    rules: BattleRules = {}
): { state: TrainerBattleState; done: TrainerBattleOutcome["reason"] | null } {
    let { enemyIndex, enemyHp, active, elapsed } = state;
    let partner = state.partner ?? -1;
    const partyHp = [...state.partyHp];
    let remaining = Math.min(dt, timeLimit - elapsed);
    const snapshot = () => ({ enemyIndex, enemyHp, active, partyHp, elapsed, partner });

    for (;;) {
        if (enemyIndex >= enemies.length) {
            return { state: snapshot(), done: "victory" };
        }
        const enemy = enemies[enemyIndex];
        if (active === -1 || partyHp[active] <= 0) {
            active = bestMatchup(party, enemy, damageBonus, partyHp);
        }
        if (active === -1) {
            return { state: snapshot(), done: "fainted" };
        }
        if (elapsed >= timeLimit) {
            return { state: snapshot(), done: "timeout" };
        }
        if (remaining <= 0) {
            return { state: snapshot(), done: null };
        }

        const member = party[active];
        partner =
            rules.doubles === true ? battlePartner(party, enemy, damageBonus, active, partyHp) : -1;
        const ourDps =
            memberDps(member, enemy, damageBonus) +
            (partner === -1 ? 0 : PARTNER_DAMAGE * memberDps(party[partner], enemy, damageBonus));
        const second = rules.enemyDoubles === true ? enemies[enemyIndex + 1] : undefined;
        const theirDps =
            damagePerHit(enemy, member) * attacksPerSecond(enemy.species) +
            (second == null ? 0 : damagePerHit(second, member) * attacksPerSecond(second.species));

        const toKillEnemy = ourDps > 0 ? enemyHp / ourDps : Infinity;
        const toLoseActive = theirDps > 0 ? partyHp[active] / theirDps : Infinity;
        const step = Math.min(toKillEnemy, toLoseActive, remaining);

        enemyHp -= ourDps * step;
        partyHp[active] -= theirDps * step;
        elapsed += step;
        remaining -= step;

        const enemyFainted = step === toKillEnemy || enemyHp <= 1e-9;
        const activeFainted = step === toLoseActive || partyHp[active] <= 1e-9;
        if (activeFainted) {
            partyHp[active] = 0;
        }
        if (enemyFainted) {
            enemyIndex++;
            enemyHp = enemyIndex < enemies.length ? maxHp(enemies[enemyIndex]) : 0;
        }
        if (enemyFainted || activeFainted) {
            // Send out the best matchup against whoever is on the field now.
            active = -1;
        }
    }
}

/** Resolves a whole trainer battle instantly. The game's real-time battles match this exactly. */
export function simulateTrainerBattle(
    party: PartyBattler[],
    trainer: Pick<TrainerDefinition, "team" | "timeLimit" | "statMultiplier" | "doubles">,
    damageBonus: number,
    hpBonus: number,
    doubles = false
): TrainerBattleOutcome {
    const enemies = trainerTeam(trainer);
    const start = initialTrainerBattle(party, enemies, hpBonus);
    const { state, done } = stepTrainerBattle(
        party,
        enemies,
        start,
        damageBonus,
        Infinity,
        trainer.timeLimit,
        { doubles, enemyDoubles: trainer.doubles === true }
    );
    const total = start.partyHp.reduce((a, b) => a + b, 0);
    const left = state.partyHp.reduce((a, b) => a + Math.max(0, b), 0);
    return {
        won: done === "victory",
        time: state.elapsed,
        reason: done ?? "timeout",
        hpRemaining: total > 0 ? left / total : 0,
        state
    };
}

export interface FameInputs {
    /** The region's base Fame. */
    regionFame: number;
    dexCaught: number;
    shinyCaught: number;
    /** Species in the clearing team that have never been enshrined before. */
    newSpecies: number;
    /** True the first time this region is cleared. */
    firstClear: boolean;
    /** Rematch strength of the region's trainers; tougher rematches pay more. */
    rematch?: number;
    /** Extra Fame earned this journey (the Distortion World's ×1.25). */
    bonus?: number;
    /** The journey's challenges' Fame multiplier. */
    challenge?: number;
    /** The Medal Rally rank's Fame multiplier. */
    medals?: number;
    /** Pokémon Fan Club's level (Fame upgrade). */
    fanClub?: number;
}

/** Fame for enshrining a team. New faces in the Hall of Fame are worth the most. */
export function fameGain(input: FameInputs): number {
    const base =
        input.regionFame +
        Math.floor(input.dexCaught / 5) +
        input.shinyCaught * 2 +
        input.newSpecies * FAME_PER_NEW_SPECIES;
    const multiplier =
        (input.firstClear ? 1.5 : 1) *
        (input.rematch ?? 1) *
        (input.bonus ?? 1) *
        (hasMilestone(input.dexCaught, "Rainbow Wing") ? 1.25 : 1) *
        (hasMilestone(input.dexCaught, "Azure Flute") ? 1.25 : 1) *
        (hasMilestone(input.dexCaught, "Pass Orb") ? 1.25 : 1) *
        (hasMilestone(input.dexCaught, "Comet Shard") ? 1.25 : 1) *
        (input.challenge ?? 1) *
        (input.medals ?? 1) *
        FAME_EFFECTS.fanClub(input.fanClub);
    return Math.max(1, Math.floor(base * multiplier));
}

export const FAME_PER_NEW_SPECIES = 5;

export type AutomationId =
    | "autoShop"
    | "autoClaim"
    | "autoEvolve"
    | "autoParty"
    | "autoTravel"
    | "autoChallenge"
    | "autoPoketch"
    | "autoCGear"
    | "autoContest";

export interface AutomationDefinition {
    id: AutomationId;
    name: string;
    description: string;
    cost: number;
    sprite: string;
    /** Only offered once this generation mechanic is unlocked. */
    mechanic?: MechanicId;
}

/** Where the Travel Planner takes you. */
export type TravelMode = "balanced" | "catchAll" | "pokedex" | "train";

export const TRAVEL_MODES: [TravelMode, string, string][] = [
    [
        "balanced",
        "Balanced",
        "The newest place with Pokémon you haven't caught this journey, unless they're far below your party; otherwise the toughest place your party handles."
    ],
    [
        "catchAll",
        "Catch 'em all",
        "Wherever you meet Pokémon not in your box this journey fastest (forms too, Pokédex newcomers first), at any level your party can beat. Then Balanced."
    ],
    [
        "pokedex",
        "Pokédex",
        "Only Pokémon and forms your Pokédex is missing, wherever you meet them fastest. Then Balanced."
    ],
    [
        "train",
        "Train",
        "Wherever your party earns the most experience per minute (Effort past the level cap)."
    ]
];

/** One-time Fame purchases that play parts of the game for you. Each can be toggled off. */
export const AUTOMATIONS: AutomationDefinition[] = [
    {
        id: "autoShop",
        name: "Shopping List",
        description:
            "Keeps every Poké Mart ball stocked (Kurt's Apricorn Balls too, once unlocked), buys the cheapest Poké Mart upgrade, and pays for Johto's Bug-Catching Contest and swarms, when you can easily afford them.",
        cost: 5,
        sprite: itemSprite("coin-case")
    },
    {
        id: "autoClaim",
        name: "Pokégear Contacts",
        description: "Collects gifts and makes in-game trades as soon as they're available.",
        cost: 5,
        sprite: itemSprite("town-map")
    },
    {
        id: "autoEvolve",
        name: "Evolution Planner",
        description:
            "Uses evolution stones and the Link Cable on new evolutions, buying them when you can afford it, and purifies Shadow Pokémon whose hearts have opened.",
        cost: 8,
        sprite: itemSprite("moon-stone")
    },
    {
        id: "autoParty",
        name: "Team Strategist",
        description:
            "Keeps the Pokémon that best counter your next opponent in your party. It can train the bench between battles (Pokémon below the level cap take the spare places), and for the finale bring Pokémon new to this region's Hall of Fame, as many as you choose.",
        cost: 10,
        sprite: itemSprite("exp-share")
    },
    {
        id: "autoTravel",
        name: "Travel Planner",
        description:
            "Moves to the best place for what you're after: steady progress, every Pokémon not in your box, only Pokédex newcomers, or the most experience.",
        cost: 12,
        sprite: itemSprite("bicycle")
    },
    {
        id: "autoChallenge",
        name: "League Pass",
        description:
            "Challenges the next Gym, quest or finale as soon as the forecast says you'll win, and legendary Pokémon you've caught before and bosses you've beaten before too. After the finale, it defends your title when the Team Strategist's party would bring more new faces to the Hall of Fame.",
        cost: 15,
        sprite: itemSprite("gold-teeth")
    },
    {
        id: "autoPoketch",
        name: "Pokétch",
        description:
            "Sinnoh's wrist watch: slathers Honey on every open Honey Tree and shakes the ones with a Pokémon waiting, and digs the Underground's walls as they appear (once the Underground is unlocked).",
        cost: 15,
        sprite: itemSprite("explorer-kit")
    },
    {
        id: "autoCGear",
        name: "C-Gear",
        description:
            "Unova's wireless gear: visits the Hidden Grotto as soon as it fills, between wild battles (once Hidden Grottoes are unlocked).",
        cost: 15,
        sprite: itemSprite("xtransceiver")
    },
    {
        id: "autoContest",
        name: "Contest Pass",
        description:
            "Hoenn's Contest Pass: feeds Pokéblocks to the Pokémon likeliest to win a new ribbon, when you can easily afford them, and enters it in the next contest.",
        cost: 12,
        mechanic: "contests",
        sprite: itemSprite("contest-pass")
    }
];

/**
 * Training the bench: members of the best team (strongest first) at the level cap, who only
 * build Effort, give their places to the strongest Pokémon still below it (`ranked`, strongest
 * first; `first` ones ahead), up to `slots` places, weakest at the cap leaving first. The top
 * member always stays so wild battles keep their pace. `entry` keeps two forms of one Pokémon
 * (one Hall of Fame entry) from both joining.
 */
export function benchTeam(
    best: number[],
    ranked: number[],
    options: {
        cap: number;
        slots: number;
        level: (id: number) => number;
        first?: (id: number) => boolean;
        entry?: (id: number) => number;
    }
): number[] {
    const { cap, slots, level, first = () => false, entry = id => id } = options;
    const spare = best
        .slice(1)
        .filter(id => level(id) >= cap)
        .reverse()
        .slice(0, slots);
    if (spare.length === 0) return best;
    const trainees = ranked
        .filter(id => !best.includes(id) && level(id) < cap)
        .map((id, i) => ({ id, i, first: first(id) }))
        .sort((a, b) => Number(b.first) - Number(a.first) || a.i - b.i)
        .filter((t, i, all) => all.findIndex(other => entry(other.id) === entry(t.id)) === i)
        .slice(0, spare.length)
        .map(t => t.id);
    const leaving = spare.slice(0, trainees.length);
    return [...best.filter(id => !leaving.includes(id)), ...trainees];
}

export function speciesPower(species: Species): number {
    const [hp, atk, def, spa, spd, spe] = species.baseStats;
    return Math.max(atk, spa) * (0.6 + spe / 150) + (hp + def + spd) * 0.1;
}

export interface ZoneRates {
    /** Experience per minute for each party member (past the level cap it becomes Effort). */
    xpPerMinute: number;
    moneyPerMinute: number;
    /** Average seconds per wild battle, searching included (Infinity where nothing appears). */
    secondsPerBattle: number;
}

/**
 * Expected experience and Pokédollars per minute from wild battles in a zone, averaged over
 * every Pokémon you can meet there (weighted like rollEncounter) with this party and these
 * bonuses. Each battle takes the search time plus however long your best matchup needs.
 */
export function zoneRates(
    zoneId: string,
    keyItems: Partial<Record<KeyItemId, boolean>>,
    party: PartyBattler[],
    bonuses: Pick<Bonuses, "damage" | "xp" | "money" | "searchTime">,
    extras: ZoneExtras = {}
): ZoneRates {
    let seconds = 0;
    let xp = 0;
    let money = 0;
    const pools = activePools(zoneId, keyItems, extras);
    const totalShare = pools.reduce((sum, pool) => sum + pool.share, 0);
    for (const pool of pools) {
        const totalWeight = pool.entries.reduce((sum, entry) => sum + entry.weight, 0);
        for (const entry of pool.entries) {
            const chance = (pool.share / totalShare) * (entry.weight / totalWeight);
            const species = getSpecies(entry.id);
            // Average over the entry's level range; its ends and middle are close enough.
            const levels = [entry.minLevel, (entry.minLevel + entry.maxLevel) / 2, entry.maxLevel];
            for (const level of levels) {
                const target = { species, level: Math.round(level) };
                const dps = wildDps(party, target, bonuses.damage);
                // A Pokémon nobody can hurt holds the party up; count it as a long battle.
                const fight = dps > 0 ? maxHp(target) / dps : 600;
                const weight = chance / levels.length;
                seconds += weight * (bonuses.searchTime + fight);
                xp += weight * battleXp(target) * bonuses.xp;
                money += weight * moneyYield(target.level) * bonuses.money;
            }
        }
    }
    if (seconds === 0) return { xpPerMinute: 0, moneyPerMinute: 0, secondsPerBattle: Infinity };
    return {
        xpPerMinute: (xp / seconds) * 60,
        moneyPerMinute: (money / seconds) * 60,
        secondsPerBattle: seconds
    };
}

/** Wild battles a Shadow Pokémon must win in the party before its heart opens to purification. */
export const HEART_BATTLES = 100;

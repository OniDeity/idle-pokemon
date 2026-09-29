/**
 * Every tunable number that shapes progression lives here, so the game and the balance
 * simulator (scripts/simulateProgression.ts) always agree.
 */
import type { GrowthRate, Species } from "./data";
import type { KeyItemId } from "./items";
import { itemSprite } from "./items";
import type { BattlerStats } from "./stats";
import { attacksPerSecond, damagePerHit, maxHp, TRAINER_IV, xpForLevel, xpYield } from "./stats";
import type { TrainerDefinition } from "./trainers";
import { getSpecies } from "./data";

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
        caught: 150,
        name: "Mew",
        description: "Professor Oak entrusts you with the mythical Mew.",
        sprite: itemSprite("old-sea-map")
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
    }
];

export function hasMilestone(dexCaught: number, name: string): boolean {
    return DEX_MILESTONES.some(m => m.name === name && dexCaught >= m.caught);
}

export interface UpgradeDefinition {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    costGrowth: number;
    maxLevel: number;
    badgesRequired: number;
    sprite: string;
}

export function upgradeCost(upgrade: UpgradeDefinition, level: number): number {
    return Math.round(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
}

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
        sprite: itemSprite("x-attack")
    },
    wisdom: {
        id: "wisdom",
        name: "Veteran's Wisdom",
        description: "+10% experience per level.",
        baseCost: 5,
        costGrowth: 1.5,
        maxLevel: 50,
        badgesRequired: 0,
        sprite: itemSprite("exp-share")
    },
    fortune: {
        id: "fortune",
        name: "Sponsorship",
        description: "+10% Pokédollars per level.",
        baseCost: 5,
        costGrowth: 1.5,
        maxLevel: 50,
        badgesRequired: 0,
        sprite: itemSprite("nugget")
    },
    scout: {
        id: "scout",
        name: "Scouting Network",
        description: "-10% search time per level.",
        baseCost: 3,
        costGrowth: 2,
        maxLevel: 5,
        badgesRequired: 0,
        sprite: itemSprite("dowsing-machine")
    },
    catcher: {
        id: "catcher",
        name: "Catching Technique",
        description: "+10% catch chance per level.",
        baseCost: 2,
        costGrowth: 1.8,
        maxLevel: 10,
        badgesRequired: 0,
        sprite: itemSprite("great-ball")
    },
    shinyHunter: {
        id: "shinyHunter",
        name: "Shiny Hunter",
        description: "+50% shiny chance per level.",
        baseCost: 5,
        costGrowth: 2,
        maxLevel: 10,
        badgesRequired: 0,
        sprite: itemSprite("shiny-stone")
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
        sprite: itemSprite("old-rod")
    },
    headStart: {
        id: "headStart",
        name: "Head Start",
        description: "Your starter begins each journey 5 levels higher per level.",
        baseCost: 2,
        costGrowth: 2,
        maxLevel: 3,
        badgesRequired: 0,
        sprite: itemSprite("rare-candy")
    }
} satisfies Record<string, UpgradeDefinition>;
export type HofUpgradeId = keyof typeof HOF_UPGRADES;
export const HOF_UPGRADE_LIST = Object.values(HOF_UPGRADES) as (UpgradeDefinition & {
    id: HofUpgradeId;
})[];

export interface BonusInputs {
    dexCaught: number;
    shinyCaught: number;
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
        (1 + 0.1 * lvl(hof.power));
    const hp = (1 + 0.05 * lvl(mart.iron)) * (1 + 0.1 * lvl(hof.power));
    const xp =
        XP_RATE *
        (1 + 0.1 * lvl(mart.rareCandy)) *
        (milestone("Exp. Share") ? 1.15 : 1) *
        (milestone("Lucky Egg") ? 1.25 : 1) *
        (milestone("Silph Scope") ? 1.2 : 1) *
        (milestone("Silver Wing") ? 1.2 : 1) *
        (1 + 0.1 * lvl(hof.wisdom));
    const money =
        (1 + 0.1 * lvl(mart.payDay)) *
        (milestone("Amulet Coin") ? 1.25 : 1) *
        (milestone("Nugget Stash") ? 1.25 : 1) *
        (milestone("Silph Scope") ? 1.2 : 1) *
        (1 + 0.1 * lvl(hof.fortune));
    const catchBonus = (milestone("Oak's Letter") ? 1.1 : 1) * (1 + 0.1 * lvl(hof.catcher));
    const shiny = (milestone("Shiny Charm") ? 3 : 1) * (1 + 0.5 * lvl(hof.shinyHunter));
    const searchTime =
        (BASE_SEARCH_TIME / (keyItems.bicycle ? 2 : 1)) *
        (1 - 0.08 * lvl(mart.repel)) *
        (1 - 0.1 * lvl(hof.scout));

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

/** Damage per second of whichever party member would be sent out against this wild Pokémon. */
export function wildDps(party: PartyBattler[], target: BattlerStats, damageBonus: number) {
    const index = bestMatchup(party, target, damageBonus, null);
    return index === -1 ? 0 : memberDps(party[index], target, damageBonus);
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
 * active Pokémon faints. Damage is continuous and solved event-by-event, so the result is
 * exact for any step size (the real-time battle and the forecast always agree).
 */
export function stepTrainerBattle(
    party: PartyBattler[],
    enemies: BattlerStats[],
    state: TrainerBattleState,
    damageBonus: number,
    dt: number,
    timeLimit = Infinity
): { state: TrainerBattleState; done: TrainerBattleOutcome["reason"] | null } {
    let { enemyIndex, enemyHp, active, elapsed } = state;
    const partyHp = [...state.partyHp];
    let remaining = Math.min(dt, timeLimit - elapsed);
    const snapshot = () => ({ enemyIndex, enemyHp, active, partyHp, elapsed });

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
        const ourDps = memberDps(member, enemy, damageBonus);
        const theirDps = damagePerHit(enemy, member) * attacksPerSecond(enemy.species);

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
    trainer: Pick<TrainerDefinition, "team" | "timeLimit" | "statMultiplier">,
    damageBonus: number,
    hpBonus: number
): TrainerBattleOutcome {
    const enemies = trainerTeam(trainer);
    const start = initialTrainerBattle(party, enemies, hpBonus);
    const { state, done } = stepTrainerBattle(
        party,
        enemies,
        start,
        damageBonus,
        Infinity,
        trainer.timeLimit
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
        (hasMilestone(input.dexCaught, "Rainbow Wing") ? 1.25 : 1);
    return Math.max(1, Math.floor(base * multiplier));
}

export const FAME_PER_NEW_SPECIES = 5;

export type AutomationId =
    "autoShop" | "autoClaim" | "autoEvolve" | "autoParty" | "autoTravel" | "autoChallenge";

export interface AutomationDefinition {
    id: AutomationId;
    name: string;
    description: string;
    cost: number;
    sprite: string;
}

/** One-time Fame purchases that play parts of the game for you. Each can be toggled off. */
export const AUTOMATIONS: AutomationDefinition[] = [
    {
        id: "autoShop",
        name: "Shopping List",
        description:
            "Keeps your balls stocked and buys the cheapest Poké Mart upgrade when you can easily afford it.",
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
            "Uses evolution stones and the Link Cable on new evolutions, buying them when you can afford it.",
        cost: 8,
        sprite: itemSprite("moon-stone")
    },
    {
        id: "autoParty",
        name: "Team Strategist",
        description: "Keeps the six Pokémon that best counter your next opponent in your party.",
        cost: 10,
        sprite: itemSprite("exp-share")
    },
    {
        id: "autoTravel",
        name: "Travel Planner",
        description:
            "Moves to the best zone: the newest area with Pokémon you haven't caught this journey, or the toughest one your team handles.",
        cost: 12,
        sprite: itemSprite("bicycle")
    },
    {
        id: "autoChallenge",
        name: "League Pass",
        description:
            "Challenges the next Gym, quest or finale as soon as the forecast says you'll win.",
        cost: 15,
        sprite: itemSprite("gold-teeth")
    }
];

export function speciesPower(species: Species): number {
    const [hp, atk, def, spa, spd, spe] = species.baseStats;
    return Math.max(atk, spa) * (0.6 + spe / 150) + (hp + def + spd) * 0.1;
}

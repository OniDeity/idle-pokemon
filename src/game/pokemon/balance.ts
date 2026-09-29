/**
 * Every tunable number that shapes progression lives here, so the game and the balance
 * simulator (scripts/simulateProgression.ts) always agree.
 */
import type { Species } from "./data";
import type { KeyItemId } from "./items";
import type { BattlerStats } from "./stats";
import { attacksPerSecond, damagePerHit, maxHp, TRAINER_IV } from "./stats";
import type { TrainerDefinition } from "./trainers";
import { getSpecies } from "./data";

/** Seconds spent looking for the next wild Pokémon. */
export const BASE_SEARCH_TIME = 2;
/** Global experience rate. The mainline curves are tuned for ~1 battle a minute, not ~20. */
export const XP_RATE = 0.04;
export const BASE_SHINY_CHANCE = 1 / 4096;
/** Each extra catch of a species makes that species hit harder, up to a cap. */
export const DUPLICATE_BONUS_PER_CATCH = 0.02;
export const DUPLICATE_BONUS_MAX_CATCHES = 25;
/** Shiny Pokémon are a little stronger, too. */
export const SHINY_DAMAGE_BONUS = 1.2;
/** Every species registered as caught boosts the whole party's damage. */
export const DEX_DAMAGE_BONUS_PER_SPECIES = 0.01;
/** Max stock of each ball type; also where auto-restock tops up to. */
export const BALL_RESTOCK_TARGET = 20;

export function moneyYield(level: number): number {
    return 3 + level * 2;
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

const ITEMS = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

/** Rewards Professor Oak's aides hand out as the Pokédex fills. Never lost on Hall of Fame. */
export const DEX_MILESTONES: DexMilestone[] = [
    {
        caught: 10,
        name: "Exp. Share",
        description: "+25% experience.",
        sprite: `${ITEMS}/exp-share.png`
    },
    {
        caught: 20,
        name: "Amulet Coin",
        description: "+50% Pokédollars from battles.",
        sprite: `${ITEMS}/amulet-coin.png`
    },
    {
        caught: 30,
        name: "Ball Restocker",
        description: "Automatically buys balls when you run low (if you can afford them).",
        sprite: `${ITEMS}/poke-ball.png`
    },
    {
        caught: 40,
        name: "Lucky Egg",
        description: "+50% experience.",
        sprite: `${ITEMS}/lucky-egg.png`
    },
    {
        caught: 60,
        name: "Scope Lens",
        description: "+25% damage.",
        sprite: `${ITEMS}/scope-lens.png`
    },
    {
        caught: 80,
        name: "Nugget Stash",
        description: "+50% Pokédollars from battles.",
        sprite: `${ITEMS}/nugget.png`
    },
    {
        caught: 100,
        name: "Oak's Letter",
        description: "+50% damage and +10% catch chance.",
        sprite: `${ITEMS}/oaks-letter.png`
    },
    {
        caught: 120,
        name: "Silph Scope",
        description: "+50% experience and Pokédollars.",
        sprite: `${ITEMS}/silph-scope.png`
    },
    {
        caught: 150,
        name: "Mew",
        description: "Professor Oak entrusts you with the mythical Mew.",
        sprite: `${ITEMS}/old-sea-map.png`
    },
    {
        caught: 151,
        name: "Shiny Charm",
        description: "Shiny Pokémon appear three times as often.",
        sprite: `${ITEMS}/shiny-charm.png`
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
        costGrowth: 1.5,
        maxLevel: 40,
        badgesRequired: 0,
        sprite: `${ITEMS}/protein.png`
    },
    rareCandy: {
        id: "rareCandy",
        name: "Rare Candy",
        description: "+10% experience per level.",
        baseCost: 250,
        costGrowth: 1.5,
        maxLevel: 30,
        badgesRequired: 1,
        sprite: `${ITEMS}/rare-candy.png`
    },
    payDay: {
        id: "payDay",
        name: "Coin Case",
        description: "+10% Pokédollars per level.",
        baseCost: 400,
        costGrowth: 1.55,
        maxLevel: 25,
        badgesRequired: 1,
        sprite: `${ITEMS}/coin-case.png`
    },
    iron: {
        id: "iron",
        name: "Iron",
        description: "+5% party HP per level.",
        baseCost: 300,
        costGrowth: 1.5,
        maxLevel: 40,
        badgesRequired: 0,
        sprite: `${ITEMS}/iron.png`
    },
    repel: {
        id: "repel",
        name: "Max Repel",
        description: "Weak Pokémon avoid you: -8% search time per level.",
        baseCost: 1000,
        costGrowth: 2.2,
        maxLevel: 5,
        badgesRequired: 2,
        sprite: `${ITEMS}/max-repel.png`
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
        description: "+25% damage and party HP per level.",
        baseCost: 1,
        costGrowth: 1.6,
        maxLevel: 50,
        badgesRequired: 0,
        sprite: `${ITEMS}/x-attack.png`
    },
    wisdom: {
        id: "wisdom",
        name: "Veteran's Wisdom",
        description: "+25% experience per level.",
        baseCost: 1,
        costGrowth: 1.6,
        maxLevel: 50,
        badgesRequired: 0,
        sprite: `${ITEMS}/exp-share.png`
    },
    fortune: {
        id: "fortune",
        name: "Sponsorship",
        description: "+25% Pokédollars per level.",
        baseCost: 1,
        costGrowth: 1.6,
        maxLevel: 50,
        badgesRequired: 0,
        sprite: `${ITEMS}/nugget.png`
    },
    scout: {
        id: "scout",
        name: "Scouting Network",
        description: "-10% search time per level.",
        baseCost: 3,
        costGrowth: 2,
        maxLevel: 5,
        badgesRequired: 0,
        sprite: `${ITEMS}/dowsing-machine.png`
    },
    catcher: {
        id: "catcher",
        name: "Catching Technique",
        description: "+10% catch chance per level.",
        baseCost: 2,
        costGrowth: 1.8,
        maxLevel: 10,
        badgesRequired: 0,
        sprite: `${ITEMS}/great-ball.png`
    },
    shinyHunter: {
        id: "shinyHunter",
        name: "Shiny Hunter",
        description: "+50% shiny chance per level.",
        baseCost: 5,
        costGrowth: 2,
        maxLevel: 10,
        badgesRequired: 0,
        sprite: `${ITEMS}/shiny-stone.png`
    },
    headStart: {
        id: "headStart",
        name: "Head Start",
        description: "Your starter begins each journey 5 levels higher per level.",
        baseCost: 2,
        costGrowth: 2,
        maxLevel: 3,
        badgesRequired: 0,
        sprite: `${ITEMS}/rare-candy.png`
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
        (milestone("Scope Lens") ? 1.25 : 1) *
        (milestone("Oak's Letter") ? 1.5 : 1) *
        (1 + 0.25 * lvl(hof.power));
    const hp = (1 + 0.05 * lvl(mart.iron)) * (1 + 0.25 * lvl(hof.power));
    const xp =
        XP_RATE *
        (1 + 0.1 * lvl(mart.rareCandy)) *
        (milestone("Exp. Share") ? 1.25 : 1) *
        (milestone("Lucky Egg") ? 1.5 : 1) *
        (milestone("Silph Scope") ? 1.5 : 1) *
        (1 + 0.25 * lvl(hof.wisdom));
    const money =
        (1 + 0.1 * lvl(mart.payDay)) *
        (milestone("Amulet Coin") ? 1.5 : 1) *
        (milestone("Nugget Stash") ? 1.5 : 1) *
        (milestone("Silph Scope") ? 1.5 : 1) *
        (1 + 0.25 * lvl(hof.fortune));
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

/** Fame earned by entering the Hall of Fame. */
export function fameGain(dexCaught: number, shinyCaught: number, timesEntered: number): number {
    const base = 3 + Math.floor(dexCaught / 5) + shinyCaught * 2;
    // A little diminishing so repeat runs don't need to be perfect, but still pay off.
    return Math.max(1, Math.floor(base * (timesEntered === 0 ? 1.5 : 1)));
}

export function speciesPower(species: Species): number {
    const [hp, atk, def, spa, spd, spe] = species.baseStats;
    return Math.max(atk, spa) * (0.6 + spe / 150) + (hp + def + spd) * 0.1;
}

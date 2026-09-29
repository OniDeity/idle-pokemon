import type { GrowthRate, PokemonType, Species } from "./data";
import { typeEffectiveness } from "./data";

export const MAX_LEVEL = 100;
/** Individual values used for everything the player catches or meets in the wild. */
export const WILD_IV = 15;
/** Trainer Pokémon (gyms, Elite Four) are raised with care. */
export const TRAINER_IV = 24;

/** Base power of the "signature move" every Pokémon uses in battle. */
const MOVE_POWER = 60;
const STAB = 1.5;
/** Pokémon always have some coverage move, so nothing is ever fully walled. */
const MIN_TYPE_MULTIPLIER = 0.5;

/** Total experience required to reach a level, using the mainline games' growth curves. */
export function xpForLevel(growthRate: GrowthRate, level: number): number {
    if (level <= 1) {
        return 0;
    }
    const n = level;
    const n3 = n * n * n;
    let xp: number;
    switch (growthRate) {
        case "fast":
            xp = (4 * n3) / 5;
            break;
        case "medium":
            xp = n3;
            break;
        case "mediumSlow":
            xp = (6 / 5) * n3 - 15 * n * n + 100 * n - 140;
            break;
        case "slow":
            xp = (5 * n3) / 4;
            break;
        case "erratic":
            xp =
                n <= 50
                    ? (n3 * (100 - n)) / 50
                    : n <= 68
                      ? (n3 * (150 - n)) / 100
                      : n <= 98
                        ? (n3 * Math.floor((1911 - 10 * n) / 3)) / 500
                        : (n3 * (160 - n)) / 100;
            break;
        case "fluctuating":
            xp =
                n <= 15
                    ? (n3 * (Math.floor((n + 1) / 3) + 24)) / 50
                    : n <= 36
                      ? (n3 * (n + 14)) / 50
                      : (n3 * (Math.floor(n / 2) + 32)) / 50;
            break;
    }
    return Math.max(0, Math.floor(xp));
}

/** The highest level reachable with the given total experience, capped at `cap`. */
export function levelForXp(growthRate: GrowthRate, xp: number, cap = MAX_LEVEL): number {
    let level = 1;
    while (level < cap && xp >= xpForLevel(growthRate, level + 1)) {
        level++;
    }
    return level;
}

export function statAtLevel(base: number, level: number, iv = WILD_IV): number {
    return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

export function hpAtLevel(base: number, level: number, iv = WILD_IV): number {
    return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
}

export interface BattlerStats {
    species: Species;
    level: number;
    iv?: number;
    /** Multiplies every stat; trainers' Pokémon are better raised than wild ones. */
    statMultiplier?: number;
}

/**
 * The best damage multiplier this attacker can get against the defender, from type matchups.
 * Pokémon always attack with the better of their own types, so STAB is always applied.
 */
export function bestTypeMultiplier(attackerTypes: PokemonType[], defenderTypes: PokemonType[]) {
    let best = 0;
    for (const type of attackerTypes) {
        best = Math.max(best, typeEffectiveness(type, defenderTypes) * STAB);
    }
    return Math.max(best, MIN_TYPE_MULTIPLIER);
}

/** Damage dealt by one hit, using the mainline damage formula (without randomness or crits). */
export function damagePerHit(attacker: BattlerStats, defender: BattlerStats): number {
    const [, atk, , spa] = attacker.species.baseStats;
    const [, , defDef, , defSpd] = defender.species.baseStats;
    const physical = atk >= spa;
    const attack =
        statAtLevel(physical ? atk : spa, attacker.level, attacker.iv) *
        (attacker.statMultiplier ?? 1);
    const defense =
        statAtLevel(physical ? defDef : defSpd, defender.level, defender.iv) *
        (defender.statMultiplier ?? 1);
    const base = (((2 * attacker.level) / 5 + 2) * MOVE_POWER * attack) / defense / 50 + 2;
    return base * bestTypeMultiplier(attacker.species.types, defender.species.types);
}

/** Faster Pokémon attack more often. Ranges from ~0.7/s (Slowpoke) to ~1.6/s (Electrode). */
export function attacksPerSecond(species: Species): number {
    return 0.6 + species.baseStats[5] / 150;
}

export function maxHp(battler: BattlerStats): number {
    return Math.round(
        hpAtLevel(battler.species.baseStats[0], battler.level, battler.iv) *
            (battler.statMultiplier ?? 1)
    );
}

/** Experience yielded by defeating a Pokémon (Gen 1-4 formula, before multipliers). */
export function xpYield(defeated: BattlerStats, trainerOwned = false): number {
    return Math.floor(((defeated.species.baseExp * defeated.level) / 7) * (trainerOwned ? 1.5 : 1));
}

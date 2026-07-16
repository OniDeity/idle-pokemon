import type { SpeciesData } from "./types";

const STAT_GROWTH_PER_LEVEL = 0.08;
export const GEAR_BONUS_PER_LEVEL = 0.1;

const BASE_XP_GAIN = 5;
const XP_GAIN_PER_WILD_LEVEL = 2;

const BASE_XP_TO_LEVEL = 20;
const XP_TO_LEVEL_EXPONENT = 1.5;

export function statAtLevel(baseStat: number, level: number): number {
    return Math.floor(baseStat * (1 + (level - 1) * STAT_GROWTH_PER_LEVEL));
}

export function computeBattlePower(
    baseStats: SpeciesData["baseStats"],
    level: number,
    powerMultiplier = 1
): number {
    const total =
        statAtLevel(baseStats.hp, level) +
        statAtLevel(baseStats.attack, level) +
        statAtLevel(baseStats.defense, level) +
        statAtLevel(baseStats.specialAttack, level) +
        statAtLevel(baseStats.specialDefense, level) +
        statAtLevel(baseStats.speed, level);
    return Math.round(total * powerMultiplier);
}

/** Additive per-level bonus from field's Battle Gear repeatables. Wild Pokémon never get this. */
export function computeGearMultiplier(attackGearLevel: number, defenseGearLevel: number): number {
    return 1 + (attackGearLevel + defenseGearLevel) * GEAR_BONUS_PER_LEVEL;
}

export function resolveBattle(playerPower: number, wildPower: number): boolean {
    return Math.random() < playerPower / (playerPower + wildPower);
}

export function computeXpGain(wildLevel: number): number {
    return BASE_XP_GAIN + wildLevel * XP_GAIN_PER_WILD_LEVEL;
}

export function computeXpToLevel(currentLevel: number): number {
    return Math.round(BASE_XP_TO_LEVEL * Math.pow(currentLevel, XP_TO_LEVEL_EXPONENT));
}

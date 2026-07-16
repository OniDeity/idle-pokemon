import type { ZoneDefinition } from "./zones";
import type { EncounterTableEntry } from "./types";

const BASE_SHINY_CHANCE = 1 / 4096;

export interface WildEncounter {
    speciesId: string;
    level: number;
    isShiny: boolean;
}

export interface EncounterResult extends WildEncounter {
    battleWon: boolean;
    caught: boolean;
}

export function pickWeightedSpecies(table: EncounterTableEntry[]): EncounterTableEntry {
    const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const entry of table) {
        roll -= entry.weight;
        if (roll <= 0) {
            return entry;
        }
    }
    return table[table.length - 1];
}

export function rollLevel(entry: EncounterTableEntry): number {
    return entry.minLevel + Math.floor(Math.random() * (entry.maxLevel - entry.minLevel + 1));
}

export function rollShiny(shinyChanceMultiplier: number): boolean {
    return Math.random() < BASE_SHINY_CHANCE * shinyChanceMultiplier;
}

export function rollCatch(captureRate: number, catchChanceMultiplier: number): boolean {
    return Math.random() < Math.min(1, (captureRate / 255) * catchChanceMultiplier);
}

export function rollWildEncounter(
    zone: Pick<ZoneDefinition, "encounterTable">,
    shinyChanceMultiplier: number
): WildEncounter {
    const entry = pickWeightedSpecies(zone.encounterTable);
    return {
        speciesId: entry.speciesId,
        level: rollLevel(entry),
        isShiny: rollShiny(shinyChanceMultiplier)
    };
}

export function computeResearchPointsGain(
    result: EncounterResult,
    isFirstCatchOfSpecies: boolean
): number {
    if (!result.caught) {
        return 0;
    }
    let gain = 1;
    if (isFirstCatchOfSpecies) {
        gain += 5;
    }
    if (result.isShiny) {
        gain += 25;
    }
    return gain;
}

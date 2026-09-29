import { assetUrl } from "./assets";
import encountersJson from "data/pokemon/encounters.json";
import speciesJson from "data/pokemon/species.json";
import typeChartJson from "data/pokemon/typeChart.json";

export type PokemonType =
    | "normal"
    | "fighting"
    | "flying"
    | "poison"
    | "ground"
    | "rock"
    | "bug"
    | "ghost"
    | "steel"
    | "fire"
    | "water"
    | "grass"
    | "electric"
    | "psychic"
    | "ice"
    | "dragon"
    | "dark"
    | "fairy";

export type StoneId = "moonStone" | "fireStone" | "thunderStone" | "waterStone" | "leafStone";

export type GrowthRate = "slow" | "medium" | "fast" | "mediumSlow" | "erratic" | "fluctuating";

export interface Evolution {
    into: number;
    method: "level" | "stone" | "trade";
    level?: number;
    stone?: StoneId;
}

export interface Species {
    id: number;
    name: string;
    types: PokemonType[];
    /** [hp, attack, defense, special attack, special defense, speed] */
    baseStats: [number, number, number, number, number, number];
    baseExp: number;
    /** 3-255; higher is easier to catch. */
    captureRate: number;
    growthRate: GrowthRate;
    legendary: boolean;
    evolutions: Evolution[];
}

export interface EncounterEntry {
    id: number;
    weight: number;
    minLevel: number;
    maxLevel: number;
}

export type EncounterPoolId = "walk" | "surf" | "oldRod" | "goodRod" | "superRod";

export const SPECIES = speciesJson as Species[];
export const DEX_SIZE = SPECIES.length;
export const TYPE_CHART = typeChartJson as Partial<
    Record<PokemonType, Partial<Record<PokemonType, number>>>
>;
export const ENCOUNTERS = encountersJson as Record<
    string,
    Partial<Record<EncounterPoolId, EncounterEntry[]>>
>;

/** Which species evolves into each species, if any. */
export const PRE_EVOLUTION: Record<number, number | undefined> = {};
for (const species of SPECIES) {
    for (const evolution of species.evolutions) {
        PRE_EVOLUTION[evolution.into] = species.id;
    }
}

export function getSpecies(id: number): Species {
    const species = SPECIES[id - 1];
    if (species?.id !== id) {
        throw new Error(`Unknown species #${id}`);
    }
    return species;
}

export function spriteUrl(id: number, shiny = false, back = false): string {
    return assetUrl(
        `pokemon/versions/generation-iii/firered-leafgreen/${back ? "back/" : ""}${
            shiny ? "shiny/" : ""
        }${id}.png`
    );
}

/** Damage multiplier of an attack of the given type against a defender with the given types. */
export function typeEffectiveness(attack: PokemonType, defender: PokemonType[]): number {
    return defender.reduce((mult, type) => mult * (TYPE_CHART[attack]?.[type] ?? 1), 1);
}

export const TYPE_COLORS: Record<PokemonType, string> = {
    normal: "#A8A77A",
    fighting: "#C22E28",
    flying: "#A98FF3",
    poison: "#A33EA1",
    ground: "#E2BF65",
    rock: "#B6A136",
    bug: "#A6B91A",
    ghost: "#735797",
    steel: "#B7B7CE",
    fire: "#EE8130",
    water: "#6390F0",
    grass: "#7AC74C",
    electric: "#F7D02C",
    psychic: "#F95587",
    ice: "#96D9D6",
    dragon: "#6F35FC",
    dark: "#705746",
    fairy: "#D685AD"
};

export function formatDexNumber(id: number): string {
    return `#${String(id).padStart(3, "0")}`;
}

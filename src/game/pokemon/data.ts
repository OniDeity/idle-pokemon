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

export type StoneId =
    "moonStone" | "fireStone" | "thunderStone" | "waterStone" | "leafStone" | "sunStone";

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
    /** For variant forms (Pinkan, Valencian, ...): the regular species they're based on. */
    baseSpecies?: number;
    variant?: VariantKind;
}

export type VariantKind = "pinkan" | "valencian" | "unique";

export interface EncounterEntry {
    id: number;
    weight: number;
    minLevel: number;
    maxLevel: number;
}

export type EncounterPoolId = "walk" | "surf" | "oldRod" | "goodRod" | "superRod";

/** The regular National Pokédex species, #1-251, in order. */
export const SPECIES = speciesJson as Species[];
export const DEX_SIZE = SPECIES.length;

/**
 * Anime variants seen in the Orange Islands and Kanto. They share their base species' stats
 * and get their own Pokédex entries; sprites are the base sprite recolored with a CSS filter.
 * Ids: Pinkan 1000 + base, Valencian 2000 + base, unique individuals 3000 + base.
 */
const PINKAN = [10, 13, 16, 19, 25, 29, 32, 34, 45, 46, 47, 48, 50, 56, 57, 69, 85, 103, 111, 112];
const VALENCIAN = [12, 20, 29, 32, 45, 46, 70];

/** CSS filters that recolor a base sprite into its variant's colors. */
const VARIANT_FILTERS: Record<number, string> = {
    // Pinkan Berries tint everything pink.
    ...Object.fromEntries(
        PINKAN.map(id => [1000 + id, "sepia(1) saturate(3.5) hue-rotate(285deg) brightness(1.08)"])
    ),
    // Valencian colors, matched to the episode's stills where they exist.
    2012: "sepia(1) saturate(2.6) hue-rotate(5deg) brightness(1.1)", // golden-winged Butterfree
    2020: "sepia(1) saturate(5) hue-rotate(-35deg) brightness(0.95)", // red Raticate
    2029: "hue-rotate(150deg) saturate(1.3)", // Nidoran♀
    2032: "hue-rotate(-110deg) saturate(1.3)", // Nidoran♂
    2045: "hue-rotate(38deg) saturate(1.7) brightness(1.1)", // orange-petaled Vileplume
    2046: "hue-rotate(-20deg) saturate(1.6)", // red Paras
    2070: "sepia(1) saturate(3.5) hue-rotate(-18deg) brightness(1.05)", // orange Weepinbell
    3095: "grayscale(0.6) brightness(1.5) hue-rotate(170deg) opacity(0.85)", // Crystal Onix
    3012: "sepia(1) saturate(3) hue-rotate(290deg) brightness(1.15)" // Pink Butterfree
};

function variant(
    baseId: number,
    id: number,
    kind: VariantKind,
    name: string,
    overrides: Partial<Species> = {}
): Species {
    const base = SPECIES[baseId - 1];
    return {
        ...base,
        id,
        name,
        baseSpecies: baseId,
        variant: kind,
        evolutions: [],
        ...overrides
    };
}

export const VARIANT_SPECIES: Species[] = [
    ...PINKAN.map(id => variant(id, 1000 + id, "pinkan", `Pinkan ${SPECIES[id - 1].name}`)),
    ...VALENCIAN.map(id =>
        variant(id, 2000 + id, "valencian", `Valencian ${SPECIES[id - 1].name}`)
    ),
    // Made of glass: no longer weak to Water, but Fire cracks it.
    variant(95, 3095, "unique", "Crystal Onix", { types: ["ice"], captureRate: 10 }),
    variant(12, 3012, "unique", "Pink Butterfree", { captureRate: 25 })
];

// A variant evolves into the same variant of its evolution when one exists, else the regular one.
for (const form of VARIANT_SPECIES) {
    if (form.variant === "unique") continue;
    const offset = form.id - form.baseSpecies!;
    form.evolutions = SPECIES[form.baseSpecies! - 1].evolutions.map(evolution => {
        const into = evolution.into + offset;
        return VARIANT_SPECIES.some(v => v.id === into) ? { ...evolution, into } : evolution;
    });
}

const SPECIES_BY_ID = new Map<number, Species>(
    [...SPECIES, ...VARIANT_SPECIES].map(species => [species.id, species])
);
export const ALL_SPECIES: Species[] = [...SPECIES, ...VARIANT_SPECIES];

export function isVariant(id: number): boolean {
    return id > DEX_SIZE;
}

export function variantFilter(id: number): string | undefined {
    return VARIANT_FILTERS[id];
}
export const TYPE_CHART = typeChartJson as Partial<
    Record<PokemonType, Partial<Record<PokemonType, number>>>
>;
export const ENCOUNTERS = encountersJson as Record<
    string,
    Partial<Record<EncounterPoolId, EncounterEntry[]>>
>;

/** Which species evolves into each species, if any. */
export const PRE_EVOLUTION: Record<number, number | undefined> = {};
for (const species of ALL_SPECIES) {
    for (const evolution of species.evolutions) {
        PRE_EVOLUTION[evolution.into] ??= species.id;
    }
}

/** Shorthand for hand-authored encounter tables. Weight is relative within its pool. */
export function enc(id: number, minLevel: number, maxLevel: number, weight = 10): EncounterEntry {
    return { id, minLevel, maxLevel, weight };
}

export function getSpecies(id: number): Species {
    const species = SPECIES_BY_ID.get(id);
    if (species == null) {
        throw new Error(`Unknown species #${id}`);
    }
    return species;
}

export function spriteUrl(id: number, shiny = false, back = false): string {
    id = SPECIES_BY_ID.get(id)?.baseSpecies ?? id;
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
    const base = SPECIES_BY_ID.get(id)?.baseSpecies ?? id;
    return `#${String(base).padStart(3, "0")}`;
}

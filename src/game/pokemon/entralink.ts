/**
 * The Entralink's towns: Black and White's Black City and White Forest, and Black 2 and White 2's
 * Black Tower and White Treehollow inside them. In the games, characters invited through the
 * Entralink move in: each brings a Pokémon to White Forest's grass and battles in Black City.
 * Here they move in as you play (every RESIDENT_BATTLES wild battles of a Unova journey), up to
 * MAX_RESIDENTS, the longest-staying one moving out after that. Residents and their Pokémon are
 * from the Pokémon Fandom wiki's White Forest list; Black City's trainers use the final forms.
 */
import { getSpecies } from "./data";
import type { EncounterEntry } from "./data";

export interface Resident {
    name: string;
    /** The Pokémon this resident brings to White Forest's grass. */
    forest: number;
    /** Also brings Wooper to White Forest's water. */
    water?: boolean;
}

export const RESIDENTS: Resident[] = [
    { name: "Leo", forest: 16 },
    { name: "Jacques", forest: 29 },
    { name: "Ken", forest: 32 },
    { name: "Lynette", forest: 43 },
    { name: "Collin", forest: 63 },
    { name: "Ryder", forest: 66 },
    { name: "Piper", forest: 69 },
    { name: "Marie", forest: 81 },
    { name: "Dave", forest: 92 },
    { name: "Shane", forest: 111 },
    { name: "Herman", forest: 137, water: true },
    { name: "Miki", forest: 175 },
    { name: "Pierce", forest: 179 },
    { name: "Britney", forest: 187 },
    { name: "Frederic", forest: 406, water: true },
    { name: "Grace", forest: 371, water: true },
    { name: "Robbie", forest: 239 },
    { name: "Vincent", forest: 240 },
    { name: "Silvia", forest: 265 },
    { name: "Miho", forest: 273 },
    { name: "Lena", forest: 280 },
    { name: "Karenna", forest: 287 },
    { name: "Rosa", forest: 293 },
    { name: "Molly", forest: 298 },
    { name: "Gene", forest: 304 },
    { name: "Eliza", forest: 328 },
    { name: "Carlos", forest: 396 },
    { name: "Doug", forest: 403 },
    { name: "Emi", forest: 440 }
];

/** White Forest's water Pokémon that come with any resident ("various" in the games). */
export const FOREST_WATER = [270, 283, 341];
/** All of White Forest's wild Pokémon are this level, as in the games. */
export const FOREST_LEVEL = 5;
/** Residents living in Black City and White Forest at once (the games' population cap). */
export const MAX_RESIDENTS = 10;
/** Residents when a journey's Entralink towns open. */
export const FIRST_RESIDENTS = 3;
/** Wild battles of a Unova journey between residents moving in. */
export const RESIDENT_BATTLES = 40;
/** Black City's market boss rewards every this many trainers beaten there. */
export const MARKET_TASK_WINS = 25;

/** A resident's Pokémon at its last stage (the first branch of each evolution). */
export function finalForm(speciesId: number): number {
    let id = speciesId;
    for (let guard = 0; guard < 4; guard++) {
        const next = getSpecies(id).evolutions[0]?.into;
        if (next == null) break;
        id = next;
    }
    return id;
}

/** White Forest's pools for these residents (indices into RESIDENTS). */
export function forestPools(residents: number[]): {
    walk: EncounterEntry[];
    surf: EncounterEntry[];
} {
    const living = residents.map(i => RESIDENTS[i]).filter(r => r != null);
    const walk = living.map(r => ({
        id: r.forest,
        minLevel: FOREST_LEVEL,
        maxLevel: FOREST_LEVEL,
        weight: 10
    }));
    const water = [...FOREST_WATER, ...(living.some(r => r.water === true) ? [194] : [])];
    const surf = water.map(id => ({
        id,
        minLevel: FOREST_LEVEL,
        maxLevel: FOREST_LEVEL,
        weight: 10
    }));
    return { walk, surf };
}

/** Black City's trainers' Pokémon for these residents, at these levels. */
export function cityPool(
    residents: number[],
    minLevel: number,
    maxLevel: number
): EncounterEntry[] {
    return residents
        .map(i => RESIDENTS[i])
        .filter(r => r != null)
        .map(r => ({ id: finalForm(r.forest), minLevel, maxLevel, weight: 10 }));
}

/**
 * Who moves in next: residents not living there yet, in a fixed order shuffled by the journey's
 * seed (so a journey's arrivals don't depend on when the game is saved).
 */
export function nextResident(residents: number[], seed: number): number | undefined {
    const free = RESIDENTS.map((_, i) => i).filter(i => !residents.includes(i));
    if (free.length === 0) return undefined;
    return free[Math.abs(Math.floor(seed)) % free.length];
}

/** The town after one more resident arrives: the longest-staying moves out when it's full. */
export function arrive(residents: number[], seed: number): number[] {
    const next = nextResident(residents, seed);
    if (next == null) return residents;
    const kept = residents.length >= MAX_RESIDENTS ? residents.slice(1) : residents;
    return [...kept, next];
}

/**
 * Black 2 and White 2's Black Tower and White Treehollow: ten areas of trainers in the games,
 * random each time. Here each is a place of trainers using the residents' final forms, split by
 * first type (nature's types in the Treehollow, the city's in the Tower), and an Area 10 boss
 * with the six strongest.
 */
export type EntralinkTower = "blackTower" | "whiteTreehollow";

const TREEHOLLOW_TYPES = new Set(["grass", "bug", "water", "normal", "fairy", "ground"]);

/** The residents' final forms in a tower, strongest (base stat total) first. */
export function towerSpecies(tower: EntralinkTower): number[] {
    const forms = [...new Set(RESIDENTS.map(r => finalForm(r.forest)))];
    const total = (id: number) => getSpecies(id).baseStats.reduce((a, b) => a + b, 0);
    return forms
        .filter(
            id => TREEHOLLOW_TYPES.has(getSpecies(id).types[0]) === (tower === "whiteTreehollow")
        )
        .sort((a, b) => total(b) - total(a));
}

/** A tower's trainers' Pokémon, at these levels. */
export function towerPool(
    tower: EntralinkTower,
    minLevel: number,
    maxLevel: number
): EncounterEntry[] {
    return towerSpecies(tower).map(id => ({ id, minLevel, maxLevel, weight: 10 }));
}

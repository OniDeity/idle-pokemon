/**
 * Pokémon Contests (Hoenn's generation mechanic): a Pokémon's condition in each category, raised
 * with Pokéblocks, plus how well its types and level suit the category, is judged against each
 * rank's field. Winning earns a ribbon for that species; a Master Rank win in each category
 * earns that category's Cosplay Pikachu (from Omega Ruby and Alpha Sapphire).
 */
import type { PokemonType } from "./data";
import { getSpecies } from "./data";

export type ContestCategory = "cool" | "beauty" | "cute" | "smart" | "tough";
export type ContestRank = "normal" | "super" | "hyper" | "master";

export const CONTEST_CATEGORIES: ContestCategory[] = ["cool", "beauty", "cute", "smart", "tough"];
export const CONTEST_RANKS: ContestRank[] = ["normal", "super", "hyper", "master"];

export const CATEGORY_NAMES: Record<ContestCategory, string> = {
    cool: "Cool",
    beauty: "Beauty",
    cute: "Cute",
    smart: "Smart",
    tough: "Tough"
};

export const RANK_NAMES: Record<ContestRank, string> = {
    normal: "Normal Rank",
    super: "Super Rank",
    hyper: "Hyper Rank",
    master: "Master Rank"
};

/** The Pokéblock color that raises each condition. */
export const POKEBLOCK_COLORS: Record<ContestCategory, string> = {
    cool: "Red",
    beauty: "Blue",
    cute: "Pink",
    smart: "Green",
    tough: "Yellow"
};

/** Each Pokéblock raises its condition by this much, up to the maximum. */
export const POKEBLOCK_GAIN = 10;
export const MAX_CONDITION = 100;
export const POKEBLOCK_PRICE = 300;

/** The types whose moves appeal most in each category. */
export const CATEGORY_TYPES: Record<ContestCategory, PokemonType[]> = {
    cool: ["fire", "electric", "dragon", "flying", "fighting"],
    beauty: ["water", "ice", "psychic", "fairy"],
    cute: ["normal", "grass", "bug", "fairy"],
    smart: ["psychic", "ghost", "dark", "poison", "grass"],
    tough: ["rock", "ground", "steel", "fighting", "poison"]
};

/** The score each rank's field puts up; a Pokémon scoring this wins half the time. */
export const RANK_SCORES: Record<ContestRank, number> = {
    normal: 40,
    super: 75,
    hyper: 110,
    master: 145
};

/** Seconds a contest takes, by rank. */
export const CONTEST_SECONDS: Record<ContestRank, number> = {
    normal: 30,
    super: 45,
    hyper: 60,
    master: 90
};

/** Prize money for winning, by rank. */
export const CONTEST_PRIZE_MONEY: Record<ContestRank, number> = {
    normal: 500,
    super: 1000,
    hyper: 2000,
    master: 4000
};

/** The Cosplay Pikachu won with each category's first Master Rank ribbon. */
export const CONTEST_PIKACHU: Record<ContestCategory, number> = {
    cool: 10080,
    beauty: 10081,
    cute: 10082,
    smart: 10083,
    tough: 10084
};

/** Feebas evolves into Milotic once its Beauty condition reaches this. */
export const MILOTIC_BEAUTY = 80;

/** How well a species' types suit a category: 30 for its first type, 15 for its second. */
export function typeAppeal(speciesId: number, category: ContestCategory): number {
    const types = getSpecies(speciesId).types;
    const suits = CATEGORY_TYPES[category];
    if (suits.includes(types[0])) return 30;
    if (types[1] != null && suits.includes(types[1])) return 15;
    return 0;
}

/** A Pokémon's contest score: condition, type appeal, and half its level. */
export function contestScore(
    speciesId: number,
    level: number,
    condition: number,
    category: ContestCategory
): number {
    return condition + typeAppeal(speciesId, category) + level / 2;
}

/** The chance a score wins at a rank: even at the rank's score, sure 30 points above it. */
export function winChance(score: number, rank: ContestRank): number {
    return Math.min(1, Math.max(0, 0.5 + (score - RANK_SCORES[rank]) / 60));
}

/** The rank a Pokémon can enter next in a category, given the ribbons its species has won. */
export function nextRank(won: ContestRank | undefined): ContestRank | undefined {
    if (won == null) return "normal";
    return CONTEST_RANKS[CONTEST_RANKS.indexOf(won) + 1];
}

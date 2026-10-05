/**
 * Which species the player can get in a set of regions: wild Pokémon (with any equipment),
 * special encounters, starters, and everything those evolve into. A form counts as its species.
 * New regions unlock once the Pokédex holds everything the earlier regions offer.
 */
import type { EncounterPoolId } from "./data";
import { DEX_SIZE, getSpecies, PRE_EVOLUTION, SPECIES } from "./data";
import { MECHANIC_LIST, MECHANICS } from "./mechanics";
import type { RegionDefinition } from "./regions";
import { REGION_LIST } from "./regions";
import { HONEY_SPECIES } from "./sinnoh";
import { SPECIAL_ENCOUNTERS, specialSpecies } from "./specials";
import { FOSSIL_SPECIES } from "./underground";
import type { RegionId } from "./zones";
import { catchableIn, occasionalSpecies, zonePools, zonesIn } from "./zones";

/**
 * The key items a journey in one of these regions can have: the region's own (starting and
 * from trials), plus those of mechanics these regions introduce, which every journey gets.
 */
function keyItemsIn(regions: RegionId[]): Set<string> {
    const items = new Set<string>();
    for (const region of regions) {
        const def = REGION_LIST.find(r => r.id === region);
        def?.startingKeyItems.forEach(item => items.add(item));
        def?.trials.forEach(trial => trial.keyItems.forEach(item => items.add(item)));
    }
    MECHANIC_LIST.filter(m => m.keyItem != null && regions.includes(m.region)).forEach(m =>
        items.add(m.keyItem!)
    );
    return items;
}

/**
 * Pokémon a region's own features bring, besides wild places and specials: Sinnoh's Honey Trees
 * and the fossils its Underground digs up.
 */
const FEATURE_SPECIES: Partial<Record<RegionId, number[]>> = {
    sinnoh: [...HONEY_SPECIES, ...FOSSIL_SPECIES]
};

/** The regular species obtainable in these regions. */
export function speciesObtainableIn(regions: RegionId[]): Set<number> {
    const found = new Set<number>();
    const add = (id: number) => {
        const species = getSpecies(id);
        found.add(id > DEX_SIZE ? (species.baseSpecies ?? id) : id);
    };
    const items = keyItemsIn(regions);
    for (const region of regions) {
        // Zones a later mechanic brings (other regions' Poké Spots) wait for it.
        for (const zone of zonesIn(region).filter(
            z => z.mechanic == null || regions.includes(MECHANICS[z.mechanic].region)
        )) {
            for (const [pool, entries] of Object.entries(zonePools(zone.id)) as [
                EncounterPoolId,
                { id: number }[]
            ][]) {
                // A pool needing an item from a later region (Kanto's Headbutt trees) waits for it.
                if (pool === "walk" || items.has(pool)) {
                    entries.filter(e => catchableIn(zone.id, e.id)).forEach(e => add(e.id));
                }
            }
            const { swarm, contest } = occasionalSpecies(zone.id);
            [...swarm, ...contest].forEach(add);
        }
        SPECIAL_ENCOUNTERS.filter(s => s.region === region).forEach(s =>
            specialSpecies(s).forEach(add)
        );
        FEATURE_SPECIES[region]?.forEach(add);
        const def = REGION_LIST.find(r => r.id === region);
        [...(def?.starters ?? []), ...(def?.partnerStarters ?? [])].forEach(add);
        // Shadow Pokémon snagged from Orre's admins (purified into their species).
        if (def != null) {
            [...def.trials, ...def.finale(def.starters[0])].forEach(t => t.snag?.forEach(add));
        }
    }
    // Evolutions from later generations (Electabuzz into Electivire) wait for their own.
    const newest = Math.max(
        ...regions.map(r => REGION_LIST.find(def => def.id === r)?.newestSpecies ?? 386)
    );
    let changed = true;
    while (changed) {
        changed = false;
        for (const species of SPECIES) {
            const pre = PRE_EVOLUTION[species.id];
            if (species.id > newest || pre == null) continue;
            // A form's evolution counts through its species (Combee ♀ into Vespiquen).
            if (!found.has(species.id) && found.has(getSpecies(pre).baseSpecies ?? pre)) {
                found.add(species.id);
                changed = true;
            }
        }
    }
    return new Set([...found].filter(id => id <= DEX_SIZE));
}

/**
 * The Pokédex as far as the game's regions go: #1-251, plus each later species once a region
 * offers it (Orre's Hoenn Pokémon; the rest of Gen 3 arrives with Hoenn, Gen 4 with Sinnoh).
 * Species data exists for all of #1-493, but a species outside this set never appears.
 */
export const POKEDEX_IDS: number[] = (() => {
    const ids = new Set<number>(SPECIES.filter(s => s.id <= 251).map(s => s.id));
    speciesObtainableIn(REGION_LIST.map(r => r.id)).forEach(id => ids.add(id));
    return [...ids].sort((a, b) => a - b);
})();
export const POKEDEX_SET = new Set(POKEDEX_IDS);
export const POKEDEX_SIZE = POKEDEX_IDS.length;

/** Whether a species (or any form, which counts as released) can appear in the game. */
export function isReleased(id: number): boolean {
    return id > DEX_SIZE || POKEDEX_SET.has(id);
}

/** The species a region's Pokédex requirement asks for: everything the regions before it offer. */
export function pokedexRequirement(region: RegionDefinition): Set<number> {
    const index = REGION_LIST.findIndex(r => r.id === region.id);
    return speciesObtainableIn(REGION_LIST.slice(0, index).map(r => r.id));
}

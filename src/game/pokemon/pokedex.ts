/**
 * Which species the player can get in a set of regions: wild Pokémon (with any equipment),
 * special encounters, starters, and everything those evolve into. A form counts as its species.
 * New regions unlock once the Pokédex holds everything the earlier regions offer.
 */
import { DEX_SIZE, getSpecies, PRE_EVOLUTION, SPECIES } from "./data";
import type { RegionDefinition } from "./regions";
import { REGION_LIST } from "./regions";
import { SPECIAL_ENCOUNTERS, specialSpecies } from "./specials";
import type { RegionId } from "./zones";
import { allZoneSpecies, zonesIn } from "./zones";

/** The regular species (#1-251) obtainable in these regions. */
export function speciesObtainableIn(regions: RegionId[]): Set<number> {
    const found = new Set<number>();
    const add = (id: number) => {
        const species = getSpecies(id);
        found.add(id > DEX_SIZE ? (species.baseSpecies ?? id) : id);
    };
    for (const region of regions) {
        zonesIn(region).forEach(zone => allZoneSpecies(zone.id).forEach(add));
        SPECIAL_ENCOUNTERS.filter(s => s.region === region).forEach(s =>
            specialSpecies(s).forEach(add)
        );
        const def = REGION_LIST.find(r => r.id === region);
        [...(def?.starters ?? []), ...(def?.partnerStarters ?? [])].forEach(add);
    }
    let changed = true;
    while (changed) {
        changed = false;
        for (const species of SPECIES) {
            const pre = PRE_EVOLUTION[species.id];
            if (!found.has(species.id) && pre != null && found.has(pre)) {
                found.add(species.id);
                changed = true;
            }
        }
    }
    return new Set([...found].filter(id => id <= DEX_SIZE));
}

/** The species a region's Pokédex requirement asks for: everything the regions before it offer. */
export function pokedexRequirement(region: RegionDefinition): Set<number> {
    const index = REGION_LIST.findIndex(r => r.id === region.id);
    return speciesObtainableIn(REGION_LIST.slice(0, index).map(r => r.id));
}

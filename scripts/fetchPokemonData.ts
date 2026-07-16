import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { EncounterTableEntry, EncounterTableJSON, SpeciesData } from "../src/game/pokemon/types";

const API_BASE = "https://pokeapi.co/api/v2";
const VERSIONS = ["red", "blue"];
const METHOD = "walk";

const AREAS: { zoneId: string; slugs: string[] }[] = [
    { zoneId: "route1", slugs: ["kanto-route-1-area"] },
    {
        zoneId: "route2",
        slugs: [
            "kanto-route-2-south-towards-viridian-city",
            "kanto-route-2-north-towards-pewter-city"
        ]
    },
    { zoneId: "viridianForest", slugs: ["viridian-forest-area"] }
];

// Starters never appear in a wild encounter table, so they're fetched unconditionally.
const EXTRA_SPECIES = ["bulbasaur", "charmander", "squirtle"];

interface PokemonEncounter {
    pokemon: { name: string; url: string };
    version_details: {
        version: { name: string };
        max_chance: number;
        encounter_details: {
            chance: number;
            method: { name: string };
            min_level: number;
            max_level: number;
        }[];
    }[];
}

interface LocationAreaResponse {
    pokemon_encounters: PokemonEncounter[];
}

interface SpeciesResponse {
    id: number;
    capture_rate: number;
}

interface PokemonResponse {
    types: { type: { name: string } }[];
    stats: { stat: { name: string }; base_stat: number }[];
    sprites: { front_default: string | null; front_shiny: string | null };
}

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
}

interface AggregatedEncounter {
    speciesName: string;
    weight: number;
    minLevel: number;
    maxLevel: number;
}

async function fetchAreaEncounters(slug: string): Promise<AggregatedEncounter[]> {
    const data = await fetchJson<LocationAreaResponse>(`${API_BASE}/location-area/${slug}`);
    const results: AggregatedEncounter[] = [];

    for (const encounter of data.pokemon_encounters) {
        const chances: number[] = [];
        let minLevel = Infinity;
        let maxLevel = -Infinity;

        for (const versionDetail of encounter.version_details) {
            if (!VERSIONS.includes(versionDetail.version.name)) continue;
            for (const detail of versionDetail.encounter_details) {
                if (detail.method.name !== METHOD) continue;
                chances.push(detail.chance);
                minLevel = Math.min(minLevel, detail.min_level);
                maxLevel = Math.max(maxLevel, detail.max_level);
            }
        }

        if (chances.length === 0) continue;

        const avgChance = chances.reduce((sum, c) => sum + c, 0) / chances.length;
        results.push({
            speciesName: encounter.pokemon.name,
            weight: avgChance,
            minLevel,
            maxLevel
        });
    }

    return results;
}

async function buildEncounterTable(zoneId: string, slugs: string[]): Promise<EncounterTableJSON> {
    const perArea = await Promise.all(slugs.map(fetchAreaEncounters));
    const merged = new Map<string, AggregatedEncounter>();

    for (const areaResults of perArea) {
        for (const entry of areaResults) {
            const existing = merged.get(entry.speciesName);
            if (existing == null) {
                merged.set(entry.speciesName, { ...entry });
            } else {
                existing.weight += entry.weight;
                existing.minLevel = Math.min(existing.minLevel, entry.minLevel);
                existing.maxLevel = Math.max(existing.maxLevel, entry.maxLevel);
            }
        }
    }

    return {
        zoneId,
        locationAreaSlugs: slugs,
        versionGroup: "red-blue",
        entries: [...merged.values()].map(
            (e): EncounterTableEntry => ({
                speciesId: e.speciesName,
                weight: e.weight,
                minLevel: e.minLevel,
                maxLevel: e.maxLevel
            })
        )
    };
}

function statLookup(stats: PokemonResponse["stats"], name: string): number {
    return stats.find(s => s.stat.name === name)?.base_stat ?? 0;
}

async function fetchSpecies(name: string): Promise<SpeciesData> {
    const [species, pokemon] = await Promise.all([
        fetchJson<SpeciesResponse>(`${API_BASE}/pokemon-species/${name}`),
        fetchJson<PokemonResponse>(`${API_BASE}/pokemon/${name}`)
    ]);

    return {
        id: String(species.id),
        name,
        types: pokemon.types.map(t => t.type.name),
        captureRate: species.capture_rate,
        baseStats: {
            hp: statLookup(pokemon.stats, "hp"),
            attack: statLookup(pokemon.stats, "attack"),
            defense: statLookup(pokemon.stats, "defense"),
            specialAttack: statLookup(pokemon.stats, "special-attack"),
            specialDefense: statLookup(pokemon.stats, "special-defense"),
            speed: statLookup(pokemon.stats, "speed")
        },
        sprites: {
            front: pokemon.sprites.front_default ?? "",
            frontShiny: pokemon.sprites.front_shiny ?? ""
        }
    };
}

async function main() {
    console.log("Fetching encounter tables...");
    const tables = await Promise.all(AREAS.map(a => buildEncounterTable(a.zoneId, a.slugs)));

    const speciesNames = new Set<string>();
    for (const table of tables) {
        for (const entry of table.entries) {
            speciesNames.add(entry.speciesId);
        }
    }
    for (const name of EXTRA_SPECIES) {
        speciesNames.add(name);
    }

    console.log(`Fetching species data for ${speciesNames.size} species...`);
    const speciesEntries = await Promise.all(
        [...speciesNames].map(async name => {
            const data = await fetchSpecies(name);
            return [data.id, data] as const;
        })
    );
    const species: Record<string, SpeciesData> = Object.fromEntries(speciesEntries);

    // Re-key each table's entries by dex id (species.json's key), not species name.
    const nameToId = new Map(speciesEntries.map(([id, data]) => [data.name, id]));
    for (const table of tables) {
        table.entries = table.entries.map(entry => ({
            ...entry,
            speciesId: nameToId.get(entry.speciesId) ?? entry.speciesId
        }));
    }

    const dataDir = path.resolve(import.meta.dirname, "../src/data/pokemon");
    const encountersDir = path.join(dataDir, "encounters");
    await mkdir(encountersDir, { recursive: true });

    await writeFile(path.join(dataDir, "species.json"), JSON.stringify(species, null, 2));
    for (const table of tables) {
        await writeFile(
            path.join(encountersDir, `${table.zoneId}.json`),
            JSON.stringify(table, null, 2)
        );
    }

    console.log(`Wrote species.json (${Object.keys(species).length} species) and ${tables.length} encounter tables.`);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});

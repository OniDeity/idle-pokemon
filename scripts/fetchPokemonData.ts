/**
 * Regenerates the static Pokémon data the game ships with:
 *   - src/data/pokemon/species.json     Species #1-251 (stats, types, catch rate, evolutions)
 *   - src/data/pokemon/encounters.json  Wild encounter pools: Red/Blue for Kanto, FireRed/LeafGreen for Sevii
 *   - src/data/pokemon/typeChart.json   Non-neutral type matchups
 *
 * Source: the PokeAPI CSV dump on GitHub (https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv).
 * Reading the CSVs directly means one request per table instead of hundreds of REST calls.
 *
 * Usage: npm run fetch:pokemon
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CSV_BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv";
const MAX_DEX = 251;
const RED_BLUE_VERSION_IDS = new Set(["1", "2"]);
const FRLG_VERSION_IDS = new Set(["10", "11"]);
const ENGLISH = "9";

/**
 * Game zone id → [location identifier, location-area identifier] pairs from PokeAPI.
 * Multi-floor dungeons are merged into one zone. Keep in sync with src/game/pokemon/zones.ts.
 */
const ZONE_AREAS: Record<string, [string, string][]> = {
    route1: [["kanto-route-1", ""]],
    route22: [["kanto-route-22", ""]],
    route2: [["kanto-route-2", "south-towards-viridian-city"]],
    viridianForest: [["viridian-forest", ""]],
    route3: [["kanto-route-3", ""]],
    mtMoon: [
        ["mt-moon", "1f"],
        ["mt-moon", "b1f"],
        ["mt-moon", "b2f"]
    ],
    route4: [["kanto-route-4", ""]],
    route24: [["kanto-route-24", ""]],
    route25: [["kanto-route-25", ""]],
    route5: [["kanto-route-5", ""]],
    route6: [["kanto-route-6", ""]],
    route11: [["kanto-route-11", ""]],
    diglettsCave: [["digletts-cave", ""]],
    route9: [["kanto-route-9", ""]],
    route10: [["kanto-route-10", ""]],
    rockTunnel: [
        ["rock-tunnel", "b1f"],
        ["rock-tunnel", "b2f"]
    ],
    route8: [["kanto-route-8", ""]],
    route7: [["kanto-route-7", ""]],
    pokemonTower: [
        ["pokemon-tower", "3f"],
        ["pokemon-tower", "4f"],
        ["pokemon-tower", "5f"],
        ["pokemon-tower", "6f"],
        ["pokemon-tower", "7f"]
    ],
    route12: [["kanto-route-12", ""]],
    route13: [["kanto-route-13", ""]],
    route14: [["kanto-route-14", ""]],
    route15: [["kanto-route-15", ""]],
    route16: [["kanto-route-16", ""]],
    route17: [["kanto-route-17", ""]],
    route18: [["kanto-route-18", ""]],
    safariZone: [
        ["kanto-safari-zone", "middle"],
        ["kanto-safari-zone", "area-1-east"],
        ["kanto-safari-zone", "area-2-north"],
        ["kanto-safari-zone", "area-3-west"]
    ],
    powerPlant: [["kanto-power-plant", ""]],
    route19: [["kanto-sea-route-19", ""]],
    route20: [["kanto-sea-route-20", ""]],
    seafoamIslands: [
        ["seafoam-islands", "1f"],
        ["seafoam-islands", "b1f"],
        ["seafoam-islands", "b2f"],
        ["seafoam-islands", "b3f"],
        ["seafoam-islands", "b4f"]
    ],
    pokemonMansion: [
        ["pokemon-mansion", "1f"],
        ["pokemon-mansion", "2f"],
        ["pokemon-mansion", "3f"],
        ["pokemon-mansion", "b1f"]
    ],
    route21: [["kanto-sea-route-21", ""]],
    route23: [["kanto-route-23", ""]],
    victoryRoad: [
        ["kanto-victory-road-2", "1f"],
        ["kanto-victory-road-2", "2f"],
        ["kanto-victory-road-2", "3f"]
    ],
    ceruleanCave: [
        ["cerulean-cave", "1f"],
        ["cerulean-cave", "2f"],
        ["cerulean-cave", "b1f"]
    ]
};

/** Sevii Islands zones use FireRed/LeafGreen data (the islands aren't in Red/Blue). */
const SEVII_ZONE_AREAS: Record<string, [string, string][]> = {
    kindleRoad: [["kindle-road", ""]],
    treasureBeach: [["treasure-beach", ""]],
    mtEmber: [
        ["mt-ember", ""],
        ["mt-ember", "inside"],
        ["mt-ember", "cave"],
        ["mt-ember", "1f-cave-behind-team-rocket"],
        ["mt-ember", "b1f"],
        ["mt-ember", "b2f"],
        ["mt-ember", "b3f"]
    ],
    capeBrink: [["cape-brink", ""]],
    bondBridge: [["bond-bridge", ""]],
    threeIslePort: [["three-isle-port", ""]],
    berryForest: [["berry-forest", ""]],
    fourIsland: [["four-island", ""]],
    icefallCave: [
        ["icefall-cave", "entrance"],
        ["icefall-cave", "1f"],
        ["icefall-cave", "b1f"],
        ["icefall-cave", "waterfall"]
    ],
    resortGorgeous: [["resort-gorgeous", ""]],
    waterLabyrinth: [["water-labyrinth", ""]],
    memorialPillar: [["memorial-pillar", ""]],
    lostCave: [
        "room-1",
        "room-2",
        "room-3",
        "room-4",
        "room-5",
        "room-6",
        "room-7",
        "room-8",
        "room-9",
        "room-10",
        "item-rooms"
    ].map(a => ["lost-cave", a] as [string, string]),
    waterPath: [["water-path", ""]],
    ruinValley: [["ruin-valley", ""]],
    greenPath: [["green-path", ""]],
    outcastIsland: [["outcast-island", ""]],
    patternBush: [["pattern-bush", ""]],
    alteringCave: ["a", "b", "c", "d", "e", "f", "g", "h", "i"].map(
        a => ["kanto-altering-cave", a] as [string, string]
    ),
    canyonEntrance: [["canyon-entrance", ""]],
    sevaultCanyon: [["sevault-canyon", ""]],
    tanobyRuins: [["tanoby-ruins", ""]]
};

const POOL_BY_METHOD: Record<string, string> = {
    walk: "walk",
    surf: "surf",
    "old-rod": "oldRod",
    "good-rod": "goodRod",
    "super-rod": "superRod"
};

const STONE_BY_ITEM_ID: Record<string, string> = {
    "81": "moonStone",
    "82": "fireStone",
    "83": "thunderStone",
    "84": "waterStone",
    "85": "leafStone",
    "80": "sunStone"
};

const GROWTH_RATES: Record<string, string> = {
    "1": "slow",
    "2": "medium",
    "3": "fast",
    "4": "mediumSlow",
    "5": "erratic",
    "6": "fluctuating"
};

type Row = Record<string, string>;

async function fetchCsv(table: string): Promise<Row[]> {
    const res = await fetch(`${CSV_BASE}/${table}.csv`);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${table}.csv: ${res.status} ${res.statusText}`);
    }
    const [header, ...lines] = (await res.text()).trim().split(/\r?\n/);
    const keys = header.split(",");
    // None of the tables we read have quoted commas in the columns we use.
    return lines.map(line => {
        const values = line.split(",");
        return Object.fromEntries(keys.map((k, i) => [k, values[i] ?? ""]));
    });
}

interface Evolution {
    into: number;
    method: "level" | "stone" | "trade";
    level?: number;
    stone?: string;
}

async function main() {
    console.log("Downloading PokeAPI CSV tables...");
    const [
        speciesRows,
        pokemonRows,
        statRows,
        typeRows,
        typeNameRows,
        speciesNameRows,
        evolutionRows,
        efficacyRows,
        encounterRows,
        slotRows,
        methodRows,
        areaRows,
        locationRows
    ] = await Promise.all(
        [
            "pokemon_species",
            "pokemon",
            "pokemon_stats",
            "pokemon_types",
            "types",
            "pokemon_species_names",
            "pokemon_evolution",
            "type_efficacy",
            "encounters",
            "encounter_slots",
            "encounter_methods",
            "location_areas",
            "locations"
        ].map(fetchCsv)
    );

    const typeName = new Map(typeNameRows.map(r => [r.id, r.identifier]));
    const displayName = new Map(
        speciesNameRows
            .filter(r => r.local_language_id === ENGLISH)
            .map(r => [r.pokemon_species_id, r.name])
    );
    const baseExp = new Map(pokemonRows.map(r => [r.id, Number(r.base_experience)]));

    const statsById = new Map<string, number[]>();
    for (const r of statRows) {
        const stats = statsById.get(r.pokemon_id) ?? [0, 0, 0, 0, 0, 0];
        stats[Number(r.stat_id) - 1] = Number(r.base_stat);
        statsById.set(r.pokemon_id, stats);
    }

    const typesById = new Map<string, string[]>();
    for (const r of [...typeRows].sort((a, b) => Number(a.slot) - Number(b.slot))) {
        const types = typesById.get(r.pokemon_id) ?? [];
        types.push(typeName.get(r.type_id) ?? "normal");
        typesById.set(r.pokemon_id, types);
    }

    const preEvolutionOf = new Map(speciesRows.map(r => [r.id, r.evolves_from_species_id]));
    const babies = new Set(speciesRows.filter(r => r.is_baby === "1").map(r => r.id));
    const evolutions = new Map<number, Evolution[]>();
    const seenEvolutions = new Set<string>();
    for (const r of evolutionRows) {
        const into = Number(r.evolved_species_id);
        const from = Number(preEvolutionOf.get(r.evolved_species_id));
        if (into > MAX_DEX || !from || from > MAX_DEX) continue;
        // Later generations add alternate rows (regional forms, new items); the first is the original.
        const key = `${from}->${into}`;
        if (seenEvolutions.has(key)) continue;
        seenEvolutions.add(key);

        let evolution: Evolution;
        if (r.evolution_trigger_id === "1" && r.minimum_level !== "") {
            evolution = { into, method: "level", level: Number(r.minimum_level) };
        } else if (r.evolution_trigger_id === "1" && r.minimum_happiness !== "") {
            // Friendship evolutions become level evolutions: babies grow up fast, others at 30.
            const baby = babies.has(String(from));
            evolution = { into, method: "level", level: baby ? 15 : 30 };
        } else if (r.evolution_trigger_id === "2") {
            evolution = { into, method: "trade" };
        } else if (r.evolution_trigger_id === "3" && STONE_BY_ITEM_ID[r.trigger_item_id]) {
            evolution = { into, method: "stone", stone: STONE_BY_ITEM_ID[r.trigger_item_id] };
        } else {
            continue;
        }
        evolutions.set(from, [...(evolutions.get(from) ?? []), evolution]);
    }

    const species = speciesRows
        .filter(r => Number(r.id) <= MAX_DEX)
        .map(r => ({
            id: Number(r.id),
            name: displayName.get(r.id) ?? r.identifier,
            types: typesById.get(r.id) ?? ["normal"],
            // [hp, attack, defense, special-attack, special-defense, speed]
            baseStats: statsById.get(r.id) ?? [0, 0, 0, 0, 0, 0],
            baseExp: baseExp.get(r.id) ?? 50,
            captureRate: Number(r.capture_rate),
            growthRate: GROWTH_RATES[r.growth_rate_id] ?? "medium",
            legendary: r.is_legendary === "1" || r.is_mythical === "1",
            evolutions: evolutions.get(Number(r.id)) ?? []
        }))
        .sort((a, b) => a.id - b.id);

    const typeChart: Record<string, Record<string, number>> = {};
    for (const r of efficacyRows) {
        const factor = Number(r.damage_factor) / 100;
        if (factor === 1) continue;
        const attack = typeName.get(r.damage_type_id);
        const defend = typeName.get(r.target_type_id);
        if (attack == null || defend == null) continue;
        typeChart[attack] = { ...typeChart[attack], [defend]: factor };
    }

    // Encounters: sum slot rarities per species within each pool, across both versions and all
    // floors of a zone. Version exclusives stay in (the game merges Red and Blue).
    const locationId = new Map(locationRows.map(r => [r.identifier, r.id]));
    const areaKey = new Map(areaRows.map(r => [`${r.location_id}/${r.identifier}`, r.id]));
    const methodName = new Map(methodRows.map(r => [r.id, r.identifier]));
    const slots = new Map(slotRows.map(r => [r.id, r]));

    const zoneByArea = new Map<string, string>();
    const zoneVersions = new Map<string, Set<string>>();
    const allZones = { ...ZONE_AREAS, ...SEVII_ZONE_AREAS };
    for (const [zoneId, areas] of Object.entries(allZones)) {
        zoneVersions.set(
            zoneId,
            zoneId in SEVII_ZONE_AREAS ? FRLG_VERSION_IDS : RED_BLUE_VERSION_IDS
        );
        for (const [location, area] of areas) {
            const id = areaKey.get(`${locationId.get(location)}/${area}`);
            if (id == null) throw new Error(`Unknown location area ${location}/${area}`);
            zoneByArea.set(id, zoneId);
        }
    }

    type Acc = { weight: number; minLevel: number; maxLevel: number };
    const pools: Record<string, Record<string, Map<number, Acc>>> = {};
    for (const r of encounterRows) {
        const zoneId = zoneByArea.get(r.location_area_id);
        if (zoneId == null || !zoneVersions.get(zoneId)?.has(r.version_id)) continue;
        const slot = slots.get(r.encounter_slot_id);
        const pool = POOL_BY_METHOD[methodName.get(slot?.encounter_method_id ?? "") ?? ""];
        const id = Number(r.pokemon_id);
        if (zoneId == null || slot == null || pool == null || id > MAX_DEX) continue;

        const zonePools = (pools[zoneId] ??= {});
        const entries = (zonePools[pool] ??= new Map());
        const acc = entries.get(id) ?? { weight: 0, minLevel: Infinity, maxLevel: -Infinity };
        acc.weight += Number(slot.rarity);
        acc.minLevel = Math.min(acc.minLevel, Number(r.min_level));
        acc.maxLevel = Math.max(acc.maxLevel, Number(r.max_level));
        entries.set(id, acc);
    }

    const encounters = Object.fromEntries(
        Object.keys(allZones).map(zoneId => [
            zoneId,
            Object.fromEntries(
                Object.entries(pools[zoneId] ?? {}).map(([pool, entries]) => [
                    pool,
                    [...entries.entries()]
                        .sort((a, b) => b[1].weight - a[1].weight)
                        .map(([id, acc]) => ({
                            id,
                            weight: acc.weight,
                            minLevel: acc.minLevel,
                            maxLevel: acc.maxLevel
                        }))
                ])
            )
        ])
    );

    const dataDir = path.resolve(import.meta.dirname, "../src/data/pokemon");
    await mkdir(dataDir, { recursive: true });
    await writeFile(path.join(dataDir, "species.json"), JSON.stringify(species, null, 1) + "\n");
    await writeFile(
        path.join(dataDir, "encounters.json"),
        JSON.stringify(encounters, null, 1) + "\n"
    );
    await writeFile(
        path.join(dataDir, "typeChart.json"),
        JSON.stringify(typeChart, null, 1) + "\n"
    );
    console.log(
        `Wrote ${species.length} species, ${Object.keys(encounters).length} zones, ${
            Object.keys(typeChart).length
        } attacking types.`
    );
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});

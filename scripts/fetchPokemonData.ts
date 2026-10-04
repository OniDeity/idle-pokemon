/**
 * Regenerates the static Pokémon data the game ships with:
 *   - src/data/pokemon/species.json     Species #1-386 (stats, types, catch rate, evolutions)
 *   - src/data/pokemon/encounters.json  Wild encounter pools: Red/Blue for Kanto, FireRed/LeafGreen for Sevii,
 *                                      HeartGold/SoulSilver for Johto, Ruby/Sapphire/Emerald for Hoenn
 *   - src/data/pokemon/typeChart.json   Non-neutral type matchups
 *   - src/data/pokemon/forms.json       Official alternate forms of #1-251 (regional forms, Pikachu
 *                                       caps, partner Pokémon, Unown letters, Spiky-eared Pichu)
 *
 * Source: the PokeAPI CSV dump on GitHub (https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv).
 * Reading the CSVs directly means one request per table instead of hundreds of REST calls.
 *
 * Usage: npm run fetch:pokemon
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CSV_BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv";
/** Species data covers Gens 1-3; Gen 3 Pokémon join the Pokédex as regions bring them. */
const MAX_SPECIES = 386;
/** Encounter tables before Hoenn, and official forms, stay Gen 1-2; Hoenn's go to #386. */
const MAX_DEX = 251;
const RED_BLUE_VERSION_IDS = new Set(["1", "2"]);
const FRLG_VERSION_IDS = new Set(["10", "11"]);
const HGSS_VERSION_IDS = new Set(["15", "16"]);
const RSE_VERSION_IDS = new Set(["7", "8", "9"]);
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

/**
 * Kanto's Headbutt trees, which Red/Blue never had, come from HeartGold/SoulSilver's Kanto.
 * HGSS tunes them for its postgame, so they take their zone's grass levels instead.
 */
const KANTO_HEADBUTT_AREAS: Record<string, [string, string][]> = {
    route1: [["kanto-route-1", ""]],
    route22: [["kanto-route-22", ""]],
    route2: [
        ["kanto-route-2", "south-towards-viridian-city"],
        ["kanto-route-2", "north-towards-pewter-city"]
    ],
    viridianForest: [["viridian-forest", ""]],
    route3: [["kanto-route-3", ""]],
    route4: [["kanto-route-4", ""]],
    route25: [["kanto-route-25", ""]],
    route5: [["kanto-route-5", ""]],
    route6: [["kanto-route-6", ""]],
    route11: [["kanto-route-11", ""]],
    route8: [["kanto-route-8", ""]],
    route7: [["kanto-route-7", ""]],
    route12: [["kanto-route-12", ""]],
    route13: [["kanto-route-13", ""]],
    route14: [["kanto-route-14", ""]],
    route15: [["kanto-route-15", ""]],
    route16: [["kanto-route-16", ""]],
    route18: [["kanto-route-18", ""]],
    route21: [["kanto-sea-route-21", ""]]
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

/**
 * Johto zones use HeartGold/SoulSilver data. Routes 26-28, Tohjo Falls and Victory Road sit on
 * the Kanto side of PokeAPI's map but are part of the Johto journey.
 */
const JOHTO_ZONE_AREAS: Record<string, [string, string][]> = {
    newBarkTown: [["new-bark-town", ""]],
    route29: [["johto-route-29", ""]],
    route46: [["johto-route-46", ""]],
    cherrygroveCity: [["cherrygrove-city", ""]],
    route30: [["johto-route-30", ""]],
    route31: [["johto-route-31", ""]],
    darkCave: [["dark-cave", "violet-city-entrance"]],
    violetCity: [["violet-city", ""]],
    sproutTower: [
        ["sprout-tower", "2f"],
        ["sprout-tower", "3f"]
    ],
    route32: [["johto-route-32", ""]],
    ruinsOfAlph: [["ruins-of-alph", "outside"]],
    unionCave: [
        ["union-cave", "1f"],
        ["union-cave", "b1f"],
        ["union-cave", "b2f"]
    ],
    route33: [["johto-route-33", ""]],
    azaleaTown: [["azalea-town", "area"]],
    slowpokeWell: [
        ["slowpoke-well", "1f"],
        ["slowpoke-well", "b1f"]
    ],
    ilexForest: [["ilex-forest", ""]],
    route34: [["johto-route-34", ""]],
    route35: [["johto-route-35", ""]],
    nationalPark: [["national-park", ""]],
    route36: [["johto-route-36", ""]],
    route37: [["johto-route-37", ""]],
    ecruteakCity: [["ecruteak-city", ""]],
    burnedTower: [
        ["burned-tower", "1f"],
        ["burned-tower", "b1f"]
    ],
    route38: [["johto-route-38", ""]],
    route39: [["johto-route-39", ""]],
    olivineCity: [["olivine-city", ""]],
    route40: [["johto-sea-route-40", ""]],
    route41: [["johto-sea-route-41", ""]],
    whirlIslands: ["1f", "b1f", "b2f", "b3f"].map(a => ["whirl-islands", a] as [string, string]),
    cianwoodCity: [["cianwood-city", ""]],
    route47: [
        ["johto-route-47", ""],
        ["johto-route-47", "cave-gate"],
        ["johto-route-47", "inside-cave"]
    ],
    route48: [["johto-route-48", ""]],
    johtoSafariZone: [
        "desert",
        "forest",
        "marshland",
        "meadow",
        "mountain",
        "peak",
        "plains",
        "rocky-beach",
        "savannah",
        "swamp",
        "wasteland",
        "wetland"
    ].map(a => ["johto-safari-zone", a] as [string, string]),
    route42: [["johto-route-42", ""]],
    mtMortar: ["1f", "b1f", "lower-cave", "upper-cave"].map(
        a => ["mt-mortar", a] as [string, string]
    ),
    route43: [["johto-route-43", ""]],
    lakeOfRage: [["lake-of-rage", ""]],
    route44: [["johto-route-44", ""]],
    icePath: ["1f", "b1f", "b2f", "b3f"].map(a => ["ice-path", a] as [string, string]),
    blackthornCity: [["blackthorn-city", ""]],
    darkCaveBlackthorn: [["dark-cave", "blackthorn-city-entrance"]],
    dragonsDen: [["dragons-den", ""]],
    route45: [["johto-route-45", ""]],
    route27: [["kanto-route-27", ""]],
    tohjoFalls: [["tohjo-falls", ""]],
    route26: [["kanto-route-26", ""]],
    johtoVictoryRoad: ["1f", "2f", "3f"].map(a => ["kanto-victory-road-1", a] as [string, string]),
    route28: [["kanto-route-28", ""]],
    mtSilver: ["outside", "mountainside", "1f", "1f-top", "2f", "3f", "4f", "top"].map(
        a => ["mt-silver", a] as [string, string]
    )
};

/**
 * Hoenn zones from Ruby, Sapphire and Emerald. Sea routes with the same Surf and fishing tables
 * are grouped, and multi-floor dungeons merged.
 */
const HOENN_ZONE_AREAS: Record<string, [string, string][]> = {
    route101: [["hoenn-route-101", ""]],
    route103: [["hoenn-route-103", ""]],
    route102: [["hoenn-route-102", ""]],
    petalburgCity: [["petalburg-city", ""]],
    route104: [["hoenn-route-104", ""]],
    petalburgWoods: [["petalburg-woods", ""]],
    route116: [["hoenn-route-116", ""]],
    rusturfTunnel: [["rusturf-tunnel", ""]],
    dewfordTown: [["dewford-town", ""]],
    graniteCave: ["1f", "1fsmall-room", "b1f", "b2f"].map(
        a => ["granite-cave", a] as [string, string]
    ),
    slateportCity: [["slateport-city", ""]],
    route110: [["hoenn-route-110", ""]],
    route117: [["hoenn-route-117", ""]],
    route118: [["hoenn-route-118", ""]],
    route112: [["hoenn-route-112", ""]],
    fieryPath: [["fiery-path", ""]],
    route113: [["hoenn-route-113", ""]],
    route114: [["hoenn-route-114", ""]],
    meteorFalls: [["meteor-falls", ""]],
    jaggedPass: [["jagged-pass", ""]],
    newMauville: [
        ["new-mauville", "entrance"],
        ["new-mauville", ""]
    ],
    route111: [["hoenn-route-111", ""]],
    mirageTower: [["mirage-tower", ""]],
    hoennAlteringCave: [["hoenn-altering-cave", ""]],
    seaRoutes105to109: ["105", "106", "107", "108", "109"].map(
        n => [`hoenn-route-${n}`, ""] as [string, string]
    ),
    abandonedShip: [["abandoned-ship", ""]],
    route119: [["hoenn-route-119", ""]],
    route120: [["hoenn-route-120", ""]],
    route121: [["hoenn-route-121", ""]],
    hoennSafariZone: ["se", "sw", "neacro-bike-area", "nwmach-bike-area"].map(
        a => ["hoenn-safari-zone", a] as [string, string]
    ),
    route122: [["hoenn-route-122", ""]],
    mtPyre: ["1f", "2f", "3f", "4f", "5f", "6f"].map(a => ["mt-pyre", a] as [string, string]),
    mtPyreSummit: [
        ["mt-pyre", "outside"],
        ["mt-pyre", "summit"]
    ],
    route123: [["hoenn-route-123", ""]],
    lilycoveCity: [["lilycove-city", ""]],
    magmaHideout: [["magma-hideout", ""]],
    seaRoutes124to125: [
        ["hoenn-route-124", ""],
        ["hoenn-route-125", ""]
    ],
    mossdeepCity: [["mossdeep-city", ""]],
    shoalCave: ["low-tide", "high-tide", "b1f", "b2f", "b3f"].map(
        a => ["shoal-cave", a] as [string, string]
    ),
    underwater: [
        ["hoenn-route-124", "underwater"],
        ["hoenn-route-126", "underwater"]
    ],
    seafloorCavern: [["seafloor-cavern", ""]],
    seaRoutes126to128: ["126", "127", "128"].map(n => [`hoenn-route-${n}`, ""] as [string, string]),
    sootopolisCity: [["sootopolis-city", ""]],
    caveOfOrigin: ["entrance", "1f", "b1f", "b2f", "b3f"].map(
        a => ["cave-of-origin", a] as [string, string]
    ),
    seaRoutes129to131: ["129", "130", "131"].map(n => [`hoenn-route-${n}`, ""] as [string, string]),
    skyPillar: ["1f", "3f", "5f"].map(a => ["sky-pillar", a] as [string, string]),
    pacifidlogTown: [["pacifidlog-town", ""]],
    seaRoutes132to134: ["132", "133", "134"].map(n => [`hoenn-route-${n}`, ""] as [string, string]),
    everGrandeCity: [["ever-grande-city", ""]],
    hoennVictoryRoad: ["1f", "b1f", "b2f"].map(a => ["hoenn-victory-road", a] as [string, string]),
    meteorFallsDeep: [
        ["meteor-falls", "b1f"],
        ["meteor-falls", "back"],
        ["meteor-falls", "backsmall-room"]
    ],
    desertUnderpass: [["desert-underpass", ""]],
    safariZoneExpansion: [
        ["hoenn-safari-zone", "expansion-north"],
        ["hoenn-safari-zone", "expansion-south"]
    ],
    artisanCave: [["artisan-cave", ""]],
    mirageIsland: [["mirage-island", ""]]
};

/**
 * HeartGold/SoulSilver encounters that only happen under conditions the game doesn't have
 * (radio shows playing Hoenn or Sinnoh sounds, swarms, the Bug-Catching Contest, Safari Zone
 * objects placed for a while). Swarms and the contest come back as their own features.
 */
function excludedCondition(value: string): boolean {
    return (
        value === "radio-hoenn" ||
        value === "radio-sinnoh" ||
        value === "swarm-yes" ||
        value === "bug-catching-contest-yes" ||
        (value.startsWith("johto-safari-blocks-") && value !== "johto-safari-blocks-inactive")
    );
}

const TIMES = ["morning", "day", "night"] as const;

const POOL_BY_METHOD: Record<string, string> = {
    walk: "walk",
    surf: "surf",
    "old-rod": "oldRod",
    "good-rod": "goodRod",
    "super-rod": "superRod",
    headbutt: "headbutt",
    "rock-smash": "rockSmash",
    seaweed: "dive"
};

const STONE_BY_ITEM_ID: Record<string, string> = {
    "81": "moonStone",
    "82": "fireStone",
    "83": "thunderStone",
    "84": "waterStone",
    "85": "leafStone",
    "80": "sunStone"
};

/** Items a Pokémon must hold to evolve by trade. */
const HELD_ITEM_BY_ITEM_ID: Record<string, string> = {
    "198": "kingsRock",
    "210": "metalCoat",
    "212": "dragonScale",
    "229": "upGrade",
    "203": "deepSeaTooth",
    "204": "deepSeaScale",
    "580": "prismScale"
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
    /** A friendship evolution: also possible early with a Soothe Bell. */
    friendship?: boolean;
    /** For trade evolutions: an item it must hold, used up alongside the Link Cable. */
    heldItem?: string;
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
        locationRows,
        formRows,
        formNameRows,
        conditionValueRows,
        conditionMapRows
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
            "locations",
            "pokemon_forms",
            "pokemon_form_names",
            "encounter_condition_values",
            "encounter_condition_value_map"
        ].map(fetchCsv)
    );

    const typeName = new Map(typeNameRows.map(r => [r.id, r.identifier]));
    const displayName = new Map(
        speciesNameRows
            .filter(r => r.local_language_id === ENGLISH)
            .map(r => [r.pokemon_species_id, r.name])
    );
    const baseExp = new Map(pokemonRows.map(r => [r.id, Number(r.base_experience)]));
    // PokeAPI weighs Pokémon in hectograms; the Heavy Ball works in kilograms.
    const weightKg = new Map(pokemonRows.map(r => [r.id, Number(r.weight) / 10]));

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
        if (into > MAX_SPECIES || !from || from > MAX_SPECIES) continue;
        // The game uses later generations' easier methods where they replaced one: Feebas's
        // Beauty became trading while holding a Prism Scale (Black/White onward).
        if (r.minimum_beauty !== "") continue;
        // Later generations add alternate rows (regional forms, new items); the first is the original.
        const key = `${from}->${into}`;
        if (seenEvolutions.has(key)) continue;
        seenEvolutions.add(key);

        let evolution: Evolution;
        if (r.evolution_trigger_id === "1" && r.minimum_level !== "") {
            evolution = { into, method: "level", level: Number(r.minimum_level) };
        } else if (r.evolution_trigger_id === "1" && r.minimum_happiness !== "") {
            // Friendship evolutions become level evolutions (babies grow up fast, others at 30),
            // or happen early with a Soothe Bell.
            const baby = babies.has(String(from));
            evolution = { into, method: "level", level: baby ? 15 : 30, friendship: true };
        } else if (r.evolution_trigger_id === "2") {
            const heldItem = HELD_ITEM_BY_ITEM_ID[r.held_item_id];
            evolution =
                heldItem != null ? { into, method: "trade", heldItem } : { into, method: "trade" };
        } else if (r.evolution_trigger_id === "3" && STONE_BY_ITEM_ID[r.trigger_item_id]) {
            evolution = { into, method: "stone", stone: STONE_BY_ITEM_ID[r.trigger_item_id] };
        } else {
            continue;
        }
        evolutions.set(from, [...(evolutions.get(from) ?? []), evolution]);
    }

    const species = speciesRows
        .filter(r => Number(r.id) <= MAX_SPECIES)
        .map(r => ({
            id: Number(r.id),
            name: displayName.get(r.id) ?? r.identifier,
            types: typesById.get(r.id) ?? ["normal"],
            // [hp, attack, defense, special-attack, special-defense, speed]
            baseStats: statsById.get(r.id) ?? [0, 0, 0, 0, 0, 0],
            baseExp: baseExp.get(r.id) ?? 50,
            weight: weightKg.get(r.id) ?? 0,
            captureRate: Number(r.capture_rate),
            growthRate: GROWTH_RATES[r.growth_rate_id] ?? "medium",
            legendary: r.is_legendary === "1" || r.is_mythical === "1",
            // -1 = genderless, otherwise eighths female.
            genderRate: Number(r.gender_rate),
            genderDifferences: r.has_gender_differences === "1",
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
    // floors of a zone. Version exclusives stay in (the game merges Red and Blue). HeartGold and
    // SoulSilver split many tables by time of day; those weights are kept per time too.
    const locationId = new Map(locationRows.map(r => [r.identifier, r.id]));
    const areaKey = new Map(areaRows.map(r => [`${r.location_id}/${r.identifier}`, r.id]));
    const methodName = new Map(methodRows.map(r => [r.id, r.identifier]));
    const slots = new Map(slotRows.map(r => [r.id, r]));

    const zoneByArea = new Map<string, string>();
    const zoneVersions = new Map<string, Set<string>>();
    const allZones = {
        ...ZONE_AREAS,
        ...SEVII_ZONE_AREAS,
        ...JOHTO_ZONE_AREAS,
        ...HOENN_ZONE_AREAS
    };
    for (const [zoneId, areas] of Object.entries(allZones)) {
        zoneVersions.set(
            zoneId,
            zoneId in HOENN_ZONE_AREAS
                ? RSE_VERSION_IDS
                : zoneId in JOHTO_ZONE_AREAS
                  ? HGSS_VERSION_IDS
                  : zoneId in SEVII_ZONE_AREAS
                    ? FRLG_VERSION_IDS
                    : RED_BLUE_VERSION_IDS
        );
        for (const [location, area] of areas) {
            const id = areaKey.get(`${locationId.get(location)}/${area}`);
            if (id == null) throw new Error(`Unknown location area ${location}/${area}`);
            zoneByArea.set(id, zoneId);
        }
    }

    const headbuttZoneByArea = new Map<string, string>();
    for (const [zoneId, areas] of Object.entries(KANTO_HEADBUTT_AREAS)) {
        for (const [location, area] of areas) {
            const id = areaKey.get(`${locationId.get(location)}/${area}`);
            if (id == null) throw new Error(`Unknown location area ${location}/${area}`);
            headbuttZoneByArea.set(id, zoneId);
        }
    }

    const conditionName = new Map(conditionValueRows.map(r => [r.id, r.identifier]));
    const conditionsOf = new Map<string, string[]>();
    for (const r of conditionMapRows) {
        const name = conditionName.get(r.encounter_condition_value_id) ?? "";
        conditionsOf.set(r.encounter_id, [...(conditionsOf.get(r.encounter_id) ?? []), name]);
    }

    type Acc = {
        weight: number;
        minLevel: number;
        maxLevel: number;
        byTime: Record<(typeof TIMES)[number], number>;
    };
    const pools: Record<string, Record<string, Map<number, Acc>>> = {};
    const timedPools = new Set<string>();
    for (const r of encounterRows) {
        const slot = slots.get(r.encounter_slot_id);
        const pool = POOL_BY_METHOD[methodName.get(slot?.encounter_method_id ?? "") ?? ""];
        const headbuttZone = headbuttZoneByArea.get(r.location_area_id);
        const borrowed =
            pool === "headbutt" && headbuttZone != null && HGSS_VERSION_IDS.has(r.version_id);
        const zoneId = borrowed ? headbuttZone : zoneByArea.get(r.location_area_id);
        if (zoneId == null || (!borrowed && !zoneVersions.get(zoneId)?.has(r.version_id))) {
            continue;
        }
        const id = Number(r.pokemon_id);
        const maxDex = zoneId in HOENN_ZONE_AREAS ? MAX_SPECIES : MAX_DEX;
        if (zoneId == null || slot == null || pool == null || id > maxDex) continue;
        const conditions = conditionsOf.get(r.id) ?? [];
        if (conditions.some(excludedCondition)) continue;
        const times = TIMES.filter(t => conditions.includes(`time-${t}`));
        if (times.length > 0) timedPools.add(`${zoneId}/${pool}`);

        const zonePools = (pools[zoneId] ??= {});
        const entries = (zonePools[pool] ??= new Map());
        const acc = entries.get(id) ?? {
            weight: 0,
            minLevel: Infinity,
            maxLevel: -Infinity,
            byTime: { morning: 0, day: 0, night: 0 }
        };
        const rarity = Number(slot.rarity);
        acc.weight += rarity;
        for (const t of times.length > 0 ? times : TIMES) acc.byTime[t] += rarity;
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
                        .map(([id, acc]) => {
                            const timed = timedPools.has(`${zoneId}/${pool}`);
                            const { morning, day, night } = acc.byTime;
                            const varies = morning !== day || day !== night;
                            return {
                                id,
                                // A timed table counts each slot once per time of day.
                                weight: timed ? (morning + day + night) / 3 : acc.weight,
                                minLevel: acc.minLevel,
                                maxLevel: acc.maxLevel,
                                ...(timed && varies ? { byTime: { morning, day, night } } : {})
                            };
                        })
                ])
            )
        ])
    );

    // Borrowed Kanto Headbutt trees take their zone's grass levels.
    for (const zoneId of Object.keys(KANTO_HEADBUTT_AREAS)) {
        const zone = encounters[zoneId] as Record<string, { minLevel: number; maxLevel: number }[]>;
        const walk = zone.walk ?? [];
        if (zone.headbutt == null || walk.length === 0) continue;
        const min = Math.min(...walk.map(e => e.minLevel));
        const max = Math.max(...walk.map(e => e.maxLevel));
        zone.headbutt.forEach(e => Object.assign(e, { minLevel: min, maxLevel: max }));
    }

    // Official alternate forms. Battle-only forms (Mega, Gigantamax, Totem) are left out: they
    // belong to future regions' battle mechanics, not to catching.
    const speciesOfPokemon = new Map(pokemonRows.map(r => [r.id, Number(r.species_id)]));
    const formsByPokemon = new Map(formRows.map(r => [r.id, r]));
    const englishFormName = new Map(
        formNameRows
            .filter(r => r.local_language_id === ENGLISH)
            .map(r => [formsByPokemon.get(r.pokemon_form_id)?.identifier ?? "", r])
    );
    const REGION_OF_FORM: [RegExp, string][] = [
        [/-alola$/, "alola"],
        [/-galar$/, "galar"],
        [/-hisui$/, "hisui"],
        [/-paldea/, "paldea"],
        [/-original-cap$/, "kanto"],
        [/-world-cap$/, "galar"],
        [/-hoenn-cap$|-rock-star|-belle|-pop-star|-phd|-libre|-cosplay/, "hoenn"],
        [/-sinnoh-cap$/, "sinnoh"],
        [/-unova-cap$/, "unova"],
        [/-kalos-cap$/, "kalos"],
        [/-(alola|partner)-cap$/, "alola"],
        [/-starter$/, "kanto"],
        [/^unown-/, "johto"],
        [/-spiky-eared$/, "johto"]
    ];
    const forms = formRows
        .filter(r => r.form_identifier !== "" && r.is_battle_only === "0" && r.is_mega === "0")
        .filter(r => !/gmax|totem/.test(r.identifier))
        .map(r => ({ r, species: speciesOfPokemon.get(r.pokemon_id) ?? 0 }))
        .filter(({ species }) => species > 0 && species <= MAX_DEX)
        .map(({ r, species }, i) => {
            const pokemonId = Number(r.pokemon_id);
            const names = englishFormName.get(r.identifier);
            // Forms that are their own Pokémon (regional forms, caps) keep PokeAPI's id; forms that
            // only change looks (Unown letters) get ids from 4000.
            const ownPokemon = pokemonId > 10000;
            const baseName = displayName.get(String(species)) ?? r.identifier;
            return {
                id: ownPokemon ? pokemonId : 4000 + i,
                speciesId: species,
                identifier: r.identifier,
                name:
                    names?.pokemon_name || `${baseName} (${names?.form_name ?? r.form_identifier})`,
                region: REGION_OF_FORM.find(([pattern]) => pattern.test(r.identifier))?.[1] ?? null,
                // Unown A is the default Unown sprite; the repo has no front "201-a".
                sprite: ownPokemon
                    ? String(pokemonId)
                    : r.form_identifier === "a"
                      ? String(species)
                      : `${species}-${r.form_identifier}`,
                types: typesById.get(r.pokemon_id) ?? typesById.get(String(species)) ?? ["normal"],
                baseStats: statsById.get(r.pokemon_id) ?? statsById.get(String(species)),
                baseExp: baseExp.get(r.pokemon_id) || baseExp.get(String(species)) || 50
            };
        });

    const dataDir = path.resolve(import.meta.dirname, "../src/data/pokemon");
    await mkdir(dataDir, { recursive: true });
    await writeFile(path.join(dataDir, "species.json"), JSON.stringify(species, null, 1) + "\n");
    await writeFile(
        path.join(dataDir, "encounters.json"),
        JSON.stringify(encounters, null, 1) + "\n"
    );
    await writeFile(path.join(dataDir, "forms.json"), JSON.stringify(forms, null, 1) + "\n");
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

import type { EncounterEntry, EncounterPoolId, FieldAbility, Season } from "./data";
import {
    enc,
    ENCOUNTERS,
    femaleForm,
    isShadow,
    magikarpPatterns,
    SHADOW_OFFSET,
    shadowOf,
    WILD_VARIANTS
} from "./data";
import type { KeyItemId } from "./items";
import { COLOSSEUM_ZONES } from "./colosseum";
import type { MechanicId } from "./mechanics";
import { CARRIED_POKE_SPOTS, XD_ZONES } from "./xd";
import { JOHTO_ANIME_ZONES } from "./johtoAnime";
import { KANTO_ANIME_ZONES, MORE_KANTO_ANIME_ZONES } from "./kantoAnime";
import { MORE_ORANGE_ZONES, ORANGE_ZONES } from "./orange";
import { HOENN_ZONES } from "./hoenn";
import { HOENN_ANIME_ZONES } from "./hoennAnime";
import { SINNOH_EXTRAS, SINNOH_ZONES } from "./sinnoh";
import { ALMIA_ZONES } from "./almia";
import { FIORE_ZONES } from "./fiore";
import { OBLIVIA_ZONES } from "./oblivia";
import {
    AUDINO,
    AUDINO_SHARE,
    inSeason,
    PHENOMENON_CHANCE,
    SEASON_DEERLING_SHARE,
    SEASON_TYPE_BOOST,
    seasonForm,
    UNOVA_EXTRAS,
    UNOVA_ZONES
} from "./unova";
import { UNOVA2_ZONES } from "./unova2";
import { BUG_CONTEST_POOL, JOHTO_SWARMS, JOHTO_ZONES } from "./johto";
import { SEVII_ZONES } from "./sevii";

export type RegionId =
    | "kanto"
    | "orange"
    | "sevii"
    | "johto"
    | "hoenn"
    | "orre"
    | "orreXd"
    | "sinnoh"
    | "fiore"
    | "almia"
    | "oblivia"
    | "unova"
    | "unova2";

export type ZonePools = Partial<Record<EncounterPoolId, EncounterEntry[]>>;

export interface ZoneDefinition {
    id: string;
    name: string;
    region: RegionId;
    /** Badges (or the region's equivalent trials) needed to travel here. */
    badgesRequired: number;
    /** Requires clearing the region's finale. */
    postGame?: boolean;
    /** A location that only appears in the animated series. */
    anime?: boolean;
    blurb: string;
    /** Hand-authored encounter pools; zones without them use the generated game data. */
    encounters?: ZonePools;
    /**
     * Orre has no wild Pokémon: its encounters are trainers' Pokémon, which can't be caught,
     * and the Shadow Pokémon of Cipher, which can be snagged.
     */
    trainerBattles?: boolean;
    /** A Poké Spot: wild Pokémon that come out for Poké Snacks, one per encounter. */
    pokeSpot?: boolean;
    /** Only there once this generation mechanic is unlocked (other regions' Poké Spots). */
    mechanic?: MechanicId;
    /** Pal Park: its Pokémon are the ones migrated from regions cleared after Sinnoh. */
    palPark?: boolean;
}

/** Kanto zones from the games, in the order the player reaches them. */
const KANTO_GAME_ZONES: Omit<ZoneDefinition, "region">[] = [
    {
        id: "route1",
        name: "Route 1",
        badgesRequired: 0,
        blurb: "Tall grass between Pallet Town and Viridian City."
    },
    {
        id: "route22",
        name: "Route 22",
        badgesRequired: 0,
        blurb: "The westward path toward the Pokémon League gate."
    },
    {
        id: "route2",
        name: "Route 2",
        badgesRequired: 0,
        blurb: "A quiet road north of Viridian City."
    },
    {
        id: "viridianForest",
        name: "Viridian Forest",
        badgesRequired: 0,
        blurb: "A dim maze of trees crawling with Bug Pokémon."
    },
    {
        id: "route3",
        name: "Route 3",
        badgesRequired: 1,
        blurb: "Rocky trails east of Pewter City."
    },
    {
        id: "mtMoon",
        name: "Mt. Moon",
        badgesRequired: 1,
        blurb: "A cavern said to be visited by meteorites... and Clefairy."
    },
    {
        id: "route4",
        name: "Route 4",
        badgesRequired: 1,
        blurb: "A one-way ledge down into Cerulean City."
    },
    {
        id: "route24",
        name: "Route 24",
        badgesRequired: 1,
        blurb: "Nugget Bridge, guarded by a gauntlet of trainers."
    },
    {
        id: "route25",
        name: "Route 25",
        badgesRequired: 1,
        blurb: "The seaside path to Bill's cottage."
    },
    {
        id: "route5",
        name: "Route 5",
        badgesRequired: 2,
        blurb: "Grassland south of Cerulean City."
    },
    {
        id: "route6",
        name: "Route 6",
        badgesRequired: 2,
        blurb: "The road into Vermilion, the port city."
    },
    {
        id: "route11",
        name: "Route 11",
        badgesRequired: 2,
        blurb: "Home of the Diglett's Cave entrance."
    },
    {
        id: "diglettsCave",
        name: "Diglett's Cave",
        badgesRequired: 2,
        blurb: "A long tunnel dug entirely by Diglett."
    },
    {
        id: "route9",
        name: "Route 9",
        badgesRequired: 3,
        blurb: "A rugged path cut east of Cerulean."
    },
    {
        id: "route10",
        name: "Route 10",
        badgesRequired: 3,
        blurb: "The Power Plant hums somewhere nearby."
    },
    {
        id: "rockTunnel",
        name: "Rock Tunnel",
        badgesRequired: 3,
        blurb: "A pitch-black cave. Bring Flash."
    },
    {
        id: "route8",
        name: "Route 8",
        badgesRequired: 3,
        blurb: "The road west from Lavender Town."
    },
    {
        id: "route7",
        name: "Route 7",
        badgesRequired: 3,
        blurb: "A short route leading into Celadon City."
    },
    {
        id: "pokemonTower",
        name: "Pokémon Tower",
        badgesRequired: 4,
        blurb: "A resting place for Pokémon. Something stirs here."
    },
    {
        id: "route12",
        name: "Route 12",
        badgesRequired: 4,
        blurb: "Silence Bridge, a famous fishing spot."
    },
    {
        id: "route13",
        name: "Route 13",
        badgesRequired: 4,
        blurb: "A maze of fences and tall grass."
    },
    {
        id: "route14",
        name: "Route 14",
        badgesRequired: 4,
        blurb: "Winding grassland toward Fuchsia."
    },
    {
        id: "route15",
        name: "Route 15",
        badgesRequired: 4,
        blurb: "The last stretch before Fuchsia City."
    },
    { id: "route16", name: "Route 16", badgesRequired: 4, blurb: "The top of Cycling Road." },
    {
        id: "route17",
        name: "Route 17",
        badgesRequired: 4,
        blurb: "Cycling Road — a long downhill sprint."
    },
    { id: "route18", name: "Route 18", badgesRequired: 4, blurb: "The bottom of Cycling Road." },
    {
        id: "safariZone",
        name: "Safari Zone",
        badgesRequired: 5,
        blurb: "Rare Pokémon from far-off lands roam free."
    },
    {
        id: "powerPlant",
        name: "Power Plant",
        badgesRequired: 5,
        blurb: "An abandoned plant, crackling with electricity."
    },
    {
        id: "route19",
        name: "Route 19",
        badgesRequired: 6,
        blurb: "Open sea south of Fuchsia City."
    },
    {
        id: "route20",
        name: "Route 20",
        badgesRequired: 6,
        blurb: "Currents swirl around the Seafoam Islands."
    },
    {
        id: "seafoamIslands",
        name: "Seafoam Islands",
        badgesRequired: 6,
        blurb: "Frozen caverns beneath the sea."
    },
    {
        id: "pokemonMansion",
        name: "Pokémon Mansion",
        badgesRequired: 6,
        blurb: "A burned-out lab. Its journals mention a new Pokémon..."
    },
    {
        id: "route21",
        name: "Route 21",
        badgesRequired: 7,
        blurb: "The sea route home to Pallet Town."
    },
    {
        id: "route23",
        name: "Route 23",
        badgesRequired: 8,
        blurb: "Badge checkpoints on the way to the League."
    },
    {
        id: "victoryRoad",
        name: "Victory Road",
        badgesRequired: 8,
        blurb: "The final test before the Elite Four."
    },
    {
        id: "ceruleanCave",
        name: "Cerulean Cave",
        badgesRequired: 8,
        postGame: true,
        blurb: "Only the Champion may enter. Incredibly strong Pokémon lurk inside."
    }
];

const KANTO_ZONES: ZoneDefinition[] = [
    ...KANTO_GAME_ZONES.map((zone): ZoneDefinition => ({ ...zone, region: "kanto" })),
    ...KANTO_ANIME_ZONES,
    ...MORE_KANTO_ANIME_ZONES
    // Stable sort keeps story order within each badge tier, anime locations last.
].sort(
    (a, b) => a.badgesRequired - b.badgesRequired || Number(!!a.postGame) - Number(!!b.postGame)
);

const ORANGE_ALL: ZoneDefinition[] = [...ORANGE_ZONES, ...MORE_ORANGE_ZONES].sort(
    (a, b) => a.badgesRequired - b.badgesRequired || Number(!!a.postGame) - Number(!!b.postGame)
);

const JOHTO_ALL: ZoneDefinition[] = [...JOHTO_ZONES, ...JOHTO_ANIME_ZONES].sort(
    (a, b) => a.badgesRequired - b.badgesRequired || Number(!!a.postGame) - Number(!!b.postGame)
);

const HOENN_ALL: ZoneDefinition[] = [...HOENN_ZONES, ...HOENN_ANIME_ZONES].sort(
    (a, b) => a.badgesRequired - b.badgesRequired || Number(!!a.postGame) - Number(!!b.postGame)
);

/** Every explorable zone in every region. */
export const ZONES: ZoneDefinition[] = [
    ...KANTO_ZONES,
    ...ORANGE_ALL,
    ...SEVII_ZONES,
    ...JOHTO_ALL,
    ...HOENN_ALL,
    ...COLOSSEUM_ZONES,
    ...XD_ZONES,
    ...SINNOH_ZONES,
    ...FIORE_ZONES,
    ...ALMIA_ZONES,
    ...OBLIVIA_ZONES,
    ...UNOVA_ZONES,
    ...UNOVA2_ZONES,
    ...CARRIED_POKE_SPOTS
];

export function zonesIn(region: RegionId): ZoneDefinition[] {
    return ZONES.filter(zone => zone.region === region);
}

export const ZONES_BY_ID: Record<string, ZoneDefinition> = Object.fromEntries(
    ZONES.map(zone => [zone.id, zone])
);

const POOL_KEY_ITEM: Record<Exclude<EncounterPoolId, "walk">, KeyItemId> = {
    surf: "surf",
    oldRod: "oldRod",
    goodRod: "goodRod",
    superRod: "superRod",
    headbutt: "headbutt",
    rockSmash: "rockSmash",
    dive: "dive"
};

/** How often each kind of encounter comes up, relative to each other, when available. */
const POOL_SHARE = {
    walk: 0.7,
    surf: 0.15,
    fishing: 0.15,
    headbutt: 0.12,
    rockSmash: 0.06,
    dive: 0.15
};

/** Whether a place is in one of the Unova journeys (their tables have seasons and phenomena). */
function inUnova(zoneId: string): boolean {
    const region = ZONES_BY_ID[zoneId]?.region;
    return region === "unova" || region === "unova2";
}

export type EncounterKind =
    | "walk"
    | "surf"
    | "fishing"
    | "headbutt"
    | "rockSmash"
    | "dive"
    | "honey"
    | "phenomenon"
    | "grotto";

export interface ActivePool {
    kind: EncounterKind;
    share: number;
    entries: EncounterEntry[];
}

/**
 * The encounter pools the player can currently access in a zone.
 * Fishing combines every rod the player owns into one pool; each rod contributes equally.
 */
/** A zone's encounter pools, hand-authored or generated. */
/** Additions to the generated game encounters. */
const EXTRA_ENCOUNTERS: Record<string, ZonePools> = {
    // Pokémon Yellow's Surfing Pikachu rides the waves off the Seafoam Islands.
    route19: { surf: [enc(3100, 20, 30, 3)] },
    route20: { surf: [enc(3100, 20, 30, 3)] },
    // Puka, the Alola-bias Pikachu that rode the Humungadunga off Seafoam Island.
    seafoamIslands: { walk: [enc(7014, 30, 33, 12)] },
    // Feebas lives under just a few tiles of Route 119's river, about 1 cast in 20 there.
    route119: {
        oldRod: [enc(349, 20, 25, 15)],
        goodRod: [enc(349, 20, 25, 15)],
        superRod: [enc(349, 20, 25, 15)]
    },
    // ...and under four tiles of the lake in Mt. Coronet's basement.
    mtCoronetPeak: {
        oldRod: [enc(349, 10, 20, 15)],
        goodRod: [enc(349, 10, 20, 15)],
        superRod: [enc(349, 10, 20, 15)]
    }
};

export function zonePools(zoneId: string): ZonePools {
    const pools = ZONES_BY_ID[zoneId]?.encounters ?? ENCOUNTERS[zoneId] ?? {};
    const extra = EXTRA_ENCOUNTERS[zoneId];
    if (extra == null) return pools;
    const merged: ZonePools = { ...pools };
    for (const [pool, entries] of Object.entries(extra) as [EncounterPoolId, EncounterEntry[]][]) {
        merged[pool] = [...(pools[pool] ?? []), ...entries];
    }
    return merged;
}

/**
 * What a journey has added to its zones' pools: the Pokégear swarms tuned in to (by zone) and
 * the Bug-Catching Contest, once its entry fee is paid. Johto's morning, day and night tables
 * are always all in, at their average weights.
 */
export interface ZoneExtras {
    swarms?: Partial<Record<string, boolean>>;
    bugContest?: boolean;
    /** Shadow Pokémon already snagged this journey: each is one of a kind. */
    snagged?: Partial<Record<string, boolean>>;
    /** Cipher Peons roam with Shadow versions of a place's Pokémon (the Snag Machine mechanic). */
    cipherPeons?: boolean;
    /** The Poké Radar (a Pokédex reward): Sinnoh's radar-only Pokémon join the grass. */
    pokeRadar?: boolean;
    /** The Poké Radar's chain: the species it's locked on and how long the chain is. */
    radarChain?: { speciesId: number; count: number };
    /**
     * Regions whose Pokémon have migrated to Pal Park (cleared after Sinnoh): Pal Park's pool,
     * and Sinnoh's dual-slot Pokémon for the Game Boy Advance games set there.
     */
    palPark?: RegionId[];
    /**
     * The strongest Field Ability powers among the box's Pokémon: Almia's Pokémon behind
     * obstacles only appear once one is strong enough.
     */
    fieldPowers?: Partial<Record<FieldAbility, number>>;
    /**
     * The season (Black and White's Seasons mechanic): Unova's tables change with it, and
     * elsewhere it brings out its types and seasonal Deerling. Unset means average weights.
     */
    season?: Season;
    /** Phenomena (Black and White's mechanic): shaking grass and rippling water, and how often. */
    phenomena?: boolean;
    /** Multiplies how often phenomena happen (Encounter Power). */
    phenomenaBoost?: number;
}

/** Share of Sinnoh's grass the Poké Radar's patches bring (two slots of twelve, 10% each). */
export const RADAR_SHARE = 0.2;
/** Chance a grass encounter is the Poké Radar's chained species, when it lives there. */
export const RADAR_CHAIN_PULL = 0.5;
/** A chain stops growing here (40 in the games). */
export const MAX_RADAR_CHAIN = 40;
/**
 * Shiny odds for the chained species: ×(1 + chain / 8), so ×6 at 40. (The games reach ×41, but
 * there every link takes careful play; here chains build themselves.)
 */
export function radarShinyMultiplier(chain: number): number {
    return 1 + Math.min(chain, MAX_RADAR_CHAIN) / 8;
}

/** Share of Sinnoh's grass a Game Boy Advance game in the second slot brings (two 4% slots). */
export const DUAL_SLOT_SHARE = 0.08;
/** The Game Boy Advance games whose dual-slot Pokémon come with each region's migrants. */
export const DUAL_SLOT_GAMES: Partial<Record<RegionId, string[]>> = {
    kanto: ["firered", "leafgreen"],
    sevii: ["firered", "leafgreen"],
    hoenn: ["ruby", "sapphire", "emerald"]
};

/** How often an encounter is a Cipher Peon's Shadow Pokémon, where Cipher Peons roam. */
export const CIPHER_PEON_CHANCE = 0.02;

/** A swarm or the contest's bugs make up this share of the pool they join. */
export const EXTRA_SHARE = 1 / 3;

/** Adds entries to a pool so that, together, they make up `share` of it. */
function joinPool(existing: EncounterEntry[], added: EncounterEntry[], share: number) {
    const total = existing.reduce((sum, e) => sum + e.weight, 0);
    const addedTotal = added.reduce((sum, e) => sum + e.weight, 0);
    const scale = total > 0 ? (total * share) / (1 - share) / addedTotal : 1;
    return [...existing, ...added.map(e => ({ ...e, weight: e.weight * scale }))];
}

/** A zone's pools with the journey's swarms and contest added. */
function poolsWith(zoneId: string, extras: ZoneExtras): ZonePools {
    const pools: ZonePools = { ...zonePools(zoneId) };
    const season = extras.season;
    if (season != null) {
        for (const pool of Object.keys(pools) as EncounterPoolId[]) {
            if (inUnova(zoneId)) {
                // Unova's own tables change with the season (Twist Mountain's winter Cryogonal).
                if (pools[pool]!.some(e => e.bySeason != null)) {
                    pools[pool] = pools[pool]!.map(e =>
                        e.bySeason != null ? { ...e, weight: e.bySeason[season] } : e
                    ).filter(e => e.weight > 0);
                }
            } else if (pool === "walk" && ZONES_BY_ID[zoneId]?.trainerBattles !== true) {
                // Elsewhere, the season's types come out more, and Deerling wander in.
                const walk = pools.walk!.map(e =>
                    inSeason(e.id, season) ? { ...e, weight: e.weight * SEASON_TYPE_BOOST } : e
                );
                const min = Math.min(...walk.map(e => e.minLevel));
                const max = Math.max(...walk.map(e => e.maxLevel));
                pools.walk =
                    walk.length > 0
                        ? joinPool(walk, [enc(585, min, max, 1)], SEASON_DEERLING_SHARE)
                        : walk;
            }
        }
    }
    for (const pool of Object.keys(pools) as EncounterPoolId[]) {
        if (pools[pool]!.some(e => e.obstacle != null)) {
            pools[pool] = pools[pool]!.filter(
                e =>
                    e.obstacle == null ||
                    (extras.fieldPowers?.[e.obstacle.ability] ?? 0) >= e.obstacle.power
            );
        }
    }
    if (extras.snagged != null) {
        for (const pool of Object.keys(pools) as EncounterPoolId[]) {
            pools[pool] = pools[pool]!.filter(e => !isShadow(e.id) || !extras.snagged![e.id]);
        }
    }
    if (zoneId === "nationalPark" && extras.bugContest === true) {
        pools.walk = joinPool(pools.walk ?? [], BUG_CONTEST_POOL, EXTRA_SHARE);
    }
    if (extras.pokeRadar === true && SINNOH_EXTRAS.radar[zoneId]?.walk != null) {
        pools.walk = joinPool(pools.walk ?? [], SINNOH_EXTRAS.radar[zoneId].walk!, RADAR_SHARE);
    }
    const games = [...new Set((extras.palPark ?? []).flatMap(r => DUAL_SLOT_GAMES[r] ?? []))];
    const dual = games.flatMap(game => SINNOH_EXTRAS.dualSlot[game]?.[zoneId]?.walk ?? []);
    if (dual.length > 0 && pools.walk != null) {
        pools.walk = joinPool(pools.walk, dual, DUAL_SLOT_SHARE);
    }
    if (ZONES_BY_ID[zoneId]?.palPark === true) {
        pools.walk = palParkPool(extras.palPark ?? []);
    }
    for (const swarm of JOHTO_SWARMS) {
        if (swarm.zoneId !== zoneId || extras.swarms?.[zoneId] !== true) continue;
        for (const [pool, entries] of Object.entries(swarm.pools) as [
            EncounterPoolId,
            EncounterEntry[]
        ][]) {
            pools[pool] = joinPool(pools[pool] ?? [], entries, EXTRA_SHARE);
        }
    }
    return pools;
}

/**
 * Pal Park's grass: every Pokémon the migrated regions' game places offer (Shadow Pokémon as
 * their species), equally likely, at levels between their lowest and highest there.
 */
const palParkPools = new Map<string, EncounterEntry[]>();
function palParkPool(regions: RegionId[]): EncounterEntry[] {
    const key = [...regions].sort().join();
    const cached = palParkPools.get(key);
    if (cached != null) return cached;
    const levels = new Map<number, [number, number]>();
    for (const zone of ZONES.filter(
        z => regions.includes(z.region) && z.anime !== true && z.mechanic == null
    )) {
        for (const entries of Object.values(zonePools(zone.id))) {
            for (const e of entries ?? []) {
                if (!catchableIn(zone.id, e.id)) continue;
                const id = isShadow(e.id) ? e.id - SHADOW_OFFSET : e.id;
                const [min, max] = levels.get(id) ?? [Infinity, -Infinity];
                levels.set(id, [Math.min(min, e.minLevel), Math.max(max, e.maxLevel)]);
            }
        }
    }
    const pool = [...levels.entries()].map(([id, [min, max]]) => enc(id, min, max, 10));
    palParkPools.set(key, pool);
    return pool;
}

/**
 * The Pokémon a phenomenon can bring out here: Unova's own tables (shaking grass, dust clouds,
 * flying shadows, and rippling water once you can surf or fish), or elsewhere the place's grass
 * and water Pokémon, each as likely as the others, at the top of their levels (plus Audino in
 * the grass).
 */
function phenomenonEntries(
    zoneId: string,
    pools: ZonePools,
    keyItems: Partial<Record<KeyItemId, boolean>>
): EncounterEntry[] {
    const zone = ZONES_BY_ID[zoneId];
    if (zone == null || zone.trainerBattles === true || zone.pokeSpot === true) return [];
    const water = keyItems.surf === true || keyItems.superRod === true;
    if (inUnova(zoneId)) {
        const found = UNOVA_EXTRAS.phenomena[zoneId] ?? {};
        // A bridge's flying shadows are already its only Pokémon.
        const shadows = zone.encounters != null ? [] : (found.flyingShadow ?? []);
        return [
            ...(found.shakingGrass ?? []),
            ...(found.dustCloud ?? []),
            ...shadows,
            ...(water ? (found.ripplingWater ?? []) : [])
        ];
    }
    // Every Pokémon of the pool equally likely, at the top of its levels.
    const flatten = (entries: EncounterEntry[]) =>
        entries.map(e => ({ id: e.id, weight: 1, minLevel: e.maxLevel, maxLevel: e.maxLevel }));
    const result: EncounterEntry[] = [];
    const walk = pools.walk ?? [];
    if (walk.length > 0) {
        const max = Math.max(...walk.map(e => e.maxLevel));
        const audino = (walk.length * AUDINO_SHARE) / (1 - AUDINO_SHARE);
        result.push(...flatten(walk), { id: AUDINO, weight: audino, minLevel: max, maxLevel: max });
    }
    const surf = keyItems.surf === true ? (pools.surf ?? []) : [];
    result.push(...flatten(surf));
    return result;
}

export function activePools(
    zoneId: string,
    keyItems: Partial<Record<KeyItemId, boolean>>,
    extras: ZoneExtras = {}
) {
    const pools = poolsWith(zoneId, extras);
    const result: ActivePool[] = [];
    if (pools.walk != null && pools.walk.length > 0) {
        result.push({ kind: "walk", share: POOL_SHARE.walk, entries: pools.walk });
    }
    if (pools.surf != null && pools.surf.length > 0 && keyItems[POOL_KEY_ITEM.surf] === true) {
        result.push({ kind: "surf", share: POOL_SHARE.surf, entries: pools.surf });
    }
    const fishing: EncounterEntry[] = [];
    for (const rod of ["oldRod", "goodRod", "superRod"] as const) {
        const entries = pools[rod];
        if (entries == null || entries.length === 0 || keyItems[POOL_KEY_ITEM[rod]] !== true) {
            continue;
        }
        const total = entries.reduce((sum, e) => sum + e.weight, 0);
        fishing.push(...entries.map(e => ({ ...e, weight: e.weight / total })));
    }
    if (fishing.length > 0) {
        result.push({ kind: "fishing", share: POOL_SHARE.fishing, entries: fishing });
    }
    for (const kind of ["headbutt", "rockSmash", "dive"] as const) {
        const entries = pools[kind];
        if (entries != null && entries.length > 0 && keyItems[POOL_KEY_ITEM[kind]] === true) {
            result.push({ kind, share: POOL_SHARE[kind], entries });
        }
    }
    if (extras.phenomena === true && result.length > 0) {
        const entries = phenomenonEntries(zoneId, pools, keyItems);
        if (entries.length > 0) {
            const chance = Math.min(0.5, PHENOMENON_CHANCE * (extras.phenomenaBoost ?? 1));
            const total = result.reduce((sum, pool) => sum + pool.share, 0);
            result.push({ kind: "phenomenon", share: (total * chance) / (1 - chance), entries });
        }
    }
    return result;
}

/** Whether an encounter can be caught: in Orre, only Shadow Pokémon (snagged from trainers). */
export function catchableIn(zoneId: string, speciesId: number): boolean {
    return ZONES_BY_ID[zoneId]?.trainerBattles !== true || isShadow(speciesId);
}

/** Species a zone only gets once added: Pokégear swarms and the Bug-Catching Contest. */
export function occasionalSpecies(zoneId: string): { swarm: number[]; contest: number[] } {
    return {
        swarm: JOHTO_SWARMS.filter(sw => sw.zoneId === zoneId).map(sw => sw.speciesId),
        contest: zoneId === "nationalPark" ? BUG_CONTEST_POOL.map(e => e.id) : []
    };
}

/**
 * Every species that can appear in a zone with any equipment, in a swarm or the Bug-Catching
 * Contest, for completion tracking.
 */
export function allZoneSpecies(zoneId: string): number[] {
    const ids = new Set<number>();
    for (const entries of Object.values(zonePools(zoneId))) {
        entries?.forEach(e => {
            if (catchableIn(zoneId, e.id)) ids.add(e.id);
        });
    }
    const { swarm, contest } = occasionalSpecies(zoneId);
    [...swarm, ...contest].forEach(id => ids.add(id));
    return [...ids].sort((a, b) => a - b);
}

/** Species currently findable in a zone with the player's equipment. */
export function availableZoneSpecies(
    zoneId: string,
    keyItems: Partial<Record<KeyItemId, boolean>>,
    extras: ZoneExtras = {}
): number[] {
    const ids = new Set<number>();
    for (const pool of activePools(zoneId, keyItems, extras)) {
        pool.entries.forEach(e => {
            if (catchableIn(zoneId, e.id)) ids.add(e.id);
        });
    }
    return [...ids].sort((a, b) => a - b);
}

export interface RolledEncounter {
    speciesId: number;
    level: number;
    kind: ActivePool["kind"];
}

function pickWeighted<T extends { weight: number }>(entries: T[], rng: () => number): T {
    const total = entries.reduce((sum, e) => sum + e.weight, 0);
    let roll = rng() * total;
    for (const entry of entries) {
        roll -= entry.weight;
        if (roll <= 0) {
            return entry;
        }
    }
    return entries[entries.length - 1];
}

/** The grass entry the Poké Radar's chain is locked on, if it lives in this pool. */
function radarChained(pool: ActivePool, extras: ZoneExtras): EncounterEntry | undefined {
    const chain = extras.radarChain;
    if (pool.kind !== "walk" || chain == null) return undefined;
    return pool.entries.find(e => e.id === chain.speciesId);
}

/** Chance a Magikarp bites with a Magikarp Jump pattern once Roddy's Old Rod has a level. */
export const PATTERN_CHANCE = 0.3;

/**
 * @param rodLevel Level of the Roddy's Old Rod Fame upgrade; Magikarp may then have patterns.
 */
export function rollEncounter(
    zoneId: string,
    keyItems: Partial<Record<KeyItemId, boolean>>,
    rng: () => number = Math.random,
    rodLevel = 0,
    extras: ZoneExtras = {}
): RolledEncounter | null {
    const pools = activePools(zoneId, keyItems, extras);
    if (pools.length === 0) {
        return null;
    }
    const pool = pickWeighted(
        pools.map(p => ({ ...p, weight: p.share })),
        rng
    );
    let entry = pickWeighted(pool.entries, rng);
    // The Poké Radar keeps turning up its chained species in the grass.
    const chained = radarChained(pool, extras);
    if (chained != null && rng() < RADAR_CHAIN_PULL) entry = chained;
    // Species with visible gender differences show up as their female form genderRate/8 of the time.
    const female = femaleForm(entry.id);
    let speciesId = female != null && rng() < female.genderRate / 8 ? female.id : entry.id;
    // Variants and patterns go by the species in the table, so females get them too (a female
    // Wooper can have the heart, a female Magikarp a pattern).
    const cosmetic = WILD_VARIANTS[entry.id];
    if (cosmetic != null && rng() < cosmetic.chance) {
        speciesId = pickWeighted(
            cosmetic.variants.map(([id, weight]) => ({ id, weight })),
            rng
        ).id;
    }
    if (entry.id === 129 && rodLevel > 0 && rng() < PATTERN_CHANCE) {
        // The Gold pattern is ten times rarer than the rest.
        const patterns = magikarpPatterns(rodLevel);
        speciesId = pickWeighted(
            patterns.map(p => ({ id: p.id, weight: p.spriteKey === "129-gold" ? 0.1 : 1 })),
            rng
        ).id;
    }
    // Deerling and Sawsbuck wear the season's coat.
    speciesId = seasonForm(speciesId, extras.season);
    if (extras.cipherPeons === true && !isShadow(speciesId) && rng() < CIPHER_PEON_CHANCE) {
        speciesId = shadowOf(speciesId);
    }
    return {
        speciesId,
        level: entry.minLevel + Math.floor(rng() * (entry.maxLevel - entry.minLevel + 1)),
        kind: pool.kind
    };
}

/**
 * The chance each species (or form) is what an encounter here turns out to be: the same rolls
 * as rollEncounter (pool, entry, female form, cosmetic variant, Magikarp pattern), worked out
 * exactly instead of at random.
 */
export function encounterOdds(
    zoneId: string,
    keyItems: Partial<Record<KeyItemId, boolean>>,
    rodLevel = 0,
    extras: ZoneExtras = {}
): Map<number, number> {
    const odds = new Map<number, number>();
    const tally = (id: number, p: number) => {
        const shown = seasonForm(id, extras.season);
        odds.set(shown, (odds.get(shown) ?? 0) + p);
    };
    // Where Cipher Peons roam, a share of everything turns out to be its Shadow form.
    const add = (id: number, p: number) => {
        if (extras.cipherPeons === true && !isShadow(id)) {
            tally(shadowOf(id), p * CIPHER_PEON_CHANCE);
            tally(id, p * (1 - CIPHER_PEON_CHANCE));
        } else {
            tally(id, p);
        }
    };
    const pools = activePools(zoneId, keyItems, extras);
    const totalShare = pools.reduce((sum, pool) => sum + pool.share, 0);
    for (const pool of pools) {
        const totalWeight = pool.entries.reduce((sum, e) => sum + e.weight, 0);
        const chained = radarChained(pool, extras);
        for (const entry of pool.entries) {
            let pick = entry.weight / totalWeight;
            if (chained != null) {
                pick = (1 - RADAR_CHAIN_PULL) * pick + (entry === chained ? RADAR_CHAIN_PULL : 0);
            }
            let plain = (pool.share / totalShare) * pick;
            const cosmetic = WILD_VARIANTS[entry.id];
            if (cosmetic != null) {
                const total = cosmetic.variants.reduce((sum, [, w]) => sum + w, 0);
                for (const [variant, w] of cosmetic.variants) {
                    add(variant, plain * cosmetic.chance * (w / total));
                }
                plain *= 1 - cosmetic.chance;
            }
            if (entry.id === 129 && rodLevel > 0) {
                const patterns = magikarpPatterns(rodLevel).map(s => ({
                    id: s.id,
                    weight: s.spriteKey === "129-gold" ? 0.1 : 1
                }));
                const total = patterns.reduce((sum, s) => sum + s.weight, 0);
                for (const pattern of patterns) {
                    add(pattern.id, plain * PATTERN_CHANCE * (pattern.weight / total));
                }
                if (patterns.length > 0) plain *= 1 - PATTERN_CHANCE;
            }
            // What's left is the plain species, split between its female and male forms.
            const female = femaleForm(entry.id);
            if (female != null) {
                add(female.id, plain * (female.genderRate / 8));
                plain *= 1 - female.genderRate / 8;
            }
            add(entry.id, plain);
        }
    }
    return odds;
}

/** The average wild level in a zone's walking (or surfing) pool, used for recommendations. */
export function typicalLevel(zoneId: string): number {
    const pools = zonePools(zoneId);
    const entries = pools.walk ?? pools.surf ?? [];
    const total = entries.reduce((sum, e) => sum + e.weight, 0);
    if (total === 0) {
        return 1;
    }
    return entries.reduce((sum, e) => sum + ((e.minLevel + e.maxLevel) / 2) * e.weight, 0) / total;
}

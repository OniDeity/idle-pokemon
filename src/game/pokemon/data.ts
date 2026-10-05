import { assetUrl } from "./assets";
import encountersJson from "data/pokemon/encounters.json";
import formsJson from "data/pokemon/forms.json";
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
    | "moonStone"
    | "fireStone"
    | "thunderStone"
    | "waterStone"
    | "leafStone"
    | "sunStone"
    | "shinyStone"
    | "duskStone"
    | "dawnStone"
    | "iceStone"
    /** Held while leveling up (used up): Happiny, Sneasel, Gligar. */
    | "ovalStone"
    | "razorClaw"
    | "razorFang"
    /** Used up by one trade evolution. */
    | "linkCable"
    /** Used up by one friendship evolution, at any level. */
    | "sootheBell"
    /** Held items some trade evolutions also need (used up alongside the Link Cable). */
    | "metalCoat"
    | "kingsRock"
    | "dragonScale"
    | "upGrade"
    | "deepSeaTooth"
    | "deepSeaScale"
    | "prismScale"
    | "protector"
    | "electirizer"
    | "magmarizer"
    | "dubiousDisc"
    | "reaperCloth";

export type GrowthRate = "slow" | "medium" | "fast" | "mediumSlow" | "erratic" | "fluctuating";

export interface Evolution {
    into: number;
    method: "level" | "stone" | "trade";
    level?: number;
    stone?: StoneId;
    /** A friendship evolution: happens at `level`, or earlier with a Soothe Bell. */
    friendship?: boolean;
    /** For trade evolutions: an item it must hold, used up alongside the Link Cable. */
    heldItem?: StoneId;
    /**
     * Only one gender evolves this way (Combee ♀ into Vespiquen). It matters only for species
     * with a female form; for the rest both branches are open, as evolving keeps the original.
     */
    gender?: "female" | "male";
}

export interface Species {
    id: number;
    name: string;
    types: PokemonType[];
    /** [hp, attack, defense, special attack, special defense, speed] */
    baseStats: [number, number, number, number, number, number];
    baseExp: number;
    /** In kilograms, for the Heavy Ball. */
    weight: number;
    /** 3-255; higher is easier to catch. */
    captureRate: number;
    growthRate: GrowthRate;
    legendary: boolean;
    evolutions: Evolution[];
    /** -1 for genderless, otherwise the chance of being female in eighths. */
    genderRate: number;
    genderDifferences: boolean;
    /** For alternate forms: the regular species they're based on. */
    baseSpecies?: number;
    variant?: VariantKind;
    /**
     * The region a form is native to. Forms from regions that aren't in the game yet exist in the
     * data but aren't placed anywhere, so they arrive with their region.
     */
    nativeRegion?: string | null;
    /** Sprite path under sprites/pokemon, e.g. "25", "10091", "201-b" or "female/25". */
    spriteKey?: string;
    /** A small emoji drawn over the sprite, for variants that differ by a prop. */
    accessory?: string;
    /** The sprite ships with the game (public/sprites) instead of coming from PokeAPI. */
    localSprite?: boolean;
    /** For Magikarp Jump patterns: the Roddy's Rod level that can hook it. */
    rodTier?: number;
}

/**
 * Kinds of alternate form: anime variants (Pinkan, Valencian, unique individuals), gender
 * differences, official regional forms, and other official forms (Unown letters, Pikachu caps).
 */
export type VariantKind =
    | "pinkan"
    | "valencian"
    | "unique"
    | "female"
    | "regional"
    | "official"
    | "pattern"
    | "cosmetic"
    | "giant"
    | "clone"
    | "shadow";

interface FormData {
    id: number;
    speciesId: number;
    identifier: string;
    name: string;
    region: string | null;
    sprite: string;
    types: PokemonType[];
    baseStats: Species["baseStats"];
    baseExp: number;
}

/** Pokémon Ranger's Field Abilities, used on Almia's obstacles. */
export type FieldAbility =
    | "cut"
    | "crush"
    | "tackle"
    | "burn"
    | "soak"
    | "electrify"
    | "recharge"
    | "psyPower";

/** An obstacle that needs a Pokémon with this Field Ability at this power (or more). */
export interface FieldNeed {
    ability: FieldAbility;
    power: number;
}

export interface EncounterEntry {
    id: number;
    weight: number;
    minLevel: number;
    maxLevel: number;
    /** Behind an obstacle: only appears once a box Pokémon has the Field Ability for it. */
    obstacle?: FieldNeed;
    /** HeartGold/SoulSilver tables that change with the time of day: the weight at each time. */
    byTime?: Record<TimeOfDay, number>;
}

export type EncounterPoolId =
    | "walk"
    | "surf"
    | "oldRod"
    | "goodRod"
    | "superRod"
    | "headbutt"
    | "rockSmash"
    | "dive";

export type TimeOfDay = "morning" | "day" | "night";

/** The regular National Pokédex species, #1-493, in order. */
export const SPECIES = speciesJson as Species[];
export const DEX_SIZE = SPECIES.length;

/**
 * Anime variants seen in the Orange Islands and Kanto. They share their base species' stats
 * and get their own Pokédex entries; sprites are the base sprite recolored with a CSS filter.
 * Ids: Pinkan 1000 + base, Valencian 2000 + base, unique individuals 3000 + base.
 */
const PINKAN = [10, 13, 16, 19, 25, 29, 32, 34, 45, 46, 47, 48, 50, 56, 57, 69, 85, 103, 111, 112];
const VALENCIAN = [12, 20, 29, 32, 44, 45, 46, 70, 182];

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
    2044: "hue-rotate(38deg) saturate(1.6) brightness(1.08)", // Gloom with Vileplume's petals
    2045: "hue-rotate(38deg) saturate(1.7) brightness(1.1)", // orange-petaled Vileplume
    2182: "hue-rotate(22deg) saturate(1.4) brightness(1.05)", // orange-flowered Bellossom
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

/** Offset added to a species id for its clone from New Island. */
export const CLONE_OFFSET = 7200;

/** Offset added to a species id for its female form (for species with gender differences). */
export const FEMALE_OFFSET = 5000;
const REGIONAL_SUFFIX = /-(alola|galar|hisui|paldea)/;

const ANIME_VARIANTS: Species[] = [
    ...PINKAN.map(id => variant(id, 1000 + id, "pinkan", `Pinkan ${SPECIES[id - 1].name}`)),
    ...VALENCIAN.map(id =>
        variant(id, 2000 + id, "valencian", `Valencian ${SPECIES[id - 1].name}`)
    ),
    // Made of glass: no longer weak to Water, but Fire cracks it.
    variant(95, 3095, "unique", "Crystal Onix", { types: ["ice"], captureRate: 10 }),
    variant(12, 3012, "unique", "Pink Butterfree", { captureRate: 25 }),
    // Pokémon Yellow's surfing minigame and Pokémon Stadium's balloon Pikachu.
    variant(25, 3100, "unique", "Surfing Pikachu", { accessory: "🏄", captureRate: 45 }),
    variant(25, 3101, "unique", "Flying Pikachu", { accessory: "🎈", captureRate: 45 })
];

/**
 * Magikarp Jump patterns, by the rod that first hooks them: [number, sprite slug, name, tier].
 * Ids are 6000 + the pattern's number in Magikarp Jump; their Gyarados are 6100 + it.
 * Sprites are generated by scripts/generateMagikarpPatterns.py.
 */
const MAGIKARP_PATTERNS: [number, string, string, number][] = [
    [2, "skelly", "Skelly", 1],
    [3, "calico-orange-white", "Calico Orange/White", 1],
    [4, "calico-orange-white-black", "Calico Orange/White/Black", 1],
    [5, "calico-white-orange", "Calico White/Orange", 1],
    [6, "calico-orange-gold", "Calico Orange/Gold", 1],
    [7, "orange-two-tone", "Orange Two-Tone", 2],
    [8, "orange-orca", "Orange Orca", 2],
    [9, "orange-dapples", "Orange Dapples", 2],
    [10, "pink-two-tone", "Pink Two-Tone", 3],
    [11, "pink-orca", "Pink Orca", 3],
    [12, "pink-dapples", "Pink Dapples", 3],
    [13, "gray-bubbles", "Gray Bubbles", 4],
    [14, "gray-diamonds", "Gray Diamonds", 4],
    [15, "gray-patches", "Gray Patches", 4],
    [16, "purple-bubbles", "Purple Bubbles", 4],
    [17, "purple-diamonds", "Purple Diamonds", 4],
    [18, "purple-patches", "Purple Patches", 4],
    [19, "apricot-tiger", "Apricot Tiger", 5],
    [20, "apricot-zebra", "Apricot Zebra", 5],
    [21, "apricot-stripes", "Apricot Stripes", 5],
    [22, "brown-tiger", "Brown Tiger", 5],
    [23, "brown-zebra", "Brown Zebra", 5],
    [24, "brown-stripes", "Brown Stripes", 5],
    [25, "orange-forehead", "Orange Forehead", 6],
    [26, "orange-mask", "Orange Mask", 6],
    [27, "black-forehead", "Black Forehead", 6],
    [28, "black-mask", "Black Mask", 6],
    [29, "saucy-blue", "Saucy Blue", 7],
    [30, "blue-raindrops", "Blue Raindrops", 7],
    [31, "saucy-violet", "Saucy Violet", 7],
    [32, "violet-raindrops", "Violet Raindrops", 7],
    [99, "gold", "Gold", 1]
];
export const MAGIKARP_PATTERN_OFFSET = 6000;
export const GYARADOS_PATTERN_OFFSET = 6100;

const PATTERN_FORMS: Species[] = MAGIKARP_PATTERNS.flatMap(([n, slug, name, rodTier]) => {
    const pattern = { localSprite: true, rodTier };
    const magikarp = variant(129, MAGIKARP_PATTERN_OFFSET + n, "pattern", `${name} Magikarp`, {
        ...pattern,
        spriteKey: `129-${slug}`
    });
    // Gold Magikarp evolves into an ordinary Gyarados.
    if (slug === "gold") return [magikarp];
    return [
        magikarp,
        variant(130, GYARADOS_PATTERN_OFFSET + n, "pattern", `${name} Gyarados`, {
            ...pattern,
            spriteKey: `130-${slug}`
        })
    ];
});

/**
 * Fan-favorite variants from the Cobblemon wiki (Pokémon/Unique Forms): purely cosmetic, same
 * stats as the species. Sprites are generated by scripts/generateCobblemonVariants.py.
 */
const COSMETIC_VARIANTS: Species[] = (
    [
        // Arbok's hood patterns from other media.
        [24, 7001, "24-legacy", "Legacy Arbok"],
        [24, 7002, "24-attack", "Attack Arbok"],
        [24, 7003, "24-elusive", "Elusive Arbok"],
        [24, 7004, "24-speed", "Speed Arbok"],
        [24, 7005, "24-sound", "Sound Arbok"],
        [24, 7006, "24-dark", "Dark Arbok"],
        [24, 7007, "24-heart", "Heart Arbok"],
        // Olesia's Wooper from "No Big Woop!".
        [194, 7010, "194-heart", "Heart-Marked Wooper"],
        // Minecraft's mooshrooms and shulkers.
        [241, 7011, "241-mooshtank-red", "Red Mooshtank"],
        [241, 7012, "241-mooshtank-brown", "Brown Mooshtank"],
        [205, 7013, "205-shulker", "Shulker Forretress"],
        // Puka, the surfing Pikachu of Seafoam Island in "The Pi-Kahuna".
        [25, 7014, "25-alola-bias", "Alola-Bias Pikachu"],
        // Pokémon Sleep's research-area Snorlax, for the sleeping Snorlax that block the way.
        [143, 7020, "143-sleep-taupe", "Taupe Hollow Snorlax"],
        [143, 7021, "143-sleep-cyan", "Cyan Beach Snorlax"],
        // The Lake of Rage's red Gyarados, forced to evolve by Team Rocket's signal.
        [130, 7022, "130-red", "Red Gyarados"]
    ] as [number, number, string, string][]
).map(([base, id, key, name]) =>
    variant(base, id, "cosmetic", name, {
        spriteKey: key,
        localSprite: true,
        // They evolve like their species (a Heart-Marked Wooper becomes a regular Quagsire).
        evolutions: SPECIES[base - 1].evolutions
    })
);

/**
 * One-of-a-kind Pokémon met as legendary encounters, so they're never the same as the wild ones.
 * Sprites are generated by scripts/generateLegendaryForms.py.
 */
function boosted(base: number): Species["baseStats"] {
    // Giants hit harder and last longer: +20% HP, Attack and Special Attack.
    const [hp, atk, def, spa, spd, spe] = SPECIES[base - 1].baseStats;
    return [Math.round(hp * 1.2), Math.round(atk * 1.2), def, Math.round(spa * 1.2), spd, spe];
}
const LEGENDARY_FORMS: Species[] = [
    // The giants of "The Ancient Puzzle of Pokémopolis", covered in tattoo-like marks.
    ...(
        [
            [65, 7150, "Giant Alakazam"],
            [94, 7151, "Giant Gengar"],
            [39, 7152, "Giant Jigglypuff"]
        ] as [number, number, string][]
    ).map(([base, id, name]) =>
        variant(base, id, "giant", name, {
            spriteKey: `${base}-giant`,
            localSprite: true,
            baseStats: boosted(base),
            captureRate: 3
        })
    ),
    // The storm-dark Dragonite of Bill's lighthouse in "Mystery at the Lighthouse".
    variant(149, 7153, "giant", "Giant Dragonite", {
        spriteKey: "149-giant",
        localSprite: true,
        baseStats: boosted(149),
        captureRate: 3
    }),
    // Johto's: the round, flightless Pidgey of Pudgy Pidgey Isle ("Fly Me to the Moon")...
    variant(16, 3016, "unique", "Pudgy Pidgey", {
        spriteKey: "16-pudgy",
        localSprite: true,
        captureRate: 120
    }),
    // ...Silver, Lugia's child ("Hi Ho Silver... Away!")...
    variant(249, 3249, "unique", "Silver (young Lugia)", {
        spriteKey: "249-young",
        localSprite: true
    }),
    // ...the Unown's Entei ("Spell of the Unown"), drawn in the Unown's dark glyphs...
    variant(244, 3244, "unique", "Unown Entei", {
        spriteKey: "244-unown",
        localSprite: true,
        types: ["fire", "psychic"]
    }),
    // ...and the Celebi and Tyranitar corrupted by the Iron-Masked Marauder's Dark Balls
    // ("Celebi: The Voice of the Forest").
    variant(251, 3251, "unique", "Dark Celebi", {
        spriteKey: "251-dark",
        localSprite: true,
        types: ["dark", "grass"]
    }),
    variant(248, 3248, "unique", "Dark Tyranitar", {
        spriteKey: "248-dark",
        localSprite: true
    }),
    // Hoenn's: Meta Groudon, which Butler built from Groudon's fossil and Jirachi's power
    // ("Jirachi: Wish Maker").
    variant(383, 3383, "unique", "Meta Groudon", {
        spriteKey: "383-meta",
        localSprite: true,
        types: ["ground", "dark"]
    }),
    // Mewtwo's clones of great Trainers' Pokémon in "Mewtwo Strikes Back", marked with stripes.
    ...[1, 4, 7, 3, 6, 9, 25, 52, 31, 18, 111, 27, 28, 123, 106, 87, 45, 55, 54, 117, 73, 130]
        .concat([38, 37, 78, 134, 40])
        .map(base =>
            variant(base, CLONE_OFFSET + base, "clone", `Clone ${SPECIES[base - 1].name}`, {
                spriteKey: `${base}-clone`,
                localSprite: true
            })
        )
];

/**
 * Wild Pokémon that sometimes appear as a cosmetic variant instead: species → chance and
 * weighted variants.
 */
export const WILD_VARIANTS: Record<number, { chance: number; variants: [number, number][] }> = {
    24: {
        chance: 0.3,
        variants: [
            [7001, 1],
            [7002, 1],
            [7003, 1],
            [7004, 1],
            [7005, 1],
            [7006, 0.5],
            [7007, 1]
        ]
    },
    194: { chance: 0.05, variants: [[7010, 1]] },
    // Burmy's cloak is made of whatever was around it: leaves, sand or trash.
    412: {
        chance: 2 / 3,
        variants: [
            [4200, 1],
            [4201, 1]
        ]
    },
    241: {
        chance: 0.12,
        variants: [
            [7011, 3],
            [7012, 1]
        ]
    }
};

/**
 * Variants reached by evolving again once you own the regular evolution (Pineco → Forretress,
 * then Pineco → Shulker Forretress).
 */
export const ALTERNATE_EVOLUTIONS: Record<number, number[]> = { 205: [7013] };

/** The patterned Magikarp a Roddy's Rod of this level can hook. */
export function magikarpPatterns(rodLevel: number): Species[] {
    return PATTERN_FORMS.filter(s => s.baseSpecies === 129 && (s.rodTier ?? Infinity) <= rodLevel);
}

const OFFICIAL_FORMS: (Species & { identifier: string })[] = (formsJson as FormData[]).map(f => {
    const base = SPECIES[f.speciesId - 1];
    const regional = REGIONAL_SUFFIX.test(f.identifier);
    return {
        ...base,
        id: f.id,
        identifier: f.identifier,
        name: f.name,
        types: f.types,
        baseStats: f.baseStats,
        baseExp: f.baseExp,
        baseSpecies: f.speciesId,
        variant: regional ? "regional" : "official",
        nativeRegion: f.region,
        spriteKey: f.sprite,
        genderDifferences: false,
        evolutions: []
    };
});

/** Species that have a female form, so their gender-locked evolutions go by form. */
const HAS_FEMALE_FORM = new Set(
    SPECIES.filter(s => s.genderDifferences && s.genderRate > 0).map(s => s.id)
);
/** Every species' evolutions as the data has them, before splitting by gender. */
const DATA_EVOLUTIONS = new Map(SPECIES.map(s => [s.id, s.evolutions]));
// The regular (male) form doesn't take a female-only evolution when a female form exists.
for (const s of SPECIES) {
    if (HAS_FEMALE_FORM.has(s.id)) s.evolutions = s.evolutions.filter(e => e.gender !== "female");
}

const FEMALE_FORMS: Species[] = SPECIES.filter(s => HAS_FEMALE_FORM.has(s.id)).map(s => ({
    ...s,
    id: FEMALE_OFFSET + s.id,
    name: `${s.name} ♀`,
    baseSpecies: s.id,
    variant: "female",
    spriteKey: `female/${s.id}`,
    genderDifferences: false,
    evolutions: []
}));

/** Every alternate form, whether or not it's placed in a region yet. */
/** Offset added to a species id for its Shadow form (Orre's Cipher closes their hearts). */
export const SHADOW_OFFSET = 8000;

/**
 * Every species has a Shadow form: snagged from Cipher in Orre (and, once the Snag Machine is
 * unlocked, from Cipher Peons anywhere). Shadow forms can't evolve; purifying one at the Relic
 * Stone turns it back into its species. Sprites are the species' own with a dark aura.
 */
const SHADOW_FORMS: Species[] = SPECIES.map(s =>
    variant(s.id, SHADOW_OFFSET + s.id, "shadow", `Shadow ${s.name}`)
);

export const VARIANT_SPECIES: Species[] = [
    ...ANIME_VARIANTS,
    ...OFFICIAL_FORMS,
    ...FEMALE_FORMS,
    ...PATTERN_FORMS,
    ...COSMETIC_VARIANTS,
    ...LEGENDARY_FORMS,
    ...SHADOW_FORMS
];

const SPECIES_BY_ID = new Map<number, Species>(
    [...SPECIES, ...VARIANT_SPECIES].map(species => [species.id, species])
);
export const ALL_SPECIES: Species[] = [...SPECIES, ...VARIANT_SPECIES];

// Evolutions: a form evolves into the matching form of its evolution when one exists (Pinkan
// Rhyhorn → Pinkan Rhydon, Alolan Rattata → Alolan Raticate, female Pikachu → female Raichu),
// otherwise into the regular species. Unique individuals, giants, clones and cosmetic forms
// keep the evolutions they were given.
const FIXED_FORMS: (VariantKind | undefined)[] = [
    "unique",
    "official",
    "cosmetic",
    "giant",
    "clone",
    "shadow"
];
for (const form of VARIANT_SPECIES) {
    if (FIXED_FORMS.includes(form.variant)) {
        continue;
    }
    // Female forms keep the female-only evolutions their regular form gives up.
    const baseEvolutions =
        form.variant === "female"
            ? (DATA_EVOLUTIONS.get(form.baseSpecies!) ?? []).filter(e => e.gender !== "male")
            : SPECIES[form.baseSpecies! - 1].evolutions;
    form.evolutions = baseEvolutions.map(evolution => {
        let into: number | undefined;
        if (form.variant === "pattern") {
            const gyarados = form.id - MAGIKARP_PATTERN_OFFSET + GYARADOS_PATTERN_OFFSET;
            into = SPECIES_BY_ID.has(gyarados) ? gyarados : undefined;
        } else if (form.variant === "regional") {
            const suffix = (form as Species & { identifier: string }).identifier.match(
                REGIONAL_SUFFIX
            )?.[0];
            into = OFFICIAL_FORMS.find(
                f => f.baseSpecies === evolution.into && f.identifier.endsWith(suffix ?? "?")
            )?.id;
        } else {
            const offset = form.id - form.baseSpecies!;
            into = SPECIES_BY_ID.has(evolution.into + offset) ? evolution.into + offset : undefined;
        }
        return into != null ? { ...evolution, into } : evolution;
    });
}

// Gen 4's cloaked and East Sea forms evolve into the matching form: a Sandy Burmy into a Sandy
// Wormadam (or a Mothim), an East Shellos into an East Gastrodon.
const formId = (identifier: string) => OFFICIAL_FORMS.find(f => f.identifier === identifier)!.id;
for (const [from, into] of [
    ["burmy-sandy", "wormadam-sandy"],
    ["burmy-trash", "wormadam-trash"],
    ["shellos-east", "gastrodon-east"]
]) {
    const form = SPECIES_BY_ID.get(formId(from))!;
    form.evolutions = SPECIES[form.baseSpecies! - 1].evolutions.map(evolution =>
        evolution.into === SPECIES_BY_ID.get(formId(into))!.baseSpecies
            ? { ...evolution, into: formId(into) }
            : evolution
    );
}

/** The Arceus form a Plate of this type turns Arceus into. */
export function arceusForm(type: PokemonType): number {
    return formId(`arceus-${type}`);
}

export function isVariant(id: number): boolean {
    return id > DEX_SIZE;
}

/** The dark aura drawn around Shadow Pokémon. */
const SHADOW_FILTER =
    "drop-shadow(0 0 2px #6d28d9) drop-shadow(0 0 4px #4c1d95) saturate(0.8) brightness(0.85)";

export function variantFilter(id: number): string | undefined {
    return isShadow(id) ? SHADOW_FILTER : VARIANT_FILTERS[id];
}

export function isShadow(id: number): boolean {
    return id > SHADOW_OFFSET && id <= SHADOW_OFFSET + DEX_SIZE;
}

/** The Shadow form of a Pokémon's species (forms of any kind count as their species). */
export function shadowOf(id: number): number {
    const species = SPECIES_BY_ID.get(id);
    return SHADOW_OFFSET + (species?.baseSpecies ?? id);
}

export function spriteAccessory(id: number): string | undefined {
    return SPECIES_BY_ID.get(id)?.accessory;
}

/**
 * The id a Pokémon is enshrined under in the Hall of Fame. Female forms count as their species;
 * other forms (Pinkan, Alolan, Unown letters…) look different enough to count on their own.
 */
export function hallOfFameId(id: number): number {
    const species = SPECIES_BY_ID.get(id);
    return species?.variant === "female" ? species.baseSpecies! : id;
}

/**
 * The female form a wild Pokémon of this species appears as, if it has one. Only regular species
 * have them: other ids sit in other forms' ranges (2012 + 5000 is a Mooshtank, 1010 + 5000 a
 * Magikarp pattern), so they must never be offset.
 */
export function femaleForm(speciesId: number): Species | undefined {
    if (speciesId > DEX_SIZE) return undefined;
    const form = SPECIES_BY_ID.get(FEMALE_OFFSET + speciesId);
    return form?.variant === "female" ? form : undefined;
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

/**
 * Sprites come from PokeAPI's default set, the only one that covers every form (Unown letters,
 * caps, regional forms, female differences) in one consistent style.
 */
export function spriteKey(id: number): string {
    const species = SPECIES_BY_ID.get(id);
    return species?.spriteKey ?? String(species?.baseSpecies ?? id);
}

export function spriteUrl(id: number, shiny = false, back = false): string {
    const path = `pokemon/${back ? "back/" : ""}${shiny ? "shiny/" : ""}${spriteKey(id)}.png`;
    return assetUrl(SPECIES_BY_ID.get(id)?.localSprite === true ? `local/${path}` : path);
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

/**
 * The Sinnoh Underground (Sinnoh's generation mechanic): wild battles won uncover fresh walls to
 * dig, and each wall gives up two to four treasures. The items and their rarities are Platinum's
 * (Serebii's Underground list): Spheres, shards and valuables sell, stones go in the bag, fossils
 * are revived on the spot, Plates are kept for good, and the Odd Keystone calls Spiritomb.
 * Fossils other than the Skull and Armor Fossils, and more of the stones, turn up once Sinnoh has
 * been cleared (the games' National Pokédex).
 */
import type { PokemonType, StoneId } from "./data";
import { itemSprite } from "./items";

export type Rarity = "common" | "uncommon" | "rare" | "veryRare";

/** How often each rarity comes up, relative to each other. */
export const RARITY_WEIGHT: Record<Rarity, number> = {
    common: 20,
    uncommon: 8,
    rare: 3,
    veryRare: 1
};

export interface UndergroundItem {
    id: string;
    name: string;
    sprite: string;
    /** Rarity before Sinnoh is cleared; undefined when it can't be found yet. */
    rarity?: Rarity;
    /** Rarity once Sinnoh has been cleared, if it changes. */
    postGameRarity?: Rarity;
    /** A fossil: the Pokémon it's revived into. */
    fossil?: number;
    /** Skull and Armor Fossils depend on whether your Trainer ID is odd or even. */
    trainerId?: "odd" | "even";
    /** An evolution item for the bag. */
    stone?: StoneId;
    /** An Arceus Plate, of this type. */
    plate?: PokemonType;
    /** The Odd Keystone (a key item for Spiritomb). */
    keystone?: boolean;
    /** What it sells for, for everything else. */
    value?: number;
}

function sold(
    id: string,
    name: string,
    sprite: string,
    value: number,
    rarity: Rarity,
    postGameRarity?: Rarity
): UndergroundItem {
    return { id, name, sprite, rarity, postGameRarity, value };
}

function stone(
    id: string,
    name: string,
    sprite: string,
    item: StoneId,
    rarity: Rarity,
    postGameRarity: Rarity
): UndergroundItem {
    return { id, name, sprite, rarity, postGameRarity, stone: item };
}

/** Fossils other than the Skull and Armor Fossils only turn up after the League. */
function fossil(id: string, name: string, sprite: string, species: number): UndergroundItem {
    return { id, name, sprite, postGameRarity: "rare", fossil: species };
}

function plate(id: string, name: string, sprite: string, type: PokemonType): UndergroundItem {
    return { id, name, sprite, rarity: "veryRare", plate: type };
}

// Sprites are literal itemSprite calls so scripts/fetchSprites.ts finds them; the Spheres are
// drawn by scripts/generateSpheres.py.
export const UNDERGROUND_ITEMS: UndergroundItem[] = [
    sold("red-sphere", "Red Sphere", itemSprite("red-sphere"), 300, "common"),
    sold("blue-sphere", "Blue Sphere", itemSprite("blue-sphere"), 300, "common"),
    sold("green-sphere", "Green Sphere", itemSprite("green-sphere"), 300, "common"),
    sold("pale-sphere", "Pale Sphere", itemSprite("pale-sphere"), 600, "uncommon"),
    sold("prism-sphere", "Prism Sphere", itemSprite("prism-sphere"), 600, "uncommon"),
    sold("red-shard", "Red Shard", itemSprite("red-shard"), 200, "uncommon"),
    sold("blue-shard", "Blue Shard", itemSprite("blue-shard"), 200, "uncommon"),
    sold("yellow-shard", "Yellow Shard", itemSprite("yellow-shard"), 200, "uncommon"),
    sold("green-shard", "Green Shard", itemSprite("green-shard"), 200, "uncommon"),
    sold("heart-scale", "Heart Scale", itemSprite("heart-scale"), 500, "uncommon"),
    sold("everstone", "Everstone", itemSprite("everstone"), 100, "veryRare", "uncommon"),
    sold("hard-stone", "Hard Stone", itemSprite("hard-stone"), 100, "veryRare", "uncommon"),
    sold("damp-rock", "Damp Rock", itemSprite("damp-rock"), 200, "veryRare", "rare"),
    sold("heat-rock", "Heat Rock", itemSprite("heat-rock"), 200, "veryRare", "rare"),
    sold("icy-rock", "Icy Rock", itemSprite("icy-rock"), 200, "veryRare", "rare"),
    sold("smooth-rock", "Smooth Rock", itemSprite("smooth-rock"), 200, "veryRare", "rare"),
    sold("iron-ball", "Iron Ball", itemSprite("iron-ball"), 100, "veryRare"),
    sold("light-clay", "Light Clay", itemSprite("light-clay"), 100, "veryRare"),
    sold("revive", "Revive", itemSprite("revive"), 750, "veryRare"),
    sold("max-revive", "Max Revive", itemSprite("max-revive"), 2000, "veryRare"),
    sold("star-piece", "Star Piece", itemSprite("star-piece"), 4900, "veryRare", "rare"),
    sold("rare-bone", "Rare Bone", itemSprite("rare-bone"), 5000, "veryRare"),
    stone(
        "fire-stone",
        "Fire Stone",
        itemSprite("fire-stone"),
        "fireStone",
        "veryRare",
        "uncommon"
    ),
    stone(
        "water-stone",
        "Water Stone",
        itemSprite("water-stone"),
        "waterStone",
        "veryRare",
        "uncommon"
    ),
    stone(
        "thunder-stone",
        "Thunder Stone",
        itemSprite("thunder-stone"),
        "thunderStone",
        "veryRare",
        "uncommon"
    ),
    stone(
        "leaf-stone",
        "Leaf Stone",
        itemSprite("leaf-stone"),
        "leafStone",
        "veryRare",
        "uncommon"
    ),
    stone("sun-stone", "Sun Stone", itemSprite("sun-stone"), "sunStone", "veryRare", "uncommon"),
    stone("moon-stone", "Moon Stone", itemSprite("moon-stone"), "moonStone", "veryRare", "rare"),
    stone("oval-stone", "Oval Stone", itemSprite("oval-stone"), "ovalStone", "rare", "rare"),
    {
        id: "skull-fossil",
        name: "Skull Fossil",
        sprite: itemSprite("skull-fossil"),
        rarity: "uncommon",
        fossil: 408,
        trainerId: "odd"
    },
    {
        id: "armor-fossil",
        name: "Armor Fossil",
        sprite: itemSprite("armor-fossil"),
        rarity: "uncommon",
        fossil: 410,
        trainerId: "even"
    },
    fossil("helix-fossil", "Helix Fossil", itemSprite("helix-fossil"), 138),
    fossil("dome-fossil", "Dome Fossil", itemSprite("dome-fossil"), 140),
    fossil("old-amber", "Old Amber", itemSprite("old-amber"), 142),
    fossil("root-fossil", "Root Fossil", itemSprite("root-fossil"), 345),
    fossil("claw-fossil", "Claw Fossil", itemSprite("claw-fossil"), 347),
    plate("draco-plate", "Draco Plate", itemSprite("draco-plate"), "dragon"),
    plate("dread-plate", "Dread Plate", itemSprite("dread-plate"), "dark"),
    plate("earth-plate", "Earth Plate", itemSprite("earth-plate"), "ground"),
    plate("fist-plate", "Fist Plate", itemSprite("fist-plate"), "fighting"),
    plate("flame-plate", "Flame Plate", itemSprite("flame-plate"), "fire"),
    plate("icicle-plate", "Icicle Plate", itemSprite("icicle-plate"), "ice"),
    plate("insect-plate", "Insect Plate", itemSprite("insect-plate"), "bug"),
    plate("iron-plate", "Iron Plate", itemSprite("iron-plate"), "steel"),
    plate("meadow-plate", "Meadow Plate", itemSprite("meadow-plate"), "grass"),
    plate("mind-plate", "Mind Plate", itemSprite("mind-plate"), "psychic"),
    plate("sky-plate", "Sky Plate", itemSprite("sky-plate"), "flying"),
    plate("splash-plate", "Splash Plate", itemSprite("splash-plate"), "water"),
    plate("spooky-plate", "Spooky Plate", itemSprite("spooky-plate"), "ghost"),
    plate("stone-plate", "Stone Plate", itemSprite("stone-plate"), "rock"),
    plate("toxic-plate", "Toxic Plate", itemSprite("toxic-plate"), "poison"),
    plate("zap-plate", "Zap Plate", itemSprite("zap-plate"), "electric"),
    {
        id: "odd-keystone",
        name: "Odd Keystone",
        sprite: itemSprite("odd-keystone"),
        rarity: "veryRare",
        keystone: true
    }
];

/** Every Pokémon an Underground fossil revives into. */
export const FOSSIL_SPECIES: number[] = UNDERGROUND_ITEMS.flatMap(item =>
    item.fossil != null ? [item.fossil] : []
);

/** Wild battles won per fresh wall, and how many fresh walls can wait at once. */
export const UNDERGROUND_BATTLES = 25;
export const MAX_WALLS = 5;
/** Level a revived fossil Pokémon starts at. */
export const FOSSIL_LEVEL = 20;

/** What can be dug up, with weights, for this Trainer ID and whether Sinnoh has been cleared. */
export function diggable(trainerId: number, postGame: boolean): [UndergroundItem, number][] {
    const parity = trainerId % 2 === 1 ? "odd" : "even";
    return UNDERGROUND_ITEMS.flatMap(item => {
        if (item.trainerId != null && item.trainerId !== parity) return [];
        const rarity = postGame ? (item.postGameRarity ?? item.rarity) : item.rarity;
        return rarity != null ? [[item, RARITY_WEIGHT[rarity]] as [UndergroundItem, number]] : [];
    });
}

/** Digs one wall: two to four treasures. */
export function digWall(
    trainerId: number,
    postGame: boolean,
    rng: () => number = Math.random
): UndergroundItem[] {
    const table = diggable(trainerId, postGame);
    const total = table.reduce((sum, [, w]) => sum + w, 0);
    const count = 2 + Math.floor(rng() * 3);
    const found: UndergroundItem[] = [];
    for (let i = 0; i < count; i++) {
        let roll = rng() * total;
        const hit = table.find(([, w]) => (roll -= w) <= 0) ?? table[table.length - 1];
        found.push(hit[0]);
    }
    return found;
}

/** The types of Arceus's Plates. */
export const PLATE_TYPES: PokemonType[] = UNDERGROUND_ITEMS.flatMap(item =>
    item.plate != null ? [item.plate] : []
);

import { assetUrl } from "./assets";
import type { StoneId } from "./data";

export type BallId = "pokeBall" | "greatBall" | "ultraBall" | "masterBall";

export interface BallDefinition {
    id: BallId;
    name: string;
    /** Multiplier to the species' capture rate. */
    catchMultiplier: number;
    /** Poké Mart price, or null if it can't be bought. */
    price: number | null;
    /** Badges needed before the Mart stocks it. */
    badgesRequired: number;
    sprite: string;
}

export function itemSprite(slug: string): string {
    return assetUrl(`items/${slug}.png`);
}

export const BALLS: Record<BallId, BallDefinition> = {
    pokeBall: {
        id: "pokeBall",
        name: "Poké Ball",
        catchMultiplier: 1,
        price: 20,
        badgesRequired: 0,
        sprite: itemSprite("poke-ball")
    },
    greatBall: {
        id: "greatBall",
        name: "Great Ball",
        catchMultiplier: 1.5,
        price: 100,
        badgesRequired: 2,
        sprite: itemSprite("great-ball")
    },
    ultraBall: {
        id: "ultraBall",
        name: "Ultra Ball",
        catchMultiplier: 2,
        price: 300,
        badgesRequired: 4,
        sprite: itemSprite("ultra-ball")
    },
    masterBall: {
        id: "masterBall",
        name: "Master Ball",
        catchMultiplier: Infinity,
        price: null,
        badgesRequired: Infinity,
        sprite: itemSprite("master-ball")
    }
};

/** Balls in the order they're tried when "best available" is selected (Master Balls are never auto-used). */
export const AUTO_BALL_ORDER: BallId[] = ["ultraBall", "greatBall", "pokeBall"];

export interface StoneDefinition {
    id: StoneId;
    name: string;
    price: number;
    badgesRequired: number;
    sprite: string;
}

export const STONES: Record<StoneId, StoneDefinition> = {
    moonStone: {
        id: "moonStone",
        name: "Moon Stone",
        price: 2000,
        badgesRequired: 1,
        sprite: itemSprite("moon-stone")
    },
    fireStone: {
        id: "fireStone",
        name: "Fire Stone",
        price: 3000,
        badgesRequired: 3,
        sprite: itemSprite("fire-stone")
    },
    waterStone: {
        id: "waterStone",
        name: "Water Stone",
        price: 3000,
        badgesRequired: 3,
        sprite: itemSprite("water-stone")
    },
    thunderStone: {
        id: "thunderStone",
        name: "Thunder Stone",
        price: 3000,
        badgesRequired: 3,
        sprite: itemSprite("thunder-stone")
    },
    leafStone: {
        id: "leafStone",
        name: "Leaf Stone",
        price: 3000,
        badgesRequired: 3,
        sprite: itemSprite("leaf-stone")
    },
    sunStone: {
        id: "sunStone",
        name: "Sun Stone",
        price: 3000,
        badgesRequired: 4,
        sprite: itemSprite("sun-stone")
    },
    linkCable: {
        id: "linkCable",
        name: "Link Cable",
        price: 2500,
        badgesRequired: 3,
        sprite: itemSprite("gb-sounds")
    },
    sootheBell: {
        id: "sootheBell",
        name: "Soothe Bell",
        price: 2500,
        badgesRequired: 3,
        sprite: itemSprite("soothe-bell")
    },
    metalCoat: {
        id: "metalCoat",
        name: "Metal Coat",
        price: 3000,
        badgesRequired: 5,
        sprite: itemSprite("metal-coat")
    },
    kingsRock: {
        id: "kingsRock",
        name: "King's Rock",
        price: 3000,
        badgesRequired: 5,
        sprite: itemSprite("kings-rock")
    },
    dragonScale: {
        id: "dragonScale",
        name: "Dragon Scale",
        price: 3000,
        badgesRequired: 5,
        sprite: itemSprite("dragon-scale")
    },
    upGrade: {
        id: "upGrade",
        name: "Up-Grade",
        price: 3000,
        badgesRequired: 5,
        sprite: itemSprite("up-grade")
    }
};

/** What each evolution item does, for the Mart. */
export const STONE_DESCRIPTIONS: Partial<Record<StoneId, string>> = {
    linkCable: "Evolves one Pokémon that normally evolves by trading.",
    sootheBell:
        "Evolves one friendship Pokémon (Golbat, Chansey, Eevee, babies) right away, whatever its level.",
    metalCoat: "Held while trading: Onix becomes Steelix, Scyther becomes Scizor.",
    kingsRock: "Held while trading: Poliwhirl becomes Politoed, Slowpoke becomes Slowking.",
    dragonScale: "Held while trading: Seadra becomes Kingdra.",
    upGrade: "Held while trading: Porygon becomes Porygon2."
};

export type KeyItemId =
    | "oldRod"
    | "goodRod"
    | "superRod"
    | "surf"
    | "bicycle"
    | "pokeFlute"
    | "headbutt"
    | "rockSmash"
    | "squirtBottle";

export interface KeyItemDefinition {
    id: KeyItemId;
    name: string;
    description: string;
    sprite: string;
}

export const KEY_ITEMS: Record<KeyItemId, KeyItemDefinition> = {
    oldRod: {
        id: "oldRod",
        name: "Old Rod",
        description: "Fish for Pokémon in any zone with water.",
        sprite: itemSprite("old-rod")
    },
    goodRod: {
        id: "goodRod",
        name: "Good Rod",
        description: "Hooks Poliwag and Goldeen wherever there's water.",
        sprite: itemSprite("good-rod")
    },
    superRod: {
        id: "superRod",
        name: "Super Rod",
        description: "Reel in each zone's rarest water Pokémon.",
        sprite: itemSprite("super-rod")
    },
    surf: {
        id: "surf",
        name: "HM03 Surf",
        description: "Cross the sea routes and meet Tentacool on the waves.",
        sprite: itemSprite("hm-water")
    },
    bicycle: {
        id: "bicycle",
        name: "Bicycle",
        description: "Find wild Pokémon twice as fast.",
        sprite: itemSprite("bicycle")
    },
    pokeFlute: {
        id: "pokeFlute",
        name: "Poké Flute",
        description: "Wakes the sleeping Snorlax on Route 12.",
        sprite: itemSprite("poke-flute")
    },
    headbutt: {
        id: "headbutt",
        name: "TM02 Headbutt",
        description: "Shake Johto's trees to knock down the Pokémon living in them.",
        sprite: itemSprite("tm-normal")
    },
    rockSmash: {
        id: "rockSmash",
        name: "HM06 Rock Smash",
        description: "Smash cracked rocks to find the Pokémon hiding underneath.",
        sprite: itemSprite("hm-fighting")
    },
    squirtBottle: {
        id: "squirtBottle",
        name: "SquirtBottle",
        description: "Water the odd tree blocking Route 36.",
        sprite: itemSprite("squirt-bottle")
    }
};

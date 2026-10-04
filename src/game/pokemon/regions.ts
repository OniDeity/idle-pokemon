/**
 * A journey takes place in one region: its zones, its trials (Gyms or quests), and a finale.
 * Clearing the finale lets the player enter the Hall of Fame and start a new journey anywhere
 * they've unlocked.
 */
import { COLOSSEUM_TRIALS, colosseumFinale } from "./colosseum";
import { XD_TRIALS, xdFinale } from "./xd";
import type { KeyItemId } from "./items";
import { JOHTO_GYMS, johtoFinale } from "./johto";
import { ORANGE_TRIALS, orangeFinale } from "./orange";
import { SEVII_TRIALS, seviiFinale } from "./sevii";
import type { GymDefinition, TrainerDefinition } from "./trainers";
import { championFor, ELITE_FOUR, GYMS } from "./trainers";
import type { RegionId } from "./zones";

export interface RegionDefinition {
    id: RegionId;
    name: string;
    blurb: string;
    color: string;
    starters: number[];
    /** Extra starters offered once the region has been cleared (Let's Go's partner Pokémon). */
    partnerStarters?: number[];
    startLevel: number;
    /** Key items the player already has when the journey starts. */
    startingKeyItems: KeyItemId[];
    /** Added to trials cleared when deciding what the Poké Mart stocks. */
    shopTier: number;
    trials: GymDefinition[];
    /** What the region's trials are called, e.g. "badges". */
    trialNoun: string;
    finaleName: string;
    finaleBlurb: string;
    finale: (starter: number) => TrainerDefinition[];
    /** Level cap by trials cleared; the last entry applies after the finale. */
    levelCaps: number[];
    /** Base Fame for clearing the region. */
    fame: number;
    /** A region that must be cleared once before this one can be chosen. */
    requires?: RegionId;
    /** Also needs every species the earlier regions offer in the Pokédex. */
    requiresCompletePokedex?: boolean;
    /** Every starter joins the party, not just the one picked (Colosseum's Espeon and Umbreon). */
    allStarters?: boolean;
}

export const REGIONS: Record<RegionId, RegionDefinition> = {
    kanto: {
        id: "kanto",
        name: "Kanto",
        blurb: "Eight Gyms, the Elite Four, and the anime's hidden corners of Kanto.",
        color: "#DC0A2D",
        starters: [1, 4, 7],
        partnerStarters: [10158, 10159],
        startLevel: 5,
        startingKeyItems: [],
        shopTier: 0,
        trials: GYMS,
        trialNoun: "badges",
        finaleName: "Pokémon League",
        finaleBlurb:
            "Face the Elite Four and the Champion back-to-back (your party is healed between battles).",
        finale: starter => [...ELITE_FOUR, championFor(starter)],
        levelCaps: [20, 26, 32, 38, 46, 50, 54, 58, 65, 100],
        fame: 10
    },
    orange: {
        id: "orange",
        name: "Orange Islands",
        blurb: "Island-hop by Lapras through the Orange Crew's challenges to the Winner's Cup.",
        color: "#F97316",
        starters: [25, 175, 131],
        startLevel: 5,
        startingKeyItems: ["surf", "oldRod"],
        shopTier: 2,
        trials: ORANGE_TRIALS,
        trialNoun: "badges",
        finaleName: "Winner's Cup",
        finaleBlurb:
            "A full six-on-six battle against Drake, the Orange Crew's Supreme Gym Leader.",
        finale: () => orangeFinale(),
        levelCaps: [20, 28, 35, 42, 50, 100],
        fame: 12,
        requires: "kanto"
    },
    sevii: {
        id: "sevii",
        name: "Sevii Islands",
        blurb: "Help Celio link the Network Machine and climb the Trainer Tower. Johto Pokémon abound.",
        color: "#0EA5E9",
        starters: [152, 155, 158],
        startLevel: 25,
        // A FireRed/LeafGreen Trainer reaches the islands with every Kanto HM, Rock Smash included.
        startingKeyItems: ["oldRod", "goodRod", "superRod", "surf", "bicycle", "rockSmash"],
        shopTier: 8,
        trials: SEVII_TRIALS,
        trialNoun: "quests",
        finaleName: "Trainer Tower",
        finaleBlurb: "Climb all three floors of the Trainer Tower without losing a battle.",
        finale: () => seviiFinale(),
        levelCaps: [38, 44, 48, 52, 56, 64, 100],
        fame: 15,
        requires: "orange"
    },
    johto: {
        id: "johto",
        name: "Johto",
        blurb: "Eight new Gyms from Violet City to Blackthorn, and the Indigo Plateau's Elite Four.",
        color: "#B8860B",
        starters: [152, 155, 158],
        startLevel: 5,
        startingKeyItems: [],
        shopTier: 0,
        trials: JOHTO_GYMS,
        trialNoun: "badges",
        finaleName: "Indigo Plateau",
        finaleBlurb:
            "Face Will, Koga, Bruno, Karen and Champion Lance back-to-back (your party is healed between battles).",
        finale: () => johtoFinale(),
        levelCaps: [18, 22, 26, 31, 36, 40, 42, 47, 55, 100],
        fame: 18,
        requires: "sevii",
        requiresCompletePokedex: true
    },
    orre: {
        id: "orre",
        name: "Orre (Colosseum)",
        blurb: "No wild Pokémon, only Cipher's Shadow Pokémon to snag and purify, from Phenac City to Realgam Tower.",
        color: "#C2410C",
        starters: [196, 197],
        startLevel: 25,
        startingKeyItems: ["snagMachine"],
        shopTier: 4,
        trials: COLOSSEUM_TRIALS,
        trialNoun: "Cipher admins",
        finaleName: "Realgam Tower",
        finaleBlurb:
            "Climb Realgam Tower's Colosseum: Gonzap, Nascour and Cipher's head Evice, back-to-back (your party is healed between battles).",
        finale: () => colosseumFinale(),
        levelCaps: [37, 42, 47, 50, 62, 100],
        fame: 20,
        requires: "johto",
        requiresCompletePokedex: true,
        allStarters: true
    },
    orreXd: {
        id: "orreXd",
        name: "Orre (XD)",
        blurb: "Five years on, Cipher is back with XD001, Shadow Lugia. Snag, purify, and feed the Poké Spots.",
        color: "#5B21B6",
        starters: [133],
        startLevel: 10,
        startingKeyItems: ["snagMachine"],
        shopTier: 1,
        trials: XD_TRIALS,
        trialNoun: "Cipher admins",
        finaleName: "Citadark Isle",
        finaleBlurb:
            "Face XD001, Shadow Lugia, then Grand Master Greevil and his Shadow legendary birds, back-to-back.",
        finale: () => xdFinale(),
        levelCaps: [21, 29, 37, 45, 51, 56, 100],
        fame: 22,
        requires: "orre",
        requiresCompletePokedex: true
    }
};

/** The starters on offer for a journey, given how many times the region has been cleared. */
export function startersFor(region: RegionDefinition, clears: number): number[] {
    return clears > 0 ? [...region.starters, ...(region.partnerStarters ?? [])] : region.starters;
}

export const REGION_LIST: RegionDefinition[] = Object.values(REGIONS);

/** Trainers get tougher each time you've cleared their region, like rematches in the games. */
export const REMATCH_STRENGTH_PER_CLEAR = 0.15;
export const MAX_REMATCH_CLEARS = 5;

export function rematchMultiplier(clears: number): number {
    return 1 + REMATCH_STRENGTH_PER_CLEAR * Math.min(clears, MAX_REMATCH_CLEARS);
}

/**
 * Renown: regions you haven't cleared yet have heard of your Hall of Fame entries, and their
 * trainers prepare harder for each other region you've conquered beyond the first. This keeps a
 * first clear about a day long however much Fame you've built up.
 */
export const RENOWN_STRENGTH_PER_REGION = 0.3;

/**
 * How much stronger a region's trainers are: rematch strength once it has been cleared, renown
 * before that.
 */
export function strengthMultiplier(clears: number, otherRegionsCleared: number): number {
    return clears > 0
        ? rematchMultiplier(clears)
        : 1 + RENOWN_STRENGTH_PER_REGION * Math.max(0, otherRegionsCleared - 1);
}

/** A trainer scaled by a region strength multiplier. */
export function withStrength<T extends TrainerDefinition>(trainer: T, multiplier: number): T {
    return multiplier === 1
        ? trainer
        : { ...trainer, statMultiplier: trainer.statMultiplier * multiplier };
}

export function levelCap(region: RegionDefinition, trialsCleared: number, cleared: boolean) {
    const caps = region.levelCaps;
    return cleared ? caps[caps.length - 1] : caps[Math.min(trialsCleared, caps.length - 2)];
}

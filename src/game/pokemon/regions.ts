/**
 * A journey takes place in one region: its zones, its trials (Gyms or quests), and a finale.
 * Clearing the finale lets the player enter the Hall of Fame and start a new journey anywhere
 * they've unlocked.
 */
import type { KeyItemId } from "./items";
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
}

export const REGIONS: Record<RegionId, RegionDefinition> = {
    kanto: {
        id: "kanto",
        name: "Kanto",
        blurb: "Eight Gyms, the Elite Four, and the anime's hidden corners of Kanto.",
        color: "#DC0A2D",
        starters: [1, 4, 7],
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
        startingKeyItems: ["oldRod", "goodRod", "superRod", "surf", "bicycle"],
        shopTier: 8,
        trials: SEVII_TRIALS,
        trialNoun: "quests",
        finaleName: "Trainer Tower",
        finaleBlurb: "Climb all three floors of the Trainer Tower without losing a battle.",
        finale: () => seviiFinale(),
        levelCaps: [38, 44, 48, 52, 56, 64, 100],
        fame: 15,
        requires: "kanto"
    }
};

export const REGION_LIST: RegionDefinition[] = Object.values(REGIONS);

export function levelCap(region: RegionDefinition, trialsCleared: number, cleared: boolean) {
    const caps = region.levelCaps;
    return cleared ? caps[caps.length - 1] : caps[Math.min(trialsCleared, caps.length - 2)];
}

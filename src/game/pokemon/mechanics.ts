/**
 * Mechanics a generation introduced. Each one is met first in its own region; once reached
 * there, it's unlocked for good and works in every region, earlier ones included, on every
 * journey after. Later generations' (double battles in Hoenn, Mega Evolution in Kalos, ...)
 * join this list with their regions.
 */
import type { KeyItemId } from "./items";
import type { RegionId } from "./zones";

export type MechanicId = "breeding" | "apricornBalls" | "headbutt";

export interface MechanicDefinition {
    id: MechanicId;
    name: string;
    /** The region that introduces it. */
    region: RegionId;
    /** Where in that region it's first reached, for the locked description. */
    unlockAt: string;
    /** Trials (Gyms) cleared in that region before it's reached. */
    trialsRequired: number;
    description: string;
    /** A key item the mechanic hands out on every journey once unlocked. */
    keyItem?: KeyItemId;
}

export const MECHANICS: Record<MechanicId, MechanicDefinition> = {
    breeding: {
        id: "breeding",
        name: "Breeding",
        region: "johto",
        unlockAt: "the Day Care on Route 34, past the Hive Badge",
        trialsRequired: 2,
        description:
            "The Day Care finds Eggs that hatch into the first stage of a family, babies included."
    },
    apricornBalls: {
        id: "apricornBalls",
        name: "Apricorn Balls",
        region: "johto",
        unlockAt: "Kurt's house in Azalea Town, past the Hive Badge",
        trialsRequired: 2,
        description:
            "Every Poké Mart stocks Kurt's Level, Lure, Moon, Friend, Love, Fast and Heavy Balls."
    },
    headbutt: {
        id: "headbutt",
        name: "Headbutt trees",
        region: "johto",
        unlockAt: "the Headbutt tutor in Ilex Forest, past the Hive Badge",
        trialsRequired: 2,
        description:
            "Every journey starts with Headbutt, and Kanto's trees have their HeartGold/SoulSilver Pokémon.",
        keyItem: "headbutt"
    }
};

export const MECHANIC_LIST: MechanicDefinition[] = Object.values(MECHANICS);

/** Where each region's Day Care is, in the games (the Orange Islands never had one). */
export const DAY_CARE_PLACE: Partial<Record<RegionId, string>> = {
    kanto: "Route 5",
    sevii: "Four Island",
    johto: "Route 34"
};

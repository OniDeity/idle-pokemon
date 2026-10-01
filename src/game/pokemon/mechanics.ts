/**
 * Mechanics a generation introduced. Each one is met first in its own region; once reached
 * there, it's unlocked for good and works in every region, earlier ones included, on every
 * journey after. Later generations' (double battles in Hoenn, Mega Evolution in Kalos, ...)
 * join this list with their regions.
 */
import type { RegionId } from "./zones";

export type MechanicId = "breeding";

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
    }
};

export const MECHANIC_LIST: MechanicDefinition[] = Object.values(MECHANICS);

/** Where each region's Day Care is, in the games (the Orange Islands never had one). */
export const DAY_CARE_PLACE: Partial<Record<RegionId, string>> = {
    kanto: "Route 5",
    sevii: "Four Island",
    johto: "Route 34"
};

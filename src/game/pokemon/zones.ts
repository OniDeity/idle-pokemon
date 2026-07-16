import route1Encounters from "data/pokemon/encounters/route1.json";
import route2Encounters from "data/pokemon/encounters/route2.json";
import viridianForestEncounters from "data/pokemon/encounters/viridianForest.json";
import type { EncounterTableEntry } from "./types";

export interface ZoneDefinition {
    id: string;
    name: string;
    encounterTable: EncounterTableEntry[];
    unlockedByDefault: boolean;
}

export const ROUTE_1: ZoneDefinition = {
    id: "route1",
    name: "Route 1",
    encounterTable: route1Encounters.entries,
    unlockedByDefault: true
};

export const ROUTE_2: ZoneDefinition = {
    id: "route2",
    name: "Route 2",
    encounterTable: route2Encounters.entries,
    unlockedByDefault: false
};

export const VIRIDIAN_FOREST: ZoneDefinition = {
    id: "viridianForest",
    name: "Viridian Forest",
    encounterTable: viridianForestEncounters.entries,
    unlockedByDefault: false
};

/**
 * Every zone in the current Pewter-area cluster. Adding a new zone to a later
 * milestone should only require pushing a new ZoneDefinition here (plus a tab
 * entry in field.tsx) - no other code should need to change.
 */
export const ZONES: ZoneDefinition[] = [ROUTE_1, ROUTE_2, VIRIDIAN_FOREST];

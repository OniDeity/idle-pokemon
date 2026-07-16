import type { Persistent } from "game/persistence";
import type { ZoneDefinition } from "./zones";
import type { PokedexEntry } from "./types";

export type Pokedex = Persistent<Record<string, PokedexEntry>>;

const EMPTY_ENTRY: PokedexEntry = {
    seen: false,
    caught: false,
    shinyCaught: false,
    timesCaught: 0
};

// Note: always replaces dex.value wholesale rather than mutating nested properties in place.
// persistent()'s [DefaultValue] holds the same object reference the ref was initialized with,
// so in-place mutation of that object would silently corrupt the "reset to default" value too.
export function recordSeen(dex: Pokedex, speciesId: string): void {
    const entry = dex.value[speciesId] ?? EMPTY_ENTRY;
    if (entry.seen) {
        return;
    }
    dex.value = { ...dex.value, [speciesId]: { ...entry, seen: true } };
}

/** Records a catch and returns whether this was the first time this species was caught. */
export function recordCatch(dex: Pokedex, speciesId: string, shiny: boolean): boolean {
    const entry = dex.value[speciesId] ?? EMPTY_ENTRY;
    const isFirstCatch = !entry.caught;
    dex.value = {
        ...dex.value,
        [speciesId]: {
            seen: true,
            caught: true,
            shinyCaught: entry.shinyCaught || shiny,
            timesCaught: entry.timesCaught + 1
        }
    };
    return isFirstCatch;
}

export interface ZoneProgress {
    caughtCount: number;
    totalCount: number;
    shinyCount: number;
    complete: boolean;
}

export function zoneProgress(dex: Pokedex, zone: ZoneDefinition): ZoneProgress {
    const speciesIds = new Set(zone.encounterTable.map(entry => entry.speciesId));
    let caughtCount = 0;
    let shinyCount = 0;
    for (const id of speciesIds) {
        const entry = dex.value[id];
        if (entry?.caught) {
            caughtCount++;
        }
        if (entry?.shinyCaught) {
            shinyCount++;
        }
    }
    return {
        caughtCount,
        totalCount: speciesIds.size,
        shinyCount,
        complete: caughtCount === speciesIds.size
    };
}

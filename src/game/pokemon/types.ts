export interface SpeciesData {
    /** National dex number, as a string (e.g. "16"). */
    id: string;
    name: string;
    types: string[];
    /** 0-255, from pokemon-species.capture_rate. */
    captureRate: number;
    baseStats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };
    sprites: {
        front: string;
        frontShiny: string;
    };
}

export interface EncounterTableEntry {
    /** Key into species.json. */
    speciesId: string;
    /** Averaged relative weight from PokeAPI encounter chances. */
    weight: number;
    minLevel: number;
    maxLevel: number;
}

export interface EncounterTableJSON {
    zoneId: string;
    locationAreaSlugs: string[];
    versionGroup: "red-blue";
    entries: EncounterTableEntry[];
}

export type PokedexEntry = {
    seen: boolean;
    caught: boolean;
    shinyCaught: boolean;
    timesCaught: number;
};

/**
 * Mechanics a generation introduced. Each one is met first in its own region; once reached
 * there, it's unlocked for good and works in every region, earlier ones included, on every
 * journey after. Later generations' (double battles in Hoenn, Mega Evolution in Kalos, ...)
 * join this list with their regions.
 */
import type { KeyItemId } from "./items";
import type { RegionId } from "./zones";

export type MechanicId =
    | "breeding"
    | "apricornBalls"
    | "headbutt"
    | "snagMachine"
    | "relicStone"
    | "pokeSpots"
    | "doubleBattles"
    | "partner"
    | "contests"
    | "underground"
    | "sinnohEvolutions"
    | "pokeAssist"
    | "rangerSigns";

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
    },
    snagMachine: {
        id: "snagMachine",
        name: "Snag Machine",
        region: "orre",
        unlockAt: "Team Snagem's hideout, at the start of Pokémon Colosseum",
        trialsRequired: 0,
        description:
            "Every journey carries the Snag Machine, and Cipher Peons roam every region with Shadow versions of its Pokémon to snag.",
        keyItem: "snagMachine"
    },
    relicStone: {
        id: "relicStone",
        name: "Relic Stone",
        region: "orre",
        unlockAt: "Agate Village's Relic Stone, after freeing Pyrite Town",
        trialsRequired: 1,
        description:
            "A Shadow Pokémon whose heart has opened can be purified back into its species, in any region."
    },
    pokeSpots: {
        id: "pokeSpots",
        name: "Poké Spots",
        region: "orreXd",
        unlockAt: "the desert's Poké Spots, after raiding the Cipher Lab",
        trialsRequired: 1,
        description:
            "Every region gets Poké Spots, where Sandshrew, Gligar, Trapinch, Hoppip, Phanpy, Surskit, Zubat, Aron and Wooper come for Poké Snacks."
    },
    doubleBattles: {
        id: "doubleBattles",
        name: "Double Battles",
        region: "hoenn",
        unlockAt: "Hoenn's first double battles, past the Stone Badge",
        trialsRequired: 1,
        description:
            "Two of your Pokémon fight at once: the strongest other member still standing backs up the one sent out with half its usual damage (it isn't attacked). Tate & Liza send out two at once too."
    },
    partner: {
        id: "partner",
        name: "Bring a Partner",
        region: "hoenn",
        unlockAt: "the Pokémon Center's Cable Club, past the Dynamo Badge",
        trialsRequired: 3,
        description:
            "Every new journey can start with one Pokémon from your Hall of Fame beside your starter, at the starters' level, in any region."
    },
    contests: {
        id: "contests",
        name: "Pokémon Contests",
        region: "hoenn",
        unlockAt: "Verdanturf Town's Contest Hall, past the Dynamo Badge",
        trialsRequired: 3,
        description:
            "A Contest Hall in every region: raise Cool, Beauty, Cute, Smart and Tough with Pokéblocks, win ribbons up to Master Rank, and earn a Cosplay Pikachu for each category."
    },
    underground: {
        id: "underground",
        name: "The Underground",
        region: "sinnoh",
        unlockAt: "the Underground Man's Explorer Kit in Eterna City, past the Coal Badge",
        trialsRequired: 1,
        description:
            "Dig the Underground in every region: wild battles uncover walls full of Spheres, evolution stones, fossils to revive, Arceus's Plates and the Odd Keystone."
    },
    sinnohEvolutions: {
        id: "sinnohEvolutions",
        name: "Sinnoh's evolutions",
        region: "sinnoh",
        unlockAt: "the start of a Sinnoh journey",
        trialsRequired: 0,
        description:
            "Older Pokémon evolve into the evolutions found in Sinnoh (Magnezone, Togekiss, Electivire, Weavile...), and Day Care Eggs hatch Sinnoh's babies (Munchlax, Happiny, Bonsly...), in every region."
    },
    pokeAssist: {
        id: "pokeAssist",
        name: "Poké Assist",
        region: "fiore",
        unlockAt: "Ringtown's Ranger Base, after your first mission",
        trialsRequired: 1,
        description:
            "In wild battles, a Pokémon in your box (not your party) whose type is super effective against the wild Pokémon lends a hand: +25% damage, in every region."
    },
    rangerSigns: {
        id: "rangerSigns",
        name: "Ranger Signs",
        region: "oblivia",
        unlockAt: "the Wireless Tower, after Raikou",
        trialsRequired: 2,
        description:
            "Capturing Oblivia's story legendaries earns their Ranger Signs for good. In every region, their types join Poké Assist, and the legendary beasts' Roar scares out Oblivia's hidden Pokémon."
    }
};

export const MECHANIC_LIST: MechanicDefinition[] = Object.values(MECHANICS);

/** Where each region's Day Care is, in the games (the Orange Islands never had one). */
export const DAY_CARE_PLACE: Partial<Record<RegionId, string>> = {
    kanto: "Route 5",
    sevii: "Four Island",
    johto: "Route 34"
};

import type { BallId, KeyItemId } from "./items";
import { JOHTO_SPECIALS } from "./johto";
import { COLOSSEUM_SPECIALS } from "./colosseum";
import { XD_SPECIALS } from "./xd";
import { JOHTO_ANIME_SPECIALS } from "./johtoAnime";
import { KANTO_ANIME_SPECIALS } from "./kantoAnime";
import { ORANGE_SPECIALS } from "./orange";
import { SEVII_SPECIALS } from "./sevii";
import type { TrainerDefinition } from "./trainers";
import type { RegionId } from "./zones";

/**
 * Pokémon that don't show up in wild grass: gifts, in-game trades, Game Corner prizes, and
 * one-of-a-kind encounters with legendaries. Together with the wild pools this covers all 151.
 */
export type SpecialEncounter =
    | {
          kind: "gift";
          id: string;
          region: RegionId;
          speciesId: number;
          level: number;
          place: string;
          badgesRequired: number;
          /** Pokédollar price; omitted for free gifts. */
          price?: number;
          postGame?: boolean;
          /** A gift that's one of several Pokémon at random (the Odd Egg); speciesId is shown. */
          pool?: number[];
          /** Chance the gift is shiny (the Odd Egg's 14%). */
          shinyChance?: number;
          text: string;
      }
    | {
          kind: "trade";
          id: string;
          region: RegionId;
          speciesId: number;
          level: number;
          place: string;
          badgesRequired: number;
          /** The species the NPC wants to see (you keep yours — they just need to meet it). */
          wants: number;
          postGame?: boolean;
          text: string;
      }
    | {
          kind: "legendary";
          id: string;
          region: RegionId;
          speciesId: number;
          level: number;
          /** Zone the legendary is found in. */
          zoneId: string;
          place: string;
          badgesRequired: number;
          postGame?: boolean;
          keyItem?: KeyItemId;
          /** Stat multiplier, like a trainer's; legendaries are tough. */
          strength: number;
          text: string;
      }
    | {
          /** A one-off battle against a famous Trainer, with a prize for winning. */
          kind: "boss";
          id: string;
          region: RegionId;
          /** The Trainer's ace, shown on the map. */
          speciesId: number;
          level: number;
          place: string;
          badgesRequired: number;
          postGame?: boolean;
          trainer: TrainerDefinition;
          prizeBalls?: Partial<Record<BallId, number>>;
          text: string;
      };

/** The Pokémon a special encounter can give (none for a boss battle). */
export function specialSpecies(special: SpecialEncounter): number[] {
    if (special.kind === "boss") return [];
    if (special.kind === "gift" && special.pool != null) return special.pool;
    return [special.speciesId];
}

type WithoutRegion<T> = T extends unknown ? Omit<T, "region"> : never;

const KANTO_SPECIALS: WithoutRegion<SpecialEncounter>[] = [
    {
        kind: "trade",
        id: "route2Trade",
        speciesId: 122,
        level: 20,
        place: "Route 2 Trade House",
        badgesRequired: 0,
        wants: 63,
        text: "A girl would love to see an Abra. She'll give you her Mr. Mime for the chance."
    },
    {
        kind: "gift",
        id: "magikarpSalesman",
        speciesId: 129,
        level: 5,
        place: "Mt. Moon Pokémon Center",
        badgesRequired: 1,
        price: 300,
        text: '"I\'ve got a deal for you. A secret Pokémon, just ₽500!"'
    },
    {
        kind: "gift",
        id: "ceruleanBulbasaur",
        speciesId: 1,
        level: 10,
        place: "Cerulean City",
        badgesRequired: 1,
        text: "A girl caring for a Bulbasaur thinks it would be happier traveling with you."
    },
    {
        kind: "gift",
        id: "route24Charmander",
        speciesId: 4,
        level: 10,
        place: "Route 24",
        badgesRequired: 1,
        text: "A Charmander abandoned by its trainer waits by the bridge."
    },
    {
        kind: "gift",
        id: "vermilionSquirtle",
        speciesId: 7,
        level: 10,
        place: "Vermilion City",
        badgesRequired: 2,
        text: "Officer Jenny asks you to look after a runaway Squirtle."
    },
    {
        kind: "trade",
        id: "ceruleanTrade",
        speciesId: 124,
        level: 16,
        place: "Cerulean City",
        badgesRequired: 1,
        wants: 61,
        text: "An old man wants to see a Poliwhirl. He's offering his Jynx."
    },
    {
        kind: "trade",
        id: "vermilionTrade",
        speciesId: 83,
        level: 16,
        place: "Vermilion City",
        badgesRequired: 2,
        wants: 21,
        text: "A trader is fond of Spearow. His Farfetch'd is looking for a new home."
    },
    {
        kind: "trade",
        id: "route11Trade",
        speciesId: 30,
        level: 16,
        place: "Route 11 Gate",
        badgesRequired: 2,
        wants: 33,
        text: "Show a Nidorino to the gatekeeper for a Nidorina."
    },
    {
        kind: "trade",
        id: "undergroundTrade",
        speciesId: 29,
        level: 10,
        place: "Underground Path",
        badgesRequired: 2,
        wants: 32,
        text: "A girl collects Nidoran♂. She'll swap her Nidoran♀."
    },
    {
        kind: "gift",
        id: "celadonEevee",
        speciesId: 133,
        level: 25,
        place: "Celadon Mansion",
        badgesRequired: 3,
        text: "A Poké Ball sits on a table on the mansion's roof. There's an Eevee inside!"
    },
    ...(
        [
            [63, 9, 1500],
            [35, 8, 4000],
            [30, 17, 10000],
            [147, 18, 22000],
            [123, 25, 45000],
            [127, 25, 45000],
            [137, 26, 80000]
        ] as const
    ).map(
        ([speciesId, level, price]): WithoutRegion<SpecialEncounter> => ({
            kind: "gift",
            id: `gameCorner${speciesId}`,
            speciesId,
            level,
            place: "Celadon Game Corner",
            badgesRequired: 3,
            price,
            text: "Trade in coins at the prize counter."
        })
    ),
    {
        kind: "trade",
        id: "route18Trade",
        speciesId: 108,
        level: 15,
        place: "Route 18 Gate",
        badgesRequired: 4,
        wants: 80,
        text: "A man with a Lickitung is dying to meet a Slowbro."
    },
    {
        kind: "legendary",
        id: "snorlax",
        strength: 1.4,
        speciesId: 7020,
        level: 30,
        zoneId: "route12",
        place: "Route 12",
        badgesRequired: 4,
        keyItem: "pokeFlute",
        text: "A huge Pokémon is sleeping, blocking the road. Play the Poké Flute to wake it!"
    },
    {
        kind: "gift",
        id: "hitmonlee",
        speciesId: 106,
        level: 30,
        place: "Saffron Fighting Dojo",
        badgesRequired: 5,
        text: "The Karate Master offers one of his prized fighters: the kicking fiend."
    },
    {
        kind: "gift",
        id: "hitmonchan",
        speciesId: 107,
        level: 30,
        place: "Saffron Fighting Dojo",
        badgesRequired: 5,
        text: "...and the punching fiend. Impressed by your badges, he parts with both."
    },
    {
        kind: "gift",
        id: "lapras",
        speciesId: 131,
        level: 15,
        place: "Silph Co. 7F",
        badgesRequired: 5,
        text: "A grateful Silph employee gives you a Lapras for driving out Team Rocket."
    },
    {
        kind: "legendary",
        id: "zapdos",
        strength: 2,
        speciesId: 145,
        level: 50,
        zoneId: "powerPlant",
        place: "Power Plant",
        badgesRequired: 5,
        text: "A legendary bird crackles with electricity deep in the plant."
    },
    {
        kind: "gift",
        id: "helixFossil",
        speciesId: 138,
        level: 30,
        place: "Cinnabar Lab",
        badgesRequired: 6,
        text: "Revive the Helix Fossil you dug up in Mt. Moon."
    },
    {
        kind: "gift",
        id: "domeFossil",
        speciesId: 140,
        level: 30,
        place: "Cinnabar Lab",
        badgesRequired: 6,
        text: "Revive the Dome Fossil you dug up in Mt. Moon."
    },
    {
        kind: "gift",
        id: "oldAmber",
        speciesId: 142,
        level: 30,
        place: "Cinnabar Lab",
        badgesRequired: 6,
        text: "Revive the Old Amber from the Pewter Museum."
    },
    {
        kind: "trade",
        id: "cinnabarTrade1",
        speciesId: 86,
        level: 30,
        place: "Cinnabar Lab",
        badgesRequired: 6,
        wants: 77,
        text: "A researcher wants to study a Ponyta and offers a Seel."
    },
    {
        kind: "trade",
        id: "cinnabarTrade2",
        speciesId: 101,
        level: 30,
        place: "Cinnabar Lab",
        badgesRequired: 6,
        wants: 26,
        text: "A scientist will swap his Electrode for a look at a Raichu."
    },
    {
        kind: "trade",
        id: "cinnabarTrade3",
        speciesId: 114,
        level: 30,
        place: "Cinnabar Lab",
        badgesRequired: 6,
        wants: 48,
        text: "Show a Venonat to get this Tangela."
    },
    {
        kind: "legendary",
        id: "articuno",
        strength: 2.1,
        speciesId: 144,
        level: 50,
        zoneId: "seafoamIslands",
        place: "Seafoam Islands",
        badgesRequired: 6,
        text: "A legendary bird of ice rests in the deepest cavern."
    },
    {
        kind: "legendary",
        id: "moltres",
        strength: 2.2,
        speciesId: 146,
        level: 50,
        zoneId: "victoryRoad",
        place: "Victory Road",
        badgesRequired: 8,
        text: "A legendary bird of flame guards the road to the League."
    },
    {
        kind: "legendary",
        id: "mewtwo",
        strength: 2.8,
        speciesId: 150,
        level: 70,
        zoneId: "ceruleanCave",
        place: "Cerulean Cave",
        badgesRequired: 8,
        postGame: true,
        text: "It was created by a scientist after years of horrific gene-splicing experiments."
    },
    {
        kind: "legendary",
        id: "raikou",
        speciesId: 243,
        level: 50,
        zoneId: "route10",
        place: "Roaming Kanto (Route 10)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.3,
        text: "A legendary beast that crackles like thunder races across Kanto."
    },
    {
        kind: "legendary",
        id: "entei",
        speciesId: 244,
        level: 50,
        zoneId: "route8",
        place: "Roaming Kanto (Route 8)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.3,
        text: "A legendary beast born of volcanic fire roams the land."
    },
    {
        kind: "legendary",
        id: "suicune",
        speciesId: 245,
        level: 50,
        zoneId: "route24",
        place: "Roaming Kanto (Route 24)",
        badgesRequired: 8,
        postGame: true,
        strength: 2.3,
        text: "A legendary beast that purifies water glides over the rivers."
    }
];

/** Every special encounter in every region. */
export const SPECIAL_ENCOUNTERS: SpecialEncounter[] = [
    ...KANTO_SPECIALS.map(special => ({ ...special, region: "kanto" }) as SpecialEncounter),
    ...KANTO_ANIME_SPECIALS,
    ...ORANGE_SPECIALS,
    ...SEVII_SPECIALS,
    ...JOHTO_SPECIALS,
    ...JOHTO_ANIME_SPECIALS,
    ...COLOSSEUM_SPECIALS,
    ...XD_SPECIALS
];

/** Seconds allowed to defeat a legendary before it flees. */
export const LEGENDARY_TIME_LIMIT = 90;

/**
 * Kanto locations that only exist in the animated series. Encounter tables are hand-authored
 * from the Pokémon seen in each location's episodes, at levels that fit the badge tier.
 */
import { enc } from "./data";
import type { SpecialEncounter } from "./specials";
import type { ZoneDefinition } from "./zones";

export const KANTO_ANIME_ZONES: ZoneDefinition[] = [
    {
        id: "billsLighthouse",
        name: "Bill's Lighthouse",
        region: "kanto",
        anime: true,
        badgesRequired: 1,
        blurb: "A seaside lighthouse north of Cerulean City, where Bill waits for a legendary visitor.",
        encounters: {
            walk: [
                enc(72, 12, 17, 30),
                enc(98, 12, 17, 25),
                enc(116, 12, 16, 15),
                enc(90, 12, 16, 15),
                enc(86, 14, 18, 10),
                enc(118, 12, 16, 5)
            ]
        }
    },
    {
        id: "pokemonTech",
        name: "Pokémon Tech",
        region: "kanto",
        anime: true,
        badgesRequired: 2,
        blurb: "An elite academy for Trainers who want to skip the Gym circuit.",
        encounters: {
            walk: [
                enc(70, 17, 21, 20),
                enc(75, 18, 22, 10),
                enc(74, 15, 19, 20),
                enc(104, 16, 20, 20),
                enc(44, 18, 21, 15),
                enc(64, 17, 20, 10),
                enc(35, 16, 19, 5)
            ]
        }
    },
    {
        id: "hiddenVillage",
        name: "Hidden Village",
        region: "kanto",
        anime: true,
        badgesRequired: 2,
        blurb: "Melanie's secret refuge for abandoned Pokémon, guarded by a Bulbasaur.",
        encounters: {
            walk: [
                enc(1, 12, 16, 20),
                enc(43, 12, 16, 20),
                enc(16, 13, 17, 15),
                enc(19, 13, 17, 15),
                enc(10, 12, 15, 10),
                enc(39, 12, 16, 10),
                enc(2, 18, 20, 3)
            ]
        }
    },
    {
        id: "portaVista",
        name: "Porta Vista",
        region: "kanto",
        anime: true,
        badgesRequired: 3,
        blurb: "A beach resort whose seaside hotel once angered a colony of Tentacool.",
        encounters: {
            walk: [
                enc(72, 20, 26, 35),
                enc(120, 20, 25, 15),
                enc(98, 20, 25, 15),
                enc(79, 20, 25, 15),
                enc(90, 20, 24, 10),
                enc(73, 28, 32, 5)
            ]
        }
    },
    {
        id: "chrysanthemumIsland",
        name: "Chrysanthemum Island",
        region: "kanto",
        anime: true,
        badgesRequired: 3,
        blurb: "A tourist island with a sandy beach and a Pokémon Contest hall.",
        encounters: {
            walk: [
                enc(54, 20, 25, 25),
                enc(86, 21, 25, 20),
                enc(120, 20, 25, 20),
                enc(116, 20, 24, 15),
                enc(118, 20, 24, 15),
                enc(131, 25, 25, 1)
            ]
        }
    },
    {
        id: "maidensPeak",
        name: "Maiden's Peak",
        region: "kanto",
        anime: true,
        badgesRequired: 4,
        blurb: "A cliffside town haunted by the legend of a maiden waiting for her love.",
        encounters: {
            walk: [
                enc(92, 24, 28, 40),
                enc(93, 27, 30, 15),
                enc(41, 24, 28, 25),
                enc(42, 28, 30, 10),
                enc(96, 25, 28, 10)
            ]
        }
    },
    {
        id: "gringeyCity",
        name: "Gringey City",
        region: "kanto",
        anime: true,
        badgesRequired: 5,
        blurb: "An abandoned factory town whose pollution drew in swarms of Grimer.",
        encounters: {
            walk: [
                enc(88, 30, 35, 35),
                enc(109, 30, 35, 25),
                enc(81, 30, 34, 15),
                enc(100, 30, 34, 10),
                enc(89, 36, 38, 8),
                enc(110, 36, 38, 7)
            ]
        }
    },
    {
        id: "darkCity",
        name: "Dark City",
        region: "kanto",
        anime: true,
        badgesRequired: 5,
        blurb: "A lawless town where two unofficial Gyms feud with Pokémon brawls.",
        encounters: {
            walk: [
                enc(19, 30, 33, 15),
                enc(20, 34, 36, 15),
                enc(52, 30, 33, 15),
                enc(53, 34, 36, 10),
                enc(56, 30, 33, 15),
                enc(57, 35, 37, 8),
                enc(66, 30, 34, 15),
                enc(123, 34, 36, 3),
                enc(106, 35, 35, 2),
                enc(107, 35, 35, 2)
            ]
        }
    },
    {
        id: "grampaCanyon",
        name: "Grampa Canyon",
        region: "kanto",
        anime: true,
        badgesRequired: 6,
        blurb: "A fossil dig site outside Neon Town where prehistoric Pokémon awoke.",
        encounters: {
            walk: [
                enc(74, 34, 38, 20),
                enc(75, 38, 42, 10),
                enc(95, 36, 40, 15),
                enc(138, 34, 38, 15),
                enc(140, 34, 38, 15),
                enc(139, 40, 42, 5),
                enc(141, 40, 42, 5),
                enc(142, 42, 44, 2)
            ]
        }
    },
    {
        id: "pokemopolis",
        name: "Pokémopolis",
        region: "kanto",
        anime: true,
        badgesRequired: 7,
        blurb: "Ancient ruins near Pallet Town, home to a giant Gengar and Alakazam of legend.",
        encounters: {
            walk: [
                enc(93, 40, 44, 25),
                enc(64, 40, 44, 20),
                enc(96, 40, 44, 20),
                enc(97, 44, 47, 10),
                enc(94, 46, 48, 5),
                enc(65, 46, 48, 5),
                enc(122, 40, 44, 10)
            ]
        }
    }
];

export const KANTO_ANIME_SPECIALS: SpecialEncounter[] = [
    {
        kind: "legendary",
        id: "lighthouseDragonite",
        region: "kanto",
        speciesId: 149,
        level: 60,
        zoneId: "billsLighthouse",
        place: "Bill's Lighthouse",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "A giant Dragonite answers the lighthouse's call from across the sea."
    },
    {
        kind: "legendary",
        id: "giantGengar",
        region: "kanto",
        speciesId: 94,
        level: 60,
        zoneId: "pokemopolis",
        place: "Pokémopolis",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "The ancient bell rings, and a towering Gengar rises from the ruins."
    },
    {
        kind: "legendary",
        id: "giantAlakazam",
        region: "kanto",
        speciesId: 65,
        level: 60,
        zoneId: "pokemopolis",
        place: "Pokémopolis",
        badgesRequired: 8,
        postGame: true,
        strength: 2.6,
        text: "A colossal Alakazam, guardian of Pokémopolis, stands in your way."
    }
];

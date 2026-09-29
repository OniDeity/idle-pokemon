import type { PokemonType } from "./data";
import type { BallId, KeyItemId } from "./items";

export interface TrainerPokemon {
    id: number;
    level: number;
}

export interface TrainerDefinition {
    id: string;
    name: string;
    title: string;
    /** The type the trainer specializes in, for display. */
    specialty: PokemonType | null;
    team: TrainerPokemon[];
    /** Seconds the player has to defeat the whole team. */
    timeLimit: number;
    /** Multiplies every stat of the team; later trainers raise their Pokémon better. */
    statMultiplier: number;
    prizeMoney: number;
    quote: string;
}

export interface GymDefinition extends TrainerDefinition {
    town: string;
    badge: string;
    /** Order within the region, starting at 1. */
    badgeNumber: number;
    /** Sprite path (see assets.ts) for the badge, if it has one. */
    badgeIcon?: string;
    /** Key items awarded alongside the badge. */
    keyItems: KeyItemId[];
    /** Balls awarded alongside the badge. */
    balls?: Partial<Record<BallId, number>>;
    rewardText: string;
}

/**
 * Stat multipliers for Kanto's trainers, tuned with scripts/simulateProgression.ts. Mid-game
 * leaders are much stronger than their levels suggest, so catching new Pokémon at wild levels
 * isn't enough on its own; the Elite Four's higher levels carry the difficulty at the end.
 */
const GYM_STRENGTHS = [0.85, 1.45, 2, 2.4, 2.8, 3.1, 3.35, 3.65];
const ELITE_FOUR_STRENGTH = 2.65;
const CHAMPION_STRENGTH = 2.8;

/** Seconds allowed per trainer battle: a base plus a little per Pokémon on the team. */
export function timeLimit(teamSize: number) {
    return 30 + teamSize * 15;
}

/** Builds a Gym-style trial with an explicit strength, for regions other than Kanto. */
export function trial(options: Omit<GymDefinition, "timeLimit" | "prizeMoney">): GymDefinition {
    const ace = Math.max(...options.team.map(p => p.level));
    return { timeLimit: timeLimit(options.team.length), prizeMoney: ace * 50, ...options };
}

function gym(
    options: Omit<GymDefinition, "timeLimit" | "prizeMoney" | "statMultiplier">
): GymDefinition {
    const ace = Math.max(...options.team.map(p => p.level));
    return {
        timeLimit: timeLimit(options.team.length),
        statMultiplier: GYM_STRENGTHS[options.badgeNumber - 1],
        badgeIcon: `badges/${options.badgeNumber}.png`,
        prizeMoney: ace * 50,
        ...options
    };
}

export const GYMS: GymDefinition[] = [
    gym({
        id: "brock",
        name: "Brock",
        title: "Pewter City Gym Leader",
        town: "Pewter City",
        badge: "Boulder Badge",
        badgeNumber: 1,
        specialty: "rock",
        team: [
            { id: 74, level: 12 },
            { id: 95, level: 14 }
        ],
        keyItems: [],
        rewardText: "Mt. Moon and the roads to Cerulean City open up.",
        quote: "I believe in rock-hard defense and determination!"
    }),
    gym({
        id: "misty",
        name: "Misty",
        title: "Cerulean City Gym Leader",
        town: "Cerulean City",
        badge: "Cascade Badge",
        badgeNumber: 2,
        specialty: "water",
        team: [
            { id: 120, level: 18 },
            { id: 121, level: 21 }
        ],
        keyItems: ["oldRod"],
        rewardText: "A fisherman in Vermilion hands you the Old Rod. Great Balls are now in stock.",
        quote: "My policy is an all-out offensive with Water-type Pokémon!"
    }),
    gym({
        id: "surge",
        name: "Lt. Surge",
        title: "Vermilion City Gym Leader",
        town: "Vermilion City",
        badge: "Thunder Badge",
        badgeNumber: 3,
        specialty: "electric",
        team: [
            { id: 100, level: 21 },
            { id: 25, level: 18 },
            { id: 26, level: 24 }
        ],
        keyItems: ["bicycle"],
        rewardText:
            "The Pokémon Fan Club's Bike Voucher gets you a Bicycle. Celadon's stones and Game Corner open.",
        quote: "Electric Pokémon saved me during the war!"
    }),
    gym({
        id: "erika",
        name: "Erika",
        title: "Celadon City Gym Leader",
        town: "Celadon City",
        badge: "Rainbow Badge",
        badgeNumber: 4,
        specialty: "grass",
        team: [
            { id: 71, level: 29 },
            { id: 114, level: 24 },
            { id: 45, level: 29 }
        ],
        keyItems: ["goodRod", "pokeFlute"],
        rewardText:
            "Mr. Fuji gives you the Poké Flute and a Fuchsia fisherman the Good Rod. Ultra Balls are now in stock.",
        quote: "I'm afraid I may doze off... Oh! A challenger?"
    }),
    gym({
        id: "koga",
        name: "Koga",
        title: "Fuchsia City Gym Leader",
        town: "Fuchsia City",
        badge: "Soul Badge",
        badgeNumber: 5,
        specialty: "poison",
        team: [
            { id: 109, level: 37 },
            { id: 89, level: 39 },
            { id: 109, level: 37 },
            { id: 110, level: 43 }
        ],
        keyItems: ["surf", "superRod"],
        rewardText:
            "The Safari Zone warden teaches you Surf, and you pick up the Super Rod. Saffron City is open.",
        quote: "Despair to the creeping horror of Poison-type Pokémon!"
    }),
    gym({
        id: "sabrina",
        name: "Sabrina",
        title: "Saffron City Gym Leader",
        town: "Saffron City",
        badge: "Marsh Badge",
        badgeNumber: 6,
        specialty: "psychic",
        team: [
            { id: 64, level: 38 },
            { id: 122, level: 37 },
            { id: 49, level: 38 },
            { id: 65, level: 43 }
        ],
        keyItems: [],
        balls: { masterBall: 1 },
        rewardText:
            "The grateful Silph Co. president gives you a Master Ball. The seas to Cinnabar Island are yours to cross.",
        quote: "I had a vision of your arrival."
    }),
    gym({
        id: "blaine",
        name: "Blaine",
        title: "Cinnabar Island Gym Leader",
        town: "Cinnabar Island",
        badge: "Volcano Badge",
        badgeNumber: 7,
        specialty: "fire",
        team: [
            { id: 58, level: 42 },
            { id: 77, level: 40 },
            { id: 78, level: 42 },
            { id: 59, level: 47 }
        ],
        keyItems: [],
        rewardText: "Route 21 leads back home — and to the Viridian Gym.",
        quote: "Hah! You'd better have Burn Heal!"
    }),
    gym({
        id: "giovanni",
        name: "Giovanni",
        title: "Viridian City Gym Leader",
        town: "Viridian City",
        badge: "Earth Badge",
        badgeNumber: 8,
        specialty: "ground",
        team: [
            { id: 111, level: 45 },
            { id: 51, level: 42 },
            { id: 31, level: 44 },
            { id: 34, level: 45 },
            { id: 112, level: 50 }
        ],
        keyItems: [],
        rewardText: "With all eight badges, Victory Road awaits.",
        quote: "Fwahahaha! This is my hideout... er, my Gym!"
    })
];

function eliteFour(
    options: Omit<TrainerDefinition, "timeLimit" | "prizeMoney" | "statMultiplier">
): TrainerDefinition {
    const ace = Math.max(...options.team.map(p => p.level));
    return {
        timeLimit: timeLimit(options.team.length),
        statMultiplier: ELITE_FOUR_STRENGTH,
        prizeMoney: ace * 70,
        ...options
    };
}

export const ELITE_FOUR: TrainerDefinition[] = [
    eliteFour({
        id: "lorelei",
        name: "Lorelei",
        title: "Elite Four",
        specialty: "ice",
        team: [
            { id: 87, level: 54 },
            { id: 91, level: 53 },
            { id: 80, level: 54 },
            { id: 124, level: 56 },
            { id: 131, level: 56 }
        ],
        quote: "No one can best me when it comes to icy Pokémon!"
    }),
    eliteFour({
        id: "bruno",
        name: "Bruno",
        title: "Elite Four",
        specialty: "fighting",
        team: [
            { id: 95, level: 53 },
            { id: 107, level: 55 },
            { id: 106, level: 55 },
            { id: 95, level: 56 },
            { id: 68, level: 58 }
        ],
        quote: "We will grind you down with our superior power!"
    }),
    eliteFour({
        id: "agatha",
        name: "Agatha",
        title: "Elite Four",
        specialty: "ghost",
        team: [
            { id: 94, level: 56 },
            { id: 42, level: 56 },
            { id: 93, level: 55 },
            { id: 24, level: 58 },
            { id: 94, level: 60 }
        ],
        quote: "Oak's taken a lot of interest in you, child."
    }),
    eliteFour({
        id: "lance",
        name: "Lance",
        title: "Elite Four",
        specialty: "dragon",
        team: [
            { id: 130, level: 58 },
            { id: 148, level: 56 },
            { id: 148, level: 56 },
            { id: 142, level: 60 },
            { id: 149, level: 62 }
        ],
        quote: "Dragons are mythical Pokémon. They're hard to catch and raise."
    })
];

/** The rival always picks the starter strong against yours. */
const RIVAL_STARTER: Record<number, { starter: number; others: TrainerPokemon[] }> = {
    1: {
        starter: 6,
        others: [
            { id: 103, level: 61 },
            { id: 130, level: 63 }
        ]
    },
    4: {
        starter: 9,
        others: [
            { id: 59, level: 61 },
            { id: 103, level: 63 }
        ]
    },
    7: {
        starter: 3,
        others: [
            { id: 130, level: 61 },
            { id: 59, level: 63 }
        ]
    },
    // Partner Pikachu: Blue's Eevee evolved, as in Pokémon Yellow.
    10158: {
        starter: 135,
        others: [
            { id: 59, level: 61 },
            { id: 130, level: 63 }
        ]
    },
    // Partner Eevee: the rival took the Pikachu.
    10159: {
        starter: 26,
        others: [
            { id: 103, level: 61 },
            { id: 130, level: 63 }
        ]
    }
};

export function championFor(playerStarter: number): TrainerDefinition {
    const rival = RIVAL_STARTER[playerStarter] ?? RIVAL_STARTER[4];
    const team: TrainerPokemon[] = [
        { id: 18, level: 61 },
        { id: 65, level: 59 },
        { id: 112, level: 61 },
        ...rival.others,
        { id: rival.starter, level: 65 }
    ];
    return {
        id: "champion",
        name: "Blue",
        title: "Pokémon League Champion",
        specialty: null,
        team,
        timeLimit: timeLimit(team.length),
        statMultiplier: CHAMPION_STRENGTH,
        prizeMoney: 65 * 100,
        quote: "I'm the most powerful trainer in the world!"
    };
}

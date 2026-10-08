/**
 * Challenges (Black 2 and White 2's Key System, made into journey rules): picked before the
 * starter, they make a journey harder for more Fame. Each one cleared earns its own medal.
 */
import type { Species } from "./data";

export type ChallengeId =
    | "challengeMode"
    | "trio"
    | "specialist"
    | "frugal"
    | "grounded"
    | "freshStart"
    | "timeTrial";

export interface ChallengeDefinition {
    id: ChallengeId;
    name: string;
    description: string;
    /** Multiplies the journey's Fame (Time Trial: only when beaten in time). */
    fame: number;
    /** The medal for clearing a journey with it. */
    medal: string;
}

/** Challenge Mode's trainers are this much stronger. */
export const CHALLENGE_MODE_STRENGTH = 1.5;
/** The party's size in the Trio challenge. */
export const TRIO_SIZE = 3;
/** The Time Trial: clear the finale within this much journey time. */
export const TIME_TRIAL_SECONDS = 6 * 3600;

export const CHALLENGES: Record<ChallengeId, ChallengeDefinition> = {
    challengeMode: {
        id: "challengeMode",
        name: "Challenge Mode",
        description: `Black 2 and White 2's Challenge Mode Key: every Trainer is ${Math.round((CHALLENGE_MODE_STRENGTH - 1) * 100)}% stronger.`,
        fame: 1.5,
        medal: "Challenge Mode Champion"
    },
    trio: {
        id: "trio",
        name: "Trio",
        description: `Your party holds at most ${TRIO_SIZE} Pokémon.`,
        fame: 1.4,
        medal: "Triple Threat"
    },
    specialist: {
        id: "specialist",
        name: "Specialist",
        description:
            "Like a Gym Leader: only Pokémon sharing a type with your starter can join the party.",
        fame: 1.4,
        medal: "Type Specialist"
    },
    frugal: {
        id: "frugal",
        name: "Frugal",
        description: "No Poké Mart upgrades: Protein, Iron, Rare Candy and the rest aren't sold.",
        fame: 1.25,
        medal: "Penny Pincher"
    },
    grounded: {
        id: "grounded",
        name: "Grounded",
        description: "No legendary Pokémon in the party.",
        fame: 1.15,
        medal: "Down to Earth"
    },
    freshStart: {
        id: "freshStart",
        name: "Fresh Start",
        description: "Your Fame upgrades don't apply this journey (automation still works).",
        fame: 2,
        medal: "Back to Basics"
    },
    timeTrial: {
        id: "timeTrial",
        name: "Time Trial",
        description: `Clear the finale within ${TIME_TRIAL_SECONDS / 3600} hours of journey time for ×1.5 Fame (no bonus if you're late).`,
        fame: 1.5,
        medal: "Against the Clock"
    }
};

export const CHALLENGE_LIST: ChallengeDefinition[] = Object.values(CHALLENGES);

/** The journey's challenges' Fame multiplier, given how long the finale took to clear. */
export function challengeFame(challenges: ChallengeId[], clearTime: number): number {
    return challenges.reduce((product, id) => {
        if (id === "timeTrial" && clearTime > TIME_TRIAL_SECONDS) return product;
        return product * CHALLENGES[id].fame;
    }, 1);
}

/** The challenges a cleared journey counts for its medals (a late Time Trial doesn't). */
export function challengesMet(challenges: ChallengeId[], clearTime: number): ChallengeId[] {
    return challenges.filter(id => id !== "timeTrial" || clearTime <= TIME_TRIAL_SECONDS);
}

/** Whether a Pokémon may join the party under these challenges, with this starter. */
export function partyAllowed(
    species: Species,
    challenges: ChallengeId[],
    starter: Species | undefined
): boolean {
    if (challenges.includes("grounded") && species.legendary) return false;
    if (challenges.includes("specialist") && starter != null) {
        return species.types.some(type => starter.types.includes(type));
    }
    return true;
}

/** The party size these challenges allow. */
export function partySize(challenges: ChallengeId[]): number {
    return challenges.includes("trio") ? TRIO_SIZE : 6;
}

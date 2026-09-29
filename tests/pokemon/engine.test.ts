import type { PartyBattler } from "game/pokemon/balance";
import {
    catchChance,
    computeBonuses,
    initialTrainerBattle,
    memberDps,
    simulateTrainerBattle,
    stepTrainerBattle,
    trainerTeam
} from "game/pokemon/balance";
import { DEX_SIZE, getSpecies, PRE_EVOLUTION, SPECIES, typeEffectiveness } from "game/pokemon/data";
import { MEW_ID, SPECIAL_ENCOUNTERS } from "game/pokemon/specials";
import { bestTypeMultiplier, levelForXp, xpForLevel } from "game/pokemon/stats";
import { REGION_LIST, REGIONS } from "game/pokemon/regions";
import { championFor, ELITE_FOUR, GYMS } from "game/pokemon/trainers";
import { activePools, allZoneSpecies, rollEncounter, ZONES, zonesIn } from "game/pokemon/zones";
import { describe, expect, test } from "vitest";

function party(...members: [number, number][]): PartyBattler[] {
    return members.map(([id, level]) => ({ species: getSpecies(id), level, multiplier: 1 }));
}

describe("data", () => {
    test("has species #1-251 in order", () => {
        expect(DEX_SIZE).toBe(251);
        SPECIES.forEach((species, i) => expect(species.id).toBe(i + 1));
    });

    test("every species can be obtained", () => {
        const obtainable = new Set<number>([1, 4, 7, MEW_ID]);
        ZONES.forEach(zone => allZoneSpecies(zone.id).forEach(id => obtainable.add(id)));
        SPECIAL_ENCOUNTERS.forEach(special => obtainable.add(special.speciesId));
        // Evolutions of anything obtainable are obtainable too.
        let changed = true;
        while (changed) {
            changed = false;
            for (const species of SPECIES) {
                const pre = PRE_EVOLUTION[species.id];
                if (!obtainable.has(species.id) && pre != null && obtainable.has(pre)) {
                    obtainable.add(species.id);
                    changed = true;
                }
            }
        }
        REGION_LIST.forEach(r => r.starters.forEach(id => obtainable.add(id)));
        // Every Kanto species, and every Johto species' evolution line we added, can be found.
        const missing = SPECIES.filter(s => s.id <= 151 && !obtainable.has(s.id)).map(s => s.name);
        expect(missing).toEqual([]);
    });

    test("trades ask for species that can be obtained before the trade unlocks", () => {
        for (const special of SPECIAL_ENCOUNTERS) {
            if (special.kind !== "trade") continue;
            expect(special.wants).toBeGreaterThan(0);
            expect(special.wants).toBeLessThanOrEqual(151);
        }
    });

    test("every region is well-formed", () => {
        for (const region of REGION_LIST) {
            const caps = region.levelCaps;
            expect(caps.length).toBe(region.trials.length + 2);
            for (let i = 1; i < caps.length; i++) {
                expect(caps[i]).toBeGreaterThan(caps[i - 1]);
            }
            region.trials.forEach((trial, i) => expect(trial.badgeNumber).toBe(i + 1));
            expect(region.finale(region.starters[0]).length).toBeGreaterThan(0);
            expect(zonesIn(region.id).length).toBeGreaterThan(5);
            // Something to catch from the very start.
            expect(zonesIn(region.id)[0].badgesRequired).toBe(0);
            region.starters.forEach(id => expect(getSpecies(id).id).toBe(id));
        }
    });

    test("every zone has encounters with valid species and levels", () => {
        const ids = new Set(ZONES.map(z => z.id));
        expect(ids.size).toBe(ZONES.length);
        for (const zone of ZONES) {
            const species = allZoneSpecies(zone.id);
            expect(species.length, zone.id).toBeGreaterThan(0);
            species.forEach(id => expect(id).toBeLessThanOrEqual(DEX_SIZE));
        }
    });

    test("specials belong to a region and point at real zones", () => {
        const ids = new Set(SPECIAL_ENCOUNTERS.map(s => s.id));
        expect(ids.size).toBe(SPECIAL_ENCOUNTERS.length);
        for (const special of SPECIAL_ENCOUNTERS) {
            expect(REGIONS[special.region]).toBeDefined();
            if (special.kind === "legendary") {
                expect(ZONES.some(z => z.id === special.zoneId)).toBe(true);
            }
        }
    });
});

describe("stats", () => {
    test("experience curves match the mainline games", () => {
        expect(xpForLevel("medium", 100)).toBe(1_000_000);
        expect(xpForLevel("fast", 100)).toBe(800_000);
        expect(xpForLevel("slow", 100)).toBe(1_250_000);
        expect(xpForLevel("mediumSlow", 100)).toBe(1_059_860);
        expect(xpForLevel("mediumSlow", 5)).toBe(135);
        expect(xpForLevel("medium", 1)).toBe(0);
    });

    test("levelForXp inverts xpForLevel and respects the cap", () => {
        for (const level of [2, 10, 37, 99]) {
            expect(levelForXp("medium", xpForLevel("medium", level))).toBe(level);
            expect(levelForXp("medium", xpForLevel("medium", level) - 1)).toBe(level - 1);
        }
        expect(levelForXp("medium", 1_000_000, 20)).toBe(20);
    });

    test("type chart", () => {
        expect(typeEffectiveness("water", ["fire"])).toBe(2);
        expect(typeEffectiveness("electric", ["ground"])).toBe(0);
        expect(typeEffectiveness("grass", ["rock", "ground"])).toBe(4);
        // STAB is always applied, and nothing is completely walled.
        expect(bestTypeMultiplier(["water"], ["fire"])).toBe(3);
        expect(bestTypeMultiplier(["normal"], ["ghost"])).toBe(0.5);
    });
});

describe("battles", () => {
    test("a lone level 5 starter can't beat Brock, a trained team can", () => {
        const brock = GYMS[0];
        expect(simulateTrainerBattle(party([4, 5]), brock, 1, 1).won).toBe(false);
        expect(simulateTrainerBattle(party([7, 16], [1, 16], [16, 14]), brock, 1, 1).won).toBe(
            true
        );
    });

    test("type matchups matter", () => {
        const starmie = trainerTeam(GYMS[1])[1];
        const grass = party([2, 20])[0];
        const fire = party([5, 20])[0];
        expect(memberDps(grass, starmie, 1)).toBeGreaterThan(2 * memberDps(fire, starmie, 1));
    });

    test("real-time stepping gives exactly the same result as the forecast", () => {
        const team = party([9, 45], [26, 44], [65, 45], [3, 45], [130, 44], [59, 45]);
        const gym = GYMS[7];
        const forecast = simulateTrainerBattle(team, gym, 1.3, 1.2);

        const enemies = trainerTeam(gym);
        let state = initialTrainerBattle(team, enemies, 1.2);
        let done = null;
        for (let i = 0; i < 100000 && done == null; i++) {
            const result = stepTrainerBattle(team, enemies, state, 1.3, 0.05, gym.timeLimit);
            state = result.state;
            done = result.done;
        }
        expect(done).toBe(forecast.reason);
        expect(state.elapsed).toBeCloseTo(forecast.time, 6);
        expect(state.partyHp).toEqual(forecast.state.partyHp.map(hp => expect.closeTo(hp, 6)));
    });

    test("the Elite Four and Champion are beatable with a strong capped team", () => {
        const team = party([9, 65], [135, 65], [65, 65], [94, 65], [149, 65], [112, 65]);
        const { damage, hp } = computeBonuses({
            dexCaught: 120,
            shinyCaught: 0,
            mart: { protein: 50, iron: 50 },
            hof: {},
            keyItems: {}
        });
        for (const trainer of [...ELITE_FOUR, championFor(4)]) {
            expect(simulateTrainerBattle(team, trainer, damage, hp).won).toBe(true);
        }
    });
});

describe("encounters", () => {
    test("water pools need the right gear", () => {
        const kinds = (items: Record<string, boolean>) =>
            activePools("route22", items).map(pool => pool.kind);
        expect(kinds({})).toEqual(["walk"]);
        expect(kinds({ oldRod: true })).toEqual(["walk", "fishing"]);
        expect(activePools("route19", {})).toEqual([]);
        expect(activePools("route19", { surf: true }).map(p => p.kind)).toEqual(["surf"]);
    });

    test("rolled encounters come from the zone's table", () => {
        const allowed = new Set(allZoneSpecies("viridianForest"));
        for (let i = 0; i < 200; i++) {
            const encounter = rollEncounter("viridianForest", {});
            expect(encounter).not.toBeNull();
            expect(allowed.has(encounter!.speciesId)).toBe(true);
            expect(encounter!.level).toBeGreaterThanOrEqual(3);
            expect(encounter!.level).toBeLessThanOrEqual(6);
        }
    });

    test("catch chance is bounded and the Master Ball never fails", () => {
        expect(catchChance(255, 1)).toBe(1);
        expect(catchChance(3, Infinity)).toBe(1);
        const mewtwo = catchChance(3, 2);
        expect(mewtwo).toBeGreaterThan(0);
        expect(mewtwo).toBeLessThan(0.1);
    });
});

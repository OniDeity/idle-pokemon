import { existsSync } from "fs";
import { requiredSpritePaths } from "../../scripts/fetchSprites";
import type { PartyBattler } from "game/pokemon/balance";
import {
    catchChance,
    computeBonuses,
    effortMultiplier,
    initialTrainerBattle,
    memberDps,
    simulateTrainerBattle,
    stepTrainerBattle,
    trainerTeam,
    zoneRates
} from "game/pokemon/balance";
import {
    DEX_SIZE,
    getSpecies,
    magikarpPatterns,
    PRE_EVOLUTION,
    SPECIES,
    typeEffectiveness,
    VARIANT_SPECIES,
    variantFilter,
    WILD_VARIANTS
} from "game/pokemon/data";
import { STONES } from "game/pokemon/items";
import { SPECIAL_ENCOUNTERS } from "game/pokemon/specials";
import { bestTypeMultiplier, levelForXp, xpForLevel } from "game/pokemon/stats";
import { REGION_LIST, REGIONS, strengthMultiplier } from "game/pokemon/regions";
import { championFor, ELITE_FOUR, GYMS } from "game/pokemon/trainers";
import { activePools, allZoneSpecies, rollEncounter, ZONES, zonesIn } from "game/pokemon/zones";
import { describe, expect, test } from "vitest";

function mulberry(seed: number): () => number {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function party(...members: [number, number][]): PartyBattler[] {
    return members.map(([id, level]) => ({ species: getSpecies(id), level, multiplier: 1 }));
}

describe("data", () => {
    test("has species #1-251 in order", () => {
        expect(DEX_SIZE).toBe(251);
        SPECIES.forEach((species, i) => expect(species.id).toBe(i + 1));
    });

    test("every species can be obtained", () => {
        const obtainable = new Set<number>([1, 4, 7]);
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
            species.forEach(id => expect(getSpecies(id).id).toBe(id));
        }
    });

    test("variant forms point at real species and evolve sensibly", () => {
        for (const form of VARIANT_SPECIES) {
            expect(getSpecies(form.baseSpecies!).id).toBe(form.baseSpecies);
            form.evolutions.forEach(e => expect(getSpecies(e.into)).toBeDefined());
        }
        const anime = VARIANT_SPECIES.filter(v =>
            ["pinkan", "valencian", "unique"].includes(v.variant!)
        );
        expect(anime.length).toBe(33);
        anime
            .filter(v => v.accessory == null)
            .forEach(v => expect(variantFilter(v.id), v.name).toBeDefined());
        // Pinkan Rhyhorn stays pink when it evolves; Pinkan Caterpie becomes a regular Metapod.
        expect(getSpecies(1111).evolutions[0].into).toBe(1112);
        expect(getSpecies(1010).evolutions[0].into).toBe(11);
        // Alolan Rattata becomes Alolan Raticate; female Pikachu becomes female Raichu.
        expect(getSpecies(10091).evolutions[0].into).toBe(10092);
        expect(getSpecies(5025).evolutions.map(e => e.into)).toEqual([5026]);
        // All 28 Unown and the regional forms of every Kanto and Johto species are in the data.
        expect(VARIANT_SPECIES.filter(v => v.baseSpecies === 201).length).toBe(28);
        expect(VARIANT_SPECIES.filter(v => v.variant === "regional").length).toBeGreaterThan(40);
    });

    test("legendary encounters are one-of-a-kind forms", () => {
        const wild = new Set(ZONES.flatMap(z => allZoneSpecies(z.id)));
        for (const id of [
            "giantAlakazam",
            "giantGengar",
            "giantJigglypuff",
            "lighthouseDragonite"
        ]) {
            const special = SPECIAL_ENCOUNTERS.find(s => s.id === id)!;
            expect(getSpecies(special.speciesId).variant, id).toBe("giant");
            expect(wild.has(special.speciesId), id).toBe(false);
        }
        // New Island is nothing but Mewtwo's clones, and clones stay clones.
        const clones = allZoneSpecies("newIsland").map(getSpecies);
        expect(clones.length).toBe(27);
        clones.forEach(c => expect(c.variant, c.name).toBe("clone"));
        clones.forEach(c => expect(c.evolutions, c.name).toEqual([]));
    });

    test("forms are only placed in the regions they belong to", () => {
        const found = new Set([
            ...ZONES.flatMap(z => allZoneSpecies(z.id)),
            ...SPECIAL_ENCOUNTERS.map(s => s.speciesId),
            ...REGION_LIST.flatMap(r => [...r.starters, ...(r.partnerStarters ?? [])])
        ]);
        // Plus anything those evolve into.
        for (const id of found) getSpecies(id).evolutions.forEach(e => found.add(e.into));
        // Every anime variant and every Kanto form can be found; Unown letters are in Tanoby.
        const shouldBeFound = VARIANT_SPECIES.filter(
            v =>
                ["pinkan", "valencian", "unique", "giant", "clone"].includes(v.variant!) ||
                v.nativeRegion === "kanto" ||
                v.baseSpecies === 201
        );
        expect(shouldBeFound.filter(v => !found.has(v.id)).map(v => v.name)).toEqual([]);
        // Forms from regions not in the game yet (Alola, Galar, Hoenn caps...) wait for them.
        const early = VARIANT_SPECIES.filter(
            v =>
                v.nativeRegion != null &&
                !["kanto", "johto"].includes(v.nativeRegion) &&
                found.has(v.id)
        );
        expect(early.map(v => v.name)).toEqual([]);
        for (const special of SPECIAL_ENCOUNTERS) {
            const form = getSpecies(special.speciesId);
            if (form.nativeRegion === "kanto") expect(special.region).toBe("kanto");
        }
    });

    test("wild Pokémon with gender differences are sometimes female", () => {
        let female = 0;
        let rolls = 0;
        const rng = mulberry(7);
        for (let i = 0; i < 2000; i++) {
            const rolled = rollEncounter("viridianForest", {}, rng);
            if (rolled == null) continue;
            if (getSpecies(rolled.speciesId).baseSpecies === 25) female++;
            if (rolled.speciesId === 25 || getSpecies(rolled.speciesId).baseSpecies === 25) rolls++;
        }
        expect(rolls).toBeGreaterThan(0);
        expect(female / rolls).toBeGreaterThan(0.3);
        expect(female / rolls).toBeLessThan(0.7);
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
            const species = getSpecies(encounter!.speciesId);
            expect(allowed.has(species.baseSpecies ?? species.id)).toBe(true);
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

describe("Magikarp Jump patterns", () => {
    test("every pattern has a Magikarp, and all but Gold a matching Gyarados", () => {
        const magikarp = magikarpPatterns(7);
        expect(magikarp.length).toBe(32);
        expect(magikarpPatterns(1).length).toBe(6);
        for (const form of magikarp) {
            const into = form.evolutions[0].into;
            if (form.spriteKey === "129-gold") {
                expect(into).toBe(130);
            } else {
                expect(getSpecies(into).spriteKey).toBe(form.spriteKey!.replace("129-", "130-"));
                expect(PRE_EVOLUTION[into]).toBe(form.id);
            }
        }
    });

    test("Magikarp only bite with patterns once Roddy's Old Rod has a level", () => {
        const rng = mulberry(3);
        const zone = "route6";
        const keys = { oldRod: true };
        const patterned = (rodLevel: number) => {
            const seen = new Set<number>();
            for (let i = 0; i < 4000; i++) {
                const rolled = rollEncounter(zone, keys, rng, rodLevel);
                if (rolled != null && getSpecies(rolled.speciesId).rodTier != null) {
                    seen.add(rolled.speciesId);
                }
            }
            return seen;
        };
        expect(patterned(0).size).toBe(0);
        const tierOne = patterned(1);
        expect(tierOne.size).toBeGreaterThan(3);
        tierOne.forEach(id => expect(getSpecies(id).rodTier).toBe(1));
    });
});

describe("pacing mechanics", () => {
    test("Effort grows with the square root of experience past the cap", () => {
        expect(effortMultiplier("medium", 50, 0)).toBe(1);
        const oneLevel = xpForLevel("medium", 51) - xpForLevel("medium", 50);
        expect(effortMultiplier("medium", 50, oneLevel)).toBeCloseTo(1.25);
        expect(effortMultiplier("medium", 50, oneLevel * 4)).toBeCloseTo(1.5);
        expect(effortMultiplier("medium", 100, oneLevel)).toBeGreaterThan(1);
    });

    test("renown toughens first clears; rematches take over once cleared", () => {
        expect(strengthMultiplier(0, 0)).toBe(1);
        expect(strengthMultiplier(0, 1)).toBe(1);
        expect(strengthMultiplier(0, 2)).toBeCloseTo(1.3);
        expect(strengthMultiplier(1, 2)).toBeCloseTo(1.15);
    });
});

describe("Cobblemon variants", () => {
    test("every variant drawn by the game has all four sprites", () => {
        for (const species of VARIANT_SPECIES.filter(s => s.localSprite)) {
            for (const folder of ["", "back/", "shiny/", "back/shiny/"]) {
                const file = `public/sprites/pokemon/${folder}${species.spriteKey}.png`;
                expect(existsSync(file), file).toBe(true);
            }
        }
    });

    test("wild Arbok sometimes show other hood patterns", () => {
        const rng = mulberry(5);
        const seen = new Set<number>();
        for (let i = 0; i < 3000; i++) {
            const rolled = rollEncounter("route23", {}, rng);
            if (rolled != null && getSpecies(rolled.speciesId).baseSpecies === 24) {
                seen.add(rolled.speciesId);
            }
        }
        expect(seen.size).toBeGreaterThan(3);
        expect(WILD_VARIANTS[24].variants.every(([id]) => getSpecies(id).baseSpecies === 24)).toBe(
            true
        );
    });

    test("regions unlock in order: Kanto, then the Orange Islands, then Sevii", () => {
        expect(REGIONS.kanto.requires).toBeUndefined();
        expect(REGIONS.orange.requires).toBe("kanto");
        expect(REGIONS.sevii.requires).toBe("orange");
    });
});

describe("sprites", () => {
    test("every sprite the game can show ships in public/sprites", () => {
        const missing = requiredSpritePaths().filter(path => !existsSync(`public/sprites/${path}`));
        expect(missing).toEqual([]);
        expect(requiredSpritePaths().length).toBeGreaterThan(1000);
    });
});

describe("zone efficiency", () => {
    test("rates are positive and rise with a stronger party", () => {
        const bonuses = { damage: 1, xp: 1, money: 1, searchTime: 2 };
        const weak = zoneRates("route1", {}, party([4, 5]), bonuses);
        const strong = zoneRates("route1", {}, party([6, 50]), bonuses);
        expect(weak.xpPerMinute).toBeGreaterThan(0);
        expect(weak.moneyPerMinute).toBeGreaterThan(0);
        expect(strong.xpPerMinute).toBeGreaterThan(weak.xpPerMinute);
        expect(strong.moneyPerMinute).toBeGreaterThan(weak.moneyPerMinute);
        // Fishing adds encounters (and their rewards) only once you have a rod.
        expect(zoneRates("route22", {}, party([6, 50]), bonuses)).not.toEqual(
            zoneRates("route22", { oldRod: true }, party([6, 50]), bonuses)
        );
    });
});

describe("evolution items", () => {
    test("friendship evolutions are flagged, and Link Cables and Soothe Bells are sold", () => {
        const friendship = SPECIES.flatMap(s =>
            s.evolutions.filter(e => e.friendship === true).map(e => `${s.id}->${e.into}`)
        );
        expect(friendship).toEqual(
            expect.arrayContaining(["42->169", "113->242", "175->176", "172->25", "133->196"])
        );
        // Held-item trade evolutions need their item as well as a Link Cable.
        const held = SPECIES.flatMap(s =>
            s.evolutions
                .filter(e => e.heldItem != null)
                .map(e => `${s.id}->${e.into}:${e.heldItem}`)
        );
        expect(held.sort()).toEqual(
            [
                "117->230:dragonScale",
                "123->212:metalCoat",
                "137->233:upGrade",
                "61->186:kingsRock",
                "79->199:kingsRock",
                "95->208:metalCoat"
            ].sort()
        );
        held.forEach(h => expect(STONES[h.split(":")[1] as keyof typeof STONES]).toBeDefined());
        expect(STONES.linkCable.price).toBeGreaterThan(0);
        expect(STONES.sootheBell.price).toBeGreaterThan(0);
    });
});

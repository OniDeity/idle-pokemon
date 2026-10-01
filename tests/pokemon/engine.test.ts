import { existsSync } from "fs";
import { requiredSpritePaths } from "../../scripts/fetchSprites";
import type { BallContext, PartyBattler } from "game/pokemon/balance";
import {
    ballCatchChance,
    ballEffect,
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
    femaleForm,
    type TimeOfDay,
    getSpecies,
    magikarpPatterns,
    PRE_EVOLUTION,
    SPECIES,
    typeEffectiveness,
    VARIANT_SPECIES,
    variantFilter,
    WILD_VARIANTS
} from "game/pokemon/data";
import { APRICORN_BALLS, BALLS, STONES } from "game/pokemon/items";
import { SPECIAL_ENCOUNTERS, specialSpecies } from "game/pokemon/specials";
import { bestTypeMultiplier, levelForXp, xpForLevel } from "game/pokemon/stats";
import { JOHTO_SWARMS } from "game/pokemon/johto";
import { MECHANIC_LIST } from "game/pokemon/mechanics";
import { pokedexRequirement, speciesObtainableIn } from "game/pokemon/pokedex";
import { REGION_LIST, REGIONS, strengthMultiplier } from "game/pokemon/regions";
import { championFor, ELITE_FOUR, GYMS } from "game/pokemon/trainers";
import {
    activePools,
    allZoneSpecies,
    availableZoneSpecies,
    bugContestOn,
    encounterOdds,
    momentOf,
    swarmOn,
    PATTERN_CHANCE,
    rollEncounter,
    ZONES,
    zonePools,
    zonesIn
} from "game/pokemon/zones";
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
        expect(anime.length).toBe(38);
        anime
            .filter(v => v.accessory == null && !v.localSprite)
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
        // Every legendary encounter is a Pokémon you can't just meet in the wild.
        for (const special of SPECIAL_ENCOUNTERS.filter(s => s.kind === "legendary")) {
            expect(wild.has(special.speciesId), special.id).toBe(false);
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

    test("regions unlock in order: Kanto, then the Orange Islands, then Sevii, then Johto", () => {
        expect(REGIONS.kanto.requires).toBeUndefined();
        expect(REGIONS.orange.requires).toBe("kanto");
        expect(REGIONS.sevii.requires).toBe("orange");
        expect(REGIONS.johto.requires).toBe("sevii");
        // Johto also needs a Pokédex with everything the first three regions offer.
        expect(REGIONS.johto.requiresCompletePokedex).toBe(true);
        const needed = pokedexRequirement(REGIONS.johto);
        expect(needed).toEqual(speciesObtainableIn(["kanto", "orange", "sevii"]));
        expect(needed.size).toBeGreaterThan(240);
        // Johto brings the rest (Sudowoodo, Elekid, Celebi…): the Pokédex can be completed.
        const all = speciesObtainableIn(REGION_LIST.map(r => r.id));
        expect(SPECIES.filter(sp => !all.has(sp.id)).map(sp => sp.name)).toEqual([]);
    });
});

describe("Johto clock, swarms and contest", () => {
    test("the clock follows HeartGold/SoulSilver's hours", () => {
        const at = (h: number) => momentOf(new Date(2026, 9, 6, h, 30)).time;
        expect([at(3), at(4), at(9), at(10), at(19), at(20)]).toEqual([
            "night",
            "morning",
            "morning",
            "day",
            "day",
            "night"
        ]);
        // 6 October 2026 is a Tuesday.
        expect(momentOf(new Date(2026, 9, 6, 12)).weekday).toBe(2);
        expect(momentOf(new Date(2026, 9, 7, 0, 5)).day).toBe(
            momentOf(new Date(2026, 9, 6)).day + 1
        );
    });

    test("time-of-day tables change who appears", () => {
        const base = momentOf(new Date(2026, 9, 7, 12));
        const ids = (time: TimeOfDay) => availableZoneSpecies("route29", {}, { ...base, time });
        // Hoothoot only comes out at night on Route 29.
        expect(ids("night")).toContain(163);
        expect(ids("day")).not.toContain(163);
        // Without a moment (simulator, tests) every time of day is in, at its average weight.
        expect(availableZoneSpecies("route29", {})).toContain(163);
    });

    test("the Bug-Catching Contest takes over the National Park on its days", () => {
        const tuesday = momentOf(new Date(2026, 9, 6, 12));
        const wednesday = momentOf(new Date(2026, 9, 7, 12));
        expect(bugContestOn(tuesday)).toBe(true);
        expect(bugContestOn(wednesday)).toBe(false);
        expect(availableZoneSpecies("nationalPark", {}, tuesday)).toContain(123);
        expect(availableZoneSpecies("nationalPark", {}, wednesday)).not.toContain(123);
        expect(allZoneSpecies("nationalPark")).toContain(127);
    });

    test("the radio's swarm makes up about 40% of its place, with the Radio Card", () => {
        const days = Array.from({ length: 60 }, (_, i) => 20000 + i);
        const zones = new Set(days.map(d => swarmOn(d).zoneId));
        // Every swarm comes up over two months, and the report is the same for everyone.
        expect(zones.size).toBe(JOHTO_SWARMS.length);
        expect(swarmOn(20005)).toBe(swarmOn(20005));
        const day = days.find(d => swarmOn(d).zoneId === "route35")!;
        const moment = { ...momentOf(new Date(2026, 9, 7, 12)), day };
        const walk = (radioCard: boolean) =>
            activePools("route35", { radioCard }, moment).find(p => p.kind === "walk")!.entries;
        const share = (entries: { id: number; weight: number }[]) =>
            entries.filter(e => e.id === 193).reduce((a, e) => a + e.weight, 0) /
            entries.reduce((a, e) => a + e.weight, 0);
        // Yanma is already a rare sight on Route 35; the swarm adds 40% on top of that.
        const usual = share(walk(false));
        expect(usual).toBeLessThan(0.05);
        expect(share(walk(true))).toBeCloseTo(0.4 + 0.6 * usual, 6);
    });
});

describe("Apricorn Balls", () => {
    test("each ball shines in its own situation", () => {
        const ctx = (id: number, extra: Partial<BallContext> = {}): BallContext => ({
            species: getSpecies(id),
            level: 20,
            kind: "walk",
            partyLevel: 20,
            familyOwned: false,
            ...extra
        });
        expect(ballEffect("levelBall", ctx(19, { partyLevel: 21 }))[0]).toBe(2);
        expect(ballEffect("levelBall", ctx(19, { partyLevel: 40 }))[0]).toBe(4);
        expect(ballEffect("levelBall", ctx(19, { partyLevel: 80 }))[0]).toBe(8);
        expect(ballEffect("levelBall", ctx(19, { partyLevel: 20 }))[0]).toBe(1);
        expect(ballEffect("lureBall", ctx(129, { kind: "fishing" }))[0]).toBe(3);
        expect(ballEffect("lureBall", ctx(129))[0]).toBe(1);
        // Clefairy and Nidorina evolve with a Moon Stone; Clefable doesn't.
        expect(ballEffect("moonBall", ctx(35))[0]).toBe(4);
        expect(ballEffect("moonBall", ctx(30))[0]).toBe(4);
        expect(ballEffect("moonBall", ctx(36))[0]).toBe(1);
        expect(ballEffect("loveBall", ctx(19, { familyOwned: true }))[0]).toBe(8);
        // Jolteon (base Speed 130) is fast; Snorlax isn't, but at 460 kg it's very heavy.
        expect(ballEffect("fastBall", ctx(135))[0]).toBe(4);
        expect(ballEffect("fastBall", ctx(143))[0]).toBe(1);
        expect(ballEffect("heavyBall", ctx(143))).toEqual([1, 40]);
        expect(ballEffect("heavyBall", ctx(25))).toEqual([1, -20]);
        expect(ballCatchChance("heavyBall", ctx(143))).toBeGreaterThan(
            ballCatchChance("pokeBall", ctx(143))
        );
        // Plain balls are unchanged.
        expect(ballEffect("greatBall", ctx(19))).toEqual([1.5, 0]);
        expect(APRICORN_BALLS.every(id => BALLS[id].region === "johto")).toBe(true);
    });
});

describe("generation mechanics", () => {
    test("each is reached partway through its own region", () => {
        expect(MECHANIC_LIST.map(m => m.id)).toContain("breeding");
        for (const mechanic of MECHANIC_LIST) {
            const region = REGIONS[mechanic.region];
            expect(region, mechanic.id).toBeDefined();
            expect(mechanic.trialsRequired).toBeLessThanOrEqual(region.trials.length);
        }
    });
});

describe("key items", () => {
    test("every encounter pool's key item can be had in that zone's region", () => {
        // Kindle Road's Rock Smash rocks were once out of reach: the Sevii Islands never gave it.
        for (const region of REGION_LIST) {
            const items = new Set<string>([
                ...region.startingKeyItems,
                ...region.trials.flatMap(t => t.keyItems)
            ]);
            for (const zone of zonesIn(region.id)) {
                for (const [pool, entries] of Object.entries(zonePools(zone.id))) {
                    if (pool === "walk" || entries == null || entries.length === 0) continue;
                    expect(items.has(pool), `${zone.id} ${pool}`).toBe(true);
                }
            }
        }
    });
});

describe("Johto anime", () => {
    test("every anime-only Johto place is explorable, with its one-of-a-kind Pokémon", () => {
        const anime = zonesIn("johto").filter(z => z.anime);
        expect(anime.length).toBe(58);
        // Anime places come after the game's own within each badge tier.
        const johto = zonesIn("johto");
        johto.forEach((zone, i) => {
            if (i > 0)
                expect(zone.badgesRequired).toBeGreaterThanOrEqual(johto[i - 1].badgesRequired);
        });
        // Pudgy Pidgey are wild; Silver, Dark Celebi and the Unown's Entei are legendary encounters.
        expect(allZoneSpecies("pudgyPidgeyIsle")).toContain(3016);
        const legends = SPECIAL_ENCOUNTERS.filter(sp => sp.kind === "legendary").map(
            sp => sp.speciesId
        );
        expect(legends).toEqual(expect.arrayContaining([3249, 3251, 3248, 3244]));
        expect(getSpecies(3251).types).toEqual(["dark", "grass"]);
        // Mewtwo's clones settled on Mount Quena.
        expect(allZoneSpecies("mountQuena").length).toBe(27);
    });
});

describe("Johto specials", () => {
    test("gifts, trades, legends and Red are all set up", () => {
        const johto = SPECIAL_ENCOUNTERS.filter(sp => sp.region === "johto");
        expect(johto.length).toBeGreaterThan(20);
        const zoneIds = new Set(zonesIn("johto").map(z => z.id));
        for (const special of johto) {
            specialSpecies(special).forEach(id => expect(getSpecies(id).id).toBe(id));
            if (special.kind === "legendary")
                expect(zoneIds.has(special.zoneId), special.id).toBe(true);
        }
        // The Odd Egg can hatch every baby Pokémon, often shiny.
        const oddEgg = johto.find(sp => sp.id === "oddEgg")!;
        expect(specialSpecies(oddEgg).sort()).toEqual([172, 173, 174, 236, 238, 239, 240]);
        // Red waits on Mt. Silver after the League, with his HeartGold/SoulSilver team.
        const red = johto.find(sp => sp.kind === "boss")!;
        expect(red.kind === "boss" && red.trainer.team.map(p => p.id)).toEqual([
            25, 196, 143, 3, 6, 9
        ]);
        expect(red.postGame).toBe(true);
        expect(specialSpecies(red)).toEqual([]);
        // The Red Gyarados is its own form; Union Cave's Lapras only comes on Fridays.
        expect(getSpecies(7022).baseSpecies).toBe(130);
        const lapras = johto.find(sp => sp.id === "unionCaveLapras")!;
        expect(lapras.kind === "gift" && lapras.weekdays).toEqual([5]);
    });
});

describe("Johto", () => {
    test("every place has wild Pokémon by the time its badges open it", () => {
        for (const zone of zonesIn("johto")) {
            const keyItems = Object.fromEntries(
                REGIONS.johto.trials
                    .filter(gym => gym.badgeNumber <= zone.badgesRequired)
                    .flatMap(gym => gym.keyItems)
                    .map(item => [item, true])
            );
            const pools = activePools(zone.id, keyItems);
            expect(pools.length, zone.id).toBeGreaterThan(0);
        }
        expect(zonesIn("johto").length).toBeGreaterThanOrEqual(50);
    });

    test("Gyms, Elite Four and Champion use real species and their own ids", () => {
        expect(REGIONS.johto.trials.map(g => g.badgeIcon)).toEqual(
            Array.from({ length: 8 }, (_, i) => `badges/${i + 9}.png`)
        );
        const finale = REGIONS.johto.finale(152);
        expect(finale.map(t => t.name)).toEqual(["Will", "Koga", "Bruno", "Karen", "Lance"]);
        for (const trainer of [...REGIONS.johto.trials, ...finale]) {
            trainer.team.forEach(p => expect(getSpecies(p.id).id).toBe(p.id));
        }
        // Trainer ids never clash with another region's.
        const ids = REGION_LIST.flatMap(r => [...r.trials, ...r.finale(1)].map(t => t.id));
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe("sprites", () => {
    test("every sprite the game can show ships in public/sprites", () => {
        const missing = requiredSpritePaths().filter(path => !existsSync(`public/sprites/${path}`));
        expect(missing).toEqual([]);
        expect(requiredSpritePaths().length).toBeGreaterThan(1000);
    });
});

describe("wild encounters", () => {
    test("only regular species roll female forms, so variants spawn as themselves", () => {
        for (const zone of ZONES) {
            for (const id of allZoneSpecies(zone.id)) {
                const female = femaleForm(id);
                if (female != null) expect(female.variant, `${zone.id} #${id}`).toBe("female");
            }
        }
        // Valencian Butterfree (2012) used to become a Brown Mooshtank (7012) every time.
        expect(femaleForm(2012)).toBeUndefined();
        expect(femaleForm(1010)).toBeUndefined();
        expect(femaleForm(25)?.id).toBe(5025);
        let seed = 1;
        const rng = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
        const seen = new Set<number>();
        for (let i = 0; i < 5000; i++) {
            const encounter = rollEncounter("valenciaIsland", {}, rng);
            if (encounter != null) seen.add(encounter.speciesId);
        }
        expect(seen.has(2012)).toBe(true);
        expect(seen.has(7012)).toBe(false);
    });
});

describe("encounter odds", () => {
    test("add up to one and match what rollEncounter actually rolls", () => {
        const gear = {
            oldRod: true,
            goodRod: true,
            superRod: true,
            surf: true,
            headbutt: true,
            rockSmash: true
        };
        for (const zone of ZONES) {
            const total = [...encounterOdds(zone.id, gear, 3).values()].reduce((a, b) => a + b, 0);
            expect(total, zone.id).toBeCloseTo(1, 6);
        }
        // Patterns and cosmetic variants apply to the whole species, females included: 30% of
        // Magikarp have a pattern (it was 15%, since female Magikarp never did).
        const fishing = encounterOdds(
            "route12",
            { oldRod: true, goodRod: true, superRod: true },
            3
        );
        let patterned = 0;
        let magikarp = 0;
        for (const [id, p] of fishing) {
            if (id >= 6000 && id < 6100) patterned += p;
            if (id === 129 || id === 5129 || (id >= 6000 && id < 6100)) magikarp += p;
        }
        expect(patterned / magikarp).toBeCloseTo(PATTERN_CHANCE, 6);
        // Route 23 has Arbok (hood patterns) and Magikarp (patterns); Route 1 has Rattata
        // (female forms); Valencia Island has variants.
        for (const zoneId of ["route23", "route1", "valenciaIsland"]) {
            const odds = encounterOdds(zoneId, gear, 3);
            let seed = 7;
            const rng = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
            const counts = new Map<number, number>();
            const rolls = 200000;
            for (let i = 0; i < rolls; i++) {
                const id = rollEncounter(zoneId, gear, rng, 3)!.speciesId;
                counts.set(id, (counts.get(id) ?? 0) + 1);
            }
            for (const [id, p] of odds) {
                expect((counts.get(id) ?? 0) / rolls, `${zoneId} #${id}`).toBeCloseTo(p, 2);
            }
        }
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

import { existsSync, readdirSync, readFileSync } from "fs";
import { arrive, finalForm, MAX_RESIDENTS, RESIDENTS, towerSpecies } from "game/pokemon/entralink";
import { requiredSpritePaths } from "../../scripts/fetchSprites";
import type { BallContext, PartyBattler } from "game/pokemon/balance";
import {
    benchTeam,
    FAME_EFFECTS,
    HOF_UPGRADES,
    MASTERY_COST_GROWTH,
    upgradeCost,
    upgradeSpent,
    upgradeTopLevel,
    ballCatchChance,
    ballEffect,
    catchChance,
    computeBonuses,
    effortMultiplier,
    initialTrainerBattle,
    memberDps,
    simulateTrainerBattle,
    stepTrainerBattle,
    PARTNER_DAMAGE,
    TRIPLE_PARTNER_DAMAGE,
    trainerTeam,
    wildDps,
    zoneRates
} from "game/pokemon/balance";
import {
    DEX_SIZE,
    femaleForm,
    getSpecies,
    isShadow,
    magikarpPatterns,
    PRE_EVOLUTION,
    SHADOW_OFFSET,
    shadowOf,
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
import { MECHANIC_LIST, MECHANICS } from "game/pokemon/mechanics";
import {
    CONTEST_CATEGORIES,
    CONTEST_PIKACHU,
    contestScore,
    MAX_CONDITION,
    nextRank,
    RANK_SCORES,
    typeAppeal,
    winChance
} from "game/pokemon/contests";
import {
    isReleased,
    POKEDEX_IDS,
    pokedexRequirement,
    speciesObtainableIn
} from "game/pokemon/pokedex";
import { REGION_LIST, REGIONS, strengthMultiplier } from "game/pokemon/regions";
import { championFor, ELITE_FOUR, GYMS } from "game/pokemon/trainers";
import {
    activePools,
    allZoneSpecies,
    availableZoneSpecies,
    catchableIn,
    CIPHER_PEON_CHANCE,
    encounterOdds,
    EXTRA_SHARE,
    PATTERN_CHANCE,
    rollEncounter,
    ZONES,
    ZONES_BY_ID,
    zonePools,
    zonesIn
} from "game/pokemon/zones";
import { SHADOW_TRAINERS } from "game/pokemon/colosseum";
import { META_GROUDON } from "game/pokemon/hoennAnime";
import {
    DISTORTION_FAME_BONUS,
    HONEY_SPECIES,
    HONEY_TREES,
    MUNCHLAX_TREES,
    munchlaxTrees,
    rollHoneyTree,
    SINNOH_EXTRAS
} from "game/pokemon/sinnoh";
import { digWall, diggable, FOSSIL_SPECIES, UNDERGROUND_ITEMS } from "game/pokemon/underground";
import { DEX_MILESTONES, fameGain, HOF_UPGRADE_LIST } from "game/pokemon/balance";
import { arceusForm } from "game/pokemon/data";
import { FIORE_MISSIONS, FIORE_ZONES } from "game/pokemon/fiore";
import { ALMIA_MISSIONS, ALMIA_ZONES, fieldAbilityOf, fieldPowers } from "game/pokemon/almia";
import { OBLIVIA_MISSIONS, OBLIVIA_ZONES, ROAR_SIGNS } from "game/pokemon/oblivia";
import { POKE_ASSIST_BONUS, STYLER_POWER } from "game/pokemon/balance";
import { MAX_RADAR_CHAIN, RADAR_CHAIN_PULL, radarShinyMultiplier } from "game/pokemon/zones";
import {
    AUDINO,
    criticalCaptureChance,
    criticalCaptureFactor,
    PHENOMENON_CHANCE,
    seasonAt,
    seasonForm,
    UNOVA_EXTRAS,
    UNOVA_GYMS,
    UNOVA_ZONES
} from "game/pokemon/unova";
import { grottoPool, UNOVA2_GYMS, UNOVA2_ZONES } from "game/pokemon/unova2";
import { trialFor } from "game/pokemon/trainers";
import {
    MEDALS,
    medalRank,
    newMedals,
    rankFameMultiplier,
    tierFame,
    tierReached
} from "game/pokemon/medals";
import type { MedalContext } from "game/pokemon/medals";
import {
    CHALLENGE_LIST,
    challengeFame,
    challengesMet,
    partyAllowed,
    partySize,
    TIME_TRIAL_SECONDS
} from "game/pokemon/challenges";
import { POKEDEX_SIZE } from "game/pokemon/pokedex";
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
    test("has species #1-649 in order, with the Pokédex only as far as the regions go", () => {
        expect(DEX_SIZE).toBe(649);
        SPECIES.forEach((species, i) => expect(species.id).toBe(i + 1));
        // Every Pokédex species is one a region offers; nothing past #251 without a region for it.
        const offered = speciesObtainableIn(REGION_LIST.map(r => r.id));
        expect(POKEDEX_IDS.filter(id => id > 251).every(id => offered.has(id))).toBe(true);
        expect(POKEDEX_IDS.filter(id => id <= 251).length).toBe(251);
        expect(isReleased(298)).toBe(offered.has(298)); // Azurill
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
            // Whatever the NPC wants to see can be had in their region (or the ones before it).
            const index = REGION_LIST.findIndex(r => r.id === special.region);
            const available = speciesObtainableIn(REGION_LIST.slice(0, index + 1).map(r => r.id));
            expect(available.has(special.wants), special.id).toBe(true);
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
            // Pal Park only has what's migrated to it (see the Sinnoh tests), and the Entralink
            // towns only their residents' Pokémon (see the Unova tests).
            if (zone.palPark === true || zone.entralink != null) continue;
            // Orre's places are trainer battles; some (Mt. Battle) have no Shadow Pokémon to snag.
            const species = zone.trainerBattles
                ? (zonePools(zone.id).walk ?? []).map(e => e.id)
                : allZoneSpecies(zone.id);
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
        expect(anime.length).toBe(39);
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
        expect(
            VARIANT_SPECIES.filter(v => v.baseSpecies === 201 && v.variant !== "shadow").length
        ).toBe(28);
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
        // Every legendary encounter is a Pokémon you can't just meet in its region's wild.
        for (const special of SPECIAL_ENCOUNTERS.filter(s => s.kind === "legendary")) {
            const regionWild = new Set(zonesIn(special.region).flatMap(z => allZoneSpecies(z.id)));
            expect(regionWild.has(special.speciesId), special.id).toBe(false);
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
                (v.baseSpecies === 201 && v.variant !== "shadow")
        );
        expect(shouldBeFound.filter(v => !found.has(v.id)).map(v => v.name)).toEqual([]);
        // Forms from regions not in the game yet (Alola, Galar, Hoenn caps...) wait for them.
        const early = VARIANT_SPECIES.filter(
            v =>
                v.nativeRegion != null &&
                !["kanto", "johto", "hoenn", "sinnoh", "unova"].includes(v.nativeRegion) &&
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

    test("double battles: a partner adds its damage, and a double trainer's second Pokémon hits too", () => {
        const team = party([9, 45], [26, 44], [65, 45], [3, 45], [130, 44], [59, 45]);
        const starmie = trainerTeam(GYMS[1])[1];
        const single = wildDps(team, starmie, 1);
        const double = wildDps(team, starmie, 1, true);
        const dps = team.map(m => memberDps(m, starmie, 1)).sort((a, b) => b - a);
        expect(single).toBeCloseTo(dps[0], 9);
        expect(double).toBeCloseTo(dps[0] + PARTNER_DAMAGE * dps[1], 9);
        // A lone Pokémon has no partner.
        expect(wildDps(team.slice(0, 1), starmie, 1, true)).toBe(
            wildDps(team.slice(0, 1), starmie, 1)
        );

        const gym = GYMS[7];
        const alone = simulateTrainerBattle(team, gym, 8, 3);
        const together = simulateTrainerBattle(team, gym, 8, 3, true);
        expect(alone.won).toBe(true);
        expect(together.won).toBe(true);
        expect(together.time).toBeLessThan(alone.time);
        expect(together.hpRemaining).toBeGreaterThan(alone.hpRemaining);
        const pair = { ...gym, doubles: true };
        expect(simulateTrainerBattle(team, pair, 8, 3, true).hpRemaining).toBeLessThan(
            together.hpRemaining
        );

        // Stepping stays exact with a partner and a double-battle trainer.
        const forecast = simulateTrainerBattle(team, pair, 1.3, 1.2, true);
        const enemies = trainerTeam(pair);
        let state = initialTrainerBattle(team, enemies, 1.2);
        let done = null;
        for (let i = 0; i < 100000 && done == null; i++) {
            const result = stepTrainerBattle(team, enemies, state, 1.3, 0.05, pair.timeLimit, {
                doubles: true,
                enemyDoubles: true
            });
            state = result.state;
            done = result.done;
        }
        expect(done).toBe(forecast.reason);
        expect(state.elapsed).toBeCloseTo(forecast.time, 6);
        expect(state.partyHp).toEqual(forecast.state.partyHp.map(hp => expect.closeTo(hp, 6)));
        expect(REGIONS.hoenn.trials.find(g => g.doubles)?.name).toBe("Tate & Liza");
    });

    test("triple battles: a second partner adds a quarter of its damage", () => {
        const team = party([9, 45], [26, 44], [65, 45], [3, 45], [130, 44], [59, 45]);
        const starmie = trainerTeam(GYMS[1])[1];
        const dps = team.map(m => memberDps(m, starmie, 1)).sort((a, b) => b - a);
        expect(wildDps(team, starmie, 1, { doubles: true, triples: true })).toBeCloseTo(
            dps[0] + PARTNER_DAMAGE * dps[1] + TRIPLE_PARTNER_DAMAGE * dps[2],
            9
        );
        const gym = GYMS[7];
        const doubles = simulateTrainerBattle(team, gym, 8, 3, { doubles: true });
        const triples = simulateTrainerBattle(team, gym, 8, 3, { doubles: true, triples: true });
        expect(triples.time).toBeLessThan(doubles.time);
    });

    test("rotation battles: the sturdiest Pokémon takes the hits, and stepping stays exact", () => {
        const team = party([9, 40], [26, 40], [65, 40], [3, 40], [130, 40], [59, 40]);
        const gym = { ...GYMS[7], timeLimit: 10000 };
        const plain = simulateTrainerBattle(team, gym, 6, 6, { doubles: true });
        const rotating = simulateTrainerBattle(team, gym, 6, 6, { doubles: true, rotation: true });
        expect(plain.won && rotating.won).toBe(true);
        // The best matchup keeps attacking while a sturdier teammate takes the hits.
        expect(rotating.time).toBeLessThan(plain.time);
        expect(rotating.hpRemaining).toBeGreaterThan(plain.hpRemaining);

        const rules = { doubles: true, triples: true, rotation: true };
        const forecast = simulateTrainerBattle(team, gym, 1.3, 1.2, rules);
        const enemies = trainerTeam(gym);
        let state = initialTrainerBattle(team, enemies, 1.2);
        let done = null;
        for (let i = 0; i < 200000 && done == null; i++) {
            const result = stepTrainerBattle(team, enemies, state, 1.3, 0.05, gym.timeLimit, rules);
            state = result.state;
            done = result.done;
        }
        expect(done).toBe(forecast.reason);
        expect(state.elapsed).toBeCloseTo(forecast.time, 6);
        expect(state.partyHp).toEqual(forecast.state.partyHp.map(hp => expect.closeTo(hp, 6)));
    });

    test("Triple and Rotation Battles are met in Unova at Opelucid", () => {
        for (const id of ["tripleBattles", "rotationBattles"] as const) {
            expect(MECHANICS[id].region).toBe("unova");
            expect(MECHANICS[id].trialsRequired).toBe(7);
        }
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
        expect(POKEDEX_IDS.filter(id => !all.has(id)).map(id => getSpecies(id).name)).toEqual([]);
    });
});

describe("Johto's swarms and contest", () => {
    test("every time of day's Pokémon are always in, at their average weights", () => {
        // Hoothoot only comes out at night on Route 29 in HeartGold/SoulSilver.
        expect(availableZoneSpecies("route29", {})).toContain(163);
    });

    test("entering the Bug-Catching Contest adds its bugs to the National Park", () => {
        expect(availableZoneSpecies("nationalPark", {})).not.toContain(123);
        const walk = activePools("nationalPark", {}, { bugContest: true }).find(
            p => p.kind === "walk"
        )!.entries;
        expect(walk.map(e => e.id)).toEqual(expect.arrayContaining([123, 127, 13, 48]));
        // The park's own Pokémon stay: the contest's bugs make up a third of the grass.
        const usual = availableZoneSpecies("nationalPark", {});
        expect(walk.map(e => e.id)).toEqual(expect.arrayContaining(usual));
        expect(allZoneSpecies("nationalPark")).toContain(127);
    });

    test("a swarm tuned in to makes up a third of its place, as long as it's paid for", () => {
        const walk = (joined: boolean) =>
            activePools("route35", {}, { swarms: { route35: joined } }).find(
                p => p.kind === "walk"
            )!.entries;
        const share = (entries: { id: number; weight: number }[]) =>
            entries.filter(e => e.id === 193).reduce((a, e) => a + e.weight, 0) /
            entries.reduce((a, e) => a + e.weight, 0);
        // Yanma is already a rare sight on Route 35; the swarm adds a third on top of that.
        const usual = share(walk(false));
        expect(usual).toBeLessThan(0.05);
        expect(share(walk(true))).toBeCloseTo(EXTRA_SHARE + (1 - EXTRA_SHARE) * usual, 6);
        // Every swarm is somewhere in Johto, and only adds to its own place.
        for (const swarm of JOHTO_SWARMS) {
            expect(zonesIn("johto").some(z => z.id === swarm.zoneId)).toBe(true);
            expect(allZoneSpecies(swarm.zoneId)).toContain(swarm.speciesId);
        }
        expect(availableZoneSpecies("route29", {}, { swarms: { route35: true } })).not.toContain(
            193
        );
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
        // Kurt's balls are stocked once the Apricorn Balls mechanic is unlocked, in any region.
        expect(APRICORN_BALLS.every(id => BALLS[id].mechanic === "apricornBalls")).toBe(true);
    });
});

describe("generation mechanics", () => {
    test("each is reached partway through its own region", () => {
        expect(MECHANIC_LIST.map(m => m.id)).toEqual([
            "breeding",
            "apricornBalls",
            "headbutt",
            "snagMachine",
            "relicStone",
            "pokeSpots",
            "doubleBattles",
            "partner",
            "contests",
            "underground",
            "sinnohEvolutions",
            "pokeAssist",
            "rangerSigns",
            "seasons",
            "phenomena",
            "criticalCapture",
            "hiddenGrottoes",
            "tripleBattles",
            "rotationBattles"
        ]);
        // Kanto's Headbutt trees (from HeartGold/SoulSilver) wait for the Headbutt mechanic, so
        // they don't change the Pokédex Johto asks for.
        expect(zonePools("route1").headbutt?.map(e => e.id)).toContain(163);
        expect(pokedexRequirement(REGIONS.johto).size).toBe(248);
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
            // Generation mechanics' key items (Headbutt) reach every region once unlocked.
            const items = new Set<string>([
                ...region.startingKeyItems,
                ...region.trials.flatMap(t => t.keyItems),
                ...MECHANIC_LIST.flatMap(m => (m.keyItem != null ? [m.keyItem] : []))
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

describe("Hoenn", () => {
    test("comes between Johto and Orre, after Johto and a complete Pokédex", () => {
        const order = REGION_LIST.map(r => r.id);
        expect(order.indexOf("hoenn")).toBe(order.indexOf("johto") + 1);
        expect(order.indexOf("orre")).toBe(order.indexOf("hoenn") + 1);
        const hoenn = REGIONS.hoenn;
        expect(hoenn.requires).toBe("johto");
        expect(hoenn.requiresCompletePokedex).toBe(true);
        expect(hoenn.starters).toEqual([252, 255, 258]);
        expect(hoenn.levelCaps).toHaveLength(hoenn.trials.length + 2);
    });

    test("Gyms, Elite Four and Champion Wallace use Emerald's teams and Hoenn's badges", () => {
        const hoenn = REGIONS.hoenn;
        expect(hoenn.trials.map(g => g.name)).toEqual([
            "Roxanne",
            "Brawly",
            "Wattson",
            "Flannery",
            "Norman",
            "Winona",
            "Tate & Liza",
            "Juan"
        ]);
        expect(hoenn.trials.map(g => g.badgeIcon)).toEqual(
            Array.from({ length: 8 }, (_, i) => `badges/${i + 17}.png`)
        );
        const finale = hoenn.finale(252);
        expect(finale.map(t => t.name)).toEqual(["Sidney", "Phoebe", "Glacia", "Drake", "Wallace"]);
        for (const trainer of [...hoenn.trials, ...finale]) {
            trainer.team.forEach(p => expect(getSpecies(p.id).id).toBe(p.id));
        }
        // Badge names read as badges ("You earned the Stone Badge!"), in every region with them.
        for (const region of REGION_LIST.filter(r => r.trialNoun === "badges")) {
            region.trials.forEach(g => expect(g.badge, g.name).toMatch(/Badge$/));
        }
    });

    test("every Hoenn Pokémon (#252-386) can be caught there", () => {
        const hoenn = speciesObtainableIn(["hoenn"]);
        for (let id = 252; id <= 386; id++) expect(hoenn.has(id), String(id)).toBe(true);
        // Wild pools reach past #251 in Hoenn (and Sinnoh) only; earlier regions keep their own
        // tables.
        for (const zone of ZONES.filter(
            z => !["hoenn", "sinnoh", "unova", "unova2"].includes(z.region) && z.encounters == null
        )) {
            for (const entries of Object.values(zonePools(zone.id))) {
                entries?.forEach(e => expect(e.id > 251 && e.id <= 386, zone.id).toBe(false));
            }
        }
    });

    test("Dive reaches the seaweed, and Feebas hides in Route 119's river", () => {
        expect(activePools("underwater", { surf: true })).toEqual([]);
        const dive = activePools("underwater", { dive: true });
        expect(dive.map(p => p.kind)).toEqual(["dive"]);
        expect(dive[0].entries.map(e => e.id)).toEqual(expect.arrayContaining([366, 369]));
        expect(REGIONS.hoenn.trials.find(g => g.keyItems.includes("dive"))?.name).toBe(
            "Tate & Liza"
        );
        const fishing = encounterOdds("route119", { oldRod: true, goodRod: true, superRod: true });
        expect(fishing.get(349) ?? 0).toBeGreaterThan(0);
        expect(getSpecies(349).evolutions[0]).toEqual({
            into: 350,
            method: "trade",
            heldItem: "prismScale"
        });
    });
});

describe("Hoenn's anime", () => {
    test("anime places, Meta Groudon and Ash's Hoenn Cap Pikachu", () => {
        const anime = zonesIn("hoenn").filter(z => z.anime);
        expect(anime.length).toBe(34);
        expect(anime.every(z => (z.encounters?.walk?.length ?? 0) > 0)).toBe(true);
        const meta = getSpecies(META_GROUDON);
        expect(meta.baseSpecies).toBe(383);
        expect(meta.name).toBe("Meta Groudon");
        const special = SPECIAL_ENCOUNTERS.find(s => s.speciesId === META_GROUDON);
        expect(special?.kind).toBe("legendary");
        expect(special?.kind === "legendary" && ZONES_BY_ID[special.zoneId].name).toBe("Forina");
        expect(SPECIAL_ENCOUNTERS.some(s => s.speciesId === 10095 && s.region === "hoenn")).toBe(
            true
        );
    });
});

describe("Pokémon Contests", () => {
    test("scores, ranks and prizes", () => {
        // Milotic is a Water type: full appeal in Beauty, none in Tough.
        expect(typeAppeal(350, "beauty")).toBe(30);
        expect(typeAppeal(350, "tough")).toBe(0);
        // A second type counts for half (Gyarados is Water/Flying: Cool from Flying).
        expect(typeAppeal(130, "cool")).toBe(15);
        expect(contestScore(350, 40, 50, "beauty")).toBe(50 + 30 + 20);
        expect(winChance(RANK_SCORES.normal, "normal")).toBe(0.5);
        expect(winChance(0, "master")).toBe(0);
        expect(winChance(1000, "master")).toBe(1);
        // A perfect Pokémon (full condition, suited types, Lv. 100) is sure to win Master Rank.
        expect(winChance(contestScore(350, 100, MAX_CONDITION, "beauty"), "master")).toBe(1);
        expect(nextRank(undefined)).toBe("normal");
        expect(nextRank("hyper")).toBe("master");
        expect(nextRank("master")).toBeUndefined();
        for (const category of CONTEST_CATEGORIES) {
            const prize = getSpecies(CONTEST_PIKACHU[category]);
            expect(prize.baseSpecies, category).toBe(25);
        }
        expect(MECHANICS.contests.region).toBe("hoenn");
    });
});

describe("Orre (Colosseum)", () => {
    test("comes after Hoenn, with both Espeon and Umbreon and the Snag Machine", () => {
        const orre = REGIONS.orre;
        expect(orre.requires).toBe("hoenn");
        expect(orre.requiresCompletePokedex).toBe(true);
        expect(orre.allStarters).toBe(true);
        expect(orre.starters).toEqual([196, 197]);
        expect(orre.startingKeyItems).toContain("snagMachine");
        // Everything from Kanto to Hoenn is the price of entry.
        const hoenn = pokedexRequirement(REGIONS.hoenn);
        expect(hoenn.size).toBe(251);
        expect(pokedexRequirement(orre).size).toBeGreaterThan(251);
        hoenn.forEach(id => expect(pokedexRequirement(orre).has(id)).toBe(true));
    });

    test("every species has a Shadow form, with an aura and no evolutions", () => {
        expect(shadowOf(25)).toBe(8025);
        expect(shadowOf(10091)).toBe(SHADOW_OFFSET + 19); // Alolan Rattata → Shadow Rattata
        const shadow = getSpecies(8248);
        expect(shadow.name).toBe("Shadow Tyranitar");
        expect(shadow.evolutions).toEqual([]);
        expect(isShadow(8248) && !isShadow(248)).toBe(true);
        expect(variantFilter(8248)).toContain("drop-shadow");
    });

    test("places are trainer battles where only Shadow Pokémon can be snagged, once each", () => {
        const pyrite = "pyriteTown";
        expect(ZONES_BY_ID[pyrite].trainerBattles).toBe(true);
        const all = allZoneSpecies(pyrite);
        expect(all.length).toBeGreaterThan(5);
        expect(all.every(isShadow)).toBe(true);
        expect(catchableIn(pyrite, 262)).toBe(false);
        expect(catchableIn(pyrite, 8193)).toBe(true);
        expect(catchableIn("route1", 16)).toBe(true);
        // A snagged Shadow Pokémon is gone from its place for the rest of the journey.
        const ids = (snagged: Record<string, boolean>) =>
            activePools(pyrite, {}, { snagged })[0].entries.map(e => e.id);
        expect(ids({})).toContain(8193);
        expect(ids({ 8193: true })).not.toContain(8193);
    });

    test("Cipher Peons turn a share of every other region's encounters into Shadow Pokémon", () => {
        const plain = encounterOdds("route1", {});
        const peons = encounterOdds("route1", {}, 0, { cipherPeons: true });
        const total = [...peons.values()].reduce((a, b) => a + b, 0);
        expect(total).toBeCloseTo(1, 9);
        const shadows = [...peons].filter(([id]) => isShadow(id));
        expect(shadows.reduce((a, [, p]) => a + p, 0)).toBeCloseTo(CIPHER_PEON_CHANCE, 9);
        expect(peons.get(shadowOf(16))).toBeCloseTo((plain.get(16) ?? 0) * CIPHER_PEON_CHANCE, 9);
    });

    test("the admins hand over their Shadow legends, and Orre's Hoenn Pokémon join the Pokédex", () => {
        const snags = [...REGIONS.orre.trials, ...REGIONS.orre.finale(196)].flatMap(
            t => t.snag ?? []
        );
        expect(snags).toEqual([185, 244, 245, 243, 227, 376, 248]);
        const gen3 = POKEDEX_IDS.filter(id => id > 251).map(id => getSpecies(id).name);
        expect(gen3).toEqual(
            expect.arrayContaining([
                "Makuhita",
                "Metagross",
                "Absol",
                "Tropius",
                "Plusle",
                "Flygon"
            ])
        );
        // Every Shadow Pokémon met in Orre has a trainer to snag it from.
        for (const zone of zonesIn("orre").filter(z => z.trainerBattles)) {
            allZoneSpecies(zone.id).forEach(id =>
                expect(SHADOW_TRAINERS[id], `${id}`).toBeDefined()
            );
        }
    });
});

describe("Orre (XD)", () => {
    test("comes after Colosseum, with Eevee, XD's admins and Citadark Isle", () => {
        const xd = REGIONS.orreXd;
        expect(xd.requires).toBe("orre");
        expect(xd.starters).toEqual([133]);
        expect(xd.trials.map(t => t.name)).toEqual([
            "Lovrina",
            "Snattle",
            "Gorigan",
            "Ardos",
            "Eldes"
        ]);
        const finale = xd.finale(133);
        // XD001, Shadow Lugia, then Greevil's six Shadow Pokémon, all snagged when beaten.
        expect(finale[0].snag).toEqual([249]);
        expect(finale[1].snag).toEqual([146, 112, 144, 103, 145, 128]);
    });

    test("Poké Spots: XD's own, and every other region's once the mechanic is unlocked", () => {
        expect(ZONES_BY_ID.rockPokeSpot.pokeSpot).toBe(true);
        expect(allZoneSpecies("rockPokeSpot")).toEqual(expect.arrayContaining([27, 207, 328]));
        const kantoSpots = ZONES_BY_ID.kantoPokeSpots;
        expect(kantoSpots.mechanic).toBe("pokeSpots");
        // They don't count toward earlier regions' Pokédex requirements.
        expect(speciesObtainableIn(["kanto", "orange", "sevii", "johto", "orre"]).has(328)).toBe(
            false
        );
        expect(speciesObtainableIn(["orreXd"]).has(328)).toBe(true);
        // The Cave Spot is also where Wanderer Miror B. turns up with a Shadow Voltorb.
        expect(allZoneSpecies("cavePokeSpot")).toContain(shadowOf(100));
    });

    test("XD's Hoenn Pokémon join the Pokédex, and Duking's trades want spot Pokémon", () => {
        const gen3 = POKEDEX_IDS.filter(id => id > 251).map(id => getSpecies(id).name);
        expect(gen3).toEqual(
            expect.arrayContaining([
                "Trapinch",
                "Aron",
                "Surskit",
                "Zangoose",
                "Salamence",
                "Ralts"
            ])
        );
        const duking = SPECIAL_ENCOUNTERS.flatMap(s =>
            s.kind === "trade" && s.id.startsWith("duking") ? [[s.wants, s.speciesId]] : []
        );
        expect(duking).toEqual([
            [328, 307],
            [283, 213],
            [194, 246]
        ]);
    });
});

describe("Johto anime", () => {
    test("every anime-only Johto place is explorable, with its one-of-a-kind Pokémon", () => {
        const anime = zonesIn("johto").filter(z => z.anime);
        expect(anime.length).toBe(58);
        // Anime places come after the game's own within each badge tier.
        const johto = zonesIn("johto").filter(z => z.mechanic == null);
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
        // The Red Gyarados is its own form; Union Cave's Lapras is a gift any day.
        expect(getSpecies(7022).baseSpecies).toBe(130);
        expect(johto.find(sp => sp.id === "unionCaveLapras")?.kind).toBe("gift");
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
            rockSmash: true,
            dive: true
        };
        for (const zone of ZONES) {
            // Pal Park is empty until a region's Pokémon migrate there, the Entralink towns
            // until residents move in.
            const extras =
                zone.palPark === true
                    ? { palPark: ["kanto" as const] }
                    : zone.entralink != null
                      ? { residents: [0, 5, 12] }
                      : {};
            const odds = encounterOdds(zone.id, gear, 3, extras);
            const total = [...odds.values()].reduce((a, b) => a + b, 0);
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
        // Later generations' methods: Feebas trades holding a Prism Scale (not Gen 3's Beauty).
        expect(friendship).not.toContain("349->350");
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
                "95->208:metalCoat",
                "366->367:deepSeaTooth",
                "366->368:deepSeaScale",
                "349->350:prismScale",
                "112->464:protector",
                "125->466:electirizer",
                "126->467:magmarizer",
                "233->474:dubiousDisc",
                "356->477:reaperCloth"
            ].sort()
        );
        held.forEach(h => expect(STONES[h.split(":")[1] as keyof typeof STONES]).toBeDefined());
        expect(STONES.linkCable.price).toBeGreaterThan(0);
        expect(STONES.sootheBell.price).toBeGreaterThan(0);
    });
});

describe("Sinnoh", () => {
    test("comes after Orre (XD) and a Pokédex of everything before it", () => {
        const order = REGION_LIST.map(r => r.id);
        expect(order.indexOf("sinnoh")).toBe(order.indexOf("orreXd") + 1);
        const sinnoh = REGIONS.sinnoh;
        expect(sinnoh.requires).toBe("orreXd");
        expect(sinnoh.requiresCompletePokedex).toBe(true);
        expect(sinnoh.starters).toEqual([387, 390, 393]);
        // Gen 4's evolutions of older Pokémon (Electivire) don't join earlier regions' Pokédex.
        const required = pokedexRequirement(sinnoh);
        expect([...required].filter(id => id > 386)).toEqual([]);
        expect(required.size).toBe(386);
        expect(pokedexRequirement(REGIONS.orreXd).has(466)).toBe(false);
    });

    test("Gyms, Elite Four and Champion Cynthia use Platinum's teams and Sinnoh's badges", () => {
        const sinnoh = REGIONS.sinnoh;
        expect(sinnoh.trials.map(g => g.name)).toEqual([
            "Roark",
            "Gardenia",
            "Fantina",
            "Maylene",
            "Crasher Wake",
            "Byron",
            "Candice",
            "Volkner"
        ]);
        expect(sinnoh.trials.map(g => g.badgeIcon)).toEqual(
            Array.from({ length: 8 }, (_, i) => `badges/${i + 25}.png`)
        );
        const finale = sinnoh.finale(387);
        expect(finale.map(t => t.name)).toEqual(["Aaron", "Bertha", "Flint", "Lucian", "Cynthia"]);
        expect(finale[4].team.map(p => p.id)).toEqual([442, 407, 468, 448, 350, 445]);
    });

    test("every Sinnoh Pokémon (#387-493) can be had there, and in the wild only there or the later Ranger regions", () => {
        const sinnoh = speciesObtainableIn(["sinnoh"]);
        for (let id = 387; id <= 493; id++) expect(sinnoh.has(id), String(id)).toBe(true);
        expect(POKEDEX_IDS.length).toBe(649);
        // Almia and Oblivia (the Ranger games after Sinnoh) have Gen 4 Pokémon in their Browsers,
        // and Unova's post-game has them too.
        const gen4 = ["sinnoh", "almia", "oblivia", "unova", "unova2"];
        for (const zone of ZONES.filter(z => !gen4.includes(z.region))) {
            for (const entries of Object.values(zonePools(zone.id))) {
                entries?.forEach(e => expect(e.id > 386 && e.id <= 493, zone.id).toBe(false));
            }
        }
        // East of Mt. Coronet, Shellos and Gastrodon are the East Sea forms.
        expect(allZoneSpecies("route213")).toContain(4204);
        expect(allZoneSpecies("route213")).not.toContain(422);
        expect(allZoneSpecies("route205")).toContain(422);
        // Feebas hides under Mt. Coronet too.
        expect(availableZoneSpecies("mtCoronetPeak", { oldRod: true })).toContain(349);
    });

    test("Gen 4 evolutions use later generations' easier methods", () => {
        const evolution = (from: number, into: number) =>
            getSpecies(from).evolutions.find(e => e.into === into);
        expect(evolution(82, 462)).toEqual({ into: 462, method: "stone", stone: "thunderStone" });
        expect(evolution(133, 470)?.stone).toBe("leafStone");
        expect(evolution(133, 471)?.stone).toBe("iceStone");
        expect(evolution(215, 461)?.stone).toBe("razorClaw");
        expect(evolution(190, 424)).toEqual({ into: 424, method: "level", level: 32 });
        // Only Combee ♀ becomes Vespiquen; Burmy's cloaks carry over to Wormadam.
        expect(evolution(415, 416)).toBeUndefined();
        expect(getSpecies(5415).evolutions.map(e => e.into)).toEqual([416]);
        expect(getSpecies(4200).evolutions.map(e => e.into)).toEqual([10004, 414]);
        expect(getSpecies(4204).evolutions.map(e => e.into)).toEqual([4205]);
        // Kirlia and Snorunt have no female form, so both branches stay open.
        expect(getSpecies(281).evolutions.map(e => e.into)).toEqual([282, 475]);
        expect(STONES.dawnStone.price).toBeGreaterThan(0);
    });

    test("Honey Trees: shared tables, and four Munchlax trees by Trainer ID", () => {
        expect(HONEY_TREES.length).toBe(21);
        for (const tree of HONEY_TREES) {
            if (tree.zoneId != null) expect(ZONES_BY_ID[tree.zoneId]?.region).toBe("sinnoh");
        }
        expect(HONEY_SPECIES).toEqual(expect.arrayContaining([412, 415, 420, 190, 214, 446]));
        const trees = munchlaxTrees(12345);
        expect(new Set(trees).size).toBe(MUNCHLAX_TREES);
        expect(munchlaxTrees(12345)).toEqual(trees);
        const rng = mulberry(3);
        let munchlax = 0;
        for (let i = 0; i < 5000; i++) {
            const plain = rollHoneyTree(false, rng);
            expect(plain.speciesId).not.toBe(446);
            expect(HONEY_SPECIES).toContain(
                getSpecies(plain.speciesId).baseSpecies ?? plain.speciesId
            );
            if (rollHoneyTree(true, rng).speciesId === 446) munchlax++;
        }
        expect(munchlax).toBeGreaterThan(20);
        expect(munchlax).toBeLessThan(100);
    });

    test("the Underground: walls of two to four treasures, fossils after the League", () => {
        expect(MECHANICS.underground.region).toBe("sinnoh");
        const rng = mulberry(5);
        for (let i = 0; i < 200; i++) {
            const found = digWall(2, false, rng);
            expect(found.length).toBeGreaterThanOrEqual(2);
            expect(found.length).toBeLessThanOrEqual(4);
        }
        const before = diggable(2, false).map(([item]) => item.id);
        expect(before).toContain("armor-fossil");
        expect(before).not.toContain("skull-fossil");
        expect(before).not.toContain("helix-fossil");
        expect(diggable(3, true).map(([item]) => item.id)).toEqual(
            expect.arrayContaining(["skull-fossil", "helix-fossil", "old-amber", "odd-keystone"])
        );
        expect(FOSSIL_SPECIES.sort((a, b) => a - b)).toEqual([138, 140, 142, 345, 347, 408, 410]);
        // Every Plate turns Arceus into a form of its type.
        for (const item of UNDERGROUND_ITEMS.filter(i => i.plate != null)) {
            expect(getSpecies(arceusForm(item.plate!)).types).toEqual([item.plate]);
        }
    });

    test("the Poké Radar: a Pokédex reward whose chain draws its species and its shinies", () => {
        expect(DEX_MILESTONES.find(m => m.name === "Poké Radar")?.caught).toBe(250);
        expect(radarShinyMultiplier(0)).toBe(1);
        expect(radarShinyMultiplier(MAX_RADAR_CHAIN + 10)).toBe(6);
        // Radar patches bring their own Pokémon to Sinnoh's grass.
        expect(SINNOH_EXTRAS.radar.route201.walk?.map(e => e.id)).toEqual(
            expect.arrayContaining([29, 32])
        );
        expect(availableZoneSpecies("route201", {}, { pokeRadar: true })).toContain(29);
        expect(availableZoneSpecies("route201", {})).not.toContain(29);
        // A chain on Bidoof makes it turn up at least half the time, and rolls agree with odds.
        const extras = { radarChain: { speciesId: 399, count: 10 } };
        const odds = encounterOdds("route201", {}, 0, extras);
        // (Bidoof ♀ counts toward the chain too.)
        const chance = (odds.get(399) ?? 0) + (odds.get(5399) ?? 0);
        expect(chance).toBeGreaterThan(RADAR_CHAIN_PULL);
        const rng = mulberry(11);
        let bidoof = 0;
        for (let i = 0; i < 20000; i++) {
            const id = rollEncounter("route201", {}, rng, 0, extras)?.speciesId;
            if (id === 399 || id === 5399) bidoof++;
        }
        expect(bidoof / 20000).toBeCloseTo(chance, 2);
    });

    test("Pal Park: Pokémon from regions cleared after Sinnoh, and their dual-slot Pokémon", () => {
        expect(availableZoneSpecies("palPark", {})).toEqual([]);
        const kanto = availableZoneSpecies("palPark", {}, { palPark: ["kanto"] });
        expect(kanto).toEqual(expect.arrayContaining([16, 19, 74, 129]));
        // Orre's Shadow Pokémon migrate as their species.
        const orre = availableZoneSpecies("palPark", {}, { palPark: ["orre"] });
        expect(orre.length).toBeGreaterThan(0);
        expect(orre.some(isShadow)).toBe(false);
        // A Hoenn game in the DS's second slot brings Hoenn Pokémon to Sinnoh's grass.
        const ruby = SINNOH_EXTRAS.dualSlot.ruby.route201.walk!.map(e => e.id);
        expect(availableZoneSpecies("route201", {}, { palPark: ["hoenn"] })).toEqual(
            expect.arrayContaining(ruby)
        );
        expect(availableZoneSpecies("route201", {}, { palPark: ["johto"] })).toEqual(
            availableZoneSpecies("route201", {})
        );
    });

    test("the Distortion World: Cyrus after the League, for Fame and Giratina's Origin Forme", () => {
        const world = SPECIAL_ENCOUNTERS.find(s => s.id === "distortionWorld");
        expect(world?.kind).toBe("boss");
        if (world?.kind !== "boss") return;
        expect(world.postGame).toBe(true);
        expect(world.keyItem).toBe("griseousOrb");
        expect(world.fameBonus).toBe(DISTORTION_FAME_BONUS);
        const origin = SPECIAL_ENCOUNTERS.find(s => s.id === "distortionGiratina");
        expect(origin?.kind === "legendary" && origin.keyItem).toBe("griseousOrb");
        expect(getSpecies(origin!.speciesId).baseSpecies).toBe(487);
        const fame = {
            regionFame: 24,
            dexCaught: 400,
            shinyCaught: 0,
            newSpecies: 2,
            firstClear: false
        };
        const ratio = fameGain({ ...fame, bonus: DISTORTION_FAME_BONUS }) / fameGain(fame);
        expect(ratio).toBeCloseTo(DISTORTION_FAME_BONUS, 1);
    });
});

describe("Fiore", () => {
    test("comes after Sinnoh, captures with the Capture Styler and calls its trials missions", () => {
        const order = REGION_LIST.map(r => r.id);
        expect(order.indexOf("fiore")).toBe(order.indexOf("sinnoh") + 1);
        const fiore = REGIONS.fiore;
        expect(fiore.requires).toBe("sinnoh");
        expect(fiore.requiresCompletePokedex).toBe(true);
        expect(fiore.styler).toBe(true);
        expect(fiore.trialNoun).toBe("missions");
        expect(fiore.starters).toEqual([311, 312]);
        expect(fiore.trials.map(m => m.badge)).toEqual(FIORE_MISSIONS.map(m => m.badge));
        expect(fiore.trials).toHaveLength(8);
        expect(fiore.finale(311).map(t => t.name)).toEqual([
            "Tiffany, Clyde & Garret",
            "Billy",
            "Gordor"
        ]);
        // Gordor's Power Styler holds the three legendary beasts.
        expect(fiore.finale(311)[2].team.map(p => p.id)).toEqual([243, 245, 244]);
        expect(MECHANICS.pokeAssist.region).toBe("fiore");
    });

    test("its wild Pokémon are from Pokémon Ranger's Browser, all released", () => {
        const zones = zonesIn("fiore");
        expect(zones.length).toBe(FIORE_ZONES.length);
        for (const zone of zones) {
            const species = allZoneSpecies(zone.id);
            expect(species.length, zone.id).toBeGreaterThan(0);
            species.forEach(id =>
                expect(getSpecies(id).baseSpecies ?? id).toBeLessThanOrEqual(493)
            );
        }
        const legends = SPECIAL_ENCOUNTERS.filter(
            s => s.region === "fiore" && s.kind === "legendary"
        );
        expect(legends.map(s => s.speciesId)).toContain(244);
        legends.forEach(
            s => s.kind === "legendary" && expect(ZONES_BY_ID[s.zoneId]?.region, s.id).toBe("fiore")
        );
    });

    test("the Capture Styler outdoes a Poké Ball, and Poké Assist helps against weak types", () => {
        expect(STYLER_POWER).toBeGreaterThan(BALLS.pokeBall.catchMultiplier);
        expect(catchChance(45, STYLER_POWER, 1)).toBeGreaterThan(
            catchChance(45, BALLS.pokeBall.catchMultiplier, 1)
        );
        expect(POKE_ASSIST_BONUS).toBeGreaterThan(1);
    });
});

describe("Almia", () => {
    test("comes after Fiore, with the Capture Styler and Team Dim Sun's missions", () => {
        const order = REGION_LIST.map(r => r.id);
        expect(order.indexOf("almia")).toBe(order.indexOf("fiore") + 1);
        const almia = REGIONS.almia;
        expect(almia.requires).toBe("fiore");
        expect(almia.requiresCompletePokedex).toBe(true);
        expect(almia.styler).toBe(true);
        expect(almia.trialNoun).toBe("missions");
        // Shadows of Almia's first partners: Starly, Pachirisu and Munchlax.
        expect(almia.starters).toEqual([396, 417, 446]);
        expect(almia.trials.map(m => m.badge)).toEqual(ALMIA_MISSIONS.map(m => m.badge));
        expect(almia.trials).toHaveLength(8);
        const finale = almia.finale(396);
        expect(finale.map(t => t.name)).toEqual([
            "Heath & Ice",
            "Heath, Lavana & Ice",
            "Blake Hall"
        ]);
        // Blake Hall's Dusknoir, then Darkrai.
        expect(finale[2].team.map(p => p.id)).toEqual([477, 491]);
    });

    test("its wild Pokémon are from the Browser, all released, its legends in Almia", () => {
        expect(zonesIn("almia").length).toBe(ALMIA_ZONES.length);
        for (const zone of zonesIn("almia")) {
            const species = allZoneSpecies(zone.id);
            expect(species.length, zone.id).toBeGreaterThan(0);
            species.forEach(id =>
                expect(getSpecies(id).baseSpecies ?? id).toBeLessThanOrEqual(493)
            );
        }
        const legends = SPECIAL_ENCOUNTERS.filter(
            s => s.region === "almia" && s.kind === "legendary"
        );
        expect(legends.map(s => s.speciesId)).toEqual(
            expect.arrayContaining([442, 485, 488, 491, 377, 378, 379, 486])
        );
        legends.forEach(
            s => s.kind === "legendary" && expect(ZONES_BY_ID[s.zoneId]?.region, s.id).toBe("almia")
        );
    });

    test("Field Abilities: the Browser's, then by type and stage; obstacles need enough power", () => {
        expect(fieldAbilityOf(399)).toEqual(["crush", 1]); // Bidoof
        expect(fieldAbilityOf(475)).toEqual(["cut", 5]); // Gallade
        // Not in Almia's Browser: Bulbasaur (Grass, first stage) and Venusaur.
        expect(fieldAbilityOf(1)).toEqual(["cut", 1]);
        expect(fieldAbilityOf(3)[1]).toBeGreaterThanOrEqual(3);
        // Bidoof (Crush ×1), Golbat (Crush ×2) and Gallade: the strongest of each ability.
        expect(fieldPowers([399, 42, 475])).toEqual({ crush: 2, cut: 5 });

        // Torterra hides behind Tackle ×4 in Vien Forest.
        const torterra = (extras: Parameters<typeof availableZoneSpecies>[2]) =>
            availableZoneSpecies("vienForest", {}, extras).includes(389);
        expect(allZoneSpecies("vienForest")).toContain(389);
        expect(torterra({})).toBe(false);
        expect(torterra({ fieldPowers: { tackle: 3 } })).toBe(false);
        expect(torterra({ fieldPowers: { tackle: 4 } })).toBe(true);
        // The Regis wait behind obstacles that need ×5.
        const regis = SPECIAL_ENCOUNTERS.filter(
            s => s.region === "almia" && [377, 378, 379].includes(s.speciesId)
        );
        expect(regis).toHaveLength(3);
        regis.forEach(s => expect(s.kind === "legendary" && s.fieldNeed?.power).toBe(5));
    });
});

describe("Oblivia", () => {
    test("comes after Almia, with the Pokémon Pinchers' missions and the Sky Fortress", () => {
        const order = REGION_LIST.map(r => r.id);
        expect(order.indexOf("oblivia")).toBe(order.indexOf("almia") + 1);
        const oblivia = REGIONS.oblivia;
        expect(oblivia.requires).toBe("almia");
        expect(oblivia.requiresCompletePokedex).toBe(true);
        expect(oblivia.styler).toBe(true);
        expect(oblivia.trials.map(m => m.badge)).toEqual(OBLIVIA_MISSIONS.map(m => m.badge));
        expect(oblivia.trials).toHaveLength(8);
        const finale = oblivia.finale(172);
        expect(finale.map(t => t.name)).toEqual([
            "Kasa",
            "Hocus",
            "Arley",
            'Ed "the Thinker"',
            "Purple Eyes"
        ]);
        expect(finale[3].team.map(p => p.id)).toEqual([150]);
        expect(MECHANICS.rangerSigns.region).toBe("oblivia");
    });

    test("its wild Pokémon are from the Browser; its legends give Ranger Signs", () => {
        expect(zonesIn("oblivia").length).toBe(OBLIVIA_ZONES.length);
        for (const zone of zonesIn("oblivia")) {
            const species = allZoneSpecies(zone.id);
            expect(species.length, zone.id).toBeGreaterThan(0);
            species.forEach(id =>
                expect(getSpecies(id).baseSpecies ?? id).toBeLessThanOrEqual(493)
            );
        }
        const legends = SPECIAL_ENCOUNTERS.filter(
            s => s.region === "oblivia" && s.kind === "legendary"
        );
        legends.forEach(
            s =>
                s.kind === "legendary" &&
                expect(ZONES_BY_ID[s.zoneId]?.region, s.id).toBe("oblivia")
        );
        const signs = legends.flatMap(s =>
            s.kind === "legendary" && s.rangerSign === true ? [s.speciesId] : []
        );
        // The legendary beasts (for Roar), Latias and Latios, Ho-Oh, the birds and Lugia.
        expect(signs).toEqual(
            expect.arrayContaining([...ROAR_SIGNS, 380, 381, 250, 144, 145, 146, 249])
        );
    });

    test("hidden Pokémon need a beast's Roar; obstacles use Guardian Signs' Field Abilities", () => {
        // Turtwig hides in a bush on Hinder Cape until a legendary beast roars.
        const turtwig = (extras: Parameters<typeof availableZoneSpecies>[2]) =>
            availableZoneSpecies("hinderCape", {}, extras).includes(387);
        expect(turtwig({})).toBe(false);
        expect(turtwig({ fieldPowers: { roar: 1 } })).toBe(true);
        // Sunflora hides as a sunflower that needs Flame (Burn) ×2.
        const sunflora = (extras: Parameters<typeof availableZoneSpecies>[2]) =>
            availableZoneSpecies("milondaRoad", {}, extras).includes(192);
        expect(sunflora({ fieldPowers: { burn: 1 } })).toBe(false);
        expect(sunflora({ fieldPowers: { burn: 2 } })).toBe(true);
        // Guardian Signs' Slash is Cut: Pidgey isn't in Almia's Browser.
        expect(fieldAbilityOf(16)).toEqual(["cut", 1]);
    });
});

describe("Fame upgrades", () => {
    test("the Day Care's and Contests' upgrades wait for their mechanics", () => {
        const gated = HOF_UPGRADE_LIST.filter(u => u.mechanic != null);
        expect(gated.map(u => [u.id, u.mechanic])).toEqual([
            ["flameBody", "breeding"],
            ["masudaMethod", "breeding"],
            ["breederLineage", "breeding"],
            ["pokeblockKit", "contests"],
            ["contestStar", "contests"],
            ["encounterPower", "phenomena"],
            ["capturePower", "criticalCapture"],
            ["seasonPower", "seasons"],
            ["grottoPower", "hiddenGrottoes"]
        ]);
        gated.forEach(u => expect(MECHANICS[u.mechanic!]).toBeDefined());
    });
});

describe("Unova", () => {
    test("both Unova journeys follow Oblivia, with Gen 5's species", () => {
        const order = REGION_LIST.map(r => r.id);
        expect(order.slice(-3)).toEqual(["oblivia", "unova", "unova2"]);
        expect(REGIONS.unova.requires).toBe("oblivia");
        expect(REGIONS.unova2.requires).toBe("unova");
        for (const region of [REGIONS.unova, REGIONS.unova2]) {
            expect(region.requiresCompletePokedex).toBe(true);
            expect(region.newestSpecies).toBe(649);
            expect(region.trials).toHaveLength(8);
            expect(region.levelCaps).toHaveLength(10);
        }
        expect(REGIONS.unova.trials).toBe(UNOVA_GYMS);
        expect(REGIONS.unova2.trials).toBe(UNOVA2_GYMS);
        // PokeAPI's Unova badges: Black and White's from 33, Black 2 and White 2's Toxic and Wave.
        expect(UNOVA_GYMS.map(g => g.badgeIcon)).toEqual(
            [33, 34, 36, 37, 38, 39, 40, 41].map(n => `badges/${n}.png`)
        );
        expect(UNOVA2_GYMS.map(g => g.badgeIcon)).toEqual(
            [34, 35, 36, 37, 38, 39, 41, 42].map(n => `badges/${n}.png`)
        );
        // Every Gen 5 species can be had in one Unova or the other, and the Pokédex has them all.
        const unova = speciesObtainableIn(["unova", "unova2"]);
        for (let id = 494; id <= 649; id++) expect(unova.has(id), String(id)).toBe(true);
        expect(POKEDEX_SIZE).toBe(649);
        // Black and White's grass has only new Pokémon until the League (the Super Rod's older
        // ones come at the end).
        for (const zone of UNOVA_ZONES.filter(z => !z.postGame && z.id !== "relicCastle")) {
            zonePools(zone.id).walk?.forEach(e =>
                expect(e.id > 493, `${zone.id} ${e.id}`).toBe(true)
            );
        }
        // Zone ids never collide between the two journeys.
        const ids = [...UNOVA_ZONES, ...UNOVA2_ZONES].map(z => z.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    test("Striaton's Leader is the brother who beats your starter", () => {
        const striaton = UNOVA_GYMS[0];
        expect(trialFor(striaton, 495).name).toBe("Chili");
        expect(trialFor(striaton, 498).name).toBe("Cress");
        expect(trialFor(striaton, 501).name).toBe("Cilan");
        expect(trialFor(striaton, 495).team.map(p => p.id)).toEqual([506, 513]);
        expect(trialFor(striaton, 0)).toBe(striaton);
        // The Dreamyard's gift is the monkey that beats your starter, too.
        const gift = SPECIAL_ENCOUNTERS.find(s => s.id === "dreamyardMonkey");
        expect(gift?.kind === "gift" ? gift.byStarter : undefined).toEqual({
            495: 515,
            498: 511,
            501: 513
        });
        expect(specialSpecies(gift!).sort()).toEqual([511, 513, 515]);
    });

    test("the League ends with N and Ghetsis, and Iris in Black 2 and White 2", () => {
        expect(REGIONS.unova.finale(495).map(t => t.name)).toEqual([
            "Shauntal",
            "Grimsley",
            "Caitlin",
            "Marshal",
            "N",
            "Ghetsis"
        ]);
        expect(
            REGIONS.unova2
                .finale(495)
                .map(t => t.name)
                .slice(-1)
        ).toEqual(["Iris"]);
        expect(REGIONS.unova.finale(495)[4].team[0].id).toBe(644);
    });

    test("the seasons turn and change Unova's tables", () => {
        expect([0, 149, 150, 300, 450, 600].map(seasonAt)).toEqual([
            "spring",
            "spring",
            "summer",
            "autumn",
            "winter",
            "spring"
        ]);
        // Twist Mountain fills with Cryogonal in winter.
        const cryogonal = (season: "spring" | "winter") =>
            encounterOdds("twistMountain", {}, 0, { season }).get(615) ?? 0;
        expect(cryogonal("winter")).toBeGreaterThan(cryogonal("spring") * 3);
        // Deerling wears the season's coat.
        expect(seasonForm(585, "summer")).toBe(4301);
        expect(seasonForm(585, "spring")).toBe(585);
        expect(encounterOdds("unovaRoute6", {}, 0, { season: "winter" }).has(585)).toBe(false);
        expect(encounterOdds("unovaRoute6", {}, 0, { season: "winter" }).get(4303)).toBeGreaterThan(
            0
        );
        // Elsewhere, Deerling wander into the grass once the Seasons are on.
        expect(encounterOdds("route1", {}).has(585)).toBe(false);
        expect(encounterOdds("route1", {}, 0, { season: "autumn" }).get(4302)).toBeGreaterThan(0);
    });

    test("phenomena bring out rarer Pokémon, Audino and Unova's own tables", () => {
        const plain = activePools("route1", {});
        const shaking = activePools("route1", {}, { phenomena: true });
        expect(shaking.map(p => p.kind)).toEqual([...plain.map(p => p.kind), "phenomenon"]);
        const total = shaking.reduce((sum, p) => sum + p.share, 0);
        expect(shaking[shaking.length - 1].share / total).toBeCloseTo(PHENOMENON_CHANCE);
        expect(shaking[shaking.length - 1].entries.map(e => e.id)).toContain(AUDINO);
        // In Unova, shaking grass has its own table: Audino on Route 1, the monkeys in Pinwheel.
        expect(UNOVA_EXTRAS.phenomena.pinwheelForest.shakingGrass?.map(e => e.id)).toEqual(
            expect.arrayContaining([511, 513, 515])
        );
        // Bridges have only flying shadows.
        expect(allZoneSpecies("driftveilDrawbridge")).toEqual([580]);
        // No phenomena in Orre's trainer battles.
        const orre = ZONES.find(z => z.trainerBattles)!;
        expect(
            activePools(orre.id, {}, { phenomena: true }).some(p => p.kind === "phenomenon")
        ).toBe(false);
    });

    test("critical captures grow with the Pokédex", () => {
        expect([0, 31, 151, 301, 451, 601].map(criticalCaptureFactor)).toEqual([
            0, 0.5, 1, 1.5, 2, 2.5
        ]);
        expect(criticalCaptureChance(0.6, 500)).toBeCloseTo(0.2);
        expect(criticalCaptureChance(0.9, 649, 2)).toBe(0.75);
    });

    test("Hidden Grottoes have their tables, and elsewhere a missing species", () => {
        expect(grottoPool("b2w2Route2", [], () => true)).toBe(UNOVA_EXTRAS.grottoes.b2w2Route2);
        const entries = [
            { id: 16, weight: 1, minLevel: 3, maxLevel: 5 },
            { id: 19, weight: 1, minLevel: 3, maxLevel: 5 }
        ];
        expect(grottoPool("route1", entries, id => id === 19).map(e => e.id)).toEqual([19]);
        expect(grottoPool("route1", entries, () => false)).toEqual(entries);
    });

    test("the World Tournament waits for the regions it brings Leaders from", () => {
        const pwt = SPECIAL_ENCOUNTERS.filter(s => s.id.startsWith("pwt"));
        expect(pwt.map(s => s.id)).toEqual([
            "pwtUnovaLeaders",
            "pwtKantoLeaders",
            "pwtJohtoLeaders",
            "pwtHoennLeaders",
            "pwtSinnohLeaders",
            "pwtBlackWhiteLeaders",
            "pwtChampions"
        ]);
        for (const special of pwt) {
            expect(special.kind).toBe("boss");
            expect(special.region).toBe("unova2");
            expect(special.postGame).toBe(true);
        }
        const champions = pwt[pwt.length - 1];
        expect(champions.kind === "boss" ? champions.requiresCleared : []).toHaveLength(5);
        expect(champions.kind === "boss" ? champions.fameBonus : 1).toBe(1.25);
    });
});

describe("Pokédex rewards", () => {
    test("go up to the full Pokédex, in order", () => {
        const counts = DEX_MILESTONES.map(m => m.caught);
        expect([...counts].sort((a, b) => a - b)).toEqual(counts);
        expect(Math.max(...counts)).toBe(POKEDEX_SIZE);
        expect(new Set(DEX_MILESTONES.map(m => m.name)).size).toBe(DEX_MILESTONES.length);
        // The new ones raise their bonuses.
        const before = computeBonuses({
            dexCaught: 499,
            shinyCaught: 0,
            mart: {},
            hof: {},
            keyItems: {}
        });
        const after = computeBonuses({
            dexCaught: 649,
            shinyCaught: 0,
            mart: {},
            hof: {},
            keyItems: {}
        });
        expect(after.damage / before.damage).toBeGreaterThan(1.4);
        expect(
            fameGain({
                regionFame: 100,
                dexCaught: 649,
                shinyCaught: 0,
                newSpecies: 0,
                firstClear: false
            })
        ).toBeGreaterThan(
            fameGain({
                regionFame: 100,
                dexCaught: 499,
                shinyCaught: 0,
                newSpecies: 0,
                firstClear: false
            })
        );
    });
});

describe("medals", () => {
    const context = (overrides: Partial<MedalContext> = {}): MedalContext => ({
        stats: {},
        dexCaught: 0,
        shinySpecies: 0,
        variantsCaught: 0,
        clears: {},
        mechanicsUnlocked: 0,
        platesFound: 0,
        rangerSigns: 0,
        ribbons: 0,
        journeys: [],
        ...overrides
    });

    test("every medal has a unique id, rising goals and a goal in its text", () => {
        expect(new Set(MEDALS.map(m => m.id)).size).toBe(MEDALS.length);
        for (const medal of MEDALS) {
            const goals = medal.lowerIsBetter ? [...medal.goals].reverse() : medal.goals;
            expect(
                [...goals].sort((a, b) => a - b),
                medal.id
            ).toEqual(goals);
            expect(medal.goals.length === 1 || medal.description.includes("{n}"), medal.id).toBe(
                true
            );
        }
        // One medal for each region and each challenge.
        expect(MEDALS.filter(m => m.id.startsWith("clear_"))).toHaveLength(REGION_LIST.length);
        expect(MEDALS.filter(m => m.id.startsWith("challenge_"))).toHaveLength(
            CHALLENGE_LIST.length
        );
    });

    test("tiers are earned once each, and pay Fame", () => {
        const pokedex = MEDALS.find(m => m.id === "pokedex")!;
        expect(tierReached(pokedex, 49)).toBe(0);
        expect(tierReached(pokedex, 151)).toBe(2);
        const found = newMedals(context({ dexCaught: 151 }), {});
        expect(found.filter(f => f.medal.id === "pokedex").map(f => f.tier)).toEqual([1, 2]);
        expect(
            newMedals(context({ dexCaught: 151 }), { pokedex: 2 }).some(
                f => f.medal.id === "pokedex"
            )
        ).toBe(false);
        expect(tierFame(pokedex, 1)).toBeLessThan(tierFame(pokedex, 4));
        // The fastest clear is a record where less is better.
        const fastest = MEDALS.find(m => m.id === "fastestClear")!;
        expect(tierReached(fastest, 2 * 3600)).toBe(3);
        expect(tierReached(fastest, Infinity)).toBe(0);
        // A region's first clear is a single Gold medal.
        const kanto = MEDALS.find(m => m.id === "clear_kanto")!;
        expect(newMedals(context({ clears: { kanto: 1 } }), {}).some(f => f.medal === kanto)).toBe(
            true
        );
    });

    test("Medal Rally ranks add Fame", () => {
        expect(medalRank(0)).toBe("Newcomer");
        expect(medalRank(150)).toBe("Legend");
        expect(rankFameMultiplier(0)).toBe(1);
        expect(rankFameMultiplier(10)).toBeCloseTo(1.05);
        expect(rankFameMultiplier(1000)).toBeCloseTo(1.25);
    });
});

describe("challenges", () => {
    test("multiply Fame, the Time Trial only in time", () => {
        expect(challengeFame([], 0)).toBe(1);
        expect(challengeFame(["challengeMode", "trio"], 0)).toBeCloseTo(2.1);
        expect(challengeFame(["timeTrial"], TIME_TRIAL_SECONDS)).toBe(1.5);
        expect(challengeFame(["timeTrial"], TIME_TRIAL_SECONDS + 1)).toBe(1);
        expect(challengesMet(["trio", "timeTrial"], TIME_TRIAL_SECONDS + 1)).toEqual(["trio"]);
        expect(
            fameGain({
                regionFame: 100,
                dexCaught: 0,
                shinyCaught: 0,
                newSpecies: 0,
                firstClear: false,
                challenge: 2
            })
        ).toBe(200);
    });

    test("limit the party", () => {
        expect(partySize([])).toBe(6);
        expect(partySize(["trio"])).toBe(3);
        const bulbasaur = getSpecies(1);
        // Specialist: sharing a type with the starter (Bulbasaur is Grass/Poison).
        expect(partyAllowed(getSpecies(43), ["specialist"], bulbasaur)).toBe(true); // Oddish
        expect(partyAllowed(getSpecies(4), ["specialist"], bulbasaur)).toBe(false); // Charmander
        expect(partyAllowed(getSpecies(4), [], bulbasaur)).toBe(true);
        // Grounded: no legendaries.
        expect(partyAllowed(getSpecies(150), ["grounded"], bulbasaur)).toBe(false);
        expect(partyAllowed(getSpecies(150), [], bulbasaur)).toBe(true);
    });
});

describe("Team Strategist's bench training", () => {
    const levels: Record<number, number> = {
        1: 50,
        2: 50,
        3: 50,
        4: 30,
        5: 50,
        6: 20,
        7: 10,
        8: 12,
        9: 8
    };
    const options = { cap: 50, slots: 2, level: (id: number) => levels[id] };

    test("gives the places of the weakest members at the cap to Pokémon below it", () => {
        // 5 and 3 are the weakest at the cap; 1 stays (the top member); 4 and 6 are still growing.
        expect(benchTeam([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6, 8, 7, 9], options)).toEqual([
            1, 2, 4, 6, 8, 7
        ]);
    });

    test("keeps the top member and the team when nobody is at the cap", () => {
        expect(benchTeam([4, 6, 7], [4, 6, 7, 8], options)).toEqual([4, 6, 7]);
        expect(benchTeam([1, 4], [1, 4, 8], options)).toEqual([1, 4]);
    });

    test("puts new faces first and keeps one form per Hall of Fame entry", () => {
        const team = benchTeam([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6, 8, 7, 9], {
            ...options,
            first: id => id === 9,
            entry: id => (id === 7 ? 8 : id)
        });
        expect(team).toEqual([1, 2, 4, 6, 9, 8]);
    });

    test("never leaves a place empty when there are fewer trainees", () => {
        expect(benchTeam([1, 2, 3], [1, 2, 3, 7], options)).toEqual([1, 2, 7]);
    });
});

describe("Fame upgrades", () => {
    test("Mastery continues past the max at rising prices", () => {
        const scout = HOF_UPGRADES.scout;
        expect(upgradeTopLevel(scout)).toBe(15);
        expect(upgradeCost(scout, 4)).toBe(48);
        const first = upgradeCost(scout, 5);
        expect(first).toBe(96);
        expect(upgradeCost(scout, 6)).toBe(Math.round(96 * MASTERY_COST_GROWTH));
        expect(upgradeSpent(scout, 2)).toBe(3 + 6);
    });

    test("levels up to the max keep their old effect; Mastery adds a smaller one", () => {
        expect(FAME_EFFECTS.scout(5)).toBeCloseTo(0.5);
        expect(FAME_EFFECTS.scout(6)).toBeCloseTo(0.475);
        expect(FAME_EFFECTS.catcher(10)).toBeCloseTo(2);
        expect(FAME_EFFECTS.catcher(12)).toBeCloseTo(2.1);
        expect(FAME_EFFECTS.shinyHunter(10)).toBeCloseTo(6);
        expect(FAME_EFFECTS.masudaMethod(6)).toBeCloseTo(4);
        expect(FAME_EFFECTS.headStart(3)).toBe(15);
        expect(FAME_EFFECTS.martPrice(6)).toBeCloseTo(0.7);
    });

    test("every upgrade describes its effect at every level", () => {
        for (const upgrade of HOF_UPGRADE_LIST) {
            for (let level = 1; level <= upgradeTopLevel(upgrade); level++) {
                const text = (upgrade as { effect?: (n: number) => string }).effect?.(level);
                expect(text, upgrade.id).toBeDefined();
                expect(text, upgrade.id).not.toMatch(/NaN|undefined|Infinity/);
            }
        }
    });

    test("reductions never reach zero, even fully mastered", () => {
        for (const id of ["scout", "flameBody", "grottoPower"] as const) {
            const top = upgradeTopLevel(HOF_UPGRADES[id]);
            expect(FAME_EFFECTS[id](top)).toBeGreaterThan(0.25);
        }
        expect(FAME_EFFECTS.contestTime(upgradeTopLevel(HOF_UPGRADES.contestStar))).toBeGreaterThan(
            0.3
        );
    });

    test("the Pokémon Fan Club multiplies Hall of Fame Fame", () => {
        const base = {
            regionFame: 100,
            dexCaught: 0,
            shinyCaught: 0,
            newSpecies: 0,
            firstClear: false
        };
        expect(fameGain({ ...base, fanClub: 10 })).toBe(Math.floor(fameGain(base) * 1.3));
    });
});

describe("saved state", () => {
    test("text and object persistents opt out of Profectus's NaN check", () => {
        // Profectus NaN-checks persistents by default and reads any string as NaN, which stops
        // autosaving (v2.11.1's Travel Planner mode did this). Only numbers may keep the check.
        const files = [
            "src/data/projEntry.tsx",
            ...readdirSync("src/data/layers").map(f => `src/data/layers/${f}`)
        ];
        for (const file of files) {
            const source = readFileSync(file, "utf8");
            for (const match of source.matchAll(
                /persistent<([^>]+(?:>[^>(]*)?)>\(([\s\S]*?)\);/g
            )) {
                const [, type, args] = match;
                if (type === "number") continue;
                expect(
                    args.trim().endsWith("false") || /^\s*(true|false)\s*$/.test(args),
                    `${file}: persistent<${type}>(${args.trim().slice(0, 40)})`
                ).toBe(true);
            }
        }
    });
});

describe("the Entralink (Black City and White Forest)", () => {
    test("residents bring White Forest's Pokémon and Black City's trainers", () => {
        expect(RESIDENTS.length).toBe(29);
        const residents = [0, 13, 28];
        const forest = activePools("whiteForest", {}, { residents });
        expect(forest.find(p => p.kind === "walk")?.entries.map(e => e.id)).toEqual([16, 187, 440]);
        expect(forest.find(p => p.kind === "walk")?.entries.every(e => e.minLevel === 5)).toBe(true);
        // Black City's trainers use the final forms: Pidgeot, Jumpluff, Blissey.
        const city = activePools("blackCity", {}, { residents });
        expect(city.find(p => p.kind === "walk")?.entries.map(e => e.id)).toEqual([18, 189, 242]);
        expect(catchableIn("blackCity", 18)).toBe(false);
        // Nobody lives there yet: nothing to meet, and nothing for the Pokédex to ask for.
        expect(activePools("whiteForest", {}, {}).flatMap(p => p.entries)).toEqual([]);
    });

    test("residents arrive up to ten, then the longest-staying moves out", () => {
        let town: number[] = [];
        for (let i = 0; i < MAX_RESIDENTS; i++) town = arrive(town, i * 7);
        expect(new Set(town).size).toBe(MAX_RESIDENTS);
        const next = arrive(town, 3);
        expect(next.length).toBe(MAX_RESIDENTS);
        expect(next).not.toContain(town[0]);
        expect(next.slice(0, -1)).toEqual(town.slice(1));
    });

    test("the Black Tower and White Treehollow split the residents' final forms", () => {
        const tower = towerSpecies("blackTower");
        const hollow = towerSpecies("whiteTreehollow");
        expect(tower.length + hollow.length).toBe(
            new Set(RESIDENTS.map(r => finalForm(r.forest))).size
        );
        expect(tower.some(id => hollow.includes(id))).toBe(false);
        expect(tower.length).toBeGreaterThanOrEqual(6);
        expect(hollow.length).toBeGreaterThanOrEqual(6);
        for (const id of ["blackTowerBoss", "whiteTreehollowBoss"]) {
            const boss = SPECIAL_ENCOUNTERS.find(s => s.id === id);
            expect(boss?.kind).toBe("boss");
            expect(boss?.region).toBe("unova2");
        }
    });
});

/**
 * Headless balance simulator. Plays a campaign of journeys (each from starter to the region's
 * finale) with a sensible strategy, carrying the Pokédex and Fame upgrades between journeys
 * like the real game, and prints when each milestone is reached.
 * Run it after touching anything in src/game/pokemon/balance.ts, trainers.ts, or a region file.
 *
 * Usage: npx tsx scripts/simulateProgression.ts [regions=kanto,kanto,orange,sevii] [seed=1]
 *   Each region may name a starter, e.g. "kanto:4,orange:25".
 */
import { readFileSync, writeFileSync } from "node:fs";
import type { BonusInputs, HofUpgradeId, PartyBattler } from "../src/game/pokemon/balance";
import {
    battleXp,
    catchChance,
    computeBonuses,
    effortMultiplier,
    HEART_BATTLES,
    FAME_EFFECTS,
    fameGain,
    POKE_ASSIST_BONUS,
    STYLER_POWER,
    HOF_UPGRADE_LIST,
    MART_UPGRADE_LIST,
    memberDps,
    memberMultiplier,
    moneyYield,
    simulateTrainerBattle,
    trainerTeam,
    upgradeCost,
    upgradeTopLevel,
    wildDps
} from "../src/game/pokemon/balance";
import {
    getSpecies,
    hallOfFameId,
    isShadow,
    shadowOf,
    typeEffectiveness
} from "../src/game/pokemon/data";
import type { BallId, KeyItemId } from "../src/game/pokemon/items";
import { AUTO_BALL_ORDER, BALLS, STONES } from "../src/game/pokemon/items";
import type { RegionDefinition } from "../src/game/pokemon/regions";
import { levelCap, REGIONS, strengthMultiplier, withStrength } from "../src/game/pokemon/regions";
import { fieldPowers } from "../src/game/pokemon/almia";
import { MECHANICS } from "../src/game/pokemon/mechanics";
import { SPECIAL_ENCOUNTERS } from "../src/game/pokemon/specials";
import { levelForXp, maxHp, xpForLevel, xpYield } from "../src/game/pokemon/stats";
import type { TrainerDefinition } from "../src/game/pokemon/trainers";
import { trialFor } from "../src/game/pokemon/trainers";
import { criticalCaptureChance, SEASON_BATTLES, seasonAt } from "../src/game/pokemon/unova";
import type { MedalStat } from "../src/game/pokemon/medals";
import { newMedals, rankFameMultiplier, tierFame } from "../src/game/pokemon/medals";
import { MECHANIC_LIST } from "../src/game/pokemon/mechanics";
import { DEX_SIZE } from "../src/game/pokemon/data";
import { GROTTO_BATTLES, grottoPool } from "../src/game/pokemon/unova2";
import type { RegionId } from "../src/game/pokemon/zones";
import {
    activePools,
    availableZoneSpecies,
    catchableIn,
    rollEncounter,
    zonesIn
} from "../src/game/pokemon/zones";

interface SavedCampaign {
    dex: [number, number][];
    fame: number;
    hof: Partial<Record<HofUpgradeId, number>>;
    enshrined: string[];
    clears: Partial<Record<RegionId, number>>;
    totalTime: number;
    doublesUnlocked: boolean;
    sinnohEvolutions: boolean;
    pokeAssistUnlocked: boolean;
    unovaMechanics: Record<string, boolean>;
    seed: number;
    journeys: number;
    medalStats: Partial<Record<MedalStat, number>>;
    medalsEarned: Partial<Record<string, number>>;
    medalFame: number;
    journeyTimes: number[];
}

const plan = (process.argv[2] ?? "kanto,kanto,orange,sevii").split(",").map(part => {
    const [region, starter] = part.split(":");
    return { region: region as RegionId, starter: starter != null ? Number(starter) : undefined };
});
let seed = Number(process.argv[3] ?? 1);
function rng() {
    // mulberry32
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Tuning knobs for balance experiments (defaults leave the game data untouched):
//   XPF=0.5 MF=0.5     multiply experience / Pokédollars from wild battles
//   KANTO_GYMS=1,1.2,… override Kanto Gym strengths; KANTO_E4=2.6 KANTO_CHAMP=3
const XPF = Number(process.env.XPF ?? 1);
//   MEDAL_FAME=0.5     multiply the Fame medals pay (0 leaves medals out)
const MEDAL_FAME = Number(process.env.MEDAL_FAME ?? 1);
const MF = Number(process.env.MF ?? 1);
if (process.env.KANTO_GYMS != null) {
    process.env.KANTO_GYMS.split(",").forEach((v, i) => {
        REGIONS.kanto.trials[i].statMultiplier = Number(v);
    });
}
if (process.env.KANTO_E4 != null || process.env.KANTO_CHAMP != null) {
    const original = REGIONS.kanto.finale;
    REGIONS.kanto.finale = starter =>
        original(starter).map((t, i, all) => ({
            ...t,
            statMultiplier:
                i === all.length - 1
                    ? Number(process.env.KANTO_CHAMP ?? t.statMultiplier)
                    : Number(process.env.KANTO_E4 ?? t.statMultiplier)
        }));
}

//   GYMS_johto=1,1.6,… override a region's trial strengths one by one
for (const region of Object.values(REGIONS)) {
    process.env[`GYMS_${region.id}`]?.split(",").forEach((v, i) => {
        if (region.trials[i] != null) region.trials[i].statMultiplier = Number(v);
    });
}

//   SCALE_orange=1.5   multiply every trial and finale strength in a region
//   FINALE_orange=1.2  override the finale's multiplier separately
for (const region of Object.values(REGIONS)) {
    const scale = Number(process.env[`SCALE_${region.id}`] ?? 1);
    const finaleScale = Number(process.env[`FINALE_${region.id}`] ?? scale);
    if (scale === 1 && finaleScale === 1) continue;
    region.trials.forEach(t => (t.statMultiplier *= scale));
    const original = region.finale;
    region.finale = starter =>
        original(starter).map(t => ({ ...t, statMultiplier: t.statMultiplier * finaleScale }));
}

// Permanent state, kept across journeys.
const dex = new Map<number, number>(); // species or form → times caught
/** Regular species caught, as the Pokédex counts them (a form fills in its species). */
function dexCaught(): number {
    return new Set([...dex.keys()].map(id => getSpecies(id).baseSpecies ?? id)).size;
}
let fame = 0;
const hof: Partial<Record<HofUpgradeId, number>> = {};
/** Hall of Fame entries, per region: `${region}:${id}` (each region keeps its own). */
const enshrined = new Set<string>();
const clears: Partial<Record<RegionId, number>> = {};
let totalTime = 0;
/** Hoenn's double battles, once reached: a partner attacks beside the active Pokémon. */
let doublesUnlocked = false;
/** Sinnoh's evolutions of older Pokémon, once a Sinnoh journey has begun. */
let sinnohEvolutions = false;
/** Fiore's Poké Assist, once reached: box Pokémon super effective against a wild one help out. */
let pokeAssistUnlocked = false;
/** Medals: lifetime counts, tiers earned, the Fame they've paid and finished journeys' times. */
const medalStats: Partial<Record<MedalStat, number>> = {};
let medalsEarned: Partial<Record<string, number>> = {};
let medalFame = 0;
const journeyTimes: number[] = [];
const countMedal = (stat: MedalStat, n = 1) => (medalStats[stat] = (medalStats[stat] ?? 0) + n);
/** Earns every medal tier reached (the game checks every second; here, now and then). */
function awardMedals() {
    const found = newMedals(
        {
            stats: medalStats,
            dexCaught: dexCaught(),
            shinySpecies: 0,
            variantsCaught: [...dex.keys()].filter(id => id > DEX_SIZE && id < 8000).length,
            clears,
            mechanicsUnlocked: MECHANIC_LIST.filter(m => (clears[m.region] ?? 0) > 0).length,
            platesFound: 0,
            rangerSigns: 0,
            ribbons: 0,
            journeys: journeyTimes.map(time => ({ time, challenges: [] }))
        },
        medalsEarned
    );
    for (const { medal, tier } of found) {
        medalsEarned = { ...medalsEarned, [medal.id]: Math.max(medalsEarned[medal.id] ?? 0, tier) };
        const gain = Math.round(tierFame(medal, tier) * MEDAL_FAME);
        fame += gain;
        medalFame += gain;
    }
}

/** Unova's mechanics, once reached: the Seasons, phenomena, critical captures, Hidden Grottoes. */
const unovaMechanics = {
    seasons: false,
    phenomena: false,
    criticalCapture: false,
    grottoes: false
};

interface Owned {
    id: number;
    xp: number;
    level: number;
    effort: number;
    /** A Shadow Pokémon's closed heart: wild battles left in the party before purification. */
    heart?: number;
}

function runJourney(region: RegionDefinition, starter: number) {
    const owned = new Map<number, Owned>();
    let badges = 0;
    let cleared = false;
    let money = FAME_EFFECTS.starterMoney(hof.starterKit);
    /** Poké Mart prices after Mart Membership. */
    const mp = (price: number) => Math.ceil(price * FAME_EFFECTS.martPrice(hof.martMembership));
    let time = 0;
    const mart: Record<string, number> = {};
    const keyItems: Partial<Record<KeyItemId, boolean>> = {};
    region.startingKeyItems.forEach(k => (keyItems[k] = true));
    const balls: Partial<Record<BallId, number>> = {
        pokeBall: 10 + FAME_EFFECTS.starterBalls(hof.starterKit)
    };
    const claimed = new Set<string>();
    const tier = () => badges + region.shopTier;
    const doubles = () => {
        const def = MECHANICS.doubleBattles;
        if (region.id === def.region && badges >= def.trialsRequired) doublesUnlocked = true;
        return doublesUnlocked;
    };
    const cap = () => levelCap(region, badges, cleared);
    let battles = 0;
    const reached = (id: keyof typeof MECHANICS) =>
        region.id === MECHANICS[id].region && badges >= MECHANICS[id].trialsRequired;
    const unova = () => {
        if (reached("seasons")) unovaMechanics.seasons = true;
        if (reached("phenomena")) unovaMechanics.phenomena = true;
        if (reached("criticalCapture")) unovaMechanics.criticalCapture = true;
        if (reached("hiddenGrottoes")) unovaMechanics.grottoes = true;
        return unovaMechanics;
    };
    // Almia's obstacles open up with the box's Field Abilities; Unova's seasons and phenomena.
    const extras = () => ({
        snagged,
        fieldPowers: fieldPowers(owned.keys()),
        season: unova().seasons ? seasonAt(battles) : undefined,
        phenomena: unova().phenomena
    });
    /** Poké Assist's damage bonus against this wild Pokémon (box Pokémon outside the party). */
    const assist = (target: { species: ReturnType<typeof getSpecies> }, party: Owned[]) => {
        const def = MECHANICS.pokeAssist;
        if (region.id === def.region && badges >= def.trialsRequired) pokeAssistUnlocked = true;
        if (!pokeAssistUnlocked) return 1;
        const helps = [...owned.values()].some(
            o =>
                !party.includes(o) &&
                getSpecies(o.id).types.some(t => typeEffectiveness(t, target.species.types) > 1)
        );
        return helps ? POKE_ASSIST_BONUS : 1;
    };

    function catchSpecies(id: number, level: number) {
        countMedal("catches");
        dex.set(id, (dex.get(id) ?? 0) + 1);
        if (owned.has(id)) return;
        const lvl = Math.min(level, cap());
        owned.set(id, {
            id,
            level: lvl,
            xp: xpForLevel(getSpecies(id).growthRate, lvl),
            effort: 0,
            ...(isShadow(id) ? { heart: HEART_BATTLES } : {})
        });
    }
    catchSpecies(starter, region.startLevel + FAME_EFFECTS.headStart(hof.headStart));
    // Colosseum's Espeon and Umbreon come as a pair.
    if (region.allStarters === true) {
        region.starters
            .filter(id => id !== starter)
            .forEach(id =>
                catchSpecies(id, region.startLevel + FAME_EFFECTS.headStart(hof.headStart))
            );
    }
    // Orre's one-of-a-kind Shadow Pokémon snagged this journey.
    const snagged: Record<string, boolean> = {};
    const snagFrom = (trainers: TrainerDefinition[]) => {
        for (const t of trainers) {
            for (const id of t.snag ?? []) {
                const level = t.team.find(p => p.id === id)?.level ?? 5;
                snagged[shadowOf(id)] = true;
                catchSpecies(shadowOf(id), level);
            }
        }
    };

    const bonusInputs = (): BonusInputs => ({
        dexCaught: dexCaught(),
        shinyCaught: 0,
        mart,
        hof,
        keyItems
    });
    const battler = (o: Owned): PartyBattler => ({
        species: getSpecies(o.id),
        level: o.level,
        multiplier:
            memberMultiplier(false, dex.get(o.id) ?? 1) *
            effortMultiplier(getSpecies(o.id).growthRate, o.level, o.effort)
    });
    const rematchClears = clears[region.id] ?? 0;
    const others = Object.keys(clears).filter(r => r !== region.id).length;
    //   RENOWN=0.3        override renown strength per region cleared
    const strength =
        process.env.RENOWN != null && rematchClears === 0
            ? 1 + Number(process.env.RENOWN) * Math.max(0, others - 1)
            : strengthMultiplier(rematchClears, others);
    const nextTrainers = (): TrainerDefinition[] =>
        (badges < region.trials.length
            ? [trialFor(region.trials[badges], starter)]
            : region.finale(starter)
        ).map(t => withStrength(t, strength));

    function chooseParty(): Owned[] {
        const targets = nextTrainers().flatMap(trainerTeam);
        const damage = computeBonuses(bonusInputs()).damage;
        const score = (o: Owned) =>
            targets.reduce((sum, t) => sum + memberDps(battler(o), t, damage) / maxHp(t), 0);
        return [...owned.values()].sort((a, b) => score(b) - score(a)).slice(0, 6);
    }

    if (region.id === MECHANICS.sinnohEvolutions.region) sinnohEvolutions = true;
    function evolve(o: Owned) {
        for (const evo of getSpecies(o.id).evolutions) {
            if (owned.has(evo.into)) continue;
            // Later generations' evolutions wait for their region (or its mechanic).
            const into = getSpecies(evo.into).baseSpecies ?? evo.into;
            if (into > (region.newestSpecies ?? 386) && into <= 493 && !sinnohEvolutions) continue;
            let ok = evo.method === "level" && o.level >= (evo.level ?? 101);
            // Stones, Link Cables and Soothe Bells are each used up by one evolution; buy one
            // when it's cheap relative to savings, like the auto-evolve automation.
            const item =
                evo.method === "stone"
                    ? evo.stone
                    : evo.method === "trade"
                      ? "linkCable"
                      : evo.friendship === true && !ok
                        ? "sootheBell"
                        : undefined;
            const held = evo.method === "trade" ? evo.heldItem : undefined;
            if (
                item != null &&
                tier() >= STONES[item].badgesRequired &&
                (held == null || tier() >= STONES[held].badgesRequired)
            ) {
                const price = mp(STONES[item].price + (held != null ? STONES[held].price : 0));
                if (money > price * 3) {
                    money -= price;
                    ok = true;
                }
            }
            if (ok) {
                owned.set(evo.into, { ...o, id: evo.into });
                countMedal("evolutions");
                if (!dex.has(evo.into)) dex.set(evo.into, 1);
            }
        }
    }

    function claimSpecials() {
        for (const s of SPECIAL_ENCOUNTERS) {
            if (s.region !== region.id || claimed.has(s.id) || badges < s.badgesRequired) continue;
            if (s.kind === "legendary" || s.kind === "boss" || owned.has(s.speciesId)) continue;
            if (s.kind === "trade" && !owned.has(s.wants)) continue;
            if (s.kind === "gift" && s.price != null) {
                if (money < s.price * 2) continue;
                money -= s.price;
            }
            claimed.add(s.id);
            countMedal(s.kind === "trade" ? "tradesMade" : "giftsReceived");
            catchSpecies(s.speciesId, s.level);
        }
    }

    function shop() {
        for (;;) {
            const options = MART_UPGRADE_LIST.filter(
                u => tier() >= u.badgesRequired && (mart[u.id] ?? 0) < u.maxLevel
            )
                .map(u => ({ u, cost: mp(upgradeCost(u, mart[u.id] ?? 0)) }))
                .sort((a, b) => a.cost - b.cost);
            const best = options[0];
            if (!best || money < best.cost * 2) break;
            money -= best.cost;
            mart[best.u.id] = (mart[best.u.id] ?? 0) + 1;
        }
    }

    function zoneScore(zoneId: string, party: Owned[]): number {
        const bonuses = computeBonuses(bonusInputs());
        const members = party.map(battler);
        let xpPerSec = 0;
        const samples = 30;
        for (let i = 0; i < samples; i++) {
            const e = rollEncounter(zoneId, keyItems, rng, 0, extras());
            if (!e) return 0;
            const target = { species: getSpecies(e.speciesId), level: e.level };
            const t =
                bonuses.searchTime +
                maxHp(target) /
                    wildDps(members, target, bonuses.damage * assist(target, party), doubles());
            xpPerSec += xpYield(target) / t;
        }
        const uncaught = availableZoneSpecies(zoneId, keyItems, extras()).filter(
            id => !owned.has(id)
        ).length;
        return (xpPerSec / samples) * (1 + 0.3 * uncaught);
    }

    const unlockedZones = () =>
        zonesIn(region.id).filter(
            z => badges >= z.badgesRequired && (!z.postGame || cleared) && z.mechanic == null
        );

    const log = (msg: string) =>
        console.log(
            `  ${((totalTime + time) / 3600).toFixed(1).padStart(5)}h total, ${(time / 3600)
                .toFixed(2)
                .padStart(5)}h run  ${msg}  [dex ${dexCaught()}, ₽${Math.floor(money)}]`
        );

    let party = chooseParty();
    let zone = zonesIn(region.id)[0].id;
    let step = 0;
    const MAX_TIME = 80 * 3600;

    while (!cleared && time < MAX_TIME) {
        if (step % 150 === 0) {
            awardMedals();
            claimSpecials();
            shop();
            party = chooseParty();
            zone = unlockedZones().reduce((best, z) =>
                zoneScore(z.id, party) > zoneScore(best.id, party) ? z : best
            ).id;
            const { damage, hp } = computeBonuses(bonusInputs());
            const trainers = nextTrainers();
            const members = party.map(battler);
            if (trainers.every(t => simulateTrainerBattle(members, t, damage, hp, doubles()).won)) {
                for (const t of trainers) money += t.prizeMoney;
                countMedal("trainersBeaten", trainers.length);
                if (badges < region.trials.length) countMedal("trialsWon");
                snagFrom(trainers);
                const summary = party.map(o => `${getSpecies(o.id).name} ${o.level}`).join(", ");
                if (badges < region.trials.length) {
                    const trial = region.trials[badges];
                    badges++;
                    trial.keyItems.forEach(k => (keyItems[k] = true));
                    log(`${trial.name} (${summary})`);
                } else {
                    cleared = true;
                    log(`Cleared the ${region.finaleName} (${summary})`);
                    const team = party.map(o => o.id);
                    const gain = fameGain({
                        regionFame: region.fame,
                        dexCaught: dexCaught(),
                        shinyCaught: 0,
                        newSpecies: new Set(
                            team
                                .map(hallOfFameId)
                                .filter(id => !enshrined.has(`${region.id}:${id}`))
                        ).size,
                        firstClear: (clears[region.id] ?? 0) === 0,
                        rematch: strength,
                        fanClub: hof.fanClub,
                        medals:
                            MEDAL_FAME > 0
                                ? rankFameMultiplier(
                                      Object.values(medalsEarned).reduce(
                                          (sum: number, n) => sum + (n ?? 0),
                                          0
                                      )
                                  )
                                : 1
                    });
                    team.forEach(id => enshrined.add(`${region.id}:${hallOfFameId(id)}`));
                    clears[region.id] = (clears[region.id] ?? 0) + 1;
                    journeyTimes.push(time);
                    fame += gain;
                    console.log(`  +${gain} Fame`);
                }
                step++;
                continue;
            }
        }
        step++;

        // A Hidden Grotto fills every GROTTO_BATTLES battles; its Pokémon is caught for sure.
        battles++;
        if (unova().grottoes && battles % GROTTO_BATTLES === 0) {
            const entries = activePools(zone, keyItems, extras())
                .filter(p => p.kind !== "phenomenon")
                .flatMap(p => p.entries)
                .filter(e => catchableIn(zone, e.id) && !isShadow(e.id));
            const pool = grottoPool(zone, entries, id => !dex.has(id));
            if (pool.length > 0) {
                const e = pool[Math.floor(rng() * pool.length)];
                catchSpecies(e.id, e.maxLevel);
                countMedal("grottoesVisited");
            }
        }

        const bonuses = computeBonuses(bonusInputs());
        const e = rollEncounter(zone, keyItems, rng, hof.roddysRod ?? 0, extras());
        if (!e) break;
        const target = { species: getSpecies(e.speciesId), level: e.level };
        time +=
            bonuses.searchTime +
            maxHp(target) /
                wildDps(
                    party.map(battler),
                    target,
                    bonuses.damage * assist(target, party),
                    doubles()
                );
        money += moneyYield(e.level) * bonuses.money * MF;
        countMedal("wildBattles");
        countMedal("moneyEarned", moneyYield(e.level) * bonuses.money * MF);
        if (e.kind === "phenomenon") countMedal("phenomena");
        if (unova().seasons && battles % SEASON_BATTLES === 0) countMedal("seasonsTurned");

        const gained = battleXp(target) * bonuses.xp * XPF;
        // Shadow Pokémon open their hearts in the party; Orre's Relic Stone purifies them (in
        // Colosseum after freeing Pyrite Town; by XD it's long been reached).
        const relicStone = region.id === "orreXd" || (region.id === "orre" && badges >= 1);
        for (const o of party) {
            if (o.heart != null && o.heart > 0) o.heart--;
            if (o.heart === 0 && relicStone) {
                owned.delete(o.id);
                o.id = getSpecies(o.id).baseSpecies!;
                delete o.heart;
                // The game purifies in place; keep whichever copy has the higher level.
                const prev = owned.get(o.id);
                if (prev == null || prev.level < o.level) owned.set(o.id, o);
                dex.set(o.id, (dex.get(o.id) ?? 0) + 1);
                countMedal("shadowsPurified");
            }
        }
        for (const o of party) {
            const growth = getSpecies(o.id).growthRate;
            const maxXp = xpForLevel(growth, cap());
            o.effort += Math.max(0, o.xp + gained - maxXp);
            o.xp = Math.min(o.xp + gained, maxXp);
            o.level = levelForXp(growth, o.xp, cap());
            evolve(o);
        }

        if (!owned.has(e.speciesId) && catchableIn(zone, e.speciesId) && region.styler) {
            // Ranger regions capture with the Capture Styler: no balls to buy.
            const chance = catchChance(target.species.captureRate, STYLER_POWER, bonuses.catch);
            const critical = unova().criticalCapture
                ? criticalCaptureChance(chance, dexCaught())
                : 0;
            const crit = critical > 0 && rng() < critical;
            if (crit) countMedal("criticalCaptures");
            if (crit || rng() < chance) {
                catchSpecies(e.speciesId, e.level);
            }
        } else if (!owned.has(e.speciesId) && catchableIn(zone, e.speciesId)) {
            let ball = AUTO_BALL_ORDER.find(b => (balls[b] ?? 0) > 0);
            if (ball == null) {
                ball = AUTO_BALL_ORDER.find(
                    b =>
                        tier() >= BALLS[b].badgesRequired &&
                        money >= (BALLS[b].price ?? Infinity) * 5
                );
                if (ball != null) {
                    const price = mp(BALLS[ball].price ?? 0);
                    const count = Math.min(20, Math.floor(money / price));
                    money -= count * price;
                    balls[ball] = count;
                }
            }
            if (ball != null) {
                balls[ball] = (balls[ball] ?? 0) - 1;
                const chance = catchChance(
                    target.species.captureRate,
                    BALLS[ball].catchMultiplier,
                    bonuses.catch
                );
                const critical = unova().criticalCapture
                    ? criticalCaptureChance(chance, dexCaught())
                    : 0;
                const crit = critical > 0 && rng() < critical;
                if (crit) countMedal("criticalCaptures");
                if (crit || rng() < chance) {
                    catchSpecies(e.speciesId, e.level);
                    if (isShadow(e.speciesId)) snagged[e.speciesId] = true;
                }
            }
        }
    }
    if (!cleared) log("Timed out.");
    totalTime += time;
    countMedal("playTime", time);
    awardMedals();
    return time;
}

function spendFame(entries: number) {
    for (;;) {
        // The Day Care and Contest upgrades don't change battles, which is all this plays, and
        // box Pokémon outside the party don't train here (Exp. All).
        const options = HOF_UPGRADE_LIST.filter(
            u =>
                u.mechanic == null &&
                u.id !== "expAll" &&
                entries >= (u.entriesRequired ?? 0) &&
                (hof[u.id] ?? 0) < upgradeTopLevel(u)
        )
            .map(u => ({ u, cost: upgradeCost(u, hof[u.id] ?? 0) }))
            .sort((a, b) => a.cost - b.cost);
        const best = options[0];
        if (!best || fame < best.cost) break;
        fame -= best.cost;
        hof[best.u.id] = (hof[best.u.id] ?? 0) + 1;
    }
}

let journeyOffset = 0;
//   SIM_LOAD=file      start from a campaign saved with SIM_SAVE=file (the permanent state after
//                     its journeys), so later regions can be tuned without replaying earlier ones
if (process.env.SIM_LOAD != null) {
    const saved = JSON.parse(readFileSync(process.env.SIM_LOAD, "utf8")) as SavedCampaign;
    saved.dex.forEach(([id, n]) => dex.set(id, n));
    fame = saved.fame;
    Object.assign(hof, saved.hof);
    saved.enshrined.forEach(key => enshrined.add(key));
    Object.assign(clears, saved.clears);
    totalTime = saved.totalTime;
    ({ doublesUnlocked, sinnohEvolutions, pokeAssistUnlocked } = saved);
    Object.assign(unovaMechanics, saved.unovaMechanics);
    seed = saved.seed;
    journeyOffset = saved.journeys;
    Object.assign(medalStats, saved.medalStats);
    medalsEarned = saved.medalsEarned;
    medalFame = saved.medalFame;
    journeyTimes.push(...saved.journeyTimes);
}

const summary: string[] = [];
plan.forEach(({ region: id, starter }, index) => {
    const i = index + journeyOffset;
    const region = REGIONS[id];
    const choice = starter ?? region.starters[i % region.starters.length];
    console.log(`Journey ${i + 1}: ${region.name} with ${getSpecies(choice).name}`);
    const time = runJourney(region, choice);
    summary.push(`#${i + 1} ${region.name}: ${(time / 3600).toFixed(1)}h`);
    spendFame(i + 1);
    console.log(`  Fame upgrades: ${JSON.stringify(hof)} (medals have paid ${medalFame} Fame)`);
});
console.log(summary.join(" | "));

if (process.env.SIM_SAVE != null) {
    const saved: SavedCampaign = {
        dex: [...dex.entries()],
        fame,
        hof,
        enshrined: [...enshrined],
        clears,
        totalTime,
        doublesUnlocked,
        sinnohEvolutions,
        pokeAssistUnlocked,
        unovaMechanics,
        seed,
        journeys: journeyOffset + plan.length,
        medalStats,
        medalsEarned,
        medalFame,
        journeyTimes
    };
    writeFileSync(process.env.SIM_SAVE, JSON.stringify(saved));
}

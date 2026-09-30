/**
 * Headless balance simulator. Plays a campaign of journeys (each from starter to the region's
 * finale) with a sensible strategy, carrying the Pokédex and Fame upgrades between journeys
 * like the real game, and prints when each milestone is reached.
 * Run it after touching anything in src/game/pokemon/balance.ts, trainers.ts, or a region file.
 *
 * Usage: npx tsx scripts/simulateProgression.ts [regions=kanto,kanto,orange,sevii] [seed=1]
 *   Each region may name a starter, e.g. "kanto:4,orange:25".
 */
import type { BonusInputs, HofUpgradeId, PartyBattler } from "../src/game/pokemon/balance";
import {
    battleXp,
    catchChance,
    computeBonuses,
    effortMultiplier,
    fameGain,
    HOF_UPGRADE_LIST,
    MART_UPGRADE_LIST,
    memberDps,
    memberMultiplier,
    moneyYield,
    simulateTrainerBattle,
    trainerTeam,
    upgradeCost,
    wildDps
} from "../src/game/pokemon/balance";
import { getSpecies, hallOfFameId } from "../src/game/pokemon/data";
import type { BallId, KeyItemId } from "../src/game/pokemon/items";
import { AUTO_BALL_ORDER, BALLS, STONES } from "../src/game/pokemon/items";
import type { RegionDefinition } from "../src/game/pokemon/regions";
import { levelCap, REGIONS, strengthMultiplier, withStrength } from "../src/game/pokemon/regions";
import { SPECIAL_ENCOUNTERS } from "../src/game/pokemon/specials";
import { levelForXp, maxHp, xpForLevel, xpYield } from "../src/game/pokemon/stats";
import type { TrainerDefinition } from "../src/game/pokemon/trainers";
import type { RegionId } from "../src/game/pokemon/zones";
import { availableZoneSpecies, rollEncounter, zonesIn } from "../src/game/pokemon/zones";

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
const enshrined = new Set<number>();
const clears: Partial<Record<RegionId, number>> = {};
let totalTime = 0;

interface Owned {
    id: number;
    xp: number;
    level: number;
    effort: number;
}

function runJourney(region: RegionDefinition, starter: number) {
    const owned = new Map<number, Owned>();
    let badges = 0;
    let cleared = false;
    let money = 0;
    let time = 0;
    const mart: Record<string, number> = {};
    const keyItems: Partial<Record<KeyItemId, boolean>> = {};
    region.startingKeyItems.forEach(k => (keyItems[k] = true));
    const balls: Partial<Record<BallId, number>> = { pokeBall: 10 };
    const claimed = new Set<string>();
    const tier = () => badges + region.shopTier;
    const cap = () => levelCap(region, badges, cleared);

    function catchSpecies(id: number, level: number) {
        dex.set(id, (dex.get(id) ?? 0) + 1);
        if (owned.has(id)) return;
        const lvl = Math.min(level, cap());
        owned.set(id, {
            id,
            level: lvl,
            xp: xpForLevel(getSpecies(id).growthRate, lvl),
            effort: 0
        });
    }
    catchSpecies(starter, region.startLevel + 5 * (hof.headStart ?? 0));

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
        (badges < region.trials.length ? [region.trials[badges]] : region.finale(starter)).map(t =>
            withStrength(t, strength)
        );

    function chooseParty(): Owned[] {
        const targets = nextTrainers().flatMap(trainerTeam);
        const damage = computeBonuses(bonusInputs()).damage;
        const score = (o: Owned) =>
            targets.reduce((sum, t) => sum + memberDps(battler(o), t, damage) / maxHp(t), 0);
        return [...owned.values()].sort((a, b) => score(b) - score(a)).slice(0, 6);
    }

    function evolve(o: Owned) {
        for (const evo of getSpecies(o.id).evolutions) {
            if (owned.has(evo.into)) continue;
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
                const price = STONES[item].price + (held != null ? STONES[held].price : 0);
                if (money > price * 3) {
                    money -= price;
                    ok = true;
                }
            }
            if (ok) {
                owned.set(evo.into, { ...o, id: evo.into });
                if (!dex.has(evo.into)) dex.set(evo.into, 1);
            }
        }
    }

    function claimSpecials() {
        for (const s of SPECIAL_ENCOUNTERS) {
            if (s.region !== region.id || claimed.has(s.id) || badges < s.badgesRequired) continue;
            if (s.kind === "legendary" || owned.has(s.speciesId)) continue;
            if (s.kind === "trade" && !owned.has(s.wants)) continue;
            if (s.kind === "gift" && s.price != null) {
                if (money < s.price * 2) continue;
                money -= s.price;
            }
            claimed.add(s.id);
            catchSpecies(s.speciesId, s.level);
        }
    }

    function shop() {
        for (;;) {
            const options = MART_UPGRADE_LIST.filter(
                u => tier() >= u.badgesRequired && (mart[u.id] ?? 0) < u.maxLevel
            )
                .map(u => ({ u, cost: upgradeCost(u, mart[u.id] ?? 0) }))
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
            const e = rollEncounter(zoneId, keyItems, rng);
            if (!e) return 0;
            const target = { species: getSpecies(e.speciesId), level: e.level };
            const t = bonuses.searchTime + maxHp(target) / wildDps(members, target, bonuses.damage);
            xpPerSec += xpYield(target) / t;
        }
        const uncaught = availableZoneSpecies(zoneId, keyItems).filter(id => !owned.has(id)).length;
        return (xpPerSec / samples) * (1 + 0.3 * uncaught);
    }

    const unlockedZones = () =>
        zonesIn(region.id).filter(z => badges >= z.badgesRequired && (!z.postGame || cleared));

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
            claimSpecials();
            shop();
            party = chooseParty();
            zone = unlockedZones().reduce((best, z) =>
                zoneScore(z.id, party) > zoneScore(best.id, party) ? z : best
            ).id;
            const { damage, hp } = computeBonuses(bonusInputs());
            const trainers = nextTrainers();
            const members = party.map(battler);
            if (trainers.every(t => simulateTrainerBattle(members, t, damage, hp).won)) {
                for (const t of trainers) money += t.prizeMoney;
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
                        newSpecies: new Set(team.map(hallOfFameId).filter(id => !enshrined.has(id)))
                            .size,
                        firstClear: (clears[region.id] ?? 0) === 0,
                        rematch: strength
                    });
                    team.forEach(id => enshrined.add(hallOfFameId(id)));
                    clears[region.id] = (clears[region.id] ?? 0) + 1;
                    fame += gain;
                    console.log(`  +${gain} Fame`);
                }
                step++;
                continue;
            }
        }
        step++;

        const bonuses = computeBonuses(bonusInputs());
        const e = rollEncounter(zone, keyItems, rng, hof.roddysRod ?? 0);
        if (!e) break;
        const target = { species: getSpecies(e.speciesId), level: e.level };
        time +=
            bonuses.searchTime +
            maxHp(target) / wildDps(party.map(battler), target, bonuses.damage);
        money += moneyYield(e.level) * bonuses.money * MF;

        const gained = battleXp(target) * bonuses.xp * XPF;
        for (const o of party) {
            const growth = getSpecies(o.id).growthRate;
            const maxXp = xpForLevel(growth, cap());
            o.effort += Math.max(0, o.xp + gained - maxXp);
            o.xp = Math.min(o.xp + gained, maxXp);
            o.level = levelForXp(growth, o.xp, cap());
            evolve(o);
        }

        if (!owned.has(e.speciesId)) {
            let ball = AUTO_BALL_ORDER.find(b => (balls[b] ?? 0) > 0);
            if (ball == null) {
                ball = AUTO_BALL_ORDER.find(
                    b =>
                        tier() >= BALLS[b].badgesRequired &&
                        money >= (BALLS[b].price ?? Infinity) * 5
                );
                if (ball != null) {
                    const price = BALLS[ball].price ?? 0;
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
                if (rng() < chance) catchSpecies(e.speciesId, e.level);
            }
        }
    }
    if (!cleared) log("Timed out.");
    totalTime += time;
    return time;
}

function spendFame() {
    for (;;) {
        const options = HOF_UPGRADE_LIST.filter(u => (hof[u.id] ?? 0) < u.maxLevel)
            .map(u => ({ u, cost: upgradeCost(u, hof[u.id] ?? 0) }))
            .sort((a, b) => a.cost - b.cost);
        const best = options[0];
        if (!best || fame < best.cost) break;
        fame -= best.cost;
        hof[best.u.id] = (hof[best.u.id] ?? 0) + 1;
    }
}

const summary: string[] = [];
plan.forEach(({ region: id, starter }, i) => {
    const region = REGIONS[id];
    const choice = starter ?? region.starters[i % region.starters.length];
    console.log(`Journey ${i + 1}: ${region.name} with ${getSpecies(choice).name}`);
    const time = runJourney(region, choice);
    summary.push(`#${i + 1} ${region.name}: ${(time / 3600).toFixed(1)}h`);
    spendFame();
    console.log(`  Fame upgrades: ${JSON.stringify(hof)}`);
});
console.log(summary.join(" | "));

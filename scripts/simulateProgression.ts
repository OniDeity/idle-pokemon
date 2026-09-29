/**
 * Headless balance simulator. Plays a first run from starter to Champion with a reasonable
 * (not optimal) strategy, and prints when each milestone is reached. Use it after touching
 * anything in src/game/pokemon/balance.ts, trainers.ts, or zones.ts.
 *
 * Usage: npx tsx scripts/simulateProgression.ts [starterId=4] [seed=1]
 */
import type { BonusInputs, PartyBattler } from "../src/game/pokemon/balance";
import {
    BALL_RESTOCK_TARGET,
    catchChance,
    computeBonuses,
    MART_UPGRADES,
    memberDps,
    memberMultiplier,
    moneyYield,
    simulateTrainerBattle,
    trainerTeam,
    upgradeCost,
    wildDps
} from "../src/game/pokemon/balance";
import { getSpecies } from "../src/game/pokemon/data";
import type { KeyItemId } from "../src/game/pokemon/items";
import { AUTO_BALL_ORDER, BALLS, LINK_CABLE_PRICE, STONES } from "../src/game/pokemon/items";
import { SPECIAL_ENCOUNTERS } from "../src/game/pokemon/specials";
import { levelForXp, maxHp, xpForLevel, xpYield } from "../src/game/pokemon/stats";
import type { TrainerDefinition } from "../src/game/pokemon/trainers";
import { championFor, ELITE_FOUR, GYMS, levelCap } from "../src/game/pokemon/trainers";
import { availableZoneSpecies, rollEncounter, ZONES } from "../src/game/pokemon/zones";

const starter = Number(process.argv[2] ?? 4);
let seed = Number(process.argv[3] ?? 1);
function rng() {
    // mulberry32
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

interface Owned {
    id: number;
    xp: number;
    level: number;
    timesCaught: number;
}

const owned = new Map<number, Owned>();
let badges = 0;
let champion = false;
let money = 0;
let time = 0;
const mart: Record<string, number> = {};
const keyItems: Partial<Record<KeyItemId, boolean>> = {};
const balls: Record<string, number> = { pokeBall: 5 };
const claimedSpecials = new Set<string>();

function addPokemon(id: number, level: number) {
    const existing = owned.get(id);
    if (existing) {
        existing.timesCaught++;
        return;
    }
    const growth = getSpecies(id).growthRate;
    owned.set(id, { id, level, xp: xpForLevel(growth, level), timesCaught: 1 });
}
addPokemon(starter, 5);

function bonusInputs(): BonusInputs {
    return { dexCaught: owned.size, shinyCaught: 0, mart, hof: {}, keyItems };
}

function battler(o: Owned): PartyBattler {
    return {
        species: getSpecies(o.id),
        level: o.level,
        multiplier: memberMultiplier(false, o.timesCaught)
    };
}

function nextTrainer(): TrainerDefinition[] {
    if (badges < 8) return [GYMS[badges]];
    return [...ELITE_FOUR, championFor(starter)];
}

/** Picks the 6 owned Pokémon that deal the most damage to the next trainer's team. */
function chooseParty(): Owned[] {
    const targets = nextTrainer().flatMap(trainerTeam);
    const damage = computeBonuses(bonusInputs()).damage;
    const score = (o: Owned) =>
        targets.reduce((sum, t) => sum + memberDps(battler(o), t, damage) / maxHp(t), 0);
    return [...owned.values()].sort((a, b) => score(b) - score(a)).slice(0, 6);
}

function evolve(o: Owned) {
    const species = getSpecies(o.id);
    for (const evo of species.evolutions) {
        let ok = false;
        if (evo.method === "level" && o.level >= (evo.level ?? 101)) ok = true;
        if (evo.method === "trade" && keyItems.linkCable) ok = true;
        if (evo.method === "stone" && evo.stone && badges >= STONES[evo.stone].badgesRequired) {
            const price = STONES[evo.stone].price;
            if (!owned.has(evo.into) && money > price * 2) {
                money -= price;
                ok = true;
            }
        }
        if (ok && !owned.has(evo.into)) {
            owned.set(evo.into, { ...o, id: evo.into, timesCaught: 1 });
        }
    }
}

function claimSpecials() {
    for (const s of SPECIAL_ENCOUNTERS) {
        if (claimedSpecials.has(s.id) || badges < s.badgesRequired) continue;
        if (s.kind === "legendary") continue;
        if (s.kind === "trade" && !owned.has(s.wants)) continue;
        if (s.kind === "gift" && s.price != null) {
            if (money < s.price * 2) continue;
            money -= s.price;
        }
        claimedSpecials.add(s.id);
        addPokemon(s.speciesId, s.level);
    }
}

function buyUpgrades() {
    for (;;) {
        const options = Object.values(MART_UPGRADES)
            .filter(u => badges >= u.badgesRequired && (mart[u.id] ?? 0) < u.maxLevel)
            .map(u => ({ u, cost: upgradeCost(u, mart[u.id] ?? 0) }))
            .sort((a, b) => a.cost - b.cost);
        const best = options[0];
        if (!best || money < best.cost + 200) break;
        money -= best.cost;
        mart[best.u.id] = (mart[best.u.id] ?? 0) + 1;
    }
    if (!keyItems.linkCable && badges >= 3 && money > LINK_CABLE_PRICE * 2) {
        money -= LINK_CABLE_PRICE;
        keyItems.linkCable = true;
    }
}

function zoneScore(zoneId: string, party: Owned[]): number {
    const bonuses = computeBonuses(bonusInputs());
    const members = party.map(battler);
    let xpPerSec = 0;
    const samples = 30;
    for (let i = 0; i < samples; i++) {
        const enc = rollEncounter(zoneId, keyItems, rng);
        if (!enc) return 0;
        const target = { species: getSpecies(enc.speciesId), level: enc.level };
        const t = bonuses.searchTime + maxHp(target) / wildDps(members, target, bonuses.damage);
        xpPerSec += xpYield(target) / t;
    }
    const uncaught = availableZoneSpecies(zoneId, keyItems).filter(id => !owned.has(id)).length;
    return (xpPerSec / samples) * (1 + 0.3 * uncaught);
}

function unlockedZones() {
    return ZONES.filter(z => badges >= z.badgesRequired && (!z.postGame || champion));
}

const log = (msg: string) =>
    console.log(
        `${(time / 3600).toFixed(2).padStart(6)}h  ${msg}  [dex ${owned.size}, ₽${Math.floor(
            money
        )}]`
    );

let party = chooseParty();
let zone = "route1";
let step = 0;
const MAX_TIME = 40 * 3600;

while (!champion && time < MAX_TIME) {
    if (step % 150 === 0) {
        claimSpecials();
        buyUpgrades();
        party = chooseParty();
        const zones = unlockedZones();
        zone = zones.reduce((best, z) =>
            zoneScore(z.id, party) > zoneScore(best.id, party) ? z : best
        ).id;
        // Try the next trainer(s).
        const { damage, hp } = computeBonuses(bonusInputs());
        const trainers = nextTrainer();
        const members = party.map(battler);
        if (process.env.DEBUG)
            console.log(
                trainers.map(t => [
                    t.name,
                    damage,
                    hp,
                    JSON.stringify(simulateTrainerBattle(members, t, damage, hp))
                ])
            );
        if (trainers.every(t => simulateTrainerBattle(members, t, damage, hp).won)) {
            for (const t of trainers) money += t.prizeMoney;
            if (badges < 8) {
                const gym = GYMS[badges];
                badges++;
                gym.keyItems.forEach(k => (keyItems[k] = true));
                log(
                    `Beat ${gym.name} (party: ${party
                        .map(o => `${getSpecies(o.id).name} ${o.level}`)
                        .join(", ")})`
                );
            } else {
                champion = true;
                log(
                    `Became Champion (party: ${party
                        .map(o => `${getSpecies(o.id).name} ${o.level}`)
                        .join(", ")})`
                );
            }
            continue;
        }
    }
    step++;

    const bonuses = computeBonuses(bonusInputs());
    const enc = rollEncounter(zone, keyItems, rng);
    if (!enc) break;
    const target = { species: getSpecies(enc.speciesId), level: enc.level };
    const dps = wildDps(party.map(battler), target, bonuses.damage);
    time += bonuses.searchTime + maxHp(target) / dps;
    money += moneyYield(enc.level) * bonuses.money;

    const cap = levelCap(badges, champion);
    const gained = xpYield(target) * bonuses.xp;
    for (const o of party) {
        const growth = getSpecies(o.id).growthRate;
        o.xp = Math.min(o.xp + gained, xpForLevel(growth, cap));
        o.level = levelForXp(growth, o.xp, cap);
        evolve(o);
    }

    if (!owned.has(enc.speciesId)) {
        const ballId =
            AUTO_BALL_ORDER.find(b => (balls[b] ?? 0) > 0) ??
            AUTO_BALL_ORDER.find(
                b => badges >= BALLS[b].badgesRequired && money >= (BALLS[b].price ?? Infinity)
            );
        if (ballId) {
            if ((balls[ballId] ?? 0) === 0) {
                const price = BALLS[ballId].price ?? 0;
                const count = Math.min(BALL_RESTOCK_TARGET, Math.floor(money / price));
                money -= count * price;
                balls[ballId] = count;
            }
            balls[ballId]--;
            const p = catchChance(
                target.species.captureRate,
                BALLS[ballId].catchMultiplier,
                bonuses.catch
            );
            if (rng() < p) addPokemon(enc.speciesId, enc.level);
        }
    }
}

log(champion ? "Done." : "Timed out.");
const missing = [];
for (let id = 1; id <= 151; id++) if (!owned.has(id)) missing.push(getSpecies(id).name);
console.log(`Missing (${missing.length}): ${missing.join(", ")}`);
console.log(`Mart upgrades: ${JSON.stringify(mart)}`);

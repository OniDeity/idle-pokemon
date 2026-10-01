/**
 * Automation bought with Fame. Each routine only acts when the player owns it and hasn't
 * switched it off, and only makes choices a sensible player would: it keeps a cash reserve,
 * never wastes Master Balls, and never starts a battle the forecast says it would lose.
 */
import type { AutomationId, MartUpgradeId } from "game/pokemon/balance";
import {
    MART_UPGRADE_LIST,
    memberDps,
    simulateTrainerBattle,
    trainerTeam,
    upgradeCost
} from "game/pokemon/balance";
import { getSpecies, hallOfFameId } from "game/pokemon/data";
import type { BallId } from "game/pokemon/items";
import type { StoneId } from "game/pokemon/data";
import { BALLS, STONES } from "game/pokemon/items";
import { maxHp } from "game/pokemon/stats";
import { SPECIAL_ENCOUNTERS } from "game/pokemon/specials";
import type { TrainerDefinition } from "game/pokemon/trainers";
import type { ZoneDefinition } from "game/pokemon/zones";
import { availableZoneSpecies, encounterOdds, typicalLevel, zonesIn } from "game/pokemon/zones";
import dex from "./layers/dex";
import hof from "./layers/hof";
import mart from "./layers/mart";
import { main } from "./projEntry";

function enabled(id: AutomationId) {
    return hof.automationActive(id);
}

function autoShop() {
    // Keep each unlocked ball type stocked.
    const targets: [BallId, number][] = [
        ["pokeBall", 30],
        ["greatBall", 20],
        ["ultraBall", 20]
    ];
    for (const [ball, target] of targets) {
        const def = BALLS[ball];
        const have = main.balls.value[ball];
        if (def.price == null || main.martTier.value < def.badgesRequired || have >= target / 2) {
            continue;
        }
        const count = Math.min(target - have, Math.floor((main.money.value * 0.25) / def.price));
        if (count > 0) main.buyBalls(ball, count);
    }
    // Then the cheapest upgrade, if it costs under half of what we have.
    const options = MART_UPGRADE_LIST.filter(
        u =>
            main.martTier.value >= u.badgesRequired &&
            (mart.levels.value[u.id as MartUpgradeId] ?? 0) < u.maxLevel
    )
        .map(u => ({ u, cost: upgradeCost(u, mart.levels.value[u.id as MartUpgradeId] ?? 0) }))
        .sort((a, b) => a.cost - b.cost);
    if (options.length > 0 && options[0].cost * 2 <= main.money.value) {
        mart.buyUpgrade(options[0].u);
    }
}

function autoClaim() {
    for (const special of SPECIAL_ENCOUNTERS) {
        if (special.kind === "legendary" || main.claimedSpecials.value[special.id]) continue;
        if (!main.specialAvailable(special) || main.owns(special.speciesId)) continue;
        if (special.kind === "trade" && !main.owns(special.wants)) continue;
        if (
            special.kind === "gift" &&
            special.price != null &&
            main.money.value < special.price * 2
        ) {
            continue;
        }
        main.claimSpecial(special);
    }
}

/** Makes sure one of an evolution item is in the bag, buying it when it's cheap enough. */
function buyIfAffordable(id: StoneId): boolean {
    if ((main.stones.value[id] ?? 0) > 0) return true;
    const item = STONES[id];
    if (main.martTier.value < item.badgesRequired || main.money.value < item.price * 3) {
        return false;
    }
    main.buyStone(id);
    return (main.stones.value[id] ?? 0) > 0;
}

function autoEvolve() {
    for (const key of Object.keys(main.box.value)) {
        const id = Number(key);
        for (const evolution of getSpecies(id).evolutions) {
            if (main.owns(main.evolutionTarget(id, evolution.into))) continue;
            if (evolution.method === "stone" && evolution.stone != null) {
                const stone = STONES[evolution.stone];
                if ((main.stones.value[stone.id] ?? 0) === 0) {
                    if (main.martTier.value < stone.badgesRequired) continue;
                    if (main.money.value < stone.price * 3) continue;
                    main.buyStone(stone.id);
                }
                main.evolveWithStone(id, stone.id);
            } else if (evolution.method === "trade") {
                if (!buyIfAffordable("linkCable")) continue;
                if (evolution.heldItem != null && !buyIfAffordable(evolution.heldItem)) continue;
                main.evolveByTrade(id);
            } else if (evolution.method === "level") {
                // Box Pokémon already at the level (party members evolve on their own)...
                const level = main.box.value[id]?.level ?? 0;
                if (level >= (evolution.level ?? Infinity)) {
                    main.evolveByLevel(id, evolution.into);
                } else if (evolution.friendship === true && buyIfAffordable("sootheBell")) {
                    // ...and friendship Pokémon early, with a Soothe Bell.
                    main.evolveWithSootheBell(id, evolution.into);
                }
            }
        }
    }
}

/** How much each owned Pokémon contributes against the next trainer's team. */
function autoParty() {
    const trainers = main.nextTrainers.value;
    if (trainers.length === 0) return;
    const targets = trainers.flatMap(trainerTeam);
    const damage = main.bonuses.value.damage;
    const scored = Object.keys(main.box.value).map(key => {
        const id = Number(key);
        const battler = main.battlerFor(id);
        const score = targets.reduce(
            (sum, target) => sum + memberDps(battler, target, damage) / maxHp(target),
            0
        );
        return { id, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const best = scored.slice(0, 6).map(s => s.id);
    main.setParty(
        main.nextTrial.value == null && hof.newFacesForFinale.value
            ? (newFacesParty(
                  scored.map(s => s.id),
                  trainers
              ) ?? best)
            : best
    );
}

/**
 * For the finale: the team with the most Pokémon new to the Hall of Fame (each worth extra Fame)
 * that the forecast says still wins, filled out with the strongest of the rest. Undefined when
 * even one newcomer would cost the win.
 */
function newFacesParty(ranked: number[], trainers: TrainerDefinition[]): number[] | undefined {
    const { damage, hp } = main.bonuses.value;
    // Strongest first; a Gyarados and a Gyarados ♀ are one Hall of Fame entry.
    const fresh = ranked.filter(
        (id, i) =>
            !hof.isEnshrined(id) &&
            ranked.findIndex(other => hallOfFameId(other) === hallOfFameId(id)) === i
    );
    for (let count = Math.min(6, fresh.length); count > 0; count--) {
        const team = fresh.slice(0, count);
        team.push(...ranked.filter(id => !team.includes(id)).slice(0, 6 - count));
        const party = team.map(id => main.battlerFor(id));
        if (trainers.every(t => simulateTrainerBattle(party, t, damage, hp).won)) return team;
    }
    return undefined;
}

/**
 * For "catch 'em all": the place where an encounter is most likely to be a Pokémon (or form:
 * variants, female forms, patterns) you've caught before but don't have this journey, at any
 * level. Brand-new Pokédex entries are left for the player to find.
 */
function bestZoneToRecatch(zones: ZoneDefinition[]): ZoneDefinition | undefined {
    const rodLevel = hof.levels.value.roddysRod ?? 0;
    let best: ZoneDefinition | undefined;
    let bestChance = 0;
    for (const zone of zones) {
        let chance = 0;
        for (const [id, p] of encounterOdds(zone.id, main.keyItems.value, rodLevel)) {
            if (dex.entry(id).caught && !main.owns(id)) chance += p;
        }
        // Stay put unless somewhere else is clearly better, so it doesn't hop on ties.
        const here = zone.id === main.zoneId.value ? 1.05 : 1;
        if (chance * here > bestChance) {
            best = zone;
            bestChance = chance * here;
        }
    }
    return best;
}

function autoTravel() {
    const zones = zonesIn(main.region.value).filter(z => main.zoneUnlocked(z.id));
    if (zones.length === 0) return;
    if (hof.catchEmAll.value) {
        const best = bestZoneToRecatch(zones);
        if (best != null) {
            main.travel(best.id);
            return;
        }
    }
    const levels = main.partyIds.value.map(id => main.box.value[id]?.level ?? 1);
    const average = levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length);
    // Newest zone that still has Pokémon we haven't caught this journey, unless it's so weak
    // that hunting there would stall the party's training.
    const withNew = zones.filter(
        z =>
            typicalLevel(z.id) >= average - 12 &&
            availableZoneSpecies(z.id, main.keyItems.value).some(id => !main.owns(id))
    );
    let target = withNew[withNew.length - 1];
    if (target == null) {
        // Otherwise the toughest zone our party comfortably out-levels.
        const comfortable = zones.filter(z => typicalLevel(z.id) <= average + 3);
        target = (comfortable.length > 0 ? comfortable : zones).reduce((best, z) =>
            typicalLevel(z.id) > typicalLevel(best.id) ? z : best
        );
    }
    main.travel(target.id);
}

function autoChallenge() {
    const trainers = main.nextTrainers.value;
    if (trainers.length === 0) return;
    const { damage, hp } = main.bonuses.value;
    const party = main.partyBattlers.value;
    if (!trainers.every(t => simulateTrainerBattle(party, t, damage, hp).won)) return;
    const trial = main.nextTrial.value;
    if (trial != null) {
        main.challengeGym(trial);
    } else {
        main.challengeFinale();
    }
}

/** Runs every owned, enabled automation once. */
export function runAutomation() {
    if (main.starter.value === 0) return;
    if (enabled("autoShop")) autoShop();
    if (enabled("autoClaim")) autoClaim();
    if (main.inTrainerBattle.value) return;
    if (enabled("autoEvolve")) autoEvolve();
    if (enabled("autoParty")) autoParty();
    if (enabled("autoTravel")) autoTravel();
    if (enabled("autoChallenge")) autoChallenge();
}

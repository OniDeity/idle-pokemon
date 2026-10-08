/**
 * Automation bought with Fame. Each routine only acts when the player owns it and hasn't
 * switched it off, and only makes choices a sensible player would: it keeps a cash reserve,
 * never wastes Master Balls, and never starts a battle the forecast says it would lose.
 */
import type { AutomationId, MartUpgradeId, TravelMode } from "game/pokemon/balance";
import {
    benchTeam,
    MART_UPGRADE_LIST,
    zoneRates,
    memberDps,
    simulateTrainerBattle,
    trainerTeam,
    upgradeCost
} from "game/pokemon/balance";
import { getSpecies, hallOfFameId, isShadow } from "game/pokemon/data";
import type { BallId } from "game/pokemon/items";
import type { StoneId } from "game/pokemon/data";
import { APRICORN_BALLS, BALLS, STONES } from "game/pokemon/items";
import type { ContestCategory, ContestRank } from "game/pokemon/contests";
import {
    CATEGORY_NAMES,
    CONTEST_CATEGORIES,
    contestScore,
    MAX_CONDITION,
    POKEBLOCK_PRICE,
    RANK_NAMES,
    winChance
} from "game/pokemon/contests";
import { BUG_CONTEST_FEE, JOHTO_SWARMS, SWARM_PRICE } from "game/pokemon/johto";
import { HONEY_PRICE, HONEY_TREES } from "game/pokemon/sinnoh";
import { maxHp } from "game/pokemon/stats";
import { SPECIAL_ENCOUNTERS, specialSpecies } from "game/pokemon/specials";
import type { TrainerDefinition } from "game/pokemon/trainers";
import type { ZoneDefinition } from "game/pokemon/zones";
import {
    availableZoneSpecies,
    catchableIn,
    encounterOdds,
    typicalLevel,
    zonesIn,
    ZONES_BY_ID
} from "game/pokemon/zones";
import dex from "./layers/dex";
import hof from "./layers/hof";
import mart from "./layers/mart";
import { main, POKE_SNACK_PRICE } from "./projEntry";
import { ref } from "vue";

/** What each automation last did or is waiting for, in a few words, for the Journey panel. */
export const automationStatus = ref<Partial<Record<AutomationId, string>>>({});

function report(id: AutomationId, text: string) {
    if (automationStatus.value[id] !== text) {
        automationStatus.value = { ...automationStatus.value, [id]: text };
    }
}

function plural(count: number, noun: string) {
    return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function enabled(id: AutomationId) {
    return hof.automationActive(id);
}

function autoShop() {
    // Keep every ball the Mart sells stocked: lots of the everyday ones, a few of Kurt's
    // Apricorn Balls (each only shines in its own situation) once they're unlocked.
    const targets: [BallId, number][] = [
        ["pokeBall", 30],
        ["greatBall", 20],
        ["ultraBall", 20],
        ...APRICORN_BALLS.map((ball): [BallId, number] => [ball, 10])
    ];
    for (const [ball, target] of targets) {
        const def = BALLS[ball];
        const have = main.balls.value[ball] ?? 0;
        if (
            def.price == null ||
            main.martTier.value < def.badgesRequired ||
            (def.mechanic != null && !main.mechanicOn(def.mechanic)) ||
            have >= target / 2
        ) {
            continue;
        }
        const count = Math.min(target - have, Math.floor((main.money.value * 0.25) / def.price));
        if (count > 0) {
            main.buyBalls(ball, count);
            report("autoShop", `bought ${count} ${def.name}${count === 1 ? "" : "s"}`);
        }
    }
    // Johto's extras: the Bug-Catching Contest and Pokégear swarms, when they're cheap for us.
    if (!main.contestEntered.value && main.money.value >= BUG_CONTEST_FEE * 4) {
        main.enterBugContest();
        report("autoShop", "entered the Bug-Catching Contest");
    }
    for (const swarm of JOHTO_SWARMS) {
        if (main.money.value < SWARM_PRICE * 4) break;
        if (main.swarmsJoined.value[swarm.zoneId] !== true) {
            main.joinSwarm(swarm.zoneId);
            report("autoShop", `joined the swarm at ${ZONES_BY_ID[swarm.zoneId]?.name}`);
        }
    }
    // Poké Snacks for the Poké Spot we're at.
    if (ZONES_BY_ID[main.zoneId.value]?.pokeSpot === true && main.pokeSnacks.value < 20) {
        const count = Math.min(50, Math.floor((main.money.value * 0.25) / POKE_SNACK_PRICE));
        if (count > 0) {
            main.buyPokeSnacks(count);
            report("autoShop", `bought ${plural(count, "Poké Snack")}`);
        }
    }
    // Then the cheapest upgrade, if it costs under half of what we have.
    const options = MART_UPGRADE_LIST.filter(
        u =>
            main.martTier.value >= u.badgesRequired &&
            (mart.levels.value[u.id as MartUpgradeId] ?? 0) < u.maxLevel
    )
        .map(u => ({ u, cost: upgradeCost(u, mart.levels.value[u.id as MartUpgradeId] ?? 0) }))
        .sort((a, b) => a.cost - b.cost);
    if (
        options.length > 0 &&
        options[0].cost * 2 <= main.money.value &&
        !main.challengeOn("frugal")
    ) {
        mart.buyUpgrade(options[0].u);
        report(
            "autoShop",
            `bought ${options[0].u.name} (Lv. ${mart.levels.value[options[0].u.id as MartUpgradeId] ?? 0})`
        );
    }
}

function autoClaim() {
    for (const special of SPECIAL_ENCOUNTERS) {
        if (special.kind === "legendary" || special.kind === "boss") continue;
        if (main.claimedSpecials.value[special.id]) continue;
        if (!main.specialAvailable(special) || specialSpecies(special).every(id => main.owns(id)))
            continue;
        if (special.kind === "trade" && !main.owns(special.wants)) continue;
        if (
            special.kind === "gift" &&
            special.price != null &&
            main.money.value < special.price * 2
        ) {
            continue;
        }
        main.claimSpecial(special);
        if (main.claimedSpecials.value[special.id]) {
            const name = getSpecies(special.speciesId).name;
            report(
                "autoClaim",
                special.kind === "trade" ? `traded for ${name}` : `received ${name}`
            );
        }
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
    const before = new Set(Object.keys(main.box.value));
    evolveAll();
    const added = Object.keys(main.box.value).filter(key => !before.has(key));
    if (added.length > 0) {
        const names = added.slice(0, 3).map(key => getSpecies(Number(key)).name);
        report(
            "autoEvolve",
            `${names.join(", ")}${added.length > 3 ? ` and ${added.length - 3} more` : ""}`
        );
    }
}

function evolveAll() {
    for (const key of Object.keys(main.box.value)) {
        const id = Number(key);
        // Shadow Pokémon whose hearts have opened get purified at the Relic Stone.
        if (main.canPurify(id)) {
            main.purify(id);
            continue;
        }
        for (const evolution of main.evolutionsOf(id)) {
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
                } else if (
                    evolution.friendship === true &&
                    (main.box.value[id]?.friend === true || buyIfAffordable("sootheBell"))
                ) {
                    // ...and friendship Pokémon early, with a Soothe Bell.
                    main.evolveWithSootheBell(id, evolution.into);
                }
            }
        }
    }
}

/** Keeps the Pokémon that best counter the next trainer's team in the party. */
function autoParty() {
    const trainers = main.nextTrainers.value;
    if (trainers.length === 0) return;
    const targets = trainers.flatMap(trainerTeam);
    const damage = main.bonuses.value.damage;
    const scored = Object.keys(main.box.value)
        .filter(key => main.canJoinParty(Number(key)))
        .map(key => {
            const id = Number(key);
            const battler = main.battlerFor(id);
            const score = targets.reduce(
                (sum, target) => sum + memberDps(battler, target, damage) / maxHp(target),
                0
            );
            return { id, score };
        });
    scored.sort((a, b) => b.score - a.score);
    const best = scored.slice(0, main.maxParty.value).map(s => s.id);
    let team = best;
    if (main.nextTrial.value == null && hof.newFacesForFinale.value) {
        const faces = newFacesParty(
            scored.map(s => s.id),
            trainers
        );
        if (faces != null) {
            team = faces.team;
            report(
                "autoParty",
                faces.count > 0
                    ? `${faces.count} new face${faces.count === 1 ? "" : "s"} for the Hall of Fame${faces.wins ? "" : ", training until they'd win"}`
                    : "no new face can win the finale yet: the strongest team"
            );
        }
    } else if (hof.trainBench.value && !winsWith(best, trainers)) {
        team = benchParty(
            best,
            scored.map(s => s.id)
        );
        const trainees = team.filter(id => !best.includes(id));
        report(
            "autoParty",
            trainees.length > 0
                ? `training ${trainees.map(id => getSpecies(id).name).join(", ")} until the best counters to ${trainers[0].name} can win`
                : `the best counters to ${trainers[0].name}, training`
        );
    } else {
        report("autoParty", `the best counters to ${trainers[0].name}`);
    }
    main.setParty(team);
}

/** Whether this team wins against every trainer, by the forecast. */
function winsWith(team: number[], trainers: TrainerDefinition[]): boolean {
    const { damage, hp } = main.bonuses.value;
    const doubles = main.mechanicOn("doubleBattles");
    const party = team.map(id => main.battlerFor(id));
    return trainers.every(t => simulateTrainerBattle(party, t, damage, hp, doubles).won);
}

/** Training the bench (see benchTeam): new faces first when they're going to the finale. */
function benchParty(best: number[], ranked: number[]): number[] {
    const faces = hof.newFacesForFinale.value;
    return benchTeam(best, ranked, {
        cap: main.cap.value,
        slots: hof.benchSlots.value,
        level: id => main.box.value[id]?.level ?? 1,
        first: id => faces && !hof.isEnshrined(id),
        entry: hallOfFameId
    });
}

/**
 * For the finale: up to the chosen number of Pokémon new to this region's Hall of Fame (each
 * worth extra Fame), strongest first, filled out with the strongest of the rest. Unless they're
 * set to train, it's as many of them as the forecast says can still win.
 */
function newFacesParty(
    ranked: number[],
    trainers: TrainerDefinition[]
): { team: number[]; count: number; wins: boolean } | undefined {
    const { damage, hp } = main.bonuses.value;
    const doubles = main.mechanicOn("doubleBattles");
    // Strongest first; a Gyarados and a Gyarados ♀ are one Hall of Fame entry.
    const fresh = ranked.filter(
        (id, i) =>
            !hof.isEnshrined(id) &&
            ranked.findIndex(other => hallOfFameId(other) === hallOfFameId(id)) === i
    );
    const size = main.maxParty.value;
    const wanted = Math.min(size, hof.newFacesCount.value, fresh.length);
    const teamWith = (count: number) => {
        const team = fresh.slice(0, count);
        // Fill out with the strongest others (not a second form of a newcomer).
        team.push(
            ...ranked
                .filter(id => !team.some(other => hallOfFameId(other) === hallOfFameId(id)))
                .slice(0, size - count)
        );
        return team;
    };
    const wins = (team: number[]) => {
        const party = team.map(id => main.battlerFor(id));
        return trainers.every(t => simulateTrainerBattle(party, t, damage, hp, doubles).won);
    };
    if (wanted === 0) return undefined;
    // Training: field them all, win or not; the League Pass waits for the forecast.
    if (hof.newFacesTrain.value) {
        const team = teamWith(wanted);
        return { team, count: wanted, wins: wins(team) };
    }
    for (let count = wanted; count > 0; count--) {
        const team = teamWith(count);
        if (wins(team)) return { team, count, wins: true };
    }
    return { team: teamWith(0), count: 0, wins: true };
}

/** How much a Pokémon you might meet is worth to the Travel Planner's catching modes. */
function catchValue(id: number, mode: TravelMode): number {
    if (main.owns(id)) return 0;
    if (!dex.entry(id).caught) return 3;
    return mode === "catchAll" ? 1 : 0;
}

/**
 * For the catching modes: the place where Pokémon worth catching turn up fastest (chance per
 * encounter over the time an encounter takes there), or undefined once there are none. Catching
 * has to be on: with it off nothing would be caught.
 */
function bestZoneToCatch(
    zones: ZoneDefinition[],
    mode: TravelMode
): { zone: ZoneDefinition; ids: number[] } | undefined {
    if (main.catchMode.value === "off") return undefined;
    const rodLevel = main.fameLevels.value.roddysRod ?? 0;
    const extras = main.zoneExtras.value;
    let best: { zone: ZoneDefinition; ids: number[] } | undefined;
    let bestRate = 0;
    for (const zone of zones) {
        let value = 0;
        const ids: number[] = [];
        for (const [id, p] of encounterOdds(zone.id, main.keyItems.value, rodLevel, extras)) {
            if (!catchableIn(zone.id, id) || (isShadow(id) && !main.keyItems.value.snagMachine)) {
                continue;
            }
            const worth = catchValue(id, mode);
            if (worth > 0) {
                value += p * worth;
                ids.push(id);
            }
        }
        if (value === 0) continue;
        const { secondsPerBattle } = zoneRates(
            zone.id,
            main.keyItems.value,
            main.partyBattlers.value,
            main.bonuses.value,
            extras
        );
        // Stay put unless somewhere else is clearly better, so it doesn't hop on ties.
        const here = zone.id === main.zoneId.value ? 1.1 : 1;
        const rate = (value / secondsPerBattle) * here;
        if (rate > bestRate) {
            best = { zone, ids };
            bestRate = rate;
        }
    }
    return best;
}

/** The place your party earns the most experience per minute (Effort past the level cap). */
function bestZoneToTrain(zones: ZoneDefinition[]): ZoneDefinition {
    let best = zones[0];
    let bestXp = -1;
    for (const zone of zones) {
        const { xpPerMinute } = zoneRates(
            zone.id,
            main.keyItems.value,
            main.partyBattlers.value,
            main.bonuses.value,
            main.zoneExtras.value
        );
        const here = zone.id === main.zoneId.value ? 1.05 : 1;
        if (xpPerMinute * here > bestXp) {
            best = zone;
            bestXp = xpPerMinute * here;
        }
    }
    return best;
}

/** Balanced: the newest place with Pokémon you haven't caught this journey, or the toughest. */
function balancedZone(zones: ZoneDefinition[]): ZoneDefinition {
    const levels = main.partyIds.value.map(id => main.box.value[id]?.level ?? 1);
    const average = levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length);
    // Newest zone that still has Pokémon we haven't caught this journey, unless it's so weak
    // that hunting there would stall the party's training.
    const withNew = zones.filter(
        z =>
            typicalLevel(z.id) >= average - 12 &&
            availableZoneSpecies(z.id, main.keyItems.value, main.zoneExtras.value).some(
                id => !main.owns(id)
            )
    );
    const target = withNew[withNew.length - 1];
    if (target != null) return target;
    // Otherwise the toughest zone our party comfortably out-levels.
    const comfortable = zones.filter(z => typicalLevel(z.id) <= average + 3);
    return (comfortable.length > 0 ? comfortable : zones).reduce((best, z) =>
        typicalLevel(z.id) > typicalLevel(best.id) ? z : best
    );
}

/** Game-time automation runs between the Travel Planner's decisions (they weigh every place). */
const TRAVEL_EVERY = 5;
let travelCountdown = 0;

function autoTravel() {
    if (travelCountdown-- > 0) return;
    travelCountdown = TRAVEL_EVERY - 1;
    const zones = zonesIn(main.region.value).filter(z => main.zoneUnlocked(z.id));
    if (zones.length === 0) return;
    const mode = hof.travelModeInEffect.value;
    if (mode === "catchAll" || mode === "pokedex") {
        const found = bestZoneToCatch(zones, mode);
        if (found != null) {
            main.travel(found.zone.id);
            const names = found.ids.slice(0, 3).map(id => getSpecies(id).name);
            report(
                "autoTravel",
                `${found.zone.name}: ${names.join(", ")}${found.ids.length > 3 ? ` and ${found.ids.length - 3} more` : ""} to catch`
            );
            return;
        }
    }
    if (mode === "train") {
        const zone = bestZoneToTrain(zones);
        main.travel(zone.id);
        report("autoTravel", `${zone.name}, training`);
        return;
    }
    const zone = balancedZone(zones);
    main.travel(zone.id);
    report(
        "autoTravel",
        mode === "balanced" ? zone.name : `${zone.name} (nothing left to catch here: balanced)`
    );
}

function autoChallenge() {
    const { damage, hp } = main.bonuses.value;
    const party = main.partyBattlers.value;
    const doubles = main.mechanicOn("doubleBattles");
    const loser = (trainers: TrainerDefinition[]) =>
        trainers.find(t => !simulateTrainerBattle(party, t, damage, hp, doubles).won);
    const trainers = main.nextTrainers.value;
    let waiting = "";
    if (trainers.length > 0) {
        const tough = loser(trainers);
        if (tough == null) {
            const trial = main.nextTrial.value;
            report("autoChallenge", `challenged ${trainers[0].name}`);
            if (trial != null) {
                main.challengeGym(trial);
            } else {
                main.challengeFinale();
            }
            return;
        }
        waiting = `waiting until the forecast beats ${tough.name}`;
    }
    // Legendary Pokémon already in the Pokédex and bosses beaten before (a first meeting is
    // the player's own).
    if (hof.autoLegends.value) {
        for (const special of SPECIAL_ENCOUNTERS) {
            if (special.kind !== "legendary" && special.kind !== "boss") continue;
            if (main.claimedSpecials.value[special.id] || !main.specialAvailable(special)) continue;
            const metBefore =
                special.kind === "legendary"
                    ? dex.entry(special.speciesId).caught
                    : hof.bossesBeaten.value[special.id] === true;
            if (!metBefore || loser(main.specialTrainers(special)) != null) continue;
            report(
                "autoChallenge",
                special.kind === "legendary"
                    ? `battled ${getSpecies(special.speciesId).name}`
                    : `challenged ${special.trainer.name}`
            );
            main.claimSpecial(special);
            return;
        }
    }
    report("autoChallenge", waiting === "" ? "every challenge done" : waiting);
}

/**
 * The Pokétch: shakes a Honey Tree with a Pokémon waiting (between wild battles), slathers the
 * empty ones while Honey is cheap for us, and digs every fresh Underground wall.
 */
function autoPoketch() {
    while (main.undergroundWalls.value > 0 && main.digUnderground().length > 0) {
        // Keep digging until the walls run out.
    }
    const open = HONEY_TREES.filter(tree => main.honeyTreeOpen(tree));
    if (main.battle.value.kind === "search") {
        const ready = open.find(tree => main.honeyTreeReady(tree.id));
        if (ready != null) main.shakeHoneyTree(ready.id);
    }
    for (const tree of open) {
        if (main.money.value < HONEY_PRICE * 10) break;
        if (main.honeyTrees.value[tree.id] == null) main.slatherHoney(tree.id);
    }
    if (open.length > 0) {
        const slathered = open.filter(tree => main.honeyTrees.value[tree.id] != null).length;
        report("autoPoketch", `Honey on ${slathered} of ${plural(open.length, "Honey Tree")}`);
    } else if (main.mechanicOn("underground")) {
        report("autoPoketch", "digging the Underground's walls as they appear");
    }
}

/** The C-Gear: visits a filled Hidden Grotto between wild battles. */
function autoCGear() {
    if (!main.mechanicOn("hiddenGrottoes")) return;
    if (main.grottoReady.value && main.battle.value.kind === "search") main.visitGrotto();
    const left = main.grottoBattles.value - main.grottoProgress.value;
    report(
        "autoCGear",
        left > 0 ? `the Hidden Grotto fills in ${plural(left, "wild battle")}` : "grotto ready"
    );
}

/** A Pokémon's chance to win at a rank with this much condition (Contest Star included). */
function contestChance(
    id: number,
    category: ContestCategory,
    rank: ContestRank,
    condition: number
) {
    const score = contestScore(id, main.box.value[id]?.level ?? 0, condition, category);
    return Math.min(1, winChance(score, rank) + 0.05 * (main.fameLevels.value.contestStar ?? 0));
}

/**
 * The next ribbon to go for: the Pokémon and category likeliest to win once fed to the full
 * (a sure win first), then the one already closest, so Pokéblocks aren't spread thin.
 */
function bestContestEntry():
    | { id: number; category: ContestCategory; rank: ContestRank }
    | undefined {
    let best: { id: number; category: ContestCategory; rank: ContestRank } | undefined;
    let bestKey = [-1, -1];
    for (const key of Object.keys(main.box.value)) {
        const id = Number(key);
        for (const category of CONTEST_CATEGORIES) {
            const rank = main.contestRankFor(id, category);
            if (rank == null) continue;
            const potential = contestChance(id, category, rank, MAX_CONDITION);
            const now = main.contestWinChance(id, category, rank);
            if (potential > bestKey[0] || (potential === bestKey[0] && now > bestKey[1])) {
                best = { id, category, rank };
                bestKey = [potential, now];
            }
        }
    }
    return best;
}

/** Contests win at least this often before the Contest Pass stops feeding Pokéblocks. */
const CONTEST_TARGET_CHANCE = 0.9;

/** The Contest Pass: feeds Pokéblocks (with money to spare) and enters the next contest. */
function autoContest() {
    if (!main.mechanicOn("contests")) return;
    const running = main.contest.value;
    if (running.speciesId !== 0) {
        report(
            "autoContest",
            `${getSpecies(running.speciesId).name} in the ${CATEGORY_NAMES[running.category]} Contest (${RANK_NAMES[running.rank]})`
        );
        return;
    }
    const entry = bestContestEntry();
    if (entry == null) {
        report("autoContest", "every Pokémon has won every ribbon");
        return;
    }
    const { id, category, rank } = entry;
    // Entering is free, so it always enters; Pokéblocks only while money is plentiful.
    while (
        main.contestWinChance(id, category, rank) < CONTEST_TARGET_CHANCE &&
        main.conditionOf(id, category) < MAX_CONDITION &&
        main.money.value >= POKEBLOCK_PRICE * 10
    ) {
        main.feedPokeblock(id, category);
    }
    main.enterContest(id, category);
}

/** Runs every owned, enabled automation once. */
export function runAutomation() {
    if (main.starter.value === 0) {
        // A new journey starts with a clean slate.
        if (Object.keys(automationStatus.value).length > 0) automationStatus.value = {};
        return;
    }
    if (enabled("autoShop")) autoShop();
    if (enabled("autoClaim")) autoClaim();
    if (main.inTrainerBattle.value) return;
    if (enabled("autoPoketch")) autoPoketch();
    if (enabled("autoCGear")) autoCGear();
    if (enabled("autoContest")) autoContest();
    if (enabled("autoEvolve")) autoEvolve();
    if (enabled("autoParty")) autoParty();
    if (enabled("autoTravel")) autoTravel();
    if (enabled("autoChallenge")) autoChallenge();
}

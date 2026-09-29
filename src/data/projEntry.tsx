import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import type { Player } from "game/player";
import type { Bonuses, PartyBattler, TrainerBattleState } from "game/pokemon/balance";
import {
    BALL_RESTOCK_TARGET,
    BASE_SHINY_CHANCE,
    battleXp,
    bestMatchup,
    catchChance,
    computeBonuses,
    initialTrainerBattle,
    memberDps,
    memberMultiplier,
    effortMultiplier,
    moneyYield,
    stepTrainerBattle,
    trainerTeam
} from "game/pokemon/balance";
import type { StoneId } from "game/pokemon/data";
import { femaleForm, getSpecies } from "game/pokemon/data";
import type { BallId, KeyItemId } from "game/pokemon/items";
import { BALLS, KEY_ITEMS, STONES } from "game/pokemon/items";
import type { SpecialEncounter } from "game/pokemon/specials";
import { LEGENDARY_TIME_LIMIT } from "game/pokemon/specials";
import type { BattlerStats } from "game/pokemon/stats";
import { levelForXp, maxHp, xpForLevel } from "game/pokemon/stats";
import {
    levelCap,
    REGIONS,
    startersFor,
    strengthMultiplier,
    withStrength
} from "game/pokemon/regions";
import type { GymDefinition, TrainerDefinition } from "game/pokemon/trainers";
import type { RegionId } from "game/pokemon/zones";
import { rollEncounter, zonesIn, ZONES_BY_ID } from "game/pokemon/zones";
import { computed, ref } from "vue";
import { useToast } from "vue-toastification";
import dex from "./layers/dex";
import hof from "./layers/hof";
import league from "./layers/league";
import map from "./layers/map";
import mart from "./layers/mart";
import party from "./layers/party";
import { runAutomation } from "./automation";
import { renderJourney } from "./ui/journey";
import type { NavNode } from "./ui/nav";
import { mobileClasses } from "./ui/nav";

export type BoxEntry = {
    level: number;
    xp: number;
    shiny: boolean;
    /** Experience earned at the level cap, which becomes a damage bonus (see effortMultiplier). */
    effort?: number;
};

export type CatchMode = "new" | "all" | "off";
export type BallMode = "smart" | BallId;

export type LogKind = "catch" | "shiny" | "evolve" | "badge" | "fail" | "info" | "levelup";
export interface LogEntry {
    id: number;
    kind: LogKind;
    text: string;
    speciesId?: number;
    shiny?: boolean;
}

export interface WildPokemon {
    speciesId: number;
    level: number;
    shiny: boolean;
    kind: "walk" | "surf" | "fishing";
    hp: number;
    maxHp: number;
}

export type BattleState =
    | { kind: "search"; remaining: number; total: number }
    | { kind: "wild"; wild: WildPokemon; active: number }
    | {
          kind: "trainer";
          label: string;
          trainers: TrainerDefinition[];
          index: number;
          enemies: BattlerStats[];
          party: PartyBattler[];
          partyIds: number[];
          state: TrainerBattleState;
          onWin: () => void;
          legendary?: Extract<SpecialEncounter, { kind: "legendary" }>;
      };

export interface Flash {
    text: string;
    kind: LogKind;
    until: number;
}

let toast: ReturnType<typeof useToast> | null = null;
export function notify(text: string, kind: "success" | "info" | "warning" | "error" = "info") {
    toast ??= useToast();
    toast[kind](text, { timeout: 4000 });
}

/** Iteration guard for offline catch-up: stop simulating after this many encounters per tick. */
const MAX_ENCOUNTERS_PER_TICK = 5000;
const LOG_LENGTH = 40;
/** Seconds of game time between automation decisions. */
const AUTOMATION_INTERVAL = 2;

/**
 * @hidden
 */
export const main = createLayer("main", layer => {
    // ------------------------------------------------------------------
    // Run state. Everything here is wiped when entering the Hall of Fame;
    // the Pokédex (dex layer) and Fame (hof layer) are permanent.
    // ------------------------------------------------------------------
    const starter = persistent<number>(0);
    const money = persistent<number>(0);
    const box = persistent<Record<string, BoxEntry>>({}, false);
    const partyIds = persistent<number[]>([], false);
    const region = persistent<RegionId>("kanto", false);
    const zoneId = persistent<string>("route1", false);
    const badges = persistent<number>(0);
    const champion = persistent<boolean>(false, false);
    const keyItems = persistent<Partial<Record<KeyItemId, boolean>>>({}, false);
    const balls = persistent<Record<BallId, number>>(
        {
            pokeBall: 10,
            greatBall: 0,
            ultraBall: 0,
            masterBall: 0
        },
        false
    );
    const stones = persistent<Record<StoneId, number>>(
        {
            moonStone: 0,
            fireStone: 0,
            waterStone: 0,
            thunderStone: 0,
            leafStone: 0,
            sunStone: 0
        },
        false
    );
    const claimedSpecials = persistent<Record<string, boolean>>({}, false);
    const catchMode = persistent<CatchMode>("new", false);
    const ballMode = persistent<BallMode>("smart", false);
    const useMasterBallOnLegendaries = persistent<boolean>(true, false);
    const runTime = persistent<number>(0);
    const battlesWon = persistent<number>(0);
    /** The party that cleared the region's finale this journey, for the Hall of Fame. */
    const clearTeam = persistent<number[]>([], false);

    // Transient state: rebuilt on load.
    const battle = ref<BattleState>({ kind: "search", remaining: 1, total: 1 });
    const log = ref<LogEntry[]>([]);
    const flash = ref<Flash | null>(null);
    let logId = 0;
    let warnedNoBalls = false;

    function addLog(entry: Omit<LogEntry, "id">) {
        log.value = [{ ...entry, id: logId++ }, ...log.value].slice(0, LOG_LENGTH);
    }
    function showFlash(text: string, kind: LogKind) {
        flash.value = { text, kind, until: Date.now() + 1600 };
    }

    // ------------------------------------------------------------------
    // Derived values
    // ------------------------------------------------------------------
    const bonuses = computed((): Bonuses =>
        computeBonuses({
            dexCaught: dex.caughtCount.value,
            shinyCaught: dex.shinyCount.value,
            mart: mart.levels.value,
            hof: hof.levels.value,
            keyItems: keyItems.value
        })
    );
    const regionDef = computed(() => REGIONS[region.value] ?? REGIONS.kanto);
    const cap = computed(() => levelCap(regionDef.value, badges.value, champion.value));
    /** Badge-equivalent progress used to decide what the Poké Mart stocks. */
    const martTier = computed(() => badges.value + regionDef.value.shopTier);
    const zone = computed(
        () => ZONES_BY_ID[zoneId.value] ?? zonesIn(regionDef.value.id)[0] ?? ZONES_BY_ID.route1
    );
    const partyBattlers = computed<PartyBattler[]>(() => partyIds.value.map(id => battlerFor(id)));
    const inTrainerBattle = computed(() => battle.value.kind === "trainer");
    /** How many times this region has been cleared before; trainers scale up on rematches. */
    const rematchClears = computed(() => hof.clearCount(region.value));
    /** Other regions already cleared, which make a region's first clear tougher (renown). */
    const otherRegionsCleared = computed(
        () =>
            (Object.keys(REGIONS) as RegionId[]).filter(
                r => r !== region.value && hof.clearCount(r) > 0
            ).length
    );
    /** Trainer strength (and Fame) multiplier from rematches or renown. */
    const rematch = computed(() =>
        strengthMultiplier(rematchClears.value, otherRegionsCleared.value)
    );
    const trials = computed((): GymDefinition[] =>
        regionDef.value.trials.map(t => withStrength(t, rematch.value))
    );
    const finale = computed((): TrainerDefinition[] =>
        regionDef.value.finale(starter.value).map(t => withStrength(t, rematch.value))
    );
    const nextTrial = computed(() => trials.value[badges.value]);
    /** The trainers standing between the player and progress: the next trial, or the finale. */
    const nextTrainers = computed((): TrainerDefinition[] =>
        nextTrial.value != null ? [nextTrial.value] : champion.value ? [] : finale.value
    );

    function battlerFor(id: number): PartyBattler {
        const entry = box.value[id];
        return {
            species: getSpecies(id),
            level: entry?.level ?? 1,
            multiplier:
                memberMultiplier(entry?.shiny ?? false, dex.timesCaught(id)) *
                effortMultiplier(getSpecies(id).growthRate, entry?.level ?? 1, entry?.effort ?? 0)
        };
    }

    function owns(id: number) {
        return box.value[id] != null;
    }

    // ------------------------------------------------------------------
    // Box & party
    // ------------------------------------------------------------------
    function setBoxEntry(id: number, entry: BoxEntry) {
        box.value = { ...box.value, [id]: entry };
    }

    /** Adds a Pokémon to the box (and party, if there's room). Returns true if it's a new species for this run. */
    function receivePokemon(id: number, level: number, shiny: boolean, countsAsCatch = true) {
        const species = getSpecies(id);
        const clampedLevel = Math.min(level, cap.value);
        const firstEver = dex.markCaught(id, shiny, countsAsCatch);
        const existing = box.value[id];
        if (existing == null) {
            setBoxEntry(id, {
                level: clampedLevel,
                xp: xpForLevel(species.growthRate, clampedLevel),
                shiny
            });
            if (partyIds.value.length < 6) {
                partyIds.value = [...partyIds.value, id];
            }
        } else if (shiny && !existing.shiny) {
            setBoxEntry(id, { ...existing, shiny: true });
        }
        if (firstEver) {
            addLog({
                kind: "levelup",
                text: `New Pokédex entry: ${species.name}!`,
                speciesId: id,
                shiny
            });
        }
        return existing == null;
    }

    function addToParty(id: number) {
        if (!owns(id) || partyIds.value.includes(id) || partyIds.value.length >= 6) return;
        if (inTrainerBattle.value) return;
        partyIds.value = [...partyIds.value, id];
    }
    function removeFromParty(id: number) {
        if (partyIds.value.length <= 1 || inTrainerBattle.value) return;
        partyIds.value = partyIds.value.filter(p => p !== id);
    }
    function moveInParty(id: number, delta: number) {
        if (inTrainerBattle.value) return;
        const list = [...partyIds.value];
        const i = list.indexOf(id);
        const j = i + delta;
        if (i === -1 || j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        partyIds.value = list;
    }
    function setParty(ids: number[]) {
        if (inTrainerBattle.value) return;
        const valid = [...new Set(ids)].filter(owns).slice(0, 6);
        if (valid.length === 0) return;
        if (valid.join() === partyIds.value.join()) return;
        partyIds.value = valid;
    }
    function swapIntoParty(outId: number, inId: number) {
        if (inTrainerBattle.value || !owns(inId) || partyIds.value.includes(inId)) return;
        partyIds.value = partyIds.value.map(p => (p === outId ? inId : p));
    }

    // ------------------------------------------------------------------
    // Experience & evolution
    // ------------------------------------------------------------------
    function evolve(fromId: number, intoId: number, how: string) {
        const from = box.value[fromId];
        if (from == null || owns(intoId)) return;
        const into = getSpecies(intoId);
        const xp = Math.max(from.xp, xpForLevel(into.growthRate, from.level));
        setBoxEntry(intoId, { level: from.level, xp, shiny: from.shiny, effort: from.effort });
        dex.markCaught(intoId, from.shiny, false);
        // Trainer battles use a snapshot of the party, so swapping here is always safe.
        if (partyIds.value.includes(fromId)) {
            partyIds.value = partyIds.value.map(p => (p === fromId ? intoId : p));
        }
        const text = `${getSpecies(fromId).name} evolved into ${into.name}${how}!`;
        addLog({ kind: "evolve", text, speciesId: intoId, shiny: from.shiny });
        showFlash(text, "evolve");
        notify(text, "success");
    }

    /**
     * What an evolution produces. Evolving keeps the original, so once you own the regular
     * evolution, evolving again from a Pokémon without its own female form gives the female one
     * (Ivysaur → Venusaur, then Venusaur ♀). Female forms evolve into female forms directly.
     */
    function evolutionTarget(fromId: number, into: number): number {
        const female = femaleForm(into);
        if (female == null || !owns(into)) return into;
        const from = getSpecies(fromId);
        if (from.variant != null || femaleForm(fromId) != null) return into;
        return female.id;
    }

    function evolveWithStone(fromId: number, stone: StoneId) {
        const evolution = getSpecies(fromId).evolutions.find(
            e => e.method === "stone" && e.stone === stone
        );
        if (evolution == null || (stones.value[stone] ?? 0) <= 0) return;
        const into = evolutionTarget(fromId, evolution.into);
        if (owns(into) || !owns(fromId) || inTrainerBattle.value) return;
        stones.value = { ...stones.value, [stone]: (stones.value[stone] ?? 0) - 1 };
        evolve(fromId, into, ` with a ${STONES[stone].name}`);
    }

    function evolveByTrade(fromId: number) {
        const evolution = getSpecies(fromId).evolutions.find(e => e.method === "trade");
        if (evolution == null || !keyItems.value.linkCable) return;
        const into = evolutionTarget(fromId, evolution.into);
        if (owns(into) || !owns(fromId) || inTrainerBattle.value) return;
        evolve(fromId, into, " over the Link Cable");
    }

    function gainXp(amount: number) {
        const levelCap = cap.value;
        for (const id of [...partyIds.value]) {
            const entry = box.value[id];
            if (entry == null) continue;
            const species = getSpecies(id);
            const maxXp = xpForLevel(species.growthRate, levelCap);
            const xp = Math.min(entry.xp + amount, maxXp);
            const overflow = Math.max(0, entry.xp + amount - maxXp);
            const level = levelForXp(species.growthRate, xp, levelCap);
            const effort = (entry.effort ?? 0) + overflow;
            setBoxEntry(id, { ...entry, xp, level, effort });
            if (level > entry.level) {
                if (level === levelCap) {
                    addLog({
                        kind: "levelup",
                        text: `${species.name} reached the level cap (Lv. ${level}). Further experience builds Effort.`,
                        speciesId: id,
                        shiny: entry.shiny
                    });
                }
                for (const evolution of species.evolutions) {
                    if (evolution.method === "level" && level >= (evolution.level ?? Infinity)) {
                        evolve(id, evolutionTarget(id, evolution.into), "");
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------------
    // Items
    // ------------------------------------------------------------------
    function spend(amount: number) {
        if (money.value < amount) return false;
        money.value -= amount;
        return true;
    }

    function buyBalls(id: BallId, count: number) {
        const price = BALLS[id].price;
        if (price == null || martTier.value < BALLS[id].badgesRequired) return;
        if (!spend(price * count)) return;
        balls.value = { ...balls.value, [id]: balls.value[id] + count };
        warnedNoBalls = false;
    }

    function buyStone(id: StoneId) {
        if (martTier.value < STONES[id].badgesRequired || !spend(STONES[id].price)) return;
        stones.value = { ...stones.value, [id]: (stones.value[id] ?? 0) + 1 };
    }

    function grantKeyItem(id: KeyItemId) {
        if (keyItems.value[id]) return;
        keyItems.value = { ...keyItems.value, [id]: true };
        addLog({ kind: "info", text: `Obtained the ${KEY_ITEMS[id].name}!` });
    }

    /**
     * Picks which ball to throw, or null if none are available. A chosen ball type that's out
     * of stock falls back to the smart choice; shinies always get the best ball available.
     */
    function chooseBall(captureRate: number, important = false): BallId | null {
        if (bonuses.value.autoRestock && balls.value.pokeBall < 5) {
            const count = Math.min(
                BALL_RESTOCK_TARGET - balls.value.pokeBall,
                Math.floor(money.value / (BALLS.pokeBall.price ?? Infinity))
            );
            if (count > 0) buyBalls("pokeBall", count);
        }
        const inStock = (id: BallId) => balls.value[id] > 0;
        if (!important && ballMode.value !== "smart" && inStock(ballMode.value)) {
            return ballMode.value;
        }
        // Cheapest ball that's very likely to work; otherwise the strongest one we have.
        const candidates = (["pokeBall", "greatBall", "ultraBall"] as BallId[]).filter(inStock);
        if (candidates.length === 0) return null;
        if (important) return candidates[candidates.length - 1];
        const good = candidates.find(
            id => catchChance(captureRate, BALLS[id].catchMultiplier, bonuses.value.catch) >= 0.85
        );
        return good ?? candidates[candidates.length - 1];
    }

    function useBall(id: BallId) {
        balls.value = { ...balls.value, [id]: Math.max(0, balls.value[id] - 1) };
    }

    // ------------------------------------------------------------------
    // Battles
    // ------------------------------------------------------------------
    function startSearch() {
        const total = bonuses.value.searchTime;
        battle.value = { kind: "search", remaining: total, total };
    }

    function spawnWild() {
        const rolled = rollEncounter(
            zoneId.value,
            keyItems.value,
            Math.random,
            hof.levels.value.roddysRod ?? 0
        );
        if (rolled == null) {
            startSearch();
            return;
        }
        const shiny = Math.random() < BASE_SHINY_CHANCE * bonuses.value.shiny;
        const target = { species: getSpecies(rolled.speciesId), level: rolled.level };
        const hp = maxHp(target);
        dex.markSeen(rolled.speciesId);
        battle.value = {
            kind: "wild",
            wild: { ...rolled, shiny, hp, maxHp: hp },
            active: bestMatchup(partyBattlers.value, target, bonuses.value.damage, null)
        };
        if (shiny) {
            const text = `A shiny ${target.species.name} appeared!`;
            addLog({ kind: "shiny", text, speciesId: rolled.speciesId, shiny: true });
            showFlash(text, "shiny");
            notify(`✨ ${text}`, "success");
        }
    }

    function shouldTryCatch(wild: WildPokemon) {
        if (catchMode.value === "off") return false;
        if (catchMode.value === "all") return true;
        const entry = box.value[wild.speciesId];
        return entry == null || (wild.shiny && !entry.shiny);
    }

    function defeatWild(wild: WildPokemon) {
        const species = getSpecies(wild.speciesId);
        battlesWon.value++;
        money.value += moneyYield(wild.level) * bonuses.value.money;
        gainXp(battleXp({ species, level: wild.level }) * bonuses.value.xp);

        if (shouldTryCatch(wild)) {
            const ball = chooseBall(species.captureRate, wild.shiny);
            if (ball == null) {
                if (!warnedNoBalls) {
                    warnedNoBalls = true;
                    addLog({ kind: "fail", text: "Out of Poké Balls! Buy more at the Poké Mart." });
                }
            } else {
                useBall(ball);
                const chance = catchChance(
                    species.captureRate,
                    BALLS[ball].catchMultiplier,
                    bonuses.value.catch
                );
                if (Math.random() < chance) {
                    const isNew = receivePokemon(wild.speciesId, wild.level, wild.shiny);
                    const text = `Caught ${wild.shiny ? "a shiny " : ""}${species.name}!`;
                    addLog({
                        kind: wild.shiny ? "shiny" : "catch",
                        text: isNew ? text : `${text} (x${dex.timesCaught(wild.speciesId)})`,
                        speciesId: wild.speciesId,
                        shiny: wild.shiny
                    });
                    showFlash(text, "catch");
                } else {
                    const text = `${species.name} broke free from the ${BALLS[ball].name}!`;
                    addLog({ kind: "fail", text, speciesId: wild.speciesId, shiny: wild.shiny });
                    showFlash("Oh no! It broke free!", "fail");
                }
            }
        }
        startSearch();
    }

    function startTrainerBattle(options: {
        label: string;
        trainers: TrainerDefinition[];
        onWin: () => void;
        legendary?: Extract<SpecialEncounter, { kind: "legendary" }>;
    }) {
        if (inTrainerBattle.value || partyIds.value.length === 0) return;
        const snapshot = partyBattlers.value;
        const enemies = trainerTeam(options.trainers[0]);
        battle.value = {
            kind: "trainer",
            label: options.label,
            trainers: options.trainers,
            index: 0,
            enemies,
            party: snapshot,
            partyIds: [...partyIds.value],
            state: initialTrainerBattle(snapshot, enemies, bonuses.value.hp),
            onWin: options.onWin,
            legendary: options.legendary
        };
        addLog({ kind: "info", text: `${options.label} begins!` });
    }

    function forfeit() {
        if (battle.value.kind !== "trainer") return;
        addLog({ kind: "fail", text: `You withdrew from ${battle.value.label}.` });
        startSearch();
    }

    function challengeGym(requested: GymDefinition) {
        const gym = trials.value[requested.badgeNumber - 1];
        if (gym == null || gym.id !== requested.id || badges.value !== gym.badgeNumber - 1) return;
        startTrainerBattle({
            label: regionDef.value.id === "sevii" ? gym.title : `${gym.name}'s Gym battle`,
            trainers: [gym],
            onWin() {
                badges.value = gym.badgeNumber;
                gym.keyItems.forEach(grantKeyItem);
                for (const [id, count] of Object.entries(gym.balls ?? {})) {
                    balls.value = {
                        ...balls.value,
                        [id]: balls.value[id as BallId] + (count ?? 0)
                    };
                }
                const text =
                    regionDef.value.trialNoun === "badges"
                        ? `You earned the ${gym.badge}!`
                        : `Quest complete: ${gym.badge}!`;
                addLog({ kind: "badge", text });
                showFlash(text, "badge");
                notify(`🏅 ${text}`, "success");
            }
        });
    }

    function challengeFinale() {
        if (badges.value < regionDef.value.trials.length) return;
        startTrainerBattle({
            label: regionDef.value.finaleName,
            trainers: finale.value,
            onWin() {
                const first = !champion.value;
                champion.value = true;
                if (first) {
                    clearTeam.value = [...partyIds.value];
                    hof.recordChampionTeam(partyIds.value.map(id => ({ id, ...box.value[id] })));
                }
                const text = first
                    ? `You conquered the ${regionDef.value.finaleName}! The Hall of Fame awaits.`
                    : `You defended your title at the ${regionDef.value.finaleName}!`;
                addLog({ kind: "badge", text });
                showFlash("Champion!", "badge");
                notify(`🏆 ${text}`, "success");
            }
        });
    }

    function challengeLegendary(special: Extract<SpecialEncounter, { kind: "legendary" }>) {
        if (claimedSpecials.value[special.id] || !specialAvailable(special)) return;
        const species = getSpecies(special.speciesId);
        startTrainerBattle({
            label: `Wild ${species.name}`,
            legendary: special,
            trainers: [
                {
                    id: special.id,
                    name: species.name,
                    title: "Legendary Pokémon",
                    specialty: null,
                    team: [{ id: special.speciesId, level: special.level }],
                    timeLimit: LEGENDARY_TIME_LIMIT,
                    statMultiplier: special.strength,
                    prizeMoney: 0,
                    quote: special.text
                }
            ],
            onWin() {
                const useMaster = useMasterBallOnLegendaries.value && balls.value.masterBall > 0;
                const ball = useMaster ? "masterBall" : chooseBall(species.captureRate, true);
                if (ball == null) {
                    addLog({ kind: "fail", text: `No Poké Balls! ${species.name} flew away.` });
                    return;
                }
                useBall(ball);
                const chance = catchChance(
                    species.captureRate,
                    BALLS[ball].catchMultiplier,
                    bonuses.value.catch
                );
                if (Math.random() < chance) {
                    claimedSpecials.value = { ...claimedSpecials.value, [special.id]: true };
                    receivePokemon(special.speciesId, special.level, false);
                    const text = `You caught ${species.name}!`;
                    addLog({ kind: "catch", text, speciesId: special.speciesId });
                    showFlash(text, "catch");
                    notify(`🌟 ${text}`, "success");
                } else {
                    const text = `${species.name} broke free and fled! Challenge it again.`;
                    addLog({ kind: "fail", text, speciesId: special.speciesId });
                    showFlash("It broke free!", "fail");
                }
            }
        });
    }

    function resolveTrainerStep(
        current: Extract<BattleState, { kind: "trainer" }>,
        done: "victory" | "fainted" | "timeout"
    ) {
        const trainer = current.trainers[current.index];
        if (done !== "victory") {
            const reason =
                done === "timeout"
                    ? `You ran out of time against ${trainer.name}.`
                    : `Your party was defeated by ${trainer.name}.`;
            addLog({ kind: "fail", text: `${reason} Train up and try again!` });
            showFlash(done === "timeout" ? "Out of time!" : "You blacked out!", "fail");
            notify(reason, "warning");
            startSearch();
            return;
        }
        if (trainer.prizeMoney > 0) {
            const prize = trainer.prizeMoney * bonuses.value.money;
            money.value += prize;
            addLog({ kind: "info", text: `Defeated ${trainer.name}! Got ₽${Math.floor(prize)}.` });
        }
        // XP for every Pokémon on the defeated team.
        for (const enemy of current.enemies) {
            gainXp(battleXp(enemy, true) * bonuses.value.xp);
        }
        const nextIndex = current.index + 1;
        if (nextIndex < current.trainers.length) {
            // Next trainer in a gauntlet: heal up between battles.
            const enemies = trainerTeam(current.trainers[nextIndex]);
            battle.value = {
                ...current,
                index: nextIndex,
                enemies,
                state: initialTrainerBattle(current.party, enemies, bonuses.value.hp)
            };
            return;
        }
        current.onWin();
        startSearch();
    }

    /** Advances the battle state by up to `dt` seconds and returns the unused time. */
    function advance(dt: number): number {
        const current = battle.value;
        switch (current.kind) {
            case "search": {
                if (current.remaining > dt) {
                    battle.value = { ...current, remaining: current.remaining - dt };
                    return 0;
                }
                spawnWild();
                return dt - current.remaining;
            }
            case "wild": {
                const { wild } = current;
                const target = { species: getSpecies(wild.speciesId), level: wild.level };
                const party = partyBattlers.value;
                const active = bestMatchup(party, target, bonuses.value.damage, null);
                const dps =
                    active === -1 ? 0 : memberDps(party[active], target, bonuses.value.damage);
                if (dps <= 0) {
                    return 0;
                }
                const timeToFaint = wild.hp / dps;
                if (timeToFaint > dt) {
                    battle.value = {
                        ...current,
                        active,
                        wild: { ...wild, hp: wild.hp - dps * dt }
                    };
                    return 0;
                }
                defeatWild(wild);
                return dt - timeToFaint;
            }
            case "trainer": {
                const trainer = current.trainers[current.index];
                const before = current.state.elapsed;
                const { state, done } = stepTrainerBattle(
                    current.party,
                    current.enemies,
                    current.state,
                    bonuses.value.damage,
                    dt,
                    trainer.timeLimit
                );
                battle.value = { ...current, state };
                if (done == null) {
                    return 0;
                }
                resolveTrainerStep({ ...current, state }, done);
                return Math.max(0, dt - (state.elapsed - before));
            }
        }
    }

    let automationTimer = 0;
    layer.on("update", diff => {
        if (starter.value === 0 || partyIds.value.length === 0) return;
        runTime.value += diff;
        let remaining = diff;
        let encounters = 0;
        while (remaining > 1e-9 && encounters++ < MAX_ENCOUNTERS_PER_TICK) {
            const before = remaining;
            remaining = advance(remaining);
            // Automation decides in game time, so offline catch-up plays out like live play.
            automationTimer -= before - remaining;
            if (automationTimer <= 0) {
                automationTimer = AUTOMATION_INTERVAL;
                runAutomation();
            }
        }
    });

    // ------------------------------------------------------------------
    // Travel & specials
    // ------------------------------------------------------------------
    function zoneUnlocked(id: string) {
        const z = ZONES_BY_ID[id];
        return (
            z != null &&
            z.region === region.value &&
            badges.value >= z.badgesRequired &&
            (!z.postGame || champion.value)
        );
    }

    function travel(id: string) {
        if (!zoneUnlocked(id) || zoneId.value === id) return;
        zoneId.value = id;
        if (!inTrainerBattle.value) startSearch();
    }

    function specialAvailable(special: SpecialEncounter) {
        if (special.region !== region.value || badges.value < special.badgesRequired) return false;
        if (special.postGame === true && !champion.value) return false;
        if (special.kind === "legendary") {
            if (special.keyItem != null && !keyItems.value[special.keyItem]) return false;
        }
        return true;
    }

    function claimSpecial(special: SpecialEncounter) {
        if (!specialAvailable(special) || claimedSpecials.value[special.id]) return;
        if (special.kind === "legendary") {
            challengeLegendary(special);
            return;
        }
        if (special.kind === "trade" && !owns(special.wants)) return;
        if (special.kind === "gift" && special.price != null && !spend(special.price)) return;
        claimedSpecials.value = { ...claimedSpecials.value, [special.id]: true };
        receivePokemon(special.speciesId, special.level, false);
        const species = getSpecies(special.speciesId);
        const text =
            special.kind === "trade"
                ? `Traded for ${species.name}! (You kept your ${getSpecies(special.wants).name}.)`
                : `Received ${species.name}!`;
        addLog({ kind: "catch", text, speciesId: special.speciesId });
        showFlash(text, "catch");
    }

    /** Picks where the next journey happens. Only possible before choosing a starter. */
    function chooseRegion(id: RegionId) {
        const def = REGIONS[id];
        if (starter.value !== 0 || def == null || !hof.regionUnlocked(id)) return;
        region.value = id;
    }

    function chooseStarter(id: number) {
        const def = regionDef.value;
        if (starter.value !== 0 || !startersFor(def, hof.clearCount(def.id)).includes(id)) return;
        starter.value = id;
        zoneId.value = zonesIn(def.id)[0].id;
        def.startingKeyItems.forEach(
            item => (keyItems.value = { ...keyItems.value, [item]: true })
        );
        const level = def.startLevel + 5 * (hof.levels.value.headStart ?? 0);
        receivePokemon(id, level, false);
        addLog({
            kind: "info",
            text: `${getSpecies(id).name}, I choose you! Your ${def.name} journey begins.`
        });
        startSearch();
    }

    /** Clears transient state after a Hall of Fame reset. */
    function resetTransient() {
        log.value = [];
        flash.value = null;
        battle.value = { kind: "search", remaining: 1, total: 1 };
        warnedNoBalls = false;
    }

    const nav: NavNode[] = [map.nav, party.nav, mart.nav, league.nav, dex.nav, hof.nav];

    return {
        name: "Journey",
        minWidth: 440,
        minimizable: false,
        classes: mobileClasses("main"),
        starter,
        region,
        regionDef,
        trials,
        rematch,
        rematchClears,
        martTier,
        finale,
        nextTrial,
        nextTrainers,
        clearTeam,
        money,
        box,
        partyIds,
        zoneId,
        badges,
        champion,
        keyItems,
        balls,
        stones,
        claimedSpecials,
        catchMode,
        ballMode,
        useMasterBallOnLegendaries,
        runTime,
        battlesWon,
        battle,
        log,
        flash,
        bonuses,
        cap,
        zone,
        partyBattlers,
        inTrainerBattle,
        nav,
        owns,
        evolutionTarget,
        battlerFor,
        receivePokemon,
        addToParty,
        removeFromParty,
        moveInParty,
        swapIntoParty,
        setParty,
        evolveWithStone,
        evolveByTrade,
        buyBalls,
        buyStone,
        grantKeyItem,
        spend,
        challengeGym,
        challengeFinale,
        forfeit,
        travel,
        zoneUnlocked,
        specialAvailable,
        claimSpecial,
        chooseStarter,
        chooseRegion,
        resetTransient,
        addLog,
        display: () => renderJourney()
    };
});

export type MainLayer = typeof main;

export { openLayer } from "./ui/nav";

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<Layer> => [main, map, party, mart, league, dex, hof];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */

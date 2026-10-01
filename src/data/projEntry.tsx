import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import type { Player } from "game/player";
import type { BallContext, Bonuses, PartyBattler, TrainerBattleState } from "game/pokemon/balance";
import {
    BALL_RESTOCK_TARGET,
    BASE_SHINY_CHANCE,
    ballCatchChance,
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
import { ALTERNATE_EVOLUTIONS, femaleForm, getSpecies, PRE_EVOLUTION } from "game/pokemon/data";
import type { BallId, KeyItemId } from "game/pokemon/items";
import { APRICORN_BALLS, BALLS, KEY_ITEMS, STONES } from "game/pokemon/items";
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
import type { EncounterKind, Moment, RegionId } from "game/pokemon/zones";
import { bugContestOn, momentOf, rollEncounter, zonesIn, ZONES_BY_ID } from "game/pokemon/zones";
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
    /** Caught in a Friend Ball: evolves by friendship without a Soothe Bell. */
    friend?: boolean;
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
    kind: EncounterKind;
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
/** The Bug-Catching Contest's free Sport Balls catch like Great Balls. */
const SPORT_BALL_MULTIPLIER = 1.5;
/** Catching one of these in the contest takes first place (Scyther, Pinsir). */
const CONTEST_WINNERS = [123, 127];
/** Wild battles won while a Pokémon is at the Day Care, per Egg. */
export const EGG_BATTLES = 40;
/**
 * Pokémon that can't breed at the Day Care on their own: legendaries (checked separately),
 * Unown, Ditto (it needs a partner) and the baby Pokémon.
 */
const CANNOT_BREED = new Set([201, 132, 172, 173, 174, 175, 236, 238, 239, 240]);

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
            masterBall: 0,
            levelBall: 0,
            lureBall: 0,
            moonBall: 0,
            friendBall: 0,
            loveBall: 0,
            fastBall: 0,
            heavyBall: 0
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
            sunStone: 0,
            linkCable: 0,
            sootheBell: 0,
            metalCoat: 0,
            kingsRock: 0,
            dragonScale: 0,
            upGrade: 0
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
    /** Bug-Catching Contest days (see Moment.day) you took part in, and won. */
    const contestEnteredDay = persistent<number>(-1);
    const contestWonDay = persistent<number>(-1);
    /** The Pokémon left at the Route 34 Day Care (0 for none), and battles toward its Egg. */
    const dayCareId = persistent<number>(0);
    const dayCareProgress = persistent<number>(0);

    /** The real-world clock, for Johto's day and night, swarms and the contest. */
    const moment = ref<Moment>(momentOf(new Date()));
    function refreshMoment() {
        const next = momentOf(new Date());
        const current = moment.value;
        if (next.time !== current.time || next.day !== current.day) moment.value = next;
    }
    const bugContestActive = computed(
        () => zoneId.value === "nationalPark" && bugContestOn(moment.value)
    );

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
    const bonuses = computed(
        (): Bonuses =>
            computeBonuses({
                dexCaught: dex.caughtCount.value,
                shinyCaught: dex.shinyCount.value,
                variantsCaught: dex.variantCaught.value,
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
     * (Ivysaur → Venusaur, then Venusaur ♀), then any alternate evolution (Pineco → Forretress,
     * then Shulker Forretress). Female forms evolve into female forms directly.
     */
    function evolutionTarget(fromId: number, into: number): number {
        if (!owns(into) || getSpecies(fromId).variant != null) return into;
        const candidates = [
            femaleForm(fromId) == null ? femaleForm(into)?.id : undefined,
            ...(ALTERNATE_EVOLUTIONS[into] ?? [])
        ].filter((id): id is number => id != null);
        return candidates.find(id => !owns(id)) ?? into;
    }

    function evolveWithStone(fromId: number, stone: StoneId) {
        const evolution = getSpecies(fromId).evolutions.find(
            e => e.method === "stone" && e.stone === stone
        );
        if (evolution == null || (stones.value[stone] ?? 0) <= 0) return;
        const into = evolutionTarget(fromId, evolution.into);
        if (owns(into) || !owns(fromId) || inTrainerBattle.value) return;
        useStone(stone);
        evolve(fromId, into, ` with a ${STONES[stone].name}`);
    }

    /**
     * Level evolutions happen by themselves as party members level up; this also evolves a
     * Pokémon that's already at the level (caught above it, or stuck at the level cap).
     */
    function evolveByLevel(fromId: number, evolvesInto: number) {
        const evolution = getSpecies(fromId).evolutions.find(
            e => e.method === "level" && e.into === evolvesInto
        );
        const level = box.value[fromId]?.level ?? 0;
        if (evolution == null || level < (evolution.level ?? Infinity)) return;
        const into = evolutionTarget(fromId, evolution.into);
        if (owns(into) || !owns(fromId) || inTrainerBattle.value) return;
        evolve(fromId, into, "");
    }

    /** Uses up one evolution item (a stone, Link Cable or Soothe Bell). */
    function useStone(id: StoneId) {
        stones.value = { ...stones.value, [id]: (stones.value[id] ?? 0) - 1 };
    }

    /** Trade evolutions use up a Link Cable, plus the held item some of them need. */
    function evolveByTrade(fromId: number) {
        const evolution = getSpecies(fromId).evolutions.find(e => e.method === "trade");
        if (evolution == null || (stones.value.linkCable ?? 0) <= 0) return;
        const held = evolution.heldItem;
        if (held != null && (stones.value[held] ?? 0) <= 0) return;
        const into = evolutionTarget(fromId, evolution.into);
        if (owns(into) || !owns(fromId) || inTrainerBattle.value) return;
        useStone("linkCable");
        if (held != null) useStone(held);
        evolve(
            fromId,
            into,
            held != null
                ? ` over the Link Cable, holding a ${STONES[held].name}`
                : " over the Link Cable"
        );
    }

    /** A friendship evolution right away, whatever the level, using up a Soothe Bell. */
    /** The Day Care opens on Route 34, past the Hive Badge, in Johto. */
    const dayCareOpen = computed(() => region.value === "johto" && badges.value >= 2);

    function canBreed(id: number): boolean {
        const species = getSpecies(id);
        const base = species.baseSpecies ?? id;
        return (
            owns(id) && !species.legendary && !CANNOT_BREED.has(base) && !(id >= 4000 && id < 4100)
        );
    }

    /** What the Day Care's Eggs hatch into: the first stage of the family, babies included. */
    function eggSpeciesOf(id: number): number {
        return familyRoot(id);
    }

    function leaveAtDayCare(id: number) {
        if (!dayCareOpen.value || (id !== 0 && !canBreed(id))) return;
        if (dayCareId.value !== id) dayCareProgress.value = 0;
        dayCareId.value = id;
    }

    /** Each wild battle won brings the Day Care's Egg closer, while its Pokémon isn't in the party. */
    function tendDayCare() {
        const id = dayCareId.value;
        if (!dayCareOpen.value || id === 0 || !canBreed(id) || partyIds.value.includes(id)) return;
        dayCareProgress.value++;
        if (dayCareProgress.value < EGG_BATTLES) return;
        dayCareProgress.value = 0;
        const babyId = eggSpeciesOf(id);
        // A shiny parent passes its colors on 1 time in 64, as in Gold and Silver.
        const shiny =
            box.value[id]?.shiny === true
                ? Math.random() < 1 / 64
                : Math.random() < BASE_SHINY_CHANCE * bonuses.value.shiny;
        const isNew = receivePokemon(babyId, 5, shiny);
        const name = getSpecies(babyId).name;
        const text = `The Day Care man found an Egg! It hatched into ${shiny ? "a shiny " : ""}${name}!`;
        addLog({
            kind: shiny ? "shiny" : "catch",
            text: isNew ? text : `${text} (x${dex.timesCaught(babyId)})`,
            speciesId: babyId,
            shiny
        });
        showFlash(text, "catch");
    }

    /** A Pokémon caught in a Friend Ball evolves by friendship without a Soothe Bell. */
    function befriend(id: number) {
        const entry = box.value[id];
        if (entry != null && entry.friend !== true) setBoxEntry(id, { ...entry, friend: true });
    }

    function evolveWithSootheBell(fromId: number, evolvesInto: number) {
        const evolution = getSpecies(fromId).evolutions.find(
            e => e.friendship === true && e.into === evolvesInto
        );
        const friend = box.value[fromId]?.friend === true;
        if (evolution == null || (!friend && (stones.value.sootheBell ?? 0) <= 0)) return;
        const into = evolutionTarget(fromId, evolution.into);
        if (owns(into) || !owns(fromId) || inTrainerBattle.value) return;
        if (friend) {
            evolve(fromId, into, " out of friendship (Friend Ball)");
        } else {
            useStone("sootheBell");
            evolve(fromId, into, " with a Soothe Bell");
        }
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
            if (level > entry.level && level === levelCap) {
                addLog({
                    kind: "levelup",
                    text: `${species.name} reached the level cap (Lv. ${level}). Further experience builds Effort.`,
                    speciesId: id,
                    shiny: entry.shiny
                });
            }
            // Checked every battle, not only on level-ups: a Pokémon caught above its
            // evolution level, or waiting at the level cap, still evolves.
            for (const evolution of species.evolutions) {
                if (evolution.method === "level" && level >= (evolution.level ?? Infinity)) {
                    const into = evolutionTarget(id, evolution.into);
                    if (!owns(into)) evolve(id, into, "");
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
        const only = BALLS[id].region;
        if (only != null && only !== region.value) return;
        if (!spend(price * count)) return;
        balls.value = { ...balls.value, [id]: (balls.value[id] ?? 0) + count };
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
    function chooseBall(
        wild: Pick<WildPokemon, "speciesId" | "level" | "kind">,
        important = false
    ): BallId | null {
        if (bonuses.value.autoRestock && balls.value.pokeBall < 5) {
            const count = Math.min(
                BALL_RESTOCK_TARGET - balls.value.pokeBall,
                Math.floor(money.value / (BALLS.pokeBall.price ?? Infinity))
            );
            if (count > 0) buyBalls("pokeBall", count);
        }
        const inStock = (id: BallId) => (balls.value[id] ?? 0) > 0;
        if (!important && ballMode.value !== "smart" && inStock(ballMode.value)) {
            return ballMode.value;
        }
        const species = getSpecies(wild.speciesId);
        const ctx = ballContext(wild);
        // The Friend Ball only earns its place on Pokémon that evolve by friendship.
        const friendly = species.evolutions.some(e => e.friendship === true);
        const candidates = (
            ["pokeBall", "greatBall", "ultraBall", ...APRICORN_BALLS] as BallId[]
        ).filter(id => inStock(id) && (id !== "friendBall" || friendly));
        if (candidates.length === 0) return null;
        const chance = (id: BallId) => ballCatchChance(id, ctx, bonuses.value.catch);
        const best = candidates.reduce((a, b) => (chance(b) > chance(a) ? b : a));
        if (important) return best;
        // Cheapest ball that's very likely to work (a Friend Ball first, when it will); otherwise
        // the one most likely to.
        const price = (id: BallId) => (id === "friendBall" ? -1 : (BALLS[id].price ?? Infinity));
        const good = [...candidates]
            .sort((a, b) => price(a) - price(b))
            .find(id => chance(id) >= 0.85);
        return good ?? best;
    }

    /** The first Pokémon of a species' evolution family (forms count as their species). */
    function familyRoot(id: number): number {
        let root = getSpecies(id).baseSpecies ?? id;
        while (PRE_EVOLUTION[root] != null) root = PRE_EVOLUTION[root]!;
        return root;
    }

    function ballContext(wild: Pick<WildPokemon, "speciesId" | "level" | "kind">): BallContext {
        const root = familyRoot(wild.speciesId);
        return {
            species: getSpecies(wild.speciesId),
            level: wild.level,
            kind: wild.kind,
            partyLevel: Math.max(0, ...partyIds.value.map(id => box.value[id]?.level ?? 0)),
            familyOwned: Object.keys(box.value).some(id => familyRoot(Number(id)) === root)
        };
    }

    function useBall(id: BallId) {
        balls.value = { ...balls.value, [id]: Math.max(0, (balls.value[id] ?? 0) - 1) };
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
            hof.levels.value.roddysRod ?? 0,
            moment.value
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
        tendDayCare();

        if (shouldTryCatch(wild) && bugContestActive.value && wild.kind === "walk") {
            contestCatch(wild);
        } else if (shouldTryCatch(wild)) {
            const ball = chooseBall(wild, wild.shiny);
            if (ball == null) {
                if (!warnedNoBalls) {
                    warnedNoBalls = true;
                    addLog({ kind: "fail", text: "Out of Poké Balls! Buy more at the Poké Mart." });
                }
            } else {
                useBall(ball);
                const chance = ballCatchChance(ball, ballContext(wild), bonuses.value.catch);
                if (Math.random() < chance) {
                    const isNew = receivePokemon(wild.speciesId, wild.level, wild.shiny);
                    if (ball === "friendBall") befriend(wild.speciesId);
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

    /**
     * The Bug-Catching Contest hands out free Sport Balls. Taking part wins five Great Balls;
     * catching a Scyther or Pinsir takes first place and the Sun Stone, once per contest day.
     */
    function contestCatch(wild: WildPokemon) {
        const species = getSpecies(wild.speciesId);
        const day = moment.value.day;
        const chance = catchChance(species.captureRate, SPORT_BALL_MULTIPLIER, bonuses.value.catch);
        if (Math.random() >= chance) {
            addLog({
                kind: "fail",
                text: `${species.name} broke free from the Sport Ball!`,
                speciesId: wild.speciesId,
                shiny: wild.shiny
            });
            return;
        }
        const isNew = receivePokemon(wild.speciesId, wild.level, wild.shiny);
        const text = `Caught ${wild.shiny ? "a shiny " : ""}${species.name} in the Bug-Catching Contest!`;
        addLog({
            kind: wild.shiny ? "shiny" : "catch",
            text: isNew ? text : `${text} (x${dex.timesCaught(wild.speciesId)})`,
            speciesId: wild.speciesId,
            shiny: wild.shiny
        });
        showFlash(text, "catch");
        if (contestEnteredDay.value !== day) {
            contestEnteredDay.value = day;
            balls.value = { ...balls.value, greatBall: balls.value.greatBall + 5 };
            addLog({
                kind: "info",
                text: "Thanks for entering the contest! You receive 5 Great Balls."
            });
        }
        if (contestWonDay.value !== day && CONTEST_WINNERS.includes(wild.speciesId)) {
            contestWonDay.value = day;
            stones.value = { ...stones.value, sunStone: (stones.value.sunStone ?? 0) + 1 };
            const prize = `Your ${species.name} wins the Bug-Catching Contest! You receive a Sun Stone.`;
            addLog({ kind: "badge", text: prize, speciesId: wild.speciesId });
            notify(`🏆 ${prize}`, "success");
        }
    }

    /** The Radio Tower's Lucky Number for a day: the same for everyone. */
    function luckyNumberOn(day: number) {
        return (Math.imul(day ^ 0x5bd1e995, 0x27d4eb2d) >>> 0) % 100000;
    }

    function ensureTrainerId() {
        if (hof.trainerId.value === 0) hof.trainerId.value = 1 + Math.floor(Math.random() * 99999);
        return hof.trainerId.value;
    }

    /**
     * The Lucky Number Show (Radio Card): once a day, match the trailing digits of today's number
     * with your Trainer ID. One digit wins Great Balls, two Ultra Balls, three a Sun Stone, four a
     * Link Cable and Soothe Bell, all five a Master Ball.
     */
    function drawLuckyNumber() {
        const day = moment.value.day;
        if (keyItems.value.radioCard !== true || hof.luckyNumberDay.value === day) return;
        hof.luckyNumberDay.value = day;
        const id = String(ensureTrainerId()).padStart(5, "0");
        const lucky = String(luckyNumberOn(day)).padStart(5, "0");
        let digits = 0;
        while (digits < 5 && id[4 - digits] === lucky[4 - digits]) digits++;
        const add = (kind: "balls" | "stones", key: string, n: number) => {
            if (kind === "balls") {
                const k = key as BallId;
                balls.value = { ...balls.value, [k]: balls.value[k] + n };
            } else {
                const k = key as StoneId;
                stones.value = { ...stones.value, [k]: (stones.value[k] ?? 0) + n };
            }
        };
        const prizes = [
            "no prize this time",
            "5 Great Balls",
            "5 Ultra Balls",
            "a Sun Stone",
            "a Link Cable and a Soothe Bell",
            "a Master Ball"
        ];
        if (digits === 1) add("balls", "greatBall", 5);
        if (digits === 2) add("balls", "ultraBall", 5);
        if (digits === 3) add("stones", "sunStone", 1);
        if (digits === 4) {
            add("stones", "linkCable", 1);
            add("stones", "sootheBell", 1);
        }
        if (digits === 5) add("balls", "masterBall", 1);
        const text = `Lucky Number Show: today's number is ${lucky}. Your ID ${id} matches ${digits} digit${digits === 1 ? "" : "s"}: ${prizes[digits]}!`;
        addLog({ kind: digits > 0 ? "badge" : "info", text });
        if (digits > 0) notify(`📻 ${text}`, "success");
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
                const ball = useMaster
                    ? "masterBall"
                    : chooseBall(
                          { speciesId: special.speciesId, level: special.level, kind: "walk" },
                          true
                      );
                if (ball == null) {
                    addLog({ kind: "fail", text: `No Poké Balls! ${species.name} flew away.` });
                    return;
                }
                useBall(ball);
                const chance = ballCatchChance(
                    ball,
                    ballContext({
                        speciesId: special.speciesId,
                        level: special.level,
                        kind: "walk"
                    }),
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
        refreshMoment();
        // The Link Cable used to be a reusable key item; trade it in for three of the new,
        // used-up-per-evolution Link Cables.
        if ((keyItems.value as Record<string, boolean>).linkCable === true) {
            const rest: Record<string, boolean> = { ...keyItems.value };
            delete rest.linkCable;
            keyItems.value = rest;
            stones.value = { ...stones.value, linkCable: (stones.value.linkCable ?? 0) + 3 };
        }
        // Journeys started before a region gained a starting key item (Rock Smash in the Sevii
        // Islands) get it now.
        if (starter.value !== 0) {
            regionDef.value.startingKeyItems
                .filter(item => !keyItems.value[item])
                .forEach(grantKeyItem);
        }
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
        if (
            (special.kind === "legendary" || special.kind === "gift") &&
            special.weekdays != null &&
            !special.weekdays.includes(moment.value.weekday)
        ) {
            return false;
        }
        return true;
    }

    function claimSpecial(special: SpecialEncounter) {
        if (!specialAvailable(special) || claimedSpecials.value[special.id]) return;
        if (special.kind === "legendary") {
            challengeLegendary(special);
            return;
        }
        if (special.kind === "boss") {
            challengeBoss(special);
            return;
        }
        if (special.kind === "trade" && !owns(special.wants)) return;
        if (special.kind === "gift" && special.price != null && !spend(special.price)) return;
        claimedSpecials.value = { ...claimedSpecials.value, [special.id]: true };
        // The Odd Egg hatches into one of its babies, often shiny.
        const speciesId =
            special.kind === "gift" && special.pool != null
                ? special.pool[Math.floor(Math.random() * special.pool.length)]
                : special.speciesId;
        const shiny = special.kind === "gift" && Math.random() < (special.shinyChance ?? 0);
        receivePokemon(speciesId, special.level, shiny);
        const species = getSpecies(speciesId);
        const text =
            special.kind === "trade"
                ? `Traded for ${species.name}! (You kept your ${getSpecies(special.wants).name}.)`
                : special.kind === "gift" && special.pool != null
                  ? `The Egg hatched into ${shiny ? "a shiny " : ""}${species.name}!`
                  : `Received ${species.name}!`;
        addLog({ kind: shiny ? "shiny" : "catch", text, speciesId, shiny });
        showFlash(text, "catch");
    }

    /** A one-off battle against a famous Trainer (Red on Mt. Silver), with a prize. */
    function challengeBoss(special: Extract<SpecialEncounter, { kind: "boss" }>) {
        startTrainerBattle({
            label: `${special.trainer.name} on ${special.place}`,
            trainers: [withStrength(special.trainer, rematch.value)],
            onWin() {
                claimedSpecials.value = { ...claimedSpecials.value, [special.id]: true };
                const prizes: string[] = [];
                for (const [ball, n] of Object.entries(special.prizeBalls ?? {}) as [
                    BallId,
                    number
                ][]) {
                    balls.value = { ...balls.value, [ball]: (balls.value[ball] ?? 0) + n };
                    prizes.push(`${n} ${BALLS[ball].name}${n === 1 ? "" : "s"}`);
                }
                money.value += special.trainer.prizeMoney;
                const text = `You defeated ${special.trainer.name} at ${special.place}!${
                    prizes.length > 0 ? ` You receive ${prizes.join(" and ")}.` : ""
                }`;
                addLog({ kind: "badge", text });
                notify(`🏆 ${text}`, "success");
            }
        });
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
        moment,
        bugContestActive,
        contestEnteredDay,
        contestWonDay,
        luckyNumberOn,
        ensureTrainerId,
        drawLuckyNumber,
        ballContext,
        dayCareId,
        dayCareProgress,
        dayCareOpen,
        canBreed,
        eggSpeciesOf,
        leaveAtDayCare,
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
        evolveByLevel,
        evolveByTrade,
        evolveWithSootheBell,
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

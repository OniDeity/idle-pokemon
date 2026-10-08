import { fieldPowers as boxFieldPowers, meetsFieldNeed } from "game/pokemon/almia";
import { ROAR_SIGNS } from "game/pokemon/oblivia";
import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import type { Player } from "game/player";
import type { BallContext, Bonuses, PartyBattler, TrainerBattleState } from "game/pokemon/balance";
import {
    BALL_RESTOCK_TARGET,
    BASE_SHINY_CHANCE,
    ballCatchChance,
    catchChance,
    POKE_ASSIST_BONUS,
    STYLER_POWER,
    battleXp,
    battlePartner,
    bestMatchup,
    computeBonuses,
    initialTrainerBattle,
    memberMultiplier,
    effortMultiplier,
    HEART_BATTLES,
    hasMilestone,
    moneyYield,
    stepTrainerBattle,
    trainerTeam,
    wildDps
} from "game/pokemon/balance";
import type { ContestCategory, ContestRank } from "game/pokemon/contests";
import {
    CATEGORY_NAMES,
    CONTEST_PIKACHU,
    CONTEST_PRIZE_MONEY,
    CONTEST_SECONDS,
    contestScore,
    MAX_CONDITION,
    nextRank,
    POKEBLOCK_GAIN,
    POKEBLOCK_PRICE,
    RANK_NAMES,
    winChance
} from "game/pokemon/contests";
import type { Evolution, PokemonType, Species, StoneId } from "game/pokemon/data";
import {
    ALTERNATE_EVOLUTIONS,
    arceusForm,
    typeEffectiveness,
    femaleForm,
    getSpecies,
    isShadow,
    PRE_EVOLUTION,
    shadowOf
} from "game/pokemon/data";
import { SHADOW_TRAINERS } from "game/pokemon/colosseum";
import type { BallId, KeyItemId } from "game/pokemon/items";
import { APRICORN_BALLS, BALLS, KEY_ITEMS, STONES } from "game/pokemon/items";
import type { MechanicDefinition, MechanicId } from "game/pokemon/mechanics";
import { isReleased } from "game/pokemon/pokedex";
import { MECHANIC_LIST, MECHANICS } from "game/pokemon/mechanics";
import type { SpecialEncounter } from "game/pokemon/specials";
import { LEGENDARY_TIME_LIMIT, SPECIAL_ENCOUNTERS } from "game/pokemon/specials";
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
import { trialFor } from "game/pokemon/trainers";
import { criticalCaptureChance, inSeason, SEASON_NAMES, seasonAt } from "game/pokemon/unova";
import { GROTTO_BATTLES, grottoPool } from "game/pokemon/unova2";
import type { EncounterKind, RegionId, ZoneExtras } from "game/pokemon/zones";
import {
    activePools,
    catchableIn,
    MAX_RADAR_CHAIN,
    radarShinyMultiplier,
    rollEncounter,
    zonePools,
    zonesIn,
    ZONES_BY_ID
} from "game/pokemon/zones";
import type { HoneyTree } from "game/pokemon/sinnoh";
import {
    HONEY_BATTLES,
    HONEY_PRICE,
    HONEY_TREES,
    munchlaxTrees,
    rollHoneyTree
} from "game/pokemon/sinnoh";
import type { UndergroundItem } from "game/pokemon/underground";
import {
    digWall,
    FOSSIL_LEVEL,
    MAX_WALLS,
    PLATE_TYPES,
    UNDERGROUND_BATTLES
} from "game/pokemon/underground";
import { BUG_CONTEST_FEE, JOHTO_SWARMS, SWARM_PRICE } from "game/pokemon/johto";
import { computed, ref } from "vue";
import { notify } from "data/notifications";
import settings from "game/settings";
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
    /** A Shadow Pokémon's closed heart: wild battles won in the party until it can be purified. */
    heart?: number;
    /** Contest conditions raised with Pokéblocks (Cool, Beauty, Cute, Smart, Tough). */
    condition?: Partial<Record<ContestCategory, number>>;
};

/** A slathered Honey Tree: the Pokémon coming to it, and the battle count when it arrives. */
export type HoneyTreeState = { speciesId: number; level: number; readyAt: number };

/** The Poké Radar's chain: where, on which species, and how long. */
export type RadarChain = { zoneId: string; speciesId: number; count: number };

/** A contest under way: who's competing, where, and the seconds left. */
export type ContestEntry = {
    speciesId: number;
    category: ContestCategory;
    rank: ContestRank;
    remaining: number;
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
    | { kind: "wild"; wild: WildPokemon; active: number; partner?: number }
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

/** Iteration guard for offline catch-up: stop simulating after this many encounters per tick. */
const MAX_ENCOUNTERS_PER_TICK = 5000;
const LOG_LENGTH = 40;
/** Seconds of game time between automation decisions. */
const AUTOMATION_INTERVAL = 2;
/** Catching one of these after entering the contest takes first place (Scyther, Pinsir). */
const CONTEST_WINNERS = [123, 127];
/** Price of one Poké Snack. */
export const POKE_SNACK_PRICE = 30;
/** Wild battles won between Lucky Number Show draws (with the Radio Card). */
export const LUCKY_DRAW_BATTLES = 100;
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
            upGrade: 0,
            deepSeaTooth: 0,
            deepSeaScale: 0,
            prismScale: 0,
            shinyStone: 0,
            duskStone: 0,
            dawnStone: 0,
            iceStone: 0,
            ovalStone: 0,
            razorClaw: 0,
            razorFang: 0,
            protector: 0,
            electirizer: 0,
            magmarizer: 0,
            dubiousDisc: 0,
            reaperCloth: 0
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
    /** Whether this journey paid the Bug-Catching Contest's entry fee, and won it. */
    const contestEntered = persistent<boolean>(false);
    const contestWon = persistent<boolean>(false);
    /** The places whose Pokégear swarm this journey tuned in to. */
    const swarmsJoined = persistent<Record<string, boolean>>({}, false);
    /** Poké Snacks in the bag: each Poké Spot encounter uses one. */
    const pokeSnacks = persistent<number>(0);
    /** Orre's one-of-a-kind Shadow Pokémon snagged this journey, by Shadow form id. */
    const snaggedShadows = persistent<Record<string, boolean>>({}, false);
    /** The Pokémon left at the Day Care (0 for none), and battles toward its Egg. */
    const dayCareId = persistent<number>(0);
    const dayCareProgress = persistent<number>(0);
    /** The Lucky Number Show's last number this journey (-1 before the first draw). */
    const lastLuckyNumber = persistent<number>(-1);
    /** Eggs the Day Care has found this journey. */
    const eggsHatched = persistent<number>(0);
    /** Sinnoh's Honey Trees slathered this journey, by tree. */
    const honeyTrees = persistent<Record<string, HoneyTreeState>>({}, false);
    /** Fresh Underground walls waiting to be dug, and battles toward the next one. */
    const undergroundWalls = persistent<number>(0);
    const undergroundProgress = persistent<number>(0);
    /** The Poké Radar's chain (a Pokédex reward). */
    const radarChain = persistent<RadarChain>({ zoneId: "", speciesId: 0, count: 0 }, false);
    /** Wild battles toward the next Hidden Grotto (Black 2 and White 2's mechanic). */
    const grottoProgress = persistent<number>(0);

    /** What this journey has added to its places' pools: swarms and the contest. */
    /** The box's strongest Field Ability powers, for Almia's obstacles. */
    const fieldPowers = computed(() => {
        const powers = boxFieldPowers(Object.keys(box.value).map(Number));
        // Oblivia's hidden Pokémon come out for a legendary beast's Roar (its Ranger Sign).
        if (hof.rangerSignSpecies.value.some(id => ROAR_SIGNS.includes(id))) powers.roar = 1;
        return powers;
    });

    const zoneExtras = computed<ZoneExtras>(() => ({
        swarms: swarmsJoined.value,
        bugContest: contestEntered.value,
        snagged: snaggedShadows.value,
        // Outside Orre, Cipher Peons roam once the Snag Machine is unlocked.
        cipherPeons:
            ZONES_BY_ID[zoneId.value]?.trainerBattles !== true && mechanicOn("snagMachine"),
        pokeRadar: hasPokeRadar.value,
        radarChain:
            hasPokeRadar.value &&
            radarChain.value.zoneId === zoneId.value &&
            radarChain.value.speciesId !== 0
                ? radarChain.value
                : undefined,
        palPark: hof.palParkRegions.value,
        fieldPowers: fieldPowers.value,
        season: season.value,
        phenomena: mechanicOn("phenomena"),
        phenomenaBoost: 1 + 0.25 * (hof.levels.value.encounterPower ?? 0)
    }));

    // Transient state: rebuilt on load.
    const battle = ref<BattleState>({ kind: "search", remaining: 1, total: 1 });
    const log = ref<LogEntry[]>([]);
    const flash = ref<Flash | null>(null);
    let logId = 0;
    let warnedNoBalls = false;
    let warnedNoSnacks = false;

    function addLog(entry: Omit<LogEntry, "id">) {
        log.value = [{ ...entry, id: logId++ }, ...log.value].slice(0, LOG_LENGTH);
    }
    function showFlash(text: string, kind: LogKind) {
        if (settings.pkBattleBanners === false) return;
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
    /** The season (Black and White's Seasons mechanic), turning every SEASON_BATTLES battles. */
    const season = computed(() => (mechanicOn("seasons") ? seasonAt(battlesWon.value) : undefined));
    /** Wild battles per Hidden Grotto (Grotto Power shortens it). */
    const grottoBattles = computed(() =>
        Math.max(10, Math.round(GROTTO_BATTLES * (1 - 0.1 * (hof.levels.value.grottoPower ?? 0))))
    );
    const grottoReady = computed(
        () => mechanicOn("hiddenGrottoes") && grottoProgress.value >= grottoBattles.value
    );
    /** The Poké Radar, a Pokédex reward from Professor Oak. */
    const hasPokeRadar = computed(() => hasMilestone(dex.caughtCount.value, "Poké Radar"));
    /** Wild battles per Day Care Egg (the Destiny Knot halves it). */
    const eggBattles = computed(() =>
        Math.max(
            5,
            Math.round(
                (hasMilestone(dex.caughtCount.value, "Destiny Knot")
                    ? EGG_BATTLES / 2
                    : EGG_BATTLES) *
                    (hasMilestone(dex.caughtCount.value, "Oval Charm") ? 0.75 : 1) *
                    (1 - 0.1 * (hof.levels.value.flameBody ?? 0))
            )
        )
    );
    /** The Masuda Method (Fame): Day Care Eggs are likelier to be shiny. */
    const eggShinyMultiplier = computed(() => 1 + 0.5 * (hof.levels.value.masudaMethod ?? 0));
    /** Contest upgrades (Fame): stronger Pokéblocks, shorter and easier contests. */
    const pokeblockGain = computed(() => POKEBLOCK_GAIN + 5 * (hof.levels.value.pokeblockKit ?? 0));
    function contestSeconds(rank: ContestRank): number {
        return CONTEST_SECONDS[rank] * (1 - 0.1 * (hof.levels.value.contestStar ?? 0));
    }
    function contestWinChance(id: number, category: ContestCategory, rank: ContestRank) {
        const bonus = 0.05 * (hof.levels.value.contestStar ?? 0);
        return Math.min(1, winChance(contestScoreOf(id, category), rank) + bonus);
    }
    /** Extra Fame this journey has earned (the Distortion World). */
    const fameBonus = computed(() =>
        SPECIAL_ENCOUNTERS.filter(
            s => s.kind === "boss" && s.fameBonus != null && claimedSpecials.value[s.id]
        ).reduce((product, s) => product * (s.kind === "boss" ? (s.fameBonus ?? 1) : 1), 1)
    );
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
        regionDef.value.trials.map(t => withStrength(trialFor(t, starter.value), rematch.value))
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

    /**
     * Whether a species from a later generation can be had on this journey: always in its own
     * generation's regions, and everywhere once that generation's mechanic is unlocked (Gen 4's
     * evolutions of older Pokémon, Electabuzz into Electivire, and its babies from Eggs).
     */
    function generationOpen(id: number): boolean {
        const species = getSpecies(id).baseSpecies ?? id;
        // Gen 5 added no evolutions or babies to older Pokémon, so its families are always open.
        return (
            species <= (regionDef.value.newestSpecies ?? 386) ||
            species > 493 ||
            mechanicOn("sinnohEvolutions")
        );
    }

    /** A species' evolutions that can happen on this journey. */
    function evolutionsOf(id: number): Evolution[] {
        return getSpecies(id).evolutions.filter(e => generationOpen(e.into));
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
                shiny,
                ...(isShadow(id) ? { heart: HEART_BATTLES } : {})
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
        notify(text, "success", "evolutions");
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
        const evolution = evolutionsOf(fromId).find(e => e.method === "stone" && e.stone === stone);
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
        const evolution = evolutionsOf(fromId).find(
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
        const evolution = evolutionsOf(fromId).find(e => e.method === "trade");
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

    /**
     * Whether this journey has reached where a generation mechanic is introduced. Clearing that
     * region on an earlier journey counts too (for saves from before mechanics were tracked).
     */
    function mechanicReached(def: MechanicDefinition): boolean {
        return (
            (starter.value !== 0 &&
                region.value === def.region &&
                badges.value >= def.trialsRequired) ||
            hof.clearCount(def.region) > 0
        );
    }

    /** Whether a generation mechanic works on this journey: unlocked, or reached right now. */
    function mechanicOn(id: MechanicId): boolean {
        return hof.mechanicUnlocked(id) || mechanicReached(MECHANICS[id]);
    }

    /** Unlocks every mechanic this journey has reached, for good and in every region. */
    function checkMechanics() {
        for (const def of MECHANIC_LIST) {
            if (mechanicReached(def) && hof.unlockMechanic(def.id)) {
                addLog({
                    kind: "info",
                    text: `${def.name} unlocked! From now on it works in every region.`
                });
            }
        }
    }

    /**
     * The Day Care: first met on Route 34, past the Hive Badge, in Johto; once breeding is
     * unlocked there, every region's journeys have one from the start.
     */
    const dayCareOpen = computed(() => mechanicOn("breeding"));

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
    /**
     * How useful a parent's Egg is: 2 if it hatches a Pokémon your Pokédex doesn't have, 1 if
     * it's one you haven't got this journey, 0 otherwise.
     */
    function eggValue(parentId: number): number {
        const egg = eggSpeciesOf(parentId);
        return !dex.entry(egg).caught ? 2 : !owns(egg) ? 1 : 0;
    }

    /** Pokémon that could be left at the Day Care right now (bred, and not in the party). */
    function dayCareCandidates(): number[] {
        return Object.keys(box.value)
            .map(Number)
            .filter(id => canBreed(id) && !partyIds.value.includes(id));
    }

    /**
     * The Pokémon whose Egg is most useful, or undefined when no Egg would be. Ties go to a
     * shiny parent (its Eggs are shiny 1 time in 64), then to the lowest Pokédex number.
     */
    function bestDayCareParent(): number | undefined {
        let best: number | undefined;
        let bestScore = 0;
        for (const id of dayCareCandidates()) {
            const score = eggValue(id) * 2 + (box.value[id]?.shiny === true ? 1 : 0);
            if (eggValue(id) > 0 && score > bestScore) {
                best = id;
                bestScore = score;
            }
        }
        return best;
    }

    /** With auto-swap on, moves the Day Care to a parent with a more useful Egg. */
    function rotateDayCare() {
        const current = dayCareId.value;
        const stuck = current === 0 || !canBreed(current) || partyIds.value.includes(current);
        const best = bestDayCareParent();
        if (best == null || best === current) return;
        if (!stuck && eggValue(best) <= eggValue(current)) return;
        leaveAtDayCare(best);
        addLog({
            kind: "info",
            text: `Day Care: left ${getSpecies(best).name} for a ${getSpecies(eggSpeciesOf(best)).name} Egg.`,
            speciesId: best
        });
    }

    function tendDayCare() {
        if (!dayCareOpen.value) return;
        const id = dayCareId.value;
        if (id === 0 || !canBreed(id) || partyIds.value.includes(id)) {
            // Nobody's breeding: auto-swap looks for someone now and then.
            if (hof.dayCareRotate.value && battlesWon.value % EGG_BATTLES === 0) rotateDayCare();
            return;
        }
        dayCareProgress.value++;
        if (dayCareProgress.value < eggBattles.value) return;
        dayCareProgress.value = 0;
        eggsHatched.value++;
        const babyId = eggSpeciesOf(id);
        // A shiny parent passes its colors on 1 time in 64, as in Gold and Silver.
        const shiny =
            box.value[id]?.shiny === true
                ? Math.random() < eggShinyMultiplier.value / 64
                : Math.random() <
                  BASE_SHINY_CHANCE * bonuses.value.shiny * eggShinyMultiplier.value;
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
        if (hof.dayCareRotate.value) rotateDayCare();
    }

    /** A Pokémon caught in a Friend Ball evolves by friendship without a Soothe Bell. */
    function befriend(id: number) {
        const entry = box.value[id];
        if (entry != null && entry.friend !== true) setBoxEntry(id, { ...entry, friend: true });
    }

    function evolveWithSootheBell(fromId: number, evolvesInto: number) {
        const evolution = evolutionsOf(fromId).find(
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
            for (const evolution of evolutionsOf(id)) {
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
        const mechanic = BALLS[id].mechanic;
        if (mechanic != null && !mechanicOn(mechanic)) return;
        if (!spend(price * count)) return;
        balls.value = { ...balls.value, [id]: (balls.value[id] ?? 0) + count };
        warnedNoBalls = false;
    }

    /** Poké Snacks come in tens. */
    function buyPokeSnacks(count: number) {
        if (count <= 0 || !spend(POKE_SNACK_PRICE * count)) return;
        pokeSnacks.value += count;
        warnedNoSnacks = false;
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

    /**
     * The first Pokémon of a species' evolution family (forms count as their species), among
     * species the game has released (Marill's Eggs stay Marill until Azurill arrives).
     */
    function familyRoot(id: number): number {
        let root = getSpecies(id).baseSpecies ?? id;
        while (
            PRE_EVOLUTION[root] != null &&
            isReleased(PRE_EVOLUTION[root]!) &&
            generationOpen(PRE_EVOLUTION[root]!)
        ) {
            root = PRE_EVOLUTION[root]!;
        }
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

    /** Types of the Pokémon in the box but not the party, for Poké Assist. */
    const assistTypes = computed(() => {
        const types = new Set<PokemonType>();
        // Ranger Signs call their legendary Pokémon to help, wherever you are.
        if (mechanicOn("rangerSigns")) {
            hof.rangerSignSpecies.value.forEach(id =>
                getSpecies(id).types.forEach(type => types.add(type))
            );
        }
        for (const key of Object.keys(box.value)) {
            if (!partyIds.value.includes(Number(key))) {
                getSpecies(Number(key)).types.forEach(type => types.add(type));
            }
        }
        return [...types];
    });

    /**
     * Poké Assist (Fiore's mechanic): a box Pokémon whose type is super effective against a wild
     * Pokémon lends a hand, for +25% damage.
     */
    function pokeAssist(target: Species): number {
        if (!mechanicOn("pokeAssist")) return 1;
        return assistTypes.value.some(type => typeEffectiveness(type, target.types) > 1)
            ? POKE_ASSIST_BONUS
            : 1;
    }

    /** Who fights a wild Pokémon: the best matchup, plus a partner in double battles. */
    function wildFighters(target: BattlerStats): { active: number; partner: number } {
        const party = partyBattlers.value;
        const damage = bonuses.value.damage;
        const active = bestMatchup(party, target, damage, null);
        const partner =
            active !== -1 && mechanicOn("doubleBattles")
                ? battlePartner(party, target, damage, active, null)
                : -1;
        return { active, partner };
    }

    function spawnWild() {
        // Poké Spots only draw Pokémon out with a Poké Snack.
        if (ZONES_BY_ID[zoneId.value]?.pokeSpot === true) {
            if (pokeSnacks.value <= 0) {
                if (!warnedNoSnacks) {
                    warnedNoSnacks = true;
                    addLog({
                        kind: "fail",
                        text: "Out of Poké Snacks! Buy more at the Poké Mart to lure Pokémon to the Poké Spot."
                    });
                }
                startSearch();
                return;
            }
            pokeSnacks.value--;
        }
        const rolled = rollEncounter(
            zoneId.value,
            keyItems.value,
            Math.random,
            hof.levels.value.roddysRod ?? 0,
            zoneExtras.value
        );
        if (rolled == null) {
            startSearch();
            return;
        }
        startWildBattle(rolled.speciesId, rolled.level, rolled.kind);
    }

    /** The species a Poké Radar chain goes by: forms (female, cloaks) count as their species. */
    function chainSpecies(id: number): number {
        return getSpecies(id).baseSpecies ?? id;
    }

    /** Sends out a wild Pokémon: rolls whether it's shiny and picks who fights it. */
    function startWildBattle(speciesId: number, level: number, kind: EncounterKind) {
        const chain = zoneExtras.value.radarChain;
        const chained =
            kind === "walk" && chain != null && chainSpecies(speciesId) === chain.speciesId;
        const shinyOdds =
            BASE_SHINY_CHANCE *
            bonuses.value.shiny *
            (chained ? radarShinyMultiplier(chain.count) : 1);
        const shiny = Math.random() < shinyOdds;
        const target = { species: getSpecies(speciesId), level };
        const hp = maxHp(target);
        dex.markSeen(speciesId);
        battle.value = {
            kind: "wild",
            wild: { speciesId, level, kind, shiny, hp, maxHp: hp },
            ...wildFighters(target)
        };
        if (shiny) {
            const text = `A shiny ${target.species.name} appeared!`;
            addLog({ kind: "shiny", text, speciesId, shiny: true });
            showFlash(text, "shiny");
            notify(`✨ ${text}`, "success", "shinies", {
                key: `shiny:${speciesId}`,
                many: count => `✨ Found ${count} shiny ${target.species.name}!`
            });
        }
    }

    /**
     * The Poké Radar locks on to the first grass Pokémon met in a place, and each one of that
     * species beaten there adds to the chain. Travelling elsewhere starts a new one.
     */
    function extendRadarChain(wild: WildPokemon) {
        if (!hasPokeRadar.value || wild.kind !== "walk") return;
        const species = chainSpecies(wild.speciesId);
        const chain = radarChain.value;
        if (chain.zoneId !== zoneId.value || chain.speciesId === 0) {
            radarChain.value = { zoneId: zoneId.value, speciesId: species, count: 1 };
        } else if (chain.speciesId === species) {
            radarChain.value = { ...chain, count: Math.min(MAX_RADAR_CHAIN, chain.count + 1) };
        }
    }

    /** Breaks the chain: the Poké Radar locks on to the next grass Pokémon instead. */
    function breakRadarChain() {
        radarChain.value = { zoneId: "", speciesId: 0, count: 0 };
    }

    function shouldTryCatch(wild: WildPokemon) {
        // A grotto's Pokémon was visited on purpose: it's always caught.
        if (wild.kind === "grotto") return true;
        if (catchMode.value === "off") return false;
        // Orre's trainers keep their own Pokémon; only Shadow Pokémon can be snagged.
        if (!catchableIn(zoneId.value, wild.speciesId)) return false;
        if (isShadow(wild.speciesId) && keyItems.value.snagMachine !== true) return false;
        if (catchMode.value === "all") return true;
        const entry = box.value[wild.speciesId];
        return entry == null || (wild.shiny && !entry.shiny);
    }

    /** Season Power (Fame): in-season wild Pokémon give more experience and Pokédollars. */
    function seasonBonus(speciesId: number): number {
        const current = season.value;
        const level = hof.levels.value.seasonPower ?? 0;
        return current != null && level > 0 && inSeason(speciesId, current) ? 1 + 0.1 * level : 1;
    }

    function defeatWild(wild: WildPokemon) {
        const species = getSpecies(wild.speciesId);
        const before = season.value;
        battlesWon.value++;
        const boost = seasonBonus(wild.speciesId);
        money.value += moneyYield(wild.level) * bonuses.value.money * boost;
        gainXp(battleXp({ species, level: wild.level }) * bonuses.value.xp * boost);
        if (season.value != null && season.value !== before) {
            addLog({ kind: "info", text: `🍂 ${SEASON_NAMES[season.value]} has come.` });
        }
        if (mechanicOn("hiddenGrottoes") && grottoProgress.value < grottoBattles.value) {
            grottoProgress.value++;
            if (grottoProgress.value === grottoBattles.value) {
                addLog({
                    kind: "info",
                    text: "A Hidden Grotto has filled. Something is waiting inside!"
                });
            }
        }
        tendDayCare();
        tendUnderground();
        extendRadarChain(wild);
        openHearts();
        if (battlesWon.value % LUCKY_DRAW_BATTLES === 0) drawLuckyNumber();

        if (shouldTryCatch(wild)) {
            // Pokémon Ranger regions capture with the Capture Styler: no Poké Balls.
            const styler = regionDef.value.styler === true;
            const ball = styler ? null : chooseBall(wild, wild.shiny);
            if (ball == null && !styler) {
                if (!warnedNoBalls) {
                    warnedNoBalls = true;
                    addLog({ kind: "fail", text: "Out of Poké Balls! Buy more at the Poké Mart." });
                }
            } else {
                if (ball != null) useBall(ball);
                const chance =
                    wild.kind === "grotto"
                        ? 1
                        : ball != null
                          ? ballCatchChance(ball, ballContext(wild), bonuses.value.catch)
                          : catchChance(species.captureRate, STYLER_POWER, bonuses.value.catch);
                const critical = wild.kind !== "grotto" && criticalCapture(chance);
                if (critical || Math.random() < chance) {
                    if (critical) addLog({ kind: "info", text: "Critical capture!" });
                    const isNew = receivePokemon(wild.speciesId, wild.level, wild.shiny);
                    if (ball === "friendBall") befriend(wild.speciesId);
                    const shadow = isShadow(wild.speciesId);
                    if (
                        shadow &&
                        Object.values(zonePools(zoneId.value)).some(entries =>
                            entries?.some(e => e.id === wild.speciesId)
                        )
                    ) {
                        snaggedShadows.value = { ...snaggedShadows.value, [wild.speciesId]: true };
                    }
                    const owner = shadow
                        ? (SHADOW_TRAINERS[wild.speciesId] ?? "a Cipher Peon")
                        : undefined;
                    const text =
                        owner != null
                            ? `Snagged ${owner}'s ${wild.shiny ? "shiny " : ""}${species.name}!`
                            : styler
                              ? `Captured ${wild.shiny ? "a shiny " : ""}${species.name} with the Capture Styler!`
                              : `Caught ${wild.shiny ? "a shiny " : ""}${species.name}!`;
                    addLog({
                        kind: wild.shiny ? "shiny" : "catch",
                        text: isNew ? text : `${text} (x${dex.timesCaught(wild.speciesId)})`,
                        speciesId: wild.speciesId,
                        shiny: wild.shiny
                    });
                    showFlash(text, "catch");
                    checkContestWin(wild);
                } else {
                    const text =
                        ball != null
                            ? `${species.name} broke free from the ${BALLS[ball].name}!`
                            : `${species.name} broke out of the Capture Styler's loops!`;
                    addLog({ kind: "fail", text, speciesId: wild.speciesId, shiny: wild.shiny });
                    showFlash("Oh no! It broke free!", "fail");
                }
            }
        }
        startSearch();
    }

    /**
     * Critical captures (Black and White's mechanic): a roll, before the normal one, that makes
     * the catch certain. Its chance grows with the Pokédex.
     */
    function criticalCapture(chance: number): boolean {
        if (!mechanicOn("criticalCapture") || chance >= 1) return false;
        const boost = 1 + 0.25 * (hof.levels.value.capturePower ?? 0);
        return Math.random() < criticalCaptureChance(chance, dex.caughtCount.value, boost);
    }

    /**
     * Visits the Hidden Grotto (Black 2 and White 2's mechanic): the Pokémon inside comes out for
     * a wild battle, and will be caught for sure.
     */
    function visitGrotto() {
        if (!grottoReady.value || inTrainerBattle.value) return;
        const zone = ZONES_BY_ID[zoneId.value];
        if (zone == null || zone.trainerBattles === true) return;
        const entries = activePools(zoneId.value, keyItems.value, zoneExtras.value)
            .filter(pool => pool.kind !== "phenomenon")
            .flatMap(pool => pool.entries)
            .filter(e => catchableIn(zoneId.value, e.id) && !isShadow(e.id));
        const pool = grottoPool(zoneId.value, entries, id => !dex.entry(id).caught);
        if (pool.length === 0) return;
        grottoProgress.value = 0;
        let roll = Math.random() * pool.reduce((sum, e) => sum + e.weight, 0);
        const entry = pool.find(e => (roll -= e.weight) <= 0) ?? pool[pool.length - 1];
        const level =
            entry.minLevel + Math.floor(Math.random() * (entry.maxLevel - entry.minLevel + 1));
        addLog({
            kind: "info",
            text: `In the Hidden Grotto, a ${getSpecies(entry.id).name} is waiting!`,
            speciesId: entry.id
        });
        startWildBattle(entry.id, level, "grotto");
    }

    /** Pays the Bug-Catching Contest's entry fee: its bugs join the National Park's grass. */
    function enterBugContest() {
        if (contestEntered.value || !zoneUnlocked("nationalPark")) return;
        if (!spend(BUG_CONTEST_FEE)) return;
        contestEntered.value = true;
        addLog({
            kind: "info",
            text: "You entered the Bug-Catching Contest! Its bugs now roam the National Park. Catch a Scyther or Pinsir there to win."
        });
    }

    /** The first Scyther or Pinsir caught in the National Park after entering wins a Sun Stone. */
    function checkContestWin(wild: WildPokemon) {
        if (!contestEntered.value || contestWon.value || zoneId.value !== "nationalPark") return;
        if (!CONTEST_WINNERS.includes(wild.speciesId)) return;
        contestWon.value = true;
        stones.value = { ...stones.value, sunStone: (stones.value.sunStone ?? 0) + 1 };
        const prize = `Your ${getSpecies(wild.speciesId).name} wins the Bug-Catching Contest! You receive a Sun Stone.`;
        addLog({ kind: "badge", text: prize, speciesId: wild.speciesId });
        notify(`🏆 ${prize}`, "success", "prizes");
    }

    /** Tunes the Pokégear radio to a place's swarm: its Pokémon join that place's pool. */
    function joinSwarm(placeId: string) {
        const swarm = JOHTO_SWARMS.find(sw => sw.zoneId === placeId);
        if (swarm == null || swarmsJoined.value[placeId] === true) return;
        if (keyItems.value.radioCard !== true || !zoneUnlocked(placeId)) return;
        if (!spend(SWARM_PRICE)) return;
        swarmsJoined.value = { ...swarmsJoined.value, [placeId]: true };
        addLog({
            kind: "info",
            text: `📻 ${getSpecies(swarm.speciesId).name} are swarming at ${ZONES_BY_ID[placeId]?.name}!`,
            speciesId: swarm.speciesId
        });
    }

    function ensureTrainerId() {
        if (hof.trainerId.value === 0) hof.trainerId.value = 1 + Math.floor(Math.random() * 99999);
        return hof.trainerId.value;
    }

    /**
     * The Lucky Number Show (Radio Card): drawn every LUCKY_DRAW_BATTLES wild battles won. Match
     * the trailing digits of the number with your Trainer ID: one digit wins Great Balls, two
     * Ultra Balls, three a Sun Stone, four a Link Cable and Soothe Bell, all five a Master Ball.
     */
    function drawLuckyNumber() {
        if (keyItems.value.radioCard !== true) return;
        const number = Math.floor(Math.random() * 100000);
        lastLuckyNumber.value = number;
        const id = String(ensureTrainerId()).padStart(5, "0");
        const lucky = String(number).padStart(5, "0");
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
        const text = `Lucky Number Show: the number is ${lucky}. Your ID ${id} matches ${digits} digit${digits === 1 ? "" : "s"}: ${prizes[digits]}!`;
        addLog({ kind: digits > 0 ? "badge" : "info", text });
        if (digits > 0) notify(`📻 ${text}`, "success", "prizes");
    }

    /** Snags a beaten trainer's Shadow Pokémon (Orre's admins), once each per journey. */
    function snagFrom(trainer: TrainerDefinition) {
        if (keyItems.value.snagMachine !== true) return;
        for (const speciesId of trainer.snag ?? []) {
            const id = shadowOf(speciesId);
            if (snaggedShadows.value[id] || owns(id)) continue;
            const level = trainer.team.find(p => p.id === speciesId)?.level ?? 5;
            snaggedShadows.value = { ...snaggedShadows.value, [id]: true };
            receivePokemon(id, level, false);
            const text = `Snagged ${trainer.name}'s ${getSpecies(id).name}!`;
            addLog({ kind: "catch", text, speciesId: id });
            notify(`🟣 ${text}`, "success", "captures");
        }
    }

    /** Each wild battle won, Shadow Pokémon in the party open their hearts a little. */
    function openHearts() {
        for (const id of partyIds.value) {
            const entry = box.value[id];
            if (entry?.heart == null || entry.heart <= 0) continue;
            setBoxEntry(id, { ...entry, heart: entry.heart - 1 });
            if (entry.heart - 1 === 0) {
                addLog({
                    kind: "info",
                    text: mechanicOn("relicStone")
                        ? `${getSpecies(id).name}'s heart has opened! It can be purified at the Relic Stone.`
                        : `${getSpecies(id).name}'s heart has opened! Find the Relic Stone in Agate Village to purify it.`,
                    speciesId: id
                });
            }
        }
    }

    function canPurify(id: number): boolean {
        return isShadow(id) && box.value[id]?.heart === 0 && mechanicOn("relicStone");
    }

    /** Purifies an opened Shadow Pokémon at the Relic Stone: it becomes its species again. */
    function purify(id: number) {
        if (!canPurify(id) || inTrainerBattle.value) return;
        const entry = box.value[id]!;
        const base = getSpecies(id).baseSpecies!;
        const inParty = partyIds.value.includes(id);
        const rest = { ...box.value };
        delete rest[id];
        box.value = rest;
        partyIds.value = partyIds.value.filter(p => p !== id);
        const had = box.value[base];
        receivePokemon(base, entry.level, entry.shiny);
        if (had != null && entry.level > had.level) {
            setBoxEntry(base, { ...box.value[base]!, level: entry.level, xp: entry.xp });
        }
        if (inParty && !partyIds.value.includes(base) && partyIds.value.length < 6) {
            partyIds.value = [...partyIds.value, base];
        }
        const text = `${getSpecies(base).name}'s heart is purified! It's a normal Pokémon again.`;
        addLog({ kind: "evolve", text, speciesId: base });
        showFlash(text, "catch");
    }

    // ------------------------------------------------------------------
    // Sinnoh: Honey Trees and the Underground
    // ------------------------------------------------------------------

    /** Whether a Honey Tree can be visited on this journey. */
    function honeyTreeOpen(tree: HoneyTree): boolean {
        return (
            region.value === "sinnoh" &&
            badges.value >= tree.badgesRequired &&
            (tree.zoneId == null || zoneUnlocked(tree.zoneId))
        );
    }

    /** A Pokémon has come to the tree and is waiting to be shaken down. */
    function honeyTreeReady(treeId: string): boolean {
        const state = honeyTrees.value[treeId];
        return state != null && battlesWon.value >= state.readyAt;
    }

    /** Slathers Honey on a tree; the Pokémon that will come is decided now, as in the games. */
    function slatherHoney(treeId: string) {
        const tree = HONEY_TREES.find(t => t.id === treeId);
        if (tree == null || !honeyTreeOpen(tree) || honeyTrees.value[treeId] != null) return;
        if (!spend(HONEY_PRICE)) return;
        const munchlax = munchlaxTrees(ensureTrainerId()).includes(treeId);
        const visitor = rollHoneyTree(munchlax);
        honeyTrees.value = {
            ...honeyTrees.value,
            [treeId]: { ...visitor, readyAt: battlesWon.value + HONEY_BATTLES }
        };
    }

    /** Shakes a tree with a Pokémon on it: a wild battle with it starts right away. */
    function shakeHoneyTree(treeId: string) {
        if (!honeyTreeReady(treeId) || inTrainerBattle.value) return;
        const { speciesId, level } = honeyTrees.value[treeId];
        const rest = { ...honeyTrees.value };
        delete rest[treeId];
        honeyTrees.value = rest;
        const tree = HONEY_TREES.find(t => t.id === treeId);
        addLog({
            kind: "info",
            text: `A wild ${getSpecies(speciesId).name} jumped out of the Honey Tree at ${tree?.name}!`,
            speciesId
        });
        startWildBattle(speciesId, level, "honey");
    }

    /** Each wild battle won brings a fresh Underground wall closer, once the Underground is open. */
    function tendUnderground() {
        if (!mechanicOn("underground") || undergroundWalls.value >= MAX_WALLS) return;
        undergroundProgress.value++;
        if (undergroundProgress.value < UNDERGROUND_BATTLES) return;
        undergroundProgress.value = 0;
        undergroundWalls.value++;
    }

    /** Whether the Underground's post-game treasures (most fossils) can turn up. */
    const undergroundPostGame = computed(
        () => hof.clearCount("sinnoh") > 0 || (region.value === "sinnoh" && champion.value)
    );

    /** Digs one Underground wall and takes what's in it. */
    function digUnderground(): UndergroundItem[] {
        if (!mechanicOn("underground") || undergroundWalls.value <= 0) return [];
        undergroundWalls.value--;
        const found = digWall(ensureTrainerId(), undergroundPostGame.value);
        let earned = 0;
        for (const item of found) {
            if (item.stone != null) {
                stones.value = {
                    ...stones.value,
                    [item.stone]: (stones.value[item.stone] ?? 0) + 1
                };
            } else if (item.fossil != null) {
                const level = Math.min(cap.value, FOSSIL_LEVEL);
                const isNew = receivePokemon(item.fossil, level, false);
                const name = getSpecies(item.fossil).name;
                addLog({
                    kind: "catch",
                    text: `The ${item.name} was revived into ${name}!${isNew ? "" : ` (x${dex.timesCaught(item.fossil)})`}`,
                    speciesId: item.fossil
                });
            } else if (item.plate != null) {
                hof.collectPlate(item.plate);
            } else if (item.keystone === true) {
                grantKeyItem("oddKeystone");
            } else {
                earned += item.value ?? 0;
            }
        }
        money.value += earned;
        const names = found.map(item => item.name);
        const list =
            names.length > 1
                ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
                : names[0];
        addLog({
            kind: "info",
            text: `⛏️ Dug up ${list}${earned > 0 ? ` (sold for ₽${earned.toLocaleString("en-US")})` : ""}!`
        });
        return found;
    }

    /** With Arceus in the box, every Plate found turns it into that type's Arceus too. */
    function grantArceusForms() {
        const arceus = box.value[493];
        if (arceus == null) return;
        for (const type of PLATE_TYPES) {
            const form = arceusForm(type);
            if (!hof.plates.value[type] || owns(form)) continue;
            receivePokemon(form, arceus.level, arceus.shiny, false);
            addLog({
                kind: "evolve",
                text: `Holding the ${type[0].toUpperCase()}${type.slice(1)} Plate, Arceus becomes ${getSpecies(form).name}!`,
                speciesId: form
            });
        }
    }

    // ------------------------------------------------------------------
    // Pokémon Contests (Hoenn's mechanic)
    // ------------------------------------------------------------------

    const contest = persistent<ContestEntry>(
        { speciesId: 0, category: "cool", rank: "normal", remaining: 0 },
        false
    );

    function conditionOf(id: number, category: ContestCategory): number {
        return box.value[id]?.condition?.[category] ?? 0;
    }

    /** Feeds a Pokéblock: +10 to one condition, up to 100. */
    function feedPokeblock(id: number, category: ContestCategory) {
        const entry = box.value[id];
        if (!mechanicOn("contests") || entry == null || money.value < POKEBLOCK_PRICE) return;
        const current = conditionOf(id, category);
        if (current >= MAX_CONDITION) return;
        money.value -= POKEBLOCK_PRICE;
        setBoxEntry(id, {
            ...entry,
            condition: {
                ...entry.condition,
                [category]: Math.min(MAX_CONDITION, current + pokeblockGain.value)
            }
        });
    }

    /** The rank a species can enter next in a category (undefined once Master Rank is won). */
    function contestRankFor(id: number, category: ContestCategory): ContestRank | undefined {
        return nextRank(hof.ribbons.value[id]?.[category]);
    }

    function contestScoreOf(id: number, category: ContestCategory): number {
        return contestScore(id, box.value[id]?.level ?? 0, conditionOf(id, category), category);
    }

    function enterContest(id: number, category: ContestCategory) {
        const rank = contestRankFor(id, category);
        if (!mechanicOn("contests") || box.value[id] == null || rank == null) return;
        if (contest.value.speciesId !== 0) return;
        contest.value = { speciesId: id, category, rank, remaining: contestSeconds(rank) };
        addLog({
            kind: "info",
            text: `${getSpecies(id).name} enters the ${CATEGORY_NAMES[category]} Contest (${RANK_NAMES[rank]})!`,
            speciesId: id
        });
    }

    function judgeContest() {
        const { speciesId, category, rank } = contest.value;
        contest.value = { ...contest.value, speciesId: 0, remaining: 0 };
        if (box.value[speciesId] == null) return;
        const name = getSpecies(speciesId).name;
        const label = `${CATEGORY_NAMES[category]} Contest (${RANK_NAMES[rank]})`;
        if (Math.random() >= contestWinChance(speciesId, category, rank)) {
            addLog({ kind: "info", text: `${name} didn't win the ${label}.`, speciesId });
            return;
        }
        money.value += CONTEST_PRIZE_MONEY[rank];
        const prizeWonBefore = Object.values(hof.ribbons.value).some(r => r[category] === "master");
        hof.ribbons.value = {
            ...hof.ribbons.value,
            [speciesId]: { ...hof.ribbons.value[speciesId], [category]: rank }
        };
        const text = `${name} won the ${label}! A ribbon and ₽${CONTEST_PRIZE_MONEY[rank].toLocaleString()}.`;
        addLog({ kind: "badge", text, speciesId });
        showFlash(text, "badge");
        if (rank === "master" && !prizeWonBefore) {
            const pikachu = CONTEST_PIKACHU[category];
            receivePokemon(pikachu, Math.min(cap.value, 30), false);
            addLog({
                kind: "catch",
                text: `The Contest Hall gives you ${getSpecies(pikachu).name} for your first ${CATEGORY_NAMES[category]} Master Rank win!`,
                speciesId: pikachu
            });
        }
    }

    function advanceContest(dt: number) {
        if (contest.value.speciesId === 0) return;
        const remaining = contest.value.remaining - dt;
        if (remaining > 0) {
            contest.value = { ...contest.value, remaining };
        } else {
            judgeContest();
        }
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
            label:
                regionDef.value.trialNoun === "missions"
                    ? `Mission: ${gym.badge}`
                    : regionDef.value.id === "sevii"
                      ? gym.title
                      : `${gym.name}'s Gym battle`,
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
                        : regionDef.value.trialNoun === "missions"
                          ? `Mission clear: ${gym.badge}!`
                          : `Quest complete: ${gym.badge}!`;
                addLog({ kind: "badge", text });
                showFlash(text, "badge");
                notify(`🏅 ${text}`, "success", "trials");
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
                notify(`🏆 ${text}`, "success", "trials");
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
                // In a Pokémon Ranger region the battle was the capture: the Styler's loops hold.
                if (regionDef.value.styler === true) {
                    claimedSpecials.value = { ...claimedSpecials.value, [special.id]: true };
                    receivePokemon(special.speciesId, special.level, false);
                    if (special.rangerSign === true) {
                        hof.collectRangerSign(special.speciesId);
                        addLog({
                            kind: "info",
                            text: `${species.name}'s Ranger Sign is yours: it will come to help in every region.`
                        });
                    }
                    const text = `You captured ${species.name} with the Capture Styler!`;
                    addLog({ kind: "catch", text, speciesId: special.speciesId });
                    showFlash(text, "catch");
                    notify(`🌟 ${text}`, "success", "captures");
                    return;
                }
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
                const critical = criticalCapture(chance);
                if (critical || Math.random() < chance) {
                    if (critical) addLog({ kind: "info", text: "Critical capture!" });
                    claimedSpecials.value = { ...claimedSpecials.value, [special.id]: true };
                    receivePokemon(special.speciesId, special.level, false);
                    const text = `You caught ${species.name}!`;
                    addLog({ kind: "catch", text, speciesId: special.speciesId });
                    showFlash(text, "catch");
                    notify(`🌟 ${text}`, "success", "captures");
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
            notify(reason, "warning", "defeats");
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
        snagFrom(trainer);
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
                const { active, partner } = wildFighters(target);
                const dps = wildDps(
                    partyBattlers.value,
                    target,
                    bonuses.value.damage * pokeAssist(target.species),
                    mechanicOn("doubleBattles")
                );
                if (dps <= 0) {
                    return 0;
                }
                const timeToFaint = wild.hp / dps;
                if (timeToFaint > dt) {
                    battle.value = {
                        ...current,
                        active,
                        partner,
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
                    trainer.timeLimit,
                    { doubles: mechanicOn("doubleBattles"), enemyDoubles: trainer.doubles === true }
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
            for (const def of MECHANIC_LIST) {
                if (def.keyItem != null && !keyItems.value[def.keyItem] && mechanicOn(def.id)) {
                    grantKeyItem(def.keyItem);
                }
            }
            regionDef.value.startingKeyItems
                .filter(item => !keyItems.value[item])
                .forEach(grantKeyItem);
            // The Liberty Pass is a Pokédex reward, good for every Unova journey.
            if (
                region.value === "unova" &&
                !keyItems.value.libertyPass &&
                hasMilestone(dex.caughtCount.value, "Liberty Pass")
            ) {
                grantKeyItem("libertyPass");
            }
        }
        checkMechanics();
        if (box.value[493] != null) grantArceusForms();
        if (starter.value === 0 || partyIds.value.length === 0) return;
        runTime.value += diff;
        advanceContest(diff);
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
            (!z.postGame || champion.value) &&
            (z.mechanic == null || mechanicOn(z.mechanic))
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
        if (
            special.kind === "boss" &&
            special.requiresCleared?.some(r => hof.clearCount(r) === 0)
        ) {
            return false;
        }
        if (special.kind === "legendary") {
            if (special.keyItem != null && !keyItems.value[special.keyItem]) return false;
            if (!meetsFieldNeed(special.fieldNeed, fieldPowers.value)) return false;
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
                : special.kind === "gift" && special.byStarter != null
                  ? (special.byStarter[starter.value] ?? special.speciesId)
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
            label: `${special.trainer.name} ${special.fameBonus != null ? "in" : "on"} ${special.place}`,
            trainers: [withStrength(special.trainer, rematch.value)],
            onWin() {
                claimedSpecials.value = { ...claimedSpecials.value, [special.id]: true };
                if (special.keyItem != null) grantKeyItem(special.keyItem);
                const prizes: string[] = [];
                for (const [ball, n] of Object.entries(special.prizeBalls ?? {}) as [
                    BallId,
                    number
                ][]) {
                    balls.value = { ...balls.value, [ball]: (balls.value[ball] ?? 0) + n };
                    prizes.push(`${n} ${BALLS[ball].name}${n === 1 ? "" : "s"}`);
                }
                money.value += special.trainer.prizeMoney;
                const text = `You defeated ${special.trainer.name} ${special.fameBonus != null ? "in" : "at"} ${special.place}!${
                    prizes.length > 0 ? ` You receive ${prizes.join(" and ")}.` : ""
                }${
                    special.fameBonus != null
                        ? ` This journey's Hall of Fame entry is worth ×${special.fameBonus} Fame.`
                        : ""
                }`;
                addLog({ kind: "badge", text });
                notify(`🏆 ${text}`, "success", "trials");
            }
        });
    }

    /** Picks where the next journey happens. Only possible before choosing a starter. */
    function chooseRegion(id: RegionId) {
        const def = REGIONS[id];
        if (starter.value !== 0 || def == null || !hof.regionUnlocked(id)) return;
        region.value = id;
    }

    /**
     * Bring a Partner (Hoenn's mechanic): one Hall of Fame Pokémon picked to start the next
     * journey beside the starter (0 for none). Kept as the default for later journeys.
     */
    const journeyPartner = persistent<number>(0);
    const partnerChoices = computed(() => {
        const choices = new Map<number, boolean>();
        for (const entry of [...hof.entries.value].reverse()) {
            for (const p of entry.team) choices.set(p.id, (choices.get(p.id) ?? false) || p.shiny);
        }
        return [...choices.entries()].map(([id, shiny]) => ({ id, shiny }));
    });

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
        // Colosseum's Espeon and Umbreon come as a pair.
        if (def.allStarters === true) {
            def.starters
                .filter(other => other !== id)
                .forEach(other => receivePokemon(other, level, false));
        }
        const partner = partnerChoices.value.find(p => p.id === journeyPartner.value);
        const bringPartner =
            mechanicOn("partner") && partner != null && box.value[partner.id] == null;
        addLog({
            kind: "info",
            text: `${getSpecies(id).name}, I choose you! Your ${def.name} journey begins.`
        });
        if (bringPartner) {
            receivePokemon(partner.id, level, partner.shiny, false);
            addLog({
                kind: "info",
                text: `${getSpecies(partner.id).name} from your Hall of Fame comes along too.`,
                speciesId: partner.id,
                shiny: partner.shiny
            });
        }
        startSearch();
    }

    /** Clears transient state after a Hall of Fame reset. */
    function resetTransient() {
        log.value = [];
        flash.value = null;
        battle.value = { kind: "search", remaining: 1, total: 1 };
        warnedNoBalls = false;
        warnedNoSnacks = false;
    }

    const nav: NavNode[] = [map.nav, party.nav, mart.nav, league.nav, dex.nav, hof.nav];

    return {
        name: "Journey",
        minWidth: 440,
        minimizable: false,
        classes: mobileClasses("main"),
        starter,
        contest,
        conditionOf,
        feedPokeblock,
        contestRankFor,
        contestScoreOf,
        enterContest,
        journeyPartner,
        partnerChoices,
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
        zoneExtras,
        contestEntered,
        contestWon,
        swarmsJoined,
        enterBugContest,
        joinSwarm,
        lastLuckyNumber,
        ensureTrainerId,
        drawLuckyNumber,
        ballContext,
        dayCareId,
        dayCareProgress,
        dayCareOpen,
        eggsHatched,
        eggValue,
        bestDayCareParent,
        mechanicOn,
        hasPokeRadar,
        radarChain,
        breakRadarChain,
        eggBattles,
        eggShinyMultiplier,
        pokeblockGain,
        pokeAssist,
        fieldPowers,
        contestSeconds,
        contestWinChance,
        fameBonus,
        honeyTrees,
        honeyTreeOpen,
        honeyTreeReady,
        slatherHoney,
        shakeHoneyTree,
        season,
        grottoProgress,
        grottoBattles,
        grottoReady,
        visitGrotto,
        undergroundWalls,
        undergroundProgress,
        undergroundPostGame,
        digUnderground,
        snaggedShadows,
        pokeSnacks,
        buyPokeSnacks,
        canPurify,
        purify,
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
        generationOpen,
        evolutionsOf,
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

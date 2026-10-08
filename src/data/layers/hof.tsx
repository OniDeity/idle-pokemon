/**
 * The Hall of Fame: the prestige layer. After clearing a region's finale, the player enshrines
 * their team and starts a new journey in any unlocked region, trading the run for Fame.
 * Teams with Pokémon not yet in that region's Hall of Fame earn the most. The Pokédex is kept.
 */
import type { ContestCategory, ContestRank } from "game/pokemon/contests";
import type { ChallengeId } from "game/pokemon/challenges";
import { CHALLENGES, challengeFame, challengesMet } from "game/pokemon/challenges";
import { main } from "data/projEntry";
import { openLayer } from "../ui/nav";
import { createReset } from "features/reset";
import { createLayer } from "game/layers";
import { persistent } from "game/persistence";
import type { AutomationId, HofUpgradeId, TravelMode } from "game/pokemon/balance";
import {
    AUTOMATIONS,
    FAME_PER_NEW_SPECIES,
    fameGain,
    HOF_UPGRADE_LIST,
    REFUND_SHARE,
    TRAVEL_MODES,
    upgradeCost,
    upgradeSpent,
    upgradeTopLevel
} from "game/pokemon/balance";
import type { UpgradeDefinition, UpgradeTab } from "game/pokemon/balance";
import type { PokemonType } from "game/pokemon/data";
import { getSpecies, hallOfFameId } from "game/pokemon/data";
import type { MechanicId } from "game/pokemon/mechanics";
import { MECHANIC_LIST } from "game/pokemon/mechanics";
import { rankFameMultiplier } from "game/pokemon/medals";
import { pokedexRequirement } from "game/pokemon/pokedex";
import { REGIONS } from "game/pokemon/regions";
import type { RegionId } from "game/pokemon/zones";
import { computed } from "vue";
import type { TabOption } from "../ui/components";
import {
    Button,
    currentTab,
    formatDuration,
    formatNumber,
    ItemIcon,
    Panel,
    renderTabs,
    Sprite
} from "../ui/components";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import dex from "./dex";
import medals from "./medals";
import mart from "./mart";

export type HallOfFameEntry = {
    run: number;
    time: number;
    dexCaught: number;
    team: { id: number; level: number; shiny: boolean }[];
    region?: RegionId;
    fame?: number;
    /** The challenges the journey was cleared with (a late Time Trial isn't counted). */
    challenges?: ChallengeId[];
};

const id = "hof";
const layer = createLayer(id, () => {
    const name = "Hall of Fame";
    const color = "#EAB308";

    const fame = persistent<number>(0);
    const levels = persistent<Partial<Record<HofUpgradeId, number>>>({}, false);
    const entries = persistent<HallOfFameEntry[]>([], false);
    const timesEntered = persistent<number>(0);
    const clears = persistent<Partial<Record<RegionId, number>>>({}, false);
    const enshrined = persistent<Record<string, boolean>>({}, false);
    /** Automations bought (true) and whether the player has them switched on. */
    const automationsOwned = persistent<Partial<Record<AutomationId, boolean>>>({}, false);
    const automationsOn = persistent<Partial<Record<AutomationId, boolean>>>({}, false);
    /** The player's five-digit Trainer ID (0 until first needed), for the Lucky Number Show. */
    const trainerId = persistent<number>(0);
    /** The last day (see Moment.day) the Lucky Number Show was drawn; once a day, every journey. */
    /** No longer used (the Lucky Number Show was once daily); kept so older saves load as-is. */
    const luckyNumberDay = persistent<number>(-1);
    /** Team Strategist setting: bring Pokémon new to the Hall of Fame to the finale. */
    const newFacesForFinale = persistent<boolean>(false);
    /** How many new faces to bring (at most the party's size). */
    const newFacesCount = persistent<number>(6);
    /**
     * Keep that many new faces in the party for the finale even when the forecast says they'd
     * lose: they train until it says they'd win (the League Pass waits). Otherwise as many as
     * can still win.
     */
    const newFacesTrain = persistent<boolean>(false);
    /**
     * Team Strategist setting: between battles, Pokémon below the level cap take the party's
     * spare places (benchSlots of them) while the best counters can't win yet.
     */
    const trainBench = persistent<boolean>(false);
    const benchSlots = persistent<number>(2);
    /** League Pass setting: also battle legendaries caught before and bosses beaten before. */
    const autoLegends = persistent<boolean>(true);
    /** Day Care Eggs hatched, by species, for good (Breeder's Lineage). */
    const eggsBred = persistent<Record<string, number>>({}, false);
    /** Boss specials ever beaten (for the League Pass), by special id. */
    const bossesBeaten = persistent<Record<string, boolean>>({}, false);
    /** Travel Planner setting: what it travels for. */
    const travelMode = persistent<TravelMode>("balanced");
    /**
     * The Travel Planner's old "catch 'em all" switch (re-catch Pokédex Pokémon missing from the
     * box), from before its modes: on means the Catch 'em all mode.
     */
    const catchEmAll = persistent<boolean>(false);
    const travelModeInEffect = computed(
        (): TravelMode => (catchEmAll.value ? "catchAll" : travelMode.value)
    );
    function chooseTravelMode(mode: TravelMode) {
        catchEmAll.value = false;
        travelMode.value = mode;
    }
    /** After each Egg, swap the Day Care's Pokémon for the one whose Egg is most useful. */
    const dayCareRotate = persistent<boolean>(false);
    /** Generation mechanics reached in their own region, now on everywhere. */
    const mechanics = persistent<Partial<Record<MechanicId, boolean>>>({}, false);
    /** Arceus's Plates dug up in the Underground: kept for good, like the Pokédex. */
    const plates = persistent<Partial<Record<PokemonType, boolean>>>({}, false);
    /** Oblivia's Ranger Signs, by species: kept for good, like the Plates. */
    const rangerSigns = persistent<Record<string, boolean>>({}, false);
    const rangerSignSpecies = computed(() =>
        Object.keys(rangerSigns.value)
            .filter(id => rangerSigns.value[id] === true)
            .map(Number)
    );
    /** Regions cleared after Sinnoh, whose Pokémon have migrated to Pal Park. */
    const palPark = persistent<Partial<Record<RegionId, boolean>>>({}, false);
    const palParkRegions = computed(() =>
        (Object.keys(palPark.value) as RegionId[]).filter(r => palPark.value[r] === true)
    );
    /**
     * The Key System's challenges set for the next journeys (Black 2 and White 2's keys): kept
     * between journeys, and taken up when a starter is chosen.
     */
    const challengeKeys = persistent<ChallengeId[]>([], false);

    function toggleChallengeKey(challenge: ChallengeId) {
        if (main.starter.value !== 0 || timesEntered.value === 0) return;
        challengeKeys.value = challengeKeys.value.includes(challenge)
            ? challengeKeys.value.filter(c => c !== challenge)
            : [...challengeKeys.value, challenge];
    }

    /** Contest ribbons by species: the highest rank won in each category. */
    const ribbons = persistent<Record<string, Partial<Record<ContestCategory, ContestRank>>>>(
        {},
        false
    );

    function collectRangerSign(speciesId: number) {
        if (rangerSigns.value[speciesId] === true) return;
        rangerSigns.value = { ...rangerSigns.value, [speciesId]: true };
    }

    function collectPlate(type: PokemonType) {
        if (plates.value[type] === true) return;
        plates.value = { ...plates.value, [type]: true };
    }

    function mechanicUnlocked(id: MechanicId): boolean {
        return mechanics.value[id] === true;
    }

    /** Unlocks a mechanic for good; true if it was new. */
    function unlockMechanic(id: MechanicId): boolean {
        if (mechanicUnlocked(id)) return false;
        mechanics.value = { ...mechanics.value, [id]: true };
        return true;
    }

    function renderMechanics() {
        return (
            <Panel>
                <p class="pk-small pk-muted">
                    Each generation's new mechanics are met first in its region. Once you reach one,
                    it works in every region from then on.
                </p>
                {MECHANIC_LIST.map(def => (
                    <div class="pk-shop-row">
                        <div class="pk-shop-info">
                            <b>{def.name}</b>{" "}
                            <span class="pk-muted">
                                {mechanicUnlocked(def.id) ? "Unlocked" : "Locked"}
                            </span>
                            <div class="pk-small">
                                {mechanicUnlocked(def.id)
                                    ? def.description
                                    : `Reach ${def.unlockAt} in ${REGIONS[def.region].name} to unlock.`}
                            </div>
                        </div>
                    </div>
                ))}
            </Panel>
        );
    }

    function level(upgrade: HofUpgradeId) {
        return levels.value[upgrade] ?? 0;
    }

    /** Saves from before regions existed recorded Kanto clears only as entries. */
    function clearCount(region: RegionId) {
        const recorded = clears.value[region] ?? 0;
        if (region === "kanto" && recorded === 0) {
            return entries.value.filter(e => (e.region ?? "kanto") === "kanto").length > 0 &&
                timesEntered.value > 0
                ? timesEntered.value
                : 0;
        }
        return recorded;
    }

    /** For regions that need a complete Pokédex: species caught out of those required. */
    function pokedexProgress(region: RegionId): { caught: number; needed: number } | undefined {
        const def = REGIONS[region];
        if (def.requiresCompletePokedex !== true) return undefined;
        const needed = pokedexRequirement(def);
        const caught = [...needed].filter(id => dex.entry(id).caught).length;
        return { caught, needed: needed.size };
    }

    function regionUnlocked(region: RegionId) {
        // A region already journeyed to stays open when later regions slot in before it
        // (Orre came out before Hoenn, then moved after it).
        if (clearCount(region) > 0 || (main.region.value === region && main.starter.value > 0)) {
            return true;
        }
        const requires = REGIONS[region].requires;
        if (requires != null && clearCount(requires) === 0) return false;
        const progress = pokedexProgress(region);
        return progress == null || progress.caught >= progress.needed;
    }

    /**
     * Whether a Pokémon is already in a region's Hall of Fame (this journey's region by default).
     * Each region keeps its own: a Kanto Champion is still a new face in Johto. It's read from the
     * Champions entries of finished journeys, which have always recorded their region.
     */
    function isEnshrined(speciesId: number, region: RegionId = main.region.value) {
        const key = hallOfFameId(speciesId);
        return entries.value.some(
            e =>
                e.run <= timesEntered.value &&
                (e.region ?? "kanto") === region &&
                e.team.some(p => hallOfFameId(p.id) === key)
        );
    }

    /** The team that cleared this journey's finale. */
    const clearingTeam = computed((): number[] => {
        if (main.clearTeam.value.length > 0) return main.clearTeam.value;
        const entry = entries.value.find(e => e.run === timesEntered.value + 1);
        return entry?.team.map(p => p.id) ?? main.partyIds.value;
    });

    /**
     * Team members not yet in this region's Hall of Fame (a Gyarados and a Gyarados ♀ count
     * once).
     */
    const newSpecies = computed((): number[] =>
        clearingTeam.value.filter(
            (id, i, team) =>
                !isEnshrined(id) &&
                team.findIndex(other => hallOfFameId(other) === hallOfFameId(id)) === i
        )
    );

    /** How long this journey took to clear its finale (for the Time Trial). */
    const clearTime = computed(
        (): number =>
            entries.value.find(e => e.run === timesEntered.value + 1)?.time ?? main.runTime.value
    );
    /** The journey's challenges' Fame multiplier. */
    const challengeMultiplier = computed((): number =>
        challengeFame(main.challenges.value, clearTime.value)
    );

    const pendingFame = computed((): number =>
        fameGain({
            challenge: challengeMultiplier.value,
            medals: rankFameMultiplier(medals.tiersEarned.value),
            regionFame: main.regionDef.value.fame,
            dexCaught: dex.caughtCount.value,
            shinyCaught: dex.shinyCount.value,
            newSpecies: newSpecies.value.length,
            firstClear: clearCount(main.region.value) === 0,
            rematch: main.rematch.value,
            bonus: main.fameBonus.value,
            fanClub: main.fameLevels.value.fanClub
        })
    );

    function recordChampionTeam(team: { id: number; level: number; shiny: boolean }[]) {
        entries.value = [
            ...entries.value,
            {
                run: timesEntered.value + 1,
                time: main.runTime.value,
                dexCaught: dex.caughtCount.value,
                region: main.region.value,
                team: team.map(({ id, level, shiny }) => ({ id, level, shiny })),
                ...(main.challenges.value.length > 0
                    ? { challenges: challengesMet(main.challenges.value, main.runTime.value) }
                    : {})
            }
        ];
    }

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [main, mart]
    }));

    function enterHallOfFame() {
        if (!main.champion.value) return;
        const gain = pendingFame.value;
        const region = main.region.value;
        const run = timesEntered.value + 1;
        entries.value = entries.value.map(e => (e.run === run ? { ...e, fame: gain } : e));
        enshrined.value = {
            ...enshrined.value,
            ...Object.fromEntries(clearingTeam.value.map(id => [hallOfFameId(id), true]))
        };
        // Once Sinnoh has been cleared, every other region cleared sends its Pokémon to Pal Park
        // (up to Gen 4's regions: Unova's go through the Poké Transfer instead).
        const migrates =
            region !== "sinnoh" &&
            (REGIONS[region].newestSpecies ?? 386) <= 493 &&
            clearCount("sinnoh") > 0 &&
            !palPark.value[region];
        if (migrates) palPark.value = { ...palPark.value, [region]: true };
        clears.value = { ...clears.value, [region]: clearCount(region) + 1 };
        // How you catch is a preference, not journey progress: it carries over.
        const catching = {
            catchMode: main.catchMode.value,
            ballMode: main.ballMode.value,
            master: main.useMasterBallOnLegendaries.value
        };
        fame.value += gain;
        timesEntered.value = run;
        reset.reset();
        main.resetTransient();
        main.catchMode.value = catching.catchMode;
        main.ballMode.value = catching.ballMode;
        main.useMasterBallOnLegendaries.value = catching.master;
        main.addLog({
            kind: "badge",
            text: `Your team was enshrined in the Hall of Fame (+${gain} Fame). Choose where your next journey begins!`
        });
        if (migrates) {
            main.addLog({
                kind: "info",
                text: `${REGIONS[region].name}'s Pokémon have migrated to Sinnoh's Pal Park.`
            });
        }
        openLayer("map");
    }

    function buyUpgrade(upgrade: UpgradeDefinition & { id: HofUpgradeId }) {
        const current = level(upgrade.id);
        const cost = upgradeCost(upgrade, current);
        if (current >= upgradeTopLevel(upgrade) || fame.value < cost) return;
        if (timesEntered.value < (upgrade.entriesRequired ?? 0)) return;
        fame.value -= cost;
        levels.value = { ...levels.value, [upgrade.id]: current + 1 };
    }

    /** What refunding an upgrade gives back: most of the Fame spent on it. */
    function refundValue(upgrade: UpgradeDefinition & { id: HofUpgradeId }) {
        return Math.floor(upgradeSpent(upgrade, level(upgrade.id)) * REFUND_SHARE);
    }

    function refundUpgrade(upgrade: UpgradeDefinition & { id: HofUpgradeId }) {
        if (level(upgrade.id) === 0) return;
        fame.value += refundValue(upgrade);
        levels.value = { ...levels.value, [upgrade.id]: 0 };
    }

    const UPGRADE_TABS: [UpgradeTab, string][] = [
        ["battle", "Battle"],
        ["catching", "Catching"],
        ["journey", "Journey"],
        ["mechanics", "Mechanics"]
    ];

    function upgradeTab(upgrade: UpgradeDefinition): UpgradeTab {
        return upgrade.tab ?? (upgrade.mechanic != null ? "mechanics" : "battle");
    }

    function renderUpgrade(upgrade: UpgradeDefinition & { id: HofUpgradeId }) {
        const current = level(upgrade.id);
        const cost = upgradeCost(upgrade, current);
        const top = upgradeTopLevel(upgrade);
        const maxed = current >= top;
        const mastering = current >= upgrade.maxLevel && upgrade.mastery != null;
        const locked = timesEntered.value < (upgrade.entriesRequired ?? 0);
        return (
            <div class="pk-shop-row">
                <ItemIcon src={upgrade.sprite} alt={upgrade.name} />
                <div class="pk-shop-info">
                    <b>{upgrade.name}</b>{" "}
                    <span class="pk-muted">
                        Lv. {Math.min(current, upgrade.maxLevel)}/{upgrade.maxLevel}
                        {mastering
                            ? ` · ★ Mastery ${current - upgrade.maxLevel}/${upgrade.mastery!.levels}`
                            : ""}
                    </span>
                    <div class="pk-small">
                        {mastering ? upgrade.mastery!.description : upgrade.description}
                    </div>
                    {current > 0 && upgrade.effect != null ? (
                        <div class="pk-small pk-muted">Now: {upgrade.effect(current)}</div>
                    ) : null}
                </div>
                <div class="pk-upgrade-buttons">
                    {locked ? (
                        <span class="pk-small pk-muted">
                            🔒 After {upgrade.entriesRequired} Hall of Fame entries
                        </span>
                    ) : (
                        <Button
                            kind="primary"
                            disabled={maxed || fame.value < cost}
                            onClick={() => buyUpgrade(upgrade)}
                        >
                            {maxed ? "Maxed" : `${formatNumber(cost)} Fame`}
                        </Button>
                    )}
                    {current > 0 ? (
                        <Button
                            kind="small"
                            title={`Sets it back to Lv. 0 and returns ${Math.round(REFUND_SHARE * 100)}% of the Fame spent on it.`}
                            onClick={() => {
                                if (
                                    window.confirm(
                                        `Refund ${upgrade.name}? You get ${formatNumber(refundValue(upgrade))} Fame back and it goes back to Lv. 0.`
                                    )
                                ) {
                                    refundUpgrade(upgrade);
                                }
                            }}
                        >
                            Refund
                        </Button>
                    ) : null}
                </div>
            </div>
        );
    }

    function renderUpgrades() {
        const offered = HOF_UPGRADE_LIST.filter(
            u => u.mechanic == null || mechanicUnlocked(u.mechanic)
        );
        const tabs: TabOption[] = UPGRADE_TABS.map(([id, label]) => ({
            id,
            label,
            show: offered.some(u => upgradeTab(u) === id)
        }));
        const page = currentTab("hofUpgrades", tabs);
        return (
            <>
                {renderTabs("hofUpgrades", tabs)}
                <Panel>
                    <p class="pk-small pk-muted">
                        Kept for good. A finished upgrade with ★ Mastery keeps going, a little at a
                        time. A refund returns {Math.round(REFUND_SHARE * 100)}% of its Fame.
                    </p>
                    {offered.filter(u => upgradeTab(u) === page).map(renderUpgrade)}
                </Panel>
            </>
        );
    }

    function buyAutomation(id: AutomationId) {
        const def = AUTOMATIONS.find(a => a.id === id);
        if (def == null || automationsOwned.value[id] || fame.value < def.cost) return;
        fame.value -= def.cost;
        automationsOwned.value = { ...automationsOwned.value, [id]: true };
        automationsOn.value = { ...automationsOn.value, [id]: true };
    }

    function toggleAutomation(id: AutomationId) {
        if (!automationsOwned.value[id]) return;
        automationsOn.value = { ...automationsOn.value, [id]: !automationsOn.value[id] };
    }

    function automationActive(id: AutomationId) {
        return automationsOwned.value[id] === true && automationsOn.value[id] === true;
    }

    const nav: NavNode = {
        id,
        letter: "H",
        label: "Fame",
        color,
        glow: computed((): boolean => main.champion.value),
        enabled: computed((): boolean => main.champion.value || timesEntered.value > 0)
    };

    function renderEnter() {
        const region = main.regionDef.value;
        return (
            <Panel>
                <p>
                    Enshrine your team and begin a <b>new journey</b> in any region you've unlocked.
                    You'll pick a new starter and lose your money, badges, Pokémon, items and Poké
                    Mart upgrades, but{" "}
                    <b>your Pokédex, its rewards, Fame upgrades and automation stay</b>, so every
                    journey is faster than the last.
                </p>
                {main.champion.value ? (
                    <div class="pk-fame-preview">
                        <div class="pk-small">
                            {region.name} clear: {region.fame} · Pokédex:{" "}
                            {Math.floor(dex.caughtCount.value / 5)} · Shinies:{" "}
                            {dex.shinyCount.value * 2} · New to {region.name}'s Hall of Fame:{" "}
                            {newSpecies.value.length} × {FAME_PER_NEW_SPECIES}
                            {clearCount(region.id) === 0 ? " · First clear ×1.5" : ""}
                            {main.fameBonus.value > 1 ? ` · Bonus ×${main.fameBonus.value}` : ""}
                            {challengeMultiplier.value > 1
                                ? ` · Challenges ×${challengeMultiplier.value.toFixed(2)}`
                                : ""}
                            {rankFameMultiplier(medals.tiersEarned.value) > 1
                                ? ` · Medal Rally ×${rankFameMultiplier(medals.tiersEarned.value).toFixed(2)}`
                                : ""}
                            {main.rematch.value > 1
                                ? ` · ${main.rematchClears.value > 0 ? "Rematch" : "Renown"} ×${main.rematch.value.toFixed(1)}`
                                : ""}
                        </div>
                        {newSpecies.value.length > 0 ? (
                            <div class="pk-hof-team">
                                {newSpecies.value.map(sid => (
                                    <div
                                        class="pk-hof-mon new"
                                        title={`${getSpecies(sid).name} (new!)`}
                                    >
                                        <Sprite id={sid} size={40} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div class="pk-small pk-muted">
                                Every Pokémon on this team is already in {region.name}'s Hall of
                                Fame. Clear with new faces for more Fame.
                            </div>
                        )}
                    </div>
                ) : null}
                <Button kind="primary" disabled={!main.champion.value} onClick={enterHallOfFame}>
                    {main.champion.value
                        ? `Enter the Hall of Fame (+${pendingFame.value} Fame)`
                        : `Clear the ${region.finaleName} to enter`}
                </Button>
            </Panel>
        );
    }

    /**
     * Team Strategist's settings: training the bench, and for the Hall of Fame how many new faces
     * and whether to train them.
     */
    function renderNewFaces() {
        const count = newFacesCount.value;
        return (
            <div class="pk-automation-settings">
                <label class="pk-small pk-setting">
                    <input
                        type="checkbox"
                        checked={trainBench.value}
                        onChange={() => (trainBench.value = !trainBench.value)}
                    />{" "}
                    Train the bench: while your best counters can't win yet, Pokémon below the level
                    cap take spare places in the party (the Hall of Fame's new faces first)
                </label>
                {trainBench.value ? (
                    <label class="pk-small pk-setting">
                        Places for training:{" "}
                        <input
                            type="range"
                            min={1}
                            max={5}
                            step={1}
                            value={benchSlots.value}
                            onInput={(e: Event) =>
                                (benchSlots.value = Number((e.target as HTMLInputElement).value))
                            }
                        />{" "}
                        <b>{benchSlots.value}</b>
                    </label>
                ) : null}
                <label class="pk-small pk-setting">
                    <input
                        type="checkbox"
                        checked={newFacesForFinale.value}
                        onChange={() => (newFacesForFinale.value = !newFacesForFinale.value)}
                    />{" "}
                    Hall of Fame battles: bring Pokémon new to this region's Hall (+
                    {FAME_PER_NEW_SPECIES} Fame each)
                </label>
                {newFacesForFinale.value ? (
                    <>
                        <label class="pk-small pk-setting">
                            New faces:{" "}
                            <input
                                type="range"
                                min={1}
                                max={6}
                                step={1}
                                value={count}
                                onInput={(e: Event) =>
                                    (newFacesCount.value = Number(
                                        (e.target as HTMLInputElement).value
                                    ))
                                }
                            />{" "}
                            <b>{count === 6 ? "the whole team" : `${count}`}</b>
                        </label>
                        <label class="pk-small pk-setting">
                            <input
                                type="checkbox"
                                checked={newFacesTrain.value}
                                onChange={() => (newFacesTrain.value = !newFacesTrain.value)}
                            />{" "}
                            Even if they'd lose: keep them in and train them until the forecast says
                            they'd win (the League Pass waits). Off: as many of them as can still
                            win.
                        </label>
                    </>
                ) : null}
            </div>
        );
    }

    /** The Travel Planner's modes. */
    function renderTravelModes() {
        const mode = travelModeInEffect.value;
        return (
            <div class="pk-automation-settings">
                <div class="pk-filter-row">
                    {TRAVEL_MODES.map(([id, label, title]) => (
                        <Button
                            kind={mode === id ? "primary" : "ghost"}
                            title={title}
                            onClick={() => chooseTravelMode(id)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
                <div class="pk-small pk-muted">{TRAVEL_MODES.find(([id]) => id === mode)?.[2]}</div>
            </div>
        );
    }

    function renderAutomation() {
        return (
            <Panel>
                <p class="pk-small pk-muted">
                    One-time purchases that play parts of the game for you. Switch them on or off
                    here or from the Journey panel.
                </p>
                {AUTOMATIONS.filter(
                    def => def.mechanic == null || mechanicUnlocked(def.mechanic)
                ).map(def => {
                    const owned = automationsOwned.value[def.id] === true;
                    const on = automationsOn.value[def.id] === true;
                    return (
                        <div class="pk-shop-row">
                            <ItemIcon src={def.sprite} alt={def.name} />
                            <div class="pk-shop-info">
                                <b>{def.name}</b>
                                <div class="pk-small">{def.description}</div>
                                {def.id === "autoParty" && owned ? renderNewFaces() : null}
                                {def.id === "autoTravel" && owned ? renderTravelModes() : null}
                                {def.id === "autoChallenge" && owned ? (
                                    <div class="pk-automation-settings">
                                        <label class="pk-small pk-setting">
                                            <input
                                                type="checkbox"
                                                checked={autoLegends.value}
                                                onChange={() =>
                                                    (autoLegends.value = !autoLegends.value)
                                                }
                                            />{" "}
                                            Legendary Pokémon already in your Pokédex and bosses
                                            you've beaten before (a first meeting is yours)
                                        </label>
                                    </div>
                                ) : null}
                            </div>
                            {owned ? (
                                <Button
                                    kind={on ? "primary" : "ghost"}
                                    onClick={() => toggleAutomation(def.id)}
                                >
                                    {on ? "On" : "Off"}
                                </Button>
                            ) : (
                                <Button
                                    kind="primary"
                                    disabled={fame.value < def.cost}
                                    onClick={() => buyAutomation(def.id)}
                                >
                                    {def.cost} Fame
                                </Button>
                            )}
                        </div>
                    );
                })}
            </Panel>
        );
    }

    return {
        name,
        color,
        minWidth: 480,
        minimizable: false,
        classes: mobileClasses(id),
        fame,
        levels,
        entries,
        timesEntered,
        clears,
        enshrined,
        automationsOwned,
        automationsOn,
        newFacesForFinale,
        newFacesCount,
        newFacesTrain,
        trainBench,
        benchSlots,
        autoLegends,
        bossesBeaten,
        eggsBred,
        refundUpgrade,
        travelMode,
        travelModeInEffect,
        chooseTravelMode,
        trainerId,
        luckyNumberDay,
        catchEmAll,
        dayCareRotate,
        mechanics,
        mechanicUnlocked,
        plates,
        collectPlate,
        rangerSigns,
        rangerSignSpecies,
        collectRangerSign,
        palPark,
        palParkRegions,
        ribbons,
        challengeKeys,
        toggleChallengeKey,
        challengeMultiplier,
        unlockMechanic,
        isEnshrined,
        pendingFame,
        recordChampionTeam,
        regionUnlocked,
        pokedexProgress,
        clearCount,
        automationActive,
        toggleAutomation,
        reset,
        nav,
        display: () => {
            const tabs: TabOption[] = [
                { id: "enter", label: "New journey" },
                { id: "upgrades", label: "Fame upgrades" },
                { id: "automation", label: "Automation" },
                { id: "mechanics", label: "Mechanics" },
                { id: "champions", label: `Champions (${entries.value.length})` }
            ];
            const page = currentTab("hof", tabs);
            return (
                <div class="pk-layer">
                    {renderNav(true)}
                    <h2 class="pk-layer-title">Hall of Fame</h2>
                    <div class="pk-money-big">{formatNumber(fame.value)} Fame</div>
                    {renderTabs("hof", tabs)}

                    {page === "enter" ? renderEnter() : null}
                    {page === "automation" ? renderAutomation() : null}
                    {page === "mechanics" ? renderMechanics() : null}

                    {page === "upgrades" ? renderUpgrades() : null}

                    {page === "champions" ? (
                        <Panel>
                            {entries.value.length === 0 ? (
                                <p class="pk-muted">No one has been enshrined yet.</p>
                            ) : (
                                [...entries.value].reverse().map(entry => (
                                    <div class="pk-hof-entry">
                                        <div class="pk-hof-entry-head">
                                            <b>
                                                Journey #{entry.run} ·{" "}
                                                {REGIONS[entry.region ?? "kanto"].name}
                                            </b>
                                            <span class="pk-muted">
                                                {formatDuration(entry.time)} · {entry.dexCaught}{" "}
                                                species
                                                {entry.fame != null ? ` · +${entry.fame} Fame` : ""}
                                                {(entry.challenges ?? []).length > 0
                                                    ? ` · ${entry.challenges!.map(c => CHALLENGES[c].name).join(", ")}`
                                                    : ""}
                                            </span>
                                        </div>
                                        <div class="pk-hof-team">
                                            {entry.team.map(p => (
                                                <div
                                                    class="pk-hof-mon"
                                                    title={getSpecies(p.id).name}
                                                >
                                                    <Sprite id={p.id} shiny={p.shiny} size={48} />
                                                    <span class="pk-small">Lv. {p.level}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </Panel>
                    ) : null}
                </div>
            );
        }
    };
});

export default layer;

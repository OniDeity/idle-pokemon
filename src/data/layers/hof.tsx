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
import type { AutomationId, HofUpgradeId } from "game/pokemon/balance";
import {
    AUTOMATIONS,
    FAME_PER_NEW_SPECIES,
    fameGain,
    HOF_UPGRADE_LIST,
    upgradeCost
} from "game/pokemon/balance";
import type { UpgradeDefinition } from "game/pokemon/balance";
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
    /** Travel Planner setting: re-catch Pokédex Pokémon missing from the box, at any level. */
    const catchEmAll = persistent<boolean>(false);
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
            bonus: main.fameBonus.value
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
        fame.value += gain;
        timesEntered.value = run;
        reset.reset();
        main.resetTransient();
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
        if (current >= upgrade.maxLevel || fame.value < cost) return;
        fame.value -= cost;
        levels.value = { ...levels.value, [upgrade.id]: current + 1 };
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

    function renderAutomation() {
        return (
            <Panel>
                <p class="pk-small pk-muted">
                    One-time purchases that play parts of the game for you. Switch them on or off
                    here or from the Journey panel.
                </p>
                {AUTOMATIONS.map(def => {
                    const owned = automationsOwned.value[def.id] === true;
                    const on = automationsOn.value[def.id] === true;
                    return (
                        <div class="pk-shop-row">
                            <ItemIcon src={def.sprite} alt={def.name} />
                            <div class="pk-shop-info">
                                <b>{def.name}</b>
                                <div class="pk-small">{def.description}</div>
                                {def.id === "autoParty" && owned ? (
                                    <label class="pk-small pk-setting">
                                        <input
                                            type="checkbox"
                                            checked={newFacesForFinale.value}
                                            onChange={() =>
                                                (newFacesForFinale.value = !newFacesForFinale.value)
                                            }
                                        />{" "}
                                        Hall of Fame battles: bring as many Pokémon new to the Hall
                                        as can still win (+{FAME_PER_NEW_SPECIES} Fame each)
                                    </label>
                                ) : null}
                                {def.id === "autoTravel" && owned ? (
                                    <label class="pk-small pk-setting">
                                        <input
                                            type="checkbox"
                                            checked={catchEmAll.value}
                                            onChange={() => (catchEmAll.value = !catchEmAll.value)}
                                        />{" "}
                                        Catch 'em all: go wherever you're likeliest to find Pokémon
                                        from your Pokédex that aren't in your box this journey
                                        (variants and forms too), at any level
                                    </label>
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

                    {page === "upgrades" ? (
                        <Panel>
                            {HOF_UPGRADE_LIST.filter(
                                u => u.mechanic == null || mechanicUnlocked(u.mechanic)
                            ).map(upgrade => {
                                const current = level(upgrade.id);
                                const cost = upgradeCost(upgrade, current);
                                const maxed = current >= upgrade.maxLevel;
                                return (
                                    <div class="pk-shop-row">
                                        <ItemIcon src={upgrade.sprite} alt={upgrade.name} />
                                        <div class="pk-shop-info">
                                            <b>{upgrade.name}</b>{" "}
                                            <span class="pk-muted">
                                                Lv. {current}/{upgrade.maxLevel}
                                            </span>
                                            <div class="pk-small">{upgrade.description}</div>
                                        </div>
                                        <Button
                                            kind="primary"
                                            disabled={maxed || fame.value < cost}
                                            onClick={() => buyUpgrade(upgrade)}
                                        >
                                            {maxed ? "Maxed" : `${formatNumber(cost)} Fame`}
                                        </Button>
                                    </div>
                                );
                            })}
                        </Panel>
                    ) : null}

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

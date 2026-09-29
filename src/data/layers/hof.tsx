/**
 * The Hall of Fame: the prestige layer. After clearing a region's finale, the player enshrines
 * their team and starts a new journey in any unlocked region, trading the run for Fame.
 * Teams with Pokémon never enshrined before earn the most. The Pokédex is kept.
 */
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
import { getSpecies, hallOfFameId } from "game/pokemon/data";
import { REGIONS } from "game/pokemon/regions";
import type { RegionId } from "game/pokemon/zones";
import { computed } from "vue";
import { Button, formatDuration, formatNumber, ItemIcon, Panel, Sprite } from "../ui/components";
import type { NavNode } from "../ui/nav";
import { mobileClasses, renderNav } from "../ui/nav";
import dex from "./dex";
import mart from "./mart";

export type HallOfFameEntry = {
    run: number;
    time: number;
    dexCaught: number;
    team: { id: number; level: number; shiny: boolean }[];
    region?: RegionId;
    fame?: number;
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

    function regionUnlocked(region: RegionId) {
        const requires = REGIONS[region].requires;
        return requires == null || clearCount(requires) > 0;
    }

    function isEnshrined(speciesId: number) {
        const key = hallOfFameId(speciesId);
        return (
            enshrined.value[key] === true ||
            // Entries from finished journeys count too (older saves didn't track this set).
            entries.value.some(
                e => e.run <= timesEntered.value && e.team.some(p => hallOfFameId(p.id) === key)
            )
        );
    }

    /** The team that cleared this journey's finale. */
    const clearingTeam = computed((): number[] => {
        if (main.clearTeam.value.length > 0) return main.clearTeam.value;
        const entry = entries.value.find(e => e.run === timesEntered.value + 1);
        return entry?.team.map(p => p.id) ?? main.partyIds.value;
    });

    /** Team members never enshrined before (a Gyarados and a Gyarados ♀ count once). */
    const newSpecies = computed((): number[] =>
        clearingTeam.value.filter(
            (id, i, team) =>
                !isEnshrined(id) &&
                team.findIndex(other => hallOfFameId(other) === hallOfFameId(id)) === i
        )
    );

    const pendingFame = computed((): number =>
        fameGain({
            regionFame: main.regionDef.value.fame,
            dexCaught: dex.caughtCount.value,
            shinyCaught: dex.shinyCount.value,
            newSpecies: newSpecies.value.length,
            firstClear: clearCount(main.region.value) === 0,
            rematch: main.rematch.value
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
                team: team.map(({ id, level, shiny }) => ({ id, level, shiny }))
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
        clears.value = { ...clears.value, [region]: clearCount(region) + 1 };
        fame.value += gain;
        timesEntered.value = run;
        reset.reset();
        main.resetTransient();
        main.addLog({
            kind: "badge",
            text: `Your team was enshrined in the Hall of Fame (+${gain} Fame). Choose where your next journey begins!`
        });
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
            <Panel title="Enter the Hall of Fame">
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
                            {dex.shinyCount.value * 2} · New to the Hall of Fame:{" "}
                            {newSpecies.value.length} × {FAME_PER_NEW_SPECIES}
                            {clearCount(region.id) === 0 ? " · First clear ×1.5" : ""}
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
                                Every Pokémon on this team has been enshrined before. Clear a region
                                with new faces for more Fame.
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
            <Panel title="Automation">
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
        pendingFame,
        recordChampionTeam,
        regionUnlocked,
        clearCount,
        automationActive,
        toggleAutomation,
        reset,
        nav,
        display: () => (
            <div class="pk-layer">
                {renderNav(true)}
                <h2 class="pk-layer-title">Hall of Fame</h2>
                <div class="pk-money-big">{formatNumber(fame.value)} Fame</div>

                {renderEnter()}
                {renderAutomation()}

                <Panel title="Fame upgrades">
                    {HOF_UPGRADE_LIST.map(upgrade => {
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

                <Panel title="Champions">
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
                                        {formatDuration(entry.time)} · {entry.dexCaught} species
                                        {entry.fame != null ? ` · +${entry.fame} Fame` : ""}
                                    </span>
                                </div>
                                <div class="pk-hof-team">
                                    {entry.team.map(p => (
                                        <div class="pk-hof-mon" title={getSpecies(p.id).name}>
                                            <Sprite id={p.id} shiny={p.shiny} size={48} />
                                            <span class="pk-small">Lv. {p.level}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </Panel>
            </div>
        )
    };
});

export default layer;
